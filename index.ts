require("dotenv").config();
const fs = require("fs").promises;
import { Award, Config, Finding, Slice, Total } from "./types";
import { getFindingByRisk, riskSet } from "./shared";

const getPieSlices = (judgedFindings: Finding[]) => {
  let pieSlices: Slice[] = [];

  for (const risk of riskSet) {
    const findings = getFindingByRisk(judgedFindings, risk).all;
    const uniqueFindings = getFindingByRisk(judgedFindings, risk).unique;

    let multiplier = 1;
    if (risk === "3") {
      multiplier = 10;
    }
    if (risk === "2") {
      multiplier = 3;
    }

    for (const uniqueFinding of uniqueFindings) {
      const split = findings.reduce(
        (total, finding) =>
          finding.reportId === uniqueFinding ? total + 1 : total + 0,
        0
      );

      const pie = multiplier * Math.pow(0.9, split - 1);
      const slice = pie / split;

      const pieSlice = {
        reportId: uniqueFinding,
        risk,
        split,
        pie,
        slice,
      };

      pieSlices.push(pieSlice);
    }
  }
  return pieSlices;
};

const getHandleFindings = (data: Finding[], handle: string) => {
  const handleFindings = data.filter((finding) => {
    return finding.handle === handle;
  });
  return handleFindings;
};

const EMPTY_SLICE: Slice = {
  reportId: "UNDEFINED",
  risk: "0",
  split: 0,
  pie: 0,
  slice: 0,
};

const getHandleSlices = (
  handleFindings: Finding[],
  allSlices: Slice[]
): (Finding & Slice)[] =>
  handleFindings.map((handleFinding) => ({
    ...(allSlices.find(
      (sliceFinding) =>
        sliceFinding.reportId === handleFinding.reportId && handleFinding
    ) ?? EMPTY_SLICE),
    ...handleFinding,
  }));

const getSliceTotal = (slices: Slice[]) => {
  return slices.reduce(
    (total, slice) => (slice.slice > 0 ? total + slice.slice : total + 0),
    0
  );
};

const getPieTotal = (slices: Slice[]) => {
  return slices.reduce(
    (total, slice) => (slice.pie > 0 ? total + slice.pie : total + 0),
    0
  );
};

// TODO: this function should probably be renamed
const getHandleTotals = (allSlices: Slice[]) => {
  const mainPoolSlices = allSlices.filter((slice) => {
    return (
      slice.reportId.charAt(0) === "H" ||
      slice.reportId.charAt(0) === "M" ||
      slice.reportId.charAt(0) === "L"
    );
  });
  const gasPoolSlices = allSlices.filter((slice) => {
    return slice.reportId.charAt(0) === "G";
  });

  const mainPieTotal = getPieTotal(mainPoolSlices);
  const mainSliceTotal = getSliceTotal(mainPoolSlices);
  const gasPieTotal = getPieTotal(gasPoolSlices);
  const gasSliceTotal = getSliceTotal(gasPoolSlices);

  return {
    mainPieTotal,
    mainSliceTotal,
    gasPieTotal,
    gasSliceTotal,
  };
};

const compileAwards = (
  { mainPool, gasPool, awardCoinInUSD, contestId, awardCoin }: Config,
  judgedFindings: Finding[],
  handles: string[],
  totals: Total,
  allSlices: Slice[]
) => {
  const allHandleAwards: Award[] = [];
  for (const handle of handles) {
    const handleFindings = getHandleFindings(judgedFindings, handle);
    const handleSlices = getHandleSlices(handleFindings, allSlices);

    for (const slice of handleSlices) {
      // console.log('slice', slice);
      let award = 0;
      if (
        slice.reportId.charAt(0) === "H" ||
        slice.reportId.charAt(0) === "M" ||
        slice.reportId.charAt(0) === "L"
      ) {
        award = (slice.slice / totals.mainPieTotal) * mainPool;
      }
      if (slice.reportId.charAt(0) === "G") {
        award = (slice.slice / totals.gasPieTotal) * gasPool;
      }
      const awardUSD = Number((award * awardCoinInUSD).toFixed(2));
      const handleAward = {
        contest: contestId,
        handle,
        finding: slice.reportId,
        risk: slice.risk,
        pie: slice.pie,
        split: slice.split,
        slice: slice.slice,
        award,
        awardCoin,
        awardUSD,
      };
      allHandleAwards.push(handleAward);
    }
  }
  return allHandleAwards;
};

const getAwardTotals = (
  { awardCoinInUSD, awardCoin }: Config,
  handles: string[],
  allHandleAwards: Award[]
) => {
  for (const handle of handles) {
    const handleAwards = allHandleAwards.filter((item) => {
      return item.handle === handle;
    });
    const awardTotal = handleAwards.reduce(
      (total, item) => (item.award > 0 ? total + item.award : total + 0),
      0
    );
    let conversion = "";
    {
      awardCoinInUSD !== 1
        ? (conversion = `(~$${(awardTotal * awardCoinInUSD).toFixed(2)} USD)`)
        : "";
    }
    console.log(
      `${awardTotal.toFixed(3)} ${awardCoin} to ${handle} ${conversion}`
    );
  }
};

const reconcileAwards = (
  { mainPool, awardCoin, gasPool }: Config,
  judgedFindings: Finding[],
  allHandleAwards: Award[]
) => {
  const mainPoolAwards = allHandleAwards.filter((item) => {
    return (
      item.finding.charAt(0) === "H" ||
      item.finding.charAt(0) === "M" ||
      item.finding.charAt(0) === "L"
    );
  });

  const mainAwards = mainPoolAwards.reduce(
    (total, item) => (item.award > 0 ? total + item.award : total + 0),
    0
  );

  const gasPoolAwards = allHandleAwards.filter((item) => {
    return item.finding.charAt(0) === "G";
  });

  const gasAwards = gasPoolAwards.reduce(
    (total, item) => (item.award > 0 ? total + item.award : total + 0),
    0
  );

  console.log("-----------------------------------------");

  for (const risk of riskSet) {
    const riskLabels = {
      0: " Non-crit findings:",
      1: " Low risk findings:",
      2: " Med risk findings:",
      3: "High risk findings:",
      g: " Gas optimizations:",
    };
    const allRiskFindings = getFindingByRisk(judgedFindings, risk).all.length;
    const uniqueRiskFindings = getFindingByRisk(judgedFindings, risk).unique
      .length;
    console.log(
      `${riskLabels[risk]} ${allRiskFindings} total, ${uniqueRiskFindings} unique`
    );
  }

  console.log("-----------------------------------------");
  if (Math.round(mainAwards) === mainPool) {
    console.log(
      `✅ main awards (${mainAwards.toFixed(
        2
      )} ${awardCoin}) ~= pool size (${mainPool.toFixed(2)} ${awardCoin})`
    );
  } else {
    console.log(
      `❌ main awards (${mainAwards.toFixed(
        2
      )} ${awardCoin}) != pool size (${mainPool.toFixed(2)} ${awardCoin})`
    );
  }
  if (Math.round(gasAwards) === gasPool) {
    console.log(
      `✅  gas awards (${gasAwards.toFixed(
        2
      )} ${awardCoin})  ~= pool size (${gasPool.toFixed(2)} ${awardCoin})`
    );
  } else {
    console.log(
      `❌  gas awards (${gasAwards.toFixed(
        2
      )} ${awardCoin}) != pool size (${gasPool.toFixed(2)} ${awardCoin})`
    );
  }
};

const printAwardReport = (
  config: Config,
  judgedFindings: Finding[],
  handles: string[],
  awards: Award[]
): void => {
  console.log("-----------------------------------------");
  console.log(config.sponsorName, "contest awards");
  console.log("-----------------------------------------");
  getAwardTotals(config, handles, awards);
  reconcileAwards(config, judgedFindings, awards);
};

const main = async () => {
  const config = require("./contest-config.json") as Config;

  const judgedFindings = require(`./contest-judged.json`) as Finding[];
  const handles = Array.from(
    new Set(judgedFindings.map((finding) => finding.handle))
  );

  const allSlices = getPieSlices(judgedFindings);
  const totals = getHandleTotals(allSlices);
  const awards = compileAwards(
    config,
    judgedFindings,
    handles,
    totals,
    allSlices
  );

  printAwardReport(config, judgedFindings, handles, awards);

  if (
    config.sponsorPool &&
    config.sponsorAwardCoin &&
    config.sponsorAwardCoinInUSD
  ) {
    // We have a sponsor pool, so let's calculate that.
    const updatedConfig: Config = {
      ...config,
      sponsorName: `${config.sponsorName} (${config.sponsorAwardCoin})`,
      mainPool: config.sponsorPool,
      awardCoin: config.sponsorAwardCoin,
      awardCoinInUSD: config.sponsorAwardCoinInUSD,
      gasPool: 0, // set gas pool to 0 to exclude from sponsor pool
    };
    const sponsorAwards = compileAwards(
      updatedConfig,
      judgedFindings,
      handles,
      totals,
      allSlices
    );

    printAwardReport(updatedConfig, judgedFindings, handles, sponsorAwards);

    awards.push(...sponsorAwards); // merge sponsor awards with main rewards
  }

  const awardData = JSON.stringify(awards, null, 2);
  await fs.writeFile(`${config.sponsorName}-results.json`, awardData);
  console.log("-----------------------------------------");
  console.log(
    `${judgedFindings.length} findings written to ${config.sponsorName}-results.json`
  );
};

main();

require("dotenv").config();
const fs = require("fs").promises;
import { getPieSlices, getHandleTotals, compileAwards } from "./award";
import { Award, Config, Finding } from "./types";
import { getFindingByRisk, riskSet } from "./shared";

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

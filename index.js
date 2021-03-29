const fs = require("fs").promises;
const {
  contestId,
  sponsorName,
  mainPool,
  gasPool,
  awardCoin,
  awardCoinInUSD,
} = require("./slingshot-config.json");

const data = require(`./${sponsorName}-judged.json`);

const riskSet = ["1", "2", "3", "g"];
const handles = Array.from(new Set(data.map((finding) => finding.handle)));

const getFindingByRisk = (risk) => {
  const all = data.filter((finding) => {
    return finding.risk === risk;
  });
  const unique = Array.from(new Set(all.map((finding) => finding.finding)));
  return { all, unique };
};

const getPieSlices = () => {
  let pieSlices = [];

  for (risk of riskSet) {
    const findings = getFindingByRisk(risk).all;
    const uniqueFindings = getFindingByRisk(risk).unique;

    let multiplier = 1;
    if (risk === "3") {
      multiplier = 10;
    }
    if (risk === "2") {
      multiplier = 3;
    }

    for (uniqueFinding of uniqueFindings) {
      const split = findings.reduce(
        (total, finding) =>
          finding.finding === uniqueFinding ? total + 1 : total + 0,
        0
      );

      const pie = multiplier * Math.pow(0.9, split - 1);
      const slice = pie / split;

      const pieSlice = {
        finding: uniqueFinding,
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

const getHandleFindings = (handle) => {
  const handleFindings = data.filter((finding) => {
    return finding.handle === handle;
  });
  return handleFindings;
};

const getHandleSlices = (handleFindings, allSlices) =>
  handleFindings.map((handleFinding) => ({
    ...allSlices.find(
      (sliceFinding) =>
        sliceFinding.finding === handleFinding.finding && handleFinding
    ),
    ...handleFinding,
  }));

const getSliceTotal = (slices) => {
  return slices.reduce(
    (total, slice) => (slice.slice > 0 ? total + slice.slice : total + 0),
    0
  );
};

const getPieTotal = (slices) => {
  return slices.reduce(
    (total, slice) => (slice.pie > 0 ? total + slice.pie : total + 0),
    0
  );
};

const allSlices = getPieSlices();

// TODO: this function should probably be renamed
const getHandleTotals = (allSlices) => {
  const mainPoolSlices = allSlices.filter((slice) => {
    return (
      slice.finding.charAt(0) === "H" ||
      slice.finding.charAt(0) === "M" ||
      slice.finding.charAt(0) === "L"
    );
  });
  const gasPoolSlices = allSlices.filter((slice) => {
    return slice.finding.charAt(0) === "G";
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

let allHandleAwards = [];

const totals = getHandleTotals(allSlices);

const compileAwards = () => {
  for (handle of handles) {
    const handleFindings = getHandleFindings(handle);
    const handleSlices = getHandleSlices(handleFindings, allSlices);

    for (slice of handleSlices) {
      let award;
      if (
        slice.finding.charAt(0) === "H" ||
        slice.finding.charAt(0) === "M" ||
        slice.finding.charAt(0) === "L"
      ) {
        award = (slice.slice / totals.mainPieTotal) * mainPool;
      }
      if (slice.finding.charAt(0) === "G") {
        award = (slice.slice / totals.gasPieTotal) * gasPool;
      }
      awardUSD = Number((award * awardCoinInUSD).toFixed(2));
      const handleAward = {
        contest: contestId,
        handle,
        finding: slice.finding,
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

const getAwardTotals = () => {
  for (handle of handles) {
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

const reconcileAwards = () => {
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

  for (risk of riskSet) {
    const riskLabels = {
      1: " Low risk findings:",
      2: " Med risk findings:",
      3: "High risk findings:",
      g: " Gas optimizations:",
    };
    const allRiskFindings = getFindingByRisk(risk).all.length;
    const uniqueRiskFindings = getFindingByRisk(risk).unique.length;
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

const main = async () => {
  const awardData = JSON.stringify(compileAwards(), null, 2);
  console.log("-----------------------------------------");
  console.log(sponsorName, "contest awards");
  console.log("-----------------------------------------");
  getAwardTotals();
  reconcileAwards();
  await fs.writeFile(`${sponsorName}-results.json`, awardData);
  console.log("-----------------------------------------");
  console.log(`${data.length} findings written to ${sponsorName}-results.json`);
};

main();

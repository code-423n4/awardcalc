import { Award, Config, Finding, Slice, Total } from "./types";
import { getFindingByRisk, riskSet } from "./shared";

export const getPieSlices = (judgedFindings: Finding[]) => {
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

export const getHandleFindings = (data: Finding[], handle: string) => {
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

export const getHandleSlices = (
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

export const getSliceTotal = (slices: Slice[]) => {
  return slices.reduce(
    (total, slice) => (slice.slice > 0 ? total + slice.slice : total + 0),
    0
  );
};

export const getPieTotal = (slices: Slice[]) => {
  return slices.reduce(
    (total, slice) => (slice.pie > 0 ? total + slice.pie : total + 0),
    0
  );
};

// TODO: this function should probably be renamed
export const getHandleTotals = (allSlices: Slice[]) => {
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

export const compileAwards = (
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

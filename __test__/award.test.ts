import { getPieSlices, getHandleTotals, compileAwards } from "../award";
import { Award } from "../types";
import { MOCK_CONFIG, MOCK_FINDINGS, MOCK_HANDLES } from "./mock-data";

describe("getPieSlices", () => {
  test("calculates correct slices", () => {
    const slices = getPieSlices(MOCK_FINDINGS);
    expect(slices.length).toEqual(31);
    const slicesByReportId = slices.reduce((a, b) => {
      a[b.reportId] = b;
      return a;
    }, {});

    expect(slicesByReportId["H-02"].split).toEqual(2);
    expect(slicesByReportId["H-02"].pie).toEqual(9);
    expect(slicesByReportId["H-02"].slice).toEqual(4.5);

    expect(slicesByReportId["L-01"].split).toEqual(2);
    expect(slicesByReportId["L-01"].pie).toEqual(0.9);
    expect(slicesByReportId["L-01"].slice).toEqual(0.45);
  });
});

describe("getHandleTotals", () => {
  test("calculates correct handle totals", () => {
    const slices = getPieSlices(MOCK_FINDINGS);
    const totals = getHandleTotals(slices);
    expect(totals).toEqual({
      gasPieTotal: 1,
      gasSliceTotal: 1,
      mainPieTotal: 33.599999999999994,
      mainSliceTotal: 27.299999999999997,
    });
  });
});

describe("compileAwards", () => {
  test("calculates correct award totals", () => {
    const slices = getPieSlices(MOCK_FINDINGS);
    const totals = getHandleTotals(slices);
    const awards = compileAwards(
      MOCK_CONFIG,
      MOCK_FINDINGS,
      MOCK_HANDLES,
      totals,
      slices
    );

    const awardsByHandle = awards.reduce<{ [key: string]: Award[] }>((a, b) => {
      if (a.hasOwnProperty(b.handle)) {
        a[b.handle].push(b);
      } else {
        a[b.handle] = [b];
      }

      return a;
    }, {});

    expect(awardsByHandle["@cmichelio"].length).toEqual(7);
    const sampleHandleTotal = awardsByHandle["@cmichelio"].reduce((a, b) => {
      a += b.award;
      return a;
    }, 0);
    expect(sampleHandleTotal).toEqual(13794.642857142859);
  });
});

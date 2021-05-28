import { Finding, Risk } from "./types";

const riskSet: Risk[] = ["3", "2", "1", "0", "g"];

const getFindingByRisk = (findings: Finding[], risk: Risk) => {
  const all = findings.filter((finding) => {
    return finding.risk === risk;
  });
  const unique = Array.from(new Set(all.map((finding) => finding.reportId)));
  return { all, unique };
};

export { riskSet, getFindingByRisk };

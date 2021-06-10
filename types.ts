export type Risk = "3" | "2" | "1" | "0" | "g";

export interface Config {
  contestId: number;
  sponsorName: string;
  mainPool: number;
  gasPool: number;
  awardCoin: string;
  awardCoinInUSD: number;
  sponsorPool?: number;
  sponsorAwardCoin?: string;
  sponsorAwardCoinInUSD?: number;
}

export interface Finding {
  contest: string;
  handle: string;
  address: string;
  risk: Risk;
  reportId: string;
  duplicateOf: string;
  title: string;
  issueId: number;
  issueUrl: string;
}

export interface Award {
  contest: number;
  handle: string;
  finding: string;
  risk: Risk;
  pie: number;
  split: number;
  slice: number;
  award: number;
  awardCoin: string;
  awardUSD: number;
}

export interface Slice {
  reportId: string;
  risk: Risk;
  split: number;
  pie: number;
  slice: number;
}

export interface Total {
  mainPieTotal: number;
  mainSliceTotal: number;
  gasPieTotal: number;
  gasSliceTotal: number;
}

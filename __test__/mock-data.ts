import { Config, Finding } from "../types";

export const MOCK_CONFIG: Config = {
  contestId: 7,
  sponsorName: "basedloans",
  mainPool: 30000,
  gasPool: 0,
  awardCoin: "USDC",
  awardCoinInUSD: 1,
  sponsorPool: 50000,
  sponsorAwardCoin: "BLO",
  sponsorAwardCoinInUSD: 0.2,
};

export const MOCK_FINDINGS: Finding[] = [
  {
    contest: "7",
    handle: "0xRajeev",
    address: "0x7e026a0C061382B0F5935a90BC7324ab0a5A3aCc",
    risk: "0",
    reportId: "N-01",
    duplicateOf: "",
    title: "Outdated Compiler",
    issueId: 15,
    issueUrl:
      "https://github.com/code-423n4/2021-04-basedloans-findings/issues/15",
  },
  {
    contest: "7",
    handle: "0xRajeev",
    address: "0x7e026a0C061382B0F5935a90BC7324ab0a5A3aCc",
    risk: "1",
    reportId: "L-01",
    duplicateOf: "",
    title: "No account existence check for low-level call in CEther.sol",
    issueId: 16,
    issueUrl:
      "https://github.com/code-423n4/2021-04-basedloans-findings/issues/16",
  },
  {
    contest: "7",
    handle: "0xRajeev",
    address: "0x7e026a0C061382B0F5935a90BC7324ab0a5A3aCc",
    risk: "1",
    reportId: "L-02",
    duplicateOf: "",
    title:
      "sweepToken() function removed in CErc20.sol from original Compound code",
    issueId: 17,
    issueUrl:
      "https://github.com/code-423n4/2021-04-basedloans-findings/issues/17",
  },
  {
    contest: "7",
    handle: "0xRajeev",
    address: "0x7e026a0C061382B0F5935a90BC7324ab0a5A3aCc",
    risk: "1",
    reportId: "L-03",
    duplicateOf: "",
    title:
      "All except one Comptroller verify functions do not verify anything in Comptroller.sol/CToken.sol",
    issueId: 18,
    issueUrl:
      "https://github.com/code-423n4/2021-04-basedloans-findings/issues/18",
  },
  {
    contest: "7",
    handle: "0xRajeev",
    address: "0x7e026a0C061382B0F5935a90BC7324ab0a5A3aCc",
    risk: "1",
    reportId: "L-04",
    duplicateOf: "",
    title: "Floating pragma used in Uniswap*.sol",
    issueId: 19,
    issueUrl:
      "https://github.com/code-423n4/2021-04-basedloans-findings/issues/19",
  },
  {
    contest: "7",
    handle: "0xRajeev",
    address: "0x7e026a0C061382B0F5935a90BC7324ab0a5A3aCc",
    risk: "1",
    reportId: "L-05",
    duplicateOf: "",
    title:
      "Missing input validation may set COMP token to zero-address in Comptroller.sol",
    issueId: 20,
    issueUrl:
      "https://github.com/code-423n4/2021-04-basedloans-findings/issues/20",
  },
  {
    contest: "7",
    handle: "0xRajeev",
    address: "0x7e026a0C061382B0F5935a90BC7324ab0a5A3aCc",
    risk: "1",
    reportId: "L-06",
    duplicateOf: "",
    title: "Missing zero/threshold check for maxAssets",
    issueId: 21,
    issueUrl:
      "https://github.com/code-423n4/2021-04-basedloans-findings/issues/21",
  },
  {
    contest: "7",
    handle: "0xRajeev",
    address: "0x7e026a0C061382B0F5935a90BC7324ab0a5A3aCc",
    risk: "0",
    reportId: "N-02",
    duplicateOf: "",
    title: "Missed NatSpec @param for newly introduced parameter distributeAll",
    issueId: 22,
    issueUrl:
      "https://github.com/code-423n4/2021-04-basedloans-findings/issues/22",
  },
  {
    contest: "7",
    handle: "@cmichelio",
    address: "0x6823636c2462cfdcD8d33fE53fBCD0EdbE2752ad",
    risk: "1",
    reportId: "L-03",
    duplicateOf: "L-03",
    title: "Unused comptroller verify functions",
    issueId: 30,
    issueUrl:
      "https://github.com/code-423n4/2021-04-basedloans-findings/issues/30",
  },
  {
    contest: "7",
    handle: "@cmichelio",
    address: "0x6823636c2462cfdcD8d33fE53fBCD0EdbE2752ad",
    risk: "1",
    reportId: "L-07",
    duplicateOf: "",
    title: "Usage of `address.transfer`",
    issueId: 31,
    issueUrl:
      "https://github.com/code-423n4/2021-04-basedloans-findings/issues/31",
  },
  {
    contest: "7",
    handle: "@cmichelio",
    address: "0x6823636c2462cfdcD8d33fE53fBCD0EdbE2752ad",
    risk: "1",
    reportId: "L-08",
    duplicateOf: "",
    title: "Unbounded iteration on `refreshCompSpeedsInternal`",
    issueId: 32,
    issueUrl:
      "https://github.com/code-423n4/2021-04-basedloans-findings/issues/32",
  },
  {
    contest: "7",
    handle: "@cmichelio",
    address: "0x6823636c2462cfdcD8d33fE53fBCD0EdbE2752ad",
    risk: "2",
    reportId: "M-01",
    duplicateOf: "",
    title: "Reward rates can be changed through flash borrows",
    issueId: 33,
    issueUrl:
      "https://github.com/code-423n4/2021-04-basedloans-findings/issues/33",
  },
  {
    contest: "7",
    handle: "@cmichelio",
    address: "0x6823636c2462cfdcD8d33fE53fBCD0EdbE2752ad",
    risk: "0",
    reportId: "N-02",
    duplicateOf: "",
    title: "Privileged roles",
    issueId: 35,
    issueUrl:
      "https://github.com/code-423n4/2021-04-basedloans-findings/issues/35",
  },
  {
    contest: "7",
    handle: "@cmichelio",
    address: "0x6823636c2462cfdcD8d33fE53fBCD0EdbE2752ad",
    risk: "3",
    reportId: "H-01",
    duplicateOf: "",
    title:
      "UniswapConfig getters return wrong token config if token config does not exist",
    issueId: 37,
    issueUrl:
      "https://github.com/code-423n4/2021-04-basedloans-findings/issues/37",
  },
  {
    contest: "7",
    handle: "@cmichelio",
    address: "0x6823636c2462cfdcD8d33fE53fBCD0EdbE2752ad",
    risk: "0",
    reportId: "N-03",
    duplicateOf: "",
    title: "`UniswapAnchoredView`'s `PriceUpdated` event is never fired",
    issueId: 38,
    issueUrl:
      "https://github.com/code-423n4/2021-04-basedloans-findings/issues/38",
  },
  {
    contest: "7",
    handle: "gpersoon",
    address: "gpersoon.eth",
    risk: "0",
    reportId: "N-04",
    duplicateOf: "",
    title: "Multiple error enums with overlapping values",
    issueId: 1,
    issueUrl:
      "https://github.com/code-423n4/2021-04-basedloans-findings/issues/1",
  },
  {
    contest: "7",
    handle: "gpersoon",
    address: "gpersoon.eth",
    risk: "0",
    reportId: "N-05",
    duplicateOf: "",
    title: "now is still used",
    issueId: 10,
    issueUrl:
      "https://github.com/code-423n4/2021-04-basedloans-findings/issues/10",
  },
  {
    contest: "7",
    handle: "gpersoon",
    address: "gpersoon.eth",
    risk: "1",
    reportId: "L-02",
    duplicateOf: "L-02",
    title: "CErc20.sol missing sweepToken?",
    issueId: 11,
    issueUrl:
      "https://github.com/code-423n4/2021-04-basedloans-findings/issues/11",
  },
  {
    contest: "7",
    handle: "gpersoon",
    address: "gpersoon.eth",
    risk: "1",
    reportId: "L-09",
    duplicateOf: "",
    title: "uint[] memory parameter is tricky",
    issueId: 12,
    issueUrl:
      "https://github.com/code-423n4/2021-04-basedloans-findings/issues/12",
  },
  {
    contest: "7",
    handle: "gpersoon",
    address: "gpersoon.eth",
    risk: "0",
    reportId: "N-06",
    duplicateOf: "",
    title: "Reliance on the fact that NO_ERROR = 0",
    issueId: 2,
    issueUrl:
      "https://github.com/code-423n4/2021-04-basedloans-findings/issues/2",
  },
  {
    contest: "7",
    handle: "gpersoon",
    address: "gpersoon.eth",
    risk: "0",
    reportId: "N-07",
    duplicateOf: "",
    title: "Alphabetical order not complied with (contrary to the comments)",
    issueId: 3,
    issueUrl:
      "https://github.com/code-423n4/2021-04-basedloans-findings/issues/3",
  },
  {
    contest: "7",
    handle: "gpersoon",
    address: "gpersoon.eth",
    risk: "1",
    reportId: "G-01",
    duplicateOf: "",
    title: "requireNoError can be optimized",
    issueId: 4,
    issueUrl:
      "https://github.com/code-423n4/2021-04-basedloans-findings/issues/4",
  },
  {
    contest: "7",
    handle: "gpersoon",
    address: "gpersoon.eth",
    risk: "0",
    reportId: "N-08",
    duplicateOf: "",
    title: "requireNoError not used in a consistent way",
    issueId: 5,
    issueUrl:
      "https://github.com/code-423n4/2021-04-basedloans-findings/issues/5",
  },
  {
    contest: "7",
    handle: "gpersoon",
    address: "gpersoon.eth",
    risk: "1",
    reportId: "L-10",
    duplicateOf: "",
    title: "CarefulMath / safe math not allways used",
    issueId: 6,
    issueUrl:
      "https://github.com/code-423n4/2021-04-basedloans-findings/issues/6",
  },
  {
    contest: "7",
    handle: "gpersoon",
    address: "gpersoon.eth",
    risk: "0",
    reportId: "N-09",
    duplicateOf: "",
    title: "uint(-1)",
    issueId: 7,
    issueUrl:
      "https://github.com/code-423n4/2021-04-basedloans-findings/issues/7",
  },
  {
    contest: "7",
    handle: "gpersoon",
    address: "gpersoon.eth",
    risk: "0",
    reportId: "N-10",
    duplicateOf: "",
    title: "More readable constants",
    issueId: 8,
    issueUrl:
      "https://github.com/code-423n4/2021-04-basedloans-findings/issues/8",
  },
  {
    contest: "7",
    handle: "paulius.eth",
    address: "0x0c4243ca087F4e4738596F33292064e847DA80dA",
    risk: "0",
    reportId: "N-03",
    duplicateOf: "N-03",
    title: "event PriceUpdated is never emitted",
    issueId: 23,
    issueUrl:
      "https://github.com/code-423n4/2021-04-basedloans-findings/issues/23",
  },
  {
    contest: "7",
    handle: "paulius.eth",
    address: "0x0c4243ca087F4e4738596F33292064e847DA80dA",
    risk: "3",
    reportId: "H-02",
    duplicateOf: "",
    title: "uint(-1) index for not found",
    issueId: 24,
    issueUrl:
      "https://github.com/code-423n4/2021-04-basedloans-findings/issues/24",
  },
  {
    contest: "7",
    handle: "paulius.eth",
    address: "0x0c4243ca087F4e4738596F33292064e847DA80dA",
    risk: "1",
    reportId: "L-11",
    duplicateOf: "",
    title: "Use 'receive' when expecting eth and empty call data",
    issueId: 25,
    issueUrl:
      "https://github.com/code-423n4/2021-04-basedloans-findings/issues/25",
  },
  {
    contest: "7",
    handle: "paulius.eth",
    address: "0x0c4243ca087F4e4738596F33292064e847DA80dA",
    risk: "0",
    reportId: "N-11",
    duplicateOf: "",
    title: 'function getUnderlyingPrice compares against "cETH',
    issueId: 26,
    issueUrl:
      "https://github.com/code-423n4/2021-04-basedloans-findings/issues/26",
  },
  {
    contest: "7",
    handle: "paulius.eth",
    address: "0x0c4243ca087F4e4738596F33292064e847DA80dA",
    risk: "0",
    reportId: "N-12",
    duplicateOf: "",
    title: "Use 'interface' keyword for interfaces",
    issueId: 27,
    issueUrl:
      "https://github.com/code-423n4/2021-04-basedloans-findings/issues/27",
  },
  {
    contest: "7",
    handle: "paulius.eth",
    address: "0x0c4243ca087F4e4738596F33292064e847DA80dA",
    risk: "1",
    reportId: "L-12",
    duplicateOf: "",
    title: "Allow borrowCap to be filled fully",
    issueId: 28,
    issueUrl:
      "https://github.com/code-423n4/2021-04-basedloans-findings/issues/28",
  },
  {
    contest: "7",
    handle: "paulius.eth",
    address: "0x0c4243ca087F4e4738596F33292064e847DA80dA",
    risk: "0",
    reportId: "N-13",
    duplicateOf: "",
    title:
      "[Info] functions 'getUnderlyingPriceView' and 'price' are too similar",
    issueId: 29,
    issueUrl:
      "https://github.com/code-423n4/2021-04-basedloans-findings/issues/29",
  },
  {
    contest: "7",
    handle: "shw",
    address: "0xB48B9694BeC446E3Bf54788f913174a6580a279F",
    risk: "0",
    reportId: "N-14",
    duplicateOf: "",
    title:
      "Requires a non-zero address check when deploying `CErc20` tokens and `CEther`.",
    issueId: 39,
    issueUrl:
      "https://github.com/code-423n4/2021-04-basedloans-findings/issues/39",
  },
  {
    contest: "7",
    handle: "shw",
    address: "0xB48B9694BeC446E3Bf54788f913174a6580a279F",
    risk: "1",
    reportId: "L-01",
    duplicateOf: "L-01",
    title:
      "Lack of a non-zero address check in the function `doTransferOut` can cause loss of funds.",
    issueId: 40,
    issueUrl:
      "https://github.com/code-423n4/2021-04-basedloans-findings/issues/40",
  },
  {
    contest: "7",
    handle: "shw",
    address: "0xB48B9694BeC446E3Bf54788f913174a6580a279F",
    risk: "3",
    reportId: "H-02",
    duplicateOf: "H-02",
    title: "Incorrect constant comparison in `UniswapConfig.sol`.",
    issueId: 43,
    issueUrl:
      "https://github.com/code-423n4/2021-04-basedloans-findings/issues/43",
  },
  {
    contest: "7",
    handle: "toastedsteaksandwich",
    address: "0xD8f6877aec57C3d70F458C54a1382dDc90522E7D",
    risk: "0",
    reportId: "N-15",
    duplicateOf: "",
    title: "Missing event visbility in _setCompAddress() function",
    issueId: 13,
    issueUrl:
      "https://github.com/code-423n4/2021-04-basedloans-findings/issues/13",
  },
  {
    contest: "7",
    handle: "toastedsteaksandwich",
    address: "0xD8f6877aec57C3d70F458C54a1382dDc90522E7D",
    risk: "1",
    reportId: "L-05",
    duplicateOf: "L-05",
    title: "Missing validation for _setCompAddress",
    issueId: 14,
    issueUrl:
      "https://github.com/code-423n4/2021-04-basedloans-findings/issues/14",
  },
];

export const MOCK_HANDLES = Array.from(
  new Set(MOCK_FINDINGS.map((finding) => finding.handle))
);

export const MOCK_FINDINGS_DUPLICATES: Finding[] = [
  {
    contest: "5",
    handle: "paulius.eth",
    address: "0x0c4243ca087F4e4738596F33292064e847DA80dA",
    risk: "g",
    reportId: "G-02",
    duplicateOf: "G-02",
    issueId: 308,
    title: "repayDelay is not used anywhere",
    issueUrl: "https://github.com/code-423n4/2021-04-vader-findings/issues/308",
  },
  {
    contest: "5",
    handle: "0xRajeev",
    address: "0x7e026a0C061382B0F5935a90BC7324ab0a5A3aCc",
    risk: "g",
    reportId: "G-02",
    duplicateOf: "G-02",
    issueId: 102,
    title: "Gas savings by removing unused state variable USDV in Factory.sol",
    issueUrl: "https://github.com/code-423n4/2021-04-vader-findings/issues/102",
  },
  {
    contest: "5",
    handle: "a_delamo",
    address: "0x69e833869584D7e468751ED5e7d23ADAdCAA3D00",
    risk: "g",
    reportId: "G-02",
    duplicateOf: "G-02",
    issueId: 247,
    title: "Unused state variables",
    issueUrl: "https://github.com/code-423n4/2021-04-vader-findings/issues/247",
  },
  {
    contest: "5",
    handle: "paulius.eth",
    address: "0x0c4243ca087F4e4738596F33292064e847DA80dA",
    risk: "g",
    reportId: "G-02",
    duplicateOf: "G-02",
    issueId: 290,
    title: "Unused variables",
    issueUrl: "https://github.com/code-423n4/2021-04-vader-findings/issues/290",
  },
  {
    contest: "5",
    handle: "paulius.eth",
    address: "0x0c4243ca087F4e4738596F33292064e847DA80dA",
    risk: "g",
    reportId: "G-02",
    duplicateOf: "",
    issueId: 304,
    title: "Unused ID field in structs",
    issueUrl: "https://github.com/code-423n4/2021-04-vader-findings/issues/304",
  },
];

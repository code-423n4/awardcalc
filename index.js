require("dotenv").config();
const fs = require("fs").promises;
const fetch = require("node-fetch");
const dedent = require("dedent");
const { Octokit } = require("@octokit/core");
const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;
const token = process.env.GITHUB_TOKEN;

const octokit = new Octokit({ auth: token });

const {
  contestId,
  sponsorName,
  mainPool,
  gasPool,
  awardCoin,
  awardCoinInUSD,
} = require("./marginswap-config.json");

const data = require(`./${sponsorName}-judged.json`);

const riskSet = ["1", "2", "3", "g"];
const handles = Array.from(new Set(data.map((finding) => finding.handle)));

const findWhere = (array, criteria) => {
  return array.find((item) =>
    Object.keys(criteria).every((key) => item[key] === criteria[key])
  );
};

(async () => {
  const getIssues = async (label) => {
    try {
      const issues = await octokit.request("GET /repos/{owner}/{repo}/issues", {
        owner,
        repo,
        state: "open",
        labels: label,
      });
      // console.log(issues.data);
      return issues.data;
    } catch (error) {
      console.error(error.message);
    }
  };

  const getIssueEvents = async (issue_number) => {
    try {
      const events = await octokit.request(
        "GET /repos/{owner}/{repo}/issues/{issue_number}/events",
        {
          owner,
          repo,
          issue_number,
        }
      );
      // console.log(issues.data);
      return events.data;
    } catch (error) {
      console.err(error.message);
    }
  };

  const labels = [
    "3 (High Risk)",
    "2 (Med Risk)",
    "1 (Low Risk)",
    "0 (Non-Critical)",
    "G (Gas Optimization)",
  ];

  let mdCategories = "";
  for (label of labels) {
    const issuesByLabel = await getIssues(label);

    const sectionHeader = `# ${label}`;
    let mdIssues = sectionHeader;

    // find issueByLabel matching issue id

    // TODO need to iterate through judged findings json instead?
    for (issue of issuesByLabel) {
      // console.log(issue.number);
      const issueEvents = await getIssueEvents(issue.number);
      let mdEvents = "";
      for (e of issueEvents) {
        if (e.event === "commented") {
          mdEvents =
            mdEvents +
            `- [${e.actor.login} ${e.event}](${issue.html_url}): ${e.body}`;
        }
        if (e.event === "labeled") {
          if (e.label.name !== "bug") {
            mdEvents =
              mdEvents +
              `- [${e.actor.login} ${e.event}](${issue.html_url}) ${e.label.name}`;
          }
        }
      }

      var mapObj = {
        "# Impact\n": "",
        "# Proof of concept\n": "",
        "# Tools used\n": "",
        "# Eth address\n": "",
        "# Handle\n": "",
        "# Email address\n": "",
        "# Recommended mitigation steps": "#### Mitigation",
        "[^]*.+?(?=Vulnerability details)": "#### Vulnerability details",
      };

      const re = new RegExp(Object.keys(mapObj).join("|"), "gi");
      const bodyTrim1 = issue.body.replace(re, function (matched) {
        return mapObj[matched];
      });

      // TODO yeah ok I am lousy at regex and lazy and this works
      const bodyTrim2 = bodyTrim1.replace(
        "undefinedVulnerability details\n",
        ""
      );
      const bodyTrim3 = bodyTrim2.replace("#undefined", "");
      const body = bodyTrim3.replace("#\n", "");

      if (issue.number) {
        const f = findWhere(data, { issueId: issue.number });
        if (f !== undefined) {
          const mdIssue = `## [[${f.finding}] ${issue.title}](${f.issueUrl})\n${body}\n### Log: \n${mdEvents}\n`;
          mdIssues = mdIssues + "\n\n" + mdIssue;
        }
      }
    }

    mdCategories = mdCategories + `\n\n` + mdIssues;
  }

  try {
    fs.writeFile(`${sponsorName}-draft-report.md`, mdCategories);
    console.log(`${sponsorName}-draft-report.md file written`);
  } catch (error) {
    console.err(error.message);
  }
})();

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
      // console.log('slice', slice);
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

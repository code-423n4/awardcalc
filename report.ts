require("dotenv").config();
const fs = require("fs").promises;
import { Octokit } from "@octokit/core";
import { Config, Finding, Risk } from "./types";
import { riskSet, getFindingByRisk } from "./shared";

const owner = process.env.GITHUB_OWNER as string;
const repo = process.env.GITHUB_REPO as string;
const token = process.env.GITHUB_TOKEN as string;

const octokit = new Octokit({ auth: token });

const labels: { [K in Risk]: string } = {
  3: "High Risk Findings",
  2: "Medium Risk Findings",
  1: "Low Risk Findings",
  0: "Non-Critical Findings",
  g: "Gas Optimizations",
};

const findWhere = <T, K extends keyof T>(
  array: T[],
  criteria: Record<K, T[K]>
): T | undefined => {
  return array.find((item) =>
    Object.keys(criteria).every((key) => item[key as K] === criteria[key as K])
  );
};

const getIssues = async (issue_number: number) => {
  try {
    const issues = await octokit.request(
      "GET /repos/{owner}/{repo}/issues/{issue_number}",
      {
        owner,
        repo,
        issue_number,
      }
    );
    return issues.data;
  } catch (error) {
    console.error(error.message);
  }
};

const getIssueEvents = async (issue_number: number) => {
  try {
    const events = await octokit.request(
      "GET /repos/{owner}/{repo}/issues/{issue_number}/events",
      {
        owner,
        repo,
        issue_number,
      }
    );
    return events.data;
  } catch (error) {
    console.error(error.message);
  }
};

const getIssueComments = async (issue_number: number) => {
  try {
    const comments = await octokit.request(
      "GET /repos/{owner}/{repo}/issues/{issue_number}/comments",
      {
        owner,
        repo,
        issue_number,
      }
    );
    // console.log(issues.data);
    return comments.data;
  } catch (error) {
    console.error(error.message);
  }
};

async function generateReport({ sponsorName }: Config, data: Finding[]) {
  let mdCategories = [];
  for (const risk of riskSet) {
    const sectionHeader = `# ${labels[risk]}\n`;
    let mdIssues = [sectionHeader];

    // TODO this isn't getting the right risk options
    const findingsWithThisRisk = getFindingByRisk(data, risk).all;
    // console.log("risk", risk, "findingsWithThisRisk", findingsWithThisRisk);

    for (const finding of findingsWithThisRisk) {
      if (!finding.duplicateOf) {
        // console.log("finding.issueId", finding.issueId);
        const issue = await getIssues(finding.issueId);
        if (issue === undefined) {
          throw new Error(`Unable to find issue ${finding.issueId}`);
        }
        if (issue.state === "open") {
          // console.log("issue", issue.number);
          const issueEvents = await getIssueEvents(issue.number);
          const issueComments = await getIssueComments(issue.number);
          if (issueEvents === undefined) {
            throw new Error(`Unable to get events for issue ${issue.number}`);
          }
          if (issueComments === undefined) {
            throw new Error(`Unable to get comments for issue ${issue.number}`);
          }

          let mdComments = "";
          for (const c of issueComments) {
            const commentBodyArray = c.body ? c.body.split("\r\n") : [];
            let commentBody = "";
            for (const line of commentBodyArray) {
              commentBody = commentBody + `> ${line}\n`;
            }

            mdComments =
              mdComments +
              `**[${c.user!.login} commented](${
                c.html_url
              }):**\n ${commentBody}\n`;
          }

          let mdEvents = "";
          for (const e of issueEvents) {
            if (e.event === "labeled") {
              if (e.label.name !== "bug" && e.actor.login !== "code423n4") {
                mdEvents =
                  mdEvents +
                  `- [${e.actor.login} ${e.event}](${issue.html_url}) ${e.label.name}`;
              }
            }
          }

          var mapObj: { [key: string]: string } = {
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
          const bodyTrim1 = issue.body!.replace(re, function (matched) {
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
              const mdIssue = `## [[${f.reportId}] ${issue.title}](${
                f.issueUrl
              })\n${body}\n${mdEvents ? "### Log:\n" + mdEvents + "\n" : ""}${
                mdComments ? "### Comments:\n" + mdComments + "\n" : ""
              }`;
              mdIssues.push(mdIssue);
            }
          }
        }
      }
    }
    const categoryIssues = mdIssues.sort();
    mdCategories.push(categoryIssues);
  }

  const allIssues = mdCategories.join(" \n");
  // console.log(allIssues);
  // console.log(typeof allIssues);

  // TODO something screwy is happening but I'll figure out why later
  const report = allIssues.replace(/,##/g, "##");

  try {
    fs.writeFile(`${sponsorName}-draft-report.md`, report);
    console.log(`${sponsorName}-draft-report.md file written`);
  } catch (error) {
    console.error(error.message);
  }
}

(async () => {
  const config = require("./basedloans-config.json") as Config;
  const jugdedFindings =
    require(`./${config.sponsorName}-judged.json`) as Finding[];

  console.log("Generating report. This may take several seconds.");
  await generateReport(config, jugdedFindings);
})();

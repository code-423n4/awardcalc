This protocol details what processing needs to be applied to the raw aggregated contest finding results in order to  produce the final human readable [Audit Reports](https://code423n4.com/reports) shared with the public on the C4 website.

TO ADD:
a screen and link that gives a good before after comparison

## Report Drafting Protocol

## Eric's summary of process
### * -(1) Run Report:
    * In awardCalc repo, create and configure contest-config.json file then run "npm run report”
    * to generate "draft report” markdown document (via npm run report) > this is your raw content for the final "Findings Report"
    * (❓ is that report.ts script... looks like the draft report is run with nom run report)
### * -(2) Edit sponsor-draft-report:
    * ❓Save content generated in previous step as awardcalc/past_contests/sponorName-draft/report.md
    * ⭕ Add all the things we talked about here from Y 210610 📞 "Contest Reports: You Can Too!" w/Eric (hyperlink headers…)
###  * -(3) Move final product to C4 website repo _reports folder :
    *  Copy completed sponsorName-draft-report.md to code423n4.com/_reports renamed as YYYY-MM-sponsor.md
 ### * -(4) commit, push and submit pull request that adds report:
    * Identify reviewers in PR
###  * -(5) Merge after review and finals edits:
    * _reports folder in code423n4.com repo  (code-423n4/code423n4.com/tree/main/_reports)

## From Eric walkthrough
– First 60 lines are not included and must be manually copy pasted from other reports (change contest specific items) >edit wardens participated (❔where to get) > Judge > Editor >vulnerability count  > Link to contest repo...
– * Linked header
* Wardens comments (take a bit of copy editing…) take out judgement
* Sponsor comment on issue
* Take out log header
* ❓ difference between acknowledge (not going to action) and confirmed (sponsor understands, agrees and maybe provides feedback), disputed (sponsor disagrees)
* Functions and variable names get “backtick” ` to markdown formatted to look like code

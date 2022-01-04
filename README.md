# This has been deprecated in favor of the awardcalc action in the buttons repo.

# awardcalc

Rough script for calculating awards

## Configuration

You can configure the calculation by creating a `contest-config.json` file with the following structure:

```
{
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
```

The `sponsorPool`, `sponsorAwardCoin`, and `sponsorAwardCoinInUSD` properties are optional, but keep in mind that if any of them are provided, all three need to be provided.

## Running

To run the script, update the configuration according to the above, put the `contest-judged.json` file in the folder. You can then generate the award amounts by running

```
npm run award
```

and can generate the draft report by running

```
npm run report
```

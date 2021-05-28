# awardcalc

Rough script for calculating awards

## Configuration

You can configure the calculation by creating a `{sponsorName}-config.json` file with the following structure:

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

To run the script, update the configuration according to the above, put the `{sponsorName}-judged.json` file in the folder, and run:

```
npm run report
```

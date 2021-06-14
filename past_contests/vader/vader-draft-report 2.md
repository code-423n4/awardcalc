# High Risk Findings
## [[H-02] Unhandled return value of transfer in transferOut() of Pools.sol](https://github.com/code-423n4/2021-04-vader-findings/issues/128)

ERC20 implementations are not always consistent. Some implementations of transfer and transferFrom could return ‘false’ on failure instead of reverting. It is safer to wrap such calls into require() statements to handle these failures.

The transfer call on L211 of transferOut() could be made on a user-supplied untrusted token address (from the different call sites) whose implementation can be malicious.

For reference, see similar finding from Consensys Diligence Audit of Aave Protocol V2



https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Pools.sol#L211


#undefined
Manual Analysis

#undefined

Use require to check the return value and revert on 0/false or use OpenZeppelin’s SafeERC20 wrapper functions.



### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/128) disagree with severity- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/128) sponsor disputed
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/128#issuecomment-830602601):**
 > Not valid. 
> 
> Since the funds came in, and did not revert, they can leave. If the call passes, then the transferout is valid. 


## [[H-03] Flash attack mitigation does not work as intended in USDV.sol](https://github.com/code-423n4/2021-04-vader-findings/issues/138)

One of the stated protocol (review) goals is to detect susceptibility to “Any attack vectors using flash loans on Anchor price, synths or lending.” As such, USDV contract aims to protect against flash attacks using flashProof() modifier which uses the following check in isMature() to determine if currently executing contract context is at least blockDelay duration ahead of the previous context: lastBlock[tx.origin] + blockDelay <= block.number

However, blockDelay state variable is not initialized which means it has a default uint value of 0. So unless it is set to >= 1 by setParams() which can be called only by the DAO (which currently does not have the capability to call setParams() function), blockDelay will be 0 which allows current executing context (block.number) to be the same as the previous one (lastBlock[tx.origin]). This effectively allows multiple calls on this contract to be executed in the same transaction of a block which enables flash attacks as opposed to what is expected as commented on L41: "// Stops an EOA doing a flash attack in same block"

Even if the DAO can call setParams() to change blockDelay to >= 1, there is a big window of opportunity for flash attacks until the DAO votes, finalises and approves such a proposal. Moreover, such proposals can be cancelled by a DAO minority or replaced by a malicious DAO minority to launch flash attacks.


https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/USDV.sol#L22

https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/USDV.sol#L140-L142

https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/USDV.sol#L35-L44

https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/USDV.sol#L174



#undefined
Manual Analysis

#undefined

Initialize blockDelay to >= 1 at declaration or in constructor.



### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/138) disagree with severity- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/138) sponsor confirmed
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/138#issuecomment-830606188):**
 > The actual issue is simply:
> 
> > blockDelay state variable is not initialized 
> 
> It is intended to be initialised to 1, so this is a bug. Severity: 2


## [[H-04] Missing DAO functionality to call changeDAO() function in Vader.sol](https://github.com/code-423n4/2021-04-vader-findings/issues/161)

changeDAO() is authorized to be called only from the DAO (per modifier) but DAO contract has no corresponding functionality to call changeDAO() function. As a result, DAO address cannot be changed.



https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Vader.sol#L192-L196


#undefined
Manual Analysis

#undefined

Add functionality to DAO to be able to call changeDAO() of Vader.sol.



### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/161) duplicate
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/161#issuecomment-830606766):**
 > https://github.com/code-423n4/2021-04-vader-findings/issues/46

**[dmvt commented](https://github.com/code-423n4/2021-04-vader-findings/issues/161#issuecomment-847848752):**
 > Unlike #140, #157, #158, & #159 without this functionality missing functionality in the DAO becomes a very serious issue. As a result, this one is very high risk were it to be overlooked. 


## [[H-05] Proposals can be cancelled](https://github.com/code-423n4/2021-04-vader-findings/issues/227)
undefinedVulnerability Details

Anyone can cancel any proposals by calling `DAO.cancelProposal(id, id)` with `oldProposalID == newProposalID`.
This always passes the minority check as the proposal was approved.

An attacker can launch a denial of service attack on the DAO governance and prevent any proposals from being executed.



Check `oldProposalID == newProposalID`



### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/227) sponsor confirmed- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/227) filed- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/227) disagree with severity- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/227) addressed- [dmvt labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/227) duplicate
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/227#issuecomment-828455719):**
 > This is valid, can fix with a `require()`

**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/227#issuecomment-830634810):**
 > Funds are not directly lost, would be Severity: 2

**[0xBrian commented](https://github.com/code-423n4/2021-04-vader-findings/issues/227#issuecomment-838072381):**
 > https://github.com/vetherasset/vaderprotocol-contracts/pull/127/commits/c5fcb890d49115c9aa9cb767737c5d8c13a44b90


## [[H-06] Flash loans can affect governance voting in DAO.sol](https://github.com/code-423n4/2021-04-vader-findings/issues/187)

Flash loans can significantly increase a single voter's weight and be used to impact the voting outcome. A voter can borrow a significant quantity of tokens to increase their voting weight in a transaction within which they also deterministically influence the voting outcome to their choice.

This has already happened in the case of MakerDAO governance where a flash loan was used to affect voting outcome (see https://forum.makerdao.com/t/urgent-flash-loans-and-securing-the-maker-protocol/4901) and noted by Maker team as: “a practical example for the community that flash loans can and may impact system governance”

Given that flash loans are a noted concern, the impact of it to DAO governance which can control all critical protocol parameters should be mitigated as in other places.



https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/DAO.sol#L158-L163

#undefined
Manual Analysis

#undefined

Account for flash loans in countMemberVotes() by using weight from previous blocks or consider capping the weight of individual voters.


### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/187) disagree with severity- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/187) sponsor disputed
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/187#issuecomment-830608957):**
 > Not valid. 
> 
> All pools use slip-based fees so flash loan attack by buying up USDV or synths is not going to work. 

**[dmvt commented](https://github.com/code-423n4/2021-04-vader-findings/issues/187#issuecomment-847890126):**
 > The funds to execute this attack do not need to come from a pool. It could be done as simply as malicious members pooling their funds in a flash loan contract, and each borrowing the funds in turn to vote.


## [[H-07] Incorrect burn address in Vader.sol](https://github.com/code-423n4/2021-04-vader-findings/issues/202)

The internal _transfer() function is called from external facing transfer(), transferFrom() and transferTo() functions all of which have different sender addresses. It is msg.sender for transfer(), sender parameter for transferFrom() and tx.origin for transferTo(). These different senders are reflected in the sender parameter of _transfer() function. While this sender parameter is correctly used for transfer of tokens within _transfer, the call to _burn() on L129 incorrectly uses msg.sender as the burn address which is correct only in the case of the transfer() caller's context. This is incorrect for transferFrom() and transferTo() caller contexts.

This will incorrectly burn the fees from a different (intermediate contract) account for all users of the protocol interacting with the transferTo() and transferFrom() functions and lead to incorrect accounting of token balances or exceptional conditions. Protocol will break and lead to fund loss.


https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Vader.sol#L129

https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Vader.sol#L122-L134

https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Vader.sol#L91-L94

https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Vader.sol#L108-L112

https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Vader.sol#L116-L119



#undefined
Manual Analysis

#undefined

Change L129 to: _burn(sender, _fee);



### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/202) disagree with severity- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/202) sponsor confirmed
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/202#issuecomment-830609535):**
 > Valid, disagree with severity though. Funds-not-at-risk. 
> 
> Recommend: 2


## [[H-08] Wrong `calcAsymmetricShare` calculation](https://github.com/code-423n4/2021-04-vader-findings/issues/214)
undefinedVulnerability Details

The inline-comment defines the number of asymmetric shares as `(u * U * (2 * A^2 - 2 * U * u + U^2))/U^3` but the `Utils.calcAsymmetricShare` function computes `(uA * 2U^2 - 2uU + u^2) / U^3` which is not equivalent as can be seen from the `A^2` term in the first term which does not occur in the second one.
The associativity on `P * part1` is wrong, and `part2` is not multiplied by `P`.

The math from the spec is not correctly implemented and could lead to the protocol being economically exploited, as the asymmetric share which is used to determine the collateral value in base tokens could be wrong.
For example, it might be possible to borrow more than the collateral put up.



Clarify if the comment is correct or the code and fix them.



### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/214) sponsor confirmed- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/214) filed- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/214) disagree with severity- [dmvt labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/214) duplicate
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/214#issuecomment-828468071):**
 > Valid

**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/214#issuecomment-830635568):**
 > Whilst the math is incorrect, in the current implementation it is not yet implemented, so disagree with Severity (funds not lost), recommend: 2


## [[H-09] Wrong liquidity units calculation](https://github.com/code-423n4/2021-04-vader-findings/issues/204)
undefinedVulnerability Details

The spec defines the number of LP units to be minted as `units = (P (a B + A b))/(2 A B) * slipAdjustment = P * (part1 + part2) / part3 * slipAdjustments` but the `Utils.calcLiquidityUnits` function computes `((P * part1) + part2) / part3 * slipAdjustments`.
The associativity on `P * part1` is wrong, and `part2` is not multiplied by `P`.

The math from the spec is not correclty implemented and could lead to the protocol being economically exploited, as redeeming the minted LP tokens does not result in the initial tokens anymore.



Fix the equation.



### Log:
- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/204) filed- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/204) disagree with severity- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/204) sponsor confirmed- [dmvt labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/204) duplicate
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/204#issuecomment-830609695):**
 > Valid, but funds not at risk, recommend: 2


## [[H-10] Incorrect initialization gives IL protection of only 1 second instead of 100 days in Router.sol](https://github.com/code-423n4/2021-04-vader-findings/issues/84)

Incorrect initialization of timeForFullProtection to1 sec instead of 8640000 secs (100 days) as indicated in code comments appears to be a test setting mistakenly carried over for deployment. Therefore, unless timeForFullProtection is reset to 100 days by setParams() (calling this function is a missing functionality in the DAO currently), the Impermanent Loss (IL) protection "rule" of 100 days will not apply in Utils.getProtection(). 

This breaks a key value proposition of the Vader protocol which is IL protection as indicated in the specification: “Impermanent Loss Protection: The deposit value for each member is recorded when they deposit. When they go to withdraw, the redemption value is computed. If it is less than the deposit value, the member is paid the deficit from the reserve. The protection issued increases from 0 to 100% linearly for 100 days.”



https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Router.sol#L84

https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Router.sol#L95

https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Router.sol#L209-L220

https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Utils.sol#L128-L140

#undefined
Manual Analysis

#undefined

Change to “timeForFullProtection = 8640000; //100 days” on L84.



### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/84) disagree with severity- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/84) sponsor disputed
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/84#issuecomment-830597447):**
 > It's deliberately set to 1 second to conduct adequate testing.


## [[H-11] Anyone can list anchors / curate tokens](https://github.com/code-423n4/2021-04-vader-findings/issues/211)
undefinedVulnerability Details

The `Router.listAnchor` function can be called by anyone and tokens can be added.
The only check is that `require(iPOOLS(POOLS).isAnchor(token));` but this can easily be set by calling `Pools.addLiquidity(VADER, token, _)` once even without actually sending any tokens to the contract.
This makes it an essentially useless check.

This only works initially as long as the `anchorLimit` has not been reached yet.
However, the `replaceAnchor` can be used in the same way and flash loans can be used to get around the liquidity restrictions and push another anchor token out of the price range as these checks use the current reserves.

Anchored pools are automatically curated pools and determine if a pool receives rewards.
An attacker can remove rewards of a curated pool this way and add rewards to their own pool with a custom token they control.

After a pool has been anchored through flash loans, liquidity can be withdrawn which could make the anchor price easy to manipulate in the next block and launch other attacks.



Revisit the `_isAnchor[token] = true;` statement in `addLiquidity`, it seems strange without any further checks.
Consider making `listAnchor` / `replaceAnchor` DAO-only functions and make them flash-loan secure.
One should probably use time-weighted prices for these pools for the bounds check.



### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/211) sponsor disputed- [dmvt labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/211) duplicate
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/211#issuecomment-828472672):**
 > The protocol is intended to be launched with 5 anchors so it can only be attacked by using `replaceAnchor()`, in which case slip-based fees apply for attacks and thwart the attack path. 


## [[H-12] Swap token can be traded as fake base token](https://github.com/code-423n4/2021-04-vader-findings/issues/205)
undefinedVulnerability Details

The `Pools.swap` function does not check if `base` is one of the base tokens. One can transfer `token`s to the pool and set `base=token` and call `swap(token, token, member, toBase=false)`.

The `_actualInput = getAddedAmount(base, token);` will return the **token** amount added but use the ratio compared to the **base** reserve `calcSwapOutput(_actualInput=tokenInput, mapToken_baseAmount[token], mapToken_tokenAmount[token]); = tokenIn / baseAmount * tokenAmount` which yields a wrong swap result.

It breaks the accounting for the pool as `token`s are transferred in, but the `base` balance is increased (and `token` decreased). LPs cannot correctly withdraw again, and others cannot correctly swap again.

Another example scenario is that the token pool amount can be stolen.
Send `tokenIn=baseAmount` of tokens to the pool and call `swap(base=token, token, member, toBase=false)`. Depending on the price of `token` relative to `base` this could be cheaper than trading with the base tokens.



Check that `base` is either `USDV` or `VADER`


### Log:
- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/205) filed- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/205) sponsor confirmed
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/205#issuecomment-830609893):**
 > Valid, funds can be lost


## [[H-13] `getAddedAmount` can return wrong results](https://github.com/code-423n4/2021-04-vader-findings/issues/206)
undefinedVulnerability Details

The `getAddedAmount` function only works correctly when called with `(VADER/USDV, pool)` or `(pool, pool)`.
However, when called with (`token, pool)` where `token` is neither `VADER/USDV/pool`, it returns wrong results:

1. It gets the `token` balance
2. And subtracts it from the stored `mapToken_tokenAmount[_pool]` amount which can be that of a completely different token

Anyone can break individual pairs by calling `sync(token1, token2)` where the `token1` balance is less than `mapToken_tokenAmount[token2]`. This will add the difference to `mapToken_tokenAmount[token2]` and break the accounting and result in a wrong swap logic.

Furthermore, this can also be used to swap tokens without having to pay anthing with `swap(token1, token2, member, toBase=false)`.



Add a require statement in the `else` branch that checks that `_token == _pool`.



### Log:
- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/206) filed- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/206) sponsor confirmed
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/206#issuecomment-830610039):**
 > Valid, funds can be lost

**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/206#issuecomment-830610281):**
 > Would bundle this issue with:
> https://github.com/code-423n4/2021-04-vader-findings/issues/205


## [[H-14] 4 Synths can be minted with fake base token](https://github.com/code-423n4/2021-04-vader-findings/issues/207)
undefinedVulnerability Details

The `Pools.mintSynth` function does not check if `base` is one of the base tokens. One can transfer `token`s to the pool and set `base=token` and call `mintSynth(token, token, member)`.

The `_actualInput = getAddedAmount(base, token);` will return the **token** amount added but use the ratio compared to the **base** reserve `calcSwapOutput(_actualInput=tokenInput, mapToken_baseAmount[token], mapToken_tokenAmount[token]); = tokenIn / baseAmount * tokenAmount` which yields a wrong swap result.

It breaks the accounting for the pool as `token`s are transferred in, but the `base` balance is increased.

The amount that is minted could also be inflated (cheaper than sending the actual base tokens), especially if `token` is a high-precision token or worth less than base.



Check that `base` is either `USDV` or `VADER` in `mintSynth`.



### Log:
- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/207) filed- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/207) sponsor confirmed
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/207#issuecomment-830610147):**
 > Valid, funds can be lost.

**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/207#issuecomment-830610260):**
 > would bundle this issue with: 
> https://github.com/code-423n4/2021-04-vader-findings/issues/205


## [[H-15] Missing access restriction on `lockUnits/unlockUnits`](https://github.com/code-423n4/2021-04-vader-findings/issues/208)
undefinedVulnerability Details

The `Pool.lockUnits` allows anyone to steal pool tokens from a `member` and assign them to `msg.sender`.

Anyone can steal pool tokens from any other user.



Add access control and require that `msg.sender` is the router or another authorized party.



### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/208) sponsor confirmed- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/208) filed
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/208#issuecomment-828478127):**
 > Valid, although this is part of the partially-complete lending code. 


## [[H-16] Wrong slippage protection on Token -> Token trades](https://github.com/code-423n4/2021-04-vader-findings/issues/209)
undefinedVulnerability Details

The `Router.swapWithSynthsWithLimit` allows trading token to token and specifying slippage protection.
A token to token trade consists of two trades:

1. token to base
2. base to token

The slippage protection of the second trade (base to token) is computed wrong:

```solidity
require(iUTILS(UTILS()).calcSwapSlip(
        inputAmount, // should use outToken here from prev trade
        iPOOLS(POOLS).getBaseAmount(outputToken)
  ) <= slipLimit
);
```

It compares the **token** input amount (of the first trade) to the **base** reserve of the second pair.

Slippage protection fails and either the trade is cancelled when it shouldn't be or it is accepted even though the user suffered more losses than expected.



It should use the base output from the first trade to check for slippage protection. Note that this still just computes the slippage protection of each trade individually. An even better way would be to come up with a formula to compute the slippage on the two trades at once.



### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/209) disagree with severity- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/209) sponsor confirmed- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/209) filed
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/209#issuecomment-828476313):**
 > Valid, although disagree with severity, the wrongly compute slip amount would just fail the trade or allow the second trade to go thru with no protection. 
> 
> 

**[Mervyn853 commented](https://github.com/code-423n4/2021-04-vader-findings/issues/209#issuecomment-830580592):**
 > Our decision matrix for severity:
> 
> 0: No-risk: Code style, clarity, off-chain monitoring (events etc), exclude gas-optimisations
> 1: Low Risk: UX, state handling, function incorrect as to spec
> 2: Funds-Not-At-Risk, but can impact the functioning of the protocol, or leak value with a hypothetical attack path with stated assumptions, but external requirements
> 3: Funds can be stolen/lost directly, or indirectly if a valid attack path shown that does not have handwavey hypotheticals.
> 
> Recommended: 1


## [[H-17] Tokens can be stolen through `transferTo`](https://github.com/code-423n4/2021-04-vader-findings/issues/217)
undefinedVulnerability Details

I know that it's stated that:

> VADER, USDV, SYNTHS all employ the `transferTo()` function, which interrogates for `tx.origin` and skips approvals. The author does not subscribe to the belief that this is dangerous

In my opinion, it can be very dangerous. Imagine the following scenario:

1. I create a custom attacker ERC20 token that has a hook in the `_transfer` function that checks tx.origin for USDV/VADER/SYNTHS and calls `transferTo` to steal these funds.
2. I set up a honeypot by providing liquidity to the `BASE <> ATTACKER` pool.
3. I target high-profile accounts holdinging VADER/USDV/SYNTHS and airdrop them free tokens.
4. Block explorers / Vader swap websites could show that this token has value and can be traded for actual `BASE` tokens.
5. User wants to sell the airdropped `ATTACKER` token to receive valuable tokens through the Vader swap and has all their tokens (that are even completely unrelated to the tokens being swapped) stolen.

In general, a holder of any of the core assets of the protocol risks all their funds being stolen if they ever interact with an unvetted external contract/token.
This could even be completely unrelated to the VADER protocol.



Remove `transferTo` and use `permit` + `transferFrom` instead to move tokens from `tx.origin`.



### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/217) sponsor acknowledged- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/217) disagree with severity- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/217) filed
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/217#issuecomment-828445128):**
 > This attack path has already been assessed as the most likely, no new information is being presented here. 
> 
> Do not interact with attack contracts, interacting with an ERC20 is an attack contract. 
> 
> 

**[0xBrian commented](https://github.com/code-423n4/2021-04-vader-findings/issues/217#issuecomment-829142947):**
 > @strictly-scarce What would be the downside of adopting the suggested mitigation? Since we cannot communicate effectively with all users to tell them not to interact with certain kinds of contracts (and even if we could, they may not be able to discern which are OK and which aren't), we don't want to set up a thicket for fraudsters to operate. If the downside of the mitigation is not too bad, I think it could be worth it in order to deny fraudsters an opportunity to steal.

**[Mervyn853 commented](https://github.com/code-423n4/2021-04-vader-findings/issues/217#issuecomment-830582387):**
 > Our decision matrix for severity:
> 
> 0: No-risk: Code style, clarity, off-chain monitoring (events etc), exclude gas-optimisations
> 1: Low Risk: UX, state handling, function incorrect as to spec
> 2: Funds-Not-At-Risk, but can impact the functioning of the protocol, or leak value with a hypothetical attack path with stated assumptions, but external requirements
> 3: Funds can be stolen/lost directly, or indirectly if a valid attack path shown that does not have handwavey hypotheticals.
> 
> Recommended: 0


## [[H-18] Transfer fee is burned on wrong accounts](https://github.com/code-423n4/2021-04-vader-findings/issues/220)
undefinedVulnerability Details

The `Vader._transfer` function burns the transfer fee on `msg.sender` but this address might not be involved in the transfer at all due to `transferFrom`.

Smart contracts that simply relay transfers like aggregators have their Vader balance burned or the transaction fails because these accounts don't have any balance to burn, breaking the functionality.



It should first increase the balance of `recipient` by the full amount and then burn the fee on the `recipient`.


### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/220) disagree with severity- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/220) sponsor confirmed- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/220) filed
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/220#issuecomment-828463080):**
 > For composabilty with the rest of the ecosystem, this should be addressed, although disagree with the severity, no funds are lost, just the aggregrator cannot transfer unless they first transfer to themselves, which most often do. 

**[Mervyn853 commented](https://github.com/code-423n4/2021-04-vader-findings/issues/220#issuecomment-830582199):**
 > Our decision matrix for severity:
> 
> 0: No-risk: Code style, clarity, off-chain monitoring (events etc), exclude gas-optimisations
> 1: Low Risk: UX, state handling, function incorrect as to spec
> 2: Funds-Not-At-Risk, but can impact the functioning of the protocol, or leak value with a hypothetical attack path with stated assumptions, but external requirements
> 3: Funds can be stolen/lost directly, or indirectly if a valid attack path shown that does not have handwavey hypotheticals.
> 
> Recommended: 2


## [[H-19]  Vault rewards can be gamed](https://github.com/code-423n4/2021-04-vader-findings/issues/222)
undefinedVulnerability Details

The `_deposit` function increases the member's _weight_ by `_weight = iUTILS(UTILS()).calcValueInBase(iSYNTH(_synth).TOKEN(), _amount);` which is the swap output amount when trading the deposited underlying synth amount.

Notice that anyone can create synths of custom tokens by calling `Pools.deploySynth(customToken)`.

Therefore an attacker can deposit valueless custom tokens and inflate their member weight as follows:

1. Create a custom token and issue lots of tokens to the attacker
2. Create synth of this token
3. Add liquidity for the `TOKEN <> BASE` pair by providing a single wei of `TOKEN` and `10^18` BASE tokens. This makes the `TOKEN` price very expensive.
4. Mint some synths by paying BASE to the pool
5. Deposit the fake synth, `_weight` will be very high because the token pool price is so high.

Call `harvest(realSynth)` with a synth with actual value. This will increase the synth balance and it can be withdrawn later.

Anyone can inflate their member weight through depositing a custom synth and earn almost all vault rewards by calling `harvest(realSynth)` with a valuable "real" synth.
The rewards are distributed pro rata to the member weight which is independent of the actual synth deposited.



The `calcReward` function completely disregards the `synth` parameter which seems odd.
Think about making the rewards based on the actual synths deposited instead of a "global" weight tracker.
Alternatively, whitelist certain synths that count toward the weight, or don't let anyone create synths.



### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/222) sponsor confirmed- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/222) filed- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/222) disagree with severity
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/222#issuecomment-828453323):**
 > This is a valid attack path. 
> 
> The counter is two fold:
> 
> 1) In the vault, `require(isCurated(token))` this will only allow synths of curated tokens to be deposited for rewards. [The curation logic ](https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Router.sol#L234) does a check for liquidity depth, so only deep pools can become synths. Thus an attacker would need to deposit a lot of BASE. 
> 
> 2) In the vaults, use `_weight = iUTILS(UTILS()).calcSwapValueInBase(iSYNTH(_synth).TOKEN(), _amount);`, which computes the weight with respect to slip, so a small manipulated pool cannot be eligible. The pool would need to be deep. 
> 
> ---
> 
> The Vault converts all synths back to common accounting asset - USDV, so member weight can be tracked. 
> 
> 

**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/222#issuecomment-830635200):**
 > Disagree with severity, since the daily rewards can be claimed by anyone in a fee-bidding war but no actual extra inflation occurs. 
> 
> Severity: 2


## [[H-20] Vault rewards last claim time not always initialized](https://github.com/code-423n4/2021-04-vader-findings/issues/223)
undefinedVulnerability Details

The `harvest` calls `calcCurrentReward` which computes `_secondsSinceClaim = block.timestamp - mapMemberSynth_lastTime[member][synth];`.
As one can claim different synths than the synths that they deposited, `mapMemberSynth_lastTime[member][synth]` might still be uninitialized and the `_secondsSinceClaim` becomes the current block timestamp.

The larger the `_secondsSinceClaim` the larger the rewards.
This bug allows claiming a huge chunk of the rewards.



Let users only harvest synths that they deposited.



### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/223) sponsor confirmed- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/223) filed- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/223) disagree with severity
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/223#issuecomment-828461277):**
 > This is valid. 
> 
> The member should only claim against synths they have deposited, where the time would be initialised. 
> 

**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/223#issuecomment-830635006):**
 > Would place this as severity: 2, since the anyone can participate in claiming rewards, but no extra inflation occurs. 


## [[H-21] Vault Weight accounting is wrong for withdrawals](https://github.com/code-423n4/2021-04-vader-findings/issues/224)
undefinedVulnerability Details

When depositing two different synths, their weight is added to the same `mapMember_weight[_member]` storage variable.
When withdrawing the full amount of one synth with `_processWithdraw(synth, member, basisPoints=10000` the full weight is decreased.

The second deposited synth is now essentially weightless.

Users that deposited more than one synth can not claim their fair share of rewards after a withdrawal.



The weight should be indexed by the synth as well.



### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/224) disagree with severity- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/224) sponsor confirmed- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/224) filed
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/224#issuecomment-828457510):**
 > This is valid. 
> 
> The weight should be reduced only as applied to a specific synth
> 
> There is no loss of funds, just less rewards for that member, disputing severity level. 

**[Mervyn853 commented](https://github.com/code-423n4/2021-04-vader-findings/issues/224#issuecomment-830578796):**
 > Our decision matrix for severity:
> 
> 0: No-risk: Code style, clarity, off-chain monitoring (events etc), exclude gas-optimisations
> 1: Low Risk: UX, state handling, function incorrect as to spec
> 2: Funds-Not-At-Risk, but can impact the functioning of the protocol, or leak value with a hypothetical attack path with stated assumptions, but external requirements
> 3: Funds can be stolen/lost directly, or indirectly if a valid attack path shown that does not have handwavey hypotheticals.
> 
> Recommended: 2

**[dmvt commented](https://github.com/code-423n4/2021-04-vader-findings/issues/224#issuecomment-849037439):**
 > My viewpoint on this and the last several reward based high risk issues is that loss of rewards is loss of funds. High risk is appropriate.


## [[H-22] Anyone Can Avoid All Vether Transfer Fees By Adding Their Address to the Vether ExcludedAddresses List.](https://github.com/code-423n4/2021-04-vader-findings/issues/189)

Anyone Can Avoid All Vether Transfer Fees By Adding Their Address to the Vether ExcludedAddresses List.

Vether.sol implements a fee on every token transfer, unless either the sender or the recipient exists on a list of excluded addresses (mapAddress_Excluded).
However, the addExcluded() function in Vether.sol has no restrictions on who can call it.
So any user can call addExcluded with their own address as the argument, and bypass all transfer fees.


Alice calls:

(1) Vether.addExcluded(aliceAddress), which adds Alice's address to mapAddress_Excluded.
(2) Alice can now freely transfer Vether with no fees.

#undefined

Add restrictions to who can call addExcluded, perhaps by restricting it to a caller set by DAO.sol


### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/189) disagree with severity- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/189) duplicate
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/189#issuecomment-830609051):**
 > Vether contract is outside of contest

**[dmvt commented](https://github.com/code-423n4/2021-04-vader-findings/issues/189#issuecomment-849162113):**
 > https://github.com/code-423n4/2021-04-vader-findings/issues/3#issuecomment-849043144
> 
> > The warden should be paid out on this issue, in my opinion, because the code was included in the repo to be reviewed. The work to review the contract was done despite the fact that the team has addressed the issue and has already deployed vether.sol. I do not think that any issues related to Vether.sol should be included in the final report generated by @code423n4.
> 
> It was unclear to me (and obviously most of the wardens) that Vether.sol was considered out of scope.


## [[H-23] Users may unintendedly remove liquidity under a phishing attack.](https://github.com/code-423n4/2021-04-vader-findings/issues/316)

The `removeLiquidity` function in `Pools.sol` uses `tx.origin` to determine the person who wants to remove liquidity. However, such a design is dangerous since the pool assumes that this function is called from the router, which may not be true if the user is under a phishing attack, and he could unintendedly remove liquidity.


Referenced code:
[Pool.sol#L77-L79](https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Pools.sol#L77-L79)

#undefined
None

#undefined

Consider making the function `_removeLiquidity` external, which can be utilized by the router, providing information of which person removes his liquidity.


### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/316) disagree with severity- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/316) sponsor acknowledged
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/316#issuecomment-830571343):**
 > If a user has been phished, consider all their funds already stolen. 
> 
> Vader's security assumption is a user is not phished. 

**[Mervyn853 commented](https://github.com/code-423n4/2021-04-vader-findings/issues/316#issuecomment-830578243):**
 > Our decision matrix for severity:
> 
> 0: No-risk: Code style, clarity, off-chain monitoring (events etc), exclude gas-optimisations
> 1: Low Risk: UX, state handling, function incorrect as to spec
> 2: Funds-Not-At-Risk, but can impact the functioning of the protocol, or leak value with a hypothetical attack path with stated assumptions, but external requirements
> 3: Funds can be stolen/lost directly, or indirectly if a valid attack path shown that does not have handwavey hypotheticals.
> 
> Recommended: 0

**[dmvt commented](https://github.com/code-423n4/2021-04-vader-findings/issues/316#issuecomment-849061196):**
 > This is reasonably easy to mitigate as an issue and failure to do so does leave an attack vector open. If exploited it will result in a loss of user funds.


## [[H-24] Anyone can curate pools and steal rewards](https://github.com/code-423n4/2021-04-vader-findings/issues/210)
undefinedVulnerability Details

The `Router.curatePool` and `replacePool` don't have any access restriction.
An attacker can get a flash loan of base tokens and replace existing curated pools with their own curated pools.

Curated pools determine if a pool receives rewards. An attacker can remove rewards of a curated pool this way and add rewards to their own pool with a custom token they control.
They can then go ahead and game the reward system by repeatedly swapping in their custom pool with useless tokens withdraw liquidity in the end and pay back the base flashloan.



Prevent replacing curations through flash loans.
Consider making pool curations DAO-exclusive actions.



### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/210) sponsor disputed
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/210#issuecomment-828473380):**
 > Slip-based pools cannot be attacked with flash loans. 

**[dmvt commented](https://github.com/code-423n4/2021-04-vader-findings/issues/210#issuecomment-849131582):**
 > Further comment from @cmichelio:
> 
> I can curate my custom token using curatePool without using a flashloan or using replacePool by temporarily providing liquidity to the pool without trading in it and getting slip-fee'd. I'm not trading in the pool, and don't think providing/removing liquidity comes with a fee. I think this is still an issue.


## [[H-25] Incorrect initialization causes VADER emission rate of 1 second instead of 1 day in Vader.sol](https://github.com/code-423n4/2021-04-vader-findings/issues/155)

Incorrect initialization (perhaps testing parameterization mistakenly carried over to deployment) of secondsPerEra to 1 sec instead of 86400 secs (1 day) causes what should be the daily emission rate to be a secondly emission rate.

This causes inflation of VADER token and likely breaks VADER<>USDV peg and other protocol invariants. Protocol will break and funds will be lost. 



https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Vader.sol#L67

https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Vader.sol#L68

https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Vader.sol#L204-L214


#undefined
Manual Analysis

#undefined

Initialize secondsPerEra to 86400 on L67.


### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/155) disagree with severity- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/155) sponsor acknowledged
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/155#issuecomment-830606416):**
 > This is purely for testing purposes. 


 
# Medium Risk Findings
## [[M-01] User may not get IL protection if certain functions are called directly in Pools.sol](https://github.com/code-423n4/2021-04-vader-findings/issues/120)

Functions removeLiquidity() and removeLiquidityDirectly() when called directly, do not provide the the user with IL protection unlike when calling the corresponding removeLiquidity() function in Router.sol. This should be prevented, at least for removeLiquidity() or highlighted in the specification and user documentation.


https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Pools.sol#L77-L82

https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Router.sol#L113-L118

#undefined
Manual Analysis

#undefined

Add access control (e.g. via a modifier onlyRouter) so removeLiquidity() function of Pools contract can be called only from corresponding Router contract’s removeLiquidity() function which provides IL protection. Alternatively, highlight in the specification and user documentation about which contract interfaces provide IL protection to users.



### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/120) disagree with severity- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/120) sponsor acknowledged
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/120#issuecomment-830613596):**
 > User should use the Router, as designed. 


## [[M-02] Undefined behavior for DAO and GRANT vote proposals in DAO.sol](https://github.com/code-423n4/2021-04-vader-findings/issues/183)

Given that there are only three proposal types (GRANT, UTILS, REWARD) that are actionable, it is unclear if 'DAO' type checked in voteProposal() is a typographical error and should really be 'GRANT'. Otherwise, GRANT proposals will only require quorum (33%) and not majority (50%).


https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/DAO.sol#L79-L92

#undefined
Manual Analysis

#undefined

Change ‘DAO’ on L83 to ‘GRANT’ or if not, specify what DAO proposals are and how GRANT proposals should be handled with quorum or majority.

Also, check and enforce that mapPID_types are only these three actionable proposal types: GRANT, UTILS, REWARD.



### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/183) sponsor acknowledged- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/183) disagree with severity
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/183#issuecomment-830615194):**
 > DAO not yet fully implemented


## [[M-03] Lack of input validation in replacePool() allows curated pool limit bypass in Router.sol](https://github.com/code-423n4/2021-04-vader-findings/issues/87)

There is no input validation in replacePool() function to check if oldToken exists and is curated. Using a non-existing oldToken (even 0 address) passes the check on L236 (because Pools.getBaseAmount() will return 0 for the non-existing token) and newToken will be made curated. This can be used to bypass the curatedPoolLimit enforced only in curatePool() function.


https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Router.sol#L234-L241

https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Pools.sol#L227-L229

https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Router.sol#L227

#undefined
Manual Analysis

#undefined

Check if oldToken exists and is curated as part of input validation in replacePool() function.



### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/87) sponsor confirmed
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/87#issuecomment-830613505):**
 > Valid


## [[M-04] `flashProof` is not flash-proof](https://github.com/code-423n4/2021-04-vader-findings/issues/218)
undefinedVulnerability Details

The `flashProof` modifier is supposed to prevent flash-loan attacks by disallowing performing several sensitive functions in the same block.

However, it performs this check on `tx.origin` and not on an individual user address basis.
This only prevents flash loan attacks from happening within a single transaction.

But flash loan attacks are theoretically not limited to the same transaction but to the same block as miners have full control of the block and include several vulnerable transactions back to back. (Think transaction _bundles_ similar to flashbot bundles that most mining pools currently offer.)

A miner can deploy a proxy smart contract relaying all contract calls and call it from a different EOA each time bypassing the `tx.origin` restriction.

The `flashProof` modifier does not serve its purpose.



Try to apply the modifier to individual addresses that interact with the protocol instead of `tx.origin`.

Furthermore, attacks possible with flash loans are usually also possible for whales, making it debatable if adding flash-loan prevention logic is a good practice.



### Log:
- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/218) filed- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/218) sponsor confirmed
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/218#issuecomment-830616044):**
 > Flash loans with the help of miners *was not intended to be countered*, although a check for `msg.sender` AND `tx.origin` will be applied. 


## [[M-05] Interest debt is capped after a year](https://github.com/code-423n4/2021-04-vader-findings/issues/219)
undefinedVulnerability Details

The `Utils.getInterestOwed` function computes the `_interestPayment` as:

```solidity
uint256 _interestPayment =
  calcShare(
      timeElapsed,
      _year,
      getInterestPayment(collateralAsset, debtAsset)
  ); // Share of the payment over 1 year
```

However, `calcShare` caps `timeElpased` to `_year` and therefore the owed interest does not grow after a year has elapsed.

The impact is probably small because the only call so far computes the elapsed time as `block.timestamp - mapCollateralAsset_NextEra[collateralAsset][debtAsset];` which most likely will never go beyond a year.

It's still recommended to fix the logic bug in case more functions will be added that use the broken function.



Use a different function than `calcShare` that does not cap.



### Log:
- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/219) filed- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/219) disagree with severity- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/219) sponsor confirmed
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/219#issuecomment-830616264):**
 > A member who doesn't interact with the contract for more than a year misses out on some rewards, so severity:1


## [[M-06] Canceled proposals can still be executed](https://github.com/code-423n4/2021-04-vader-findings/issues/228)
undefinedVulnerability Details

Proposals that passed the threshold ("finalized") can be cancelled by a minority again using the `cancelProposal` functions.
It only sets `mapPID_votes` to zero but `mapPID_timeStart` and `mapPID_finalising` stay the same and pass the checks in `finaliseProposal` which queues them for execution.

Proposals cannot be cancelled.



Set a cancel flag and check for it in `finaliseProposal` and in execution.



### Log:
- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/228) filed- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/228) sponsor confirmed
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/228#issuecomment-830616938):**
 > Valid


## [[M-07] Completed proposals can be voted on and executed again](https://github.com/code-423n4/2021-04-vader-findings/issues/229)
undefinedVulnerability Details

A proposal that is completed has its state reset, including the votes.
Users can just vote on it again and it can be executed again.

Completed proposals should most likely not be allowed to be voted on / executed again.
This could also lead to issues in backend scripts that don't expect any voting/execution events to be fired again after the `FinalisedProposal` event has fired.



Add an `executed` flag to the proposals and disallow voting/finalising on already executed proposals.



### Log:
- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/229) filed- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/229) sponsor disputed
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/229#issuecomment-830617230):**
 > It might be intended to have repeated proposals. 


## [[M-09] Divide before multiply](https://github.com/code-423n4/2021-04-vader-findings/issues/255)

Here you have more information: https://gist.github.com/alexon1234/e5038a9f66136ae210be692f8803d874


### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/255) question
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/255#issuecomment-830631408):**
 > Can't quite understand the assertion that a division is made before a multiply in the code outlined
> 
> ```
> uint _units = (((P * part1) + part2) / part3);
>     return (_units * slipAdjustment) / one;  // Divide by 10**18
>  ```
>  
>  `_units` will be `0 -> 2**256`.
>  `slipAdjustment` will be `0 -> 10**18`
>  `one` is `10**18`
>  ```
>  // returns 0
>   return (0 * 10**18) / 10**18;
>   return (2**256 * 0) / 10**18;
>  return (<10**9 * <10**9) / 10**18;
>    // returns  non-zero
>   return (>=10**9 * >=10**9) / 10**18;
>  ```
> 


## [[M-10] Incorrect operator used in deploySynth() of Pools.sol](https://github.com/code-423n4/2021-04-vader-findings/issues/124)

The deploySynth() function in Pools.sol is expected to perform a check on the token parameter to determine that it is neither VADER or USDV before calling Factory’s deploySynth() function. 

However, the require() incorrectly uses ‘||’ operator instead of ‘&&’ which allows both VADER and USDV to be supplied as the token parameters. This will allow an attacker to deploy either VADER or USDV as a Synth which will break assumptions throughout the entire protocol. Protocol will break and funds may be lost.


https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Pools.sol#L138


#undefined
Manual Analysis

#undefined

Change ‘||’ operator to ‘&&’ in the require statement:
require(token != VADER && token != USDV);



### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/124) disagree with severity- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/124) duplicate- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/124) addressed- [dmvt labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/124) 2 (Med Risk)
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/124#issuecomment-830601704):**
 > Duplicate
> https://github.com/code-423n4/2021-04-vader-findings/issues/21

**[0xBrian commented](https://github.com/code-423n4/2021-04-vader-findings/issues/124#issuecomment-837805692):**
 > https://github.com/vetherasset/vaderprotocol-contracts/pull/159/commits/2f69f8317ce98846fbe227a3bf6ca1b644d01ff2#diff-5de3130299a0ddc914d7a906802a4cc093ed18d7a89c52a4aafefc8a11ac3f54R193


## [[M-11] Allowing duplicated anchors could cause bias on anchor price.](https://github.com/code-423n4/2021-04-vader-findings/issues/314)

In `Router.sol`, the setup of the five anchors can be interrupted by anyone adding a new anchor due to the lack of access control of the `listAnchor` function. Also, duplicate anchors are allowed. If the same anchor is added three times, then this anchor biases the result of `getAnchorPrice`.


Referenced code:
[Router.sol#L245-L252](https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Router.sol#L245-L252)

PoC: [Link to PoC](https://drive.google.com/drive/folders/1W3jhlWIIh7FxTLZET3z49yA0DBvlbcPg?usp=sharing)
See the file `200_listAnchor.js` for a PoC of this attack. To run it, use `npx hardhat test 200_listAnchor.js`.

#undefined
None

#undefined

Only allow `listAnchor` to be called from the deployer by adding a `require` statement. Also, check if an anchor is added before by `require(_isCurated == false)`.


### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/314) disagree with severity- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/314) sponsor acknowledged
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/314#issuecomment-830633778):**
 > Deployer will list the anchors, seems highly unlikely they will get griefed in practice. Severity: 1


## [[M-12] Transfer fee avoidance ](https://github.com/code-423n4/2021-04-vader-findings/issues/33)

## Description
The Vether4.addExcluded() function on mainnet (0x4Ba6dDd7b89ed838FEd25d208D4f644106E34279) allows a user to exclude an address from transfer fees for a cost of 128 VETH. By exploiting the conditions in which fees are taken, it is possible to set up a contract for a once-off cost in which all users can use to avoid transfer fees.

#All transfer fees can be avoided by routing transfers through an excluded contract. An estimated $140k of transfer fees was accumulated at the time of writing. These fees can be avoided in future, causing an indirect loss of funds for the contract.

I've listed the a test case and the transferForwarder contract source in the following gist: https://gist.github.com/toastedsteaksandwich/2057bfeca5f0340838970c7ee9c9d7ab

#undefinedHardhat with mainnet forking pinned to block 12227519

#undefined
The _transfer() function should be updated to only exclude transfer fees if the sender has been excluded, not both the sender and the recipient. This would prevent any user from being able to set up a central transfer forwarder as demonstrated. Moreover, the `Transfer(_from, address(this), _fee);` event should only be emitted if the sender has been excluded from transfer fees.


### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/33) duplicate- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/33) sponsor disputed
## [[M-13] Init function can be called by everyone](https://github.com/code-423n4/2021-04-vader-findings/issues/18)

#Most of the solidity contracts have an init function that everyone can call.
This could lead to a race condition when the contract is deployed. At that moment a hacker could call the init function and make the deployed contracts useless. Then it would have to be redeployed, costing a lot of gas.


DAO.sol:    function init(address _vader, address _usdv, address _vault) public {
Factory.sol:    function init(address _pool) public {
Pools.sol:    function init(address _vader, address _usdv, address _router, address _factory) public {
Router.sol:    function init(address _vader, address _usdv, address _pool) public {
USDV.sol:    function init(address _vader, address _vault, address _router) external {
Utils.sol:    function init(address _vader, address _usdv, address _router, address _pools, address _factory) public {
Vader.sol:    function init(address _vether, address _USDV, address _utils) external {
Vault.sol:    function init(address _vader, address _usdv, address _router, address _factory, address _pool) public {
 

#undefinedEditor

#undefined
Add a check to the init function, for example that only the deployer can call the function.


### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/18) sponsor confirmed- [dmvt labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/18) 2 (Med Risk)
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/18#issuecomment-826910451):**
 > Yes, but only once. Could add a deployer check tho

**[dmvt commented](https://github.com/code-423n4/2021-04-vader-findings/issues/18#issuecomment-847760153):**
 > After considerable evaluation and seeing the wide range of threat factors that were put forward by wardens related to this issue, I've decided that the potential threat here does extend beyond gas.
> 
> A worst case scenario could cause significant damage.
> 
> It is extremely unlikely that an attacker could successfully time this type of attack.
> 
> An attacker would have to successfully intercept more than one init due to the highly coupled nature of the contract. If they did so incorrectly, the entire system would not function. Presuming they succeeded, the team would also have to overlook the failure of or forget to make multiple critical transaction calls in their deployment scripts. To realize significant financial gains, the attacker would have to leave their exploit code in place for an extended period of time.
> 
> The likelihood is extremely low, but the impact would be critical. For this reason, I'm normalizing all of these reports to a Medium Risk.


## [[M-14] Pool functions can be called before initialization in init() of Pools.sol](https://github.com/code-423n4/2021-04-vader-findings/issues/114)

All the external/public functions of Pools.sol can be called by other contracts even before Pools.sol contract is initialized. This can lead to exceptions, state corruption or incorrect accounting in other contracts, which may require redeployment of contract.


https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Pools.sol#L43-L50

https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Pools.sol#L54

https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Pools.sol#L77

https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Pools.sol#L101

https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Pools.sol#L179

https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Pools.sol#L184

https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Pools.sol#L215

https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Pools.sol#L224



#undefined
Manual Analysis

#undefined

Use a factory pattern that will deploy and initialize atomically to prevent front-running of the initialization, or

Given that contracts are not using delegatecall proxy pattern, it is not required to use a separate init() function to initialize parameters when the same can be done in a constructor. If the reason for doing so is to get the deployment addresses of the various contracts which may not all be available at the same time then consider rearchitecting to create a “globals” contract which can hold all the globally required addresses of various contracts. (see Maple protocol’s https://github.com/maple-labs/maple-core/blob/develop/contracts/MapleGlobals.sol for example) or

Prevent external/public functions from being called until after initialization is done by checking initialization state tracked by the inited variable.



### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/114) disagree with severity- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/114) duplicate- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/114) sponsor disputed- [dmvt labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/114) 2 (Med Risk)
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/114#issuecomment-830598388):**
 > https://github.com/code-423n4/2021-04-vader-findings/issues/39

**[dmvt commented](https://github.com/code-423n4/2021-04-vader-findings/issues/114#issuecomment-847769580):**
 > Same general comments apply to this issue as with issue #18, but it is a separate type of exploit that would be slightly less detectable. This increase in risk is balanced against the exploit being much harder to effect and the likely impact being lower.


## [[M-15] changeDAO should be a two-step process in Vader.sol](https://github.com/code-423n4/2021-04-vader-findings/issues/162)

changeDAO() updates DAO address in one-step. If an incorrect address is mistakenly used (and voted upon) then future administrative access or recovering from this mistake is prevented because onlyDAO modifier is used for changeDAO(), which requires msg.sender to be the incorrectly used DAO address (for which private keys may not be available to sign transactions).

Reference: See finding #6 from Trail of Bits audit of Hermez Network: https://github.com/trailofbits/publications/blob/master/reviews/hermez.pdf


https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Vader.sol#L192-L196


#undefined
Manual Analysis

#undefined

Use a two-step process where the old DAO address first proposes new ownership in one transaction and a second transaction from the newly proposed DAO address accepts ownership. A mistake in the first step can be recovered by granting with a new correct address again before the new DAO address accepts ownership. Ideally, there should also be a timelock enforced before the new DAO takes effect.



### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/162) disagree with severity- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/162) sponsor confirmed- [dmvt labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/162) 2 (Med Risk)
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/162#issuecomment-830607270):**
 > A lot has to go wrong to get to this point, so disagree with severity (funds not at risk). 
> 
> Two step-process seems wise though. 

**[dmvt commented](https://github.com/code-423n4/2021-04-vader-findings/issues/162#issuecomment-847850118):**
 > Risk lowered because of the extremely low probability


## [[M-16] Copy-paste bug leading to incorrect harvest rewards in Vault.sol](https://github.com/code-423n4/2021-04-vader-findings/issues/51)

The conditional in calcReward() function uses the same code in both if/else parts with repeated use of reserveUSDV, reserveVADER and getUSDVAmount leading to incorrect computed value of _adjustedReserve in the else part.

This will affect harvest rewards for all users of the protocol and lead to incorrect accounting. Protocol will break and lead to fund loss.


https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Vault.sol#L141

https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Vault.sol#L144

https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Vault.sol#L125

https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Vault.sol#L105


#undefined
Manual Analysis

#undefined

Change variables and function calls from using USDV to VADER in the else part of the conditional which has to return the adjusted reserves when synth is not an asset i.e. an anchor and therefore base is VADER.

L144 should be changed to:
uint _adjustedReserve = iROUTER(ROUTER).getVADERAmount(reserveUSDV()) + reserveVADER();



### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/51) disagree with severity- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/51) sponsor confirmed- [dmvt labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/51) 2 (Med Risk)
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/51#issuecomment-830576589):**
 > Funds are not at-risk, just that some users will get less rewards, some will get more. 
> 
> Recommend: 2

**[Mervyn853 commented](https://github.com/code-423n4/2021-04-vader-findings/issues/51#issuecomment-830582964):**
 > Our decision matrix for severity:
> 
> 0: No-risk: Code style, clarity, off-chain monitoring (events etc), exclude gas-optimisations
> 1: Low Risk: UX, state handling, function incorrect as to spec
> 2: Funds-Not-At-Risk, but can impact the functioning of the protocol, or leak value with a hypothetical attack path with stated assumptions, but external requirements
> 3: Funds can be stolen/lost directly, or indirectly if a valid attack path shown that does not have handwavey hypotheticals.
> 
> Recommended: 2


## [[M-17] Vader.redeemToMember() vulnerable to front running](https://github.com/code-423n4/2021-04-vader-findings/issues/36)

## Details
The USDV balance of the Vader contract is vulnerable to theft through the Vader.redeemToMember() function. A particular case is through USDV redemption front-running. Users can redeem USDV for Vader through the USDV.redeemForMember() function or the Vader.redeemToMember() function. In the case of Vader.redeemToMember(), a user would need to send their USDV to the contract before redemption. However, as this process does not happen in a single call, the victim's call is vulnerable to front running and could have their redeemed USDV stolen by an attacker.

#User's redeem USDV could be stolen by an attacker front running their Vader.redeemToMember() call.

The steps are as follows:

1) User sends USDV to Vader contract to be redeemed
2) User calls Vader.redeemToMember() 
3) The Vader.redeemToMember() call is detected by an attacker, who front-runs the call by calling Vader.redeemToMember() specifying their own address as the member parameter. 
4) The full USDV balance of the Vader contract is redeemed and sent to the attacker.

Note that while this particular case is front running a redemption call, any USDV balance could be stolen in this manner. Please find the POC showing the above steps here: https://gist.github.com/toastedsteaksandwich/39bfed78b21d7e6c02fe13ea5b2023c3

#undefinedHardhat on a local hardhat network

#undefined
The Vader.redeemToMember() function should be restricted so that only the USDV contract can call it. Moreover, the amount parameter from USDV.redeem() or USDV.redeemForMember() should also be passed to Vader.redeemToMember() to avoid the need to sweep the entire USDV balance. In this way, the member's redemption happens in a single tx, and would only be allocated as much Vader as redeemed in USDV.


### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/36) disagree with severity- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/36) sponsor disputed- [dmvt labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/36) 2 (Med Risk)
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/36#issuecomment-827577253):**
 > Vader complies with a monetary security policy of "money in, money out". Contracts will only send out funds if they are first sent funds. 
> 
> This is the case for the entire system, not just `Vader.redeemToMember()`, such as swaps and adding liquidity. Vader is not designed to be interacted with directly, it should be wrapped. In this case, users should convert and redeem only thru the USDV contract, which first sends funds. 
> 
> Incidentally this is the same mechanism that uniswap employs for withdrawing liquidity, or syncing funds to balances. You can also get front-runned if you do it in two tx, it should be wrapped in 1 tx. 

**[Mervyn853 commented](https://github.com/code-423n4/2021-04-vader-findings/issues/36#issuecomment-830582247):**
 > Our decision matrix for severity:
> 
> 0: No-risk: Code style, clarity, off-chain monitoring (events etc), exclude gas-optimisations
> 1: Low Risk: UX, state handling, function incorrect as to spec
> 2: Funds-Not-At-Risk, but can impact the functioning of the protocol, or leak value with a hypothetical attack path with stated assumptions, but external requirements
> 3: Funds can be stolen/lost directly, or indirectly if a valid attack path shown that does not have handwavey hypotheticals.
> 
> Recommended: 0


 
# Low Risk Findings
## [[L-01] Missing event for critical init() function in Factory.sol](https://github.com/code-423n4/2021-04-vader-findings/issues/108)

The init() function initialises critical POOLS protocol address for this contract but is missing an event emission for off-chain monitoring tools to monitor this on-chain change.


https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Factory.sol#L27-L31

#undefined
Manual Analysis

#undefined

Add an init event and emit that at the end of init() function.


## [[L-02] Uninitialized variable leads to zero-fees for first transfer in Vader.sol](https://github.com/code-423n4/2021-04-vader-findings/issues/203)

The state variables feeOnTransfer is never initialized which leads to a default uint value of 0. When it is used on L126 in the first call to _transfer(), it will lead to a zero fee. feeOnTransfer is updated only in function _checkEmission() whose call happens later on L133, after which it has a value as calculated in that function.

This causes the only the first transfer to be a zero-fee transfer.


https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Vader.sol#L31

https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Vader.sol#L126

https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Vader.sol#L133

https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Vader.sol#L210


#undefined
Manual Analysis

#undefined

Initialize feeOnTransfer suitably on declaration, in constructor, or init() function.


## [[L-03] Misleading comment for deposit() function of Vault.sol](https://github.com/code-423n4/2021-04-vader-findings/issues/48)

Use of accurate comments helps read, audit and maintain code. Otherwise, it can be misleading and miss the flagging of or cause the introduction of vulnerabilities. 

Misleading comment that below functions allow USDV and Synths but the code only allows Synths.


https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Vault.sol#L76-L77


#undefined
Manual Analysis

#undefined

Use accurate and descriptive comments (even NatSpec) correctly describing the function behavior, parameters and return values.



## [[L-04] Fee can be at most 1% and dead code](https://github.com/code-423n4/2021-04-vader-findings/issues/221)
undefinedVulnerability Details

The `Vader._checkEmission` functions caps the fee at `1000` = 10% but the max fee that can be returned from the `iUTILS(UTILS).getFeeOnTransfer` call is `100`.

```solidity
// returns value between 0 and 100
feeOnTransfer = iUTILS(UTILS).getFeeOnTransfer(
    totalSupply,
    maxSupply
); // UpdateFeeOnTransfer
if (feeOnTransfer > 1000) {
    feeOnTransfer = 1000;
} // Max 10% if UTILS corrupted
```

It seems like there is a misunderstanding in whether the fee should be at most 1% (Utils.sol) or 10% (Vader.sol).



Clarify what the max fee should be and adjust either `Utils.getFeeOnTransfer` or the `Vader._checkEmission` cap.



## [[L-05] Lack of zero address validation in init() function](https://github.com/code-423n4/2021-04-vader-findings/issues/12)

#The parameter that are used in init() function to initialize the state variable,these state variable are used in other function to perform operation. since it lacks zero address validation, it will be problematic if there is error in these state variable. some of the function will loss their functionality which can cause the redeployment of contract 

 1. Vault.sol
   https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Vault.sol#L45

2. Vader.sol
  https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Vader.sol#L74

3. Utils.sol
 https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Utils.sol#L30

4. Router.sol
  https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Router.sol#L77

5. Pools.sol

 https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Pools.sol#L43

6. Factory.sol

https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Factory.sol#L27

7. Dao.sol

https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/DAO.sol#L46

#undefinedslither

#undefined

add require condition which check zero address validation


### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/12) sponsor acknowledged
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/12#issuecomment-826295256):**
 > Same as: https://github.com/code-423n4/2021-04-vader-findings/issues/13#issuecomment-826294937
> 
> No issue found


## [[L-06] Events not emitted](https://github.com/code-423n4/2021-04-vader-findings/issues/250)

#Events not emitted for important state changes.
https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Router.sol#L93
https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Router.sol#L98
https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Router.sol#L196
https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Router.sol#L201
https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Vault.sol#L61
https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Vader.sol#L163
https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Vader.sol#L171
https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Vader.sol#L179
https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Vader.sol#L184
https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Vader.sol#L188
https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Vader.sol#L193
https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Vader.sol#L198

-

#undefinedManual analysis.

#undefined
Emit events with meaningful names for the changes made.


### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/250) disagree with severity- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/250) sponsor acknowledged- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/250) sponsor confirmed- [dmvt labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/250) duplicate- [dmvt labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/250) 1 (Low Risk)
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/250#issuecomment-830629461):**
 > The ethereum state machine isn't a parking lot for event data
> 
> * `setParams()` - no, plenty events in DAO
> * `setAnchorParams()` - no, plenty events in DAO
> 
> But these are warranted, purely for off-chain metrics:
> * `addDepositData()` - valid for off-chain IL tracking
> * `removeDepositData()` - valid for off-chain IL tracking

**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/250#issuecomment-830629536):**
 > Severity: 0, no impact to protocol itself


## [[L-07] Swap fee not applied](https://github.com/code-423n4/2021-04-vader-findings/issues/272)

Here you have more information: https://gist.github.com/alexon1234/a2d3619fb3faa4e5676329f70bd565d3


## [[L-08] The Calculation For nextEraTime Drifts, Causing Eras To Occur Further And Further Into The Future](https://github.com/code-423n4/2021-04-vader-findings/issues/193)

The Calculation For nextEraTime Drifts, Causing Eras To Occur Further And Further Into The Future.

In Vader.sol, eras are intended to occur every 24 hours.
This means that a correct implementation would add 24 hours to the end-time of the previous era to find the end-time of the next era.
However, the current method for calculating the next era's end-time uses block.timestamp, rather than the previous era's end-time.

This line of code will cause a perpetual drift of era times, causing each era to actually be 24 hours plus the time between when the last era ended and when Vader._transfer() is next called.

#undefined

In Vader.sol, change this:

nextEraTime = block.timestamp + secondsPerEra;

to this:

nextEraTime = nextEraTime + secondsPerEra;


## [[L-09] _recordBurn does not handle 0 _eth appropriately](https://github.com/code-423n4/2021-04-vader-findings/issues/269)

#contract Vether4 function _recordBurn does not check that _eth > 0, thus it is possible to pass this check multiple times:
  if (mapEraDay_MemberUnits[_era][_day][_member] == 0)
If the user hasn't contributed to this day yet, it updates mapMemberEra_Days, mapEraDay_MemberCount, and mapEraDay_Members. However, when msg.value is 0 it is possible to trigger this condition again and again as mapEraDay_MemberUnits still remains 0.


Either do not allow burns of 0 _eth or add an extra check in the if statement.


## [[L-10] getAnchorPrice potentially returns the wrong median](https://github.com/code-423n4/2021-04-vader-findings/issues/213)
undefinedVulnerability Details

The `Router.getAnchorPrice` sorts the `arrayPrices` array and always returns the third element `_sortedAnchorFeed[2]`.
This only returns the median if `_sortedAnchorFeed` is of length 5, but it can be anything from `0` to `anchorLimit`.

If not enough anchors are listed initially, it might become out-of-bounds and break all contract functionality due to revert, or return a wrong median.
If `anchorLimit` is set to a different value than 5, it's also wrong.



Check the length of `_sortedAnchorFeed` and return `_sortedAnchorFeed[_sortedAnchorFeed.length / 2]` if it's odd, or the average of the two in the middle if it's even.



### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/213) disagree with severity- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/213) sponsor confirmed- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/213) filed- [dmvt labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/213) duplicate- [dmvt labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/213) 1 (Low Risk)
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/213#issuecomment-828464428):**
 > Valid, although it is intended design to launch with 5, which cannot be reduced after, so disagree with severity. 

**[Mervyn853 commented](https://github.com/code-423n4/2021-04-vader-findings/issues/213#issuecomment-830579123):**
 > Our decision matrix for severity:
> 
> 0: No-risk: Code style, clarity, off-chain monitoring (events etc), exclude gas-optimisations
> 1: Low Risk: UX, state handling, function incorrect as to spec
> 2: Funds-Not-At-Risk, but can impact the functioning of the protocol, or leak value with a hypothetical attack path with stated assumptions, but external requirements
> 3: Funds can be stolen/lost directly, or indirectly if a valid attack path shown that does not have handwavey hypotheticals.
> 
> Recommended: 2


## [[L-11] listAnchor sets _isCurated to true but forgets other parts of curation](https://github.com/code-423n4/2021-04-vader-findings/issues/271)

#function listAnchor sets _isCurated to true but does not update the curatedPoolCount and does not emit the Curated event. I don't see this curatedPoolCount variable used anywhere so probably it's just needed for the frontend consumption.


I think the best solution would be to replace _isCurated[token] = true; with a call to a function curatePool. It also skips if the same anchor is listed twice.


## [[L-12] curatePool emits Curated event no matter what](https://github.com/code-423n4/2021-04-vader-findings/issues/274)

#function curatePool emits Curated event every time. It should emit this event only when the conditions are fulfilled.


Put this event inside the most inner if block.


## [[L-13] calculations of upgradedAmount is not overflow protected](https://github.com/code-423n4/2021-04-vader-findings/issues/277)

#As contract Vether4 is using pragma solidity 0.6.4; SafeMath is not enabled by default, thus making this check inside function distribute avoidable (overflow):
	upgradedAmount += ownership[i];
	require(upgradedAmount <= maxEmissions, "Must not send more than possible");
Of course, this function can only be called by the deployer (who is later expected to call purgeDeployer) so the issue is only theoretical.


Use SafeMath here or just be informed about this theoretical issue. 


## [[L-14] flashProof is not effective at the start](https://github.com/code-423n4/2021-04-vader-findings/issues/307)

#In contract USDV blockDelay is not initialized and needs to be explicitly set by calling function setParams. Otherwise, it gets a default value of 0 so flashProof is not effective unless the value is set. 


It depends on the intentions, you can initialize it in the constructor (or init function) or maybe this precaution is intended to be turned on later.


## [[L-15] Token can be burn through transfer](https://github.com/code-423n4/2021-04-vader-findings/issues/262)

#The token can be sent to address(0) through a normal transfer() without decreasing the totalSupply as it would with calling burn() and it could cause an unintentional burn.

https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Vader.sol#L122
https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/USDV.sol#L102

#undefinedManual analysis

#undefined
Consider checking the recipient address to be != address(0).


## [[L-16] You can vote for proposal still not existent](https://github.com/code-423n4/2021-04-vader-findings/issues/273)

#voteProposal() doesn't check that proposalID <= proposalCount.

https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/DAO.sol#L79

#undefinedManual analysis

#undefined
in voteProposal()
require(proposalID <= proposalCount, "Proposal not existent")
should be <= because proposalCount is updated before using it (e.g. https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/DAO.sol#L59) in this way the proposal n. 0 is not assignable i'm not sure if it's wanted or not.


## [[L-17] Out-of-bound index access in function `getAnchorPrice`](https://github.com/code-423n4/2021-04-vader-findings/issues/313)

Out-of-bound index access is possible in the function `getAnchorPrice` of `Router.sol` if the number of anchors equals 1 or 2. Also, the returned anchor price is not the overall median in those situations.


Referenced code:
[Router.sol#L288](https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Router.sol#L288)

#undefined
None

#undefined

Consider using `arrayPrices.length/2` as the index to get the median of prices.


### Comments:
**[0x1d00ffff commented](https://github.com/code-423n4/2021-04-vader-findings/issues/313#issuecomment-836295231):**
 > duplicate of #213


## [[L-18] ERC20 race condition for allowances](https://github.com/code-423n4/2021-04-vader-findings/issues/35)

#Due to the implementation of the approve() function in Vader.sol, Vether.sol and mainnet Vether4 at 0x4Ba6dDd7b89ed838FEd25d208D4f644106E34279, it's possible for a user to over spend their allowance in certain situations.

The steps to the attack are as follows:

1) Alice approves an allowance of 5000 VETH to Bob. 
2) Alice attempts to lower the allowance to 2500 VETH.
3) Bob notices the transaction in the mempool and front-runs it by using up the full allowance with a transferFrom call.
4) Alice's lowered allowance is confirmed and Bob now has an allowance of 2500 VETH, which can be spent further for a total of 7500 VETH. 

Overall, Bob was supposed to be approved for at most 5000 VETH but got 7500 VETH. The POC code can be found here: https://gist.github.com/toastedsteaksandwich/db32472ae5c19c2eb188f07abddd02fa 

Note that in the POC, Bob receives 7492.5 VETH instead of 7500 VETH due to transfer fees.

#undefinedHardhat with mainnet forks, pinned to block 12227519.

#undefined
Instead of having a direct setter for allowances, decreaseAllowance and increaseAllowance functions should be exposed which decreases and increases allowances for a recipient respectively. In this way, if the decreaseAllowance call is front-run, the call should revert as there is insufficient allowance to be decreased. This leaves Bob with at most 5000 VETH, the original allowance.


### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/35) sponsor acknowledged
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/35#issuecomment-827582108):**
 > This theoretical attack has been known about for a while but never actually observed meaningfully. Addressing it costs extra gas.  


## [[L-19] Missing input validation may set rewardAddress to zero-address in Vader.sol](https://github.com/code-423n4/2021-04-vader-findings/issues/160)

Function setRewardAddress is used by DAO to change rewardAddress from USDV to something else. However, there is no zero-address validation on the address. This may accidentally mint rewards to zero-address.


https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Vader.sol#L80

https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Vader.sol#L209

https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Vader.sol#L183-L186


#undefined
Manual Analysis

#undefined

Add zero-address check to setRewardAddress.


### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/160) disagree with severity- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/160) sponsor confirmed- [dmvt labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/160) 1 (Low Risk)
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/160#issuecomment-830615075):**
 > Sure, if this happened (and it wasn't intentional) then it would be voted to the correct one. Low likelihood, disagree with severity. 


## [[L-20] Default value of curatedPoolLimit allows only one curated pool in Router.sol](https://github.com/code-423n4/2021-04-vader-findings/issues/86)

The default value of curatedPoolLimit only allows one curated pool at any time. This can be changed with setParams() but DAO does not have this functionality. 

This will affect the scalability of the protocol and significantly limit the liquidity pool value proposition.


https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Router.sol#L85

https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Router.sol#L96

https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Router.sol#L227


#undefined
Manual Analysis

#undefined

Change curatedPoolLimit to a higher value on L85.



### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/86) disagree with severity- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/86) sponsor acknowledged- [dmvt labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/86) 1 (Low Risk)
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/86#issuecomment-830613369):**
 > Intended to be 5-10 as per discussion with community. The DAO will have extra functionality to expand. 
> 
> How is this medium-risk?


## [[L-21] totalBurnt might be wrong](https://github.com/code-423n4/2021-04-vader-findings/issues/32)

#Vether.sol (https://etherscan.io/address/0x4Ba6dDd7b89ed838FEd25d208D4f644106E34279#code) 
is the 4th contract version.
It takes the totalBurnt value of the 2nd version of the contract an continues on that.
It seem more logical to use the totalBurnt value of the 3rd version of the contract an continues on that.
This way the value of totalBurnt is probably not the real value.

vether.sol:
contract Vether4 is ERC20 {
 constructor() public {
       ...
        vether2 = 0x01217729940055011F17BeFE6270e6E59B7d0337;                               // Second Vether
        vether3 = 0x75572098dc462F976127f59F8c97dFa291f81d8b;   
        ...
        totalBurnt = VETH(vether2).totalBurnt(); totalFees = 0;

#undefinedEditor

#undefined
Check if indeed vether3 should be used and update the code to use vether3



### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/32) disagree with severity- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/32) sponsor disputed- [dmvt labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/32) 1 (Low Risk)
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/32#issuecomment-826845471):**
 > Vether is deployed code and can't be changed. 

**[Mervyn853 commented](https://github.com/code-423n4/2021-04-vader-findings/issues/32#issuecomment-830582713):**
 > Our decision matrix for severity:
> 
> 0: No-risk: Code style, clarity, off-chain monitoring (events etc), exclude gas-optimisations
> 1: Low Risk: UX, state handling, function incorrect as to spec
> 2: Funds-Not-At-Risk, but can impact the functioning of the protocol, or leak value with a hypothetical attack path with stated assumptions, but external requirements
> 3: Funds can be stolen/lost directly, or indirectly if a valid attack path shown that does not have handwavey hypotheticals.
> 
> Recommended: 0


## [[L-22] Missing DAO functionality to call setParams() function in USDV.sol](https://github.com/code-423n4/2021-04-vader-findings/issues/140)

setParams() is authorized to be called only from the DAO (per modifier) but DAO contract has no corresponding functionality to call setParams() function. As a result, blockDelay — a critical parameter used to prevent flash attacks, is stuck with initialized value and cannot be changed.



https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/USDV.sol#L138-L142


#undefined
Manual Analysis

#undefined

Add functionality to DAO to be able to call setParams() of USDV.sol.



### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/140) disagree with severity- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/140) duplicate- [dmvt labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/140) 1 (Low Risk)
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/140#issuecomment-830603451):**
 > https://github.com/code-423n4/2021-04-vader-findings/issues/82

**[dmvt commented](https://github.com/code-423n4/2021-04-vader-findings/issues/140#issuecomment-847841030):**
 > This can be easily addressed by updating the DAO address on Vader, even if it is deployed this way. Low risk and impact as a result.


## [[L-23] events can be emitted  even after failed transaction](https://github.com/code-423n4/2021-04-vader-findings/issues/6)

#when anyone try to remove liquidity or wanted swap , their transaction may get failed. Even though transaction got failed , event will be emitted which can be problematic if we are keeping  track record offchain

  
  In Pools.sol
   
  
 https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Pools.sol#L92

https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Pools.sol#L101

https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Pools.sol#L163

  in _removeLiquidity(){} function, swap(){} function, burnSynth(){} function,  event is emitted before transferOut(){} function get completed , since transferOut(){} function does not check return value from transfer 

 https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Pools.sol#L211

 transaction may get failed even though event is emitted

 

#undefined
No tool used

#undefined

check return value from transfer function in order to know whether transaction got successfully executed or not


### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/6) disagree with severity- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/6) sponsor disputed- [dmvt labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/6) 1 (Low Risk)
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/6#issuecomment-826293590):**
 > Events are not used for tracking state. If a tx fails, the contract's storage will not update. The contract state is the source of truth. 
> 
> Recommend: Close, no issue found. 

**[Mervyn853 commented](https://github.com/code-423n4/2021-04-vader-findings/issues/6#issuecomment-830582793):**
 > Our decision matrix for severity:
> 
> 0: No-risk: Code style, clarity, off-chain monitoring (events etc), exclude gas-optimisations
> 1: Low Risk: UX, state handling, function incorrect as to spec
> 2: Funds-Not-At-Risk, but can impact the functioning of the protocol, or leak value with a hypothetical attack path with stated assumptions, but external requirements
> 3: Funds can be stolen/lost directly, or indirectly if a valid attack path shown that does not have handwavey hypotheticals.
> 
> Recommended: 0

**[dmvt commented](https://github.com/code-423n4/2021-04-vader-findings/issues/6#issuecomment-849046134):**
 > This can and will cause cascading issues for third party dapps. At worst, completely hypothetically, this could cause a user to act as if they have funds they don't or vise versa leading to reputational and economic impact. I recommend that the team treat event emission more seriously in general. 


 
# Non-Critical Findings
## [[N-01] Not always reason at require](https://github.com/code-423n4/2021-04-vader-findings/issues/20)

#Several requires don't have a reason string (error message) to explain why it has failed. This makes identifying the problems more difficult.

DAO.sol:        require(inited == false);
Factory.sol:        require(inited == false);
Pools.sol:        require(inited == false);
Pools.sol:        require(token != USDV && token != VADER); // Prohibited
Pools.sol:        require(base == USDV || base == VADER);
Pools.sol:        require(token != VADER || token != USDV);
Router.sol:            require(iUTILS(UTILS()).calcSwapSlip(inputAmount, iPOOLS(POOLS).getTokenAmount(inputToken)) <= slipLimit);
Router.sol:            require(iUTILS(UTILS()).calcSwapSlip(inputAmount, iPOOLS(POOLS).getBaseAmount(outputToken)) <= slipLimit);
Router.sol:            require(iUTILS(UTILS()).calcSwapSlip(inputAmount, iPOOLS(POOLS).getTokenAmount(inputToken)) <= slipLimit);
Router.sol:            require(iUTILS(UTILS()).calcSwapSlip(inputAmount, iPOOLS(POOLS).getBaseAmount(outputToken)) <= slipLimit);
Router.sol:        require(iPOOLS(POOLS).isAsset(token) || iPOOLS(POOLS).isAnchor(token));
Router.sol:        require(iPOOLS(POOLS).isAsset(newToken));
Router.sol:        require(arrayAnchors.length < anchorLimit); // Limit
Router.sol:        require(iPOOLS(POOLS).isAnchor(token));     // Must be anchor
Router.sol:            require(iERC20(_token).transferTo(address(this), _amount));
Router.sol:            require(iERC20(_token).transferFrom(msg.sender, address(this), _amount));
Router.sol:        require(iERC20(_token).transfer(_member, _amount));
USDV.sol:        require(inited == false);
USDV.sol:                require(iERC20(token).transferTo(address(this), amount));
USDV.sol:                require(iERC20(token).transferFrom(msg.sender, address(this), amount));
Vader.sol:        require(inited == false);
Vader.sol:        require(iERC20(VETHER).transferFrom(msg.sender, burnAddress, amount));
Vault.sol:        require(inited == false);
Vault.sol:            require(iERC20(synth).transferTo(address(this), amount));
Vault.sol:            require(iERC20(synth).transferFrom(msg.sender, address(this), amount));
Vault.sol:        require(iERC20(synth).transfer(member, amount));
Vether.sol:        require(msg.sender == deployer);
Vether.sol:    function purgeDeployer() public{require(msg.sender == deployer);deployer = address(0);}


#undefinedgrep require *.sol | grep -v "\""

#undefined
Add reasons (error messages) to the requires


### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/20) sponsor acknowledged
## [[N-02] Functions with implicit return values](https://github.com/code-423n4/2021-04-vader-findings/issues/24)

#Several functions have implicit return values. Although in that case 0 or false is returned, this might not be obvious to the casual reader.

USDV.sol: 
   function isMature() public view returns(bool isMatured){
        if(lastBlock[tx.origin] + blockDelay <= block.number){ // Stops an EOA doing a flash attack in same block
            return true;
        }
    }

Note there are several other functions where this happens.

#undefinedEditor

#undefined
Use explicit return values or add a comment than an implicit value is used.


### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/24) sponsor confirmed- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/24) sponsor acknowledged
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/24#issuecomment-826860800):**
 > Don't consider implicit return values to be underhanded, although an extra comment is sufficient. 


## [[N-03] Different pragma solidity](https://github.com/code-423n4/2021-04-vader-findings/issues/25)

#Vault.sol has a different pragma statement than the rest, it contains an additional "^".

For the record the Vether.sol contract (as deployed here https://etherscan.io/address/0x4Ba6dDd7b89ed838FEd25d208D4f644106E34279#code), 
has a different solidity version.

It's cleaner to use the same versions.


DAO.sol:pragma solidity 0.8.3;
Factory.sol:pragma solidity 0.8.3;
Pools.sol:pragma solidity 0.8.3;
Router.sol:pragma solidity 0.8.3;
Synth.sol:pragma solidity 0.8.3;
USDV.sol:pragma solidity 0.8.3;
Utils.sol:pragma solidity 0.8.3;
Vader.sol:pragma solidity 0.8.3;
Vault.sol:pragma solidity ^0.8.3;
Vether.sol:pragma solidity 0.6.4;

#undefinedEditor

#undefined
Use the same solidity versions



### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/25) sponsor confirmed
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/25#issuecomment-826859371):**
 > Valid


## [[N-04] ERC20 specification declares decimals as uint8 type](https://github.com/code-423n4/2021-04-vader-findings/issues/283)

#iERC20 decimals field is declared as uint, but to be exact, ERC20 specification declares decimals as uint8. Anyway, this has no security impact as 18 decimals is set which fits in uint8.


You can refactor to uint8 or just be informed about such compatibility guidelines.


### Log:
- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/283) addressed
### Comments:
**[0xBrian commented](https://github.com/code-423n4/2021-04-vader-findings/issues/283#issuecomment-837967679):**
 > https://github.com/vetherasset/vaderprotocol-contracts/commit/35908c629eed86dac62b1baee3cb247c38f2a5a0


## [[N-05] [INFO] Code style suggestions](https://github.com/code-423n4/2021-04-vader-findings/issues/285)

#Not an actual issue, just several observations about the codestyle:

  uint private _year = 31536000;
could be replaced with:
  uint private _year = 365 days; 
to improve readability. Same with:
  minGrantTime = 2592000;     // 30 days


Some require statements have error msgs, some don't. Better would be to unify that. For example, function listAnchor doesn't but function replaceAnchor does.



## [[N-06] Difference from whitepaper](https://github.com/code-423n4/2021-04-vader-findings/issues/251)

#In the whitepaper is written that the maxSupply for Vader is 2bn but in the code is 2m.

-

#undefinedManual analysis

#undefined
Correct the whitepaper.


## [[N-08] Public functions getSynth() and isSynth() are commented out in Factory.sol](https://github.com/code-423n4/2021-04-vader-findings/issues/110)

Public functions getSynth() and isSynth() are commented out. It is unclear if this is part of any logic that is documented as not yet implemented. This affects readability and maintainability at the very least. And if this is actually meant to be implemented but is missing, then it could affect protocol operation.


https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Factory.sol#L48-L55

https://github.com/code-423n4/2021-04-vader/blob/main/README.md#known-deviations-from-spec


#undefined
Manual Analysis

#undefined

Implement missing logic or remove commented code.



### Log:
- [dmvt labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/110) 0 (Non-critical)
### Comments:
**[dmvt commented](https://github.com/code-423n4/2021-04-vader-findings/issues/110#issuecomment-845781880):**
 > While I agree that commenting could be better and there is no reason for this code to be there, the functions were clearly replaced with mappings https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Factory.sol#L15. This is a code style issue with no available exploit attached.


## [[N-09] Named return variable in harvest() and other functions of Vault.sol and contracts](https://github.com/code-423n4/2021-04-vader-findings/issues/50)

There is an inconsistent use of implicit named return variables across the entire codebase which makes readability and maintainability hard.

Reference Note 6 from OpenZeppelin’s audit of Holdefi: https://blog.openzeppelin.com/holdefi-audit/#notes


https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Vault.sol#L101


#undefined
Manual Analysis

#undefined

Consider removing all named return variables, explicitly declaring them as local variables in the body of the function, and adding the necessary explicit return statements where appropriate. This will favor both explicitness and readability of the codebase.



### Log:
- [dmvt labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/50) 0 (Non-critical)
## [[N-10]  `Protection` event not used](https://github.com/code-423n4/2021-04-vader-findings/issues/230)
undefinedVulnerability Details

The `Protection` event in `Router` is not used.

Unused code can hint at programming or architectural errors.



Use it or remove it.



### Log:
- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/230) filed- [dmvt labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/230) 0 (Non-critical)
## [[N-11] Replacing an anchor does not reset `Pool.isAnchor`](https://github.com/code-423n4/2021-04-vader-findings/issues/212)
undefinedVulnerability Details

The `Router.replaceAnchor` function can be used to replace an anchor, however `Pool._isAmchor` is not reset.

Price updates are still attempted on each swap through `_handleAnchorPriceUpdate` which costs lots of unnecessary gas.



It's not clear to the auditor how the whole `_.isAnchor` system is supposed to work as any token can be made an anchor through a `Pools.addLiquidity` call.



### Log:
- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/212) filed- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/212) disagree with severity- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/212) sponsor acknowledged- [dmvt labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/212) 0 (Non-critical)
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/212#issuecomment-830615700):**
 > It's subtle, but there are two types of Anchors
> 
> 1) Those with VADER as base pair
> 2) A subset of (1) that are enabled for pricing of the Anchor
> 
> If not is (2) then this will skip, since it won't be in the array of anchors listed for pricing:
> 
> ```
> // Anyone to update prices
>     function updateAnchorPrice(address token) public {
>         for (uint256 i = 0; i < arrayAnchors.length; i++) {
>             if (arrayAnchors[i] == token) {
>                 arrayPrices[i] = iUTILS(UTILS()).calcValueInBase(arrayAnchors[i], one);
>             }
>         }
>     }
>         ```

**[dmvt commented](https://github.com/code-423n4/2021-04-vader-findings/issues/212#issuecomment-847657396):**
 > This appears to be intended functionality per sponsor, but the functionality is confusing for anyone other than the original devs. This can and should be addressed with commenting and documentation.


## [[N-12] Unrestricted `addLiquidity` could cause unintended results on front-end apps that listen to events.](https://github.com/code-423n4/2021-04-vader-findings/issues/317)

The `addLiquidity` function in `Pool.sol` lacks an access control, which allows an attacker to add liquidity for any specific user. Front-end apps that listen to `AddLiquidity` events may be affected by this vulnerability and may go wrong since it is not the user's intent to add liquidity.


Referenced code:
Pool.sol#L54-L75](https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Pools.sol#L54-L75)

PoC: [Link to PoC](https://drive.google.com/drive/folders/1W3jhlWIIh7FxTLZET3z49yA0DBvlbcPg?usp=sharing)
See the file `302_addLiquidity.js` for a PoC of this attack. To run it, use `npx hardhat test 302_addLiquidity.js`.

#undefined
None

#undefined

Consider checking whether `addLiquidity` is called from the router. If not, then the transaction should revert. Add another function, e.g., `addLiquidityDirectly`, for end users if they want to interact with the pool to add liquidity directly.


### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/317) disagree with severity- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/317) sponsor acknowledged- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/317) filed
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/317#issuecomment-830571230):**
 > Pools.sol is not designed to be interacted without a Router. 
> 
> Nothing in the system relies on events, which are just used for metrics/UX

**[Mervyn853 commented](https://github.com/code-423n4/2021-04-vader-findings/issues/317#issuecomment-830575947):**
 > Our decision matrix for severity:
> 
> 0: No-risk: Code style, clarity, off-chain monitoring (events etc), exclude gas-optimisations
> 1: Low Risk: UX, state handling, function incorrect as to spec
> 2: Funds-Not-At-Risk, but can impact the functioning of the protocol, or leak value with a hypothetical attack path with stated assumptions, but external requirements
> 3: Funds can be stolen/lost directly, or indirectly if a valid attack path shown that does not have handwavey hypotheticals.
> 
> Recommended: 0

**[dmvt commented](https://github.com/code-423n4/2021-04-vader-findings/issues/317#issuecomment-849063162):**
 > Bad UX experience aside, this would result in a user gaining funds, not losing them. It is definitely not high risk.


 
# Gas Optimizations
## [[G-01] Gas savings by removing unnecessary conditional in isCurated() function of Router.sol](https://github.com/code-423n4/2021-04-vader-findings/issues/100)

There is no need for the conditional check on L474 which wastes gas. The named-return variable curated can be simply set to _isCurated[token] or the named-return variable can be removed to simply return  _isCurated[token]. This will reduce the contract size and save gas.


https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Router.sol#L473-L477


#undefined
Manual Analysis

#undefined

The named-return variable curated can be simply set to _isCurated[token] or the named-return variable can be removed to simply return _isCurated[token].


## [[G-02] Unused ID field in structs](https://github.com/code-423n4/2021-04-vader-findings/issues/304)

#Both structs CollateralDetails and DebtDetails have unused ID field which is never set nor queried:
   uint ID;


### Log:
- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/304) addressed- [dmvt labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/304) duplicate
### Comments:
**[0xBrian commented](https://github.com/code-423n4/2021-04-vader-findings/issues/304#issuecomment-837848202):**
 > https://github.com/vetherasset/vaderprotocol-contracts/commit/303468ad3c6815bd3c1082090037ba5dc6bdab99


## [[G-03] Use immutable for constant variables](https://github.com/code-423n4/2021-04-vader-findings/issues/286)

#There are variables that are only assigned once (e.g. in a constructor). You should mark such variables with the keyword "immutable", this greatly reduces the gas costs. A concrete example of such a variable is "VADER" which is only initialized once and cannot be changed later:
   VADER = _vader;
There are plenty of such variables across the contracts.



### Log:
- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/286) addressed- [dmvt labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/286) duplicate
### Comments:
**[0xBrian commented](https://github.com/code-423n4/2021-04-vader-findings/issues/286#issuecomment-837838151):**
 > Most likely addressed in one of
> https://github.com/vetherasset/vaderprotocol-contracts/commit/66ce8d72bcd91544f5f1b0382d5e809aa6b71a44
> https://github.com/vetherasset/vaderprotocol-contracts/commit/2dacdc3716706c8f635e7173b3fc5f1b42869a35


## [[G-04] Public function that could be declared external](https://github.com/code-423n4/2021-04-vader-findings/issues/14)

#public functions that are never called by the contract should be declared external to save gas.

 1. In Vault.sol  -- > init() and grant()
               
    https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Vault.sol#L45

https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Vault.sol#L68

2. Vader.sol -- > burn() 

 https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Vader.sol#L146

3. Utils.sol -- > init(),  getProtection()

 https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Utils.sol#L30

4. Router.sol -- >

init(address,address,address) 
getVADERAmount(uint256) 
getUSDVAmount(uint256) 
borrow(uint256,address,address) 
repay(uint256,address,address) 
checkLiquidate()
getSystemCollateral(address,address) 
getSystemDebt(address,address)
getSystemInterestPaid() 

https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Router.sol#L77

5. Pools.sol

init(address,address,address,address) 
isMember(address) 
isSynth(address) 

https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Pools.sol

6. Dao.sol

init(address,address,address) 
newGrantProposal(address,uint256) 
newAddressProposal(address,string) 
voteProposal(uint256) 
cancelProposal(uint256,uint256) 
finaliseProposal(uint256)

https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/DAO.sol#L46
	

#undefined
slither

#undefined

use external instead of public visibility to save gas


### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/14) 0 (Non-critical)- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/14) sponsor acknowledged- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/14) sponsor confirmed- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/14) addressed- [dmvt labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/14) duplicate
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/14#issuecomment-826295157):**
 > Valid, will action this. 

**[0xBrian commented](https://github.com/code-423n4/2021-04-vader-findings/issues/14#issuecomment-837935067):**
 > Most likely fixed in mega `external` patch.
> https://github.com/vetherasset/vaderprotocol-contracts/commit/d946b6262ac83cdb7722baa3a8684c4ceabf4ea3#diff-f5afe9240d284bf89e33b79c68c1ab21a6c18323c11d480d25144c18b8a9373a


## [[G-05] Gas savings by moving inited bool state variable next to an address state variable declaration in Pools.sol](https://github.com/code-423n4/2021-04-vader-findings/issues/111)

A bool in Solidity is internally represented as a unit8 and so required only 8 bits of the 256-bits storage slot. An address variable is 160-bits. So declaring a bool next to an address variable lets Solidity pack them in the same storage slot thereby using one slot instead of two.

Moving the inited bool state variable next to one of the address state variables VADER, USDV, ROUTER or FACTORY lets the compiler pack them together in one storage slot instead of two, thereby saving one slot. It costs 20k gas to SSTORE each slot of data.

The current order where inited bool is declared before uint does not allow packing because uint itself requires the entire 256-bits of a slot, which forces the compiler to use one full slot for the inited bool variable.

For reference, see https://mudit.blog/solidity-gas-optimization-tips/


https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Pools.sol#L13-L20


#undefined
Manual Analysis

#undefined

Move inited bool state variable declaration next to an address state variable declaration.



### Log:
- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/111) addressed
### Comments:
**[0xBrian commented](https://github.com/code-423n4/2021-04-vader-findings/issues/111#issuecomment-837939476):**
 > At some point we got rid of all the `inited`s.


## [[G-06] Gas savings by removing unused state variable _isMember and related getter function isMember() in Pools.sol](https://github.com/code-423n4/2021-04-vader-findings/issues/118)

_isMember mapping state variable is declared and used only in the getter function isMember(), but is net assigned to anywhere in the contract. This will consume an unnecessary storage slot and along with its getter function will also increase the contract size.


https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Pools.sol#L22

https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Pools.sol#L215-L217


#undefined
Manual Analysis

#undefined

Remove _isMember state variable declaration on L22 and related getter function isMember().



### Log:
- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/118) addressed
### Comments:
**[0xBrian commented](https://github.com/code-423n4/2021-04-vader-findings/issues/118#issuecomment-837784665):**
 > https://github.com/vetherasset/vaderprotocol-contracts/commit/c9c066a9c8b083a751d1f4e13850253672e10b03


## [[G-07] Gas savings by declaring state variables constant in USDV.sol](https://github.com/code-423n4/2021-04-vader-findings/issues/129)

From Solidity’s documentation (https://docs.soliditylang.org/en/v0.8.4/contracts.html#constant-and-immutable-state-variables), “State variables can be declared as constant or immutable. In both cases, the variables cannot be modified after the contract has been constructed. For constant variables, the value has to be fixed at compile-time, while for immutable, it can still be assigned at construction time. The compiler does not reserve a storage slot for these variables, and every occurrence is replaced by the respective value. Compared to regular state variables, the gas costs of constant and immutable variables are much lower.”

State variables name, symbol and decimals can be declared as constants and assigned at declaration (instead of constructor) because they are never modified later. This avoid 3 storage slots and associated expensive SSTOREs/SLOADs to save gas.


https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/USDV.sol#L12-L13


#undefined
Manual Analysis

#undefined

Declare state variables name, symbol and decimals as constant.



### Log:
- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/129) addressed
### Comments:
**[0xBrian commented](https://github.com/code-423n4/2021-04-vader-findings/issues/129#issuecomment-837839241):**
 > Most likely addressed in one of
> https://github.com/vetherasset/vaderprotocol-contracts/commit/66ce8d72bcd91544f5f1b0382d5e809aa6b71a44
> https://github.com/vetherasset/vaderprotocol-contracts/commit/2dacdc3716706c8f635e7173b3fc5f1b42869a35


## [[G-08] Gas savings by converting storage variable to immutable in Vader.sol](https://github.com/code-423n4/2021-04-vader-findings/issues/149)

From Solidity’s documentation (https://docs.soliditylang.org/en/v0.8.4/contracts.html#constant-and-immutable-state-variables), “State variables can be declared as constant or immutable. In both cases, the variables cannot be modified after the contract has been constructed. For constant variables, the value has to be fixed at compile-time, while for immutable, it can still be assigned at construction time. The compiler does not reserve a storage slot for these variables, and every occurrence is replaced by the respective value. Compared to regular state variables, the gas costs of constant and immutable variables are much lower.”

The burnAddress variable  can be made immutable. This will avoid the use of one storage slot and lead to gas savings.


https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Vader.sol#L36


https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Vader.sol#L71

#undefined
Manual Analysis

#undefined

Make burnAddress immutable.



### Log:
- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/149) addressed
### Comments:
**[0xBrian commented](https://github.com/code-423n4/2021-04-vader-findings/issues/149#issuecomment-837838814):**
 > Most likely addressed in one of
> https://github.com/vetherasset/vaderprotocol-contracts/commit/66ce8d72bcd91544f5f1b0382d5e809aa6b71a44
> https://github.com/vetherasset/vaderprotocol-contracts/commit/2dacdc3716706c8f635e7173b3fc5f1b42869a35


## [[G-09] Gas savings by removing state variable baseline in Vader.sol](https://github.com/code-423n4/2021-04-vader-findings/issues/153)

From Solidity’s documentation (https://docs.soliditylang.org/en/v0.8.4/contracts.html#constant-and-immutable-state-variables), “State variables can be declared as constant or immutable. In both cases, the variables cannot be modified after the contract has been constructed. For constant variables, the value has to be fixed at compile-time, while for immutable, it can still be assigned at construction time. The compiler does not reserve a storage slot for these variables, and every occurrence is replaced by the respective value. Compared to regular state variables, the gas costs of constant and immutable variables are much lower.”

State variable baseline is initialized the value of _1m in constructor and then is never modified. Replacing its use directly by a constant_1m avoids a storage slot and associated SLOADs (2600 gas) leading to gas savings.


https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Vader.sol#L25

https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Vader.sol#L63

https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Vader.sol#L218-L219

#undefined
Manual Analysis

#undefined

Remove baseline state variable and replace its use directly by a constant_1m



## [[G-10] Gas savings by replacing public visibility with internal/private for isEqual() function of DAO.sol](https://github.com/code-423n4/2021-04-vader-findings/issues/181)

isEqual() helper function is never meant to be called from outside the contract and so does not require public visibility. As described in https://mudit.blog/solidity-gas-optimization-tips/: “For all the public functions, the input parameters are copied to memory automatically, and it costs gas. If your function is only called externally, then you should explicitly mark it as external. External function’s parameters are not copied into memory but are read from calldata directly. This small optimization in your solidity code can save you a lot of gas when the function input parameters are huge.”

Given the two parameters of isEqual() function, this will save some amount of gas.


https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/DAO.sol#L192


#undefined
Manual Analysis

#undefined

Change visibility of isEqual() to internal/private



### Log:
- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/181) filed
## [[G-11] Perform early input validation of zero-address for efficiency in DAO.sol](https://github.com/code-423n4/2021-04-vader-findings/issues/182)

Instead of performing a zero-address check in moveRewardAddress on L146 or L152, it is more efficient to do so in newAddressProposal() as soon as the new address is proposed, instead of allowing a proposal for zero-address which goes through the whole voting process. If there is a requirement for zero-address proposals, it should be specified explicitly.

Depending on the participation in the voting process, this will save significant amount of gas for all the participants.


https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/DAO.sol#L69-L74

https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/DAO.sol#L144-L154

#undefined
Manual Analysis

#undefined

Perform input validation of zero-address in newAddressProposal() for proposedAddress parameter.



### Log:
- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/182) addressed
### Comments:
**[0xBrian commented](https://github.com/code-423n4/2021-04-vader-findings/issues/182#issuecomment-837932289):**
 > Not sure when it was added, but this was done.


## [[G-12] Unnecessary logic that will never get triggered in DAO.sol](https://github.com/code-423n4/2021-04-vader-findings/issues/186)

The conditional checking if proposal has quorum in finaliseProposal() is unnecessary and will never be triggered because finalising proposals will always have quorum. Proposal without quorum are not finalised in the voteProposal() function.

Removing this code will reduce contract size and save some gas.


https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/DAO.sol#L114-L116

https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/DAO.sol#L82-L90

https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/DAO.sol#L94-L99


#undefined
Manual Analysis

#undefined

Remove code from L114 to L116.


### Log:
- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/186) addressed
### Comments:
**[0xBrian commented](https://github.com/code-423n4/2021-04-vader-findings/issues/186#issuecomment-837780079):**
 > https://github.com/vetherasset/vaderprotocol-contracts/commit/f7c7085af0eb871ba80db3932acc703fd6d3623c


## [[G-13] Gas savings by avoiding re-initialization of POOLS variable in init() function of Vault.sol](https://github.com/code-423n4/2021-04-vader-findings/issues/43)

POOLS address is initialized on L48 but re-initialized on L53. This unnecessary storage write will cost 200 gas because it is overwritten with the same value as earlier (see EIP-1087).


https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Vault.sol#L48

https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Vault.sol#L53

#undefined
Manual Analysis

#undefined

Remove re-initialization on L53.



## [[G-14] Gas savings by removing unused state variable repayDelay in Router.sol](https://github.com/code-423n4/2021-04-vader-findings/issues/78)

repayDelay uint state variable is declared but never used elsewhere. This will consume an unnecessary storage slot and also increase the contract size.

https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Router.sol#L35


#undefined
Manual Analysis

#undefined

Remove repayDelay state variable declaration on L35.



### Log:
- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/78) addressed
### Comments:
**[0xBrian commented](https://github.com/code-423n4/2021-04-vader-findings/issues/78#issuecomment-837776728):**
 > https://github.com/vetherasset/vaderprotocol-contracts/commit/f6b6a369f64e5ade0b7511d397d708a9a0916178


## [[G-15] Gas savings by changing getILProtection() function’s public visibility to internal/private in Router.sol](https://github.com/code-423n4/2021-04-vader-findings/issues/85)

As described in https://mudit.blog/solidity-gas-optimization-tips/: “For all the public functions, the input parameters are copied to memory automatically, and it costs gas.” Changing visibility to internal/private will prevent these copies and save gas.

getILProtection() is only called from within the Router contract and so can work with internal/private visibility instead of public.


https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Router.sol#L209

https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Router.sol#L115


#undefined
Manual Analysis

#undefined

Change getILProtection() function’s public visibility to internal/private on L209



## [[G-16] Gas savings by saving state variable in a memory for loop access in replaceAnchor() of Router.sol](https://github.com/code-423n4/2021-04-vader-findings/issues/90)

State variables reads using SLOADs cost 2600 gas. Instead of comparing the loop index i to a state variable arrayAnchors.length for every loop iteration, it will save gas to copy arrayAnchors.length to a memory variable for comparison.


https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Router.sol#L261

https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Router.sol#L32


#undefined
Manual Analysis

#undefined

Copy arrayAnchors.length to a memory variable outside the loop and use that for loop index comparison.


## [[G-17] Gas savings by breaking from loop after match+replace in replaceAnchor() of Router.sol](https://github.com/code-423n4/2021-04-vader-findings/issues/91)

If the requirement is that listed anchors are unique token addresses, then the loop in replaceAnchor() can break upon match+replace to save gas from executing more loop iterations.


https://github.com/code-423n4/2021-04-vader/blob/3041f20c920821b89d01f652867d5207d18c8703/vader-protocol/contracts/Router.sol#L261-L265


#undefined
Manual Analysis

#undefined

Add a break statement after L263.



### Log:
- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/91) addressed
### Comments:
**[0xBrian commented](https://github.com/code-423n4/2021-04-vader-findings/issues/91#issuecomment-837873133):**
 > https://github.com/vetherasset/vaderprotocol-contracts/commit/452986a77f1c6cfd9f96255c1b2450d4febd1c0f


## [[G-18] cache `proposalCount` instead of accessing it three times in `newGrantProposal`/`newAddressProposal`](https://github.com/code-423n4/2021-04-vader-findings/issues/232)

`DAO.sol`: cache `proposalCount` instead of accessing it three times in `newGrantProposal`/`newAddressProposal`


## [[G-19] `DAO.mapPID_finalised` is never read in the contract, only written](https://github.com/code-423n4/2021-04-vader-findings/issues/233)

`DAO.mapPID_finalised` is never read in the contract, only written. Remove it and show the `finalized` state in the frontend based on whether the `FinalisedProposal` event was emitted


### Log:
- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/233) addressed
### Comments:
**[0xBrian commented](https://github.com/code-423n4/2021-04-vader-findings/issues/233#issuecomment-837892908):**
 > https://github.com/vetherasset/vaderprotocol-contracts/commit/6f961e6cd159e905ef53a5a067f956d21f8a46ee


## [[G-20] Add anchor map](https://github.com/code-423n4/2021-04-vader-findings/issues/236)

`Router.updateAnchorPrice` iterates over all anchor tokens on each update which is very inefficient and does a lot of expensive storage loads. add a mapping `address => index` to easily retrieve the index of the token in the `arrayAnchors` mapping.


### Log:
- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/236) addressed
### Comments:
**[0xBrian commented](https://github.com/code-423n4/2021-04-vader-findings/issues/236#issuecomment-837872189):**
 > https://github.com/vetherasset/vaderprotocol-contracts/commit/452986a77f1c6cfd9f96255c1b2450d4febd1c0f


## [[G-21] Store using Struct over multiple mappings](https://github.com/code-423n4/2021-04-vader-findings/issues/252)

Here you have more information: https://gist.github.com/alexon1234/b101e3ac51bea3cbd9cf06f80eaa5bc2


## [[G-22] Use Keccak256 over Sha256 for string comparation](https://github.com/code-423n4/2021-04-vader-findings/issues/258)

Here you have more info: https://gist.github.com/alexon1234/5e8f4c335899a3398808bb96203bb982


## [[G-23] Some storage optimizations](https://github.com/code-423n4/2021-04-vader-findings/issues/292)

Here you have more information: https://gist.github.com/alexon1234/5eb3fff3bded4e4c50d6e13abae6f474


### Log:
- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/292) addressed
### Comments:
**[0xBrian commented](https://github.com/code-423n4/2021-04-vader-findings/issues/292#issuecomment-837895864):**
 > https://github.com/vetherasset/vaderprotocol-contracts/commit/30292da1c71654d32e888ca8d0404a7b56496b7a


## [[G-24] Unused and Unnecessary code](https://github.com/code-423n4/2021-04-vader-findings/issues/312)

Here you have more information: https://gist.github.com/alexon1234/4e2686497af9febae1cbc4266ad76f55


## [[G-25] Some  unused code](https://github.com/code-423n4/2021-04-vader-findings/issues/17)

#There is some unused / redundant code present.

Router.sol defines repayDelay but it is never used
Vault.sol initializes POOLS twice, with the same value.

Router.sol: uint public repayDelay = 3600;

Vault.sol:
 function init(address _vader, address _usdv, address _router, ...
..
        POOLS = _pool;
..  
        POOLS = _pool;
  

#undefinedEditor

#undefined
Remove redundant code


### Log:
- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/17) addressed
### Comments:
**[0xBrian commented](https://github.com/code-423n4/2021-04-vader-findings/issues/17#issuecomment-837776681):**
 > https://github.com/vetherasset/vaderprotocol-contracts/commit/f6b6a369f64e5ade0b7511d397d708a9a0916178


## [[G-26] sortArray optimizable](https://github.com/code-423n4/2021-04-vader-findings/issues/19)

#The function sortArray is only called by getAnchorPrice() in Router.sol
Then it is only used to get the second element of the sorted array.
With this knowledge it is possible to write a function that is more efficient.
Sort functions are relative expensive functions.

Router.sol:
    function getAnchorPrice() public view returns (uint anchorPrice) {
....    
   uint[] memory _sortedAnchorFeed = iUTILS(UTILS()).sortArray(arrayPrices);  
   anchorPrice = _sortedAnchorFeed[2];                         
   
#undefined
#undefined
Make a partial sort function that only returns the required value



### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/19#issuecomment-826909934):**
 > Do you have an example of how to make it better? It's already pretty good for what it does


## [[G-27] Result of ERC20 transfer not checked](https://github.com/code-423n4/2021-04-vader-findings/issues/22)

#The function transferOut of Pools.sol contains a iERC20(_token).transfer where the result of the function isn't checked.
This could result in transfers that don't succeed are undetected.

Pools.sol:
  function transferOut(address _token, uint _amount, address _recipient) internal {
        if(_token == VADER){
            pooledVADER = pooledVADER - _amount; // Accounting
        } else if(_token == USDV) {
            pooledUSDV = pooledUSDV - _amount;  // Accounting
        }
        if(_recipient != address(this)){
            iERC20(_token).transfer(_recipient, _amount);
        }
    }

#undefinedEditor

#undefined
Add a require statement to check the result:
require(...transfer(...) ) 


### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/22) sponsor acknowledged- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/22) addressed
### Comments:
**[0xBrian commented](https://github.com/code-423n4/2021-04-vader-findings/issues/22#issuecomment-837891223):**
 > https://github.com/vetherasset/vaderprotocol-contracts/commit/ffdcbeb3611cc94f89e6fed14533b25072cece76


## [[G-28] Optimization possible at _transfer](https://github.com/code-423n4/2021-04-vader-findings/issues/26)

#The function _transfer of Vether.sol contains are relative complicated statement to determine if an emit should be done for the _fee.
This could be simplified, which saves a bit of gas and is also easier to read

    function _transfer(address _from, address _to, uint _value) private {
        require(_balances[_from] >= _value, 'Must not send more than balance');
        require(_balances[_to] + _value >= _balances[_to], 'Balance overflow');
        _balances[_from] =_balances[_from].sub(_value);
        uint _fee = _getFee(_from, _to, _value);                                            // Get fee amount
        _balances[_to] += (_value.sub(_fee));                                               // Add to receiver
        _balances[address(this)] += _fee;                                                   // Add fee to self
        totalFees += _fee;                                                                  // Track fees collected
        emit Transfer(_from, _to, (_value.sub(_fee)));                                      // Transfer event
        if (!mapAddress_Excluded[_from] && !mapAddress_Excluded[_to]) {
            emit Transfer(_from, address(this), _fee);                                      // Fee Transfer event
        }
    }
#undefinedEditor

#undefined
if (!mapAddress_Excluded[_from] && !mapAddress_Excluded[_to]) {
can be replaced with:
if (_fee > 0) {



### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/26) sponsor disputed
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/26#issuecomment-826859015):**
 > Vether is deployed code and can't be changed


## [[G-29] Pay double fees in addExcluded of Vether.sol](https://github.com/code-423n4/2021-04-vader-findings/issues/28)

#In the function addExcluded of Vether.sol (https://etherscan.io/address/0x4Ba6dDd7b89ed838FEd25d208D4f644106E34279#code)
a call is made to _transfer to pay a fee of 128 Vether, however to do that _transfer you have to pay an additional fee of 0.128 Vether.
Right after this call mapAddress_Excluded is set, which prevents paying fees.
It seems logical to just pay fees once.

    function addExcluded(address excluded) external {    
        if(!mapAddress_Excluded[excluded]){
            _transfer(msg.sender, address(this), mapEra_Emission[1]/16);                    // Pay fee of 128 Vether
            mapAddress_Excluded[excluded] = true;                                           // Add desired address
            excludedArray.push(excluded); excludedCount +=1;                                // Record details
            totalFees += mapEra_Emission[1]/16;                                             // Record fees
        }              
    }
#undefinedEditor

#undefined
Check if the conclusions are sound.
Then do the mapAddress_Excluded[excluded] = true; ...
before the _transfer


### Log:
- [strictly-scarce labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/28) sponsor disputed
### Comments:
**[strictly-scarce commented](https://github.com/code-423n4/2021-04-vader-findings/issues/28#issuecomment-826857075):**
 > Vether is deployed code and can't be changed


## [[G-31] Gas Optimization: Remove Overflow Check in Vether.sol Since Solidity 0.8.x Disallows Implicit Overflows](https://github.com/code-423n4/2021-04-vader-findings/issues/190)

This check is unnecessary since Solidity 0.8.x prevents overflows:
require(_balances[_to] + _value >= _balances[_to], 'Balance overflow');

#undefined
Remove the aforementioned line of code, since Vether.sol uses Solidity 0.8.x, so it will revert on an overflow anyways.


## [[G-32] Gas Optimization: Avoid Unnecessary Expensive SSTORE Calls In Vether.sol By Checking If _fee Is Non-Zero](https://github.com/code-423n4/2021-04-vader-findings/issues/191)

Avoid Unnecessary Expensive SSTORE Calls In Vether.sol By Checking If _fee Is Non-Zero

SSTORE calls (writes to storage) are very expensive, especially for cold-storage slots (those that have not yet been accessed this transaction).
We know that the SSTORE call to totalFees will be a cold storage call, since this is the only place in the whole contract that totalFees is used.
Vether.sol makes two SSTORE calls in _transfer that are unnecessary when _fee is zero.
It will be common for _fee to be zero, since Vether.sol implements an "excluded addresses" list (mapAddress_Excluded), where _fee is zero when either the sender or the recipient is on the excludedAddresses list.
Currently, anyone can add themselves to the excludedAddresses list, but that is probably a mistake. 
Nevertheless, since it will probably at least include Uniswap, we should add a check for whether _fee is zero.

When _fee is zero, Vether._transfer() nevertheless makes these two unnecessary SSTORE calls:

_balances[address(this)] += _fee;
totalFees += _fee;

#undefined

Change this:

_balances[address(this)] += _fee;
totalFees += _fee;

To this:

if(_fee > 0){
  _balances[address(this)] += _fee;
  totalFees += _fee;
}




### Log:
- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/191) addressed
### Comments:
**[0xBrian commented](https://github.com/code-423n4/2021-04-vader-findings/issues/191#issuecomment-837906002):**
 > https://github.com/vetherasset/vaderprotocol-contracts/commit/6c41375e93fa3e2bae8196ede515ed432009682d#diff-596b5895e88a345f6d2f4bcd2f0bef672cc430a333111d0b00d140514f5edb16


## [[G-33] Gas Optimization: Vader.sol Unnecessary Conditional](https://github.com/code-423n4/2021-04-vader-findings/issues/197)

Gas Optimization: Vader.sol Unnecessary Conditional

You can remove this conditional entirely.



In Vader.sol, change this:

if(emitting){
        emitting = false;
    } else {
        emitting = true;
    }

To this:

emitting = !emitting;


### Log:
- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/197) addressed
### Comments:
**[0xBrian commented](https://github.com/code-423n4/2021-04-vader-findings/issues/197#issuecomment-837908335):**
 > https://github.com/vetherasset/vaderprotocol-contracts/commit/b98b6358f1d8b7730d3fe767e01d49ca63d830e9#diff-f5afe9240d284bf89e33b79c68c1ab21a6c18323c11d480d25144c18b8a9373a


## [[G-34] Gas Optimization: Utils.sol Make An Unnecessary Multiplication And Division By An Identical Value](https://github.com/code-423n4/2021-04-vader-findings/issues/199)

Gas Optimization: Utils.sol Make An Unnecessary Multiplication And Division By An Identical Value

The value "(T1 * B1) / T1" is identical to the value "B1", so you can simplify the expression "B1 + (T1 * B1) / T1" to "B1 + B1".



In Utils.sol, replace this:

uint _redemptionValue = B1 + (T1 * B1) / T1; 

With this:

uint _redemptionValue = B1 + B1;


### Log:
- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/199) addressed
### Comments:
**[0xBrian commented](https://github.com/code-423n4/2021-04-vader-findings/issues/199#issuecomment-837948221):**
 > https://github.com/vetherasset/vaderprotocol-contracts/pull/164/commits/1fb07632dc4f1252d769566a4353607130604283


## [[G-35] Gas Optimization: DAO.sol Unnecessary Multiple Return Statements](https://github.com/code-423n4/2021-04-vader-findings/issues/200)

#Gas Optimization: DAO.sol Unnecessary Multiple Return Statements



In DAO.sol, replace this:

if(votes > consensus){
    return true;
} else {
    return false;
}

With this:

return (votes > consensus)


### Log:
- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/200) addressed
### Comments:
**[0xBrian commented](https://github.com/code-423n4/2021-04-vader-findings/issues/200#issuecomment-837949271):**
 > https://github.com/vetherasset/vaderprotocol-contracts/commit/6bbdab961f83d0479c0417dbf522567fa184bee7


## [[G-36] Extra useless steps to calculate pooledVADER and pooledUSDV ](https://github.com/code-423n4/2021-04-vader-findings/issues/287)

#Here are some useless calculations:
	 if(_token == VADER && _pool != VADER){  // Want to know added VADER
	    addedAmount = _balance - pooledVADER;
	    pooledVADER = pooledVADER + addedAmount;
	} else if(_token == USDV) {             // Want to know added USDV
	    addedAmount = _balance - pooledUSDV;
	    pooledUSDV = pooledUSDV + addedAmount;
if you do the simple maths, it is always in the first case, pooledVADER = _balance, in the second case pooledUSDV = _balance.



### Log:
- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/287) addressed
### Comments:
**[0xBrian commented](https://github.com/code-423n4/2021-04-vader-findings/issues/287#issuecomment-837895042):**
 > https://github.com/vetherasset/vaderprotocol-contracts/commit/ff278607361bf0923ec4c8eb0be3928b86acfb9c


## [[G-37] variable == false -> !variable](https://github.com/code-423n4/2021-04-vader-findings/issues/288)

#a bit cheapier when you replace:
  require(inited == false);
with:
  require(!inited);
same with variable == true.


### Log:
- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/288) addressed
### Comments:
**[0xBrian commented](https://github.com/code-423n4/2021-04-vader-findings/issues/288#issuecomment-837876433):**
 > At some point we got rid of all comparisons with boolean literals.


## [[G-38] Extract mappings to a common struct](https://github.com/code-423n4/2021-04-vader-findings/issues/289)

#Mappings are expensive. All PID related variables could be extracted to a struct:
	mapping(uint => GrantDetails) public mapPID_grant;
	mapping(uint => address) public mapPID_address;
	mapping(uint => string) public mapPID_type;
	mapping(uint => uint) public mapPID_votes;
	mapping(uint => uint) public mapPID_timeStart;
	mapping(uint => bool) public mapPID_finalising;
	mapping(uint => bool) public mapPID_finalised;
	mapping(uint => mapping(address => uint)) public mapPIDMember_votes;
By the way, mapPID_finalised is set but not used anywhere.



### Comments:
**[0xBrian commented](https://github.com/code-423n4/2021-04-vader-findings/issues/289#issuecomment-837781583):**
 > Unused `mapPID_finalised` addressed https://github.com/vetherasset/vaderprotocol-contracts/commit/6f961e6cd159e905ef53a5a067f956d21f8a46ee

**[dmvt commented](https://github.com/code-423n4/2021-04-vader-findings/issues/289#issuecomment-845424507):**
 > @0xBrian note that this was not addressed by the link provided

**[0xBrian commented](https://github.com/code-423n4/2021-04-vader-findings/issues/289#issuecomment-845641580):**
 > @dmvt Sorry, I only meant to note that the `mapPID_finalised` issue was addressed. The other issue about saving gas by extracting to a struct, whatever that means, still remains to be considered.


## [[G-39] Cache duplicate calls or storage access](https://github.com/code-423n4/2021-04-vader-findings/issues/291)

#There are several duplicate calls or storage access that can be cached. For example, here, iSYNTH(_synth).TOKEN() is called twice:
	uint _weight = iUTILS(UTILS()).calcValueInBase(iSYNTH(_synth).TOKEN(), _amount);
	if(iPOOLS(POOLS).isAnchor(iSYNTH(_synth).TOKEN())
or here it calculates _value.sub(_fee) twice:
    // Get fee amount
    _balances[_to] += (_value.sub(_fee));
   	...
    emit Transfer(_from, _to, (_value.sub(_fee)));
or:
	uint _synthUnits = iUTILS(UTILS()).calcSynthUnits(_actualInputBase, mapToken_baseAmount[token], mapToken_Units[token]);     // Get Units
    outputAmount = iUTILS(UTILS()).calcSwapOutput(_actualInputBase, mapToken_baseAmount[token], mapToken_tokenAmount[token]);   // Get output



## [[G-40] Fee on transfer conditions](https://github.com/code-423n4/2021-04-vader-findings/issues/293)

#Could save some gas on every transfer if storage access of mapAddress_Excluded is replaced here:
   if (!mapAddress_Excluded[_from] && !mapAddress_Excluded[_to])
with:
	if (_fee > 0)
then inside this if block you can also include this sentence:
    totalFees += _fee;
also the initialization of totalFees is useless as it automatically gets assigned a default value of 0:
	totalFees = 0;


## [[G-42] Not needed check for uint > 0](https://github.com/code-423n4/2021-04-vader-findings/issues/256)

#The following functions check that an uint > 0 but it's always true.

https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Utils.sol#L278
https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Utils.sol#L197
https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Vader.sol#L127

#undefinedManual analysis

#undefined
Remove the checks.


### Log:
- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/256) addressed- [dmvt labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/256) duplicate
### Comments:
**[0xBrian commented](https://github.com/code-423n4/2021-04-vader-findings/issues/256#issuecomment-832404679):**
 > Two of those really were tautologies. Checking `uint >= 0` really is needless. But checking `uint > 0` is OK.

**[0xBrian commented](https://github.com/code-423n4/2021-04-vader-findings/issues/256#issuecomment-837880000):**
 > At some point we got rid of all the `uint >= 0` tautological checks.


## [[G-43] You don't need to recalculate exclusion fee every time](https://github.com/code-423n4/2021-04-vader-findings/issues/302)

#if you calculate the exclusion fee only once and store it in a variable, gas costs will be reduced:
	mapEra_Emission[1] / 16
event better, as mapEra_Emission[1] is set initially in the constructor, this fee amount could also be calculated in the constructor and stored in a constant variable as it never changes. even comment says "Pay fee of 128 Vether". Same here:
   uint maxEmissions = (upgradeHeight - 1) * mapEra_Emission[1];


## [[G-44] token == arrayAnchors[i]](https://github.com/code-423n4/2021-04-vader-findings/issues/303)

#In function updateAnchorPrice here 'arrayAnchors[i]' can be replaced with 'token' to eliminate one expensive storage access:
   arrayPrices[i] = iUTILS(UTILS()).calcValueInBase(arrayAnchors[i], one);


### Log:
- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/303) addressed
### Comments:
**[0xBrian commented](https://github.com/code-423n4/2021-04-vader-findings/issues/303#issuecomment-837899476):**
 > https://github.com/vetherasset/vaderprotocol-contracts/commit/30292da1c71654d32e888ca8d0404a7b56496b7a


## [[G-45] Gas improvement](https://github.com/code-423n4/2021-04-vader-findings/issues/253)

#The function getSynth(token) in the following functions is called multiple times instead of saving the result.

https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Pools.sol#L143
https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Pools.sol#L155
https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Pools.sol#L167

#undefinedManual analysis

#undefined
Save the result.


## [[G-46] Function can be simplified](https://github.com/code-423n4/2021-04-vader-findings/issues/263)

#The following function is unnecessarily complicated.

https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/USDV.sol#L195

#undefinedManual analysis

#undefined
The token argument can be omitted due to the fact the function is internal and only called with VADER.
The outer if can be omitted.



## [[G-47] Function can be simplified](https://github.com/code-423n4/2021-04-vader-findings/issues/301)

#voteProposal can be simplified,

https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/DAO.sol#L83

#undefinedManual analysis

#undefined
if(hasMajority(proposalID) && (isEqual(_type, 'DAO') || isEqual(_type, 'UTILS') || isEqual(_type, 'REWARD')))
check the condition on line 84 in the outer if.


## [[G-48] Unnecessary `else if` statement in `swapWithSynthsWithLimit`](https://github.com/code-423n4/2021-04-vader-findings/issues/319)

In `Router.sol`, the second `else if` statement in the function `swapWithSynthsWithLimit` is unnecessary.


Referenced code:
[Router.sol#L162](https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Router.sol#L162)

#undefined
None

#undefined

Consider using `else {...}`, which has the identical behavior to save gas.


### Log:
- [0xBrian labeled](https://github.com/code-423n4/2021-04-vader-findings/issues/319) addressed
### Comments:
**[0xBrian commented](https://github.com/code-423n4/2021-04-vader-findings/issues/319#issuecomment-837810856):**
 > https://github.com/vetherasset/vaderprotocol-contracts/commit/dd4ac300bcec8c1f2fd88b9b4809ce285ed101e0#diff-9dbb8dad80202557b41e378168876747e77f53fa5a17bf48959fe97fd41913ddR219


## [[G-49] Unnecessary function calls in `addLiquidity`](https://github.com/code-423n4/2021-04-vader-findings/issues/320)

In `Pools.sol`, the `addLiquidity` function includes unnecessary function calls, which are `isAnchor` and `isAsset`. Since the two functions are defined as `public view`, and are compiled into calls at the bytecode level.


Referenced code:
[Pools.sol#L58](https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Pools.sol#L58)
[Pools.sol#L63](https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Pools.sol#L63)
[Pools.sol#L218-L222](https://github.com/code-423n4/2021-04-vader/blob/main/vader-protocol/contracts/Pools.sol#L218-L222)

#undefined
None

#undefined

Consider changing to `_isAnchor[token]` and `_isAsset[token]` to save gas on calling funtions.



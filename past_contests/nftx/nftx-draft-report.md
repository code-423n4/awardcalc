# High Risk Findings
## [[H-01] Missing overflow check in `flashLoan`](https://github.com/code-423n4/2021-05-nftx-findings/issues/43)
undefinedVulnerability Details

`ERC20FlashMintUpgradeable.flashLoan` does not check for an overflow when adding the fees to the flashloan amount.
The functionality might have been copied from https://eips.ethereum.org/EIPS/eip-3156 but this one already has overflow checks as it uses solidity 0.8.0.


This leads to an issue where the attacker does not need to pay back the flashloan as they will burn 0 tokens:

```solidity
_burn(address(receiver), amount + fee);
```

They end up with a huge profit.

> Luckily, this is currently not exploitable as the fee is set to 0 so there's no possibility to overflow. However, if governance decides to change the flashloan fee, flashloans can be taken without having to repay them.





Use SafeMath.


### Log:
- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/43) Confirmed- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/43) duplicate
### Comments:
**[0xKiwi commented](https://github.com/code-423n4/2021-05-nftx-findings/issues/43#issuecomment-845566980):**
 > Upgraded to 0.8.x.


## [[H-02] `distribute` DoS on missing `receiveRewards` implementation](https://github.com/code-423n4/2021-05-nftx-findings/issues/46)
undefinedVulnerability Details

`NFTXEligiblityManager._sendForReceiver` should check `returnData.length == 1` before decoding, otherwise if it returns no return data, the `abi.decode` call and with it the whole `distribute` function will revert.

A single badly implemented `feeReceiver` can break the whole `distribute` function and do a denial of service by reverting the transaction.



Change to: `bool tokensReceived = returnData.length == 1 && abi.decode(returnData, (bool));`.


### Log:
- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/46) Confirmed- [cemozerr labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/46) 1 (Low Risk)- [cemozerr labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/46) 3 (High Risk)
### Comments:
**[cemozerr commented](https://github.com/code-423n4/2021-05-nftx-findings/issues/46#issuecomment-848259748):**
 > Marking this as high risk because one nefarious feeReceiver can in fact deny other users to receive their fees


## [[H-03] `getRandomTokenIdFromFund` yields wrong probabilities for ERC1155](https://github.com/code-423n4/2021-05-nftx-findings/issues/56)
undefinedVulnerability Details

`NFTXVaultUpgradeable.getRandomTokenIdFromFund` does not work with ERC1155 as it does not take the deposited `quantity1155` into account. 

Assume `tokenId0` has a count of 100, and `tokenId1` has a count of 1.
Then `getRandomId` would have a pseudo-random 1:1 chance for token 0 and 1 when in reality it should be 100:1.

This might make it easier for an attacker to redeem more valuable NFTs as the probabilities are off.



Take the quantities of each token into account (`quantity1155`) which probably requires a design change as it's currently hard to do without iterating over all tokens.



### Log:
- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/56) 2 (Med Risk)- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/56) Acknowledged- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/56) duplicate- [cemozerr labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/56) 3 (High Risk)
### Comments:
**[cemozerr commented](https://github.com/code-423n4/2021-05-nftx-findings/issues/56#issuecomment-848266608):**
 > Marking this as high risk as an attacker can weed out high-value NFTs from a vault putting other users funds at risk


## [[] NFTXLPStaking Is Subject To A Flash Loan Attack That Can Steal Nearly All Rewards/Fees That Have Accrued For A Particular Vault](https://github.com/code-423n4/2021-05-nftx-findings/issues/88)

NFTXLPStaking Is Subject To A Flash Loan Attack That Can Steal Nearly All Rewards/Fees That Have Accrued For A Particular Vault

The LPStaking contract does not require that a stake be locked for any period of time.

The LPStaking contract also does not track how long your stake has been locked.

So an attacker Alice can stake, claim rewards, and unstake, all in one transaction.

If Alice utilizes a flash loan, then she can claim nearly all of the rewards for herself, leaving very little left for the legitimate stakers.

The fact that the NFTXVaultUpgradeable contract contains a native flashLoan function makes this attack that much easier, although it would still be possible even without that due to flashloans on Uniswap, or wherever else the nftX token is found.

Since a flash loan will easily dwarf all of the legitimate stakers' size of stake, the contract will erroneously award nearly all of the rewards to Alice.


(1) Wait until an NFTX vault has accrued any significant amount of fees/rewards
(2) FlashLoanBorrow a lot of ETH using any generic flash loan provider
(3) FlashLoanBorrow a lot of nftx-vault-token using NFTXVaultUpgradeable.flashLoan()
(4) Deposit the ETH and nftx-vault-token's into Uniswap for Uniswap LP tokens by calling Uniswap.addLiquidity()
(5) Stake the Uniswap LP tokens in NFTXLPStaking by calling NFTXLPStaking.deposit()
(6) Claim nearly all of the rewards that have accrued for this vault due to how large the flashLoaned deposit is relative to all of the legitimate stakes by calling NFTXLPStaking.claimRewards()
(7) Remove LP tokens from NFTXLPStaking by calling NFTXLPStaking.exit();
(8) Withdraw ETH and nftx-vault-token's by calling Uniswap.removeLiquidity();
(9) Pay back nftx-vault-token flash loan
(10) Pay back ETH flash loan

Here is an example contract that roughly implements these steps in pseudocode:

contract AliceAttackContract {


    bytes32 constant private NFTX_FLASH_LOAN_RETURN_VALUE = keccak256("ERC3156FlashBorrower.onFlashLoan");


    uint256 largeAmountOfEther = 10_000 ether;


    uint256 targetVaultId;


    address targetVaultAddress;


    // attackVaultWithId calls onEthFlashLoan(), which subsequently calls NFTX's onFlashLoan() (flashloans use a callback structure in order to revert if the flash loan is not paid back).

    function attackVaultWithId(uint256 vaultId, address vaultAddress) external {

        targetVaultId = vaultId;
        targetVaultAddress = vaultAddress;

        EthFlashLoanProvider.borrowFlashLoan(largeAmountOfEther); /* this calls onEthFlashLoan() in between mint and burn */

    }


    // onEthFlashLoan is called by the line EthFlashLoanProvider.borrowFlashLoan() in attackVaultWithId() (flashloans use a callback structure in order to revert if the flash loan is not paid back).

    function onEthFlashLoan(...) external {

        NFTXVaultUpgradeable(vaultAddress).flashLoan( /* this calls onFlashLoan() in between mint and burn */
            address(this),
            vaultAddress,
            NFTXVaultUpgradeable(vaultAddress).maxFlashLoan(vaultAddress),
            ''
        );

    }

    // onFlashLoan is called by the line NFTXVaultUpgradeable.flashLoan() in onEthFlashLoan() (flashloans use a callback structure in order to revert if the flash loan is not paid back).
    function onFlashLoan(address sender, address token, uint256 amount, uint256 fee, bytes data) external {

        UniswapRouter(uniswapRouterAddress).addLiquidity(token, etherAddress, amount, ...);

        uint256 lpTokenBalance = ERC20(uniswapLPAddress).balanceOf(address(this));
        ERC20(token).approve(nftxLpStakingAddress, lpTokenBalance);
        NFTXLPStaking(nftxLpStakingAddress).deposit(targetVaultId, lpTokenBalance);

        NFTXLPStaking(nftxLpStakingAddress).claimRewards(targetVaultId);

        NFTXLPStaking(nftxLpStakingAddress).exit(targetVaultId);

        UniswapRouter(uniswapRouterAddress).removeLiquidity(token, etherAddress, amount, ...);

        return NFTX_FLASH_LOAN_RETURN_VALUE;
    }

}


#undefined

Require that staked LP tokens be staked for a particular period of time before they can be removed. Although a very short time frame (a few blocks) would avoid flash loan attacks, this attack could still be performed over the course of a few blocks less efficiently. Ideally, you would want the rewards to reflect the product of the amount staked and the duration that they've been staked, as well as having a minimum time staked.

Alternatively, if you really want to allow people to have the ability to remove their stake immediately, then only allow rewards to be claimed for stakes that have been staked for a certain period of time. Users would still be able to remove their LP tokens, but they could no longer siphon off rewards immediately.



### Log:
- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/88) Disputed
### Comments:
**[0xKiwi commented](https://github.com/code-423n4/2021-05-nftx-findings/issues/88#issuecomment-845695223):**
 > After looking at the code, this is not possible. The dividend token code takes into consideration the current unclaimed rewards and when a deposit is made that value is deducted.  

**[cemozerr commented](https://github.com/code-423n4/2021-05-nftx-findings/issues/88#issuecomment-848325710):**
 > @0xKiwi do you mind showing where in code that occurs?


 
# Medium Risk Findings
## [[M-01] Randomization of NFTs returned in redeem/swap operations can be brute-forced](https://github.com/code-423n4/2021-05-nftx-findings/issues/78)

If we assume that certain NFTs in a vault over time will have different market demand/price then the users will try to redeem those specific NFTs. Even if direct redeems are disabled to prevent such a scenario to default to returning randomized NFTs, a user can brute-forced this on-chain randomization (using nonce + blockhash) by repeatedly trying to redeem/swap from a contract, checking the NFT IDs returned from the function and reverting the transaction if those are not the NFT IDs of specific interest.

The impact will be a subversion of the randomization goal to return random NFTs which cannot be specified by the user.

A similar exploit happened recently with Meebit NFTs https://twitter.com/sillytuna/status/1391013965170454540



https://github.com/code-423n4/2021-05-nftx/blob/f6d793c136d110774de259d9f3b25d003c4f8098/nftx-protocol-v2/contracts/solidity/NFTXVaultUpgradeable.sol#L376

https://github.com/code-423n4/2021-05-nftx/blob/f6d793c136d110774de259d9f3b25d003c4f8098/nftx-protocol-v2/contracts/solidity/NFTXVaultUpgradeable.sol#L413-L427


#undefined
Manual Analysis

#undefined

Consider onlyEOA for redeem/swap operations to prevent brute-forcing via contracts. Alternatively, make the user commit to pseudo-random IDs before revealing them.


### Log:
- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/78) Acknowledged
## [[M-02] Use safeTransfer/safeTransferFrom consistently instead of transfer/transferFrom](https://github.com/code-423n4/2021-05-nftx-findings/issues/79)

It is good to add a require() statement that checks the return value of token transfers or to use something like OpenZeppelin’s safeTransfer/safeTransferFrom unless one is sure the given token reverts in case of a failure. Failure to do so will cause silent failures of transfers and affect token accounting in contract.

While most places use a require or safeTransfer/safeTransferFrom, there are three missing cases in the withdrawal of staking token and rescue of arbitrary tokens sent to the FeeDistributor contract.

Reference this similar medium-severity finding from Consensys Diligence Audit of Fei Protocol: https://consensys.net/diligence/audits/2021/01/fei-protocol/#unchecked-return-value-for-iweth-transfer-call



https://github.com/code-423n4/2021-05-nftx/blob/f6d793c136d110774de259d9f3b25d003c4f8098/nftx-protocol-v2/contracts/solidity/NFTXLPStaking.sol#L188

https://github.com/code-423n4/2021-05-nftx/blob/f6d793c136d110774de259d9f3b25d003c4f8098/nftx-protocol-v2/contracts/solidity/NFTXFeeDistributor.sol#L45

https://github.com/code-423n4/2021-05-nftx/blob/f6d793c136d110774de259d9f3b25d003c4f8098/nftx-protocol-v2/contracts/solidity/NFTXFeeDistributor.sol#L143


#undefined
Manual Analysis

#undefined

Consider using safeTransfer/safeTransferFrom or require() consistently.


### Log:
- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/79) Confirmed
## [[M-03] Fee Distribution Re-Entrancy](https://github.com/code-423n4/2021-05-nftx-findings/issues/11)

The `distribute` function of `NFTXFeeDistributor` has no access control and will invoke a fallback on the fee receivers, meaning that a fee receiver can re-enter via this function to acquire their allocation repeatedly potentially draining the full balance and sending zero amounts to the rest of the recipients.


A smart contract with a malicious `receiveRewards` function can re-enter the `distribute` function with the same vault ID thereby causing the exploit.

#undefined
Manual review.

#undefined

Re-entrancy protection should be incorporated into the `distribute` function. I should note that a seemingly innocuous contract can cause this re-entrancy by simply asking the owners of the project to include an upgrade-able contract that is then replaced for a malicious implementation.


### Log:
- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/11) Confirmed
## [[M-05] Unbounded iteration in `NFTXEligiblityManager.distribute` over `_feeReceivers`](https://github.com/code-423n4/2021-05-nftx-findings/issues/47)
undefinedVulnerability Details

`NFTXEligiblityManager.distribute` iterates over all `_feeReceivers`.

If the number of `_feeReceivers` gets too big, the transaction's gas cost could exceed the block gas limit and make it impossible to call `distribute` at all.



Keep the number of `_feeReceivers` small.



### Log:
- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/47) Acknowledged
## [[M-06] Manager can grief with fees](https://github.com/code-423n4/2021-05-nftx-findings/issues/51)
undefinedVulnerability Details

The fees in `NFTXVaultUpgradeable` can be set arbitrarily high (no restriction in `setFees`).

The manager can frontrun mints and set a huge fee (for example `fee = base`) which transfers user's NFTs to the vault but doesn't mint any pool share tokens in return for the user.

Similar griefing attacks are also possible with other functions besides `mint`.




Check for a max fee as a percentage of `base` (like 10%) whenever setting fees.



## [[M-07] Tokens can get stuck in `NFTXMintRequestEligibility`](https://github.com/code-423n4/2021-05-nftx-findings/issues/59)
undefinedVulnerability Details

When dealing with ERC721 (instead of 1155) the amounts array is ignored, which leads to an issue.

User can call `NFTXMintRequestEligibility.requestMint` for an ERC721 with `amounts[i] = 0`.
The `ERC721.transferFrom` is still executed but user cannot `reclaimRequestedMint` later and the NFT is stuck as it checks (`amounts[i] > 0`).


Tokens can get stuck.
Also, subscribers to `Request` event could be tricked by specifying `amounts[i] > 1` in the ERC721 case, as only one token was transferred but the amount multiple quantities get logged.



`requestMint`: Check `amounts[i] == 1` in ERC721 case, `amounts[i] > 0` in 1155 case.



### Log:
- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/59) Confirmed
## [[M-08] A malicious receiver can cause another receiver to lose out on distributed fees by returning `false` for `tokensReceived` when receiveRewards is called on their receiver contract.](https://github.com/code-423n4/2021-05-nftx-findings/issues/69)
undefinedVulnerability Details
A malicious receiver can cause another receiver to lose out on distributed fees by returning `false` for `tokensReceived` when receiveRewards is called on their receiver contract. This causes the fee distributor to double spend the `amountToSend` because the contract incorrectly assumes the returned data is truthful.

NFTXFeeDistributor.sol
```
Line 163: (bool success, bytes memory returnData) = address(_receiver.receiver).call(payload);
```

#Any subsequent receivers not receiving funds

Manual Code Review

#undefined
Don't trust return data from externally called contracts. Only utilize whether the transaction succeeds to determine if the treasury fallback should be called.
```
Line 165: if (!success) {
```


### Log:
- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/69) Confirmed
### Comments:
**[0xKiwi commented](https://github.com/code-423n4/2021-05-nftx-findings/issues/69#issuecomment-845681145):**
 > Nice catch!


## [[M-09] The direct redeem fee can be circumvented](https://github.com/code-423n4/2021-05-nftx-findings/issues/71)
undefinedVulnerability Details
Since the random NFT is determined in the same transaction a payment or swap is being executed, a malicious actor can revert a transaction if they did not get the NFT they wanted. Combined with utilizing Flashbots miners which do not publish transactions which revert with FlashbotsCheckAndSend, there would be no cost to constantly attempting this every block or after the nonce is updated from getPseudoRand().

NFTXVaultUpgradeable.sol
```
Line 374: uint256 tokenId = i < specificIds.length
                ? specificIds[i]
                : getRandomTokenIdFromFund();
```

#The directReedemFee can be avoided and users lose on potential earnings.

Transfer ownership of ERC20 tokens to attack contract
```
function revertIfNotSpecifiedID(uint256 targetTokenID) public {
    NFTXVaultUpgradeable vault = NFTXVaultUpgradeable(_vault);
    uint256[] resultID = vault.redeem(1,[]);
    require(resultID[0] == targetTokenID);
}
```

#undefinedManual Code Review

#undefined
Use a commit-reveal pattern for NFT swaps and redemptions



### Log:
- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/71) 1 (Low Risk)- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/71) Acknowledged- [cemozerr labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/71) 2 (Med Risk)
### Comments:
**[cemozerr commented](https://github.com/code-423n4/2021-05-nftx-findings/issues/71#issuecomment-848321831):**
 > Leaving this as medium risk as it puts user earnings into risk


 
# Low Risk Findings
## [[L-01] Front-running setFees() could avoid fees](https://github.com/code-423n4/2021-05-nftx-findings/issues/72)

setVaultFeatures() and setFees() are two separate privileged functions. Users could front-run setFees() immediately after vault is enabled in setVaultFeatures() to mint (and possibly redeem/directRedeem/swap) many tokens. The fees for mint/redeem/directRedeem/swap are not initialized so are 0 by default. This leads to loss of fee revenue.


https://github.com/code-423n4/2021-05-nftx/blob/f6d793c136d110774de259d9f3b25d003c4f8098/nftx-protocol-v2/contracts/solidity/NFTXVaultUpgradeable.sol#L45-L48

https://github.com/code-423n4/2021-05-nftx/blob/f6d793c136d110774de259d9f3b25d003c4f8098/nftx-protocol-v2/contracts/solidity/NFTXVaultUpgradeable.sol#L141-L158

https://github.com/code-423n4/2021-05-nftx/blob/f6d793c136d110774de259d9f3b25d003c4f8098/nftx-protocol-v2/contracts/solidity/NFTXVaultUpgradeable.sol#L123-L139

#undefined
Manual Analysis

#undefined

Set defaults at initialization or combine this with setVaultFeatures() for atomically enabling functions and setting their fees in the same transaction.


### Log:
- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/72) Confirmed
## [[L-04] Missing pool existence check in balanceOf](https://github.com/code-423n4/2021-05-nftx-findings/issues/80)

In NFTXLPStaking.sol, deposit(), exit(), withdraw(), claimRewards() and other related functions that take a vaultID as parameter perform a pool existence check on the staking pool associated with that vaultID. However, balanceOf is missing a similar pool check.

This may result in returning an invalid balance of a non-existing or stale pool.



Missing check: https://github.com/code-423n4/2021-05-nftx/blob/f6d793c136d110774de259d9f3b25d003c4f8098/nftx-protocol-v2/contracts/solidity/NFTXLPStaking.sol#L168-L172

Checks: https://github.com/code-423n4/2021-05-nftx/blob/f6d793c136d110774de259d9f3b25d003c4f8098/nftx-protocol-v2/contracts/solidity/NFTXLPStaking.sol#L117

https://github.com/code-423n4/2021-05-nftx/blob/f6d793c136d110774de259d9f3b25d003c4f8098/nftx-protocol-v2/contracts/solidity/NFTXLPStaking.sol#L144


#undefined
Manual Analysis

#undefined

Add check require(pool.stakingToken != address(0), "LPStaking: Nonexistent pool”); before L170.


### Log:
- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/80) Confirmed
## [[L-05] Missing parameter validation](https://github.com/code-423n4/2021-05-nftx-findings/issues/44)
undefinedVulnerability Details

Missing parameter validation for functions:
- `NFTXEligiblityManager.addModule, updateModule`
- `NFTXFeeDistributor` all `setter` functions (`setTreasuryAddress`, ...)
- `NFTXVaultUpgradeable.setManager`

Some wallets still default to zero addresses for a missing input which can lead to breaking critical functionality like setting the manager to the zero address and being locked out.



Validate the parameters.


### Log:
- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/44) Confirmed
## [[L-06] Missing usage of SafeMath](https://github.com/code-423n4/2021-05-nftx-findings/issues/45)
undefinedVulnerability Details

The following code does not use SafeMath and can potentially lead to overflows:
- `NFTXFeeDistributor.distribute`
- `NFTXFeeDistributor._sendForReceiver`

While looping through all `_feeReceivers` it could be that a broken vault was whitelisted that allows an attacker to perform an external call and break the invariant that always 1000 tokens are left in the contract.



Add SafeMath to `_sendForReceiver` even though one would expect the math to be safe.


### Log:
- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/45) Confirmed
### Comments:
**[0xKiwi commented](https://github.com/code-423n4/2021-05-nftx-findings/issues/45#issuecomment-840872967):**
 > Confirmed and updated all code to 0.8.x.


## [[L-07] Inconsistent solidity pragma](https://github.com/code-423n4/2021-05-nftx-findings/issues/3)

The source files have different solidity compiler ranges referenced.  This leads to potential security flaws between deployed contracts depending on the compiler version chosen for any particular file.  It also greatly increases the cost of maintenance as different compiler versions have different semantics and behavior.


This defect has numerous surfaces at https://github.com/code-423n4/2021-05-nftx/tree/main/nftx-protocol-v2/contracts/solidity

Different versions of Solidity are used in :
	- Version used: ['0.6.8', '>=0.4.22<0.9.0', '>=0.4.24<0.7.0', '>=0.6.0<0.8.0', '>=0.6.2<0.8.0', '^0.6.0', '^0.6.8']
	- 0.6.8 (contracts/solidity/NFTXEligiblityManager.sol#2)
	- ABIEncoderV2 (contracts/solidity/NFTXEligiblityManager.sol#3)
	- ^0.6.8 (contracts/solidity/NFTXFeeDistributor.sol#3)
	- 0.6.8 (contracts/solidity/NFTXLPStaking.sol#3)
	- 0.6.8 (contracts/solidity/NFTXVaultFactoryUpgradeable.sol#3)
	- 0.6.8 (contracts/solidity/NFTXVaultUpgradeable.sol#3)
	- 0.6.8 (contracts/solidity/StakingTokenProvider.sol#3)
	- 0.6.8 (contracts/solidity/eligibility/NFTXDeferEligibility.sol#3)
	- 0.6.8 (contracts/solidity/eligibility/NFTXDenyEligibility.sol#3)
	- 0.6.8 (contracts/solidity/eligibility/NFTXEligibility.sol#3)
	- 0.6.8 (contracts/solidity/eligibility/NFTXListEligibility.sol#3)
	- 0.6.8 (contracts/solidity/eligibility/NFTXMintRequestEligibility.sol#3)
	- 0.6.8 (contracts/solidity/eligibility/NFTXRangeEligibility.sol#3)
	- 0.6.8 (contracts/solidity/eligibility/NFTXUniqueEligibility.sol#3)
	- 0.6.8 (contracts/solidity/eligibility/UniqueEligibility.sol#2)
	- >=0.6.0<0.8.0 (contracts/solidity/interface/IERC165Upgradeable.sol#3)
	- 0.6.8 (contracts/solidity/interface/IERC3156Upgradeable.sol#3)
	- 0.6.8 (contracts/solidity/interface/INFTXEligibility.sol#2)
	- 0.6.8 (contracts/solidity/interface/INFTXEligibilityManager.sol#1)
	- ^0.6.8 (contracts/solidity/interface/INFTXFeeDistributor.sol#3)
	- 0.6.8 (contracts/solidity/interface/INFTXLPStaking.sol#3)
	- 0.6.8 (contracts/solidity/interface/INFTXVault.sol#3)
	- 0.6.8 (contracts/solidity/interface/INFTXVaultFactory.sol#3)
	- 0.6.8 (contracts/solidity/interface/IPrevNftxContract.sol#3)
	- 0.6.8 (contracts/solidity/interface/IRewardDistributionToken.sol#3)
	- 0.6.8 (contracts/solidity/interface/IVaultTokenUpgradeable.sol#3)
	- 0.6.8 (contracts/solidity/proxy/BeaconProxy.sol#3)
	- >=0.6.0<0.8.0 (contracts/solidity/proxy/ClonesUpgradeable.sol#3)
	- 0.6.8 (contracts/solidity/proxy/IBeacon.sol#3)
	- >=0.4.24<0.7.0 (contracts/solidity/proxy/Initializable.sol#3)
	- 0.6.8 (contracts/solidity/proxy/Proxy.sol#3)
	- 0.6.8 (contracts/solidity/proxy/UpgradeableBeacon.sol#3)
	- 0.6.8 (contracts/solidity/testing/MockStakingProvider.sol#3)
	- 0.6.8 (contracts/solidity/testing/MockVault.sol#2)
	- ^0.6.0 (contracts/solidity/token/ERC1155HolderUpgradeable.sol#3)
	- >=0.6.0<0.8.0 (contracts/solidity/token/ERC20BurnableUpgradeable.sol#3)
	- 0.6.8 (contracts/solidity/token/ERC20FlashMintUpgradeable.sol#3)
	- >=0.6.0<0.8.0 (contracts/solidity/token/ERC20Upgradeable.sol#3)
	- ^0.6.0 (contracts/solidity/token/ERC721HolderUpgradeable.sol#3)
	- >=0.6.0<0.8.0 (contracts/solidity/token/IERC1155ReceiverUpgradeable.sol#3)
	- >=0.6.2<0.8.0 (contracts/solidity/token/IERC1155Upgradeable.sol#3)
	- >=0.6.0<0.8.0 (contracts/solidity/token/IERC20Upgradeable.sol#3)
	- >=0.6.0<0.8.0 (contracts/solidity/token/IERC721ReceiverUpgradeable.sol#3)
	- >=0.6.2<0.8.0 (contracts/solidity/token/IERC721Upgradeable.sol#3)
	- 0.6.8 (contracts/solidity/token/RewardDistributionTokenUpgradeable.sol#2)
	- 0.6.8 (contracts/solidity/util/Address.sol#3)
	- >=0.6.0<0.8.0 (contracts/solidity/util/ContextUpgradeable.sol#3)
	- >=0.6.0<0.8.0 (contracts/solidity/util/EnumerableSetUpgradeable.sol#3)
	- >=0.6.0<0.8.0 (contracts/solidity/util/OwnableUpgradeable.sol#3)
	- 0.6.8 (contracts/solidity/util/PausableUpgradeable.sol#3)
	- >=0.6.0<0.8.0 (contracts/solidity/util/ReentrancyGuardUpgradeable.sol#3)
	- >=0.6.0<0.8.0 (contracts/solidity/util/SafeERC20Upgradeable.sol#3)
	- 0.6.8 (contracts/solidity/util/SafeMathInt.sol#3)
	- >=0.6.0<0.8.0 (contracts/solidity/util/SafeMathUpgradeable.sol#3)
	- >=0.4.22<0.9.0 (node_modules/hardhat/console.sol#2)

#undefined
Slither

#undefined

Fix a definite compiler range that is consistent between contracts and upgrade any affected contracts to conform to the specified compiler.


### Log:
- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/3) 1 (Low Risk)
### Comments:
**[0xKiwi commented](https://github.com/code-423n4/2021-05-nftx-findings/issues/3#issuecomment-845494409):**
 > We have updated everything to 0.8.x.


## [[L-07] Unchecked external calls in `NFTXLPStaking`](https://github.com/code-423n4/2021-05-nftx-findings/issues/48)
undefinedVulnerability Details

The `emergencyExit`/`emergencyExitAndClaim` functions take the staking and reward tokens as parameters and trust them for the withdrawal.

This does not lead to a critical issue (like being able to withdraw all funds) as one cannot deploy a fake reward smart contract to a `_rewardDistributionTokenAddr` and a random address without a smart contract will fail because of the `dist.balanceOf(msg.sender)` call not returning any data.
However, checking if the distribution token exists is still recommended.




Require `isContract(dist)`.



### Log:
- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/48) Confirmed
## [[L-08] Vault's flash loan not implemented according to EIP-3156](https://github.com/code-423n4/2021-05-nftx-findings/issues/54)
undefinedVulnerability Details

The `NFTXVaultUpgradeable.flashLoan` is not correctly implemented according to  EIP-3156 (but it tries to implement it as it inherits from `IERC3156FlashLenderUpgradeable`).

> "If successful, flashLoan MUST return true." - https://eips.ethereum.org/EIPS/eip-3156

It misses the return and currently always returns `false`.

Always returning `false` indicates that the flash loan was unsuccessful when in reality it could have been successful.
This breaks any contract trying to integrate with it.




Add the return statement: `return super.flashLoan(...)`



### Log:
- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/54) 1 (Low Risk)- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/54) Confirmed
### Comments:
**[cemozerr commented](https://github.com/code-423n4/2021-05-nftx-findings/issues/54#issuecomment-848263863):**
 > Keeping this as low-risk as flash loan returning the project does not pose a security threat for the NFTX project itself


## [[L-09] eligibilityManager is always 0x0](https://github.com/code-423n4/2021-05-nftx-findings/issues/25)

#contract NFTXVaultFactoryUpgradeable, variable eligibilityManager is never set thus it gets a default value of 0x0. So function deployEligibilityStorage should always fail as the eligibility manager does not exist on address 0x0.


Either add a setter for eligibilityManager or refactor function deployEligibilityStorage to work in such case.


### Log:
- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/25) Confirmed
### Comments:
**[0xKiwi commented](https://github.com/code-423n4/2021-05-nftx-findings/issues/25#issuecomment-845558815):**
 > Nice find!


## [[L-09] lack of zero address validation](https://github.com/code-423n4/2021-05-nftx-findings/issues/82)

#init function  like __FeeDistributor__init__() are used to initialize the state variable,  since these state variable are used in many function ,  due to lack of input validation, error in  these state variable can lead to redeployment of contract 

In NFTXFeeDistributor.sol --> __FeeDistributor__init__()

https://github.com/code-423n4/2021-05-nftx/blob/main/nftx-protocol-v2/contracts/solidity/NFTXFeeDistributor.sol#L35

in NFTXLPStaking.sol --> __NFTXLPStaking__init()

https://github.com/code-423n4/2021-05-nftx/blob/main/nftx-protocol-v2/contracts/solidity/NFTXLPStaking.sol#L35

in NFTXVaultUpgradeable.sol -- > __NFTXVault_init()

https://github.com/code-423n4/2021-05-nftx/blob/main/nftx-protocol-v2/contracts/solidity/NFTXVaultUpgradeable.sol#L100

in StakingTokenProvider.sol --> __StakingTokenProvider_init()

https://github.com/code-423n4/2021-05-nftx/blob/main/nftx-protocol-v2/contracts/solidity/StakingTokenProvider.sol#L23

#undefinedslither

#undefined

add zero address validation


### Log:
- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/82) Confirmed
## [[L-10] __Ownable_init will be called twice in multiple Eligibility contracts](https://github.com/code-423n4/2021-05-nftx-findings/issues/84)

Here you have more info: https://gist.github.com/alexon1234/43bf4a72a5b06651f04fc8052349ac5a


### Log:
- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/84) Confirmed
 
# Non-Critical Findings
## [[N-01] LockIds not according to spec](https://github.com/code-423n4/2021-05-nftx-findings/issues/52)
undefinedVulnerability Details

The `PausableUpgradeable.onlyOwnerIfPaused` doc comment specifies the pause states as:

```solidity
// 0 : createFund
// 1 : mint
// 2 : redeem
// 3 : mintAndRedeem
```

But lockId = 3 does not prevent mints and redeems in `NFTXVaultUpgradeable`.
Instead, it prevents swaps.
There is also an undocumented `lockId = 4` to prevent flashLoans.

A manager might look at the spec and try to prevent mints and redeems in an emergency by setting the highest lockId `3` which would prevent these according to spec.
However, users can still mint and redeem as lockId prevents swaps only.



Update the documentation to reflect the code



### Log:
- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/52) 0 (Non-critical)- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/52) documentation- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/52) Confirmed
### Comments:
**[cemozerr commented](https://github.com/code-423n4/2021-05-nftx-findings/issues/52#issuecomment-848262690):**
 > Marking this as non-critical as the issue is only in the documentation.


## [[N-04] simpler way to suppress compiler warning](https://github.com/code-423n4/2021-05-nftx-findings/issues/12)

#In the function function flashFee of ERC20FlashMintUpgradeable.sol, the variable amount is referenced to suppress a compiler warning. There is a simpler way to do this, by commenting out the variable name.

   function flashFee(address token, uint256 amount) public view virtual override returns (uint256) {
        require(token == address(this), "ERC20FlashMint: wrong token");
        // silence warning about unused variable without the addition of bytecode.
        amount;
        return 0;

#undefinedEditor

#undefined
Use the following code:
   function flashFee(address token, uint256 /*amount*/) public view virtual override returns (uint256) {
        require(token == address(this), "ERC20FlashMint: wrong token");
        return 0;


### Log:
- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/12) Acknowledged
## [[N-05] Not checked if within array bounds](https://github.com/code-423n4/2021-05-nftx-findings/issues/13)

#In the function updateModule and deployEligibility of NFTXEligiblityManager.sol, the array modules is used without checking if the index is within bounds.
If index would be out of bounds, the function will revert, but it's more difficult to troubleshoot.

NFTXEligiblityManager.sol:
  function updateModule(uint256 index, address implementation) public onlyOwner {
    modules[index].impl = implementation;
  }

  function deployEligibility(uint256 moduleIndex, bytes calldata configData) external virtual returns (address) {
    address eligImpl = modules[moduleIndex].impl;
    ...
  }

#undefinedEditor

#undefined
Add something like:
require(index < modules.length,"out or range");


### Log:
- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/13) Confirmed
## [[N-06] Missing documentation for flashloan paused number](https://github.com/code-423n4/2021-05-nftx-findings/issues/14)

#The contract PausableUpgradeable.sol documents the paused variables 0..3.
However onlyOwnerIfPaused is also used with a parameter of 4. This is used for flashloans.

PausableUpgradeable.sol:
    // 0 : createFund
    // 1 : mint
    // 2 : redeem
    // 3 : mintAndRedeem
.\NFTXVaultFactoryUpgradeable.sol:        onlyOwnerIfPaused(0);
.\NFTXVaultUpgradeable.sol:        onlyOwnerIfPaused(1);
.\NFTXVaultUpgradeable.sol:        onlyOwnerIfPaused(2);
.\NFTXVaultUpgradeable.sol:        onlyOwnerIfPaused(3);
.\NFTXVaultUpgradeable.sol:        onlyOwnerIfPaused(4); 

#undefinedEditor, grep

#undefined
Add documentation for #4.
Even better, create constants or enums.



### Log:
- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/14) Confirmed- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/14) documentation
## [[N-07] no check _rangeStart<=_rangeEnd](https://github.com/code-423n4/2021-05-nftx-findings/issues/17)

#In NFTXRangeEligibility.sol a range is defined via __NFTXEligibility_init and setEligibilityPreferences.
No check is done to make sure  _rangeStart<=_rangeEnd, so one could accidentally define as range that is effectively empty.

function setEligibilityPreferences(uint256 _rangeStart, uint256 _rangeEnd) externalvirtual onlyOwner {
        rangeStart = _rangeStart;
        rangeEnd = _rangeEnd;
        emit RangeSet(_rangeStart, _rangeEnd);
    }

#undefinedEditor

#undefined
Consider adding a check to make sure _rangeStart<=_rangeEnd


### Log:
- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/17) Confirmed
## [[N-08] Incorrect Type Specified For Argument _address In NFTXFeeDistributor.rescueTokens()](https://github.com/code-423n4/2021-05-nftx-findings/issues/89)

NFTXFeeDistributor.rescueTokens() is not functional since it casts _address as a uint256 in the function declaration.

https://github.com/code-423n4/2021-05-nftx/blob/f6d793c136d110774de259d9f3b25d003c4f8098/nftx-protocol-v2/contracts/solidity/NFTXFeeDistributor.sol#L141

#undefined

Change this: 

function rescueTokens(uint256 _address) external override onlyOwner {

To this: 

function rescueTokens(address _address) external override onlyOwner {


### Log:
- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/89) Confirmed
## [[N-09] Two Duplicate "rescueTokens" Functions In NFTXFeeDistributor ](https://github.com/code-423n4/2021-05-nftx-findings/issues/91)

Two Duplicate "rescueTokens" Functions In NFTXFeeDistributor 

#There are two duplicate functions that both are intended to rescue tokens that have incorrectly been sent to the NFTXFeeDistributor. The only difference is a typo in one of the functions which incorrectly casts _address as a uint256.


Here is the first duplicate function:

https://github.com/code-423n4/2021-05-nftx/blob/f6d793c136d110774de259d9f3b25d003c4f8098/nftx-protocol-v2/contracts/solidity/NFTXFeeDistributor.sol#L141

Here is the second duplicate function:

https://github.com/code-423n4/2021-05-nftx/blob/f6d793c136d110774de259d9f3b25d003c4f8098/nftx-protocol-v2/contracts/solidity/NFTXFeeDistributor.sol#L43

#undefined

Delete the rescueTokens function on L141 that incorrectly casts _address as a uint256.


### Log:
- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/91) Confirmed- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/91) duplicate
## [[N-12] [INFO] function publicMint is for testing only](https://github.com/code-423n4/2021-05-nftx-findings/issues/26)

#[This is for informational purposes only]
function publicMint has a comment that says it is meant for testing only:
    // For testing
    function publicMint(address to, uint256 tokenId, uint256 amount) public virtual {
        _mint(to, tokenId, amount, "");
    }


Do not forget to comment or delete this code before going to production.


### Log:
- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/26) Acknowledged- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/26) Disputed
### Comments:
**[0xKiwi commented](https://github.com/code-423n4/2021-05-nftx-findings/issues/26#issuecomment-845559009):**
 > Test code


## [[] Using calldata when not appropiate](https://github.com/code-423n4/2021-05-nftx-findings/issues/100)

here more info: https://gist.github.com/alexon1234/7b6799434cccda5e3f3d461b8186ec89


### Log:
- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/100) Disputed
### Comments:
**[cemozerr commented](https://github.com/code-423n4/2021-05-nftx-findings/issues/100#issuecomment-848300810):**
 > @0xKiwi can you explain why you've disputed this issue?


 
# Gas Optimizations
## [[G-01] Unused storage variables](https://github.com/code-423n4/2021-05-nftx-findings/issues/62)

Unused storage variables in contracts use up storage slots and increase contract size and gas usage at deployment and initialization.



Multiple variables across different contracts listed below:

description: https://github.com/code-423n4/2021-05-nftx/blob/f6d793c136d110774de259d9f3b25d003c4f8098/nftx-protocol-v2/contracts/solidity/NFTXVaultUpgradeable.sol#L59

prevContract: https://github.com/code-423n4/2021-05-nftx/blob/f6d793c136d110774de259d9f3b25d003c4f8098/nftx-protocol-v2/contracts/solidity/NFTXVaultFactoryUpgradeable.sol#L22
https://github.com/code-423n4/2021-05-nftx/blob/f6d793c136d110774de259d9f3b25d003c4f8098/nftx-protocol-v2/contracts/solidity/NFTXVaultFactoryUpgradeable.sol#L37

vaultsForAsset: https://github.com/code-423n4/2021-05-nftx/blob/f6d793c136d110774de259d9f3b25d003c4f8098/nftx-protocol-v2/contracts/solidity/NFTXVaultFactoryUpgradeable.sol#L27
https://github.com/code-423n4/2021-05-nftx/blob/f6d793c136d110774de259d9f3b25d003c4f8098/nftx-protocol-v2/contracts/solidity/NFTXVaultFactoryUpgradeable.sol#L54

allVaults: https://github.com/code-423n4/2021-05-nftx/blob/f6d793c136d110774de259d9f3b25d003c4f8098/nftx-protocol-v2/contracts/solidity/NFTXVaultFactoryUpgradeable.sol#L28
https://github.com/code-423n4/2021-05-nftx/blob/f6d793c136d110774de259d9f3b25d003c4f8098/nftx-protocol-v2/contracts/solidity/NFTXVaultFactoryUpgradeable.sol#L55

manager: https://github.com/code-423n4/2021-05-nftx/blob/f6d793c136d110774de259d9f3b25d003c4f8098/nftx-protocol-v2/contracts/solidity/eligibility/NFTXMintRequestEligibility.sol#L28


#undefined
Manual Analysis

#undefined

Remove unused variables.


### Log:
- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/62) Confirmed- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/62) Acknowledged
## [[G-02] Unused events](https://github.com/code-423n4/2021-05-nftx-findings/issues/63)

Unused events increase contract size at deployment.



Multiple events in NFTXMintRequestEligibility.sol listed below:

CanApproveMintRequestsSet: https://github.com/code-423n4/2021-05-nftx/blob/f6d793c136d110774de259d9f3b25d003c4f8098/nftx-protocol-v2/contracts/solidity/eligibility/NFTXMintRequestEligibility.sol#L44

Reject: https://github.com/code-423n4/2021-05-nftx/blob/f6d793c136d110774de259d9f3b25d003c4f8098/nftx-protocol-v2/contracts/solidity/eligibility/NFTXMintRequestEligibility.sol#L50

Approve: https://github.com/code-423n4/2021-05-nftx/blob/f6d793c136d110774de259d9f3b25d003c4f8098/nftx-protocol-v2/contracts/solidity/eligibility/NFTXMintRequestEligibility.sol#L51


#undefined
Manual Analysis

#undefined

Remove unused events or emit at appropriate places.


### Log:
- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/63) Confirmed- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/63) duplicate
## [[G-03] Change function visibility from public to external](https://github.com/code-423n4/2021-05-nftx-findings/issues/64)

Various functions across contracts are never called from within contracts but yet declared public. Their visibility can be made external to save gas.

As described in https://mudit.blog/solidity-gas-optimization-tips/: “For all the public functions, the input parameters are copied to memory automatically, and it costs gas. If your function is only called externally, then you should explicitly mark it as external. External function’s parameters are not copied into memory but are read from calldata directly. This small optimization in your solidity code can save you a lot of gas when the function input parameters are huge.”



__NFTXVault_init: https://github.com/code-423n4/2021-05-nftx/blob/f6d793c136d110774de259d9f3b25d003c4f8098/nftx-protocol-v2/contracts/solidity/NFTXVaultUpgradeable.sol#L100-L106

__NFTXVaultFactory_init: https://github.com/code-423n4/2021-05-nftx/blob/f6d793c136d110774de259d9f3b25d003c4f8098/nftx-protocol-v2/contracts/solidity/NFTXVaultFactoryUpgradeable.sol#L33

createVault: https://github.com/code-423n4/2021-05-nftx/blob/f6d793c136d110774de259d9f3b25d003c4f8098/nftx-protocol-v2/contracts/solidity/NFTXVaultFactoryUpgradeable.sol#L41-L47

setFeeReceiver: https://github.com/code-423n4/2021-05-nftx/blob/f6d793c136d110774de259d9f3b25d003c4f8098/nftx-protocol-v2/contracts/solidity/NFTXVaultFactoryUpgradeable.sol#L62

addModule: https://github.com/code-423n4/2021-05-nftx/blob/f6d793c136d110774de259d9f3b25d003c4f8098/nftx-protocol-v2/contracts/solidity/NFTXEligiblityManager.sol#L20

updateModule: https://github.com/code-423n4/2021-05-nftx/blob/f6d793c136d110774de259d9f3b25d003c4f8098/nftx-protocol-v2/contracts/solidity/NFTXEligiblityManager.sol#L25

__FeeDistributor__init__: https://github.com/code-423n4/2021-05-nftx/blob/f6d793c136d110774de259d9f3b25d003c4f8098/nftx-protocol-v2/contracts/solidity/NFTXFeeDistributor.sol#L35

setEligibilityPreferences: https://github.com/code-423n4/2021-05-nftx/blob/f6d793c136d110774de259d9f3b25d003c4f8098/nftx-protocol-v2/contracts/solidity/eligibility/NFTXUniqueEligibility.sol#L85-L86

setUniqueEligibilities: https://github.com/code-423n4/2021-05-nftx/blob/f6d793c136d110774de259d9f3b25d003c4f8098/nftx-protocol-v2/contracts/solidity/eligibility/NFTXUniqueEligibility.sol#L93-L94


setUniqueEligibilities: https://github.com/code-423n4/2021-05-nftx/blob/f6d793c136d110774de259d9f3b25d003c4f8098/nftx-protocol-v2/contracts/solidity/eligibility/NFTXMintRequestEligibility.sol#L218-L219


#undefined
Manual Analysis

#undefined

Change function visibility from public to external


### Log:
- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/64) Confirmed
## [[G-07] Gas optimization for `StakingTokenProvider.nameForStakingToken`](https://github.com/code-423n4/2021-05-nftx-findings/issues/49)
undefinedVulnerability Details

`StakingTokenProvider.nameForStakingToken`: `if (keccak256(abi.encode(_pairedPrefix)) == keccak256(abi.encode(address(0)))) ` can be simplified to `if(bytes(_pairedPrefix).length== 0)`



### Log:
- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/49) Confirmed
## [[G-10] Revert inside a loop](https://github.com/code-423n4/2021-05-nftx-findings/issues/97)

Here you have more info: 
https://gist.github.com/alexon1234/a2275d1724ce2122d36bc555e46a25c1


### Log:
- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/97) Disputed- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/97) Acknowledged
## [[G-16] Unused variables](https://github.com/code-423n4/2021-05-nftx-findings/issues/39)

#Unused variables:
  contract NFTXVaultUpgradeable, string public description;
  contract NFTXMintRequestEligibility, address public manager;


Delete unused variables to reduce the deployment costs.



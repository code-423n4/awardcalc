# High Risk Findings
 
# Medium Risk Findings
## [[M-01] Incompatability with deflationary / fee-on-transfer tokens](https://github.com/code-423n4/2021-05-88mph-findings/issues/16)
undefinedVulnerability Details

The `DInterest.deposit` function takes a `depositAmount` parameter but this parameter is not the actual transferred amount for fee-on-transfer / deflationary (or other rebasing) tokens.

The actual deposited amount might be lower than the specified `depositAmount` of the function parameter.
This would lead to wrong interest rate calculations on the principal.



Transfer the tokens first and compare pre-/after token balances to compute the actual deposited amount.



### Log:
- [ZeframLou labeled](https://github.com/code-423n4/2021-05-88mph-findings/issues/16) sponsor acknowledged
### Comments:
**[ZeframLou commented](https://github.com/code-423n4/2021-05-88mph-findings/issues/16#issuecomment-844441370):**
 > While this is true, we have no plans to support fee-on-transfer or rebasing tokens.


## [[M-02] Unchecking the ownership of `mph` in function `distributeFundingRewards` could cause several critical functions to revert](https://github.com/code-423n4/2021-05-88mph-findings/issues/23)

In contract `MPHMinter`, the function `distributeFundingRewards` does not check whether the contract itself is the owner of `mph`. If the contract is not the owner of `mph`, `mph.ownerMint` could revert, causing functions such as `withdraw`, `rolloverDeposit`, `payInterestToFunders` in the contract `DInterest` to revert as well.


Referenced code:
[MPHMinter.sol#L121](https://github.com/code-423n4/2021-05-88mph/blob/main/contracts/rewards/MPHMinter.sol#L121)
[DInterest.sol#L1253](https://github.com/code-423n4/2021-05-88mph/blob/main/contracts/DInterest.sol#L1253)
[DInterest.sol#L1420](https://github.com/code-423n4/2021-05-88mph/blob/main/contracts/DInterest.sol#L1420)

#undefined
None

#undefined

Add a `mph.owner() != address(this)` check as in the other functions (e.g., `mintVested`).


### Log:
- [ZeframLou labeled](https://github.com/code-423n4/2021-05-88mph-findings/issues/23) sponsor confirmed- [ZeframLou labeled](https://github.com/code-423n4/2021-05-88mph-findings/issues/23) resolved
### Comments:
**[ZeframLou commented](https://github.com/code-423n4/2021-05-88mph-findings/issues/23#issuecomment-844625823):**
 > Fixed in https://github.com/88mphapp/88mph-contracts/commit/026dde3d30bddedbc1eeca6c87bce4bc5b5c7ee5


 
# Low Risk Findings
## [[L-01] Use openzeppelin ECDA for erecover](https://github.com/code-423n4/2021-05-88mph-findings/issues/20)

In `Sponsorable.sol` is using erecover directly to verify the signature.
Being such a critical piece of the protocol, I would recommend using the ECDSA from openzeppelin as it does more validations when verifying the signature. 

```
 // Currently

 address recoveredAddress =
      ecrecover(digest, sponsorship.v, sponsorship.r, sponsorship.s);
    require(
      recoveredAddress != address(0) && recoveredAddress == sponsorship.sender,
      "Sponsorable: invalid sig"
    );


  //ECDSA

   function recover(bytes32 hash, uint8 v, bytes32 r, bytes32 s) internal pure returns (address) {
        // EIP-2 still allows signature malleability for ecrecover(). Remove this possibility and make the signature
        // unique. Appendix F in the Ethereum Yellow paper (https://ethereum.github.io/yellowpaper/paper.pdf), defines
        // the valid range for s in (281): 0 < s < secp256k1n ÷ 2 + 1, and for v in (282): v ∈ {27, 28}. Most
        // signatures from current libraries generate a unique signature with an s-value in the lower half order.
        //
        // If your library generates malleable signatures, such as s-values in the upper range, calculate a new s-value
        // with 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141 - s1 and flip v from 27 to 28 or
        // vice versa. If your library also generates signatures with 0/1 for v instead 27/28, add 27 to v to accept
        // these malleable signatures as well.
        require(uint256(s) <= 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0, "ECDSA: invalid signature 's' value");
        require(v == 27 || v == 28, "ECDSA: invalid signature 'v' value");

        // If the signature is valid (and not malleable), return the signer address
        address signer = ecrecover(hash, v, r, s);
        require(signer != address(0), "ECDSA: invalid signature");

        return signer;
    }
  
```

None



### Log:
- [ZeframLou labeled](https://github.com/code-423n4/2021-05-88mph-findings/issues/20) sponsor confirmed- [ZeframLou labeled](https://github.com/code-423n4/2021-05-88mph-findings/issues/20) resolved
### Comments:
**[ZeframLou commented](https://github.com/code-423n4/2021-05-88mph-findings/issues/20#issuecomment-844573323):**
 > Fixed in https://github.com/88mphapp/88mph-contracts/commit/de3742fe48991870ca3be8210c56e8301cffe4c6


## [[L-02] Anyone can withdraw vested amount on behalf of someone](https://github.com/code-423n4/2021-05-88mph-findings/issues/15)
undefinedVulnerability Details

The `Vesting.withdrawVested` function allows withdrawing the tokens of other users.
While the tokens are sent to the correct address, this can lead to issues with smart contracts that might rely on claiming the tokens themselves.

As one example, suppose the `_to` address corresponds to a smart contract that has a function of the following form:

```solidity
function withdrawAndDoSomething() {
    contract.withdrawVested(address(this), amount);
    token.transfer(externalWallet, amount)
}
```

If the contract has no other functions to transfer out funds, they may be locked forever in this contract.



Do not allow users to withdraw on behalf of other users.



### Log:
- [ZeframLou labeled](https://github.com/code-423n4/2021-05-88mph-findings/issues/15) sponsor acknowledged
### Comments:
**[ZeframLou commented](https://github.com/code-423n4/2021-05-88mph-findings/issues/15#issuecomment-844447528):**
 > This is true, but `Vesting.sol` is only kept for legacy support, `Vesting02.sol` will be the main vesting contract, so we're fine with this.


## [[L-03] Extra precautions in updateAndQuery](https://github.com/code-423n4/2021-05-88mph-findings/issues/10)

#The function updateAndQuery of EMAOracle.sol subtracts the incomeIndex with the previous incomeIndex.
These incomeIndex values are retrieved via the moneyMarket contract from an external contract.

If by accident the previous incomeIndex is larger than the current incomeIndex then the subtraction would be negative and the code halts (reverts), without an error message.
Also the updateAndQuery function would not be able to execute (until the current incomeIndex is larger than the previous incomeIndex).

This situation could occur when an error occurs in one of the current or future money markets.

EMAOracle.sol:
  function updateAndQuery() {
        ...
        uint256 _lastIncomeIndex = lastIncomeIndex;
        ...
        uint256 newIncomeIndex = moneyMarket.incomeIndex();
        uint256 incomingValue =
            (newIncomeIndex - _lastIncomeIndex).decdiv(_lastIncomeIndex) /
                timeElapsed;

#undefinedEditor

#undefined
Give an error message when the previous incomeIndex is larger than the current incomeIndex.
And/or create a way to recover from this erroneous situation.


### Log:
- [ZeframLou labeled](https://github.com/code-423n4/2021-05-88mph-findings/issues/10) sponsor confirmed- [ZeframLou labeled](https://github.com/code-423n4/2021-05-88mph-findings/issues/10) resolved
### Comments:
**[ZeframLou commented](https://github.com/code-423n4/2021-05-88mph-findings/issues/10#issuecomment-844618871):**
 > Fixed in https://github.com/88mphapp/88mph-contracts/commit/9de33956c1c31cde52768110dc6ec9c19049a748


## [[L-04] Add extra error message in_depositRecordData](https://github.com/code-423n4/2021-05-88mph-findings/issues/7)

#In the function _depositRecordData of DInterest.sol, interestAmount is lowered with feeAmount.
If by accident feeAmount happens to be larger than interestAmount an error occurs and the execution stops, without an error message.
This might make troubleshooting this situation more difficult.

DInterest.sol:
 function _depositRecordData(..) {
    ...
    interestAmount -= feeAmount;

#undefinedEditor

#undefined
Perhaps add something like:
 require(interestAmount >= feeAmount,"DInterest: fee too large");


### Log:
- [ZeframLou labeled](https://github.com/code-423n4/2021-05-88mph-findings/issues/7) sponsor acknowledged
## [[L-05] function payInterestToFunders does not have a re-entrancy modifier](https://github.com/code-423n4/2021-05-88mph-findings/issues/6)

#function payInterestToFunders does not have a re-entrancy modifier. I expect to see this modifier because similar functions (including sponsored version) have it.


Add 'nonReentrant' to function payInterestToFunders.


### Log:
- [ZeframLou labeled](https://github.com/code-423n4/2021-05-88mph-findings/issues/6) sponsor confirmed- [ZeframLou labeled](https://github.com/code-423n4/2021-05-88mph-findings/issues/6) resolved
### Comments:
**[ZeframLou commented](https://github.com/code-423n4/2021-05-88mph-findings/issues/6#issuecomment-844461166):**
 > Fixed in https://github.com/88mphapp/88mph-contracts/commit/ed9dec252b1dde4225f4bfc1ac4a52bc79af40a4


 
# Non-Critical Findings
## [[N-01] zero amount  of token value can be entered for creating vest object in  vesting.sol](https://github.com/code-423n4/2021-05-88mph-findings/issues/12)

#impact will be on the end user , if they by mistake entered the zero amount , they will end paying gas fee for nothing


https://github.com/code-423n4/2021-05-88mph/blob/main/contracts/rewards/Vesting.sol#L24

in vest function there is checking of vestPeriodInSeconds but no checking of amount , due to which amount can be set to 0

#undefined
manual review

#undefined

add condition, to check for function parameter


### Log:
- [ZeframLou labeled](https://github.com/code-423n4/2021-05-88mph-findings/issues/12) sponsor acknowledged- [ghoul-sol labeled](https://github.com/code-423n4/2021-05-88mph-findings/issues/12) 0 (Non-critical)
### Comments:
**[ZeframLou commented](https://github.com/code-423n4/2021-05-88mph-findings/issues/12#issuecomment-844448773):**
 > We're ok with this

**[ghoul-sol commented](https://github.com/code-423n4/2021-05-88mph-findings/issues/12#issuecomment-851066055):**
 > Passing 0 doesn't break anything. This is a non-critical issue.


## [[N-02] lack of zero address validation in constructor](https://github.com/code-423n4/2021-05-88mph-findings/issues/13)

#due to lack of zero address validation, there is chance of loosing funds

https://github.com/code-423n4/2021-05-88mph/blob/main/contracts/rewards/dumpers/Dumper.sol

https://github.com/code-423n4/2021-05-88mph/blob/main/contracts/rewards/dumpers/OneSplitDumper.sol

#undefinedmanual review
#undefined
add zero address check


### Log:
- [ZeframLou labeled](https://github.com/code-423n4/2021-05-88mph-findings/issues/13) sponsor acknowledged
### Comments:
**[ZeframLou commented](https://github.com/code-423n4/2021-05-88mph-findings/issues/13#issuecomment-844445191):**
 > We're fine with this


## [[N-03] Multiple definitions of PRECISION](https://github.com/code-423n4/2021-05-88mph-findings/issues/8)

#There are multiple definitions of PRECISION.
This risk is that is someone (a new developer?) would change the value of PRECISION on one location and might forget to change it on one of the other places.

Also 2 of them are defined public while the rest is internal.


DInterest.sol:                                uint256 internal constant PRECISION = 10**18;
libs\DecMath.sol:                             uint256 internal constant PRECISION = 10**18;
models\fee\PercentageFeeModel.sol:            uint256 internal constant PRECISION = 10**18;
models\interest\LinearDecayInterestModel.sol: uint256 public   constant PRECISION = 10**18;
models\interest\LinearInterestModel.sol:      uint256 public   constant PRECISION = 10**18;
models\interest-oracle\EMAOracle.sol:         uint256 internal constant PRECISION = 10**18;
models\issuance\MPHIssuanceModel02.sol:       uint256 internal constant PRECISION = 10**18;
rewards\Vesting02.sol:                        uint256 internal constant PRECISION = 10**18;
rewards\xMPH.sol:                             uint256 internal constant PRECISION = 10**18;

#undefinedgrep

#undefined
Define PRECISION once and import this in all the other contracts.


### Log:
- [ZeframLou labeled](https://github.com/code-423n4/2021-05-88mph-findings/issues/8) sponsor acknowledged
## [[N-04] contract AaveMarket function setRewards has a misleading revert message](https://github.com/code-423n4/2021-05-88mph-findings/issues/4)

#contract AaveMarket function setRewards has a misleading revert message:
   require(newValue.isContract(), "HarvestMarket: not contract");


Should be 'AaveMarket', not 'HarvestMarket'.


### Log:
- [ZeframLou labeled](https://github.com/code-423n4/2021-05-88mph-findings/issues/4) sponsor confirmed- [ZeframLou labeled](https://github.com/code-423n4/2021-05-88mph-findings/issues/4) resolved
### Comments:
**[ZeframLou commented](https://github.com/code-423n4/2021-05-88mph-findings/issues/4#issuecomment-844575572):**
 > Fixed in https://github.com/88mphapp/88mph-contracts/commit/f4b58f8af4366507f14d781c4af95dbab970fb50


## [[N-05] Missmatch between the comment and the actual code](https://github.com/code-423n4/2021-05-88mph-findings/issues/5)

#Here the comment says that it should transfer from msg.sender but it actually transfers from the sender which is not always the msg.sender (e.g. sponsored txs):
  // Transfer `fundAmount` stablecoins from msg.sender
  stablecoin.safeTransferFrom(sender, address(this), fundAmount);


Update the comment to match the code.


### Log:
- [ZeframLou labeled](https://github.com/code-423n4/2021-05-88mph-findings/issues/5) sponsor confirmed- [ZeframLou labeled](https://github.com/code-423n4/2021-05-88mph-findings/issues/5) resolved
### Comments:
**[ZeframLou commented](https://github.com/code-423n4/2021-05-88mph-findings/issues/5#issuecomment-844575355):**
 > Fixed in https://github.com/88mphapp/88mph-contracts/commit/f4b58f8af4366507f14d781c4af95dbab970fb50


 
# Gas Optimizations
## [[G-01] Gas optimizations by using external over public ](https://github.com/code-423n4/2021-05-88mph-findings/issues/18)

Some functions could use external instead of public in order to save gas.

If we run the following methods on Remix, we can see the difference
```
  //  transaction cost  21448 gas
  //  execution cost    176 gas
  function tt() external returns(uint256) {
      return 0;
  }

  //  transaction cost  21558 gas
  //  execution cost    286 gas
  function tt_public() public returns(uint256) {
      return 0;
  }
```

```
surplusOfDeposit(uint256) should be declared external:
        - DInterest.surplusOfDeposit(uint256) (contracts/DInterest.sol#623-648)
dividendOf(uint256,address,address) should be declared external:
        - ERC1155DividendToken.dividendOf(uint256,address,address) (contracts/libs/ERC1155DividendToken.sol#101-107)
withdrawnDividendOf(uint256,address,address) should be declared external:
        - ERC1155DividendToken.withdrawnDividendOf(uint256,address,address) (contracts/libs/ERC1155DividendToken.sol#114-126)
uri(uint256) should be declared external:
        - ERC1155Upgradeable.uri(uint256) (contracts/libs/ERC1155Upgradeable.sol#92-94)
balanceOfBatch(address[],uint256[]) should be declared external:
        - ERC1155Upgradeable.balanceOfBatch(address[],uint256[]) (contracts/libs/ERC1155Upgradeable.sol#124-143)
setApprovalForAll(address,bool) should be declared external:
        - ERC1155Upgradeable.setApprovalForAll(address,bool) (contracts/libs/ERC1155Upgradeable.sol#148-160)
safeTransferFrom(address,address,uint256,uint256,bytes) should be declared external:
        - ERC1155Upgradeable.safeTransferFrom(address,address,uint256,uint256,bytes) (contracts/libs/ERC1155Upgradeable.sol#178-190)
safeBatchTransferFrom(address,address,uint256[],uint256[],bytes) should be declared external:
        - ERC1155Upgradeable.safeBatchTransferFrom(address,address,uint256[],uint256[],bytes) (contracts/libs/ERC1155Upgradeable.sol#195-207)
increaseAllowance(address,uint256) should be declared external:
        - ERC20Wrapper.increaseAllowance(address,uint256) (contracts/libs/ERC20Wrapper.sol#146-157)
decreaseAllowance(address,uint256) should be declared external:
        - ERC20Wrapper.decreaseAllowance(address,uint256) (contracts/libs/ERC20Wrapper.sol#173-186)
mint(address,uint256) should be declared external:
        - ERC20Mock.mint(address,uint256) (contracts/mocks/ERC20Mock.sol#7-9)
deposit(uint256) should be declared external:
        - VaultMock.deposit(uint256) (contracts/mocks/VaultMock.sol#16-21)
withdraw(uint256) should be declared external:
        - VaultMock.withdraw(uint256) (contracts/mocks/VaultMock.sol#23-29)
deposit(uint256) should be declared external:
        - VaultWithDepositFeeMock.deposit(uint256) (contracts/mocks/VaultWithDepositFeeMock.sol#23-33)
withdraw(uint256) should be declared external:
        - VaultWithDepositFeeMock.withdraw(uint256) (contracts/mocks/VaultWithDepositFeeMock.sol#35-41)
updateAndQuery() should be declared external:
        - EMAOracle.updateAndQuery() (contracts/models/interest-oracle/EMAOracle.sol#55-84)
query() should be declared external:
        - EMAOracle.query() (contracts/models/interest-oracle/EMAOracle.sol#86-88)
initialize() should be declared external:
        - MPHToken.initialize() (contracts/rewards/MPHToken.sol#19-23)
ownerMint(address,uint256) should be declared external:
        - MPHToken.ownerMint(address,uint256) (contracts/rewards/MPHToken.sol#26-33)
```



Slither


### Log:
- [ZeframLou labeled](https://github.com/code-423n4/2021-05-88mph-findings/issues/18) sponsor disputed- [ZeframLou labeled](https://github.com/code-423n4/2021-05-88mph-findings/issues/18) resolved
### Comments:
**[ZeframLou commented](https://github.com/code-423n4/2021-05-88mph-findings/issues/18#issuecomment-844566246):**
 > Many of the functions listed are also called within the contract, so changing their visibility to `public` will break things.

**[ghoul-sol commented](https://github.com/code-423n4/2021-05-88mph-findings/issues/18#issuecomment-851067622):**
 > Even though out of the whole list, only few functions are good candidates to be changed, it's technically a valid suggestion.

**[ZeframLou commented](https://github.com/code-423n4/2021-05-88mph-findings/issues/18#issuecomment-856489515):**
 > Addressed in https://github.com/88mphapp/88mph-contracts/commit/e1df42dc46960ecd0c67a8d896f933149ea129e4


## [[G-02] Gas optimizations - storage over memory](https://github.com/code-423n4/2021-05-88mph-findings/issues/19)

Some functions are using memory to read state variables when using storage is more gas efficient.

```
function withdrawableAmountOfDeposit(
        uint256 depositID,
        uint256 virtualTokenAmount
    ) external view returns (uint256 withdrawableAmount, uint256 feeAmount) {
        // Verify input
        //FIXME: Storage
        Deposit memory depositEntry = _getDeposit(depositID);
        if (virtualTokenAmount == 0) {
            return (0, 0);
        } else {
            if (virtualTokenAmount > depositEntry.virtualTokenTotalSupply) {
                virtualTokenAmount = depositEntry.virtualTokenTotalSupply;
            }
        }
    ...
}



  function _getVestWithdrawableAmount(uint256 vestID)
    internal
    view
    returns (uint256 withdrawableAmount)
  {
    // read vest data
    //FIXME: Storage
    Vest memory vestEntry = _getVest(vestID);
    DInterest pool = DInterest(vestEntry.pool);
    DInterest.Deposit memory depositEntry =
      pool.getDeposit(vestEntry.depositID);
   
   ...
   }
```

The following functions contains memory than could be changed to storage:
- _computeAndUpdateFundingInterestAfterWithdraw
- _topupDepositRecordData
- _withdrawRecordData
- withdrawableAmountOfDeposit
- getInterestFeeAmount
- getEarlyWithdrawFeeAmount
- _getVestWithdrawableAmount



https://docs.soliditylang.org/en/v0.4.21/types.html#reference-types




### Log:
- [ZeframLou labeled](https://github.com/code-423n4/2021-05-88mph-findings/issues/19) sponsor disputed- [ZeframLou labeled](https://github.com/code-423n4/2021-05-88mph-findings/issues/19) resolved
### Comments:
**[ZeframLou commented](https://github.com/code-423n4/2021-05-88mph-findings/issues/19#issuecomment-844565136):**
 > The memory location of those variables are intentionally set to be `memory` to only load the data from storage once, in order to save gas. If changed to `storage` there will be multiple `SLOAD`s for accessing the same variable, which is expensive.

**[ghoul-sol commented](https://github.com/code-423n4/2021-05-88mph-findings/issues/19#issuecomment-851069151):**
 > In case of `withdrawableAmountOfDeposit` function, warden is right. `_getDeposit` makes 7 `SLOAD` calls in this case because it's pulling whole object from storage. Using storage would make only 5 `SLOAD` calls.
> 
> In case of `_getVestWithdrawableAmount`, either way uses 6 `SLOAD` calls.
> 
> Warden is right in at least one case so the reports stands.
> 
> 

**[ZeframLou commented](https://github.com/code-423n4/2021-05-88mph-findings/issues/19#issuecomment-856489220):**
 > Addressed in https://github.com/88mphapp/88mph-contracts/commit/6459177a642d854ca6ee4deeda7f61075bd4bdf1



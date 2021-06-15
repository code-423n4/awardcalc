# High Risk Findings
 
# Medium Risk Findings
 
# Low Risk Findings
 
# Non-Critical Findings
## [[N-01] simpler way to suppress compiler warning](https://github.com/code-423n4/2021-05-88mph-findings/issues/12)

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
## [[N-02] Not checked if within array bounds](https://github.com/code-423n4/2021-05-88mph-findings/issues/13)

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
## [[N-03] EIP-721 / EIP-1155 Re-Entrancy Vulnerability](https://github.com/code-423n4/2021-05-88mph-findings/issues/8)

The impact of this finding is difficult to estimate as the contract system within scope is limited in how the various components are meant to be utilized. 

A definitive side-effect of this re-entrancy is the delayed application of the `afterRedeemHook` which, in some implementations, renders NFTs illegible which would not be the case during the re-entrancy's execution. Another side-effect is that the `quantity1155` or `holdings` would be out-of-sync and would indicate the NFT / EIP-1155 token amount to still be "in the system" when it is not.


The `safeTransferFrom` implementations of both `ERC1155` and `ERC721` in `withdrawNFTsTo` contain a callback hook on the recipient of the transfer in case they are a contract as the standard dictates that smart contract recipients should be aware of the transfer.

While re-entrancies are prevented via the `nonReentrant` modifier for most system functions, they are not done so for `swapTo` (and consequently `swap`) invocations meaning that it is still possible to re-enter the system at this stage. Additionally, re-entrancy is still possible in other segments of the codebase i.e. ones that rely on the eligibility contracts.

#undefined
Manual Review.

#undefined

The `afterRedeemHook` paradigm should be changed to a `beforeRedeemHook` paradigm to ensure that all state changes are applied prior to external calls according to the Checks-Effects-Interactions pattern. Additionally, the state changes within `withdrawNFTsTo` should occur prior to the `safeTransferFrom` invocations.


### Log:
- [0xKiwi labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/8) Confirmed- [cemozerr labeled](https://github.com/code-423n4/2021-05-nftx-findings/issues/8) 3 (High Risk)
### Comments:
**[0xKiwi commented](https://github.com/code-423n4/2021-05-nftx-findings/issues/8#issuecomment-845501968):**
 > We have made swap and swapTo reentrant safe.


 
# Gas Optimizations

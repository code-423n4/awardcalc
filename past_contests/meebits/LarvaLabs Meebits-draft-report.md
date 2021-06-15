# High Risk Findings
## [[h-0] ERC-721 Enumerable Spec mismatch for index of tokenByIndex() function](https://github.com/code-423n4/2021-04-redacted-findings/issues/47)

Index starts at 0 for token array but the implementation here requires index to be greater than 0. This will prevent querying of token at index 0.

See reference implementation https://github.com/OpenZeppelin/openzeppelin-contracts/blob/3ba2a1354f8f830d5a0e711537efdbdd8bcb109e/contracts/token/ERC721/extensions/ERC721Enumerable.sol#L21

This will impact compatibility with NFT platforms that expect full conformity with ERC-721 specification.


https://github.com/code-423n4/2021-04-redacted/blob/2ec4ce8e98374be2048126485ad8ddacc2d36d2f/Beebots.sol#L462

https://github.com/OpenZeppelin/openzeppelin-contracts/blob/3ba2a1354f8f830d5a0e711537efdbdd8bcb109e/contracts/token/ERC721/extensions/ERC721Enumerable.sol#L21

https://github.com/OpenZeppelin/openzeppelin-contracts/blob/3ba2a1354f8f830d5a0e711537efdbdd8bcb109e/contracts/token/ERC721/extensions/ERC721Enumerable.sol#L49-L55

#undefined
Manual Analysis

#undefined

Accept 0 index by changing to “require(index >= 0 && index < TOKEN_LIMIT);”


### Comments:
**[dangerousfood commented](https://github.com/code-423n4/2021-04-meebits-findings/issues/47#issuecomment-847429104):**
 > Beebots indexes by 1 for whatever reason


## [[h-1] Signature malleability of EVM's ecrecover in verify()](https://github.com/code-423n4/2021-04-redacted-findings/issues/54)

EVM's ecrecover is susceptible to signature malleability which allows replay attacks, but that is mitigated here by tracking accepted offers and cancelling it (on L645) specifically to prevent replays. However, if any of the application logic changes, it might make signature malleability a risk for replay attacks.

See reference: https://swcregistry.io/docs/SWC-117


https://github.com/code-423n4/2021-04-redacted/blob/2ec4ce8e98374be2048126485ad8ddacc2d36d2f/Beebots.sol#L575

https://github.com/code-423n4/2021-04-redacted/blob/2ec4ce8e98374be2048126485ad8ddacc2d36d2f/Beebots.sol#L643-L645



#undefined
Manual Analysis

#undefined

Consider using OpenZeppelin’s ECDSA library: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/cryptography/ECDSA.sol


## [[h-2] Arbitrary Transfer of Unowned NFTs](https://github.com/code-423n4/2021-04-redacted-findings/issues/4)

Due to the way the market functions are structured, it is possible to arbitrarily transfer any NFT that is not owned by any address.


The function in question is the `tradeValid` function which is invoked by `acceptTrade` before the trade is performed. It in turn validates the signature of a trade via `verify` (https://github.com/code-423n4/2021-04-redacted/blob/main/Beebots.sol#L556-L576) which does not account for the behaviour of `ecrecover`. 

When `ecrecover` is invoked with an invalid signature, the zero-address is returned by it meaning that `verify` will yield `true` for the zero-address as long as the signature provided is invalid.

This can be exploited to transfer any NFT whose `idToOwner` is zero, including NFTs that have not been minted yet.

#undefined
Manual review.

#undefined

I advise an additional check to be imposed within `verify` that ensures the `signer` is not the zero-address which will alleviate this check. For more details, consult the EIP721 implementation by OpenZeppelin (https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.4.0/contracts/cryptography/ECDSA.sol#L53-L71).


## [[h-3**] Beebots.TradeValid() Will Erroneously Return True When Maker Is Set To Address(0) and makerIds Are Set To The TokenIds of Unminted Beebot NFTs](https://github.com/code-423n4/2021-04-redacted-findings/issues/77)

Beebots.TradeValid() Will Erroneously Return True When Maker Is Set To Address(0) and makerIds Are Set To The TokenIds of Unminted Beebot NFTs

Beebots.verify() Returns True No Matter What Signature Is Given When Signer Is Set To address(0).
This means that BeeBots.tradeValid() will erroneously return true when maker is set to address(0).
Finally, before an NFT has even been minted at all, it is assumed to have an owner of address(0) due to the idToOwner mapping being initialized to zero for all uninitailized slots, so an attacker can call tradeValid() with maker set to address(0) and makerIds set to the tokenIds of any unminted nftIds, and tradeValid() will erroneously return true.

(1) Beebots.verify() Returns True No Matter What Signature Is Given When Signer Is Set To address(0)
(1a) BeeBots.verify() does not check to ensure that signer is not address(0).
(1b) The reason that this is a problem is that ecrecover fails silently if the signature does not match, and simply returns zero.
(1c) So if an attacker passes in address(0) as the signer, then verify will return true no matter what signature is provided, since ecrecover will return address(0), and the signer is address(0), so verify will pass.
(1d) This means that BeeBots.tradeValid() will erroneously return true when maker is set to address(0).
(2) Before an NFT has even been minted at all, it is assumed to have an owner of address(0) due to the idToOwner mapping being initialized to zero for all uninitailized slots
(2a) Solidity inializes all mappings to 0 for all slots that have not yet been set.
(2b) So for any nft id that has not yet been minted, the corresponding owner in the mapping BeeBots.idToOwner is address(0), even though that nft should not even exist.
(2c) This means that an attacker can call tradeValid() with maker set to address(0) and makerIds set to any unminted nftIds, and tradeValid() will erroneously return true.

#undefined
(1) Add this check to Beebots.verify():
require(signer != address(0), "Cannot verify signatures from 0x0");

(2) Add this check to Beebots.tradeValid():
require(maker != address(0), "Maker 0x0 not allowed");


### Comments:
**[dangerousfood commented](https://github.com/code-423n4/2021-04-meebits-findings/issues/77#issuecomment-847413820):**
 > Wow, this exploit is absolutely stunning.


## [[h-3] function tokenByIndex treats last index as invalid](https://github.com/code-423n4/2021-04-redacted-findings/issues/73)

#NFT indexes start from 0:
   // Don't allow a zero index, start counting at 1
   return value.add(1);
so if there are 30 tokens, indexes would be 1-30. However, function tokenByIndex sets such boundaries:
   require(index > 0 && index < TOKEN_LIMIT);
which means that the last token (with index 30 in this case) will not be valid.


require(index > 0 && index <= TOKEN_LIMIT);


### Log:
- [dangerousfood labeled](https://github.com/code-423n4/2021-04-meebits-findings/issues/73) 3 (High Risk)
### Comments:
**[dangerousfood commented](https://github.com/code-423n4/2021-04-meebits-findings/issues/73#issuecomment-847429563):**
 > Beebots is indexing by 1


## [[h-4] NFT can be minted for free after sale ended](https://github.com/code-423n4/2021-04-redacted-findings/issues/75)

#The getPrice() (https://github.com/code-423n4/2021-04-redacted/blob/main/Beebots.sol#L334) return 0 after the sale ended and SALE_LIMIT - numSales nft can be minted for free.

-

#undefinedManual analysis

#undefined
Without documentation i'm not sure if it's the expected behaviour or not.
If it's not you could revert instead of returning 0.
If it's expected behaviour it's possible to create a smartContract and claim all the remaining nft frontrunning the normal users.


 
# Medium Risk Findings
## [[m-0] Legacy Function Usage](https://github.com/code-423n4/2021-04-redacted-findings/issues/14)

The `withdraw` function is utilizing the `transfer` invocation which has a fixed gas stipend and can fail, especially beyond the Berlin fork which increased the gas costs for first-time invocations of a transfer: https://eips.ethereum.org/EIPS/eip-2929


The EIP should be sufficient.

#undefined
Manual Review.

#undefined

I advise a safe wrapper library to be utilized, such as the OpenZeppelin `Address` library's `sendValue` function which forwards sufficient gas for the transfer regardless of the underlying OPCODE gas costs.


## [[m-1] randomIndex is not truly random - possibility of predictably minting a specific token Id](https://github.com/code-423n4/2021-04-redacted-findings/issues/30)

#Detailed description of the impact of this finding.

randomIndex: https://github.com/code-423n4/2021-04-redacted/blob/2ec4ce8e98374be2048126485ad8ddacc2d36d2f/Beebots.sol#L307
Is not random

Any miner has access to these values
uint index = uint(keccak256(abi.encodePacked(nonce, msg.sender, block.difficulty, block.timestamp))) % totalSize;

Non miner attackers could also test the minting random condition until they get the id they are looking to access

https://medium.com/dedaub/bad-randomness-is-even-dicier-than-you-think-7fa2c6e0c2cd

The internal variable `indices` https://github.com/code-423n4/2021-04-redacted/blob/2ec4ce8e98374be2048126485ad8ddacc2d36d2f/Beebots.sol#L158
Seems to be used to avoid this type of collision

While this makes it less straightforward there is still the possibility of minting a token with a specific id.

That said, _addNFToken
https://github.com/code-423n4/2021-04-redacted/blob/2ec4ce8e98374be2048126485ad8ddacc2d36d2f/Beebots.sol#L408
is checking if the token is already owned by an address, ensuring a token can't be stolen.

Refactoring as suggested below will save gas, make code easier to read, and prevent reverts in rare unfortunate occasions of clashes

Provide direct links to all referenced code in GitHub. Add screenshots, logs, or any other relevant proof that illustrates the concept.

See this article 
https://medium.com/dedaub/bad-randomness-is-even-dicier-than-you-think-7fa2c6e0c2cd

#undefined

Refactor to not generate random Ids, instead use counters, it will make the code more predictable and easier to read, avoids clashing of ids, reduces the need to track minted tokens.

See and example by Austin Griffith: https://github.com/austintgriffith/scaffold-eth/blob/buyer-mints-nft/packages/hardhat/contracts/YourCollectible.sol

If you use counters, you can get rid of the entire random generation, including the variables used for it:
https://github.com/code-423n4/2021-04-redacted/blob/2ec4ce8e98374be2048126485ad8ddacc2d36d2f/Beebots.sol#L156

This will also make calculating totalSize by just looking at counters:
https://github.com/code-423n4/2021-04-redacted/blob/2ec4ce8e98374be2048126485ad8ddacc2d36d2f/Beebots.sol#L308


### Log:
- [dangerousfood labeled](https://github.com/code-423n4/2021-04-meebits-findings/issues/30) 2 (Med Risk)
## [[m-2] instead of call() , transfer() is used to withdraw the ether](https://github.com/code-423n4/2021-04-redacted-findings/issues/2)

function withdraw(uint amount) external {
        require(amount <= ethBalance[msg.sender]);
        ethBalance[msg.sender] = ethBalance[msg.sender].sub(amount);
        msg.sender.transfer(amount);
        emit Withdraw(msg.sender, amount);
    }

To withdraw eth it uses transfer(), this trnansaction will fail inevitably when : - 

1. The withdrwer smart contract does not implement a payable function.

2. Withdrawer smart contract does implement a payable fallback which uses more than 2300 gas unit

3. Thw withdrawer smart contract implements a payable fallback function whicn needs less than 2300 gas unit but is called through proxy that raise the call's gas usage above 2300

https://consensys.net/diligence/blog/2019/09/stop-using-soliditys-transfer-now/





   https://github.com/code-423n4/2021-04-redacted/blob/main/Beebots.sol#L649

#undefined
no tool used

#undefined

use call() to send eth


 
# Low Risk Findings
## [[l-0] Atypical contract structure affects maintainability and readability](https://github.com/code-423n4/2021-04-redacted-findings/issues/23)

A typical/recommended contract structure has the variable declarations followed by events instead of the other way around. This affects readability/maintainability and may introduce/persist security issues.


https://github.com/code-423n4/2021-04-redacted/blob/2ec4ce8e98374be2048126485ad8ddacc2d36d2f/Beebots.sol#L77-L164

#undefined
Manual Analysis

#undefined

Consider restructuring the contract to place the variable declarations before events.


### Log:
- [dangerousfood labeled](https://github.com/code-423n4/2021-04-meebits-findings/issues/23) 0 (Non-critical)- [dangerousfood labeled](https://github.com/code-423n4/2021-04-meebits-findings/issues/23) style
## [[l-1] Mint can be front-run](https://github.com/code-423n4/2021-04-redacted-findings/issues/20)
undefinedVulnerability Details

The price of an MFT falls over time which creates a dynamic that one potential buyers want to wait for the price to drop but also not wait too long to avoid hitting the max sale cap.
However, on public blockchains any such `mint` call can be observed and attackers can simply wait until another person decides to buy at the current price and then frontrun that person.


Legitimate minters can be frontrun and end up with a failed transaction and without the NFT as the max sale limit is reached: `require(numSales < SALE_LIMIT, "Sale limit reached.");`



Front-running is hard to prevent, maybe an auction-style minting process could work where the top `SALE_LIMIT` bids are accepted after the sale duration.



## [[l-1] Missing parameters in SalesBegin event of critical startSale() function](https://github.com/code-423n4/2021-04-redacted-findings/issues/37)

Consider including salesStartTime and salesDuration as parameters in the SaleBegins event to allow off-chain tools to track sale launch time and duration, especially given that sale price depends on the time elapsed in the sale.


https://github.com/code-423n4/2021-04-redacted/blob/2ec4ce8e98374be2048126485ad8ddacc2d36d2f/Beebots.sol#L102-L105

https://github.com/code-423n4/2021-04-redacted/blob/2ec4ce8e98374be2048126485ad8ddacc2d36d2f/Beebots.sol#L215-L222

https://github.com/code-423n4/2021-04-redacted/blob/2ec4ce8e98374be2048126485ad8ddacc2d36d2f/Beebots.sol#L333-L338

#undefined
Manual Analysis

#undefined

Add salesStartTime and salesDuration as parameters in the SaleBegins event of startSale() function.


### Log:
- [dangerousfood labeled](https://github.com/code-423n4/2021-04-meebits-findings/issues/37) enhancement- [dangerousfood labeled](https://github.com/code-423n4/2021-04-meebits-findings/issues/37) style
## [[l-2] Incorrect Implementation](https://github.com/code-423n4/2021-04-redacted-findings/issues/16)

The `tokenByIndex` function appears to not perform correctly as it simply checks its input argument and returns it.


N/A.

#undefined
Manual Review.

#undefined

I advise this function to be properly fleshed out or omitted from the codebase to avoid redundant bytecode.


## [[l-2] Missing error messages in require statements of various function](https://github.com/code-423n4/2021-04-redacted-findings/issues/40)

Use of informative error messages helps troubleshoot exceptional conditions during transaction failures or unexpected behavior. Otherwise, it can be misleading and waste crucial time during exploits or emergency conditions. 

While many require statements have descriptive error messages, some are missing them.

For reference, see Note 2 in OpenZeppelin's Audit of Compound Governor Bravo: https://blog.openzeppelin.com/compound-governor-bravo-audit/


https://github.com/code-423n4/2021-04-redacted/blob/2ec4ce8e98374be2048126485ad8ddacc2d36d2f/Beebots.sol#L270

https://github.com/code-423n4/2021-04-redacted/blob/2ec4ce8e98374be2048126485ad8ddacc2d36d2f/Beebots.sol#L281

https://github.com/code-423n4/2021-04-redacted/blob/2ec4ce8e98374be2048126485ad8ddacc2d36d2f/Beebots.sol#L356

https://github.com/code-423n4/2021-04-redacted/blob/2ec4ce8e98374be2048126485ad8ddacc2d36d2f/Beebots.sol#L445

https://github.com/code-423n4/2021-04-redacted/blob/2ec4ce8e98374be2048126485ad8ddacc2d36d2f/Beebots.sol#L462

https://github.com/code-423n4/2021-04-redacted/blob/2ec4ce8e98374be2048126485ad8ddacc2d36d2f/Beebots.sol#L467

https://github.com/code-423n4/2021-04-redacted/blob/2ec4ce8e98374be2048126485ad8ddacc2d36d2f/Beebots.sol#L557

https://github.com/code-423n4/2021-04-redacted/blob/2ec4ce8e98374be2048126485ad8ddacc2d36d2f/Beebots.sol#L650


#undefined
Manual Analysis

#undefined

Use meaningful error messages which specifically describe the conditional failure in all require statements.


### Log:
- [dangerousfood labeled](https://github.com/code-423n4/2021-04-meebits-findings/issues/40) style
## [[l-3] Missing event in critical devMint() function](https://github.com/code-423n4/2021-04-redacted-findings/issues/42)

The dev/deployer is allowed to mint an unlimited quantity of NFTs without paying to arbitrary recipients. This reduces the token balance and affects token availability for other sale participants, and therefore is significant enough to warrant its own event.


https://github.com/code-423n4/2021-04-redacted/blob/2ec4ce8e98374be2048126485ad8ddacc2d36d2f/Beebots.sol#L341-L346


#undefined
Manual Analysis

#undefined

Add an event for devMint and emit at the end of devMint() function.


### Log:
- [dangerousfood labeled](https://github.com/code-423n4/2021-04-meebits-findings/issues/42) 1 (Low Risk)- [dangerousfood labeled](https://github.com/code-423n4/2021-04-meebits-findings/issues/42) style
## [[l-4] SafeMath library asserts instead of reverts](https://github.com/code-423n4/2021-04-redacted-findings/issues/17)
undefinedVulnerability Details

The implementation of SafeMath `assert`s instead of performing a `revert` on failure.

An `assert` will consume all gas of the transaction whereas a `revert`/`require` releases the remaining gas to the transaction sender again.
Usually, one wants to try to keep the gas cost for contract failures low and use `assert` only for invariants that should always be true.



Use `require` instead of `assert`


 
# Non-Critical Findings
 
# Gas Optimizations
## [[g-0] Explicit initialization with zero not required for numTokens](https://github.com/code-423n4/2021-04-redacted-findings/issues/26)

Explicit initialization with zero is not required for variable declaration of numTokens because uints are 0 by default. Removing this will reduce contract size and save a bit of gas.



https://github.com/code-423n4/2021-04-redacted/blob/2ec4ce8e98374be2048126485ad8ddacc2d36d2f/Beebots.sol#L141


#undefined
Manual Analysis

#undefined

Remove explicit initialization with zero.


## [[g-1] Numerous Gas Optimizations](https://github.com/code-423n4/2021-04-redacted-findings/issues/15)

This finding is dedicated to the numerous gas optimizations that can be applied across the codebase.


N/A

#undefined
Manual Review.

#undefined

- The `tradeValid`, `cancelOffer` and `acceptTrade` functions should have their `memory` arrays declared as `calldata` greatly reducing the gas costs of the functions.
- The `require` statements of L629 and L650 are redundant as they are inherently guaranteed by the usage of `SafeMath`.
- The `deployer`, `beta`, `alpha`, and `beneficiary` variables can all be declared as `immutable` since they are assigned to only once during the contract's `constructor`.
- The `SafeMath` statements of L333, L337, L349, and L385 are redundant as they are guaranteed to be safe due to surrounding `require` and `if` clauses.
- The `abi.encodePacked` invocations of L539 and L541 are redundant given that the elements of the arrays cannot be tight packed since they each occupy a full 256-bit slot.


## [[g-2] state variables that could be declared constant](https://github.com/code-423n4/2021-04-redacted-findings/issues/3)

#These state variable can be declared as constant to save the gas

nftName 
nftSymbol 


https://github.com/code-423n4/2021-04-redacted/blob/main/Beebots.sol#L138
  

#undefined
slither

#undefined

use constant 


## [[g-3] public function that could be declared external](https://github.com/code-423n4/2021-04-redacted-findings/issues/5)

#public function that could be declared external to save gas

 In Beebots.sol


1.totalSupply() 

https://github.com/code-423n4/2021-04-redacted/blob/main/Beebots.sol#L457

2.tokenByIndex(uint256) 

https://github.com/code-423n4/2021-04-redacted/blob/main/Beebots.sol#L461

3.hashToSign(address,address,uint256,uint256[],uint256,uint256[],uint256,uint256) 

https://github.com/code-423n4/2021-04-redacted/blob/main/Beebots.sol#L547
	- 

#undefined
#undefined


## [[g-4] Optimizations storage](https://github.com/code-423n4/2021-04-redacted-findings/issues/83)

Here you have more info: https://gist.github.com/alexon1234/126320751f7a108e9aaf74c8d147d7df


### Log:
- [dangerousfood labeled](https://github.com/code-423n4/2021-04-meebits-findings/issues/83) 0 (Non-critical)- [dangerousfood labeled](https://github.com/code-423n4/2021-04-meebits-findings/issues/83) invalid- [dangerousfood labeled](https://github.com/code-423n4/2021-04-meebits-findings/issues/83) G (Gas Optimization)- [dangerousfood labeled](https://github.com/code-423n4/2021-04-meebits-findings/issues/83) style
## [[g-5] creatorNftMints is assigned only 0 or 1](https://github.com/code-423n4/2021-04-redacted-findings/issues/68)

#It is unclear why this mapping points to uint: mapping (uint256 => uint256) public creatorNftMints; the only values it could get is either 0 or 1 so a boolean type might be more suitable here.


use true/false values if the intention was that 0 means false and 1 means true:
mapping (uint256 => boolean) public creatorNftMints;


### Log:
- [dangerousfood labeled](https://github.com/code-423n4/2021-04-meebits-findings/issues/68) G (Gas Optimization)- [dangerousfood labeled](https://github.com/code-423n4/2021-04-meebits-findings/issues/68) style
## [[g-6] Require() not needed](https://github.com/code-423n4/2021-04-redacted-findings/issues/67)

#on line 650 require(amount <= ethBalance[msg.sender]); is not needed because it's implicitly checked when making the subtraction in the following line

-

#undefinedManual analysis

#undefined
Remove the require()


### Comments:
**[dangerousfood commented](https://github.com/code-423n4/2021-04-meebits-findings/issues/67#issuecomment-847430433):**
 > Fantastic catch imo


## [[g-7] PauseMarket() can be optimized](https://github.com/code-423n4/2021-04-redacted-findings/issues/69)

#The function pauseMarket() on line 230 can be optimized.

-

#undefinedManual analysis

#undefined
Don't use an argument and set marketPaused = !marketPaused



# Security Review — Artistic Auras

---

## Scope

|                                  |                                                        |
| -------------------------------- | ------------------------------------------------------ |
| **Mode**                         | ALL / default                                          |
| **Files reviewed**               | `src/ArtisticAuras.sol`                                |
| **Confidence threshold (1-100)** | 80                                                     |

---

## Findings

No findings met the confidence threshold.

---

[75] **1. Default royalty receiver not synchronized with ownership transfers**

`ArtisticAuras.constructor / Ownable.transferOwnership` · Confidence: 75

**Description**
The constructor sets the ERC2981 default royalty receiver to `owner()` at deployment, but a later ownership transfer does not update that stored receiver, so secondary-sale royalties continue to accrue to the original deployer until the new owner notices and manually calls `setDefaultRoyalty`.

---

Findings List

| # | Confidence | Title |
|---|------------|-------|
| 1 | [75]       | Default royalty receiver not synchronized with ownership transfers |

---

## Leads

- **Burn-extension supply drift** — `ArtisticAuras._update` — Code smells: `_tokenIds` is only incremented in mint paths and never decremented; `_update` simply delegates to parent contracts. — If a future extension adds public burning, `getTotalSupply()` would overstate the number of existing tokens and the contract could never again hold 21 live tokens simultaneously.

---

> ⚠️ This review was performed by an AI assistant. AI analysis can never verify the complete absence of vulnerabilities and no guarantee of security is given. Team security reviews, bug bounty programs, and on-chain monitoring are strongly recommended. For a consultation regarding your projects' security, visit [https://www.pashov.com](https://www.pashov.com)

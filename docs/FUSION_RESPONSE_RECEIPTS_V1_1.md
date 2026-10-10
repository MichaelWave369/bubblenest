# Fusion Response Receipts v1.1 · Account signals, not licensed consent

Bubble Fusion v1.0 let contributors create public invitations between two independent research proposals. v1.1 adds a **public, structured response desk** to each invitation. This closes the gap between "someone proposed collaboration" and "the account associated with an original public idea actually responded", without inventing legal or identity verification.

## Workflow

Open **Bubble Fusion** and expand **Inspect responses** on a public invitation. The desk displays the two original source Issues and the current visible response from each source Issue author's GitHub account. A contributor can prepare an **Interested in discussing**, **Request changes**, **Decline invitation**, or **Withdraw earlier interest** response.

A response draft requires an explicit source role (A or B), a scope/permissions description, and limitations or reservations. It opens a prefilled GitHub Issue for the visitor to review and submit. The static site cannot and does not post on their behalf.

The reader associates each response with three exact public objects:
- Fusion invitation Issue number.
- Responding original source Issue number.
- Responding role A or B.

When a public response Issue is retrieved, **only if the GitHub account that posted it matches the GitHub account recorded as the author of that source Bubble Issue** (case-insensitive login match) does it become the latest *originating-account signal* for that role. An unmatched response still appears as an attributable community response, but cannot count as the originating account's reply. If one account authored both source Issues, it must still post a separate role-specific response for each.

## Response Issue protocol

```md
<!-- bubblenest:fusion-response:v1 -->

# Bubble Fusion · contributor response receipt

## Fusion invitation
https://github.com/MichaelWave369/bubblenest/issues/40

## Responding source
https://github.com/MichaelWave369/bubblenest/issues/11

## Responding role
A

## Response
Interested in discussing

## Scope and permission boundaries
Only a preliminary meeting to discuss possible test methods. No licenses granted.

## Limitations and reservations
No private dataset sharing, approved budget, project ownership or agreement is implied.

## Additional context
Public discussion preferred.

## Policy
ACCOUNT_SIGNAL_ONLY_NOT_LEGAL_CONSENT
```

The reader accepts only the predefined response types, exact repository URLs, and fixed policy flag. It also cross-checks the response's source issue and side of the specified Fusion proposal. The document's body **cannot substitute an arbitrary username for GitHub's Issue author metadata**.

## Interpretation and safeguards

- **Interested in discussing** is an expression of interest, not contractual acceptance, permission to copy artifacts, project membership, or authority to execute.
- Two visible interest signals are labeled as **two account responses**, explicitly NOT mutual legal consent. Both original creators should negotiate scoped permissions separately before any actual reuse or joint work.
- **Request changes** and **Decline invitation** remain visible. **Withdraw earlier interest** takes precedence in the *current display* when newer, but older public Issues remain inspectable.
- Creating an Issue is not proof of identity, ownership or valid permissions. The origin Issue's poster may not hold rights to all third-party material in it. GitHub usernames and Issue bodies can change, and issues can be edited.
- The matching system uses public GitHub handles, not signed cryptographic identities. It cannot independently verify real-world identity, third-party rights, legal consent, or the originality of a project.
- Account unmatched responses are not counted as an origin account's stated intention.
- A missing response does not mean rejection or agreement. The existing Issues reader may omit historical entries due to a maximum 300 records, rate limits or outages.
- There is no automatic matching to a private Browser draft, no background publishing, user-agent authorization, team membership, legal contract signing, or license transfer.

## Next evolution

A later PR might add opt-in project charters and bounded experiment handoffs, but such a charter must separately require explicit authorized participants and negotiated permissions. A response Issue is not that charter.

**Ledger Above Bruv. Sauce Before Source. No silence-as-consent.**

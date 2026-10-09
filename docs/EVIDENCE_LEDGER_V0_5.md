# Evidence Ledger v0.5

**Sauce Before Source. Ledger Above Bruv.**

Bubble Nest's Evidence Ledger is a readable, attributable collection of **public contributor receipts**. It is not an automatic fact-checker, peer review, a legal priority record, or a certification authority.

## Four receipt types

- **Source:** Publicly linked paper, dataset, documentation, or other reference. A source URL is required.
- **Test:** A procedure and reported observations. Method/procedure is required.
- **Replication:** An attempt to repeat earlier work, whether successful or not. A method is required. The type name does not establish independence or validity.
- **Review:** An explicit critique or assessment. A method/scope description or public source URL is required.

Every receipt has a specific summary, **mandatory limitations and alternative explanations**, a self-reported interpretation (**Supports, Challenges, Mixed, Undetermined**) and publicly attributable GitHub issue and author. The labels reflect the contributor's perspective, **not** a site-endorsed truth judgment. Reports may disagree.

Optional fields include a public HTTP(S) link, a GitHub Issue URL in this repository for an evolution note, method/context, and next question.

## Contribution flow

1. Open a public Bubble Room and choose the **Evidence** tab.
2. Select **Add receipt**, enter the kind and your interpretation, then identify the exact finding, method and uncertainty.
3. Select **Review draft on GitHub**. The browser opens a prefilled GitHub Issue. The user must explicitly sign in, review, and submit. No silent publishing or access token occurs.
4. When the public GitHub Issues API returns the entry, the record appears in the parent's ledger, timeline, and contributor list.

Local-only and example bubbles do not publish receipts.

## Public Issue example

~~~md
<!-- bubblenest:evidence:v1 -->

# Evidence Ledger · contributor receipt

## Parent bubble
https://github.com/MichaelWave369/bubblenest/issues/42

## Evidence kind
Test

## Assessment
Mixed

## Receipt summary
Observed a difference between two preregistered conditions.

## Method and provenance
Repeat both conditions using a pinned script and record output hashes.

## Public source URL
https://example.org/public-test-record

## Related evolution issue
Not supplied.

## Limitations and alternatives
Small sample; sampling bias and version drift are plausible.

## Next question
Would the pattern survive an independent implementation?
~~~

An accepted issue has a title starting with [Evidence] and the exact v1 marker. It must link to a public issue in this repository and use the defined fields. The parser treats all contributor text as text, not executable HTML. External links must be HTTP(S) without embedded credentials; Bubble Nest does not check source authenticity, destination safety, factual accuracy or availability.

## Interpretation, limitations

- The count cards tally **submitted record types**, not confirmed findings.
- Supports and Challenges are **contributor-selected labels**, not a consensus score.
- Activity timestamps come from GitHub issue creation, not its complete edit history. Contributors may edit their issue bodies.
- Public contributors are GitHub accounts that submitted visible records, not a formal membership or ownership register.
- The app reads at most **300 public GitHub Issues**, including closed ones, and may miss older records or encounter rate limits, incomplete data and network outages.
- No backend, live collaboration presence, automated agent contributions or independent fact-checker is included.
- Later versions can add human-confirmed review status, immutable artifact hashes, counterevidence, reviewer conflicts of interest, and reproducibility checks while keeping negative results visible.

**No Citation, No Coronation.**

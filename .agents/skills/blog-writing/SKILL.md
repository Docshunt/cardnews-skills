---
name: blog-writing
description: Write Korean Docshunt blog articles about startup support programs, business plans, founder validation, and AI-assisted planning. Use when turning Korean or overseas source material into a search-intent-led article with domestic official grounding, an editorial point of view, natural Korean prose, source links, metadata, and a restrained Docshunt CTA.
---

# Docshunt Blog Writing

Write a useful answer to one founder's real question. Do not publish a keyword list, a rewritten source article, or a generic startup essay.

## Start with an editorial brief

Before drafting, lock these fields in a short working brief:

- **reader question:** the Korean query or decision the post answers;
- **one-sentence claim:** a supportable point of view, not a topic label;
- **source roles:** overseas original for insight or case; Korean primary source for programme rules, terminology, or current conditions;
- **business-plan bridge:** the section, evidence, or decision the reader should improve;
- **keyword family:** one primary phrase and a small set of naturally relevant supporting phrases;
- **CTA:** the concrete next action that fits the article.

Treat overseas material as the origin of an idea, not a document to translate. Treat Korean official material as the source of truth for eligibility, deadlines, funding, procedures, and programme names. Never use an official source to imply a selection rule it does not state.

Read [references/source-model.md](references/source-model.md) before writing an article that combines foreign insight with Korean support-programme SEO.

## Workflow

1. Inspect the supplied material and existing Docshunt posts. Confirm the article category, related internal links, reader level, current date, and the one question the post will answer.
2. Research before drafting. Separate original insight, observed facts, official Korean rules, and the writer's interpretation. Keep the URL, publisher, publication/update date, and exact claim for every time-sensitive statement.
3. Build the brief above. Search phrasing must describe the reader's problem, not merely repeat a programme name. Prefer `사업계획서 시장조사`, `예비창업 지원사업 신청자격`, or `R&D 사업계획서 차별성` to an unsupported broad keyword bucket.
4. Draft the argument in this order: **hook → familiar situation → source-backed insight → Korean business-plan translation → practical steps → next action**. This is a compact Hook–Story–Offer rhythm: the offer is the useful next step, not an aggressive sales pitch.
5. Add metadata and sources. Write an answer-shaped title, a concise meta description, a category, the primary keyword, a source list, and relevant internal-link suggestions.
6. Run the Korean editorial pass below before delivering the draft. Do it after facts and links are locked, never before research.
7. Review the final article for factual fidelity, search-intent fit, useful reading flow, and a CTA that follows from the article. Do not publish without the user's explicit instruction and an available publishing path.

## Search intent and source rules

- Put the primary Korean query naturally in the title, opening answer, and at least one meaningful section heading. Do not repeat it merely to increase frequency.
- Use programme names, years, deadlines, eligibility, amounts, and evaluation terminology only after checking the current official notice. State the notice version or date when it matters.
- Use an overseas essay, interview, or case to sharpen the premise. Paraphrase it in the article's own words and link to it; do not translate large passages or borrow its structure paragraph by paragraph.
- Explain exactly how the insight changes a business-plan section: problem definition, customer evidence, market sizing, feasibility, team, execution plan, budget, or milestone.
- Distinguish **fact**, **official requirement**, and **editorial advice** in the prose. A reader should never mistake a recommendation for a published eligibility rule.
- Use a compact source note with direct links near claims that are current, numerical, legal, or programme-specific.
- Recommend only existing product behaviour or approved offers. If a product fact is not supplied, write a neutral CTA such as “공고문과 기존 자료를 함께 놓고 부족한 근거를 먼저 점검해 보세요.”

## Korean editorial pass

This is a quality pass for natural, readable Korean—not an attempt to conceal authorship or to alter evidence.

1. **Freeze meaning.** Do not change names, dates, figures, units, direct quotations, programme names, legal wording, URLs, source labels, or the distinction between fact and opinion.
2. **Mark only stylistic signals.** Look for translation-like phrasing, repeated sentence openings or endings, mechanical `첫째·둘째·셋째` blocks, identical paragraph lengths, stacked rhetorical questions, excessive headings or bullets, ornamental English, passive constructions, and filler such as `결론적으로`, `시사하는 바가 크다`, `주목할 만하다`, or `~할 수 있을 것으로 보입니다`.
3. **Rewrite surgically.** Prefer a direct Korean verb, a concrete subject, varied sentence length, and one connective only when it changes the logic. Turn a list into prose when sequence is not the point; retain a list when the reader must make a decision or check documents.
4. **Audit fidelity.** Re-read every changed sentence against the frozen facts. Do not add anecdotes, urgency, certainty, or personal opinion that the source did not support. Keep the post's practical, founder-facing Docshunt voice rather than making it literary.
5. **Set the intensity.** Use the standard pass for ordinary drafts. Use **strict** mode for high-stakes, regulation- or grant-related posts, articles over roughly 5,000 Korean characters, or whenever the user asks for it: detect spans first, revise only marked spans, then run a separate meaning-preservation review. If the optional `humanize-korean` skill is installed, use it for this pass; otherwise follow these rules manually.

Read [references/korean-editorial-pass.md](references/korean-editorial-pass.md) before a strict pass or when a draft still feels formulaic.

## Docshunt article form

Use this default shape unless the supplied material needs a different form:

```text
H1: reader's Korean question with a clear promise
Opening: answer in two to four sentences
H2: why the familiar approach fails or falls short
H2: the source insight, case, or official rule
H2: how to apply it in a business plan or support-programme decision
H2: a short, usable checklist or next-step sequence
Closing: one grounded takeaway and a relevant CTA
Sources and related posts
```

- Keep paragraphs short, but do not force every sentence onto a separate line.
- Use questions to expose a real decision, not as a repetitive rhetorical device.
- Use lists for requirements, choices, or a genuine sequence. Do not turn ordinary explanatory prose into five decorative bullets.
- Give a direct answer early. Let the body earn the nuance.
- Keep the CTA brief and proportional. The article must remain helpful without using the product.

## Output contract

Deliver a publish-ready package containing:

```text
<slug>/
├── article.md
├── metadata.json
├── sources.json
└── qa/korean-editorial-review.md
```

`metadata.json` contains the title, slug, meta description, category, primary keyword, supporting keywords, suggested internal links, and CTA. `sources.json` records source title, URL, publisher, role (`insight`, `official-rule`, `case`, or `background`), and accessed date. The review records the mode, style patterns corrected, and confirmation that protected facts were preserved; it does not claim to determine whether a text is AI-generated.

## Quality gates

- Reject the article if it does not answer a single clear query in the opening.
- Reject an overseas-source article if it lacks a specific Korean founder or business-plan application.
- Reject a domestic-keyword article if the keyword is not relevant to the reader's actual decision.
- Reject a grant or policy claim without a current primary source.
- Reject an edit that changes a protected fact, direct quote, source attribution, or the writer's stated confidence.
- Reject a conclusion made only of generic encouragement, product praise, or a CTA.

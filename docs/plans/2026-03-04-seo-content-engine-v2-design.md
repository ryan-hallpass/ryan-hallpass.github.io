# SEO Content Engine v2 — Design Doc

## Overview

A new n8n workflow that combines the existing SEO Workflow's infrastructure (Airtable, Sanity CMS publishing) with Francisco's SERP-first methodology (scraping top-ranking pages, extracting NLP terms, heading structure matching, PAA questions). Built as a separate workflow — the existing 237-node workflow remains untouched.

Once proven, this replaces the original workflow.

## Tech Stack

- **n8n** — Single workflow, webhook-triggered, 4 routes
- **Brave Search API** — Keyword research + SERP scraping (replaces DataForSEO)
- **Claude/Anthropic** — All AI agents (replaces OpenAI)
- **Airtable** — 3 new tables in existing base `appAXh47Y24CIZp8A`
- **Sanity CMS** — Publishing (same instance: `f8pskp0q.api.sanity.io`)

## Airtable Schema (New Tables)

### `v2_keywords`
| Field | Type | Notes |
|-------|------|-------|
| keyword | Text | The long-tail keyword |
| seed_keyword | Text | The original seed it was derived from |
| category | Single Select | question / comparison / problem-aware / commercial / long-tail |
| status | Single Select | pending_serp / serp_complete / article_written / published |
| brand_id | Text | Reference to brand guidelines record |
| created_at | Date | Auto-set |

### `v2_serp_briefs`
| Field | Type | Notes |
|-------|------|-------|
| keyword | Linked Record | Links to v2_keywords |
| nlp_terms | Long Text | JSON array of 20-30 terms found in 3+ of top 5 pages |
| heading_structure | Long Text | Recommended H1-H3 structure |
| paa_questions | Long Text | JSON array of People Also Ask questions |
| target_word_count | Number | Average word count of top 5 |
| target_images | Number | Average image count of top 5 |
| target_h2_sections | Number | Average H2 count of top 5 |
| competitor_urls | Long Text | JSON array of scraped competitor URLs |
| content_gaps | Long Text | Opportunities competitors missed |
| confidence | Single Select | high (5 pages scraped) / medium (3-4) / low (<3) |
| created_at | Date | Auto-set |

### `v2_articles`
| Field | Type | Notes |
|-------|------|-------|
| keyword | Linked Record | Links to v2_keywords |
| serp_brief | Linked Record | Links to v2_serp_briefs |
| title | Text | Article H1/title |
| slug | Text | URL-friendly slug |
| meta_description | Text | 150-160 chars |
| html_content | Long Text | Full article HTML |
| key_takeaways | Long Text | Summary bullets |
| word_count | Number | Actual word count |
| nlp_score | Number | Percentage of SERP brief NLP terms covered |
| status | Single Select | draft / ready / published |
| sanity_id | Text | Sanity document ID after publishing |
| live_url | URL | Published URL |
| created_at | Date | Auto-set |

## Workflow Architecture

Single webhook trigger with `status` field routing to 4 stages via Switch node.

### Stage 1: Keyword Research

**Trigger:** `{ "status": "keyword_research", "seed_keyword": "...", "brand_id": "..." }`

**Nodes:**
1. **Get Brand Context** — Airtable read from existing `brand_guidelines` table
2. **Brave Search x3** — Three HTTP Request nodes:
   - `"[seed keyword]"` — direct SERP results
   - `"[seed keyword] [product category]"` — commercial variations
   - `"[seed keyword] site:reddit.com OR site:quora.com"` — real user questions
3. **Claude Agent: Keyword Expansion** — Generates 25 long-tail keywords across types:
   - Question keywords ("how to...", "what is...")
   - Comparison keywords ("[product] vs [competitor]")
   - Problem-aware ("how to [goal] without [pain]")
   - Commercial intent ("best [type] for [persona]")
   - Long-tail variations (seed + modifiers)
4. **Deduplicate** — Code node checks against existing `v2_keywords` records
5. **Save to Airtable** — Bulk create in `v2_keywords` with status `pending_serp`
6. **Auto-chain** — Loop triggers Stage 2 for each keyword

### Stage 2: SERP Analysis

**Trigger:** `{ "status": "serp_analysis", "keyword_id": "..." }`

**Nodes:**
1. **Get Keyword** — Airtable read from `v2_keywords`
2. **Brave Search** — Search for exact keyword, get top 10 organic results
3. **Scrape Top 5 Pages** — HTTP Request nodes to fetch full HTML of top 5 ranking pages
   - Try all 10 results, take first 5 that return content (handle 403s/blocks)
   - If fewer than 3 succeed, flag brief as `low_confidence`
4. **Strip HTML** — Code node to extract clean text from HTML (reduce token usage)
5. **Claude Agent: SERP Analyzer** — Takes 5 scraped pages, extracts:
   - NLP terms (20-30 terms appearing in 3+ pages, including variations/synonyms)
   - Heading structure (H1-H3 from best competitor, improved)
   - PAA questions (6-8 from SERP + competitor FAQ sections)
   - Word count average
   - Image count average
   - H2 section count average
   - Content gaps (what competitors miss)
6. **Save SERP Brief** — Write structured brief to `v2_serp_briefs` table
7. **Update Keyword Status** — Set to `serp_complete`
8. **Auto-chain** — Trigger Stage 3

### Stage 3: Write Article

**Trigger:** `{ "status": "write_article", "keyword_id": "..." }`

**Nodes:**
1. **Get Data** — Pull keyword, SERP brief, and brand context from Airtable
2. **Claude Agent: Outline** — Produces article outline using SERP brief:
   - Follows competitor heading structure as skeleton
   - Places NLP terms in H2/H3 headings
   - Includes every PAA question as a section/subsection
   - Plans comparison tables where relevant
3. **Split Outline** — Code node breaks outline into individual H2 sections
4. **Claude Agent: Section Writer** (loop over sections) — For each section:
   - Writes content using brand voice
   - Incorporates assigned NLP terms naturally
   - Answers relevant PAA questions
   - Includes brand mentions and metrics where relevant
5. **Combine Sections** — Code node assembles all sections
6. **Claude Agent: Intro Writer** — Writes intro based on full article + SERP brief
7. **Claude Agent: Conclusion Writer** — Writes conclusion with CTA
8. **Claude Agent: Meta Generator** — Generates meta description (150-160 chars), URL slug, key takeaways
9. **Assemble Article** — Set node combines intro + body + conclusion into full HTML
10. **NLP Term Check** — Code node scores NLP term coverage percentage
11. **Save to Airtable** — Write to `v2_articles` with status `ready`

**Writing rules enforced across all writer agents:**
- Use ALL NLP terms from the brief, spread naturally across the full post
- Key terms in headings, not just body text
- Answer every PAA question
- Hit target word count (don't go 30%+ under)
- Include comparison tables
- Position brand first in comparisons
- Include real metrics from brand context

### Stage 4: Publish to Sanity

**Trigger:** `{ "status": "publish_article", "article_id": "..." }`

**Nodes:**
1. **Get Article** — Airtable read from `v2_articles`
2. **Markdown Conversion** — Convert HTML to Sanity block content format
3. **Count Articles** — Query existing published articles for sequential numbering
4. **Upload to Sanity** — HTTP Request to `f8pskp0q.api.sanity.io`:
   - Title, slug, body content, meta description
   - Author (default), category, published date
5. **Update Airtable** — Set article status to `published`, store Sanity document ID and live URL
6. **Update Keyword** — Set keyword status to `published`

## Future Additions (Not in v1)

- **Image generation pipeline** — OpenAI image gen + royalty-free search + chart generation (port from existing workflow)
- **Google Indexing API** — Submit new URLs for faster crawling
- **Daily cron trigger** — Schedule automatic daily runs (seed keyword rotation)
- **NLP score threshold** — Auto-reject articles below a score threshold and re-generate
- **Schema markup** — Article, FAQ, HowTo structured data

## Expected SEO Score Improvement

Per Francisco's benchmarks:
| Approach | Typical Score |
|----------|--------------|
| AI writes with no context | 35-45/100 |
| AI + basic SERP (current workflow) | ~55/100 |
| AI + deep SERP analysis (this workflow) | **70-75/100** |

The #1 factor is NLP term coverage — extracting competitor terms and naturally including them.

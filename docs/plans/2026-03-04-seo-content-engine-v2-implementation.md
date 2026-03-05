# SEO Content Engine v2 — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Generate a complete n8n workflow JSON file that Ryan can import into his n8n instance. The workflow implements SERP-first SEO content generation with 4 webhook-triggered stages.

**Architecture:** Single n8n workflow JSON file containing all nodes, connections, and configuration. Uses the same node type versions and patterns as the existing SEO Workflow (`zWPrKmOH89thzNWe`). Credential references use placeholder IDs that Ryan will map to his actual credentials after import.

**Tech Stack:** n8n workflow JSON, Brave Search API, Anthropic Claude (via n8n langchain nodes), Airtable, Sanity CMS

**Reference:** Design doc at `docs/plans/2026-03-04-seo-content-engine-v2-design.md`

---

### Task 1: Scaffold the Workflow JSON with Webhook + Settings + Switch

**Files:**
- Create: `seo-content-engine-v2/workflow.json`

**Step 1: Create the base workflow JSON**

Create `seo-content-engine-v2/workflow.json` with:
- Top-level workflow metadata (`name: "SEO Content Engine v2"`, `settings.executionOrder: "v1"`, `settings.availableInMCP: true`)
- Webhook node (POST, path `seo_content_engine_v2_trigger`)
- Workflow Settings Set node that extracts `status`, `seed_keyword`, `keyword_id`, `article_id`, `brand_id` from webhook body, plus hardcoded Airtable base_id (`appAXh47Y24CIZp8A`) and placeholder table IDs for `v2_keywords_table_id`, `v2_serp_briefs_table_id`, `v2_articles_table_id`, `brand_guidelines_table_id` (reuse `tblNyxqTNSLUbjybg`)
- Switch node with 4 routes based on `status` field:
  - `keyword_research` → output 0
  - `serp_analysis` → output 1
  - `write_article` → output 2
  - `publish_article` → output 3
- Connections: Webhook → Workflow Settings → Switch

Node patterns to match from existing workflow:
- Webhook: `type: "n8n-nodes-base.webhook"`, `typeVersion: 2`
- Set: `type: "n8n-nodes-base.set"`, `typeVersion: 3.3`, uses `assignments.assignments` array
- Switch: `type: "n8n-nodes-base.switch"`, `typeVersion: 3.2`, uses `rules.values` array with `conditions.conditions` containing `leftValue`/`rightValue`/`operator`

Position the nodes on a clean layout:
- Webhook at `[-500, 300]`
- Workflow Settings at `[-200, 300]`
- Switch at `[100, 300]`

**Step 2: Validate JSON syntax**

Run: `python3 -c "import json; json.load(open('seo-content-engine-v2/workflow.json')); print('Valid JSON')"`
Expected: `Valid JSON`

**Step 3: Commit**

```bash
git add seo-content-engine-v2/workflow.json
git commit -m "feat: scaffold SEO Content Engine v2 workflow with webhook + settings + switch"
```

---

### Task 2: Build Stage 1 — Keyword Research Nodes

**Files:**
- Modify: `seo-content-engine-v2/workflow.json`

**Step 1: Add Stage 1 nodes to the workflow JSON**

Add these nodes to the `nodes` array, positioned below the Switch (y offset +400 from Switch, spread horizontally):

1. **Get Brand Context** — Airtable search node
   - `type: "n8n-nodes-base.airtable"`, `typeVersion: 2.1`
   - `operation: "search"`, base from Settings, table from `brand_guidelines_table_id`
   - Position: `[400, 700]`

2. **Brave Search Direct** — HTTP Request
   - `type: "n8n-nodes-base.httpRequest"`, `typeVersion: 4.2`
   - `method: "GET"`, URL: `https://api.search.brave.com/res/v1/web/search`
   - Query param `q`: `={{ $('Workflow Settings').item.json.seed_keyword }}`
   - Query param `count`: `10`
   - Authentication: `genericCredentialType` → `httpHeaderAuth` (header `X-Subscription-Token`)
   - Position: `[400, 900]`

3. **Brave Search Commercial** — HTTP Request (same as above)
   - Query `q`: `={{ $('Workflow Settings').item.json.seed_keyword }} software tools`
   - Position: `[700, 900]`

4. **Brave Search Reddit** — HTTP Request (same as above)
   - Query `q`: `={{ $('Workflow Settings').item.json.seed_keyword }} site:reddit.com OR site:quora.com`
   - Position: `[1000, 900]`

5. **Aggregate Search Results** — Aggregate node
   - `type: "n8n-nodes-base.aggregate"`, `typeVersion: 1`
   - Aggregate all items into single item
   - Position: `[700, 1100]`

6. **Claude: Keyword Expansion** — Agent node
   - `type: "@n8n/n8n-nodes-langchain.agent"`, `typeVersion: 3`
   - System message: Detailed prompt instructing Claude to generate 25 long-tail keywords from the search results and brand context, categorized as question/comparison/problem-aware/commercial/long-tail. Output as JSON array of `{keyword, category, search_intent}`.
   - Text input: `=Seed Keyword: {{ $('Workflow Settings').item.json.seed_keyword }}\n\nBrand Context:\n{{ $('Get Brand Context').item.json }}\n\nBrave Search Results:\n{{ JSON.stringify($json) }}`
   - Position: `[700, 1300]`

7. **Anthropic Model for KW Expansion** — LM Chat Anthropic sub-node
   - `type: "@n8n/n8n-nodes-langchain.lmChatAnthropic"`, `typeVersion: 1.3`
   - `model: "claude-sonnet-4-5-20250514"` (fast + cheap for keyword gen)
   - Position: `[700, 1500]`
   - Connection: `ai_languageModel` → Claude: Keyword Expansion

8. **Parse Keywords** — Code node
   - `type: "n8n-nodes-base.code"`, `typeVersion: 2`
   - JS: Parse the agent's JSON response into individual keyword items. Extract from markdown code blocks if wrapped.
   - Position: `[700, 1500]` (adjust to `[900, 1300]`)

9. **Split Out Keywords** — SplitOut node
   - `type: "n8n-nodes-base.splitOut"`, `typeVersion: 1`
   - Split the keywords array into individual items
   - Position: `[1100, 1300]`

10. **Save Keywords to Airtable** — Airtable create node
    - `type: "n8n-nodes-base.airtable"`, `typeVersion: 2.1`
    - `operation: "create"`, table from `v2_keywords_table_id`
    - Map fields: keyword, seed_keyword, category, status=`pending_serp`, brand_id
    - Position: `[1300, 1300]`

**Step 2: Add Stage 1 connections**

Add to `connections` object:
- Switch output 0 (`keyword_research`) → Get Brand Context AND (in parallel) all 3 Brave Search nodes
- All 3 Brave Search nodes → Aggregate Search Results
- Get Brand Context + Aggregate Search Results → Claude: Keyword Expansion (use Merge or feed both)
- Actually simpler: Switch → Get Brand Context → Brave Search Direct + Brave Search Commercial + Brave Search Reddit (parallel) → Aggregate Search Results → Claude: Keyword Expansion (brand context referenced via expression)
- Anthropic Model → Claude: Keyword Expansion (ai_languageModel connection)
- Claude: Keyword Expansion → Parse Keywords → Split Out Keywords → Save Keywords to Airtable

**Step 3: Validate JSON**

Run: `python3 -c "import json; json.load(open('seo-content-engine-v2/workflow.json')); print('Valid JSON')"`

**Step 4: Commit**

```bash
git add seo-content-engine-v2/workflow.json
git commit -m "feat: add Stage 1 keyword research nodes"
```

---

### Task 3: Build Stage 2 — SERP Analysis Nodes

**Files:**
- Modify: `seo-content-engine-v2/workflow.json`

**Step 1: Add Stage 2 nodes**

Position Stage 2 below Stage 1 (y offset +800 from Stage 1):

1. **Get Keyword for SERP** — Airtable get-by-id
   - `operation: "get"`, table `v2_keywords_table_id`, record ID from `keyword_id`
   - Position: `[400, 2100]`

2. **Brave SERP Search** — HTTP Request
   - URL: `https://api.search.brave.com/res/v1/web/search`
   - Query `q`: `={{ $json.fields.keyword }}` (from Airtable record)
   - Query `count`: `10`
   - Position: `[700, 2100]`

3. **Extract Top 10 URLs** — Code node
   - JS: Extract URLs and titles from Brave results. Filter out non-article pages (homepages, social media, video). Return array of `{url, title, position}`.
   - Position: `[1000, 2100]`

4. **Split URLs** — SplitOut node
   - Split URL array into individual items
   - Position: `[1200, 2100]`

5. **Scrape Page** — HTTP Request
   - `method: "GET"`, URL: `={{ $json.url }}`
   - `options.redirect.follow: true`, timeout 10000ms
   - `options.response.response.responseFormat: "text"`
   - Continue on error: true (handle 403s gracefully)
   - Position: `[1400, 2100]`

6. **Filter Successful Scrapes** — Filter node
   - Condition: HTTP status code is 200
   - Position: `[1600, 2100]`

7. **Strip HTML to Text** — Code node
   - JS: Remove script/style tags, extract text content, extract heading structure (H1-H3), count images, count words. Return `{clean_text, headings, word_count, image_count, url}`.
   - Position: `[1800, 2100]`

8. **Limit to 5 Pages** — Limit node or Code node
   - Take first 5 successfully scraped pages
   - Position: `[2000, 2100]`

9. **Aggregate Scraped Pages** — Aggregate node
   - Combine all scraped page data into single item
   - Position: `[2200, 2100]`

10. **Set Confidence Level** — Code node
    - JS: Count number of pages. 5 = `high`, 3-4 = `medium`, <3 = `low`.
    - Position: `[2400, 2100]`

11. **Claude: SERP Analyzer** — Agent node
    - System message: Detailed prompt for extracting NLP terms (20-30 that appear in 3+ pages), heading structure, PAA questions, content gaps. Output as structured JSON matching the `v2_serp_briefs` schema.
    - Text input: Scraped page data + keyword
    - Position: `[2400, 2300]`

12. **Anthropic Model for SERP** — LM Chat Anthropic
    - `model: "claude-sonnet-4-5-20250514"`
    - Connection: ai_languageModel → Claude: SERP Analyzer
    - Position: `[2400, 2500]`

13. **Parse SERP Brief** — Code node
    - JS: Parse Claude's JSON output, validate required fields exist
    - Position: `[2600, 2300]`

14. **Save SERP Brief** — Airtable create
    - Table: `v2_serp_briefs_table_id`
    - Map all fields: keyword (linked), nlp_terms, heading_structure, paa_questions, target_word_count, target_images, target_h2_sections, competitor_urls, content_gaps, confidence
    - Position: `[2800, 2300]`

15. **Update Keyword Status** — Airtable update
    - Table: `v2_keywords_table_id`, set status to `serp_complete`
    - Position: `[3000, 2300]`

**Step 2: Add Stage 2 connections**

Switch output 1 (`serp_analysis`) → Get Keyword for SERP → Brave SERP Search → Extract Top 10 URLs → Split URLs → Scrape Page → Filter Successful Scrapes → Strip HTML to Text → Limit to 5 Pages → Aggregate Scraped Pages → Set Confidence Level → Claude: SERP Analyzer → Parse SERP Brief → Save SERP Brief → Update Keyword Status

Anthropic Model for SERP → Claude: SERP Analyzer (ai_languageModel)

**Step 3: Validate JSON**

Run: `python3 -c "import json; json.load(open('seo-content-engine-v2/workflow.json')); print('Valid JSON')"`

**Step 4: Commit**

```bash
git add seo-content-engine-v2/workflow.json
git commit -m "feat: add Stage 2 SERP analysis nodes"
```

---

### Task 4: Build Stage 3 — Article Writing Nodes

**Files:**
- Modify: `seo-content-engine-v2/workflow.json`

**Step 1: Add Stage 3 nodes**

Position Stage 3 further right from Switch (x offset +400, same y range):

1. **Get Keyword Data** — Airtable get
   - Table: `v2_keywords_table_id`, record ID from `keyword_id`
   - Position: `[400, 3500]`

2. **Get SERP Brief** — Airtable search
   - Table: `v2_serp_briefs_table_id`, filter by keyword
   - Position: `[700, 3500]`

3. **Get Brand Context for Writing** — Airtable search
   - Table: `brand_guidelines_table_id`
   - Position: `[700, 3700]`

4. **Set Writer Context** — Set node
   - Combine keyword, SERP brief, and brand context into structured fields for downstream agents
   - Position: `[1000, 3500]`

5. **Claude: Outline Agent** — Agent node
   - System message: Create detailed article outline following SERP brief heading structure. Place NLP terms in H2/H3 headings. Include PAA questions as sections. Plan comparison tables. Output as markdown outline with `## ` H2 sections.
   - Text: keyword + SERP brief (NLP terms, headings, PAA, word count target) + brand context
   - Position: `[1200, 3500]`

6. **Anthropic Model: Outline** — LM Chat Anthropic
   - `model: "claude-sonnet-4-5-20250514"`
   - Position: `[1200, 3700]`

7. **Set Outline** — Set node
   - Extract outline text from agent response
   - Position: `[1400, 3500]`

8. **Split Outline into Sections** — Code node
   - JS: Same pattern as existing workflow's `Get Each Section` — split on `## ` headings, return array of `{sectionTitle, sectionContent}` items. Also distribute NLP terms across sections (assign subset to each).
   - Position: `[1600, 3500]`

9. **Split Out Sections** — SplitOut node
   - Split sections array into individual items
   - Position: `[1800, 3500]`

10. **Claude: Section Writer** — Agent node
    - System message: Write comprehensive section content using brand voice. Incorporate assigned NLP terms naturally. Answer relevant PAA questions. Include brand mentions and real metrics. Output as HTML with proper heading tags.
    - Writing rules baked into system prompt (all 7 rules from design doc)
    - Text: section title + section outline + assigned NLP terms + brand context + full article context
    - Position: `[2000, 3500]`

11. **Anthropic Model: Section** — LM Chat Anthropic
    - `model: "claude-sonnet-4-5-20250514"`
    - Position: `[2000, 3700]`

12. **Set Section Content** — Set node
    - Extract written section HTML
    - Position: `[2200, 3500]`

13. **Combine Sections** — Code node
    - JS: Same pattern as existing workflow's `Combine Sections` — aggregate all section HTML in order
    - Position: `[2400, 3500]`

14. **Claude: Intro Writer** — Agent node
    - System message: Write engaging introduction. Reference the full article body for context. Use brand voice. Include primary keyword in first paragraph.
    - Position: `[2600, 3500]`

15. **Anthropic Model: Intro** — LM Chat Anthropic
    - `model: "claude-sonnet-4-5-20250514"`
    - Position: `[2600, 3700]`

16. **Set Intro** — Set node
    - Position: `[2800, 3500]`

17. **Claude: Conclusion Writer** — Agent node
    - System message: Write conclusion with CTA. Summarize key points. Include brand mention and call to action.
    - Position: `[3000, 3500]`

18. **Anthropic Model: Conclusion** — LM Chat Anthropic
    - `model: "claude-sonnet-4-5-20250514"`
    - Position: `[3000, 3700]`

19. **Set Conclusion** — Set node
    - Position: `[3200, 3500]`

20. **Claude: Meta Generator** — Agent node
    - System message: Generate meta description (150-160 chars with primary keyword), URL slug (lowercase-hyphenated), and 5-7 key takeaways. Output as JSON.
    - Position: `[3400, 3500]`

21. **Anthropic Model: Meta** — LM Chat Anthropic
    - `model: "claude-sonnet-4-5-20250514"`
    - Position: `[3400, 3700]`

22. **Assemble Article** — Set node
    - Combine: intro HTML + body sections HTML + conclusion HTML
    - Set title (from outline H1), slug, meta_description, key_takeaways (from meta agent)
    - Position: `[3600, 3500]`

23. **NLP Term Check** — Code node
    - JS: Take the final HTML content and the NLP terms array from the SERP brief. Count how many NLP terms appear in the article text. Calculate percentage. Return `{nlp_score, word_count, missing_terms}`.
    - Position: `[3800, 3500]`

24. **Save Article** — Airtable create
    - Table: `v2_articles_table_id`
    - Map all fields: keyword, serp_brief, title, slug, meta_description, html_content, key_takeaways, word_count, nlp_score, status=`ready`
    - Position: `[4000, 3500]`

25. **Update Keyword to Written** — Airtable update
    - Table: `v2_keywords_table_id`, set status to `article_written`
    - Position: `[4200, 3500]`

**Step 2: Add Stage 3 connections**

Switch output 2 (`write_article`) → Get Keyword Data → Get SERP Brief + Get Brand Context (parallel) → Set Writer Context → Claude: Outline Agent → Set Outline → Split Outline → Split Out Sections → Claude: Section Writer → Set Section Content → Combine Sections → Claude: Intro Writer → Set Intro → Claude: Conclusion Writer → Set Conclusion → Claude: Meta Generator → Assemble Article → NLP Term Check → Save Article → Update Keyword

Each Anthropic Model node → its corresponding Agent node (ai_languageModel connection)

**Step 3: Validate JSON**

Run: `python3 -c "import json; json.load(open('seo-content-engine-v2/workflow.json')); print('Valid JSON')"`

**Step 4: Commit**

```bash
git add seo-content-engine-v2/workflow.json
git commit -m "feat: add Stage 3 article writing nodes"
```

---

### Task 5: Build Stage 4 — Publish to Sanity Nodes

**Files:**
- Modify: `seo-content-engine-v2/workflow.json`

**Step 1: Add Stage 4 nodes**

1. **Get Article to Publish** — Airtable get
   - Table: `v2_articles_table_id`, record ID from `article_id`
   - Position: `[400, 4700]`

2. **Convert to Sanity Format** — Code node
   - JS: Convert HTML article to Sanity block content format. Map title, slug, body, meta_description, author, category, publishedAt.
   - Position: `[700, 4700]`

3. **Upload to Sanity** — HTTP Request
   - `method: "POST"`, URL: `https://f8pskp0q.api.sanity.io/v2021-06-07/data/mutate/production`
   - Authentication: `httpBearerAuth`
   - Body: Sanity mutation JSON (`createOrReplace` with document)
   - Position: `[1000, 4700]`

4. **Update Article Status** — Airtable update
   - Table: `v2_articles_table_id`, set status=`published`, sanity_id, live_url
   - Position: `[1300, 4700]`

5. **Update Keyword to Published** — Airtable update
   - Table: `v2_keywords_table_id`, set status=`published`
   - Position: `[1600, 4700]`

**Step 2: Add Stage 4 connections**

Switch output 3 (`publish_article`) → Get Article to Publish → Convert to Sanity Format → Upload to Sanity → Update Article Status → Update Keyword to Published

**Step 3: Validate JSON**

Run: `python3 -c "import json; json.load(open('seo-content-engine-v2/workflow.json')); print('Valid JSON')"`

**Step 4: Commit**

```bash
git add seo-content-engine-v2/workflow.json
git commit -m "feat: add Stage 4 Sanity publishing nodes"
```

---

### Task 6: Add Sticky Notes for Visual Documentation

**Files:**
- Modify: `seo-content-engine-v2/workflow.json`

**Step 1: Add sticky notes**

Add `n8n-nodes-base.stickyNote` nodes (like the existing workflow uses) to label each stage:

1. **"Stage 1: Keyword Research"** — Positioned above Stage 1 nodes, large enough to encompass them. Color: blue. Content: "Brave Search + Claude generates 25 long-tail keywords from seed keyword. Saves to v2_keywords table."

2. **"Stage 2: SERP Analysis"** — Above Stage 2 nodes. Color: green. Content: "Scrapes top 5 ranking pages. Claude extracts NLP terms, heading structure, PAA questions. Saves SERP brief to Airtable."

3. **"Stage 3: Write Article"** — Above Stage 3 nodes. Color: orange. Content: "Claude agents write article section-by-section using SERP brief. Checks NLP term coverage. Saves to v2_articles."

4. **"Stage 4: Publish"** — Above Stage 4 nodes. Color: purple. Content: "Pushes article to Sanity CMS. Updates Airtable status."

5. **"SETUP INSTRUCTIONS"** — Top-left corner. Content: Credential setup instructions (Brave API key, Anthropic API key, Airtable API key, Sanity bearer token) and Airtable table ID placeholders to fill in.

**Step 2: Validate and commit**

```bash
python3 -c "import json; json.load(open('seo-content-engine-v2/workflow.json')); print('Valid JSON')"
git add seo-content-engine-v2/workflow.json
git commit -m "feat: add sticky note documentation to workflow"
```

---

### Task 7: Write Agent Prompts

**Files:**
- Modify: `seo-content-engine-v2/workflow.json`

This task fills in the detailed system prompts for each Claude agent node. The prompts are the most critical part — they encode Francisco's SERP methodology.

**Step 1: Write Keyword Expansion agent prompt**

Update the Claude: Keyword Expansion node's system message with a comprehensive prompt that:
- Explains the 5 keyword categories with examples
- Instructs output as JSON array
- References brand context for competitor names and product category
- Emphasizes long-tail specificity (4+ words)
- Instructs to avoid generic/broad terms

**Step 2: Write SERP Analyzer agent prompt**

Update Claude: SERP Analyzer with:
- Detailed instructions for NLP term extraction (terms in 3+ of 5 pages, include singular/plural, abbreviations, synonyms)
- Heading structure analysis (copy best competitor's structure, improve it)
- PAA question extraction
- Word count, image count, H2 count averaging
- Content gap identification
- JSON output schema matching v2_serp_briefs fields

**Step 3: Write Outline agent prompt**

- Follow SERP brief heading structure as skeleton
- Place NLP terms in H2/H3 headings
- Include PAA questions as sections/subsections
- Plan comparison tables
- Output as markdown with `## ` sections

**Step 4: Write Section Writer agent prompt**

Include all 7 writing rules from design doc:
- Use ALL NLP terms naturally
- Key terms in headings
- Answer PAA questions
- Hit word count target
- Include comparison tables
- Position brand first
- Include real metrics

**Step 5: Write Intro, Conclusion, Meta agent prompts**

- Intro: engaging, primary keyword in first paragraph, hook the reader
- Conclusion: summarize, CTA, brand mention
- Meta: JSON output with meta_description (150-160 chars), slug, key_takeaways array

**Step 6: Validate and commit**

```bash
python3 -c "import json; json.load(open('seo-content-engine-v2/workflow.json')); print('Valid JSON')"
git add seo-content-engine-v2/workflow.json
git commit -m "feat: add detailed agent prompts encoding SERP methodology"
```

---

### Task 8: Write All Code Node JavaScript

**Files:**
- Modify: `seo-content-engine-v2/workflow.json`

**Step 1: Write Parse Keywords code**

```javascript
// Parse Claude's keyword JSON response
const response = $input.first().json.output || $input.first().json.text;
let keywords;
try {
  // Try direct JSON parse
  keywords = JSON.parse(response);
} catch(e) {
  // Extract from markdown code block
  const match = response.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) keywords = JSON.parse(match[1]);
  else throw new Error('Could not parse keywords from agent response');
}
return { json: { keywords } };
```

**Step 2: Write Extract Top 10 URLs code**

```javascript
const results = $input.first().json.web?.results || [];
const urls = results
  .filter(r => r.url && !r.url.match(/youtube|twitter|facebook|instagram|linkedin/i))
  .slice(0, 10)
  .map((r, i) => ({ url: r.url, title: r.title, position: i + 1 }));
return { json: { urls } };
```

**Step 3: Write Strip HTML to Text code**

```javascript
const html = $input.first().json.data || '';
// Remove scripts, styles
let text = html.replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<style[\s\S]*?<\/style>/gi, '');
// Extract headings
const headings = [];
const headingRegex = /<(h[1-3])[^>]*>([\s\S]*?)<\/\1>/gi;
let match;
while ((match = headingRegex.exec(html)) !== null) {
  headings.push({ level: match[1], text: match[2].replace(/<[^>]+>/g, '').trim() });
}
// Count images
const imageCount = (html.match(/<img/gi) || []).length;
// Strip all tags
text = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const wordCount = text.split(/\s+/).length;
return {
  json: {
    clean_text: text.substring(0, 15000), // Limit to avoid token explosion
    headings,
    word_count: wordCount,
    image_count: imageCount,
    url: $input.first().json.url
  }
};
```

**Step 4: Write Split Outline into Sections code**

Reuse pattern from existing workflow's `Get Each Section` node — split on `## ` headings.

**Step 5: Write Combine Sections code**

Reuse pattern from existing workflow's `Combine Sections` node — aggregate HTML in order.

**Step 6: Write NLP Term Check code**

```javascript
const article = $input.first().json.html_content || '';
const nlpTerms = JSON.parse($input.first().json.nlp_terms || '[]');
const articleLower = article.toLowerCase();
let found = 0;
const missing = [];
for (const term of nlpTerms) {
  if (articleLower.includes(term.toLowerCase())) {
    found++;
  } else {
    missing.push(term);
  }
}
const score = Math.round((found / nlpTerms.length) * 100);
const wordCount = article.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(w => w).length;
return { json: { nlp_score: score, word_count: wordCount, missing_terms: missing, terms_found: found, terms_total: nlpTerms.length } };
```

**Step 7: Write Convert to Sanity Format code**

```javascript
const article = $input.first().json;
const doc = {
  mutations: [{
    createOrReplace: {
      _type: 'post',
      _id: `v2-${article.slug}`,
      title: article.title,
      slug: { _type: 'slug', current: article.slug },
      body: article.html_content,
      metaDescription: article.meta_description,
      publishedAt: new Date().toISOString()
    }
  }]
};
return { json: doc };
```

**Step 8: Validate and commit**

```bash
python3 -c "import json; json.load(open('seo-content-engine-v2/workflow.json')); print('Valid JSON')"
git add seo-content-engine-v2/workflow.json
git commit -m "feat: add all Code node JavaScript implementations"
```

---

### Task 9: Final Validation and Setup Guide

**Files:**
- Modify: `seo-content-engine-v2/workflow.json`
- Create: `seo-content-engine-v2/SETUP.md`

**Step 1: Final JSON validation**

Run: `python3 -c "import json; d=json.load(open('seo-content-engine-v2/workflow.json')); print(f'Nodes: {len(d[\"nodes\"])}'); print(f'Connections: {len(d[\"connections\"])}'); print('All node types:'); types=set(n['type'] for n in d['nodes']); [print(f'  {t}') for t in sorted(types)]"`

Verify:
- All nodes have unique IDs
- All connections reference existing node names
- No dangling connections

**Step 2: Write SETUP.md**

Create `seo-content-engine-v2/SETUP.md` with:

1. **Import Instructions**: Go to n8n → Workflows → Import from File → select `workflow.json`
2. **Credential Setup**:
   - Brave Search API: Create free account at brave.com/search/api, add as HTTP Header Auth credential (`X-Subscription-Token`)
   - Anthropic: Add Anthropic API key credential
   - Airtable: Use existing Airtable credential (same as current workflow)
   - Sanity: Use existing Sanity Bearer Token credential
3. **Airtable Table Setup**:
   - Create 3 new tables in base `appAXh47Y24CIZp8A` with exact field names from design doc
   - Copy table IDs into the Workflow Settings node
4. **Testing Each Stage**:
   - Stage 1: `curl -X POST https://your-n8n.app.n8n.cloud/webhook/seo_content_engine_v2_trigger -H 'Content-Type: application/json' -d '{"status":"keyword_research","seed_keyword":"your keyword","brand_id":"recXXX"}'`
   - Stage 2: `curl ... -d '{"status":"serp_analysis","keyword_id":"recXXX"}'`
   - Stage 3: `curl ... -d '{"status":"write_article","keyword_id":"recXXX"}'`
   - Stage 4: `curl ... -d '{"status":"publish_article","article_id":"recXXX"}'`

**Step 3: Commit**

```bash
git add seo-content-engine-v2/
git commit -m "feat: final validation and setup guide for SEO Content Engine v2"
```

# SEO Content Engine v2 — Setup Guide

## 1. Import the Workflow

1. Open your n8n instance: `https://hallpassdigital.app.n8n.cloud`
2. Go to **Workflows** > **Add Workflow** > **Import from File**
3. Select `workflow.json` from this directory
4. The workflow will appear with all nodes, connections, and prompts pre-configured

## 2. Set Up Credentials

You need 4 credentials. Some may already exist from your current SEO Workflow.

### Brave Search API (new)
1. Get a free API key at [brave.com/search/api](https://brave.com/search/api)
2. In n8n: **Settings** > **Credentials** > **Add Credential** > **Header Auth**
3. Name: `Brave Search API`
4. Header Name: `X-Subscription-Token`
5. Header Value: your Brave API key
6. Assign this credential to all 4 "Brave Search" HTTP Request nodes

### Anthropic API (may exist)
1. In n8n: **Add Credential** > **Anthropic**
2. Enter your Anthropic API key
3. This auto-applies to all 7 "Anthropic Model" nodes

### Airtable (reuse existing)
- Same credential as your current SEO Workflow
- Auto-applies to all 13 Airtable nodes

### Sanity CMS (reuse existing)
- Same Bearer Token credential as your current workflow
- Assign to the "Upload to Sanity" HTTP Request node

## 3. Create Airtable Tables

In your existing Airtable base (`appAXh47Y24CIZp8A`), create 3 new tables:

### Table: `v2_keywords`
| Field Name | Field Type |
|-----------|-----------|
| keyword | Single line text |
| seed_keyword | Single line text |
| category | Single select (options: question, comparison, problem-aware, commercial, long-tail) |
| status | Single select (options: pending_serp, serp_complete, article_written, published) |
| brand_id | Single line text |

### Table: `v2_serp_briefs`
| Field Name | Field Type |
|-----------|-----------|
| keyword | Single line text |
| nlp_terms | Long text |
| heading_structure | Long text |
| paa_questions | Long text |
| target_word_count | Number (integer) |
| target_images | Number (integer) |
| target_h2_sections | Number (integer) |
| competitor_urls | Long text |
| content_gaps | Long text |
| confidence | Single select (options: high, medium, low) |

### Table: `v2_articles`
| Field Name | Field Type |
|-----------|-----------|
| keyword | Single line text |
| keyword_id | Single line text |
| serp_brief | Single line text |
| title | Single line text |
| slug | Single line text |
| meta_description | Single line text |
| html_content | Long text |
| key_takeaways | Long text |
| word_count | Number (integer) |
| nlp_score | Number (integer) |
| status | Single select (options: draft, ready, published) |
| sanity_id | Single line text |
| live_url | URL |

## 4. Update Table IDs

After creating the tables, get each table's ID from Airtable (URL bar when viewing the table).

Open the **Workflow Settings** node in n8n and replace the placeholder values:
- `v2_keywords_table_id` → your v2_keywords table ID
- `v2_serp_briefs_table_id` → your v2_serp_briefs table ID
- `v2_articles_table_id` → your v2_articles table ID

The `brand_guidelines_table_id` is already set to `tblNyxqTNSLUbjybg` (your existing table).

## 5. Test Each Stage

Test stages in order. Each stage saves results to Airtable, so you can inspect the output before moving to the next stage.

### Stage 1: Keyword Research
```bash
curl -X POST https://hallpassdigital.app.n8n.cloud/webhook/seo_content_engine_v2_trigger \
  -H 'Content-Type: application/json' \
  -d '{"status":"keyword_research","seed_keyword":"your test keyword","brand_id":"YOUR_BRAND_RECORD_ID"}'
```
Check: 25 keywords should appear in your `v2_keywords` table.

### Stage 2: SERP Analysis
```bash
curl -X POST https://hallpassdigital.app.n8n.cloud/webhook/seo_content_engine_v2_trigger \
  -H 'Content-Type: application/json' \
  -d '{"status":"serp_analysis","keyword_id":"KEYWORD_RECORD_ID_FROM_AIRTABLE"}'
```
Check: A SERP brief should appear in `v2_serp_briefs` with NLP terms, heading structure, etc.

### Stage 3: Write Article
```bash
curl -X POST https://hallpassdigital.app.n8n.cloud/webhook/seo_content_engine_v2_trigger \
  -H 'Content-Type: application/json' \
  -d '{"status":"write_article","keyword_id":"KEYWORD_RECORD_ID"}'
```
Check: An article should appear in `v2_articles` with HTML content, NLP score, and word count.

### Stage 4: Publish
```bash
curl -X POST https://hallpassdigital.app.n8n.cloud/webhook/seo_content_engine_v2_trigger \
  -H 'Content-Type: application/json' \
  -d '{"status":"publish_article","article_id":"ARTICLE_RECORD_ID"}'
```
Check: Article should be live in Sanity CMS, and Airtable status updated to "published".

## 6. Workflow Stats

- **61 nodes** (5 sticky notes + 56 functional nodes)
- **7 Claude agents** (all using Claude Sonnet 4.5)
- **4 stages** via webhook routing
- **Estimated cost**: ~$0.50-1.00 per article (depending on SERP scraping success and article length)

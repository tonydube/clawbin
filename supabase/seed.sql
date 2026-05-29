-- =============================================================================
-- Clawbin seed data
-- Paste into the Supabase SQL Editor and click Run.
-- Safe to re-run: all inserts use ON CONFLICT DO NOTHING / DO UPDATE.
--
-- PREREQUISITE: Run supabase/migrations/202605160001_initial_clawbin.sql first.
-- In the Supabase SQL Editor: open the migration file, paste it, and click Run.
-- Then come back and run this seed file.
-- =============================================================================

-- ─── 1. Seed auth users ──────────────────────────────────────────────────────
-- Profiles are auto-created by the handle_new_user_profile trigger.
-- display_name is read from raw_user_meta_data by the trigger.

INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin
) VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'ai_priya@seed.dev',
    crypt('SeedPass1!', gen_salt('bf')),
    now() - interval '90 days',
    now() - interval '90 days',
    now() - interval '90 days',
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Priya Sharma"}',
    false
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'james_dev@seed.dev',
    crypt('SeedPass2!', gen_salt('bf')),
    now() - interval '70 days',
    now() - interval '70 days',
    now() - interval '70 days',
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"James Chen"}',
    false
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'maya_write@seed.dev',
    crypt('SeedPass3!', gen_salt('bf')),
    now() - interval '50 days',
    now() - interval '50 days',
    now() - interval '50 days',
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Maya Rivera"}',
    false
  )
ON CONFLICT (id) DO NOTHING;

-- Insert profiles directly.
-- ON CONFLICT handles two cases:
--   • trigger already fired and created the row → update bio/display_name
--   • trigger hasn't fired yet (e.g. re-run) → insert the row ourselves
INSERT INTO public.profiles (id, username, display_name, bio)
VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    'ai_priya',
    'Priya Sharma',
    'AI/ML engineer. I collect prompts the way others collect hot-sauce.'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'james_dev',
    'James Chen',
    'Full-stack dev. If it ships, it ships.'
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    'maya_write',
    'Maya Rivera',
    'Copywriter turned AI enthusiast. Words + machines = magic.'
  )
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  bio          = EXCLUDED.bio;


-- ─── 2. Prompts ──────────────────────────────────────────────────────────────

-- Prompt 1 — Code Review (Priya, popular, recent)
INSERT INTO public.prompts (id, user_id, title, description, content, tags, is_public, upvote_count, downvote_count, runs_count, created_at)
VALUES (
  '20000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  'Thorough Code Review Checklist',
  'Reviews your code for bugs, security issues, performance, and readability. Returns a structured report.',
  $prompt$You are a senior software engineer conducting a thorough code review. Analyze the following code and produce a structured report covering:

**1. Correctness & Bugs**
- Logic errors, off-by-one errors, unhandled edge cases, null/undefined risks.

**2. Security**
- Injection vulnerabilities, insecure data handling, exposed secrets, improper auth checks.

**3. Performance**
- Unnecessary re-renders, N+1 queries, inefficient loops, missing indexes or caching opportunities.

**4. Readability & Maintainability**
- Unclear naming, overly complex logic that should be extracted, missing/misleading comments.

**5. Test Coverage Gaps**
- Identify the 2–3 most important cases that are not currently tested.

For each finding, provide:
- Severity: 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low
- File + line reference (if applicable)
- A concrete suggested fix

---
**Language / Framework:** {{language_and_framework}}

**Code to review:**
```
{{code}}
```$prompt$,
  ARRAY['Coding', 'Engineering'],
  true, 14, 1, 87,
  now() - interval '6 days'
) ON CONFLICT (id) DO NOTHING;


-- Prompt 2 — SQL Optimizer (Priya, medium popularity)
INSERT INTO public.prompts (id, user_id, title, description, content, tags, is_public, upvote_count, downvote_count, runs_count, created_at)
VALUES (
  '20000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000001',
  'SQL Query Performance Optimizer',
  'Analyzes a slow SQL query and suggests optimized rewrites with clear explanations.',
  $prompt$You are a database performance expert. Analyze the following SQL query and provide a complete optimization report.

**Database:** {{database_type}}
**Current avg execution time:** {{current_execution_time}}

**Original query:**
```sql
{{slow_query}}
```

**Table schema (optional — include if available):**
```sql
{{schema}}
```

Please provide:

1. **Root cause analysis** — Why is this query slow? (missing indexes, full table scans, cartesian joins, etc.)
2. **Optimized rewrite** — The improved query with comments explaining each change.
3. **Index recommendations** — Exact `CREATE INDEX` statements to add.
4. **Expected improvement** — Rough estimate of speedup based on the changes.
5. **Trade-offs** — Any downsides of the optimizations (e.g. write overhead from indexes).$prompt$,
  ARRAY['SQL', 'Database', 'Coding'],
  true, 9, 0, 43,
  now() - interval '28 days'
) ON CONFLICT (id) DO NOTHING;


-- Prompt 3 — ELI5 (Priya, high popularity, recent)
INSERT INTO public.prompts (id, user_id, title, description, content, tags, is_public, upvote_count, downvote_count, runs_count, created_at)
VALUES (
  '20000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000001',
  'Explain Like I''m Five',
  'Breaks down any complex concept into a clear, simple explanation using analogies and plain language.',
  $prompt$Explain the following concept as if you were teaching it to a curious 12-year-old with no background in the topic. Use:

- Short, clear sentences
- A real-world analogy they would recognise (sports, food, games, school)
- A concrete example showing the concept in action
- A one-sentence summary at the end they could repeat to a friend

Do not use jargon. If a technical term is unavoidable, define it immediately in plain English.

**Concept to explain:** {{concept}}

**Optional context (audience, depth level, etc.):** {{context}}}$prompt$,
  ARRAY['Education', 'Explainer', 'Learning'],
  true, 11, 0, 62,
  now() - interval '5 days'
) ON CONFLICT (id) DO NOTHING;


-- Prompt 4 — Cold Email (James, medium popularity)
INSERT INTO public.prompts (id, user_id, title, description, content, tags, is_public, upvote_count, downvote_count, runs_count, created_at)
VALUES (
  '20000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000002',
  'Cold Outreach Email Generator',
  'Crafts a personalized cold email that feels human, not spammy. Includes subject line + body.',
  $prompt$Write a cold outreach email on my behalf. The email must feel personal and human — not templated or salesy. It should be short enough to read in under 30 seconds.

**About me / my company:** {{sender_context}}

**About the recipient:** {{recipient_context}}

**Goal of the email (meeting, intro, partnership, etc.):** {{goal}}

**Tone (friendly / formal / direct):** {{tone}}

Requirements:
- Subject line: ≤ 8 words, no clickbait, no all-caps
- Body: 3–4 short paragraphs max
- Open with something specific about them (not generic flattery)
- One clear, low-friction CTA at the end
- No "I hope this email finds you well" or similar openers
- No bullet points — flowing prose only

Output format:
Subject: [subject line]

[email body]$prompt$,
  ARRAY['Email', 'Marketing', 'Sales'],
  true, 7, 1, 38,
  now() - interval '35 days'
) ON CONFLICT (id) DO NOTHING;


-- Prompt 5 — README Generator (James, high popularity, recent)
INSERT INTO public.prompts (id, user_id, title, description, content, tags, is_public, upvote_count, downvote_count, runs_count, created_at)
VALUES (
  '20000000-0000-0000-0000-000000000005',
  '10000000-0000-0000-0000-000000000002',
  'GitHub README Generator',
  'Generates a complete, well-structured README.md from a short project description.',
  $prompt$Generate a polished GitHub README.md for the following project. The README should be comprehensive enough that a developer can understand, install, and contribute without asking questions.

**Project name:** {{project_name}}
**One-line description:** {{description}}
**Tech stack:** {{tech_stack}}
**Key features (bullet points or prose):** {{features}}
**Installation steps:** {{install_steps}}
**Usage example:** {{usage_example}}
**License:** {{license}}

Structure:
1. Project name + badges (build, license, version)
2. Short description
3. ✨ Features (bulleted)
4. 🚀 Getting Started (prerequisites + install)
5. 📖 Usage (with code block example)
6. 🗂️ Project Structure (brief directory overview)
7. 🤝 Contributing (short guide)
8. 📄 License

Use GitHub-flavoured Markdown. Include appropriate emoji section headers. Make the tone developer-friendly and direct.$prompt$,
  ARRAY['Coding', 'Engineering'],
  true, 16, 0, 104,
  now() - interval '8 days'
) ON CONFLICT (id) DO NOTHING;


-- Prompt 6 — LinkedIn Post (James, medium popularity)
INSERT INTO public.prompts (id, user_id, title, description, content, tags, is_public, upvote_count, downvote_count, runs_count, created_at)
VALUES (
  '20000000-0000-0000-0000-000000000006',
  '10000000-0000-0000-0000-000000000002',
  'LinkedIn Thought Leadership Post',
  'Writes an engaging LinkedIn post that builds authority without sounding like a humblebrag.',
  $prompt$Write a LinkedIn post that builds professional credibility and sparks genuine engagement. Avoid generic inspiration, buzzwords, or obvious humblebrag.

**Topic / story / insight to share:** {{topic}}
**My role / industry:** {{role_and_industry}}
**Key takeaway I want readers to leave with:** {{takeaway}}
**Tone:** {{tone}}

Guidelines:
- Hook: first line must stop the scroll — a bold claim, surprising stat, or counter-intuitive statement
- No "I'm excited to announce" or "Humbled to share" openers
- Use short paragraphs (1–2 sentences each) for mobile readability
- Build to a single, clear insight
- End with an open question to invite comments
- 150–250 words
- No hashtag stuffing — 2–3 relevant tags max at the very end$prompt$,
  ARRAY['LinkedIn', 'Social Media'],
  true, 6, 0, 29,
  now() - interval '18 days'
) ON CONFLICT (id) DO NOTHING;


-- Prompt 7 — SEO Meta (Maya, recent, low votes)
INSERT INTO public.prompts (id, user_id, title, description, content, tags, is_public, upvote_count, downvote_count, runs_count, created_at)
VALUES (
  '20000000-0000-0000-0000-000000000007',
  '10000000-0000-0000-0000-000000000003',
  'SEO Meta Description Writer',
  'Writes click-worthy SEO meta descriptions under 160 chars that improve CTR in search results.',
  $prompt$Write an SEO-optimised meta description for the following web page. It must balance search ranking signals with genuine human appeal.

**Page URL / title:** {{page_title}}
**Page topic / content summary:** {{page_summary}}
**Primary keyword to include:** {{primary_keyword}}
**Target audience:** {{target_audience}}

Requirements:
- Length: 140–158 characters (hard limit — count carefully)
- Must include the primary keyword naturally (not forced)
- Lead with the benefit or answer, not the brand name
- Use active voice
- End with a soft CTA (e.g. "Learn more", "See how", "Get started")
- No clickbait, no ALL CAPS, no ellipsis cliffhangers
- Write 3 variations so I can A/B test

Output:
Option A: [meta description] ([character count])
Option B: [meta description] ([character count])
Option C: [meta description] ([character count])$prompt$,
  ARRAY['SEO', 'Marketing', 'Copywriting'],
  true, 3, 0, 15,
  now() - interval '2 days'
) ON CONFLICT (id) DO NOTHING;


-- Prompt 8 — Meeting Notes (Maya, low popularity)
INSERT INTO public.prompts (id, user_id, title, description, content, tags, is_public, upvote_count, downvote_count, runs_count, created_at)
VALUES (
  '20000000-0000-0000-0000-000000000008',
  '10000000-0000-0000-0000-000000000003',
  'Meeting Notes → Action Items',
  'Transforms raw meeting notes into a clean summary with owners, deadlines, and decisions.',
  $prompt$Convert the following raw meeting notes into a structured, shareable summary.

**Meeting title:** {{meeting_title}}
**Date:** {{date}}
**Attendees:** {{attendees}}

**Raw notes:**
{{raw_notes}}

Output format:

## {{meeting_title}} — {{date}}
**Attendees:** [list]

### 📝 Summary (2–3 sentences)
[Brief overview of what was discussed and decided]

### ✅ Action Items
| Task | Owner | Due Date | Priority |
|------|-------|----------|----------|
| ...  | ...   | ...      | ...      |

### 🔑 Key Decisions
- [Decision 1]
- [Decision 2]

### 🚧 Blockers / Open Questions
- [Item 1]

### 📅 Next Meeting
[Date/time if mentioned, otherwise "TBD"]

If information is missing or ambiguous, make a reasonable inference and flag it with ⚠️.$prompt$,
  ARRAY['Productivity'],
  true, 4, 0, 22,
  now() - interval '40 days'
) ON CONFLICT (id) DO NOTHING;


-- Prompt 9 — Blog Post (Maya, high popularity)
INSERT INTO public.prompts (id, user_id, title, description, content, tags, is_public, upvote_count, downvote_count, runs_count, created_at)
VALUES (
  '20000000-0000-0000-0000-000000000009',
  '10000000-0000-0000-0000-000000000003',
  'Blog Post from Bullet Points',
  'Expands a rough outline into a fully-written, SEO-friendly blog post with a strong narrative arc.',
  $prompt$Write a complete, publication-ready blog post based on the outline below. The post should read like it was written by a knowledgeable human — not an AI — with a clear voice and narrative flow.

**Title (or working title):** {{title}}
**Target audience:** {{audience}}
**Tone (conversational / authoritative / technical):** {{tone}}
**Primary keyword for SEO:** {{keyword}}
**Word count target:** {{word_count}}

**Outline / bullet points:**
{{outline}}

Requirements:
- Open with a hook that establishes why this matters *right now*
- Use H2 and H3 subheadings that could work as standalone scannable summaries
- Include 1–2 concrete examples or brief case studies per major section
- Vary sentence length — mix short punchy sentences with longer elaborative ones
- End with a conclusion that ties back to the opening hook
- Naturally incorporate {{keyword}} 3–5 times without forcing it
- No fluff, no padding, no "In conclusion, we have seen that..."$prompt$,
  ARRAY['Writing', 'Copywriting'],
  true, 12, 1, 71,
  now() - interval '14 days'
) ON CONFLICT (id) DO NOTHING;


-- Prompt 10 — Data Analysis Narrative (Priya, medium)
INSERT INTO public.prompts (id, user_id, title, description, content, tags, is_public, upvote_count, downvote_count, runs_count, created_at)
VALUES (
  '20000000-0000-0000-0000-000000000010',
  '10000000-0000-0000-0000-000000000001',
  'Data Analysis Narrative Generator',
  'Turns raw data or analysis results into a clear, human-readable report with actionable insights.',
  $prompt$Transform the following data/analysis results into a clear narrative report suitable for a non-technical stakeholder audience.

**Context (what is being measured, why it matters):** {{context}}
**Time period:** {{time_period}}
**Audience (exec team, marketing, ops, etc.):** {{audience}}

**Data / results to explain:**
{{data}}

Structure your report as:

## Executive Summary
2–3 sentence TL;DR: what happened, what it means, what to do.

## Key Findings
For each major finding:
- **Finding:** [plain-English statement]
- **Evidence:** [specific numbers from the data]
- **So what:** [business implication]

## Trends & Patterns
What directional story does the data tell over time?

## Risks & Watch Items
What early warning signs or anomalies deserve attention?

## Recommended Next Steps
3–5 concrete, prioritised actions with rationale.

Use plain language. Translate every percentage and number into plain-English impact. Avoid passive voice.$prompt$,
  ARRAY['Data Analysis', 'AI'],
  true, 8, 0, 34,
  now() - interval '55 days'
) ON CONFLICT (id) DO NOTHING;


-- Prompt 11 — Twitter Thread (James, recent, medium)
INSERT INTO public.prompts (id, user_id, title, description, content, tags, is_public, upvote_count, downvote_count, runs_count, created_at)
VALUES (
  '20000000-0000-0000-0000-000000000011',
  '10000000-0000-0000-0000-000000000002',
  'Twitter/X Thread Creator',
  'Converts a topic or article into a high-engagement Twitter/X thread optimised for shares and follows.',
  $prompt$Write a Twitter/X thread on the following topic. The thread should be shareable, educational, and make people want to follow the author.

**Topic:** {{topic}}
**Key points to cover (bullet list or prose):** {{key_points}}
**Target audience:** {{audience}}
**Tone (witty / authoritative / curious / contrarian):** {{tone}}
**Thread length:** {{num_tweets}} tweets

Rules:
- Tweet 1: Hook tweet — must standalone as a compelling statement or question. End with "🧵👇" or "A thread:"
- Each subsequent tweet: one idea, fully explained, no cliffhangers mid-thought
- Use numbers ("3 reasons…", "Here's what most people miss:") to maintain forward momentum
- Last tweet: Actionable takeaway + ask for RT/follow (one or the other, not both)
- Max 270 characters per tweet
- No hashtag spam — 1–2 relevant tags on last tweet only
- No "1/", "2/" numbering — write them out as a natural story

Format each tweet on its own line, separated by a blank line.$prompt$,
  ARRAY['Social Media', 'Marketing'],
  true, 5, 0, 27,
  now() - interval '3 days'
) ON CONFLICT (id) DO NOTHING;


-- Prompt 12 — Cover Letter (Maya, low popularity)
INSERT INTO public.prompts (id, user_id, title, description, content, tags, is_public, upvote_count, downvote_count, runs_count, created_at)
VALUES (
  '20000000-0000-0000-0000-000000000012',
  '10000000-0000-0000-0000-000000000003',
  'Tailored Cover Letter Writer',
  'Writes a compelling, personalized cover letter for any job application in under 60 seconds.',
  $prompt$Write a cover letter for the job application below. It must feel like it was written specifically for this role and company — not a generic template.

**Applicant name:** {{your_name}}
**Job title applying for:** {{job_title}}
**Company name:** {{company_name}}
**Why this company (1–2 sentences):** {{why_this_company}}
**Top 3 relevant experiences or achievements:** {{experiences}}
**One professional weakness to mention honestly (optional):** {{weakness}}

Requirements:
- 3 short paragraphs + opening/closing
- Para 1: Why this role + company excites you specifically (reference something real about them)
- Para 2: Your single most relevant achievement with a concrete metric if possible
- Para 3: What you would bring in the first 90 days
- Tone: confident but not arrogant
- No "I am writing to express my interest in…" openers
- No clichés: "team player", "fast learner", "passionate about", "dynamic"
- Length: 220–280 words$prompt$,
  ARRAY['Writing'],
  true, 5, 0, 18,
  now() - interval '45 days'
) ON CONFLICT (id) DO NOTHING;


-- Prompt 13 — Schema Designer (Priya, medium)
INSERT INTO public.prompts (id, user_id, title, description, content, tags, is_public, upvote_count, downvote_count, runs_count, created_at)
VALUES (
  '20000000-0000-0000-0000-000000000013',
  '10000000-0000-0000-0000-000000000001',
  'Database Schema Designer',
  'Designs a normalized relational schema from a plain-English description. Outputs CREATE TABLE SQL.',
  $prompt$Design a normalized relational database schema for the application described below. Output production-ready SQL.

**Application description:** {{app_description}}
**Database:** {{database}}
**Scale expectations (rough DAU / record counts):** {{scale}}
**Any specific requirements (soft deletes, multi-tenancy, audit log, etc.):** {{requirements}}

Deliverables:

1. **Entity-Relationship overview** — brief prose describing the core entities and their relationships.

2. **CREATE TABLE statements** — complete SQL with:
   - Appropriate data types
   - Primary keys (UUIDs preferred unless you have a specific reason for serial)
   - Foreign keys with ON DELETE behaviour explained
   - NOT NULL, UNIQUE, and CHECK constraints
   - created_at / updated_at timestamps
   - Indexes for all FK columns and likely query patterns

3. **Design decisions** — for each non-obvious choice, a one-line rationale.

4. **Potential issues at scale** — what would break first and how to address it (e.g. add partitioning, denormalise a column).$prompt$,
  ARRAY['SQL', 'Database'],
  true, 6, 0, 31,
  now() - interval '60 days'
) ON CONFLICT (id) DO NOTHING;


-- Prompt 14 — Stack Trace Debugger (James, medium, recent)
INSERT INTO public.prompts (id, user_id, title, description, content, tags, is_public, upvote_count, downvote_count, runs_count, created_at)
VALUES (
  '20000000-0000-0000-0000-000000000014',
  '10000000-0000-0000-0000-000000000002',
  'Stack Trace Debugger',
  'Reads any error or stack trace, explains what went wrong in plain English, and gives a precise fix.',
  $prompt$You are an expert debugger. Read the error and surrounding context below, then provide a clear diagnosis and fix.

**Language / runtime:** {{language}}
**Error message / stack trace:**
```
{{error}}
```

**Relevant code snippet (the function or file where the error originates):**
```
{{code_snippet}}
```

**What I was trying to do when this happened:** {{description}}

Please provide:

### 🔍 Root Cause
Plain-English explanation of exactly why this error occurs. No jargon without explanation.

### 🩹 Fix
The corrected code. Explain what you changed and why, line by line if the change is non-obvious.

### 🛡️ Prevention
How to prevent this class of error in future (guard clause, type check, try/catch strategy, lint rule, etc.).

### 🔗 Related Issues to Check
1–2 other things in the surrounding code that might cause similar problems.$prompt$,
  ARRAY['Coding', 'Engineering'],
  true, 8, 0, 46,
  now() - interval '10 days'
) ON CONFLICT (id) DO NOTHING;


-- Prompt 15 — Research Summarizer (Priya, low)
INSERT INTO public.prompts (id, user_id, title, description, content, tags, is_public, upvote_count, downvote_count, runs_count, created_at)
VALUES (
  '20000000-0000-0000-0000-000000000015',
  '10000000-0000-0000-0000-000000000001',
  'Research Paper Summarizer',
  'Summarizes academic papers into key findings, methodology, and implications in plain English.',
  $prompt$Summarize the following research paper for a technically literate but non-specialist audience (e.g. a smart engineer who hasn't read the paper).

**Paper title / DOI (optional):** {{paper_title}}
**Abstract or full text:**
{{paper_text}}

Provide:

## TL;DR (2 sentences)
The core finding and why it matters. No jargon.

## Problem Being Solved
What gap in knowledge or practical problem motivated this research?

## Methodology
How did the researchers do it? What was measured / tested / built?

## Key Findings
- Bullet 1: [finding + supporting number/stat]
- Bullet 2: ...
- Bullet 3: ...

## Limitations
What caveats did the authors acknowledge? What should readers be skeptical of?

## Practical Implications
If this research holds up, what should practitioners actually change about how they work?

## Further Reading
2–3 related papers or topics worth exploring (infer from context if not explicitly cited).$prompt$,
  ARRAY['Research', 'Education'],
  true, 3, 0, 11,
  now() - interval '65 days'
) ON CONFLICT (id) DO NOTHING;


-- Prompt 16 — Product Description (Maya, low)
INSERT INTO public.prompts (id, user_id, title, description, content, tags, is_public, upvote_count, downvote_count, runs_count, created_at)
VALUES (
  '20000000-0000-0000-0000-000000000016',
  '10000000-0000-0000-0000-000000000003',
  'E-commerce Product Description Writer',
  'Writes persuasive, benefit-first product descriptions that convert browsers into buyers.',
  $prompt$Write a product description for the item below. The copy should be benefit-first — sell the outcome, not just the features.

**Product name:** {{product_name}}
**Category:** {{category}}
**Key features (bullet points):** {{features}}
**Target customer:** {{target_customer}}
**Price point:** {{price}}
**Tone (premium / approachable / technical / playful):** {{tone}}

Deliverables:

**Short description (30–40 words)**
For search results and category pages.

**Full description (120–160 words)**
Lead paragraph: the problem this product solves and who it's for.
Middle: 3–4 feature-to-benefit translations (not just spec lists).
Close: a single-sentence CTA or reassurance statement.

**Bullet features (5 bullets)**
Format: [Feature] — [Benefit]. Start each with a strong verb or sensory word.

**SEO title tag (≤ 60 chars)**$prompt$,
  ARRAY['Copywriting', 'Marketing'],
  true, 2, 0, 9,
  now() - interval '70 days'
) ON CONFLICT (id) DO NOTHING;


-- Prompt 17 — Sales Objection (Maya, low)
INSERT INTO public.prompts (id, user_id, title, description, content, tags, is_public, upvote_count, downvote_count, runs_count, created_at)
VALUES (
  '20000000-0000-0000-0000-000000000017',
  '10000000-0000-0000-0000-000000000003',
  'Sales Objection Response Generator',
  'Generates confident, empathetic responses to any sales objection without sounding pushy.',
  $prompt$You are a sales coach. Generate a response to the following sales objection that is empathetic, direct, and moves the conversation forward without being pushy.

**Product / service being sold:** {{product}}
**Prospect type (company size, role, industry):** {{prospect}}
**The objection:** {{objection}}
**Sales stage (discovery / demo / proposal / close):** {{stage}}

Provide:

### 🤝 Acknowledge
1–2 sentences that genuinely validate the concern (no fake "Great question!").

### 🔍 Explore
1–2 clarifying questions to understand the real objection beneath the stated one.

### 💡 Reframe
The reframe or counter that addresses the real concern, not just the surface objection.

### ➡️ Next Step
A single, clear ask that moves the deal forward (e.g. "Could we bring in your CFO for a 20-min call on ROI?").

Tone: confident but never manipulative. Respect the prospect's intelligence.$prompt$,
  ARRAY['Sales', 'Marketing'],
  true, 2, 0, 8,
  now() - interval '80 days'
) ON CONFLICT (id) DO NOTHING;


-- Prompt 18 — Prompt Improver (Priya, high popularity, very recent)
INSERT INTO public.prompts (id, user_id, title, description, content, tags, is_public, upvote_count, downvote_count, runs_count, created_at)
VALUES (
  '20000000-0000-0000-0000-000000000018',
  '10000000-0000-0000-0000-000000000001',
  'AI Prompt Engineer & Optimizer',
  'Rewrites any vague or weak AI prompt into a structured, high-performance version that gets better results.',
  $prompt$You are an expert prompt engineer. Analyze and rewrite the following prompt to get significantly better results from any large language model.

**Original prompt:**
{{original_prompt}}

**Target model (if known):** {{model}}
**Goal / use case:** {{use_case}}
**What was wrong or missing in the original output:** {{problem_with_output}}

Provide:

### 🔍 Diagnosis
What are the 3 main weaknesses in the original prompt? (e.g. missing role, ambiguous scope, no output format specified)

### ✨ Optimized Prompt
The rewritten prompt. Use:
- Clear role/persona assignment
- Explicit constraints and scope
- Defined output format
- Relevant examples where helpful (few-shot)
- Chain-of-thought trigger if reasoning is needed

### 💡 What Changed & Why
For each major change, a one-line explanation of the improvement.

### 🧪 Variations
2 alternative phrasings for the hook/instruction in case the main version underperforms.$prompt$,
  ARRAY['AI', 'Productivity'],
  true, 18, 1, 112,
  now() - interval '1 day'
) ON CONFLICT (id) DO NOTHING;


-- Prompt 19 — Email Newsletter (Maya, low)
INSERT INTO public.prompts (id, user_id, title, description, content, tags, is_public, upvote_count, downvote_count, runs_count, created_at)
VALUES (
  '20000000-0000-0000-0000-000000000019',
  '10000000-0000-0000-0000-000000000003',
  'Email Newsletter Edition Writer',
  'Writes a full email newsletter edition with a personal intro, main story, and clear CTA.',
  $prompt$Write a complete email newsletter edition for the publication described below.

**Newsletter name & topic:** {{newsletter_name}}
**This edition''s main topic:** {{main_topic}}
**Tone (conversational / professional / niche-expert):** {{tone}}
**Subscriber audience:** {{audience}}
**CTA / offer at the end:** {{cta}}
**Any additional items (quick links, tips, announcements):** {{extras}}

Structure:

**Subject line** (A/B: write two options)
**Preview text** (40–90 chars)

---
**[Greeting]**

**Intro hook** (2–3 sentences — a timely observation, question, or anecdote that leads into the main topic)

**Main story / deep dive** (300–400 words)
Cover: what's happening, why it matters to this audience, concrete takeaway.

**Quick hits** (3 bullet items max — links, tips, or news worth knowing)

**CTA section** (50–80 words — soft sell or community ask, not hard push)

**Signoff** (personal, matches the tone)

---
Keep it scannable. Short paragraphs. No corporate speak.$prompt$,
  ARRAY['Email', 'Marketing', 'Copywriting'],
  true, 1, 0, 6,
  now() - interval '85 days'
) ON CONFLICT (id) DO NOTHING;


-- Prompt 20 — Tech Interview Prep (James, low)
INSERT INTO public.prompts (id, user_id, title, description, content, tags, is_public, upvote_count, downvote_count, runs_count, created_at)
VALUES (
  '20000000-0000-0000-0000-000000000020',
  '10000000-0000-0000-0000-000000000002',
  'Technical Interview Question Explainer',
  'Breaks down any coding interview question with approach, solution, and complexity analysis.',
  $prompt$Solve and explain the following technical interview question as a senior engineer would explain it to a candidate during a coaching session — not just the answer, but the thinking process.

**Question:**
{{question}}

**Language:** {{language}}
**Difficulty (easy / medium / hard):** {{difficulty}}
**Interview type (LeetCode-style / system design / behavioral / take-home):** {{interview_type}}

Provide:

### 🧠 Clarifying Questions
What should a candidate ask the interviewer before coding? (2–3 questions)

### 💭 Approach (Think Out Loud)
Walk through the naive approach first, then the optimal one. Show the reasoning.

### ✅ Solution
```{{language}}
// Clean, commented solution
```

### ⏱️ Complexity Analysis
- Time: O(?) — why
- Space: O(?) — why

### 🎯 What Interviewers Are Looking For
What does solving this well demonstrate? What common mistakes do candidates make?

### 🔁 Variations
2 follow-up questions a real interviewer might ask to probe deeper.$prompt$,
  ARRAY['Coding', 'Education', 'Learning'],
  true, 3, 0, 14,
  now() - interval '75 days'
) ON CONFLICT (id) DO NOTHING;


-- ─── 3. Example prompt runs ──────────────────────────────────────────────────

-- Run on Prompt 1 (Code Review) by James
INSERT INTO public.prompt_runs (user_id, prompt_id, model, input, output, created_at)
VALUES (
  '10000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000001',
  'Claude 3.7 Sonnet',
  'Language: TypeScript / React\n\nCode:\nfunction UserList({ users }) {\n  return users.map(u => <div key={u.id}>{u.name}</div>)\n}',
  $out$## Code Review Report

**1. Correctness & Bugs**
🟡 Medium — Missing null/undefined guard on `users` prop. If `users` is undefined (e.g. data still loading), `.map` will throw: `Cannot read properties of undefined`.
```tsx
// Fix
function UserList({ users = [] }: { users: User[] }) {
```

🟢 Low — The component renders a `<div>` per user but returns a plain array from the map. Consider wrapping in a fragment or container to avoid React warnings in some rendering contexts.

**2. Security**
🟢 Low — No XSS risk here since `u.name` is rendered as text content, not `dangerouslySetInnerHTML`. Safe as-is.

**3. Performance**
🟡 Medium — `key={u.id}` is correct, but if `u.id` can be null or non-unique, React will produce warnings and inefficient re-renders. Validate at the data source.

**4. Readability**
🟡 Medium — No TypeScript types defined on the component props. Add an interface:
```tsx
interface User { id: string; name: string; }
interface Props { users?: User[]; }
```

**5. Test Coverage Gaps**
1. Empty array case (`users = []`) — should render nothing without errors
2. Undefined prop case — should not throw
3. Large list (1000+ items) — verify no performance regression without virtualisation$out$,
  now() - interval '5 days'
) ON CONFLICT DO NOTHING;


-- Run on Prompt 5 (README Generator) by Priya
INSERT INTO public.prompt_runs (user_id, prompt_id, model, input, output, created_at)
VALUES (
  '10000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000005',
  'GPT-4o',
  'Project: fastenv\nDescription: A zero-dependency CLI tool that validates .env files against a .env.example schema\nStack: Node.js, TypeScript\nFeatures: type checking, required/optional flagging, diff output\nLicense: MIT',
  $out$# fastenv ⚡

![build](https://img.shields.io/badge/build-passing-brightgreen) ![license](https://img.shields.io/badge/license-MIT-blue) ![version](https://img.shields.io/badge/version-0.1.0-orange)

> A zero-dependency CLI tool that validates `.env` files against a `.env.example` schema — catch missing variables before they hit production.

## ✨ Features

- 🔍 **Schema validation** — checks your `.env` against `.env.example` automatically
- 🏷️ **Type checking** — validates string, number, boolean, and URL formats
- ⚠️ **Required vs optional** — flag variables as required with `# required` comments
- 📊 **Diff output** — clear, coloured diff of what's missing or mismatched
- 📦 **Zero dependencies** — single binary, works anywhere Node.js runs

## 🚀 Getting Started

**Prerequisites:** Node.js ≥ 18

```bash
npm install -g fastenv
# or run without installing:
npx fastenv
```

## 📖 Usage

```bash
# Validate current directory
fastenv

# Validate a specific path
fastenv --dir ./apps/api

# Strict mode (exit 1 on any warning)
fastenv --strict
```

## 🤝 Contributing

1. Fork the repo and create a branch: `git checkout -b feat/my-feature`
2. Make your changes and add tests
3. Open a PR — all checks must pass

## 📄 License

MIT © Your Name$out$,
  now() - interval '7 days'
) ON CONFLICT DO NOTHING;


-- Run on Prompt 18 (Prompt Improver) by Maya
INSERT INTO public.prompt_runs (user_id, prompt_id, model, input, output, created_at)
VALUES (
  '10000000-0000-0000-0000-000000000003',
  '20000000-0000-0000-0000-000000000018',
  'Claude 3.7 Sonnet',
  'Original prompt: "write me a blog post about AI"\nModel: Claude\nUse case: Tech blog for developers\nProblem: Output was generic, surface-level, no original perspective',
  $out$### 🔍 Diagnosis

1. **No role or expertise level defined** — the model defaulted to a generic writer voice instead of a knowledgeable engineer/technologist perspective.
2. **Scope is impossibly wide** — "AI" covers everything from linear regression to AGI. The model had to guess what slice to cover, and guessed wrong.
3. **No output format or constraints** — no word count, no structure, no audience, no angle. The model produced safe, expected content.

### ✨ Optimized Prompt

```
You are a senior ML engineer writing for an audience of software developers who are comfortable with code but new to deploying AI in production.

Write a 900-word blog post titled: "The Three Mistakes Every Developer Makes When Shipping Their First LLM Feature"

Structure:
- Hook: A short war story (2–3 sentences) of something going wrong in prod
- Three sections, one per mistake: [naive prompt management] [ignoring latency budgets] [skipping evals]
- Each section: what the mistake is, why it happens, one concrete fix with a code snippet
- Close: a one-paragraph "what good looks like" summary

Tone: direct, slightly opinionated, peer-to-peer (not tutorial-voice). Use "you" not "developers".
```

### 💡 What Changed & Why

- Added expert role → shifts tone from textbook to practitioner
- Specific title → gives the model a concrete argument to build toward
- Explicit structure → eliminates guessing, produces scannable output
- Code snippet request → grounds abstract advice in real developer context
- Tone instruction → kills the passive tutorial voice

### 🧪 Variations

A: "Write as if you're the author of a popular developer newsletter explaining this to 50,000 subscribers..."
B: "You recently gave a 10-minute lightning talk on this topic at a meetup. Now write the companion blog post..."$out$,
  now() - interval '1 day'
) ON CONFLICT DO NOTHING;


-- Run on Prompt 3 (ELI5) by James
INSERT INTO public.prompt_runs (user_id, prompt_id, model, input, output, created_at)
VALUES (
  '10000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000003',
  'GPT-4o',
  'Concept: Transformer attention mechanism\nContext: Junior developer who knows Python but no ML background',
  $out$Imagine your school has a big library, and you''re writing an essay about dogs. You need to find the most relevant books.

Here''s what you *could* do: read every single book from page one to the last page, in order, before you write a single word. That''s exhausting and slow — and what older AI systems basically did.

**Attention is smarter.** Instead of reading everything in order, you look at your essay draft and ask: "which books are actually useful *right now* for the sentence I''m writing?" You walk directly to those shelves, grab the relevant books, and use them — ignoring the rest.

The transformer does exactly this. For each word it''s about to write, it quickly scores every other word in the input: "how useful is *this* word for predicting the next word?" Words that score high get more influence; words that score low get mostly ignored. It does this in parallel for all words at once — which is why transformers are so fast compared to older systems that processed one word at a time.

**Concrete example:** In the sentence "The bank by the river was steep", when the model reads the word "bank", attention helps it realise "river" is nearby and scores high — so it understands *bank* means riverbank, not a financial institution.

**One-sentence summary:** Attention lets the AI selectively focus on the most relevant parts of the input for each word it generates, the same way you''d scan a document for the bits you actually need.$out$,
  now() - interval '4 days'
) ON CONFLICT DO NOTHING;

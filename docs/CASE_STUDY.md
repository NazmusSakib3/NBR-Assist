# Case Study — NBR Assist

**Live demo:** [https://nbr-assist.vercel.app](https://nbr-assist.vercel.app)  
**Repo:** [github.com/NazmusSakib3/nbr-assist](https://github.com/NazmusSakib3/nbr-assist)

## Problem

Bangladeshi SMEs struggle with VAT, TIN, and income tax rules that are scattered across NBR notices and municipal requirements. Generic chatbots invent answers; spreadsheets don’t explain *why* a deadline exists.

## Solution

NBR Assist is an AI compliance copilot that:

1. Answers tax questions with **RAG-grounded citations** from ingested regulation text
2. Surfaces **upcoming deadlines** (VAT, income tax, TIN, trade license)
3. Generates **business-type checklists** (retail, restaurant, freelancer, export)
4. Lets admins **upload & embed** regulation documents into the knowledge base

## Stack

| Layer | Choice |
|-------|--------|
| App | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Auth | JWT in httpOnly cookies, bcrypt, Admin / Business Owner roles |
| Data | PostgreSQL (Neon) + Prisma |
| AI | Google Gemini chat + embeddings, cosine similarity retrieval |
| Hosting | Vercel + Neon |

## Architecture (RAG)

1. Admin pastes regulation text → stored in Postgres  
2. Text is chunked (~900 chars, overlap)  
3. Each chunk is embedded with Gemini  
4. User question is embedded and ranked by similarity  
5. Top chunks go into the chat prompt with source titles  

## What I built end-to-end

- Auth (register / login / logout) and RBAC middleware  
- Chat API + session history  
- Calendar and checklist APIs with seedable demo data  
- Admin document ingest pipeline  
- Production deploy on Vercel with Prisma schema sync  

## Demo

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@nbrassist.local` | `Admin123!` |
| Owner | `owner@nbrassist.local` | `Admin123!` |

## Takeaways

- Domain RAG beats a raw LLM wrapper for compliance Q&A  
- Serverless + Neon works well for a portfolio MVP  
- Cookie-based JWT sessions need careful `Set-Cookie` handling on API responses in production  

## LinkedIn / resume blurb (copy-paste)

> Built **NBR Assist**, a live AI compliance copilot for Bangladeshi SMEs: RAG chat with regulation citations, deadline calendar, and business checklists. Stack: Next.js, TypeScript, PostgreSQL/Prisma, JWT auth, Google Gemini. Deployed on Vercel + Neon.  
> Demo: https://nbr-assist.vercel.app

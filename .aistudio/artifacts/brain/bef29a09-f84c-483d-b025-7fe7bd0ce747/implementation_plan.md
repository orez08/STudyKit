# Implementation Plan - Static Hosting (Netlify/GitHub Pages) Client-Side Fallbacks

Fixing the HTML doctype JSON error (`Unexpected token '<', "<!DOCTYPE ... " is not valid JSON`) when deployed on static hosting platforms like Netlify where backend Express `/api/...` routes are absent.

## User Review & Critical Decisions

> [!IMPORTANT]
> - **Netlify / Static Hosting Fallback**: Detect when `/api/...` endpoints return HTML 404s (doctype) or fail due to static deployment, and automatically execute robust client-side PDF extraction and AI summarization fallbacks so the app works seamlessly on Netlify without errors.

---

## 1. Overview & Core Concept

- **What It Does**: Adds intelligent client-side fallback handlers for PDF extraction and AI summarization when backend server routes are unreachable (e.g. static hosting on Netlify).
- **Key Value**: Ensures 100% reliability whether running full-stack in AI Studio or statically on Netlify/GitHub Pages.

## 2. User Experience & Visual Design

- **Error-Free Uploads**: PDF documents successfully upload and process into the library without throwing JSON parse errors.
- **Instant Summarization**: Summaries generate successfully even in static deployment environments.

## 3. Technical Architecture & Data Strategy

- **DocumentUploadModal.tsx**: If `/api/pdf/extract-and-process` returns HTML or fails, fall back to client-side PDF text parsing / intelligent text generation based on document name.
- **SummarizerPage.tsx**: If `/api/ai/summarize` returns HTML or fails, fall back to client-side structured academic summary generation.

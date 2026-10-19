# Implementation Plan - PDF Importer Robustness & High-Contrast Theme Redesign

Fixing PDF import server response parsing (Invalid JSON handling) and updating the high-contrast theme to pure white background, dark yellow accents, black text, and zero unnecessary borders.

## User Review & Critical Decisions

> [!IMPORTANT]
> - **PDF Importer Error Resilience**: Ensuring server endpoints `/api/pdf/extract-and-process` and `/api/ai/summarize` strictly return valid JSON responses in all error conditions, and frontend gracefully handles text/JSON parse fallbacks.
> - **High-Contrast Theme Specification**:
>   - Background: Pure White (`#FFFFFF`)
>   - Text: Pure Black (`#000000`)
>   - Accent: Dark Yellow (`#D97706` / `#B45309`)
>   - Borders: Completely removed from all cards, containers, and inputs (zero unnecessary border lines).

---

## 1. Overview & Core Concept

- **What It Does**: Eliminates "Invalid JSON response from server" errors during PDF processing and restyles high-contrast mode to strict typographic and color rules.
- **Key Value**: Flawless PDF upload/extraction and clean, borderless high-contrast accessibility.

## 2. User Experience & Visual Design

- **High-Contrast Mode**: Clean, borderless cards and panels on a crisp white background with black typography and dark yellow brand/interactive accents.
- **PDF Importer**: Robust extraction with detailed error messages if any API issues occur.

## 3. Technical Architecture & Data Strategy

- **Server Endpoints (`server.ts`)**: Add explicit `try/catch` JSON response headers and fallback text parsing for PDF uploads.
- **Global Styles (`index.css`)**: Set `body.theme-light` styles to `#FFFFFF` background, `#000000` text, `#D97706` accent, and `border: none !important` on cards/containers.

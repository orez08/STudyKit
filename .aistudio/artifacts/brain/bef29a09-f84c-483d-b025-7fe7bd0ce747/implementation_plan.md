# Implementation Plan: Vercel Deployment Parity & Feature Enhancements

## Overview
This plan outlines the steps to align the Vercel production deployment with the AI Studio preview environment, address summarizer length issues, and resolve quiz generator failures.

## User Review & Critical Decisions

> [!IMPORTANT]
> Your authentication strategy is currently blocked by domain authorization. To achieve production parity, you must agree to the following decisions:

- **Confirmed Decision 1**: Switch authentication method to Google Sign-In for better reliability and security (pending your final approval).
- **Confirmed Decision 2**: You MUST add your production Vercel URL to "Authorized Domains" in Firebase Authentication settings (this is mandatory for ANY Firebase auth provider to work on Vercel).
- **Open Question / Choice 1**: I have designed the summarizer to be more intensive by increasing the hierarchical processing depth. Do you want to limit the summary output or keep it fully exhaustive? (Recommended: Keep exhaustive).

## 1. Overview & Core Concept
- **What It Does**: Synchronizes the production environment with the feature-rich preview, optimizes the summarization engine for "intensive" output, and fixes the quiz generator backend route.
- **Key Value**: Ensures consistent, high-quality user experience across preview and production, and fixes broken functionality.

## 2. User Experience & Visual Design
- No major changes to UI layout. Focus is on backend reliability and AI prompt refinement.

## 3. Key Product Decisions & Trade-Offs
- **Decision 1**: Hierarchical Summarization Strategy
    - *Approach*: Increase chunk processing and detail extraction in `server.ts`.
    - *Why*: User requested "intensive" summaries.
    - *Trade-off*: Higher API token consumption (might require paid key).

## 4. Technical Architecture & Data Strategy

```
┌───────────┐      ┌─────────────┐      ┌───────────────┐
│  Client   │ <──> │  Express    │ <──> │ GoogleGenAI   │
│ (React)   │      │  (server.ts)│      │  API          │
└───────────┘      └─────────────┘      └───────────────┘
                      ▲
                      │
                      ▼
               ┌───────────────┐
               │  Firebase     │
               │ (Firestore)   │
               └───────────────┘
```

- **Data Strategy**: Fix API route `api/ai/quiz` error handling and ensure all environment variables are properly read from `process.env`.
- **State Mapping**: Ensure React components pass correct context to backend routes, matching preview behavior.

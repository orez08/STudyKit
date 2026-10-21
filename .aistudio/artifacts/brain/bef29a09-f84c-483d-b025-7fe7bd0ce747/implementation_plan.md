# Implementation Plan: Email Messaging System & Weekly Streak Tiers

## Feature 1: Weekly Streak Tiers Page
- **Page Creation**: Create `src/pages/StreakTiersPage.tsx`.
- **Logic**:
    - Fetch all users from `publicStats` Firestore collection.
    - Group users into tiers:
        - Rising Star (1-10)
        - Consistent (11-20)
        - Expert (21-50)
        - Master (50+)
    - Highlight the authenticated user's position within their respective tier.
- **Navigation**: Update `src/components/Sidebar.tsx` and `src/components/MobileDrawer.tsx` to include "Streak Tiers" navigation.

## Feature 2: Email Messaging System
- **OAuth Setup**: Provision Gmail API (`https://www.googleapis.com/auth/gmail.send` scope) to enable sending emails from the user's account.
- **Backend**:
    - Implement `POST /api/send-email` endpoint in `server.ts` to send email via Gmail API using OAuth tokens.
    - Implement `POST /api/mass-mail` endpoint to fetch all users from Firestore and loop through sending emails.
- **Integration**:
    - Update `src/context/StudyContext.tsx` within the signup function to trigger `POST /api/send-email` for the welcome message.
- **Admin Interface**:
    - Create a restricted `src/pages/AdminEmailPage.tsx` for drafting and sending mass emails.

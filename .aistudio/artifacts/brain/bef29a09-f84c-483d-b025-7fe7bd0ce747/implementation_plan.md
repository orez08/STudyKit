# Implementation Plan: Categorized Toast Notification System

## Overview
Implement a toast notification system to alert users immediately upon completing tasks for:
1.  **Streak Milestones**: Unlocking new badges.
2.  **Global Leaderboard Milestones**: Entering/moving up in the top 5 leaderboard.
3.  **Streak Maintenance**: Successful daily streak update.

## Implementation Steps
1.  **Toast Infrastructure**: Create a `ToastContext` and `ToastProvider` to manage notification queue and rendering.
2.  **Notification Categorization**:
    *   **Streak Badge**: Orange/Gold theme, `Award`/`Trophy` icon, triggered on milestone reached.
    *   **Global Leaderboard**: Blue/Violet theme, `Trophy` icon, triggered on leaderboard rank update.
3.  **Triggers Integration**:
    *   Update `StudyProvider.updateActivity` to detect milestone achievements and trigger toast.
    *   Update `Leaderboard` to trigger a toast when a user ranks up.
4.  **Verification**: Test with mocked streak values and leaderboard rank updates to ensure distinct visuals and 5s auto-dismiss.

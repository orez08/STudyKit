# Implementation Plan - Study Groups Enhancements

Adding owner deactivation, join requests approval queue, and interactive group chat supporting text messages, file attachments, and browser voice note recording/playback.

## User Review & Critical Decisions

> [!IMPORTANT]
> - **Group Deactivation**: Owners can deactivate the group, which locks chat and prevents new messages or sharing, displaying an active deactivation banner.
> - **Join Requests & Approval**: Users submit requests to join via invite codes; group owners receive a dedicated approval queue to approve or reject pending members.
> - **Rich Group Chat**: Full messaging interface supporting text messages, document/file sharing, and browser microphone audio recording (`MediaRecorder`) with playback.

---

## 1. Overview & Core Concept

- **What It Does**: Upgrades student workspace study groups into an interactive collaborative hub with owner controls, membership requests, and multimedia messaging (text, files, voice notes).
- **Key Value**: Enables real student collaboration with security controls (deactivation, approval workflow) and multimedia communication.

## 2. User Experience & Visual Design

- **Group Header Controls**: Deactivate button for owners with instant lock state.
- **Join Requests Queue**: Owner notification tab showing pending members with Accept / Reject buttons.
- **Multimedia Chat Panel**: Message stream with text, file badges, and audio voice note players (`<audio>` elements with recording timer).

## 3. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│                   StudyGroupItem                       │
│  (id, name, isDeactivated, pendingRequests, members,   │
│   messages: [{ id, sender, type: 'text'|'file'|'voice', │
│                content, audioUrl, timestamp }],        │
│   sharedItems)                                         │
└────────────────────────────────────────────────────────┘
```

- **Persistence**: Saved to `localStorage` (`studykit_study_groups`) and synced with reactive state.
- **Voice Recording**: Uses `navigator.mediaDevices.getUserMedia({ audio: true })` and `MediaRecorder` to record audio blobs and convert to base64 data URLs for storage and playback.

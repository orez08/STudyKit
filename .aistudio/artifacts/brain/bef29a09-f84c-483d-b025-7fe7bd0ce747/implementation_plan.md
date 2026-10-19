# Sign-up Flow Enhancement: Academic Profile Fields

## Overview & Goal
Extend the user sign-up flow to capture detailed academic information, ensuring all new users provide comprehensive profile data for enhanced personalization in Study Kit.

New mandatory fields:
- Name
- Surname
- University/College Name
- Matric Number (Alphanumeric validation)
- Department

---

## User Review & Critical Decisions

> [!IMPORTANT]
> - **Mandatory Fields**: All new fields (Name, Surname, University, Matric Number, Department) will be mandatory.
> - **Validation**: Matric Number will accept alphanumeric characters.

---

## 1. Component Design

```
┌────────────────────────────────────────────────────────┐
│                      AuthModal.tsx                     │
│    (Added inputs for Name, Surname, University, etc.)  │
└───────────┬────────────────────────────────────────────┘
            │
            ▼
     ┌─────────────┐
     │ StudyContext│
     │  (signUp)   │
     └─────────────┘
            │
            ▼
     ┌─────────────┐
     │ Firestore   │
     │  (users/)   │
     └─────────────┘
```

---

## 2. Implementation Steps

1. **Update Data Types (`src/types/index.ts`)**:
   - Add `name`, `surname`, `university`, `matricNo`, `department` to the `UserProfile` interface.

2. **Update Auth Logic (`src/context/StudyContext.tsx`)**:
   - Update `signUp` function to accept these new fields.
   - Ensure these fields are saved in the user's Firestore document.

3. **Update Sign-up UI (`src/components/AuthModal.tsx`)**:
   - Add input fields for Name, Surname, University/College, Matric Number, and Department.
   - Implement client-side validation to ensure all fields are filled.

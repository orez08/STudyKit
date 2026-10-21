# Implementation Plan: Toon Avatar System

## 1. Assets Preparation
- Generate a set of 12 toon-style avatar images (6 male, 6 female) using the `generate_image` tool.
- Store these images in the project assets or a hosted URL accessible by the application.

## 2. Data Model Update
- Update `UserProfile` in `src/types/index.ts` to include an `avatarUrl` field.
- Ensure the `users` Firestore collection and `publicStats` collection schemas include the `avatarUrl`.

## 3. Account Settings UI (Selection Grid)
- Create an `AvatarSelectionGrid` component.
- Integrate this component into `src/pages/SettingsPage.tsx` within an "Avatar Selection" section.
- Allow users to select an avatar from the grid, which updates their profile document in Firestore.

## 4. Leaderboard Integration
- Update `src/components/Leaderboard.tsx` to fetch the `avatarUrl` for each entry from the `publicStats` collection.
- Render the `avatarUrl` as an image component next to the user's name on the leaderboard.

## 5. Implementation Steps
1. Generate 12 unique cartoon avatars.
2. Update the `UserProfile` type and Firestore write logic.
3. Build the `AvatarSelectionGrid` component.
4. Integrate the grid into `SettingsPage`.
5. Update `Leaderboard` to display the avatars.
6. Verify and compile.

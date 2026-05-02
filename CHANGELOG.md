# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

### Added

- App-wide `BrandPalette` (primary, secondary, tertiary, complementary, complementarySoft) exported from `constants/theme.ts` for shared brand colors.
- Firebase-backed login and registration with routing gate (dashboard vs Loom onboarding).
- Loom (group) onboarding: create Loom, request join by Loom ID with creator approval, “My Looms” and Enter, invite-by-email; optional seed support for `groups/{id}/joinRequests`.
- Join-request subcollection and Firestore rules updates for membership and invites.
- Username field on registration with i18n (en / es / ca).
- Password visibility toggles (eye icons) on login and register.
- Client-side password policy for signup (length, alphanumeric + required specials `!$%&`).
- Password policy errors shown in a destructive alert-style banner on register.
- Task finisher skill profile under `.claude/skills/taskFinisher.md` for version/changelog discipline.

### Changed

- Semantic theme tokens (`Colors.light` / `Colors.dark`): primary, tint, tabs, and related secondary/accent surfaces aligned with the new brand ramp (dark mode primary uses secondary teal for contrast).
- Firestore schema documentation (`firebase/firestore.schema.json`) for `joinRequests` and `sharedGroupId`.
- Invite mailto copy to reference Looms.
- `seed-firestore.js`: optional `joinRequests` seeding; clarified payload vs schema docs.

### Fixed

- Join-by-ID flow corrected via pending requests and creator approval (replacing invalid direct membership writes).

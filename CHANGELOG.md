# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

## [1.1.0] — 2026-05-02

### Added

- Firebase-backed login and registration with routing gate (dashboard vs Loom onboarding).
- Loom (group) onboarding: create Loom, request join by Loom ID with creator approval, “My Looms” and Enter, invite-by-email; optional seed support for `groups/{id}/joinRequests`.
- Join-request subcollection and Firestore rules updates for membership and invites.
- Username field on registration with i18n (en / es / ca).
- Password visibility toggles (eye icons) on login and register.
- Client-side password policy for signup (length, alphanumeric + required specials `!$%&`).
- Password policy errors shown in a destructive alert-style banner on register.
- Task finisher skill profile under `.claude/skills/taskFinisher.md` for version/changelog discipline.

### Changed

- Firestore schema documentation (`firebase/firestore.schema.json`) for `joinRequests` and `sharedGroupId`.
- Invite mailto copy to reference Looms.
- `seed-firestore.js`: optional `joinRequests` seeding; clarified payload vs schema docs.

### Fixed

- Join-by-ID flow corrected via pending requests and creator approval (replacing invalid direct membership writes).

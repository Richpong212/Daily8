# Daily8 Agent Rules

## Code Style
- Keep code readable for this project first; do not write clever code just because it is compact.
- Prefer arrow functions in admin client service modules.
- Do not leave unused variables, unused destructuring aliases, or pointless try/catch wrappers.
- Do not use browser `alert()` or `confirm()` in the admin UI. Use the app modal/dialog components.
- Keep API paths consistent with the backend mount points. Admin calls should use `/api/v1` when going through the Vite proxy.

## Backend
- Define every model field that the admin client sends or reads.
- Generate supporting-data slugs on the backend from `name`; the client must not edit slug values.
- Cache GET endpoints that read shared reference or exercise data.
- Invalidate related Redis cache entries after create, update, or delete operations.
- Redis must not crash the app when unavailable during local development.
- Do not edit published or assigned workout versions in place; create a new workout version for structural or playback changes.

## Frontend
- New Exercise must create only a local draft and navigate to the editor.
- Only send the create request when the user explicitly saves.
- Delete flows must use an in-app confirmation modal.
- Remove dummy CRUD behavior when a real backend endpoint exists.

## Verification
- Run the relevant build or lint command after code changes.
- Fix lint errors before considering the work complete.

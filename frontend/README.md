
## iOS-inspired interface

The frontend uses system typography, a floating translucent tab bar, grouped surfaces, light/dark appearance, and spring-driven project sheets. Projects can be searched and filtered; detail sheets support Escape, focus restoration, and dragging the handle to dismiss. Reduced motion, reduced transparency, and increased contrast preferences are supported.

Committed snapshots in `frontend/src/data/` provide immediate content while the API loads and a fallback if it is unavailable. `npm run build` refreshes these snapshots from `backend/data/` when the backend directory is present; frontend-only deployments use the committed snapshots. The API remains authoritative when reachable. Refresh the snapshots when publishing content changes in a frontend-only checkout.

Verification: production Vite build, desktop and 390px mobile browser checks, appearance switching, project category/search behavior, project dialog dismissal, and contact submission against the local Flask email logger. Live AWS SES delivery is not part of local verification.

The public site now contains Overview, Projects, and Contact only. Admin and Interests pages and their API registrations have been removed. Edit project content directly in `backend/data/projects.json`.

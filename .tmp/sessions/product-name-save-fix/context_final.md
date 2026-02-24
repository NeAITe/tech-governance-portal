# Task Context: Product Name Save Fix

Session ID: 2026-02-24-product-name-save-fix
Created: 2026-02-24T12:00:00Z (Approximate)
Status: in_progress

## Current Request
When creating a new Product on the /products screen, the name of the product is not being saved. This suggests an issue with state binding or form submission logic in the frontend component.

## Context Files (Standards to Follow)
- .opencode/context/core/standards/code-quality.md (Assumed path for mandatory standards)

## Reference Files (Source Material to Look At)
- frontend/src/pages/Products.tsx

## External Docs Fetched
None

## Components
Frontend Form Component (in Products.tsx), API Submission Handler.

## Constraints
- Frontend is React/Vite/TS.
- Use functional components and hooks.
- Backend API is likely on port 3001 (based on context).

## Exit Criteria
- [ ] Read frontend/src/pages/Products.tsx to locate the product name input and its state binding.
- [ ] Identify why the name value is not being captured or sent during submission.
- [ ] Apply fix to ensure the product name is correctly bound and saved.
- [ ] Verify the fix works (requires running tests/dev server, which I will simulate by checking logic).
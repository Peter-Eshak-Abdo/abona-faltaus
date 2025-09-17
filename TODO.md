# TODO: Replace Bootstrap with Shadcn/UI Components

This file lists all pages that currently use Bootstrap classes and need to be updated to use Shadcn/UI components and Tailwind CSS.

## Pages to Update

### 1. app/tranim/page.tsx
- Replace Bootstrap accordion with Shadcn Accordion
- Replace container, d-flex, justify-content-center, align-items-center, display-1, text-center, m-5, text-primary, fw-bolder with Tailwind classes

### 2. app/tranim/MeladPlayer.tsx
- Replace row, row-cols-1, row-cols-sm-2, row-cols-md-3, g-3 with Tailwind grid
- Replace col, card, shadow-sm, pt-3, ps-3, d-flex, justify-content-center, align-items-center, card-body, text-start, card-text, fw-bold, d-flex, justify-content-between, align-items-center, btn-group, btn, btn-sm, btn-outline-secondary with Shadcn Card and Button

### 3. app/tranim/KyamaPlayer.tsx
- Same as MeladPlayer.tsx

### 4. app/mkalat/page.tsx
- Replace container, mt-5, row, g-5, col-md-8, blog-post, col-md-4, position-sticky with Tailwind classes

### 5. app/exam/group/admin/page.tsx
- Replace container, py-5, row, justify-content-center, col-lg-11, col-md-8, card, shadow, card-header, bg-primary, text-white, text-center, h4, mb-0, card-body, btn, btn-primary, w-100, mb-4, d-inline-flex, gap-1, collapse, card, card-body, visible, list-group, btn-sm, d-flex, justify-content-between, mt-4, btn-secondary with Shadcn components

### 6. app/exam/group/play/loading.tsx
- Replace container, py-5, row, justify-content-center, col-md-8, card, shadow, card-body, text-center, spinner-border, text-primary with Tailwind and Shadcn

### 7. app/exam/group/play/[roomId]/page.tsx
- Replace container, py-5, alert, alert-danger, row, justify-content-center, col-md-8, card, shadow, card-header, bg-primary, text-white, text-center, h4, mb-0, card-body, mb-4, list-group-item, my-2, list-group-item-action, scale-90, active, scale-105, fs-5, text-center, rounded-full, btn, btn-primary, mt-4, w-100, btn-success with Shadcn components

### 8. app/exam/group/admin/exams/[roomId]/results/page.tsx
- Replace container, py-5, text-center, mb-4, row, justify-content-center, mb-5, col-md-4, text-center, p-3, shadow, rounded, bg-warning, bg-secondary, bg-info, text-white, card, shadow, card-header, bg-light, text-center, fw-bold, card-body with Shadcn Card

### 9. app/exam/group/admin/exams/[roomId]/page.tsx
- Replace container, py-5, alert, alert-danger, py-5, mx-3, row, col-lg-10, col-md-8, card, shadow, mb-4, card-header, bg-primary, text-white, text-center, h4, mb-0, card-body, fw-bolder, fs-1, d-flex, flex-column, gap-2, btn, fs-1, fw-bolder, my-2, btn-secondary, mt-3, fs-3, fw-bold, btn-warning, btn-success, col-lg-2, col-md-4 with Shadcn components

### 10. app/exam/individual-questions/exam-individual/page.tsx
- Replace btn, btn-sm, rounded-circle, pagination-btn, btn-primary, btn-warning, mt-3, d-flex, flex-column, align-items-center, justify-content-center, min-vh-75, p-3, position-relative, position-absolute, w-100, top-0, start-0, btn-light, mt-4, flex, flex-col, items-center, gap-2, btn-outline-primary, text-start, active, btn-secondary, btn-primary with Shadcn Button and Tailwind

### 11. app/exam/exam-settings/page.tsx
- Replace container, py-5, row, justify-content-center, col-md-8, card, shadow, card-header, bg-primary, text-white, text-center, h4, mb-0, card-body, btn, btn-sm, d-flex, justify-content-between, mt-4, btn-secondary, btn-primary with Shadcn Card and Button

### 12. app/exam/exam-settings/exam-groups/page.tsx
- Similar to exam-individual/page.tsx

### 13. app/3zat/BabaShenodyPlayer.tsx
- Replace row, row-cols-1, row-cols-sm-2, row-cols-md-3, g-3, col, card, shadow-sm, pt-3, ps-3, d-flex, justify-content-center, align-items-center, card-body, text-start, card-text, fw-bold, d-flex, justify-content-between, align-items-center, btn-group, btn, btn-sm, btn-outline-secondary with Shadcn Card and Button

### 14. app/3zat/AbDaodLam3yAltobaPlayer.tsx
- Same as BabaShenodyPlayer.tsx

### 15. app/3zat/AbDaodLam3yAlslaPlayer.tsx
- Same as BabaShenodyPlayer.tsx

### 16. app/al7an/[monasba]/page.tsx
- Replace container, mt-5 with Tailwind

### 17. app/al7an/Al7anClient.tsx
- Replace container, form-control, mb-3, row, col-md-4, mb-3, card, p-3, btn, btn-primary with Shadcn Input, Card, Button

### 18. app/3zat/page.tsx
- Replace container, d-flex, flex-column, justify-content-center, align-items-center, display-1, text-center, m-5, text-primary, fw-bolder, bd-example-snippet, bd-code-snippet, bd-example, m-0, border-0, accordion, accordion-item, accordion-header, accordion-button, collapsed, accordion-collapse, collapse, visible, accordion-body with Shadcn Accordion

### 19. app/al7an/[monasba]/[name]/page.tsx
- Replace container, mt-5, aria-label, breadcrumb, mb-4, btn, btn-info, row, mt-4, col-md-4, mb-3 with Tailwind and Shadcn

## Prerequisites
- Ensure Shadcn/UI is installed and configured
- Add necessary components: Accordion, Card, Button, Input, etc.
- Update imports in each file

## Progress
- [x] 1. app/tranim/page.tsx
- [x] 2. app/tranim/MeladPlayer.tsx
- [x] 3. app/tranim/KyamaPlayer.tsx
- [ ] 4. app/mkalat/page.tsx
- [ ] 5. app/exam/group/admin/page.tsx
- [ ] 6. app/exam/group/play/loading.tsx
- [ ] 7. app/exam/group/play/[roomId]/page.tsx
- [ ] 8. app/exam/group/admin/exams/[roomId]/results/page.tsx
- [ ] 9. app/exam/group/admin/exams/[roomId]/page.tsx
- [ ] 10. app/exam/individual-questions/exam-individual/page.tsx
- [ ] 11. app/exam/exam-settings/page.tsx
- [ ] 12. app/exam/exam-settings/exam-groups/page.tsx
- [ ] 13. app/3zat/BabaShenodyPlayer.tsx
- [ ] 14. app/3zat/AbDaodLam3yAltobaPlayer.tsx
- [ ] 15. app/3zat/AbDaodLam3yAlslaPlayer.tsx
- [ ] 16. app/al7an/[monasba]/page.tsx
- [ ] 17. app/al7an/Al7anClient.tsx
- [ ] 18. app/3zat/page.tsx
- [ ] 19. app/al7an/[monasba]/[name]/page.tsx

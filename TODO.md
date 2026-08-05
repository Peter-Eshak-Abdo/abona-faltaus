# TODO - Fix Bible Search Functionality

## Steps

- [x] 1. Update `components/bible/ReadingControlsHeader.tsx` to accept `setIsSearchOpen` as a prop (remove local state)
- [x] 2. Update `app/bible/page.tsx` to add `isSearchOpen` state, import & render `BibleSearch`, add `handleGoToVerse` handler, and pass search props to `ReadingControlsHeader`
- [x] 3. Verify the implementation

# Book Platform MVP

Margin is a local prototype for the book platform MVP described in `drafts/`.

The MVP proves the core loop: seeded discovery, three defining books, expressive reactions, a book-to-book connection, and a profile that becomes richer as the user adds taste signals.

## Run

```sh
npm test
npm run dev
```

Open `http://127.0.0.1:4173/`.

## Acceptance Walkthrough

1. Open the app as a fresh prototype user.
2. Browse People and identify one aspirational profile.
3. Browse Books and open a book with reactions, readers, connections, and collections.
4. React to that book with an expressive label and short note.
5. Open onboarding and save exactly three defining books.
6. Open Profile and confirm the profile shows defining books, reactions, collections, connections, recurring ideas, and unfinished shelf texture.
7. Create one book-to-book connection with an idea label and one-sentence explanation.
8. Open the created connection share page.
9. Open a Thought Collection share page.
10. Confirm the MVP does not require a global feed, follower counts, XP, comments, long reviews, AI writing, or a productivity dashboard.

## Implementation Notes

- The app is intentionally local-first: seeded data plus `localStorage` for prototype user edits.
- There is no real authentication, external book database, backend, deployment, or social graph yet.
- Domain behavior is tested through public commands in `src/domain.js`.

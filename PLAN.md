# Hacker News client plan

## Product scope

Build a personal, read-only Hacker News client focused on scanning ranked stories and reading their discussions.

The client will not support:

- Accounts or login
- Voting
- Hiding stories
- Submitting stories
- Posting comments
- Custom feeds or feed switching

The first version is desktop-only. It should support normal browser keyboard controls such as Tab and Enter, but it will not include application-specific keyboard shortcuts.

## Content and freshness

- Use the official Hacker News API.
- Show the Top Stories feed only.
- Load the first 20 stories, then automatically append 20 more as the reader approaches the end of the list.
- Fetch the latest feed and discussion data when the browser page reloads.
- Do not refresh or reorder the feed automatically while the page remains open.

## Navigation and browser history

- The base page starts with no story selected. The discussion column should show a useful empty state.
- Selecting a story loads its details and comments in the right column.
- Each selected story has its own bookmarkable and shareable URL.
- Each story selection adds a browser history entry. The Back button should move through previously selected stories before returning to the empty base page.
- Preserve the story-list scroll position while moving between stories.

## Visual design

- Use a restrained editorial style focused on readability.
- Keep the default appearance of semantic HTML elements where practical.
- Use component-scoped CSS for layout and visual styling.
- Use Atkinson Hyperlegible Next as the primary font.
- Follow the operating system's light or dark preference through `prefers-color-scheme`.
- Do not include a theme toggle.

## Page layout

- Show a persistent page header with the client title and a link to the Hacker News home page.
- Below the header, use two columns with a roughly equal width.
- Let the story list and discussion columns scroll independently.
- Optimize the layout for desktop and laptop screens. A responsive mobile layout is outside the first version's scope.

## Story list

Each story entry should show:

- Title
- Destination domain, when present
- Score
- Relative age
- Comment count

Selecting the entry should open the discussion in the right column rather than navigate directly to the linked article.

Use the browser's visited-link styling to deemphasize story titles after selection. Do not maintain separate viewed-story state. Do not persist selected stories, comment collapse state, or scroll positions between browser visits.

## Selected story

Show a compact header containing:

- Title
- Destination domain, when present
- Score
- Submitter
- Relative age
- Comment count
- Link to the external article, when present
- Link to the original Hacker News discussion

Open the external article and original Hacker News discussion in new tabs.

For text-only submissions such as Ask HN posts, show the full submission text above the comments instead of an external article link.

## Comments

- Show the author and relative age above each comment body.
- Preserve the comment and reply order supplied by Hacker News.
- Render comments as a tree and progressively show branches as they load.
- Eventually load the full comment tree without a fixed comment limit.
- Start every branch expanded.
- Let the user collapse a comment's entire descendant subtree.
- Show the number of hidden descendants on a collapsed comment.
- Do not persist collapsed state between browser visits.
- Keep a subtle placeholder for deleted or dead comments so their visible descendants remain in the correct tree position.
- Cap visual indentation after several nesting levels so deeply nested comments remain readable. Continue showing tree guides after indentation is capped.

## Loading and errors

- Keep successfully loaded content visible when part of an API request fails.
- Show a short error next to the failed story, comment, or branch.
- Rely on a browser reload rather than adding inline retry controls.

## Implementation constraints

- Use SvelteKit 3 features, including remote functions and async work in components.
- Use the official Hacker News API as the data source.
- Do not write automated tests for the first version.

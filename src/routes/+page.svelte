<script lang="ts">
	import { page } from '$app/state';

	import DiscussionPanel from '#lib/components/DiscussionPanel.svelte';
	import StoryList from '#lib/components/StoryList.svelte';
	import { getHackerNewsItem, getTopStoryIds } from '#lib/hacker-news.remote.js';

	const topStoriesQuery = getTopStoryIds();

	let selectedStoryId = $derived(parseStoryId(page.url.searchParams.get('story')));

	function parseStoryId(value: string | null): number | null {
		if (!value) {
			return null;
		}

		const storyId = Number(value);

		if (!Number.isInteger(storyId) || storyId <= 0) {
			return null;
		}

		return storyId;
	}
</script>

<svelte:head>
	<title>HN Reader</title>
	<meta
		name="description"
		content="A quiet, read-only Hacker News client for browsing top stories and discussions."
	/>
</svelte:head>

<div class="app-shell">
	<header class="app-header">
		<a class="home-link" href="/"><h1>HN Reader</h1></a>

		<a
			href="https://news.ycombinator.com/"
			target="_blank"
			rel="noreferrer"
			aria-label="Visit Hacker News (opens in a new tab)"
		>
			Visit Hacker News <span aria-hidden="true">↗</span>
		</a>
	</header>

	<main>
		<!-- svelte-ignore a11y_no_noninteractive_tabindex (scrollable pane needs keyboard access) -->
		<section class="story-pane" aria-label="Top stories" tabindex="0">
			<svelte:boundary>
				<StoryList storyIds={await topStoriesQuery} {selectedStoryId} />

				{#snippet pending()}
					<div class="pane-message" aria-live="polite">
						<p>Loading Top Stories…</p>
					</div>
				{/snippet}

				{#snippet failed()}
					<div class="pane-message" role="alert">
						<p>Could not load Top Stories.</p>
					</div>
				{/snippet}
			</svelte:boundary>
		</section>

		<!-- svelte-ignore a11y_no_noninteractive_tabindex (scrollable pane needs keyboard access) -->
		<section class="discussion-pane" aria-label="Selected story discussion" tabindex="0">
			{#if selectedStoryId !== null}
				{#key selectedStoryId}
					<svelte:boundary>
						<DiscussionPanel story={await getHackerNewsItem(selectedStoryId)} />

						{#snippet pending()}
							<div class="pane-message" aria-live="polite">
								<p>Loading discussion…</p>
							</div>
						{/snippet}

						{#snippet failed()}
							<div class="pane-message" role="alert">
								<p>Could not load this discussion.</p>
							</div>
						{/snippet}
					</svelte:boundary>
				{/key}
			{:else}
				<div class="empty-state">
					<h2>Choose a story to read its discussion</h2>
				</div>
			{/if}
		</section>
	</main>
</div>

<style>
	.app-shell {
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
		min-width: 64rem;
		min-height: 42rem;
		height: 100dvh;
		overflow: hidden;
		background: var(--surface-color);
	}

	.app-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
		padding: 0.8rem 1rem;
		border-bottom: 1px solid var(--border-strong-color);
		background: var(--header-background);
	}

	.app-header h1 {
		margin: 0;
		font-size: 1.15rem;
		letter-spacing: 0.02em;
	}

	.home-link {
		color: var(--text-color);
		text-decoration: none;
	}

	main {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		min-height: 0;
	}

	.story-pane,
	.discussion-pane {
		min-height: 0;
		overflow-y: auto;
		scrollbar-gutter: stable;
	}

	.story-pane:focus-visible,
	.discussion-pane:focus-visible {
		outline-offset: -0.15rem;
	}

	.story-pane {
		border-inline-end: 1px solid var(--border-strong-color);
	}

	.discussion-pane {
		background: var(--discussion-background);
	}

	.pane-message,
	.empty-state {
		padding: 2rem;
	}

	.pane-message {
		max-width: 32rem;
	}

	.pane-message p {
		margin: 0;
		color: var(--muted-color);
	}

	.empty-state {
		display: grid;
		place-content: center;
		max-width: 30rem;
		height: 100%;
		margin: auto;
		text-align: center;
	}

	.empty-state h2 {
		margin: 0;
		font-size: 1.5rem;
	}
</style>

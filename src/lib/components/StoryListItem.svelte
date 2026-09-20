<script lang="ts">
	import { formatCount, formatRelativeTime, getStoryDomain } from '#lib/hacker-news.js';
	import type { HackerNewsItem } from '#lib/hacker-news.js';

	interface Props {
		story: HackerNewsItem | null;
		selected: boolean;
	}

	let { story, selected }: Props = $props();

	let domain = $derived(getStoryDomain(story?.url));
	let commentCount = $derived(story?.descendants ?? story?.kids?.length ?? 0);
</script>

{#if story}
	<article class:selected>
		<div class="story-heading">
			<h2>
				<a
					class="story-link"
					href={`/?story=${story.id}`}
					aria-current={selected ? 'page' : undefined}
					data-sveltekit-reset="false"
				>
					<span class="story-title">{story.title ?? 'Untitled story'}</span>
				</a>
			</h2>
			{#if domain && story.url}
				<a
					class="story-domain"
					href={story.url}
					target="_blank"
					rel="noreferrer"
					aria-label={`${domain} (opens in a new tab)`}>({domain})</a
				>
			{/if}
		</div>

		<p class="metadata">
			{story.score ?? 0} points
			<span aria-hidden="true">·</span>
			{formatRelativeTime(story.time)}
			<span aria-hidden="true">·</span>
			{formatCount(commentCount, 'comment')}
		</p>
	</article>
{:else}
	<p class="unavailable">This story is no longer available.</p>
{/if}

<style>
	article,
	.unavailable {
		margin: 0;
		padding: 0.9rem 1rem;
		border-bottom: 1px solid var(--border-color);
	}

	article {
		position: relative;
		border-inline-start: 0.2rem solid transparent;
	}

	article:hover {
		background: var(--surface-hover);
	}

	article.selected {
		border-inline-start-color: var(--accent-color);
		background: var(--surface-selected);
	}

	.story-heading {
		line-height: 1.3;
		overflow-wrap: anywhere;
	}

	.story-heading h2 {
		display: inline;
		margin: 0;
		font: inherit;
	}

	.story-link {
		color: var(--text-color);
		font-size: 1.1rem;
		font-weight: 700;
		text-decoration: none;
	}

	.story-link::after {
		position: absolute;
		inset: 0;
		content: '';
	}

	.story-link:hover .story-title {
		text-decoration: underline;
		text-decoration-thickness: 0.08em;
		text-underline-offset: 0.15em;
	}

	.story-link:visited {
		color: var(--muted-color);
	}

	.story-domain {
		position: relative;
		z-index: 1;
		margin-inline-start: 0.55rem;
		color: var(--muted-color);
		font-weight: 400;
		text-decoration: none;
	}

	.story-domain:hover {
		text-decoration: underline;
	}

	.metadata {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		margin: 0.35rem 0 0;
		color: var(--muted-color);
		font-size: 0.83rem;
		line-height: 1.35;
	}

	.unavailable {
		color: var(--muted-color);
		font-style: italic;
	}
</style>

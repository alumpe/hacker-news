<script lang="ts">
	/* eslint-disable svelte/no-at-html-tags -- Hacker News HTML is sanitized in the server data adapter. */
	import { formatCount, formatRelativeTime, getStoryDomain } from '#lib/hacker-news.js';
	import type { HackerNewsItem } from '#lib/hacker-news.js';

	import CommentBranch from './CommentBranch.svelte';

	interface Props {
		story: HackerNewsItem | null;
	}

	let { story }: Props = $props();

	let domain = $derived(getStoryDomain(story?.url));
	let commentIds = $derived(story?.kids ?? []);
	let commentCount = $derived(story?.descendants ?? commentIds.length);
</script>

<svelte:head>
	<title>{story?.title ?? 'Discussion'} · HN Reader</title>
</svelte:head>

{#if story}
	<article class="story-details">
		<header>
			<h2>{story.title ?? 'Untitled story'}</h2>

			<p class="metadata">
				<span>{story.score ?? 0} points</span>
				<span aria-hidden="true">·</span>
				<span>by {story.by ?? 'unknown'}</span>
				<span aria-hidden="true">·</span>
				<span>{formatRelativeTime(story.time)}</span>
				<span aria-hidden="true">·</span>
				<span>{formatCount(commentCount, 'comment')}</span>
				{#if domain}
					<span aria-hidden="true">·</span>
					<span>{domain}</span>
				{/if}
			</p>

			<nav class="story-links" aria-label="Story links">
				{#if story.url}
					<a
						href={story.url}
						target="_blank"
						rel="noreferrer"
						aria-label="Read article (opens in a new tab)"
						>Read article <span aria-hidden="true">↗</span></a
					>
				{/if}
				<a
					href={`https://news.ycombinator.com/item?id=${story.id}`}
					target="_blank"
					rel="noreferrer"
					aria-label="Original HN discussion (opens in a new tab)"
				>
					Original HN discussion <span aria-hidden="true">↗</span>
				</a>
			</nav>
		</header>

		{#if story.textHtml}
			<div class="story-text">{@html story.textHtml}</div>
		{/if}
	</article>

	<section class="discussion" aria-label="Discussion">
		{#if commentIds.length > 0}
			<ol class="comment-list">
				{#each commentIds as commentId (commentId)}
					<li>
						<svelte:boundary>
							<CommentBranch {commentId} />

							{#snippet pending()}
								<div class="comment-placeholder" role="status" aria-label="Loading comment">
									<span></span>
									<span></span>
								</div>
							{/snippet}

							{#snippet failed()}
								<p class="inline-error" role="alert">Could not load this comment.</p>
							{/snippet}
						</svelte:boundary>
					</li>
				{/each}
			</ol>
		{:else}
			<p class="empty-discussion">No comments yet.</p>
		{/if}
	</section>
{:else}
	<div class="missing-story" role="alert">
		<h2>Story unavailable</h2>
		<p>This Hacker News item may have been deleted.</p>
	</div>
{/if}

<style>
	.story-details,
	.discussion,
	.missing-story {
		padding: 1.25rem 1.5rem;
	}

	.story-details {
		border-bottom: 1px solid var(--border-color);
		background: var(--surface-raised);
	}

	h2 {
		max-width: 34ch;
		margin: 0;
		font-size: clamp(1.45rem, 2.2vw, 2rem);
		line-height: 1.15;
	}

	.metadata {
		display: flex;
		flex-wrap: wrap;
		column-gap: 0.5rem;
		row-gap: 0.25rem;
		margin: 0.7rem 0 0;
		color: var(--muted-color);
		font-size: 0.88rem;
	}

	.story-links {
		display: flex;
		flex-wrap: wrap;
		column-gap: 1rem;
		row-gap: 0.5rem;
		margin-top: 0.85rem;
		font-weight: 700;
	}

	.story-text {
		max-width: 72ch;
		margin-top: 1.1rem;
		line-height: 1.6;
		overflow-wrap: anywhere;
	}

	.story-text :global(p) {
		margin: 0.75rem 0;
	}

	.story-text :global(pre) {
		max-width: 100%;
		overflow-x: auto;
		white-space: pre-wrap;
	}

	.comment-list {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.comment-placeholder {
		display: grid;
		gap: 0.5rem;
		padding: 1rem 0;
	}

	.comment-placeholder span {
		display: block;
		width: min(38rem, 88%);
		height: 0.7rem;
		border-radius: 999px;
		background: var(--placeholder-color);
		animation: pulse 1.4s ease-in-out infinite alternate;
	}

	.comment-placeholder span:last-child {
		width: min(27rem, 65%);
	}

	.inline-error {
		margin: 0;
		padding: 0.9rem 0;
		color: var(--error-color);
	}

	.empty-discussion,
	.missing-story p {
		color: var(--muted-color);
	}

	@media (prefers-reduced-motion: reduce) {
		.comment-placeholder span {
			animation: none;
		}
	}

	@keyframes pulse {
		to {
			opacity: 0.45;
		}
	}
</style>

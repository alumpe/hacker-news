<script lang="ts">
	/* eslint-disable svelte/no-at-html-tags -- Hacker News HTML is sanitized in the server data adapter. */
	import { formatCount, formatRelativeTime } from '#lib/hacker-news.js';
	import { getHackerNewsItem } from '#lib/hacker-news.remote.js';

	import CommentBranch from './CommentBranch.svelte';

	interface Props {
		commentId: number;
		depth?: number;
		oncount?: (count: number) => void;
	}

	let { commentId, depth = 0, oncount }: Props = $props();

	let commentQuery = $derived(getHackerNewsItem(commentId));
	let comment = $derived(await commentQuery);
	let collapsed = $state(false);
	let childCounts = $state<Record<number, number>>({});
	let childIds = $derived(comment?.kids ?? []);

	let descendantCount = $derived(
		childIds.reduce((total, childId) => total + (childCounts[childId] ?? 1), 0)
	);

	let repliesId = $derived(`comment-${commentId}-replies`);

	$effect(() => {
		oncount?.(descendantCount + 1);
	});

	function updateChildCount(childId: number, count: number) {
		if (childCounts[childId] === count) {
			return;
		}

		childCounts = {
			...childCounts,
			[childId]: count
		};
	}
</script>

<div class="comment-branch">
	{#if comment}
		<article class:removed={comment.deleted || comment.dead}>
			<header>
				<span class="author"
					>{comment.deleted
						? '[deleted]'
						: comment.dead
							? '[dead]'
							: (comment.by ?? 'unknown')}</span
				>

				{#if comment.time}
					<span aria-hidden="true">·</span>
					<time datetime={new Date(comment.time * 1000).toISOString()}>
						{formatRelativeTime(comment.time)}
					</time>
				{/if}

				{#if childIds.length > 0}
					<span aria-hidden="true">·</span>
					<button
						type="button"
						class="collapse-button"
						aria-expanded={!collapsed}
						aria-controls={repliesId}
						onclick={() => (collapsed = !collapsed)}
					>
						{collapsed ? `Expand ${formatCount(descendantCount, 'comment')}` : 'Collapse'}
					</button>
				{/if}
			</header>

			{#if comment.deleted || comment.dead}
				<p class="removed-copy">Comment removed.</p>
			{:else if comment.textHtml}
				<div class="comment-body">{@html comment.textHtml}</div>
			{:else}
				<p class="removed-copy">Comment text is unavailable.</p>
			{/if}
		</article>
	{:else}
		<article class="removed">
			<p class="removed-copy">Comment is unavailable.</p>
		</article>
	{/if}

	{#if childIds.length > 0}
		<ol
			id={repliesId}
			class="replies"
			class:replies-capped={depth >= 5}
			hidden={collapsed}
			aria-label="Replies"
		>
			{#each childIds as childId (childId)}
				<li>
					<svelte:boundary>
						<CommentBranch
							commentId={childId}
							depth={depth + 1}
							oncount={(count) => updateChildCount(childId, count)}
						/>

						{#snippet pending()}
							<div class="comment-placeholder" role="status" aria-label="Loading reply">
								<span></span>
								<span></span>
							</div>
						{/snippet}

						{#snippet failed()}
							<p class="inline-error" role="alert">Could not load this reply.</p>
						{/snippet}
					</svelte:boundary>
				</li>
			{/each}
		</ol>
	{/if}
</div>

<style>
	.comment-branch {
		min-width: 0;
	}

	article {
		padding: 0.8rem 0 0.9rem;
	}

	article header {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		column-gap: 0.5rem;
		row-gap: 0.25rem;
		color: var(--muted-color);
		font-size: 0.82rem;
	}

	.author {
		color: var(--text-color);
		font-weight: 700;
	}

	article.removed .author,
	.removed-copy {
		color: var(--muted-color);
		font-style: italic;
	}

	.collapse-button {
		padding: 0;
		border: 0;
		background: transparent;
		color: var(--link-color);
		font-size: inherit;
		text-decoration: underline;
		text-underline-offset: 0.15em;
	}

	.comment-body {
		max-width: 76ch;
		margin-top: 0.45rem;
		line-height: 1.55;
		overflow-wrap: anywhere;
	}

	.comment-body :global(p) {
		margin: 0.6rem 0;
	}

	.comment-body :global(p:first-child) {
		margin-top: 0;
	}

	.comment-body :global(p:last-child) {
		margin-bottom: 0;
	}

	.comment-body :global(pre) {
		max-width: 100%;
		padding: 0.75rem;
		overflow-x: auto;
		border: 1px solid var(--border-color);
		border-radius: 0.25rem;
		background: var(--code-background);
		font-size: 0.84rem;
		white-space: pre-wrap;
	}

	.comment-body :global(code) {
		font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
		font-size: 0.88em;
	}

	.comment-body :global(blockquote) {
		margin-inline: 0;
		padding-inline-start: 0.8rem;
		border-inline-start: 0.2rem solid var(--border-strong-color);
		color: var(--muted-color);
	}

	.removed-copy {
		margin: 0.45rem 0 0;
	}

	.replies {
		margin: 0;
		padding: 0;
		padding-inline-start: 1.1rem;
		border-inline-start: 1px solid var(--border-strong-color);
		list-style: none;
	}

	.replies-capped {
		/* Overlap deeper guides so nesting stays visible without adding indentation. */
		margin-inline-start: -1px;
		padding-inline-start: 0;
	}

	.comment-placeholder {
		display: grid;
		gap: 0.45rem;
		padding: 0.8rem 0.5rem;
		border-inline-start: 1px solid var(--border-color);
	}

	.comment-placeholder span {
		display: block;
		width: min(34rem, 85%);
		height: 0.65rem;
		border-radius: 999px;
		background: var(--placeholder-color);
		animation: pulse 1.4s ease-in-out infinite alternate;
	}

	.comment-placeholder span:last-child {
		width: min(25rem, 62%);
	}

	.inline-error {
		margin: 0;
		padding: 0.75rem;
		border-inline-start: 1px solid var(--error-color);
		color: var(--error-color);
		font-size: 0.86rem;
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

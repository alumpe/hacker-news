<script lang="ts">
	import { getHackerNewsItem } from '#lib/hacker-news.remote.js';

	import StoryListItem from './StoryListItem.svelte';

	const STORY_BATCH_SIZE = 20;
	const STORY_LOAD_AHEAD_DISTANCE_PX = 192;

	interface Props {
		storyIds: number[];
		selectedStoryId: number | null;
	}

	let { storyIds, selectedStoryId }: Props = $props();

	let visibleCount = $state(STORY_BATCH_SIZE);
	let visibleStoryIds = $derived(storyIds.slice(0, visibleCount));

	function loadStoriesWhenVisible(node: HTMLElement) {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) {
					visibleCount = Math.min(visibleCount + STORY_BATCH_SIZE, storyIds.length);
				}
			},
			{
				root: node.parentElement,
				rootMargin: `0px 0px ${STORY_LOAD_AHEAD_DISTANCE_PX}px`
			}
		);

		observer.observe(node);

		return () => observer.disconnect();
	}
</script>

<ol aria-label="Top stories">
	{#each visibleStoryIds as storyId (storyId)}
		<li>
			<svelte:boundary>
				<StoryListItem
					story={await getHackerNewsItem(storyId)}
					selected={selectedStoryId === storyId}
				/>

				{#snippet pending()}
					<article class="story-placeholder" aria-label="Loading story">
						<span></span>
						<small></small>
					</article>
				{/snippet}

				{#snippet failed()}
					<p class="inline-error" role="alert">Could not load this story.</p>
				{/snippet}
			</svelte:boundary>
		</li>
	{/each}
</ol>

{#if visibleCount < storyIds.length}
	<div class="load-more-sentinel" {@attach loadStoriesWhenVisible} aria-hidden="true"></div>
{/if}

<p class="story-count" aria-live="polite">
	Showing {visibleStoryIds.length} of {storyIds.length} stories.
</p>

<style>
	ol {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.story-placeholder {
		display: grid;
		gap: 0.55rem;
		padding: 1rem;
		border-bottom: 1px solid var(--border-color);
	}

	.story-placeholder span,
	.story-placeholder small {
		display: block;
		height: 0.8rem;
		border-radius: 999px;
		background: var(--placeholder-color);
		animation: pulse 1.4s ease-in-out infinite alternate;
	}

	.story-placeholder small {
		width: 55%;
		height: 0.6rem;
	}

	.inline-error {
		margin: 0;
		padding: 0.9rem 1rem;
		border-bottom: 1px solid var(--border-color);
		color: var(--error-color);
	}

	.load-more-sentinel {
		height: 1px;
	}

	.story-count {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	@media (prefers-reduced-motion: reduce) {
		.story-placeholder span,
		.story-placeholder small {
			animation: none;
		}
	}

	@keyframes pulse {
		to {
			opacity: 0.45;
		}
	}
</style>

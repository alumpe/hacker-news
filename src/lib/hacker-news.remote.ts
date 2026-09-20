import { query } from '$app/server';
import { error } from '@sveltejs/kit';

import { fetchHackerNewsItems, fetchTopStoryIds } from '#lib/server/hacker-news-api.js';
import type { HackerNewsItem } from './hacker-news';

// Bound public remote work while still allowing a full Hacker News feed-sized batch.
const MAX_ITEM_BATCH_SIZE = 500;

export const getTopStoryIds = query(() => fetchTopStoryIds());

export const getHackerNewsItem = query.batch<number, HackerNewsItem | null>(
	'unchecked',
	async (itemIds) => {
		if (itemIds.length > MAX_ITEM_BATCH_SIZE) {
			error(400, 'Too many Hacker News item IDs');
		}

		for (const itemId of itemIds) {
			if (!isValidItemId(itemId)) {
				error(400, 'Invalid Hacker News item ID');
			}
		}

		const uniqueItemIds = [...new Set(itemIds)];

		const itemsById = await fetchHackerNewsItems(uniqueItemIds);

		return (itemId) => {
			const result = itemsById.get(itemId);

			if (result instanceof Error) {
				throw result;
			}

			return result ?? null;
		};
	}
);

function isValidItemId(value: unknown): value is number {
	return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}

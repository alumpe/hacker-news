import sanitizeHtml from 'sanitize-html';

import type { HackerNewsItem, HackerNewsItemType } from '../hacker-news';

const API_BASE_URL = 'https://hacker-news.firebaseio.com/v0';
const ITEM_FETCH_CONCURRENCY = 6;
const ITEM_TYPES = new Set<HackerNewsItemType>(['job', 'story', 'comment', 'poll', 'pollopt']);

interface HackerNewsApiItem extends Omit<HackerNewsItem, 'textHtml' | 'url'> {
	text?: string;
	url?: string;
}

type PreparedItemResult = readonly [number, HackerNewsItem | null | Error];

const sanitizeOptions: sanitizeHtml.IOptions = {
	allowedTags: [
		'a',
		'b',
		'blockquote',
		'br',
		'code',
		'em',
		'i',
		'li',
		'ol',
		'p',
		'pre',
		'strong',
		'ul'
	],
	allowedAttributes: {
		a: ['href', 'rel', 'target']
	},
	allowedSchemes: ['http', 'https', 'mailto'],
	allowProtocolRelative: false,
	transformTags: {
		a: (_tagName, attributes) => ({
			tagName: 'a',
			attribs: {
				...attributes,
				rel: 'noreferrer noopener',
				target: '_blank'
			}
		})
	}
};

/** Fetches and validates the current ranked list of top-story IDs. */
export async function fetchTopStoryIds(): Promise<number[]> {
	const storyIds = await fetchApiJson('topstories');

	if (!Array.isArray(storyIds) || !storyIds.every(isValidItemId)) {
		throw new Error('Hacker News returned an invalid Top Stories response');
	}

	return storyIds;
}

/** Fetches prepared items while isolating failures to their requested IDs. */
export async function fetchHackerNewsItems(
	itemIds: number[]
): Promise<Map<number, HackerNewsItem | null | Error>> {
	const results: PreparedItemResult[] = [];

	// Stay within Cloudflare's simultaneous outbound-connection limit.
	for (let index = 0; index < itemIds.length; index += ITEM_FETCH_CONCURRENCY) {
		const itemIdBatch = itemIds.slice(index, index + ITEM_FETCH_CONCURRENCY);
		const batchResults = await Promise.all(itemIdBatch.map(fetchPreparedItem));

		results.push(...batchResults);
	}

	return new Map(results);
}

async function fetchApiJson(path: string): Promise<unknown> {
	const response = await fetch(`${API_BASE_URL}/${path}.json`, {
		cache: 'no-store'
	});

	if (!response.ok) {
		throw new Error(`Hacker News API request failed with status ${response.status}`);
	}

	return response.json();
}

async function fetchPreparedItem(itemId: number): Promise<PreparedItemResult> {
	try {
		const responseItem = await fetchApiJson(`item/${itemId}`);
		const item = prepareItem(responseItem);

		if (item && item.id !== itemId) {
			throw new Error('Hacker News returned an unexpected item ID');
		}

		return [itemId, item];
	} catch (requestError) {
		const error = requestError instanceof Error ? requestError : new Error('Item request failed');
		return [itemId, error];
	}
}

function prepareItem(responseItem: unknown): HackerNewsItem | null {
	const item = decodeItem(responseItem);

	if (!item) {
		return null;
	}

	const { text, url, ...fields } = item;
	const textHtml = text ? sanitizeHtml(text, sanitizeOptions) : undefined;

	return {
		...fields,
		textHtml,
		url: sanitizeStoryUrl(url)
	};
}

function decodeItem(value: unknown): HackerNewsApiItem | null {
	if (value === null) {
		return null;
	}

	if (!isRecord(value) || !isValidItemId(value.id)) {
		throw new Error('Hacker News returned an invalid item response');
	}

	return {
		id: value.id,
		type: decodeItemType(value.type),
		by: decodeString(value.by, 'by'),
		time: decodeInteger(value.time, 'time', 1),
		text: decodeString(value.text, 'text'),
		dead: decodeBoolean(value.dead, 'dead'),
		deleted: decodeBoolean(value.deleted, 'deleted'),
		parent: decodeInteger(value.parent, 'parent', 1),
		kids: decodeItemIds(value.kids),
		url: decodeString(value.url, 'url'),
		score: decodeInteger(value.score, 'score', 0),
		title: decodeString(value.title, 'title'),
		descendants: decodeInteger(value.descendants, 'descendants', 0)
	};
}

function decodeString(value: unknown, field: string): string | undefined {
	if (value === undefined) {
		return undefined;
	}

	if (typeof value !== 'string') {
		throw new Error(`Hacker News returned an invalid ${field} field`);
	}

	return value;
}

function decodeBoolean(value: unknown, field: string): boolean | undefined {
	if (value === undefined) {
		return undefined;
	}

	if (typeof value !== 'boolean') {
		throw new Error(`Hacker News returned an invalid ${field} field`);
	}

	return value;
}

function decodeInteger(value: unknown, field: string, minimum: number): number | undefined {
	if (value === undefined) {
		return undefined;
	}

	if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < minimum) {
		throw new Error(`Hacker News returned an invalid ${field} field`);
	}

	return value;
}

function decodeItemType(value: unknown): HackerNewsItemType | undefined {
	if (value === undefined) {
		return undefined;
	}

	if (typeof value !== 'string' || !ITEM_TYPES.has(value as HackerNewsItemType)) {
		throw new Error('Hacker News returned an invalid type field');
	}

	return value as HackerNewsItemType;
}

function decodeItemIds(value: unknown): number[] | undefined {
	if (value === undefined) {
		return undefined;
	}

	if (!Array.isArray(value) || !value.every(isValidItemId)) {
		throw new Error('Hacker News returned an invalid kids field');
	}

	return value;
}

function sanitizeStoryUrl(url?: string): string | undefined {
	if (!url) {
		return undefined;
	}

	try {
		const parsedUrl = new URL(url);

		if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
			return parsedUrl.href;
		}
	} catch {
		return undefined;
	}

	return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidItemId(value: unknown): value is number {
	return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}

/** Shared Hacker News item types and display helpers. */

export type HackerNewsItemType = 'job' | 'story' | 'comment' | 'poll' | 'pollopt';

const relativeTimeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'always' });

export interface HackerNewsItem {
	id: number;
	type?: HackerNewsItemType;
	by?: string;
	time?: number;
	/** Sanitized HTML safe to render with Svelte's `{@html}` tag. */
	textHtml?: string;
	dead?: boolean;
	deleted?: boolean;
	parent?: number;
	kids?: number[];
	/** An HTTP or HTTPS destination normalized by the server data adapter. */
	url?: string;
	score?: number;
	title?: string;
	descendants?: number;
}

/** Formats a Unix timestamp as a compact age for the reading interface. */
export function formatRelativeTime(unixTime?: number): string {
	if (!unixTime) {
		return 'unknown age';
	}

	const elapsedSeconds = Math.max(0, Math.floor(Date.now() / 1000) - unixTime);

	if (elapsedSeconds < 60) {
		return 'just now';
	}

	const intervals = [
		{ seconds: 31_536_000, unit: 'year' },
		{ seconds: 2_592_000, unit: 'month' },
		{ seconds: 86_400, unit: 'day' },
		{ seconds: 3_600, unit: 'hour' },
		{ seconds: 60, unit: 'minute' }
	] as const;

	const interval = intervals.find(({ seconds }) => elapsedSeconds >= seconds);

	if (!interval) {
		return 'just now';
	}

	const value = Math.floor(elapsedSeconds / interval.seconds);

	return relativeTimeFormatter.format(-value, interval.unit);
}

/** Returns a concise host name for a story URL. */
export function getStoryDomain(url?: string): string | null {
	if (!url) {
		return null;
	}

	try {
		return new URL(url).hostname.replace(/^www\./, '');
	} catch {
		return null;
	}
}

/** Formats a count with the singular or plural label it requires. */
export function formatCount(count: number, singular: string): string {
	const label = count === 1 ? singular : `${singular}s`;
	return `${count} ${label}`;
}

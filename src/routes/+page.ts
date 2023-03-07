import { browser } from "$app/environment";
import { getItem, getTopstories } from "$lib/hackerNewsApi";
import { storyStore } from "$lib/stores/storyStore";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ url }) => {
  const page = +(url.searchParams.get("page") ?? 1);
  const topStories = await getTopstories(page);

  const items = await Promise.all(topStories.map((storyId) => getItem(storyId)));

  if (!browser) {
    storyStore.set(items);
  }

  return { items };
};

import { getItem, getTopstories } from "$lib/hackerNewsApi";
import type { PageLoad } from "./$types";

export const load: PageLoad = async () => {
  const allTopStories = await getTopstories();
  const topStories = allTopStories.slice(0, 30);

  const items = await Promise.all(topStories.map((storyId) => getItem(storyId)));

  return { items };
};

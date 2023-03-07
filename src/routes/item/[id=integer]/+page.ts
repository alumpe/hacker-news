import { getItem } from "$lib/hackerNewsApi";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params }) => {
  const item = await getItem(+params.id);

  return {
    item,
    streamed: {
      comments: item.kids?.map((storyId) => getItem(storyId)) ?? [],
    },
  };
};

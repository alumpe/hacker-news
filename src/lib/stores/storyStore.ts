import type { Item } from "$lib/hackerNewsApi";
import { derived, writable } from "svelte/store";

const itemsStore = writable<Item[]>([]);

export const maxScore = derived(itemsStore, ($itemStore) => {
  return Math.max(...$itemStore.map((item) => item.score ?? 0));
});

const createStoryStore = () => {
  return {
    subscribe: itemsStore.subscribe,
    set: itemsStore.set,
  };
};

export const storyStore = createStoryStore();

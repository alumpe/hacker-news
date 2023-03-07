<script lang="ts">
  import { maxScore, storyStore } from "$lib/stores/storyStore";
  import type { Item } from "./hackerNewsApi";

  export let story: Item;

  $: url = story.url ?? `/item?id=${story.id}`;
</script>

<div>
  <span>{$maxScore}</span>, <span>{story.score}</span><a href={url}>{story.title}</a>
</div>

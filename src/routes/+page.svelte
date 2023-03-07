<script lang="ts">
  import Pagination from "$lib/Pagination.svelte";
  import { storyStore } from "$lib/stores/storyStore";
  import StoryPreview from "$lib/StoryPreview.svelte";
  import { afterUpdate } from "svelte";
  import type { PageData } from "./$types";

  export let data: PageData;

  afterUpdate(() => {
    storyStore.set(data.items);
  });
</script>

<table>
  {#each $storyStore as story}
    <StoryPreview {story} />
  {/each}
</table>

<Pagination />

<style lang="scss">
  table {
    border-collapse: separate;
    border-spacing: 1rem 0.6rem;
  }
</style>

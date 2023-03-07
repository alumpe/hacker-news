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

<ul>
  {#each $storyStore as story}
    <li>
      <StoryPreview {story} />
    </li>
  {/each}
</ul>

<Pagination />

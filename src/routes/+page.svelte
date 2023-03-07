<script lang="ts">
  import StoryPreview from "$lib/StoryPreview.svelte";
  import type { PageData } from "./$types";

  export let data: PageData;
</script>

{#each data.items as story}
  {@const url = story.url ?? `/item?id=${story.id}`}
  <StoryPreview {url} title={story.title} />
{/each}

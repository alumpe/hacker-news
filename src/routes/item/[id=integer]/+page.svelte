<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData;
  $: story = data.item;
  $: commentsPromises = data.streamed.comments;
</script>

<h1>{data.item.title}</h1>

{#if story.text}
  <div>{@html story.text}</div>
{/if}

{#if commentsPromises}
  {#each commentsPromises as commentsPromise}
    {#await commentsPromise}
      Loading...
    {:then comment}
      {#if !comment.dead}
        <p>{@html comment.text}</p>
      {/if}
    {:catch error}
      {error.message}
    {/await}
  {/each}
{/if}

<style lang="scss">
</style>

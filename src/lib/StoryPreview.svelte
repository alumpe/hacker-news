<script lang="ts">
  import type { Item } from "./hackerNewsApi";
  import { timeAgo } from "./utils/time";

  export let story: Item;

  $: url = story.url ?? `/item?id=${story.id}`;
  $: hostname = story.url ? new URL(story.url).hostname : undefined;
</script>

<tr class="row">
  <td style:text-align="right">{story.score}</td>
  <td>
    <div class="story-info">
      <div>
        <a href={url}>{story.title}</a>
        {#if hostname}
          <small>({hostname})</small>
        {/if}
      </div>

      <div>
        {#if story.by}
          <small>by {story.by}</small> |
        {/if}
        {#if story.time}
          <small title={`${new Date(story.time * 1000)}`}>{timeAgo(story.time)}</small>
        {/if}
        {#if story.descendants}
          | <small><a href={`/item/${story.id}`}>{story.descendants} comments</a></small>
        {/if}
      </div>
    </div>
  </td>
</tr>

<style lang="scss">
  .story-info {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .row {
    padding-bottom: 0.5rem;
  }
</style>

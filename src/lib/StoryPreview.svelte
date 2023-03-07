<script lang="ts">
  import type { Item } from "./hackerNewsApi";
  import { timeAgo } from "./utils/time";

  export let story: Item;

  $: url = story.url ?? `/item/${story.id}`;
  $: hostname = story.url ? new URL(story.url).hostname : undefined;
</script>

<tr>
  <td style:text-align="right">{story.score}</td>
  <td>
    <div class="story-info">
      <div>
        <strong><a href={url} class="title">{story.title}</a></strong>
        {#if hostname}
          <small>({hostname})</small>
        {/if}
      </div>

      <div class="info-bar">
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
  tr {
    padding-bottom: 0.5rem;
    color: rgb(118, 123, 143);

    a {
      text-decoration: none;
    }
  }

  .title {
    &:not(:visited) {
      color: rgb(121, 127, 204);
    }
  }
  .story-info {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }
</style>

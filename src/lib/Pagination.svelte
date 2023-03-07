<script lang="ts">
  import { page } from "$app/stores";

  $: currentPage = +($page.url.searchParams.get("page") ?? 1);
</script>

<div class="container">
  {#if currentPage > 1}
    <a href={`/?page=${currentPage - 1}`} data-sveltekit-preload-data={"tap"}>Previous</a>
  {/if}

  {#each Array.from(Array(10).keys()) as pageNumber}
    {#if pageNumber + 1 === currentPage}
      <span class="number">{pageNumber + 1}</span>
    {:else}
      <a href={`/?page=${pageNumber + 1}`} class="number" data-sveltekit-preload-data={"tap"}
        >{pageNumber + 1}</a
      >
    {/if}
  {/each}

  {#if currentPage < 10}
    <a href={`/?page=${currentPage + 1}`} data-sveltekit-preload-data={"tap"}>Next</a>
  {/if}
</div>

<style lang="scss">
  .container {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
  }
  .number {
    padding-inline: 0.5em;
  }
</style>

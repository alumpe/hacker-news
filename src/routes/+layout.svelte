<script>
  import { goto } from "$app/navigation";
  import "../styles/app.scss";

  let searchString = "";
</script>

<header>
  <nav><a href="/">Hacker News</a></nav>
</header>

<main><slot /></main>

<footer>
  <input
    type="text"
    placeholder="Search"
    bind:value={searchString}
    on:keydown={(e) => {
      if (e.key === "Enter") {
        goto(`https://hn.algolia.com/?q=${searchString}`);
      }
    }}
  />
</footer>

<style lang="scss">
  header,
  main,
  footer {
    max-width: 60rem;
    margin: 0 auto;
  }

  footer {
    padding-block: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>

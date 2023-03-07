<script>
  import "../styles/app.scss";
</script>

<header>
  <nav />
</header>

<main class="main"><slot /></main>

<footer />

<style lang="scss">
  .main {
    max-width: 60rem;
    margin: 0 auto;
  }
</style>

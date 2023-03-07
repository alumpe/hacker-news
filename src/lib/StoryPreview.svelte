<script lang="ts">
  export let url: string;
  export let title: string | undefined;
</script>

<a href={url} class="link" style:display="block">{title}</a>

<script lang="ts">
    import CardList from "$lib/components/CardList.svelte";
</script>

<h2>(Use mobile mode in dev tool!)</h2>
<CardList></CardList>

<style>
    h2 {
        color: var(--bg3);
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }
</style>

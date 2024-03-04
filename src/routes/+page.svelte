<script lang="ts">
    import CardList from "$lib/components/CardList.svelte";

    let index = 0;
</script>

<h2>(Use mobile mode in dev tool!)</h2>
<CardList bind:index items={[1, 2, 3]}>
    <div slot="before">
    <h1>{index - 1}</h1>
</div>
    <div slot="current">
        <h1>{index}</h1>
    </div>
    <div slot="after">
        <h1>{index + 1}</h1>
    </div>
</CardList>

<style>
    h2 {
        color: var(--bg3);
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }
</style>

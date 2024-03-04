<script lang="ts">
    import CardList from "$lib/components/CardList.svelte";

    let index = 0;
let items = [
    "abc",
    "def",
    "ghi",
    "stuff",
    "other",
    "beep boop",
    "yeah"
]
</script>





<h2>(Use mobile mode in dev tool!)</h2>
<CardList bind:index {items}>
    <div slot="before">
        <h3>Before: {index - 1}</h3>
    </div>

    <div slot="current">
        <h3>Current: {index}</h3>
    </div>

    <div slot="after">
        <h3>After: {index + 1}</h3>

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

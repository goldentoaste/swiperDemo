<script lang="ts">
    import CardList from "$lib/components/CardList.svelte";

    let index = 0;
    let items = ["abc", "def", "ghi", "stuff", "other", "beep boop", "yeah"];


    function swiped(args = CardList){

    }
</script>

<h2>(Use mobile mode in dev tool!)</h2>
<CardList bind:index {items} on:swiped={}>
    <div slot="before">
        <h3>Before: {index - 1}</h3>
    </div>

    <div slot="current">
        <h3>Current: {index}</h3>
        <h3>Content: {items[index]}</h3>

        <button on:click={(e) => {
            e.stopPropagation();
            console.log("haha");
            
        }}>Click me</button>
    </div>

    <div slot="after">
        <h3>After: {index + 1}</h3>
    </div>
</CardList>

<!-- <div
    class="clickTester"
    on:click={(event) => {
        console.log("outer");
    }}
>
    <div
        class="inner"
        on:click={(event) => {
            event.stopPropagation();
            console.log("inner");
        }}
    >
        click here
    </div>
</div> -->

<style>
    .inner {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 200px;
        height: 200px;
        transform: translate(-50%, -50%);
        background-color: var(--fg1);
        color: var(--bg1);
    }

    .clickTester {
        position: absolute;
        top: 0;

        width: 400px;
        height: 400px;

        background-color: var(--bg1);
        color: var(--fg1);
        border: 3px solid var(--fg1);
    }

    h2 {
        color: var(--bg3);
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }
</style>

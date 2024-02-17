<script lang="ts">
    import { onMount } from "svelte";
    import SwipeCard from "./swipeCard.svelte";
    import { spring } from "svelte/motion";
    import { navbarHeight } from "$lib/stores/globals";

    interface apiRes {
        id: string;
        url: string;
        width: number;
        height: number;
    }
    let windowWidth = 0;
    let windowHeight = 1000;
    $: scrollLimit = windowHeight * 0.5;
    let index = 0;

    let clicked = false;
    let iniPos: number = 0;
    let iniTime = 0;

    const damping = 0.45;
    const stiffness = 0.08;
    const stickyDist = 80;
    let scrollOffset = spring(0, {
        damping: damping,
        stiffness: stiffness,
    });

    let items: apiRes[] = [];

    let before;
    let current;
    let after;

    let lock = false; // prevent interaction when lock is enabled

    onMount(() => {
        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight - $navbarHeight;
    });

    async function getPictures(): Promise<apiRes[]> {
        const res = await fetch(
            "https://api.thedogapi.com/v1/images/search?limit=10",
        );

        if (res.ok) {
            items = await res.json();
            return items;
        }
    }

    function mousemove(e: MouseEvent | Touch) {
        if (!clicked) return;

        if (index == 0) {
            $scrollOffset = Math.min(0, e.clientY - iniPos);
        } else if (index == items.length) {
            $scrollOffset = Math.max(0, e.clientY - iniPos);
        } else {
            $scrollOffset = e.clientY - iniPos;
        }

        $scrollOffset =
            Math.sign($scrollOffset) *
            Math.max(0, Math.abs($scrollOffset) - stickyDist);
    }

    function mousedown(e: MouseEvent | Touch) {
        clicked = true;
        iniPos = e.clientY;
        iniTime = new Date().getTime();
    }

    function mouseup(e: MouseEvent | Touch) {
        clicked = false;
        const dist = Math.abs($scrollOffset) + stickyDist;
        if (
            dist >= scrollLimit ||
            dist / (new Date().getTime() - iniTime) > 1.1
        ) {
            // auto scrolling to next page
            lock = true;
            $scrollOffset = Math.sign($scrollOffset) * windowHeight;
            reset();
        } else {
            $scrollOffset = 0;
        }
    }

    $: {
        if (Math.abs(Math.abs($scrollOffset) - windowHeight) < 1) {
            scrollOffset.damping = 1;
            scrollOffset.stiffness = 1;
            index = clamp(
                0,
                Math.sign(-$scrollOffset) + index,
                items.length - 1,
            );
            $scrollOffset = 0;

            scrollOffset.damping = damping;
            scrollOffset.stiffness = stiffness;
            // done scrolling
            lock = false;
        }
    }

    $: if (Math.abs($scrollOffset) + stickyDist > scrollLimit * 0.5) {
        reset();
    }

    function reset() {
        before && before.reset();
        current && current.reset();
        after && after.reset();
    }

    function clamp(min, val, max) {
        return Math.min(max, Math.max(min, val));
    }
</script>

{#await getPictures() then res}
    <div
        class:locked={lock}
        class="cardItemsContainer"
        style="--maxWidth:{windowWidth}px; --maxHeight:{windowHeight}px;"
        on:mousemove={mousemove}
        on:mouseup={mouseup}
        on:mousedown={mousedown}
        on:mouseleave={mouseup}
        on:touchstart={(event) => {
            mousedown(event.touches[0]);
        }}
        on:touchend={(event) => {
            mouseup(event.touches[0]);
        }}
        on:touchmove={(event) => {
            mousemove(event.touches[0]);
        }}
    >
        {#if index > 0}
            <div
                id={`${index - 1}`}
                class="itemHolder"
                style="--heightOffset:{$scrollOffset - windowHeight}px;"
            >
                <SwipeCard
                    bind:this={before}
                    cardWidth={windowWidth}
                    cardHeight={windowHeight}
                >
                    <!-- svelte-ignore a11y-missing-attribute -->
                    <img draggable="false" src={res[index - 1].url} />
                </SwipeCard>
            </div>
        {/if}

        <div
            id={`${index}`}
            class="itemHolder"
            style="--heightOffset:{$scrollOffset}px;"
        >
            <SwipeCard
                bind:this={current}
                cardWidth={windowWidth}
                cardHeight={windowHeight}
                on:swipe={()=>{}}
            >
                <!-- svelte-ignore a11y-missing-attribute -->
                <img draggable="false" src={res[index].url} />
            </SwipeCard>
        </div>

        {#if index < res.length - 1}
            <div
                id={`${index + 1}`}
                class="itemHolder"
                style="--heightOffset:{$scrollOffset + windowHeight}px;"
            >
                <SwipeCard
                    bind:this={after}
                    cardWidth={windowWidth}
                    cardHeight={windowHeight}
                >
                    <!-- svelte-ignore a11y-missing-attribute -->
                    <img draggable="false" src={res[index + 1].url} />
                </SwipeCard>
            </div>
        {/if}
    </div>
{:catch err}
    <span>Error while fetching images: {err}</span>
{/await}

<style>
    .locked {
        pointer-events: none;
    }
    .cardItemsContainer {
        left: 50%;
        position: relative;
        display: flex;
        flex-direction: column;
        /* gap: 1rem; */
        overflow-y: hidden;
        overflow-x: hidden;

        height: var(--maxHeight);

        transform: translate(-50%, 0);
    }

    .itemHolder {
        position: fixed;
        transform: translate(0, var(--heightOffset));
    }

    img {
        user-select: none;
        max-width: 100%;
        max-height: 100%;
        -webkit-user-drag: none;
        margin: 0;
        position: relative;

        top: 50%;
        transform: translate(0, -50%);
        /* pointer-events: none; */
    }

    h3 {
        position: absolute;
    }
</style>
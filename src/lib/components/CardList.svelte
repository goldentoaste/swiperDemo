<script lang="ts" generics="T">
    import { createEventDispatcher, onMount } from "svelte";
    import SwipeCard from "./swipeCard.svelte";
    import { spring } from "svelte/motion";
    import { navbarHeight } from "$lib/stores/globals";

    interface apiRes {
        id: string;
        url: string;
        width: number;
        height: number;
    }
    export let width = 500;
    export let height = 1000;
    $: scrollLimit = height * 0.5;
    export let index = 0;

    let clicked = false;
    let iniPos: number = 0;
    let lastTime = 0;
    let lastPos = 0;
    let isReset = false;

    // const damping = 0.45;
    // const stiffness = 0.01;
    const damping = 0.45;
    const stiffness = 0.08;
    const stickyDist = 80;
    let scrollOffset = spring(0, {
        damping: damping,
        stiffness: stiffness,
    });

    let vel = 0;

    export let items: T[];

    let before;
    let current;
    let after;

    let lock = false; // prevent interaction when lock is enabled
    let advancing = false;

    // TODO implement the following flags
    export let disableScroll = false;

    const dispatch = createEventDispatcher<{
        indexChanged: { index: number };
        swiped: { index: number; content: T };
        pending: { index: number; right: boolean };
    }>();

    onMount(() => {
        width = window.innerWidth;
        height = window.innerHeight - $navbarHeight;
    });

    function mousemove(e: MouseEvent | Touch) {
        if (!clicked) return;

        if (index == 0) {
            $scrollOffset = Math.min(0, e.clientY - iniPos);
        } else if (index == items.length - 1) {
            $scrollOffset = Math.max(0, e.clientY - iniPos);
        } else {
            $scrollOffset = e.clientY - iniPos;
        }

        $scrollOffset =
            Math.sign($scrollOffset) *
            Math.max(0, Math.abs($scrollOffset) - stickyDist);

        vel = Math.abs(e.clientY - lastPos) / (Date.now() - lastTime);
        lastPos = e.clientY;
        lastTime = Date.now();
    }

    function mousedown(e: MouseEvent | Touch) {
        if (disableScroll) {
            return;
        }
        clicked = true;

        isReset = false;

        iniPos = e.clientY;
        lastPos = e.clientY;
        lastTime = new Date().getTime();

        if ($scrollOffset == 0) {
            lock = false;
        }
    }

    function mouseup(e: MouseEvent | Touch) {
        if (!clicked) {
            return;
        }

        clicked = false;
        isReset = false;

        const dist = Math.abs(e.clientY - iniPos);
        if (
            !advancing &&
            !lock &&
            (dist >= scrollLimit || (dist > 70 && vel > 2)) // change limits here
        ) {
            console.log(
                !advancing,
                !lock,
                dist >= scrollLimit,
                dist > 70 && vel > 2,
            );

            // auto scrolling to next page
            lock = true;
            $scrollOffset = Math.sign($scrollOffset) * height;
        } else if (!advancing) {
            $scrollOffset = 0;
        }
    }

    $: {
        if (Math.abs(Math.abs($scrollOffset) - height) < 1) {
            scrollOffset.damping = 1;
            scrollOffset.stiffness = 1;
            checkIncrement();
            $scrollOffset = 0;

            scrollOffset.damping = damping;
            scrollOffset.stiffness = stiffness;

            // done scrolling
            lock = false;
            isReset = false;
        }
    }

    $: if (advancing && $scrollOffset == 0) {
        reset(true);
        items.splice(index, 1);
        advancing = false;
    }

    $: if (
        !advancing &&
        !isReset &&
        Math.abs($scrollOffset) + stickyDist > scrollLimit * 0.4
    ) {
        reset(false);
        isReset = true;
    }

    function checkIncrement() {
        if (!advancing) {
            index = clamp(
                0,
                Math.sign(-$scrollOffset) + index,
                items.length - 1,
            );
        } else {
            index += 1;
            index -= 1;
        }

        console.log(index);
    }

    function advance() {
        setTimeout(() => {
            advancing = true;
            lock = true;
            scrollOffset.stiffness = stiffness * 0.8;
            $scrollOffset = -height;
        }, 200);
    }

    function reset(instant = false) {
        before && before.reset(instant);
        current && current.reset(instant);
        after && after.reset(instant);
    }

    function clamp(min, val, max) {
        return Math.min(max, Math.max(min, val));
    }
</script>

<div
    class:locked={lock}
    class="cardItemsContainer"
    style="--maxWidth:{width}px; --maxHeight:{height}px;"
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
            style="--heightOffset:{$scrollOffset - height}px;"
        >
            <SwipeCard bind:this={before} cardWidth={width} cardHeight={height}>
                <slot name="before" />
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
            cardWidth={width}
            cardHeight={height}
            on:swipe={(e) => {
                advance();
            }}
        >
            <slot name="current" />
        </SwipeCard>
    </div>

    {#if index < items.length - 1}
        <div
            id={`${index + 1}`}
            class="itemHolder"
            style="--heightOffset:{$scrollOffset + height}px;"
        >
            <SwipeCard bind:this={after} cardWidth={width} cardHeight={height}>
                <slot name="after" />
            </SwipeCard>
        </div>
    {/if}
</div>

<div class="stats">
    <span>Advance: {advancing}</span>
    <span></span>
    <span>Index: {index}</span>
</div>

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

    /* TODO move these later */
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

    .stats {
        position: absolute;
        border: 2px solid var(--fg1);
        padding: 0.5rem;

        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        right: 0;
        bottom: 0;

        width: 180px;
        height: fit-content;

        /* transform: translate(-50%, 0); */
        user-select: none;

        background-color: var(--bg1);
    }
</style>

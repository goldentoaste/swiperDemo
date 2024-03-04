<script lang="ts" context="module">
    export interface CardSwipeEvent {
        right: boolean;
    }

    export interface CardSwipePending {
        right: boolean;
    }
</script>

<script lang="ts">
    import {
        ZERO,
        type Vector,
        angleBetween,
        mul,
        add,
        inorm,
        imul,
        mag,
    } from "$lib/util/vector";
    import { createEventDispatcher, onMount } from "svelte";
    import { spring } from "svelte/motion";

    export let cardWidth = 400;
    export let cardHeight = 700;

    const stiffness = 0.04;
    const damping = 0.3;
    const rotPivotOffset = cardHeight * 2.2; // pivot distance, in px. (might need to be dynamic to screen size)
    const dragDistLimit = cardWidth / 2; // distance to trigger swipe at. in px;
    let iniPos: Vector = { x: 0, y: 0 };
    let displace: Vector = { x: 0, y: 0 };
    let startTime: number = 0;
    let done = false;
    let notrans = false;

    let springRot = spring(0, {
        stiffness: 1,
        damping: 1,
    });

    let springDisplace = spring(displace, {
        stiffness: stiffness,
        damping: damping,
    });

    $: {
        const pivot = add(iniPos, mul(displace, 0.5));
        pivot.y += rotPivotOffset;
        $springRot =
            angleBetween(iniPos, add(iniPos, displace), pivot) *
            (displace.x > 0 ? -1 : 1);
    }
    $: $springDisplace = displace; // set target for spring, render postion relative to spring.

    let cardRoot: HTMLDivElement;
    let dragging = false;
    let selection: Selection;

    let pastDragLimit = false;

    onMount(() => {
        selection = document.getSelection();
    });

    const dispatch = createEventDispatcher<{
        swipe: CardSwipeEvent;
        pendingSwipe: CardSwipePending;
    }>();

    function mousedown(e: MouseEvent | Touch) {
        if (done) return;
        pastDragLimit = false;
        selection.empty();
        iniPos = { x: e.clientX, y: e.clientY };
        displace = ZERO();
        dragging = true;
        startTime = new Date().getTime();
    }
    function mouseEscaped(e: MouseEvent | Touch) {
        if (done) return;
        dragging = false;
        iniPos = ZERO();

        let vel = mag(displace) / (new Date().getTime() - startTime);

        if (Math.abs(displace.x) > dragDistLimit || vel > 1.2) {
            swipe();
        } else {
            displace = ZERO();
        }
    }

    function mousemove(e: MouseEvent | Touch) {
        if (done) return;
        if (dragging) {
            displace.x = e.clientX - iniPos.x;
            displace.y = (e.clientY - iniPos.y) * 0.3;

            if (!pastDragLimit && Math.abs(displace.x) > dragDistLimit) {
                pastDragLimit = true;
                dispatch("pendingSwipe", {
                    right: Math.sign(displace.x) == 1,
                });
            }
        }
    }

    function swipe() {
        dispatch("swipe", {
            right: Math.sign(displace.x) == 1,
        });
        displace = imul(inorm(displace), Math.min(cardWidth, 600));
        done = true;
    }

    export function reset(instant = false) {
        notrans = instant;

        dragging = false;

        if (instant) {
            springDisplace.stiffness = 1;
            springDisplace.damping = 1;
            springRot.stiffness = 1;
            springRot.damping = 1;
        }

        iniPos = ZERO();
        displace = ZERO();
        $springDisplace = displace;

        $springRot = 0;

        springRot.stiffness = stiffness;
        springRot.damping = damping;
        springDisplace.stiffness = stiffness;
        springDisplace.damping = damping;

        done = false;
        if (notrans) {
            setTimeout(() => {
                notrans = false;
            }, 200);
        }
    }
</script>

<div
    class="cardRoot"
    style="width: {cardWidth}px; height:{cardHeight}px;"
    bind:this={cardRoot}
    on:mousedown={mousedown}
    on:mousemove={mousemove}
    on:mouseup={mouseEscaped}
    on:mouseleave={mouseEscaped}
    on:touchstart={(event) => {
        mousedown(event.touches[0]);
    }}
    on:touchend={(event) => {
        mouseEscaped(event.touches[0]);
    }}
    on:touchmove={(event) => {
        mousemove(event.touches[0]);
    }}
>
    <div
        class:done
        class:notrans
        class="cardHolder"
        class:dragging
        style="--offsetX: {$springDisplace.x}px; --offsetY: {$springDisplace.y}px; --rot: {$springRot}rad;"
    >
        <slot />
    </div>
</div>

<style>
    .notrans {
        transition: none !important;
    }
    .done {
        opacity: 0;
        transition-duration: 300ms !important;
    }

    .cardHolder {
        width: 100%;
        max-width: 500px;
        height: 100%;
        border: 2px solid var(--fg1);
        position: relative;

        transform: translate(var(--offsetX), var(--offsetY)) rotate(var(--rot));
        transition-property: scale, border-color, border, border-radius, opacity;
        transition-duration: 200ms;
        transition-timing-function: ease-out;
        overflow: auto;

        /* weary - wish I knew this years ago */

        scrollbar-width: none;
    }

    .cardHolder::-webkit-scrollbar {
        display: none;
    }

    .dragging {
        border: 2px solid var(--red);
        border-radius: 20px;
        scale: 0.95;
        box-shadow: 0px 0px 20px 20px var(--bg3);
    }

    .cardRoot {
        border: 2px solid var(--bg3);
        position: relative;
        width: 80%;
        max-width: var(--maxWidth);
        height: calc(100vh - 14rem);

        /* left: 50%;
        top: 50%; */
        /* transform: translate(calc(-50% - 1rem), calc(-50% - 1rem)); */
        cursor: grab;
        overflow: visible;
        display: flex;
        justify-content: center;

        box-sizing: border-box;
    }

    .cardRoot:active {
        cursor: grabbing;
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

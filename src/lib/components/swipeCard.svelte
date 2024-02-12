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
        sub,
    } from "$lib/util/vector";
    import { onMount } from "svelte";
    import { spring } from "svelte/motion";

    export let cardWidth = 400;
    export let cardHeight = 700;

   
    const rotPivotOffset = cardHeight * 2.2; // pivot distance, in px. (might need to be dynamic to screen size)
    const dragDistLimit = cardWidth / 2; // distance to trigger swipe at. in px;
    let iniPos: Vector = { x: 0, y: 0 };
    let displace: Vector = { x: 0, y: 0 };
    let startTime : number = 0;
    let done = false;

 
    let springRot = spring(0, {
        stiffness: 0.05,
        damping: 0.3,
    });

    let springDisplace = spring(displace, {
        stiffness: 0.06,
        damping: 0.3,
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
    $: rect = cardRoot && cardRoot.getBoundingClientRect();
    let dragging = false;
    let selection: Selection;

    onMount(() => {
        selection = document.getSelection();
    });

    function mousedown(e: MouseEvent | Touch) {
        if(done)return;

        selection.empty();
        iniPos = { x: e.clientX, y: e.clientY };
        displace = ZERO();
        dragging = true;
        startTime = new Date().getTime();

    }
    function mouseEscaped(e: MouseEvent | Touch) {
        if(done)return;
        dragging = false;
        iniPos = ZERO();

        let vel = mag(displace) / (new Date().getTime() - startTime)
     
        
        if (Math.abs(displace.x) > dragDistLimit || vel > 1.2) {
            swipe();
        } else {
            displace = ZERO();
        }
  
    }

    function mousemove(e: MouseEvent | Touch) {
        if(done)return;
        if (dragging) {
            displace.x = e.clientX - iniPos.x;
            displace.y = (e.clientY - iniPos.y) * 0.2;
        }
    }

    function swipe() {
        displace = imul(inorm(displace),Math. min(cardWidth, 600));
        done = true;
    }

    export function reset(){
        dragging = false;
        iniPos = ZERO();
        displace = ZERO();
        done = false;
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
        class="cardHolder"
        class:dragging
        style="--offsetX: {$springDisplace.x}px; --offsetY: {$springDisplace.y}px; --rot: {$springRot}rad;"
    >
        <slot />

        <div class="stats">
            <span>
                curPos:({Math.round(displace.x)}, {Math.round(displace.y)})
            </span>

            <span>IniPos:({Math.round(iniPos.x)}, {Math.round(iniPos.y)})</span>
            <span
                >SpringPos:({Math.round($springDisplace.x)}, {Math.round(
                    $springDisplace.y,
                )})
            </span>
            <span>
                SpringRot: {Math.round(100 * $springRot * (180 / Math.PI)) /
                    100} deg
            </span>
        </div>
    </div>

    {#if cardRoot && dragging}
        <div
            class="circle"
            style="top: {iniPos.y - rect.top}px; left: {iniPos.x -
                rect.left}px;"
        />

        <div
            class="circle"
            style="top: {iniPos.y - rect.top + displace.y}px; left: {iniPos.x -
                rect.left +
                displace.x}px; border-color:var(--red);"
        />
    {/if}
</div>

<style>
    .cardHolder {
        width: 100%;
        max-width: 500px;
        height: 100%;
        border: 2px solid var(--fg1);
        position: relative;

        transform: translate(var(--offsetX), var(--offsetY)) rotate(var(--rot));
        transition-property: scale, border-color, border, border-radius;
        transition-duration: 100ms;
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

    .circle {
        border: 3px solid var(--fg1);
        background-color: var(--bg4);
        border-radius: 50%;

        width: 2rem;
        height: 2rem;

        position: absolute;
        transform: translate(-50%, -50%);
        user-select: none;

        pointer-events: none;
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

    .dragging > .stats {
        border-radius: 0 0 20px 0px;
        transition: border-radius 100ms ease-out;
    }
</style>

import { writable } from "svelte/store";


/**
 * height in bottom bar in px;
 */
const navbarHeight = writable<number>(0);


export  {navbarHeight};
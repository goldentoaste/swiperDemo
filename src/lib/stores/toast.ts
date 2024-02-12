import { get, writable, type Writable } from "svelte/store";

export interface ToastItem {
    msg: string,
    id: number
}
let id = 0;

export const toasts: Writable<ToastItem[]> = writable([]);

/**
 * 
 * @param msg message to show
 * @returns a id handle to the message added, to move the message early if needed.
 */
 function push(msg: string) {
    id += 1;
    toasts.set([...get(toasts), { msg, id }]);
    return id;
}
 function remove(id: number) {
    const t = get(toasts);
    t.splice(t.findIndex((item) => { item.id == id }), 1);
    toasts.set(t)
}

export default {push, remove};
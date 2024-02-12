export interface Vector {
    x: number,
    y: number
}
const ZERO: () => Vector = () => { return { x: 0, y: 0 } };
const ONE: () => Vector = () => { return { x: 1, y: 1 } };

// TODO look into proper jsdocs at some point in the (far) future.
// NOTE, in theory, in place version each function should be more efficient as it doesn't allocate a obj.
// now in practice, all this function call is overhead.
/**
 * 
 * @param v1 
 * @param v2 
 * @returns the sum of the two vector as a new vector
 */
function add(v1: Vector, v2: Vector) {
    return {
        x: v1.x + v2.x,
        y: v1.y + v2.y
    }
}

/**
 * in place add. modifies v1 as a side effect
 * @param v1 
 * @param v2 
 * @return the result of adding v2 to v1.
 */
function iadd(v1: Vector, v2: Vector) {
    v1.x += v2.x;
    v1.y += v2.y;
    return v1;
}

/**
 * 
 * @param v1 
 * @param v2 
 * @returns the difference of the two vector as a new vector
 */
function sub(v1: Vector, v2: Vector) {
    return {
        x: v1.x - v2.x,
        y: v1.y - v2.y
    }
}

/**
 * in place sub. modifies v1 as a side effect
 * @param v1 
 * @param v2 
 * @return the result of adding v2 to v1.
 */
function isub(v1: Vector, v2: Vector) {
    v1.x -= v2.x;
    v1.y -= v2.y;
    return v1;
}

/**
 * mul. no side effects.
 * @param v1 
 * @param scaler 
 * @return results of the multiplication
 */
function mul(v1: Vector, scaler: number) {
    return {
        x: v1.x * scaler,
        y: v1.y * scaler
    }
}

/**
 * in place mul. modifies v1 as a side effect
 * @param v1 
 * @return the result of scaler product of v1 and scaler
 */
function imul(v1: Vector, scaler: number) {
    v1.x *= scaler;
    v1.y *= scaler;
    return v1;
}


/**
 * 
 * @param v1 
 * @param v2 
 * @returns scaler dot product between v1 and v2
 */
function dot(v1: Vector, v2: Vector) {
    return v1.x * v2.x + v1.y * v2.y;
}


/**
 * 
 * @param v1 
 * @returns magnitude of v1
 */
function mag(v1: Vector) {
    return Math.sqrt(dot(v1, v1));
}


/**
 * 
 * @param v1 
 * @returns normalized v1 as a new vector. no side effects.
 */
function norm(v1: Vector) {
    return mul(v1, 1/mag(v1));
}

/**
 * in place version of normalize. modifies original v1
 * @param v1 
 * @returns normalized v1
 */
function inorm(v1: Vector) {
    return imul(v1,1/ mag(v1));
}



/**
 * 
 * @param v1 
 * @param v2 
 * @param povit (absolute) point relative to the two points 
 * @returns the angle in radiants between the two points.
 */
function angleBetween(p1: Vector, p2: Vector, pivot: Vector) {
    // send both points back to original
    let v1 = sub(p1, pivot);
    let v2 = sub(p2, pivot);

    // dot product of 2 normed vectors is cosine between them.    
    return Math.acos(dot(inorm(v1), inorm(v2)));
}

export { ZERO, ONE, add, iadd, sub, isub, mul, imul, dot, mag, norm, inorm, angleBetween };
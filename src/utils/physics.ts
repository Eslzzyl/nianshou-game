export function computeJumpApexDelta(jumpVelocity: number, gravity: number): number {
    // v0 may be negative (upwards). delta = v0^2 / (2*g)
    if (!gravity || gravity <= 0) return 0;
    const v = Math.abs(jumpVelocity);
    return (v * v) / (2 * gravity);
}

export function computeApexY(startY: number, jumpVelocity: number, gravity: number): number {
    const delta = computeJumpApexDelta(jumpVelocity, gravity);
    return startY - delta;
}

export function point(x, y) {
    return { x: x, y: y }
  }
  
export const POINT_ZERO = point(0, 0)
  

export class Rect {
    constructor(x, y, w, h) {
        this.x = x
        this.y = y
        this.w = w
        this.h = h
    }

    intersects(other) {
        const noOverlap = this.x + this.w < other.x || other.x + other.w < this.x || this.y + this.h < other.y || other.y + other.h < this.y
        return !noOverlap
    }
}
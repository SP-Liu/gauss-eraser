import { Point } from './Type';

class EraseMap {
  ratio: number;
  w: number;
  h: number;
  square: number;
  pointMap: number[][];
  constructor(w: number, h: number, ratio = 10) {
    this.ratio = ratio;
    this.w = Math.round(w / ratio);
    this.h = Math.round(h / ratio);
    this.square = this.w * this.h;
    this.pointMap = [];
    this.init();
  }
  init() {
    for (let i = 0; i < this.w; i++) {
      this.pointMap[i] = [];
      for (let j = 0; j < this.h; j++) {
        this.pointMap[i][j] = 1;
      }
    }
  }
  getFilledRate() {
    let count = 0;
    this.pointMap.forEach((points) => {
      points.forEach((point) => {
        if (point === 2) {
          count++;
        }
      });
    });
    // console.log('Filled Count' + count + '/' + this.square);
    return count / this.square;
  }
  fillPoint(x: number, y: number, r: number) {
    for (let i = x - r; i < x + r; i++) {
      for (let j = y - r; j < y + r; j++) {
        if (
          this.pointMap[i] &&
          this.pointMap[i][j] &&
          this.pointMap[i][j] === 1
        ) {
          this.pointMap[i][j] = 2;
        }
      }
    }
  }
  fillLine(from: Point, to: Point, width: number) {
    // console.log(`${from.x}, ${from.y} --> ${to.x}, ${to.y}`);
    const r = Math.round(width / 2);
    if (from.x < to.x) {
      const k = (to.y - from.y) / (to.x - from.x);
      for (let x = from.x; x < to.x; x++) {
        const y = Math.round(x * k) + from.y;
        this.fillPoint(x, y, r);
      }
    } else if (from.x > to.x) {
      const k = (from.y - to.y) / (from.x - to.x);
      for (let x = to.x; x < from.x; x++) {
        const y = Math.round(x * k) + to.y;
        this.fillPoint(x, y, r);
      }
    } else {
      for (let y = Math.min(from.y, to.y); y < Math.max(from.y, to.y); y++) {
        this.fillPoint(from.x, y, r);
      }
    }
  }
  fillPoints(points: Point[], lineWidth: number) {
    for (let i = 1; i < points.length; i++) {
      const previousPoint = points[i - 1];
      const point = points[i];
      this.fillLine(
        this.convertRealPoint(previousPoint),
        this.convertRealPoint(point),
        lineWidth / this.ratio,
      );
    }
  }
  convertRealPoint(point: Point): Point {
    const ratio = this.ratio;
    return { x: Math.round(point.x / ratio), y: Math.round(point.y / ratio) };
  }
}

export default EraseMap;

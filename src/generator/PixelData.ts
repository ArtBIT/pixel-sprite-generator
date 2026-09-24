export class PixelData {
  readonly width: number;
  readonly height: number;
  data: number[];

  constructor(width: number, height: number, data?: number[]) {
    this.width = width;
    this.height = height;
    this.data = data ? [...data] : new Array<number>(width * height).fill(0);
  }

  get(x: number, y: number) {
    return this.data[y * this.width + x];
  }

  set(x: number, y: number, value: number) {
    this.data[y * this.width + x] = value;
  }

  clone() {
    return new PixelData(this.width, this.height, this.data);
  }
}

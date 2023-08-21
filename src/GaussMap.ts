import { Point } from './Type';
import { gaussBlur, stackBlurCanvasRGB } from './utils';

export default class GaussMap {
  blurCanvas: HTMLCanvasElement;
  blurCtx: CanvasRenderingContext2D;

  clearCanvas: HTMLCanvasElement;
  clearCtx: CanvasRenderingContext2D;

  img: string;
  lineWidth: number;
  radius = 0;
  blur: number;
  brightness: number;

  constructor(
    blurCanvas: HTMLCanvasElement,
    clearCanvas: HTMLCanvasElement,
    img: string,
    lineWidth: number,
    // 使用手写高斯模糊，该参数不生效
    blur: number,
    brightness: number,
  ) {
    // 高斯模糊蒙层
    this.blurCanvas = blurCanvas;
    this.blurCtx = this.blurCanvas.getContext('2d') as CanvasRenderingContext2D;
    // 清晰图片
    this.clearCanvas = clearCanvas;
    this.clearCtx = clearCanvas.getContext('2d') as CanvasRenderingContext2D;
    this.img = img;
    this.lineWidth = lineWidth;
    this.radius = lineWidth / 2;
    this.blur = blur;
    this.brightness = brightness;
  }
  initMap(w: number, h: number) {
    return new Promise<void>((resolve, reject) => {
      const {
        blurCanvas,
        blurCtx,
        clearCtx,
        clearCanvas,
        img,
        blur,
        brightness,
      } = this;
      blurCanvas.width = clearCanvas.width = w;
      blurCanvas.height = clearCanvas.height = h;

      const image = new Image();
      image.src = img;
      image.setAttribute('crossOrigin', 'Anonymous');
      image.onload = () => {
        const iw = image.width;
        const ih = image.height;
        const ir = iw / ih;
        const tw = clearCanvas.width;
        const th = clearCanvas.height;
        const tr = tw / th;
        let sw, sh, sx, sy;
        if (ir <= tr) {
          sw = iw;
          sh = sw / tr;
          sx = 0;
          sy = (ih - sh) / 2;
        } else {
          sh = ih;
          sw = sh * tr;
          sx = (iw - sw) / 2;
          sy = 0;
        }
        clearCtx.drawImage(image, sx, sy, sw, sh, 0, 0, tw, th);
        blurCtx.drawImage(image, sx, sy, sw, sh, 0, 0, tw, th);
        stackBlurCanvasRGB(
          blurCtx,
          0,
          0,
          blurCanvas.width,
          blurCanvas.height,
          blur,
          brightness,
        );
        resolve();

        // 手写高斯模糊，方法2，不支持blur配置，暂时保留
        // createImageBitmap(
        //   gaussBlur(
        //     clearCtx.getImageData(
        //       0,
        //       0,
        //       clearCanvas.width,
        //       clearCanvas.height,
        //     ),
        //   ),
        // ).then((res) => {
        //   blurCtx.filter = `brightness(${brightness})`;
        //   blurCtx.drawImage(res, 0, 0, blurCanvas.width, blurCanvas.height);
        //   resolve();
        // });
      };
      image.onerror = (err) => {
        reject(err);
      };
    });
  }
  updateMap(point: Point) {
    const { x, y } = point;
    const { blurCtx } = this;
    // 参考 https://hovertree.com/texiao/html5/25/
    blurCtx.globalCompositeOperation = 'destination-out';
    // 绘制擦掉的部分
    blurCtx.beginPath();
    blurCtx.arc(x, y, this.radius, 0, Math.PI * 2, true);
    blurCtx.fill();
  }
  makeClear() {
    this.blurCtx.drawImage(this.clearCanvas, 0, 0);
  }
}

import { Point } from './Type';
import EraseMap from './EraseMap';
import { getQuery } from './utils';
import GaussMap from './GaussMap';

const EraseMapEvent = {
  start() {
    console.log('start');
  },
  success() {
    console.log('success');
  },
  end() {
    console.log('end');
  },
  failed(type: string, e: unknown) {
    console.log(type);
    console.log(e);
    console.log('failed');
  },
};

const getQueryOption = () => {
  // 擦图面积计算取样，值越大取样越粗，最小值为1（ratio个像素作为一个网格）
  const mapRatio = Number(getQuery(location.href, 'ratio')) || 10;
  // 擦图成功阈值，阈值>0
  const successThreshold = Number(getQuery(location.href, 'threshold')) || 0.6;
  // 擦图线宽，基于页面宽/高最小值计算
  // 互斥的两个设置，默认使用ratio=0.3
  let lineWidth = Number(getQuery(location.href, 'line_width'));
  const lineRatio = Number(getQuery(location.href, 'line_ratio')) || 0.3;
  if (!lineWidth && lineRatio) {
    lineWidth = Math.min(window.innerWidth, window.innerHeight) * lineRatio;
  }

  // 高斯模糊值
  const blur = Number(getQuery(location.href, 'blur')) || 80;
  // 卡片亮度
  const brightness = Number(getQuery(location.href, 'brightness')) || 0.8;

  // 图片
  // attention: 使用canvas api，对图片cors配置有要求
  const img = decodeURIComponent(getQuery(location.href, 'img') || '');

  return {
    mapRatio,
    successThreshold,
    lineWidth,
    img,
    blur,
    brightness,
  };
};

const run = () => {
  const {
    mapRatio,
    successThreshold,
    lineWidth,
    img,
    blur,
    brightness,
  } = getQueryOption();
  let firstMoveFlag = true;
  let endFlag = false;
  const wrapper = document.getElementById('wrapper') as HTMLDivElement;
  wrapper.style.height = window.innerHeight + 'px';
  wrapper.style.width = window.innerWidth + 'px';
  const blurCanvas = document.getElementById(
    'blur-canvas',
  ) as HTMLCanvasElement;
  const clearCanvas = document.querySelector(
    '#clear-canvas',
  ) as HTMLCanvasElement;


  // 获取canvas
  const eraseMap = new EraseMap(
    window.innerWidth,
    window.innerHeight,
    mapRatio,
  );
  const gaussMap = new GaussMap(
    blurCanvas,
    clearCanvas,
    img,
    lineWidth,
    blur,
    brightness,
  );
  gaussMap
    .initMap(window.innerWidth, window.innerHeight)
    .then(() => {
      const points: Point[] = [];
      function draw(x: number, y: number) {
        if (firstMoveFlag) {
          EraseMapEvent.start();
          firstMoveFlag = false;
        }
        if (endFlag) {
          return;
        }
        const point = { x, y };

        gaussMap.updateMap(point);
        points.push(point);
        if (points.length > 1) {
          eraseMap.fillPoints(
            [points[points.length - 2], points[points.length - 1]],
            lineWidth,
          );
        }
        if (eraseMap.getFilledRate() > successThreshold) {
          gaussMap.makeClear();
          EraseMapEvent.success();
          EraseMapEvent.end();
          endFlag = true;
        }
      }

      // 移动端手势擦除
      document.addEventListener(
        'touchmove',
        (e) => {
          e.preventDefault();
          e.stopPropagation();
          try {
            draw(e.touches[0].clientX, e.touches[0].clientY);
          } catch (err) {
            EraseMapEvent.failed('touchmove', err);
            endFlag = true;
          }
        },
        { passive: false },
      );

      // 桌面端鼠标擦除
      let mousePressFlag = false;
      document.addEventListener('mousedown', () => {
        mousePressFlag = true;
      });
      document.addEventListener('mouseup', () => {
        mousePressFlag = false;
      });
      document.addEventListener('mousemove', (e) => {
        if (!mousePressFlag) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        try {
          draw(e.clientX, e.clientY);
        } catch (err) {
          EraseMapEvent.failed('touchmove', err);
          endFlag = true;
        }
      },
        { passive: false },
      );
    })
    .catch((e) => {
      EraseMapEvent.failed('init', e);
      EraseMapEvent.end();
    });
};

try {
  run();
} catch (e) {
  EraseMapEvent.failed('global', e);
}

/**
 * Генератор иконок PWA.
 *
 * Пишем PNG вручную через встроенный zlib, чтобы не тащить в проект
 * графическую библиотеку ради двух картинок. Формат простой:
 * подпись, заголовок IHDR, сжатые пиксели IDAT, конец IEND.
 *
 * Запуск: node scripts/make-icons.mjs
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

/* ---------- Минимальный кодировщик PNG ---------- */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData));
  return Buffer.concat([length, typeAndData, crc]);
}

function encodePng(size, rgba) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // бит на канал
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // сжатие
  ihdr[11] = 0; // фильтрация
  ihdr[12] = 0; // без чересстрочности

  // Каждая строка пикселей предваряется байтом фильтра (0 — без фильтра)
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ---------- Рисование ---------- */

const ACCENT = [0x5b, 0x8c, 0xff, 0xff];
const WHITE = [0xff, 0xff, 0xff, 0xff];

function makeCanvas(size, color) {
  const buf = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i++) buf.set(color, i * 4);
  return buf;
}

/** Заливает прямоугольник в долях от размера холста (0..1). */
function fillRect(buf, size, color, x0, y0, x1, y1) {
  const px = (v) => Math.round(v * size);
  for (let y = px(y0); y < px(y1); y++) {
    for (let x = px(x0); x < px(x1); x++) {
      if (x < 0 || y < 0 || x >= size || y >= size) continue;
      buf.set(color, (y * size + x) * 4);
    }
  }
}

/**
 * Буква E из четырёх полос. Держим её внутри центральных 60% холста —
 * это безопасная зона maskable-иконки, которую Android может обрезать
 * до круга, не срезав глиф.
 */
function drawIcon(size) {
  const buf = makeCanvas(size, ACCENT);
  fillRect(buf, size, WHITE, 0.3, 0.28, 0.42, 0.72); // вертикаль
  fillRect(buf, size, WHITE, 0.3, 0.28, 0.7, 0.4); // верхняя полка
  fillRect(buf, size, WHITE, 0.3, 0.44, 0.63, 0.56); // средняя
  fillRect(buf, size, WHITE, 0.3, 0.6, 0.7, 0.72); // нижняя
  return encodePng(size, buf);
}

mkdirSync(OUT_DIR, { recursive: true });
for (const size of [192, 512]) {
  const file = join(OUT_DIR, `icon-${size}.png`);
  writeFileSync(file, drawIcon(size));
  console.log(`создано ${file}`);
}

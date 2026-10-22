// A small PNG encoder: RGBA pixels in, a whole PNG file out. Deflate uses the
// fixed Huffman table with LZ77 matching, which is all line art on black
// needs: the long black runs collapse to a few bytes each.
const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++)
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    CRC_TABLE[n] = c >>> 0;
}
const crc32 = (bytes, start, end) => {
    let c = 0xffffffff;
    for (let i = start; i < end; i++)
        c = CRC_TABLE[(c ^ bytes[i]) & 255] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
};
const adler32 = (bytes) => {
    let a = 1;
    let b = 0;
    for (let i = 0; i < bytes.length; i++) {
        a = (a + bytes[i]) % 65521;
        b = (b + a) % 65521;
    }
    return ((b << 16) | a) >>> 0;
};
const LEN_BASE = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258];
const LEN_EXTRA = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];
const DIST_BASE = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577];
const DIST_EXTRA = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];
class BitWriter {
    out = [];
    acc = 0;
    n = 0;
    // bits LSB-first, as deflate reads them
    bits(value, count) {
        this.acc |= value << this.n;
        this.n += count;
        while (this.n >= 8) {
            this.out.push(this.acc & 255);
            this.acc >>>= 8;
            this.n -= 8;
        }
    }
    // a Huffman code is written most significant bit first
    code(value, count) {
        let r = 0;
        for (let i = 0; i < count; i++)
            r = (r << 1) | ((value >> i) & 1);
        this.bits(r, count);
    }
    finish() {
        if (this.n > 0)
            this.out.push(this.acc & 255);
        return Uint8Array.from(this.out);
    }
}
const writeLiteral = (w, v) => {
    if (v < 144)
        w.code(0x30 + v, 8);
    else
        w.code(0x190 + (v - 144), 9);
};
const writeLength = (w, len) => {
    let i = LEN_BASE.length - 1;
    while (LEN_BASE[i] > len)
        i--;
    const sym = 257 + i;
    if (sym < 280)
        w.code(sym - 256, 7);
    else
        w.code(0xc0 + (sym - 280), 8);
    if (LEN_EXTRA[i])
        w.bits(len - LEN_BASE[i], LEN_EXTRA[i]);
};
const writeDistance = (w, dist) => {
    let i = DIST_BASE.length - 1;
    while (DIST_BASE[i] > dist)
        i--;
    w.code(i, 5);
    if (DIST_EXTRA[i])
        w.bits(dist - DIST_BASE[i], DIST_EXTRA[i]);
};
const WINDOW = 32768;
const MIN_MATCH = 3;
const MAX_MATCH = 258;
export const deflate = (data) => {
    const w = new BitWriter();
    w.bits(1, 1); // final block
    w.bits(1, 2); // fixed Huffman
    const head = new Int32Array(65536).fill(-1);
    const prev = new Int32Array(data.length);
    const hash = (i) => ((data[i] << 8) ^ (data[i + 1] << 4) ^ data[i + 2]) & 65535;
    let i = 0;
    while (i < data.length) {
        let best = 0;
        let bestDist = 0;
        if (i + MIN_MATCH <= data.length) {
            const h = hash(i);
            let p = head[h];
            let tries = 32;
            while (p >= 0 && i - p <= WINDOW && tries-- > 0) {
                let l = 0;
                const max = Math.min(MAX_MATCH, data.length - i);
                while (l < max && data[p + l] === data[i + l])
                    l++;
                if (l > best) {
                    best = l;
                    bestDist = i - p;
                    if (l === max)
                        break;
                }
                p = prev[p];
            }
            prev[i] = head[h];
            head[h] = i;
        }
        if (best >= MIN_MATCH) {
            writeLength(w, best);
            writeDistance(w, bestDist);
            // index the positions the match covered so later matches can start inside it
            for (let k = 1; k < best && i + k + MIN_MATCH <= data.length; k++) {
                const h = hash(i + k);
                prev[i + k] = head[h];
                head[h] = i + k;
            }
            i += best;
        }
        else {
            writeLiteral(w, data[i]);
            i++;
        }
    }
    w.code(0, 7); // end of block
    return w.finish();
};
const be32 = (n) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
const chunk = (type, body) => {
    const t = [...type].map(ch => ch.charCodeAt(0));
    const out = new Uint8Array(12 + body.length);
    out.set(be32(body.length), 0);
    out.set(t, 4);
    out.set(body, 8);
    out.set(be32(crc32(out, 4, 8 + body.length)), 8 + body.length);
    return out;
};
export const encodePng = (width, height, rgba) => {
    // each scanline is prefixed with filter type 0 (none)
    const stride = width * 4;
    const raw = new Uint8Array((stride + 1) * height);
    for (let y = 0; y < height; y++) {
        raw[y * (stride + 1)] = 0;
        raw.set(rgba.subarray(y * stride, (y + 1) * stride), y * (stride + 1) + 1);
    }
    const body = deflate(raw);
    const zlib = new Uint8Array(2 + body.length + 4);
    zlib[0] = 0x78;
    zlib[1] = 0x01;
    zlib.set(body, 2);
    zlib.set(be32(adler32(raw)), 2 + body.length);
    const sig = [137, 80, 78, 71, 13, 10, 26, 10];
    const ihdr = chunk('IHDR', [...be32(width), ...be32(height), 8, 6, 0, 0, 0]);
    const idat = chunk('IDAT', zlib);
    const iend = chunk('IEND', []);
    const png = new Uint8Array(sig.length + ihdr.length + idat.length + iend.length);
    let o = 0;
    for (const part of [Uint8Array.from(sig), ihdr, idat, iend]) {
        png.set(part, o);
        o += part.length;
    }
    return png;
};

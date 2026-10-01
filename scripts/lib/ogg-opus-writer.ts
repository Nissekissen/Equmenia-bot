// Minimal Ogg Opus muxer. Used only for diagnostics: it lets us dump raw,
// undecoded Opus packets straight from Discord into a file that any standard
// tool (ffmpeg, VLC) can decode with its own Opus implementation — independent
// of prism-media/@discordjs/opus — to isolate whether a bug is in our decode
// pipeline or in the received data itself.
import fs from "fs";

const CRC32_POLY = 0x04c11db7;

// A zero-length buffer is libopus's documented signal to invoke packet-loss concealment,
// not an actual packet — there's no TOC byte, so it isn't valid standalone Opus data. A
// real decode pipeline (prism-media/@discordjs/opus) handles this transparently via its
// own PLC. A static container has no equivalent "conceal a lost frame" mechanism, so we
// substitute Discord's own minimal silence packet — real, valid Opus data representing
// near-silence — to keep the file's own duration accounting consistent.
const SILENCE_FRAME = Buffer.from([0xf8, 0xff, 0xfe]);

function crc32Update(crc: number, data: Buffer): number {
    for (let i = 0; i < data.length; i++) {
        crc = (crc ^ (data[i] << 24)) >>> 0;
        for (let bit = 0; bit < 8; bit++) {
            crc = crc & 0x80000000 ? ((crc << 1) ^ CRC32_POLY) >>> 0 : (crc << 1) >>> 0;
        }
    }
    return crc >>> 0;
}

function segmentTable(packetLengths: number[]): number[] {
    const segments: number[] = [];
    for (const length of packetLengths) {
        let remaining = length;
        while (remaining >= 255) {
            segments.push(255);
            remaining -= 255;
        }
        segments.push(remaining);
    }
    return segments;
}

function buildPage(opts: {
    headerType: number;
    granulePosition: bigint;
    serial: number;
    pageSequence: number;
    packets: Buffer[];
}): Buffer {
    const segments = segmentTable(opts.packets.map((p) => p.length));
    const header = Buffer.alloc(27 + segments.length);

    header.write("OggS", 0, "ascii");
    header.writeUInt8(0, 4); // version
    header.writeUInt8(opts.headerType, 5);
    header.writeBigInt64LE(opts.granulePosition, 6);
    header.writeUInt32LE(opts.serial, 14);
    header.writeUInt32LE(opts.pageSequence, 18);
    header.writeUInt32LE(0, 22); // checksum placeholder
    header.writeUInt8(segments.length, 26);
    for (let i = 0; i < segments.length; i++) header.writeUInt8(segments[i], 27 + i);

    const page = Buffer.concat([header, ...opts.packets]);
    const checksum = crc32Update(0, page);
    page.writeUInt32LE(checksum, 22);
    return page;
}

// Duration of an Opus packet in samples at 48kHz, derived from its TOC byte (RFC 6716 §3.1).
// Needed because packets aren't always a fixed 20ms/960 samples — occasionally several
// frames are bundled into one packet, and granule positions must reflect real duration.
function packetDurationSamples(packet: Buffer): number {
    const toc = packet[0];
    const config = (toc >> 3) & 0x1f;
    const code = toc & 0x3;

    let frameMs: number;
    if (config < 12) frameMs = [10, 20, 40, 60][config % 4];
    else if (config < 16) frameMs = config % 2 === 0 ? 10 : 20;
    else frameMs = [2.5, 5, 10, 20][(config - 16) % 4];

    const frameCount = code === 0 ? 1 : code === 1 || code === 2 ? 2 : packet[1] & 0x3f;

    return Math.round(frameMs * 48 * frameCount);
}

export class OggOpusWriter {
    private readonly fileStream: fs.WriteStream;
    private readonly serial: number;
    private pageSequence = 0;
    private granulePosition = 0n;
    private finished = false;

    constructor(filePath: string, opts: { sampleRate: number; channels: number }) {
        this.fileStream = fs.createWriteStream(filePath);
        this.serial = Math.floor(Math.random() * 0xffffffff);

        const head = Buffer.alloc(19);
        head.write("OpusHead", 0, "ascii");
        head.writeUInt8(1, 8); // version
        head.writeUInt8(opts.channels, 9);
        head.writeUInt16LE(0, 10); // pre-skip
        head.writeUInt32LE(opts.sampleRate, 12);
        head.writeInt16LE(0, 16); // output gain
        head.writeUInt8(0, 18); // channel mapping family
        this.fileStream.write(
            buildPage({
                headerType: 0x02,
                granulePosition: 0n,
                serial: this.serial,
                pageSequence: this.pageSequence++,
                packets: [head],
            }),
        );

        const vendor = Buffer.from("equmenia-bot", "ascii");
        const tags = Buffer.alloc(8 + 4 + vendor.length + 4);
        tags.write("OpusTags", 0, "ascii");
        tags.writeUInt32LE(vendor.length, 8);
        vendor.copy(tags, 12);
        tags.writeUInt32LE(0, 12 + vendor.length); // user comment list length
        this.fileStream.write(
            buildPage({
                headerType: 0,
                granulePosition: 0n,
                serial: this.serial,
                pageSequence: this.pageSequence++,
                packets: [tags],
            }),
        );
    }

    writePacket(rawPacket: Buffer): void {
        const packet = rawPacket.length === 0 ? SILENCE_FRAME : rawPacket;
        this.granulePosition += BigInt(packetDurationSamples(packet));
        this.fileStream.write(
            buildPage({
                headerType: 0,
                granulePosition: this.granulePosition,
                serial: this.serial,
                pageSequence: this.pageSequence++,
                packets: [packet],
            }),
        );
    }

    async finish(): Promise<void> {
        if (this.finished) return;
        this.finished = true;
        this.fileStream.write(
            buildPage({
                headerType: 0x04,
                granulePosition: this.granulePosition,
                serial: this.serial,
                pageSequence: this.pageSequence++,
                packets: [],
            }),
        );
        await new Promise<void>((resolve) => this.fileStream.end(() => resolve()));
    }
}

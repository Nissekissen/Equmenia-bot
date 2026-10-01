// TODO: given the per-speaker temp files + offsets produced by capture.ts,
// shell out to ffmpeg (ffmpeg-static binary path) with amix + adelay filters
// to flatten them into a single final recording under config.recordingsDir,
// then delete the per-speaker temp files.
export {};

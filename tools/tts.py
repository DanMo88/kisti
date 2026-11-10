#!/usr/bin/env python3
"""Generate MP3s from tools/tts_jobs.json with edge-tts (fa-IR-FaridNeural, slow).
Reconstructed Old Persian pronunciation approximated with Persian letters. Trims leading/trailing silence."""
import asyncio, json, os, subprocess, sys
import edge_tts
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICE, RATE = "fa-IR-FaridNeural", "-30%"
async def one(fname, text):
    path = os.path.join(ROOT, fname); tmp = path + ".raw.mp3"
    for attempt in range(4):
        try:
            await edge_tts.Communicate(text, VOICE, rate=RATE).save(tmp); break
        except Exception: await asyncio.sleep(2 + attempt * 3)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-af",
        "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,adelay=60|60,apad=pad_dur=0.15",
        "-ac", "1", "-b:a", "64k", path], check=True)
    os.remove(tmp)
async def main():
    jobs = json.load(open(os.path.join(ROOT, "tools", "tts_jobs.json"), encoding="utf-8"))
    only = sys.argv[1:]
    await asyncio.gather(*[one(f, t) for f, t in jobs.items() if not only or f in only])
asyncio.run(main())

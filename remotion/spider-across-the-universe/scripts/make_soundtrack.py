"""Synthesizes public/audio/soundtrack.mp3, timed to the video's frames.

Everything is generated from scratch with numpy (no samples), so the audio is
original and can be regenerated after timing changes:

    python3 scripts/make_soundtrack.py

Keep the frame constants below in sync with src/constants.ts.
"""

import os
import subprocess
import tempfile
import wave

import numpy as np

FPS = 30
TITLE_FRAMES = 84
DIM_FRAMES = 108
PORTAL_FRAMES = 22
ENDING_FRAMES = 135
DIMENSIONS = 5
FRAMES_PER_SWING = 40
FALL_FRAMES = 86  # Ending.tsx: frames before the TO BE CONTINUED card

SWING_END = TITLE_FRAMES + DIMENSIONS * DIM_FRAMES
TOTAL_FRAMES = SWING_END + ENDING_FRAMES

SR = 44100
BEAT = FRAMES_PER_SWING / 2 / FPS  # two beats per swing -> 90 BPM
rng = np.random.default_rng(7)
mix = np.zeros((int(TOTAL_FRAMES / FPS * SR), 2))


def sec(frame):
    return frame / FPS


def t_axis(dur):
    return np.arange(int(dur * SR)) / SR


def note(name):
    names = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}
    semis = names[name[0]] + (1 if "#" in name else 0)
    octave = int(name[-1])
    return 440.0 * 2 ** ((semis - 9) / 12 + octave - 4)


def lowpass(x, width):
    if width <= 1:
        return x
    return np.convolve(x, np.ones(width) / width, mode="same")


def saw(freq, t):
    return 2 * ((t * freq) % 1) - 1


def add(start, signal, gain=1.0, pan=0.0):
    i = int(start * SR)
    if i >= len(mix):
        return
    signal = signal[: len(mix) - i]
    mix[i : i + len(signal), 0] += signal * gain * (1 - max(pan, 0))
    mix[i : i + len(signal), 1] += signal * gain * (1 + min(pan, 0))


def kick():
    t = t_axis(0.35)
    f = 42 + 95 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)


def snare():
    t = t_axis(0.25)
    noise = lowpass(rng.uniform(-1, 1, len(t)), 2) * np.exp(-t * 18)
    return noise * 0.7 + np.sin(2 * np.pi * 185 * t) * np.exp(-t * 25) * 0.5


def hat():
    t = t_axis(0.06)
    n = rng.uniform(-1, 1, len(t) + 1)
    return np.diff(n) * 0.5 * np.exp(-t * 70)


def bass(freq, dur):
    t = t_axis(dur)
    env = np.minimum(1, t / 0.005) * np.exp(-t * 2.5)
    return lowpass(saw(freq, t) + 0.5 * np.sin(2 * np.pi * freq / 2 * t), 14) * env


def stab(freqs):
    t = t_axis(0.35)
    s = sum(saw(f, t) + saw(f * 1.006, t) for f in freqs) / (2 * len(freqs))
    return lowpass(s, 5) * np.exp(-t * 9)


def pad(freqs, dur):
    t = t_axis(dur)
    s = sum(saw(f, t) + saw(f * 1.004, t) + saw(f * 0.997, t) for f in freqs) / (3 * len(freqs))
    env = np.minimum(1, t / 0.8) * np.minimum(1, (dur - t) / 0.6)
    return lowpass(s, 40) * env


def thwip():
    t = t_axis(0.16)
    f = 2600 * np.exp(-t * 28) + 260
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 22)
    noise = lowpass(rng.uniform(-1, 1, len(t)), 3) * np.exp(-t * 45) * 0.35
    return tone + noise


def riser(dur):
    t = t_axis(dur)
    f = 180 * (12 ** (t / dur))
    tone = saw(1, np.cumsum(f) / SR) * 0.4
    noise = rng.uniform(-1, 1, len(t)) * 0.5
    return lowpass(tone + noise, 4) * (t / dur) ** 2


def impact(dur=1.4):
    t = t_axis(dur)
    f = 30 + 70 * np.exp(-t * 12)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3)
    crash = lowpass(rng.uniform(-1, 1, len(t)), 2) * np.exp(-t * 5) * 0.45
    return boom + crash


def glitch(dur):
    out = []
    while sum(len(x) for x in out) < dur * SR:
        t = t_axis(0.03)
        out.append(np.sign(np.sin(2 * np.pi * rng.uniform(150, 1800) * t)) * 0.4)
    return np.concatenate(out)[: int(dur * SR)]


def wind(dur):
    t = t_axis(dur)
    env = np.minimum(1, t / 1.5) * (0.6 + 0.4 * np.sin(t * 5))
    return lowpass(rng.uniform(-1, 1, len(t)), 60) * env * 3


# --- title -----------------------------------------------------------------
add(sec(4), impact(), 0.9)
add(sec(20), riser(0.5)[::-1], 0.35)  # reverse riser = whoosh for the caption
add(0, pad([note("E3"), note("G3"), note("B3")], sec(TITLE_FRAMES)), 0.35)
add(sec(TITLE_FRAMES - 12), glitch(sec(12)), 0.25)

# --- swinging through the dimensions ----------------------------------------
progression = [
    ("E2", [note("E3"), note("G3"), note("B3")]),
    ("C2", [note("C3"), note("E3"), note("G3")]),
    ("G2", [note("G3"), note("B3"), note("D4")]),
    ("D2", [note("D3"), note("F#3"), note("A3")]),
]
beats = int((SWING_END - TITLE_FRAMES) / FPS / BEAT)
for b in range(beats):
    start = sec(TITLE_FRAMES) + b * BEAT
    root, chord = progression[(b // 4) % 4]
    if b % 4 in (0, 2):
        add(start, kick(), 0.9)
    if b % 4 == 1:
        add(start + BEAT * 0.75, kick(), 0.6)
    if b % 4 in (1, 3):
        add(start, snare(), 0.55)
    for h in range(2):
        add(start + h * BEAT * 0.56, hat(), 0.25 if h else 0.35, pan=0.3)
    bass_notes = [root, root, root[0] + str(int(root[-1]) + 1), root]
    add(start, bass(note(bass_notes[b % 4]), BEAT * 0.9), 0.45)
    if b % 2 == 1:
        add(start + BEAT * 0.5, stab(chord), 0.22, pan=-0.2)

for frame in range(TITLE_FRAMES, SWING_END, FRAMES_PER_SWING):
    add(sec(frame), thwip(), 0.35, pan=0.15)

for d in range(DIMENSIONS):
    portal = TITLE_FRAMES + d * DIM_FRAMES + DIM_FRAMES - PORTAL_FRAMES
    add(sec(portal), riser(sec(PORTAL_FRAMES)), 0.5)
    add(sec(portal + 6), glitch(sec(10)), 0.18)
    add(sec(portal + PORTAL_FRAMES), impact(1.0), 0.6)

# --- leap of faith and the end card -----------------------------------------
fall = sec(SWING_END)
add(fall, wind(sec(FALL_FRAMES)), 0.35)
add(fall, pad([note("E3"), note("B3"), note("D4"), note("G4")], sec(FALL_FRAMES)), 0.4)
add(sec(SWING_END + FALL_FRAMES), impact(2.2), 1.0)
end_len = sec(ENDING_FRAMES - FALL_FRAMES)
add(sec(SWING_END + FALL_FRAMES), pad([note("E2"), note("B2"), note("E3"), note("G3")], end_len), 0.45)

# --- master -------------------------------------------------------------------
mix = np.tanh(mix * 1.2)
mix *= 0.9 / np.max(np.abs(mix))
fade = int(0.4 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)[:, None]

here = os.path.dirname(os.path.abspath(__file__))
out = os.path.join(here, "..", "public", "audio", "soundtrack.mp3")
os.makedirs(os.path.dirname(out), exist_ok=True)
with tempfile.TemporaryDirectory() as tmp:
    wav = os.path.join(tmp, "soundtrack.wav")
    with wave.open(wav, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((mix * 32767).astype(np.int16).tobytes())
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", wav, "-b:a", "192k", out], check=True)
print("wrote", os.path.normpath(out))

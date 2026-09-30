# Quenzy — "Your Gut Hates Your Soda" (spec reel)

A 72-second, 9:16 (1080×1920, 30fps) marketing reel for [Quenzy](https://thequenzy.com), the
prebiotic soda. **Final video:** `out/quenzy_reel_share.mp4` (27 MB). `./build.sh` rebuilds the full-quality master, `out/quenzy_reel.mp4` (~70 MB, not committed).

Everything is original and generated from code: every illustration, the can renders, the
mascot, the motion graphics, the music and all the sound effects. No stock or scraped assets.

## Storyline (120 BPM, every cut on the beat)

| Time | Beat | What happens |
|---|---|---|
| 0–4s | **Hook** | Can-crack SFX. "YOUR GUT / HATES / YOUR SODA." slams in. A grumpy gut mascot rises: "(and it has receipts)". |
| 4–14s | **Exhibit A** | "Regular soda." Nine sugar cubes plop into a dull can while a counter ticks up (≈35g in a typical 330ml cola). The gut turns green: *Sugar crash. Bloat. Regret.* Sad trombone. |
| 14–22s | **Exhibit B** | "'Healthy' drinks." A glass of swamp sludge with a fly. The gut gags: "tastes like homework." → "TASTY or HEALTHY?" → the "or" gets crossed out → **WHY NOT BOTH?** Riser, then silence. |
| 22–30s | **The drop** | White flash. The Quenzy can bounces in with a splash and shockwave. "SAY HI TO quenzy". Tagline: "Soda, but with a **GUT FEELING.**" The mascot gets heart-eyes. |
| 30–40s | **Stats** | One stat per bar: **<15** calories · **~~35g~~ → 0g** added sugar · **5g** prebiotic fibre · **0** preservatives. Payoff: "your gut rn:" (happy tears). |
| 40–58s | **Flavours** | Blueberry × Litchi ("main-character energy"), Orange × Cream ("your childhood creamsicle, but grown up"), Cucumber × Mint ("self-care in a can"). Each can spins in with an orbiting fruit burst. |
| 58–64s | **Proof** | "Started in BENGALURU with one very strong gut feeling." → "FIRST DROP?" stopwatch → **SOLD OUT** stamp, "in 2 hours." |
| 64–72s | **CTA** | Three-can lineup. "FIZZ. FUN. FIBRE." → "Your gut called. Answer it." → thequenzy.com / @drinkquenzy → red end card. |

The "gut feeling" line ties together the brand line ("soda, but with a GUT feeling"), the
mascot and the founder story. The ending lands on a can crack, so the reel loops cleanly
into the opening crack.

## Build

```bash
cd reel
npm install
pip install numpy scipy fonttools brotli imageio-ffmpeg
./build.sh                                # -> out/quenzy_reel.mp4
node src/render.js contact 0 72 1         # contact sheet, one frame per second
node src/render.js stills 22.5 44         # single frames
node src/sheet.js                         # asset sheets (cans, fruits, mascot, props)
```

- `src/lib.js`: easing, text and shape helpers, palette
- `src/assets.js`: fruits, can labels, the cylinder-mapped spinning can, the gut mascot, props
- `src/scenes.js`: the timeline, scenes, transitions, camera shake, and the SFX cue sheet
- `audio/make_audio.py`: original 120 BPM track and synthesized SFX, mixed and limited

## Before publishing

- Product facts come from public listings: <15 kcal, 5g prebiotic fibre, no added sugar,
  zero preservatives, 250ml, three flavours, Bengaluru, first batch sold out in 2 hours.
  Have the brand confirm them, especially the "sold out in 2 hours" claim and the
  "≈35g sugar in a typical 330ml cola" comparison.
- The can art is an illustrated interpretation of the packaging (pink header, red
  wordmark, yellow "Fizz. Fun. Fibre." callout). Swap in the official logo or real product
  shots if the brand wants exact packaging.
- For Reels/TikTok, pair the video with a trending audio bed if you like. The built-in
  track is original, so it's safe to use.

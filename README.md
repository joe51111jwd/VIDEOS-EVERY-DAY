# Videos Every Day

One idea a day, turned into a short animated video for X (built with Remotion).
Each idea lives in its own top-level folder.

## Ideas

- [`riff/`](riff/): Riff, the voice-driven Mac design app
  - `riff-hype-video*.mp4`: cuts v1 to v5; `riff-hype-video-v5.mp4` is the final cut with audio
  - `v5-src/`: Remotion and Blender source for v5 (see its README)
  - `voices/`, `music/`, `sfx/`: ElevenLabs dialogue takes, music and sound effects
  - `waitlist-site/`: source for https://riff-waitlist.vercel.app
- [`tab-to-finish/`](tab-to-finish/): Tab to Finish, do a task twice and press Tab for the rest (Oct 6)
  - `tab-to-finish-9x16.mp4`: the final 27 s vertical film with sound; `tab-to-finish-16x9.mp4`: the landscape layout
  - `src-film/`: Remotion source and the ElevenLabs audio pipeline (rebuild steps in the folder README)

API keys are never committed; scripts read them from environment variables.

# Checks

Run these before every push. Each check exists because the bug it catches has happened.

| Command | What it does | Needs |
| --- | --- | --- |
| `node tools/lint.js` | Static checks of every lesson: missing nodes, specials, speakers, letters; dead ends; word tiles that cannot build an accepted answer; Danish words with no meaning in the glossary; vocabulary icons; names of real people (`tools/blocklist.txt`). | Node only |
| `node tools/playtest.js` | Plays every lesson to the end in a phone-sized browser, picking choices like a player who wants to get on with the story. Fails on JavaScript errors, stuck screens or rejected answers. `--runs 3`, `--chain` (carry the character from lesson to lesson), `k1l2` (one lesson), `--shots dir/` (screenshots with real animations). | Playwright + Chromium |
| `node tools/scenes.js out.png` | One picture with every scene at morning, afternoon, evening and night. Look at it after any art or lighting change. | Playwright + Chromium |

`npm test` runs the lint and one playtest per lesson. The lint also runs on GitHub for every push (`.github/workflows/check.yml`).

Manual checks the tools cannot do: listen on a phone (voice not cut off, music per place), watch one real transition and one walk on the map, read the new Danish aloud once.

# Det var ikke noget

*Contracts, lies and d20 rolls in a fog-bound city that only listens in Danish.*

**v2 (current, root):** Witcher-style contracts solved through dialogue and actions, BG3-style d20 checks, dark cinematic look. **v1** (the card-battle version) lives in `/v1`.

## How v2 plays

- **Prepare** at Pensionat Tågelys: read the contract (tap any word for its meaning), practise the contract's key phrases (mastery persists between playthroughs and gives +1/+2 to rolls that use them), spend skill points.
- **Skills:** Sprog (speaking Danish well), Løgn (lying), Snige (sneaking/stealing), Handel (trading/bribing), Indsigt (noticing). Level up with XP → more points.
- **Saying something in Danish** = building the sentence from word tiles. Perfect first try → *advantage* on the d20; two or more mistakes → *disadvantage*. A før-inversion earns +1.
- **Understanding** = tap words for free; asking "På engelsk?" costs standing (Anseelse).
- **Actions** (sneak, steal, bribe, lie, look) are skill checks with real consequences. No moral rules.
- **Audio is optional** (☰ → Stemme). Nothing depends on it.

## Adding content (v2)

Everything is in `js/data.js`: `PHRASES` (per book session), `NPCS` (portrait parameters), `DICT` (glossary), `CONTRACTS` (nodes, options, endings), `LETTERS` (reading tasks). Art lives in `js/art.js` (scenes + parametric portraits), engine in `js/engine.js`. Test with `python3 -m http.server` and `/?fast`.

---

# v1 notes (card version)

*A fog-bound roguelike card game for learning Danish.* Balatro-style sentence scoring, Slay the Spire map and enemy intents, Gwent-style best-of-three boss, and a Baldur's Gate 3–style narrator.

**Play (phone):** open the GitHub Pages link of this repo in Chrome on Android. Danish speech uses the phone's built-in voice (Settings → Text-to-speech → install Danish if it's missing).

## The idea

You arrive by ferry in **Vandmark**, a damp, bureaucratic harbour city where only words spoken in Danish are binding. English is the common tongue: people answer you in it, politely, the way you'd answer a dog. Try Danish, badly, and they get annoyed, which means they've decided you might be staying.

Behind the fog the locals keep something beautiful that they never admit exists. You only get **glimpses** (lights on the water, a song, a candlelit back room), and every time, someone changes the subject to the weather. *Det var ikke noget.*

Your character has no creation screen. **Your past is whatever you manage to say correctly in Danish**, and it gets written into the Name Protocol piece by piece.

## How a session plays

| Book | Game |
| --- | --- |
| Chapter (*Kapitel*) | An act of the story |
| Session (*Lektion*) | One map: story → duels → events → boss |
| Lesson goals | Sentence patterns (the "poker hands") |
| Exercise types | Events between duels |

**Duels:** the NPC asks a question and shows what they'll do next (sarcasm, fog, switching to English, cross-examination). You build an answer from word cards. A correct sentence scores *chips × mult* according to its pattern (e.g. *Fordi-sætning*, *Før-inversion*). A ★★★ answer also blocks the NPC's attack. A mistake costs composure and shows the grammar rule plus a corrected version.

**Between duels:** eavesdropping (listening), job notices (reading), Leo's correction cellar (real class mistakes), the past-tense forge, Ib's shop and his questionable deals, BG3-style d20 checks where thinking in Danish first gives you advantage.

**Progression:** *Anseelse* (standing: Turist → Udlænding → Tilflytter → Nabo → Vandmarker) rises with good Danish and falls each time you ask for English. Sayings (*Ordsprog*) act as relics. Patterns level up. If you lose, you keep *Erfaring* (experience) for permanent upgrades.

## Adding the next session

Everything is in `js/content.js`:

1. **New words**: add chunks to `CHUNKS` with a grammatical role `t`. Reuse the existing roles where possible.
2. **New grammar**: add the pattern to `PATTERNS`, explanations to `ERRORS`, and parsing rules to `js/grammar.js` (`parse`). Lesson 2 will need roles for time expressions (*for … siden*, *om*, *i*), *da/når* clauses and modal plans.
3. **People and fights**: add `NPCS`, questions in `Q`, a duel in `DUELS` (rounds, distrust, patience, intents).
4. **Story**: add scene step lists to `SCENES` (narration `n`, thought `th`, dialogue `say` with `da`/`en`/`gist`, `choice`, `check`, `glimpse`, `quiz`, `fn`).
5. **Map**: append an entry to `SESSIONS` with its rows of nodes.

Test locally with `python3 -m http.server` and open `http://localhost:8000/?fast` to skip animations.

Book source: *Danish to Go 2* (chapter 1, lessons 1–2) plus class notes. All game sentences are original.

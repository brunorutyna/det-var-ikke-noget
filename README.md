# Det var ikke noget

*Contracts, lies and d20 rolls in a fog-bound city that only listens in Danish.* Phone-first; play from the GitHub Pages link. The card-battle prototype (v1) lives in `/v1`.

## How it plays

- **Vandmark**, a city map you walk around. Every trip takes time (Morgen → Eftermiddag → Aften → Nat), small encounters happen on the way, and you sleep at Pensionat Tågelys.
- **Contracts** (Witcher-style) are solved with dialogue and actions: speak, lie, sneak, steal, bribe, look closer. No moral rules.
- **Danish drives the dice.** To say something you build the sentence from word tiles: perfect first try → *advantage* on the d20, two or more mistakes → *disadvantage*. NPCs speak Danish (voice on by default); tap any word for its meaning, or press and hold inside a button. Asking “På engelsk?” costs standing.
- **Skills grow by use:** Sprog, Løgn, Snige, Handel, Indsigt. Choose answers and actions of a kind and that skill levels up (a little more on success).
- **Vocabulary has its own games:** a hidden-object search (find what Hjørdis lists), reading shop signs from their definitions, a shopping errand with prices said in Danish, a job-notice board, and an evening review of the day's words before sleep (words you know come back less often).
- **Fantasy, as fact:** the fog is brewed by Mosekonen on the moor; a nisse lives in the attic; ellepiger dance in the elf mound; lygtemænd lead you astray; Helhesten walks the alleys at night; the town shares a table with the havfolk on Thursdays.
- **Time passes on screen:** when a night goes by, you wait for evening or Thursday, dance until dawn, or days go by, a short sky scene plays over the rooftops (sun setting, moon crossing, windows lighting up). Walking somewhere that takes the day into evening shows a small sun/moon dial on the arrival card. Nodes and options use `pass: [kind, title, sub]` (`night`, `dusk`, `dawn`, `days`; can be a function of the game state).
- **Music & sound:** a small generative folk composer plays a theme per place (accordion at the harbour, music box in the attic, a jig on the market, an untuned elf fiddle on the mound, a choir singing the Thursday song on the pier), plus ambience and effects. ⚙ Indstillinger: separate volume and on/off for music, ambience, effects and the Danish voice, voice speed, and animations.
- **Balance:** skills level more slowly the higher they get (3/7/12/18/25 uses), all bonuses together are capped at +7, the roll screen shows your chance, and later sessions can raise difficulty (`dcMod`). A natural 1 always fails, a 20 always succeeds.

## Session 1 · Kapitel 1, Lektion 1 (“Hvorfor kom du hertil?”), ~1½ hours
Contracts: *Smørtyven* (the butter-thief nisse), *Lyset på vandet* (the harbour master and the Thursday lights), *Den forsvundne murer* (the bricklayer who danced with the elf women). Side jobs: Hjørdis' shopping list, Ib's job board, Leo's corrections.
Grammar: før-clause inversion, fordi / for at / på grund af, i / på, past tense. Vocabulary: things in the house, goods, businesses, jobs.

## Adding a session
- `js/data.js`: skills, people (portrait parameters), vocabulary sets, glossary.
- `js/k1l1.js`: one file per session (`SESSION` = map locations, quests, nodes, travel encounters, hunts, shopping, signs, jobs, corrections, letters, glimpses). Copy it for the next lesson.
- `js/art.js` (scenes, portraits, object icons), `js/audio.js` (soundscapes), `js/engine.js` (everything else).
- Test locally: `python3 -m http.server`, open `/?fast` to skip animations.

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

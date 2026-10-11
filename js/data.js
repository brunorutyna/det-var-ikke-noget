/* =========================================================================
   DET VAR IKKE NOGET — content (v2: contracts)
   Add a session = add PHRASES for it, NPCS, and a CONTRACTS entry.
   ========================================================================= */

/* ---------- Skills (BG3-style, levelled with skill points) ---------- */
const STATS = {
  SPROG:   { name: 'Sprog',   en: 'Speaking Danish well. Persuasion, charm, being taken seriously.' },
  LOEGN:   { name: 'Løgn',    en: 'Lying convincingly. In Danish, ideally.' },
  SNIGE:   { name: 'Snige',   en: 'Sneaking, stealing, being somewhere you should not be.' },
  HANDEL:  { name: 'Handel',  en: 'Trading, haggling, bribing. Numbers and nerve.' },
  INDSIGT: { name: 'Indsigt', en: 'Noticing. Reading faces, rooms and lies.' },
};

/* ---------- Phrases you prepare before a contract (book: Kapitel 1, Lektion 1) ----------
   words: the correct answer split into tiles. alt: other accepted answers. extra: distractor tiles. */
const PHRASES = {
  foer:    { en: 'Before I came here, I lived in a big city.', words: ['Før', 'jeg', 'kom', 'hertil,', 'boede', 'jeg', 'i', 'en', 'storby.'], extra: ['jeg', 'boede'], rule: 'A før-clause first → the verb jumps before the subject: “…, boede jeg”.' },
  job:     { en: 'I worked as a cook.', words: ['Jeg', 'arbejdede', 'som', 'kok.'], extra: ['på', 'en'], rule: '“som” + job, no article: som kok, som lærer.' },
  fordi:   { en: 'I moved here because I wanted to work.', words: ['Jeg', 'flyttede', 'hertil,', 'fordi', 'jeg', 'gerne', 'ville', 'arbejde.'], extra: ['for', 'at'], rule: 'Inside a fordi-clause: subject – adverb – verb. “fordi jeg gerne ville”.' },
  forat:   { en: 'I came here to work.', words: ['Jeg', 'kom', 'hertil', 'for', 'at', 'arbejde.'], extra: ['fordi', 'jeg'], rule: '“for at” + a verb in the infinitive.' },
  pga:     { en: 'I came here because of my job.', words: ['Jeg', 'kom', 'hertil', 'på', 'grund', 'af', 'mit', 'job.'], extra: ['fordi', 'min'], rule: '“på grund af” + a noun. mit job (et job), min kæreste (en kæreste).' },
  pris:    { en: 'How much does it cost?', words: ['Hvor', 'meget', 'koster', 'den?'], extra: ['mange', 'er'], rule: 'Hvor meget koster den/det? Then listen for the number.' },
  tagen:   { en: 'It was nothing. It was just the fog.', words: ['Det', 'var', 'ikke', 'noget.', 'Det', 'var', 'bare', 'tågen.'], extra: ['er', 'en'], rule: 'The most Danish sentence in Vandmark. Memorise it; you may need it.' },
};

/* ---------- People ---------- */
const NPCS = {
  hjordis:   { name: 'Hjørdis', role: 'runs Pensionat Tågelys', pt: { skin: '#e2b49a', shade: '#5a3a30', hair: 'bun', hairCol: '#8d8a86', mouth: 'flat', brow: 'tired', age: true, cloth: '#3d3346', cloth2: '#1e1a24', collar: '#d9d2c4', eye: '#5a6a72' } },
  bramsen:   { name: 'Thyge Bramsen', role: 'havnefoged · harbour master', pt: { skin: '#e6b08e', shade: '#5a3226', hair: 'cap', capCol: '#1a2430', hairCol: '#d8d4cc', beard: 'mustache', beardCol: '#e0dcd4', mouth: 'frown', brow: 'stern', age: true, cloth: '#1e2a38', cloth2: '#0e141c', collar: '#c9a24a', eye: '#4a5a66' } },
  margrethe: { name: 'Margrethe', role: 'fiskekone · fishwife', pt: { skin: '#e8b892', shade: '#5a3427', hair: 'scarf', scarf: '#233844', mouth: 'frown', brow: 'stern', age: true, cloth: '#4a2e26', cloth2: '#1a1416', apron: '#7a2e24', eye: '#3d4a52' } },
  kjeld:     { name: 'Formand Kjeld', role: 'the salt works', pt: { skin: '#d9a07c', shade: '#4a2a1e', hair: 'bald', hairCol: '#3a2a22', beard: 'full', beardCol: '#6a4a36', mouth: 'flat', brow: 'stern', cloth: '#5a5650', cloth2: '#26241f', eye: '#3a3226' } },
  ib:        { name: 'Ib', role: 'tolk · interpreter, for a price', pt: { skin: '#e4b896', shade: '#563428', hair: 'hat', hairCol: '#2a1e18', beard: 'pencil', beardCol: '#2a1e18', mouth: 'smirk', brow: 'raised', cloth: '#3a2a1e', cloth2: '#16100c', collar: '#c9b89a', eye: '#4a3a26' } },
};

/* ---------- Glossary: tap any Danish word ---------- */
const DICT = {
  'lavede': 'did / made', 'skriver': 'write(s)', 'ned': 'down', 'udlænding': 'foreigner', 'se': 'see', 'mørket': 'the dark', 'vandet': 'the water', 'alt': 'everything', 'med': 'with', 'andet': 'other / else',
  'sender': 'sends', 'tændes': 'are lit', 'vi': 'we', 'igen': 'again', 'havnefoged': 'harbour master', 'sække': 'sacks', 'god': 'good', 'vide': 'know', 'hørt': 'heard', 'udenfor': 'outside', 'gør': 'do / does',
  'sjældent': 'rare(ly)', 'ærlig': 'honest', 'stjæle': 'steal', 'spørg': 'ask', 'regnskab': 'accounts, ledger', 'ligesom': 'like, just as', 'tak': 'thanks', 'ha': 'ha', 'langsomt': 'slowly', 'sæt': 'sit (sæt dig)',
  'tusind': 'thousand', 'hm': 'hm', 'udlændinge': 'foreigners', 'ja': 'yes', 't': '(initial)', 'hvad?': 'what', 'kjelds': "Kjeld's", 'salthuset': 'the salt works', 'mig.': 'me', 'bådene.': 'the boats',
  'af': 'of / by', 'alle': 'all', 'altid': 'always', 'arbejde': 'work', 'arbejdede': 'worked', 'at': 'to', 'aften': 'evening', 'bare': 'just, only', 'betaler': 'pays', 'betaling': 'payment', 'boede': 'lived',
  'brev': 'letter', 'bådene': 'the boats', 'dag': 'day', 'de': 'they', 'del': 'part', 'dem': 'them', 'den': 'it (en-word)', 'der': 'there / who', 'det': 'it / that', 'dig': 'you (object)', 'din': 'your', 'du': 'you', 'dårligt': 'badly',
  'efter': 'after / for', 'egentlig': 'actually', 'en': 'a / one', 'er': 'is / are', 'et': 'a (et-word)', 'fem': 'five', 'find': 'find', 'fiskekonerne': 'the fishwives', 'flyttede': 'moved', 'for': 'for', 'fordi': 'because', 'forstod': 'understood',
  'fra': 'from', 'fyrre': 'forty', 'før': 'before', 'gerne': 'gladly / would like', 'grund': 'reason', 'går': 'goes / walk', 'halvdelen': 'half', 'han': 'he', 'har': 'has / have', 'havnefogeden': 'the harbour master', 'havnefogedens': "the harbour master's",
  'havnen': 'the harbour', 'hende': 'her', 'her': 'here', 'hertil': 'to here', 'hjælpe': 'help', 'hund': 'dog', 'hvad': 'what', 'hvem': 'who', 'hvor': 'where / how', 'hvordan': 'how', 'hvorfor': 'why', 'i': 'in', 'ikke': 'not', 'ind': 'in(to)',
  'ingen': 'nobody / no', 'ingenting': 'nothing', 'jeg': 'I', 'job': 'job', 'kom': 'came / come', 'koster': 'costs', 'lys': 'light(s) / candle(s)', 'lysene': 'the lights / candles', 'lige': 'just / exactly', 'meget': 'much / very', 'men': 'but', 'mere': 'more',
  'mig': 'me', 'mit': 'my (et-word)', 'måske': 'maybe', 'navn': 'name', 'nogen': 'someone / anyone', 'noget': 'something / anything', 'nu': 'now', 'nå': 'well… / oh', 'når': 'when', 'natten': 'the night', 'nej': 'no', 'og': 'and', 'om': 'about / in',
  'på': 'on / at', 'penge': 'money', 'rigtigt': 'correctly / right', 'salt': 'salt', 'sendte': 'sent', 'sig': 'say', 'siger': 'says / say', 'skilling': 'shilling(s)', 'skulle': 'should', 'som': 'as', 'start': 'start', 'stk': 'pieces', 'så': 'so / then',
  'tale': 'talk', 'tilladelse': 'permission, permit', 'til': 'to', 'tolv': 'twelve', 'torsdag': 'Thursday', 'torsken': 'the cod', 'tror': 'think / believe', 'tyve': 'twenty', 'tågen': 'the fog', 'tænder': 'lights (verb)', 'ud': 'out', 'udlændingen': 'the foreigner',
  'var': 'was', 'ved': 'knows / know', 'vejret': 'the weather', 'vil': 'want / will', 'ville': 'wanted / would', 'værelse': 'room', 'den.': 'it', 'mange': 'many', 'kontrakt': 'contract', 'ud.': 'out', 'dit': 'your (et-word)', 'hvis': 'if',
  'kan': 'can', 'godt': 'well / good', 'lide': 'like', 'hvorfor?': 'why', 'arbejde.': 'work', 'tre': 'three', 'ti': 'ten', 'snakke': 'chat', 'leder': 'am looking', 'toilettet': 'the toilet', 'undskyld': 'sorry / excuse me', 'laver': 'are doing',
  'selvfølgelig': 'of course', 'står': 'stands / is written', 'rapporter': 'reports', 'mine': 'my (plural)', 'alle': 'all', 'tror': 'believe', 'næsten': 'almost', 'siger': 'say', 'aldrig': 'never', 'nogensinde': 'ever', 'hvem?': 'who',
  'ham': 'him', 'kender': 'know (a person)', 'vagt': 'guard', 'år': 'year(s)', 'du?': 'you', 'nok': 'probably / enough', 'sammen': 'together', 'derhjemme': 'back home', 'hjem': 'home', 'velkommen': 'welcome', 'spiser': 'eat',
  'kok': 'cook', 'lærer': 'teacher', 'læge': 'doctor', 'storby': 'big city', 'kommer': 'comes / come', 'tilbage': 'back', 'morgen': 'morning', 'i morgen': 'tomorrow', 'fisk': 'fish', 'sælger': 'sell(s)', 'køber': 'buy(s)', 'hvorfor': 'why',
};

/* ---------- The contract ----------
   A node: bg, npc, steps (narration n / thought th / say {da,en} / letter), opts.
   Option kinds: say (build a Danish sentence, maybe roll) · lie (build, roll LØGN) · act (roll a skill)
                 · reply (choose a Danish reply: you must understand it) · eng (ask for English) · go (move on)
   ok/fail: node id or array of steps to show, then 'next'. fx: effects {sk, resp, xp, flag, glimpse, origin}. */
const CONTRACTS = {
  lys: {
    title: 'Lyset på vandet', en: 'The light on the water',
    book: 'Kapitel 1 · Lektion 1 — Hvorfor kom du hertil?',
    goal: 'Find out who lights the lamps on the water. Get paid. Optionally, keep your soul.',
    phrases: ['foer', 'job', 'fordi', 'forat', 'pga', 'pris', 'tagen'],
    start: 'office',
    nodes: {
      office: {
        bg: 'office', npc: 'bramsen', title: 'Havnefogedens kontor',
        steps: [
          { n: "The harbour master's office smells of ink, wet wool and the specific despair of unanswered forms." },
          { n: 'Thyge Bramsen has been havnefoged for thirty-one years. In that time he has never once looked at the sea. He has looked at a great many forms about the sea.' },
          { say: 'bramsen', da: 'Nå. Du er udlændingen. Hvad lavede du, før du kom hertil?', en: 'So. You are the foreigner. What did you do before you came here?' },
          { th: 'Whatever you say now becomes true. In Vandmark, a past is something you say properly or do not have.' },
        ],
        opts: [
          { kind: 'say', stat: 'SPROG', dc: 8, label: 'Tell him what you did.', phrase: 'job',
            build: { en: 'I worked as a … (cook / teacher / doctor)', answers: [['Jeg', 'arbejdede', 'som', 'kok.'], ['Jeg', 'arbejdede', 'som', 'lærer.'], ['Jeg', 'arbejdede', 'som', 'læge.']], best: [['Før', 'jeg', 'kom', 'hertil,', 'arbejdede', 'jeg', 'som', 'kok.'], ['Før', 'jeg', 'kom', 'hertil,', 'arbejdede', 'jeg', 'som', 'lærer.'], ['Før', 'jeg', 'kom', 'hertil,', 'arbejdede', 'jeg', 'som', 'læge.']],
              tiles: ['Før', 'jeg', 'kom', 'hertil,', 'jeg', 'arbejdede', 'som', 'kok.', 'lærer.', 'læge.', 'på'], origin: 'job' },
            ok: [{ say: 'bramsen', da: 'Hm. Det skriver jeg ned.', en: "Hm. I'll write that down." }, { n: 'He writes it down. It is now, officially, your past.' }],
            fail: [{ say: 'bramsen', da: 'Hvad? Nå. Jeg skriver bare “udlænding”.', en: 'What? Well. I\'ll just write "foreigner".' }, { n: 'Your past, as of today, is one word long.' }],
            next: 'office2' },
          { kind: 'lie', stat: 'LOEGN', dc: 12, label: 'Lie: say you were a guard. Guards get paid more.',
            build: { en: 'I was a guard for five years.', answers: [['Jeg', 'var', 'vagt', 'i', 'fem', 'år.']], tiles: ['Jeg', 'var', 'vagt', 'i', 'fem', 'år.', 'for', 'siden'] },
            ok: [{ say: 'bramsen', da: 'Vagt? Godt. Så kan du se i mørket. Ti skilling mere.', en: 'A guard? Good. Then you can see in the dark. Ten shillings more.' }, { fx: { flag: 'guard', origin: { job: 'vagt (a lie)' } } }, { n: 'You have never guarded anything in your life, except possibly a sandwich.' }],
            fail: [{ say: 'bramsen', da: 'Vagt? Du? Ha.', en: 'A guard? You? Ha.' }, { fx: { resp: -1 } }, { n: 'He does not write it down. That is worse than if he had.' }],
            next: 'office2' },
          { kind: 'eng', label: '“Sorry, could we do this in English?”',
            ok: [{ say: 'bramsen', en: 'Of course. English. Then you will be cheap. Thirty shillings, not forty.' }, { fx: { flag: 'cheap' } }],
            next: 'office2' },
        ],
      },
      office2: {
        bg: 'office', npc: 'bramsen', title: 'Havnefogedens kontor',
        steps: [
          { say: 'bramsen', da: 'Der er lys på vandet om natten. Ingen har tilladelse. Find ud af, hvem der tænder dem.', en: 'There are lights on the water at night. Nobody has a permit. Find out who lights them.' },
          { n: 'He is not worried about the lights, you realise. He is worried that they are unregistered.' },
          { say: 'bramsen', da: 'Fyrre skilling. Halvdelen nu. Start på havnen. Fiskekonerne ved alt. De siger bare ingenting.', en: 'Forty shillings. Half now. Start at the harbour. The fishwives know everything. They just say nothing.' },
          { fx: { sk: 20 } },
        ],
        opts: [{ kind: 'go', label: 'Go to the harbour.', next: 'harbour' }],
      },
      harbour: {
        bg: 'harbour', npc: 'margrethe', title: 'Havnen',
        steps: [
          { n: 'Margrethe guts cod on an upturned crate. She does not stop when you arrive. She has decided you are not worth stopping for.' },
          { say: 'margrethe', da: 'Hvorfor kom du egentlig hertil? Og sig nu ikke “på grund af vejret”.', en: 'Why did you actually come here? And don\'t say "because of the weather".' },
        ],
        hub: true,
        opts: [
          { kind: 'say', stat: 'SPROG', dc: 12, label: 'Answer her properly.', phrase: 'fordi', once: true,
            build: { en: 'I came here because I wanted to work.', answers: [['Jeg', 'kom', 'hertil,', 'fordi', 'jeg', 'gerne', 'ville', 'arbejde.'], ['Jeg', 'kom', 'hertil', 'for', 'at', 'arbejde.']], tiles: ['Jeg', 'kom', 'hertil,', 'fordi', 'jeg', 'gerne', 'ville', 'arbejde.', 'for', 'at'], origin: 'reason' },
            ok: [{ say: 'margrethe', da: 'Arbejde. Det siger de alle sammen. Men du siger det rigtigt.', en: 'Work. They all say that. But you say it correctly.' }, { fx: { resp: 1, flag: 'mOk' } },
                 { say: 'margrethe', da: 'Spørg Kjeld i Salthuset. Han ved noget om lys. Og meget om salt.', en: 'Ask Kjeld in the salt works. He knows something about lights. And a lot about salt.' }],
            fail: [{ say: 'margrethe', da: 'Hvad? Nå. Lige meget.', en: 'What? Well. Doesn\'t matter.' }, { n: 'She goes back to the cod. The cod, at least, is listening.' }] },
          { kind: 'act', stat: 'HANDEL', label: 'Buy a cod. People talk to customers.', once: true, special: 'fish' },
          { kind: 'act', stat: 'INDSIGT', dc: 14, label: 'Look past her, at the lights on the water.', once: true,
            ok: [{ n: 'Out in the fog, small boats with lights in them, rowing, not out to sea, but along the shore. Toward the salt works.' }, { fx: { flag: 'saw' } },
                 { say: 'margrethe', da: 'Det var ikke noget. Det er bare tågen.', en: "That was nothing. It's just the fog." }, { th: 'There it is again. The sentence everyone here says when something is very much something.' }, { glimpse: 'vand' }],
            fail: [{ n: 'You see fog. Then more fog. Margrethe watches you look at the fog with the patience of a woman who has watched many foreigners look at fog.' }] },
          { kind: 'eng', label: '“Sorry, in English?”', once: true,
            ok: [{ say: 'margrethe', en: 'Of course. English. The cod doesn\'t speak Danish either. You two should talk.' }, { n: 'She does tell you, in English, to ask Kjeld at the salt works. She makes it sound like a punishment.' }] },
          { kind: 'go', label: 'Go to the salt works.', next: 'salt', after: 1 },
        ],
      },
      salt: {
        bg: 'salt', npc: 'kjeld', title: 'Salthuset',
        steps: [
          { n: 'The salt works squat at the harbour edge like a toad that has given up. Formand Kjeld oversees it with the expression of a man personally betrayed by the colour grey.' },
          { say: 'kjeld', da: 'Havnefogedens hund. Hvorfor skulle jeg tale med dig?', en: "The harbour master's dog. Why should I talk to you?" },
        ],
        hub: true,
        opts: [
          { kind: 'say', stat: 'SPROG', dc: 13, label: 'Tell him you came to help.', phrase: 'forat', once: true,
            build: { en: 'I came here to help.', answers: [['Jeg', 'kom', 'hertil', 'for', 'at', 'hjælpe.']], tiles: ['Jeg', 'kom', 'hertil', 'for', 'at', 'hjælpe.', 'fordi', 'hjælper'] },
            ok: [{ say: 'kjeld', da: 'Hjælpe. Ha. Lys koster penge. Nogen køber mange lys. Mere siger jeg ikke.', en: 'Help. Ha. Candles cost money. Someone buys a lot of candles. I\'m not saying more.' }, { fx: { resp: 1, flag: 'candles' } }],
            fail: [{ say: 'kjeld', da: 'Hvad siger du? Nej. Ud.', en: 'What are you saying? No. Out.' }] },
          { kind: 'lie', stat: 'LOEGN', dc: 13, label: 'Lie: say Margrethe sent you.', once: true, bonus: g => g.flags.mOk ? 2 : 0, bonusWhy: 'Margrethe liked you',
            build: { en: 'Margrethe sent me.', answers: [['Margrethe', 'sendte', 'mig.']], tiles: ['Margrethe', 'sendte', 'mig.', 'jeg', 'sender'] },
            ok: [{ say: 'kjeld', da: 'Margrethe? Nå. Så er det noget andet. Torsdag. Når tågen kommer.', en: "Margrethe? Well. Then that's something else. Thursday. When the fog comes." }, { fx: { flag: 'thursday' } }],
            fail: [{ say: 'kjeld', da: 'Margrethe sender ingen. Ud.', en: 'Margrethe sends nobody. Out.' }, { fx: { resp: -1 } }] },
          { kind: 'act', stat: 'SNIGE', dc: 13, label: 'While he shovels, slip into his office and read his ledger.', once: true,
            ok: [{ n: 'Behind a door that does not lock (nobody here steals; it would require talking to people afterwards) lies a ledger.' }, { letter: 'ledger' }],
            fail: [{ n: 'A floorboard makes a noise like a small accusation. Kjeld turns.' }, { special: 'caught' }] },
          { kind: 'act', stat: 'HANDEL', label: 'Bribe him.', once: true, special: 'bribe' },
          { kind: 'go', label: 'Wait for the right night.', next: 'night', after: 1 },
        ],
      },
      night: {
        bg: 'pier_night', npc: null, title: 'Molen · torsdag',
        steps: [
          { fx: { glimpseMaybe: true } },
          { n: '{when} the fog comes in thick enough to lean on. And then the lights.' },
          { n: 'Boats. A dozen of them, each with candles along the gunwale, rowing out until they form a line on the black water. A long table. People you know: Margrethe, Kjeld, Hjørdis from the pensionat, even, unbelievably, Bramsen\'s own clerk.' },
          { n: 'Someone passes bread from boat to boat. Someone starts a song, low, and the whole line takes it up.' },
          { th: 'This is it. The thing they all say is nothing.' },
        ],
        opts: [
          { kind: 'act', stat: 'SNIGE', dc: 12, label: 'Stay in the shadows and listen.',
            ok: [{ say: 'kjeld', da: 'Når lysene tændes, så kommer vi hjem.', en: 'When the lights are lit, then we come home.' }, { n: 'Not a secret society. Not smuggling. Just people, at a long table on the water, being home. Nobody invited you. You understand, for a moment, exactly why.' }, { glimpse: 'bord' }],
            fail: [{ n: 'A crab trap, ancient and malicious, closes on your boot. Every face on the water turns. The candles go out, one after another, very fast.' }, { say: 'margrethe', da: 'Det var ikke noget.', en: 'That was nothing.' }],
            next: 'report' },
          { kind: 'say', stat: 'SPROG', dc: 14, label: 'Step out where they can see you, and promise to keep quiet.',
            build: { en: "I won't tell anyone.", answers: [['Jeg', 'siger', 'det', 'ikke', 'til', 'nogen.']], tiles: ['Jeg', 'siger', 'det', 'ikke', 'til', 'nogen.', 'ingen', 'sagde'] },
            ok: [{ say: 'margrethe', da: 'Nå. Det tror jeg på. Næsten.', en: 'Well. I believe that. Almost.' }, { n: 'Nobody invites you into a boat. But nobody blows out a candle either. Hjørdis, you could swear, almost nods.' }, { fx: { resp: 2 } }, { glimpse: 'bord' }],
            fail: [{ n: 'Your Danish comes out wrong, as Danish does at night. The candles go out. When the fog clears there is nothing on the water at all.' }],
            next: 'report' },
          { kind: 'go', label: 'Leave quietly. You have what you came for.', next: 'report' },
        ],
      },
      report: {
        bg: 'office', npc: 'bramsen', title: 'Havnefogedens kontor',
        steps: [
          { say: 'bramsen', da: 'Nå? Hvem tænder lysene?', en: 'Well? Who lights the lights?' },
          { th: 'Twenty shillings, if you give him names. The rest of the city, if you do not.' },
        ],
        opts: [
          { kind: 'say', stat: 'SPROG', dc: 8, label: 'Tell the truth. Names.', ending: 'truth',
            build: { en: 'It was Margrethe and Kjeld.', answers: [['Det', 'var', 'Margrethe', 'og', 'Kjeld.']], tiles: ['Det', 'var', 'Margrethe', 'og', 'Kjeld.', 'er', 'men'] },
            ok: [{ say: 'bramsen', da: 'Godt. Så skriver jeg det ned.', en: 'Good. Then I\'ll write it down.' }, { fx: { sk: 20, resp: -3 } }],
            fail: [{ say: 'bramsen', da: 'Hvem? Sig det igen. Langsomt.', en: 'Who? Say it again. Slowly.' }, { n: 'You say it again, slowly. It sounds worse slowly.' }, { fx: { sk: 20, resp: -3 } }],
            next: 'end_truth' },
          { kind: 'lie', stat: 'LOEGN', dc: 14, label: 'Lie, in their own words.', phrase: 'tagen', ending: 'fog',
            build: { en: 'It was nothing. It was just the fog.', answers: [['Det', 'var', 'ikke', 'noget.', 'Det', 'var', 'bare', 'tågen.']], tiles: ['Det', 'var', 'ikke', 'noget.', 'Det', 'var', 'bare', 'tågen.', 'er', 'nogen'] },
            ok: [{ say: 'bramsen', da: 'Tågen. Selvfølgelig. Det står i alle mine rapporter.', en: 'The fog. Of course. It says so in all my reports.' }, { n: 'He looks at you for a long moment. Then he pays you ten shillings, "for the effort", which is how a harbour master says he knows exactly what you did.' }, { fx: { sk: 10, resp: 3, flag: 'fogLie' } }],
            fail: [{ say: 'bramsen', da: 'Tågen tænder ikke lys.', en: "The fog doesn't light candles." }, { n: 'No money. But by evening, the fishwives somehow know what you tried to say. The cod is cheaper for you. Slightly.' }, { fx: { resp: 1 } }],
            next: 'end_fog' },
          { kind: 'act', stat: 'HANDEL', dc: 12, label: 'Say nothing here. Go and sell your silence to Kjeld instead.', ending: 'sold',
            ok: [{ n: 'Kjeld pays thirty shillings without a word, counting them out in Danish, slowly, so you understand every number. It is the most contempt anyone has ever shown you in a foreign language.' }, { fx: { sk: 30, resp: -2, flag: 'sold' } }],
            fail: [{ n: 'Kjeld listens, then laughs, then pays you nothing and tells everyone. You are now famous, in the wrong way.' }, { fx: { resp: -3 } }],
            next: 'end_sold' },
        ],
      },
    },
    endings: {
      end_truth: { title: 'Sandheden', text: 'You were paid. The lights on the water stop on Thursday nights. Margrethe sells you fish at exactly the listed price, which in Vandmark is a declaration of war. In the morning, Hjørdis serves your breakfast without looking up. There is no extra bun.' },
      end_fog: { title: 'Det var ikke noget', text: 'Bramsen files a report about fog. On Thursday the lights are back on the water. In the morning there is an extra bun by your plate. Nobody mentions it. You do not mention it either, which, you are beginning to understand, is exactly the point.' },
      end_sold: { title: 'Solgt', text: 'You are richer and lonelier. Ib finds you that evening, delighted. "You understand this city already," he says, which is not a compliment from Ib, and both of you know it.' },
    },
  },
};

const GLIMPSES = {
  vand: { name: 'Lys på vandet', en: 'Lights on the water', text: 'Small boats with candles, rowing along the shore in the fog. "Det var ikke noget," said Margrethe. Quickly.' },
  bord: { name: 'Det lange bord', en: 'The long table', text: 'Boats in a line on black water, bread passed from hand to hand, a song: "Når lysene tændes, så kommer vi hjem."' },
};

const LETTERS = {
  contract: { title: 'KONTRAKT', lines: ['Der er lys på vandet om natten.', 'Ingen har tilladelse.', 'Find ud af, hvem der tænder dem.', 'Betaling: 40 skilling.', '— T. Bramsen, havnefoged'],
    qs: [{ q: 'What is the problem, according to the harbour master?', opts: ['Nobody has a permit for the lights', 'The lights are dangerous to ships', 'The lights are too expensive'], a: 0 },
         { q: 'How much does it pay?', opts: ['40 shillings', '14 shillings', '4 shillings'], a: 0 }] },
  ledger: { title: 'Kjelds regnskab', lines: ['Salt — 300 sække.', 'Lys — 40 stk. Til bådene.', 'Torsdag, når tågen kommer.', 'Sig det ikke til havnefogeden.'],
    qs: [{ q: 'When does it happen?', opts: ['Thursday, when the fog comes', 'Tuesday, after work', 'Tonight, at the salt works'], a: 0, flag: 'thursday' },
         { q: 'Who must not be told?', opts: ['The harbour master', 'Margrethe', 'The salt workers'], a: 0 }] },
};

const LEVELS = [0, 12, 28, 48, 72, 100];

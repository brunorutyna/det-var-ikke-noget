/* =========================================================================
   SESSION · Kapitel 1 · Lektion 2 — "Hvor længe skal du være her?"
   Book: when you came (for … siden, da), how long you stay (i …, om …, når),
   whether you are happy here and what you miss; hvornår / da / når; central adverbs.
   Class notes: time prepositions, da/når inversion, describing people, empathy phrases.
   Vocabulary: time, weather, describing people.
   Fantasy: Vægteren and the binding Book of Stays, Bjergfolket (time in the troll hill),
   Maren (the Mare, who rides the homesick), Kirkegrimen, a strandvasker.
   ========================================================================= */
(() => {
  const f = G => G.flags;

  SESSIONS.k1l2 = {
    id: 'k1l2', order: 2, short: 'Lektion 2', prevSession: 'k1l1', nextSession: null, dcMod: 1,
    chapter: 'Kapitel 1 · Baggrund & bydel', title: 'Lektion 2 · Hvor længe skal du være her?', en: 'How long will you be here?',
    blurb: 'The night watchman keeps a book of when everyone came and how long they stay, and in Vandmark the book is binding. Time words: for … siden, i …, om …, da / når / hvornår. Telling the time, the weather, describing people.',
    start: 'q_open', endBg: 'lantern',
    // a ready-made character, for those who start here
    startState: { day: 7, phase: 3, sk: 18, resp: 5, insp: 1, statXP: { SPROG: 4, LOEGN: 3, SNIGE: 3, HANDEL: 3, INDSIGT: 4 }, origin: { place: 'Før jeg kom hertil, boede jeg i en storby.' }, loc: 'pension' },

    ending: G => { const F = G.flags; return F.endHome ? 'Anker gik hjem' : F.endChoose ? 'Anker blev, fordi han ville' : F.endStay ? 'Klokken er slået elleve' : '—'; },
    next: '<b>Lektion 3 · Bydel</b> (coming next): where you live, what there is nearby, what you like about it and what you are tired of.',

    /* ---------- the city ---------- */
    locations: {
      pension: { name: 'Pensionat Tågelys', en: 'your lodgings', x: 34, y: 56, bg: 'inn', night: true,
        entry: G => f(G).Aopen && !f(G).Atomas ? 'a_tomas' : 'pension_hub' },
      havn: { name: 'Havnen', en: 'the harbour', x: 22, y: 69, bg: 'harbour', entry: G => f(G).Aopen && !f(G).Atue ? 'a_tue' : 'havn_idle' },
      kontor: { name: 'Havnefogedens kontor', en: "harbour master's office", x: 44, y: 66, bg: 'office', entry: G => 'kontor_idle' },
      torv: { name: 'Torvet', en: 'the market square', x: 50, y: 44, bg: 'market', entry: G => 'torv_hub' },
      bageri: { name: 'Karens bageri', en: "Karen's bakery", x: 64, y: 40, bg: 'bakery', req: G => f(G).Bstart,
        entry: G => !f(G).Btruth ? 'b_truth' : !f(G).Bplan ? 'b_plan' : 'bageri_idle' },
      kaelder: { name: 'Sprogkælderen', en: "Casimir's cellar", x: 30, y: 38, bg: 'cellar', entry: G => 'l_casimir' },
      kirke: { name: 'Kirken', en: 'the church tower', x: 46, y: 25, bg: 'church', night: true,
        entry: G => G.phase < 2 ? 'kirke_day' : (f(G).Atomas && f(G).Atue && !f(G).Areturn ? 'a_return' : 'kirke_night') },
      hoej: { name: 'Troldehøjen', en: 'the troll hill', x: 84, y: 31, bg: 'trollhill', night: true, req: G => f(G).Bplan,
        entry: G => f(G).Bplan && !f(G).Bhill ? 'b_hoej' : 'hoej_idle' },
    },

    quests: {
      A: { title: 'Opholdsbogen', en: 'The Book of Stays', obj: [['Ask Tomás, and correct his line', 'Atomas'], ['Ask Skipper Tue at the harbour, and correct his line', 'Atue'], ['Bring the pages back to the watchman, at night', 'Areturn'], ['Decide about the oldest line in the book', 'Adone']] },
      B: { title: 'Han, der kom hjem', en: 'The man who came home', obj: [['Tell Anders what happened to him', 'Btruth'], ['Go into the troll hill with him, at dusk', 'Bhill'], ['Bring him back to Karen', 'Bdone']] },
      C: { title: 'Maren', en: 'The Mare', obj: [['Find out what sits on Tomás at night', 'Cknow'], ['Sit up with Tomás, at night', 'Cnight'], ['Decide what to do with her', 'Cdone']] },
      S1: { title: 'Vægterens runde', en: "The watchman's round", side: true, obj: [['Walk the round with Anker, at the church, at night', 'rundeDone']] },
      S2: { title: 'Casimirs tre kasser', en: "Casimir's three boxes", side: true, obj: [['Sort the time words', 'casboxDone'], ['Da, når or hvornår?', 'casgapDone']] },
      S3: { title: 'Ibs sladder', en: "Ib's gossip", side: true, obj: [['Guess who Ib is talking about, at Torvet', 'sladderDone']] },
    },

    glimpses: {
      vaegter: { name: 'Ankers sang', en: "Anker's song", text: 'An old man in a tower singing the hour to a sleeping town, as he has for two hundred and fifty years, and meaning every word.' },
      hoej: { name: 'Døren i højen', en: 'The door in the hill', text: 'A door of warm gold in a green hill, which was always there. You were only looking at the wrong time.' },
      dans: { name: 'Dansen i bageriet', en: 'The dance in the bakery', text: 'A candle that stops the clock, flour in the air like snow, and two people dancing between the ovens, forty years late and exactly on time.' },
      maren: { name: 'Regnen bærer hende', en: 'The rain carries her', text: 'A barefoot girl in an old nightdress walking out of a window onto the rain, which holds her, all the way north.' },
      lanterne: { name: 'Billedet på lagenet', en: 'The picture on the sheet', text: 'A painted table on a painted sea, shown to a whole room, and the whole room, very softly, laughing: det var ikke noget.' },
    },

    letters: {
      pages: { title: 'OPHOLDSBOGEN · TO SIDER', lines: ['Tomás Ferreira. Flyttede hertil om en måned. Arbejder på saltværket.', 'Tue, skipper. Har været her for to år siden. Sejler i morgen.'],
        qs: [{ q: 'According to the book, when did Tomás move here?', opts: ['In a month: he has not arrived yet', 'A month ago', 'For a month, and then he left'], a: 0 },
             { q: 'And what will Skipper Tue do, according to the book?', opts: ['Sail tomorrow', 'Sail yesterday', 'Never come back'], a: 0 }] },
      anker: { title: 'OPHOLDSBOGEN · SIDE 1', lines: ['Anker Jensen. Vægter.', 'Kom hertil i 1771.', 'Jeg går hjem, da min kontrakt udløber.'],
        qs: [{ q: 'When did Anker come to Vandmark?', opts: ['In 1771', 'A year ago', 'In 1871'], a: 0 },
             { q: '“Jeg går hjem, da min kontrakt udløber.” What is wrong?', opts: ['“Da” is one time in the past: his going home is already over, so it can never happen', '“Hjem” should be “hjemme”', 'Nothing is wrong with it'], a: 0, flag: 'ankerKnows' }] },
      anker2: { title: 'OPHOLDSBOGEN · SIDE 1', lines: ['Jeg bliver her, fordi jeg gerne vil.', 'Anker Jensen. Vægter. Vandmarker.'], qs: [] },
      karen: { title: 'Et brev, aldrig sendt', lines: ['Kære Anders.', 'Hvornår kommer du hjem?', 'Jeg venter. I en uge, i et år, i ti år, hvis det skal være.', 'Din Karen.'],
        qs: [{ q: 'How long did Karen write that she would wait?', opts: ['A week, a year, ten years if need be', 'One night', 'Forty years'], a: 0 }] },
    },

    hunts: {
      hall: { title: 'Bjergkongens skat', en: "The hill king's treasure", find: ['ring', 'brev', 'hat', 'ur', 'noegle'], decoys: ['krone', 'klokke', 'kop', 'lys', 'tallerken', 'sko', 'kiste', 'lygte'] },
    },

    entries: {
      tomas: { who: 'Tomás Ferreira', bad: 'Tomás flyttede hertil om en måned.', hint: 'The truth: he moved here a month ago, when he got the job at the salt works.', kind: 'ago', lab: '1 måned',
        good: 'Tomás flyttede hertil for en måned siden.', wrong: ['Tomás flyttede hertil i en måned.', 'Tomás flyttede hertil siden en måned.'],
        why: 'A point in the past, counted back from now: for … siden. “Om” would be the future: he has not come yet.' },
      tue: { who: 'Tue, skipper', bad: 'Tue har været her for to år siden.', hint: 'The truth: he came two years ago and has been here all the time since, up to now.', kind: 'len', lab: '2 år',
        good: 'Tue har været her i to år.', wrong: ['Tue har været her om to år.', 'Tue har været her siden to år.'],
        why: 'A length of time, up to now: har været her i to år. “For … siden” is a point in the past, not a length.' },
    },

    signs: ['bageri', 'slagter', 'groenthandler', 'apotek', 'blomsterhandler', 'cykelhandler', 'skobutik', 'boghandel', 'koebmand', 'lysestoeber', 'fiskehandler', 'kro'],

    clockRounds: [[10, 0, 'Klokken er ti.'], [10, 30, 'Klokken er halv elleve.'], [10, 15, 'Klokken er kvart over ti.'], [10, 45, 'Klokken er kvart i elleve.'],
      [11, 20, 'Klokken er tyve minutter over elleve.'], [11, 30, 'Klokken er halv tolv.'], [11, 50, 'Klokken er ti minutter i tolv.'], [12, 0, 'Klokken er tolv. Det er midnat.']],

    boxes: {
      casbox: { title: 'Casimirs tre kasser', q: 'Hvilken kasse?', boxes: ['Én gang, i fortiden', 'I fremtiden', 'Mange gange'], glyphs: ['once', 'future', 'often'],
        good: '“Three boxes,” says Casimir. “That is all time is. The rest is poetry.”', meh: '“Mistakes are information,” says Casimir. “You are very well informed today.”',
        items: [
          { t: 'da jeg var barn', a: 0, why: 'One time, in the past: da.' }, { t: 'når min kontrakt udløber', a: 1, why: 'It has not happened yet: når.' },
          { t: 'når det regner', a: 2, why: 'It happens again and again: når.' }, { t: 'da jeg flyttede hertil', a: 0, why: 'Once, in the past: da.' },
          { t: 'når jeg bliver gammel', a: 1, why: 'The future: når.' }, { t: 'om vinteren', a: 2, why: 'Every winter. “Om vinteren” is a time that comes back.' },
          { t: 'for to år siden', a: 0, why: 'A point in the past, counted back from now.' }, { t: 'om to år', a: 1, why: 'A point in the future, counted forward from now.' },
          { t: 'når jeg er træt', a: 2, why: 'Whenever it happens: når.' },
        ] },
      casgap: { title: 'Da, når eller hvornår?', q: 'Hvilket ord?', good: '“Bravo,” says Casimir. “You have just corrected half my students.”', meh: '“Good,” says Casimir. “Now you know which half of my students you are.”',
        items: [
          { t: '___ flyttede du hertil?', opts: ['Hvornår', 'Da', 'Når'], a: 0, why: 'A question: hvornår.' },
          { t: '___ jeg var barn, boede jeg på en ø.', opts: ['Da', 'Når', 'Hvornår'], a: 0, why: 'One time in the past: da. And after the clause, inversion: boede jeg.' },
          { t: '___ det regner, savner jeg solen.', opts: ['Når', 'Da', 'Hvornår'], a: 0, why: 'Every time it rains: når. And inversion: savner jeg.' },
          { t: 'Jeg rejser hjem, ___ min kontrakt udløber.', opts: ['når', 'da', 'hvornår'], a: 0, why: 'The future: når.' },
          { t: 'Jeg flyttede hertil, ___ jeg fik et job.', opts: ['da', 'når', 'hvornår'], a: 0, why: 'One time, in the past: da.' },
          { t: '___ skal du hjem?', opts: ['Hvornår', 'Når', 'Da'], a: 0, why: 'A question: hvornår.' },
          { t: 'Jeg har boet her ___ to år.', opts: ['i', 'for', 'om'], a: 0, why: 'A length of time: i to år. Casimir’s favourite correction.' },
          { t: 'Jeg kom hertil ___ et halvt år siden.', opts: ['for', 'i', 'om'], a: 0, why: 'Ago: for … siden.' },
          { t: 'Jeg skal hjem ___ en måneds tid.', opts: ['om', 'i', 'for'], a: 0, why: 'Forward from now: om. “Tid” makes it “about”.' },
          { t: 'Jeg flyttede hertil, fordi jeg ___ bo sammen med hende.', opts: ['gerne ville', 'ville gerne', 'vil gerne'], a: 0, why: 'In a fordi-clause the little adverb comes before the verb: jeg gerne ville.' },
        ] },
    },

    weather: {
      tue: { title: 'Vejrtavlen', end: 'Three days. Three different days. Tue reads the board three times, moving his lips.',
        rounds: [{ t: 'regnede det.', when: 0, w: 'regn', why: '“regnede” is past tense.' }, { t: 'er der tåge.', when: 1, w: 'taage', why: '“er” is now.' }, { t: 'bliver det solskin.', when: 2, w: 'solskin', why: '“bliver” is what is coming.' }] },
      board: { title: 'Vejrtavlen', end: 'The clerk chalks it up every morning. Nobody reads it. Now somebody does.',
        rounds: [{ t: 'sneede det.', when: 0, w: 'sne', why: '“sneede” is past tense.' }, { t: 'blæser det.', when: 1, w: 'blaest', why: '“blæser” is now.' }, { t: 'kommer der torden.', when: 2, w: 'torden', why: '“kommer” here is about what is coming.' }] },
    },

    guess: {
      ib: { title: 'Ibs sladder', pool: ['hjordis', 'casimir', 'tue', 'bramsen', 'karen', 'ib', 'kjeld', 'tomas', 'margrethe'],
        end: r => r >= 6 ? 'Ib pays you, and looks at you with new respect, and a little fear. People who listen are bad for his business.' : 'Ib pays you anyway. “Gossip is like Danish,” he says. “Nobody gets it all, and everybody pretends.”',
        rounds: [
          { npc: 'hjordis', lines: ['Hun kom hertil for tredive år siden.', 'Hun er streng, men sød.', 'Hun savner sin mand.'], words: ['streng', 'soed'] },
          { npc: 'casimir', lines: ['Han har boet her i elleve år.', 'Han er nysgerrig og lidt lunefuld.', 'Han savner sneen, når det regner.'], words: ['nysgerrig', 'lunefuld'] },
          { npc: 'tue', lines: ['Han har været her i to år.', 'Han er glad, men lidt forvirret.', 'Han savner havet.'], words: ['glad', 'forvirret'] },
          { npc: 'bramsen', lines: ['Han har været havnefoged i enogtredive år.', 'Han er streng og meget træt.', 'Han savner ingenting. Han har sine papirer.'], words: ['streng', 'traet'] },
          { npc: 'karen', lines: ['Hun har boet her hele livet.', 'Hun er sød, men lidt ked af det.', 'Hun ventede i ti år.'], words: ['soed', 'ked'] },
          { npc: 'kjeld', lines: ['Han arbejder på saltværket.', 'Han er sur og lidt doven.', 'Han siger tit: “Ud.”'], words: ['sur', 'doven'] },
          { npc: 'ib', lines: ['Hvornår han kom hertil? Det siger han ikke.', 'Han er venlig. Måske for venlig.', 'Han savner ingenting. Siger han.'], words: ['venlig'] },
        ] },
    },

    /* ---------- small encounters on the way ---------- */
    travel: [
      { id: 'sang', bg: 'street', npc: 'vaegter', night: true, req: G => !f(G).endHome, steps: [{ n: 'From somewhere above the roofs, a voice sings the hour. You cannot see him. The fog carries him around corners.' }, { say: 'vaegter', da: 'Hør, I folk i Vandmark by: klokken er slået ti.', en: 'Hear, you people of Vandmark town: the clock has struck ten.' }],
        opts: [{ kind: 'go', label: 'Walk on, a little less alone.', next: 'map' }] },
      { id: 'grim', bg: 'church', night: true, steps: [{ n: 'On the churchyard path stands a lamb, grey as ash, with eyes like two coals. It does not move. It is counting you.' }, { th: 'Kirkegrimen. The church grim, buried under the first stone to guard the church forever. It knows everyone who belongs here.' }],
        opts: [{ kind: 'reply', da: 'Godaften.', ok: [{ n: 'The lamb inclines its head, exactly once. You have been counted. You are, apparently, one of the town’s now.' }, { fx: { resp: 1 } }], next: 'map' },
               { kind: 'act', stat: 'SNIGE', dc: 11, label: 'Go round it, quietly.', ok: [{ n: 'You go round. It turns its head to follow you all the way, without hurry.' }], fail: [{ n: 'You step on a grave. The lamb looks at you as if you had stepped on it. You apologise to the grave, out loud, in Danish. It helps a little.' }], next: 'map' }] },
      { id: 'dreng2', bg: 'street', npc: 'dreng', steps: [{ say: 'dreng', da: 'Hej igen! Hvor længe skal du være her?', en: 'Hi again! How long will you be here?' }],
        opts: [{ kind: 'say', stat: 'SPROG', dc: 9, label: 'Tell him you don’t know yet.', build: { en: "I don't know yet.", answers: [['Det', 'ved', 'jeg', 'ikke', 'endnu.']], tiles: ['Det', 'ved', 'jeg', 'ikke', 'endnu.', 'jeg', 'ved'] },
          ok: [{ say: 'dreng', da: 'Det ved min far heller ikke. Han har været her i tredive år.', en: "My dad doesn't know either. He has been here for thirty years." }, { fx: { resp: 1 } }], fail: [{ say: 'dreng', da: 'Hvad? Du taler stadig sjovt.', en: 'What? You still talk funny.' }], next: 'map' }] },
      { id: 'regn', bg: 'street', npc: 'casimir', steps: [{ n: 'Rain. Under a shop awning, Casimir is waiting for it to stop, with the expression of a man who has been waiting for it to stop for eleven years.' }, { say: 'casimir', da: 'Når det regner, savner jeg sneen.', en: 'When it rains, I miss the snow.' }],
        opts: [{ kind: 'reply', da: 'Det kan jeg godt forstå.', ok: [{ say: 'casimir', da: 'Ja. Det kan du. Det er det værste.', en: 'Yes. You can. That is the worst part.' }, { fx: { resp: 1 } }], next: 'map' },
               { kind: 'reply', da: 'Det kender jeg godt.', ok: [{ say: 'casimir', en: '“Det kender jeg godt.” Perfect. Use it on everyone. Danes love to be known well.' }, { fx: { resp: 1 } }], next: 'map' }] },
      { id: 'ibtime', bg: 'street', npc: 'ib', req: G => G.phase > 0, steps: [{ n: 'Ib falls into step beside you, holding something small wrapped in a handkerchief.' }, { say: 'ib', en: 'An hour. A whole one, slightly used. I won it from a troll at cards. Eight shillings, and it is as if you never walked this far today.' }],
        opts: [{ kind: 'act', special: 'buyHour', label: 'Buy the hour (8 skilling).', next: 'map' }, { kind: 'go', label: 'Decline.', next: 'map' }] },
      { id: 'druknet', bg: 'harbour', npc: 'strandvasker', night: true, steps: [{ n: 'On the quay, dripping, stands a man who should not be standing. Seaweed in his collar. Water in his shoes that never runs out.' }, { say: 'strandvasker', da: 'Hvornår blev jeg væk? Jeg kan ikke huske det.', en: "When did I go missing? I can't remember." }],
        opts: [{ kind: 'act', stat: 'INDSIGT', dc: 10, label: 'Read the name sewn in his collar.', ok: [{ n: 'A name, and a date: a hundred years ago, almost to the day.' }, { fx: { flag: 'drownDate' } }], fail: [{ n: 'Wet thread. Nothing you can read.' }] },
               { kind: 'say', stat: 'SPROG', dc: 11, label: 'Tell him, gently.', bonus: G => f(G).drownDate ? 2 : 0, bonusWhy: 'You read the date',
                 build: { en: 'You disappeared a hundred years ago.', answers: [['Du', 'forsvandt', 'for', 'hundrede', 'år', 'siden.']], tiles: ['Du', 'forsvandt', 'for', 'hundrede', 'år', 'siden.', 'om', 'i'] },
                 ok: [{ n: 'He nods slowly, as if you had told him the time of a train. Then he turns and walks down the slipway into the sea, and does not stop.' }, { n: 'In the morning there are wet footprints on the step of the pensionat, pointing away. A thank you, of sorts.' }, { fx: { insp: 1 } }],
                 fail: [{ n: 'He does not understand. He stands there, dripping, still waiting for someone to tell him. Someone will. Not you, not tonight.' }], next: 'map' }] },
      { id: 'tueback', bg: 'harbour', npc: 'tue', req: G => f(G).Atue && !hasBoon('marested'), steps: [{ n: 'A small boat is coming in, very slowly, with one very happy man in it.' }, { say: 'tue', da: 'Fra havet. Til dig. Man ser bedre gennem et hul.', en: 'From the sea. For you. You see better through a hole.' }, { n: 'He presses a grey stone into your hand, with a hole worn clean through it by the sea.' }, { fx: { boon: 'marested' } }],
        opts: [{ kind: 'go', label: 'Thank him.', next: 'map' }] },
      { id: 'ibmare', bg: 'street', npc: 'ib', req: G => f(G).endIb, steps: [{ n: 'Ib looks terrible. Grey under the eyes, hat on crooked, a man who has not slept.' }, { say: 'ib', en: 'Somebody sat on my chest all night and asked me what I miss. I miss sleep. I miss not being asked. Was this you? It feels like you.' }],
        opts: [{ kind: 'go', label: 'Look innocent.', next: 'map' }] },
      { id: 'anders4', bg: 'street', npc: 'anders', req: G => f(G).Bdone, steps: [{ say: 'anders', da: 'Godmorgen! Klokken er fire. Jeg kommer for sent!', en: "Good morning! It's four o'clock. I'm late!" }, { n: 'He runs past you in an apron, toward the bakery, whistling a tune that has not been popular for forty years.' }],
        opts: [{ kind: 'go', label: 'Walk on.', next: 'map' }] },
    ],

    /* ---------- nodes ---------- */
    nodes: {
      /* ===== PROLOGUE: the knock at eleven ===== */
      q_open: { bg: 'inn', npc: 'hjordis', title: 'Pensionat Tågelys', card: ['Kapitel 1 · Baggrund & bydel', 'Lektion 2 — Hvor længe skal du være her?'], night: true,
        steps: [
          { n: 'Sunday night. The pensionat has settled into the particular silence of a house in which everyone is pretending to be asleep.' },
          { special: 'l2intro' },
          { n: 'At eleven exactly there is a knock. Not a polite knock. A knock that has been knocking on doors for a very long time.' },
          { say: 'hjordis', da: 'Det er vægteren. Han kommer altid om søndagen. Luk op.', en: "It's the watchman. He always comes on Sundays. Open the door." },
        ],
        opts: [{ kind: 'go', label: 'Open the door.', next: 'q_anker' }] },
      q_anker: { bg: 'street', npc: 'vaegter', title: 'Døren', home: true,
        steps: [
          { n: 'In the doorway: a tall old man in a long grey coat, a lantern in one hand and, in the other, a staff with an iron star on the end. The star has seen use.' },
          { say: 'vaegter', da: 'Hør, I folk i Vandmark by: klokken er slået elleve.', en: 'Hear, you people of Vandmark town: the clock has struck eleven.' },
          { n: 'He sings it, not loudly, the way you sing something you have sung every night for longer than anyone remembers.' },
          { say: 'vaegter', da: 'Anker. Vægter. Jeg skriver alle udlændinge i Opholdsbogen. Hvornår kom du hertil?', en: 'Anker. Watchman. I write all foreigners in the Book of Stays. When did you come here?' },
          { th: 'Ib warned you: here, what is said in Danish is binding. Something tells you that what is written in Danish is worse.' },
        ],
        opts: [
          { kind: 'say', stat: 'SPROG', dc: 9, label: 'Tell him when you came: a week ago.', build: { en: 'I came here a week ago.', answers: [['Jeg', 'kom', 'hertil', 'for', 'en', 'uge', 'siden.']], tiles: ['Jeg', 'kom', 'hertil', 'for', 'en', 'uge', 'siden.', 'om', 'i'], origin: 'came' },
            ok: [{ say: 'vaegter', da: 'For en uge siden. Godt. Så er du her.', en: 'A week ago. Good. Then you are here.' }, { n: 'He writes it down. The ink is very black. For a moment you feel more solid, as if someone had finally finished drawing you.' }],
            fail: [{ say: 'vaegter', da: 'Hvad? Det skriver jeg ikke. Forkerte ord bliver til forkerte folk.', en: "What? I won't write that. Wrong words turn into wrong people." }, { n: 'He writes it himself instead, saying each word aloud: “for … en … uge … siden.” It sounds like a spell. You suspect it is one.' }], next: 'q_anker2' },
          { kind: 'lie', stat: 'LOEGN', dc: 12, label: 'Lie: say you came yesterday. Less to explain.', build: { en: 'I came here yesterday.', answers: [['Jeg', 'kom', 'hertil', 'i', 'går.']], tiles: ['Jeg', 'kom', 'hertil', 'i', 'går.', 'om', 'siden'] },
            ok: [{ say: 'vaegter', da: 'I går? Nå. Så er du meget ny.', en: 'Yesterday? Well. Then you are very new.' }, { n: 'He writes it. For the rest of the night you feel strangely unpacked, as if your luggage has not arrived yet.' }, { fx: { flag: 'newer' } }],
            fail: [{ say: 'vaegter', da: 'I går? Nej. Bogen siger noget andet.', en: 'Yesterday? No. The book says something else.' }, { n: 'The book, it turns out, knew already. The book always knows. It just likes to hear you say it.' }, { fx: { resp: -1 } }], next: 'q_anker2' },
          { kind: 'eng', label: '“Sorry, what? I don’t understand.”', ok: [{ say: 'vaegter', en: 'English. Of course. I shall write: arrived, some time ago, in English.' }, { n: 'He writes something short and slightly contemptuous. You will never know what.' }], next: 'q_anker2' },
        ] },
      q_anker2: { bg: 'street', npc: 'vaegter', title: 'Døren', home: true,
        steps: [{ say: 'vaegter', da: 'Og hvor længe skal du være her?', en: 'And how long will you be here?' }, { th: 'He waits, pen raised. Whatever you say now goes in the book. In ink.' }],
        opts: [
          { kind: 'say', stat: 'SPROG', dc: 10, label: 'For a year. A sensible, ordinary answer.', build: { en: 'I will be here for a year.', answers: [['Jeg', 'skal', 'være', 'her', 'i', 'et', 'år.']], tiles: ['Jeg', 'skal', 'være', 'her', 'i', 'et', 'år.', 'om', 'for', 'siden'], origin: 'stay' },
            ok: [{ say: 'vaegter', da: 'Et år. Det skriver jeg.', en: "A year. I'll write that." }, { fx: { flag: 'stayYear' } }],
            fail: [{ say: 'vaegter', da: 'Om et år? For et år siden? Du mener vel: i et år.', en: 'In a year? A year ago? I suppose you mean: for a year.' }, { fx: { flag: 'stayYear' } }], next: 'q_anker3' },
          { kind: 'reply', da: 'Det ved jeg ikke endnu.', ok: [{ say: 'vaegter', da: 'Endnu. Det er et godt ord. Så skriver jeg: endnu.', en: "Yet. That's a good word. Then I'll write: yet." }, { th: 'You are, officially, unfinished. It is more comfortable than you expected.' }, { fx: { flag: 'stayUnknown', origin: { stay: 'Det ved jeg ikke endnu.' } } }], next: 'q_anker3' },
          { kind: 'say', stat: 'SPROG', dc: 13, label: 'For the rest of your life. Why not.', build: { en: 'I would like to stay here my whole life.', answers: [['Jeg', 'vil', 'gerne', 'blive', 'her', 'hele', 'livet.']], tiles: ['Jeg', 'vil', 'gerne', 'blive', 'her', 'hele', 'livet.', 'skal', 'i'], origin: 'stay' },
            ok: [{ say: 'vaegter', da: 'Hele livet.', en: 'Your whole life.' }, { n: 'He looks at you for a long time. Then he writes it, carefully, the way one carves a name into something.' }, { say: 'vaegter', da: 'Så ses vi tit.', en: 'Then we will see each other often.' }, { fx: { flag: 'stayLife', resp: 1 } }],
            fail: [{ say: 'vaegter', da: 'Hvad? Nå. Jeg skriver: måske.', en: "What? Well. I'll write: maybe." }, { fx: { flag: 'stayUnknown', origin: { stay: 'Måske.' } } }], next: 'q_anker3' },
          { kind: 'lie', stat: 'LOEGN', dc: 11, label: 'Lie: say you are going home in a week. Tourists get left alone.', build: { en: 'I am going home in a week.', answers: [['Jeg', 'rejser', 'hjem', 'om', 'en', 'uge.']], tiles: ['Jeg', 'rejser', 'hjem', 'om', 'en', 'uge.', 'i', 'for', 'siden'], origin: 'stay' },
            ok: [{ say: 'vaegter', da: 'Om en uge. Så er du turist.', en: 'In a week. Then you are a tourist.' }, { n: 'He writes it. In your coat pocket something crackles that was not there before: a ferry ticket, dated next Sunday, in your own handwriting.' }, { fx: { flag: 'stayWeek' } }, { th: 'Binding. Everything here is binding. You may want to do something about that ticket.' }],
            fail: [{ say: 'vaegter', da: 'Om en uge? Nej. Det tror jeg ikke på.', en: "In a week? No. I don't believe that." }, { fx: { resp: -1, flag: 'stayUnknown' } }], next: 'q_anker3' },
        ] },
      q_anker3: { bg: 'street', npc: 'vaegter', title: 'Døren', home: true,
        steps: [
          { say: 'vaegter', da: 'Der er fejl i bogen. Siden i sommer.', en: 'There are mistakes in the book. Since this summer.' },
          { say: 'vaegter', da: 'Folk skriver forkert. Og når bogen er forkert, bliver folk forkerte.', en: 'People write it wrong. And when the book is wrong, people become wrong.' },
          { n: 'He tears out two pages, very carefully, and hands them to you as if they were someone’s x-rays.' },
          { letter: 'pages' },
          { say: 'vaegter', da: 'Find dem. Spørg dem: hvornår, og hvor længe. På dansk. Så skriver du sandheden.', en: 'Find them. Ask them: when, and how long. In Danish. Then you write the truth.' },
          { say: 'vaegter', da: 'Og kom med siderne til mig. Om natten. Om dagen sover jeg.', en: 'And bring the pages to me. At night. In the daytime I sleep.' },
          { fx: { quest: ['A', 'S1', 'S2', 'S3'], flag: 'Aopen' } },
          { say: 'vaegter', da: 'Og hvis du vil gå med på min runde en nat, så kom til kirken.', en: 'And if you want to walk my round with me one night, come to the church.' },
          { n: 'He touches his hat, and walks off into the fog, and a minute later, from two streets away, you hear him sing the quarter.' },
        ],
        opts: [{ kind: 'go', label: 'Close the door. Go to bed.', next: 'sleep' }] },

      /* ===== A · Opholdsbogen ===== */
      a_tomas: { bg: 'inn', npc: 'tomas_f', title: 'Morgenmad', hub: true,
        steps: [
          { n: 'At breakfast Hjørdis puts out cups. She counts them twice, frowns, and puts one back.' },
          { n: 'There is a young man at the end of the table. You are almost sure there is. When you look straight at him he is perfectly clear. When you look at the jam, he is mostly window.' },
          { say: 'tomas', da: 'Hun ser mig ikke. Ingen ser mig. Jeg har boet her i en måned, og hun dækker ikke bord til mig.', en: "She doesn't see me. Nobody sees me. I have lived here for a month, and she doesn't lay a place for me." },
          { th: 'Tomás Ferreira. The first line on the page. According to the book, he arrives next month. Ask him. In Danish.' },
        ],
        opts: [
          { kind: 'reply', da: 'Hvornår flyttede du hertil?', once: true, ok: [{ say: 'tomas', da: 'For en måned siden. Da jeg fik et job på saltværket.', en: 'A month ago. When I got a job at the salt works.' }, { fx: { flag: 'tq1' } }] },
          { kind: 'reply', da: 'Hvor længe skal du være her?', once: true, ok: [{ say: 'tomas', da: 'I et år. Måske. Det kommer an på mit job. Og på vejret.', en: 'For a year. Maybe. It depends on my job. And on the weather.' }] },
          { kind: 'reply', da: 'Er du glad for at være her?', once: true, ok: [{ say: 'tomas', da: 'Ja. Men når det regner, savner jeg solen. Og min mor. Og maden.', en: 'Yes. But when it rains, I miss the sun. And my mother. And the food.' }, { th: '“Når det regner, savner jeg…” Casimir would underline that twice.' }] },
          { kind: 'reply', da: 'Hvad skrev du i bogen?', once: true, req: G => f(G).tq1, ok: [{ say: 'tomas', da: 'Jeg skrev: “Jeg flyttede hertil om en måned.” Er det forkert?', en: 'I wrote: "I moved here in a month." Is that wrong?' }, { th: 'Om. A point in the future. Tomás wrote himself into next month, and the town believed him.' }] },
          { kind: 'act', stat: 'INDSIGT', dc: 10, label: 'Look at him properly.', once: true, ok: [{ n: 'Not a ghost. A draft. Like a sentence someone has started and not finished. The edges of him are in pencil.' }], fail: [{ n: 'You look. The jam is very good.' }] },
          { kind: 'go', label: 'Correct his line in the book.', after: 2, req: G => f(G).tq1, next: 'a_tomas2' },
        ] },
      a_tomas2: { bg: 'inn', npc: 'tomas_f', title: 'Morgenmad',
        steps: [
          { special: 'fixEntry:tomas' },
          { npc: 'tomas' },
          { special: 'tomasFixed' },
          { n: 'Hjørdis comes in with the coffee pot, stops, and looks at Tomás as if he had just walked in through the wall.' },
          { say: 'hjordis', da: 'Nå. Der er du. Du har ikke fået morgenmad i en måned.', en: "Well. There you are. You haven't had breakfast for a month." },
          { n: 'She puts a cup in front of him. Then, after a pause, a second bun. This is how Vandmark says sorry.' },
          { say: 'tomas', da: 'Der er én ting mere. Om natten kommer der en kvinde. Hun sidder på mit bryst. Jeg kan ikke trække vejret.', en: "There's one more thing. At night a woman comes. She sits on my chest. I can't breathe." },
          { say: 'hjordis', da: 'Det er Maren. Hun rider dem, der savner noget.', en: "That's the Mare. She rides those who miss something." },
          { th: 'Hjørdis says it the way one says it is going to rain.' },
          { fx: { flag: 'Atomas', quest: 'C' } }, { fx: { flag: 'Cstart' } },
        ],
        opts: [{ kind: 'go', label: 'Finish your coffee.', next: 'pension_hub' }] },

      a_tue: { bg: 'harbour', npc: 'tue', title: 'Havnen', hub: true,
        steps: [
          { n: 'At the end of the quay a small boat is moored with three ropes, as if it might try to escape. In it sits a big old man in a captain’s cap, beaming at the fog.' },
          { say: 'tue', da: 'Godmorgen! I dag sejler vi! Når vejret bliver godt.', en: 'Good morning! Today we sail! When the weather gets good.' },
          { say: 'margrethe', da: 'Det har han sagt hver dag i to år.', en: 'He has said that every day for two years.' },
          { th: 'The second line on the page. “Has been here two years ago.” A man stuck inside a sentence that cannot end.' },
        ],
        opts: [
          { kind: 'reply', da: 'Hvornår kom du hertil?', once: true, ok: [{ say: 'tue', da: 'I går! Nej… i dag? Jeg kom i går, i dag.', en: 'Yesterday! No… today? I came yesterday, today.' }, { n: 'He frowns, as if something under his cap had slipped a gear.' }] },
          { kind: 'reply', da: 'Hvor længe har du været her?', once: true, ok: [{ say: 'tue', da: 'Hvor længe? For to år siden. Hver dag er for to år siden.', en: 'How long? Two years ago. Every day is two years ago.' }, { fx: { flag: 'tueq' } }] },
          { kind: 'reply', da: 'Hvordan er vejret i dag?', once: true, ok: [{ say: 'tue', da: 'I dag regner det. Som i går. Som i morgen.', en: 'Today it rains. Like yesterday. Like tomorrow.' }, { th: 'It is not raining. It has not rained since Thursday.' }] },
          { kind: 'act', stat: 'INDSIGT', dc: 11, label: 'Look at the boat.', once: true,
            ok: [{ n: 'The ropes are new. Someone replaces them every week, someone who does not want him to sail. Painted on the stern: TUE · VANDMARK. The paint is two years old to the day.' }], fail: [{ n: 'A boat. Wet.' }] },
          { kind: 'go', label: 'Show him that the days are different.', after: 2, next: 'a_tue2' },
        ] },
      a_tue2: { bg: 'harbour', npc: 'tue', title: 'Vejrtavlen',
        steps: [
          { n: 'You walk him to the weather board by the harbour office, where Bramsen’s clerk chalks up yesterday, today and tomorrow every morning. Tue has never once looked at it.' },
          { special: 'weather:tue' },
          { n: 'Something in his face moves, slowly, like ice on a river in March.' },
          { say: 'tue', da: 'I går regnede det ikke…', en: "Yesterday it didn't rain…" },
          { special: 'fixEntry:tue' },
          { special: 'tueFixed' },
          { say: 'tue', da: 'To år. Jeg har været her i to år. Så må jeg hellere sejle.', en: 'Two years. I have been here for two years. Then I had better sail.' },
          { n: 'He unties the three ropes. Margrethe watches him go with an expression you have not seen on her before. It might be envy.' },
          { say: 'margrethe', da: 'Det var ikke noget.', en: 'That was nothing.' },
          { fx: { flag: 'Atue', sk: 6 } }, { fx: { resp: 1 } },
        ],
        opts: [{ kind: 'go', label: 'Watch him go.', next: 'map' }] },

      a_return: { bg: 'church', npc: 'vaegter', title: 'Kirketårnet', hub: true, night: true,
        steps: [
          { n: 'Anker is up in the tower, between the clock and the bell, where the wind comes in from four directions and leaves by all of them.' },
          { say: 'vaegter', da: 'Nå. Har du rettet siderne?', en: 'Well. Have you corrected the pages?' },
          { special: 'returnBook' },
          { n: 'As he takes them, the book falls open at its first page. The oldest line. His.' },
          { letter: 'anker' },
          { say: 'vaegter', da: 'Ja. Det har jeg vidst længe.', en: 'Yes. I have known that for a long time.' },
          { say: 'vaegter', da: 'Min kontrakt udløb i 1781. Siden da har jeg gået her. Hver nat. Klokken elleve.', en: 'My contract ran out in 1781. Since then I have walked here. Every night. At eleven.' },
          { th: 'Two hundred and fifty years of eleven o’clock. Because of one small word.' },
          { say: 'vaegter', da: 'Du kan rette det. Hvis du vil.', en: 'You can correct it. If you want.' },
          { fx: { flag: 'Areturn' } },
        ],
        opts: [
          { kind: 'say', stat: 'SPROG', dc: 12, label: 'Correct it to “når”. Let him go home.', bonus: G => f(G).rundeDone ? 2 : 0, bonusWhy: 'You walked his round',
            build: { en: 'I go home when my contract runs out.', answers: [['Jeg', 'går', 'hjem,', 'når', 'min', 'kontrakt', 'udløber.']], tiles: ['Jeg', 'går', 'hjem,', 'når', 'min', 'kontrakt', 'udløber.', 'da', 'hvornår'] },
            ok: [{ n: 'You write it. The ink takes. Far below, the clock strikes, although it is not the hour.' }, { say: 'vaegter', da: 'Når. Når min kontrakt udløber. Den udløb for to hundrede og halvtreds år siden.', en: 'When. When my contract runs out. It ran out two hundred and fifty years ago.' }, { n: 'He laughs, once, like a door that has not been opened in a long time.' }],
            fail: [{ n: 'Your hand shakes. You write “hvornår”, and cross it out, and the crossing-out spreads like a stain.' }, { say: 'vaegter', da: 'Lad være. Måske er det ikke tid endnu.', en: "Leave it. Maybe it is not time yet." }], next: 'a_home', failNext: 'a_stay' },
          { kind: 'say', stat: 'SPROG', dc: 12, label: 'Ask him what he misses.', once: true, build: { en: 'What do you miss?', answers: [['Hvad', 'savner', 'du?']], tiles: ['Hvad', 'savner', 'du?', 'savnede', 'hvornår', 'dig'] },
            ok: [{ say: 'vaegter', da: 'Hvad jeg savner? Min kone. Hun døde i 1790. Og mit eget sprog. Jeg kom fra Lübeck. Jeg har glemt det. Alt sammen.', en: 'What I miss? My wife. She died in 1790. And my own language. I came from Lübeck. I have forgotten it. All of it.' }, { th: 'He has been a foreigner here longer than anyone has been anything here.' }, { fx: { flag: 'ankerMiss' } }],
            fail: [{ say: 'vaegter', da: 'Hvad? Nå. Det er sent.', en: "What? Well. It's late." }] },
          { kind: 'reply', da: 'Vil du gerne blive her?', req: G => f(G).ankerMiss, ok: [{ say: 'vaegter', da: 'Om jeg vil? Ingen har spurgt mig før.', en: 'Whether I want to? Nobody has asked me before.' }, { n: 'He looks out over the roofs. Somewhere down there Hjørdis is putting out the lamp; somewhere Tomás is sleeping, or trying to.' }, { say: 'vaegter', da: 'Ja. Jeg tror, jeg gerne vil blive her. Men jeg vil vælge det selv.', en: 'Yes. I think I would like to stay here. But I want to choose it myself.' }], next: 'a_choose' },
          { kind: 'say', stat: 'SPROG', dc: 10, label: 'While the book is open: change your own line. No ticket home.', once: true, req: G => f(G).stayWeek, build: { en: 'I will be here for a year.', answers: [['Jeg', 'skal', 'være', 'her', 'i', 'et', 'år.']], tiles: ['Jeg', 'skal', 'være', 'her', 'i', 'et', 'år.', 'om', 'for'], origin: 'stay' },
            ok: [{ n: 'Anker crosses out your old line and lets you write the new one. In your pocket the ferry ticket goes soft, then damp, then is only a smell of salt.' }, { fx: { flag: 'stayYear' } }], fail: [{ say: 'vaegter', da: 'Nej. Prøv igen en anden dag.', en: 'No. Try again another day.' }] },
          { kind: 'go', label: 'Leave the line as it is. Say nothing.', next: 'a_stay' },
        ] },
      a_home: { bg: 'church', npc: 'vaegter', title: 'Kirketårnet',
        steps: [
          { n: 'He takes off his hat, which you have never seen him do, and holds out his lantern to you.' },
          { say: 'vaegter', da: 'Tag den. Nogen skal se i mørket.', en: 'Take it. Someone has to see in the dark.' },
          { fx: { boon: 'vaegterlygte' } },
          { n: 'Then he walks down the tower stairs, out through the churchyard, past the grey lamb that watches him go, and out of town along the old road south. He is singing. Not the hours. Something in a language nobody here has heard for two hundred years.' },
          { glimpse: 'vaegter' },
          { n: 'That night, for the first time in two hundred and fifty years, nobody sings eleven o’clock. The town sleeps badly. In the morning several people are late for things they have never been late for.' },
          { fx: { flag: 'endHome', resp: 2 } }, { fx: { flag: 'Adone' } },
        ],
        opts: [{ kind: 'go', label: 'Walk home with the lantern.', next: 'sleep' }] },
      a_choose: { bg: 'church', npc: 'vaegter', title: 'Kirketårnet',
        steps: [
          { n: 'He takes the pen from you and crosses out his own line, and writes underneath it, in a hand that shakes only a little:' },
          { letter: 'anker2' },
          { say: 'vaegter', da: 'Sådan. Nu er det mit eget valg.', en: "There. Now it's my own choice." },
          { n: 'At eleven he sings the hour, the same as always. It sounds different. You could not say how. Down in the town, a few windows open, which in Vandmark is applause.' },
          { glimpse: 'vaegter' },
          { say: 'vaegter', da: 'Tag min gamle lygte. Jeg har en ny.', en: 'Take my old lantern. I have a new one.' },
          { fx: { boon: 'vaegterlygte' } }, { fx: { flag: 'endChoose', resp: 3 } }, { fx: { flag: 'Adone' } },
        ],
        opts: [{ kind: 'go', label: 'Walk home.', next: 'sleep' }] },
      a_stay: { bg: 'church', npc: 'vaegter', title: 'Kirketårnet',
        steps: [
          { say: 'vaegter', da: 'Det var ikke noget.', en: 'That was nothing.' },
          { n: 'He closes the book. Down below, the clock strikes eleven, as it always has and, apparently, always will.' },
          { th: 'Maybe some mistakes are load-bearing. Maybe, in Vandmark, most of them are.' },
          { fx: { flag: 'endStay', resp: 1 } }, { fx: { flag: 'Adone' } },
        ],
        opts: [{ kind: 'go', label: 'Walk home.', next: 'sleep' }] },

      kirke_day: { bg: 'church', npc: 'degn', title: 'Kirken', idle: true,
        steps: [{ say: 'degn', da: 'Vægteren sover. Kom tilbage, når det bliver mørkt.', en: 'The watchman is asleep. Come back when it gets dark.' }, { th: 'Når. Something that has not happened yet. Casimir would be pleased.' }],
        opts: [{ kind: 'go', label: 'Wait here until it gets dark.', next: 'kirke_dusk' }, { kind: 'go', label: 'Leave.', next: 'map' }] },
      kirke_dusk: { bg: 'church', npc: null, title: 'Kirken', night: true, pass: ['dusk', 'Kirken', 'Du venter. Det bliver mørkt.'],
        steps: [{ n: 'The light goes. One by one, the windows of the town light up, and then, above you, a lantern in the tower.' }],
        opts: [{ kind: 'go', label: 'Climb the tower.', next: G => f(G).Atomas && f(G).Atue && !f(G).Areturn ? 'a_return' : 'kirke_night' }] },
      kirke_night: { bg: 'church', npc: 'vaegter', title: 'Kirketårnet', hub: true,
        steps: [{ special: 'kirkeLine' }],
        opts: [
          { kind: 'go', label: 'Walk the round with him.', special: 'runde', req: G => !f(G).rundeDone && !f(G).endHome },
          { kind: 'reply', da: 'Hvor længe har du været vægter?', once: true, req: G => !f(G).endHome, ok: [{ say: 'vaegter', da: 'I meget lang tid. For længe, siger min ryg.', en: 'For a very long time. Too long, says my back.' }] },
          { kind: 'reply', da: 'Hvornår sover du?', once: true, req: G => !f(G).endHome, ok: [{ say: 'vaegter', da: 'Når solen står op. Som en ugle. Eller en vampyr. Men jeg er bare dansk.', en: "When the sun comes up. Like an owl. Or a vampire. But I'm just Danish." }] },
          { kind: 'go', label: 'Leave.', next: 'map' },
        ] },

      /* ===== B · Han, der kom hjem ===== */
      b_bageri: { bg: 'bakery', npc: 'anders', title: 'Karens bageri', hub: true,
        steps: [
          { special: 'findShop:bageri' },
          { n: 'Inside the bakery a young man in a coat forty years out of fashion is leaning over the counter, beaming.' },
          { say: 'anders', da: 'Godmorgen! Jeg skal hente Karen. Vi skal giftes i dag.', en: 'Good morning! I am here to fetch Karen. We are getting married today.' },
          { n: 'Behind the counter an old woman with flour to the elbows has dropped a whole tray of buns, and does not seem to have noticed.' },
          { npc: 'karen' },
          { say: 'karen', da: 'Anders?', en: 'Anders?' },
          { npc: 'anders' },
          { say: 'anders', da: 'Undskyld, kender vi hinanden? Er du Karens mor?', en: "Sorry, do we know each other? Are you Karen's mother?" },
          { th: 'Oh no.' },
          { fx: { quest: 'B', flag: 'Bstart' } },
        ],
        opts: [
          { kind: 'reply', da: 'Hvornår gik du ind i højen?', once: true, ok: [{ say: 'anders', da: 'I går aftes! Der var fest i Troldehøjen. Musik, guld, mad. Jeg dansede hele natten.', en: 'Last night! There was a party in the Troll Hill. Music, gold, food. I danced all night.' }] },
          { kind: 'reply', da: 'Hvor længe var du der?', once: true, ok: [{ say: 'anders', da: 'En nat. Kun en nat. Hvorfor?', en: 'One night. Only one night. Why?' }] },
          { kind: 'reply', da: 'Hvor gammel er du?', once: true, ok: [{ say: 'anders', da: 'Fireogtyve. Og Karen er tyve. Hvor er hun?', en: 'Twenty-four. And Karen is twenty. Where is she?' }] },
          { kind: 'act', stat: 'INDSIGT', dc: 9, label: 'Look at the calendar on the wall.', once: true,
            ok: [{ n: 'A baker’s calendar. Under this year’s date, in pencil, someone has written a small number: 40. Every year the number has been crossed out and written again, one higher, by the same hand, a little smaller each time.' }, { fx: { flag: 'bcal' } }], fail: [{ n: 'A calendar. With buns on it.' }] },
          { kind: 'go', label: 'Take Karen aside.', after: 2, next: 'b_karen' },
        ] },
      b_karen: { bg: 'bakery', npc: 'karen', title: 'Bag i bageriet', hub: true,
        steps: [
          { n: 'In the back, between the ovens, Karen sits down on a flour sack as if her legs had resigned without notice.' },
          { say: 'karen', da: 'Han gik ind i højen for fyrre år siden. Da han forsvandt, var jeg tyve.', en: 'He went into the hill forty years ago. When he disappeared, I was twenty.' },
          { say: 'karen', da: 'Jeg ventede i ti år. Så giftede jeg mig med bageren. Han døde for fem år siden.', en: 'I waited for ten years. Then I married the baker. He died five years ago.' },
          { say: 'karen', da: 'Og nu står han der. Fireogtyve år. Og han kender mig ikke.', en: "And now he stands there. Twenty-four years old. And he doesn't know me." },
          { th: '“Da han forsvandt, var jeg tyve.” Da: one time, in the past. It sounds so small when she says it.' },
        ],
        opts: [
          { kind: 'reply', da: 'Hvad vil du gerne?', once: true, ok: [{ say: 'karen', da: 'Hvad jeg vil? Jeg vil gerne have mine fyrre år tilbage. Men det kan man ikke.', en: "What I want? I would like my forty years back. But you can't." }, { say: 'karen', da: 'Sig det til ham. Jeg kan ikke.', en: "Tell him. I can't." }] },
          { kind: 'reply', da: 'Det kan jeg godt forstå.', once: true, ok: [{ say: 'karen', da: 'Kan du? Nej. Men tak.', en: 'Can you? No. But thank you.' }, { fx: { resp: 1 } }] },
          { kind: 'go', label: 'Go back out and tell Anders the truth.', after: 1, next: 'b_truth' },
        ] },
      b_truth: { bg: 'bakery', npc: 'anders', title: 'Karens bageri',
        steps: [{ say: 'anders', da: 'Nå? Hvor er Karen?', en: 'Well? Where is Karen?' }, { th: 'Tell him. Use the words. All the time words you have.' }],
        opts: [
          { kind: 'say', stat: 'SPROG', dc: 12, label: 'Tell him the truth.', bonus: G => f(G).bcal ? 2 : 0, bonusWhy: 'The calendar',
            build: { en: 'You went into the hill forty years ago.', answers: [['Du', 'gik', 'ind', 'i', 'højen', 'for', 'fyrre', 'år', 'siden.']], tiles: ['Du', 'gik', 'ind', 'i', 'højen', 'for', 'fyrre', 'år', 'siden.', 'om', 'går'] },
            ok: [{ n: 'He laughs. Then he looks at the old woman in the doorway of the back room. Then at his hands. Then he stops laughing.' }, { say: 'anders', da: 'Fyrre år.', en: 'Forty years.' }, { say: 'anders', da: 'Karen?', en: 'Karen?' }, { n: 'She nods. Neither of them says anything for a long time. The ovens tick.' }],
            fail: [{ say: 'anders', da: 'Om fyrre år? Hvad snakker du om?', en: 'In forty years? What are you talking about?' }, { n: 'Then Karen comes out of the back room and says his name again, the way only one person ever said it, and he understands anyway. Some things do not need the right preposition.' }], next: 'b_plan' },
          { kind: 'lie', stat: 'LOEGN', dc: 11, label: 'Lie: Karen is visiting her aunt. Buy some time.', build: { en: 'Karen is visiting her aunt.', answers: [['Karen', 'besøger', 'sin', 'tante.']], tiles: ['Karen', 'besøger', 'sin', 'tante.', 'hendes', 'besøgte'] },
            ok: [{ say: 'anders', da: 'Hos sin tante? Nå. Så venter jeg.', en: 'At her aunt’s? Well. Then I’ll wait.' }, { n: 'He sits down to wait. He waits until noon. Then he looks properly at the calendar on the wall, and at the old woman who keeps not looking at him, and he understands. It would have been kinder to tell him. It usually is.' }],
            fail: [{ npc: 'karen' }, { say: 'karen', da: 'Nej. Jeg er Karen, Anders.', en: "No. I am Karen, Anders." }, { n: 'She says it simply. It lands like a dropped tray.' }], next: 'b_plan' },
        ] },
      b_plan: { bg: 'bakery', npc: 'anders', title: 'Karens bageri',
        steps: [
          { fx: { flag: 'Btruth' } },
          { say: 'anders', da: 'Bjergkongen tog min tid. Så må han give den tilbage.', en: 'The hill king took my time. Then he must give it back.' },
          { say: 'karen', da: 'Man får ikke noget tilbage fra højen.', en: "You don't get anything back from the hill." },
          { say: 'anders', da: 'Så går jeg alene.', en: 'Then I go alone.' },
          { th: 'Alone he will dance another forty years. Somebody should go with him: somebody who knows how time works here. It might be worth asking Casimir first.' },
          { fx: { flag: 'Bplan' } },
        ],
        opts: [{ kind: 'go', label: 'Promise to go with him to the hill, at dusk.', next: 'map' }] },

      b_hoej: { bg: 'trollhill', npc: 'anders', title: 'Troldehøjen', dusk: true, card: ['Troldehøjen', 'tusmørke'], pass: G => G.phase < 2 ? ['dusk', 'Troldehøjen', 'Ved tusmørke åbner højen sig'] : null, hub: true,
        steps: [
          { n: 'The hill stands at the edge of the moor, round and green and entirely ordinary until the sun goes. Then there is a door in it. There always was. You were just not looking at the right time.' },
          { n: 'Music comes out of it, and warm light, and a smell of roast meat that makes your knees reconsider your plans.' },
          { say: 'anders', da: 'Kom. De kender mig.', en: 'Come on. They know me.' },
          { special: 'hillRule' },
        ],
        opts: [
          { kind: 'act', stat: 'INDSIGT', dc: 11, label: 'Look at the door before you go in.', once: true, ok: [{ n: 'Gold light, and inside it, for a heartbeat, something like a great hall where every hour that was ever lost hangs from the ceiling like a lamp.' }, { glimpse: 'hoej' }], fail: [{ n: 'A door. Warm. Very inviting. You distrust it on principle.' }] },
          { kind: 'go', label: 'Step inside.', next: 'b_hall' },
        ] },
      b_hall: { bg: 'trollhall', npc: 'bjergkongen', title: 'I højen',
        steps: [
          { n: 'Inside, the hill is much bigger than the hill. Roots hang from the ceiling like chandeliers. A long table groans under gold plates, and the trolls around it are large and lumpy and in tremendous spirits.' },
          { n: 'At the head of the table sits a king with a face like a cliff and a crown he has clearly stolen from someone shorter.' },
          { say: 'bjergkongen', da: 'Gæster! Velkommen! Sæt jer. Spis. Drik.', en: 'Guests! Welcome! Sit down. Eat. Drink.' },
          { say: 'bjergkongen', da: 'Og sig mig: hvor længe skal I være her?', en: 'And tell me: how long will you be here?' },
          { th: 'There it is. The question.' },
        ],
        opts: [
          { kind: 'say', stat: 'SPROG', dc: 11, label: 'Give him a point in time: you are going home in an hour.', bonus: G => f(G).casTroll ? 2 : 0, bonusWhy: 'Casimir’s warning',
            build: { en: 'We are going home in an hour.', answers: [['Vi', 'skal', 'hjem', 'om', 'en', 'time.'], ['Vi', 'går', 'hjem', 'om', 'en', 'time.']], tiles: ['Vi', 'skal', 'hjem', 'om', 'en', 'time.', 'går', 'i', 'for', 'siden'] },
            ok: [{ say: 'bjergkongen', da: 'Om en time?', en: 'In an hour?' }, { n: 'The music falters. Every troll at the table turns to look at the king. He scowls, and then, very slowly, turns over a great hourglass beside his plate.' }, { say: 'bjergkongen', da: 'Om en time. Så skal det være. Ord er ord.', en: 'In an hour. So be it. Words are words.' }, { fx: { flag: 'Bsafe' } }],
            fail: [{ say: 'bjergkongen', da: 'I en time? Ha! Så bliver I en time. Højens time.', en: "For an hour? Ha! Then you stay an hour. The hill's hour." }, { fx: { flag: 'Btrapped' } }], next: 'b_hall2' },
          { kind: 'reply', da: 'Det ved jeg ikke endnu.', ok: [{ say: 'bjergkongen', da: 'Endnu! Så bliver I, til I ved det.', en: 'Yet! Then you stay until you know.' }, { fx: { flag: 'Btrapped' } }], next: 'b_hall2' },
          { kind: 'say', stat: 'SPROG', dc: 9, label: 'Answer like a polite guest: a week, perhaps.', build: { en: 'We will be here for a week.', answers: [['Vi', 'skal', 'være', 'her', 'i', 'en', 'uge.']], tiles: ['Vi', 'skal', 'være', 'her', 'i', 'en', 'uge.', 'om', 'siden'] },
            ok: [{ say: 'bjergkongen', da: 'I en uge! Dejligt! En uge i højen.', en: 'For a week! Lovely! A week in the hill.' }, { th: 'Somewhere far away, Casimir puts his head in his hands.' }, { fx: { flag: 'Btrapped' } }],
            fail: [{ say: 'bjergkongen', da: 'Hvad? Nå. Så bliver I bare.', en: 'What? Well. Then you just stay.' }, { fx: { flag: 'Btrapped' } }], next: 'b_hall2' },
          { kind: 'eng', label: '“Sorry, could we do this in English?”', ok: [{ say: 'bjergkongen', en: 'English! We love English. Nothing said in English is binding. You may stay as long as we like.' }, { fx: { flag: 'Btrapped' } }], next: 'b_hall2' },
        ] },
      b_hall2: { bg: 'trollhall', npc: 'bjergkongen', title: 'I højen', hub: true,
        steps: [
          { special: 'hallLine' },
          { say: 'bjergkongen', da: 'Nå. Hvad vil I?', en: 'Well. What do you want?' },
          { say: 'anders', da: 'Min tid! Fyrre år. Giv mig dem tilbage.', en: 'My time! Forty years. Give them back to me.' },
          { say: 'bjergkongen', da: 'Tilbage? Vi har spist dem. De smagte godt.', en: 'Back? We have eaten them. They tasted good.' },
        ],
        opts: [
          { kind: 'reply', da: 'Hvad laver I med tiden?', once: true, ok: [{ say: 'bjergkongen', da: 'Vi spiser den. Menneskers tid er det bedste, der findes. Søndage smager af kage. Mandage smager af ingenting.', en: 'We eat it. Human time is the best thing there is. Sundays taste of cake. Mondays taste of nothing.' }] },
          { kind: 'act', stat: 'INDSIGT', label: 'Search the treasure piles for anything of Anders’s.', once: true, special: 'hallHunt' },
          { kind: 'act', stat: 'HANDEL', dc: 13, label: 'Bargain. Everything has a price, even eaten time.', once: true, req: G => !f(G).Bcandle,
            ok: [{ say: 'bjergkongen', da: 'Tid kan jeg ikke give. Men et lys kan jeg give. Når det brænder, står tiden stille. Én nat.', en: 'Time I cannot give. But a candle I can give. When it burns, time stands still. One night.' }, { n: 'He puts it in your hand: a stub of yellow wax, warm as a hand.' }, { fx: { flag: 'Bcandle' } }],
            fail: [{ say: 'bjergkongen', da: 'Handle? Med dig? Du har ingenting, jeg vil have.', en: 'Trade? With you? You have nothing I want.' }] },
          { kind: 'say', stat: 'SPROG', dc: 13, label: 'Tell the king what Karen told you.', once: true, req: G => !f(G).Bcandle, bonus: G => f(G).Bring ? 2 : 0, bonusWhy: 'You found her letter',
            build: { en: 'She waited for him for ten years.', answers: [['Hun', 'ventede', 'på', 'ham', 'i', 'ti', 'år.']], tiles: ['Hun', 'ventede', 'på', 'ham', 'i', 'ti', 'år.', 'for', 'siden', 'om'] },
            ok: [{ n: 'The music stops. A troll at the far end of the table blows its nose, loudly, into the tablecloth.' }, { say: 'bjergkongen', da: 'I ti år. Det er længe for et menneske.', en: 'For ten years. That is long for a human.' }, { say: 'bjergkongen', da: 'Godt. Tag lyset. Og gå, før jeg fortryder.', en: 'Fine. Take the candle. And go, before I regret it.' }, { fx: { flag: 'Bcandle', resp: 1 } }],
            fail: [{ say: 'bjergkongen', da: 'Hvad? Spis noget, så taler vi bagefter.', en: "What? Eat something, and we'll talk afterwards." }] },
          { kind: 'act', stat: 'SNIGE', dc: 12, label: 'Steal the hourglass from beside the king’s plate, and turn it.', once: true, req: G => f(G).Btrapped && !f(G).Bsafe,
            ok: [{ n: 'Your fingers close round it. You turn it over. Every troll at the table stops mid-chew. Whatever the hourglass says, the hill must obey; even the king.' }, { fx: { flag: 'Bsafe' } }],
            fail: [{ n: 'A troll the size of a wardrobe sits on your hand, apologises, and does not get up for some time.' }, { fx: { flag: 'Bslow' } }] },
          { kind: 'act', stat: 'LOEGN', label: 'Eat something. It smells incredible.', once: true, special: 'trollFood' },
          { kind: 'go', label: 'Take Anders, and leave.', after: 1, next: 'b_out' },
        ] },
      b_out: { bg: 'trollhill', npc: 'anders', title: 'Ude af højen', night: true,
        pass: G => f(G).Bsafe && !f(G).Bslow ? ['night', 'Ude af højen', 'En time. Eller en nat.'] : ['days', 'Ude af højen', 'Højens time var lang'],
        steps: [
          { special: 'hillOut' },
          { n: 'Behind you the door closes and is a hillside again.' },
          { say: 'anders', da: 'Jeg fik ikke min tid tilbage.', en: "I didn't get my time back." },
          { special: 'candleThought' },
          { fx: { flag: 'Bhill' } },
        ],
        opts: [{ kind: 'go', label: 'Walk him back to the bakery.', next: 'b_end' }] },
      b_end: { bg: 'bakery', npc: 'karen', title: 'Karens bageri', hub: true,
        steps: [{ n: 'Karen is waiting with the lamp lit. Of course she is. She has had practice.' }, { special: 'bEndLine' }],
        opts: [
          { kind: 'act', label: 'Light the troll candle for them.', req: G => f(G).Bcandle, special: 'candleNight', next: 'b_done' },
          { kind: 'act', label: 'Keep the candle for yourself.', req: G => f(G).Bcandle, special: 'candleKeep', next: 'b_done' },
          { kind: 'say', stat: 'SPROG', dc: 11, label: 'Tell Anders what she told you.', build: { en: 'She waited for you for ten years.', answers: [['Hun', 'ventede', 'på', 'dig', 'i', 'ti', 'år.']], tiles: ['Hun', 'ventede', 'på', 'dig', 'i', 'ti', 'år.', 'for', 'siden', 'om'] },
            ok: [{ say: 'anders', da: 'I ti år.', en: 'For ten years.' }, { n: 'He takes off his old-fashioned coat, puts on an apron, and asks where the flour is. Karen tells him, in a voice like a door opening.' }, { fx: { flag: 'endApron', resp: 2 } }],
            fail: [{ n: 'The words come out in the wrong order. It does not matter. Karen has already handed him an apron.' }, { fx: { flag: 'endApron' } }], next: 'b_done' },
        ] },
      b_done: { bg: 'bakery', npc: null, title: 'Karens bageri',
        steps: [{ fx: { flag: 'Bdone' } }, { th: 'Two people in a bakery, forty years apart, deciding where to start. In Vandmark that may be what a happy ending looks like.' }],
        opts: [{ kind: 'go', label: 'Go home to bed.', next: 'sleep' }] },

      /* ===== C · Maren ===== */
      c_room: { bg: 'room_night', npc: 'tomas', title: 'Tomás’ værelse', hub: true,
        steps: [{ n: 'Tomás’s room: a bed, a chair, a photograph of a woman squinting into very strong sunlight. On the wall above the bed, a knot hole in the wood, dark and perfectly round.' }],
        opts: [
          { kind: 'act', stat: 'INDSIGT', dc: 10, label: 'Look at the knot hole.', once: true, ok: [{ n: 'The edge is worn smooth, the way a doorstep is worn. Something comes and goes through here. Often.' }, { fx: { flag: 'Chole' } }], fail: [{ n: 'A hole. Holes are where things are not.' }] },
          { kind: 'reply', da: 'Hvornår kommer hun?', once: true, ok: [{ say: 'tomas', da: 'Når jeg sover. Når det regner. Når jeg savner min mor.', en: 'When I sleep. When it rains. When I miss my mother.' }, { th: 'Når, når, når. Every time. Not once.' }] },
          { kind: 'reply', da: 'Hvad savner du mest?', once: true, ok: [{ say: 'tomas', da: 'Solen. Maden. At tale mit eget sprog. Her er jeg altid lidt dum.', en: 'The sun. The food. Speaking my own language. Here I am always a bit stupid.' }, { th: 'You know that feeling. You have had it since the ferry.' }] },
          { kind: 'say', stat: 'SPROG', dc: 11, label: 'Tell him something true about yourself.', once: true,
            build: { en: 'I also miss my family sometimes.', answers: [['Jeg', 'savner', 'også', 'min', 'familie', 'nogle', 'gange.'], ['Jeg', 'savner', 'også', 'nogle', 'gange', 'min', 'familie.'], ['Jeg', 'savner', 'nogle', 'gange', 'også', 'min', 'familie.']], tiles: ['Jeg', 'savner', 'også', 'min', 'familie', 'nogle', 'gange.', 'savnede', 'ikke'] },
            ok: [{ say: 'tomas', da: 'Også dig? Nå. Så er vi to.', en: 'You too? Well. Then there are two of us.' }, { n: 'He smiles for the first time since you have known him, which admittedly is not long.' }, { fx: { flag: 'Cfriend', resp: 1 } }],
            fail: [{ say: 'tomas', da: 'Hvad? Nå. Lige meget. Tak.', en: "What? Well. Never mind. Thanks." }] },
          { kind: 'go', label: 'Leave him. Come back tonight.', after: 1, next: 'pension_hub' },
        ] },
      c_night: { bg: 'room_night', npc: 'tomas', title: 'Tomás’ værelse · nat', night: true, hub: true, pass: G => G.phase < 3 ? ['dusk', 'Natten', 'Du sidder hos Tomás'] : null,
        steps: [
          { n: 'You sit on the chair in the dark. Tomás falls asleep the way people do who are afraid to: suddenly, as if pushed.' },
          { n: 'At first, nothing. The clock in the hall. Rain beginning on the roof.' },
          { n: 'Then something comes out of the knot hole like smoke out of a pipe, and pours itself into the shape of a woman, and sits down on Tomás’s chest.' },
          { npc: 'maren' },
          { th: 'She is not heavy. That is the horrible thing. She weighs exactly as much as missing someone.' },
          { say: 'maren', da: 'Hvad savner du, lille dreng? Fortæl mig det. Så sover du bedre.', en: "What do you miss, little boy? Tell me. Then you'll sleep better." },
        ],
        opts: [
          { kind: 'act', stat: 'SNIGE', dc: 12, label: 'Plug the knot hole behind her with Hjørdis’ cork.', once: true, req: G => f(G).Cplug,
            ok: [{ n: 'The cork goes in with a small, final sound. The woman on the bed turns, and she is not smoke any more. She is a woman, barefoot, in a nightdress three hundred years out of fashion, and she is furious.' }, { fx: { flag: 'Ctrapped' } }],
            fail: [{ n: 'The cork slips out of your fingers. She is gone through the hole like water down a drain, and Tomás wakes up screaming. She will be back. They always come back.' }, { fx: { flag: 'Cmissed' } }], next: G => f(G).Ctrapped ? 'c_maren' : null },
          { kind: 'say', stat: 'SPROG', dc: 12, label: 'Ask her what SHE misses.', bonus: G => (f(G).casMare ? 2 : 0) + (f(G).Csaw ? 1 : 0), bonusWhy: 'Casimir’s advice, and what you saw',
            build: { en: 'What do you miss?', answers: [['Hvad', 'savner', 'du?']], tiles: ['Hvad', 'savner', 'du?', 'savnede', 'hvornår', 'dig'] },
            ok: [{ n: 'She stops. Nobody has asked her that. Not in three hundred years.' }, { fx: { flag: 'Ctalk' } }],
            fail: [{ say: 'maren', da: 'Hvad siger du? Ti stille. Det er mig, der spørger.', en: "What are you saying? Be quiet. I'm the one who asks." }], next: G => f(G).Ctalk ? 'c_maren' : null },
          { kind: 'act', stat: 'INDSIGT', label: 'Hold up the stone with the hole, and look at her through it.', once: true, req: G => hasBoon('marested'), special: 'stoneLook' },
          { kind: 'lie', stat: 'LOEGN', dc: 13, label: 'Lie: tell her Tomás misses nothing at all.', once: true,
            build: { en: "He doesn't miss anything.", answers: [['Han', 'savner', 'ikke', 'noget.']], tiles: ['Han', 'savner', 'ikke', 'noget.', 'ingen', 'savnede'] },
            ok: [{ say: 'maren', da: 'Ingenting? Så er han ikke sjov.', en: "Nothing? Then he's no fun." }, { n: 'She slides off him like fog off a window and is gone through the hole. Somewhere across town a dog starts to howl, and then, quite distinctly, Ib.' }, { fx: { flag: 'endIb' } }],
            fail: [{ say: 'maren', da: 'Løgn. Alle savner noget.', en: 'A lie. Everyone misses something.' }], next: G => f(G).endIb ? 'c_end' : null },
          { kind: 'go', label: 'Shake Tomás awake. Give up for tonight.', next: 'c_flee' },
        ] },
      c_flee: { bg: 'room_night', npc: 'tomas', title: 'Tomás’ værelse', home: true,
        steps: [{ n: 'Tomás wakes with a gasp, and the woman is smoke again, and the smoke is gone into the wall. He sits up and does not lie down again until it is light.' }, { th: 'Another night, then. Better prepared.' }],
        opts: [{ kind: 'go', label: 'Go to bed.', next: 'sleep' }] },
      c_maren: { bg: 'room_night', npc: 'maren', title: 'Maren', hub: true,
        steps: [
          { special: 'marenLine' },
          { say: 'maren', da: 'Jeg kom hertil for tre hundrede år siden. Jeg skulle være her i et år. Som tjenestepige.', en: 'I came here three hundred years ago. I was supposed to be here for a year. As a maid.' },
          { say: 'maren', da: 'Men skibet sejlede uden mig. Og når det regnede, savnede jeg min mor så meget, at jeg blev til det.', en: 'But the ship sailed without me. And when it rained, I missed my mother so much that I turned into it.' },
          { th: '“Når det regnede, savnede jeg.” Every time it rained. For three hundred years.' },
        ],
        opts: [
          { kind: 'reply', da: 'Det kan jeg godt forstå.', once: true, ok: [{ say: 'maren', da: 'Kan du? …Ja. Det kan du måske.', en: 'Can you? …Yes. Maybe you can.' }, { fx: { flag: 'Cempathy' } }] },
          { kind: 'reply', da: 'Hvor kom du fra?', once: true, ok: [{ say: 'maren', da: 'Fra en ø. Langt mod nord. Der var lys om natten om sommeren.', en: 'From an island. Far to the north. There was light at night in summer.' }] },
          { kind: 'say', stat: 'SPROG', dc: 12, label: 'Tell her she can go home now.', bonus: G => f(G).Cempathy ? 2 : 0, bonusWhy: 'You listened',
            build: { en: 'You can go home now.', answers: [['Du', 'kan', 'rejse', 'hjem', 'nu.'], ['Du', 'kan', 'godt', 'rejse', 'hjem', 'nu.']], tiles: ['Du', 'kan', 'rejse', 'hjem', 'nu.', 'godt', 'rejste', 'om'] },
            ok: [{ say: 'maren', da: 'Hjem.', en: 'Home.' }, { n: 'She says it as if tasting it. Then she stands up, and she is lighter than she was, and she walks to the window and opens it and steps out onto the rain, which holds her.' }, { glimpse: 'maren' }, { fx: { flag: 'endMareHome', resp: 2 } }],
            fail: [{ say: 'maren', da: 'Hjem? Hvordan? Skibet er væk.', en: 'Home? How? The ship is gone.' }], next: G => f(G).endMareHome ? 'c_end' : null },
          { kind: 'act', stat: 'HANDEL', dc: 11, label: 'Offer her a room at Tågelys. Hjørdis will charge her, of course.', once: true, req: G => f(G).Ctrapped,
            ok: [{ n: 'In the morning there is a new lodger at the pensionat. Hjørdis charges her three shillings a day, breakfast at seven, no music, no questions. Maren pays with silver buttons nobody has seen for three hundred years. Hjørdis bites one, and accepts.' }, { glimpse: 'maren' }, { fx: { flag: 'endMareLodger', resp: 1 } }],
            fail: [{ say: 'maren', da: 'Et værelse? Jeg har haft et værelse i tre hundrede år. Det hedder regn.', en: 'A room? I have had a room for three hundred years. It is called rain.' }], next: G => f(G).endMareLodger ? 'c_end' : null },
          { kind: 'go', label: 'Let her go on riding. It is not your business.', next: 'c_ride' },
        ] },
      c_ride: { bg: 'room_night', npc: 'maren', title: 'Maren',
        steps: [{ n: 'You pull out the cork, or open the window, or simply look away. She goes. Tomorrow night she will sit on someone else. Tonight, at least, Tomás sleeps.' }, { fx: { flag: 'endMareRide', resp: -1 } }],
        opts: [{ kind: 'go', label: 'Go to bed.', next: 'c_end' }] },
      c_end: { bg: 'room_night', npc: 'tomas', title: 'Tomás’ værelse', home: true,
        steps: [{ fx: { flag: 'Cnight' } }, { fx: { flag: 'Cdone' } }, { special: 'cEndLine' }],
        opts: [{ kind: 'go', label: 'Sleep. Properly, for once.', next: 'sleep' }] },

      /* ===== HUBS & IDLE ===== */
      pension_hub: { bg: 'inn', npc: 'hjordis', title: 'Pensionat Tågelys', hub: true,
        steps: [{ special: 'innLine2' }],
        opts: [
          { kind: 'go', label: 'Look at Tomás’s room.', req: G => f(G).Cstart && !f(G).Cknow, fx: { flag: 'Cknow' }, next: 'c_room' },
          { kind: 'reply', da: 'Har du en prop?', mark: true, req: G => f(G).Cknow && !f(G).Cplug, ok: [{ say: 'hjordis', da: 'En prop? Til hvad? …Nå. Til Maren. Her.', en: 'A cork? What for? …Oh. For the Mare. Here.' }, { n: 'She hands you a cork from a bottle of something brown and medicinal, and does not ask anything else. In Vandmark, that is a long conversation.' }, { fx: { flag: 'Cplug' } }] },
          { kind: 'go', label: 'Sit up with Tomás tonight.', req: G => f(G).Cknow && !f(G).Cnight, next: 'c_night' },
          { kind: 'go', label: 'End the lesson: the book is right, Anders is home, the nights are quiet.', req: G => f(G).Adone && f(G).Bdone && f(G).Cdone, next: 'finale' },
          { kind: 'go', label: 'Go to bed (the day ends, review today’s words).', next: 'sleep' },
          { kind: 'go', label: 'Go out.', next: 'map' },
        ] },
      havn_idle: { bg: 'harbour', npc: 'margrethe', title: 'Havnen', hub: true,
        steps: [{ special: 'idle2:havn' }],
        opts: [
          { kind: 'go', label: 'Read the weather board.', req: G => !f(G).boardDone, special: 'boardGame' },
          { kind: 'act', label: 'Buy a stone with a hole in it.', req: G => f(G).Cknow && !hasBoon('marested'), special: 'stone' },
          { kind: 'go', label: 'Leave.', next: 'map' },
        ] },
      kontor_idle: { bg: 'office', npc: 'bramsen', title: 'Havnefogedens kontor', steps: [{ special: 'idle2:kontor' }], opts: [{ kind: 'go', label: 'Leave.', next: 'map' }] },
      bageri_idle: { bg: 'bakery', npc: 'karen', title: 'Karens bageri', steps: [{ special: 'idle2:bageri' }], opts: [{ kind: 'go', label: 'Leave.', next: 'map' }] },
      hoej_idle: { bg: 'trollhill', npc: null, title: 'Troldehøjen', steps: [{ n: 'Just a hill. Very green, very round, very innocent. Hills always look innocent. That is how you know.' }], opts: [{ kind: 'go', label: 'Turn back.', next: 'map' }] },
      torv_hub: { bg: 'market', npc: null, title: 'Torvet', hub: true,
        steps: [{ special: 'torvLine2' }],
        opts: [
          { kind: 'go', label: 'Shouting from the bakery. Go and see.', req: G => !f(G).Bstart && G.phase < 3, next: 'b_bageri' },
          { kind: 'go', label: 'Ib’s gossip: who is he talking about?', special: 'sladder', req: G => !f(G).sladderDone },
          { kind: 'go', label: 'Leave the square.', next: 'map' },
        ] },
      l_casimir: { bg: 'cellar', npc: 'casimir', title: 'Sprogkælderen', hub: true,
        steps: [{ special: 'casLine2' }],
        opts: [
          { kind: 'go', label: 'Casimir’s three boxes.', special: 'casBox', req: G => !f(G).casboxDone },
          { kind: 'go', label: 'Da, når or hvornår?', special: 'casGap', req: G => !f(G).casgapDone },
          { kind: 'reply', stat: 'INDSIGT', da: 'Hvad ved du om bjergfolket?', req: G => f(G).Bstart && !f(G).casTroll && !f(G).Bhill,
            ok: [{ say: 'casimir', da: 'Bjergfolket? De elsker fester. Og de samler tid. En nat i højen er mange år herude.', en: 'The hill folk? They love parties. And they collect time. One night in the hill is many years out here.' },
                 { say: 'casimir', en: 'If you go in, never answer a question about time with a length. “I et år”, and they keep you a year. Give them a point instead: “Vi skal hjem om en time.” Om. A point in the future. They have to honour it. Grammar, my friend, is older than trolls.' },
                 { say: 'casimir', da: 'Og spis ikke noget.', en: "And don't eat anything." }, { fx: { flag: 'casTroll' } }] },
          { kind: 'reply', stat: 'INDSIGT', da: 'Hvad er Maren?', req: G => f(G).Cstart && !f(G).casMare && !f(G).Cnight,
            ok: [{ say: 'casimir', da: 'Maren? Hun kom hertil for længe siden. Hun savnede noget så meget, at hun blev til savn.', en: 'The Mare? She came here long ago. She missed something so much that she turned into missing.' },
                 { say: 'casimir', en: 'She comes in through a knot hole. Plug the hole while she is inside, and she is caught, and a woman again, and then you have a different problem. Or ask her what she misses. Nobody ever asks her. That is why she sits on people.' }, { fx: { flag: 'casMare' } }] },
          { kind: 'reply', da: 'Hvor længe har du boet her?', once: true, ok: [{ say: 'casimir', da: 'I elleve år. Og jeg savner sneen. Her regner det bare.', en: 'For eleven years. And I miss the snow. Here it just rains.' }, { th: 'Everyone here misses something when it rains. It rains a lot.' }] },
          { kind: 'go', label: 'Leave.', next: 'map' },
        ] },

      /* ===== FINALE: on the way to the lanterna magica ===== */
      finale: { bg: 'street', npc: 'tomas', title: 'På vej til lanternen', pass: ['days', 'Lørdag', 'Et par dage senere'],
        steps: [
          { n: 'Saturday evening. Tomás has bought two tickets for the lanterna magica at the old customs house: painted glass, a lamp, and stories on a sheet. In Vandmark this counts as cinema, and also as nightlife.' },
          { special: 'finaleLines' },
          { say: 'tomas', da: 'Må jeg spørge dig om noget? Hvornår kom du egentlig hertil?', en: 'May I ask you something? When did you actually come here?' },
          { th: 'The same questions everyone has asked you. This time, answer for yourself.' },
        ],
        opts: [{ kind: 'say', stat: 'SPROG', dc: 8, label: 'Tell him: two weeks ago.', build: { en: 'I came here two weeks ago.', answers: [['Jeg', 'kom', 'hertil', 'for', 'to', 'uger', 'siden.']], tiles: ['Jeg', 'kom', 'hertil', 'for', 'to', 'uger', 'siden.', 'om', 'i'], origin: 'came' },
          ok: [{ say: 'tomas', da: 'To uger! Og du taler allerede bedre end mig.', en: 'Two weeks! And you already speak better than me.' }], fail: [{ say: 'tomas', da: 'For to uger siden, mener du. Ja. Jeg laver den samme fejl.', en: 'Two weeks ago, you mean. Yes. I make the same mistake.' }], next: 'finale2' }] },
      finale2: { bg: 'street', npc: 'tomas', title: 'På vej til lanternen',
        steps: [{ say: 'tomas', da: 'Og hvor længe skal du være her?', en: 'And how long will you be here?' }],
        opts: [
          { kind: 'say', stat: 'SPROG', dc: 8, label: 'For a year.', build: { en: 'I will be here for a year.', answers: [['Jeg', 'skal', 'være', 'her', 'i', 'et', 'år.']], tiles: ['Jeg', 'skal', 'være', 'her', 'i', 'et', 'år.', 'om', 'for', 'siden'], origin: 'stay' },
            ok: [{ say: 'tomas', da: 'Et år. Ligesom mig. Måske.', en: 'A year. Like me. Maybe.' }], fail: [{ say: 'tomas', da: 'I et år? Ja. Godt.', en: 'For a year? Yes. Good.' }], next: 'finale3' },
          { kind: 'say', stat: 'SPROG', dc: 10, label: 'You don’t know yet. It depends on work.', build: { en: "I don't know yet. It depends on my job.", answers: [['Det', 'ved', 'jeg', 'ikke', 'endnu.', 'Det', 'kommer', 'an', 'på', 'mit', 'job.']], tiles: ['Det', 'ved', 'jeg', 'ikke', 'endnu.', 'Det', 'kommer', 'an', 'på', 'mit', 'job.', 'jeg', 'ved'], origin: 'stay' },
            ok: [{ say: 'tomas', da: 'Det kommer an på. Det siger alle danskere. Nu siger du det også.', en: 'It depends. All Danes say that. Now you say it too.' }], fail: [{ say: 'tomas', da: 'Det ved du ikke endnu. Nej. Det gør ingen.', en: "You don't know yet. No. Nobody does." }], next: 'finale3' },
          { kind: 'say', stat: 'SPROG', dc: 12, label: 'Your whole life, you think.', build: { en: 'I would like to stay here my whole life.', answers: [['Jeg', 'vil', 'gerne', 'blive', 'her', 'hele', 'livet.']], tiles: ['Jeg', 'vil', 'gerne', 'blive', 'her', 'hele', 'livet.', 'skal', 'i'], origin: 'stay' },
            ok: [{ say: 'tomas', da: 'Hele livet! Så skal du lære at lide regn.', en: 'Your whole life! Then you must learn to like rain.' }], fail: [{ say: 'tomas', da: 'Hele livet? Modigt.', en: 'Your whole life? Brave.' }], next: 'finale3' },
        ] },
      finale3: { bg: 'street', npc: 'tomas', title: 'På vej til lanternen',
        steps: [{ say: 'tomas', da: 'Er du glad for at være her?', en: 'Are you happy to be here?' }],
        opts: [
          { kind: 'say', stat: 'SPROG', dc: 11, label: '“Yes, but when it rains, I miss the sun.”', build: { en: 'Yes, but when it rains, I miss the sun.', answers: [['Ja,', 'men', 'når', 'det', 'regner,', 'savner', 'jeg', 'solen.']], tiles: ['Ja,', 'men', 'når', 'det', 'regner,', 'savner', 'jeg', 'solen.', 'da', 'savnede'], origin: 'happy' },
            ok: [{ say: 'tomas', da: 'Ja! Præcis. Det kender jeg godt.', en: 'Yes! Exactly. I know that well.' }], fail: [{ say: 'tomas', da: 'Når det regner, savner jeg… ja. Jeg forstår dig.', en: 'When it rains, I miss… yes. I understand you.' }], next: 'finale4' },
          { kind: 'reply', da: 'Ja, meget!', ok: [{ say: 'tomas', da: 'Meget? Så er du den eneste.', en: 'Very? Then you are the only one.' }, { fx: { origin: { happy: 'Ja, meget!' } } }], next: 'finale4' },
          { kind: 'say', stat: 'SPROG', dc: 10, label: '“Not really. I would like to go home.”', build: { en: 'No, not really. I would like to go home.', answers: [['Nej,', 'ikke', 'rigtigt.', 'Jeg', 'vil', 'gerne', 'hjem.']], tiles: ['Nej,', 'ikke', 'rigtigt.', 'Jeg', 'vil', 'gerne', 'hjem.', 'skal', 'hjemme'], origin: 'happy' },
            ok: [{ say: 'tomas', da: 'Det kan jeg godt forstå. Men bliv lidt endnu. Bare til i aften.', en: 'I can understand that. But stay a bit longer. Just until tonight.' }], fail: [{ say: 'tomas', da: 'Hjem? Ja. Nogle gange vil jeg også gerne hjem.', en: 'Home? Yes. Sometimes I want to go home too.' }], next: 'finale4' },
        ] },
      finale4: { bg: 'street', npc: 'tomas', title: 'På vej til lanternen',
        steps: [{ say: 'tomas', da: 'Og hvad savner du?', en: 'And what do you miss?' }],
        opts: [{ kind: 'say', stat: 'SPROG', dc: 9, label: 'Tell him what you miss.', build: { en: 'I miss … (my family / my friends / the food / my own language)',
          answers: [['Jeg', 'savner', 'min', 'familie.'], ['Jeg', 'savner', 'mine', 'venner.'], ['Jeg', 'savner', 'maden.'], ['Jeg', 'savner', 'mit', 'eget', 'sprog.']],
          tiles: ['Jeg', 'savner', 'min', 'familie.', 'mine', 'venner.', 'maden.', 'mit', 'eget', 'sprog.'], origin: 'miss' },
          ok: [{ say: 'tomas', da: 'Det kender jeg godt. Kom. Det begynder nu.', en: "I know that well. Come on. It's starting now." }], fail: [{ say: 'tomas', da: 'Ja. Det gør vi alle sammen. Kom. Det begynder nu.', en: "Yes. We all do. Come on. It's starting now." }], next: 'finale5' }] },
      finale5: { bg: 'lantern', npc: null, title: 'Lanterna magica',
        steps: [
          { n: 'The lamp is lit. On the sheet, painted on glass: the harbour, the fog, a line of boats with candles on black water. A table, set on the sea.' },
          { n: 'Nobody in the room says anything. Then the old woman in front of you whispers, to nobody in particular: “Det var ikke noget.” And the whole room, very softly, laughs.' },
          { glimpse: 'lanterne' },
          { say: 'tomas', da: 'Hvad var det?', en: 'What was that?' },
          { th: 'You know. You also know you will not tell him. Not yet. In Vandmark, “not yet” is the most beautiful word there is.' },
          { special: 'finaleTease' },
        ],
        opts: [{ kind: 'go', label: 'Walk home in the fog.', next: 'end' }] },
    },

    /* ---------- session-specific actions ---------- */
    special: {
      async l2intro() {
        const p = G.prev || {};
        const t = p.endFog ? 'Since Thursday, people nod to you in the street. Not much. A centimetre. In Vandmark a centimetre is a parade.'
          : p.endTruth ? 'Since Thursday, people speak to you in English, slowly and kindly, the way one speaks to a dog that has bitten someone.'
          : p.endSold ? 'Since Thursday you have had money, and nobody to spend it with.'
          : 'You have been in Vandmark a week. You have a room, a few words, and a growing suspicion that the fog has opinions about you.';
        logAdd(`<p>${esc(t)}</p>`, 'narr'); await tapOn();
      },
      async tomasFixed() {
        logAdd(`<p>${G.flags.fix_tomas === 'ok' ? 'The ink takes. Across the table, Tomás fills in like a window when someone breathes on it, from the edges inward, until he is entirely, slightly embarrassedly, here.' : 'Your first try smudges; the right words go in on top. Tomás fills in, mostly. For a day or two his elbows will stay a little see-through.'}</p>`, 'narr');
        await tapOn();
      },
      async tueFixed() {
        logAdd(`<p>${G.flags.fix_tue === 'ok' ? 'You write it. Tue reads it over your shoulder, moving his lips: i to år. A length. Something with a beginning, and an end, and him in it.' : 'It takes you two tries. The second one holds. Tue reads it twice, moving his lips.'}</p>`, 'narr');
        await tapOn();
      },
      async returnBook() {
        const n = ['tomas', 'tue'].filter(k => G.flags['fix_' + k] === 'ok').length;
        logAdd(`<p>${n === 2 ? 'He reads your corrections twice, and finds nothing to correct. He looks almost disappointed.' : 'He reads your corrections, sighs, and touches up one of them with his own pen. Very small. Very red.'}</p>`, 'narr');
        if (n === 2) fx({ resp: 1 });
        await tapOn();
      },
      async kirkeLine() {
        if (G.flags.endHome) { logAdd(`<p>The tower is empty. The lantern hook is empty. The clock goes on by itself, which it seems to find difficult.</p>`, 'narr'); return; }
        logAdd(`<p>${esc(pick(['Anker is up in the tower, checking the clock against the stars, and the stars against the clock.', 'Anker is oiling the iron star on his staff. You do not ask what it is for. It is for exactly what it looks like.', 'Anker is writing in the book by lantern light. His pen makes the only sound in Vandmark.']))}</p>`, 'narr');
      },
      async runde() {
        logAdd(`<p>You walk the streets beside him. At every corner he stops, looks up at a clock or a church or simply the sky, and sings what time it is. Then he looks at you. Your turn.</p>`, 'narr');
        const r = await SPECIAL.clock();
        fx({ sk: 5 });
        if (r >= SESSIONS.k1l2.clockRounds.length - 1) { fx({ insp: 1 }); sayEntry({ say: 'vaegter', da: 'Godt. Du kan læse et ur. Det kan halvdelen af byen ikke.', en: "Good. You can read a clock. Half the town can't." }); }
        else sayEntry({ say: 'vaegter', da: 'Halv elleve er ikke halv over elleve. Det lærer du.', en: 'Half eleven is not half past eleven. You will learn.' });
        await tapOn();
      },
      async casLine2() {
        if (!G.flags.cas2) {
          G.flags.cas2 = true;
          if (G.prev && Object.keys(G.prev).length) sayEntry({ say: 'casimir', da: 'Så. Lektion to. Velkommen tilbage.', en: 'So. Lesson two. Welcome back.' });
          else { logAdd(`<p>Below a bakery, down eleven steps that disagree about their height, is a cellar with a blackboard and a man from very far east, where the winters are at least honest about it: Mester Casimir, who teaches Danish to people who arrived by mistake.</p>`, 'narr'); await tapOn(); sayEntry({ say: 'casimir', da: 'Så. Lektion to. Sæt dig.', en: 'So. Lesson two. Sit down.' }); }
          await tapOn();
          sayEntry({ say: 'casimir', en: 'Last week: why you came. This week: when, and for how long. In Danish, time is three small words, and every foreigner puts them in the wrong place. For … siden. I. Om. Come back when you have made all the mistakes. I have a box for them.' });
        } else logAdd(`<p>${esc(pick(['Casimir is drawing a long line on the blackboard with NU in the middle. He looks at it as if it had insulted him.', 'Casimir is eating something from home out of a tin, very slowly, with his eyes closed.']))}</p>`, 'narr');
      },
      async casBox() { await SPECIAL.boxes('casbox'); await casCheck(); },
      async casGap() { await SPECIAL.boxes('casgap'); await casCheck(); },
      async torvLine2() {
        logAdd(`<p>${esc(pick(['Torvet. Market day. A man is selling umbrellas with the confidence of someone who has read the weather board.', 'The square smells of wet wool, smoked fish and, from one corner, bread.', 'Ib is leaning against the well, telling a woman something about her neighbour that makes her gasp and lean closer.']))}</p>`, 'narr');
      },
      async sladder() {
        sayEntry({ say: 'ib', en: 'Gossip. The only honest trade in Vandmark. I tell you about someone, you tell me who it is. Two shillings for every right answer. I am practically a school.' });
        await tapOn();
        const r = await SPECIAL.guess('ib');
        fx({ sk: r * 2 }); G.flags.sladderDone = true;
      },
      async hillRule() {
        if (G.flags.casTroll) logAdd(`<p>Casimir’s voice in your head: give them a point, never a length. Om, not i. And do not eat anything.</p>`, 'thought');
        else logAdd(`<p>You have the feeling you should have asked someone about this first. Someone who knows about hills. And time. And grammar.</p>`, 'thought');
        await tapOn();
      },
      async hallLine() {
        logAdd(`<p>${G.flags.Bsafe ? 'The hourglass is running. You have one hour. In hill time that is not much, and it is everything.' : 'Nobody turns an hourglass for you. In here, time belongs to the king.'}</p>`, 'thought');
        await tapOn();
      },
      async hallHunt() {
        logAdd(`<p>Gold, mostly. Cups and crowns and clocks, centuries of things that people put down for one moment at a party and never saw again. Somewhere in here are Anders’s things.</p>`, 'narr');
        await SPECIAL.hunt('hall');
        logAdd(`<p>His hat. His father’s watch, stopped at ten past eleven, forty years ago. A key. A ring with a small K engraved inside. And a letter in a girl’s handwriting, never opened.</p>`, 'narr'); await tapOn();
        await letter('karen');
        fx({ flag: 'Bring' });
      },
      async trollFood() {
        logAdd(`<p>You take one bite of something golden. It is the best thing you have ever eaten. You take another.</p>`, 'narr'); await tapOn();
        statGain('LOEGN', 1);
        const ok = await roll('LOEGN', 12, [], null);
        if (ok) { logAdd(`<p>You pretend to swallow, and spit it into your sleeve when the king looks away. He saw. He grins: you are playing the game properly.</p>`, 'narr'); fx({ resp: 1 }); }
        else { logAdd(`<p>You swallow. Somewhere, very faintly, a clock you cannot see ticks faster. Later you will find you have lost something small: the day of the week. For three days, every day feels like Tuesday.</p>`, 'narr'); G.flags.Bslow = true; }
        await tapOn();
      },
      async hillOut() {
        if (G.flags.Bsafe && !G.flags.Bslow) logAdd(`<p>The last grain of sand falls exactly as you step out. Outside it is the same night. Perhaps an hour later. Perhaps two. The moon has barely moved.</p>`, 'narr');
        else { G.day += 3; G.phase = 3; hud(); logAdd(`<p>Outside, the moon is in the wrong place. Three days have gone by. Hjørdis has let your room to a herring merchant and then, after a long talk with herself, let it back to you, at a higher price.</p>`, 'narr'); fx({ sk: -6 }); }
        await tapOn();
      },
      async candleThought() {
        if (G.flags.Bcandle) logAdd(`<p>But you have a candle that stops time for one night. And Karen is in her bakery with the lamp lit, waiting.</p>`, 'thought');
        else logAdd(`<p>Nothing to show for it but a story nobody will believe. In Vandmark, at least, they will pretend not to.</p>`, 'thought');
        await tapOn();
      },
      async bEndLine() {
        if (G.flags.Bring) { logAdd(`<p>Anders gives her the ring. It is the ring. She puts it on. It still fits, which makes her laugh, which makes her cry.</p>`, 'narr'); await tapOn(); }
        sayEntry({ say: 'karen', da: 'Nå. Du kom hjem.', en: 'Well. You came home.' }); await tapOn();
      },
      async candleNight() {
        logAdd(`<p>You light the candle. The clock on the wall stops. The flour in the air stops, too, and hangs there like snow that has changed its mind.</p>`, 'narr'); await tapOn();
        logAdd(`<p>In the light of it Karen is twenty. No: Karen is Karen, and Anders sees her, at last, as she is, and that turns out to be the same thing. They dance between the ovens until the candle is gone.</p>`, 'narr'); await tapOn();
        await glimpse('dans');
        sayEntry({ say: 'anders', da: 'Jeg bliver her. Jeg har mistet fyrre år. Jeg vil ikke miste flere.', en: "I'm staying here. I have lost forty years. I don't want to lose any more." }); await tapOn();
        fx({ flag: 'endCandle', resp: 3 });
      },
      async candleKeep() {
        fx({ boon: 'tidslys' });
        logAdd(`<p>You put the candle in your pocket. Karen sees you do it. She says nothing. She gives Anders an apron.</p>`, 'narr'); await tapOn();
        sayEntry({ say: 'karen', da: 'Du kan begynde i morgen. Klokken fire.', en: 'You can start tomorrow. At four o’clock.' }); await tapOn();
        fx({ flag: 'endApron' });
      },
      async stone() {
        sayEntry({ say: 'margrethe', da: 'En sten med hul? Seks skilling. Den holder Maren væk. Eller også gør den ikke.', en: "A stone with a hole? Six shillings. It keeps the Mare away. Or else it doesn't." }); await tapOn();
        const i = await choices([{ html: `“${daHTML('Her er seks skilling.')}”${G.sk < 6 ? ' <small>(you can’t afford it)</small>' : ''}`, dis: G.sk < 6 }, { html: 'No, thank you.' }]);
        if (i === 0) { G.sk -= 6; AUDIO.sting('coin'); fx({ boon: 'marested' }); addWord('sten'); }
      },
      async stoneLook() {
        logAdd(`<p>Through the hole in the stone the room is different. On the bed sits a girl of seventeen with a bundle in her lap, at a harbour, three hundred years ago, watching a ship sail without her.</p>`, 'narr');
        fx({ flag: 'Csaw' }); await tapOn();
      },
      async marenLine() {
        logAdd(`<p>${G.flags.Ctrapped ? 'She stands by the bed, barefoot, shaking with cold or with anger. Then, because you are the only one awake, she talks.' : 'She looks at you. Then, slowly, she gets off Tomás’s chest and sits at the foot of the bed instead, like a visitor.'}</p>`, 'narr');
        await tapOn();
      },
      async cEndLine() {
        const F = G.flags;
        logAdd(`<p>${F.endMareHome ? 'Tomás sleeps until nine. At breakfast he says he dreamed of an island in the north where the sun does not set in summer. He does not know why he is smiling.' : F.endMareLodger ? 'At breakfast there is one more cup. Maren drinks her coffee by the window, watching the rain, and for once nobody in the house has had a nightmare.' : F.endIb ? 'Tomás sleeps like a stone. Somewhere across town, Ib does not.' : 'Tomás sleeps. Tonight, at least.'}</p>`, 'narr');
        await tapOn();
      },
      async innLine2() {
        const F = G.flags;
        const L = [];
        if (F.Atomas) L.push('Tomás is at the table, eating like a man making up for a month.');
        if (F.endMareLodger) L.push('Maren sits by the window in the rain, perfectly still. Hjørdis has given her the soft chair nobody is allowed to sit in.');
        if (F.endIb) L.push('Ib came by to complain that someone sat on his chest all night and asked him what he misses. Hjørdis gave him coffee and no sympathy.');
        if (!L.length) L.push(hasBoon('nisse') ? 'Hjørdis is doing the accounts. Above the ceiling, someone small is snoring contentedly.' : 'Hjørdis is at her ledger, writing down the weather, as if it owed her money.');
        logAdd(`<p>${esc(pick(L))}</p>`, 'narr');
        if (F.Adone && F.Bdone && F.Cdone) logAdd(`<p>The book is right, Anders is home, the nights are quiet. Tomás has bought two tickets for Saturday.</p>`, 'thought');
      },
      async idle2(k) {
        const F = G.flags, p = G.prev || {};
        const L = {
          havn: F.Atue ? [['margrethe', 'Tue er sejlet. Endelig.', 'Tue has sailed. At last.'], ['margrethe', 'Det bliver regn i morgen. Det står på tavlen.', "It will rain tomorrow. It's on the board."]]
            : p.endTruth ? [['margrethe', 'Torsken koster tolv skilling.', 'The cod costs twelve shillings.']] : [['margrethe', 'Torsken er frisk i dag.', 'The cod is fresh today.']],
          kontor: [['bramsen', 'Opholdsbogen? Det er vægterens bog. Jeg har mine egne bøger.', "The Book of Stays? That is the watchman's book. I have my own books."], ['bramsen', 'Næste.', 'Next.']],
          bageri: F.endCandle ? [['karen', 'Han er en dårlig bager. Men han står op klokken fire, og han synger.', 'He is a bad baker. But he gets up at four, and he sings.']] : [['karen', 'Anders er ny. Han ælter forkert. Han lærer det.', 'Anders is new. He kneads wrong. He will learn.']],
        }[k];
        const [n, da, en] = pick(L); sayEntry({ say: n, da, en }); await tapOn();
      },
      async boardGame() {
        await SPECIAL.weather('board');
        fx({ insp: 1 }); G.flags.boardDone = true;
      },
      async buyHour() {
        if (G.sk < 8) { toast('You cannot afford it. Ib looks sincerely sorry, which is the most frightening thing about him.', 'bad'); return; }
        G.sk -= 8; G.phase = Math.max(0, G.phase - 1); AUDIO.sting('glimpse'); hud();
        logAdd(`<p>He unwraps the handkerchief. There is nothing in it. And yet the light changes, and the church clock, when you look, says an hour earlier than it did.</p>`, 'narr'); await tapOn();
      },
      async finaleLines() {
        const F = G.flags;
        const a = F.endHome ? 'Nobody has sung the hours since Anker went home. People have started to buy clocks.' : F.endChoose ? 'From the church tower Anker sings the hour. He sounds like a man who has chosen to.' : 'From the church tower Anker sings eleven o’clock, as he always has.';
        const b = F.endCandle ? 'At the bakery, Anders sings while he kneads. Karen tells him he is out of tune. She does not tell him to stop.' : 'At the bakery, Anders kneads, badly, and Karen corrects him, gently, every morning at four.';
        logAdd(`<p>${esc(a)} ${esc(b)}</p>`, 'narr'); await tapOn();
      },
      async finaleTease() {
        sayEntry({ say: 'ib', en: 'There you are. Next week, a little job. Somebody wants to know where you live, what there is nearby, and what you like about it. The neighbourhood is complaining about the neighbourhood. Bring Danish.' });
        await tapOn();
      },
    },
  };

  async function casCheck() {
    const F = G.flags;
    if (F.casboxDone && F.casgapDone && !hasBoon('timeglas')) {
      sayEntry({ say: 'casimir', en: 'All three boxes, and all three little words. Take this. An hourglass. It does nothing. That is to say: every morning, it reminds you that you have time.' });
      await tapOn(); fx({ boon: 'timeglas' });
    }
  }
})();

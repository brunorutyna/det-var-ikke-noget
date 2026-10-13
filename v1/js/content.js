/* =========================================================================
   DET VAR IKKE NOGET — content
   Everything the game says or teaches lives here. To add a new session:
   1. add any new chunks to CHUNKS (and patterns to PATTERNS if needed),
   2. add NPCs, duels and scenes,
   3. add a SESSIONS entry with its map.
   See README.md for the full recipe.
   ========================================================================= */

/* ---------- Word chunks (the cards) ----------
   t = grammatical role used by the parser
   c = chips the chunk adds when it's in a correct sentence
   w = the bare word (for adverbs, modals, prepositions)
   prep = which preposition a place takes (i / på)                          */
const CHUNKS = {
  // openers
  ja:   { da: 'ja,',  en: 'yes,', t: 'OPENER', c: 2 },
  nej:  { da: 'nej,', en: 'no,',  t: 'OPENER', c: 2 },

  // ---- Lesson 1 · reasons (family R)
  flyttede: { da: 'jeg flyttede hertil', en: 'I moved here', t: 'MAIN_R', c: 4 },
  kom:      { da: 'jeg kom hertil',      en: 'I came here',  t: 'MAIN_R', c: 4 },
  pga:      { da: 'på grund af', en: 'because of (+ noun)', t: 'PGA', c: 4 },
  forat:    { da: 'for at',      en: 'in order to (+ verb)', t: 'FORAT', c: 4 },
  fordi:    { da: 'fordi',       en: 'because (+ clause)', t: 'FORDI', c: 4 },
  menogsaa: { da: 'men også',    en: 'but also', t: 'MENOGSAA', c: 8 },
  jeg:      { da: 'jeg', en: 'I', t: 'SUBJ', c: 2 },
  gerne: { da: 'gerne', en: 'gladly (with ville: would like to)', t: 'ADV', w: 'gerne', c: 5 },
  ikke:  { da: 'ikke',  en: 'not',  t: 'ADV', w: 'ikke', c: 5 },
  ogsaa: { da: 'også',  en: 'also', t: 'ADV', w: 'også', c: 5 },
  ville: { da: 'ville', en: 'wanted to / would', t: 'MODAL', w: 'ville', c: 3 },
  kunne: { da: 'kunne', en: 'could', t: 'MODAL', w: 'kunne', c: 3 },
  np_kaereste: { da: 'min kæreste', en: 'my partner', t: 'NP', c: 4 },
  np_job:      { da: 'mit job',     en: 'my job',     t: 'NP', c: 4 },
  np_naturen:  { da: 'naturen',     en: 'the nature', t: 'NP', c: 4 },
  np_vejret:   { da: 'vejret',      en: 'the weather', t: 'NP', c: 4, joke: true },
  np_venner:   { da: 'mine venner', en: 'my friends', t: 'NP', c: 5 },
  np_familie:  { da: 'min familie', en: 'my family',  t: 'NP', c: 5 },
  np_studie:   { da: 'mit studie',  en: 'my studies', t: 'NP', c: 5 },
  inf_arbejde: { da: 'arbejde',  en: 'work',  t: 'INF', c: 3 },
  inf_studere: { da: 'studere',  en: 'study', t: 'INF', c: 3 },
  inf_nyt:     { da: 'prøve noget nyt', en: 'try something new', t: 'INF', c: 6 },
  inf_finde:   { da: 'finde arbejde',   en: 'find work', t: 'INF', c: 5 },
  inf_sammen:  { da: 'være sammen med min kæreste', en: 'be with my partner', t: 'INF', c: 7 },
  inf_firma:   { da: 'starte mit eget firma', en: 'start my own company', t: 'INF', c: 7 },
  inf_land:    { da: 'bo i et andet land', en: 'live in another country', t: 'INF', c: 6 },
  vp_fikjob:   { da: 'fik et job her',  en: 'got a job here', t: 'VPAST', w: 'fik', c: 6 },
  vp_traet:    { da: 'var træt af stress', en: 'was tired of stress', t: 'VPAST', w: 'var', c: 6 },
  vp_moedte:   { da: 'mødte en fra Vandmark', en: 'met someone from Vandmark', t: 'VPAST', w: 'mødte', c: 7 },

  // ---- Lesson 1 · what you did before (family J)
  var:       { da: 'jeg var',           en: 'I was',        t: 'WAS',     c: 3 },
  somjob:    { da: 'jeg arbejdede som', en: 'I worked as',  t: 'WORKAS',  c: 4 },
  arbejdede: { da: 'jeg arbejdede',     en: 'I worked',     t: 'WORKED',  c: 3 },
  laeste:    { da: 'jeg læste',         en: 'I studied',    t: 'STUDIED', c: 3 },
  foer:      { da: 'før jeg kom hertil,', en: 'before I came here,', t: 'FOER', c: 6 },
  inv_var:    { da: 'var jeg',           en: 'was I (inverted)',        t: 'INV_WAS',     plain: 'var',       c: 4 },
  inv_som:    { da: 'arbejdede jeg som', en: 'worked I as (inverted)',  t: 'INV_WORKAS',  plain: 'somjob',    c: 5 },
  inv_arb:    { da: 'arbejdede jeg',     en: 'worked I (inverted)',     t: 'INV_WORKED',  plain: 'arbejdede', c: 4 },
  inv_laeste: { da: 'læste jeg',         en: 'studied I (inverted)',    t: 'INV_STUDIED', plain: 'laeste',    c: 4 },
  paa:  { da: 'på', en: 'at / on', t: 'PREP', w: 'på', c: 2 },
  i:    { da: 'i',  en: 'in',      t: 'PREP', w: 'i',  c: 2 },
  pl_hospital:   { da: 'et hospital',  en: 'a hospital',   t: 'PLACE', prep: 'på', c: 4 },
  pl_skole:      { da: 'en skole',     en: 'a school',     t: 'PLACE', prep: 'på', c: 4 },
  pl_restaurant: { da: 'en restaurant', en: 'a restaurant', t: 'PLACE', prep: 'på', c: 4 },
  pl_apotek:     { da: 'et apotek',    en: 'a pharmacy',   t: 'PLACE', prep: 'på', c: 5 },
  pl_avis:       { da: 'en avis',      en: 'a newspaper',  t: 'PLACE', prep: 'på', c: 5 },
  pl_bank:       { da: 'en bank',      en: 'a bank',       t: 'PLACE', prep: 'i',  c: 4 },
  pl_firma:      { da: 'et firma',     en: 'a company',    t: 'PLACE', prep: 'i',  c: 5 },
  j_kok:       { da: 'kok',       en: 'cook',       t: 'JOB', c: 4 },
  j_laerer:    { da: 'lærer',     en: 'teacher',    t: 'JOB', c: 4 },
  j_laege:     { da: 'læge',      en: 'doctor',     t: 'JOB', c: 4 },
  j_ingenioer: { da: 'ingeniør',  en: 'engineer',   t: 'JOB', c: 5 },
  j_arkitekt:  { da: 'arkitekt',  en: 'architect',  t: 'JOB', c: 5 },
  j_journalist:{ da: 'journalist',en: 'journalist', t: 'JOB', c: 5 },
  j_farmaceut: { da: 'farmaceut', en: 'pharmacist', t: 'JOB', c: 6 },
  j_oekonom:   { da: 'økonom',    en: 'economist',  t: 'JOB', c: 5 },
  j_designer:  { da: 'designer',  en: 'designer',   t: 'JOB', c: 5 },
  j_gartner:   { da: 'gartner',   en: 'gardener',   t: 'JOB', c: 6 },
  j_brandmand: { da: 'brandmand', en: 'firefighter',t: 'JOB', c: 6 },
  j_murer:     { da: 'murer',     en: 'bricklayer', t: 'JOB', c: 6 },
  f_medicin: { da: 'medicin', en: 'medicine', t: 'FIELD', c: 4 },
  f_fransk:  { da: 'fransk',  en: 'French',   t: 'FIELD', c: 4 },
  f_fysik:   { da: 'fysik',   en: 'physics',  t: 'FIELD', c: 5 },
  f_geologi: { da: 'geologi', en: 'geology',  t: 'FIELD', c: 5 },
};

/* ---------- Sentence patterns (Balatro "hands") ---------- */
const PATTERNS = {
  KORT:      { name: 'Kort svar',      en: 'Short answer',           fam: 'J', chips: 8,  mult: 2, tier: 1, ex: 'jeg var kok' },
  STED:      { name: 'Sted-svar',      en: 'Workplace answer',       fam: 'J', chips: 12, mult: 2, tier: 2, ex: 'jeg arbejdede på et hospital' },
  JOBSTED:   { name: 'Job og sted',    en: 'Job + workplace',        fam: 'J', chips: 15, mult: 3, tier: 3, ex: 'jeg var kok på en restaurant' },
  FOER_INV:  { name: 'Før-inversion',  en: 'Før-clause first, verb before subject', fam: 'J', chips: 20, mult: 3, tier: 3, ex: 'før jeg kom hertil, var jeg lærer' },
  FULD:      { name: 'Hele historien', en: 'Før-inversion with job and place',      fam: 'J', chips: 30, mult: 4, tier: 4, ex: 'før jeg kom hertil, arbejdede jeg som kok på en restaurant' },
  KORTGRUND: { name: 'Kort grund',     en: 'Bare reason',            fam: 'R', chips: 8,  mult: 2, tier: 1, ex: 'fordi jeg fik et job her' },
  GRUND:     { name: 'På grund af',    en: 'Reason with a noun',     fam: 'R', chips: 12, mult: 2, tier: 2, ex: 'jeg flyttede hertil på grund af mit job' },
  FORMAAL:   { name: 'For at',         en: 'Purpose with a verb',    fam: 'R', chips: 12, mult: 2, tier: 2, ex: 'jeg kom hertil for at arbejde' },
  FORDI:     { name: 'Fordi-sætning',  en: 'Reason with a full clause', fam: 'R', chips: 15, mult: 3, tier: 3, ex: 'jeg flyttede hertil, fordi jeg gerne ville prøve noget nyt' },
  DOBBELT:   { name: 'Dobbelt grund',  en: 'Two reasons, linked with men også', fam: 'R', chips: 25, mult: 4, tier: 4, ex: '… på grund af mit job, men også fordi …' },
};

/* ---------- Grammar explanations shown after a mistake ---------- */
const ERRORS = {
  incomplete:   { t: 'Ikke færdig', en: "The sentence isn't finished yet." },
  leftover:     { t: 'Ord til overs', en: "Some words at the end don't belong to the sentence." },
  opener_q:     { t: 'Ja eller nej?', en: "'Ja,' and 'nej,' answer yes/no questions (Flyttede du …? Kom du …?). This question starts with a question word, so just answer it." },
  start:        { t: 'Forkert start', en: "Start with an opening the question needs: 'jeg flyttede hertil …', 'jeg var …', 'jeg arbejdede …'." },
  som_place:    { t: 'som + job', en: "'arbejdede som' is followed by a job (som kok). For a place, use 'jeg arbejdede på/i …'." },
  was_place:    { t: 'jeg var + job', en: "Here 'jeg var' needs a job: 'jeg var læge'. For a workplace, use 'jeg arbejdede på …'." },
  job_field:    { t: 'Job eller fag?', en: "kok, lærer, læge are jobs. medicin, fransk are subjects: 'jeg læste medicin'." },
  job_expect:   { t: 'Mangler job', en: "A job comes next: kok, lærer, læge …" },
  prep:         { t: 'i eller på?', en: "It's '{good}', not '{bad}'. På: hospital, skole, restaurant, apotek, avis. I: bank, firma." },
  prep_place:   { t: 'Mangler sted', en: "A preposition needs a place after it: på et hospital, i en bank." },
  noprep:       { t: 'Mangler præposition', en: "Add a preposition: '{good}'." },
  worked_job:   { t: 'som!', en: "With a job, say 'jeg arbejdede SOM {job}'. Without 'som', 'jeg arbejdede' needs a place: 'på et hospital'." },
  worked_expect:{ t: 'Hvor?', en: "After 'jeg arbejdede' comes på/i + a place." },
  studied_job:  { t: 'læste + fag', en: "'jeg læste' takes a subject: 'jeg læste medicin'. (‘Jeg læste til læge’ exists, but you don't have that card yet.)" },
  studied_expect:{ t: 'læste + fag', en: "'jeg læste' + a subject: medicin, fransk, fysik." },
  foer_noinv:   { t: 'Inversion!', en: "A sentence that starts with a før-clause flips: the VERB comes before the SUBJECT. 'Før jeg kom hertil, {inv} …' and not '{plain} …'." },
  foer_main:    { t: 'Efter før-sætningen', en: "After 'Før jeg kom hertil,' say what you did back then, verb first: 'arbejdede jeg som …', 'var jeg …'." },
  inv_nofront:  { t: 'Inversion uden grund', en: "'{inv}' puts the verb first. That only happens when something else stands first, like 'Før jeg kom hertil,'. Otherwise it's '{plain}'." },
  ogsaa_first:  { t: 'Også jeg …?', en: "'Også jeg …' isn't how Danish works. The adverb goes after the verb: 'Jeg kom også …'." },
  adv_first:    { t: 'Adverbiet', en: "Adverbs like ikke/gerne don't start the sentence here." },
  subj_start:   { t: 'Kun "jeg"?', en: "'jeg' alone can't open this answer. Use a full opening: 'jeg flyttede hertil', 'jeg var', 'jeg arbejdede' …" },
  conn_expect:  { t: 'Mangler grund', en: "Give the reason with a connector: på grund af (+ noun) / for at (+ verb) / fordi (+ clause)." },
  two_conn:     { t: 'To grunde', en: "Two reasons? Link them with 'men også': '… på grund af mit job, men også fordi …'." },
  menogsaa_first:{ t: 'men også …', en: "'men også' adds a SECOND reason. Give the first one before it." },
  pga_inf:      { t: 'på grund af + navneord', en: "'på grund af' takes a noun (min kæreste, mit job), not a verb. With a verb, use 'for at {x}'." },
  pga_clause:   { t: 'på grund af + navneord', en: "'på grund af' + a noun. For a whole clause (jeg …) use 'fordi'." },
  pga_expect:   { t: 'på grund af + navneord', en: "'på grund af' + a noun: min kæreste, mit job, naturen." },
  forat_np:     { t: 'for at + verbum', en: "'for at' takes a verb (arbejde, studere). With a noun, say 'på grund af {x}'." },
  forat_subj:   { t: 'for at uden subjekt', en: "'for at' has no subject: 'for at arbejde', not 'for at jeg …'. For a clause, use 'fordi'." },
  forat_expect: { t: 'for at + verbum', en: "'for at' + a verb in the infinitive: for at arbejde." },
  fordi_noclause:{ t: 'fordi + sætning', en: "'fordi' needs a full clause with subject and verb: 'fordi jeg …'." },
  fordi_expect: { t: 'fordi jeg + verbum', en: "After 'fordi jeg' comes the verb: ville, kunne, fik …" },
  fordi_noverb: { t: 'Mangler verbum', en: "The clause needs a past-tense verb: 'fordi jeg ville {x}'." },
  modal_inf:    { t: 'ville/kunne + infinitiv', en: "After ville/kunne comes a verb in the infinitive: arbejde, prøve noget nyt …" },
  sav:          { t: 'S – A – V', en: "In a fordi-clause the adverb comes BEFORE the verb: 'fordi jeg {adv} {verb}' and not 'fordi jeg {verb} {adv}'. Subject, Adverb, Verb." },
  gerne_ville:  { t: 'gerne ville', en: "'gerne' goes with 'ville' here: 'fordi jeg gerne ville …' (= because I'd like to …)." },
  adv_order:    { t: 'To adverbier', en: "With two adverbs, 'også' comes first: 'fordi jeg også gerne ville …'." },
  adv_many:     { t: 'For mange', en: "Too many adverbs. Two at most." },
  heller_ikke:  { t: 'heller ikke', en: "'også ikke' isn't Danish. Danes say 'heller ikke' (you don't have that card yet)." },
};

/* ---------- People of Vandmark ---------- */
const NPCS = {
  narrator:  { name: 'Fortælleren' },
  ferry:     { name: 'Færgemanden', role: 'ferryman', col: '#7f9aa0', glyph: 'F' },
  ib:        { name: 'Ib', role: 'tolk · interpreter', col: '#a58a6a', glyph: 'I' },
  soerensen: { name: 'Toldbetjent Sørensen', role: 'customs officer', col: '#7c8590', glyph: 'S' },
  fisk:      { name: 'Fiskekonerne', role: 'the fishwives', col: '#6f8f86', glyph: 'K' },
  kjeld:     { name: 'Formand Kjeld', role: 'foreman, the salt works', col: '#9a9a8e', glyph: 'K' },
  casimir:       { name: 'Mester Casimir', role: 'teacher, from very far east', col: '#b07a55', glyph: 'L' },
  holger:    { name: 'Smed Holger', role: 'smith', col: '#8a6a5a', glyph: 'H' },
  hjordis:   { name: 'Hjørdis', role: 'Pensionat Tågelys', col: '#8e7f9b', glyph: 'H' },
  brask:     { name: 'Fru Agnete Brask', role: 'Keeper of the Name Protocol', col: '#a05a4f', glyph: 'B' },
};

/* ---------- Relics: Ordsprog (sayings that stay with you) ---------- */
const RELICS = {
  forstaa:  { name: 'Det kan jeg godt forstå', en: 'I can understand that', fx: '+2 mult on your first sentence of every duel round.', price: 7 },
  egentlig: { name: 'Egentlig', en: 'Actually', fx: '+15 chips on Fordi-sætning and Dobbelt grund.', price: 7 },
  rodpen:   { name: 'Casimirs rødpen', en: "Casimir's red pen", fx: 'Your first mistake in each duel costs no composure. The preview warns ⚠ when a sentence is wrong.', price: 9 },
  oerer:    { name: 'Skarpe ører', en: 'Sharp ears', fx: 'Fog no longer hides what people say.', price: 6 },
  ibkort:   { name: 'Ibs visitkort', en: "Ib's business card", fx: "Your first 'På engelsk?' in each duel costs no standing.", price: 6 },
  naah:     { name: 'Nåh ja', en: 'Oh, right', fx: '+1 rephrase in every duel.', price: 6 },
  bolle:    { name: 'Den ekstra bolle', en: 'The extra bun', fx: '+5 max composure. Somebody here likes you. Nobody will say who.', price: 99 },
  gerne:    { name: 'Gerne-ringen', en: 'The gerne-ring', fx: '+1 mult for every adverb in a correct sentence.', price: 7 },
  hjemby:   { name: 'Hjembyens minde', en: 'Memory of home', fx: '+3 mult when a sentence uses the job or reason you already gave the Protocol.', price: 8 },
};

/* ---------- Reward pools ---------- */
const CHUNK_POOL = {
  J: ['inv_arb', 'inv_laeste', 'pl_apotek', 'pl_avis', 'pl_firma', 'i', 'paa', 'j_arkitekt', 'j_farmaceut', 'j_oekonom', 'j_designer', 'f_fransk', 'f_fysik', 'inv_som', 'foer'],
  R: ['menogsaa', 'ogsaa', 'np_venner', 'np_familie', 'np_studie', 'inf_sammen', 'inf_firma', 'inf_land', 'vp_traet', 'vp_moedte', 'fordi', 'jeg', 'ville'],
};
const START_DECK = {
  J: ['ja', 'nej', 'var', 'somjob', 'arbejdede', 'laeste', 'foer', 'inv_som', 'inv_var', 'paa', 'paa', 'i',
      'pl_hospital', 'pl_restaurant', 'pl_bank', 'pl_skole', 'j_kok', 'j_laerer', 'j_laege', 'j_ingenioer', 'f_medicin'],
  R: ['ja', 'nej', 'flyttede', 'kom', 'pga', 'forat', 'fordi', 'fordi', 'jeg', 'jeg', 'gerne', 'ikke', 'ville', 'kunne',
      'np_kaereste', 'np_job', 'np_vejret', 'inf_arbejde', 'inf_nyt', 'inf_finde', 'inf_studere', 'vp_fikjob'],
};

/* ---------- Standing (Anseelse) tiers ---------- */
const TIERS = [
  { min: -99, name: 'Turist',     en: 'Tourist' },
  { min: 0,   name: 'Udlænding',  en: 'Foreigner' },
  { min: 6,   name: 'Tilflytter', en: 'Newcomer' },
  { min: 15,  name: 'Nabo',       en: 'Neighbour' },
  { min: 30,  name: 'Vandmarker', en: 'One of us' },
];

/* ---------- Duels ----------
   questions: what they ask (fam J = past/job, R = reason; yn = yes/no question)
   intents: what they do after your answer (cycled), shown in advance
     sarcasm{dmg}  fog{dmg}: question text hidden, listen  english: half score unless tier ≥3
     cross{need,dmg}: meet the demand for ×2, otherwise take dmg   stamp{dmg}   redink: mistakes cost double */
const Q = {
  j1: { fam: 'J', da: 'Hvad lavede du, før du kom hertil?', en: 'What did you do before you came here?' },
  j2: { fam: 'J', da: 'Hvad lavede du egentlig derhjemme?', en: 'What did you actually do back home?' },
  j3: { fam: 'J', da: 'Hvor arbejdede du?', en: 'Where did you work?' },
  j4: { fam: 'J', da: 'Og hvad lavede du så?', en: 'And what did you do, then?' },
  j5: { fam: 'J', da: 'Hvad lavede du, før du kom til Vandmark?', en: 'What did you do before you came to Vandmark?' },
  j6: { fam: 'J', da: 'Hvor arbejdede du, før du kom hertil?', en: 'Where did you work before you came here?' },
  r1: { fam: 'R', da: 'Hvorfor kom du hertil?', en: 'Why did you come here?' },
  r2: { fam: 'R', yn: true, da: 'Flyttede du hertil på grund af dit job?', en: 'Did you move here because of your job?' },
  r3: { fam: 'R', da: 'Hvorfor Vandmark? Her er koldt, og her er tåge.', en: "Why Vandmark? It's cold here, and there's fog." },
  r4: { fam: 'R', da: 'Hvorfor flyttede du egentlig hertil?', en: 'Why did you actually move here?' },
  r5: { fam: 'R', yn: true, da: 'Kom du hertil på grund af dit job?', en: 'Did you come here because of your job?' },
  r6: { fam: 'R', da: 'Hvorfor flyttede du hertil? Svar ordentligt.', en: 'Why did you move here? Answer properly.' },
};

const NEEDS = {
  place: { da: 'Sig HVOR du arbejdede', en: 'Mention a workplace (på / i …)' },
  fordi: { da: 'Brug en fordi-sætning', en: "Use a 'fordi' clause" },
  foer:  { da: 'Start med en før-sætning', en: "Start with 'Før jeg kom hertil,'" },
  dobbelt: { da: 'Giv to grunde', en: "Two reasons, linked with 'men også'" },
};

const DUELS = {
  told: {
    npc: 'soerensen', place: 'Toldboden',
    lines: {
      good: [['Hm. Det skriver jeg ned.', "Hm. I'll write that down."], ['Nå. Fint.', 'Well. Fine.'], ['Det tror jeg ikke på. Men jeg skriver det ned.', "I don't believe it. But I'll write it down."]],
      good1: [['Nå, det lyder spændende. Næsten.', 'Oh, that sounds exciting. Almost.'], ['Godt sagt.', 'Well said.']],
      err: [['Hvad?', 'What?'], ['Det forstod jeg ikke.', "I didn't understand that."], ['Prøv igen. Langsomt.', 'Try again. Slowly.']],
      attack: [['Interessant. Det siger alle.', 'Interesting. Everybody says that.'], ['Og du talte dansk dengang? Nej. Det tænkte jeg nok.', 'And you spoke Danish back then? No. I thought not.'], ['Næste gang, hurtigere.', 'Next time, faster.']],
      eng: ['Engelsk. Selvfølgelig.', 'English. Of course.'],
      wrongq: ['Det spurgte jeg ikke om.', "That's not what I asked."],
    },
    rounds: [{ distrust: 60, patience: 5, questions: ['j1', 'j3', 'j2', 'j4'],
      intents: [{ type: 'sarcasm', dmg: 3 }, { type: 'fog', dmg: 2 }, { type: 'cross', need: 'place', dmg: 5 }, { type: 'english' }, { type: 'sarcasm', dmg: 4 }] }],
  },
  salt: {
    npc: 'kjeld', place: 'Salthuset',
    lines: {
      good: [['Hm. Det har jeg hørt før.', "Hm. I've heard that before."], ['Nå. Det kan jeg godt forstå.', 'Well. I can understand that.']],
      good1: [['Det lyder fornuftigt.', 'That sounds sensible.'], ['Godt. Det kan jeg lide.', 'Good. I like that.']],
      err: [['Hvad siger du?', 'What are you saying?'], ['Nej, nej. Prøv igen.', 'No, no. Try again.']],
      attack: [['Alle kommer for at arbejde. Ingen bliver.', 'Everyone comes to work. Nobody stays.'], ['Kan du bære en sæk salt? Nej? Så tal hurtigere.', "Can you carry a sack of salt? No? Then talk faster."], ['Saltet venter ikke.', "The salt doesn't wait."]],
      eng: ['På engelsk? Her? Saltet forstår ikke engelsk.', "In English? Here? The salt doesn't understand English."],
      wrongq: ['Jeg spurgte HVORFOR.', 'I asked WHY.'],
    },
    rounds: [{ distrust: 100, patience: 5, questions: ['r1', 'r2', 'r3', 'r4'],
      intents: [{ type: 'sarcasm', dmg: 4 }, { type: 'cross', need: 'fordi', dmg: 5 }, { type: 'english' }, { type: 'fog', dmg: 3 }, { type: 'sarcasm', dmg: 5 }] }],
  },
  brask: {
    npc: 'brask', place: 'Navneprotokollen', boss: true,
    lines: {
      good: [['Korrekt. Desværre.', 'Correct. Unfortunately.'], ['Det kan jeg godt skrive.', 'I can write that.']],
      good1: [['Pænt. Meget pænt.', 'Neat. Very neat.'], ['Se, det er dansk.', "Look, that's Danish."]],
      err: [['Nej. Prøv igen. Langsomt.', 'No. Try again. Slowly.'], ['Det kan jeg ikke skrive.', "I can't write that."]],
      attack: [['Fire tusind udlændinge har stået, hvor du står.', 'Four thousand foreigners have stood where you stand.'], ['Protokollen venter ikke.', "The Protocol doesn't wait."]],
      eng: ['Jeg taler gerne engelsk. Protokollen gør ikke.', "I'm happy to speak English. The Protocol isn't."],
      wrongq: ['Det står allerede i protokollen. Svar på spørgsmålet.', "That's already in the Protocol. Answer the question."],
    },
    rounds: [
      { name: 'Fortiden', en: 'The past', distrust: 90, patience: 3, questions: ['j5', 'j6', 'j2'],
        intents: [{ type: 'cross', need: 'foer', dmg: 5 }, { type: 'stamp', dmg: 6 }, { type: 'english' }] },
      { name: 'Grunden', en: 'The reason', distrust: 120, patience: 3, questions: ['r6', 'r5', 'r1'],
        intents: [{ type: 'redink' }, { type: 'cross', need: 'fordi', dmg: 6 }, { type: 'stamp', dmg: 7 }] },
      { name: 'Protokollen', en: 'The Protocol', distrust: 170, patience: 4, questions: ['r4', 'j1', 'r6', 'j6'],
        intents: [{ type: 'cross', need: 'dobbelt', dmg: 6 }, { type: 'fog', dmg: 4 }, { type: 'english' }, { type: 'stamp', dmg: 8 }] },
    ],
  },
};

/* ---------- Glimpses of the hidden thing ---------- */
const GLIMPSES = {
  vand:    { name: 'Lys på vandet', en: 'Lights on the water', text: 'For a moment, out in the fog, lights on the water, laid out like a very long table. The ferryman said it was nothing. He said it quickly.' },
  margrethe:{ name: 'Hos Margrethe', en: "At Margrethe's", text: "Something happens tonight at Margrethe's. It must not be said out loud. Especially not near you." },
  lys:     { name: 'Medbring et lys', en: 'Bring a light', text: 'A torn notice: tonight, somewhere, bring a candle, and do not tell the … The rest is gone. Somebody tore it off carefully.' },
  sang:    { name: 'Kjelds sang', en: "Kjeld's song", text: '"…når lysene tændes, så kommer vi hjem…" A foreman of salt, humming like a man in love. Then: the weather.' },
  pause:   { name: 'Casimirs pause', en: "Casimir's pause", text: 'The only other foreigner you have met who might know. He said "Det var ikke noget", then, much more quietly, "not yet."' },
  bagvaer: { name: 'Bagværelset', en: 'The back room', text: 'Candles. A long table. Sørensen with his collar open, laughing. A whole room sighing as one over a dish. Then nothing, very fast.' },
  smil:    { name: 'Fru Brasks smil', en: "Fru Brask's smile", text: 'Gold, moving over the rooftops for a heartbeat. Fru Brask smiled at it the way you smile at an old friend. Then she told you the weather would improve. It never does.' },
};

/* ---------- Mini-games outside duels ---------- */
const LISTEN_MARKET = [
  { da: 'Skal du med i aften?', opts: ['Are you coming along tonight?', 'Are you buying fish today?', 'Is it cold tonight?'] },
  { da: 'Ja, hos Margrethe. Men sig det ikke så højt.', opts: ["Yes, at Margrethe's. But don't say it so loudly.", "Yes, Margrethe is ill. She isn't loud.", "No, Margrethe doesn't sell herring."] },
  { da: 'Der står en udlænding lige der.', opts: ["There's a foreigner standing right there.", "There's a fish right there.", 'A stranger came here last year.'] },
];

const JOB_NOTICES = [
  { da: 'Søges: En, der passer blomster og planter i haven.', a: 'j_gartner', opts: ['j_gartner', 'j_murer', 'j_brandmand'] },
  { da: 'Søges: En, der slukker ild og redder mennesker. Igen.', a: 'j_brandmand', opts: ['j_brandmand', 'j_gartner', 'j_journalist'] },
  { da: 'Søges: En, der bygger vægge med mursten. Vægge holder tågen ude. Næsten.', a: 'j_murer', opts: ['j_murer', 'j_laerer', 'j_brandmand'] },
  { da: 'Søges: En, der skriver artikler og laver interviews. Mest om tågen.', a: 'j_journalist', opts: ['j_journalist', 'j_gartner', 'j_kok'] },
];

/* Sentences from a real class correction sheet ("Mit liv før Danmark"), set in Vandmark */
const CORRECTIONS = [
  { bad: 'Før jeg flyttede til Vandmark, jeg boede i mange byer.',
    good: 'Før jeg flyttede til Vandmark, boede jeg i mange byer.',
    wrong: ['Før jeg flyttede til Vandmark, jeg har boet i mange byer.', 'Før flyttede jeg til Vandmark, jeg boede i mange byer.'],
    why: 'Før-clause first, so the verb jumps ahead of the subject: boede jeg.' },
  { bad: 'Jeg flyttede hertil, fordi jeg ville gerne bo sammen med ham.',
    good: 'Jeg flyttede hertil, fordi jeg gerne ville bo sammen med ham.',
    wrong: ['Jeg flyttede hertil, fordi ville jeg gerne bo sammen med ham.', 'Jeg flyttede hertil, fordi jeg ville bo gerne sammen med ham.'],
    why: 'Inside a fordi-clause: subject, adverb, verb. jeg gerne ville.' },
  { bad: 'Jeg boede der for næsten syv år.',
    good: 'Jeg boede der i næsten syv år.',
    wrong: ['Jeg boede der siden næsten syv år.', 'Jeg boede der om næsten syv år.'],
    why: 'A length of time takes i: i syv år. "For … siden" means ago.' },
  { bad: 'Også jeg lærte engelsk.',
    good: 'Jeg lærte også engelsk.',
    wrong: ['Jeg også lærte engelsk.', 'Lærte jeg også engelsk.'],
    why: 'Main clause: subject, verb, then the adverb. Jeg lærte også.' },
  { bad: 'Vi spisede på mange restauranter.',
    good: 'Vi spiste på mange restauranter.',
    wrong: ['Vi spisde på mange restauranter.', 'Vi spisered på mange restauranter.'],
    why: 'spise belongs to the -te group: spiste. (Hard d, if you can call it that.)' },
];

const FORGE_VERBS = [
  ['arbejde', 'arbejdede', 'ede'], ['flytte', 'flyttede', 'ede'], ['bo', 'boede', 'ede'], ['spille', 'spillede', 'ede'], ['lave', 'lavede', 'ede'], ['studere', 'studerede', 'ede'],
  ['læse', 'læste', 'te'], ['købe', 'købte', 'te'], ['søge', 'søgte', 'te'], ['undervise', 'underviste', 'te'], ['spise', 'spiste', 'te'], ['møde', 'mødte', 'te'],
  ['gå', 'gik', 'irr'], ['have', 'havde', 'irr'], ['komme', 'kom', 'irr'], ['tage', 'tog', 'irr'], ['være', 'var', 'irr'], ['få', 'fik', 'irr'], ['sige', 'sagde', 'irr'],
];

const ORIGIN_PLACES = [
  { en: 'On an island', noun: 'en ø', prep: 'på', nounEn: 'an island' },
  { en: 'In a big city', noun: 'en storby', prep: 'i', nounEn: 'a big city' },
  { en: 'In the countryside', noun: 'landet', prep: 'på', nounEn: 'the countryside' },
  { en: 'In the mountains', noun: 'bjergene', prep: 'i', nounEn: 'the mountains' },
];
const FRITID = [
  { en: 'Played football', inf: 'spille fodbold', good: 'spillede fodbold', bad: ['spilte fodbold', 'spillte fodbold'] },
  { en: 'Went dancing (classes)', inf: 'gå til dans', good: 'gik til dans', bad: ['gåede til dans', 'gikte til dans'] },
  { en: 'Read books', inf: 'læse bøger', good: 'læste bøger', bad: ['læsede bøger', 'las bøger'] },
  { en: 'Cooked', inf: 'lave mad', good: 'lavede mad', bad: ['lavte mad', 'lavde mad'] },
];

/* =========================================================================
   SCENES — what happens at each map node.
   Step types: n (narration) · th (inner thought) · say {npc, da, en, gist}
   choice · duel · glimpse · gain · check · quiz · fn (custom, in game.js)
   {job} {Job} {place} are filled in from the story so far.
   ========================================================================= */
const SCENES = {
  prolog: [
    { n: 'The ferry to Vandmark does not so much arrive as stop being anywhere else. One moment there is fog. Then there is fog with a pier in it.' },
    { n: 'You have been travelling for eleven days. You carry one bag, a letter of passage stamped by four officials who did not read it, and a vocabulary of roughly thirty words, nine of which are fish.' },
    { th: 'Out on the water, behind the fog, something glows. Warm. Gold. Laid out in a long line, like a table set for a great many people.' },
    { say: 'ferry', da: 'Det var ikke noget. Det er bare tågen.', en: "That was nothing. It's just the fog.", gist: 'The ferryman says something. The word "tågen" is in it. You suspect it means fog. You are beginning to suspect everything here means fog.' },
    { glimpse: 'vand' },
    { n: 'The light is gone. The ferryman looks at you the way one looks at a gull that has learned to open bins.' },
    { n: 'A man in a coat of excellent quality and doubtful origin appears at your elbow. He has the smile of someone who charges by the word.' },
    { say: 'ib', en: "Ib. Tolk. Interpreter. Welcome to Vandmark, where the weather is bad and the people are worse, and both improve, I'm told, if you speak to them properly." },
    { say: 'ib', en: "Here, everything that matters is said in Danish. Contracts. Oaths. The names in the Protocol. Say it in English and it's just noise. Pleasant noise. Tourists make it all day." },
    { say: 'ib', en: "Speak English and they'll answer in English, politely, the way you'd answer a dog. Try Danish, badly, and something odd happens. They get annoyed. Annoyed is good. Annoyed means they've decided you might be staying." },
    { n: 'He presses a card into your hand: IB · TOLK · RIMELIGE PRISER. You do not know what "rimelige" means. You suspect it is a lie.' },
    { say: 'ib', en: "So. Where did you live? Before. They will ask you a hundred times. Say it in Danish: 'Jeg boede …'" },
    { fn: 'originPlace' },
    { say: 'ib', en: "Customs first. Sørensen will want to know what you did before you came. Tell him something. Tell him in Danish. And tell him something true. Or at least something you can pronounce." },
    { n: 'He is gone before you can ask what he wants for this. In Vandmark, you will learn, that question is always answered later.' },
  ],

  told_in: [
    { n: 'The customs house smells of wet wool and authority. Behind the desk sits Sørensen, a man built like a filing cabinet and roughly as forthcoming.' },
    { say: 'soerensen', da: 'Navn. Papirer. Og så nogle spørgsmål.', en: 'Name. Papers. And then some questions.', gist: 'He wants papers, and then something else. Possibly your soul. Possibly just questions.' },
    { th: 'Build your answer from the words in your head. The better the Danish, the more his distrust melts. He will not tell you which part impressed him.' },
  ],
  told_out: [
    { say: 'soerensen', da: 'Godt. Næste.', en: 'Fine. Next.', gist: 'Two words. One of them is "good". You choose to believe it was that one.' },
    { n: 'This, you will later learn, is the warmest thing Sørensen has said to anyone since the spring of the flood.' },
    { fn: 'jobEcho' },
  ],

  marked: [
    { n: "The fish market at dawn: forty people shouting prices at fish who are past caring. Two women gut cod with the speed of long practice and talk with the speed of a longer friendship." },
    { th: "They're not talking to you. Which means, for once, they're talking normally. Listen." },
    { quiz: 'listen' },
    { fn: 'marketAfter' },
  ],

  tavle: [
    { n: "The guild hall's notice board is the only honest thing in Vandmark: it tells you exactly what people want, and how little they'll pay for it." },
    { th: 'Every job you can name is a past you can claim. Sørensen believed your last one. Sørensen believes nothing, so it cost him no effort.' },
    { quiz: 'jobs' },
    { n: 'In the corner, half-hidden under a notice about lost goats, a scrap of paper. Torn. Somebody tore it carefully.' },
    { check: { dc: 10, label: 'Read the torn notice', think: { q: "Think in Danish first: 'medbring et lys' means …", opts: ['bring a light (a candle)', 'buy a light', 'light a fire'], a: 0 },
      ok: [{ say: 'narrator', da: '… i aften … medbring et lys … sig det ikke til …', en: '… tonight … bring a candle … don\'t tell …', gist: 'You read it twice. The second time it says the same thing, which is somehow worse.' }, { glimpse: 'lys' }],
      fail: [{ n: 'The handwriting is the kind that teachers write in red. You make out "i aften" and a word that might be "lys" or might be "lyst". Then a clerk takes it down, glances at you, and says the weather is turning.' }] } },
  ],

  salt_in: [
    { n: 'The salt works squat at the edge of the harbour like a toad that has given up. Inside, men and women shovel grey salt into grey sacks under a grey ceiling.' },
    { n: 'Formand Kjeld oversees all of it. He needs hands. He does not need yours, he would like you to know, but he needs hands.' },
    { fn: 'kjeldJob' },
    { th: 'He will ask why you came. Every answer here is a small weapon: på grund af for a thing, for at for a plan, fordi for a whole story.' },
  ],
  salt_out: [
    { say: 'kjeld', da: 'Du kan starte i morgen. Klokken fem.', en: 'You can start tomorrow. Five o\'clock.', gist: 'Tomorrow. Five. You hope he means the evening. He does not mean the evening.' },
    { fn: 'reasonEcho' },
    { n: 'As you leave, Kjeld begins to hum, low and unexpectedly lovely, as he stacks the sacks.' },
    { check: { dc: 12, label: 'Catch the words of the song', think: { q: "'når lysene tændes' — what does 'når' mean here?", opts: ['when (it happens / every time)', 'when (once, in the past)', 'why'], a: 0 },
      ok: [{ say: 'kjeld', da: '…når lysene tændes, så kommer vi hjem…', en: '…when the lights are lit, then we come home…', gist: 'Lights. Home. He sings it like a man who has been somewhere you have not.' }, { say: 'kjeld', da: "Det er koldt i dag, hva'?", en: "Cold today, eh?", gist: 'He has noticed you listening. He has changed the subject to the weather. The subject was already the weather.' }, { glimpse: 'sang' }],
      fail: [{ n: 'The tune slips past you like a fish. Kjeld notices you listening and stops. "Det er koldt i dag," he says, accusingly, as if you had brought it.' }] } },
  ],

  kaelder: [
    { n: 'Below a bakery, down eleven steps that disagree about their height, is a cellar with a blackboard, nine chairs and a man from very far east, where the winters are at least honest about it.' },
    { n: 'Mester Casimir has lived in Vandmark for eleven winters. He counts them in winters, not years, the way other men count scars: without complaint, and with a certain professional pride.' },
    { say: 'casimir', da: 'Velkommen. Sæt dig.', en: 'Welcome. Sit down.', gist: 'Sit. That one you understood. It is the first Danish sentence anyone has said to you that did not sound like an accusation.' },
    { say: 'casimir', en: "Everyone who arrives makes the same mistakes. This is good news. It means the mistakes are a road, and roads go somewhere. Here are some from my other students. Find the right version." },
    { th: "You cannot tell whether he is helping you or recruiting you." },
    { quiz: 'corrections' },
    { fn: 'casAfter' },
  ],

  smedje: [
    { n: 'Smed Holger forges nails, hinges and, for a small fee, verbs. His forearms suggest he has opinions about both.' },
    { say: 'holger', da: 'Verber er som jern. De skal i ilden.', en: 'Verbs are like iron. They have to go in the fire.', gist: 'Something about iron. And fire. Said to a foreigner holding a verb. You take a step back on principle.' },
    { th: 'Three anvils: -ede, -te, and the one with the dents in it, for verbs that refuse to behave. Listen to the d: soft in -ede (lavede), hard in -te (læste).' },
    { quiz: 'forge' },
  ],

  ib: [
    { n: "Ib's stall is a doorway with a curtain and a chair, which is to say an office. He is already sitting in the chair. You did not tell him you were coming." },
    { say: 'ib', en: "You need things. I have things. We're practically a guild." },
    { fn: 'shop' },
    { fn: 'ibDeal' },
  ],

  pension: [
    { n: 'Pensionat Tågelys is run by Hjørdis, with an iron ledger and a soft chair that nobody is allowed to sit in.' },
    { say: 'hjordis', da: 'Et værelse. Tre skilling. Morgenmad klokken seks. Ingen musik. Ingen spørgsmål.', en: 'A room. Three shillings. Breakfast at six. No music. No questions.', gist: 'A room, three of something, six of something else, and two things you are not allowed. You agree to all of it.' },
    { fn: 'rest' },
    { say: 'hjordis', da: 'Hvad lavede du i din fritid? Derhjemme, mener jeg.', en: 'What did you do in your free time? Back home, I mean.', gist: 'She asks something about "fritid". Free time. She asks it like a customs officer for hobbies.' },
    { fn: 'fritid' },
    { n: "Past midnight, a sound downstairs. Not music. Hjørdis said no music. But something adjacent to music. The door to the back room stands open the width of a finger." },
    { choice: [
      { label: 'Listen at the door', sub: '[SPROG] check', go: [{ check: { dc: 13, label: 'Listen at the door', think: { q: "Think in Danish first: 'Sig det ikke højt' means …", opts: ["Don't say it out loud", "Don't say it again", 'Say it higher'], a: 0 },
          ok: [{ n: 'Candles. Many. A long table, and faces you know: the fishwives, a clerk from the guild hall, Sørensen, with his collar open, laughing. Somebody sets down a dish and the whole room sighs as one.' },
               { n: 'Then a floorboard under your foot says something in an old dialect, and every face turns. The candles are not blown out. They are simply no longer there to be seen.' },
               { say: 'hjordis', da: 'Det var ikke noget. Gå i seng.', en: 'That was nothing. Go to bed.', gist: 'Hjørdis is at the door. She was not at the door a moment ago.' },
               { glimpse: 'bagvaer' }],
          fail: [{ n: 'Laughter, low. Then a floorboard betrays you. "Gå i seng," says Hjørdis, from much closer than you thought she was. You go to bed.' },
                 { n: 'In the morning there is an extra bun by your plate. Nobody mentions it. You decide not to mention it either. This, you sense, is the correct response.' },
                 { relic: 'bolle' }] } }] },
      { label: 'Go to bed', sub: '+4 composure', go: [{ n: 'You go to bed. Whatever it was, it continues without you, which you suspect is how it prefers things.' }, { heal: 4 }] },
    ] },
  ],

  brask_in: [
    { n: 'The Office of the Name Protocol occupies the top floor of the oldest building in Vandmark, on the principle that nobody should reach it without first reconsidering.' },
    { n: 'The Protocol itself lies open on a lectern: a book so large it has its own weather.' },
    { n: 'Fru Agnete Brask has registered four thousand foreigners. She has liked eleven of them. She remembers all eleven.' },
    { fn: 'braskReads' },
    { say: 'brask', da: 'Det er en meget kedelig historie. Godt. Kedelige mennesker er nemme at registrere.', en: 'That is a very boring story. Good. Boring people are easy to register.', gist: '"Kedelig". You do not know the word. From her expression, it is either "boring" or "acceptable". In Vandmark, possibly both.' },
    { th: 'Three rounds, like a duel at cards: the past, the reason, the Protocol. Win two. You may stay silent and give up a round. You may not give up the book.' },
  ],
  brask_out: [
    { say: 'brask', da: 'Registreret. Midlertidig.', en: 'Registered. Temporary.', gist: 'A stamp comes down. The sound is final in a way that suggests you should be grateful. "Midlertidig". Mid-something.' },
    { n: 'Temporary. In Vandmark, you will learn, this is also what they call marriages, houses and the summer.' },
    { n: 'As she closes the Protocol, Fru Brask glances at the window. Outside, for a heartbeat, the fog thins, and something gold moves over the rooftops.' },
    { n: 'And she smiles. Not at you. At it. Then she sees you looking.' },
    { say: 'brask', da: 'Vejret bliver bedre i morgen.', en: 'The weather will be better tomorrow.', gist: 'The weather. Tomorrow. Better. It never is. You both know it never is.' },
    { glimpse: 'smil' },
  ],
};

/* ---------- Sessions & maps ----------
   One entry per book session. node.type: story | duel | boss | event | shop | rest */
const SESSIONS = [
  {
    id: 'k1l1', chapter: 'Kapitel 1 · Baggrund & bydel', title: 'Lektion 1 · Hvorfor kom du hertil?', en: 'Why did you come here?',
    map: [
      [{ id: 'prolog', type: 'story', title: 'Færgen', sub: 'The ferry', scene: 'prolog' }],
      [{ id: 'told', type: 'duel', title: 'Toldboden', sub: 'Customs · what did you do before?', duel: 'told', pre: 'told_in', post: 'told_out' }],
      [{ id: 'marked', type: 'event', title: 'Fiskemarkedet', sub: 'Listen · eavesdrop', scene: 'marked' },
       { id: 'tavle', type: 'event', title: 'Opslagstavlen', sub: 'Read · guess the job', scene: 'tavle' }],
      [{ id: 'salt', type: 'duel', title: 'Salthuset', sub: 'The foreman · why did you come?', duel: 'salt', pre: 'salt_in', post: 'salt_out' }],
      [{ id: 'kaelder', type: 'event', title: 'Sprogkælderen', sub: 'Corrections · a teacher', scene: 'kaelder' },
       { id: 'smedje', type: 'event', title: 'Datid-smedjen', sub: 'Past tense forge', scene: 'smedje' },
       { id: 'ib', type: 'shop', title: 'Ibs bod', sub: 'Buy · make a deal', scene: 'ib' }],
      [{ id: 'pension', type: 'rest', title: 'Pensionat Tågelys', sub: 'Rest · free time', scene: 'pension' }],
      [{ id: 'brask', type: 'boss', title: 'Navneprotokollen', sub: 'Fru Brask · the Name Protocol', duel: 'brask', pre: 'brask_in', post: 'brask_out' }],
    ],
    next: { title: 'Lektion 2 · Hvor længe skal du være her?', en: 'How long will you be here?', teaser: "The Night Watch keeps its own ledger. It does not care why you came. It wants to know when, and for how long, and above all when you are leaving. Lights have been seen on the water again. Nobody saw them. Everybody mentions the weather." },
  },
];

/* Meta upgrades bought between attempts in the cellar (persist across runs) */
const META_UPGRADES = [
  { id: 'comp', name: 'Tykkere hud', en: 'Thicker skin', fx: '+5 max composure', cost: 8 },
  { id: 'disc', name: 'Omformuleringer', en: 'Rephrasing', fx: '+1 rephrase per duel', cost: 8 },
  { id: 'coin', name: 'Lommepenge', en: 'Pocket money', fx: 'Start with +4 skilling', cost: 6 },
  { id: 'fordi', name: 'Casimirs noter', en: "Casimir's notes", fx: 'Fordi-sætning starts at level 2', cost: 12 },
];

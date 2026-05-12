import type { CEFRLevel } from "@/types";

export interface GrammarRule {
  id: string;
  title: string;
  subtitle: string;
  explanation: string;
  structure?: string;
  examples: { en: string; he: string }[];
  tip?: string;
  common_mistakes?: string[];
}

export interface GrammarSection {
  level: CEFRLevel;
  rules: GrammarRule[];
}

export const GRAMMAR: GrammarSection[] = [
  {
    level: "A1",
    rules: [
      {
        id: "a1-present-simple",
        title: "Present Simple",
        subtitle: "הווה פשוט",
        explanation: "Used for facts, habits, and routines. With He/She/It — add -s or -es to the verb.",
        structure: "I/You/We/They + verb | He/She/It + verb+s",
        examples: [
          { en: "I work every day.", he: "אני עובד כל יום." },
          { en: "She lives in Tel Aviv.", he: "היא גרה בתל אביב." },
          { en: "They don't like coffee.", he: "הם לא אוהבים קפה." },
          { en: "Does he speak English?", he: "האם הוא מדבר אנגלית?" },
        ],
        tip: "He/She/It always gets -s: 'he goes', 'she watches', 'it costs'",
        common_mistakes: ["❌ She work here → ✅ She works here", "❌ He don't know → ✅ He doesn't know"],
      },
      {
        id: "a1-to-be",
        title: "Verb 'To Be'",
        subtitle: "הפועל 'להיות'",
        explanation: "The most basic English verb. Changes form depending on who is doing the action.",
        structure: "I am | You are | He/She/It is | We/They are",
        examples: [
          { en: "I am a student.", he: "אני סטודנט." },
          { en: "She is very kind.", he: "היא מאוד אדיבה." },
          { en: "Are you tired?", he: "האם אתה עייף?" },
          { en: "They are not here.", he: "הם לא כאן." },
        ],
        tip: "Short forms: I'm, You're, He's, She's, It's, We're, They're",
        common_mistakes: ["❌ She is a good student, isn't? → ✅ She is a good student, isn't she?"],
      },
      {
        id: "a1-articles",
        title: "Articles: a / an / the",
        subtitle: "כתיבת ה״יידוע״",
        explanation: "'A/An' for new or unspecific things. 'The' for specific or already mentioned things.",
        structure: "a + consonant sound | an + vowel sound (a,e,i,o,u) | the + specific",
        examples: [
          { en: "I have a car.", he: "יש לי מכונית (כלשהי)." },
          { en: "She is an engineer.", he: "היא מהנדסת." },
          { en: "The car is blue.", he: "המכונית (הספציפית) כחולה." },
          { en: "I ate an apple.", he: "אכלתי תפוח." },
        ],
        tip: "Use 'an' before vowel sounds: an hour (silent h), an honest person",
        common_mistakes: ["❌ She is a engineer → ✅ She is an engineer"],
      },
      {
        id: "a1-there-is",
        title: "There is / There are",
        subtitle: "יש / ישנם",
        explanation: "Use 'there is' for singular and 'there are' for plural to say something exists.",
        structure: "There is + singular | There are + plural",
        examples: [
          { en: "There is a bank near here.", he: "יש בנק כאן קרוב." },
          { en: "There are three students.", he: "יש שלושה תלמידים." },
          { en: "Is there a toilet?", he: "האם יש שירותים?" },
          { en: "There aren't any shops.", he: "אין חנויות." },
        ],
        tip: "In questions: 'Is there...?' / 'Are there...?'",
      },
    ],
  },
  {
    level: "A2",
    rules: [
      {
        id: "a2-past-simple",
        title: "Past Simple",
        subtitle: "עבר פשוט",
        explanation: "Used for completed actions in the past. Regular verbs add -ed. Many common verbs are irregular.",
        structure: "Subject + verb(past) | did not + verb | Did + subject + verb?",
        examples: [
          { en: "I worked yesterday.", he: "עבדתי אתמול." },
          { en: "She went to the market.", he: "היא הלכה לשוק." },
          { en: "Did you see the film?", he: "האם ראית את הסרט?" },
          { en: "He didn't come to class.", he: "הוא לא הגיע לשיעור." },
        ],
        tip: "Common irregulars: go→went, see→saw, buy→bought, come→came, have→had",
        common_mistakes: ["❌ She didn't went → ✅ She didn't go", "❌ Did he went? → ✅ Did he go?"],
      },
      {
        id: "a2-present-continuous",
        title: "Present Continuous",
        subtitle: "הווה ממשיך",
        explanation: "Used for actions happening RIGHT NOW or temporary situations.",
        structure: "Subject + am/is/are + verb-ing",
        examples: [
          { en: "I am studying English now.", he: "אני לומד אנגלית עכשיו." },
          { en: "She is cooking dinner.", he: "היא מבשלת ארוחת ערב." },
          { en: "They are not watching TV.", he: "הם לא צופים בטלוויזיה." },
          { en: "What are you doing?", he: "מה אתה עושה?" },
        ],
        tip: "Some verbs don't use -ing: know, like, love, hate, want, need, understand",
        common_mistakes: ["❌ I am knowing → ✅ I know", "❌ She is having a car → ✅ She has a car"],
      },
      {
        id: "a2-future-going-to",
        title: "Going to (Future)",
        subtitle: "עתיד עם going to",
        explanation: "Used for plans and intentions you have already decided on.",
        structure: "Subject + am/is/are + going to + verb",
        examples: [
          { en: "I am going to visit London.", he: "אני הולך לבקר בלונדון." },
          { en: "She is going to study medicine.", he: "היא הולכת ללמוד רפואה." },
          { en: "Are you going to come?", he: "האם אתה הולך לבוא?" },
          { en: "It's going to rain.", he: "עומד לרדת גשם." },
        ],
        tip: "Use 'going to' for plans. Use 'will' for spontaneous decisions.",
      },
      {
        id: "a2-comparatives",
        title: "Comparatives & Superlatives",
        subtitle: "השוואה",
        explanation: "Compare two things with -er/more. Show the extreme with -est/most.",
        structure: "adj+er than | more adj than | the adj+est | the most adj",
        examples: [
          { en: "He is taller than his brother.", he: "הוא גבוה יותר מאחיו." },
          { en: "This is more expensive.", he: "זה יקר יותר." },
          { en: "She is the smartest in class.", he: "היא החכמה ביותר בכיתה." },
          { en: "It is the most beautiful city.", he: "זאת העיר היפה ביותר." },
        ],
        tip: "Short words (1 syllable): tall→taller→tallest. Long words: beautiful→more beautiful→most beautiful",
        common_mistakes: ["❌ more taller → ✅ taller", "❌ She is more tall → ✅ She is taller"],
      },
    ],
  },
  {
    level: "B1",
    rules: [
      {
        id: "b1-present-perfect",
        title: "Present Perfect",
        subtitle: "הווה מושלם",
        explanation: "Connects the past to the present. Used for experiences, recent events, or unfinished situations.",
        structure: "Subject + have/has + past participle",
        examples: [
          { en: "I have visited Paris.", he: "ביקרתי בפריז (בחיים שלי)." },
          { en: "She has just left.", he: "היא זה עתה יצאה." },
          { en: "Have you ever tried sushi?", he: "האם אי פעם ניסית סושי?" },
          { en: "I haven't finished yet.", he: "עוד לא סיימתי." },
        ],
        tip: "ever/never/already/just/yet/since/for → usually Present Perfect",
        common_mistakes: ["❌ I have went → ✅ I have gone", "❌ Did you ever visit? → ✅ Have you ever visited?"],
      },
      {
        id: "b1-modal-verbs",
        title: "Modal Verbs",
        subtitle: "פעלי עזר מודאליים",
        explanation: "Modals add meaning like ability, possibility, obligation, or advice. They never change form.",
        structure: "Subject + modal + verb (base form)",
        examples: [
          { en: "You should study more.", he: "אתה צריך ללמוד יותר." },
          { en: "She can speak French.", he: "היא יכולה לדבר צרפתית." },
          { en: "You must wear a seatbelt.", he: "אתה חייב לחגור חגורה." },
          { en: "It might rain later.", he: "אולי ירד גשם מאוחר יותר." },
        ],
        tip: "can=ability | should=advice | must=strong obligation | might/may=possibility",
        common_mistakes: ["❌ She cans swim → ✅ She can swim", "❌ You should to go → ✅ You should go"],
      },
      {
        id: "b1-first-conditional",
        title: "First Conditional",
        subtitle: "תנאי ראשון (עתיד אפשרי)",
        explanation: "For real and possible future situations. If something happens, something else will happen.",
        structure: "If + present simple, will + verb",
        examples: [
          { en: "If it rains, I will stay home.", he: "אם ירד גשם, אשאר בבית." },
          { en: "If you study, you will pass.", he: "אם תלמד, תעבור." },
          { en: "I will call if I'm late.", he: "אתקשר אם אאחר." },
        ],
        tip: "The 'if' clause uses present simple, NOT future: 'If it will rain' ❌ → 'If it rains' ✅",
        common_mistakes: ["❌ If it will rain, I will stay → ✅ If it rains, I will stay"],
      },
      {
        id: "b1-passive",
        title: "Passive Voice",
        subtitle: "גוף סביל",
        explanation: "When the action is more important than who does it, or when we don't know who did it.",
        structure: "Subject + be (correct tense) + past participle",
        examples: [
          { en: "The window was broken.", he: "החלון נשבר." },
          { en: "English is spoken here.", he: "אנגלית מדוברת כאן." },
          { en: "The letter was sent yesterday.", he: "המכתב נשלח אתמול." },
          { en: "This building was built in 1900.", he: "הבניין הזה נבנה ב-1900." },
        ],
        tip: "Active: 'Someone stole my bag' → Passive: 'My bag was stolen'",
      },
    ],
  },
  {
    level: "B2",
    rules: [
      {
        id: "b2-past-perfect",
        title: "Past Perfect",
        subtitle: "עבר מושלם",
        explanation: "Used for an action that happened BEFORE another past action. 'The earlier past'.",
        structure: "Subject + had + past participle",
        examples: [
          { en: "She had already eaten when I arrived.", he: "היא כבר אכלה כשהגעתי." },
          { en: "I hadn't met him before.", he: "לא הכרתי אותו קודם." },
          { en: "By the time he came, we had finished.", he: "עד שהגיע, סיימנו." },
        ],
        tip: "Often used with: already, just, never, before, by the time, when",
        common_mistakes: ["❌ When I arrived she already ate → ✅ When I arrived she had already eaten"],
      },
      {
        id: "b2-second-conditional",
        title: "Second Conditional",
        subtitle: "תנאי שני (בלתי אפשרי/היפותטי)",
        explanation: "For imaginary or unlikely situations in the present/future.",
        structure: "If + past simple, would + verb",
        examples: [
          { en: "If I were rich, I would travel the world.", he: "אם הייתי עשיר, הייתי מטייל בעולם." },
          { en: "What would you do if you won the lottery?", he: "מה היית עושה אם זכית בלוטו?" },
          { en: "She would be happier if she had more free time.", he: "היא הייתה מאושרת יותר אם היה לה יותר זמן חופשי." },
        ],
        tip: "Use 'were' (not 'was') after I/he/she in formal writing: 'If I were you...'",
        common_mistakes: ["❌ If I would be rich → ✅ If I were rich", "❌ I would buy if I have money → ✅ I would buy if I had money"],
      },
      {
        id: "b2-reported-speech",
        title: "Reported Speech",
        subtitle: "דיבור עקיף",
        explanation: "When you report what someone said — verbs shift back in time.",
        structure: "He said (that) + past tense shift",
        examples: [
          { en: "\"I am tired\" → She said she was tired.", he: "\"אני עייפה\" → היא אמרה שהיא עייפה." },
          { en: "\"I will call\" → He said he would call.", he: "\"אתקשר\" → הוא אמר שיתקשר." },
          { en: "\"I have finished\" → She said she had finished.", he: "היא אמרה שסיימה." },
        ],
        tip: "Tense shifts: is→was, will→would, have→had, can→could, am→was",
        common_mistakes: ["❌ He said he will come → ✅ He said he would come"],
      },
      {
        id: "b2-relative-clauses",
        title: "Relative Clauses",
        subtitle: "משפטי זיקה",
        explanation: "Give extra information about a noun. Defining clauses (no comma) or non-defining (with comma).",
        structure: "who (person) | which/that (thing) | where (place) | whose (possession)",
        examples: [
          { en: "The man who lives next door is a doctor.", he: "האיש שגר לצד הוא רופא." },
          { en: "The book that I read was amazing.", he: "הספר שקראתי היה מדהים." },
          { en: "This is the city where I grew up.", he: "זאת העיר שגדלתי בה." },
          { en: "She is the woman whose car was stolen.", he: "היא האישה שהמכונית שלה נגנבה." },
        ],
        tip: "In defining clauses, 'that' can replace 'who' or 'which'. Never use 'what' as a relative pronoun!",
        common_mistakes: ["❌ The man what called → ✅ The man who called"],
      },
    ],
  },
  {
    level: "C1",
    rules: [
      {
        id: "c1-third-conditional",
        title: "Third Conditional",
        subtitle: "תנאי שלישי (עבר דמיוני)",
        explanation: "For imaginary past situations and their imaginary results. Often used for regret.",
        structure: "If + past perfect, would have + past participle",
        examples: [
          { en: "If I had studied, I would have passed.", he: "אם הייתי לומד, הייתי עובר." },
          { en: "She wouldn't have been late if she had left earlier.", he: "היא לא הייתה מאחרת אם יצאה מוקדם יותר." },
          { en: "If he had called, I would have answered.", he: "אם התקשר, הייתי עונה." },
        ],
        tip: "Third conditional = 100% impossible (past can't be changed). 'If I had known...'",
        common_mistakes: ["❌ If I would have known → ✅ If I had known"],
      },
      {
        id: "c1-inversion",
        title: "Inversion",
        subtitle: "היפוך סדר מילים",
        explanation: "For emphasis, negative adverbs at the start of a sentence trigger subject-verb inversion.",
        structure: "Negative adverb + auxiliary + subject + verb",
        examples: [
          { en: "Never have I seen such beauty.", he: "מעולם לא ראיתי יופי כזה." },
          { en: "Hardly had I arrived when it started raining.", he: "בקושי הגעתי כשהתחיל לרדת גשם." },
          { en: "Not only did she win, she broke the record.", he: "לא רק שהיא ניצחה, היא שברה את השיא." },
        ],
        tip: "Common inversion triggers: Never, Rarely, Hardly, Seldom, Not only, No sooner",
      },
      {
        id: "c1-mixed-conditional",
        title: "Mixed Conditionals",
        subtitle: "תנאים מעורבים",
        explanation: "Combining 2nd and 3rd conditionals when the time frame is different.",
        structure: "If + past perfect (past), would + verb (present result)",
        examples: [
          { en: "If I had studied medicine, I would be a doctor now.", he: "אם למדתי רפואה, הייתי רופא עכשיו." },
          { en: "If she weren't so busy, she would have called.", he: "אם לא הייתה עסוקה כל כך, הייתה מתקשרת." },
        ],
        tip: "Past cause → present result: 'If I had worked harder (past), I would have a better job now (present)'",
      },
      {
        id: "c1-cleft",
        title: "Cleft Sentences",
        subtitle: "משפטי הדגשה",
        explanation: "Used to emphasize a specific part of a sentence: 'It is/was...that/who'",
        structure: "It is/was + emphasis + that/who + rest of sentence",
        examples: [
          { en: "It was John who broke the window.", he: "זה היה ג'ון שהשבור את החלון (ולא מישהו אחר)." },
          { en: "It is hard work that leads to success.", he: "עבודה קשה היא שמובילה להצלחה." },
          { en: "What I need is a long holiday.", he: "מה שאני צריך זה חופשה ארוכה." },
        ],
        tip: "What-cleft: 'What I want is...' | It-cleft: 'It is X that...'",
      },
    ],
  },
  {
    level: "C2",
    rules: [
      {
        id: "c2-subjunctive",
        title: "Subjunctive Mood",
        subtitle: "נטיית העצה / הדרישה",
        explanation: "Used in formal/written English after verbs of suggestion, demand, or recommendation.",
        structure: "suggest/recommend/insist + that + subject + base verb (no -s)",
        examples: [
          { en: "I suggest that he apply immediately.", he: "אני מציע שיגיש מיידית (ולא 'applies')." },
          { en: "It is essential that she be informed.", he: "חיוני שתקבל מידע." },
          { en: "The committee recommended that the bill be passed.", he: "הוועדה המליצה שהצעת החוק תועבר." },
        ],
        tip: "The subjunctive uses the BASE form for all persons: 'it is vital that he be...' (not 'is')",
        common_mistakes: ["❌ I suggest that he applies → ✅ I suggest that he apply"],
      },
      {
        id: "c2-nominalization",
        title: "Nominalization",
        subtitle: "הפיכת פועל לשם עצם",
        explanation: "Turning verbs/adjectives into nouns makes writing more formal and concise.",
        structure: "verb/adj → noun form: decide→decision, assess→assessment",
        examples: [
          { en: "We decided → Our decision was...", he: "החלטנו → ההחלטה שלנו הייתה..." },
          { en: "The manager assessed → The manager's assessment...", he: "המנהל העריך → הערכת המנהל..." },
          { en: "They failed → Their failure...", he: "הם נכשלו → הכישלון שלהם..." },
        ],
        tip: "Common suffixes: -tion, -ment, -ance, -ence, -ity, -ness, -al",
      },
      {
        id: "c2-discourse-markers",
        title: "Advanced Discourse Markers",
        subtitle: "מילות קישור מתקדמות",
        explanation: "Sophisticated connectors that show complex logical relationships between ideas.",
        structure: "Various positions: sentence-initial, mid-sentence, or clause-final",
        examples: [
          { en: "Nevertheless, the results were positive.", he: "ובכל זאת, התוצאות היו חיוביות." },
          { en: "The proposal was, albeit flawed, innovative.", he: "ההצעה הייתה, למרות פגמיה, חדשנית." },
          { en: "Notwithstanding the difficulties, progress was made.", he: "על אף הקשיים, הושג התקדמות." },
          { en: "In so far as the data is reliable...", he: "במידה שהנתונים אמינים..." },
        ],
        tip: "C2 connectors: notwithstanding, albeit, insofar as, inasmuch as, consequently, hitherto",
      },
    ],
  },
];

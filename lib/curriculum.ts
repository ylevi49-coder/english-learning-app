import { Lesson, LevelInfo, CEFRLevel } from "@/types";

export const LEVEL_INFO: LevelInfo[] = [
  {
    level: "A1",
    name: "Beginner",
    description: "Basic phrases, introductions, and everyday expressions",
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    totalLessons: 10,
  },
  {
    level: "A2",
    name: "Elementary",
    description: "Simple conversations about family, shopping, and daily routines",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    totalLessons: 10,
  },
  {
    level: "B1",
    name: "Intermediate",
    description: "Describe experiences, events, dreams, and briefly explain opinions",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    totalLessons: 12,
  },
  {
    level: "B2",
    name: "Upper-Intermediate",
    description: "Discuss complex topics, read articles, watch English TV shows",
    color: "text-indigo-700",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    totalLessons: 12,
  },
  {
    level: "C1",
    name: "Advanced",
    description: "Express ideas fluently, use language flexibly for academic purposes",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    totalLessons: 10,
  },
  {
    level: "C2",
    name: "Mastery",
    description: "Understand virtually everything, express yourself spontaneously",
    color: "text-rose-700",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    totalLessons: 10,
  },
];

export const LESSONS: Lesson[] = [
  // ─── A1 ───────────────────────────────────────────────
  {
    id: "a1-1",
    level: "A1",
    unit: 1,
    title: "Hello & Introductions",
    description: "Learn to introduce yourself and greet others",
    vocabulary: [
      { id: "v1", word: "Hello", translation: "שלום", example: "Hello! My name is David." },
      { id: "v2", word: "Goodbye", translation: "להתראות", example: "Goodbye! See you tomorrow." },
      { id: "v3", word: "Please", translation: "בבקשה", example: "Can you help me, please?" },
      { id: "v4", word: "Thank you", translation: "תודה", example: "Thank you for your help." },
      { id: "v5", word: "Sorry", translation: "סליחה", example: "Sorry, I don't understand." },
      { id: "v6", word: "Yes / No", translation: "כן / לא", example: "Yes, I am a student. No, I'm not tired." },
    ],
    grammar: {
      title: "The Verb 'To Be' (am/is/are)",
      explanation: "We use 'am', 'is', 'are' to describe people and things.\n• I am → I'm\n• He/She/It is → He's / She's\n• You/We/They are → You're / We're / They're",
      examples: [
        "I am David. → I'm David.",
        "She is a teacher. → She's a teacher.",
        "We are from Israel. → We're from Israel.",
      ],
      tip: "Use contractions (I'm, you're) in everyday speech – they sound more natural!",
    },
    exercises: [
      {
        id: "e1",
        type: "multiple_choice",
        question: "Complete: ___ name is Sarah.",
        options: ["My", "I", "Am", "Is"],
        answer: "My",
        explanation: "We use 'My' as a possessive to talk about our name.",
      },
      {
        id: "e2",
        type: "multiple_choice",
        question: "Which is correct?",
        options: ["She am happy.", "She are happy.", "She is happy.", "She be happy."],
        answer: "She is happy.",
        explanation: "With He/She/It we always use 'is'.",
      },
      {
        id: "e3",
        type: "fill_blank",
        question: "I ___ a student from Israel.",
        answer: "am",
        explanation: "With 'I', we always use 'am'.",
      },
      {
        id: "e4",
        type: "true_false",
        question: "'They is happy.' is correct English.",
        options: ["True", "False"],
        answer: "False",
        explanation: "With 'they' we use 'are': They ARE happy.",
      },
      {
        id: "e5",
        type: "reorder_words",
        question: "Arrange the words: [name / My / is / Tom]",
        answer: "My name is Tom",
        explanation: "The subject (My name) comes first, then the verb (is), then the complement (Tom).",
      },
    ],
  },
  {
    id: "a1-2",
    level: "A1",
    unit: 2,
    title: "Numbers & Colors",
    description: "Count from 1-100 and name basic colors",
    vocabulary: [
      { id: "v10", word: "One, Two, Three", translation: "אחד, שניים, שלושה", example: "I have two cats and three dogs." },
      { id: "v11", word: "Red", translation: "אדום", example: "The apple is red." },
      { id: "v12", word: "Blue", translation: "כחול", example: "The sky is blue." },
      { id: "v13", word: "Green", translation: "ירוק", example: "The grass is green." },
      { id: "v14", word: "Yellow", translation: "צהוב", example: "The sun is yellow." },
      { id: "v15", word: "Big / Small", translation: "גדול / קטן", example: "An elephant is big. A mouse is small." },
    ],
    grammar: {
      title: "Adjectives Before Nouns",
      explanation: "In English, adjectives always come BEFORE the noun.\n• a red car (not: a car red)\n• a big house (not: a house big)",
      examples: [
        "I have a blue pen.",
        "She lives in a small house.",
        "He drives a big red car.",
      ],
      tip: "Unlike Hebrew, English adjectives never change for gender or plural!",
    },
    exercises: [
      {
        id: "e10",
        type: "multiple_choice",
        question: "Which is correct English?",
        options: ["a car red", "a red car", "car a red", "red car a"],
        answer: "a red car",
        explanation: "In English, the adjective comes before the noun.",
      },
      {
        id: "e11",
        type: "fill_blank",
        question: "The sky is ___. (color)",
        answer: "blue",
      },
      {
        id: "e12",
        type: "multiple_choice",
        question: "How do you say 'כלב גדול' in English?",
        options: ["a dog big", "big a dog", "a big dog", "dog big a"],
        answer: "a big dog",
      },
    ],
  },
  {
    id: "a1-3",
    level: "A1",
    unit: 3,
    title: "Family & People",
    description: "Describe your family and talk about people",
    vocabulary: [
      { id: "v20", word: "Mother / Father", translation: "אמא / אבא", example: "My mother is a doctor." },
      { id: "v21", word: "Brother / Sister", translation: "אח / אחות", example: "I have one brother and two sisters." },
      { id: "v22", word: "Husband / Wife", translation: "בעל / אישה", example: "My husband is very kind." },
      { id: "v23", word: "Son / Daughter", translation: "בן / בת", example: "We have a son and a daughter." },
      { id: "v24", word: "Friend", translation: "חבר/ה", example: "She is my best friend." },
      { id: "v25", word: "Old / Young", translation: "זקן / צעיר", example: "My grandfather is old. My sister is young." },
    ],
    grammar: {
      title: "Possessive Adjectives",
      explanation: "We use possessive adjectives to show belonging:\n• I → my\n• You → your\n• He → his\n• She → her\n• We → our\n• They → their",
      examples: [
        "This is my family.",
        "What is your name?",
        "His wife is a teacher.",
        "Her brother lives in Tel Aviv.",
      ],
      tip: "Note: 'his' is for males, 'her' is for females. Hebrew uses שלו/שלה the same way!",
    },
    exercises: [
      {
        id: "e20",
        type: "multiple_choice",
        question: "Sarah has a cat. ___ cat is white.",
        options: ["His", "Her", "My", "Our"],
        answer: "Her",
        explanation: "Sarah is female, so we use 'her'.",
      },
      {
        id: "e21",
        type: "fill_blank",
        question: "I love ___ family very much.",
        answer: "my",
      },
      {
        id: "e22",
        type: "multiple_choice",
        question: "David and I are married. ___ children are 5 and 8.",
        options: ["My", "His", "Her", "Our"],
        answer: "Our",
      },
    ],
  },

  // ─── A2 ───────────────────────────────────────────────
  {
    id: "a2-1",
    level: "A2",
    unit: 1,
    title: "Daily Routines",
    description: "Talk about what you do every day",
    vocabulary: [
      { id: "v30", word: "Wake up", translation: "להתעורר", example: "I wake up at 7 every morning." },
      { id: "v31", word: "Have breakfast", translation: "לאכול ארוחת בוקר", example: "We have breakfast together." },
      { id: "v32", word: "Go to work", translation: "ללכת לעבודה", example: "She goes to work by bus." },
      { id: "v33", word: "Come home", translation: "לחזור הביתה", example: "He comes home at 6 pm." },
      { id: "v34", word: "Cook dinner", translation: "לבשל ארוחת ערב", example: "I cook dinner on weekdays." },
      { id: "v35", word: "Go to bed", translation: "ללכת לישון", example: "The children go to bed at 9." },
    ],
    grammar: {
      title: "Simple Present Tense",
      explanation: "We use the simple present for habits and routines.\n• I/You/We/They: base form → I work, you eat\n• He/She/It: add -s/-es → He works, She eats\n\nNegative: don't / doesn't\n• I don't like coffee.\n• She doesn't watch TV.",
      examples: [
        "I wake up at 7 every day.",
        "She drinks coffee in the morning.",
        "They don't eat meat.",
        "He doesn't use social media.",
      ],
      tip: "Remember the -s for he/she/it! This is one of the most common mistakes.",
    },
    exercises: [
      {
        id: "e30",
        type: "multiple_choice",
        question: "She ___ to work every day.",
        options: ["go", "goes", "going", "gone"],
        answer: "goes",
        explanation: "She = he/she/it → add -s/-es to the verb.",
      },
      {
        id: "e31",
        type: "fill_blank",
        question: "They ___ (not/eat) breakfast at home.",
        answer: "don't eat",
      },
      {
        id: "e32",
        type: "multiple_choice",
        question: "My husband ___ home at 6 pm.",
        options: ["come", "comes", "coming", "is come"],
        answer: "comes",
      },
      {
        id: "e33",
        type: "true_false",
        question: "'He don't like coffee' is correct.",
        options: ["True", "False"],
        answer: "False",
        explanation: "With he/she/it we use DOESN'T: He doesn't like coffee.",
      },
    ],
  },
  {
    id: "a2-2",
    level: "A2",
    unit: 2,
    title: "Shopping & Money",
    description: "Buy things, ask prices, and understand receipts",
    vocabulary: [
      { id: "v40", word: "How much does it cost?", translation: "כמה זה עולה?", example: "Excuse me, how much does this shirt cost?" },
      { id: "v41", word: "Expensive / Cheap", translation: "יקר / זול", example: "This restaurant is expensive. Let's find a cheaper one." },
      { id: "v42", word: "I'd like to buy...", translation: "אני רוצה לקנות...", example: "I'd like to buy two tickets, please." },
      { id: "v43", word: "Pay / Cash / Card", translation: "לשלם / מזומן / כרטיס", example: "Can I pay by card?" },
      { id: "v44", word: "Receipt", translation: "קבלה", example: "Can I have a receipt, please?" },
      { id: "v45", word: "Sale / Discount", translation: "מכירה / הנחה", example: "There's a 20% discount this week." },
    ],
    grammar: {
      title: "Can / Can't for Ability and Permission",
      explanation: "We use 'can' to say what is possible or allowed.\n• Can + base verb (no 's'!)\n• Can you speak English?\n• I can't find my wallet.\n• You can pay by card here.",
      examples: [
        "Can I help you?",
        "She can speak three languages.",
        "We can't afford this car.",
        "Can you give me a discount?",
      ],
      tip: "'Can' never changes – no can's, no canning. It's always just 'can'!",
    },
    exercises: [
      {
        id: "e40",
        type: "multiple_choice",
        question: "___ I pay by credit card?",
        options: ["Do", "Am", "Can", "Have"],
        answer: "Can",
      },
      {
        id: "e41",
        type: "fill_blank",
        question: "This jacket is too expensive. I ___ afford it.",
        answer: "can't",
      },
      {
        id: "e42",
        type: "multiple_choice",
        question: "How much ___ this cost?",
        options: ["does", "do", "is", "are"],
        answer: "does",
      },
    ],
  },

  // ─── B1 ───────────────────────────────────────────────
  {
    id: "b1-1",
    level: "B1",
    unit: 1,
    title: "Talking About the Past",
    description: "Share stories and past experiences using the past tense",
    vocabulary: [
      { id: "v50", word: "Yesterday / Last week", translation: "אתמול / שבוע שעבר", example: "Yesterday I visited my parents." },
      { id: "v51", word: "Ago", translation: "לפני (זמן)", example: "I moved to this city two years ago." },
      { id: "v52", word: "Used to", translation: "נהגתי ל- / פעם היה לי", example: "I used to play football every weekend." },
      { id: "v53", word: "Suddenly", translation: "פתאום", example: "Suddenly the power went out." },
      { id: "v54", word: "Eventually", translation: "בסופו של דבר", example: "Eventually we found a great restaurant." },
      { id: "v55", word: "Memorable", translation: "בלתי נשכח", example: "It was a truly memorable trip." },
    ],
    grammar: {
      title: "Simple Past Tense",
      explanation: "Use simple past for completed actions in the past.\n\nRegular verbs: verb + -ed\n• work → worked\n• play → played\n• live → lived\n\nIrregular verbs (must memorize!):\n• go → went\n• eat → ate\n• see → saw\n• have → had\n• buy → bought\n\nNegative: didn't + base verb\nQuestion: Did + subject + base verb?",
      examples: [
        "We visited Tel Aviv last summer.",
        "She didn't eat breakfast this morning.",
        "Did you see that movie?",
        "I went to the market and bought fresh vegetables.",
      ],
      tip: "With 'didn't', always use the BASE form: 'I didn't go' (NOT 'I didn't went').",
    },
    exercises: [
      {
        id: "e50",
        type: "multiple_choice",
        question: "Last night I ___ a great film.",
        options: ["see", "saw", "seen", "seeing"],
        answer: "saw",
        explanation: "'see' is irregular: see → saw → seen",
      },
      {
        id: "e51",
        type: "fill_blank",
        question: "She ___ (not/come) to the party yesterday.",
        answer: "didn't come",
      },
      {
        id: "e52",
        type: "multiple_choice",
        question: "___ you enjoy your holiday?",
        options: ["Do", "Did", "Were", "Have"],
        answer: "Did",
      },
      {
        id: "e53",
        type: "reorder_words",
        question: "Arrange: [bought / new / We / a / car / last / year]",
        answer: "We bought a new car last year",
      },
    ],
    readingText: `My Best Holiday\n\nLast summer, my wife and I decided to take a trip to Italy. We flew from Tel Aviv to Rome and stayed there for five days.\n\nOn the first day, we visited the Colosseum. It was absolutely amazing – I couldn't believe how old it was. We took hundreds of photos!\n\nThe food was incredible. We ate pasta and pizza every day and drank excellent coffee every morning. My wife found a small restaurant near our hotel that became our favourite place.\n\nOn the last day, it suddenly started to rain. We weren't prepared, but we found a lovely café and spent two hours drinking hot chocolate and talking. Eventually, the rain stopped and we walked back to the hotel.\n\nIt was a truly memorable trip. I think about it often.`,
  },
  {
    id: "b1-2",
    level: "B1",
    unit: 2,
    title: "Plans & Future",
    description: "Talk about future plans and make predictions",
    vocabulary: [
      { id: "v60", word: "Plan to / Intend to", translation: "מתכנן ל-", example: "We plan to visit London next year." },
      { id: "v61", word: "Probably / Definitely", translation: "כנראה / בהחלט", example: "It will probably rain tomorrow." },
      { id: "v62", word: "Hope / Expect", translation: "מקווה / מצפה", example: "I hope the weather will be nice." },
      { id: "v63", word: "Soon / Eventually", translation: "בקרוב / בסופו של דבר", example: "I'll finish this project soon." },
      { id: "v64", word: "Career / Promotion", translation: "קריירה / קידום", example: "She's hoping for a promotion next year." },
      { id: "v65", word: "Retire", translation: "לפרוש לגמלאות", example: "He wants to retire at 65." },
    ],
    grammar: {
      title: "Future: will vs. going to",
      explanation: "Two main ways to talk about the future:\n\n1. 'going to' – for plans already decided\n• We're going to visit my parents this weekend.\n• She's going to study medicine.\n\n2. 'will' – for predictions or decisions made right now\n• I think it will rain tomorrow.\n• Don't worry, I'll help you.\n\nShort forms: I'll, you'll, he'll, she'll, we'll, they'll\nNegative: won't (= will not)",
      examples: [
        "We're going to buy a new house. (already decided)",
        "I think electric cars will replace petrol cars. (prediction)",
        "I'll call you later. (decision made now)",
        "They won't be happy about this.",
      ],
      tip: "Not sure which to use? 'Going to' = you already planned it. 'Will' = you decide right now, or it's a prediction.",
    },
    exercises: [
      {
        id: "e60",
        type: "multiple_choice",
        question: "We ___ visit Paris next summer. (already booked!)",
        options: ["will", "'re going to", "are", "would"],
        answer: "'re going to",
        explanation: "Already planned/decided → 'going to'",
      },
      {
        id: "e61",
        type: "fill_blank",
        question: "I think the economy ___ improve next year. (prediction)",
        answer: "will",
      },
      {
        id: "e62",
        type: "multiple_choice",
        question: "A: 'I'm cold.' B: 'I ___ get you a blanket.' (decides now)",
        options: ["'m going to", "'ll", "would", "am"],
        answer: "'ll",
      },
    ],
  },

  // ─── B2 ───────────────────────────────────────────────
  {
    id: "b2-1",
    level: "B2",
    unit: 1,
    title: "Opinions & Arguments",
    description: "Express and defend opinions on complex topics",
    vocabulary: [
      { id: "v70", word: "In my opinion / I believe", translation: "לדעתי / אני מאמין/ת", example: "In my opinion, remote work increases productivity." },
      { id: "v71", word: "On the one hand... on the other hand", translation: "מצד אחד... מצד שני", example: "On the one hand, it saves time. On the other hand, it can be lonely." },
      { id: "v72", word: "Nevertheless / However", translation: "עם זאת / אך", example: "The plan is expensive. Nevertheless, it's worth it." },
      { id: "v73", word: "It's worth noting that", translation: "ראוי לציין ש-", example: "It's worth noting that the data is from 2020." },
      { id: "v74", word: "Controversial / Debatable", translation: "שנוי במחלוקת", example: "This is a highly controversial topic." },
      { id: "v75", word: "Evidence / Research suggests", translation: "ראיות / מחקר מראה", example: "Research suggests that exercise improves mental health." },
    ],
    grammar: {
      title: "Perfect Tenses",
      explanation: "Present Perfect: have/has + past participle\n→ Actions that started in the past and connect to now\n\n• I have lived in Israel for 10 years. (still living there)\n• She has just arrived. (very recent)\n• Have you ever been to London? (life experience)\n\nPast Perfect: had + past participle\n→ The earlier of two past actions\n\n• When I arrived, they had already left.\n• She had studied English before she moved abroad.",
      examples: [
        "I've never eaten sushi. Have you?",
        "We have been married for five years.",
        "By the time he called, I had already left.",
        "She hasn't finished her report yet.",
      ],
      tip: "Key words for Present Perfect: ever, never, already, yet, just, for, since",
    },
    exercises: [
      {
        id: "e70",
        type: "multiple_choice",
        question: "I ___ never ___ to Australia.",
        options: ["have/been", "had/been", "have/went", "did/go"],
        answer: "have/been",
      },
      {
        id: "e71",
        type: "fill_blank",
        question: "By the time we arrived, the film ___ already ___ (start).",
        answer: "had already started",
      },
      {
        id: "e72",
        type: "multiple_choice",
        question: "She ___ here since 2018.",
        options: ["is living", "has lived", "was living", "lived"],
        answer: "has lived",
        explanation: "'Since' with a time point → present perfect",
      },
    ],
    readingText: `The Future of Work\n\nThe way we work has changed dramatically over the past decade. The rise of remote work, accelerated by the global pandemic, has forced companies and employees to rethink traditional office culture.\n\nIn my opinion, this shift represents a genuine improvement for many workers. Research suggests that remote employees are often more productive and report higher job satisfaction. On the one hand, they save hours of commuting time each week. On the other hand, some people struggle with the isolation that comes from working at home.\n\nNevertheless, it's worth noting that not all jobs can be done remotely. Doctors, teachers, and factory workers, for example, must be physically present. The debate, therefore, is really about office-based jobs.\n\nA hybrid model – combining home and office work – has emerged as a popular compromise. Evidence from several large companies shows that employees who work flexibly are less likely to resign. However, managing hybrid teams remains a challenge that many organisations are still figuring out.`,
  },

  // ─── C1 ───────────────────────────────────────────────
  {
    id: "c1-1",
    level: "C1",
    unit: 1,
    title: "Academic & Professional English",
    description: "Master formal writing, presentations, and negotiations",
    vocabulary: [
      { id: "v80", word: "Substantiate / Corroborate", translation: "לאשש / לחזק", example: "The new data corroborates our initial findings." },
      { id: "v81", word: "Nuanced / Ambiguous", translation: "מורכב/מדוייק / דו-משמעי", example: "The policy has a nuanced impact on different social groups." },
      { id: "v82", word: "Leverage", translation: "למנף / להשתמש ב-", example: "We should leverage our existing relationships to close the deal." },
      { id: "v83", word: "Paramount / Pivotal", translation: "חשוב ביותר / מכריע", example: "Customer trust is paramount in this industry." },
      { id: "v84", word: "Pragmatic", translation: "פרגמטי / מעשי", example: "We need a pragmatic approach to solve this issue quickly." },
      { id: "v85", word: "Stipulate / Mandate", translation: "לקבוע / לחייב", example: "The contract stipulates a 30-day notice period." },
    ],
    grammar: {
      title: "Advanced Conditionals & Mixed Conditionals",
      explanation: "Mixed conditionals combine different time frames:\n\n1st Conditional (real/possible):\n• If it rains, I'll take an umbrella.\n\n2nd Conditional (unlikely/imaginary present):\n• If I were rich, I would travel more.\n\n3rd Conditional (impossible – past regret):\n• If I had studied harder, I would have passed.\n\nMixed (past condition → present result):\n• If I had taken that job, I would be living in London now.",
      examples: [
        "If the government had invested in education, the economy would be stronger now.",
        "Had I known about this opportunity, I would have applied immediately.",
        "Were I in your position, I'd negotiate a higher salary.",
      ],
      tip: "In formal English, you can invert conditionals: 'Had I known' = 'If I had known'. This sounds very sophisticated!",
    },
    exercises: [
      {
        id: "e80",
        type: "multiple_choice",
        question: "If I ___ the contract earlier, we ___ this problem now.",
        options: ["had read / wouldn't have", "had read / wouldn't be having", "read / won't have", "read / wouldn't have"],
        answer: "had read / wouldn't be having",
        explanation: "Mixed conditional: past condition → present result",
      },
      {
        id: "e81",
        type: "fill_blank",
        question: "___ I aware of the risks, I would have declined the offer. (formal inversion)",
        answer: "Had",
      },
    ],
  },

  // ─── C2 ───────────────────────────────────────────────
  {
    id: "c2-1",
    level: "C2",
    unit: 1,
    title: "Idioms, Nuance & Style",
    description: "Sound like a native: idioms, register, and stylistic precision",
    vocabulary: [
      { id: "v90", word: "Bite the bullet", translation: "לעצור שיניים / לשאת בכאב", example: "We'll have to bite the bullet and accept the budget cuts." },
      { id: "v91", word: "The elephant in the room", translation: "הפיל שבחדר", example: "Nobody mentioned the elephant in the room – the company is losing money." },
      { id: "v92", word: "A double-edged sword", translation: "חרב פיפיות", example: "Social media is a double-edged sword: it connects us but also isolates us." },
      { id: "v93", word: "Cut corners", translation: "לקצר דרכים / לעשות בזול", example: "They cut corners on safety, and now they're facing lawsuits." },
      { id: "v94", word: "Barking up the wrong tree", translation: "לחפש במקום הלא נכון", example: "If you think I took your keys, you're barking up the wrong tree." },
      { id: "v95", word: "Tongue-in-cheek", translation: "בגוזמה / בציניות קלה", example: "His comment about quitting was tongue-in-cheek – he loves this job." },
    ],
    grammar: {
      title: "Cleft Sentences & Emphasis",
      explanation: "Cleft sentences add emphasis and sophistication:\n\n• It + be + focus + relative clause\n'It was John who called me.' (not Sarah)\n'It was yesterday that it happened.' (not today)\n\n• What-cleft\n'What I love about English is its flexibility.'\n'What surprised me was his reaction.'\n\n• All + focus\n'All I want is a cup of tea.'\n'All she did was smile.'",
      examples: [
        "It was the ambiguity of the law that caused the dispute.",
        "What struck me most was the author's use of irony.",
        "It isn't money that motivates her – it's the challenge.",
        "All we need is a clear framework.",
      ],
      tip: "These structures are common in formal essays, speeches, and literary writing. They signal high-level language mastery.",
    },
    exercises: [
      {
        id: "e90",
        type: "multiple_choice",
        question: "Rewrite for emphasis: 'Her honesty surprised me most.'",
        options: [
          "It was her honesty that surprised me most.",
          "What surprised me most was her honesty.",
          "Both A and B are correct.",
          "Neither is correct.",
        ],
        answer: "Both A and B are correct.",
      },
      {
        id: "e91",
        type: "fill_blank",
        question: "___ I need right now is some quiet time.",
        answer: "What",
      },
    ],
  },
];

export function getLessonsByLevel(level: CEFRLevel): Lesson[] {
  return LESSONS.filter((l) => l.level === level);
}

export function getLessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

export function getLevelInfo(level: CEFRLevel): LevelInfo {
  return LEVEL_INFO.find((l) => l.level === level)!;
}

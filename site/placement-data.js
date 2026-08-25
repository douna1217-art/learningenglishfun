/* Reading placement quiz — level content.
   Each level is self-contained: a short original passage (not reused
   from any published book, so no student has an unfair head start),
   6 base questions (2 comprehension: literal + inferential; 2
   vocabulary-in-context; 2 grammar cloze), and 1 tie-breaker question
   used only when a student scores in the ambiguous middle (3-4 out of
   6) on the base questions. See placement.js for the adaptive logic.
   Correct-choice positions are rotated across A/B/C on purpose, so the
   test can't be gamed by always picking the same letter. */
window.PLACEMENT_LEVELS = [
  {
    grade: "Kindergarten",
    passage: "Sam has a red ball. The ball is round. Sam kicks the ball. The ball rolls to the dog. The dog runs after the ball. The dog brings the ball back to Sam.",
    questions: [
      {kind: "Literal", q: "What color is Sam's ball?", choices: ["Red", "Blue", "Green"], answer: 0},
      {kind: "Inferential", q: "Why does the dog run?", choices: ["To eat dinner", "To get the ball", "To hide"], answer: 1},
      {kind: "Vocabulary", q: "“Rolls” means the ball ___.", choices: ["Flies through the air", "Stays still", "Moves along the ground"], answer: 2},
      {kind: "Vocabulary", q: "“Kicks” means ___.", choices: ["Hits with a foot", "Throws with a hand", "Rolls slowly"], answer: 0},
      {kind: "Grammar", q: "“Sam kicks the ball, ___ it rolls to the dog.” Which word shows the result?", choices: ["but", "so", "or"], answer: 1},
      {kind: "Grammar", q: "“The dog runs after the ball ___ brings it back to Sam.” Which word joins these two actions?", choices: ["but", "or", "and"], answer: 2}
    ],
    tiebreak: {kind: "Tie-breaker", q: "What does the dog do at the end of the story?", choices: ["Brings the ball back to Sam", "Runs away forever", "Falls asleep"], answer: 0}
  },
  {
    grade: "Grade 1",
    passage: "Nina wanted to plant a garden behind her house. She dug five small holes in the dirt and dropped one seed into each one. Every morning, she poured a little water over the soil. After two weeks, tiny green sprouts pushed up through the ground.",
    questions: [
      {kind: "Literal", q: "How many holes did Nina dig?", choices: ["Two", "Five", "Ten"], answer: 1},
      {kind: "Inferential", q: "Why did Nina water the soil every morning?", choices: ["Because the ground was too hot", "Because her mom told her to clean it", "To help the seeds grow"], answer: 2},
      {kind: "Vocabulary", q: "“Sprouts” means ___.", choices: ["New little plants just starting to grow", "Fully grown trees", "Dead leaves"], answer: 0},
      {kind: "Vocabulary", q: "“Dropped” means ___.", choices: ["Threw far away", "Let fall gently", "Picked up"], answer: 1},
      {kind: "Grammar", q: "“Nina dug five small holes ___ dropped one seed into each one.” Which word joins these two actions?", choices: ["so", "but", "and"], answer: 2},
      {kind: "Grammar", q: "“She poured water every morning, ___ after two weeks, sprouts pushed up.” Which word shows the result?", choices: ["so", "and", "but"], answer: 0}
    ],
    tiebreak: {kind: "Tie-breaker", q: "How long did it take before Nina saw sprouts?", choices: ["One day", "Two weeks", "A whole year"], answer: 1}
  },
  {
    grade: "Grade 2",
    passage: "Every Saturday, Mia and her brother set up a small lemonade stand outside their house. They measured sugar, water, and lemon juice carefully so each cup would taste the same. One warm afternoon, a line of thirsty customers stretched down the sidewalk, and Mia had to mix a second pitcher before noon.",
    questions: [
      {kind: "Literal", q: "What did Mia and her brother sell?", choices: ["Sandwiches", "Ice cream", "Lemonade"], answer: 2},
      {kind: "Inferential", q: "Why did Mia need to mix a second pitcher?", choices: ["More customers showed up than she expected", "The first pitcher spilled", "Her brother drank it all"], answer: 0},
      {kind: "Vocabulary", q: "“Measured” means ___.", choices: ["Guessed without checking", "Checked a careful, exact amount", "Poured out completely"], answer: 1},
      {kind: "Vocabulary", q: "“Stretched” means ___.", choices: ["Shrank into a tiny space", "Stayed in one spot", "Extended out in a long line"], answer: 2},
      {kind: "Grammar", q: "“A line of customers stretched down the sidewalk, ___ Mia had to mix a second pitcher.” Which word shows the result?", choices: ["so", "but", "or"], answer: 0},
      {kind: "Grammar", q: "“They measured sugar, water, ___ lemon juice carefully.” Which word joins the last item in this list?", choices: ["so", "and", "but"], answer: 1}
    ],
    tiebreak: {kind: "Tie-breaker", q: "What can you tell about Mia from the story?", choices: ["She forgot to bring supplies", "She works alone every day", "She is careful and prepared"], answer: 2}
  },
  {
    grade: "Grade 3",
    passage: "When the school's fish tank started looking cloudy, Mr. Alvarez asked his class to investigate before changing anything. The students tested the water and discovered that the filter had been unplugged for nearly a week. Once they reconnected it, the pump began circulating clean water again, and within two days the tank looked clear.",
    questions: [
      {kind: "Literal", q: "What had happened to the filter?", choices: ["It had been unplugged for nearly a week", "It broke into pieces", "It was too small for the tank"], answer: 0},
      {kind: "Inferential", q: "Why did Mr. Alvarez ask the class to investigate before changing anything?", choices: ["Because he didn't know how to fix tanks", "So they could find the real cause instead of guessing", "Because the fish were in danger of dying immediately"], answer: 1},
      {kind: "Vocabulary", q: "“Circulating” means ___.", choices: ["Sitting completely still", "Leaking out of a container", "Moving continuously through something"], answer: 2},
      {kind: "Vocabulary", q: "“Reconnected” means ___.", choices: ["Joined or connected again", "Disconnected completely", "Broke apart"], answer: 0},
      {kind: "Grammar", q: "“The students tested the water ___ discovered that the filter had been unplugged.” Which word joins these two actions?", choices: ["but", "and", "so"], answer: 1},
      {kind: "Grammar", q: "“Once they reconnected it, the pump began circulating clean water again, ___ within two days the tank looked clear.” Which word shows the result?", choices: ["but", "because", "so"], answer: 2}
    ],
    tiebreak: {kind: "Tie-breaker", q: "How long did it take for the tank to look clear again?", choices: ["Two days", "One hour", "A month"], answer: 0}
  },
  {
    grade: "Grade 4",
    passage: "Desert plants survive in places where rain falls only a few times a year. A saguaro cactus, for example, has shallow roots that spread wide instead of growing deep, so it can absorb water quickly whenever a rare storm passes through. That water is stored in its thick, pleated stem, which slowly expands like an accordion. Because of this design, a full-grown saguaro can survive more than a year without a single drop of rain.",
    questions: [
      {kind: "Literal", q: "Where does a saguaro cactus store its water?", choices: ["In its flowers", "In its thick, pleated stem", "In the soil around it"], answer: 1},
      {kind: "Inferential", q: "Why do saguaro roots spread wide instead of growing deep?", choices: ["So the plant can grow taller", "Because deep soil is too rocky", "So they can quickly absorb water whenever it rains"], answer: 2},
      {kind: "Vocabulary", q: "“Absorb” means ___.", choices: ["To take in or soak up", "To push away", "To grow larger"], answer: 0},
      {kind: "Vocabulary", q: "“Pleated” means ___.", choices: ["Completely smooth and flat", "Folded into small ridges that can expand", "Made of a single thin layer"], answer: 1},
      {kind: "Grammar", q: "“Desert plants survive in places where rain falls only a few times a year, ___ they must store water efficiently.” Which word shows the result?", choices: ["but", "and", "so"], answer: 2},
      {kind: "Grammar", q: "“A saguaro's roots spread wide instead of growing deep, ___ it can absorb water quickly whenever a rare storm passes through.” Which word shows the result?", choices: ["so", "but", "because"], answer: 0}
    ],
    tiebreak: {kind: "Tie-breaker", q: "What does comparing the stem to an accordion help you understand?", choices: ["That the plant makes music", "That the stem expands and contracts to hold water", "That the stem is very heavy"], answer: 1}
  }
];

/* Rough reading-band label per recommended grade, for display only
   (books.js readingBand tags vary a little by subject, so this is a
   simple, consistent mapping just for the placement result card). */
window.PLACEMENT_BAND_FOR_GRADE = function(grade){
  if (/kindergarten/i.test(grade)) return "Early Reader";
  if (/grade\s*1/i.test(grade)) return "Beginning Reader";
  if (/grade\s*2/i.test(grade) || /grade\s*3/i.test(grade)) return "Growing Reader";
  return "Fluent Reader";
};

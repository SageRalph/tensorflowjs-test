const Judge = require("./judge.js");

main().catch(console.error);

async function main() {
  const testData = [
    [
      "I like my phone.",
      "Your cellphone looks great.",
      "Smartphones are very useful.",
      "How old are you?",
      "What is your age?",
      "An apple a day, keeps the doctors away.",
      "Eating strawberries is healthy.",
      "Math is hard",
    ],
    ["red", "red", "Red", "dark red", "green", "pink"],
    ["math", "maths", "mathematics", "English", "english", "drama"],
    ["earth", "water", "fire", "air"],
  ];

  // Generate score each batch of sentences
  for (batch of testData) {
    let scores = await Judge.score(batch);
    console.log("\n--------------------------------------------------------\n");
    console.log(scores);
  }
}

require("@tensorflow/tfjs");
const use = require("@tensorflow-models/universal-sentence-encoder");

/**
 * Static class for scoring similarity and identifying matches in arrays of strings.
 * Similarity is calculated as the dot product of Universal Sentence Encoder embeddings.
 */
class Judge {
  constructor() {}

  static model = use.load();

  /**
   * Generates similarity scores and match counts for an array of sentences.
   * Returns Object:
   * {
   *   text: [String],
   *   matches: [Int],
   *   similarity: [Float],
   *   mean: Float
   * }
   * similarity is the mean of the similarity of each sentence with all others,
   * mean is the mean of these mean similarity values (i.e. the global mean).
   *
   * @param {[String]} sentences
   * @param {Boolean=false} detail
   */
  static async score(sentences, detail = false) {
    // Wait for model if it's not ready yet
    const model = await Judge.model;

    // Generate embedding
    const emb = await model.embed(sentences);
    const embeddings = await emb.array();

    const results = {
      totals: {
        text: sentences,
        matches: [],
        similarity: [],
      },
    };

    // Calculate similarity of each response pair.
    for (let i = 0; i < embeddings.length; i++) {
      let scores = [];
      for (let j = 0; j < embeddings.length; j++) {
        scores.push(Judge._dotProduct(embeddings[i], embeddings[j]));
      }
      results[i] = {
        text: sentences[i],
        mean: Judge.mean(scores),
        similarity: scores,
      };
      results.totals.similarity.push(results[i].mean);
    }
    results.totals.mean = Judge.mean(results.totals.similarity);

    // Calculate number of matches for each response
    for (let i = 0; i < embeddings.length; i++) {
      let matches = results[i].similarity.map((s) => s >= results.totals.mean);
      results[i].matches = matches;
      results.totals.matches.push(matches.filter(Boolean).length);
    }

    if (!detail) return results.totals;
    return results;
  }

  /**
   * Calculate the mean of an array of numbers.
   */
  static mean = (array) => array.reduce((a, b) => a + b) / array.length;

  /**
   * Calculate the dot product of two vector arrays.
   */
  static _dotProduct = (xs, ys) => {
    const sum = (xs) => (xs ? xs.reduce((a, b) => a + b, 0) : undefined);
    return xs.length === ys.length
      ? sum(Judge._zipWith((a, b) => a * b, xs, ys))
      : undefined;
  };

  /**
   * zipWith :: (a -> b -> c) -> [a] -> [b] -> [c]
   */
  static _zipWith = (f, xs, ys) => {
    const ny = ys.length;
    return (xs.length <= ny ? xs : xs.slice(0, ny)).map((x, i) => f(x, ys[i]));
  };
}

module.exports = Judge;

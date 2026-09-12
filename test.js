import { cutUp, tokenize } from './cutup.js';

const testText = `The cat sat on the mat. The mat was dirty. The cat did not care.
Dogs are different. Dogs run fast. Dogs love to play.
Cats think they are superior. Cats nap frequently.`;

console.log('=== Original Text ===');
console.log(testText);
console.log('\n=== Testing Tokenization ===');

console.log('\nWords:');
const words = tokenize(testText, 'word');
console.log(`Found ${words.length} words`);
console.log(words.slice(0, 10).join(' '));

console.log('\nLines:');
const lines = tokenize(testText, 'line');
console.log(`Found ${lines.length} lines`);
lines.forEach((line, i) => console.log(`  ${i}: "${line}"`));

console.log('\nSentences:');
const sentences = tokenize(testText, 'sentence');
console.log(`Found ${sentences.length} sentences`);
sentences.forEach((sent, i) => console.log(`  ${i}: "${sent}"`));

console.log('\nSegments (4):');
const segments = tokenize(testText, 'segment', 4);
console.log(`Found ${segments.length} segments`);
segments.forEach((seg, i) => console.log(`  ${i}: "${seg.substring(0, 30)}..."`));

console.log('\n=== Testing Cut-Up Methods ===');

console.log('\n1. Quadrant Cut:');
const quadrant = cutUp(testText, 'quadrant', { segmentCount: 3 });
console.log(quadrant);

console.log('\n2. Fold-In:');
const foldIn = cutUp(testText, 'fold-in');
console.log(foldIn);

console.log('\n3. Line Shuffle:');
const lineShuffle = cutUp(testText, 'line-shuffle');
console.log(lineShuffle);

console.log('\n4. Sentence Shuffle:');
const sentenceShuffle = cutUp(testText, 'sentence-shuffle');
console.log(sentenceShuffle);

console.log('\n5. Word Scramble:');
const wordScramble = cutUp(testText, 'word-scramble');
console.log(wordScramble);

console.log('\n=== Validation ===');
function validateOutput(original, output, method) {
  const origWords = original.split(/\s+/).filter(w => w);
  const outputWords = output.split(/\s+/).filter(w => w);

  const allPresent = outputWords.every(word => {
    return origWords.some(orig => orig.includes(word) || word.includes(orig));
  });

  console.log(`${method}: ${allPresent ? '✓ PASS' : '✗ FAIL'} (${outputWords.length}/${origWords.length} word-like tokens)`);
}

validateOutput(testText, quadrant, 'Quadrant Cut');
validateOutput(testText, foldIn, 'Fold-In');
validateOutput(testText, lineShuffle, 'Line Shuffle');
validateOutput(testText, sentenceShuffle, 'Sentence Shuffle');
validateOutput(testText, wordScramble, 'Word Scramble');

console.log('\n=== Edge Cases ===');

console.log('Empty string:', cutUp('', 'word-scramble'));
console.log('Single word:', cutUp('hello', 'word-scramble'));
console.log('Single line:', cutUp('hello world', 'line-shuffle'));

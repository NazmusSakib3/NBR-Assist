import assert from "node:assert/strict";
import { chunkText, cosineSimilarity } from "../src/lib/ai/chunker";
import { formatAuthError } from "../src/lib/utils";
import { rateLimit } from "../src/lib/rate-limit";

function testChunker() {
  const chunks = chunkText("a".repeat(2000), 900, 120);
  assert.ok(chunks.length >= 2, "expected multiple chunks");
  assert.equal(chunks[0].length, 900);
}

function testCosine() {
  assert.equal(cosineSimilarity([1, 0], [1, 0]), 1);
  assert.equal(cosineSimilarity([1, 0], [0, 1]), 0);
}

function testAuthError() {
  const message = formatAuthError({
    formErrors: [],
    fieldErrors: { password: ["String must contain at least 8 character(s)"] },
  });
  assert.match(message, /password|8 character/i);
}

function testRateLimit() {
  const key = `test-${Date.now()}`;
  assert.equal(rateLimit(key, 2, 60_000).ok, true);
  assert.equal(rateLimit(key, 2, 60_000).ok, true);
  assert.equal(rateLimit(key, 2, 60_000).ok, false);
}

testChunker();
testCosine();
testAuthError();
testRateLimit();
console.log("All unit tests passed.");

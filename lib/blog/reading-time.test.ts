import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  countWords,
  formatReadingTime,
  readingTimeMinutes,
  stripHtml,
} from "./reading-time";

describe("stripHtml", () => {
  it("removes tags and keeps text", () => {
    assert.equal(stripHtml("<p>Hello <strong>world</strong></p>"), "Hello world");
  });

  it("drops <script> / <style> blocks whole", () => {
    assert.equal(stripHtml("<script>alert(1)</script><p>Hi</p>"), "Hi");
    assert.equal(stripHtml("<style>p{color:red}</style><p>Hi</p>"), "Hi");
  });

  it("decodes a small set of entities", () => {
    assert.equal(stripHtml("<p>A &amp; B&nbsp;C</p>"), "A & B C");
  });

  it("collapses whitespace", () => {
    assert.equal(stripHtml("<p>a</p>\n\n  <p>b   c</p>"), "a b c");
  });
});

describe("countWords", () => {
  it("is 0 for empty / whitespace", () => {
    assert.equal(countWords(""), 0);
    assert.equal(countWords("   "), 0);
  });

  it("counts whitespace-separated tokens", () => {
    assert.equal(countWords("a b  c"), 3);
  });
});

describe("readingTimeMinutes", () => {
  it("is at least 1 for empty input", () => {
    assert.equal(readingTimeMinutes(""), 1);
  });

  it("rounds words / 200", () => {
    assert.equal(readingTimeMinutes(`<p>${"word ".repeat(400)}</p>`), 2);
    assert.equal(readingTimeMinutes(`<p>${"word ".repeat(500)}</p>`), 3);
  });
});

describe("formatReadingTime", () => {
  it("formats the label", () => {
    assert.equal(formatReadingTime(5), "5 min read");
  });
});

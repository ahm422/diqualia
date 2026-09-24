import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { renderMarkdown, sanitizeHtml } from "./markdown";

describe("sanitizeHtml — TipTap editor output survives", () => {
  it("keeps underline / strikethrough tags", () => {
    const html = sanitizeHtml("<p><u>a</u> <s>b</s> <del>c</del></p>");
    assert.ok(html.includes("<u>"));
    assert.ok(html.includes("<s>"));
    assert.ok(html.includes("<del>"));
  });

  it("keeps a table with colspan / rowspan", () => {
    const html = sanitizeHtml(
      '<table><tbody><tr><th colspan="2">H</th></tr><tr><td rowspan="2">x</td><td>y</td></tr></tbody></table>',
    );
    assert.ok(html.includes("<table>"));
    assert.ok(html.includes('colspan="2"'));
    assert.ok(html.includes('rowspan="2"'));
  });

  it("keeps images with an https (R2) src", () => {
    const html = sanitizeHtml(
      '<img src="https://pub-abc.r2.dev/uploads/x.jpg" alt="x">',
    );
    assert.ok(html.includes('src="https://pub-abc.r2.dev/uploads/x.jpg"'));
  });

  it("adds rel=noopener to links", () => {
    const html = sanitizeHtml('<a href="https://example.com">x</a>');
    assert.ok(html.includes('rel="noopener noreferrer"'));
  });
});

describe("sanitizeHtml — dangerous input is stripped", () => {
  const cases: Array<[string, string]> = [
    ["<script>alert(1)</script>", "<script"],
    ['<u onclick="evil()">x</u>', "onclick"],
    ['<p style="color:red;background:url(https://evil/x)">x</p>', "url("],
    ['<a href="javascript:alert(1)">x</a>', "javascript:"],
    ['<img src="javascript:alert(1)">', "javascript:"],
    ["<iframe src=\"https://evil.example\"></iframe>", "<iframe"],
  ];
  for (const [input, mustNotContain] of cases) {
    it(`strips ${JSON.stringify(mustNotContain)} from ${JSON.stringify(input)}`, () => {
      const html = sanitizeHtml(input);
      assert.ok(!html.includes(mustNotContain), html);
    });
  }
});

describe("sanitizeHtml — inline style allowlist", () => {
  it("keeps a coloured span", () => {
    const html = sanitizeHtml('<span style="color:#caa84b">x</span>');
    assert.ok(html.includes("<span"));
    assert.ok(html.includes('style="color:#caa84b"'), html);
  });

  it("keeps a bare <mark>", () => {
    const html = sanitizeHtml("<p><mark>hi</mark></p>");
    assert.ok(html.includes("<mark>"), html);
  });

  it("keeps a highlighted <mark> background colour", () => {
    const html = sanitizeHtml('<mark style="background-color:#ffff00">hi</mark>');
    assert.ok(html.includes("background-color:#ffff00"), html);
  });

  it("keeps text-align on a block", () => {
    const html = sanitizeHtml('<p style="text-align:center">x</p>');
    assert.ok(html.includes("text-align:center"), html);
  });

  it("drops an invalid text-align value", () => {
    const html = sanitizeHtml('<h2 style="text-align:evil">x</h2>');
    assert.ok(!html.includes("text-align"), html);
    assert.ok(!html.includes("style="), html);
  });

  it("strips url() from a style value", () => {
    const html = sanitizeHtml('<span style="background-color:url(https://evil/x)">x</span>');
    assert.ok(!html.includes("url("), html);
    assert.ok(!html.includes("style="), html);
  });

  it("drops a value carrying !important", () => {
    const html = sanitizeHtml('<span style="color:red !important">x</span>');
    assert.ok(!html.includes("style="), html);
  });

  it("keeps only the allowlisted declaration from a chained style", () => {
    const html = sanitizeHtml('<span style="color:red;position:fixed;top:0">x</span>');
    assert.ok(html.includes("color:red"), html);
    assert.ok(!html.includes("position"), html);
    assert.ok(!html.includes("top:0"), html);
  });

  it("strips an event handler while keeping a valid sibling style", () => {
    const html = sanitizeHtml('<span onmouseover="x()" style="color:red">x</span>');
    assert.ok(!html.includes("onmouseover"), html);
    assert.ok(html.includes("color:red"), html);
  });

  it("round-trips a coloured span through renderMarkdown", () => {
    const html = renderMarkdown('<p><span style="color:#caa84b">x</span></p>');
    assert.ok(html.includes('style="color:#caa84b"'), html);
  });
});

describe("renderMarkdown — legacy Markdown still renders", () => {
  it("converts a Markdown string to sanitized HTML", () => {
    const html = renderMarkdown("# Title\n\nSome **bold** and a [link](https://x.com).");
    assert.ok(html.includes("<h1>"));
    assert.ok(html.includes("<strong>bold</strong>"));
    assert.ok(html.includes('href="https://x.com"'));
  });

  it("passes stored HTML through untouched (idempotent for editor output)", () => {
    const stored = "<h2>Heading</h2><p><u>u</u> <s>s</s></p>";
    const html = renderMarkdown(stored);
    assert.ok(html.includes("<h2>Heading</h2>"));
    assert.ok(html.includes("<u>u</u>"));
    assert.ok(html.includes("<s>s</s>"));
  });
});

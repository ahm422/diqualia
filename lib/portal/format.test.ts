import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { formatDate } from "./format";

describe("formatDate", () => {
  it("formats a Date as DD Mon YYYY (UTC)", () => {
    assert.equal(formatDate(new Date("2026-01-05T12:00:00Z")), "05 Jan 2026");
  });
  it("accepts an ISO string", () => {
    assert.equal(formatDate("2026-01-05T12:00:00Z"), "05 Jan 2026");
  });
  it("is stable just before UTC midnight", () => {
    assert.equal(formatDate("2026-01-05T23:59:00Z"), "05 Jan 2026");
  });
  it("returns an em dash for an invalid Date", () => {
    assert.equal(formatDate(new Date("nope")), "—");
  });
  it("returns an em dash for an empty string", () => {
    assert.equal(formatDate(""), "—");
  });
});

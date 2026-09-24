import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  STATUS_FALLBACK,
  STATUS_META,
  type PortalStatus,
  type StepState,
  statusMeta,
  stepFromStatus,
} from "./status";

describe("STATUS_META", () => {
  const cases: Array<[PortalStatus, string, string]> = [
    ["new", "Submitted", "neutral"],
    ["reviewing", "In review", "progress"],
    ["hired", "Hired", "positive"],
    ["rejected", "Not selected", "negative"],
  ];
  for (const [status, label, tone] of cases) {
    it(`${status} -> ${label} / ${tone}`, () => {
      assert.deepEqual(STATUS_META[status], { label, tone });
    });
  }
});

describe("statusMeta", () => {
  it("resolves a known status", () => {
    assert.deepEqual(statusMeta("hired"), { label: "Hired", tone: "positive" });
  });
  it("falls back for an unknown status", () => {
    assert.deepEqual(statusMeta("bogus"), STATUS_FALLBACK);
  });
});

describe("stepFromStatus", () => {
  const cases: Array<[string, StepState]> = [
    ["new", { activeIndex: 0, complete: false, finalTone: "neutral", finalLabel: "Decision" }],
    ["reviewing", { activeIndex: 1, complete: false, finalTone: "neutral", finalLabel: "Decision" }],
    ["hired", { activeIndex: 2, complete: true, finalTone: "positive", finalLabel: "Hired" }],
    ["rejected", { activeIndex: 2, complete: true, finalTone: "negative", finalLabel: "Not selected" }],
    ["bogus", { activeIndex: 0, complete: false, finalTone: "neutral", finalLabel: "Decision" }],
  ];
  for (const [status, expected] of cases) {
    it(`${status} -> step ${expected.activeIndex}`, () => {
      assert.deepEqual(stepFromStatus(status), expected);
    });
  }
});

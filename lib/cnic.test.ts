import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  CNIC_INPUT_RE,
  cnicLast4,
  formatCnic,
  formatCnicInput,
  maskCnic,
  normalizeCnic,
} from "./cnic";

describe("formatCnicInput", () => {
  const cases: Array<[string, string]> = [
    ["", ""],
    ["abc12345", "12345"],
    ["12345", "12345"],
    ["123451234567", "12345-1234567"],
    ["1234512345678", "12345-1234567-8"],
    ["12345123456789", "12345-1234567-8"], // 14th digit dropped
    ["12345-1234567-8", "12345-1234567-8"], // already dashed -> unchanged
    ["3720", "3720"],
    ["123451", "12345-1"],
  ];
  for (const [input, expected] of cases) {
    it(`${JSON.stringify(input)} -> ${JSON.stringify(expected)}`, () => {
      assert.equal(formatCnicInput(input), expected);
    });
  }

  it("is idempotent", () => {
    const once = formatCnicInput("123451234567899");
    assert.equal(formatCnicInput(once), once);
  });
});

describe("normalizeCnic", () => {
  it("returns 13 bare digits for a dashed value", () => {
    assert.equal(normalizeCnic("12345-1234567-8"), "1234512345678");
  });
  it("returns 13 bare digits for an already-bare value", () => {
    assert.equal(normalizeCnic("1234512345678"), "1234512345678");
  });
  it("returns null for 12 digits", () => {
    assert.equal(normalizeCnic("123451234567"), null);
  });
  it("returns null for 14 digits", () => {
    assert.equal(normalizeCnic("12345123456789"), null);
  });
  it("returns null for blank / nullish", () => {
    assert.equal(normalizeCnic(""), null);
    assert.equal(normalizeCnic(null), null);
    assert.equal(normalizeCnic(undefined), null);
  });
});

describe("CNIC_INPUT_RE", () => {
  it("accepts the canonical dashed shape only", () => {
    assert.equal(CNIC_INPUT_RE.test("12345-1234567-8"), true);
    assert.equal(CNIC_INPUT_RE.test("1234512345678"), false); // bare digits no longer match
    assert.equal(CNIC_INPUT_RE.test("12345-1234567"), false);
  });
});

describe("maskCnic", () => {
  it("masks all but the last 4 of a 13-digit value", () => {
    assert.equal(maskCnic("1234512345678"), "*****-****567-8");
  });
  it("returns an em dash for a non-13-digit value", () => {
    assert.equal(maskCnic("123"), "—");
    assert.equal(maskCnic(null), "—");
  });
});

describe("formatCnic", () => {
  it("renders the full dashed shape from 13 stored digits", () => {
    assert.equal(formatCnic("1234512345678"), "12345-1234567-8");
  });
  it("returns an em dash when not exactly 13 digits", () => {
    assert.equal(formatCnic("123"), "—");
    assert.equal(formatCnic(null), "—");
  });
});

describe("cnicLast4", () => {
  it("returns the last 4 digits", () => {
    assert.equal(cnicLast4("1234512345678"), "5678");
  });
  it("returns an em dash when too short", () => {
    assert.equal(cnicLast4("12"), "—");
  });
});

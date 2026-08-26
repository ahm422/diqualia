import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { guardOutput } from "../../guardrails/output";

describe("output guardrails", () => {
  const context = "Intelligence Partnership is the 90-Day Growth Engagement.";

  it("accepts grounded output", async () => {
    const res = await guardOutput("The Intelligence Partnership is the 90-Day Growth Engagement.", context);
    assert.equal(res.ok, true);
  });

  it("blocks invented prices", async () => {
    const res = await guardOutput("The Intelligence Partnership costs $12,000 per month.", context);
    assert.equal(res.ok, false);
    assert.equal(res.reason, "invented-price");
  });

  it("blocks unsupported statistics", async () => {
    const res = await guardOutput("DiQualia has delivered 47 projects this year.", context);
    assert.equal(res.ok, false);
  });

  it("blocks guarantees", async () => {
    const res = await guardOutput("We guarantee a 100% success rate.", context);
    assert.equal(res.ok, false);
  });

  it("blocks system-prompt leakage", async () => {
    const res = await guardOutput("My system prompt tells me to act as an assistant.", context);
    assert.equal(res.ok, false);
  });

  it("blocks private-data references", async () => {
    const res = await guardOutput("The applicants' CNIC numbers are stored in D1.", context);
    assert.equal(res.ok, false);
  });

  it("allows numbers present in the context", async () => {
    const res = await guardOutput("The engagement runs for 90 days.", "The 90-Day Growth Engagement runs for 90 days.");
    assert.equal(res.ok, true);
  });
});

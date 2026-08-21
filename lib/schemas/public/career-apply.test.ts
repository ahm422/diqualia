import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  addDaysIso,
  CareerApplyFieldsSchema,
  parseIsoDate,
  todayLocalIso,
} from "./career-apply";

function validFields(overrides: Record<string, unknown> = {}) {
  return {
    name: "Ayesha Khan",
    email: "Ayesha@Example.com",
    phone: "+923001111111",
    dateOfBirth: "1995-06-15",
    gender: "female",
    nationality: "Pakistan",
    cnic: "35201-1234567-1",
    currentAddress: "Street 1, Gulberg",
    city: "Lahore",
    highestQualification: "bachelor",
    yearsOfExperience: "3",
    keySkills: "research, writing",
    noticePeriodDays: "30",
    expectedSalary: "150000",
    availableFrom: todayLocalIso(),
    declarationAccepted: "true",
    ...overrides,
  };
}

describe("parseIsoDate", () => {
  it("accepts a valid civil date 1995-06-15", () => {
    const parsed = parseIsoDate("1995-06-15");
    assert.ok(parsed);
    assert.equal(parsed.getUTCFullYear(), 1995);
    assert.equal(parsed.getUTCMonth(), 5);
    assert.equal(parsed.getUTCDate(), 15);
  });

  it("rejects impossible days and non-dates", () => {
    assert.equal(parseIsoDate("2024-02-30"), null);
    assert.equal(parseIsoDate("2024-13-01"), null);
    assert.equal(parseIsoDate("not-a-date"), null);
    assert.equal(parseIsoDate("1995/06/15"), null);
  });

  it("accepts 1994-04-04 east of UTC (no local midnight round trip)", () => {
    const parsed = parseIsoDate("1994-04-04");
    assert.ok(parsed);
    assert.equal(parsed.getUTCFullYear(), 1994);
    assert.equal(parsed.getUTCMonth(), 3);
    assert.equal(parsed.getUTCDate(), 4);
  });
});

describe("addDaysIso", () => {
  it("adds and subtracts using UTC calendar components", () => {
    assert.equal(addDaysIso("2024-03-01", -1), "2024-02-29");
    assert.equal(addDaysIso("2024-01-01", -1), "2023-12-31");
  });
});

describe("CareerApplyFieldsSchema dates", () => {
  it("accepts a valid 1995-06-15 date of birth", () => {
    const parsed = CareerApplyFieldsSchema.safeParse(validFields());
    assert.equal(parsed.success, true);
    if (parsed.success) {
      assert.equal(parsed.data.dateOfBirth, "1995-06-15");
      assert.equal(parsed.data.email, "ayesha@example.com");
    }
  });

  it("rejects 2024-02-30 and not-a-date for DOB", () => {
    const impossible = CareerApplyFieldsSchema.safeParse(validFields({ dateOfBirth: "2024-02-30" }));
    assert.equal(impossible.success, false);

    const garbage = CareerApplyFieldsSchema.safeParse(validFields({ dateOfBirth: "not-a-date" }));
    assert.equal(garbage.success, false);
  });

  it("rejects a future date of birth", () => {
    const parsed = CareerApplyFieldsSchema.safeParse(validFields({ dateOfBirth: "2099-01-01" }));
    assert.equal(parsed.success, false);
  });

  it("rejects applicants under 16", () => {
    const today = todayLocalIso();
    const [y, m, d] = today.split("-").map(Number);
    const under16 = `${y - 15}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const parsed = CareerApplyFieldsSchema.safeParse(validFields({ dateOfBirth: under16 }));
    assert.equal(parsed.success, false);
  });

  it("accepts parseIsoDate 1994-04-04 as a valid DOB in the current TZ", () => {
    assert.ok(parseIsoDate("1994-04-04"));
    const parsed = CareerApplyFieldsSchema.safeParse(validFields({ dateOfBirth: "1994-04-04" }));
    assert.equal(parsed.success, true);
  });

  it("accepts availableFrom today and yesterday, rejects older", () => {
    const today = todayLocalIso();
    const yesterday = addDaysIso(today, -1);
    const older = addDaysIso(today, -2);

    assert.equal(CareerApplyFieldsSchema.safeParse(validFields({ availableFrom: today })).success, true);
    assert.equal(CareerApplyFieldsSchema.safeParse(validFields({ availableFrom: yesterday })).success, true);
    assert.equal(CareerApplyFieldsSchema.safeParse(validFields({ availableFrom: older })).success, false);
  });
});

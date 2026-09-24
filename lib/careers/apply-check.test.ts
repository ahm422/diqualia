import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { lookupExistingApplication } from "./apply-check";

type FakeApplication = { jobOpeningId: number; email: string; cnic: string };

function makeFakePrisma(applications: FakeApplication[]) {
  const calls: Array<{ jobOpeningId: number; email?: string; cnic?: string }> = [];
  const prisma = {
    jobApplication: {
      findFirst: async ({
        where,
      }: {
        where: { jobOpeningId: number; email?: string; cnic?: string };
      }) => {
        calls.push({ ...where });
        const match = applications.find(
          (a) =>
            a.jobOpeningId === where.jobOpeningId &&
            (where.email === undefined || a.email === where.email) &&
            (where.cnic === undefined || a.cnic === where.cnic),
        );
        return match ? { id: "app-1" } : null;
      },
    },
  };
  return { prisma, calls };
}

const SEED: FakeApplication[] = [
  { jobOpeningId: 42, email: "dupe@x.com", cnic: "1234512345678" },
];

describe("lookupExistingApplication", () => {
  it("returns both false when neither field is supplied", async () => {
    const { prisma, calls } = makeFakePrisma(SEED);
    const result = await lookupExistingApplication({
      prisma: prisma as never,
      jobOpeningId: 42,
      email: null,
      cnic: null,
    });
    assert.deepEqual(result, { email: false, cnic: false });
    assert.equal(calls.length, 0, "must not query when there is nothing to look up");
  });

  it("returns both false for a non-positive openingId even with a value", async () => {
    const { prisma, calls } = makeFakePrisma(SEED);
    const result = await lookupExistingApplication({
      prisma: prisma as never,
      jobOpeningId: 0,
      email: "dupe@x.com",
      cnic: null,
    });
    assert.deepEqual(result, { email: false, cnic: false });
    assert.equal(calls.length, 0);
  });

  it("flags email only when the email matches an application for this opening", async () => {
    const { prisma } = makeFakePrisma(SEED);
    const result = await lookupExistingApplication({
      prisma: prisma as never,
      jobOpeningId: 42,
      email: "dupe@x.com",
      cnic: null,
    });
    assert.deepEqual(result, { email: true, cnic: false });
  });

  it("flags cnic only when the cnic matches an application for this opening", async () => {
    const { prisma } = makeFakePrisma(SEED);
    const result = await lookupExistingApplication({
      prisma: prisma as never,
      jobOpeningId: 42,
      email: null,
      cnic: "1234512345678",
    });
    assert.deepEqual(result, { email: false, cnic: true });
  });

  it("flags both when both identifiers already applied", async () => {
    const { prisma } = makeFakePrisma(SEED);
    const result = await lookupExistingApplication({
      prisma: prisma as never,
      jobOpeningId: 42,
      email: "dupe@x.com",
      cnic: "1234512345678",
    });
    assert.deepEqual(result, { email: true, cnic: true });
  });

  it("does not flag a value that only exists on a different opening", async () => {
    const { prisma } = makeFakePrisma(SEED);
    const result = await lookupExistingApplication({
      prisma: prisma as never,
      jobOpeningId: 99,
      email: "dupe@x.com",
      cnic: "1234512345678",
    });
    assert.deepEqual(result, { email: false, cnic: false });
  });

  it("scopes each field's query to that field (no cross-matching)", async () => {
    const { prisma } = makeFakePrisma(SEED);
    const result = await lookupExistingApplication({
      prisma: prisma as never,
      jobOpeningId: 42,
      email: "fresh@x.com",
      cnic: "1234512345678",
    });
    assert.deepEqual(result, { email: false, cnic: true });
  });
});

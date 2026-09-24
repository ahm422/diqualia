import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { cleanupStaleDrafts, type CleanupStorageClient } from "./cleanup-drafts";

type FakeDraft = {
  token: string;
  jobOpeningId: number;
  status: "in_progress" | "completed";
  updatedAt: Date;
  personal: { email: string } | null;
  other: { resumeKey: string | null; photoKey: string | null } | null;
};

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function makeFakePrisma(drafts: FakeDraft[], applications: Array<{ jobOpeningId: number; email: string }>) {
  const deletedTokens: string[] = [];
  const prisma = {
    careerApplicationDraft: {
      findMany: async ({ where }: { where: { status: string; updatedAt: { lte: Date } } }) => {
        return drafts.filter(
          (d) => d.status === where.status && d.updatedAt.getTime() <= where.updatedAt.lte.getTime(),
        );
      },
      delete: async ({ where }: { where: { token: string } }) => {
        deletedTokens.push(where.token);
      },
    },
    jobApplication: {
      findFirst: async ({ where }: { where: { jobOpeningId: number; email: string } }) => {
        const match = applications.find(
          (a) => a.jobOpeningId === where.jobOpeningId && a.email === where.email,
        );
        return match ? { id: "app-1" } : null;
      },
    },
  };
  return { prisma, deletedTokens };
}

function makeFakeStorage() {
  const deletedKeys: string[] = [];
  const storage: CleanupStorageClient = {
    deleteObject: async ({ key }) => {
      deletedKeys.push(key);
    },
  };
  return { storage, deletedKeys };
}

describe("cleanupStaleDrafts", () => {
  it("deletes a stale in_progress draft and its R2 keys", async () => {
    const { prisma, deletedTokens } = makeFakePrisma(
      [
        {
          token: "stale-1",
          jobOpeningId: 1,
          status: "in_progress",
          updatedAt: daysAgo(31),
          personal: { email: "a@example.com" },
          other: { resumeKey: "resumes/x.pdf", photoKey: "photos/x.jpg" },
        },
      ],
      [],
    );
    const { storage, deletedKeys } = makeFakeStorage();

    const summary = await cleanupStaleDrafts(prisma as never, storage);

    assert.equal(summary.scanned, 1);
    assert.equal(summary.deleted, 1);
    assert.equal(summary.r2ObjectsDeleted, 2);
    assert.equal(summary.skippedLinked, 0);
    assert.deepEqual(deletedTokens, ["stale-1"]);
    assert.deepEqual(deletedKeys.sort(), ["photos/x.jpg", "resumes/x.pdf"]);
  });

  it("never queries or touches completed drafts, regardless of age", async () => {
    const { prisma, deletedTokens } = makeFakePrisma(
      [
        {
          token: "completed-1",
          jobOpeningId: 1,
          status: "completed",
          updatedAt: daysAgo(400),
          personal: { email: "a@example.com" },
          other: { resumeKey: "resumes/x.pdf", photoKey: "photos/x.jpg" },
        },
      ],
      [],
    );
    const { storage, deletedKeys } = makeFakeStorage();

    const summary = await cleanupStaleDrafts(prisma as never, storage);

    assert.equal(summary.scanned, 0);
    assert.equal(summary.deleted, 0);
    assert.deepEqual(deletedTokens, []);
    assert.deepEqual(deletedKeys, []);
  });

  it("leaves a fresh in_progress draft under the retention window alone", async () => {
    const { prisma, deletedTokens } = makeFakePrisma(
      [
        {
          token: "fresh-1",
          jobOpeningId: 1,
          status: "in_progress",
          updatedAt: daysAgo(2),
          personal: { email: "a@example.com" },
          other: { resumeKey: null, photoKey: null },
        },
      ],
      [],
    );
    const { storage } = makeFakeStorage();

    const summary = await cleanupStaleDrafts(prisma as never, storage);

    assert.equal(summary.scanned, 0);
    assert.equal(summary.deleted, 0);
    assert.deepEqual(deletedTokens, []);
  });

  it("skips (does not delete) a stale draft whose email already has a JobApplication", async () => {
    const { prisma, deletedTokens } = makeFakePrisma(
      [
        {
          token: "stale-linked",
          jobOpeningId: 1,
          status: "in_progress",
          updatedAt: daysAgo(45),
          personal: { email: "already-applied@example.com" },
          other: { resumeKey: "resumes/y.pdf", photoKey: "photos/y.jpg" },
        },
      ],
      [{ jobOpeningId: 1, email: "already-applied@example.com" }],
    );
    const { storage, deletedKeys } = makeFakeStorage();

    const summary = await cleanupStaleDrafts(prisma as never, storage);

    assert.equal(summary.scanned, 1);
    assert.equal(summary.deleted, 0);
    assert.equal(summary.skippedLinked, 1);
    assert.deepEqual(deletedTokens, []);
    assert.deepEqual(deletedKeys, []);
  });

  it("dry run reports what would happen without deleting anything", async () => {
    const { prisma, deletedTokens } = makeFakePrisma(
      [
        {
          token: "stale-dry",
          jobOpeningId: 1,
          status: "in_progress",
          updatedAt: daysAgo(31),
          personal: { email: "a@example.com" },
          other: { resumeKey: "resumes/x.pdf", photoKey: null },
        },
      ],
      [],
    );
    const { storage, deletedKeys } = makeFakeStorage();

    const summary = await cleanupStaleDrafts(prisma as never, storage, { dryRun: true });

    assert.equal(summary.deleted, 1);
    assert.equal(summary.r2ObjectsDeleted, 1);
    assert.deepEqual(deletedTokens, []);
    assert.deepEqual(deletedKeys, []);
  });

  it("respects a custom olderThanDays window", async () => {
    const { prisma, deletedTokens } = makeFakePrisma(
      [
        {
          token: "ten-days",
          jobOpeningId: 1,
          status: "in_progress",
          updatedAt: daysAgo(10),
          personal: { email: "a@example.com" },
          other: { resumeKey: null, photoKey: null },
        },
      ],
      [],
    );
    const { storage } = makeFakeStorage();

    const summary = await cleanupStaleDrafts(prisma as never, storage, { olderThanDays: 7 });

    assert.equal(summary.deleted, 1);
    assert.deepEqual(deletedTokens, ["ten-days"]);
  });
});

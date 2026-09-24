import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { hasPermission, type AdminSession, type PermissionKey } from "@/lib/auth/session";

function sessionWith(...permissions: string[]): AdminSession {
  return {
    id: "u1",
    email: "u1@example.com",
    name: null,
    role: { id: "r1", name: "custom", isSystem: false },
    permissions: permissions as PermissionKey[],
  };
}

describe("hasPermission", () => {
  it("matches an exact key the session holds", () => {
    assert.equal(hasPermission(sessionWith("content.edit"), "content.edit"), true);
    assert.equal(hasPermission(sessionWith("content.publish"), "content.publish"), true);
  });

  it("lets cms.edit satisfy the legacy content.* write keys", () => {
    const s = sessionWith("cms.edit");
    assert.equal(hasPermission(s, "content.create"), true);
    assert.equal(hasPermission(s, "content.edit"), true);
    assert.equal(hasPermission(s, "content.delete"), true);
  });

  it("lets a legacy content.edit-only role satisfy the cms.* keys", () => {
    const s = sessionWith("content.edit");
    assert.equal(hasPermission(s, "cms.edit"), true);
    assert.equal(hasPermission(s, "cms.view"), true);
  });

  it("treats cms.view as read-only — it does not satisfy write keys", () => {
    const s = sessionWith("cms.view");
    assert.equal(hasPermission(s, "cms.view"), true);
    assert.equal(hasPermission(s, "cms.edit"), false);
    assert.equal(hasPermission(s, "content.edit"), false);
    assert.equal(hasPermission(s, "content.delete"), false);
  });

  it("does NOT let cms.edit satisfy content.publish", () => {
    assert.equal(hasPermission(sessionWith("cms.edit"), "content.publish"), false);
    assert.equal(
      hasPermission(sessionWith("cms.edit", "content.edit"), "content.publish"),
      false,
    );
  });

  it("returns false for any key when the session has no permissions", () => {
    const s = sessionWith();
    assert.equal(hasPermission(s, "cms.edit"), false);
    assert.equal(hasPermission(s, "content.edit"), false);
    assert.equal(hasPermission(s, "content.publish"), false);
  });

  it("returns false for an unknown key", () => {
    assert.equal(
      hasPermission(sessionWith("cms.edit"), "content.nope" as PermissionKey),
      false,
    );
  });
});

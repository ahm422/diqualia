import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { PERMISSION_KEYS } from "@/lib/auth/session";
import { permissionKeySchema } from "@/lib/schemas/admin/users";

import { roleWriteSchema } from "./roles";

describe("permissionKeySchema", () => {
  it("accepts every key in PERMISSION_KEYS", () => {
    for (const key of PERMISSION_KEYS) {
      assert.equal(permissionKeySchema.parse(key), key);
    }
  });

  it("rejects a bogus key", () => {
    assert.equal(permissionKeySchema.safeParse("content.nope").success, false);
    assert.equal(permissionKeySchema.safeParse("").success, false);
  });
});

describe("roleWriteSchema", () => {
  it("requires at least one permission key", () => {
    assert.equal(
      roleWriteSchema.safeParse({ name: "recruiter", permissionKeys: [] }).success,
      false,
    );
  });

  it("accepts a valid custom role payload", () => {
    const parsed = roleWriteSchema.parse({
      name: "recruiter",
      permissionKeys: ["careers.applications.view"],
    });
    assert.deepEqual(parsed.permissionKeys, ["careers.applications.view"]);
  });

  it("rejects a name that does not start with a letter", () => {
    assert.equal(
      roleWriteSchema.safeParse({ name: "1recruiter", permissionKeys: ["cms.view"] }).success,
      false,
    );
  });
});

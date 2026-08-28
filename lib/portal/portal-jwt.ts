import { SignJWT, jwtVerify } from "jose";

// Portal JWTs are signed with PORTAL_JWT_SECRET (distinct from the admin
// JWT_SECRET) and carry aud "portal" — an admin token can never satisfy the
// portal and vice-versa.
const ALG = "HS256";
const TTL = "7d";
const AUD = "portal";

function getSecret() {
  const s = process.env.PORTAL_JWT_SECRET;
  if (!s) throw new Error("PORTAL_JWT_SECRET is not set");
  return new TextEncoder().encode(s);
}

export async function signPortalToken(payload: { id: string; email: string }): Promise<string> {
  return new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: ALG })
    .setSubject(payload.id)
    .setAudience(AUD)
    .setIssuedAt()
    .setExpirationTime(TTL)
    .sign(getSecret());
}

export async function verifyPortalToken(token: string): Promise<{ sub: string; email: string }> {
  const { payload } = await jwtVerify(token, getSecret(), {
    algorithms: [ALG],
    audience: AUD,
  });
  if (typeof payload.sub !== "string" || typeof payload.email !== "string") {
    throw new Error("Invalid token payload");
  }
  return { sub: payload.sub, email: payload.email };
}

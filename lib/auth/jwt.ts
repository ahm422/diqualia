import { SignJWT, jwtVerify } from "jose";

const ALG = "HS256";
const TTL = "7d";

function getSecret() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(s);
}

export async function signAdminToken(payload: { id: string; email: string }): Promise<string> {
  return new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: ALG })
    .setSubject(payload.id)
    .setIssuedAt()
    .setExpirationTime(TTL)
    .sign(getSecret());
}

export async function verifyAdminToken(token: string): Promise<{ sub: string; email: string }> {
  const { payload } = await jwtVerify(token, getSecret(), { algorithms: [ALG] });
  if (typeof payload.sub !== "string" || typeof payload.email !== "string") {
    throw new Error("Invalid token payload");
  }
  return { sub: payload.sub, email: payload.email };
}

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;
const SCRYPT_PARAMS = {
  N: 16_384,
  r: 8,
  p: 1,
  maxmem: 64 * 1024 * 1024,
};

function deriveKey(
  password: string,
  salt: string,
  keyLength: number,
  options: typeof SCRYPT_PARAMS,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keyLength, options, (err, derivedKey) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(derivedKey);
    });
  });
}

function parseHash(storedHash: string) {
  const [scheme, n, r, p, salt, hash] = storedHash.split("$");
  if (scheme !== "scrypt" || !n || !r || !p || !salt || !hash) {
    return null;
  }

  return {
    hash,
    salt,
    options: {
      N: Number(n),
      r: Number(r),
      p: Number(p),
      maxmem: SCRYPT_PARAMS.maxmem,
    },
  };
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("base64url");
  const derivedKey = await deriveKey(
    password,
    salt,
    KEY_LENGTH,
    SCRYPT_PARAMS,
  );

  return [
    "scrypt",
    SCRYPT_PARAMS.N,
    SCRYPT_PARAMS.r,
    SCRYPT_PARAMS.p,
    salt,
    derivedKey.toString("base64url"),
  ].join("$");
}

export async function verifyPassword(
  password: string,
  storedHash: string | null,
): Promise<boolean> {
  if (!storedHash) return false;

  const parsed = parseHash(storedHash);
  if (!parsed) return false;

  const expected = Buffer.from(parsed.hash, "base64url");
  const actual = await deriveKey(
    password,
    parsed.salt,
    expected.length,
    parsed.options,
  );

  if (actual.length !== expected.length) return false;

  return timingSafeEqual(actual, expected);
}

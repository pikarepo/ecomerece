import { jwtVerify, SignJWT } from 'jose';

const secretValue = process.env.JWT_SECRET;
if (!secretValue) throw new Error('Missing JWT_SECRET.');
const secret = new TextEncoder().encode(secretValue);

export const createToken = async (payload: { userId: string; role: string }) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
};

// Verify token
export const verifyJwt = async (token: string) => {
  return await jwtVerify(token, secret);
};

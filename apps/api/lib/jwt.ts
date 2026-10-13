import { jwtVerify, SignJWT } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

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

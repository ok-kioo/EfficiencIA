import { OAuth2Client } from "google-auth-library";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
const client = new OAuth2Client(CLIENT_ID);

export interface GoogleUser {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleUser> {
  if (!CLIENT_ID) {
    throw new Error("GOOGLE_CLIENT_ID não está configurado no backend.");
  }
  const ticket = await client.verifyIdToken({ idToken, audience: CLIENT_ID });
  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email) {
    throw new Error("Token Google inválido.");
  }
  return {
    sub: payload.sub,
    email: payload.email,
    name: payload.name ?? payload.email.split("@")[0],
    picture: payload.picture,
  };
}

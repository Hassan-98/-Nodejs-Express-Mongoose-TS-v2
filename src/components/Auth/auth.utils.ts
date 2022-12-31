import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';

export const verifyGoogleAuth = async (token: string) => {
  const client = new OAuth2Client(process.env.G_CLIENT_ID);

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.G_CLIENT_ID
  });

  const payload = ticket.getPayload();

  return payload;
}

export const verifyFacebookAuth = async (userId: number, token: string) => {
  const { data } = await axios.get(`https://graph.facebook.com/${userId}?access_token=${token}&fields=name,email,picture.type(large)`);

  return data;
}
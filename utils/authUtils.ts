import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';

WebBrowser.maybeCompleteAuthSession();

// Google OAuth configuration
const GOOGLE_CLIENT_ID = '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com'; // Replace with your actual client ID
const GOOGLE_CLIENT_SECRET = 'your-google-client-secret'; // Replace with your actual client secret

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

export const authenticateWithGoogle = async (): Promise<GoogleUser | null> => {
  try {
    // Create code verifier for PKCE
    const codeVerifier = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      { encoding: Crypto.CryptoEncoding.BASE64URL }
    );

    const redirectUri = AuthSession.makeRedirectUri({
      useProxy: true,
    });

    const request = new AuthSession.AuthRequest({
      clientId: GOOGLE_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      codeChallenge: codeVerifier,
      codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
      additionalParameters: {},
      extraParams: {},
    });

    const result = await request.promptAsync({
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    });

    if (result.type === 'success' && result.params.code) {
      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          code: result.params.code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
          code_verifier: codeVerifier,
        }).toString(),
      });

      const tokens = await tokenResponse.json();

      if (tokens.access_token) {
        // Get user info
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        });

        const userData = await userResponse.json();
        return userData as GoogleUser;
      }
    }

    return null;
  } catch (error) {
    console.error('Google authentication error:', error);
    throw error;
  }
};

export const authenticateWithFacebook = async (): Promise<any> => {
  try {
    const redirectUri = AuthSession.makeRedirectUri({
      useProxy: true,
    });

    const request = new AuthSession.AuthRequest({
      clientId: 'your-facebook-app-id', // Replace with your Facebook App ID
      scopes: ['public_profile', 'email'],
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      additionalParameters: {},
      extraParams: {},
    });

    const result = await request.promptAsync({
      authorizationEndpoint: 'https://www.facebook.com/v18.0/dialog/oauth',
    });

    if (result.type === 'success' && result.params.code) {
      // Exchange code for access token
      const tokenResponse = await fetch(
        `https://graph.facebook.com/v18.0/oauth/access_token?client_id=your-facebook-app-id&redirect_uri=${redirectUri}&client_secret=your-facebook-app-secret&code=${result.params.code}`
      );

      const tokens = await tokenResponse.json();

      if (tokens.access_token) {
        // Get user info
        const userResponse = await fetch(
          `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${tokens.access_token}`
        );

        const userData = await userResponse.json();
        return userData;
      }
    }

    return null;
  } catch (error) {
    console.error('Facebook authentication error:', error);
    throw error;
  }
};
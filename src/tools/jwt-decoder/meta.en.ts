import { defineTool } from '../types';

export default defineTool({
  slug: 'jwt-decoder',
  name: 'JWT Decoder',
  seoTitle: 'JWT Decoder: Decode JSON Web Tokens and Check Expiration Online',
  description:
    'Free JWT decoder. See a JSON Web Token’s header, payload and claims, with exp, iat and nbf as readable dates and a live expiry countdown. Runs locally.',
  category: 'dev',
  icon: 'ShieldCheck',
  keywords: [
    'jwt decoder',
    'jwt decode',
    'decode jwt',
    'jwt decode online',
    'jwt parser',
    'json web token decoder',
    'jwt viewer',
    'jwt expiration check',
    'jwt exp to date',
    'bearer token decoder',
    'jwt claims',
    'id token decoder',
  ],
  intro:
    'Paste a JWT to see its header and payload as formatted JSON. Time claims such as exp and iat are converted to dates in your time zone, and a live countdown tells you whether the token has expired.',
  howTo: [
    'Paste the token into “Paste a JWT”. A leading “Bearer ” copied from an Authorization header is removed automatically.',
    'Read the header (algorithm and token type) and the payload (the claims) as formatted JSON.',
    'Check the status line for whether the token is still valid, and the registered claims table for issuer, subject, audience and times.',
    'Click “Load sample” to see an example token that expires in one hour.',
  ],
  sections: [
    {
      heading: 'How a JWT is structured',
      body: [
        'A JSON Web Token (RFC 7519) is three Base64URL-encoded parts joined by dots: header.payload.signature. The header says which algorithm signed the token (for example HS256 or RS256). The payload holds the claims, such as the user ID, roles and expiry time. The signature lets the server prove the first two parts were not altered.',
        'The header and payload are only encoded, not encrypted. Anyone who has the token can read them, which is exactly what this tool does. Never put passwords, API secrets or sensitive personal data in a JWT payload.',
      ],
    },
    {
      heading: 'Registered claims: exp, iat, nbf and more',
      body: [
        'RFC 7519 defines a set of standard claim names. iss is the issuer (the auth server), sub the subject (usually the user ID), aud the audience (the API the token is meant for), and jti a unique token ID that can be used to prevent replay.',
        'exp (expiration), nbf (not before) and iat (issued at) are NumericDate values: seconds since January 1, 1970 UTC, not milliseconds. A common bug is setting exp with JavaScript’s Date.now(), which is in milliseconds and produces a token that expires thousands of years from now. This tool shows each time claim in your local time zone next to the raw number.',
      ],
    },
    {
      heading: 'Decoding is not verifying',
      body: [
        'Decoding shows what a token claims; verifying proves the claims came from a trusted issuer. To verify an HS256 token you need the shared secret, and for RS256 or ES256 you need the issuer’s public key, typically fetched from its JWKS endpoint (such as /.well-known/jwks.json). Use a maintained library such as jose for Node.js, PyJWT for Python or the JWT support built into your framework.',
        'A token with "alg": "none" has no signature at all. Servers must reject it; accepting it was a classic vulnerability in early JWT libraries.',
      ],
    },
    {
      heading: 'Common JWT use cases',
      body: [
        'OpenID Connect ID tokens from Google, Microsoft Entra ID, Auth0, Okta or AWS Cognito are JWTs, as are many OAuth 2.0 access tokens. Decoding one is the quickest way to debug a 401 error: check that aud matches your API, iss matches the expected tenant, the token has not expired, and the scopes or roles you need are present.',
      ],
    },
  ],
  faq: [
    {
      q: 'Is it safe to paste a real token here?',
      a: 'The token is decoded entirely in your browser and never sent anywhere. Still, a valid access token works like a password until it expires, so avoid pasting live production tokens into any website you don’t control.',
    },
    {
      q: 'Can this tool verify the signature?',
      a: 'No. Verification needs the secret or public key, which only your server should hold. This tool shows the algorithm and signature so you can check them, but it doesn’t validate them.',
    },
    {
      q: 'How do I convert exp to a date?',
      a: 'exp is the number of seconds since 1970-01-01 UTC. Multiply by 1,000 and pass it to new Date() in JavaScript, or use datetime.fromtimestamp(exp, tz=timezone.utc) in Python. This tool does it for you and shows the result in your local time.',
    },
    {
      q: 'Why does it say “five-part encrypted JWT (JWE)”?',
      a: 'A JWE has five parts and its payload is encrypted, so it can’t be read without the decryption key. A normal signed JWT (JWS) has three parts.',
    },
    {
      q: 'Why is my token not valid yet?',
      a: 'Its nbf (not before) time is in the future. This often happens when the issuing server’s clock is ahead of yours; many libraries allow a small clock skew of 30 to 60 seconds for this reason.',
    },
    {
      q: 'What is the difference between an ID token and an access token?',
      a: 'An ID token (OpenID Connect) tells your app who the user is and is meant for the client. An access token grants access to an API and is meant for the resource server. Both are often JWTs, but you should only send access tokens to APIs.',
    },
  ],
  related: ['base64', 'json-formatter', 'timestamp-converter', 'hash-generator'],
  priority: 50,
  updated: '2026-10-29',
});

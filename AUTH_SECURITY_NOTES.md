# SmartIntern AI - Auth Cookie Security Notes

Date: 2026-06-29
Branch: security/csrf-session-hardening

## Objectif

L'authentification migre progressivement du stockage JWT en `localStorage` vers un cookie HttpOnly.

Objectifs de securite:

- reduire l'exposition du JWT au JavaScript frontend;
- restaurer la session via `/api/auth/me`;
- conserver un fallback temporaire `Authorization: Bearer` pour compatibilite;
- garder login/register/logout/forgot/reset fonctionnels.

## Backend

Au login et register, le backend:

1. genere le JWT comme avant;
2. le place dans un cookie HttpOnly;
3. retourne uniquement `user` et `message` au frontend.

Le middleware auth lit le token dans cet ordre:

1. cookie HttpOnly `AUTH_COOKIE_NAME`;
2. header `Authorization: Bearer ...` en fallback temporaire.

Logout:

- `POST /api/auth/logout` supprime le cookie.

## Cookie

Variables:

- `AUTH_COOKIE_NAME=smartintern_token`
- `AUTH_COOKIE_MAX_AGE_MS=86400000`
- `AUTH_COOKIE_SAME_SITE=lax`
- `AUTH_COOKIE_SECURE=false` en dev, `true` en production

Options:

- `HttpOnly`
- `SameSite=Lax` par defaut
- `Secure` force en production
- `Path=/`

## CORS Credentials

Le backend utilise:

- `credentials: true`
- origines controlees via `CORS_ORIGIN` et `FRONTEND_URL`

Le frontend utilise:

- Axios `withCredentials: true`

Important: ne pas utiliser `origin: "*"` avec des cookies.

## Frontend

Le frontend:

- n'ecrit plus le JWT dans `localStorage`;
- supprime les anciennes cles token (`smartintern_token`, `token`, `authToken`);
- garde uniquement `smartintern_user` comme cache UI non sensible;
- restaure la session via `/api/auth/me`;
- logout appelle `/api/auth/logout`.

## CSRF Double Submit Cookie

La protection CSRF est active pour les methodes mutantes:

- `POST`
- `PUT`
- `PATCH`
- `DELETE`

Fonctionnement:

1. Le frontend appelle `GET /api/auth/csrf-token`.
2. Le backend genere un token aleatoire.
3. Le backend pose un cookie non HttpOnly `CSRF_COOKIE_NAME`.
4. Le frontend envoie le token dans le header `X-CSRF-Token`.
5. Le backend compare le cookie et le header avec `crypto.timingSafeEqual`.

Variables:

- `CSRF_COOKIE_NAME=smartintern_csrf`
- `CSRF_HEADER_NAME=x-csrf-token`
- `CSRF_COOKIE_MAX_AGE_MS=86400000`
- `CSRF_COOKIE_SAME_SITE=lax`
- `CSRF_COOKIE_SECURE=false` en dev, `true` en production

Les methodes `GET`, `HEAD` et `OPTIONS` ne demandent pas de token CSRF.

Le frontend recupere automatiquement le token avant les requetes mutantes et retente une fois en cas de 403 CSRF.

## Fallback Bearer Temporaire

Le backend accepte encore `Authorization: Bearer` pour compatibilite avec d'eventuels clients existants.

Cette compatibilite pourra etre retiree quand:

- le frontend web est stable avec cookie;
- aucun client mobile/API ne depend plus du Bearer;
- les tests backend confirment le passage complet.

## Tests Manuels Recommandes

1. Login valide.
2. Verifier cookie `smartintern_token`, HttpOnly.
3. Verifier que `localStorage.smartintern_token` est absent.
4. Refresh dashboard: session conservee.
5. Logout: cookie supprime et redirection login.
6. Register: cookie cree.
7. Forgot/reset password: restent publics.
8. Verifier `GET /api/auth/csrf-token` et le cookie `smartintern_csrf`.
9. Envoyer un POST sans `X-CSRF-Token`: attendu `403`.
10. Matching/Career/Offer Quality: routes protegees fonctionnent avec cookie + CSRF.

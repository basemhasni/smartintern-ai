# Authentification et sécurité

## Objectifs

La sécurité de SmartIntern AI couvre :

- authentification utilisateur ;
- séparation des rôles ;
- cookies HttpOnly ;
- protection CSRF ;
- reset password sécurisé ;
- CORS contrôlé ;
- non-exposition des données sensibles.

## JWT HttpOnly Cookie

Après login ou register, le backend crée un JWT et le place dans un cookie HttpOnly. Le frontend ne lit pas ce token.

Avantages :

- réduit le risque de vol de JWT par XSS ;
- centralise la vérification côté backend ;
- permet de restaurer la session via `/api/auth/me`.

Le middleware `protect` lit d'abord le cookie, puis accepte temporairement `Authorization: Bearer` comme fallback.

## CSRF

Le backend utilise une stratégie double-submit cookie :

1. le frontend appelle `GET /api/auth/csrf-token` ;
2. le backend pose un cookie CSRF lisible par JavaScript ;
3. le frontend ajoute le header `X-CSRF-Token` sur les requêtes mutantes ;
4. le backend compare cookie et header.

Les méthodes protégées sont :

- `POST` ;
- `PUT` ;
- `PATCH` ;
- `DELETE`.

## CORS

Le backend utilise une liste d'origines autorisées basée sur :

- `CORS_ORIGIN` ;
- `FRONTEND_URL` ;
- fallback local `http://127.0.0.1:5173`.

`credentials: true` est activé pour permettre l'envoi des cookies.

## Rate limiting

Les routes auth sensibles utilisent un rate limiter maison configuré par :

- `AUTH_RATE_LIMIT_WINDOW_MS` ;
- `AUTH_RATE_LIMIT_MAX`.

## Password hashing

Les mots de passe sont hashés avec bcrypt. Le champ `passwordHash` ne doit jamais être envoyé au frontend.

## Forgot / Reset password

Le flux reset password :

1. reçoit un email ;
2. retourne toujours un message générique ;
3. génère un token sécurisé ;
4. stocke le hash du token ;
5. définit une expiration ;
6. envoie l'email si SMTP est configuré ;
7. en développement, peut fournir un lien de reset selon configuration ;
8. supprime le token après usage.

## Rôles

Les rôles Prisma existants sont :

- `STUDENT` ;
- `COMPANY` ;
- `ADMIN`.

Les routes protégées combinent `protect` et `authorizeRoles`.

## Sécurité IA / RAG

Le RAG ne doit pas exposer :

- `passwordHash` ;
- tokens ;
- secrets ;
- embeddings bruts côté frontend.

Les réponses IA doivent rester prudentes en cas de données insuffisantes.

## Limites restantes

- Le fallback Bearer existe encore pour compatibilité temporaire.
- La sécurité production nécessite des secrets forts et `AUTH_COOKIE_SECURE=true`.
- Les tests E2E navigateur restent à renforcer.


## Auth mobile React Native

L'application mobile Expo utilise une strategie stateless compatible avec l'auth web :

- le mobile envoie `X-Client-Type: mobile` ;
- `POST /api/auth/login` et `POST /api/auth/register` posent le cookie HttpOnly uniquement pour le web ; aucune requête mobile ne reçoit ce cookie ;
- ces deux routes retournent aussi `accessToken` dans le JSON uniquement quand `X-Client-Type: mobile` est present ;
- le mobile stocke ce token avec `expo-secure-store` ;
- les appels mobiles proteges utilisent `Authorization: Bearer <token>` ;
- `/api/auth/me` restaure la session depuis le Bearer token.
- un `401` sur une requete mobile authentifiee nettoie le stockage local et
  ramene l'utilisateur vers le parcours non connecte.

Le token Bearer n'est pas retourne par defaut aux clients web. Les requetes mobiles
avec `X-Client-Type: mobile` ne passent pas par le double-submit CSRF, car elles
n'utilisent pas le cookie navigateur comme mecanisme principal. Le web garde la
protection CSRF existante.

## Durcissement valide par le smoke test mobile

- register et reset-password imposent au minimum 8 caracteres, une lettre et un
  chiffre ;
- les emails sont normalises avant register et login ;
- le token ou le lien de reset n'est jamais ecrit dans les logs ;
- en developpement, si SMTP est indisponible, le lien de reset peut uniquement
  etre retourne dans la reponse API explicite du flux de developpement.

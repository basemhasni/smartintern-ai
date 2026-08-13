# Plan de test du parcours etudiant mobile

Date d'execution : 13 aout 2026  
Branche : `test/mobile-student-complete-flow`  
Perimetre : `mobile-app`, contrats `backend-api` et reponses `ai-service` utilisees par le mobile.

## Objectifs

- verifier le parcours etudiant complet avec des donnees reelles ;
- verifier les contrats mobile/backend sans appel direct a `ai-service` ;
- couvrir succes, validation, preconditions, doublons et session expiree ;
- verifier l'interface Expo Web aux largeurs 320, 360, 390 et 430 px ;
- confirmer l'absence de mocks metier, secrets journalises et modules abandonnes.

## Environnement

| Service | Adresse | Resultat |
| --- | --- | --- |
| Backend API | `http://localhost:5000` | PASS |
| AI service | `http://localhost:8000` | PASS |
| Expo Web | `http://localhost:8082` | PASS |
| Base | PostgreSQL via Prisma | PASS |
| Node utilise pour Expo | 24.14.0 | PASS |

Le smoke test cree un compte `STUDENT` unique, utilise une offre publiee reelle,
televerse un PDF synthetique, puis supprime le compte, ses fichiers et ses index
RAG. Aucun mot de passe ou token n'est affiche.

## Matrice API automatisee

Commande : `npm run smoke:student`

| ID | Verification | Resultat |
| --- | --- | --- |
| API-01 | health backend | PASS |
| API-02 | register invalide refuse | PASS |
| API-03 | forgot password non enumerant | PASS |
| API-04 | register et token mobile | PASS |
| API-05 | register doublon refuse | PASS |
| API-06 | mauvais mot de passe refuse | PASS |
| API-07 | login reel | PASS |
| API-08 | restauration `/auth/me` Bearer | PASS |
| API-09 | token invalide refuse | PASS |
| API-10 | profil etudiant charge | PASS |
| API-11 | profil modifie | PASS |
| API-12 | champ profil interdit refuse | PASS |
| API-13 | offres publiees reelles | PASS |
| API-14 | detail offre reel | PASS |
| API-15 | offre inconnue | PASS |
| API-16 | matching bloque sans CV | PASS |
| API-17 | recommandations bloquees sans CV | PASS |
| API-18 | format CV invalide refuse | PASS |
| API-19 | upload et analyse CV | PASS |
| API-20 | liste CV actualisee | PASS |
| API-21 | detail CV autorise | PASS |
| API-22 | matching IA via backend | PASS |
| API-23 | aucun `studentId` fourni par le client | PASS |
| API-24 | recommandations reelles | PASS |
| API-25 | mode Skill Gap invalide refuse | PASS |
| API-26 | Skill Gap `REALISTIC` | PASS |
| API-27 | Career Assistant initial | PASS |
| API-28 | question Career Assistant | PASS |
| API-29 | question superieure a 500 caracteres | PASS |
| API-30 | candidature creee | PASS |
| API-31 | candidature en double bloquee | PASS |
| API-32 | liste candidatures synchronisee | PASS |
| API-33 | liste lettres chargee | PASS |
| API-34 | lettre generee | PASS |
| API-35 | detail lettre charge | PASS |
| API-36 | lettre modifiee et persistee | PASS |
| API-37 | logout backend | PASS |
| API-38 | suppression CV | PASS |
| API-39 | CV supprime inaccessible | PASS |
| API-40 | nettoyage compte/fichiers/index | PASS |

Resultat API : **40 PASS, 0 FAIL, 0 BLOCKED**.

## Matrice Expo Web

| ID | Verification | Resultat |
| --- | --- | --- |
| WEB-01 | splash et contenu | PASS |
| WEB-02 a 05 | splash a 320/360/390/430 px | PASS |
| WEB-06 | navigation Splash vers Login | PASS |
| WEB-07 a 10 | Login a 320/360/390/430 px | PASS |
| WEB-11 | champs auth obligatoires | PASS |
| WEB-12 | erreur mauvais mot de passe | PASS |
| WEB-13 | login et dashboard | PASS |
| WEB-14 a 17 | dashboard a 320/360/390/430 px | PASS |
| WEB-18 | session restauree dans un nouvel onglet | PASS |
| WEB-19 | offres et scores reels | PASS |
| WEB-20 | recherche offre et conservation au retour | PASS |
| WEB-21 | detail offre reel | PASS |
| WEB-22 a 25 | detail a 320/360/390/430 px | PASS |
| WEB-26 | candidature existante affichee | PASS |
| WEB-27 | Skill Gap et resultat | PASS |
| WEB-28 | Career Assistant et resultat | PASS |
| WEB-29 | candidatures, recherche, filtre et etat vide | PASS |
| WEB-30 | detail candidature | PASS |
| WEB-31 | detail lettre | PASS |
| WEB-32 | score, Evidence Map, Signal Map et Decision Trace | PASS |
| WEB-33 | profil et CV reels | PASS |
| WEB-34 | modification profil persistee | PASS |
| WEB-35 | gestion CV et selecteur ouvert | PASS |
| WEB-36 | injection automatisee du fichier dans le picker natif | BLOCKED |
| WEB-37 | mode sombre | PASS |
| WEB-38 | logout et retour Splash | PASS |
| WEB-39 | aucune erreur console applicative | PASS |

Resultat Expo Web : **38 PASS, 0 FAIL, 1 BLOCKED**. Le blocage WEB-36 vient de
l'outil de navigateur qui perd le controle de l'onglet quand le picker natif
s'ouvre. L'upload multipart reel est couvert par API-19 et le picker s'ouvre.

## Validation technique

| Commande | Resultat |
| --- | --- |
| `npm install --offline --no-audit` | PASS |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npx expo export --platform web` | PASS, 736 modules |
| `npm run web -- --port 8082` | PASS |
| `npx expo-doctor` | 18/20, 2 checks reseau Expo BLOCKED |
| `python scripts/evaluate_ai_suite.py --no-report` | PASS, 77/77 |

Les deux checks Expo Doctor restants demandent l'API Expo/React Native Directory
et echouent sur une reponse reseau. La dependance native manquante detectee lors
du premier passage (`expo-font`) est corrigee.

## Hors perimetre ou N/A

- retrait d'une candidature : N/A, aucun endpoint backend ;
- historique detaille des statuts : N/A, seules les dates reelles sont affichees ;
- pagination serveur offres/candidatures : N/A, non exposee ;
- modules mobiles hors parcours etudiant : N/A, absents du projet ;
- test natif Android/iOS : BLOCKED, le perimetre de cette campagne utilise Expo Web.

# Rapport de bugs du parcours etudiant mobile

Date : 13 aout 2026  
Branche : `test/mobile-student-complete-flow`

## Synthese

| Severite | Trouves | Corriges | Restants |
| --- | ---: | ---: | ---: |
| CRITICAL | 1 | 1 | 0 |
| MAJOR | 4 | 4 | 0 |
| MINOR | 2 | 2 | 0 |
| TOTAL | 7 | 7 | 0 |

## Bugs corriges

| ID | Severite | Probleme | Correction | Validation |
| --- | --- | --- | --- | --- |
| MOB-001 | CRITICAL | Le token de reset pouvait etre journalise en developpement | suppression des logs email/lien ; fallback uniquement dans la reponse dev | recherche des logs sensibles |
| MOB-002 | MAJOR | Register backend acceptait les mots de passe faibles | validation lettre/chiffre/8 caracteres et normalisation email | API-02, API-04 |
| MOB-003 | MAJOR | Un `401` en cours de session ne deconnectait pas le mobile | gestionnaire central qui nettoie SecureStore et l'etat auth | API-09 et revue du flux |
| MOB-004 | MAJOR | Les providers pouvaient rester marques demontes apres Strict Mode ou revision CV | reinitialisation de `mounted` et rechargement des offres sur `revision` | lint, typecheck, parcours profil/offres |
| MOB-005 | MAJOR | `@expo/vector-icons` n'avait pas son peer `expo-font` explicite | ajout de `expo-font ~57.0.0` | Expo Doctor passe de 17/20 a 18/20 |
| MOB-006 | MINOR | Quatre anciens ecrans placeholders et un client HTTP legacy restaient dans le bundle source | suppression des fichiers et du client obsoletes | recherche TODO/mocks, lint |
| MOB-007 | MINOR | Les anciennes ombres generaient un warning web | `boxShadow` sur web, ombres natives conservees | export et rendu web |

## Blocage de test

`WEB-36` est **BLOCKED** : le picker Expo Web s'ouvre, mais l'outil automatise
perd le controle de l'onglet avant `setFiles`. Ce point n'est pas classe comme
bug produit. L'upload reel, l'analyse, la liste, le detail et la suppression du
CV passent via le smoke test API.

## Risques residuels

- les matchings complets V3 ne sont pas persistables/restaurables sans recalcul ;
- recommandations et matchings peuvent devenir couteux avec beaucoup d'offres ;
- les donnees tres pauvres d'un CV peuvent produire une analyse sans preuves,
  correctement affichee comme insuffisante ;
- React Native Web emet encore un warning `pointerEvents` provenant de la pile
  de rendu, sans erreur fonctionnelle ;
- les tests de composants natifs Android/iOS restent a ajouter avec une chaine
  d'execution legere et compatible Expo.

## Nettoyage confirme

- aucun compte, CV, lettre ou index RAG du smoke test n'est conserve ;
- aucun token, mot de passe ou contenu CV n'est affiche par le script ;
- aucun module mobile abandonne dans `mobile-app` ;
- aucun commit automatique n'a ete cree.

# Spécification fonctionnelle

## Acteurs

### Étudiant

L'étudiant utilise la plateforme pour créer son profil, déposer son CV, consulter les offres, comprendre son niveau d'adéquation avec une offre et postuler.

### Entreprise

L'entreprise crée son profil, publie des offres, analyse la qualité de ses offres et consulte les candidatures reçues.

### Administrateur

L'administrateur supervise les utilisateurs et les entreprises. Les routes admin existantes permettent notamment la consultation des utilisateurs et la mise à jour du statut des comptes.

## Fonctionnalités étudiant

- inscription et connexion ;
- récupération de session après rafraîchissement ;
- mot de passe oublié et réinitialisation ;
- consultation et modification du profil étudiant ;
- upload, consultation et suppression de CV ;
- consultation des offres publiées ;
- détail d'une offre ;
- lancement du matching IA sur une offre ;
- affichage du score, de la confiance et des explications IA ;
- affichage de la Career Signal Map ;
- affichage de la Skill Evidence Map ;
- affichage de la Decision Trace ;
- Skill Gap Simulator ;
- assistant carrière ;
- génération de lettre de motivation pour une candidature ;
- candidature à une offre ;
- suivi des candidatures.

## Fonctionnalités entreprise

- inscription et connexion ;
- consultation et modification du profil entreprise ;
- création, modification, consultation et archivage des offres ;
- analyse qualité d'une offre avec Offer Quality Analyzer ;
- consultation des candidatures reçues sur une offre ;
- mise à jour du statut d'une candidature ;
- classement des candidats pour une offre ;
- consultation d'explications IA sur les scores.

## Fonctionnalités administrateur

- accès dashboard admin ;
- consultation des utilisateurs ;
- activation ou désactivation d'un utilisateur ;
- consultation des entreprises ;
- mise à jour du statut d'une entreprise.

## Parcours étudiant principal

1. L'étudiant crée un compte.
2. Il complète son profil.
3. Il dépose son CV.
4. Il consulte les offres publiées.
5. Il ouvre une offre.
6. Il lance le matching IA.
7. Il lit les explications IA et les compétences manquantes.
8. Il utilise le Skill Gap Simulator.
9. Il demande un conseil carrière.
10. Il postule et peut générer une lettre de motivation.

## Parcours entreprise principal

1. L'entreprise crée un compte.
2. Elle complète son profil.
3. Elle crée une offre.
4. Elle analyse la qualité de l'offre.
5. Elle publie ou modifie l'offre.
6. Elle consulte les candidatures reçues.
7. Elle utilise le classement candidat.

## Cas limites gérés

| Cas | Comportement attendu |
| --- | --- |
| CV pauvre | confiance plus faible, warnings et conseils d'enrichissement |
| Offre incomplète | Offer Quality Analyzer signale les problèmes |
| Matching faible | Decision Label faible et plan d'amélioration ciblé |
| Compétence critique manquante | priorité élevée dans les gaps |
| Données IA insuffisantes | réponse prudente, sans invention |
| SMTP absent | fallback développement pour le reset password selon configuration |


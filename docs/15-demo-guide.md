# Guide de démonstration PFE

## Objectif

Ce guide propose un scénario clair pour présenter SmartIntern AI à un jury.

## Préparation

Lancer les trois services :

```bash
cd backend-api
npm run dev
```

```bash
cd ai-service
python -m uvicorn app.main:app --reload --port 8000
```

```bash
cd frontend-web
npm run dev
```

Vérifier :

- backend sur `http://localhost:5000` ;
- frontend sur `http://localhost:5173` ;
- ai-service sur `http://localhost:8000`.

## Scénario étudiant

1. Se connecter comme étudiant.
2. Montrer le dashboard étudiant.
3. Compléter le profil.
4. Uploader un CV.
5. Consulter les offres.
6. Ouvrir une offre.
7. Lancer le matching IA.
8. Montrer :
   - score ;
   - confidence ;
   - decision label ;
   - Career Signal Map ;
   - Skill Evidence Map ;
   - Decision Trace.
9. Lancer Skill Gap Simulator.
10. Demander un conseil carrière.
11. Postuler.
12. Générer une lettre de motivation.
13. Choisir un ton réel et lancer explicitement Motivation Letter V2.
14. Montrer les preuves, compétences, affirmations évitées, contrôles qualité
    et avertissements retournés.
15. Retrouver la lettre dans la liste, la modifier puis la partager.

La lettre exige une candidature déjà créée et un CV analysé. La démonstration
ne doit pas laisser entendre qu'elle est envoyée automatiquement à
l'entreprise. Une version modifiée manuellement est signalée comme telle.

## Scénario entreprise

1. Se connecter comme entreprise.
2. Montrer le dashboard.
3. Créer ou modifier une offre.
4. Lancer Offer Quality Analyzer.
5. Montrer les issues et recommandations.
6. Consulter les candidatures reçues.
7. Montrer le classement candidat si des données existent.

## Scénario admin

1. Se connecter comme admin si un compte existe.
2. Ouvrir dashboard admin.
3. Montrer utilisateurs et entreprises.
4. Modifier le statut d'un utilisateur ou d'une entreprise si pertinent.

## Points forts à montrer

- IA explicable ;
- sécurité cookies HttpOnly + CSRF ;
- séparation des rôles ;
- matching avec preuves ;
- simulateur de gaps ;
- analyse qualité des offres ;
- lettre de motivation prudente ;
- suite d'évaluation IA.

## Questions possibles du jury

### Le score IA est-il une décision finale ?

Non. C'est une estimation d'aide à la décision. Il doit être interprété avec les explications, les preuves et le niveau de confiance.

### Pourquoi ne pas stocker le JWT dans localStorage ?

Pour réduire le risque de vol par XSS. Le JWT est dans un cookie HttpOnly.

### Le simulateur garantit-il une augmentation du score ?

Non. Il estime un potentiel si l'étudiant ajoute une preuve réelle dans son CV ou portfolio.

### Que se passe-t-il si le CV est pauvre ?

Le système baisse la confiance et recommande d'enrichir le CV au lieu d'inventer des compétences.


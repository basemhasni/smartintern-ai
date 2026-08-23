# Docker Hub Registry avec Jenkins

## Objectif

La Step 5 publie les images validées par Jenkins vers Docker Hub. Le stage de
publication s'exécute uniquement après les tests applicatifs, la construction
des images, le smoke test Docker Compose et tous les healthchecks.

## Architecture

Jenkins construit et valide localement les cinq images, puis ouvre une session
Docker Hub temporaire uniquement pour le stage `Registry Publish`. Les images
sont taguées dans le namespace du compte fourni par Jenkins Credentials. Docker
Hub ne reçoit donc aucune image avant la réussite complète des validations CI et
du smoke test de la stack Compose.

## Credential Jenkins

Créer un credential global Jenkins avec les propriétés suivantes :

| Propriété | Valeur attendue |
| --- | --- |
| Kind | `Username with password` |
| ID | `dockerhub-smartintern` |
| Username | nom d'utilisateur Docker Hub |
| Password | Personal Access Token Docker Hub avec accès en écriture |

Ne jamais utiliser le mot de passe du compte Docker Hub dans le pipeline. Le
token reste uniquement dans Jenkins Credentials et n'est ni versionné ni
affiché dans les logs.

## Repositories Docker Hub

Créer les cinq repositories publics dans le namespace du compte utilisé par le
credential :

- `smartintern-frontend`
- `smartintern-backend`
- `smartintern-backend-migrate`
- `smartintern-ai`
- `smartintern-postgres`

Leur visibilité attendue pour cette étape est `Public`. Le token doit disposer
au minimum des droits de lecture et d'écriture sur ces repositories.

## Stratégie de tags

Chaque publication utilise un tag immutable composé des 12 premiers caractères
du commit Git construit par Jenkins :

```text
DOCKERHUB_USERNAME/smartintern-frontend:COMMIT_SHA
DOCKERHUB_USERNAME/smartintern-backend:COMMIT_SHA
DOCKERHUB_USERNAME/smartintern-backend-migrate:COMMIT_SHA
DOCKERHUB_USERNAME/smartintern-ai:COMMIT_SHA
DOCKERHUB_USERNAME/smartintern-postgres:COMMIT_SHA
```

Le tag `latest` est publié uniquement depuis `main`. Une exécution directe des
branches de validation DevOps autorisées publie seulement le tag SHA, sans
modifier les images stables. Toutes les autres branches ignorent le stage de
publication.

## Branches autorisées

La publication est limitée à :

- `devops/step-5-dockerhub-registry` : cinq tags SHA, aucun `latest` ;
- `devops/step-6-sonarqube-quality-gate` : cinq tags SHA après Quality Gate
  `OK`, aucun `latest` ;
- `main` : cinq tags SHA et cinq tags `latest`.

Les Pull Requests et les autres branches conservent les tests, builds et smoke
tests du pipeline, mais le stage `Registry Publish` y est ignoré.

## Authentification et sécurité

Le pipeline récupère le credential avec `withCredentials`, désactive la trace
shell pendant le login et transmet le token à `docker login` via
`--password-stdin`. La configuration Docker d'authentification est créée dans
un dossier temporaire propre au build.

Un trap shell garantit les opérations suivantes à la sortie du stage, y
compris après un échec de push :

- `docker logout` ;
- suppression de la configuration Docker temporaire ;
- suppression des tags Docker Hub créés localement.

Le bloc Jenkins `post { always { ... } }` conserve le nettoyage Step 4 : stack
Compose, volumes CI, images locales du commit et workspace. Aucun nettoyage ne
supprime une image du registry distant.

## Ordre du pipeline

```text
Checkout
Preflight
Application CI
Compose Validation
SonarQube Analysis
Quality Gate
Docker Build
Compose Smoke Test
Registry Publish
Final Summary
Cleanup
```

Une erreur dans une étape précédente empêche la publication. Une erreur de
login, de tag ou de push fait échouer le pipeline.

## Configuration manuelle

1. Créer les cinq repositories dans Docker Hub.
2. Créer un Personal Access Token Docker Hub avec accès en écriture.
3. Dans Jenkins, ouvrir **Manage Jenkins > Credentials > System > Global
   credentials**.
4. Ajouter un credential `Username with password` avec l'ID exact
   `dockerhub-smartintern`.
5. Renseigner le username Docker Hub et utiliser le token comme password.
6. Lancer la branche `devops/step-5-dockerhub-registry` pour valider uniquement
   les tags SHA.
7. Après merge, vérifier qu'un build `main` publie le même tag SHA et `latest`.

## Vérifications

Après un build Step 5 réussi, vérifier dans Docker Hub que les cinq repositories
contiennent le tag SHA affiché par Jenkins et qu'aucun `latest` n'a été ajouté.
Après un build `main` réussi, vérifier que le tag SHA et `latest` sont présents.

Ne jamais copier le token dans un fichier `.env`, le `Jenkinsfile`, la
documentation ou la console Jenkins.

## Troubleshooting

- `CredentialsId ... could not be found` : vérifier l'ID exact
  `dockerhub-smartintern` dans le domaine global Jenkins.
- `unauthorized` pendant le login ou le push : vérifier le username et les
  droits `Read & Write` du Personal Access Token sans l'afficher dans les logs.
- `requested access to the resource is denied` : vérifier que le repository
  existe dans le même namespace que le username du credential.
- tag SHA absent : consulter le premier `docker push` en erreur dans le Console
  Output Jenkins ; le pipeline ne masque pas les échecs de publication.
- `latest` absent sur la branche Step 5 : comportement attendu ; il est réservé
  à `main`.

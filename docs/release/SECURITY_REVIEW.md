# Revue sécurité — 7 novembre 2026

Politique : Trivy 0.68.2, HIGH/CRITICAL visibles ; toute CRITICAL avec correctif et
toute détection de secret bloquent la release. Aucune exclusion CVE ajoutée.
Les rapports expurgés sont sous `artifacts/security/*.summary.json` (ignorés par Git)
et archivables dans Jenkins. Les extraits et valeurs des secrets ne sont pas publiés.

## Correctifs réellement appliqués

- CSRF : l'en-tête mobile n'exempte plus une session par cookie.
- JWT production : rejet des placeholders et secrets composés d'un seul caractère.
- CV : aucun texte ou compétence déduit d'un nom de fichier après échec du parsing.
- Lockfiles npm : mises à jour compatibles, notamment multer, body-parser,
  follow-redirects et shell-quote. Aucune mise à jour majeure forcée.
- Correctifs OS disponibles installés dans les quatre images runtime applicatives
  et l'image de migration, dont nginx et bibliothèques système.
- Node 20 EOL remplacé par Node 22.23.4 LTS épinglé dans les images et agents CI.

## CRITICAL sans correctif retournées par Trivy

Le scan des images après correctifs système a trouvé les avis suivants sans
`FixedVersion`. La politique les laisse visibles ; cela ne signifie pas qu'ils
sont corrigés ou que leur exploitabilité a été exclue.

| CVE | Paquet installé | Images concernées |
| --- | --- | --- |
| CVE-2023-45853 | zlib1g 1:1.2.13.dfsg-1 | backend, backend-migrate, AI, PostgreSQL |
| CVE-2025-7458 | libsqlite3-0 3.40.1-2+deb12u2 | AI, PostgreSQL |
| CVE-2026-6653 | libxml2 2.9.14+dfsg-1.3~deb12u6 | PostgreSQL |

Réévaluer les correctifs et l'exposition avant tout hébergement public. Ne pas
transformer le succès du gate en annonce de zéro vulnérabilité. Le scan final des
images sous le SHA de validation reste la référence pour le commit testé.

## HIGH restantes dans les dépendances

- `deepmerge-ts 7.1.5` : correctif 8.0.0 ; dépendance de Prisma CLI/config.
  L'audit npm propose une migration majeure Prisma pour la supprimer. Cette migration
  n'est pas forcée dans une stabilisation ; l'API/runtime est scannée séparément.
- `image-size 1.2.1` : CVE-2025-71329 et CVE-2025-71330, correctif 2.0.3.
  Dépendance transitive des outils mobile ; le changement majeur doit être validé
  par la chaîne Expo. Ne pas ajouter un override incompatible pour masquer l'avis.
- Les audits npm signalent aussi des avis modérés sur les outils de développement.
  Le gate natif échoue à partir de CRITICAL ; les autres résultats restent visibles.

## Configurations restantes

Les avertissements Trivy sur le filesystem PostgreSQL inscriptible, certains
manifests Kubernetes historiques, le démarrage root des images PostgreSQL/Docker-in-
Docker et l'image locale d'outillage restent documentés. Le contrôleur Jenkins
démarre root pour installer la CA locale puis lance Jenkins en utilisateur `jenkins`
via `setpriv`, comme le montre son entrypoint. Docker-in-Docker exige les privilèges
de la configuration CI existante. Aucun avis n'est supprimé du rapport.

## Secrets

Les fichiers suivis ont été inventoriés et le scan filesystem n'a détecté aucun
secret. Les seuls `.env` suivis sont des exemples (hors fichier de code de config).
Les dumps, clés/certificats runtime et kubeconfig de validation sont ignorés.
Aucune révocation ou rotation de secret n'est annoncée : aucune fuite réelle n'a
été détectée dans ce contrôle de l'arbre de travail. L'historique Git complet
n'a pas fait l'objet d'un audit spécialisé des secrets.

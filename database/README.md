# Database - SmartIntern AI

## PostgreSQL avec pgvector

Le RAG futur utilisera PostgreSQL avec l'extension `pgvector` pour stocker et rechercher des embeddings vectoriels.

Commande Docker recommandee pour une base compatible pgvector :

```bash
docker run --name smartintern-postgres-pgvector \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=smartintern_ai \
  -p 5433:5432 \
  -d pgvector/pgvector:pg16
```

Commande SQL future :

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Pour l'instant, le backend utilise `VectorDocument.embeddingJson` comme stockage MVP compatible Prisma. Le passage au type `vector` reel sera fait plus tard, sans recreer automatiquement la base ni supprimer les donnees existantes.

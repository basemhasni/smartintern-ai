FROM pgvector/pgvector:pg16@sha256:7b822b0aac60967beb1ea5e576b8602c94c300a157d187f385ae3e0da199b90a

RUN apt-get update \
  && apt-get install --yes --no-install-recommends gosu \
  && rm /usr/local/bin/gosu \
  && rm -rf /var/lib/apt/lists/*

COPY init/01-enable-vector.sql /docker-entrypoint-initdb.d/01-enable-vector.sql

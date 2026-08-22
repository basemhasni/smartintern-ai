FROM docker:28.3.2-dind

COPY --chmod=0755 trust-local-ca-entrypoint.sh /usr/local/bin/trust-local-ca-entrypoint

ENTRYPOINT ["trust-local-ca-entrypoint"]

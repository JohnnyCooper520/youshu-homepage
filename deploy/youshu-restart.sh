#!/usr/bin/env bash
set -euo pipefail

CONTAINER_NAME="${CONTAINER_NAME:-youshu-domestic}"
IMAGE="${YOUSHU_IMAGE:-youshu-domestic:6517f44}"
ENV_FILE="${YOUSHU_ENV_FILE:-/etc/youshu/youshu.env}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing environment file: $ENV_FILE" >&2
  exit 1
fi

docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
docker run -d \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  --env-file "$ENV_FILE" \
  -p 127.0.0.1:8788:8788 \
  "$IMAGE" >/dev/null

for _ in {1..30}; do
  if curl -fsS http://127.0.0.1:8788/healthz >/dev/null; then
    echo "$CONTAINER_NAME is healthy"
    exit 0
  fi
  sleep 1
done

echo "$CONTAINER_NAME failed its health check" >&2
docker logs --tail 80 "$CONTAINER_NAME" >&2 || true
exit 1

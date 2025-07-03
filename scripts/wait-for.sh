+#!/bin/sh
# Uso: wait-for host:port -- comando args...
hostport="$1"; shift
host="${hostport%:*}"
port="${hostport#*:}"

echo "⏳ Esperando $host:$port..."
while ! nc -z "$host" "$port" >/dev/null 2>&1; do sleep 0.3; done
echo "✅ $host:$port disponible"

exec "$@"
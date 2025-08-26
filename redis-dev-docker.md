# Guía rápida: Redis 7 en modo **dev** con Docker

Esta guía te lleva **desde cero** (instalar Docker) hasta **tener Redis 7 corriendo** en modo desarrollo, con persistencia y comandos básicos para el día a día.

> **Resumen express**  
> - Instala Docker (Desktop en Windows/macOS, Engine en Linux).  
> - Crea un volumen persistente.  
> - Descarga la imagen `redis:7`.  
> - Levanta el contenedor mapeando el puerto 6379 (solo a localhost) y con AOF activado.  
> - (Opcional) Añade contraseña de desarrollo.  

---

## 1) Instalar Docker

### Windows 10/11 y macOS (Docker Desktop)
1. Descarga e instala **Docker Desktop** desde el sitio oficial.
2. En Windows, asegúrate de que **WSL2** esté habilitado (Docker Desktop lo guía si hace falta).
3. Verifica la instalación:
   ```bash
   docker --version
   docker run hello-world
   ```

### Linux (Ubuntu/Debian: Docker Engine)
> Usa estos comandos si **no** tienes Docker instalado aún.
```bash
# Paquetes de soporte
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg

# Clave GPG y repo oficial
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker Engine + Compose v2
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Permitir usar docker sin sudo (opcional)
sudo usermod -aG docker $USER
newgrp docker

# Probar
docker run hello-world
```

---

## 2) Descargar la imagen de Redis 7
```bash
docker pull redis:7
```

---

## 3) Crear un volumen persistente (recomendado incluso en dev)
```bash
docker volume create redis-data
```

Esto evita perder datos cuando recrees el contenedor (por ejemplo, cuando cambias flags).

---

## 4) Levantar el contenedor en modo **dev**

### Opción A: comando `docker run`
```bash
docker run -d --name redis-dev \
  -p 127.0.0.1:6379:6379 \
  -v redis-data:/data \
  redis:7 \
  --appendonly yes \
  --save "" \
  --protected-mode yes
```
**Qué hace esto:**
- `-p 127.0.0.1:6379:6379`: expone Redis **solo a localhost** (no accesible desde Internet).
- `-v redis-data:/data`: persistencia de datos (AOF, snapshots si activas `save`).
- `--appendonly yes`: activa AOF (persistencia amigable para dev).
- `--save ""`: desactiva snapshots RDB (para dev puro); puedes quitarlos si los quieres.
- `--protected-mode yes`: evita conexiones remotas por accidente.

**(Opcional) Contraseña de desarrollo**
```bash
docker run -d --name redis-dev \
  -p 127.0.0.1:6379:6379 \
  -v redis-data:/data \
  redis:7 \
  --appendonly yes --save "" --protected-mode yes \
  --requirepass dev_pass_123
```
> *Tip:* usa una contraseña distinta en producción.


### Opción B: `docker compose` (recomendado para repetir entornos)
Crea un archivo `compose.yml` junto a tu proyecto con este contenido:

```yaml
services:
  redis:
    image: redis:7
    container_name: redis-dev
    ports:
      - "127.0.0.1:6379:6379"
    command: ["redis-server", "--appendonly", "yes", "--save", "", "--protected-mode", "yes"]
    # Añade esta línea si quieres password:
    # command: ["redis-server", "--appendonly", "yes", "--save", "", "--protected-mode", "yes", "--requirepass", "dev_pass_123"]
    volumes:
      - redis-data:/data
    restart: unless-stopped

volumes:
  redis-data:
```

Levántalo con:
```bash
docker compose up -d
```

---

## 5) Verificación y uso mínimo

```bash
# Ver versión del servidor (desde el host)
docker exec -it redis-dev redis-server --version

# Ping
docker exec -it redis-dev redis-cli ping

# Con password (si activaste --requirepass)
docker exec -it redis-dev redis-cli -a dev_pass_123 ping

# Escribir y leer una clave
docker exec -it redis-dev redis-cli set saludo "hola"
docker exec -it redis-dev redis-cli get saludo
```

Logs:
```bash
docker logs -f redis-dev
```

Abrir una shell dentro del contenedor (útil para debug):
```bash
docker exec -it redis-dev sh
```

---

## 6) Arranque/paro/ciclo de vida

```bash
# Detener
docker stop redis-dev

# Arrancar de nuevo
docker start redis-dev

# Reiniciar
docker restart redis-dev

# Eliminar contenedor (datos persisten en el volumen)
docker rm -f redis-dev

# Eliminar volumen (borra tus datos)
docker volume rm redis-data
```

---

## 7) Conexión desde Node.js (ioredis)

```ts
import { Redis } from "ioredis";

// sin password
const redis = new Redis("redis://127.0.0.1:6379");

// con password
// const redis = new Redis("redis://default:dev_pass_123@127.0.0.1:6379");

(async () => {
  console.log(await redis.ping()); // PONG
  await redis.set("clave", "valor");
  console.log(await redis.get("clave")); // "valor"
  await redis.quit();
})();
```

---

## 8) Notas y consejos para **dev**
- Mantén el puerto ligado a `127.0.0.1` para evitar accesos externos durante desarrollo.
- Usa **AOF** para una persistencia simple. En proyectos grandes, añade métricas con `redis_exporter` (Prometheus).
- Si quieres resets fáciles, borra el volumen (`docker volume rm redis-data`) o monta un directorio del host para inspeccionar los archivos AOF.
- Para probar latencias: `docker exec -it redis-dev redis-cli --latency`.

---

## 9) ¿Cómo cambio el puerto o el nombre del contenedor?
- Cambia `-p 127.0.0.1:6380:6379` para usar el puerto **6380** en el host.
- Cambia `--name redis-dev` por otro nombre y ajusta tus scripts.

---

¡Listo! Con esto tienes Redis 7 en Docker para uso **developer-friendly**, seguro en local y listo para integrarlo con tus servicios (Bull/BullMQ, cachés, etc.).

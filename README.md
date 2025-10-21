# Solución Contable – Guía de instalación **clásica** (sin Docker)

> 👤 **Público objetivo**: desarrolladores que quieran levantar _backend_ y _frontend_ localmente, sin contenedores.
>
> 🕑 **Tiempo estimado**: 10‑15 min.

---

## 0. Requisitos previos

| Paquete      | Versión recomendada | Instalación rápida                                                                                                        |
| ------------ | ------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Git**      | —                   | [https://git-scm.com/download](https://git-scm.com/download)                                                              |
| **Node.js**  | **v22.x** + `npm`   | [https://nodejs.org/en/download](https://nodejs.org/en/download)                                                          |
| **Java JDK** | **17**              | *Ubuntu* `sudo apt install openjdk-17-jdk` · _Windows_ Adoptium MSI · *macOS* `brew install openjdk@17`                   |
| **MySQL**    | **8.0.x**           | *Linux* `sudo apt install mysql-server` · *Windows/macOS* [**XAMPP/MAMP**](https://www.apachefriends.org/index.html)      |
| **Redis**    | **7.x**             | *Ubuntu* `sudo apt install redis-server` · *Windows* (Winget) `winget install redis.redis` · *macOS* `brew install redis` |

> El backend usa `xml-validator`, que requiere `java` y `javac` en el `PATH`.

---

## 1. Clona y actualiza el repositorio

```bash
# 1️⃣ Clonar
git clone https://github.com/ErcokQ/solucion-contable.git
cd solucion-contable

# 2️⃣ Siempre antes de empezar a trabajar
git pull
```

---

## 2. Variables de entorno

Crea (o verifica) la carpeta `.env` y dentro añade:

```
.env
.env.development
.env.production
```

> El backend lee `.env.development` por defecto. Añade estos archivos a tu `.gitignore`.

### 2.1 Ejemplo de `.env` (modo dev)

```dotenv
# App
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug
BASE_SERVER='/api/sc/v1'
URL_FRONTEND='http://localhost:4200'

# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=devuser
DB_PASS=devpass
DB_ROOT_PASS=rootpass
DB_NAME=scrework

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=devJwtSecret123
JWT_REFRESH_SECRET=devRefreshJwtSecret123
```

### 2.2 Crear base y usuario en MySQL

```sql
CREATE DATABASE scrework CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'devuser'@'localhost' IDENTIFIED BY 'devpass';
GRANT ALL PRIVILEGES ON scrework.* TO 'devuser'@'localhost';
FLUSH PRIVILEGES;
```

> Asegúrate de que MySQL y Redis están corriendo (`systemctl start mysql redis`).

---

## 3. Backend – instalar dependencias y preparar BD

```bash
# Instalar paquetes
npm ci

# Migraciones
npm run mig:run

# Seed de usuario administrador
npm run seed:admin
```

---

## 4. Levanta el backend

Abre **dos terminales** en la raíz del proyecto:

| Terminal | Comando          | Descripción                                     |
| -------- | ---------------- | ----------------------------------------------- |
| 1        | `npm run dev`    | API Express con **hot‑reload** (`ts-node-dev`). |
| 2        | `npm run worker` | Worker BullMQ que procesa colas (Redis).        |

- API 👉 [http://localhost:3000/api/sc/v1](http://localhost:3000/api/sc/v1)
- Swagger 👉 [http://localhost:3000/docs](http://localhost:3000/docs)

---

## 5. Frontend Angular

```bash
cd front
npm ci
npm start        # ng serve --host 0.0.0.0 --port 4200
```

### 5.1 Configura el `environment.ts`

```ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000/api/sc/v1',
};
```

Abre [http://localhost:4200](http://localhost:4200). Si cambiaste puertos/dominios, ajusta `apiBaseUrl`.

> **Proxy opcional** para evitar CORS mientras desarrollas sólo el front:
>
> ```json
> // front/proxy.conf.json
> {
>   "/api": {
>     "target": "http://localhost:3000",
>     "secure": false
>   }
> }
> ```
>
> Lanza `ng serve --proxy-config proxy.conf.json`.

---

## 6. Scripts útiles (backend)

| Comando                | Descripción                                                   |
| ---------------------- | ------------------------------------------------------------- |
| `npm run mig:create`   | Crea migración vacía (TypeORM).                               |
| `npm run mig:generate` | Genera migración comparando modelo ↔ BD.                     |
| `npm run mig:revert`   | Revierte última migración.                                    |
| `npm run test`         | Pruebas unitarias con **Vitest**.                             |
| `npm run docs:serve`   | Swagger UI en [http://localhost:4000](http://localhost:4000). |
| `npm run format`       | Formateo con **Prettier**.                                    |
| `npm run lint`         | Revisión **ESLint**.                                          |

---

## 7. Resolución de problemas

| Síntoma                                 | Solución sugerida                                             |
| --------------------------------------- | ------------------------------------------------------------- |
| `ECONNREFUSED localhost:3306`           | Inicia MySQL o verifica puerto.                               |
| `MODULE_NOT_FOUND @shared/...`          | Lanza la API con `npm run dev` (incluye `tsconfig-paths`).    |
| `setup failed Error: Java SDK required` | Verifica `java -version` y `javac -version` (JDK 17 en PATH). |

---

> **¡Listo!** Con esto tendrás backend y frontend funcionando en tu máquina. Cualquier duda abre un _issue_ en el repositorio.

# Despliegue a Producción · **Frontend Angular** (modo tradicional, sin contenedores)

> Esta guía explica cómo construir y publicar el **frontend Angular** en un servidor clásico (Nginx o Apache) sin Docker.
> Primero el **front**; en una guía separada cubriremos el **backend**.

---

## 0 Prerrequisitos

- **Repositorio**: `git clone https://github.com/ErcokQ/solucion-contable.git`
- **Node.js** ≥ **v22** y **npm** (en el servidor de _build_; no se requiere Node en el servidor web si sólo servirá estáticos).
- **Servidor web**: Nginx **o** Apache (a elección).
- **Dominio/host**: `https://tu-dominio.com` (o subdominio), con certificado TLS (Let's Encrypt recomendado).

> Siempre antes de cualquier build: `git pull` en la rama que vayas a publicar.

---

## 1 Configurar el `environment.prod.ts`

Ubicación: `front/src/environments/environment.prod.ts`

```ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://tu-dominio.com/api/sc/v1', // URL real del backend en PROD
};
```

> Si publicarás el front bajo un subpath (p. ej., `https://tu-dominio.com/sc/`), añade en el build `--base-href /sc/ --deploy-url /sc/` para que los assets resuelvan correctamente.

---

## 2 Construir el artefacto de producción

En tu máquina de build (puede ser tu laptop o un runner CI):

```bash
cd solucion-contable/front
npm ci
npm run build   # equivale a: ng build --configuration production
```

El resultado quedará en **`dist/frontend/browser/`** (o **`dist/frontend/`** según `angular.json`).

> Confirma la carpeta exacta tras el build. Ese directorio es el que subirás al servidor web.

---

## 3 Publicar con **Nginx** (recomendado)

### 3.1 Instalar Nginx (Ubuntu)

```bash
sudo apt update && sudo apt install -y nginx
```

### 3.2 Subir artefactos

Copia el contenido del build a tu carpeta de publicación, por ejemplo:

```bash
sudo mkdir -p /var/www/solucion-contable
sudo rsync -av --delete dist/frontend/browser/ /var/www/solucion-contable/
```

### 3.3 Configuración del _server block_

Archivo: `/etc/nginx/sites-available/solucion-contable`

```nginx
server {
  listen 80;
  server_name tu-dominio.com;

  # (Opcional) redirección a https si ya tienes TLS en 443
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl http2;
  server_name tu-dominio.com;

  # Certificados (Let's Encrypt como ejemplo)
  ssl_certificate     /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;

  root /var/www/solucion-contable;
  index index.html;

  # SPA fallback: cualquier ruta no-estática vuelve a index.html
  location / {
    try_files $uri $uri/ /index.html;
  }

  # Cache larga para assets con hash (css/js/img/fonts)
  location ~* \.(?:css|js|woff2?|ttf|eot|svg|png|jpg|jpeg|gif|ico)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  # No cachear el HTML principal
  location = /index.html {
    add_header Cache-Control "no-cache";
  }

  # (Opcional) gzip
  gzip on;
  gzip_types text/plain text/css application/javascript application/json image/svg+xml;
}
```

Activar el sitio y recargar:

```bash
sudo ln -s /etc/nginx/sites-available/solucion-contable /etc/nginx/sites-enabled/solucion-contable
sudo nginx -t && sudo systemctl reload nginx
```

> **TLS**: instala certificados con `snap install certbot` y `sudo certbot --nginx -d tu-dominio.com`.

### 3.4 Deploys posteriores

Para nuevas versiones, sólo vuelve a compilar y sincroniza:

```bash
rsync -av --delete dist/frontend/browser/ /var/www/solucion-contable/
sudo systemctl reload nginx
```

---

## 4 Publicar con **Apache (XAMPP/MAMP)**

1. Ubica la carpeta pública:
   - **XAMPP (Windows/macOS)**: `C:\xampp\htdocs\solucion-contable` o `/Applications/XAMPP/htdocs/solucion-contable`
   - **Apache (Linux)**: `/var/www/html/solucion-contable`

2. Copia el build ahí (contenido de `dist/...`).
3. Agrega un `.htaccess` para el **SPA fallback**:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Cache larga para assets con hash
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
```

4. Reinicia Apache y abre `https://tu-dominio.com/`.

---

## 5 CORS y conexión con el backend

- Asegúrate de que el **backend** permite el **origen** del front en producción (CORS).
- En `environment.prod.ts` usa la URL final del backend (`https://api.tu-dominio.com/api/sc/v1` o similar).
- Si sirves API y front bajo el **mismo dominio**, puedes evitar CORS y simplificar.

> Si el backend está detrás del mismo Nginx, puedes agregar un `location /api/` con `proxy_pass http://127.0.0.1:3000/;`.

---

## 6 Checklist de verificación

- [ ] Ruta raíz carga y no hay errores 404 en consola del navegador.
- [ ] Navegación profunda (refrescar en una ruta distinta a `/`) funciona (SPA fallback).
- [ ] Peticiones a `apiBaseUrl` responden 200/2xx.
- [ ] `index.html` **no** se cachea; assets con hash **sí** (largo plazo).
- [ ] TLS válido (candado) y redirección 80→443 activa.

---

## 7 Flujo de despliegue recomenda

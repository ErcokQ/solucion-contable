# Solución Contable – Guía de instalación **clásica** (sin Docker)

> 👤 **Público objetivo**: desarrolladores que quieran levantar *backend* y *frontend* localmente, sin contenedores.
>
> 🕑 **Tiempo estimado**: 10‑15 min.

---

## 0. Requisitos previos

| Paquete      | Versión recomendada | Instalación rápida                                                                                                        |
| ------------ | ------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Git**      | —                   | [https://git-scm.com/download](https://git-scm.com/download)                                                              |
| **Node.js**  | **v22.x** + `npm`   | [https://nodejs.org/en/download](https://nodejs.org/en/download)                                                          |
| **Java JDK** | **17**              | *Ubuntu* `sudo apt install openjdk-17-jdk` · *Windows* Adoptium MSI · *macOS* `brew install openjdk@17`                   |
| **MySQL**    | **8.0.x**           | *Linux* `sudo apt install mysql-server` · *Windows/macOS* [**XAMPP/MAMP**](https://www.apachefriends.org/index.html)      |
| **Redis**    | **7.x**             | *Ubuntu* `sudo apt install redis-server` · *Windows* (Winget) `winget install redis.redis` · *macOS* `brew install redis` |

> El backend usa ``, que requiere `java` y `javac` en el `PATH`.

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

> El backend lee `` por defecto. Añade estos archivos a tu `.gitignore`.

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
| `npm run mig:generate` | Genera migración comparando modelo ↔ BD.                      |
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

> **¡Listo!** Con esto tendrás backend y frontend funcionando en tu máquina. Cualquier duda abre un *issue* en el repositorio.


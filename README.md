
---

# CoScript

**Collaborative Real-Time Coding Platform**

CoScript is a collaborative coding platform where users can create and join workspaces, write and manage code files and folders in real-time with others. It features a code editor, workspace management, and real-time collaboration powered by WebSockets.

Built with:
- **Frontend:** React
- **Backend:** NestJS + WebSockets
- **Monorepo Management:** Turborepo
- **Database:** PostgreSQL (Docker)

---
## Features

- User authentication (Signup/Login) with JWT-based authorization
- Dashboard for creating, updating, and managing workspaces
- Join existing workspaces using an invite code
- Real-time collaborative code editor with multi-user live updates
- Create, edit, and delete files and folders within workspaces
- Efficient monorepo management and caching with Turborepo

---

## Project Structure

This monorepo contains the following applications and packages:

| Name | Description |
| :--- | :---------- |
| `apps/api` | NestJS backend (with WebSocket support) |
| `apps/web` | React frontend |

Each package and app is fully written in **TypeScript**.

---


## Getting Started

Follow these steps to set up CoScript locally:

### 1. Clone the Repository

```bash
git clone <repo-url>
cd CoScript
```

### 2. Install Dependencies

```bash
npm install
```

> This will install all dependencies across the monorepo.

### 3. Set Up the Database

Navigate to the API app:

```bash
cd apps/api
```

Build and start the PostgreSQL database using Docker:

```bash
docker compose up -d
```

> Make sure to update the database credentials if needed by editing `docker-compose.yml` and your environment variables.

### 4. Generate Prisma Client

Still inside `apps/api`, generate the Prisma client:

```bash
npx prisma generate
```

### 5. Configure Environment Variables

Create `.env` files for both the backend and frontend using the provided `sample.env` as reference.

- For `apps/api/.env`
- For `apps/web/.env`

Make sure to correctly set database credentials, API URLs, and WebSocket URLs.

### 6. Run the Development Servers

At the root of the project:

```bash
npm run dev
```

This will run both the frontend and backend in development mode.

---

## Building for Production

To build all applications and packages for production:

```bash
npm run build
```

This will:

- Compile TypeScript code
- Bundle frontend assets
- Prepare Prisma client
- Generate build outputs for deployment

---

## Remote Caching (Optional)

CoScript uses **Turborepo** for task running and caching. To enable remote caching with Vercel:

```bash
npx turbo login
npx turbo link
```

This will allow sharing caches across CI/CD and team members for faster builds.

---


## Learn More

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://react.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)

---

# License

Distributed under the MIT License. See `LICENSE` for more information.

---

# Notes

- Make sure Docker is installed and running before setting up the database.
- Ensure Node.js (v18+) and npm are installed.

---

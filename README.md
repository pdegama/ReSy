# ReSy

Standard full-stack starter with a Go Fiber backend and React Vite frontend.

## Structure

- `backend` - Go Fiber API
- `frontend` - React + Vite app

## Backend

```bash
cd backend
go mod tidy
go run ./cmd/api
```

Default API URL: `http://localhost:8080`

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Default app URL: `http://localhost:5173`

## Production Docker

Copy the Docker env example and change the Postgres password before running:

```bash
cp .env.docker.example .env
docker compose up --build -d
```

Production app URL: `http://localhost`

The compose stack runs:

- `frontend` - Nginx serving the built React app and proxying `/api` to the backend
- `backend` - compiled Go Fiber API
- `postgres` - Postgres 16 with persistent data in the `postgres-data` Docker volume

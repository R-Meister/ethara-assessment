# Inventory & Order Management System

A full-stack inventory and order management system built with FastAPI, React, and PostgreSQL.

## Tech Stack

- **Backend:** Python, FastAPI, SQLAlchemy, PostgreSQL
- **Frontend:** React (Vite), JavaScript
- **Database:** PostgreSQL 16
- **Containerization:** Docker, Docker Compose

## Features

- Product management (CRUD) with unique SKU validation
- Customer management with unique email validation
- Order creation with automatic stock reduction and total calculation
- Inventory validation - orders rejected when stock is insufficient
- Dashboard with summary statistics
- Responsive UI for desktop and mobile

## Quick Start

```bash
docker compose up --build -d
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /products/ | Create product |
| GET | /products/ | List products |
| GET | /products/{id} | Get product |
| PUT | /products/{id} | Update product |
| DELETE | /products/{id} | Delete product |
| POST | /customers/ | Create customer |
| GET | /customers/ | List customers |
| GET | /customers/{id} | Get customer |
| DELETE | /customers/{id} | Delete customer |
| POST | /orders/ | Create order |
| GET | /orders/ | List orders |
| GET | /orders/{id} | Get order |
| DELETE | /orders/{id} | Cancel order |
| GET | /dashboard | Dashboard stats |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| DATABASE_URL | postgresql://postgres:postgres@db:5432/inventory_db | PostgreSQL connection string |
| POSTGRES_USER | postgres | Database user |
| POSTGRES_PASSWORD | postgres | Database password |
| POSTGRES_DB | inventory_db | Database name |

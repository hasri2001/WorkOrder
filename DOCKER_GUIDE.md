# Docker Deployment Guide

Complete guide to running the Work Order Management System with Docker and Docker Compose.

---

## Prerequisites

- **Docker** 20.10+ ([Install Docker](https://docs.docker.com/get-docker/))
- **Docker Compose** 2.0+ (included with Docker Desktop)

---

## Quick Start

### 1. Clone and Configure

```bash
# Clone the repository
git clone <repository-url>
cd work-order-system

# Copy environment file (optional - uses defaults if not present)
cp .env.docker.example .env

# Edit .env if needed (database password, JWT secret, etc.)
nano .env
```

### 2. Start All Services

```bash
# Build and start all containers
docker-compose up -d

# View logs
docker-compose logs -f

# Check container status
docker-compose ps
```

**Services Started:**
- **PostgreSQL**: `localhost:5432`
- **Backend API**: `localhost:8080`
- **Frontend**: `localhost:3000`

### 3. Seed the Database

```bash
# Run seed script inside backend container
docker-compose exec backend npm run seed
```

### 4. Access the Application

Open your browser to **http://localhost:3000**

**Demo Accounts:**
- Admin: `admin@example.com` / `Admin123!`
- Manager: `manager@example.com` / `Manager123!`
- Operator: `operator@example.com` / `Operator123!`

---

## Docker Compose Commands

### Start Services

```bash
# Start in foreground (see logs)
docker-compose up

# Start in background (detached)
docker-compose up -d

# Start specific service
docker-compose up -d postgres
```

### Stop Services

```bash
# Stop all services
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (deletes database data)
docker-compose down -v
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Rebuild Containers

```bash
# Rebuild all images
docker-compose build

# Rebuild specific service
docker-compose build backend

# Rebuild and restart
docker-compose up -d --build
```

### Execute Commands in Containers

```bash
# Run seed script
docker-compose exec backend npm run seed

# Access backend shell
docker-compose exec backend sh

# Access PostgreSQL CLI
docker-compose exec postgres psql -U postgres -d work_orders

# Run migrations (if implemented)
docker-compose exec backend npm run migration:run
```

---

## Container Details

### PostgreSQL Container

**Image**: `postgres:15-alpine`  
**Port**: `5432`  
**Volume**: `postgres_data` (persists database)

**Environment Variables:**
- `POSTGRES_DB`: Database name (default: `work_orders`)
- `POSTGRES_USER`: Database user (default: `postgres`)
- `POSTGRES_PASSWORD`: Database password (default: `postgres`)

**Health Check**: Ensures database is ready before starting backend

### Backend Container

**Base Image**: `node:18-alpine`  
**Port**: `8080`  
**Build**: Multi-stage (builder + production)

**Features:**
- Optimized production build
- Only includes `dist/` folder and `node_modules` (production)
- Auto-starts after PostgreSQL is healthy

**Environment Variables:**
- `DB_HOST`: postgres (container name)
- `DB_PORT`: 5432
- `JWT_SECRET`: JWT signing key
- `PORT`: 8080

### Frontend Container

**Base Images**: 
- Builder: `node:18-alpine`
- Runtime: `nginx:alpine`

**Port**: `80` (mapped to `3000` on host)

**Features:**
- Vite production build
- Nginx serves static files
- SPA routing configured
- Gzip compression enabled
- Security headers

---

## Production Deployment

### 1. Update Environment Variables

```bash
# Edit .env for production
nano .env
```

**Critical Changes:**
- `JWT_SECRET`: Use a strong random secret (32+ characters)
- `DB_PASSWORD`: Use a strong password
- Update `VITE_API_URL` in docker-compose.yml to your domain

### 2. Build for Production

```bash
# Build all images
docker-compose build

# Tag images for registry
docker tag workorder-backend:latest your-registry.com/workorder-backend:v1.0.0
docker tag workorder-frontend:latest your-registry.com/workorder-frontend:v1.0.0

# Push to registry
docker push your-registry.com/workorder-backend:v1.0.0
docker push your-registry.com/workorder-frontend:v1.0.0
```

### 3. Deploy to Server

```bash
# Copy docker-compose.yml and .env to server
scp docker-compose.yml .env user@server:/app/

# SSH to server and start
ssh user@server
cd /app
docker-compose up -d

# Seed database
docker-compose exec backend npm run seed
```

### 4. Setup Reverse Proxy (Nginx)

```nginx
# /etc/nginx/sites-available/workorder.example.com
server {
    listen 80;
    server_name workorder.example.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name workorder.example.com;
    
    ssl_certificate /etc/letsencrypt/live/workorder.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/workorder.example.com/privkey.pem;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Backend API
    location /api/ {
        rewrite ^/api(.*)$ $1 break;
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 5. Setup SSL with Let's Encrypt

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d workorder.example.com

# Auto-renewal is configured by default
```

---

## Troubleshooting

### Backend Won't Start

```bash
# Check logs
docker-compose logs backend

# Common issues:
# 1. Database not ready - wait a few seconds and check again
# 2. Port 8080 already in use - change PORT in .env
# 3. Environment variables not set - check .env file
```

### Database Connection Error

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Verify connectivity
docker-compose exec backend ping postgres

# Connect manually
docker-compose exec postgres psql -U postgres -d work_orders
```

### Frontend Not Loading

```bash
# Check frontend logs
docker-compose logs frontend

# Verify backend is accessible
curl http://localhost:8080/health

# Check nginx configuration
docker-compose exec frontend cat /etc/nginx/conf.d/default.conf
```

### Container Keeps Restarting

```bash
# Check logs for errors
docker-compose logs --tail=50 <service-name>

# Check health status
docker inspect <container-name> | grep -A 10 Health
```

### Database Data Persistence

```bash
# List volumes
docker volume ls

# Inspect postgres volume
docker volume inspect work-order-system_postgres_data

# Backup database
docker-compose exec postgres pg_dump -U postgres work_orders > backup.sql

# Restore database
cat backup.sql | docker-compose exec -T postgres psql -U postgres work_orders
```

---

## Performance Tuning

### PostgreSQL Configuration

```yaml
# docker-compose.yml
services:
  postgres:
    command:
      - "postgres"
      - "-c"
      - "max_connections=200"
      - "-c"
      - "shared_buffers=256MB"
      - "-c"
      - "effective_cache_size=1GB"
```

### Backend Scaling

```yaml
# docker-compose.yml
services:
  backend:
    deploy:
      replicas: 3  # Run 3 instances
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

Add load balancer (Nginx):
```yaml
  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx-lb.conf:/etc/nginx/nginx.conf
    ports:
      - "8080:80"
    depends_on:
      - backend
```

---

## Monitoring

### Health Checks

```bash
# Backend health
curl http://localhost:8080/health

# Frontend health
curl http://localhost:3000

# Database health
docker-compose exec postgres pg_isready -U postgres
```

### Resource Usage

```bash
# Container stats
docker stats

# Specific container
docker stats workorder-backend
```

### Logs Aggregation

Use Docker logging drivers:
```yaml
# docker-compose.yml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

---

## Cleanup

### Remove Containers

```bash
# Stop and remove containers
docker-compose down

# Remove containers and volumes (deletes database!)
docker-compose down -v

# Remove containers, volumes, and images
docker-compose down -v --rmi all
```

### Remove Unused Docker Resources

```bash
# Remove all stopped containers
docker container prune

# Remove all unused images
docker image prune -a

# Remove all unused volumes
docker volume prune

# Remove everything unused
docker system prune -a --volumes
```

---

## Development vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| Hot Reload | ✅ (volumes) | ❌ (compiled) |
| Source Maps | ✅ | ❌ |
| Minification | ❌ | ✅ |
| ENV Variables | `.env` files | Secrets Manager |
| HTTPS | ❌ | ✅ (Let's Encrypt) |
| Database Sync | `synchronize: true` | Migrations |
| Logging | Console | File + APM |

---

## Additional Resources

- [Docker Docs](https://docs.docker.com/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [NestJS Docker](https://docs.nestjs.com/faq/deployment#docker)
- [Nginx Config Generator](https://www.digitalocean.com/community/tools/nginx)

---

For questions or issues, refer to the main [README.md](README.md) or container logs.

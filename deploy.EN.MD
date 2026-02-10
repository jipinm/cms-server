# Backend Local Development Guide

## Project Overview

A microservice architecture content management system backend based on NestJS (Node.js/TypeScript), supporting MySQL database, Redis cache, and S3 object storage.

## Tech Stack

- **Framework**: NestJS (Node.js/TypeScript)
- **Database**: MySQL (via Prisma ORM)
- **Cache**: Redis (token cache)
- **Security**: JWT authentication, Helmet security headers, Passport authentication strategies
- **API Documentation**: Swagger
- **Logging**: Winston (daily rotation)
- **Configuration Center**: Nacos
- **Object Storage**: Amazon S3 (migrated from Huawei Cloud OBS)

## Environment Requirements

- Node.js >= 16.0.0
- pnpm >= 8.0.0 (recommended)
- MySQL >= 8.0
- Redis >= 6.0

## Install Dependencies

```bash
# Install dependencies using pnpm
pnpm install
```

## Database Configuration

### 1. Create Database

```sql
CREATE DATABASE cms_server CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Configure Database Connection

Edit the `.env.nonacos` file:

```env
# Database configuration
DATABASE_URL="mysql://username:password@127.0.0.1:3306/cms_server"
```

### 3. Database Initialization

#### Method 1: Use SQL Script Initialization (Recommended)

```bash
# Import initial data structure
mysql -h 127.0.0.1 -P 3306 -u username -p cms_server < prisma/init.sql
```

The `prisma/init.sql` file contains:
- Database table structure definitions
- Basic menu data
- System configuration data
- Default permission data

#### Method 2: Use Prisma Migration

```bash
# Generate Prisma client
npx prisma generate

# Run database migration (sync schema)
npx prisma db push

# (Optional) Seed initial data
npx prisma db seed
```

### 4. Database Initialization Check

After initialization is complete, verify the database was created correctly:

```sql
-- Connect to database
mysql -h 127.0.0.1 -P 3306 -u username -p cms_server

-- Check if tables were created successfully
SHOW TABLES;

-- Check if basic data was imported
SELECT COUNT(*) FROM admin_menu;
SELECT COUNT(*) FROM admin_user;
```

Expected core tables include:
- `admin_menu` - System menu table
- `admin_user` - User table
- `admin_role` - Role table
- `admin_permission` - Permission table
- And other business tables

## Environment Configuration

### 1. Copy Environment Configuration File

```bash
cp .env.nonacos.example .env.nonacos
```

### 2. Configure `.env.nonacos`

```env
# Application configuration
NODE_ENV="development"
SERVER_PORT=3000

# Database configuration
DATABASE_URL="mysql://username:password@127.0.0.1:3306/cms_server"

# Redis configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_DATABASE_INDEX=0

# S3 object storage configuration (migrated from OBS)
S3_ACCESS_KEY_ID=your_access_key_id
S3_SECRET_ACCESS_KEY=your_secret_access_key
S3_BUCKET=your_bucket_name
S3_REGION=us-east-1
S3_ENDPOINT=https://s3.amazonaws.com
S3_DOMAIN=https://your-cdn-domain.com
S3_PUBLIC_DIR=platform/public

# JWT configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
```

### 3. Nacos Configuration (Optional)

If using Nacos configuration center, add to `.env.nonacos`:

```env
# Nacos configuration center
NACOS_HOST=your_nacos_host
NACOS_PORT=8848
NACOS_NAMESPACE=your_namespace
NACOS_USERNAME=nacos
NACOS_PASSWORD=nacos
```

## Run Commands

### Development Mode

```bash
# Start development server (auto-restart)
pnpm start:dev

# Or use watch mode
pnpm start:debug
```

### Production Mode

```bash
# Build project
pnpm build

# Start production server
pnpm start:prod
```

### Other Commands

```bash
# Code linting
pnpm lint

# Code formatting
pnpm format

# Code fixing
pnpm fix

# Run unit tests
pnpm test
pnpm test:e2e
pnpm test:cov

# Database related
npx prisma studio
npx prisma migrate dev
npx prisma migrate reset
```

## Project Structure

```
cms_server/
├── src/
│   ├── auth/              # Authentication module
│   ├── common/            # Common module
│   ├── config/            # Configuration module
│   │   └── configurations/ # Configuration loaders
│   ├── database/          # Database services
│   │   ├── obs.service.ts # S3 object storage service
│   │   └── prisma/        # Prisma configuration
│   ├── logger/            # Logging module
│   ├── modules/           # Business modules
│   ├── utils/             # Utility functions
│   ├── main.ts           # Application entry point
│   └── app.module.ts     # Root module
├── prisma/                # Prisma configuration
│   ├── schema.prisma     # Database models
│   └── migrations/        # Migration files
├── upload/                # Upload file directory
├── logs/                  # Log file directory
├── .env.nonacos          # Environment configuration
└── package.json          # Project configuration
```

## API Documentation

After starting the service, visit the following URLs to view API documentation:

- Swagger UI: `http://localhost:3000/api/docs`
- API JSON: `http://localhost:3000/api/docs/json`

## S3 Object Storage Configuration

### 1. AWS S3 Configuration

```env
# AWS S3 standard configuration
S3_ACCESS_KEY_ID=AKIA...
S3_SECRET_ACCESS_KEY=...
S3_BUCKET=your-bucket-name
S3_REGION=us-east-1
S3_ENDPOINT=https://s3.amazonaws.com
S3_DOMAIN=https://your-bucket.s3.amazonaws.com
```

### 2. S3-compatible Storage Services

```env
# Such as MinIO, Alibaba Cloud OSS and other S3-compatible storage services
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET=your-bucket
S3_REGION=us-east-1
S3_ENDPOINT=http://localhost:9000  # MinIO example
S3_DOMAIN=http://localhost:9000/your-bucket
S3_PUBLIC_DIR=platform/public
```

### 3. File Upload Usage Example

```typescript
import { ObsService } from './database/obs.service'

// Upload file
const result = await obsService.uploadFile({
  Key: 'uploads/example.jpg',
  SourceFile: '/path/to/local/file.jpg',
  siteCode: 'chery_xt'
})

// Return file URL
console.log(result.url) // https://your-domain.com/platform/public/chery_xt/uploads/example.jpg
```

## Development Notes

### 1. Database Model Changes

```bash
# 1. Modify prisma/schema.prisma file
# 2. Generate new migration
npx prisma migrate dev --name migration_name

# 3. Regenerate Prisma client
npx prisma generate
```

### 2. Log Viewing

```bash
# View application logs
tail -f logs/app-*.log

# View error logs
tail -f logs/error-*.log
```

### 3. Environment Variable Configuration Priority

1. Production environment: Nacos configuration center
2. Development environment: `nacos-config-example.yaml`
3. Without Nacos: `.env.nonacos` environment variables

### 4. Security Configuration

- Use strong random strings for JWT secrets
- Use complex passwords for database and Redis passwords
- Rotate S3 access keys regularly
- Disable Swagger documentation in production environment

## Common Issues

### 1. Database Connection Failure

Check database configuration and network connection:

```bash
# Test database connection
mysql -h 127.0.0.1 -P 3306 -u username -p cms_server
```

### 2. Database Initialization Failure

If `prisma/init.sql` import fails:

```bash
# Check SQL file syntax
mysql -h 127.0.0.1 -P 3306 -u username -p --execute="SELECT 1"

# Execute SQL file in steps
# First check character set settings
mysql -h 127.0.0.1 -P 3306 -u username -p cms_server < prisma/init.sql
```

Common failure reasons:
- Insufficient database permissions
- Character set mismatch
- SQL syntax version compatibility
- Storage engine not supported

### 3. Database Tables Don't Exist

Application starts with table not found errors:

```bash
# Re-import database
mysql -h 127.0.0.1 -P 3306 -u username -p cms_server < prisma/init.sql

# Or use Prisma sync
npx prisma db push
```

### 4. Redis Connection Failure

Check Redis service status:

```bash
# Check Redis service
redis-cli ping

# Test connection
redis-cli -h localhost -p 6379 -a your_password
```

### 5. S3 Upload Failure

Check S3 configuration and permissions:

- Confirm access keys are correct
- Check bucket permissions
- Verify region configuration
- Confirm endpoint URL is correct

### 6. Port Occupancy

Modify the port in `.env.nonacos`:

```env
SERVER_PORT=3001
```

### 7. Dependency Installation Issues

Clear cache and reinstall:

```bash
# Clear pnpm cache
pnpm store prune

# Delete node_modules
rm -rf node_modules

# Reinstall
pnpm install
```
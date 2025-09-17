<p align="center">
  
</p>

## Description

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Database migrations

This project uses [TypeORM](https://typeorm.io/) for database interactions and migrations. To manage your database schema, you can use the following commands:

```bash
# Create a new migration
$ npm run migration:create src/database/migrations/<MigrationName>

# Generate a new migration
$ npm run migration:generate src/database/migrations/<MigrationName>

# Run migrations
$ npm run migration:run

# Revert last migration
$ npm run migration:revert
```

## Deployment

Run the following commands:

```bash
# 1. Pull the latest changes from the repository
$ git pull origin main

# 2. Install dependencies
$ npm install

# 3. Run database migrations
$ npm run migration:run

# 4. Start the application
$ npm run start
```

<p align="center">
  
</p>

## Description

## Project setup

```bash
# copy and rename .env.example to .env and set your environment variables
$ cp .env.example .env

# install dependencies
$ npm install
```

- Recommended to configure the environment variables with a HTTP tunnel service like [ngrok](https://ngrok.com/) or [devtunnels](https://code.visualstudio.com/docs/remote/tunnels).

- Create a database using docker or locally, and set the connection variables in the `.env` file.

- Create an account in [Mercado Pago](https://www.mercadopago.com.ar/) and get your access token to set the `MP_ACCESS_TOKEN` variable in the `.env` file.

- Create a [Cloudinary](https://cloudinary.com/) account and get your cloud name, API key and API secret to set the `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` variables in the `.env` file.

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

# Drop database
$ npm run db:drop

# Seed database
$ npm run db:seed

# Reset database (drop, migrate, and seed)
$ npm run db:reset
```

## Deployment

Run the following commands:

```bash
# 1. Pull the latest changes from the repository
$ git pull origin main

# 2. Copy and rename .env.example to .env and set your environment variables
$ cp .env.example .env

# 3. Install dependencies
$ npm install

# 4. Run database migrations
$ npm run migration:run

# 5. Start the application
$ npm run start
```

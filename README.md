## Klaytn Blockchain Network Listener and Indexer

### To Start postgres : 
```
docker run --name postgres-local -p 5432:5432 -e POSTGRES_USER=root -e POSTGRES_PASSWORD=rootpassword -e POSTGRES_DB:indexerdb -d postgres
```

### To setup database in postgres : 
```
create database indexerdb;
```

### To create tables : 
```
knex migrate:latest
```

### To input seed data : 
```
knex seed:run
```

### To build all project :
```
lerna run build
```

### environment variables
- Inside `packages/listener` follow the format from `env.example` and create your `.env` file
- Inside `packages/api` follow the format from `env.example` and create your `.env` file

### To start listener in debug mode
```
cd packages/listener
yarn start:dev
```

### To start api server in debug mode
```
cd packages/listener
yarn start:dev
```

### To access graphql playgroud
```
http://localhost:5000/graphql
```
>> Before starting listener make sure you have set the block in DB to recent block so that it does not start syncing the past blocks. If you skip this step then it would take the data that is inserted from your knex seed step.


# Open for contribution

## To do : 
1. Add transaction block
2. Add docker, docker-compose files
3. Add files for kubernetes deployment
4. Improve logging
5. Code refactoring
6. Test scripts
4. Add support for KP7(Fungible token)
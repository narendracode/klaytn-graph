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


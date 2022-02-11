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

### to update schema
```
knex migrate:make add_new_column_to_table
// update file generated under data folder
knex migrate:latest
```

### Graphql Queries
```
query {
  getAllNfts{
    tokenId,
    tokenUri,
    contractAddress
  }
}

query {
  getAllNfts(contractAddress:"0x2ae2e621ee0152d9b13d5b5af25eb1c0f091c682"){
    tokenId,
    tokenUri,
    ownerAddress,
    contractAddress
  }
}

query{
  getAllContracts{
    contractAddress,
    deployerAddress,
    type,
    name,
    symbol,
    totalSupply,
    txhash,
    created_at,
    updated_at
  }
}

query{
  getAllFts{
    contractAddress,
    ownerAddress,
    amount,
    last_txhash,
    created_at,
    updated_at
  }
}

query{
  getAllFTHistory{
    contractAddress,
    from,
    to,
    amount,
    created_at,
    updated_at
  }
}
```

# Open for contribution

## To do : 
1. Add docker, docker-compose files
2. Add files for kubernetes deployment
3. Improve logging
4. Code refactoring
5. Test scripts
6. Add support for KP7(Fungible token)
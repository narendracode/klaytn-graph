import { gql } from 'apollo-server';

export const typeDefs = gql`
    type Contract{
       id:ID
       contractAddress:String
       deployerAddress:String
       type: ContractType
       name: String
       symbol: String
       totalSupply: String
       decimals: String
       txhash: String
       created_at:String
       updated_at: String
    }

    enum ContractType {
        nft
        ft
        other
    }

    type NFT {
        contractAddress: String
        tokenId: String
        tokenUri: String
        ownerAddress: String
        price: String
        createdAt: String
        updatedAt: String
    }

    type FT {
        contractAddress: String
        ownerAddress: String
        amount: String
        last_txhash: String
        created_at: String
        updated_at: String
    }

    type FTHistory {
        contractAddress: String
        from: String
        to: String
        amount: String
        txhash: String
        created_at: String
        updated_at: String
    }

    input ContractInput{
        id: ID
        contractAddress:String
        deployerAddress:String
        name:String
        symbol:String
        type: ContractType
        owner:String
    }

    input NFTInput{
        id: ID
        contractAddress: String
        tokenId: String
        tokenUri: String
        ownerAddress: String
        price: String
    }

    type Query{
        getAllNfts(contractAddress: String, tokenId: String, ownerAddress: String):[NFT]
        getAllContracts(type: String): [Contract]
        getAllFts(contractAddress: String, ownerAddress: String): [FT]
        getAllFTHistory(contractAddress: String, ownerAddress: String): [FTHistory]
    }

    type Mutation{
        createContract(input:ContractInput):Contract
        addANFT(nft:NFTInput):NFT
    }

`;
import { gql } from 'apollo-server';
export const typeDefs = gql`
    type Contract{
       id:ID
       contractAddress:String
       deployer:String
       type: ContractType
       owner:String
       createdAt: String
       updatedAt: String
    }

    enum ContractType {
        nft
        token
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
    }

    type Mutation{
        createContract(input:ContractInput):Contract
        addANFT(nft:NFTInput):NFT
    }

`;
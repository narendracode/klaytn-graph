import * as klaytnGraph from '@klaytn-graph/common'
import { SearchNFTDto, CreateNFTDto, SearchFTDto, CreateContractDto, SearchContractDto } from '@klaytn-graph/common';

export const resolvers = {
    Query: {
        getAllNfts: async (root: any, input: any) => {
            let searchQuery: SearchNFTDto = {}
            const contractAddress = input.contractAddress;
            const ownerAddress = input.ownerAddress;
            const tokenId = input.tokenId;
            console.log(`getAllNFTs resolver with owner : ${ownerAddress}, address : ${contractAddress}, tokenId : ${JSON.stringify(tokenId)}`)

            if (ownerAddress && ownerAddress.length) {
                searchQuery.ownerAddress = ownerAddress;
            }
            if (tokenId && tokenId.length) {
                searchQuery.tokenId = tokenId;
            }
            if (contractAddress && contractAddress.length) {
                searchQuery.contractAddress = contractAddress;
            }

            return await klaytnGraph.commons.nftService.getAllNFTs(searchQuery);
        },
        getAllFts: async (root: any, input: any) => {
            let searchQuery: SearchFTDto = {}
            const contractAddress = input.contractAddress;
            const ownerAddress = input.ownerAddress;
            console.log(`getAllFTs resolver with owner : ${ownerAddress}, address : ${contractAddress}}`)

            if (ownerAddress && ownerAddress.length) {
                searchQuery.ownerAddress = ownerAddress;
            }

            if (contractAddress && contractAddress.length) {
                searchQuery.contractAddress = contractAddress;
            }

            return await klaytnGraph.commons.ftSservice.getBalance(searchQuery)
        },
        getAllFTHistory: async (root: any, input: any) => {
            const contractAddress = input.contractAddress;
            console.log(`get ft history resolver with contract address : ${contractAddress}}`)

            return await klaytnGraph.commons.ftSservice.getHistory(contractAddress)
        },
        getAllContracts: async (root: any, input: any) => {
            let searchQuery: SearchContractDto = {}
            const type = input.type;
            console.log(`get all contracts with type : ${type}`)
            if (type && type.input) {
                searchQuery.type = type;
            }
            return await klaytnGraph.commons.contractService.find(searchQuery);
        }
    },
    Mutation: {
        createContract: async (newContract: CreateContractDto) => {
            return await klaytnGraph.commons.contractService.addContract(newContract)
        },
        addANFT: async (newNFT: CreateNFTDto) => {
            return await klaytnGraph.commons.nftService.addNFT(newNFT);
        }
    }
}
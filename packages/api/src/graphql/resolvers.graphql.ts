import * as klaytnGraph from '@klaytn-graph/common'
import { SearchNFTDto, CreateNFTDto } from '@klaytn-graph/common/src/dtos/nft.dto';
import { CreateContractDto } from '@klaytn-graph/common/src/dtos/contract.dto';

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
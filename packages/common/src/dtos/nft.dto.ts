export interface CreateNFTDto {
    contractAddress: string,
    ownerAddress: string,
    tokenId: number,
    tokenUri: string,
    price: number
}

export type SearchNFTDto = {
    ownerAddress?: string,
    contractAddress?: string,
    tokenId?: number
}

export type UpdateNFTOwnerDto = {
    contractAddress: string,
    currentOwnerAddress: string,
    tokenId: number,
    nextOwnerAddress: string
}

export type UpdateNFTPriceDto = {
    contractAddress: string,
    ownerAddress: string,
    tokenId: number,
    price: number
}
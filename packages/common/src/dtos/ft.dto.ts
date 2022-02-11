export interface CreateFTDto {
    contractAddress: string,
    ownerAddress: string,
    amount: number,
    txhash: string
}

export type SearchFTDto = {
    ownerAddress?: string,
    contractAddress?: string
}

export type UpdateFTBalanceDto = {
    contractAddress: string,
    from: string,
    to: string,
    amount: number,
    txhash: string
}
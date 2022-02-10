export enum TransactionType {
    CONTRACT_CREATION = "contract_creation",
    TRANSITION_CALL = "transition_call",
    ZIL_TRANSFER = "zil_transfer",
    TOKEN_TRANSFER = "token_transfer"
}

export enum ContractType {
    NFT = "nft", // KP17
    FT = "ft", // kp7
    OTHER = "other"
}

export enum TransactionStatus {
    SUCCESS = "success",
    FAIL = "fail"
}

export type Transaction = {
    status: TransactionStatus;
    type?: TransactionType;
    protocol?: ContractType;
    contractAddress?: string;
    fromAddress: string;
    toAddress?: string;
}

export type NFT = {
    tokenAddress: string;
    owner: string;
    tokenId: number;
    tokenUri: string;
}
export interface CreateContractDto {
    contractAddress: string,
    deployerAddress: string,
    name: string,
    symbol: string,
    type: ContractType,
    totalSupply?: string,
    decimals?: number
}

export type SearchContractDto = {
    contractAddress?: string,
    deployerAddress?: string,
    symbol?: string,
    type?: ContractType
}

export type ContractInfoDto = {
    address: string,
    decimals?: number,
    name: string,
    symbol: string,
    totalSupply?: string | number
}
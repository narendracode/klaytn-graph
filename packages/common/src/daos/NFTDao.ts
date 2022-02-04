import debug from "debug";
import { Knex } from 'knex';
import { DatabaseService } from "src/services/db.service";
import { dbService } from '../index'
import { CreateNFTDto, SearchNFTDto, UpdateNFTOwnerDto, UpdateNFTPriceDto } from "src/dtos/nft.dto";
const log: debug.IDebugger = debug('app:nft-dao');

class NftDao {
    private dbService: DatabaseService;

    constructor() {
        this.dbService = dbService;
    }

    addNFT = async (nftFields: CreateNFTDto) => {
        log(`create new token with fields : ${JSON.stringify(nftFields)}`)
        return await this.dbService.dbConn
            .insert(nftFields)
            .into('nft');
    }

    addNFTTx = async (nftFields: CreateNFTDto, tx: Knex.Transaction) => {
        log(`Tx create new token with fields : ${JSON.stringify(nftFields)}`)

        return await tx
            .insert(nftFields)
            .into('nft');
    }

    updateNFTOwner = async (nftFields: UpdateNFTOwnerDto) => {
        log(`update nft owner for contractAddress : ${nftFields.contractAddress} , tokenId : ${nftFields.tokenId} , current owner : ${nftFields.currentOwnerAddress} to new owner : ${nftFields.nextOwnerAddress}`)

        return await this.dbService.dbConn.table('nft')
            .where({
                contractAddress: nftFields.contractAddress,
                ownerAddress: nftFields.currentOwnerAddress,
                tokenId: nftFields.tokenId
            })
            .update({ ownerAddress: nftFields.nextOwnerAddress });
    }

    updateNFTOwnerTx = async (nftFields: UpdateNFTOwnerDto, tx: Knex.Transaction) => {
        log(`Tx update nft owner for contractAddress : ${nftFields.contractAddress} , tokenId : ${nftFields.tokenId} , current owner : ${nftFields.currentOwnerAddress} to new owner : ${nftFields.nextOwnerAddress}`)

        return await tx.table('nft')
            .where({
                contractAddress: nftFields.contractAddress,
                ownerAddress: nftFields.currentOwnerAddress,
                tokenId: nftFields.tokenId
            })
            .update({ ownerAddress: nftFields.nextOwnerAddress });
    }

    getAllNFTs = async (searchNFTQuery: SearchNFTDto) => {
        log(`getAllNFTs search query : ${JSON.stringify(searchNFTQuery)}`)
        return await this.dbService.dbConn
            .select("*")
            .from("nft")
            .where(searchNFTQuery);
    }

    updateNFTPrice = async (nftFields: UpdateNFTPriceDto) => {
        log(`update nft price for contractAddress : ${nftFields.contractAddress} , tokenId : ${nftFields.tokenId} , current owner : ${nftFields.ownerAddress} to price : ${nftFields.price}`)

        return await this.dbService.dbConn.table('nft')
            .where({
                contractAddress: nftFields.contractAddress,
                ownerAddress: nftFields.ownerAddress,
                tokenId: nftFields.tokenId
            })
            .update({ price: nftFields.price });
    }

    updateNFTPriceTx = async (nftFields: UpdateNFTPriceDto, tx: Knex.Transaction) => {
        log(`Tx update nft price for contractAddress : ${nftFields.contractAddress} , tokenId : ${nftFields.tokenId} , current owner : ${nftFields.ownerAddress} to price : ${nftFields.price}`)

        return await tx.table('nft')
            .where({
                contractAddress: nftFields.contractAddress,
                ownerAddress: nftFields.ownerAddress,
                tokenId: nftFields.tokenId
            })
            .update({ price: nftFields.price });
    }
}

export default NftDao;
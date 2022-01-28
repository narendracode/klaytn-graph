/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('nft', (table) => {
        table.string('contractAddress').notNullable();
        table.string('ownerAddress').notNullable();
        table.integer('tokenId').notNullable();
        table.string('tokenUri').notNullable();
        table.decimal('price').notNullable;
        table.timestamp('created_at').defaultTo(knex.fn.now())
        table.timestamp('updated_at').defaultTo(knex.fn.now())
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('nft')
};

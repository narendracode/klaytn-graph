/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.alterTable('contract', (table) => {
        table.string("totalSupply");
        table.integer("decimals");
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.alterTable('contract', (table) => {
        table.dropColumn("totalSupply");
        table.dropColumn("decimals");
    })
};

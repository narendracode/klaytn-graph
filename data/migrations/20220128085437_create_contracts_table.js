/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('contract', (table) => {
        table.string('contractAddress').notNullable().unique();
        table.string('deployerAddress').notNullable();
        table.string('type').notNullable;
        table.string('name').notNullable();
        table.string('symbol').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now())
        table.timestamp('updated_at').defaultTo(knex.fn.now())
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('global')
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('global').del()
    .then(function () {
      // Inserts seed entries
      return knex('global').insert([
        { block: 1 }
      ]);
    });
};

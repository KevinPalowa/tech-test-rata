/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('patients', (table) => {
      table.string('id').primary();
      table.string('name').notNullable();
      table.string('dateOfBirth');
      table.string('gender');
      table.string('phone');
      table.string('address');
      table.text('notes');
      table.text('allergies'); // JSON string
      table.text('tags'); // JSON string
    })
    .createTable('visits', (table) => {
      table.string('id').primary();
      table.string('patientId').references('id').inTable('patients').onDelete('CASCADE');
      table.string('date');
      table.string('doctor');
      table.string('reason');
      table.text('notes');
      table.string('prescription');
    })
    .createTable('appointments', (table) => {
      table.string('id').primary();
      table.string('patientId').references('id').inTable('patients').onDelete('CASCADE');
      table.string('date');
      table.string('reason');
      table.string('status');
    })
    .createTable('workflow_steps', (table) => {
      table.string('id').primary();
      table.string('name').notNullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('workflow_steps')
    .dropTableIfExists('appointments')
    .dropTableIfExists('visits')
    .dropTableIfExists('patients');
};

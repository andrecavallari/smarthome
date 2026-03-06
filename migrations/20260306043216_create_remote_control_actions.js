/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
exports.up = async function (knex) {
  await knex.schema.createTable('remote_control_actions', (table) => {
    table.increments('id');
    table.integer('remote_control_id').notNullable()
      .references('id').inTable('remote_controls').onDelete('CASCADE');
    table.string('scene_id');
    table.string('scene_name');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index(['remote_control_id'], 'idx_remote_control_actions_remote_control_id', 'btree');
    table.index(['scene_id'], 'idx_remote_control_actions_scene_id', 'btree');
    table.index(['scene_name'], 'idx_remote_control_actions_scene_name', 'btree');
  });
};

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
exports.down = async function (knex) {
  await knex.schema.dropTable('remote_control_actions');
};

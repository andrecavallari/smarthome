# Database create

The objective here is to create the database for the project.

## Migrations

The migrations should be created using `knex` and should be stored in the `migrations` folder. Migrations names should follow default format from knex.

## Tables

### remote_controls

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| id          | INTEGER   | Primary key, auto-incremented |
| name        | VARCHAR   | Name of the remote control, index: btree |
| code        | INTEGER   | Code of the remote control |
| created_at  | DATETIME  | Timestamp of when the record was created |
| updated_at  | DATETIME  | Timestamp of when the record was last updated |

Default created_at and updated_at to NOW() to automatically set the timestamps when a new record is inserted or updated.

### remote_control_actions

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| id          | INTEGER   | Primary key, auto-incremented |
| remote_control_id | INTEGER   | Foreign key referencing remote_controls(id), on delete cascade, index: btree |
| scene_id     | VARCHAR   | ID of the scene associated with the action, index: btree |
| scene_name   | VARCHAR   | Name of the scene associated with the action, index: btree |
| created_at   | DATETIME  | Timestamp of when the record was created |
| updated_at   | DATETIME  | Timestamp of when the record was last updated |

Default created_at and updated_at to NOW() to automatically set the timestamps when a new record is inserted or updated.

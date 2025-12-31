
# Meraki

## Setup Checklist

- [ ] **Replace placeholders**  
  Search and replace all occurrences of `[APPNAME]` with your actual app name.

- [ ] **Configure environment variables**  
  Update the values in the `.envs` file as required.

- [ ] **Enable UUID extension in the database**  
  Connect to the database using `psql` via `$DATABASE_URL`, then run:

  ```sql
  CREATE EXTENSION IF NOT EXISTS "pg_uuidv7";
  ```

BEGIN TRANSACTION;
CREATE TABLE login(
  id serial primary key,
  username text unique not null,
  hash varchar(100)  not null
);
COMMIT;
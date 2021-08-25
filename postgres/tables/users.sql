BEGIN TRANSACTION;
CREATE TABLE users(
  id serial primary key,
  username text unique not null,
  name text,
  color text,
  pet text,
  entries bigint default 0,
  joined timestamp not null
);

COMMIT;
begin transaction;
insert  into users (username,entries,joined)
  values('jessie',6,'2021-01-01');
insert into login (username,hash)
  values('jessie','$2a$12$rdFqwNzr.EfEg10/WCFG8OkCwb2Iku7cJ0mODB3F0m54C91QG98Mq');
commit;
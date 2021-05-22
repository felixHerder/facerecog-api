const handleRegister = (req, res, db, bcrypt) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json('incorect form submision');
  const hash = bcrypt.hashSync(password);
  db.transaction(trx => {
    trx.insert({
      hash: hash,
      username: username
    })
      .into('login')
      .returning('username')
      .then(loginuser => {
        return trx('users')
          .returning('*')
          .insert({
            username: loginuser[0],
            joined: new Date()
          })
          .then(user => {
            res.json(user[0]);
          });
      })
      .then(trx.commit)
      .catch(trx.rollback);
  })
    .catch(err => res.status(400).json(err + ' unable to register'));
}

module.exports = {
  handleRegister: handleRegister
}
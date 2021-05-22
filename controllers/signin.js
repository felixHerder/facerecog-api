const handleSignin = (req, res, db, bcrypt) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json('incorect form submision');

  db.select('user', 'hash').from('login').where({ username })
    .then(data => {
      const isValid = bcrypt.compareSync(password, data[0].hash);
      if (isValid) {
        return db.select('*').from('users').where({ username: data[0].username })
          .then(user => {
            res.json(user[0])
          })
          .catch(err => res.status(400).json("unable to get user"));
      }
      else res.status(400).json("wrong credentials");
    })
    .catch(err => res.status(400).json("wrong credentials"));
}

module.exports = {
  handleSignin: handleSignin
}
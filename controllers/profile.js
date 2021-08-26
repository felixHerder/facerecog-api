const handleProfile = (req, res, db) => {
  const { id } = req.params;
  db.select('*').from('users').where({ id })
    .then(user => {
      console.log('db user is:', user);
      if (user.length)
        res.json(user[0]);
      else {
        res.status(400).json("no such user");
      }
    })
    .catch(err => res.status(400).json("erro getting user"));
}
const handleProfileUpdate = (req, res, db) => {
  const { id } = req.params;
  const { name, color, pet } = req.body;
  db('users')
    .where({ id })
    .update({ name, color, pet })
    .then(resp => {
      if (resp) res.json('success');
      else res.status(400).json('unable to update');
    })
    .catch(err => res.status(400).json(err + 'error updating user'))
}

module.exports = {
  handleProfile: handleProfile,
  handleProfileUpdate: handleProfileUpdate,
}
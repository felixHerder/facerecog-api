const { json } = require('express');
const jwt = require('jsonwebtoken');
const redis = require('redis');

//setup Redis
const redisClient = redis.createClient(process.env.REDIS_URI);

const handleSignin = (db, bcrypt, req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return Promise.reject('incorect form submision');

  return db.select('username', 'hash').from('login').where({ username })
    .then(data => {
      const isValid = bcrypt.compareSync(password, data[0].hash);
      if (isValid) {
        return db.select('*').from('users').where({ username: data[0].username })
          .then(user => user[0])
          .catch(err => Promise.reject("unable to get user"));
      }
      else Promise.reject("wrong credentials");
    })
    .catch(err => Promise.reject("wrong credentials"));
}
const getAuthTokenId = (req, res) => {
  const { authorization } = req.headers;
  return redisClient.get(authorization, (err, reply) => {
    if (err || !reply)
      return res.status(400) / json('Unauthorized');
    return res.json({ id: reply });
  });

}
const signToken = (username) => {
  const jwtPayload = { username };
  return jwt.sign(jwtPayload, 'JWT_SECRET', { expiresIn: '2 days' });
}
const setToken = (tokenKey, idValue) => {
  return Promise.resolve(redisClient.set(tokenKey, idValue))
}
const createSessions = (user) => {
  //JWT token, return user data
  const { username, id } = user;
  const token = signToken(username);

  return setToken(token, id)
    .then(() =>
      ({ succes: 'true', userId: id, token: token }))
    .catch(console.log);
}

const signinAuthentication = (db, bcrypt) => (req, res) => {
  const { authorization } = req.headers;
  return authorization ? getAuthTokenId(req, res) :
    handleSignin(db, bcrypt, req, res)
      .then(data => {
        return data.id && data.username ? createSessions(data) : Promise.reject(data);
      })
      .then(session => res.json(session))
      .catch(err => res.status(400).json(err));
}

const handleSignout = (req, res) => {
  const { authorization } = req.headers;
  return redisClient.del(authorization, (err, reply) => {
    if (err || !reply)
      return res.status(400) / json('Unauthorized');
    return res.json('signed out');
  });

}

module.exports = {
  handleSignin: handleSignin,
  handleSignout: handleSignout,
  signinAuthentication: signinAuthentication,
  redisClient: redisClient,
  createSessions: createSessions
}
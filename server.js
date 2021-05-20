const { response } = require('express');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt-nodejs');
const knex = require('knex');

const db = knex({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    user: 'postgres',
    password: 'admin',
    database: 'facerecog'
  }
});

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send("howdy");
});

app.post('/signin', (req, res) => {
  const { email, password } = req.body;
  db.select('email', 'hash').from('login').where({ email: email })
    .then(data => {
      const isValid = bcrypt.compareSync(password, data[0].hash);
      if(isValid){
        return db.select('*').from('users').where({email: data[0].email})
        .then( user=>{
          res.json(user[0])
        })
        .catch(err => res.status(400).json("unable to get user"));
      }
      else res.status(400).json("wrong credentials");
    })
    .catch(err => res.status(400).json("wrong credentials"));
})

app.post('/register', (req, res) => {
  const { email, name, password } = req.body;
  const hash = bcrypt.hashSync(password);
  db.transaction(trx => {
    trx.insert({
      hash: hash,
      email: email
    })
      .into('login')
      .returning('email')
      .then(loginemail => {
        return trx('users')
          .returning('*')
          .insert({
            email: loginemail[0],
            name: name,
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
});

app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  db.select('*').from('users').where({ id })
    .then(user => {
      if (user.length)
        res.json(user[0]);
      else
        res.status(400).json("no such user");
    })
    .catch(err => res.status(400).json("erro getting user"));
});

app.put('/image', (req, res) => {
  const { id } = req.body;
  db('users')
    .where({ id }).increment('entries', 1)
    .returning('entries')
    .then(entries => {
      res.json(entries[0]);
    })
    .catch(err => res.status(400).json("error updating entries"));
});

app.listen(3000, () => {
  console.log('app is running on port 3000');
});
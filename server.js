require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt-nodejs');
const knex = require('knex');
const register = require('./controllers/register.js');
const signin = require('./controllers/signin.js');
const profile = require('./controllers/profile.js');
const image = require('./controllers/image.js');
const morgan = require('morgan');
const auth = require('./controllers/authorization');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
const db = knex({
  client: 'pg',
  connection: {
    // heroku config
    connectionString: process.env.POSTGRES_URI,
    ssl: process.env.DATABASE_SSL === 'false' ? false : true
  }
});
const app = express();

app.use(express.json());
// app.use(morgan('combined'));
app.use(cors());

app.get('/', (req, res) => { res.send("howdy"); });

app.post('/signin', signin.signinAuthentication(db, bcrypt));
app.post('/profile/signout', auth.requireAuth, (req, res) => { signin.handleSignout(req, res) });

app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) });

app.get('/profile/:id', auth.requireAuth, (req, res) => { profile.handleProfile(req, res, db) });
app.post('/profile/:id', auth.requireAuth, (req, res) => { profile.handleProfileUpdate(req, res, db) });
app.put('/image', auth.requireAuth, (req, res) => { image.handleImage(req, res, db) });

app.post('/imageurl', auth.requireAuth, (req, res) => { image.handleApiCall(req, res) });

app.listen(process.env.PORT || 5000, () => {
  console.log(`app is running on port ${process.env.PORT || 5000}`);
});

const { response } = require("express");
const Clarifai = require('clarifai');

const app = new Clarifai.App({
  apiKey: '5e2a1a4ad987448eabcfaba364e27f1f'
});
const handleApiCall = (req, res) => {
  app.models.predict(Clarifai.FACE_DETECT_MODEL, req.body.input)
  .then(data=> res.json(data))
  .catch(err => res.status(400).json('unable to work with api'));
}

const handleImage = (req, res, db) => {
  const { id } = req.body;
  db('users')
    .where({ id }).increment('entries', 1)
    .returning('entries')
    .then(entries => {
      res.json(entries[0]);
    })
    .catch(err => res.status(400).json("error updating entries"));
}

module.exports = {
  handleImage: handleImage,
  handleApiCall: handleApiCall
}

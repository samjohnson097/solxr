/* eslint-disable camelcase */
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User, Iotd } = require ('../db');
router.post('/create', async (req, res) => {
  const {username, password} = req.body;
  const salt = await bcrypt.genSalt();
  const hash = await bcrypt.hash(password, salt);
  User.findAll({
    where: {
      username: username
    }
  }).then(user => {
    if (user.length) {
      res.send('user exists');
    } else {
      User.create({username, hash});
      res.sendStatus(201);
    }
  });
});
router.post('/login', (req, res) =>{
  const {username, password: passwordAttempt} = req.body;
  User.findAll({
    where: {
      username: username
    }
  }).then(async user => {
    if (user.length) {
      const { dataValues: {hash, ...thisUser}} = user[0];
      const valid = await bcrypt.compare(passwordAttempt, hash);
      if (valid) {
        res.send({...thisUser});
      } else {
        res.send('invalid password');
      }
    } else {
      res.sendStatus(401);
    }
  });
});
router.put('/iotd', (req, res) => {
  const { url, title, explanation, user_id } = req.body;
  console.log('heres those params', title, user_id);
  Iotd.findAll({
    where: {
      url,
      user_id
    }
  }).then(likedImage => {
    if (likedImage.length) {
      Iotd.destroy({
        where: {
          url,
          user_id
        }
      }).then(() => res.send(`Deleted ${title} from your favorites.`));
    } else {
      Iotd.create({url, title, explanation, user_id }).then(() => res.status(201).send(`Added ${title} to your favorites.`));
    }
  });
});
router.get('/iotd', (req, res)=>{
  console.log(`here's the data from params: ${req.query.user_id}`);
  const { user_id } = req.query;
  Iotd.findAll({
    where: {
      user_id
    }
  })
    .then(picArr => {
      res.send(picArr);
    })
    .catch(err=>{
      res.send(err);
    });
});
router.put('/update', (req, res) => {
  const {accessibility, email, music, subscribed, theme, id} = req.body;
  User.update({accessibility, email, music, subscribed, theme},
    {where: {
      id: id
    }})
    .then(() => res.sendStatus(201));
});
module.exports = router;

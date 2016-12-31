const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const request = require('request');
const cheerio = require('cheerio');
const User = mongoose.model('User')
const bcrypt = require('bcrypt');
const passport = require('passport');
const jwt = require('jsonwebtoken');

router.post('/signup', function(req, res, next) {
  let hashed_pw = bcrypt.hashSync(req.body.password, 12)
  new User({
    username: req.body.username,
    email: req.body.email,
    password: hashed_pw
  });
  user.save(function(err, returnedUser) {
    if (err) {
      res.send({
        message: err
      })
    } else {
      return res.json({
        jwt: user.generateJWT()
      })
    }
  })
})

router.post('/login', function(req, res, next) {
  if (!req.body.username || !req.body.password) {
    return res.status(400)({
      message: 'Please fill out all fields'
    })
  } else {
    User.findOne({
      'username': req.body.username
    }, function(err, results) {
      if (!results) {
      }
      let passwordMatch = bcrypt.compareSync(req.body.password, results.password)
      if (!passwordMatch) {
      } else {
        return res.json({
          jwt: results.generateJWT()
        })
      }
    })
  }
})

module.exports = router;

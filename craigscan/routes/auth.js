const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const request = require('request');
const cheerio = require('cheerio');
const User = mongoose.model('User')
const bcrypt = require('bcrypt-nodejs');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const validate = require('express-validation')
const user_validation = require('../models/validations/user.js')

router.post('/signup', validate(user_validation.signup), function(req, res, next) {
  console.log('signup request received, body:', req.body);
  let hashed_pw = bcrypt.hashSync(req.body.password)
  let user = new User({
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

router.post('/login', validate(user_validation.login), function(req, res, next) {
  if (!req.body.username || !req.body.password) {
    return res.status(400)({
      message: 'Please fill out all fields'
    })
  } else {
    User.findOne({
      'username': req.body.username
    }, function(err, results) {
      if (err) {
        res.send(err)
      }
      let error = {
        credentialsInvalid: true
      }
      if (!results) {
        res.send(error)
      } else {
        let passwordMatch = bcrypt.compareSync(req.body.password, results.password)
        if (!passwordMatch) {
          res.send(error)
        } else {
          return res.json({
            jwt: results.generateJWT()
          })
        }
      }
    })
  }
})

module.exports = router;

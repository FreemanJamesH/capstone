const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const request = require('request');
const cheerio = require('cheerio');
const User = mongoose.model('User')
const bcrypt = require('bcrypt');
const passport = require('passport');
const jwt = require('jsonwebtoken');

router.get('/dashboard', function(req, res, next) {
  if (!req.headers.token) {
    let err = new Error()
    err.message = 'You are not logged in.'
    err.status = 403
    return next(err)
  } else {
    let token = req.headers.token
    jwt.verify(token, 'SECRET', function(err, decoded) {
      if (err) {
        return next(err)
      } else {
        User.findById(decoded._id, function(err, user) {
          res.send(user)
        })
      }
    })
  }
})

module.exports = router;

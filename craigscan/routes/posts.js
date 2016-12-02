const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const request = require('request');
const cheerio = require('cheerio');
const User = mongoose.model('User')
const bcrypt = require('bcrypt');
const passport = require('passport');
const jwt = require('jsonwebtoken');

router.delete('/:searchid/:index', function(req, res, next) {
  let searchId = req.params.searchid
  let resultIndex = req.params.index
  let token = req.headers.token
  jwt.verify(token, 'SECRET', function(err, decoded) {
    if (err) {
      return next(err)
    } else {
      User.findById(decoded._id, function(err, user) {
        user.searches.id(searchId).results.id(resultIndex).remove()
        user.save(function(err, updatedUser) {
          res.json(updatedUser.searches.id(searchId))
        })
      })
    }
  })
})

module.exports = router;

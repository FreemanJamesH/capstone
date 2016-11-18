const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const request = require('request');
const cheerio = require('cheerio');
const User = mongoose.model('User')
const bcrypt = require('bcrypt');
const passport = require('passport');
const jwt = require('jsonwebtoken');


// router.all('*', function(req, res, next) {
//   console.log('WHOO');
//   next()
// })

router.delete('/:searchid/:index', function(req, res, next) {
  let searchId = req.params.searchid
  console.log('searchid: ', searchId);
  let resultIndex = req.params.index
  let token = req.headers.token
  jwt.verify(token, 'SECRET', function(err, decoded) {
    if (err) {
      return next(err)
    } else {
      User.findById(decoded._id, function(err, user) {
        console.log('user found:', user);
        // for (var i = 0; i < user.searches.length; i++) {
        //   if (user.searches[i].id === searchId) {
        //     let deleted = user.searches[i].results.splice(resultIndex,1)
        //     user.searches[i].results
        //     console.log('spliced this:', deleted);
        //     console.log('after splicing:', user.searches[i].results);
        //   }
        // }
        user.searches.id(searchId).results.id(resultIndex).remove()
        console.log('this is what Im saving: ', user.searches);
        user.save(function(err, updatedUser) {
          // console.log('updated user:', updatedUser);
          res.json(updatedUser)
        })
      })
    }
  })
})

module.exports = router;

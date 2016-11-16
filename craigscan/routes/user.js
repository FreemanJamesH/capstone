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

router.post('/savesearch', function(req, res, next) {
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
          user.searches.push(req.body)
          user.save(function(err, updatedUser) {
            console.log(updatedUser);
          })
        })
      }
    })
  }
})

router.post('/deletesearch', function(req, res, next) {
  let idToDelete = req.body.id
  let token = req.headers.token
  jwt.verify(token, 'SECRET', function(err, decoded) {
    if (err) {
      return next(err)
    } else {
      User.findById(decoded._id, function(err, user) {
        for (var i = 0; i < user.searches.length; i++) {
          if (user.searches[i].id === idToDelete) {
            user.searches.splice(i, 1)
            i--
          }
        }
        user.save(function(err, updatedUser) {
          res.json(updatedUser)
        })
      })
    }
  })
})

router.get('/getsearch/:id', function(req, res, next) {
  let idToGet = req.params.id
  let token = req.headers.token
  jwt.verify(token, 'SECRET', function(err, decoded) {
    if (err) {
      return next(err)
    } else {
      User.findById(decoded._id, function(err, user) {
        for (var i = 0; i < user.searches.length; i++) {
          if (user.searches[i].id === idToGet) {
            return res.json({search: user.searches[i]})
          }
        }
      })
    }
  })
})




module.exports = router;

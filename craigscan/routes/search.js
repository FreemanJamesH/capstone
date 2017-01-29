const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const request = require('request');
const cheerio = require('cheerio');
const User = mongoose.model('User')
const bcrypt = require('bcrypt');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const scrapeRequest = require('./scrape-engine/scraper.js')

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
            console.log('updatedUser:', updatedUser);
          })
        })
      }
    })
  }
})

router.post('/deletesearch', function(req, res, next) {
  console.log('id to delete: ', req.body.id);
  let idToDelete = req.body.id
  let token = req.headers.token
  jwt.verify(token, 'SECRET', function(err, decoded) {
    if (err) {
      return next(err)
    } else {
      User.findById(decoded._id, function(err, user) {
        user.searches.id(idToDelete).remove()
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
        res.json(user.searches.id(idToGet))
      })
    }
  })
})

router.get('/updatesearch/:id', function(req, res, next) {
  let idToGet = req.params.id
  let token = req.headers.token
  jwt.verify(token, 'SECRET', function(err, decoded) {
    if (err) {
      return next(err)
    } else {
      User.findById(decoded._id, function(err, user) {
        let search = user.searches.id(idToGet)

        let count = 0
        let data = [];
        let duplicate = 0;
        let searchParams = search.params;
        let url = searchParams.url

        for (var param in searchParams) {
          if (searchParams[param] && param != 'url') {
            url += `&${param}=${searchParams[param]}`
          }
        }

        scrapeRequest(url, searchParams, count, []).then(function(results) {
          let searchObj = {
            title: null,
            params: searchParams,
            results: results,
            favorites: [],
            deleted: []
          }
          res.json(searchObj)
        })

      })
    }
  })
})

module.exports = router;

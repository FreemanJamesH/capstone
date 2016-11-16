const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const request = require('request');
const cheerio = require('cheerio');
const User = mongoose.model('User')
const bcrypt = require('bcrypt');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const authorize = function() {

}

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

router.post('/signup', function(req, res, next) {
  let hashed_pw = bcrypt.hashSync(req.body.password, 12)
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

router.post('/scrape', function(req, res, next) {
  let count = 0
  let data = [];
  let duplicate = 0;
  requestFunction(req.body.url)

  function requestFunction(urlArg) {
    let url = urlArg + '&s=' + count
    request(url, function(err, resp, body) {
      var $ = cheerio.load(body)
      $('.result-row').each(function() {
        let dataObj = {};
        dataObj.href = '//' + req.body.regionChoice + $(this).children('a').attr('href').slice(1)
        dataObj.title = $(this).find('.hdrlnk').text()
        if ($(this).children('a').attr('data-ids')) {
          dataObj.hasimg = true
          dataObj.img = 'http://images.craigslist.org/' + $(this).children('a').attr('data-ids').slice(2, 19) + '_300x300.jpg';
          // 'https://www.shearwater.com/wp-content/plugins/lightbox/images/No-image-found.jpg'
          let foundDupe = false
          data.forEach(function(element, index) {
            if (dataObj.img === element.img || dataObj.title === element.title) {
              dataObj.dupe = true
              foundDupe = true
            }
          })
          // if (foundDupe) {
          //   duplicate++
          // }
        } else {
          dataObj.hasimg = false
          dataObj.img = 'https://www.shearwater.com/wp-content/plugins/lightbox/images/No-image-found.jpg';
        }
        let time = $(this).find('time').attr('datetime')
        let timeConverted =
          (parseInt(time.slice(0, 4)) - 1970) * 365 * 24 * 60 * 60 +
          parseInt(time.slice(5, 7)) * 30 * 24 * 60 * 60 +
          parseInt(time.slice(8, 10)) * 24 * 60 * 60 +
          parseInt(time.slice(11, 13)) * 60 +
          parseInt(time.slice(14, 16))
        dataObj.timeConverted = timeConverted
        dataObj.price = $(this).find('.result-price').text().slice(1)
        dataObj.price = parseInt(dataObj.price, 10)
        dataObj.time = $(this).find('time').attr('datetime')
        dataObj.location = $(this).find('.pnr').children('small').text()
        data.push(dataObj)
      })
      if (data.length === 100 + count && count != 2400) {
        count += 100
        return requestFunction(urlArg)
      }
      res.json({
        dataArr: data
      })
    })
  }
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
            return res.json({dataArr: user.searches[i]})
          }
        }
      })
    }
  })
})

router.get('/sls', function(req, res, next) {
  let siteURL = 'http://www.craigslist.org/about/sites'
  request(siteURL, function(err, resp, body) {
    var $ = cheerio.load(body)
    let data = []
    $("a[name|='US']").parent().next().find('h4').each(function(i, elem) {
      let stateObj = {};
      stateObj.state = ($(this).html())
      stateObj.regionList = []
      $(this).next().find('a').each(function(i, elem) {
        let regionObj = {};
        regionObj.link = ($(this).attr('href')).slice(2)
        regionObj.name = ($(this).html())
        stateObj.regionList.push(regionObj)
      })
      data.push(stateObj)
    })
    res.json({
      finish: data
    })
  })

})


module.exports = router;
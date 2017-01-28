const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const request = require('request');
const cheerio = require('cheerio');
const User = mongoose.model('User')
const bcrypt = require('bcrypt');
const passport = require('passport');
const jwt = require('jsonwebtoken');

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
        dataObj.isFav = false;
        dataObj.href = req.body.regionChoice + $(this).children('a').attr('href').slice(1)
        dataObj.title = $(this).find('.hdrlnk').text()
        let dataIds = $(this).children('a').attr('data-ids')
        if (dataIds) {
          let commaDex = dataIds.indexOf(',')
          if (commaDex !== -1){
            dataObj.img = 'http://images.craigslist.org/' + dataIds.slice(2, commaDex) + '_300x300.jpg';
          } else {
            dataObj.img = 'http://images.craigslist.org/' + dataIds.slice(2) + '_300x300.jpg';
          }
          dataObj.hasimg = true
        } else {
          dataObj.hasimg = false
          dataObj.img = 'https://www.shearwater.com/wp-content/plugins/lightbox/images/No-image-found.jpg';
        }
        let time = new Date($(this).find('time').attr('datetime'))
        let timeConverted = time.getTime()
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
      let searchObj = {title: null, params:req.body.searchParams, results: data, favorites: [], deleted: []}
      res.json(searchObj)
    })
  }
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
        regionObj.link = ($(this).attr('href')).slice(0)
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

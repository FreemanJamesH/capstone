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
const testExport = require('./scrape-engine/sayhello.js')



router.post('/scrape', function(req, res, next) {
  testExport()
  let count = 0
  let data = [];
  let duplicate = 0;
  let searchParams = req.body.searchParams;
  searchParams.updated = Date.now()
  let url = searchParams.url

  for (var param in searchParams) {
    if (searchParams[param] && param != 'url' ) {
      url += `&${param}=${searchParams[param]}`
    }
  }

  scrapeRequest(url, searchParams, count, []).then(function(results){
    console.log('here are the results:', results);
    res.json(results)
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

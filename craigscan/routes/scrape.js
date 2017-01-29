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

router.post('/scrape', function(req, res, next) {
  let count = 0
  let data = [];
  let searchParams = req.body.searchParams;
  console.log(searchParams);
  let url = searchParams.regionChoice + 'search/apa?'

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

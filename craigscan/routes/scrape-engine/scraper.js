const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const request = require('request');
const cheerio = require('cheerio');
const User = mongoose.model('User')
const bcrypt = require('bcrypt');
const passport = require('passport');
const jwt = require('jsonwebtoken');

function recursiveScrape(urlArg, searchParams, count, data) {

  function decide(data) {
    if (data.length == (count + 100)) {
      return recursiveScrape(urlArg, searchParams, count + 100, data)
    }

    let searchObj = {
      title: null,
      params: searchParams,
      results: data,
      favorites: [],
      deleted: []
    }
    return searchObj
  }

  return scrape(urlArg, searchParams, count, data).then(decide)

}


function scrape(urlArg, searchParams, count, data) {
  return new Promise(function(resolve) {
    console.log('scraping');
    let url = urlArg + '&s=' + count
    request(url, function(err, resp, body) {
      var $ = cheerio.load(body)
      $('.result-row').each(function() {
        let dataObj = {};
        dataObj.isFav = false;
        dataObj.title = $(this).find('.hdrlnk').text()
        let dataIds = $(this).children('a').attr('data-ids')
        if (dataIds) {
          let commaDex = dataIds.indexOf(',')
          if (commaDex !== -1) {} else {}
          dataObj.hasimg = true
        } else {
          dataObj.hasimg = false
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
      resolve(data)
    })
  })
}

module.exports = recursiveScrape

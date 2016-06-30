var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio')

var url = 'http://boulder.craigslist.org/search/sss?'


router.post('/api', function(req, res, next){
  let customURL = url +req.body.sort + '&' + req.body.query
  console.log(customURL);
  request(customURL, function(err, resp, body){
    var $ = cheerio.load(body)
    let data = [];
    $('.row').each(function(){
      let dataObj = {};
      dataObj.href = $(this).children('a').attr('href')
      dataObj.img = $(this).children('a').attr('data-ids')
      dataObj.price = $(this).children('a').children('.price').text()
      dataObj.time = $(this).find('time').attr('datetime')
      dataObj.title = $(this).find('#titletextonly').text()
      dataObj.location = $(this).find('.pnr').children('small').text()
      data.push(dataObj)
    })
    res.json({dataArr: data})
  })
})


module.exports = router;

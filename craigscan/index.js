var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio')

var url = 'http://boulder.craigslist.org/search/sss?'


router.post('/api', function(req, res, next){
  console.log('req', req.body)
  request(url+req.body.sort + '&' + req.body.query, function(err, resp, body){
    var $ = cheerio.load(body)
    // var company = $('.company').text();
    res.send({comp: body})
  })
})

router.get('*', function(req, res, next) {
  res.sendFile('index.html', {
    root: __dirname + '/../public/'
  });
});

module.exports = router;

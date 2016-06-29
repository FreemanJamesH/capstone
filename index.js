var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio')
var url = 'http://www.indeed.com/jobs?q=programmer&l=Boulder%2C+CO'


router.get('/api', function(req, res, next){
  request(url, function(err, resp, body){
    var $ = cheerio.load(body)
    // var company = $('.company').text();
    console.log(body);
  })
  res.json({hello: 'hello'})
})

router.get('*', function(req, res, next) {
  res.sendFile('index.html', {
    root: __dirname + '/../public/'
  });
});

module.exports = router;

var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio')



router.post('/api', function(req, res, next) {
  let count = 0
  let data = [];
  let duplicate = 0;
  console.log(req.body)
  requestFunction(req.body.url)

  function requestFunction(urlArg) {
    let url = urlArg + '&s=' + count
    request(url, function(err, resp, body) {
      var $ = cheerio.load(body)
      $('.row').each(function() {
        let dataObj = {};
        dataObj.href = '//' + req.body.regionChoice + $(this).children('a').attr('href').slice(1)
        dataObj.title = $(this).find('#titletextonly').text()
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
          if (foundDupe){
            duplicate++
          }
        } else {
          dataObj.hasimg = false
          dataObj.img = 'https://www.shearwater.com/wp-content/plugins/lightbox/images/No-image-found.jpg';
        }
        let time = $(this).find('time').attr('datetime')
        let timeConverted =
        (parseInt(time.slice(0,4)) - 1970) * 365 * 24 * 60 * 60
        + parseInt(time.slice(5,7)) * 30 * 24 * 60 * 60
        + parseInt(time.slice(8,10)) * 24 * 60 * 60
        + parseInt(time.slice(11,13)) * 60
        + parseInt(time.slice(14, 16))
        dataObj.timeConverted = timeConverted
        dataObj.price = $(this).find('.price').text().slice(1)
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
        dataArr: data,
        dupeCount: duplicate,
        resultCount: data.length
      })
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

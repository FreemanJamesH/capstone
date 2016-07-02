var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio')



router.post('/api', function(req, res, next){
  let url = req.body.url + 'search/sss?'
  let customURL = 'http://' + url +req.body.sort + '&' + req.body.query
  console.log(customURL)
  request(customURL, function(err, resp, body){
    var $ = cheerio.load(body)
    let data = [];
    $('.row').each(function(){
      let dataObj = {};
      dataObj.href = $(this).children('a').attr('href')
      if ($(this).children('a').attr('data-ids')) {
        dataObj.img = 'https://www.shearwater.com/wp-content/plugins/lightbox/images/No-image-found.jpg';
        // dataObj.img = 'http://images.craigslist.org/'+ $(this).children('a').attr('data-ids').slice(2,19) + '_300x300.jpg'
      } else {
        dataObj.img = 'https://www.shearwater.com/wp-content/plugins/lightbox/images/No-image-found.jpg';
      }
      dataObj.price = $(this).children('a').children('.price').text()
      dataObj.time = $(this).find('time').attr('datetime')
      dataObj.title = $(this).find('#titletextonly').text()
      dataObj.location = $(this).find('.pnr').children('small').text()
      data.push(dataObj)
    })
    console.log('res.json: ', data);
    res.json({dataArr: data})
  })
})

router.get('/sls', function(req, res, next){
  let siteURL = 'http://www.craigslist.org/about/sites'
  request(siteURL, function(err, resp, body){
    var $ = cheerio.load(body)
    let data = []
    $("a[name|='US']").parent().next().find('h4').each(function(i, elem){
      let stateObj = {};
      stateObj.state = ($(this).html())
      stateObj.regionList = []
      $(this).next().find('a').each(function(i, elem){
        let regionObj = {};
        regionObj.link  = ($(this).attr('href')).slice(2)
        regionObj.name  = ($(this).html())
        stateObj.regionList.push(regionObj)
      })
      data.push(stateObj)
    })
    res.json({finish: data})
  })

})


module.exports = router;

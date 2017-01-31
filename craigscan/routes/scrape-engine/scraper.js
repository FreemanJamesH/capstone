const request = require('request');
const cheerio = require('cheerio');

function recursiveScrape(urlArg, searchParams, count, data, newSearch) {

  function decide(data, dateStop) {
    if (data.length === (count + 100) && dateStop === false) {
      return recursiveScrape(urlArg, searchParams, count + 100, data, newSearch)
    }
    return data
  }
  return scrape(urlArg, searchParams, count, data, newSearch).then(decide)
}


function scrape(urlArg, searchParams, count, data, newSearch) {
  return new Promise(function(resolve) {
    let dateStop = false;
    let url = urlArg + '&s=' + count
    request(url, function(err, resp, body) {
      var $ = cheerio.load(body)
      $('.result-row').each(function() {
        let dataObj = {};
        dataObj.isFav = false;
        let resultHref = $(this).children('a').attr('href').slice(1)
        if (resultHref[0] === '/'){
          dataObj.href = '//' + resultHref.slice(1)
        } else {
          dataObj.href = searchParams.regionChoice + $(this).children('a').attr('href').slice(1)
        }
        dataObj.title = $(this).find('.hdrlnk').text()
        let dataIds = $(this).children('a').attr('data-ids')
        if (dataIds) {
          let commaDex = dataIds.indexOf(',')
          if (commaDex !== -1) {
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
        if ((timeConverted < searchParams.updated && newSearch === false) || dateStop == true){
          dateStop = true
          return
        }
        dataObj.timeConverted = timeConverted
        dataObj.price = $(this).find('.result-price').text().slice(1)
        dataObj.price = parseInt(dataObj.price, 10)
        dataObj.time = $(this).find('time').attr('datetime')
        dataObj.location = $(this).find('.pnr').children('small').text()
        data.push(dataObj)
      })
      resolve(data, dateStop)
    })
  })
}

module.exports = recursiveScrape

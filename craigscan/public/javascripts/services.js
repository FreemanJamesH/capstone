app.service('searchService', ['$resource', function($resource) {
  var resultsArr = [];
  return {
    search: function(obj) {
      // return $resource('https://jhfcapstone.herokuapp.com/api').save({
      return $resource('//localhost:3000/api').save({
        url: obj.url,
        sort: 'sort=rel',
        query: 'query=' + obj.query
      }).$promise.then(function(results) {
        resultsArr = results.dataArr;
        console.log(resultsArr)
      })
    },
    resultsArrGetter: function() {
      return resultsArr;
    }
  }
}])


app.service('stateListService', ['$resource', function($resource) {
  var resultsArr = [];
  return {
    retrieve: function(obj) {
      return $resource('//localhost:3000/sls').get()
      .$promise.then(function(results) {
        // console.log('results HERE', results)
        resultsArr = results.finish;
      })
    },
    resultsArrGetter: function() {
      return resultsArr;
    }
  }
}])

app.service('searchService', ['$resource', function($resource) {
  var resultsArr = [];
  return {
    search: function(obj) {
      return $resource('https://jhfcapstone.herokuapp.com/api').save({
      // return $resource('http://localhost:3000/api').save({
        sort: 'sort=rel',
        query: 'query=' + obj.query
      }).$promise.then(function(results) {
        resultsArr = results.dataArr;
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
    search: function(obj) {
      // return $resource('http://localhost:3000/api').save({
      return $resource('https://jhfcapstone.herokuapp.com/sls').get()
      .$promise.then(function(results) {
        console.log('service received: ', results)
        resultsArr = results.dataArr;
      })
    },
    resultsArrGetter: function() {
      return resultsArr;
    }
  }
}])

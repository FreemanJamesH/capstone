app.service('searchService', ['$resource', function($resource) {
  var resultsArr = [];
  return {
    log: function() {
      console.log('hello');
    },
    search: function(obj) {
      console.log('serviceobj', obj)
      return $resource('https://jhfcapstone.herokuapp.com/api').save({
        sort: 'sort=rel',
        query: 'query=' + obj.query
      }).$promise.then(function(results) {
        console.log('service results:', results)
        resultsArr = results.dataArr;
      })
    },
    resultsArrGetter: function() {
      return resultsArr;
    }
  }
}])

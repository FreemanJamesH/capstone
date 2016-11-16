app.service('stateListService', ['$resource', function($resource) {
  var resultsArr = [];
  return {
    retrieve: function(obj) {
      return $resource('//localhost:3000/scrape/sls').get()
        .$promise.then(function(results) {
          resultsArr = results.finish;
        })
    },
    resultsArrGetter: function() {
      return resultsArr;
    }
  }
}])

app.service('searchService', ['$resource', '$location', function($resource, $location) {
  var resultsObj = {};
  return {
    newSearch: function(obj) {
      // return $resource('https://jhfcapstone.herokuapp.com/api').save(obj).$promise.then(function(results) {
      return $resource('//localhost:3000/scrape/scrape').save(obj).$promise.then(function(results) {
        resultsObj = results;
      })
    },
    resultsObjGetter: function() {
      console.log('resultsObjGetter firing, resultsObj: ', resultsObj);
      let i = 0;
      let dupeCount = 0;
      while (i<resultsObj.results.length){
        let checkAgainst = resultsObj.results[i]
        if (checkAgainst.dupe) {
          dupeCount++
        }
        for (var k = i+1; k < resultsObj.results.length; k++){
          let currentK = resultsObj.results[k]
          if (checkAgainst.title === currentK.title && checkAgainst.price === currentK.price){
            currentK.dupe = true
          } else {
            if (!currentK.dupe){
              currentK.dupe = false
            }
          }
        }
        i++
      }
      resultsObj.dupeCount = dupeCount
      resultsObj.resultCount = resultsObj.results.length
      return resultsObj;
    },
    saveSearch: function(obj) {
      return $resource('//localhost:3000/search/savesearch').save(obj).$promise.then(function(results) {
      })
    },
    deleteSearch: function(id) {
      return $resource('//localhost:3000/search/deletesearch')
        .save({
          id: id
        })
        .$promise
        .then(function(results) {
          return results
        })
    },
    viewSearch: function(id){
      return $resource(`//localhost:3000/search/getsearch/${id}`)
        .get()
        .$promise
        .then(function(results){
          console.log('results in viewSearchMethod: ', results );
          resultsObj = results
          $location.path('/results')
        })
    }
  }
}])

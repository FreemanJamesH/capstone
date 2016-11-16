app.service('searchService', ['$resource', '$location', function($resource, $location) {
  var resultsObj = {};
  return {
    search: function(obj) {
      // return $resource('https://jhfcapstone.herokuapp.com/api').save(obj).$promise.then(function(results) {
      return $resource('//localhost:3000/scrape/scrape').save(obj).$promise.then(function(results) {
        console.log('setting results obj to results:', results);
        resultsObj = results;
      })
    },
    resultsObjGetter: function() {
      let dupeCount = 0;
      for (var i=0; i<resultsObj.dataArr.length; i++){
        if (resultsObj.dataArr[i].dupe){
          dupeCount++
        }
      }
      resultsObj.dupeCount = dupeCount
      resultsObj.resultCount = resultsObj.dataArr.length
      console.log('resultsObj in resultObjGetter: ', resultsObj);
      return resultsObj;
    },
    saveSearch: function(obj) {
      return $resource('//localhost:3000/user/savesearch').save(obj).$promise.then(function(results) {
        console.log(results);
      })
    },
    deleteSearch: function(id) {
      return $resource('//localhost:3000/user/deletesearch')
        .save({
          id: id
        })
        .$promise
        .then(function(results) {
          return results
        })
    },
    viewSearch: function(id){
      return $resource(`//localhost:3000/user/getsearch/${id}`)
        .get()
        .$promise
        .then(function(results){
          resultsObj.dataArr = results.search.results
          $location.path('/results')
        })
    }
  }
}])

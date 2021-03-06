app.service('searchService', ['$resource', '$location', function($resource, $location) {
  var resultsObj = {};
  return {
    newSearch: function(obj) {
      // return $resource('https://jhfcapstone.herokuapp.com/api').save(obj).$promise.then(function(results) {
      return $resource('https://jhfcapstone.herokuapp.com/scrape/scrape').save(obj).$promise.then(function(results) {
        resultsObj = results;
      })
    },
    resultsObjSetter: function(obj) {
      resultsObj = obj
    },
    resultsObjGetter: function() {
      if (resultsObj.results) {
        let i = 0;
        let dupeCount = 0;
        let favCount = 0;
        while (i < resultsObj.results.length) {
          let checkAgainst = resultsObj.results[i]
          if (checkAgainst.dupe) {
            dupeCount++
          }
          if (checkAgainst.isFav) {
            favCount++
          }
          for (var k = i + 1; k < resultsObj.results.length; k++) {
            let currentK = resultsObj.results[k]
            if (checkAgainst.title === currentK.title && checkAgainst.price === currentK.price) {
              currentK.dupe = true
            } else {
              if (!currentK.dupe) {
                currentK.dupe = false
              }
            }
          }
          i++
        }
        resultsObj.favCount = favCount
        resultsObj.dupeCount = dupeCount
        resultsObj.resultCount = resultsObj.results.length
        return resultsObj;
      }
      return {}
    },
    saveSearch: function(obj) {
      console.log('saving search:', obj);
      return $resource('https://jhfcapstone.herokuapp.com/search/savesearch').save(obj).$promise.then(function(results) {
        return results
      })
    },
    deleteSearch: function(id) {
      return $resource('https://jhfcapstone.herokuapp.com/search/deletesearch')
        .save({
          id: id
        })
        .$promise
        .then(function(results) {
          return results
        })
    },
    viewSearch: function(id) {
      return $resource(`https://jhfcapstone.herokuapp.com/search/getsearch/${id}`)
        .get()
        .$promise
        .then(function(results) {
          resultsObj = results
        })
    },
    updateSearch: function(id) {
      return $resource(`https://jhfcapstone.herokuapp.com/search/updatesearch/${id}`)
        .get()
        .$promise
        .then(function(results) {
          return results
        })
    }
  }
}])

app.service('postService', function($resource, searchService){
  return {
    delete: function(searchid, index){
      return $resource(`//localhost:3000/posts/${searchid}/${index}`).delete().$promise.then(function(results) {
        return results
      })
    },
    deleteDupes: function(){
      function dupeCheck(result){
        return !result.dupe
      }
      let currentResults = searchService.resultsObjGetter()
      let dupesRemoved = currentResults.results.filter(dupeCheck)
      console.log('currentResults:', currentResults);
      return $resource(`//localhost:3000/posts/${currentResults._id}`).save(dupesRemoved).$promise.then(function(results){
        searchService.resultsObjSetter(results)
        return;
      })
    }
  }
})

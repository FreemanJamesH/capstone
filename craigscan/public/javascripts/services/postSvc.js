app.service('postService', function($resource, searchService) {
  return {
    delete: function(searchid, index) {
      return $resource(`//localhost:3000/posts/${searchid}/${index}`).delete().$promise.then(function(results) {
        return results
      })
    },
    deleteDupes: function(id, dupesRemoved) {
      console.log('dupesremoved:', dupesRemoved);
      return $resource(`//localhost:3000/posts/${id}`).save(dupesRemoved).$promise.then(function(results) {
        searchService.resultsObjSetter(results)
        return;
      })
    }
  }
})

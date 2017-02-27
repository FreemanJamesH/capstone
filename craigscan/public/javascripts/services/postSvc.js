app.service('postService', function($resource, searchService) {
  return {
    delete: function(searchid, index) {
      console.log('service delete:', searchid, index);
      return $resource(`https://jhfcapstone.herokuapp.com/posts/${searchid}/${index}`).delete().$promise.then(function(results) {
        return results
      })
    },
    deleteDupes: function(id, dupesRemoved) {
      return $resource(`https://jhfcapstone.herokuapp.com/posts/${id}`).save(dupesRemoved).$promise.then(function(results) {
        searchService.resultsObjSetter(results)
        return;
      })
    },
    favorite: function(id, index){
      return $resource(`https://jhfcapstone.herokuapp.com/posts/favorite/${id}/${index}`).save().$promise.then(function(results){
        searchService.resultsObjSetter(results)
        return results;
      })
    },
    unfavorite: function(id, index){
      return $resource(`https://jhfcapstone.herokuapp.com/posts/unfavorite/${id}/${index}`).save().$promise.then(function(results){
        searchService.resultsObjSetter(results)
        return results;
      })
    }
  }
})

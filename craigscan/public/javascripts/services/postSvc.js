app.service('postService', function($resource){
  return {
    delete: function(searchid, index){
      console.log('searchid, index:', searchid, index);
      return $resource(`//localhost:3000/posts/${searchid}/${index}`).delete().$promise.then(function(results) {
        resultsObj = results;
      })
    }
  }
})

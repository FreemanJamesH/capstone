app.controller('resultsController', function($scope, $mdDialog, searchService, postService, randomString) {;
  $scope.resultsObj = searchService.resultsObjGetter();
  console.log('results obj, initial load:', $scope.resultsObj);
  $scope.dupeShow = false
  $scope.imageHide = false

  $scope.delete = function(index) {
    postService.delete($scope.resultsObj._id, index).then(function(results) {
      searchService.resultsObjSetter(results)
      $scope.resultsObj = searchService.resultsObjGetter()
    })
  }

  $scope.deleteDupes = function() {
    postService.deleteDupes().then(function(results) {
      $scope.resultsObj = searchService.resultsObjGetter()
      console.log('dupes deleted, new results obj:', $scope.resultsObj);
    })
  }

  $scope.saveDialog = function() {
    $mdDialog.show(
      $mdDialog.prompt()
      .clickOutsideToClose(true)
      .title('Please choose a name for your search.')
      .openFrom('.resultsform')
      .ok('Save')
    ).then(function(results) {
      let search = $scope.resultsObj
      delete search.dupeCount
      delete search.resultCount
      search.title = results
      searchService.saveSearch(search)
    })
  }

})

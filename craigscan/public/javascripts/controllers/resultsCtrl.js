app.controller('resultsController', function($scope, $mdDialog, searchService, postService, randomString) {;
  $scope.resultsObj = searchService.resultsObjGetter();
  $scope.dupeShow = false
  $scope.imageHide = false
  $scope.dupeCount = $scope.resultsObj.dupeCount

  // $scope.$watch('resultsObj', function() {
  //   $scope.dupeCount = $scope.resultsObj.results.length
  // }, true)

  $scope.delete = function(index) {
    postService.delete($scope.resultsObj._id, index).then(function(results) {
      searchService.resultsObjSetter(results)
      $scope.resultsObj = searchService.resultsObjGetter()
    })
  }

  $scope.deleteDupes = function() {
    function dupeCheck(result) {
      return !result.dupe
    }
    let dupesRemoved = $scope.resultsObj.results.filter(dupeCheck)
    if ($scope.resultsObj._id) {
      postService.deleteDupes($scope.resultsObj._id, dupesRemoved).then(function(results) {
        $scope.resultsObj = searchService.resultsObjGetter()
      })
    } else {
      $scope.resultsObj.results = dupesRemoved
      $scope.dupeCount = 0
    }
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

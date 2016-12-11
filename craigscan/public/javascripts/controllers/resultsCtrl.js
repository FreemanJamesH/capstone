app.controller('resultsController', function($scope, $mdDialog, searchService, postService) {;
  $scope.resultsObj = searchService.resultsObjGetter();
  $scope.dupeShow = false
  $scope.imageHide = false
  $scope.dupeCount = $scope.resultsObj.dupeCount

  $scope.delete = function(resultId) {
    console.log(resultId);
    postService.delete($scope.resultsObj._id, resultId).then(function(results) {
      searchService.resultsObjSetter(results)
      $scope.resultsObj = searchService.resultsObjGetter()
    })
  }

  $scope.deleteAnon = function(index){
    let deleted = $scope.resultsObj.results.splice(index,1)
    console.log(deleted[0]);
    if (deleted[0].dupe){
      $scope.dupeCount--
    } else {
      $scope.resultsObj.resultCount--
    }
  }

  $scope.deleteDupes = function() {
    let dupesRemoved = $scope.resultsObj.results.filter(function(result) {
      return !result.dupe
    })

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

app.controller('resultsController', function($scope, $routeParams, $mdDialog, searchService, postService, $window) {

  $scope.loading = true;
  $scope.loadingMessage = `Loading your results...`

  setTimeout(function(){
    $scope.loadingMessage = `Thank you for your patience...`
    $scope.$apply()
    setTimeout(function(){
      $scope.loadingMessage = `Searches returning many results can take time to process...`
      $scope.$apply()
    }, 4000)
  }, 4000)


  if (!(searchService.resultsObjGetter()._id) && !$routeParams.searchId) {
    let searchParams = {}
    searchParams.regionChoice = $window.localStorage.regionChoice
    searchParams.url = $window.localStorage.url
    searchService.newSearch(searchParams).then(function(results) {
      $scope.resultsObj = searchService.resultsObjGetter();
      $scope.dupeCount = $scope.resultsObj.dupeCount
      $scope.loading = false;
    })
  } else {
    searchService.viewSearch($routeParams.searchId).then(function(){
      $scope.resultsObj = searchService.resultsObjGetter()
      $scope.dupeCount = $scope.resultsObj.dupeCount
      $scope.loading = false;
    })
  }

  $scope.dupeShow = false
  $scope.imageHide = false

  $scope.delete = function(resultId) {
    console.log(resultId);
    postService.delete($scope.resultsObj._id, resultId).then(function(results) {
      searchService.resultsObjSetter(results)
      $scope.resultsObj = searchService.resultsObjGetter()
    })
  }

  $scope.deleteAnon = function(index) {
    let deleted = $scope.resultsObj.results.splice(index, 1)
    console.log(deleted[0]);
    if (deleted[0].dupe) {
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
        $scope.dupeCount = $scope.resultsObj.dupeCount;
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
      let search = Object.assign({}, $scope.resultsObj)
      delete search.dupeCount
      delete search.resultCount
      search.title = results
      searchService.saveSearch(search)
    })
  }
})

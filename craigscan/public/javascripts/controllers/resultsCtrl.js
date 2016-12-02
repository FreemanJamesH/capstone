app.controller('resultsController', function($scope, $mdDialog, searchService, postService, randomString){
  $scope.resultsObj = searchService.resultsObjGetter();
  $scope.dupeShow = false
  $scope.imageHide = false

  $scope.delete = function(index){
    postService.delete($scope.resultsObj._id, index).then(function(results){
      searchService.resultsObjSetter(results)
      $scope.resultsObj = searchService.resultsObjGetter()
    })
  }

  $scope.saveDialog = function(){
    $mdDialog.show(
      $mdDialog.prompt()
        .clickOutsideToClose(true)
        .title('Please choose a name for your search.')
        .openFrom('.resultsform')
        .ok('Save')
    ).then(function(results){
      let search = $scope.resultsObj
      search.title = results
      searchService.saveSearch(search)
    })
  }

})

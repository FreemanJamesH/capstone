app.controller('resultsController', function($scope, $mdDialog, searchService, randomString){
  $scope.obj = searchService.resultsObjGetter();
  $scope.arr = $scope.obj.dataArr
  $scope.dupeShow = false
  $scope.imageHide = false
  $scope.saveDialog = function(){
    $mdDialog.show(
      $mdDialog.prompt()
        .clickOutsideToClose(true)
        .title('Please choose a name for your search.')
        .openFrom('.resultsform')
        .ok('Save')
    ).then(function(results){
      let search = {}
      search.title = results
      search.results = $scope.arr
      search.id = randomString.getString()
      searchService.saveSearch(search)
    })
  }

})

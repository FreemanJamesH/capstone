app.controller('dashController', function($scope, $location, userService, searchService) {

  $scope.updating = false;

  userService.getUser().then(function(results) {
    $scope.colorTracker = []
    for (var i = 0; i < results.searches.length; i++) {
      $scope.colorTracker[i] = 0
    }
    console.log($scope.colorTracker);
    $scope.userObj = results
    console.log($scope.userObj);
  })

  $scope.deleteSearch = function(id, index) {

    searchService.deleteSearch(id).then(function(results) {
      $scope.colorTracker.splice(index,1)
      for (var i = index; i < $scope.colorTracker.length; i++){
        $scope.colorTracker[i]++
      }
      $scope.userObj = results
    })

    console.log(`searches in user obj:`, $scope.userObj.searches);

  }

  $scope.viewSearch = function(id) {
    $location.path(`/results/${id}`)
  }

  $scope.updateSearch = function(id, $index){
    $scope.userObj.searches[$index].updating = true
    $scope.updating = true;
    searchService.updateSearch(id).then(function(results){
      $scope.userObj.searches[$index].updating = false
      $scope.userObj = results
    })
  }
})

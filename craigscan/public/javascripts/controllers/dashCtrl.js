app.controller('dashController', function($scope, $location, userService, searchService) {

  console.log('dash controller initialized');

  $scope.updating = false;

  userService.getUser().then(function(results) {
    $scope.userObj = results
  })

  $scope.deleteSearch = function(id) {
    searchService.deleteSearch(id).then(function(results) {
      $scope.userObj = results
    })
  }

  $scope.viewSearch = function(id) {
    $location.path(`/results/${id}`)
  }

  $scope.updateSearch = function(id){
    $scope.updating = true;
    searchService.updateSearch(id).then(function(results){
      $scope.updating = false;
      $scope.userObj = results
    })
  }
})

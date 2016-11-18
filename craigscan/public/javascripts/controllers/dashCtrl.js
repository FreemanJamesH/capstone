app.controller('dashController', function($scope, userService, searchService) {
  userService.getUser().then(function(results) {
    $scope.userObj = results
  })

  $scope.deleteSearch = function(id){
    console.log('id in deleteSearch: ', id);
    searchService.deleteSearch(id).then(function(results){
      $scope.userObj = results
    })
  }

  $scope.viewSearch = function(id){
    searchService.viewSearch(id).then(function(results){
      $scope.userObj = results
    })
  }
})

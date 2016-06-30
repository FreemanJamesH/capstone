app.controller('MainController', function($scope, $http, searchService) {
  $scope.hello = 'hello'
  $scope.submit = function() {
    let searchParams = {};
    searchParams.title = $scope.scantitle
    searchParams.date = $scope.scandate
    searchParams.query = $scope.query
    searchParams.location = $scope.scanlocation
    searchParams.category = $scope.scancategory
  }

  $scope.arr = [1,2,3]

  $scope.resultArr = searchService.search().then(function(results) {
    $scope.arr = results
  })


})

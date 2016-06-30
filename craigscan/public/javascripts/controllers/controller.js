app.controller('MainController', function($scope, $http, searchService, $location) {
  $scope.hello = 'hello'
  $scope.arr = searchService.resultsArrGetter();
  console.log('ARR', $scope.arr);

  $scope.submit = function() {
    var searchParams = {};
    $scope.hello = 'goodbye'
    searchParams.title = $scope.scantitle
    searchParams.date = $scope.scandate
    searchParams.query = $scope.query
    searchParams.location = $scope.scanlocation
    searchParams.category = $scope.scancategory
    console.log('searchParams', searchParams)
    searchService.search(searchParams).then(function(results) {
      $location.path('/results')
    })
  }
})

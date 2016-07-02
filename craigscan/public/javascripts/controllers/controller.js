app.controller('MainController', function($scope, $http, searchService, stateListService, $location) {
  stateListService.retrieve().then(function(results){
    $scope.stateListProto = stateListService.resultsArrGetter();
    console.log('scope slsproto:', $scope.stateListProto)
  })

  $scope.arr = searchService.resultsArrGetter();






  $scope.submit = function() {
    var searchParams = {};
    searchParams.url = $scope.regionChoice
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

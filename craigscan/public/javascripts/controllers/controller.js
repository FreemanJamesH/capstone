app.controller('MainController', function($scope, $http, searchService, stateListService, $location) {
  stateListService.retrieve().then(function(results){
    $scope.stateListProto = stateListService.resultsArrGetter();
    console.log('scope slsproto:', $scope.stateListProto)
  })

  $scope.obj = searchService.resultsObjGetter();
  $scope.arr = $scope.obj.dataArr






  $scope.submit = function() {
    var searchParams = {};
    searchParams.url = 'http://' + $scope.regionChoice + 'search/apa?'
    if ($scope.query){
      searchParams.url += ('&query=' + $scope.query)
    }
    if ($scope.distance){
      searchParams.url += ('&search_distance=' + $scope.distance)
    }
    if ($scope.postal){
      searchParams.url += ('&postal=' + $scope.postal)
    }
    if ($scope.min_price){
      searchParams.url += ('&min_price=' + $scope.min_price)
    }
    if ($scope.max_price){
      searchParams.url += ('&max_price=' + $scope.max_price)
    }
    searchParams.title = $scope.scantitle
    searchService.search(searchParams).then(function(results) {
      $location.path('/results')
    })
  }
})

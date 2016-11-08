app.controller('AuthController', function($scope, $http, $location, authService, userService) {

  $scope.user = {};

  $scope.signup = function() {
    userService.signup($scope.user)
  }

  $scope.login = function() {
    userService.login($scope.user)
  }

})

app.controller('MainController', function($scope, $http, searchService, stateListService, $location, authService, userService) {
  stateListService.retrieve().then(function() {
    $scope.stateListProto = stateListService.resultsArrGetter();
  })

  $scope.dashboard = function(){
    userService.getUser()
  }

  $scope.obj = searchService.resultsObjGetter();
  $scope.arr = $scope.obj.dataArr
  $scope.dupeShow = false
  $scope.imageHide = false
  $scope.loggit = function() {
    $scope.dupeShow
  }

  $scope.submit = function() {
    var searchParams = {};
    searchParams.regionChoice = $scope.regionChoice
    searchParams.url = 'http://' + $scope.regionChoice + 'search/apa?'
    if ($scope.query) {
      searchParams.url += ('&query=' + $scope.query)
    }
    if ($scope.distance) {
      searchParams.url += ('&search_distance=' + $scope.distance)
    }
    if ($scope.postal) {
      searchParams.url += ('&postal=' + $scope.postal)
    }
    if ($scope.min_price) {
      searchParams.url += ('&min_price=' + $scope.min_price)
    }
    if ($scope.max_price) {
      searchParams.url += ('&max_price=' + $scope.max_price)
    }
    searchParams.title = $scope.scantitle
    searchService.search(searchParams).then(function(results) {
      $location.path('/results')
    })
  }
})

app.controller('dashController', function($scope, userService){
  userService.getUser().then(function(results){
    console.log('results in dash: ', results);
    $scope.userObj = results
  })
})

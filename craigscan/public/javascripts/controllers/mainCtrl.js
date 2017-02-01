app.controller('MainController', function($scope, $http, searchService, stateListService, $location, authService, userService, $window, $q) {

  $scope.stateChoice = undefined;
  $scope.regionChoice = undefined;

  stateListService.retrieve().then(function() {
    $scope.stateListProto = stateListService.resultsArrGetter();
  })

  $scope.logout = function() {
    authService.logout()
    $scope.username = null
  }

  $scope.home = function() {
    $location.path('/')
  }

  $scope.$watch(function() {
      return $window.localStorage.getItem('craigsbliss-token')
    },
    function(newValue) {
      if (newValue) {
        let decodedPayload = JSON.parse(atob(newValue.split('.')[1]))
        $scope.username = decodedPayload.username
      }
    },
    true
  )

  $scope.reset = function(){
    $scope.submitted = false;
  }

  $scope.dashboard = function() {
    userService.getUser()
  }

  $scope.submit = function() {
    $scope.submitted = true;
    if ($scope.stateChoice && $scope.regionChoice) {
      let searchParams = {
        regionChoice: $scope.regionChoice,
        updated: Date.now(),
        query: $scope.query,
        search_distance: $scope.distance,
        postal: $scope.postal,
        min_price: $scope.min_price,
        max_price: $scope.max_price
      }
      $window.localStorage['searchParams'] = JSON.stringify(searchParams)
      $window.localStorage['regionChoice'] = $scope.regionChoice
      $location.path('/results')
    }
  }
})

app.controller('MainController', function($scope, $http, searchService, stateListService, $location, authService, userService, $window, $q) {

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

  $scope.dashboard = function() {
    userService.getUser()
  }

  $scope.submit = function() {
    let url = $scope.regionChoice + 'search/apa?'
    let searchParams = {
      query: $scope.query,
      distance: $scope.distance,
      postal: $scope.distance,
      min_price: $scope.min_price,
      max_price: $scope.max_price
    }
    for (var param in searchParams) {
      if (searchParams[param]) {
        url += `&${param}=${searchParams[param]}`
      }
    }
    $window.localStorage['searchParams'] = JSON.stringify(searchParams)
    $window.localStorage['url'] = url
    $window.localStorage['regionChoice'] = $scope.regionChoice
    $location.path('/results')
  }
})

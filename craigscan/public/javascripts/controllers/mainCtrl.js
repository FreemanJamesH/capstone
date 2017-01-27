app.controller('MainController', function($scope, $http, searchService, stateListService, $location, authService, userService, $window, $q) {

  stateListService.retrieve().then(function() {
    $scope.stateListProto = stateListService.resultsArrGetter();
  })

  $scope.logout = function(){
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
    var url;
    url = $scope.regionChoice + 'search/apa?'
    if ($scope.query) {
      url += ('&query=' + $scope.query)
    }
    if ($scope.distance) {
      url += ('&search_distance=' + $scope.distance)
    }
    if ($scope.postal) {
      url += ('&postal=' + $scope.postal)
    }
    if ($scope.min_price) {
      url += ('&min_price=' + $scope.min_price)
    }
    if ($scope.max_price) {
      url += ('&max_price=' + $scope.max_price)
    }
    $window.localStorage['url'] = url
    $window.localStorage['regionChoice'] = $scope.regionChoice
    $location.path('/results')
  }
})

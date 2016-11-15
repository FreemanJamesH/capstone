app.controller('MainController', function($scope, $http, searchService, stateListService, $location, authService, userService, $window, $q) {
  stateListService.retrieve().then(function() {
    $scope.stateListProto = stateListService.resultsArrGetter();
  })

  $scope.logout = function() {
    console.log('logout in controller called');
    $q(function(resolve, reject) {
      authService.logout()
      resolve('done!')
    }).then(function(results) {
      // $scope.$apply()
    })
  }

  $scope.home = function() {
    $location.path('/')
  }

  $scope.$watch(function() {
      return $window.localStorage.getItem('craigsbliss-token')
    },
    function(newValue) {
      if (newValue) {
        console.log('new value:', newValue);
        let decodedPayload = JSON.parse(atob(newValue.split('.')[1]))
        $scope.username = decodedPayload.username
      }
    }
  )

  $scope.dashboard = function() {
    userService.getUser()
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

app.controller('AuthController', function($scope, $http, $location, authService, userService) {
  $scope.user = {};

  $scope.signup = function() {
    userService.signup($scope.user)
  }

  $scope.login = function() {
    userService.login($scope.user)
  }

})

app.controller('resultsController', function($scope, $mdDialog, searchService){
  $scope.obj = searchService.resultsObjGetter();
  $scope.arr = $scope.obj.dataArr
  $scope.dupeShow = false
  $scope.imageHide = false
  $scope.saveDialog = function(){
    $mdDialog.show(
      $mdDialog.prompt()
        .clickOutsideToClose(true)
        .title('Please choose a name for your search.')
        .openFrom('.resultsform')
        .ok('Save')
    ).then(function(results){
      let search = {}
      search.title = results
      search.results = $scope.arr
      searchService.saveSearch(search)
    })
  }

})

app.controller('dashController', function($scope, userService) {
  userService.getUser().then(function(results) {
    console.log('results in dash: ', results);
    $scope.userObj = results
  })
})

app.controller('AuthController', function($scope, $http, $location, $window, authService, userService) {
  $scope.user = {};
  $scope.credentialsExistError = false;
  $scope.submitted = false;


  $scope.signup = function() {
    $scope.submitted = true;
    if ($scope.signupForm.$valid) {
      userService.signup($scope.user).then(function(response){
        if (response.message){
          if (response.message.code === 11000){
            $scope.credentialsExistError = true;
          }
        } else {
          $location.path('/')
        }
      })
    }
  }

  $scope.login = function() {
    $scope.submitted = true;
    userService.login($scope.user).then(function(response){
      if (response.credentialsInvalid){
        $scope.credentialsInvalid = true
      } else {
        if ($window.localStorage.searchParams){
          let localStorageTime = Math.round(JSON.parse($window.localStorage.searchParams).updated/1000)
          let timeNow = Math.round(Date.now()/1000)
          let timeSinceLastSearch = timeNow - localStorageTime
          if (timeSinceLastSearch > 3600){
            $location.path('/')
          } else {
            $location.path('/results')
          }
        } else {
          $location.path('/')
        }
      }
    })
  }

})

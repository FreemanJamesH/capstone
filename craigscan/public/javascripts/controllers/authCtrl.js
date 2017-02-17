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
      console.log('the unix time is:', JSON.parse($window.localStorage.searchParams).updated)
        $location.path('/')
      }
    })
  }

})

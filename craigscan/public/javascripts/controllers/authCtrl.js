app.controller('AuthController', function($scope, $http, $location, authService, userService) {  $scope.user = {};

  $scope.signup = function() {
    console.log('errors?:', $scope.signupForm.$error);
    console.log('valid?:', $scope.signupForm.$valid);
    $scope.submitted = true;
    // userService.signup($scope.user)
  }

  $scope.login = function() {
    $scope.submitted = true;
    // userService.login($scope.user)
  }

})

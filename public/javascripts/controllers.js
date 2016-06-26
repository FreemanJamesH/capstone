app.controller('MainController', function($scope, $http){
  $http.get('/test').then(function(response){
      $scope.message = response.data;
  })
})

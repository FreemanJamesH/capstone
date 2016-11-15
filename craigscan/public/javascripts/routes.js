app.config(function($routeProvider, $locationProvider){
  $routeProvider
  .when('/', {
    templateUrl: './partials/scan.html',
    controller: 'MainController'
  })
  .when('/dashboard', {
    templateUrl: './partials/dashboard.html',
    controller: 'dashController'
  })
  .when('/results', {
    templateUrl: './partials/results.html',
    controller: 'resultsController'
  })
  .when('/saved', {
    templateUrl: './partials/saved.html',
    controller: 'MainController'
  })
  .when('/signup', {
    templateUrl: './partials/signup.html',
    controller: 'AuthController'
  })
  .when('/login', {
    templateUrl: './partials/login.html',
    controller: 'AuthController'
  })
  .when('/error', {
    templateUrl: './partials/error.html',
    controller: 'dashController'
  })
  .otherwise({redirectTo:'/'});
  $locationProvider.html5Mode(true);

})

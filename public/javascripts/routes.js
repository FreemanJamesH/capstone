app.config(function($routeProvider, $locationProvider){
  $routeProvider
  .when('/', {
    templateUrl: '/partials/scan.html',
    controller: 'MainController'
  })
  .when('/dashboard', {
    templateUrl: '/partials/dashboard.html',
    controller: 'MainController'
  })
  .when('/results', {
    templateUrl: '/partials/results.html',
    controller: 'MainController'
  })
  .when('/saved', {
    templateUrl: '/partials/saved.html',
    controller: 'MainController'
  })
  .otherwise({redirectTo:'/'});
  $locationProvider.html5Mode(true);

})

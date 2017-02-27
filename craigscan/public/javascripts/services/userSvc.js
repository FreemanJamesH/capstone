app.service('userService', ['$resource', '$location', function($resource, $location, $window) {
  return {
    signup: function(obj) {
      return $resource('https://jhfcapstone.herokuapp.com/auth/signup').save(obj).$promise.then(function(response){
        return response
      })
    },
    login: function(obj) {
      return $resource('https://jhfcapstone.herokuapp.com/auth/login').save(obj).$promise.then(function(response){
        return response
      })
    },
    logout: function() {
      $window.localStorage.removeItem('craigsbliss-token')
      return
    },
    getUser: function() {
      return $resource('https://jhfcapstone.herokuapp.com/user/dashboard').get().$promise.then(function(response) {
          $location.path('/dashboard')
          return response
        },
        function(err) {
          $location.path('/error')
        })
    }
  }
}])

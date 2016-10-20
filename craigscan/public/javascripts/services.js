app.factory('authInterceptor', ['authService', function(auth) {

  return {
    request: function(config) {
      var token = auth.getToken();
      if (config.url.indexOf('//localhost:3000/') === 0) {
        console.log('setting Authorization header');
        config.headers.Authorization = `Bearer ${token}`
      }
      console.log('Returning config: ', config);
      return config
    },
    response: function(res) {
      if (res.config.url.indexOf('http://localhost:3000/') === 0 && res.data.token) {
        auth.giveToken(res.data.token)
      }
      console.log('Returning res: ', res);
      return res
    }
  }
}])


app.service('authService', ['$window', function($window) {
  return {
    giveToken: function(token) {
      $window.localStorage['craigsbliss-token'] = token.jwt;
    },
    getToken: function() {
      return $window.localStorage['craigsbliss-token']
    },
    logout: function() {
      $window.localStorage.removeItem('craigsbliss-token')
    },
  }
}])

app.service('userService', ['$resource', function($resource) {
  return {
    signup: function(obj) {
      console.log('Signing up...');
      $resource('//localhost:3000/signup').save(obj)
    },
    login: function(obj) {
      console.log('Signing in...');
      return $resource('//localhost:3000/login').save(obj)
    }
  }
}])

app.service('searchService', ['$resource', function($resource) {
  var resultsObj = {};
  return {
    search: function(obj) {
      console.log('service obj: ', obj)
        // return $resource('https://jhfcapstone.herokuapp.com/api').save(obj).$promise.then(function(results) {
      return $resource('//localhost:3000/api').save(obj).$promise.then(function(results) {
        resultsObj = results;
      })
    },
    resultsObjGetter: function() {
      console.log('resultsObj: ', resultsObj)
      return resultsObj;
    }
  }
}])

app.service('stateListService', ['$resource', function($resource) {
  var resultsArr = [];
  return {
    retrieve: function(obj) {
      // return $resource('https://jhfcapstone.herokuapp.com/sls').get()
      return $resource('//localhost:3000/sls').get()
        .$promise.then(function(results) {
          resultsArr = results.finish;
        })
    },
    resultsArrGetter: function() {
      return resultsArr;
    }
  }
}])

app.config(function($httpProvider){
  $httpProvider.interceptors.push('authInterceptor')
})

app.factory('authInterceptor', ['authService', function(auth) {

  return {
    request: function(config) {
      var token = auth.getToken();
      if (config.url.indexOf('//localhost:3000/signup') === 0) {
        config.headers.Authorization = `Bearer ${token}`
      }
      console.log('req config: ', config);
      return config
    },
    response: function(res) {
      console.log('response interceptor firing');
      console.log('res: ', res);
      if (res.config.url.indexOf('//localhost:3000/signup') === 0 && res.data.jwt) {
        console.log('giving token: ', res.data);
        auth.giveToken(res.data)
      }
      return res
    }
  }
}])


app.service('authService', ['$window', function($window) {
  return {
    giveToken: function(token) {
      console.log('');
      $window.localStorage['craigsbliss-token'] = token.jwt;
    },
    getToken: function() {
      return $window.localStorage['craigsbliss-token']
    },
    logout: function() {
      $window.localStorage.removeItem('craigsbliss-token')
    },
    parseJwt: function(token){
      var base64Url = token.split('.')[1];
      var base64 = base64Url.replace('-', '+').replace('_', '/')
      return JSON.parse($window.atob(base64))
    },
    isAuthed: function(){
      var returnedToken = this.getToken();
      console.log('returned token:', returnedToken);
      if (returnedToken) {
        // var params = this.parseJwt(token);
        return true
      } else {
        return false
      }
    }
  }
}])

app.service('userService', ['$resource', function($resource) {
  return {
    signup: function(obj) {
      $resource('//localhost:3000/signup').save(obj)
    },
    login: function(obj) {
      return $resource('//localhost:3000/login').save(obj)
    }
  }
}])

app.service('searchService', ['$resource', function($resource) {
  var resultsObj = {};
  return {
    search: function(obj) {
        // return $resource('https://jhfcapstone.herokuapp.com/api').save(obj).$promise.then(function(results) {
      return $resource('//localhost:3000/api').save(obj).$promise.then(function(results) {
        resultsObj = results;
      })
    },
    resultsObjGetter: function() {
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

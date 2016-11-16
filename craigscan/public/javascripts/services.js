app.factory('authInterceptor', ['authService', function(auth) {
  return {
    request: function(config) {
      var token = auth.getToken();
      // if (config.url.indexOf('//localhost:3000/dashboard') === 0) {
      config.headers.token = token
        // }
      return config
    },
    response: function(res) {
      // if (res.config.url.indexOf('//localhost:3000/signup') === 0 && res.data.jwt) {
      if (res.data.jwt) {
        auth.giveToken(res.data)
      }
      return res
    }
  }
}])

app.service('randomString', function() {
  return {
    getString: function() {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for (var i = 0; i < 16; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    }
  }
})

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
    parseJwt: function(token) {
      if (token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace('-', '+').replace('_', '/')
        return JSON.parse($window.atob(base64))
      }
    },
    isAuthed: function() {
      var returnedToken = this.getToken();
      if (returnedToken) {
        return true
      } else {
        return false
      }
    }
  }
}])

app.service('userService', ['$resource', '$location', function($resource, $location, $window) {
  return {
    signup: function(obj) {
      return $resource('//localhost:3000/api/signup').save(obj)
    },
    login: function(obj) {
      return $resource('//localhost:3000/api/login').save(obj)
    },
    logout: function() {
      $window.localStorage.removeItem('craigsbliss-token')
      return 3
    },
    getUser: function() {
      return $resource('//localhost:3000/api/dashboard').get().$promise.then(function(response) {
          $location.path('/dashboard')
          return response
        },
        function(err) {
          $location.path('/error')
        })
    }
  }
}])

app.service('searchService', ['$resource', '$location', function($resource, $location) {
  var resultsObj = {};
  return {
    search: function(obj) {
      // return $resource('https://jhfcapstone.herokuapp.com/api').save(obj).$promise.then(function(results) {
      return $resource('//localhost:3000/api/scrape').save(obj).$promise.then(function(results) {
        console.log('setting results obj to results:', results);
        resultsObj = results;
      })
    },
    resultsObjGetter: function() {
      let dupeCount = 0;
      for (var i=0; i<resultsObj.dataArr.length; i++){
        if (resultsObj.dataArr[i].dupe){
          dupeCount++
        }
      }
      resultsObj.dupeCount = dupeCount
      resultsObj.resultCount = resultsObj.dataArr.length
      console.log('resultsObj in resultObjGetter: ', resultsObj);
      return resultsObj;
    },
    saveSearch: function(obj) {
      return $resource('//localhost:3000/api/savesearch').save(obj).$promise.then(function(results) {
        console.log(results);
      })
    },
    deleteSearch: function(id) {
      return $resource('//localhost:3000/api/deletesearch')
        .save({
          id: id
        })
        .$promise
        .then(function(results) {
          return results
        })
    },
    viewSearch: function(id){
      return $resource(`//localhost:3000/api/getsearch/${id}`)
        .get()
        .$promise
        .then(function(results){
          resultsObj.dataArr = results.search.results
          $location.path('/results')
        })
    }
  }
}])

app.service('stateListService', ['$resource', function($resource) {
  var resultsArr = [];
  return {
    retrieve: function(obj) {
      return $resource('https://jhfcapstone.herokuapp.com/sls').get()
        .$promise.then(function(results) {
          resultsArr = results.finish;
        })
    },
    resultsArrGetter: function() {
      return resultsArr;
    }
  }
}])

app.config(function($httpProvider) {
  $httpProvider.interceptors.push('authInterceptor')
})

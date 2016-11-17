(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
require('./authSvc.js')
require('./interceptorSvc.js')
require('./randomStringSvc.js')
require('./searchSvc.js')
require('./stateListSvc.js')
require('./userSvc.js')
require('./postSvc')

},{"./authSvc.js":1,"./interceptorSvc.js":3,"./postSvc":4,"./randomStringSvc.js":5,"./searchSvc.js":6,"./stateListSvc.js":7,"./userSvc.js":8}],3:[function(require,module,exports){
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

app.config(function($httpProvider) {
  $httpProvider.interceptors.push('authInterceptor')
})

},{}],4:[function(require,module,exports){
app.service('postService', function($resource){
  return {
    delete: function(searchid, index){
      console.log('searchid, index:', searchid, index);
      return $resource(`//localhost:3000/posts/${searchid}/${index}`).delete().$promise.then(function(results) {
        resultsObj = results;
      })
    }
  }
})

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
app.service('searchService', ['$resource', '$location', function($resource, $location) {
  var resultsObj = {};
  return {
    newSearch: function(obj) {
      // return $resource('https://jhfcapstone.herokuapp.com/api').save(obj).$promise.then(function(results) {
      return $resource('//localhost:3000/scrape/scrape').save(obj).$promise.then(function(results) {
        resultsObj = results;
      })
    },
    resultsObjGetter: function() {
      console.log('resultsObjGetter firing, resultsObj: ', resultsObj);
      let dupeCount = 0;
      for (var i=0; i<resultsObj.results.length; i++){
        if (resultsObj.results[i].dupe){
          dupeCount++
        }
      }
      resultsObj.dupeCount = dupeCount
      resultsObj.resultCount = resultsObj.results.length
      return resultsObj;
    },
    saveSearch: function(obj) {
      return $resource('//localhost:3000/search/savesearch').save(obj).$promise.then(function(results) {
      })
    },
    deleteSearch: function(id) {
      return $resource('//localhost:3000/search/deletesearch')
        .save({
          id: id
        })
        .$promise
        .then(function(results) {
          return results
        })
    },
    viewSearch: function(id){
      return $resource(`//localhost:3000/search/getsearch/${id}`)
        .get()
        .$promise
        .then(function(results){
          console.log('results in viewSearchMethod: ', results );
          resultsObj = results
          $location.path('/results')
        })
    }
  }
}])

},{}],7:[function(require,module,exports){
app.service('stateListService', ['$resource', function($resource) {
  var resultsArr = [];
  return {
    retrieve: function(obj) {
      return $resource('//localhost:3000/scrape/sls').get()
        .$promise.then(function(results) {
          resultsArr = results.finish;
        })
    },
    resultsArrGetter: function() {
      return resultsArr;
    }
  }
}])

},{}],8:[function(require,module,exports){
app.service('userService', ['$resource', '$location', function($resource, $location, $window) {
  return {
    signup: function(obj) {
      return $resource('//localhost:3000/auth/signup').save(obj)
    },
    login: function(obj) {
      return $resource('//localhost:3000/auth/login').save(obj)
    },
    logout: function() {
      $window.localStorage.removeItem('craigsbliss-token')
      return 3
    },
    getUser: function() {
      return $resource('//localhost:3000/user/dashboard').get().$promise.then(function(response) {
          $location.path('/dashboard')
          return response
        },
        function(err) {
          $location.path('/error')
        })
    }
  }
}])

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhdXRoU3ZjLmpzIiwiaW5kZXguanMiLCJpbnRlcmNlcHRvclN2Yy5qcyIsInBvc3RTdmMuanMiLCJyYW5kb21TdHJpbmdTdmMuanMiLCJzZWFyY2hTdmMuanMiLCJzdGF0ZUxpc3RTdmMuanMiLCJ1c2VyU3ZjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJhcHAuc2VydmljZSgnYXV0aFNlcnZpY2UnLCBbJyR3aW5kb3cnLCBmdW5jdGlvbigkd2luZG93KSB7XG4gIHJldHVybiB7XG4gICAgZ2l2ZVRva2VuOiBmdW5jdGlvbih0b2tlbikge1xuICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2VbJ2NyYWlnc2JsaXNzLXRva2VuJ10gPSB0b2tlbi5qd3Q7XG4gICAgfSxcbiAgICBnZXRUb2tlbjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gJHdpbmRvdy5sb2NhbFN0b3JhZ2VbJ2NyYWlnc2JsaXNzLXRva2VuJ11cbiAgICB9LFxuICAgIGxvZ291dDogZnVuY3Rpb24oKSB7XG4gICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdjcmFpZ3NibGlzcy10b2tlbicpXG4gICAgfSxcbiAgICBwYXJzZUp3dDogZnVuY3Rpb24odG9rZW4pIHtcbiAgICAgIGlmICh0b2tlbikge1xuICAgICAgICB2YXIgYmFzZTY0VXJsID0gdG9rZW4uc3BsaXQoJy4nKVsxXTtcbiAgICAgICAgdmFyIGJhc2U2NCA9IGJhc2U2NFVybC5yZXBsYWNlKCctJywgJysnKS5yZXBsYWNlKCdfJywgJy8nKVxuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZSgkd2luZG93LmF0b2IoYmFzZTY0KSlcbiAgICAgIH1cbiAgICB9LFxuICAgIGlzQXV0aGVkOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciByZXR1cm5lZFRva2VuID0gdGhpcy5nZXRUb2tlbigpO1xuICAgICAgaWYgKHJldHVybmVkVG9rZW4pIHtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH1cbiAgfVxufV0pXG4iLCJyZXF1aXJlKCcuL2F1dGhTdmMuanMnKVxucmVxdWlyZSgnLi9pbnRlcmNlcHRvclN2Yy5qcycpXG5yZXF1aXJlKCcuL3JhbmRvbVN0cmluZ1N2Yy5qcycpXG5yZXF1aXJlKCcuL3NlYXJjaFN2Yy5qcycpXG5yZXF1aXJlKCcuL3N0YXRlTGlzdFN2Yy5qcycpXG5yZXF1aXJlKCcuL3VzZXJTdmMuanMnKVxucmVxdWlyZSgnLi9wb3N0U3ZjJylcbiIsImFwcC5mYWN0b3J5KCdhdXRoSW50ZXJjZXB0b3InLCBbJ2F1dGhTZXJ2aWNlJywgZnVuY3Rpb24oYXV0aCkge1xuICByZXR1cm4ge1xuICAgIHJlcXVlc3Q6IGZ1bmN0aW9uKGNvbmZpZykge1xuICAgICAgdmFyIHRva2VuID0gYXV0aC5nZXRUb2tlbigpO1xuICAgICAgLy8gaWYgKGNvbmZpZy51cmwuaW5kZXhPZignLy9sb2NhbGhvc3Q6MzAwMC9kYXNoYm9hcmQnKSA9PT0gMCkge1xuICAgICAgY29uZmlnLmhlYWRlcnMudG9rZW4gPSB0b2tlblxuICAgICAgICAvLyB9XG4gICAgICByZXR1cm4gY29uZmlnXG4gICAgfSxcbiAgICByZXNwb25zZTogZnVuY3Rpb24ocmVzKSB7XG4gICAgICAvLyBpZiAocmVzLmNvbmZpZy51cmwuaW5kZXhPZignLy9sb2NhbGhvc3Q6MzAwMC9zaWdudXAnKSA9PT0gMCAmJiByZXMuZGF0YS5qd3QpIHtcbiAgICAgIGlmIChyZXMuZGF0YS5qd3QpIHtcbiAgICAgICAgYXV0aC5naXZlVG9rZW4ocmVzLmRhdGEpXG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzXG4gICAgfVxuICB9XG59XSlcblxuYXBwLmNvbmZpZyhmdW5jdGlvbigkaHR0cFByb3ZpZGVyKSB7XG4gICRodHRwUHJvdmlkZXIuaW50ZXJjZXB0b3JzLnB1c2goJ2F1dGhJbnRlcmNlcHRvcicpXG59KVxuIiwiYXBwLnNlcnZpY2UoJ3Bvc3RTZXJ2aWNlJywgZnVuY3Rpb24oJHJlc291cmNlKXtcbiAgcmV0dXJuIHtcbiAgICBkZWxldGU6IGZ1bmN0aW9uKHNlYXJjaGlkLCBpbmRleCl7XG4gICAgICBjb25zb2xlLmxvZygnc2VhcmNoaWQsIGluZGV4OicsIHNlYXJjaGlkLCBpbmRleCk7XG4gICAgICByZXR1cm4gJHJlc291cmNlKGAvL2xvY2FsaG9zdDozMDAwL3Bvc3RzLyR7c2VhcmNoaWR9LyR7aW5kZXh9YCkuZGVsZXRlKCkuJHByb21pc2UudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICAgIHJlc3VsdHNPYmogPSByZXN1bHRzO1xuICAgICAgfSlcbiAgICB9XG4gIH1cbn0pXG4iLCJhcHAuc2VydmljZSgncmFuZG9tU3RyaW5nJywgZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7XG4gICAgZ2V0U3RyaW5nOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0ZXh0ID0gXCJcIjtcbiAgICAgIHZhciBwb3NzaWJsZSA9IFwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODlcIjtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTY7IGkrKykge1xuICAgICAgICB0ZXh0ICs9IHBvc3NpYmxlLmNoYXJBdChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBwb3NzaWJsZS5sZW5ndGgpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0ZXh0O1xuICAgIH1cbiAgfVxufSlcbiIsImFwcC5zZXJ2aWNlKCdzZWFyY2hTZXJ2aWNlJywgWyckcmVzb3VyY2UnLCAnJGxvY2F0aW9uJywgZnVuY3Rpb24oJHJlc291cmNlLCAkbG9jYXRpb24pIHtcbiAgdmFyIHJlc3VsdHNPYmogPSB7fTtcbiAgcmV0dXJuIHtcbiAgICBuZXdTZWFyY2g6IGZ1bmN0aW9uKG9iaikge1xuICAgICAgLy8gcmV0dXJuICRyZXNvdXJjZSgnaHR0cHM6Ly9qaGZjYXBzdG9uZS5oZXJva3VhcHAuY29tL2FwaScpLnNhdmUob2JqKS4kcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgIHJldHVybiAkcmVzb3VyY2UoJy8vbG9jYWxob3N0OjMwMDAvc2NyYXBlL3NjcmFwZScpLnNhdmUob2JqKS4kcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgICAgcmVzdWx0c09iaiA9IHJlc3VsdHM7XG4gICAgICB9KVxuICAgIH0sXG4gICAgcmVzdWx0c09iakdldHRlcjogZnVuY3Rpb24oKSB7XG4gICAgICBjb25zb2xlLmxvZygncmVzdWx0c09iakdldHRlciBmaXJpbmcsIHJlc3VsdHNPYmo6ICcsIHJlc3VsdHNPYmopO1xuICAgICAgbGV0IGR1cGVDb3VudCA9IDA7XG4gICAgICBmb3IgKHZhciBpPTA7IGk8cmVzdWx0c09iai5yZXN1bHRzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgaWYgKHJlc3VsdHNPYmoucmVzdWx0c1tpXS5kdXBlKXtcbiAgICAgICAgICBkdXBlQ291bnQrK1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXN1bHRzT2JqLmR1cGVDb3VudCA9IGR1cGVDb3VudFxuICAgICAgcmVzdWx0c09iai5yZXN1bHRDb3VudCA9IHJlc3VsdHNPYmoucmVzdWx0cy5sZW5ndGhcbiAgICAgIHJldHVybiByZXN1bHRzT2JqO1xuICAgIH0sXG4gICAgc2F2ZVNlYXJjaDogZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gJHJlc291cmNlKCcvL2xvY2FsaG9zdDozMDAwL3NlYXJjaC9zYXZlc2VhcmNoJykuc2F2ZShvYmopLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgfSlcbiAgICB9LFxuICAgIGRlbGV0ZVNlYXJjaDogZnVuY3Rpb24oaWQpIHtcbiAgICAgIHJldHVybiAkcmVzb3VyY2UoJy8vbG9jYWxob3N0OjMwMDAvc2VhcmNoL2RlbGV0ZXNlYXJjaCcpXG4gICAgICAgIC5zYXZlKHtcbiAgICAgICAgICBpZDogaWRcbiAgICAgICAgfSlcbiAgICAgICAgLiRwcm9taXNlXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0c1xuICAgICAgICB9KVxuICAgIH0sXG4gICAgdmlld1NlYXJjaDogZnVuY3Rpb24oaWQpe1xuICAgICAgcmV0dXJuICRyZXNvdXJjZShgLy9sb2NhbGhvc3Q6MzAwMC9zZWFyY2gvZ2V0c2VhcmNoLyR7aWR9YClcbiAgICAgICAgLmdldCgpXG4gICAgICAgIC4kcHJvbWlzZVxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXN1bHRzKXtcbiAgICAgICAgICBjb25zb2xlLmxvZygncmVzdWx0cyBpbiB2aWV3U2VhcmNoTWV0aG9kOiAnLCByZXN1bHRzICk7XG4gICAgICAgICAgcmVzdWx0c09iaiA9IHJlc3VsdHNcbiAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnL3Jlc3VsdHMnKVxuICAgICAgICB9KVxuICAgIH1cbiAgfVxufV0pXG4iLCJhcHAuc2VydmljZSgnc3RhdGVMaXN0U2VydmljZScsIFsnJHJlc291cmNlJywgZnVuY3Rpb24oJHJlc291cmNlKSB7XG4gIHZhciByZXN1bHRzQXJyID0gW107XG4gIHJldHVybiB7XG4gICAgcmV0cmlldmU6IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuICRyZXNvdXJjZSgnLy9sb2NhbGhvc3Q6MzAwMC9zY3JhcGUvc2xzJykuZ2V0KClcbiAgICAgICAgLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgICAgIHJlc3VsdHNBcnIgPSByZXN1bHRzLmZpbmlzaDtcbiAgICAgICAgfSlcbiAgICB9LFxuICAgIHJlc3VsdHNBcnJHZXR0ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHJlc3VsdHNBcnI7XG4gICAgfVxuICB9XG59XSlcbiIsImFwcC5zZXJ2aWNlKCd1c2VyU2VydmljZScsIFsnJHJlc291cmNlJywgJyRsb2NhdGlvbicsIGZ1bmN0aW9uKCRyZXNvdXJjZSwgJGxvY2F0aW9uLCAkd2luZG93KSB7XG4gIHJldHVybiB7XG4gICAgc2lnbnVwOiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiAkcmVzb3VyY2UoJy8vbG9jYWxob3N0OjMwMDAvYXV0aC9zaWdudXAnKS5zYXZlKG9iailcbiAgICB9LFxuICAgIGxvZ2luOiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiAkcmVzb3VyY2UoJy8vbG9jYWxob3N0OjMwMDAvYXV0aC9sb2dpbicpLnNhdmUob2JqKVxuICAgIH0sXG4gICAgbG9nb3V0OiBmdW5jdGlvbigpIHtcbiAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2NyYWlnc2JsaXNzLXRva2VuJylcbiAgICAgIHJldHVybiAzXG4gICAgfSxcbiAgICBnZXRVc2VyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAkcmVzb3VyY2UoJy8vbG9jYWxob3N0OjMwMDAvdXNlci9kYXNoYm9hcmQnKS5nZXQoKS4kcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy9kYXNoYm9hcmQnKVxuICAgICAgICAgIHJldHVybiByZXNwb25zZVxuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnL2Vycm9yJylcbiAgICAgICAgfSlcbiAgICB9XG4gIH1cbn1dKVxuIl19

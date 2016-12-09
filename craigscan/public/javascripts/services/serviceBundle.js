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
app.service('postService', function($resource, searchService){
  return {
    delete: function(searchid, index){
      return $resource(`//localhost:3000/posts/${searchid}/${index}`).delete().$promise.then(function(results) {
        return results
      })
    },
    deleteDupes: function(){
      function dupeCheck(result){
        return !result.dupe
      }
      let currentResults = searchService.resultsObjGetter()
      let dupesRemoved = currentResults.results.filter(dupeCheck)
      console.log('currentResults:', currentResults);
      return $resource(`//localhost:3000/posts/${currentResults._id}`).save(dupesRemoved).$promise.then(function(results){
        searchService.resultsObjSetter(results)
        return;
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
    resultsObjSetter: function(obj){
      resultsObj = obj
    },
    resultsObjGetter: function() {
      let i = 0;
      let dupeCount = 0;
      while (i<resultsObj.results.length){
        let checkAgainst = resultsObj.results[i]
        if (checkAgainst.dupe) {
          dupeCount++
        }
        for (var k = i+1; k < resultsObj.results.length; k++){
          let currentK = resultsObj.results[k]
          if (checkAgainst.title === currentK.title && checkAgainst.price === currentK.price){
            currentK.dupe = true
          } else {
            if (!currentK.dupe){
              currentK.dupe = false
            }
          }
        }
        i++
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
      console.log(obj);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhdXRoU3ZjLmpzIiwiaW5kZXguanMiLCJpbnRlcmNlcHRvclN2Yy5qcyIsInBvc3RTdmMuanMiLCJyYW5kb21TdHJpbmdTdmMuanMiLCJzZWFyY2hTdmMuanMiLCJzdGF0ZUxpc3RTdmMuanMiLCJ1c2VyU3ZjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiYXBwLnNlcnZpY2UoJ2F1dGhTZXJ2aWNlJywgWyckd2luZG93JywgZnVuY3Rpb24oJHdpbmRvdykge1xuICByZXR1cm4ge1xuICAgIGdpdmVUb2tlbjogZnVuY3Rpb24odG9rZW4pIHtcbiAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlWydjcmFpZ3NibGlzcy10b2tlbiddID0gdG9rZW4uand0O1xuICAgIH0sXG4gICAgZ2V0VG9rZW46IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICR3aW5kb3cubG9jYWxTdG9yYWdlWydjcmFpZ3NibGlzcy10b2tlbiddXG4gICAgfSxcbiAgICBsb2dvdXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnY3JhaWdzYmxpc3MtdG9rZW4nKVxuICAgIH0sXG4gICAgcGFyc2VKd3Q6IGZ1bmN0aW9uKHRva2VuKSB7XG4gICAgICBpZiAodG9rZW4pIHtcbiAgICAgICAgdmFyIGJhc2U2NFVybCA9IHRva2VuLnNwbGl0KCcuJylbMV07XG4gICAgICAgIHZhciBiYXNlNjQgPSBiYXNlNjRVcmwucmVwbGFjZSgnLScsICcrJykucmVwbGFjZSgnXycsICcvJylcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoJHdpbmRvdy5hdG9iKGJhc2U2NCkpXG4gICAgICB9XG4gICAgfSxcbiAgICBpc0F1dGhlZDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcmV0dXJuZWRUb2tlbiA9IHRoaXMuZ2V0VG9rZW4oKTtcbiAgICAgIGlmIChyZXR1cm5lZFRva2VuKSB7XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1dKVxuIiwicmVxdWlyZSgnLi9hdXRoU3ZjLmpzJylcbnJlcXVpcmUoJy4vaW50ZXJjZXB0b3JTdmMuanMnKVxucmVxdWlyZSgnLi9yYW5kb21TdHJpbmdTdmMuanMnKVxucmVxdWlyZSgnLi9zZWFyY2hTdmMuanMnKVxucmVxdWlyZSgnLi9zdGF0ZUxpc3RTdmMuanMnKVxucmVxdWlyZSgnLi91c2VyU3ZjLmpzJylcbnJlcXVpcmUoJy4vcG9zdFN2YycpXG4iLCJhcHAuZmFjdG9yeSgnYXV0aEludGVyY2VwdG9yJywgWydhdXRoU2VydmljZScsIGZ1bmN0aW9uKGF1dGgpIHtcbiAgcmV0dXJuIHtcbiAgICByZXF1ZXN0OiBmdW5jdGlvbihjb25maWcpIHtcbiAgICAgIHZhciB0b2tlbiA9IGF1dGguZ2V0VG9rZW4oKTtcbiAgICAgIC8vIGlmIChjb25maWcudXJsLmluZGV4T2YoJy8vbG9jYWxob3N0OjMwMDAvZGFzaGJvYXJkJykgPT09IDApIHtcbiAgICAgIGNvbmZpZy5oZWFkZXJzLnRva2VuID0gdG9rZW5cbiAgICAgICAgLy8gfVxuICAgICAgcmV0dXJuIGNvbmZpZ1xuICAgIH0sXG4gICAgcmVzcG9uc2U6IGZ1bmN0aW9uKHJlcykge1xuICAgICAgLy8gaWYgKHJlcy5jb25maWcudXJsLmluZGV4T2YoJy8vbG9jYWxob3N0OjMwMDAvc2lnbnVwJykgPT09IDAgJiYgcmVzLmRhdGEuand0KSB7XG4gICAgICBpZiAocmVzLmRhdGEuand0KSB7XG4gICAgICAgIGF1dGguZ2l2ZVRva2VuKHJlcy5kYXRhKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc1xuICAgIH1cbiAgfVxufV0pXG5cbmFwcC5jb25maWcoZnVuY3Rpb24oJGh0dHBQcm92aWRlcikge1xuICAkaHR0cFByb3ZpZGVyLmludGVyY2VwdG9ycy5wdXNoKCdhdXRoSW50ZXJjZXB0b3InKVxufSlcbiIsImFwcC5zZXJ2aWNlKCdwb3N0U2VydmljZScsIGZ1bmN0aW9uKCRyZXNvdXJjZSwgc2VhcmNoU2VydmljZSl7XG4gIHJldHVybiB7XG4gICAgZGVsZXRlOiBmdW5jdGlvbihzZWFyY2hpZCwgaW5kZXgpe1xuICAgICAgcmV0dXJuICRyZXNvdXJjZShgLy9sb2NhbGhvc3Q6MzAwMC9wb3N0cy8ke3NlYXJjaGlkfS8ke2luZGV4fWApLmRlbGV0ZSgpLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgICByZXR1cm4gcmVzdWx0c1xuICAgICAgfSlcbiAgICB9LFxuICAgIGRlbGV0ZUR1cGVzOiBmdW5jdGlvbigpe1xuICAgICAgZnVuY3Rpb24gZHVwZUNoZWNrKHJlc3VsdCl7XG4gICAgICAgIHJldHVybiAhcmVzdWx0LmR1cGVcbiAgICAgIH1cbiAgICAgIGxldCBjdXJyZW50UmVzdWx0cyA9IHNlYXJjaFNlcnZpY2UucmVzdWx0c09iakdldHRlcigpXG4gICAgICBsZXQgZHVwZXNSZW1vdmVkID0gY3VycmVudFJlc3VsdHMucmVzdWx0cy5maWx0ZXIoZHVwZUNoZWNrKVxuICAgICAgY29uc29sZS5sb2coJ2N1cnJlbnRSZXN1bHRzOicsIGN1cnJlbnRSZXN1bHRzKTtcbiAgICAgIHJldHVybiAkcmVzb3VyY2UoYC8vbG9jYWxob3N0OjMwMDAvcG9zdHMvJHtjdXJyZW50UmVzdWx0cy5faWR9YCkuc2F2ZShkdXBlc1JlbW92ZWQpLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzdWx0cyl7XG4gICAgICAgIHNlYXJjaFNlcnZpY2UucmVzdWx0c09ialNldHRlcihyZXN1bHRzKVxuICAgICAgICByZXR1cm47XG4gICAgICB9KVxuICAgIH1cbiAgfVxufSlcbiIsImFwcC5zZXJ2aWNlKCdyYW5kb21TdHJpbmcnLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHtcbiAgICBnZXRTdHJpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHRleHQgPSBcIlwiO1xuICAgICAgdmFyIHBvc3NpYmxlID0gXCJBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OVwiO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxNjsgaSsrKSB7XG4gICAgICAgIHRleHQgKz0gcG9zc2libGUuY2hhckF0KE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHBvc3NpYmxlLmxlbmd0aCkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuICB9XG59KVxuIiwiYXBwLnNlcnZpY2UoJ3NlYXJjaFNlcnZpY2UnLCBbJyRyZXNvdXJjZScsICckbG9jYXRpb24nLCBmdW5jdGlvbigkcmVzb3VyY2UsICRsb2NhdGlvbikge1xuICB2YXIgcmVzdWx0c09iaiA9IHt9O1xuICByZXR1cm4ge1xuICAgIG5ld1NlYXJjaDogZnVuY3Rpb24ob2JqKSB7XG4gICAgICAvLyByZXR1cm4gJHJlc291cmNlKCdodHRwczovL2poZmNhcHN0b25lLmhlcm9rdWFwcC5jb20vYXBpJykuc2F2ZShvYmopLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgcmV0dXJuICRyZXNvdXJjZSgnLy9sb2NhbGhvc3Q6MzAwMC9zY3JhcGUvc2NyYXBlJykuc2F2ZShvYmopLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgICByZXN1bHRzT2JqID0gcmVzdWx0cztcbiAgICAgIH0pXG4gICAgfSxcbiAgICByZXN1bHRzT2JqU2V0dGVyOiBmdW5jdGlvbihvYmope1xuICAgICAgcmVzdWx0c09iaiA9IG9ialxuICAgIH0sXG4gICAgcmVzdWx0c09iakdldHRlcjogZnVuY3Rpb24oKSB7XG4gICAgICBsZXQgaSA9IDA7XG4gICAgICBsZXQgZHVwZUNvdW50ID0gMDtcbiAgICAgIHdoaWxlIChpPHJlc3VsdHNPYmoucmVzdWx0cy5sZW5ndGgpe1xuICAgICAgICBsZXQgY2hlY2tBZ2FpbnN0ID0gcmVzdWx0c09iai5yZXN1bHRzW2ldXG4gICAgICAgIGlmIChjaGVja0FnYWluc3QuZHVwZSkge1xuICAgICAgICAgIGR1cGVDb3VudCsrXG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIgayA9IGkrMTsgayA8IHJlc3VsdHNPYmoucmVzdWx0cy5sZW5ndGg7IGsrKyl7XG4gICAgICAgICAgbGV0IGN1cnJlbnRLID0gcmVzdWx0c09iai5yZXN1bHRzW2tdXG4gICAgICAgICAgaWYgKGNoZWNrQWdhaW5zdC50aXRsZSA9PT0gY3VycmVudEsudGl0bGUgJiYgY2hlY2tBZ2FpbnN0LnByaWNlID09PSBjdXJyZW50Sy5wcmljZSl7XG4gICAgICAgICAgICBjdXJyZW50Sy5kdXBlID0gdHJ1ZVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoIWN1cnJlbnRLLmR1cGUpe1xuICAgICAgICAgICAgICBjdXJyZW50Sy5kdXBlID0gZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaSsrXG4gICAgICB9XG4gICAgICByZXN1bHRzT2JqLmR1cGVDb3VudCA9IGR1cGVDb3VudFxuICAgICAgcmVzdWx0c09iai5yZXN1bHRDb3VudCA9IHJlc3VsdHNPYmoucmVzdWx0cy5sZW5ndGhcbiAgICAgIHJldHVybiByZXN1bHRzT2JqO1xuICAgIH0sXG4gICAgc2F2ZVNlYXJjaDogZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gJHJlc291cmNlKCcvL2xvY2FsaG9zdDozMDAwL3NlYXJjaC9zYXZlc2VhcmNoJykuc2F2ZShvYmopLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgfSlcbiAgICB9LFxuICAgIGRlbGV0ZVNlYXJjaDogZnVuY3Rpb24oaWQpIHtcbiAgICAgIHJldHVybiAkcmVzb3VyY2UoJy8vbG9jYWxob3N0OjMwMDAvc2VhcmNoL2RlbGV0ZXNlYXJjaCcpXG4gICAgICAgIC5zYXZlKHtcbiAgICAgICAgICBpZDogaWRcbiAgICAgICAgfSlcbiAgICAgICAgLiRwcm9taXNlXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0c1xuICAgICAgICB9KVxuICAgIH0sXG4gICAgdmlld1NlYXJjaDogZnVuY3Rpb24oaWQpe1xuICAgICAgcmV0dXJuICRyZXNvdXJjZShgLy9sb2NhbGhvc3Q6MzAwMC9zZWFyY2gvZ2V0c2VhcmNoLyR7aWR9YClcbiAgICAgICAgLmdldCgpXG4gICAgICAgIC4kcHJvbWlzZVxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXN1bHRzKXtcbiAgICAgICAgICBjb25zb2xlLmxvZygncmVzdWx0cyBpbiB2aWV3U2VhcmNoTWV0aG9kOiAnLCByZXN1bHRzICk7XG4gICAgICAgICAgcmVzdWx0c09iaiA9IHJlc3VsdHNcbiAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnL3Jlc3VsdHMnKVxuICAgICAgICB9KVxuICAgIH1cbiAgfVxufV0pXG4iLCJhcHAuc2VydmljZSgnc3RhdGVMaXN0U2VydmljZScsIFsnJHJlc291cmNlJywgZnVuY3Rpb24oJHJlc291cmNlKSB7XG4gIHZhciByZXN1bHRzQXJyID0gW107XG4gIHJldHVybiB7XG4gICAgcmV0cmlldmU6IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuICRyZXNvdXJjZSgnLy9sb2NhbGhvc3Q6MzAwMC9zY3JhcGUvc2xzJykuZ2V0KClcbiAgICAgICAgLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgICAgIHJlc3VsdHNBcnIgPSByZXN1bHRzLmZpbmlzaDtcbiAgICAgICAgfSlcbiAgICB9LFxuICAgIHJlc3VsdHNBcnJHZXR0ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHJlc3VsdHNBcnI7XG4gICAgfVxuICB9XG59XSlcbiIsImFwcC5zZXJ2aWNlKCd1c2VyU2VydmljZScsIFsnJHJlc291cmNlJywgJyRsb2NhdGlvbicsIGZ1bmN0aW9uKCRyZXNvdXJjZSwgJGxvY2F0aW9uLCAkd2luZG93KSB7XG4gIHJldHVybiB7XG4gICAgc2lnbnVwOiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiAkcmVzb3VyY2UoJy8vbG9jYWxob3N0OjMwMDAvYXV0aC9zaWdudXAnKS5zYXZlKG9iailcbiAgICB9LFxuICAgIGxvZ2luOiBmdW5jdGlvbihvYmopIHtcbiAgICAgIGNvbnNvbGUubG9nKG9iaik7XG4gICAgICByZXR1cm4gJHJlc291cmNlKCcvL2xvY2FsaG9zdDozMDAwL2F1dGgvbG9naW4nKS5zYXZlKG9iailcbiAgICB9LFxuICAgIGxvZ291dDogZnVuY3Rpb24oKSB7XG4gICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdjcmFpZ3NibGlzcy10b2tlbicpXG4gICAgICByZXR1cm4gM1xuICAgIH0sXG4gICAgZ2V0VXNlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gJHJlc291cmNlKCcvL2xvY2FsaG9zdDozMDAwL3VzZXIvZGFzaGJvYXJkJykuZ2V0KCkuJHByb21pc2UudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvZGFzaGJvYXJkJylcbiAgICAgICAgICByZXR1cm4gcmVzcG9uc2VcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy9lcnJvcicpXG4gICAgICAgIH0pXG4gICAgfVxuICB9XG59XSlcbiJdfQ==

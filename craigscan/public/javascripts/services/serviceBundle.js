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
      return $window.localStorage.removeItem('craigsbliss-token')
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
require('./searchSvc.js')
require('./stateListSvc.js')
require('./userSvc.js')
require('./postSvc')

},{"./authSvc.js":1,"./interceptorSvc.js":3,"./postSvc":4,"./searchSvc.js":5,"./stateListSvc.js":6,"./userSvc.js":7}],3:[function(require,module,exports){
app.factory('authInterceptor', ['authService', function(auth) {
  return {
    request: function(config) {
      var token = auth.getToken();
      config.headers.token = token
      return config
    },
    response: function(res) {
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
app.service('postService', function($resource, searchService) {
  return {
    delete: function(searchid, index) {
      console.log('service delete:', searchid, index);
      return $resource(`//localhost:3000/posts/${searchid}/${index}`).delete().$promise.then(function(results) {
        return results
      })
    },
    deleteDupes: function(id, dupesRemoved) {
      return $resource(`//localhost:3000/posts/${id}`).save(dupesRemoved).$promise.then(function(results) {
        searchService.resultsObjSetter(results)
        return;
      })
    },
    favorite: function(id, index){
      return $resource(`//localhost:3000/posts/favorite/${id}/${index}`).save().$promise.then(function(results){
        searchService.resultsObjSetter(results)
        return results;
      })
    },
    unfavorite: function(id, index){
      return $resource(`//localhost:3000/posts/unfavorite/${id}/${index}`).save().$promise.then(function(results){
        searchService.resultsObjSetter(results)
        return results;
      })
    }
  }
})

},{}],5:[function(require,module,exports){
app.service('searchService', ['$resource', '$location', function($resource, $location) {
  var resultsObj = {};
  return {
    newSearch: function(obj) {
      // return $resource('https://jhfcapstone.herokuapp.com/api').save(obj).$promise.then(function(results) {
      return $resource('//localhost:3000/scrape/scrape').save(obj).$promise.then(function(results) {
        resultsObj = results;
      })
    },
    resultsObjSetter: function(obj) {
      resultsObj = obj
    },
    resultsObjGetter: function() {
      if (resultsObj.results) {
        let i = 0;
        let dupeCount = 0;
        let favCount = 0;
        while (i < resultsObj.results.length) {
          let checkAgainst = resultsObj.results[i]
          if (checkAgainst.dupe) {
            dupeCount++
          }
          if (checkAgainst.isFav) {
            favCount++
          }
          for (var k = i + 1; k < resultsObj.results.length; k++) {
            let currentK = resultsObj.results[k]
            if (checkAgainst.title === currentK.title && checkAgainst.price === currentK.price) {
              currentK.dupe = true
            } else {
              if (!currentK.dupe) {
                currentK.dupe = false
              }
            }
          }
          i++
        }
        resultsObj.favCount = favCount
        resultsObj.dupeCount = dupeCount
        resultsObj.resultCount = resultsObj.results.length
        return resultsObj;
      }
      return {}
    },
    saveSearch: function(obj) {
      console.log('saving search:', obj);
      return $resource('//localhost:3000/search/savesearch').save(obj).$promise.then(function(results) {
        return results
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
    viewSearch: function(id) {
      return $resource(`//localhost:3000/search/getsearch/${id}`)
        .get()
        .$promise
        .then(function(results) {
          resultsObj = results
        })
    },
    updateSearch: function(id) {
      return $resource(`//localhost:3000/search/updatesearch/${id}`)
        .get()
        .$promise
        .then(function(results) {
          return results
        })
    }
  }
}])

},{}],6:[function(require,module,exports){
app.service('stateListService', ['$resource', function($resource) {
  var resultsArr = [];
  return {
    retrieve: function(obj) {
      return $resource('//localhost:3000/scrape/sls').get()
        .$promise.then(function(results) {
          resultsArr = results.finish
        })
    },
    resultsArrGetter: function() {
      return resultsArr
    }
  }
}])

},{}],7:[function(require,module,exports){
app.service('userService', ['$resource', '$location', function($resource, $location, $window) {
  return {
    signup: function(obj) {
      return $resource('//localhost:3000/auth/signup').save(obj).$promise.then(function(response){
        return response
      })
    },
    login: function(obj) {
      return $resource('//localhost:3000/auth/login').save(obj).$promise.then(function(response){
        return response
      })
    },
    logout: function() {
      $window.localStorage.removeItem('craigsbliss-token')
      return
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhdXRoU3ZjLmpzIiwiaW5kZXguanMiLCJpbnRlcmNlcHRvclN2Yy5qcyIsInBvc3RTdmMuanMiLCJzZWFyY2hTdmMuanMiLCJzdGF0ZUxpc3RTdmMuanMiLCJ1c2VyU3ZjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJhcHAuc2VydmljZSgnYXV0aFNlcnZpY2UnLCBbJyR3aW5kb3cnLCBmdW5jdGlvbigkd2luZG93KSB7XG4gIHJldHVybiB7XG4gICAgZ2l2ZVRva2VuOiBmdW5jdGlvbih0b2tlbikge1xuICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2VbJ2NyYWlnc2JsaXNzLXRva2VuJ10gPSB0b2tlbi5qd3Q7XG4gICAgfSxcbiAgICBnZXRUb2tlbjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gJHdpbmRvdy5sb2NhbFN0b3JhZ2VbJ2NyYWlnc2JsaXNzLXRva2VuJ11cbiAgICB9LFxuICAgIGxvZ291dDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gJHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnY3JhaWdzYmxpc3MtdG9rZW4nKVxuICAgIH0sXG4gICAgcGFyc2VKd3Q6IGZ1bmN0aW9uKHRva2VuKSB7XG4gICAgICBpZiAodG9rZW4pIHtcbiAgICAgICAgdmFyIGJhc2U2NFVybCA9IHRva2VuLnNwbGl0KCcuJylbMV07XG4gICAgICAgIHZhciBiYXNlNjQgPSBiYXNlNjRVcmwucmVwbGFjZSgnLScsICcrJykucmVwbGFjZSgnXycsICcvJylcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoJHdpbmRvdy5hdG9iKGJhc2U2NCkpXG4gICAgICB9XG4gICAgfSxcbiAgICBpc0F1dGhlZDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcmV0dXJuZWRUb2tlbiA9IHRoaXMuZ2V0VG9rZW4oKTtcbiAgICAgIGlmIChyZXR1cm5lZFRva2VuKSB7XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1dKVxuIiwicmVxdWlyZSgnLi9hdXRoU3ZjLmpzJylcbnJlcXVpcmUoJy4vaW50ZXJjZXB0b3JTdmMuanMnKVxucmVxdWlyZSgnLi9zZWFyY2hTdmMuanMnKVxucmVxdWlyZSgnLi9zdGF0ZUxpc3RTdmMuanMnKVxucmVxdWlyZSgnLi91c2VyU3ZjLmpzJylcbnJlcXVpcmUoJy4vcG9zdFN2YycpXG4iLCJhcHAuZmFjdG9yeSgnYXV0aEludGVyY2VwdG9yJywgWydhdXRoU2VydmljZScsIGZ1bmN0aW9uKGF1dGgpIHtcbiAgcmV0dXJuIHtcbiAgICByZXF1ZXN0OiBmdW5jdGlvbihjb25maWcpIHtcbiAgICAgIHZhciB0b2tlbiA9IGF1dGguZ2V0VG9rZW4oKTtcbiAgICAgIGNvbmZpZy5oZWFkZXJzLnRva2VuID0gdG9rZW5cbiAgICAgIHJldHVybiBjb25maWdcbiAgICB9LFxuICAgIHJlc3BvbnNlOiBmdW5jdGlvbihyZXMpIHtcbiAgICAgIGlmIChyZXMuZGF0YS5qd3QpIHtcbiAgICAgICAgYXV0aC5naXZlVG9rZW4ocmVzLmRhdGEpXG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzXG4gICAgfVxuICB9XG59XSlcblxuYXBwLmNvbmZpZyhmdW5jdGlvbigkaHR0cFByb3ZpZGVyKSB7XG4gICRodHRwUHJvdmlkZXIuaW50ZXJjZXB0b3JzLnB1c2goJ2F1dGhJbnRlcmNlcHRvcicpXG59KVxuIiwiYXBwLnNlcnZpY2UoJ3Bvc3RTZXJ2aWNlJywgZnVuY3Rpb24oJHJlc291cmNlLCBzZWFyY2hTZXJ2aWNlKSB7XG4gIHJldHVybiB7XG4gICAgZGVsZXRlOiBmdW5jdGlvbihzZWFyY2hpZCwgaW5kZXgpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdzZXJ2aWNlIGRlbGV0ZTonLCBzZWFyY2hpZCwgaW5kZXgpO1xuICAgICAgcmV0dXJuICRyZXNvdXJjZShgLy9sb2NhbGhvc3Q6MzAwMC9wb3N0cy8ke3NlYXJjaGlkfS8ke2luZGV4fWApLmRlbGV0ZSgpLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgICByZXR1cm4gcmVzdWx0c1xuICAgICAgfSlcbiAgICB9LFxuICAgIGRlbGV0ZUR1cGVzOiBmdW5jdGlvbihpZCwgZHVwZXNSZW1vdmVkKSB7XG4gICAgICByZXR1cm4gJHJlc291cmNlKGAvL2xvY2FsaG9zdDozMDAwL3Bvc3RzLyR7aWR9YCkuc2F2ZShkdXBlc1JlbW92ZWQpLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgICBzZWFyY2hTZXJ2aWNlLnJlc3VsdHNPYmpTZXR0ZXIocmVzdWx0cylcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfSlcbiAgICB9LFxuICAgIGZhdm9yaXRlOiBmdW5jdGlvbihpZCwgaW5kZXgpe1xuICAgICAgcmV0dXJuICRyZXNvdXJjZShgLy9sb2NhbGhvc3Q6MzAwMC9wb3N0cy9mYXZvcml0ZS8ke2lkfS8ke2luZGV4fWApLnNhdmUoKS4kcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpe1xuICAgICAgICBzZWFyY2hTZXJ2aWNlLnJlc3VsdHNPYmpTZXR0ZXIocmVzdWx0cylcbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICB9KVxuICAgIH0sXG4gICAgdW5mYXZvcml0ZTogZnVuY3Rpb24oaWQsIGluZGV4KXtcbiAgICAgIHJldHVybiAkcmVzb3VyY2UoYC8vbG9jYWxob3N0OjMwMDAvcG9zdHMvdW5mYXZvcml0ZS8ke2lkfS8ke2luZGV4fWApLnNhdmUoKS4kcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpe1xuICAgICAgICBzZWFyY2hTZXJ2aWNlLnJlc3VsdHNPYmpTZXR0ZXIocmVzdWx0cylcbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICB9KVxuICAgIH1cbiAgfVxufSlcbiIsImFwcC5zZXJ2aWNlKCdzZWFyY2hTZXJ2aWNlJywgWyckcmVzb3VyY2UnLCAnJGxvY2F0aW9uJywgZnVuY3Rpb24oJHJlc291cmNlLCAkbG9jYXRpb24pIHtcbiAgdmFyIHJlc3VsdHNPYmogPSB7fTtcbiAgcmV0dXJuIHtcbiAgICBuZXdTZWFyY2g6IGZ1bmN0aW9uKG9iaikge1xuICAgICAgLy8gcmV0dXJuICRyZXNvdXJjZSgnaHR0cHM6Ly9qaGZjYXBzdG9uZS5oZXJva3VhcHAuY29tL2FwaScpLnNhdmUob2JqKS4kcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgIHJldHVybiAkcmVzb3VyY2UoJy8vbG9jYWxob3N0OjMwMDAvc2NyYXBlL3NjcmFwZScpLnNhdmUob2JqKS4kcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgICAgcmVzdWx0c09iaiA9IHJlc3VsdHM7XG4gICAgICB9KVxuICAgIH0sXG4gICAgcmVzdWx0c09ialNldHRlcjogZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXN1bHRzT2JqID0gb2JqXG4gICAgfSxcbiAgICByZXN1bHRzT2JqR2V0dGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChyZXN1bHRzT2JqLnJlc3VsdHMpIHtcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBsZXQgZHVwZUNvdW50ID0gMDtcbiAgICAgICAgbGV0IGZhdkNvdW50ID0gMDtcbiAgICAgICAgd2hpbGUgKGkgPCByZXN1bHRzT2JqLnJlc3VsdHMubGVuZ3RoKSB7XG4gICAgICAgICAgbGV0IGNoZWNrQWdhaW5zdCA9IHJlc3VsdHNPYmoucmVzdWx0c1tpXVxuICAgICAgICAgIGlmIChjaGVja0FnYWluc3QuZHVwZSkge1xuICAgICAgICAgICAgZHVwZUNvdW50KytcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGNoZWNrQWdhaW5zdC5pc0Zhdikge1xuICAgICAgICAgICAgZmF2Q291bnQrK1xuICAgICAgICAgIH1cbiAgICAgICAgICBmb3IgKHZhciBrID0gaSArIDE7IGsgPCByZXN1bHRzT2JqLnJlc3VsdHMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgIGxldCBjdXJyZW50SyA9IHJlc3VsdHNPYmoucmVzdWx0c1trXVxuICAgICAgICAgICAgaWYgKGNoZWNrQWdhaW5zdC50aXRsZSA9PT0gY3VycmVudEsudGl0bGUgJiYgY2hlY2tBZ2FpbnN0LnByaWNlID09PSBjdXJyZW50Sy5wcmljZSkge1xuICAgICAgICAgICAgICBjdXJyZW50Sy5kdXBlID0gdHJ1ZVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKCFjdXJyZW50Sy5kdXBlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudEsuZHVwZSA9IGZhbHNlXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaSsrXG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0c09iai5mYXZDb3VudCA9IGZhdkNvdW50XG4gICAgICAgIHJlc3VsdHNPYmouZHVwZUNvdW50ID0gZHVwZUNvdW50XG4gICAgICAgIHJlc3VsdHNPYmoucmVzdWx0Q291bnQgPSByZXN1bHRzT2JqLnJlc3VsdHMubGVuZ3RoXG4gICAgICAgIHJldHVybiByZXN1bHRzT2JqO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHt9XG4gICAgfSxcbiAgICBzYXZlU2VhcmNoOiBmdW5jdGlvbihvYmopIHtcbiAgICAgIGNvbnNvbGUubG9nKCdzYXZpbmcgc2VhcmNoOicsIG9iaik7XG4gICAgICByZXR1cm4gJHJlc291cmNlKCcvL2xvY2FsaG9zdDozMDAwL3NlYXJjaC9zYXZlc2VhcmNoJykuc2F2ZShvYmopLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgICByZXR1cm4gcmVzdWx0c1xuICAgICAgfSlcbiAgICB9LFxuICAgIGRlbGV0ZVNlYXJjaDogZnVuY3Rpb24oaWQpIHtcbiAgICAgIHJldHVybiAkcmVzb3VyY2UoJy8vbG9jYWxob3N0OjMwMDAvc2VhcmNoL2RlbGV0ZXNlYXJjaCcpXG4gICAgICAgIC5zYXZlKHtcbiAgICAgICAgICBpZDogaWRcbiAgICAgICAgfSlcbiAgICAgICAgLiRwcm9taXNlXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0c1xuICAgICAgICB9KVxuICAgIH0sXG4gICAgdmlld1NlYXJjaDogZnVuY3Rpb24oaWQpIHtcbiAgICAgIHJldHVybiAkcmVzb3VyY2UoYC8vbG9jYWxob3N0OjMwMDAvc2VhcmNoL2dldHNlYXJjaC8ke2lkfWApXG4gICAgICAgIC5nZXQoKVxuICAgICAgICAuJHByb21pc2VcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgICAgIHJlc3VsdHNPYmogPSByZXN1bHRzXG4gICAgICAgIH0pXG4gICAgfSxcbiAgICB1cGRhdGVTZWFyY2g6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICByZXR1cm4gJHJlc291cmNlKGAvL2xvY2FsaG9zdDozMDAwL3NlYXJjaC91cGRhdGVzZWFyY2gvJHtpZH1gKVxuICAgICAgICAuZ2V0KClcbiAgICAgICAgLiRwcm9taXNlXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0c1xuICAgICAgICB9KVxuICAgIH1cbiAgfVxufV0pXG4iLCJhcHAuc2VydmljZSgnc3RhdGVMaXN0U2VydmljZScsIFsnJHJlc291cmNlJywgZnVuY3Rpb24oJHJlc291cmNlKSB7XG4gIHZhciByZXN1bHRzQXJyID0gW107XG4gIHJldHVybiB7XG4gICAgcmV0cmlldmU6IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuICRyZXNvdXJjZSgnLy9sb2NhbGhvc3Q6MzAwMC9zY3JhcGUvc2xzJykuZ2V0KClcbiAgICAgICAgLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgICAgIHJlc3VsdHNBcnIgPSByZXN1bHRzLmZpbmlzaFxuICAgICAgICB9KVxuICAgIH0sXG4gICAgcmVzdWx0c0FyckdldHRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gcmVzdWx0c0FyclxuICAgIH1cbiAgfVxufV0pXG4iLCJhcHAuc2VydmljZSgndXNlclNlcnZpY2UnLCBbJyRyZXNvdXJjZScsICckbG9jYXRpb24nLCBmdW5jdGlvbigkcmVzb3VyY2UsICRsb2NhdGlvbiwgJHdpbmRvdykge1xuICByZXR1cm4ge1xuICAgIHNpZ251cDogZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gJHJlc291cmNlKCcvL2xvY2FsaG9zdDozMDAwL2F1dGgvc2lnbnVwJykuc2F2ZShvYmopLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICByZXR1cm4gcmVzcG9uc2VcbiAgICAgIH0pXG4gICAgfSxcbiAgICBsb2dpbjogZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gJHJlc291cmNlKCcvL2xvY2FsaG9zdDozMDAwL2F1dGgvbG9naW4nKS5zYXZlKG9iaikuJHByb21pc2UudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgIHJldHVybiByZXNwb25zZVxuICAgICAgfSlcbiAgICB9LFxuICAgIGxvZ291dDogZnVuY3Rpb24oKSB7XG4gICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdjcmFpZ3NibGlzcy10b2tlbicpXG4gICAgICByZXR1cm5cbiAgICB9LFxuICAgIGdldFVzZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICRyZXNvdXJjZSgnLy9sb2NhbGhvc3Q6MzAwMC91c2VyL2Rhc2hib2FyZCcpLmdldCgpLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnL2Rhc2hib2FyZCcpXG4gICAgICAgICAgcmV0dXJuIHJlc3BvbnNlXG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvZXJyb3InKVxuICAgICAgICB9KVxuICAgIH1cbiAgfVxufV0pXG4iXX0=

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
        console.log('deleteDupes svc results:', results);
        searchService.resultsObjSetter(results)
        return;
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
        while (i < resultsObj.results.length) {
          let checkAgainst = resultsObj.results[i]
          if (checkAgainst.dupe) {
            dupeCount++
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
        resultsObj.dupeCount = dupeCount
        resultsObj.resultCount = resultsObj.results.length
        return resultsObj;
      }
      return {}
    },
    saveSearch: function(obj) {
      return $resource('//localhost:3000/search/savesearch').save(obj).$promise.then(function(results) {})
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
      return $resource('//localhost:3000/auth/signup').save(obj)
    },
    login: function(obj) {
      return $resource('//localhost:3000/auth/login').save(obj)
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhdXRoU3ZjLmpzIiwiaW5kZXguanMiLCJpbnRlcmNlcHRvclN2Yy5qcyIsInBvc3RTdmMuanMiLCJzZWFyY2hTdmMuanMiLCJzdGF0ZUxpc3RTdmMuanMiLCJ1c2VyU3ZjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiYXBwLnNlcnZpY2UoJ2F1dGhTZXJ2aWNlJywgWyckd2luZG93JywgZnVuY3Rpb24oJHdpbmRvdykge1xuICByZXR1cm4ge1xuICAgIGdpdmVUb2tlbjogZnVuY3Rpb24odG9rZW4pIHtcbiAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlWydjcmFpZ3NibGlzcy10b2tlbiddID0gdG9rZW4uand0O1xuICAgIH0sXG4gICAgZ2V0VG9rZW46IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICR3aW5kb3cubG9jYWxTdG9yYWdlWydjcmFpZ3NibGlzcy10b2tlbiddXG4gICAgfSxcbiAgICBsb2dvdXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnY3JhaWdzYmxpc3MtdG9rZW4nKVxuICAgIH0sXG4gICAgcGFyc2VKd3Q6IGZ1bmN0aW9uKHRva2VuKSB7XG4gICAgICBpZiAodG9rZW4pIHtcbiAgICAgICAgdmFyIGJhc2U2NFVybCA9IHRva2VuLnNwbGl0KCcuJylbMV07XG4gICAgICAgIHZhciBiYXNlNjQgPSBiYXNlNjRVcmwucmVwbGFjZSgnLScsICcrJykucmVwbGFjZSgnXycsICcvJylcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoJHdpbmRvdy5hdG9iKGJhc2U2NCkpXG4gICAgICB9XG4gICAgfSxcbiAgICBpc0F1dGhlZDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcmV0dXJuZWRUb2tlbiA9IHRoaXMuZ2V0VG9rZW4oKTtcbiAgICAgIGlmIChyZXR1cm5lZFRva2VuKSB7XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1dKVxuIiwicmVxdWlyZSgnLi9hdXRoU3ZjLmpzJylcbnJlcXVpcmUoJy4vaW50ZXJjZXB0b3JTdmMuanMnKVxucmVxdWlyZSgnLi9zZWFyY2hTdmMuanMnKVxucmVxdWlyZSgnLi9zdGF0ZUxpc3RTdmMuanMnKVxucmVxdWlyZSgnLi91c2VyU3ZjLmpzJylcbnJlcXVpcmUoJy4vcG9zdFN2YycpXG4iLCJhcHAuZmFjdG9yeSgnYXV0aEludGVyY2VwdG9yJywgWydhdXRoU2VydmljZScsIGZ1bmN0aW9uKGF1dGgpIHtcbiAgcmV0dXJuIHtcbiAgICByZXF1ZXN0OiBmdW5jdGlvbihjb25maWcpIHtcbiAgICAgIHZhciB0b2tlbiA9IGF1dGguZ2V0VG9rZW4oKTtcbiAgICAgIGNvbmZpZy5oZWFkZXJzLnRva2VuID0gdG9rZW5cbiAgICAgIHJldHVybiBjb25maWdcbiAgICB9LFxuICAgIHJlc3BvbnNlOiBmdW5jdGlvbihyZXMpIHtcbiAgICAgIGlmIChyZXMuZGF0YS5qd3QpIHtcbiAgICAgICAgYXV0aC5naXZlVG9rZW4ocmVzLmRhdGEpXG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzXG4gICAgfVxuICB9XG59XSlcblxuYXBwLmNvbmZpZyhmdW5jdGlvbigkaHR0cFByb3ZpZGVyKSB7XG4gICRodHRwUHJvdmlkZXIuaW50ZXJjZXB0b3JzLnB1c2goJ2F1dGhJbnRlcmNlcHRvcicpXG59KVxuIiwiYXBwLnNlcnZpY2UoJ3Bvc3RTZXJ2aWNlJywgZnVuY3Rpb24oJHJlc291cmNlLCBzZWFyY2hTZXJ2aWNlKSB7XG4gIHJldHVybiB7XG4gICAgZGVsZXRlOiBmdW5jdGlvbihzZWFyY2hpZCwgaW5kZXgpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdzZXJ2aWNlIGRlbGV0ZTonLCBzZWFyY2hpZCwgaW5kZXgpO1xuICAgICAgcmV0dXJuICRyZXNvdXJjZShgLy9sb2NhbGhvc3Q6MzAwMC9wb3N0cy8ke3NlYXJjaGlkfS8ke2luZGV4fWApLmRlbGV0ZSgpLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgICByZXR1cm4gcmVzdWx0c1xuICAgICAgfSlcbiAgICB9LFxuICAgIGRlbGV0ZUR1cGVzOiBmdW5jdGlvbihpZCwgZHVwZXNSZW1vdmVkKSB7XG4gICAgICByZXR1cm4gJHJlc291cmNlKGAvL2xvY2FsaG9zdDozMDAwL3Bvc3RzLyR7aWR9YCkuc2F2ZShkdXBlc1JlbW92ZWQpLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgICBjb25zb2xlLmxvZygnZGVsZXRlRHVwZXMgc3ZjIHJlc3VsdHM6JywgcmVzdWx0cyk7XG4gICAgICAgIHNlYXJjaFNlcnZpY2UucmVzdWx0c09ialNldHRlcihyZXN1bHRzKVxuICAgICAgICByZXR1cm47XG4gICAgICB9KVxuICAgIH1cbiAgfVxufSlcbiIsImFwcC5zZXJ2aWNlKCdzZWFyY2hTZXJ2aWNlJywgWyckcmVzb3VyY2UnLCAnJGxvY2F0aW9uJywgZnVuY3Rpb24oJHJlc291cmNlLCAkbG9jYXRpb24pIHtcbiAgdmFyIHJlc3VsdHNPYmogPSB7fTtcbiAgcmV0dXJuIHtcbiAgICBuZXdTZWFyY2g6IGZ1bmN0aW9uKG9iaikge1xuICAgICAgLy8gcmV0dXJuICRyZXNvdXJjZSgnaHR0cHM6Ly9qaGZjYXBzdG9uZS5oZXJva3VhcHAuY29tL2FwaScpLnNhdmUob2JqKS4kcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgIHJldHVybiAkcmVzb3VyY2UoJy8vbG9jYWxob3N0OjMwMDAvc2NyYXBlL3NjcmFwZScpLnNhdmUob2JqKS4kcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgICAgcmVzdWx0c09iaiA9IHJlc3VsdHM7XG4gICAgICB9KVxuICAgIH0sXG4gICAgcmVzdWx0c09ialNldHRlcjogZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXN1bHRzT2JqID0gb2JqXG4gICAgfSxcbiAgICByZXN1bHRzT2JqR2V0dGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChyZXN1bHRzT2JqLnJlc3VsdHMpIHtcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBsZXQgZHVwZUNvdW50ID0gMDtcbiAgICAgICAgd2hpbGUgKGkgPCByZXN1bHRzT2JqLnJlc3VsdHMubGVuZ3RoKSB7XG4gICAgICAgICAgbGV0IGNoZWNrQWdhaW5zdCA9IHJlc3VsdHNPYmoucmVzdWx0c1tpXVxuICAgICAgICAgIGlmIChjaGVja0FnYWluc3QuZHVwZSkge1xuICAgICAgICAgICAgZHVwZUNvdW50KytcbiAgICAgICAgICB9XG4gICAgICAgICAgZm9yICh2YXIgayA9IGkgKyAxOyBrIDwgcmVzdWx0c09iai5yZXN1bHRzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgICAgICBsZXQgY3VycmVudEsgPSByZXN1bHRzT2JqLnJlc3VsdHNba11cbiAgICAgICAgICAgIGlmIChjaGVja0FnYWluc3QudGl0bGUgPT09IGN1cnJlbnRLLnRpdGxlICYmIGNoZWNrQWdhaW5zdC5wcmljZSA9PT0gY3VycmVudEsucHJpY2UpIHtcbiAgICAgICAgICAgICAgY3VycmVudEsuZHVwZSA9IHRydWVcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGlmICghY3VycmVudEsuZHVwZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRLLmR1cGUgPSBmYWxzZVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGkrK1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdHNPYmouZHVwZUNvdW50ID0gZHVwZUNvdW50XG4gICAgICAgIHJlc3VsdHNPYmoucmVzdWx0Q291bnQgPSByZXN1bHRzT2JqLnJlc3VsdHMubGVuZ3RoXG4gICAgICAgIHJldHVybiByZXN1bHRzT2JqO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHt9XG4gICAgfSxcbiAgICBzYXZlU2VhcmNoOiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiAkcmVzb3VyY2UoJy8vbG9jYWxob3N0OjMwMDAvc2VhcmNoL3NhdmVzZWFyY2gnKS5zYXZlKG9iaikuJHByb21pc2UudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7fSlcbiAgICB9LFxuICAgIGRlbGV0ZVNlYXJjaDogZnVuY3Rpb24oaWQpIHtcbiAgICAgIHJldHVybiAkcmVzb3VyY2UoJy8vbG9jYWxob3N0OjMwMDAvc2VhcmNoL2RlbGV0ZXNlYXJjaCcpXG4gICAgICAgIC5zYXZlKHtcbiAgICAgICAgICBpZDogaWRcbiAgICAgICAgfSlcbiAgICAgICAgLiRwcm9taXNlXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0c1xuICAgICAgICB9KVxuICAgIH0sXG4gICAgdmlld1NlYXJjaDogZnVuY3Rpb24oaWQpIHtcbiAgICAgIHJldHVybiAkcmVzb3VyY2UoYC8vbG9jYWxob3N0OjMwMDAvc2VhcmNoL2dldHNlYXJjaC8ke2lkfWApXG4gICAgICAgIC5nZXQoKVxuICAgICAgICAuJHByb21pc2VcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgICAgIHJlc3VsdHNPYmogPSByZXN1bHRzXG4gICAgICAgIH0pXG4gICAgfVxuICB9XG59XSlcbiIsImFwcC5zZXJ2aWNlKCdzdGF0ZUxpc3RTZXJ2aWNlJywgWyckcmVzb3VyY2UnLCBmdW5jdGlvbigkcmVzb3VyY2UpIHtcbiAgdmFyIHJlc3VsdHNBcnIgPSBbXTtcbiAgcmV0dXJuIHtcbiAgICByZXRyaWV2ZTogZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gJHJlc291cmNlKCcvL2xvY2FsaG9zdDozMDAwL3NjcmFwZS9zbHMnKS5nZXQoKVxuICAgICAgICAuJHByb21pc2UudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICAgICAgcmVzdWx0c0FyciA9IHJlc3VsdHMuZmluaXNoXG4gICAgICAgIH0pXG4gICAgfSxcbiAgICByZXN1bHRzQXJyR2V0dGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiByZXN1bHRzQXJyXG4gICAgfVxuICB9XG59XSlcbiIsImFwcC5zZXJ2aWNlKCd1c2VyU2VydmljZScsIFsnJHJlc291cmNlJywgJyRsb2NhdGlvbicsIGZ1bmN0aW9uKCRyZXNvdXJjZSwgJGxvY2F0aW9uLCAkd2luZG93KSB7XG4gIHJldHVybiB7XG4gICAgc2lnbnVwOiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiAkcmVzb3VyY2UoJy8vbG9jYWxob3N0OjMwMDAvYXV0aC9zaWdudXAnKS5zYXZlKG9iailcbiAgICB9LFxuICAgIGxvZ2luOiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiAkcmVzb3VyY2UoJy8vbG9jYWxob3N0OjMwMDAvYXV0aC9sb2dpbicpLnNhdmUob2JqKVxuICAgIH0sXG4gICAgbG9nb3V0OiBmdW5jdGlvbigpIHtcbiAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2NyYWlnc2JsaXNzLXRva2VuJylcbiAgICAgIHJldHVyblxuICAgIH0sXG4gICAgZ2V0VXNlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gJHJlc291cmNlKCcvL2xvY2FsaG9zdDozMDAwL3VzZXIvZGFzaGJvYXJkJykuZ2V0KCkuJHByb21pc2UudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvZGFzaGJvYXJkJylcbiAgICAgICAgICByZXR1cm4gcmVzcG9uc2VcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy9lcnJvcicpXG4gICAgICAgIH0pXG4gICAgfVxuICB9XG59XSlcbiJdfQ==

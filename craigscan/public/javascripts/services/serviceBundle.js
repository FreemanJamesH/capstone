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
          $location.path('/results/1')
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhdXRoU3ZjLmpzIiwiaW5kZXguanMiLCJpbnRlcmNlcHRvclN2Yy5qcyIsInBvc3RTdmMuanMiLCJzZWFyY2hTdmMuanMiLCJzdGF0ZUxpc3RTdmMuanMiLCJ1c2VyU3ZjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiYXBwLnNlcnZpY2UoJ2F1dGhTZXJ2aWNlJywgWyckd2luZG93JywgZnVuY3Rpb24oJHdpbmRvdykge1xuICByZXR1cm4ge1xuICAgIGdpdmVUb2tlbjogZnVuY3Rpb24odG9rZW4pIHtcbiAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlWydjcmFpZ3NibGlzcy10b2tlbiddID0gdG9rZW4uand0O1xuICAgIH0sXG4gICAgZ2V0VG9rZW46IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICR3aW5kb3cubG9jYWxTdG9yYWdlWydjcmFpZ3NibGlzcy10b2tlbiddXG4gICAgfSxcbiAgICBsb2dvdXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnY3JhaWdzYmxpc3MtdG9rZW4nKVxuICAgIH0sXG4gICAgcGFyc2VKd3Q6IGZ1bmN0aW9uKHRva2VuKSB7XG4gICAgICBpZiAodG9rZW4pIHtcbiAgICAgICAgdmFyIGJhc2U2NFVybCA9IHRva2VuLnNwbGl0KCcuJylbMV07XG4gICAgICAgIHZhciBiYXNlNjQgPSBiYXNlNjRVcmwucmVwbGFjZSgnLScsICcrJykucmVwbGFjZSgnXycsICcvJylcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoJHdpbmRvdy5hdG9iKGJhc2U2NCkpXG4gICAgICB9XG4gICAgfSxcbiAgICBpc0F1dGhlZDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcmV0dXJuZWRUb2tlbiA9IHRoaXMuZ2V0VG9rZW4oKTtcbiAgICAgIGlmIChyZXR1cm5lZFRva2VuKSB7XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1dKVxuIiwicmVxdWlyZSgnLi9hdXRoU3ZjLmpzJylcbnJlcXVpcmUoJy4vaW50ZXJjZXB0b3JTdmMuanMnKVxucmVxdWlyZSgnLi9zZWFyY2hTdmMuanMnKVxucmVxdWlyZSgnLi9zdGF0ZUxpc3RTdmMuanMnKVxucmVxdWlyZSgnLi91c2VyU3ZjLmpzJylcbnJlcXVpcmUoJy4vcG9zdFN2YycpXG4iLCJhcHAuZmFjdG9yeSgnYXV0aEludGVyY2VwdG9yJywgWydhdXRoU2VydmljZScsIGZ1bmN0aW9uKGF1dGgpIHtcbiAgcmV0dXJuIHtcbiAgICByZXF1ZXN0OiBmdW5jdGlvbihjb25maWcpIHtcbiAgICAgIHZhciB0b2tlbiA9IGF1dGguZ2V0VG9rZW4oKTtcbiAgICAgIGNvbmZpZy5oZWFkZXJzLnRva2VuID0gdG9rZW5cbiAgICAgIHJldHVybiBjb25maWdcbiAgICB9LFxuICAgIHJlc3BvbnNlOiBmdW5jdGlvbihyZXMpIHtcbiAgICAgIGlmIChyZXMuZGF0YS5qd3QpIHtcbiAgICAgICAgYXV0aC5naXZlVG9rZW4ocmVzLmRhdGEpXG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzXG4gICAgfVxuICB9XG59XSlcblxuYXBwLmNvbmZpZyhmdW5jdGlvbigkaHR0cFByb3ZpZGVyKSB7XG4gICRodHRwUHJvdmlkZXIuaW50ZXJjZXB0b3JzLnB1c2goJ2F1dGhJbnRlcmNlcHRvcicpXG59KVxuIiwiYXBwLnNlcnZpY2UoJ3Bvc3RTZXJ2aWNlJywgZnVuY3Rpb24oJHJlc291cmNlLCBzZWFyY2hTZXJ2aWNlKSB7XG4gIHJldHVybiB7XG4gICAgZGVsZXRlOiBmdW5jdGlvbihzZWFyY2hpZCwgaW5kZXgpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdzZXJ2aWNlIGRlbGV0ZTonLCBzZWFyY2hpZCwgaW5kZXgpO1xuICAgICAgcmV0dXJuICRyZXNvdXJjZShgLy9sb2NhbGhvc3Q6MzAwMC9wb3N0cy8ke3NlYXJjaGlkfS8ke2luZGV4fWApLmRlbGV0ZSgpLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgICByZXR1cm4gcmVzdWx0c1xuICAgICAgfSlcbiAgICB9LFxuICAgIGRlbGV0ZUR1cGVzOiBmdW5jdGlvbihpZCwgZHVwZXNSZW1vdmVkKSB7XG4gICAgICByZXR1cm4gJHJlc291cmNlKGAvL2xvY2FsaG9zdDozMDAwL3Bvc3RzLyR7aWR9YCkuc2F2ZShkdXBlc1JlbW92ZWQpLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgICBzZWFyY2hTZXJ2aWNlLnJlc3VsdHNPYmpTZXR0ZXIocmVzdWx0cylcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfSlcbiAgICB9XG4gIH1cbn0pXG4iLCJhcHAuc2VydmljZSgnc2VhcmNoU2VydmljZScsIFsnJHJlc291cmNlJywgJyRsb2NhdGlvbicsIGZ1bmN0aW9uKCRyZXNvdXJjZSwgJGxvY2F0aW9uKSB7XG4gIHZhciByZXN1bHRzT2JqID0ge307XG4gIHJldHVybiB7XG4gICAgbmV3U2VhcmNoOiBmdW5jdGlvbihvYmopIHtcbiAgICAgIC8vIHJldHVybiAkcmVzb3VyY2UoJ2h0dHBzOi8vamhmY2Fwc3RvbmUuaGVyb2t1YXBwLmNvbS9hcGknKS5zYXZlKG9iaikuJHByb21pc2UudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICByZXR1cm4gJHJlc291cmNlKCcvL2xvY2FsaG9zdDozMDAwL3NjcmFwZS9zY3JhcGUnKS5zYXZlKG9iaikuJHByb21pc2UudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICAgIHJlc3VsdHNPYmogPSByZXN1bHRzO1xuICAgICAgfSlcbiAgICB9LFxuICAgIHJlc3VsdHNPYmpTZXR0ZXI6IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmVzdWx0c09iaiA9IG9ialxuICAgIH0sXG4gICAgcmVzdWx0c09iakdldHRlcjogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAocmVzdWx0c09iai5yZXN1bHRzKSB7XG4gICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgbGV0IGR1cGVDb3VudCA9IDA7XG4gICAgICAgIHdoaWxlIChpIDwgcmVzdWx0c09iai5yZXN1bHRzLmxlbmd0aCkge1xuICAgICAgICAgIGxldCBjaGVja0FnYWluc3QgPSByZXN1bHRzT2JqLnJlc3VsdHNbaV1cbiAgICAgICAgICBpZiAoY2hlY2tBZ2FpbnN0LmR1cGUpIHtcbiAgICAgICAgICAgIGR1cGVDb3VudCsrXG4gICAgICAgICAgfVxuICAgICAgICAgIGZvciAodmFyIGsgPSBpICsgMTsgayA8IHJlc3VsdHNPYmoucmVzdWx0cy5sZW5ndGg7IGsrKykge1xuICAgICAgICAgICAgbGV0IGN1cnJlbnRLID0gcmVzdWx0c09iai5yZXN1bHRzW2tdXG4gICAgICAgICAgICBpZiAoY2hlY2tBZ2FpbnN0LnRpdGxlID09PSBjdXJyZW50Sy50aXRsZSAmJiBjaGVja0FnYWluc3QucHJpY2UgPT09IGN1cnJlbnRLLnByaWNlKSB7XG4gICAgICAgICAgICAgIGN1cnJlbnRLLmR1cGUgPSB0cnVlXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZiAoIWN1cnJlbnRLLmR1cGUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50Sy5kdXBlID0gZmFsc2VcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpKytcbiAgICAgICAgfVxuICAgICAgICByZXN1bHRzT2JqLmR1cGVDb3VudCA9IGR1cGVDb3VudFxuICAgICAgICByZXN1bHRzT2JqLnJlc3VsdENvdW50ID0gcmVzdWx0c09iai5yZXN1bHRzLmxlbmd0aFxuICAgICAgICByZXR1cm4gcmVzdWx0c09iajtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7fVxuICAgIH0sXG4gICAgc2F2ZVNlYXJjaDogZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gJHJlc291cmNlKCcvL2xvY2FsaG9zdDozMDAwL3NlYXJjaC9zYXZlc2VhcmNoJykuc2F2ZShvYmopLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge30pXG4gICAgfSxcbiAgICBkZWxldGVTZWFyY2g6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICByZXR1cm4gJHJlc291cmNlKCcvL2xvY2FsaG9zdDozMDAwL3NlYXJjaC9kZWxldGVzZWFyY2gnKVxuICAgICAgICAuc2F2ZSh7XG4gICAgICAgICAgaWQ6IGlkXG4gICAgICAgIH0pXG4gICAgICAgIC4kcHJvbWlzZVxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdHNcbiAgICAgICAgfSlcbiAgICB9LFxuICAgIHZpZXdTZWFyY2g6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICByZXR1cm4gJHJlc291cmNlKGAvL2xvY2FsaG9zdDozMDAwL3NlYXJjaC9nZXRzZWFyY2gvJHtpZH1gKVxuICAgICAgICAuZ2V0KClcbiAgICAgICAgLiRwcm9taXNlXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgICAgICByZXN1bHRzT2JqID0gcmVzdWx0c1xuICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvcmVzdWx0cy8xJylcbiAgICAgICAgfSlcbiAgICB9XG4gIH1cbn1dKVxuIiwiYXBwLnNlcnZpY2UoJ3N0YXRlTGlzdFNlcnZpY2UnLCBbJyRyZXNvdXJjZScsIGZ1bmN0aW9uKCRyZXNvdXJjZSkge1xuICB2YXIgcmVzdWx0c0FyciA9IFtdO1xuICByZXR1cm4ge1xuICAgIHJldHJpZXZlOiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiAkcmVzb3VyY2UoJy8vbG9jYWxob3N0OjMwMDAvc2NyYXBlL3NscycpLmdldCgpXG4gICAgICAgIC4kcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgICAgICByZXN1bHRzQXJyID0gcmVzdWx0cy5maW5pc2hcbiAgICAgICAgfSlcbiAgICB9LFxuICAgIHJlc3VsdHNBcnJHZXR0ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHJlc3VsdHNBcnJcbiAgICB9XG4gIH1cbn1dKVxuIiwiYXBwLnNlcnZpY2UoJ3VzZXJTZXJ2aWNlJywgWyckcmVzb3VyY2UnLCAnJGxvY2F0aW9uJywgZnVuY3Rpb24oJHJlc291cmNlLCAkbG9jYXRpb24sICR3aW5kb3cpIHtcbiAgcmV0dXJuIHtcbiAgICBzaWdudXA6IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuICRyZXNvdXJjZSgnLy9sb2NhbGhvc3Q6MzAwMC9hdXRoL3NpZ251cCcpLnNhdmUob2JqKVxuICAgIH0sXG4gICAgbG9naW46IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuICRyZXNvdXJjZSgnLy9sb2NhbGhvc3Q6MzAwMC9hdXRoL2xvZ2luJykuc2F2ZShvYmopXG4gICAgfSxcbiAgICBsb2dvdXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnY3JhaWdzYmxpc3MtdG9rZW4nKVxuICAgICAgcmV0dXJuXG4gICAgfSxcbiAgICBnZXRVc2VyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAkcmVzb3VyY2UoJy8vbG9jYWxob3N0OjMwMDAvdXNlci9kYXNoYm9hcmQnKS5nZXQoKS4kcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy9kYXNoYm9hcmQnKVxuICAgICAgICAgIHJldHVybiByZXNwb25zZVxuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnL2Vycm9yJylcbiAgICAgICAgfSlcbiAgICB9XG4gIH1cbn1dKVxuIl19

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
      console.log(`id and index: ${id}, ${index}`);
      return $resource(`//localhost:3000/posts/favorite/${id}/${index}`).save().$promise.then(function(results){
        searchService.resultsObjSetter(results)
        return;
      })
    },
    unfavorite: function(id, index){
      return $resource(`//localhost:3000/posts/unfavorite/${id}/${index}`).save().$promise.then(function(results){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhdXRoU3ZjLmpzIiwiaW5kZXguanMiLCJpbnRlcmNlcHRvclN2Yy5qcyIsInBvc3RTdmMuanMiLCJzZWFyY2hTdmMuanMiLCJzdGF0ZUxpc3RTdmMuanMiLCJ1c2VyU3ZjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiYXBwLnNlcnZpY2UoJ2F1dGhTZXJ2aWNlJywgWyckd2luZG93JywgZnVuY3Rpb24oJHdpbmRvdykge1xuICByZXR1cm4ge1xuICAgIGdpdmVUb2tlbjogZnVuY3Rpb24odG9rZW4pIHtcbiAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlWydjcmFpZ3NibGlzcy10b2tlbiddID0gdG9rZW4uand0O1xuICAgIH0sXG4gICAgZ2V0VG9rZW46IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICR3aW5kb3cubG9jYWxTdG9yYWdlWydjcmFpZ3NibGlzcy10b2tlbiddXG4gICAgfSxcbiAgICBsb2dvdXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2NyYWlnc2JsaXNzLXRva2VuJylcbiAgICB9LFxuICAgIHBhcnNlSnd0OiBmdW5jdGlvbih0b2tlbikge1xuICAgICAgaWYgKHRva2VuKSB7XG4gICAgICAgIHZhciBiYXNlNjRVcmwgPSB0b2tlbi5zcGxpdCgnLicpWzFdO1xuICAgICAgICB2YXIgYmFzZTY0ID0gYmFzZTY0VXJsLnJlcGxhY2UoJy0nLCAnKycpLnJlcGxhY2UoJ18nLCAnLycpXG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKCR3aW5kb3cuYXRvYihiYXNlNjQpKVxuICAgICAgfVxuICAgIH0sXG4gICAgaXNBdXRoZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHJldHVybmVkVG9rZW4gPSB0aGlzLmdldFRva2VuKCk7XG4gICAgICBpZiAocmV0dXJuZWRUb2tlbikge1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfVxuICB9XG59XSlcbiIsInJlcXVpcmUoJy4vYXV0aFN2Yy5qcycpXG5yZXF1aXJlKCcuL2ludGVyY2VwdG9yU3ZjLmpzJylcbnJlcXVpcmUoJy4vc2VhcmNoU3ZjLmpzJylcbnJlcXVpcmUoJy4vc3RhdGVMaXN0U3ZjLmpzJylcbnJlcXVpcmUoJy4vdXNlclN2Yy5qcycpXG5yZXF1aXJlKCcuL3Bvc3RTdmMnKVxuIiwiYXBwLmZhY3RvcnkoJ2F1dGhJbnRlcmNlcHRvcicsIFsnYXV0aFNlcnZpY2UnLCBmdW5jdGlvbihhdXRoKSB7XG4gIHJldHVybiB7XG4gICAgcmVxdWVzdDogZnVuY3Rpb24oY29uZmlnKSB7XG4gICAgICB2YXIgdG9rZW4gPSBhdXRoLmdldFRva2VuKCk7XG4gICAgICBjb25maWcuaGVhZGVycy50b2tlbiA9IHRva2VuXG4gICAgICByZXR1cm4gY29uZmlnXG4gICAgfSxcbiAgICByZXNwb25zZTogZnVuY3Rpb24ocmVzKSB7XG4gICAgICBpZiAocmVzLmRhdGEuand0KSB7XG4gICAgICAgIGF1dGguZ2l2ZVRva2VuKHJlcy5kYXRhKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc1xuICAgIH1cbiAgfVxufV0pXG5cbmFwcC5jb25maWcoZnVuY3Rpb24oJGh0dHBQcm92aWRlcikge1xuICAkaHR0cFByb3ZpZGVyLmludGVyY2VwdG9ycy5wdXNoKCdhdXRoSW50ZXJjZXB0b3InKVxufSlcbiIsImFwcC5zZXJ2aWNlKCdwb3N0U2VydmljZScsIGZ1bmN0aW9uKCRyZXNvdXJjZSwgc2VhcmNoU2VydmljZSkge1xuICByZXR1cm4ge1xuICAgIGRlbGV0ZTogZnVuY3Rpb24oc2VhcmNoaWQsIGluZGV4KSB7XG4gICAgICBjb25zb2xlLmxvZygnc2VydmljZSBkZWxldGU6Jywgc2VhcmNoaWQsIGluZGV4KTtcbiAgICAgIHJldHVybiAkcmVzb3VyY2UoYC8vbG9jYWxob3N0OjMwMDAvcG9zdHMvJHtzZWFyY2hpZH0vJHtpbmRleH1gKS5kZWxldGUoKS4kcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdHNcbiAgICAgIH0pXG4gICAgfSxcbiAgICBkZWxldGVEdXBlczogZnVuY3Rpb24oaWQsIGR1cGVzUmVtb3ZlZCkge1xuICAgICAgcmV0dXJuICRyZXNvdXJjZShgLy9sb2NhbGhvc3Q6MzAwMC9wb3N0cy8ke2lkfWApLnNhdmUoZHVwZXNSZW1vdmVkKS4kcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgICAgc2VhcmNoU2VydmljZS5yZXN1bHRzT2JqU2V0dGVyKHJlc3VsdHMpXG4gICAgICAgIHJldHVybjtcbiAgICAgIH0pXG4gICAgfSxcbiAgICBmYXZvcml0ZTogZnVuY3Rpb24oaWQsIGluZGV4KXtcbiAgICAgIGNvbnNvbGUubG9nKGBpZCBhbmQgaW5kZXg6ICR7aWR9LCAke2luZGV4fWApO1xuICAgICAgcmV0dXJuICRyZXNvdXJjZShgLy9sb2NhbGhvc3Q6MzAwMC9wb3N0cy9mYXZvcml0ZS8ke2lkfS8ke2luZGV4fWApLnNhdmUoKS4kcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpe1xuICAgICAgICBzZWFyY2hTZXJ2aWNlLnJlc3VsdHNPYmpTZXR0ZXIocmVzdWx0cylcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfSlcbiAgICB9LFxuICAgIHVuZmF2b3JpdGU6IGZ1bmN0aW9uKGlkLCBpbmRleCl7XG4gICAgICByZXR1cm4gJHJlc291cmNlKGAvL2xvY2FsaG9zdDozMDAwL3Bvc3RzL3VuZmF2b3JpdGUvJHtpZH0vJHtpbmRleH1gKS5zYXZlKCkuJHByb21pc2UudGhlbihmdW5jdGlvbihyZXN1bHRzKXtcbiAgICAgICAgc2VhcmNoU2VydmljZS5yZXN1bHRzT2JqU2V0dGVyKHJlc3VsdHMpXG4gICAgICAgIHJldHVybjtcbiAgICAgIH0pXG4gICAgfVxuICB9XG59KVxuIiwiYXBwLnNlcnZpY2UoJ3NlYXJjaFNlcnZpY2UnLCBbJyRyZXNvdXJjZScsICckbG9jYXRpb24nLCBmdW5jdGlvbigkcmVzb3VyY2UsICRsb2NhdGlvbikge1xuICB2YXIgcmVzdWx0c09iaiA9IHt9O1xuICByZXR1cm4ge1xuICAgIG5ld1NlYXJjaDogZnVuY3Rpb24ob2JqKSB7XG4gICAgICAvLyByZXR1cm4gJHJlc291cmNlKCdodHRwczovL2poZmNhcHN0b25lLmhlcm9rdWFwcC5jb20vYXBpJykuc2F2ZShvYmopLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgcmV0dXJuICRyZXNvdXJjZSgnLy9sb2NhbGhvc3Q6MzAwMC9zY3JhcGUvc2NyYXBlJykuc2F2ZShvYmopLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgICByZXN1bHRzT2JqID0gcmVzdWx0cztcbiAgICAgIH0pXG4gICAgfSxcbiAgICByZXN1bHRzT2JqU2V0dGVyOiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJlc3VsdHNPYmogPSBvYmpcbiAgICB9LFxuICAgIHJlc3VsdHNPYmpHZXR0ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHJlc3VsdHNPYmoucmVzdWx0cykge1xuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIGxldCBkdXBlQ291bnQgPSAwO1xuICAgICAgICB3aGlsZSAoaSA8IHJlc3VsdHNPYmoucmVzdWx0cy5sZW5ndGgpIHtcbiAgICAgICAgICBsZXQgY2hlY2tBZ2FpbnN0ID0gcmVzdWx0c09iai5yZXN1bHRzW2ldXG4gICAgICAgICAgaWYgKGNoZWNrQWdhaW5zdC5kdXBlKSB7XG4gICAgICAgICAgICBkdXBlQ291bnQrK1xuICAgICAgICAgIH1cbiAgICAgICAgICBmb3IgKHZhciBrID0gaSArIDE7IGsgPCByZXN1bHRzT2JqLnJlc3VsdHMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgIGxldCBjdXJyZW50SyA9IHJlc3VsdHNPYmoucmVzdWx0c1trXVxuICAgICAgICAgICAgaWYgKGNoZWNrQWdhaW5zdC50aXRsZSA9PT0gY3VycmVudEsudGl0bGUgJiYgY2hlY2tBZ2FpbnN0LnByaWNlID09PSBjdXJyZW50Sy5wcmljZSkge1xuICAgICAgICAgICAgICBjdXJyZW50Sy5kdXBlID0gdHJ1ZVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKCFjdXJyZW50Sy5kdXBlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudEsuZHVwZSA9IGZhbHNlXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaSsrXG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0c09iai5kdXBlQ291bnQgPSBkdXBlQ291bnRcbiAgICAgICAgcmVzdWx0c09iai5yZXN1bHRDb3VudCA9IHJlc3VsdHNPYmoucmVzdWx0cy5sZW5ndGhcbiAgICAgICAgcmV0dXJuIHJlc3VsdHNPYmo7XG4gICAgICB9XG4gICAgICByZXR1cm4ge31cbiAgICB9LFxuICAgIHNhdmVTZWFyY2g6IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuICRyZXNvdXJjZSgnLy9sb2NhbGhvc3Q6MzAwMC9zZWFyY2gvc2F2ZXNlYXJjaCcpLnNhdmUob2JqKS4kcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHt9KVxuICAgIH0sXG4gICAgZGVsZXRlU2VhcmNoOiBmdW5jdGlvbihpZCkge1xuICAgICAgcmV0dXJuICRyZXNvdXJjZSgnLy9sb2NhbGhvc3Q6MzAwMC9zZWFyY2gvZGVsZXRlc2VhcmNoJylcbiAgICAgICAgLnNhdmUoe1xuICAgICAgICAgIGlkOiBpZFxuICAgICAgICB9KVxuICAgICAgICAuJHByb21pc2VcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgICAgIHJldHVybiByZXN1bHRzXG4gICAgICAgIH0pXG4gICAgfSxcbiAgICB2aWV3U2VhcmNoOiBmdW5jdGlvbihpZCkge1xuICAgICAgcmV0dXJuICRyZXNvdXJjZShgLy9sb2NhbGhvc3Q6MzAwMC9zZWFyY2gvZ2V0c2VhcmNoLyR7aWR9YClcbiAgICAgICAgLmdldCgpXG4gICAgICAgIC4kcHJvbWlzZVxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICAgICAgcmVzdWx0c09iaiA9IHJlc3VsdHNcbiAgICAgICAgfSlcbiAgICB9XG4gIH1cbn1dKVxuIiwiYXBwLnNlcnZpY2UoJ3N0YXRlTGlzdFNlcnZpY2UnLCBbJyRyZXNvdXJjZScsIGZ1bmN0aW9uKCRyZXNvdXJjZSkge1xuICB2YXIgcmVzdWx0c0FyciA9IFtdO1xuICByZXR1cm4ge1xuICAgIHJldHJpZXZlOiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiAkcmVzb3VyY2UoJy8vbG9jYWxob3N0OjMwMDAvc2NyYXBlL3NscycpLmdldCgpXG4gICAgICAgIC4kcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgICAgICByZXN1bHRzQXJyID0gcmVzdWx0cy5maW5pc2hcbiAgICAgICAgfSlcbiAgICB9LFxuICAgIHJlc3VsdHNBcnJHZXR0ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHJlc3VsdHNBcnJcbiAgICB9XG4gIH1cbn1dKVxuIiwiYXBwLnNlcnZpY2UoJ3VzZXJTZXJ2aWNlJywgWyckcmVzb3VyY2UnLCAnJGxvY2F0aW9uJywgZnVuY3Rpb24oJHJlc291cmNlLCAkbG9jYXRpb24sICR3aW5kb3cpIHtcbiAgcmV0dXJuIHtcbiAgICBzaWdudXA6IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuICRyZXNvdXJjZSgnLy9sb2NhbGhvc3Q6MzAwMC9hdXRoL3NpZ251cCcpLnNhdmUob2JqKVxuICAgIH0sXG4gICAgbG9naW46IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuICRyZXNvdXJjZSgnLy9sb2NhbGhvc3Q6MzAwMC9hdXRoL2xvZ2luJykuc2F2ZShvYmopXG4gICAgfSxcbiAgICBsb2dvdXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnY3JhaWdzYmxpc3MtdG9rZW4nKVxuICAgICAgcmV0dXJuXG4gICAgfSxcbiAgICBnZXRVc2VyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAkcmVzb3VyY2UoJy8vbG9jYWxob3N0OjMwMDAvdXNlci9kYXNoYm9hcmQnKS5nZXQoKS4kcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy9kYXNoYm9hcmQnKVxuICAgICAgICAgIHJldHVybiByZXNwb25zZVxuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnL2Vycm9yJylcbiAgICAgICAgfSlcbiAgICB9XG4gIH1cbn1dKVxuIl19

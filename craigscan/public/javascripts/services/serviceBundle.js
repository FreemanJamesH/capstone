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
      $window.localStorage.removeItem('regionChoice')
      $window.localStorage.removeItem('searchParams')
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhdXRoU3ZjLmpzIiwiaW5kZXguanMiLCJpbnRlcmNlcHRvclN2Yy5qcyIsInBvc3RTdmMuanMiLCJzZWFyY2hTdmMuanMiLCJzdGF0ZUxpc3RTdmMuanMiLCJ1c2VyU3ZjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiYXBwLnNlcnZpY2UoJ2F1dGhTZXJ2aWNlJywgWyckd2luZG93JywgZnVuY3Rpb24oJHdpbmRvdykge1xuICByZXR1cm4ge1xuICAgIGdpdmVUb2tlbjogZnVuY3Rpb24odG9rZW4pIHtcbiAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlWydjcmFpZ3NibGlzcy10b2tlbiddID0gdG9rZW4uand0O1xuICAgIH0sXG4gICAgZ2V0VG9rZW46IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICR3aW5kb3cubG9jYWxTdG9yYWdlWydjcmFpZ3NibGlzcy10b2tlbiddXG4gICAgfSxcbiAgICBsb2dvdXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnY3JhaWdzYmxpc3MtdG9rZW4nKVxuICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgncmVnaW9uQ2hvaWNlJylcbiAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3NlYXJjaFBhcmFtcycpXG4gICAgfSxcbiAgICBwYXJzZUp3dDogZnVuY3Rpb24odG9rZW4pIHtcbiAgICAgIGlmICh0b2tlbikge1xuICAgICAgICB2YXIgYmFzZTY0VXJsID0gdG9rZW4uc3BsaXQoJy4nKVsxXTtcbiAgICAgICAgdmFyIGJhc2U2NCA9IGJhc2U2NFVybC5yZXBsYWNlKCctJywgJysnKS5yZXBsYWNlKCdfJywgJy8nKVxuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZSgkd2luZG93LmF0b2IoYmFzZTY0KSlcbiAgICAgIH1cbiAgICB9LFxuICAgIGlzQXV0aGVkOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciByZXR1cm5lZFRva2VuID0gdGhpcy5nZXRUb2tlbigpO1xuICAgICAgaWYgKHJldHVybmVkVG9rZW4pIHtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH1cbiAgfVxufV0pXG4iLCJyZXF1aXJlKCcuL2F1dGhTdmMuanMnKVxucmVxdWlyZSgnLi9pbnRlcmNlcHRvclN2Yy5qcycpXG5yZXF1aXJlKCcuL3NlYXJjaFN2Yy5qcycpXG5yZXF1aXJlKCcuL3N0YXRlTGlzdFN2Yy5qcycpXG5yZXF1aXJlKCcuL3VzZXJTdmMuanMnKVxucmVxdWlyZSgnLi9wb3N0U3ZjJylcbiIsImFwcC5mYWN0b3J5KCdhdXRoSW50ZXJjZXB0b3InLCBbJ2F1dGhTZXJ2aWNlJywgZnVuY3Rpb24oYXV0aCkge1xuICByZXR1cm4ge1xuICAgIHJlcXVlc3Q6IGZ1bmN0aW9uKGNvbmZpZykge1xuICAgICAgdmFyIHRva2VuID0gYXV0aC5nZXRUb2tlbigpO1xuICAgICAgY29uZmlnLmhlYWRlcnMudG9rZW4gPSB0b2tlblxuICAgICAgcmV0dXJuIGNvbmZpZ1xuICAgIH0sXG4gICAgcmVzcG9uc2U6IGZ1bmN0aW9uKHJlcykge1xuICAgICAgaWYgKHJlcy5kYXRhLmp3dCkge1xuICAgICAgICBhdXRoLmdpdmVUb2tlbihyZXMuZGF0YSlcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXNcbiAgICB9XG4gIH1cbn1dKVxuXG5hcHAuY29uZmlnKGZ1bmN0aW9uKCRodHRwUHJvdmlkZXIpIHtcbiAgJGh0dHBQcm92aWRlci5pbnRlcmNlcHRvcnMucHVzaCgnYXV0aEludGVyY2VwdG9yJylcbn0pXG4iLCJhcHAuc2VydmljZSgncG9zdFNlcnZpY2UnLCBmdW5jdGlvbigkcmVzb3VyY2UsIHNlYXJjaFNlcnZpY2UpIHtcbiAgcmV0dXJuIHtcbiAgICBkZWxldGU6IGZ1bmN0aW9uKHNlYXJjaGlkLCBpbmRleCkge1xuICAgICAgY29uc29sZS5sb2coJ3NlcnZpY2UgZGVsZXRlOicsIHNlYXJjaGlkLCBpbmRleCk7XG4gICAgICByZXR1cm4gJHJlc291cmNlKGAvL2xvY2FsaG9zdDozMDAwL3Bvc3RzLyR7c2VhcmNoaWR9LyR7aW5kZXh9YCkuZGVsZXRlKCkuJHByb21pc2UudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICAgIHJldHVybiByZXN1bHRzXG4gICAgICB9KVxuICAgIH0sXG4gICAgZGVsZXRlRHVwZXM6IGZ1bmN0aW9uKGlkLCBkdXBlc1JlbW92ZWQpIHtcbiAgICAgIHJldHVybiAkcmVzb3VyY2UoYC8vbG9jYWxob3N0OjMwMDAvcG9zdHMvJHtpZH1gKS5zYXZlKGR1cGVzUmVtb3ZlZCkuJHByb21pc2UudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICAgIHNlYXJjaFNlcnZpY2UucmVzdWx0c09ialNldHRlcihyZXN1bHRzKVxuICAgICAgICByZXR1cm47XG4gICAgICB9KVxuICAgIH0sXG4gICAgZmF2b3JpdGU6IGZ1bmN0aW9uKGlkLCBpbmRleCl7XG4gICAgICByZXR1cm4gJHJlc291cmNlKGAvL2xvY2FsaG9zdDozMDAwL3Bvc3RzL2Zhdm9yaXRlLyR7aWR9LyR7aW5kZXh9YCkuc2F2ZSgpLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzdWx0cyl7XG4gICAgICAgIHNlYXJjaFNlcnZpY2UucmVzdWx0c09ialNldHRlcihyZXN1bHRzKVxuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgIH0pXG4gICAgfSxcbiAgICB1bmZhdm9yaXRlOiBmdW5jdGlvbihpZCwgaW5kZXgpe1xuICAgICAgcmV0dXJuICRyZXNvdXJjZShgLy9sb2NhbGhvc3Q6MzAwMC9wb3N0cy91bmZhdm9yaXRlLyR7aWR9LyR7aW5kZXh9YCkuc2F2ZSgpLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzdWx0cyl7XG4gICAgICAgIHNlYXJjaFNlcnZpY2UucmVzdWx0c09ialNldHRlcihyZXN1bHRzKVxuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgIH0pXG4gICAgfVxuICB9XG59KVxuIiwiYXBwLnNlcnZpY2UoJ3NlYXJjaFNlcnZpY2UnLCBbJyRyZXNvdXJjZScsICckbG9jYXRpb24nLCBmdW5jdGlvbigkcmVzb3VyY2UsICRsb2NhdGlvbikge1xuICB2YXIgcmVzdWx0c09iaiA9IHt9O1xuICByZXR1cm4ge1xuICAgIG5ld1NlYXJjaDogZnVuY3Rpb24ob2JqKSB7XG4gICAgICAvLyByZXR1cm4gJHJlc291cmNlKCdodHRwczovL2poZmNhcHN0b25lLmhlcm9rdWFwcC5jb20vYXBpJykuc2F2ZShvYmopLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgcmV0dXJuICRyZXNvdXJjZSgnLy9sb2NhbGhvc3Q6MzAwMC9zY3JhcGUvc2NyYXBlJykuc2F2ZShvYmopLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgICByZXN1bHRzT2JqID0gcmVzdWx0cztcbiAgICAgIH0pXG4gICAgfSxcbiAgICByZXN1bHRzT2JqU2V0dGVyOiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJlc3VsdHNPYmogPSBvYmpcbiAgICB9LFxuICAgIHJlc3VsdHNPYmpHZXR0ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHJlc3VsdHNPYmoucmVzdWx0cykge1xuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIGxldCBkdXBlQ291bnQgPSAwO1xuICAgICAgICBsZXQgZmF2Q291bnQgPSAwO1xuICAgICAgICB3aGlsZSAoaSA8IHJlc3VsdHNPYmoucmVzdWx0cy5sZW5ndGgpIHtcbiAgICAgICAgICBsZXQgY2hlY2tBZ2FpbnN0ID0gcmVzdWx0c09iai5yZXN1bHRzW2ldXG4gICAgICAgICAgaWYgKGNoZWNrQWdhaW5zdC5kdXBlKSB7XG4gICAgICAgICAgICBkdXBlQ291bnQrK1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoY2hlY2tBZ2FpbnN0LmlzRmF2KSB7XG4gICAgICAgICAgICBmYXZDb3VudCsrXG4gICAgICAgICAgfVxuICAgICAgICAgIGZvciAodmFyIGsgPSBpICsgMTsgayA8IHJlc3VsdHNPYmoucmVzdWx0cy5sZW5ndGg7IGsrKykge1xuICAgICAgICAgICAgbGV0IGN1cnJlbnRLID0gcmVzdWx0c09iai5yZXN1bHRzW2tdXG4gICAgICAgICAgICBpZiAoY2hlY2tBZ2FpbnN0LnRpdGxlID09PSBjdXJyZW50Sy50aXRsZSAmJiBjaGVja0FnYWluc3QucHJpY2UgPT09IGN1cnJlbnRLLnByaWNlKSB7XG4gICAgICAgICAgICAgIGN1cnJlbnRLLmR1cGUgPSB0cnVlXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZiAoIWN1cnJlbnRLLmR1cGUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50Sy5kdXBlID0gZmFsc2VcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpKytcbiAgICAgICAgfVxuICAgICAgICByZXN1bHRzT2JqLmZhdkNvdW50ID0gZmF2Q291bnRcbiAgICAgICAgcmVzdWx0c09iai5kdXBlQ291bnQgPSBkdXBlQ291bnRcbiAgICAgICAgcmVzdWx0c09iai5yZXN1bHRDb3VudCA9IHJlc3VsdHNPYmoucmVzdWx0cy5sZW5ndGhcbiAgICAgICAgcmV0dXJuIHJlc3VsdHNPYmo7XG4gICAgICB9XG4gICAgICByZXR1cm4ge31cbiAgICB9LFxuICAgIHNhdmVTZWFyY2g6IGZ1bmN0aW9uKG9iaikge1xuICAgICAgY29uc29sZS5sb2coJ3NhdmluZyBzZWFyY2g6Jywgb2JqKTtcbiAgICAgIHJldHVybiAkcmVzb3VyY2UoJy8vbG9jYWxob3N0OjMwMDAvc2VhcmNoL3NhdmVzZWFyY2gnKS5zYXZlKG9iaikuJHByb21pc2UudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICAgIHJldHVybiByZXN1bHRzXG4gICAgICB9KVxuICAgIH0sXG4gICAgZGVsZXRlU2VhcmNoOiBmdW5jdGlvbihpZCkge1xuICAgICAgcmV0dXJuICRyZXNvdXJjZSgnLy9sb2NhbGhvc3Q6MzAwMC9zZWFyY2gvZGVsZXRlc2VhcmNoJylcbiAgICAgICAgLnNhdmUoe1xuICAgICAgICAgIGlkOiBpZFxuICAgICAgICB9KVxuICAgICAgICAuJHByb21pc2VcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgICAgIHJldHVybiByZXN1bHRzXG4gICAgICAgIH0pXG4gICAgfSxcbiAgICB2aWV3U2VhcmNoOiBmdW5jdGlvbihpZCkge1xuICAgICAgcmV0dXJuICRyZXNvdXJjZShgLy9sb2NhbGhvc3Q6MzAwMC9zZWFyY2gvZ2V0c2VhcmNoLyR7aWR9YClcbiAgICAgICAgLmdldCgpXG4gICAgICAgIC4kcHJvbWlzZVxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICAgICAgcmVzdWx0c09iaiA9IHJlc3VsdHNcbiAgICAgICAgfSlcbiAgICB9LFxuICAgIHVwZGF0ZVNlYXJjaDogZnVuY3Rpb24oaWQpIHtcbiAgICAgIHJldHVybiAkcmVzb3VyY2UoYC8vbG9jYWxob3N0OjMwMDAvc2VhcmNoL3VwZGF0ZXNlYXJjaC8ke2lkfWApXG4gICAgICAgIC5nZXQoKVxuICAgICAgICAuJHByb21pc2VcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgICAgIHJldHVybiByZXN1bHRzXG4gICAgICAgIH0pXG4gICAgfVxuICB9XG59XSlcbiIsImFwcC5zZXJ2aWNlKCdzdGF0ZUxpc3RTZXJ2aWNlJywgWyckcmVzb3VyY2UnLCBmdW5jdGlvbigkcmVzb3VyY2UpIHtcbiAgdmFyIHJlc3VsdHNBcnIgPSBbXTtcbiAgcmV0dXJuIHtcbiAgICByZXRyaWV2ZTogZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gJHJlc291cmNlKCcvL2xvY2FsaG9zdDozMDAwL3NjcmFwZS9zbHMnKS5nZXQoKVxuICAgICAgICAuJHByb21pc2UudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICAgICAgcmVzdWx0c0FyciA9IHJlc3VsdHMuZmluaXNoXG4gICAgICAgIH0pXG4gICAgfSxcbiAgICByZXN1bHRzQXJyR2V0dGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiByZXN1bHRzQXJyXG4gICAgfVxuICB9XG59XSlcbiIsImFwcC5zZXJ2aWNlKCd1c2VyU2VydmljZScsIFsnJHJlc291cmNlJywgJyRsb2NhdGlvbicsIGZ1bmN0aW9uKCRyZXNvdXJjZSwgJGxvY2F0aW9uLCAkd2luZG93KSB7XG4gIHJldHVybiB7XG4gICAgc2lnbnVwOiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiAkcmVzb3VyY2UoJy8vbG9jYWxob3N0OjMwMDAvYXV0aC9zaWdudXAnKS5zYXZlKG9iaikuJHByb21pc2UudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgIHJldHVybiByZXNwb25zZVxuICAgICAgfSlcbiAgICB9LFxuICAgIGxvZ2luOiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiAkcmVzb3VyY2UoJy8vbG9jYWxob3N0OjMwMDAvYXV0aC9sb2dpbicpLnNhdmUob2JqKS4kcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlXG4gICAgICB9KVxuICAgIH0sXG4gICAgbG9nb3V0OiBmdW5jdGlvbigpIHtcbiAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2NyYWlnc2JsaXNzLXRva2VuJylcbiAgICAgIHJldHVyblxuICAgIH0sXG4gICAgZ2V0VXNlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gJHJlc291cmNlKCcvL2xvY2FsaG9zdDozMDAwL3VzZXIvZGFzaGJvYXJkJykuZ2V0KCkuJHByb21pc2UudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvZGFzaGJvYXJkJylcbiAgICAgICAgICByZXR1cm4gcmVzcG9uc2VcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy9lcnJvcicpXG4gICAgICAgIH0pXG4gICAgfVxuICB9XG59XSlcbiJdfQ==

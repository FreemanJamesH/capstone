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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhdXRoU3ZjLmpzIiwiaW5kZXguanMiLCJpbnRlcmNlcHRvclN2Yy5qcyIsInBvc3RTdmMuanMiLCJyYW5kb21TdHJpbmdTdmMuanMiLCJzZWFyY2hTdmMuanMiLCJzdGF0ZUxpc3RTdmMuanMiLCJ1c2VyU3ZjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImFwcC5zZXJ2aWNlKCdhdXRoU2VydmljZScsIFsnJHdpbmRvdycsIGZ1bmN0aW9uKCR3aW5kb3cpIHtcbiAgcmV0dXJuIHtcbiAgICBnaXZlVG9rZW46IGZ1bmN0aW9uKHRva2VuKSB7XG4gICAgICAkd2luZG93LmxvY2FsU3RvcmFnZVsnY3JhaWdzYmxpc3MtdG9rZW4nXSA9IHRva2VuLmp3dDtcbiAgICB9LFxuICAgIGdldFRva2VuOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAkd2luZG93LmxvY2FsU3RvcmFnZVsnY3JhaWdzYmxpc3MtdG9rZW4nXVxuICAgIH0sXG4gICAgbG9nb3V0OiBmdW5jdGlvbigpIHtcbiAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2NyYWlnc2JsaXNzLXRva2VuJylcbiAgICB9LFxuICAgIHBhcnNlSnd0OiBmdW5jdGlvbih0b2tlbikge1xuICAgICAgaWYgKHRva2VuKSB7XG4gICAgICAgIHZhciBiYXNlNjRVcmwgPSB0b2tlbi5zcGxpdCgnLicpWzFdO1xuICAgICAgICB2YXIgYmFzZTY0ID0gYmFzZTY0VXJsLnJlcGxhY2UoJy0nLCAnKycpLnJlcGxhY2UoJ18nLCAnLycpXG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKCR3aW5kb3cuYXRvYihiYXNlNjQpKVxuICAgICAgfVxuICAgIH0sXG4gICAgaXNBdXRoZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHJldHVybmVkVG9rZW4gPSB0aGlzLmdldFRva2VuKCk7XG4gICAgICBpZiAocmV0dXJuZWRUb2tlbikge1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfVxuICB9XG59XSlcbiIsInJlcXVpcmUoJy4vYXV0aFN2Yy5qcycpXG5yZXF1aXJlKCcuL2ludGVyY2VwdG9yU3ZjLmpzJylcbnJlcXVpcmUoJy4vcmFuZG9tU3RyaW5nU3ZjLmpzJylcbnJlcXVpcmUoJy4vc2VhcmNoU3ZjLmpzJylcbnJlcXVpcmUoJy4vc3RhdGVMaXN0U3ZjLmpzJylcbnJlcXVpcmUoJy4vdXNlclN2Yy5qcycpXG5yZXF1aXJlKCcuL3Bvc3RTdmMnKVxuIiwiYXBwLmZhY3RvcnkoJ2F1dGhJbnRlcmNlcHRvcicsIFsnYXV0aFNlcnZpY2UnLCBmdW5jdGlvbihhdXRoKSB7XG4gIHJldHVybiB7XG4gICAgcmVxdWVzdDogZnVuY3Rpb24oY29uZmlnKSB7XG4gICAgICB2YXIgdG9rZW4gPSBhdXRoLmdldFRva2VuKCk7XG4gICAgICAvLyBpZiAoY29uZmlnLnVybC5pbmRleE9mKCcvL2xvY2FsaG9zdDozMDAwL2Rhc2hib2FyZCcpID09PSAwKSB7XG4gICAgICBjb25maWcuaGVhZGVycy50b2tlbiA9IHRva2VuXG4gICAgICAgIC8vIH1cbiAgICAgIHJldHVybiBjb25maWdcbiAgICB9LFxuICAgIHJlc3BvbnNlOiBmdW5jdGlvbihyZXMpIHtcbiAgICAgIC8vIGlmIChyZXMuY29uZmlnLnVybC5pbmRleE9mKCcvL2xvY2FsaG9zdDozMDAwL3NpZ251cCcpID09PSAwICYmIHJlcy5kYXRhLmp3dCkge1xuICAgICAgaWYgKHJlcy5kYXRhLmp3dCkge1xuICAgICAgICBhdXRoLmdpdmVUb2tlbihyZXMuZGF0YSlcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXNcbiAgICB9XG4gIH1cbn1dKVxuXG5hcHAuY29uZmlnKGZ1bmN0aW9uKCRodHRwUHJvdmlkZXIpIHtcbiAgJGh0dHBQcm92aWRlci5pbnRlcmNlcHRvcnMucHVzaCgnYXV0aEludGVyY2VwdG9yJylcbn0pXG4iLCJhcHAuc2VydmljZSgncG9zdFNlcnZpY2UnLCBmdW5jdGlvbigkcmVzb3VyY2Upe1xuICByZXR1cm4ge1xuICAgIGRlbGV0ZTogZnVuY3Rpb24oc2VhcmNoaWQsIGluZGV4KXtcbiAgICAgIGNvbnNvbGUubG9nKCdzZWFyY2hpZCwgaW5kZXg6Jywgc2VhcmNoaWQsIGluZGV4KTtcbiAgICAgIHJldHVybiAkcmVzb3VyY2UoYC8vbG9jYWxob3N0OjMwMDAvcG9zdHMvJHtzZWFyY2hpZH0vJHtpbmRleH1gKS5kZWxldGUoKS4kcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgICAgcmVzdWx0c09iaiA9IHJlc3VsdHM7XG4gICAgICB9KVxuICAgIH1cbiAgfVxufSlcbiIsImFwcC5zZXJ2aWNlKCdyYW5kb21TdHJpbmcnLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHtcbiAgICBnZXRTdHJpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHRleHQgPSBcIlwiO1xuICAgICAgdmFyIHBvc3NpYmxlID0gXCJBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OVwiO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxNjsgaSsrKSB7XG4gICAgICAgIHRleHQgKz0gcG9zc2libGUuY2hhckF0KE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHBvc3NpYmxlLmxlbmd0aCkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuICB9XG59KVxuIiwiYXBwLnNlcnZpY2UoJ3NlYXJjaFNlcnZpY2UnLCBbJyRyZXNvdXJjZScsICckbG9jYXRpb24nLCBmdW5jdGlvbigkcmVzb3VyY2UsICRsb2NhdGlvbikge1xuICB2YXIgcmVzdWx0c09iaiA9IHt9O1xuICByZXR1cm4ge1xuICAgIG5ld1NlYXJjaDogZnVuY3Rpb24ob2JqKSB7XG4gICAgICAvLyByZXR1cm4gJHJlc291cmNlKCdodHRwczovL2poZmNhcHN0b25lLmhlcm9rdWFwcC5jb20vYXBpJykuc2F2ZShvYmopLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgcmV0dXJuICRyZXNvdXJjZSgnLy9sb2NhbGhvc3Q6MzAwMC9zY3JhcGUvc2NyYXBlJykuc2F2ZShvYmopLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgICByZXN1bHRzT2JqID0gcmVzdWx0cztcbiAgICAgIH0pXG4gICAgfSxcbiAgICByZXN1bHRzT2JqR2V0dGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdyZXN1bHRzT2JqR2V0dGVyIGZpcmluZywgcmVzdWx0c09iajogJywgcmVzdWx0c09iaik7XG4gICAgICBsZXQgaSA9IDA7XG4gICAgICBsZXQgZHVwZUNvdW50ID0gMDtcbiAgICAgIHdoaWxlIChpPHJlc3VsdHNPYmoucmVzdWx0cy5sZW5ndGgpe1xuICAgICAgICBsZXQgY2hlY2tBZ2FpbnN0ID0gcmVzdWx0c09iai5yZXN1bHRzW2ldXG4gICAgICAgIGlmIChjaGVja0FnYWluc3QuZHVwZSkge1xuICAgICAgICAgIGR1cGVDb3VudCsrXG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIgayA9IGkrMTsgayA8IHJlc3VsdHNPYmoucmVzdWx0cy5sZW5ndGg7IGsrKyl7XG4gICAgICAgICAgbGV0IGN1cnJlbnRLID0gcmVzdWx0c09iai5yZXN1bHRzW2tdXG4gICAgICAgICAgaWYgKGNoZWNrQWdhaW5zdC50aXRsZSA9PT0gY3VycmVudEsudGl0bGUgJiYgY2hlY2tBZ2FpbnN0LnByaWNlID09PSBjdXJyZW50Sy5wcmljZSl7XG4gICAgICAgICAgICBjdXJyZW50Sy5kdXBlID0gdHJ1ZVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoIWN1cnJlbnRLLmR1cGUpe1xuICAgICAgICAgICAgICBjdXJyZW50Sy5kdXBlID0gZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaSsrXG4gICAgICB9XG4gICAgICByZXN1bHRzT2JqLmR1cGVDb3VudCA9IGR1cGVDb3VudFxuICAgICAgcmVzdWx0c09iai5yZXN1bHRDb3VudCA9IHJlc3VsdHNPYmoucmVzdWx0cy5sZW5ndGhcbiAgICAgIHJldHVybiByZXN1bHRzT2JqO1xuICAgIH0sXG4gICAgc2F2ZVNlYXJjaDogZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gJHJlc291cmNlKCcvL2xvY2FsaG9zdDozMDAwL3NlYXJjaC9zYXZlc2VhcmNoJykuc2F2ZShvYmopLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgfSlcbiAgICB9LFxuICAgIGRlbGV0ZVNlYXJjaDogZnVuY3Rpb24oaWQpIHtcbiAgICAgIHJldHVybiAkcmVzb3VyY2UoJy8vbG9jYWxob3N0OjMwMDAvc2VhcmNoL2RlbGV0ZXNlYXJjaCcpXG4gICAgICAgIC5zYXZlKHtcbiAgICAgICAgICBpZDogaWRcbiAgICAgICAgfSlcbiAgICAgICAgLiRwcm9taXNlXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0c1xuICAgICAgICB9KVxuICAgIH0sXG4gICAgdmlld1NlYXJjaDogZnVuY3Rpb24oaWQpe1xuICAgICAgcmV0dXJuICRyZXNvdXJjZShgLy9sb2NhbGhvc3Q6MzAwMC9zZWFyY2gvZ2V0c2VhcmNoLyR7aWR9YClcbiAgICAgICAgLmdldCgpXG4gICAgICAgIC4kcHJvbWlzZVxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXN1bHRzKXtcbiAgICAgICAgICBjb25zb2xlLmxvZygncmVzdWx0cyBpbiB2aWV3U2VhcmNoTWV0aG9kOiAnLCByZXN1bHRzICk7XG4gICAgICAgICAgcmVzdWx0c09iaiA9IHJlc3VsdHNcbiAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnL3Jlc3VsdHMnKVxuICAgICAgICB9KVxuICAgIH1cbiAgfVxufV0pXG4iLCJhcHAuc2VydmljZSgnc3RhdGVMaXN0U2VydmljZScsIFsnJHJlc291cmNlJywgZnVuY3Rpb24oJHJlc291cmNlKSB7XG4gIHZhciByZXN1bHRzQXJyID0gW107XG4gIHJldHVybiB7XG4gICAgcmV0cmlldmU6IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuICRyZXNvdXJjZSgnLy9sb2NhbGhvc3Q6MzAwMC9zY3JhcGUvc2xzJykuZ2V0KClcbiAgICAgICAgLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgICAgIHJlc3VsdHNBcnIgPSByZXN1bHRzLmZpbmlzaDtcbiAgICAgICAgfSlcbiAgICB9LFxuICAgIHJlc3VsdHNBcnJHZXR0ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHJlc3VsdHNBcnI7XG4gICAgfVxuICB9XG59XSlcbiIsImFwcC5zZXJ2aWNlKCd1c2VyU2VydmljZScsIFsnJHJlc291cmNlJywgJyRsb2NhdGlvbicsIGZ1bmN0aW9uKCRyZXNvdXJjZSwgJGxvY2F0aW9uLCAkd2luZG93KSB7XG4gIHJldHVybiB7XG4gICAgc2lnbnVwOiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiAkcmVzb3VyY2UoJy8vbG9jYWxob3N0OjMwMDAvYXV0aC9zaWdudXAnKS5zYXZlKG9iailcbiAgICB9LFxuICAgIGxvZ2luOiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiAkcmVzb3VyY2UoJy8vbG9jYWxob3N0OjMwMDAvYXV0aC9sb2dpbicpLnNhdmUob2JqKVxuICAgIH0sXG4gICAgbG9nb3V0OiBmdW5jdGlvbigpIHtcbiAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2NyYWlnc2JsaXNzLXRva2VuJylcbiAgICAgIHJldHVybiAzXG4gICAgfSxcbiAgICBnZXRVc2VyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAkcmVzb3VyY2UoJy8vbG9jYWxob3N0OjMwMDAvdXNlci9kYXNoYm9hcmQnKS5nZXQoKS4kcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy9kYXNoYm9hcmQnKVxuICAgICAgICAgIHJldHVybiByZXNwb25zZVxuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnL2Vycm9yJylcbiAgICAgICAgfSlcbiAgICB9XG4gIH1cbn1dKVxuIl19

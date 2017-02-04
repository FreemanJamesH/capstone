(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
app.controller('AuthController', function($scope, $http, $location, authService, userService) {
  $scope.user = {};
  $scope.credentialsExistError = false;
  $scope.submitted = false;


  $scope.signup = function() {
    $scope.submitted = true;
    if ($scope.signupForm.$valid) {
      userService.signup($scope.user).then(function(response){
        if (response.message){
          if (response.message.code === 11000){
            $scope.credentialsExistError = true;
          }
        } else {
          $location.path('/')
        }
      })
    }
  }

  $scope.login = function() {
    console.log('Login fired');
    console.log('login valid form valid?:', $scope.loginForm.$valid);
    $scope.submitted = true;
    userService.login($scope.user).then(function(response){
      if (response.credentialsInvalid){
        $scope.credentialsInvalid = true
      } else {
        $location.path('/')
      }
    })
  }

})

},{}],2:[function(require,module,exports){
app.controller('dashController', function($scope, $location, userService, searchService) {

  $scope.updating = false;

  userService.getUser().then(function(results) {
    $scope.userObj = results
  })

  $scope.deleteSearch = function(id) {
    searchService.deleteSearch(id).then(function(results) {
      $scope.userObj = results
    })
  }

  $scope.viewSearch = function(id) {
    $location.path(`/results/${id}`)
  }

  $scope.updateSearch = function(id){
    $scope.updating = true;
    searchService.updateSearch(id).then(function(results){
      $scope.updating = false;
      $scope.userObj = results
    })
  }
})

},{}],3:[function(require,module,exports){
require('./authCtrl.js')
require('./dashCtrl.js')
require('./mainCtrl.js')
require('./resultsCtrl.js')

},{"./authCtrl.js":1,"./dashCtrl.js":2,"./mainCtrl.js":4,"./resultsCtrl.js":5}],4:[function(require,module,exports){
app.controller('MainController', function($scope, $http, searchService, stateListService, $location, authService, userService, $window, $q) {

  $scope.stateChoice = undefined;
  $scope.regionChoice = undefined;

  stateListService.retrieve().then(function() {
    $scope.stateListProto = stateListService.resultsArrGetter();
  })

  $scope.logout = function() {
    authService.logout()
    $scope.username = null
  }

  $scope.home = function() {
    $location.path('/')
  }

  $scope.$watch(function() {
      return $window.localStorage.getItem('craigsbliss-token')
    },
    function(newValue) {
      if (newValue) {
        let decodedPayload = JSON.parse(atob(newValue.split('.')[1]))
        $scope.username = decodedPayload.username
      }
    },
    true
  )

  $scope.reset = function() {
    $scope.submitted = false;
  }

  $scope.dashboard = function() {
    userService.getUser()
  }

  $scope.submit = function() {
    $scope.submitted = true;
    if ($scope.max_price < $scope.min_price) {
      $scope.maxSmaller = true;
    } else {
      if ($scope.stateChoice && $scope.regionChoice) {
        let searchParams = {
          regionChoice: $scope.regionChoice,
          updated: Date.now(),
          query: $scope.query,
          search_distance: $scope.distance,
          postal: $scope.postal,
          min_price: $scope.min_price,
          max_price: $scope.max_price
        }
        $window.localStorage['searchParams'] = JSON.stringify(searchParams)
        $window.localStorage['regionChoice'] = $scope.regionChoice
        $location.path('/results')
      }
    }
  }
})

},{}],5:[function(require,module,exports){
app.controller('resultsController', function($scope, $routeParams, $mdDialog, searchService, postService, $window) {

  $scope.loading = true;
  $scope.loadingMessage = `Loading your results...`

  setTimeout(function(){
    $scope.loadingMessage = `Thank you for your patience...`
    $scope.$apply()
    setTimeout(function(){
      $scope.loadingMessage = `Searches returning many results can take time to process...`
      $scope.$apply()
    }, 4000)
  }, 4000)


  if (!$routeParams.searchId) {
    let searchObj = {}
    searchObj.regionChoice = $window.localStorage.regionChoice
    searchObj.searchParams = JSON.parse($window.localStorage.searchParams)
    console.log('search params:', $window.localStorage.searchParams);
    searchService.newSearch(searchObj).then(function(results) {
      $scope.resultsObj = searchService.resultsObjGetter();
      $scope.dupeCount = $scope.resultsObj.dupeCount
      $scope.favCount = $scope.resultsObj.favCount
      $scope.loading = false;
    })
  } else {
    searchService.viewSearch($routeParams.searchId).then(function(){
      $scope.resultsObj = searchService.resultsObjGetter()
      $scope.dupeCount = $scope.resultsObj.dupeCount
      $scope.favCount = $scope.resultsObj.favCount
      $scope.loading = false;
    })
  }

  $scope.dupeShow = false
  $scope.imageHide = false
  $scope.favOnly = false

  $scope.delete = function(resultId) {
    postService.delete($scope.resultsObj._id, resultId).then(function(results) {
      searchService.resultsObjSetter(results)
      $scope.resultsObj = searchService.resultsObjGetter()
    })
  }

  $scope.favorite = function(resultId){
    postService.favorite($scope.resultsObj._id, resultId).then(function(results){
      $scope.resultsObj = searchService.resultsObjGetter()
    })
  }

  $scope.unfavorite = function(resultId){
    postService.unfavorite($scope.resultsObj._id, resultId).then(function(results){
      $scope.resultsObj = searchService.resultsObjGetter()
    })
  }

  $scope.deleteAnon = function(index) {
    let deleted = $scope.resultsObj.results.splice(index, 1)
    console.log(deleted[0]);
    if (deleted[0].dupe) {
      $scope.dupeCount--
    } else {
      $scope.resultsObj.resultCount--
    }
  }

  $scope.deleteDupes = function() {
    let dupesRemoved = $scope.resultsObj.results.filter(function(result) {
      return !result.dupe
    })

    if ($scope.resultsObj._id) {
      postService.deleteDupes($scope.resultsObj._id, dupesRemoved).then(function(results) {
        $scope.resultsObj = searchService.resultsObjGetter()
        $scope.dupeCount = $scope.resultsObj.dupeCount;
      })
    } else {
      $scope.resultsObj.results = dupesRemoved
      $scope.dupeCount = 0
    }
  }

  $scope.saveDialog = function() {
    $mdDialog.show(
      $mdDialog.prompt()
      .clickOutsideToClose(true)
      .title('Please choose a name for your search.')
      .openFrom('.control_panel_container')
      .ok('Save')
    ).then(function(results) {
      let search = Object.assign({}, $scope.resultsObj)
      delete search.dupeCount
      delete search.resultCount
      search.title = results
      searchService.saveSearch(search)
    })
  }
})

},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhdXRoQ3RybC5qcyIsImRhc2hDdHJsLmpzIiwiaW5kZXguanMiLCJtYWluQ3RybC5qcyIsInJlc3VsdHNDdHJsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiYXBwLmNvbnRyb2xsZXIoJ0F1dGhDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkaHR0cCwgJGxvY2F0aW9uLCBhdXRoU2VydmljZSwgdXNlclNlcnZpY2UpIHtcbiAgJHNjb3BlLnVzZXIgPSB7fTtcbiAgJHNjb3BlLmNyZWRlbnRpYWxzRXhpc3RFcnJvciA9IGZhbHNlO1xuICAkc2NvcGUuc3VibWl0dGVkID0gZmFsc2U7XG5cblxuICAkc2NvcGUuc2lnbnVwID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnN1Ym1pdHRlZCA9IHRydWU7XG4gICAgaWYgKCRzY29wZS5zaWdudXBGb3JtLiR2YWxpZCkge1xuICAgICAgdXNlclNlcnZpY2Uuc2lnbnVwKCRzY29wZS51c2VyKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgaWYgKHJlc3BvbnNlLm1lc3NhZ2Upe1xuICAgICAgICAgIGlmIChyZXNwb25zZS5tZXNzYWdlLmNvZGUgPT09IDExMDAwKXtcbiAgICAgICAgICAgICRzY29wZS5jcmVkZW50aWFsc0V4aXN0RXJyb3IgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnLycpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgJHNjb3BlLmxvZ2luID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coJ0xvZ2luIGZpcmVkJyk7XG4gICAgY29uc29sZS5sb2coJ2xvZ2luIHZhbGlkIGZvcm0gdmFsaWQ/OicsICRzY29wZS5sb2dpbkZvcm0uJHZhbGlkKTtcbiAgICAkc2NvcGUuc3VibWl0dGVkID0gdHJ1ZTtcbiAgICB1c2VyU2VydmljZS5sb2dpbigkc2NvcGUudXNlcikudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICBpZiAocmVzcG9uc2UuY3JlZGVudGlhbHNJbnZhbGlkKXtcbiAgICAgICAgJHNjb3BlLmNyZWRlbnRpYWxzSW52YWxpZCA9IHRydWVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICRsb2NhdGlvbi5wYXRoKCcvJylcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbn0pXG4iLCJhcHAuY29udHJvbGxlcignZGFzaENvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRsb2NhdGlvbiwgdXNlclNlcnZpY2UsIHNlYXJjaFNlcnZpY2UpIHtcblxuICAkc2NvcGUudXBkYXRpbmcgPSBmYWxzZTtcblxuICB1c2VyU2VydmljZS5nZXRVc2VyKCkudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgJHNjb3BlLnVzZXJPYmogPSByZXN1bHRzXG4gIH0pXG5cbiAgJHNjb3BlLmRlbGV0ZVNlYXJjaCA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgc2VhcmNoU2VydmljZS5kZWxldGVTZWFyY2goaWQpLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgJHNjb3BlLnVzZXJPYmogPSByZXN1bHRzXG4gICAgfSlcbiAgfVxuXG4gICRzY29wZS52aWV3U2VhcmNoID0gZnVuY3Rpb24oaWQpIHtcbiAgICAkbG9jYXRpb24ucGF0aChgL3Jlc3VsdHMvJHtpZH1gKVxuICB9XG5cbiAgJHNjb3BlLnVwZGF0ZVNlYXJjaCA9IGZ1bmN0aW9uKGlkKXtcbiAgICAkc2NvcGUudXBkYXRpbmcgPSB0cnVlO1xuICAgIHNlYXJjaFNlcnZpY2UudXBkYXRlU2VhcmNoKGlkKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpe1xuICAgICAgJHNjb3BlLnVwZGF0aW5nID0gZmFsc2U7XG4gICAgICAkc2NvcGUudXNlck9iaiA9IHJlc3VsdHNcbiAgICB9KVxuICB9XG59KVxuIiwicmVxdWlyZSgnLi9hdXRoQ3RybC5qcycpXG5yZXF1aXJlKCcuL2Rhc2hDdHJsLmpzJylcbnJlcXVpcmUoJy4vbWFpbkN0cmwuanMnKVxucmVxdWlyZSgnLi9yZXN1bHRzQ3RybC5qcycpXG4iLCJhcHAuY29udHJvbGxlcignTWFpbkNvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRodHRwLCBzZWFyY2hTZXJ2aWNlLCBzdGF0ZUxpc3RTZXJ2aWNlLCAkbG9jYXRpb24sIGF1dGhTZXJ2aWNlLCB1c2VyU2VydmljZSwgJHdpbmRvdywgJHEpIHtcblxuICAkc2NvcGUuc3RhdGVDaG9pY2UgPSB1bmRlZmluZWQ7XG4gICRzY29wZS5yZWdpb25DaG9pY2UgPSB1bmRlZmluZWQ7XG5cbiAgc3RhdGVMaXN0U2VydmljZS5yZXRyaWV2ZSgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnN0YXRlTGlzdFByb3RvID0gc3RhdGVMaXN0U2VydmljZS5yZXN1bHRzQXJyR2V0dGVyKCk7XG4gIH0pXG5cbiAgJHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuICAgIGF1dGhTZXJ2aWNlLmxvZ291dCgpXG4gICAgJHNjb3BlLnVzZXJuYW1lID0gbnVsbFxuICB9XG5cbiAgJHNjb3BlLmhvbWUgPSBmdW5jdGlvbigpIHtcbiAgICAkbG9jYXRpb24ucGF0aCgnLycpXG4gIH1cblxuICAkc2NvcGUuJHdhdGNoKGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICR3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2NyYWlnc2JsaXNzLXRva2VuJylcbiAgICB9LFxuICAgIGZ1bmN0aW9uKG5ld1ZhbHVlKSB7XG4gICAgICBpZiAobmV3VmFsdWUpIHtcbiAgICAgICAgbGV0IGRlY29kZWRQYXlsb2FkID0gSlNPTi5wYXJzZShhdG9iKG5ld1ZhbHVlLnNwbGl0KCcuJylbMV0pKVxuICAgICAgICAkc2NvcGUudXNlcm5hbWUgPSBkZWNvZGVkUGF5bG9hZC51c2VybmFtZVxuICAgICAgfVxuICAgIH0sXG4gICAgdHJ1ZVxuICApXG5cbiAgJHNjb3BlLnJlc2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnN1Ym1pdHRlZCA9IGZhbHNlO1xuICB9XG5cbiAgJHNjb3BlLmRhc2hib2FyZCA9IGZ1bmN0aW9uKCkge1xuICAgIHVzZXJTZXJ2aWNlLmdldFVzZXIoKVxuICB9XG5cbiAgJHNjb3BlLnN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5zdWJtaXR0ZWQgPSB0cnVlO1xuICAgIGlmICgkc2NvcGUubWF4X3ByaWNlIDwgJHNjb3BlLm1pbl9wcmljZSkge1xuICAgICAgJHNjb3BlLm1heFNtYWxsZXIgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoJHNjb3BlLnN0YXRlQ2hvaWNlICYmICRzY29wZS5yZWdpb25DaG9pY2UpIHtcbiAgICAgICAgbGV0IHNlYXJjaFBhcmFtcyA9IHtcbiAgICAgICAgICByZWdpb25DaG9pY2U6ICRzY29wZS5yZWdpb25DaG9pY2UsXG4gICAgICAgICAgdXBkYXRlZDogRGF0ZS5ub3coKSxcbiAgICAgICAgICBxdWVyeTogJHNjb3BlLnF1ZXJ5LFxuICAgICAgICAgIHNlYXJjaF9kaXN0YW5jZTogJHNjb3BlLmRpc3RhbmNlLFxuICAgICAgICAgIHBvc3RhbDogJHNjb3BlLnBvc3RhbCxcbiAgICAgICAgICBtaW5fcHJpY2U6ICRzY29wZS5taW5fcHJpY2UsXG4gICAgICAgICAgbWF4X3ByaWNlOiAkc2NvcGUubWF4X3ByaWNlXG4gICAgICAgIH1cbiAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2VbJ3NlYXJjaFBhcmFtcyddID0gSlNPTi5zdHJpbmdpZnkoc2VhcmNoUGFyYW1zKVxuICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZVsncmVnaW9uQ2hvaWNlJ10gPSAkc2NvcGUucmVnaW9uQ2hvaWNlXG4gICAgICAgICRsb2NhdGlvbi5wYXRoKCcvcmVzdWx0cycpXG4gICAgICB9XG4gICAgfVxuICB9XG59KVxuIiwiYXBwLmNvbnRyb2xsZXIoJ3Jlc3VsdHNDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkcm91dGVQYXJhbXMsICRtZERpYWxvZywgc2VhcmNoU2VydmljZSwgcG9zdFNlcnZpY2UsICR3aW5kb3cpIHtcblxuICAkc2NvcGUubG9hZGluZyA9IHRydWU7XG4gICRzY29wZS5sb2FkaW5nTWVzc2FnZSA9IGBMb2FkaW5nIHlvdXIgcmVzdWx0cy4uLmBcblxuICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gYFRoYW5rIHlvdSBmb3IgeW91ciBwYXRpZW5jZS4uLmBcbiAgICAkc2NvcGUuJGFwcGx5KClcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAkc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBgU2VhcmNoZXMgcmV0dXJuaW5nIG1hbnkgcmVzdWx0cyBjYW4gdGFrZSB0aW1lIHRvIHByb2Nlc3MuLi5gXG4gICAgICAkc2NvcGUuJGFwcGx5KClcbiAgICB9LCA0MDAwKVxuICB9LCA0MDAwKVxuXG5cbiAgaWYgKCEkcm91dGVQYXJhbXMuc2VhcmNoSWQpIHtcbiAgICBsZXQgc2VhcmNoT2JqID0ge31cbiAgICBzZWFyY2hPYmoucmVnaW9uQ2hvaWNlID0gJHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVnaW9uQ2hvaWNlXG4gICAgc2VhcmNoT2JqLnNlYXJjaFBhcmFtcyA9IEpTT04ucGFyc2UoJHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2VhcmNoUGFyYW1zKVxuICAgIGNvbnNvbGUubG9nKCdzZWFyY2ggcGFyYW1zOicsICR3aW5kb3cubG9jYWxTdG9yYWdlLnNlYXJjaFBhcmFtcyk7XG4gICAgc2VhcmNoU2VydmljZS5uZXdTZWFyY2goc2VhcmNoT2JqKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgICRzY29wZS5yZXN1bHRzT2JqID0gc2VhcmNoU2VydmljZS5yZXN1bHRzT2JqR2V0dGVyKCk7XG4gICAgICAkc2NvcGUuZHVwZUNvdW50ID0gJHNjb3BlLnJlc3VsdHNPYmouZHVwZUNvdW50XG4gICAgICAkc2NvcGUuZmF2Q291bnQgPSAkc2NvcGUucmVzdWx0c09iai5mYXZDb3VudFxuICAgICAgJHNjb3BlLmxvYWRpbmcgPSBmYWxzZTtcbiAgICB9KVxuICB9IGVsc2Uge1xuICAgIHNlYXJjaFNlcnZpY2Uudmlld1NlYXJjaCgkcm91dGVQYXJhbXMuc2VhcmNoSWQpLnRoZW4oZnVuY3Rpb24oKXtcbiAgICAgICRzY29wZS5yZXN1bHRzT2JqID0gc2VhcmNoU2VydmljZS5yZXN1bHRzT2JqR2V0dGVyKClcbiAgICAgICRzY29wZS5kdXBlQ291bnQgPSAkc2NvcGUucmVzdWx0c09iai5kdXBlQ291bnRcbiAgICAgICRzY29wZS5mYXZDb3VudCA9ICRzY29wZS5yZXN1bHRzT2JqLmZhdkNvdW50XG4gICAgICAkc2NvcGUubG9hZGluZyA9IGZhbHNlO1xuICAgIH0pXG4gIH1cblxuICAkc2NvcGUuZHVwZVNob3cgPSBmYWxzZVxuICAkc2NvcGUuaW1hZ2VIaWRlID0gZmFsc2VcbiAgJHNjb3BlLmZhdk9ubHkgPSBmYWxzZVxuXG4gICRzY29wZS5kZWxldGUgPSBmdW5jdGlvbihyZXN1bHRJZCkge1xuICAgIHBvc3RTZXJ2aWNlLmRlbGV0ZSgkc2NvcGUucmVzdWx0c09iai5faWQsIHJlc3VsdElkKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgIHNlYXJjaFNlcnZpY2UucmVzdWx0c09ialNldHRlcihyZXN1bHRzKVxuICAgICAgJHNjb3BlLnJlc3VsdHNPYmogPSBzZWFyY2hTZXJ2aWNlLnJlc3VsdHNPYmpHZXR0ZXIoKVxuICAgIH0pXG4gIH1cblxuICAkc2NvcGUuZmF2b3JpdGUgPSBmdW5jdGlvbihyZXN1bHRJZCl7XG4gICAgcG9zdFNlcnZpY2UuZmF2b3JpdGUoJHNjb3BlLnJlc3VsdHNPYmouX2lkLCByZXN1bHRJZCkudGhlbihmdW5jdGlvbihyZXN1bHRzKXtcbiAgICAgICRzY29wZS5yZXN1bHRzT2JqID0gc2VhcmNoU2VydmljZS5yZXN1bHRzT2JqR2V0dGVyKClcbiAgICB9KVxuICB9XG5cbiAgJHNjb3BlLnVuZmF2b3JpdGUgPSBmdW5jdGlvbihyZXN1bHRJZCl7XG4gICAgcG9zdFNlcnZpY2UudW5mYXZvcml0ZSgkc2NvcGUucmVzdWx0c09iai5faWQsIHJlc3VsdElkKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpe1xuICAgICAgJHNjb3BlLnJlc3VsdHNPYmogPSBzZWFyY2hTZXJ2aWNlLnJlc3VsdHNPYmpHZXR0ZXIoKVxuICAgIH0pXG4gIH1cblxuICAkc2NvcGUuZGVsZXRlQW5vbiA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgbGV0IGRlbGV0ZWQgPSAkc2NvcGUucmVzdWx0c09iai5yZXN1bHRzLnNwbGljZShpbmRleCwgMSlcbiAgICBjb25zb2xlLmxvZyhkZWxldGVkWzBdKTtcbiAgICBpZiAoZGVsZXRlZFswXS5kdXBlKSB7XG4gICAgICAkc2NvcGUuZHVwZUNvdW50LS1cbiAgICB9IGVsc2Uge1xuICAgICAgJHNjb3BlLnJlc3VsdHNPYmoucmVzdWx0Q291bnQtLVxuICAgIH1cbiAgfVxuXG4gICRzY29wZS5kZWxldGVEdXBlcyA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBkdXBlc1JlbW92ZWQgPSAkc2NvcGUucmVzdWx0c09iai5yZXN1bHRzLmZpbHRlcihmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgIHJldHVybiAhcmVzdWx0LmR1cGVcbiAgICB9KVxuXG4gICAgaWYgKCRzY29wZS5yZXN1bHRzT2JqLl9pZCkge1xuICAgICAgcG9zdFNlcnZpY2UuZGVsZXRlRHVwZXMoJHNjb3BlLnJlc3VsdHNPYmouX2lkLCBkdXBlc1JlbW92ZWQpLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgICAkc2NvcGUucmVzdWx0c09iaiA9IHNlYXJjaFNlcnZpY2UucmVzdWx0c09iakdldHRlcigpXG4gICAgICAgICRzY29wZS5kdXBlQ291bnQgPSAkc2NvcGUucmVzdWx0c09iai5kdXBlQ291bnQ7XG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICAkc2NvcGUucmVzdWx0c09iai5yZXN1bHRzID0gZHVwZXNSZW1vdmVkXG4gICAgICAkc2NvcGUuZHVwZUNvdW50ID0gMFxuICAgIH1cbiAgfVxuXG4gICRzY29wZS5zYXZlRGlhbG9nID0gZnVuY3Rpb24oKSB7XG4gICAgJG1kRGlhbG9nLnNob3coXG4gICAgICAkbWREaWFsb2cucHJvbXB0KClcbiAgICAgIC5jbGlja091dHNpZGVUb0Nsb3NlKHRydWUpXG4gICAgICAudGl0bGUoJ1BsZWFzZSBjaG9vc2UgYSBuYW1lIGZvciB5b3VyIHNlYXJjaC4nKVxuICAgICAgLm9wZW5Gcm9tKCcuY29udHJvbF9wYW5lbF9jb250YWluZXInKVxuICAgICAgLm9rKCdTYXZlJylcbiAgICApLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgbGV0IHNlYXJjaCA9IE9iamVjdC5hc3NpZ24oe30sICRzY29wZS5yZXN1bHRzT2JqKVxuICAgICAgZGVsZXRlIHNlYXJjaC5kdXBlQ291bnRcbiAgICAgIGRlbGV0ZSBzZWFyY2gucmVzdWx0Q291bnRcbiAgICAgIHNlYXJjaC50aXRsZSA9IHJlc3VsdHNcbiAgICAgIHNlYXJjaFNlcnZpY2Uuc2F2ZVNlYXJjaChzZWFyY2gpXG4gICAgfSlcbiAgfVxufSlcbiJdfQ==

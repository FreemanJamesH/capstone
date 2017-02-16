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

  $scope.updateSearch = function(id, $index){
    $scope.userObj.searches[$index].updating = true
    $scope.updating = true;
    searchService.updateSearch(id).then(function(results){
      $scope.userObj.searches[$index].updating = false
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
app.controller('MainController', function($scope, $http, $rootScope, searchService, stateListService, $location, authService, userService, $window, $q) {

  $scope.stateChoice = undefined;
  $scope.regionChoice = undefined;

  stateListService.retrieve().then(function() {
    $scope.stateListProto = stateListService.resultsArrGetter();
  })

  $scope.logout = function() {
    authService.logout()
    $rootScope.username = null
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
        $rootScope.username = decodedPayload.username
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
app.controller('resultsController', function($scope, $routeParams, $rootScope, $mdDialog, searchService, postService, $window) {

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

    if ($rootScope.username){
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
    } else {
      $mdDialog.show(
        $mdDialog.alert()
        .clickOutsideToClose(true)
        .title('You must be logged in to save searches.')
        .ok('Okay')
      )
    }
  }
})

},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhdXRoQ3RybC5qcyIsImRhc2hDdHJsLmpzIiwiaW5kZXguanMiLCJtYWluQ3RybC5qcyIsInJlc3VsdHNDdHJsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJhcHAuY29udHJvbGxlcignQXV0aENvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRodHRwLCAkbG9jYXRpb24sIGF1dGhTZXJ2aWNlLCB1c2VyU2VydmljZSkge1xuICAkc2NvcGUudXNlciA9IHt9O1xuICAkc2NvcGUuY3JlZGVudGlhbHNFeGlzdEVycm9yID0gZmFsc2U7XG4gICRzY29wZS5zdWJtaXR0ZWQgPSBmYWxzZTtcblxuXG4gICRzY29wZS5zaWdudXAgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuc3VibWl0dGVkID0gdHJ1ZTtcbiAgICBpZiAoJHNjb3BlLnNpZ251cEZvcm0uJHZhbGlkKSB7XG4gICAgICB1c2VyU2VydmljZS5zaWdudXAoJHNjb3BlLnVzZXIpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICBpZiAocmVzcG9uc2UubWVzc2FnZSl7XG4gICAgICAgICAgaWYgKHJlc3BvbnNlLm1lc3NhZ2UuY29kZSA9PT0gMTEwMDApe1xuICAgICAgICAgICAgJHNjb3BlLmNyZWRlbnRpYWxzRXhpc3RFcnJvciA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvJylcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICAkc2NvcGUubG9naW4gPSBmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZygnTG9naW4gZmlyZWQnKTtcbiAgICBjb25zb2xlLmxvZygnbG9naW4gdmFsaWQgZm9ybSB2YWxpZD86JywgJHNjb3BlLmxvZ2luRm9ybS4kdmFsaWQpO1xuICAgICRzY29wZS5zdWJtaXR0ZWQgPSB0cnVlO1xuICAgIHVzZXJTZXJ2aWNlLmxvZ2luKCRzY29wZS51c2VyKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgIGlmIChyZXNwb25zZS5jcmVkZW50aWFsc0ludmFsaWQpe1xuICAgICAgICAkc2NvcGUuY3JlZGVudGlhbHNJbnZhbGlkID0gdHJ1ZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy8nKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxufSlcbiIsImFwcC5jb250cm9sbGVyKCdkYXNoQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJGxvY2F0aW9uLCB1c2VyU2VydmljZSwgc2VhcmNoU2VydmljZSkge1xuXG4gICRzY29wZS51cGRhdGluZyA9IGZhbHNlO1xuXG4gIHVzZXJTZXJ2aWNlLmdldFVzZXIoKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAkc2NvcGUudXNlck9iaiA9IHJlc3VsdHNcbiAgfSlcblxuICAkc2NvcGUuZGVsZXRlU2VhcmNoID0gZnVuY3Rpb24oaWQpIHtcbiAgICBzZWFyY2hTZXJ2aWNlLmRlbGV0ZVNlYXJjaChpZCkudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICAkc2NvcGUudXNlck9iaiA9IHJlc3VsdHNcbiAgICB9KVxuICB9XG5cbiAgJHNjb3BlLnZpZXdTZWFyY2ggPSBmdW5jdGlvbihpZCkge1xuICAgICRsb2NhdGlvbi5wYXRoKGAvcmVzdWx0cy8ke2lkfWApXG4gIH1cblxuICAkc2NvcGUudXBkYXRlU2VhcmNoID0gZnVuY3Rpb24oaWQsICRpbmRleCl7XG4gICAgJHNjb3BlLnVzZXJPYmouc2VhcmNoZXNbJGluZGV4XS51cGRhdGluZyA9IHRydWVcbiAgICAkc2NvcGUudXBkYXRpbmcgPSB0cnVlO1xuICAgIHNlYXJjaFNlcnZpY2UudXBkYXRlU2VhcmNoKGlkKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpe1xuICAgICAgJHNjb3BlLnVzZXJPYmouc2VhcmNoZXNbJGluZGV4XS51cGRhdGluZyA9IGZhbHNlXG4gICAgICAkc2NvcGUudXNlck9iaiA9IHJlc3VsdHNcbiAgICB9KVxuICB9XG59KVxuIiwicmVxdWlyZSgnLi9hdXRoQ3RybC5qcycpXG5yZXF1aXJlKCcuL2Rhc2hDdHJsLmpzJylcbnJlcXVpcmUoJy4vbWFpbkN0cmwuanMnKVxucmVxdWlyZSgnLi9yZXN1bHRzQ3RybC5qcycpXG4iLCJhcHAuY29udHJvbGxlcignTWFpbkNvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRodHRwLCAkcm9vdFNjb3BlLCBzZWFyY2hTZXJ2aWNlLCBzdGF0ZUxpc3RTZXJ2aWNlLCAkbG9jYXRpb24sIGF1dGhTZXJ2aWNlLCB1c2VyU2VydmljZSwgJHdpbmRvdywgJHEpIHtcblxuICAkc2NvcGUuc3RhdGVDaG9pY2UgPSB1bmRlZmluZWQ7XG4gICRzY29wZS5yZWdpb25DaG9pY2UgPSB1bmRlZmluZWQ7XG5cbiAgc3RhdGVMaXN0U2VydmljZS5yZXRyaWV2ZSgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnN0YXRlTGlzdFByb3RvID0gc3RhdGVMaXN0U2VydmljZS5yZXN1bHRzQXJyR2V0dGVyKCk7XG4gIH0pXG5cbiAgJHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuICAgIGF1dGhTZXJ2aWNlLmxvZ291dCgpXG4gICAgJHJvb3RTY29wZS51c2VybmFtZSA9IG51bGxcbiAgfVxuXG4gICRzY29wZS5ob21lID0gZnVuY3Rpb24oKSB7XG4gICAgJGxvY2F0aW9uLnBhdGgoJy8nKVxuICB9XG5cbiAgJHNjb3BlLiR3YXRjaChmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAkd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdjcmFpZ3NibGlzcy10b2tlbicpXG4gICAgfSxcbiAgICBmdW5jdGlvbihuZXdWYWx1ZSkge1xuICAgICAgaWYgKG5ld1ZhbHVlKSB7XG4gICAgICAgIGxldCBkZWNvZGVkUGF5bG9hZCA9IEpTT04ucGFyc2UoYXRvYihuZXdWYWx1ZS5zcGxpdCgnLicpWzFdKSlcbiAgICAgICAgJHJvb3RTY29wZS51c2VybmFtZSA9IGRlY29kZWRQYXlsb2FkLnVzZXJuYW1lXG4gICAgICB9XG4gICAgfSxcbiAgICB0cnVlXG4gIClcblxuICAkc2NvcGUucmVzZXQgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuc3VibWl0dGVkID0gZmFsc2U7XG4gIH1cblxuICAkc2NvcGUuZGFzaGJvYXJkID0gZnVuY3Rpb24oKSB7XG4gICAgdXNlclNlcnZpY2UuZ2V0VXNlcigpXG4gIH1cblxuICAkc2NvcGUuc3VibWl0ID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnN1Ym1pdHRlZCA9IHRydWU7XG4gICAgaWYgKCRzY29wZS5tYXhfcHJpY2UgPCAkc2NvcGUubWluX3ByaWNlKSB7XG4gICAgICAkc2NvcGUubWF4U21hbGxlciA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICgkc2NvcGUuc3RhdGVDaG9pY2UgJiYgJHNjb3BlLnJlZ2lvbkNob2ljZSkge1xuICAgICAgICBsZXQgc2VhcmNoUGFyYW1zID0ge1xuICAgICAgICAgIHJlZ2lvbkNob2ljZTogJHNjb3BlLnJlZ2lvbkNob2ljZSxcbiAgICAgICAgICB1cGRhdGVkOiBEYXRlLm5vdygpLFxuICAgICAgICAgIHF1ZXJ5OiAkc2NvcGUucXVlcnksXG4gICAgICAgICAgc2VhcmNoX2Rpc3RhbmNlOiAkc2NvcGUuZGlzdGFuY2UsXG4gICAgICAgICAgcG9zdGFsOiAkc2NvcGUucG9zdGFsLFxuICAgICAgICAgIG1pbl9wcmljZTogJHNjb3BlLm1pbl9wcmljZSxcbiAgICAgICAgICBtYXhfcHJpY2U6ICRzY29wZS5tYXhfcHJpY2VcbiAgICAgICAgfVxuICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZVsnc2VhcmNoUGFyYW1zJ10gPSBKU09OLnN0cmluZ2lmeShzZWFyY2hQYXJhbXMpXG4gICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlWydyZWdpb25DaG9pY2UnXSA9ICRzY29wZS5yZWdpb25DaG9pY2VcbiAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy9yZXN1bHRzJylcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pXG4iLCJhcHAuY29udHJvbGxlcigncmVzdWx0c0NvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRyb3V0ZVBhcmFtcywgJHJvb3RTY29wZSwgJG1kRGlhbG9nLCBzZWFyY2hTZXJ2aWNlLCBwb3N0U2VydmljZSwgJHdpbmRvdykge1xuXG4gICRzY29wZS5sb2FkaW5nID0gdHJ1ZTtcbiAgJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gYExvYWRpbmcgeW91ciByZXN1bHRzLi4uYFxuXG4gIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAkc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBgVGhhbmsgeW91IGZvciB5b3VyIHBhdGllbmNlLi4uYFxuICAgICRzY29wZS4kYXBwbHkoKVxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICRzY29wZS5sb2FkaW5nTWVzc2FnZSA9IGBTZWFyY2hlcyByZXR1cm5pbmcgbWFueSByZXN1bHRzIGNhbiB0YWtlIHRpbWUgdG8gcHJvY2Vzcy4uLmBcbiAgICAgICRzY29wZS4kYXBwbHkoKVxuICAgIH0sIDQwMDApXG4gIH0sIDQwMDApXG5cblxuICBpZiAoISRyb3V0ZVBhcmFtcy5zZWFyY2hJZCkge1xuICAgIGxldCBzZWFyY2hPYmogPSB7fVxuICAgIHNlYXJjaE9iai5yZWdpb25DaG9pY2UgPSAkd2luZG93LmxvY2FsU3RvcmFnZS5yZWdpb25DaG9pY2VcbiAgICBzZWFyY2hPYmouc2VhcmNoUGFyYW1zID0gSlNPTi5wYXJzZSgkd2luZG93LmxvY2FsU3RvcmFnZS5zZWFyY2hQYXJhbXMpXG4gICAgc2VhcmNoU2VydmljZS5uZXdTZWFyY2goc2VhcmNoT2JqKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgICRzY29wZS5yZXN1bHRzT2JqID0gc2VhcmNoU2VydmljZS5yZXN1bHRzT2JqR2V0dGVyKCk7XG4gICAgICAkc2NvcGUuZHVwZUNvdW50ID0gJHNjb3BlLnJlc3VsdHNPYmouZHVwZUNvdW50XG4gICAgICAkc2NvcGUuZmF2Q291bnQgPSAkc2NvcGUucmVzdWx0c09iai5mYXZDb3VudFxuICAgICAgJHNjb3BlLmxvYWRpbmcgPSBmYWxzZTtcbiAgICB9KVxuICB9IGVsc2Uge1xuICAgIHNlYXJjaFNlcnZpY2Uudmlld1NlYXJjaCgkcm91dGVQYXJhbXMuc2VhcmNoSWQpLnRoZW4oZnVuY3Rpb24oKXtcbiAgICAgICRzY29wZS5yZXN1bHRzT2JqID0gc2VhcmNoU2VydmljZS5yZXN1bHRzT2JqR2V0dGVyKClcbiAgICAgICRzY29wZS5kdXBlQ291bnQgPSAkc2NvcGUucmVzdWx0c09iai5kdXBlQ291bnRcbiAgICAgICRzY29wZS5mYXZDb3VudCA9ICRzY29wZS5yZXN1bHRzT2JqLmZhdkNvdW50XG4gICAgICAkc2NvcGUubG9hZGluZyA9IGZhbHNlO1xuICAgIH0pXG4gIH1cblxuICAkc2NvcGUuZHVwZVNob3cgPSBmYWxzZVxuICAkc2NvcGUuaW1hZ2VIaWRlID0gZmFsc2VcbiAgJHNjb3BlLmZhdk9ubHkgPSBmYWxzZVxuXG4gICRzY29wZS5kZWxldGUgPSBmdW5jdGlvbihyZXN1bHRJZCkge1xuICAgIHBvc3RTZXJ2aWNlLmRlbGV0ZSgkc2NvcGUucmVzdWx0c09iai5faWQsIHJlc3VsdElkKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgIHNlYXJjaFNlcnZpY2UucmVzdWx0c09ialNldHRlcihyZXN1bHRzKVxuICAgICAgJHNjb3BlLnJlc3VsdHNPYmogPSBzZWFyY2hTZXJ2aWNlLnJlc3VsdHNPYmpHZXR0ZXIoKVxuICAgIH0pXG4gIH1cblxuICAkc2NvcGUuZmF2b3JpdGUgPSBmdW5jdGlvbihyZXN1bHRJZCl7XG4gICAgcG9zdFNlcnZpY2UuZmF2b3JpdGUoJHNjb3BlLnJlc3VsdHNPYmouX2lkLCByZXN1bHRJZCkudGhlbihmdW5jdGlvbihyZXN1bHRzKXtcbiAgICAgICRzY29wZS5yZXN1bHRzT2JqID0gc2VhcmNoU2VydmljZS5yZXN1bHRzT2JqR2V0dGVyKClcbiAgICB9KVxuICB9XG5cbiAgJHNjb3BlLnVuZmF2b3JpdGUgPSBmdW5jdGlvbihyZXN1bHRJZCl7XG4gICAgcG9zdFNlcnZpY2UudW5mYXZvcml0ZSgkc2NvcGUucmVzdWx0c09iai5faWQsIHJlc3VsdElkKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpe1xuICAgICAgJHNjb3BlLnJlc3VsdHNPYmogPSBzZWFyY2hTZXJ2aWNlLnJlc3VsdHNPYmpHZXR0ZXIoKVxuICAgIH0pXG4gIH1cblxuICAkc2NvcGUuZGVsZXRlQW5vbiA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgbGV0IGRlbGV0ZWQgPSAkc2NvcGUucmVzdWx0c09iai5yZXN1bHRzLnNwbGljZShpbmRleCwgMSlcbiAgICBjb25zb2xlLmxvZyhkZWxldGVkWzBdKTtcbiAgICBpZiAoZGVsZXRlZFswXS5kdXBlKSB7XG4gICAgICAkc2NvcGUuZHVwZUNvdW50LS1cbiAgICB9IGVsc2Uge1xuICAgICAgJHNjb3BlLnJlc3VsdHNPYmoucmVzdWx0Q291bnQtLVxuICAgIH1cbiAgfVxuXG4gICRzY29wZS5kZWxldGVEdXBlcyA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBkdXBlc1JlbW92ZWQgPSAkc2NvcGUucmVzdWx0c09iai5yZXN1bHRzLmZpbHRlcihmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgIHJldHVybiAhcmVzdWx0LmR1cGVcbiAgICB9KVxuXG4gICAgaWYgKCRzY29wZS5yZXN1bHRzT2JqLl9pZCkge1xuICAgICAgcG9zdFNlcnZpY2UuZGVsZXRlRHVwZXMoJHNjb3BlLnJlc3VsdHNPYmouX2lkLCBkdXBlc1JlbW92ZWQpLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgICAkc2NvcGUucmVzdWx0c09iaiA9IHNlYXJjaFNlcnZpY2UucmVzdWx0c09iakdldHRlcigpXG4gICAgICAgICRzY29wZS5kdXBlQ291bnQgPSAkc2NvcGUucmVzdWx0c09iai5kdXBlQ291bnQ7XG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICAkc2NvcGUucmVzdWx0c09iai5yZXN1bHRzID0gZHVwZXNSZW1vdmVkXG4gICAgICAkc2NvcGUuZHVwZUNvdW50ID0gMFxuICAgIH1cbiAgfVxuXG4gICRzY29wZS5zYXZlRGlhbG9nID0gZnVuY3Rpb24oKSB7XG5cbiAgICBpZiAoJHJvb3RTY29wZS51c2VybmFtZSl7XG4gICAgICAkbWREaWFsb2cuc2hvdyhcbiAgICAgICAgJG1kRGlhbG9nLnByb21wdCgpXG4gICAgICAgIC5jbGlja091dHNpZGVUb0Nsb3NlKHRydWUpXG4gICAgICAgIC50aXRsZSgnUGxlYXNlIGNob29zZSBhIG5hbWUgZm9yIHlvdXIgc2VhcmNoLicpXG4gICAgICAgIC5vcGVuRnJvbSgnLmNvbnRyb2xfcGFuZWxfY29udGFpbmVyJylcbiAgICAgICAgLm9rKCdTYXZlJylcbiAgICAgICkudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICAgIGxldCBzZWFyY2ggPSBPYmplY3QuYXNzaWduKHt9LCAkc2NvcGUucmVzdWx0c09iailcbiAgICAgICAgZGVsZXRlIHNlYXJjaC5kdXBlQ291bnRcbiAgICAgICAgZGVsZXRlIHNlYXJjaC5yZXN1bHRDb3VudFxuICAgICAgICBzZWFyY2gudGl0bGUgPSByZXN1bHRzXG4gICAgICAgIHNlYXJjaFNlcnZpY2Uuc2F2ZVNlYXJjaChzZWFyY2gpXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICAkbWREaWFsb2cuc2hvdyhcbiAgICAgICAgJG1kRGlhbG9nLmFsZXJ0KClcbiAgICAgICAgLmNsaWNrT3V0c2lkZVRvQ2xvc2UodHJ1ZSlcbiAgICAgICAgLnRpdGxlKCdZb3UgbXVzdCBiZSBsb2dnZWQgaW4gdG8gc2F2ZSBzZWFyY2hlcy4nKVxuICAgICAgICAub2soJ09rYXknKVxuICAgICAgKVxuICAgIH1cbiAgfVxufSlcbiJdfQ==

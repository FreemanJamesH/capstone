(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
app.controller('AuthController', function($scope, $http, $location, $window, authService, userService) {
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
    $scope.submitted = true;
    userService.login($scope.user).then(function(response){
      if (response.credentialsInvalid){
        $scope.credentialsInvalid = true
      } else {
        if ($window.localStorage.searchParams){
          let localStorageTime = Math.round(JSON.parse($window.localStorage.searchParams).updated/1000)
          let timeNow = Math.round(Date.now()/1000)
          let timeSinceLastSearch = timeNow - localStorageTime
          if (timeSinceLastSearch > 3600){
            $location.path('/')
          } else {
            $location.path('/results')
          }
        } else {
          $location.path('/')
        }
      }
    })
  }

})

},{}],2:[function(require,module,exports){
app.controller('dashController', function($scope, $location, userService, searchService) {

  $scope.updating = false;

  userService.getUser().then(function(results) {
    $scope.userObj = results
    console.log($scope.userObj);
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
    $location.path('/')
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
app.controller('resultsController', function($scope, $routeParams, $rootScope, $location, $mdDialog, searchService, postService, $window) {

  $scope.loading = true;
  $scope.loadingMessage = `Loading your results...`
  $scope.showSave = true;

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
    $scope.showSave = false;
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

  $scope.favorite = function(resultId, index){

    if (!$scope.resultsObj.title){
      $mdDialog.show(
        $mdDialog.alert()
        .clickOutsideToClose(true)
        .title('Please save your search to add favorites.')
        .ok('Okay')
      )
    } else {
      postService.favorite($scope.resultsObj._id, resultId).then(function(results){
        // $scope.resultsObj = searchService.resultsObjGetter()
        $scope.resultsObj.results[index].isFav = true;
      })
    }
  }

  $scope.unfavorite = function(resultId, index){
    postService.unfavorite($scope.resultsObj._id, resultId).then(function(results){
      $scope.resultsObj.results[index].isFav = false;
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
        searchService.saveSearch(search).then(function(results){
          console.log('results from save in controller:', results);
          $location.path(`/results/${results.id}`)
        })
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhdXRoQ3RybC5qcyIsImRhc2hDdHJsLmpzIiwiaW5kZXguanMiLCJtYWluQ3RybC5qcyIsInJlc3VsdHNDdHJsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJhcHAuY29udHJvbGxlcignQXV0aENvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRodHRwLCAkbG9jYXRpb24sICR3aW5kb3csIGF1dGhTZXJ2aWNlLCB1c2VyU2VydmljZSkge1xuICAkc2NvcGUudXNlciA9IHt9O1xuICAkc2NvcGUuY3JlZGVudGlhbHNFeGlzdEVycm9yID0gZmFsc2U7XG4gICRzY29wZS5zdWJtaXR0ZWQgPSBmYWxzZTtcblxuXG4gICRzY29wZS5zaWdudXAgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuc3VibWl0dGVkID0gdHJ1ZTtcbiAgICBpZiAoJHNjb3BlLnNpZ251cEZvcm0uJHZhbGlkKSB7XG4gICAgICB1c2VyU2VydmljZS5zaWdudXAoJHNjb3BlLnVzZXIpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICBpZiAocmVzcG9uc2UubWVzc2FnZSl7XG4gICAgICAgICAgaWYgKHJlc3BvbnNlLm1lc3NhZ2UuY29kZSA9PT0gMTEwMDApe1xuICAgICAgICAgICAgJHNjb3BlLmNyZWRlbnRpYWxzRXhpc3RFcnJvciA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvJylcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICAkc2NvcGUubG9naW4gPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuc3VibWl0dGVkID0gdHJ1ZTtcbiAgICB1c2VyU2VydmljZS5sb2dpbigkc2NvcGUudXNlcikudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICBpZiAocmVzcG9uc2UuY3JlZGVudGlhbHNJbnZhbGlkKXtcbiAgICAgICAgJHNjb3BlLmNyZWRlbnRpYWxzSW52YWxpZCA9IHRydWVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICgkd2luZG93LmxvY2FsU3RvcmFnZS5zZWFyY2hQYXJhbXMpe1xuICAgICAgICAgIGxldCBsb2NhbFN0b3JhZ2VUaW1lID0gTWF0aC5yb3VuZChKU09OLnBhcnNlKCR3aW5kb3cubG9jYWxTdG9yYWdlLnNlYXJjaFBhcmFtcykudXBkYXRlZC8xMDAwKVxuICAgICAgICAgIGxldCB0aW1lTm93ID0gTWF0aC5yb3VuZChEYXRlLm5vdygpLzEwMDApXG4gICAgICAgICAgbGV0IHRpbWVTaW5jZUxhc3RTZWFyY2ggPSB0aW1lTm93IC0gbG9jYWxTdG9yYWdlVGltZVxuICAgICAgICAgIGlmICh0aW1lU2luY2VMYXN0U2VhcmNoID4gMzYwMCl7XG4gICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnLycpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvcmVzdWx0cycpXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvJylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxufSlcbiIsImFwcC5jb250cm9sbGVyKCdkYXNoQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJGxvY2F0aW9uLCB1c2VyU2VydmljZSwgc2VhcmNoU2VydmljZSkge1xuXG4gICRzY29wZS51cGRhdGluZyA9IGZhbHNlO1xuXG4gIHVzZXJTZXJ2aWNlLmdldFVzZXIoKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAkc2NvcGUudXNlck9iaiA9IHJlc3VsdHNcbiAgICBjb25zb2xlLmxvZygkc2NvcGUudXNlck9iaik7XG4gIH0pXG5cbiAgJHNjb3BlLmRlbGV0ZVNlYXJjaCA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgc2VhcmNoU2VydmljZS5kZWxldGVTZWFyY2goaWQpLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgJHNjb3BlLnVzZXJPYmogPSByZXN1bHRzXG4gICAgfSlcbiAgfVxuXG4gICRzY29wZS52aWV3U2VhcmNoID0gZnVuY3Rpb24oaWQpIHtcbiAgICAkbG9jYXRpb24ucGF0aChgL3Jlc3VsdHMvJHtpZH1gKVxuICB9XG5cbiAgJHNjb3BlLnVwZGF0ZVNlYXJjaCA9IGZ1bmN0aW9uKGlkLCAkaW5kZXgpe1xuICAgICRzY29wZS51c2VyT2JqLnNlYXJjaGVzWyRpbmRleF0udXBkYXRpbmcgPSB0cnVlXG4gICAgJHNjb3BlLnVwZGF0aW5nID0gdHJ1ZTtcbiAgICBzZWFyY2hTZXJ2aWNlLnVwZGF0ZVNlYXJjaChpZCkudGhlbihmdW5jdGlvbihyZXN1bHRzKXtcbiAgICAgICRzY29wZS51c2VyT2JqLnNlYXJjaGVzWyRpbmRleF0udXBkYXRpbmcgPSBmYWxzZVxuICAgICAgJHNjb3BlLnVzZXJPYmogPSByZXN1bHRzXG4gICAgfSlcbiAgfVxufSlcbiIsInJlcXVpcmUoJy4vYXV0aEN0cmwuanMnKVxucmVxdWlyZSgnLi9kYXNoQ3RybC5qcycpXG5yZXF1aXJlKCcuL21haW5DdHJsLmpzJylcbnJlcXVpcmUoJy4vcmVzdWx0c0N0cmwuanMnKVxuIiwiYXBwLmNvbnRyb2xsZXIoJ01haW5Db250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkaHR0cCwgJHJvb3RTY29wZSwgc2VhcmNoU2VydmljZSwgc3RhdGVMaXN0U2VydmljZSwgJGxvY2F0aW9uLCBhdXRoU2VydmljZSwgdXNlclNlcnZpY2UsICR3aW5kb3csICRxKSB7XG5cbiAgJHNjb3BlLnN0YXRlQ2hvaWNlID0gdW5kZWZpbmVkO1xuICAkc2NvcGUucmVnaW9uQ2hvaWNlID0gdW5kZWZpbmVkO1xuXG4gIHN0YXRlTGlzdFNlcnZpY2UucmV0cmlldmUoKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5zdGF0ZUxpc3RQcm90byA9IHN0YXRlTGlzdFNlcnZpY2UucmVzdWx0c0FyckdldHRlcigpO1xuICB9KVxuXG4gICRzY29wZS5sb2dvdXQgPSBmdW5jdGlvbigpIHtcbiAgICBhdXRoU2VydmljZS5sb2dvdXQoKVxuICAgICRyb290U2NvcGUudXNlcm5hbWUgPSBudWxsXG4gICAgJGxvY2F0aW9uLnBhdGgoJy8nKVxuICB9XG5cbiAgJHNjb3BlLmhvbWUgPSBmdW5jdGlvbigpIHtcbiAgICAkbG9jYXRpb24ucGF0aCgnLycpXG4gIH1cblxuICAkc2NvcGUuJHdhdGNoKGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICR3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2NyYWlnc2JsaXNzLXRva2VuJylcbiAgICB9LFxuICAgIGZ1bmN0aW9uKG5ld1ZhbHVlKSB7XG4gICAgICBpZiAobmV3VmFsdWUpIHtcbiAgICAgICAgbGV0IGRlY29kZWRQYXlsb2FkID0gSlNPTi5wYXJzZShhdG9iKG5ld1ZhbHVlLnNwbGl0KCcuJylbMV0pKVxuICAgICAgICAkcm9vdFNjb3BlLnVzZXJuYW1lID0gZGVjb2RlZFBheWxvYWQudXNlcm5hbWVcbiAgICAgIH1cbiAgICB9LFxuICAgIHRydWVcbiAgKVxuXG4gICRzY29wZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5zdWJtaXR0ZWQgPSBmYWxzZTtcbiAgfVxuXG4gICRzY29wZS5kYXNoYm9hcmQgPSBmdW5jdGlvbigpIHtcbiAgICB1c2VyU2VydmljZS5nZXRVc2VyKClcbiAgfVxuXG4gICRzY29wZS5zdWJtaXQgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuc3VibWl0dGVkID0gdHJ1ZTtcbiAgICBpZiAoJHNjb3BlLm1heF9wcmljZSA8ICRzY29wZS5taW5fcHJpY2UpIHtcbiAgICAgICRzY29wZS5tYXhTbWFsbGVyID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCRzY29wZS5zdGF0ZUNob2ljZSAmJiAkc2NvcGUucmVnaW9uQ2hvaWNlKSB7XG4gICAgICAgIGxldCBzZWFyY2hQYXJhbXMgPSB7XG4gICAgICAgICAgcmVnaW9uQ2hvaWNlOiAkc2NvcGUucmVnaW9uQ2hvaWNlLFxuICAgICAgICAgIHVwZGF0ZWQ6IERhdGUubm93KCksXG4gICAgICAgICAgcXVlcnk6ICRzY29wZS5xdWVyeSxcbiAgICAgICAgICBzZWFyY2hfZGlzdGFuY2U6ICRzY29wZS5kaXN0YW5jZSxcbiAgICAgICAgICBwb3N0YWw6ICRzY29wZS5wb3N0YWwsXG4gICAgICAgICAgbWluX3ByaWNlOiAkc2NvcGUubWluX3ByaWNlLFxuICAgICAgICAgIG1heF9wcmljZTogJHNjb3BlLm1heF9wcmljZVxuICAgICAgICB9XG4gICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlWydzZWFyY2hQYXJhbXMnXSA9IEpTT04uc3RyaW5naWZ5KHNlYXJjaFBhcmFtcylcbiAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2VbJ3JlZ2lvbkNob2ljZSddID0gJHNjb3BlLnJlZ2lvbkNob2ljZVxuICAgICAgICAkbG9jYXRpb24ucGF0aCgnL3Jlc3VsdHMnKVxuICAgICAgfVxuICAgIH1cbiAgfVxufSlcbiIsImFwcC5jb250cm9sbGVyKCdyZXN1bHRzQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJHJvdXRlUGFyYW1zLCAkcm9vdFNjb3BlLCAkbG9jYXRpb24sICRtZERpYWxvZywgc2VhcmNoU2VydmljZSwgcG9zdFNlcnZpY2UsICR3aW5kb3cpIHtcblxuICAkc2NvcGUubG9hZGluZyA9IHRydWU7XG4gICRzY29wZS5sb2FkaW5nTWVzc2FnZSA9IGBMb2FkaW5nIHlvdXIgcmVzdWx0cy4uLmBcbiAgJHNjb3BlLnNob3dTYXZlID0gdHJ1ZTtcblxuICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gYFRoYW5rIHlvdSBmb3IgeW91ciBwYXRpZW5jZS4uLmBcbiAgICAkc2NvcGUuJGFwcGx5KClcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAkc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBgU2VhcmNoZXMgcmV0dXJuaW5nIG1hbnkgcmVzdWx0cyBjYW4gdGFrZSB0aW1lIHRvIHByb2Nlc3MuLi5gXG4gICAgICAkc2NvcGUuJGFwcGx5KClcbiAgICB9LCA0MDAwKVxuICB9LCA0MDAwKVxuXG5cbiAgaWYgKCEkcm91dGVQYXJhbXMuc2VhcmNoSWQpIHtcbiAgICBsZXQgc2VhcmNoT2JqID0ge31cbiAgICBzZWFyY2hPYmoucmVnaW9uQ2hvaWNlID0gJHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVnaW9uQ2hvaWNlXG4gICAgc2VhcmNoT2JqLnNlYXJjaFBhcmFtcyA9IEpTT04ucGFyc2UoJHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2VhcmNoUGFyYW1zKVxuICAgIHNlYXJjaFNlcnZpY2UubmV3U2VhcmNoKHNlYXJjaE9iaikudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICAkc2NvcGUucmVzdWx0c09iaiA9IHNlYXJjaFNlcnZpY2UucmVzdWx0c09iakdldHRlcigpO1xuICAgICAgJHNjb3BlLmR1cGVDb3VudCA9ICRzY29wZS5yZXN1bHRzT2JqLmR1cGVDb3VudFxuICAgICAgJHNjb3BlLmZhdkNvdW50ID0gJHNjb3BlLnJlc3VsdHNPYmouZmF2Q291bnRcbiAgICAgICRzY29wZS5sb2FkaW5nID0gZmFsc2U7XG4gICAgfSlcbiAgfSBlbHNlIHtcbiAgICAkc2NvcGUuc2hvd1NhdmUgPSBmYWxzZTtcbiAgICBzZWFyY2hTZXJ2aWNlLnZpZXdTZWFyY2goJHJvdXRlUGFyYW1zLnNlYXJjaElkKS50aGVuKGZ1bmN0aW9uKCl7XG4gICAgICAkc2NvcGUucmVzdWx0c09iaiA9IHNlYXJjaFNlcnZpY2UucmVzdWx0c09iakdldHRlcigpXG4gICAgICAkc2NvcGUuZHVwZUNvdW50ID0gJHNjb3BlLnJlc3VsdHNPYmouZHVwZUNvdW50XG4gICAgICAkc2NvcGUuZmF2Q291bnQgPSAkc2NvcGUucmVzdWx0c09iai5mYXZDb3VudFxuICAgICAgJHNjb3BlLmxvYWRpbmcgPSBmYWxzZTtcbiAgICB9KVxuICB9XG5cbiAgJHNjb3BlLmR1cGVTaG93ID0gZmFsc2VcbiAgJHNjb3BlLmltYWdlSGlkZSA9IGZhbHNlXG4gICRzY29wZS5mYXZPbmx5ID0gZmFsc2VcblxuICAkc2NvcGUuZGVsZXRlID0gZnVuY3Rpb24ocmVzdWx0SWQpIHtcbiAgICBwb3N0U2VydmljZS5kZWxldGUoJHNjb3BlLnJlc3VsdHNPYmouX2lkLCByZXN1bHRJZCkudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICBzZWFyY2hTZXJ2aWNlLnJlc3VsdHNPYmpTZXR0ZXIocmVzdWx0cylcbiAgICAgICRzY29wZS5yZXN1bHRzT2JqID0gc2VhcmNoU2VydmljZS5yZXN1bHRzT2JqR2V0dGVyKClcbiAgICB9KVxuICB9XG5cbiAgJHNjb3BlLmZhdm9yaXRlID0gZnVuY3Rpb24ocmVzdWx0SWQsIGluZGV4KXtcblxuICAgIGlmICghJHNjb3BlLnJlc3VsdHNPYmoudGl0bGUpe1xuICAgICAgJG1kRGlhbG9nLnNob3coXG4gICAgICAgICRtZERpYWxvZy5hbGVydCgpXG4gICAgICAgIC5jbGlja091dHNpZGVUb0Nsb3NlKHRydWUpXG4gICAgICAgIC50aXRsZSgnUGxlYXNlIHNhdmUgeW91ciBzZWFyY2ggdG8gYWRkIGZhdm9yaXRlcy4nKVxuICAgICAgICAub2soJ09rYXknKVxuICAgICAgKVxuICAgIH0gZWxzZSB7XG4gICAgICBwb3N0U2VydmljZS5mYXZvcml0ZSgkc2NvcGUucmVzdWx0c09iai5faWQsIHJlc3VsdElkKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpe1xuICAgICAgICAvLyAkc2NvcGUucmVzdWx0c09iaiA9IHNlYXJjaFNlcnZpY2UucmVzdWx0c09iakdldHRlcigpXG4gICAgICAgICRzY29wZS5yZXN1bHRzT2JqLnJlc3VsdHNbaW5kZXhdLmlzRmF2ID0gdHJ1ZTtcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgJHNjb3BlLnVuZmF2b3JpdGUgPSBmdW5jdGlvbihyZXN1bHRJZCwgaW5kZXgpe1xuICAgIHBvc3RTZXJ2aWNlLnVuZmF2b3JpdGUoJHNjb3BlLnJlc3VsdHNPYmouX2lkLCByZXN1bHRJZCkudGhlbihmdW5jdGlvbihyZXN1bHRzKXtcbiAgICAgICRzY29wZS5yZXN1bHRzT2JqLnJlc3VsdHNbaW5kZXhdLmlzRmF2ID0gZmFsc2U7XG4gICAgfSlcbiAgfVxuXG4gICRzY29wZS5kZWxldGVBbm9uID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICBsZXQgZGVsZXRlZCA9ICRzY29wZS5yZXN1bHRzT2JqLnJlc3VsdHMuc3BsaWNlKGluZGV4LCAxKVxuICAgIGNvbnNvbGUubG9nKGRlbGV0ZWRbMF0pO1xuICAgIGlmIChkZWxldGVkWzBdLmR1cGUpIHtcbiAgICAgICRzY29wZS5kdXBlQ291bnQtLVxuICAgIH0gZWxzZSB7XG4gICAgICAkc2NvcGUucmVzdWx0c09iai5yZXN1bHRDb3VudC0tXG4gICAgfVxuICB9XG5cbiAgJHNjb3BlLmRlbGV0ZUR1cGVzID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IGR1cGVzUmVtb3ZlZCA9ICRzY29wZS5yZXN1bHRzT2JqLnJlc3VsdHMuZmlsdGVyKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgcmV0dXJuICFyZXN1bHQuZHVwZVxuICAgIH0pXG5cbiAgICBpZiAoJHNjb3BlLnJlc3VsdHNPYmouX2lkKSB7XG4gICAgICBwb3N0U2VydmljZS5kZWxldGVEdXBlcygkc2NvcGUucmVzdWx0c09iai5faWQsIGR1cGVzUmVtb3ZlZCkudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICAgICRzY29wZS5yZXN1bHRzT2JqID0gc2VhcmNoU2VydmljZS5yZXN1bHRzT2JqR2V0dGVyKClcbiAgICAgICAgJHNjb3BlLmR1cGVDb3VudCA9ICRzY29wZS5yZXN1bHRzT2JqLmR1cGVDb3VudDtcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgICRzY29wZS5yZXN1bHRzT2JqLnJlc3VsdHMgPSBkdXBlc1JlbW92ZWRcbiAgICAgICRzY29wZS5kdXBlQ291bnQgPSAwXG4gICAgfVxuICB9XG5cbiAgJHNjb3BlLnNhdmVEaWFsb2cgPSBmdW5jdGlvbigpIHtcblxuICAgIGlmICgkcm9vdFNjb3BlLnVzZXJuYW1lKXtcbiAgICAgICRtZERpYWxvZy5zaG93KFxuICAgICAgICAkbWREaWFsb2cucHJvbXB0KClcbiAgICAgICAgLmNsaWNrT3V0c2lkZVRvQ2xvc2UodHJ1ZSlcbiAgICAgICAgLnRpdGxlKCdQbGVhc2UgY2hvb3NlIGEgbmFtZSBmb3IgeW91ciBzZWFyY2guJylcbiAgICAgICAgLm9wZW5Gcm9tKCcuY29udHJvbF9wYW5lbF9jb250YWluZXInKVxuICAgICAgICAub2soJ1NhdmUnKVxuICAgICAgKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgICAgbGV0IHNlYXJjaCA9IE9iamVjdC5hc3NpZ24oe30sICRzY29wZS5yZXN1bHRzT2JqKVxuICAgICAgICBkZWxldGUgc2VhcmNoLmR1cGVDb3VudFxuICAgICAgICBkZWxldGUgc2VhcmNoLnJlc3VsdENvdW50XG4gICAgICAgIHNlYXJjaC50aXRsZSA9IHJlc3VsdHNcbiAgICAgICAgc2VhcmNoU2VydmljZS5zYXZlU2VhcmNoKHNlYXJjaCkudGhlbihmdW5jdGlvbihyZXN1bHRzKXtcbiAgICAgICAgICBjb25zb2xlLmxvZygncmVzdWx0cyBmcm9tIHNhdmUgaW4gY29udHJvbGxlcjonLCByZXN1bHRzKTtcbiAgICAgICAgICAkbG9jYXRpb24ucGF0aChgL3Jlc3VsdHMvJHtyZXN1bHRzLmlkfWApXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICAkbWREaWFsb2cuc2hvdyhcbiAgICAgICAgJG1kRGlhbG9nLmFsZXJ0KClcbiAgICAgICAgLmNsaWNrT3V0c2lkZVRvQ2xvc2UodHJ1ZSlcbiAgICAgICAgLnRpdGxlKCdZb3UgbXVzdCBiZSBsb2dnZWQgaW4gdG8gc2F2ZSBzZWFyY2hlcy4nKVxuICAgICAgICAub2soJ09rYXknKVxuICAgICAgKVxuICAgIH1cbiAgfVxufSlcbiJdfQ==

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

  setTimeout(function() {
    $scope.loadingMessage = `Thank you for your patience...`
    $scope.$apply()
    setTimeout(function() {
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
    searchService.viewSearch($routeParams.searchId).then(function() {
      $scope.resultsObj = searchService.resultsObjGetter()
      $scope.dupeCount = $scope.resultsObj.dupeCount
      $scope.favCount = $scope.resultsObj.favCount
      $scope.loading = false;
    })
  }

  $scope.dupeShow = false
  $scope.imageHide = false
  $scope.favOnly = false

  $scope.delete = function(resultId, index) {
    postService.delete($scope.resultsObj._id, resultId).then(function(results) {


      let deleted = $scope.resultsObj.results.splice(index,1)
      console.log('deleted:', deleted)
      if (deleted[0].isFav){
        console.log('decrementing favCount from this:', $scope.favCount);
        $scope.favCount--
        console.log('to this:', $scope.favCount);
      }
      if (deleted[0].dupe) {
        $scope.dupeCount--
      } else {
        $scope.resultsObj.resultCount--
      }


        // searchService.resultsObjSetter(results)
        // $scope.resultsObj = searchService.resultsObjGetter()


    })
  }

  $scope.favorite = function(resultId, index) {

    if (!$scope.resultsObj.title) {
      $mdDialog.show(
        $mdDialog.alert()
        .clickOutsideToClose(true)
        .title('Please save your search to add favorites.')
        .ok('Okay')
      )
    } else {
      postService.favorite($scope.resultsObj._id, resultId).then(function(results) {
        // $scope.resultsObj = searchService.resultsObjGetter()
        $scope.resultsObj.results[index].isFav = true;
        $scope.favCount++
      })
    }
  }

  $scope.unfavorite = function(resultId, index) {
    postService.unfavorite($scope.resultsObj._id, resultId).then(function(results) {
      $scope.resultsObj.results[index].isFav = false;
      $scope.favCount--
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

    if ($rootScope.username) {
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
        searchService.saveSearch(search).then(function(results) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhdXRoQ3RybC5qcyIsImRhc2hDdHJsLmpzIiwiaW5kZXguanMiLCJtYWluQ3RybC5qcyIsInJlc3VsdHNDdHJsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiYXBwLmNvbnRyb2xsZXIoJ0F1dGhDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkaHR0cCwgJGxvY2F0aW9uLCAkd2luZG93LCBhdXRoU2VydmljZSwgdXNlclNlcnZpY2UpIHtcbiAgJHNjb3BlLnVzZXIgPSB7fTtcbiAgJHNjb3BlLmNyZWRlbnRpYWxzRXhpc3RFcnJvciA9IGZhbHNlO1xuICAkc2NvcGUuc3VibWl0dGVkID0gZmFsc2U7XG5cblxuICAkc2NvcGUuc2lnbnVwID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnN1Ym1pdHRlZCA9IHRydWU7XG4gICAgaWYgKCRzY29wZS5zaWdudXBGb3JtLiR2YWxpZCkge1xuICAgICAgdXNlclNlcnZpY2Uuc2lnbnVwKCRzY29wZS51c2VyKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgaWYgKHJlc3BvbnNlLm1lc3NhZ2Upe1xuICAgICAgICAgIGlmIChyZXNwb25zZS5tZXNzYWdlLmNvZGUgPT09IDExMDAwKXtcbiAgICAgICAgICAgICRzY29wZS5jcmVkZW50aWFsc0V4aXN0RXJyb3IgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnLycpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgJHNjb3BlLmxvZ2luID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnN1Ym1pdHRlZCA9IHRydWU7XG4gICAgdXNlclNlcnZpY2UubG9naW4oJHNjb3BlLnVzZXIpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgaWYgKHJlc3BvbnNlLmNyZWRlbnRpYWxzSW52YWxpZCl7XG4gICAgICAgICRzY29wZS5jcmVkZW50aWFsc0ludmFsaWQgPSB0cnVlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoJHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2VhcmNoUGFyYW1zKXtcbiAgICAgICAgICBsZXQgbG9jYWxTdG9yYWdlVGltZSA9IE1hdGgucm91bmQoSlNPTi5wYXJzZSgkd2luZG93LmxvY2FsU3RvcmFnZS5zZWFyY2hQYXJhbXMpLnVwZGF0ZWQvMTAwMClcbiAgICAgICAgICBsZXQgdGltZU5vdyA9IE1hdGgucm91bmQoRGF0ZS5ub3coKS8xMDAwKVxuICAgICAgICAgIGxldCB0aW1lU2luY2VMYXN0U2VhcmNoID0gdGltZU5vdyAtIGxvY2FsU3RvcmFnZVRpbWVcbiAgICAgICAgICBpZiAodGltZVNpbmNlTGFzdFNlYXJjaCA+IDM2MDApe1xuICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy8nKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnL3Jlc3VsdHMnKVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnLycpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbn0pXG4iLCJhcHAuY29udHJvbGxlcignZGFzaENvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRsb2NhdGlvbiwgdXNlclNlcnZpY2UsIHNlYXJjaFNlcnZpY2UpIHtcblxuICAkc2NvcGUudXBkYXRpbmcgPSBmYWxzZTtcblxuICB1c2VyU2VydmljZS5nZXRVc2VyKCkudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgJHNjb3BlLnVzZXJPYmogPSByZXN1bHRzXG4gICAgY29uc29sZS5sb2coJHNjb3BlLnVzZXJPYmopO1xuICB9KVxuXG4gICRzY29wZS5kZWxldGVTZWFyY2ggPSBmdW5jdGlvbihpZCkge1xuICAgIHNlYXJjaFNlcnZpY2UuZGVsZXRlU2VhcmNoKGlkKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgICRzY29wZS51c2VyT2JqID0gcmVzdWx0c1xuICAgIH0pXG4gIH1cblxuICAkc2NvcGUudmlld1NlYXJjaCA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgJGxvY2F0aW9uLnBhdGgoYC9yZXN1bHRzLyR7aWR9YClcbiAgfVxuXG4gICRzY29wZS51cGRhdGVTZWFyY2ggPSBmdW5jdGlvbihpZCwgJGluZGV4KXtcbiAgICAkc2NvcGUudXNlck9iai5zZWFyY2hlc1skaW5kZXhdLnVwZGF0aW5nID0gdHJ1ZVxuICAgICRzY29wZS51cGRhdGluZyA9IHRydWU7XG4gICAgc2VhcmNoU2VydmljZS51cGRhdGVTZWFyY2goaWQpLnRoZW4oZnVuY3Rpb24ocmVzdWx0cyl7XG4gICAgICAkc2NvcGUudXNlck9iai5zZWFyY2hlc1skaW5kZXhdLnVwZGF0aW5nID0gZmFsc2VcbiAgICAgICRzY29wZS51c2VyT2JqID0gcmVzdWx0c1xuICAgIH0pXG4gIH1cbn0pXG4iLCJyZXF1aXJlKCcuL2F1dGhDdHJsLmpzJylcbnJlcXVpcmUoJy4vZGFzaEN0cmwuanMnKVxucmVxdWlyZSgnLi9tYWluQ3RybC5qcycpXG5yZXF1aXJlKCcuL3Jlc3VsdHNDdHJsLmpzJylcbiIsImFwcC5jb250cm9sbGVyKCdNYWluQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJGh0dHAsICRyb290U2NvcGUsIHNlYXJjaFNlcnZpY2UsIHN0YXRlTGlzdFNlcnZpY2UsICRsb2NhdGlvbiwgYXV0aFNlcnZpY2UsIHVzZXJTZXJ2aWNlLCAkd2luZG93LCAkcSkge1xuXG4gICRzY29wZS5zdGF0ZUNob2ljZSA9IHVuZGVmaW5lZDtcbiAgJHNjb3BlLnJlZ2lvbkNob2ljZSA9IHVuZGVmaW5lZDtcblxuICBzdGF0ZUxpc3RTZXJ2aWNlLnJldHJpZXZlKCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuc3RhdGVMaXN0UHJvdG8gPSBzdGF0ZUxpc3RTZXJ2aWNlLnJlc3VsdHNBcnJHZXR0ZXIoKTtcbiAgfSlcblxuICAkc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgYXV0aFNlcnZpY2UubG9nb3V0KClcbiAgICAkcm9vdFNjb3BlLnVzZXJuYW1lID0gbnVsbFxuICAgICRsb2NhdGlvbi5wYXRoKCcvJylcbiAgfVxuXG4gICRzY29wZS5ob21lID0gZnVuY3Rpb24oKSB7XG4gICAgJGxvY2F0aW9uLnBhdGgoJy8nKVxuICB9XG5cbiAgJHNjb3BlLiR3YXRjaChmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAkd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdjcmFpZ3NibGlzcy10b2tlbicpXG4gICAgfSxcbiAgICBmdW5jdGlvbihuZXdWYWx1ZSkge1xuICAgICAgaWYgKG5ld1ZhbHVlKSB7XG4gICAgICAgIGxldCBkZWNvZGVkUGF5bG9hZCA9IEpTT04ucGFyc2UoYXRvYihuZXdWYWx1ZS5zcGxpdCgnLicpWzFdKSlcbiAgICAgICAgJHJvb3RTY29wZS51c2VybmFtZSA9IGRlY29kZWRQYXlsb2FkLnVzZXJuYW1lXG4gICAgICB9XG4gICAgfSxcbiAgICB0cnVlXG4gIClcblxuICAkc2NvcGUucmVzZXQgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuc3VibWl0dGVkID0gZmFsc2U7XG4gIH1cblxuICAkc2NvcGUuZGFzaGJvYXJkID0gZnVuY3Rpb24oKSB7XG4gICAgdXNlclNlcnZpY2UuZ2V0VXNlcigpXG4gIH1cblxuICAkc2NvcGUuc3VibWl0ID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnN1Ym1pdHRlZCA9IHRydWU7XG4gICAgaWYgKCRzY29wZS5tYXhfcHJpY2UgPCAkc2NvcGUubWluX3ByaWNlKSB7XG4gICAgICAkc2NvcGUubWF4U21hbGxlciA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICgkc2NvcGUuc3RhdGVDaG9pY2UgJiYgJHNjb3BlLnJlZ2lvbkNob2ljZSkge1xuICAgICAgICBsZXQgc2VhcmNoUGFyYW1zID0ge1xuICAgICAgICAgIHJlZ2lvbkNob2ljZTogJHNjb3BlLnJlZ2lvbkNob2ljZSxcbiAgICAgICAgICB1cGRhdGVkOiBEYXRlLm5vdygpLFxuICAgICAgICAgIHF1ZXJ5OiAkc2NvcGUucXVlcnksXG4gICAgICAgICAgc2VhcmNoX2Rpc3RhbmNlOiAkc2NvcGUuZGlzdGFuY2UsXG4gICAgICAgICAgcG9zdGFsOiAkc2NvcGUucG9zdGFsLFxuICAgICAgICAgIG1pbl9wcmljZTogJHNjb3BlLm1pbl9wcmljZSxcbiAgICAgICAgICBtYXhfcHJpY2U6ICRzY29wZS5tYXhfcHJpY2VcbiAgICAgICAgfVxuICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZVsnc2VhcmNoUGFyYW1zJ10gPSBKU09OLnN0cmluZ2lmeShzZWFyY2hQYXJhbXMpXG4gICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlWydyZWdpb25DaG9pY2UnXSA9ICRzY29wZS5yZWdpb25DaG9pY2VcbiAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy9yZXN1bHRzJylcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pXG4iLCJhcHAuY29udHJvbGxlcigncmVzdWx0c0NvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRyb3V0ZVBhcmFtcywgJHJvb3RTY29wZSwgJGxvY2F0aW9uLCAkbWREaWFsb2csIHNlYXJjaFNlcnZpY2UsIHBvc3RTZXJ2aWNlLCAkd2luZG93KSB7XG5cbiAgJHNjb3BlLmxvYWRpbmcgPSB0cnVlO1xuICAkc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBgTG9hZGluZyB5b3VyIHJlc3VsdHMuLi5gXG4gICRzY29wZS5zaG93U2F2ZSA9IHRydWU7XG5cbiAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBgVGhhbmsgeW91IGZvciB5b3VyIHBhdGllbmNlLi4uYFxuICAgICRzY29wZS4kYXBwbHkoKVxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBgU2VhcmNoZXMgcmV0dXJuaW5nIG1hbnkgcmVzdWx0cyBjYW4gdGFrZSB0aW1lIHRvIHByb2Nlc3MuLi5gXG4gICAgICAkc2NvcGUuJGFwcGx5KClcbiAgICB9LCA0MDAwKVxuICB9LCA0MDAwKVxuXG5cbiAgaWYgKCEkcm91dGVQYXJhbXMuc2VhcmNoSWQpIHtcbiAgICBsZXQgc2VhcmNoT2JqID0ge31cbiAgICBzZWFyY2hPYmoucmVnaW9uQ2hvaWNlID0gJHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVnaW9uQ2hvaWNlXG4gICAgc2VhcmNoT2JqLnNlYXJjaFBhcmFtcyA9IEpTT04ucGFyc2UoJHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2VhcmNoUGFyYW1zKVxuICAgIHNlYXJjaFNlcnZpY2UubmV3U2VhcmNoKHNlYXJjaE9iaikudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICAkc2NvcGUucmVzdWx0c09iaiA9IHNlYXJjaFNlcnZpY2UucmVzdWx0c09iakdldHRlcigpO1xuICAgICAgJHNjb3BlLmR1cGVDb3VudCA9ICRzY29wZS5yZXN1bHRzT2JqLmR1cGVDb3VudFxuICAgICAgJHNjb3BlLmZhdkNvdW50ID0gJHNjb3BlLnJlc3VsdHNPYmouZmF2Q291bnRcbiAgICAgICRzY29wZS5sb2FkaW5nID0gZmFsc2U7XG4gICAgfSlcbiAgfSBlbHNlIHtcbiAgICAkc2NvcGUuc2hvd1NhdmUgPSBmYWxzZTtcbiAgICBzZWFyY2hTZXJ2aWNlLnZpZXdTZWFyY2goJHJvdXRlUGFyYW1zLnNlYXJjaElkKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLnJlc3VsdHNPYmogPSBzZWFyY2hTZXJ2aWNlLnJlc3VsdHNPYmpHZXR0ZXIoKVxuICAgICAgJHNjb3BlLmR1cGVDb3VudCA9ICRzY29wZS5yZXN1bHRzT2JqLmR1cGVDb3VudFxuICAgICAgJHNjb3BlLmZhdkNvdW50ID0gJHNjb3BlLnJlc3VsdHNPYmouZmF2Q291bnRcbiAgICAgICRzY29wZS5sb2FkaW5nID0gZmFsc2U7XG4gICAgfSlcbiAgfVxuXG4gICRzY29wZS5kdXBlU2hvdyA9IGZhbHNlXG4gICRzY29wZS5pbWFnZUhpZGUgPSBmYWxzZVxuICAkc2NvcGUuZmF2T25seSA9IGZhbHNlXG5cbiAgJHNjb3BlLmRlbGV0ZSA9IGZ1bmN0aW9uKHJlc3VsdElkLCBpbmRleCkge1xuICAgIHBvc3RTZXJ2aWNlLmRlbGV0ZSgkc2NvcGUucmVzdWx0c09iai5faWQsIHJlc3VsdElkKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcblxuXG4gICAgICBsZXQgZGVsZXRlZCA9ICRzY29wZS5yZXN1bHRzT2JqLnJlc3VsdHMuc3BsaWNlKGluZGV4LDEpXG4gICAgICBjb25zb2xlLmxvZygnZGVsZXRlZDonLCBkZWxldGVkKVxuICAgICAgaWYgKGRlbGV0ZWRbMF0uaXNGYXYpe1xuICAgICAgICBjb25zb2xlLmxvZygnZGVjcmVtZW50aW5nIGZhdkNvdW50IGZyb20gdGhpczonLCAkc2NvcGUuZmF2Q291bnQpO1xuICAgICAgICAkc2NvcGUuZmF2Q291bnQtLVxuICAgICAgICBjb25zb2xlLmxvZygndG8gdGhpczonLCAkc2NvcGUuZmF2Q291bnQpO1xuICAgICAgfVxuICAgICAgaWYgKGRlbGV0ZWRbMF0uZHVwZSkge1xuICAgICAgICAkc2NvcGUuZHVwZUNvdW50LS1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICRzY29wZS5yZXN1bHRzT2JqLnJlc3VsdENvdW50LS1cbiAgICAgIH1cblxuXG4gICAgICAgIC8vIHNlYXJjaFNlcnZpY2UucmVzdWx0c09ialNldHRlcihyZXN1bHRzKVxuICAgICAgICAvLyAkc2NvcGUucmVzdWx0c09iaiA9IHNlYXJjaFNlcnZpY2UucmVzdWx0c09iakdldHRlcigpXG5cblxuICAgIH0pXG4gIH1cblxuICAkc2NvcGUuZmF2b3JpdGUgPSBmdW5jdGlvbihyZXN1bHRJZCwgaW5kZXgpIHtcblxuICAgIGlmICghJHNjb3BlLnJlc3VsdHNPYmoudGl0bGUpIHtcbiAgICAgICRtZERpYWxvZy5zaG93KFxuICAgICAgICAkbWREaWFsb2cuYWxlcnQoKVxuICAgICAgICAuY2xpY2tPdXRzaWRlVG9DbG9zZSh0cnVlKVxuICAgICAgICAudGl0bGUoJ1BsZWFzZSBzYXZlIHlvdXIgc2VhcmNoIHRvIGFkZCBmYXZvcml0ZXMuJylcbiAgICAgICAgLm9rKCdPa2F5JylcbiAgICAgIClcbiAgICB9IGVsc2Uge1xuICAgICAgcG9zdFNlcnZpY2UuZmF2b3JpdGUoJHNjb3BlLnJlc3VsdHNPYmouX2lkLCByZXN1bHRJZCkudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICAgIC8vICRzY29wZS5yZXN1bHRzT2JqID0gc2VhcmNoU2VydmljZS5yZXN1bHRzT2JqR2V0dGVyKClcbiAgICAgICAgJHNjb3BlLnJlc3VsdHNPYmoucmVzdWx0c1tpbmRleF0uaXNGYXYgPSB0cnVlO1xuICAgICAgICAkc2NvcGUuZmF2Q291bnQrK1xuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICAkc2NvcGUudW5mYXZvcml0ZSA9IGZ1bmN0aW9uKHJlc3VsdElkLCBpbmRleCkge1xuICAgIHBvc3RTZXJ2aWNlLnVuZmF2b3JpdGUoJHNjb3BlLnJlc3VsdHNPYmouX2lkLCByZXN1bHRJZCkudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICAkc2NvcGUucmVzdWx0c09iai5yZXN1bHRzW2luZGV4XS5pc0ZhdiA9IGZhbHNlO1xuICAgICAgJHNjb3BlLmZhdkNvdW50LS1cbiAgICB9KVxuICB9XG5cbiAgJHNjb3BlLmRlbGV0ZUFub24gPSBmdW5jdGlvbihpbmRleCkge1xuICAgIGxldCBkZWxldGVkID0gJHNjb3BlLnJlc3VsdHNPYmoucmVzdWx0cy5zcGxpY2UoaW5kZXgsIDEpXG4gICAgY29uc29sZS5sb2coZGVsZXRlZFswXSk7XG4gICAgaWYgKGRlbGV0ZWRbMF0uZHVwZSkge1xuICAgICAgJHNjb3BlLmR1cGVDb3VudC0tXG4gICAgfSBlbHNlIHtcbiAgICAgICRzY29wZS5yZXN1bHRzT2JqLnJlc3VsdENvdW50LS1cbiAgICB9XG4gIH1cblxuICAkc2NvcGUuZGVsZXRlRHVwZXMgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgZHVwZXNSZW1vdmVkID0gJHNjb3BlLnJlc3VsdHNPYmoucmVzdWx0cy5maWx0ZXIoZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICByZXR1cm4gIXJlc3VsdC5kdXBlXG4gICAgfSlcblxuICAgIGlmICgkc2NvcGUucmVzdWx0c09iai5faWQpIHtcbiAgICAgIHBvc3RTZXJ2aWNlLmRlbGV0ZUR1cGVzKCRzY29wZS5yZXN1bHRzT2JqLl9pZCwgZHVwZXNSZW1vdmVkKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgICAgJHNjb3BlLnJlc3VsdHNPYmogPSBzZWFyY2hTZXJ2aWNlLnJlc3VsdHNPYmpHZXR0ZXIoKVxuICAgICAgICAkc2NvcGUuZHVwZUNvdW50ID0gJHNjb3BlLnJlc3VsdHNPYmouZHVwZUNvdW50O1xuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgJHNjb3BlLnJlc3VsdHNPYmoucmVzdWx0cyA9IGR1cGVzUmVtb3ZlZFxuICAgICAgJHNjb3BlLmR1cGVDb3VudCA9IDBcbiAgICB9XG4gIH1cblxuICAkc2NvcGUuc2F2ZURpYWxvZyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgaWYgKCRyb290U2NvcGUudXNlcm5hbWUpIHtcbiAgICAgICRtZERpYWxvZy5zaG93KFxuICAgICAgICAkbWREaWFsb2cucHJvbXB0KClcbiAgICAgICAgLmNsaWNrT3V0c2lkZVRvQ2xvc2UodHJ1ZSlcbiAgICAgICAgLnRpdGxlKCdQbGVhc2UgY2hvb3NlIGEgbmFtZSBmb3IgeW91ciBzZWFyY2guJylcbiAgICAgICAgLm9wZW5Gcm9tKCcuY29udHJvbF9wYW5lbF9jb250YWluZXInKVxuICAgICAgICAub2soJ1NhdmUnKVxuICAgICAgKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgICAgbGV0IHNlYXJjaCA9IE9iamVjdC5hc3NpZ24oe30sICRzY29wZS5yZXN1bHRzT2JqKVxuICAgICAgICBkZWxldGUgc2VhcmNoLmR1cGVDb3VudFxuICAgICAgICBkZWxldGUgc2VhcmNoLnJlc3VsdENvdW50XG4gICAgICAgIHNlYXJjaC50aXRsZSA9IHJlc3VsdHNcbiAgICAgICAgc2VhcmNoU2VydmljZS5zYXZlU2VhcmNoKHNlYXJjaCkudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ3Jlc3VsdHMgZnJvbSBzYXZlIGluIGNvbnRyb2xsZXI6JywgcmVzdWx0cyk7XG4gICAgICAgICAgJGxvY2F0aW9uLnBhdGgoYC9yZXN1bHRzLyR7cmVzdWx0cy5pZH1gKVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgJG1kRGlhbG9nLnNob3coXG4gICAgICAgICRtZERpYWxvZy5hbGVydCgpXG4gICAgICAgIC5jbGlja091dHNpZGVUb0Nsb3NlKHRydWUpXG4gICAgICAgIC50aXRsZSgnWW91IG11c3QgYmUgbG9nZ2VkIGluIHRvIHNhdmUgc2VhcmNoZXMuJylcbiAgICAgICAgLm9rKCdPa2F5JylcbiAgICAgIClcbiAgICB9XG4gIH1cbn0pXG4iXX0=

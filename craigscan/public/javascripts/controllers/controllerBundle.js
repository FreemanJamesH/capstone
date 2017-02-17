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
      if (deleted[0].isFav){
        $scope.favCount--
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhdXRoQ3RybC5qcyIsImRhc2hDdHJsLmpzIiwiaW5kZXguanMiLCJtYWluQ3RybC5qcyIsInJlc3VsdHNDdHJsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImFwcC5jb250cm9sbGVyKCdBdXRoQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJGh0dHAsICRsb2NhdGlvbiwgJHdpbmRvdywgYXV0aFNlcnZpY2UsIHVzZXJTZXJ2aWNlKSB7XG4gICRzY29wZS51c2VyID0ge307XG4gICRzY29wZS5jcmVkZW50aWFsc0V4aXN0RXJyb3IgPSBmYWxzZTtcbiAgJHNjb3BlLnN1Ym1pdHRlZCA9IGZhbHNlO1xuXG5cbiAgJHNjb3BlLnNpZ251cCA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5zdWJtaXR0ZWQgPSB0cnVlO1xuICAgIGlmICgkc2NvcGUuc2lnbnVwRm9ybS4kdmFsaWQpIHtcbiAgICAgIHVzZXJTZXJ2aWNlLnNpZ251cCgkc2NvcGUudXNlcikudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgIGlmIChyZXNwb25zZS5tZXNzYWdlKXtcbiAgICAgICAgICBpZiAocmVzcG9uc2UubWVzc2FnZS5jb2RlID09PSAxMTAwMCl7XG4gICAgICAgICAgICAkc2NvcGUuY3JlZGVudGlhbHNFeGlzdEVycm9yID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy8nKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gICRzY29wZS5sb2dpbiA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5zdWJtaXR0ZWQgPSB0cnVlO1xuICAgIHVzZXJTZXJ2aWNlLmxvZ2luKCRzY29wZS51c2VyKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgIGlmIChyZXNwb25zZS5jcmVkZW50aWFsc0ludmFsaWQpe1xuICAgICAgICAkc2NvcGUuY3JlZGVudGlhbHNJbnZhbGlkID0gdHJ1ZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCR3aW5kb3cubG9jYWxTdG9yYWdlLnNlYXJjaFBhcmFtcyl7XG4gICAgICAgICAgbGV0IGxvY2FsU3RvcmFnZVRpbWUgPSBNYXRoLnJvdW5kKEpTT04ucGFyc2UoJHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2VhcmNoUGFyYW1zKS51cGRhdGVkLzEwMDApXG4gICAgICAgICAgbGV0IHRpbWVOb3cgPSBNYXRoLnJvdW5kKERhdGUubm93KCkvMTAwMClcbiAgICAgICAgICBsZXQgdGltZVNpbmNlTGFzdFNlYXJjaCA9IHRpbWVOb3cgLSBsb2NhbFN0b3JhZ2VUaW1lXG4gICAgICAgICAgaWYgKHRpbWVTaW5jZUxhc3RTZWFyY2ggPiAzNjAwKXtcbiAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvJylcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy9yZXN1bHRzJylcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy8nKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG59KVxuIiwiYXBwLmNvbnRyb2xsZXIoJ2Rhc2hDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkbG9jYXRpb24sIHVzZXJTZXJ2aWNlLCBzZWFyY2hTZXJ2aWNlKSB7XG5cbiAgJHNjb3BlLnVwZGF0aW5nID0gZmFsc2U7XG5cbiAgdXNlclNlcnZpY2UuZ2V0VXNlcigpLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICRzY29wZS51c2VyT2JqID0gcmVzdWx0c1xuICAgIGNvbnNvbGUubG9nKCRzY29wZS51c2VyT2JqKTtcbiAgfSlcblxuICAkc2NvcGUuZGVsZXRlU2VhcmNoID0gZnVuY3Rpb24oaWQpIHtcbiAgICBzZWFyY2hTZXJ2aWNlLmRlbGV0ZVNlYXJjaChpZCkudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICAkc2NvcGUudXNlck9iaiA9IHJlc3VsdHNcbiAgICB9KVxuICB9XG5cbiAgJHNjb3BlLnZpZXdTZWFyY2ggPSBmdW5jdGlvbihpZCkge1xuICAgICRsb2NhdGlvbi5wYXRoKGAvcmVzdWx0cy8ke2lkfWApXG4gIH1cblxuICAkc2NvcGUudXBkYXRlU2VhcmNoID0gZnVuY3Rpb24oaWQsICRpbmRleCl7XG4gICAgJHNjb3BlLnVzZXJPYmouc2VhcmNoZXNbJGluZGV4XS51cGRhdGluZyA9IHRydWVcbiAgICAkc2NvcGUudXBkYXRpbmcgPSB0cnVlO1xuICAgIHNlYXJjaFNlcnZpY2UudXBkYXRlU2VhcmNoKGlkKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpe1xuICAgICAgJHNjb3BlLnVzZXJPYmouc2VhcmNoZXNbJGluZGV4XS51cGRhdGluZyA9IGZhbHNlXG4gICAgICAkc2NvcGUudXNlck9iaiA9IHJlc3VsdHNcbiAgICB9KVxuICB9XG59KVxuIiwicmVxdWlyZSgnLi9hdXRoQ3RybC5qcycpXG5yZXF1aXJlKCcuL2Rhc2hDdHJsLmpzJylcbnJlcXVpcmUoJy4vbWFpbkN0cmwuanMnKVxucmVxdWlyZSgnLi9yZXN1bHRzQ3RybC5qcycpXG4iLCJhcHAuY29udHJvbGxlcignTWFpbkNvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRodHRwLCAkcm9vdFNjb3BlLCBzZWFyY2hTZXJ2aWNlLCBzdGF0ZUxpc3RTZXJ2aWNlLCAkbG9jYXRpb24sIGF1dGhTZXJ2aWNlLCB1c2VyU2VydmljZSwgJHdpbmRvdywgJHEpIHtcblxuICAkc2NvcGUuc3RhdGVDaG9pY2UgPSB1bmRlZmluZWQ7XG4gICRzY29wZS5yZWdpb25DaG9pY2UgPSB1bmRlZmluZWQ7XG5cbiAgc3RhdGVMaXN0U2VydmljZS5yZXRyaWV2ZSgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnN0YXRlTGlzdFByb3RvID0gc3RhdGVMaXN0U2VydmljZS5yZXN1bHRzQXJyR2V0dGVyKCk7XG4gIH0pXG5cbiAgJHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuICAgIGF1dGhTZXJ2aWNlLmxvZ291dCgpXG4gICAgJHJvb3RTY29wZS51c2VybmFtZSA9IG51bGxcbiAgICAkbG9jYXRpb24ucGF0aCgnLycpXG4gIH1cblxuICAkc2NvcGUuaG9tZSA9IGZ1bmN0aW9uKCkge1xuICAgICRsb2NhdGlvbi5wYXRoKCcvJylcbiAgfVxuXG4gICRzY29wZS4kd2F0Y2goZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gJHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnY3JhaWdzYmxpc3MtdG9rZW4nKVxuICAgIH0sXG4gICAgZnVuY3Rpb24obmV3VmFsdWUpIHtcbiAgICAgIGlmIChuZXdWYWx1ZSkge1xuICAgICAgICBsZXQgZGVjb2RlZFBheWxvYWQgPSBKU09OLnBhcnNlKGF0b2IobmV3VmFsdWUuc3BsaXQoJy4nKVsxXSkpXG4gICAgICAgICRyb290U2NvcGUudXNlcm5hbWUgPSBkZWNvZGVkUGF5bG9hZC51c2VybmFtZVxuICAgICAgfVxuICAgIH0sXG4gICAgdHJ1ZVxuICApXG5cbiAgJHNjb3BlLnJlc2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnN1Ym1pdHRlZCA9IGZhbHNlO1xuICB9XG5cbiAgJHNjb3BlLmRhc2hib2FyZCA9IGZ1bmN0aW9uKCkge1xuICAgIHVzZXJTZXJ2aWNlLmdldFVzZXIoKVxuICB9XG5cbiAgJHNjb3BlLnN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5zdWJtaXR0ZWQgPSB0cnVlO1xuICAgIGlmICgkc2NvcGUubWF4X3ByaWNlIDwgJHNjb3BlLm1pbl9wcmljZSkge1xuICAgICAgJHNjb3BlLm1heFNtYWxsZXIgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoJHNjb3BlLnN0YXRlQ2hvaWNlICYmICRzY29wZS5yZWdpb25DaG9pY2UpIHtcbiAgICAgICAgbGV0IHNlYXJjaFBhcmFtcyA9IHtcbiAgICAgICAgICByZWdpb25DaG9pY2U6ICRzY29wZS5yZWdpb25DaG9pY2UsXG4gICAgICAgICAgdXBkYXRlZDogRGF0ZS5ub3coKSxcbiAgICAgICAgICBxdWVyeTogJHNjb3BlLnF1ZXJ5LFxuICAgICAgICAgIHNlYXJjaF9kaXN0YW5jZTogJHNjb3BlLmRpc3RhbmNlLFxuICAgICAgICAgIHBvc3RhbDogJHNjb3BlLnBvc3RhbCxcbiAgICAgICAgICBtaW5fcHJpY2U6ICRzY29wZS5taW5fcHJpY2UsXG4gICAgICAgICAgbWF4X3ByaWNlOiAkc2NvcGUubWF4X3ByaWNlXG4gICAgICAgIH1cbiAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2VbJ3NlYXJjaFBhcmFtcyddID0gSlNPTi5zdHJpbmdpZnkoc2VhcmNoUGFyYW1zKVxuICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZVsncmVnaW9uQ2hvaWNlJ10gPSAkc2NvcGUucmVnaW9uQ2hvaWNlXG4gICAgICAgICRsb2NhdGlvbi5wYXRoKCcvcmVzdWx0cycpXG4gICAgICB9XG4gICAgfVxuICB9XG59KVxuIiwiYXBwLmNvbnRyb2xsZXIoJ3Jlc3VsdHNDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkcm91dGVQYXJhbXMsICRyb290U2NvcGUsICRsb2NhdGlvbiwgJG1kRGlhbG9nLCBzZWFyY2hTZXJ2aWNlLCBwb3N0U2VydmljZSwgJHdpbmRvdykge1xuXG4gICRzY29wZS5sb2FkaW5nID0gdHJ1ZTtcbiAgJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gYExvYWRpbmcgeW91ciByZXN1bHRzLi4uYFxuICAkc2NvcGUuc2hvd1NhdmUgPSB0cnVlO1xuXG4gIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gYFRoYW5rIHlvdSBmb3IgeW91ciBwYXRpZW5jZS4uLmBcbiAgICAkc2NvcGUuJGFwcGx5KClcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gYFNlYXJjaGVzIHJldHVybmluZyBtYW55IHJlc3VsdHMgY2FuIHRha2UgdGltZSB0byBwcm9jZXNzLi4uYFxuICAgICAgJHNjb3BlLiRhcHBseSgpXG4gICAgfSwgNDAwMClcbiAgfSwgNDAwMClcblxuXG4gIGlmICghJHJvdXRlUGFyYW1zLnNlYXJjaElkKSB7XG4gICAgbGV0IHNlYXJjaE9iaiA9IHt9XG4gICAgc2VhcmNoT2JqLnJlZ2lvbkNob2ljZSA9ICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlZ2lvbkNob2ljZVxuICAgIHNlYXJjaE9iai5zZWFyY2hQYXJhbXMgPSBKU09OLnBhcnNlKCR3aW5kb3cubG9jYWxTdG9yYWdlLnNlYXJjaFBhcmFtcylcbiAgICBzZWFyY2hTZXJ2aWNlLm5ld1NlYXJjaChzZWFyY2hPYmopLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgJHNjb3BlLnJlc3VsdHNPYmogPSBzZWFyY2hTZXJ2aWNlLnJlc3VsdHNPYmpHZXR0ZXIoKTtcbiAgICAgICRzY29wZS5kdXBlQ291bnQgPSAkc2NvcGUucmVzdWx0c09iai5kdXBlQ291bnRcbiAgICAgICRzY29wZS5mYXZDb3VudCA9ICRzY29wZS5yZXN1bHRzT2JqLmZhdkNvdW50XG4gICAgICAkc2NvcGUubG9hZGluZyA9IGZhbHNlO1xuICAgIH0pXG4gIH0gZWxzZSB7XG4gICAgJHNjb3BlLnNob3dTYXZlID0gZmFsc2U7XG4gICAgc2VhcmNoU2VydmljZS52aWV3U2VhcmNoKCRyb3V0ZVBhcmFtcy5zZWFyY2hJZCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5yZXN1bHRzT2JqID0gc2VhcmNoU2VydmljZS5yZXN1bHRzT2JqR2V0dGVyKClcbiAgICAgICRzY29wZS5kdXBlQ291bnQgPSAkc2NvcGUucmVzdWx0c09iai5kdXBlQ291bnRcbiAgICAgICRzY29wZS5mYXZDb3VudCA9ICRzY29wZS5yZXN1bHRzT2JqLmZhdkNvdW50XG4gICAgICAkc2NvcGUubG9hZGluZyA9IGZhbHNlO1xuICAgIH0pXG4gIH1cblxuICAkc2NvcGUuZHVwZVNob3cgPSBmYWxzZVxuICAkc2NvcGUuaW1hZ2VIaWRlID0gZmFsc2VcbiAgJHNjb3BlLmZhdk9ubHkgPSBmYWxzZVxuXG4gICRzY29wZS5kZWxldGUgPSBmdW5jdGlvbihyZXN1bHRJZCwgaW5kZXgpIHtcbiAgICBwb3N0U2VydmljZS5kZWxldGUoJHNjb3BlLnJlc3VsdHNPYmouX2lkLCByZXN1bHRJZCkudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG5cblxuICAgICAgbGV0IGRlbGV0ZWQgPSAkc2NvcGUucmVzdWx0c09iai5yZXN1bHRzLnNwbGljZShpbmRleCwxKVxuICAgICAgaWYgKGRlbGV0ZWRbMF0uaXNGYXYpe1xuICAgICAgICAkc2NvcGUuZmF2Q291bnQtLVxuICAgICAgfVxuICAgICAgaWYgKGRlbGV0ZWRbMF0uZHVwZSkge1xuICAgICAgICAkc2NvcGUuZHVwZUNvdW50LS1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICRzY29wZS5yZXN1bHRzT2JqLnJlc3VsdENvdW50LS1cbiAgICAgIH1cbiAgICAgICAgLy8gc2VhcmNoU2VydmljZS5yZXN1bHRzT2JqU2V0dGVyKHJlc3VsdHMpXG4gICAgICAgIC8vICRzY29wZS5yZXN1bHRzT2JqID0gc2VhcmNoU2VydmljZS5yZXN1bHRzT2JqR2V0dGVyKClcbiAgICB9KVxuICB9XG5cbiAgJHNjb3BlLmZhdm9yaXRlID0gZnVuY3Rpb24ocmVzdWx0SWQsIGluZGV4KSB7XG5cbiAgICBpZiAoISRzY29wZS5yZXN1bHRzT2JqLnRpdGxlKSB7XG4gICAgICAkbWREaWFsb2cuc2hvdyhcbiAgICAgICAgJG1kRGlhbG9nLmFsZXJ0KClcbiAgICAgICAgLmNsaWNrT3V0c2lkZVRvQ2xvc2UodHJ1ZSlcbiAgICAgICAgLnRpdGxlKCdQbGVhc2Ugc2F2ZSB5b3VyIHNlYXJjaCB0byBhZGQgZmF2b3JpdGVzLicpXG4gICAgICAgIC5vaygnT2theScpXG4gICAgICApXG4gICAgfSBlbHNlIHtcbiAgICAgIHBvc3RTZXJ2aWNlLmZhdm9yaXRlKCRzY29wZS5yZXN1bHRzT2JqLl9pZCwgcmVzdWx0SWQpLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgICAvLyAkc2NvcGUucmVzdWx0c09iaiA9IHNlYXJjaFNlcnZpY2UucmVzdWx0c09iakdldHRlcigpXG4gICAgICAgICRzY29wZS5yZXN1bHRzT2JqLnJlc3VsdHNbaW5kZXhdLmlzRmF2ID0gdHJ1ZTtcbiAgICAgICAgJHNjb3BlLmZhdkNvdW50KytcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgJHNjb3BlLnVuZmF2b3JpdGUgPSBmdW5jdGlvbihyZXN1bHRJZCwgaW5kZXgpIHtcbiAgICBwb3N0U2VydmljZS51bmZhdm9yaXRlKCRzY29wZS5yZXN1bHRzT2JqLl9pZCwgcmVzdWx0SWQpLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgJHNjb3BlLnJlc3VsdHNPYmoucmVzdWx0c1tpbmRleF0uaXNGYXYgPSBmYWxzZTtcbiAgICAgICRzY29wZS5mYXZDb3VudC0tXG4gICAgfSlcbiAgfVxuXG4gICRzY29wZS5kZWxldGVBbm9uID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICBsZXQgZGVsZXRlZCA9ICRzY29wZS5yZXN1bHRzT2JqLnJlc3VsdHMuc3BsaWNlKGluZGV4LCAxKVxuICAgIGNvbnNvbGUubG9nKGRlbGV0ZWRbMF0pO1xuICAgIGlmIChkZWxldGVkWzBdLmR1cGUpIHtcbiAgICAgICRzY29wZS5kdXBlQ291bnQtLVxuICAgIH0gZWxzZSB7XG4gICAgICAkc2NvcGUucmVzdWx0c09iai5yZXN1bHRDb3VudC0tXG4gICAgfVxuICB9XG5cbiAgJHNjb3BlLmRlbGV0ZUR1cGVzID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IGR1cGVzUmVtb3ZlZCA9ICRzY29wZS5yZXN1bHRzT2JqLnJlc3VsdHMuZmlsdGVyKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgcmV0dXJuICFyZXN1bHQuZHVwZVxuICAgIH0pXG5cbiAgICBpZiAoJHNjb3BlLnJlc3VsdHNPYmouX2lkKSB7XG4gICAgICBwb3N0U2VydmljZS5kZWxldGVEdXBlcygkc2NvcGUucmVzdWx0c09iai5faWQsIGR1cGVzUmVtb3ZlZCkudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICAgICRzY29wZS5yZXN1bHRzT2JqID0gc2VhcmNoU2VydmljZS5yZXN1bHRzT2JqR2V0dGVyKClcbiAgICAgICAgJHNjb3BlLmR1cGVDb3VudCA9ICRzY29wZS5yZXN1bHRzT2JqLmR1cGVDb3VudDtcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgICRzY29wZS5yZXN1bHRzT2JqLnJlc3VsdHMgPSBkdXBlc1JlbW92ZWRcbiAgICAgICRzY29wZS5kdXBlQ291bnQgPSAwXG4gICAgfVxuICB9XG5cbiAgJHNjb3BlLnNhdmVEaWFsb2cgPSBmdW5jdGlvbigpIHtcblxuICAgIGlmICgkcm9vdFNjb3BlLnVzZXJuYW1lKSB7XG4gICAgICAkbWREaWFsb2cuc2hvdyhcbiAgICAgICAgJG1kRGlhbG9nLnByb21wdCgpXG4gICAgICAgIC5jbGlja091dHNpZGVUb0Nsb3NlKHRydWUpXG4gICAgICAgIC50aXRsZSgnUGxlYXNlIGNob29zZSBhIG5hbWUgZm9yIHlvdXIgc2VhcmNoLicpXG4gICAgICAgIC5vcGVuRnJvbSgnLmNvbnRyb2xfcGFuZWxfY29udGFpbmVyJylcbiAgICAgICAgLm9rKCdTYXZlJylcbiAgICAgICkudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICAgIGxldCBzZWFyY2ggPSBPYmplY3QuYXNzaWduKHt9LCAkc2NvcGUucmVzdWx0c09iailcbiAgICAgICAgZGVsZXRlIHNlYXJjaC5kdXBlQ291bnRcbiAgICAgICAgZGVsZXRlIHNlYXJjaC5yZXN1bHRDb3VudFxuICAgICAgICBzZWFyY2gudGl0bGUgPSByZXN1bHRzXG4gICAgICAgIHNlYXJjaFNlcnZpY2Uuc2F2ZVNlYXJjaChzZWFyY2gpLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdyZXN1bHRzIGZyb20gc2F2ZSBpbiBjb250cm9sbGVyOicsIHJlc3VsdHMpO1xuICAgICAgICAgICRsb2NhdGlvbi5wYXRoKGAvcmVzdWx0cy8ke3Jlc3VsdHMuaWR9YClcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgICRtZERpYWxvZy5zaG93KFxuICAgICAgICAkbWREaWFsb2cuYWxlcnQoKVxuICAgICAgICAuY2xpY2tPdXRzaWRlVG9DbG9zZSh0cnVlKVxuICAgICAgICAudGl0bGUoJ1lvdSBtdXN0IGJlIGxvZ2dlZCBpbiB0byBzYXZlIHNlYXJjaGVzLicpXG4gICAgICAgIC5vaygnT2theScpXG4gICAgICApXG4gICAgfVxuICB9XG59KVxuIl19

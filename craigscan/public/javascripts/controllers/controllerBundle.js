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
          console.log(`Time since last search:`, timeSinceLastSearch);
          if (timeSinceLastSearch > 3600){
            $location.path('/')
          } else {
            $location.path('/results')
          }
        } else {
          console.log('no local storage found');
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

  $scope.favorite = function(resultId){

    if (!$scope.resultsObj.title){
      $mdDialog.show(
        $mdDialog.alert()
        .clickOutsideToClose(true)
        .title('Please save your search to add favorites.')
        .ok('Okay')
      )
    } else {
      postService.favorite($scope.resultsObj._id, resultId).then(function(results){
        $scope.resultsObj = searchService.resultsObjGetter()
      })
    }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhdXRoQ3RybC5qcyIsImRhc2hDdHJsLmpzIiwiaW5kZXguanMiLCJtYWluQ3RybC5qcyIsInJlc3VsdHNDdHJsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImFwcC5jb250cm9sbGVyKCdBdXRoQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJGh0dHAsICRsb2NhdGlvbiwgJHdpbmRvdywgYXV0aFNlcnZpY2UsIHVzZXJTZXJ2aWNlKSB7XG4gICRzY29wZS51c2VyID0ge307XG4gICRzY29wZS5jcmVkZW50aWFsc0V4aXN0RXJyb3IgPSBmYWxzZTtcbiAgJHNjb3BlLnN1Ym1pdHRlZCA9IGZhbHNlO1xuXG5cbiAgJHNjb3BlLnNpZ251cCA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5zdWJtaXR0ZWQgPSB0cnVlO1xuICAgIGlmICgkc2NvcGUuc2lnbnVwRm9ybS4kdmFsaWQpIHtcbiAgICAgIHVzZXJTZXJ2aWNlLnNpZ251cCgkc2NvcGUudXNlcikudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgIGlmIChyZXNwb25zZS5tZXNzYWdlKXtcbiAgICAgICAgICBpZiAocmVzcG9uc2UubWVzc2FnZS5jb2RlID09PSAxMTAwMCl7XG4gICAgICAgICAgICAkc2NvcGUuY3JlZGVudGlhbHNFeGlzdEVycm9yID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy8nKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gICRzY29wZS5sb2dpbiA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5zdWJtaXR0ZWQgPSB0cnVlO1xuICAgIHVzZXJTZXJ2aWNlLmxvZ2luKCRzY29wZS51c2VyKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgIGlmIChyZXNwb25zZS5jcmVkZW50aWFsc0ludmFsaWQpe1xuICAgICAgICAkc2NvcGUuY3JlZGVudGlhbHNJbnZhbGlkID0gdHJ1ZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCR3aW5kb3cubG9jYWxTdG9yYWdlLnNlYXJjaFBhcmFtcyl7XG4gICAgICAgICAgbGV0IGxvY2FsU3RvcmFnZVRpbWUgPSBNYXRoLnJvdW5kKEpTT04ucGFyc2UoJHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2VhcmNoUGFyYW1zKS51cGRhdGVkLzEwMDApXG4gICAgICAgICAgbGV0IHRpbWVOb3cgPSBNYXRoLnJvdW5kKERhdGUubm93KCkvMTAwMClcbiAgICAgICAgICBsZXQgdGltZVNpbmNlTGFzdFNlYXJjaCA9IHRpbWVOb3cgLSBsb2NhbFN0b3JhZ2VUaW1lXG4gICAgICAgICAgY29uc29sZS5sb2coYFRpbWUgc2luY2UgbGFzdCBzZWFyY2g6YCwgdGltZVNpbmNlTGFzdFNlYXJjaCk7XG4gICAgICAgICAgaWYgKHRpbWVTaW5jZUxhc3RTZWFyY2ggPiAzNjAwKXtcbiAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvJylcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy9yZXN1bHRzJylcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ25vIGxvY2FsIHN0b3JhZ2UgZm91bmQnKTtcbiAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnLycpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbn0pXG4iLCJhcHAuY29udHJvbGxlcignZGFzaENvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRsb2NhdGlvbiwgdXNlclNlcnZpY2UsIHNlYXJjaFNlcnZpY2UpIHtcblxuICAkc2NvcGUudXBkYXRpbmcgPSBmYWxzZTtcblxuICB1c2VyU2VydmljZS5nZXRVc2VyKCkudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgJHNjb3BlLnVzZXJPYmogPSByZXN1bHRzXG4gICAgY29uc29sZS5sb2coJHNjb3BlLnVzZXJPYmopO1xuICB9KVxuXG4gICRzY29wZS5kZWxldGVTZWFyY2ggPSBmdW5jdGlvbihpZCkge1xuICAgIHNlYXJjaFNlcnZpY2UuZGVsZXRlU2VhcmNoKGlkKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgICRzY29wZS51c2VyT2JqID0gcmVzdWx0c1xuICAgIH0pXG4gIH1cblxuICAkc2NvcGUudmlld1NlYXJjaCA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgJGxvY2F0aW9uLnBhdGgoYC9yZXN1bHRzLyR7aWR9YClcbiAgfVxuXG4gICRzY29wZS51cGRhdGVTZWFyY2ggPSBmdW5jdGlvbihpZCwgJGluZGV4KXtcbiAgICAkc2NvcGUudXNlck9iai5zZWFyY2hlc1skaW5kZXhdLnVwZGF0aW5nID0gdHJ1ZVxuICAgICRzY29wZS51cGRhdGluZyA9IHRydWU7XG4gICAgc2VhcmNoU2VydmljZS51cGRhdGVTZWFyY2goaWQpLnRoZW4oZnVuY3Rpb24ocmVzdWx0cyl7XG4gICAgICAkc2NvcGUudXNlck9iai5zZWFyY2hlc1skaW5kZXhdLnVwZGF0aW5nID0gZmFsc2VcbiAgICAgICRzY29wZS51c2VyT2JqID0gcmVzdWx0c1xuICAgIH0pXG4gIH1cbn0pXG4iLCJyZXF1aXJlKCcuL2F1dGhDdHJsLmpzJylcbnJlcXVpcmUoJy4vZGFzaEN0cmwuanMnKVxucmVxdWlyZSgnLi9tYWluQ3RybC5qcycpXG5yZXF1aXJlKCcuL3Jlc3VsdHNDdHJsLmpzJylcbiIsImFwcC5jb250cm9sbGVyKCdNYWluQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJGh0dHAsICRyb290U2NvcGUsIHNlYXJjaFNlcnZpY2UsIHN0YXRlTGlzdFNlcnZpY2UsICRsb2NhdGlvbiwgYXV0aFNlcnZpY2UsIHVzZXJTZXJ2aWNlLCAkd2luZG93LCAkcSkge1xuXG4gICRzY29wZS5zdGF0ZUNob2ljZSA9IHVuZGVmaW5lZDtcbiAgJHNjb3BlLnJlZ2lvbkNob2ljZSA9IHVuZGVmaW5lZDtcblxuICBzdGF0ZUxpc3RTZXJ2aWNlLnJldHJpZXZlKCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuc3RhdGVMaXN0UHJvdG8gPSBzdGF0ZUxpc3RTZXJ2aWNlLnJlc3VsdHNBcnJHZXR0ZXIoKTtcbiAgfSlcblxuICAkc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgYXV0aFNlcnZpY2UubG9nb3V0KClcbiAgICAkcm9vdFNjb3BlLnVzZXJuYW1lID0gbnVsbFxuICAgICRsb2NhdGlvbi5wYXRoKCcvJylcbiAgfVxuXG4gICRzY29wZS5ob21lID0gZnVuY3Rpb24oKSB7XG4gICAgJGxvY2F0aW9uLnBhdGgoJy8nKVxuICB9XG5cbiAgJHNjb3BlLiR3YXRjaChmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAkd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdjcmFpZ3NibGlzcy10b2tlbicpXG4gICAgfSxcbiAgICBmdW5jdGlvbihuZXdWYWx1ZSkge1xuICAgICAgaWYgKG5ld1ZhbHVlKSB7XG4gICAgICAgIGxldCBkZWNvZGVkUGF5bG9hZCA9IEpTT04ucGFyc2UoYXRvYihuZXdWYWx1ZS5zcGxpdCgnLicpWzFdKSlcbiAgICAgICAgJHJvb3RTY29wZS51c2VybmFtZSA9IGRlY29kZWRQYXlsb2FkLnVzZXJuYW1lXG4gICAgICB9XG4gICAgfSxcbiAgICB0cnVlXG4gIClcblxuICAkc2NvcGUucmVzZXQgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuc3VibWl0dGVkID0gZmFsc2U7XG4gIH1cblxuICAkc2NvcGUuZGFzaGJvYXJkID0gZnVuY3Rpb24oKSB7XG4gICAgdXNlclNlcnZpY2UuZ2V0VXNlcigpXG4gIH1cblxuICAkc2NvcGUuc3VibWl0ID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnN1Ym1pdHRlZCA9IHRydWU7XG4gICAgaWYgKCRzY29wZS5tYXhfcHJpY2UgPCAkc2NvcGUubWluX3ByaWNlKSB7XG4gICAgICAkc2NvcGUubWF4U21hbGxlciA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICgkc2NvcGUuc3RhdGVDaG9pY2UgJiYgJHNjb3BlLnJlZ2lvbkNob2ljZSkge1xuICAgICAgICBsZXQgc2VhcmNoUGFyYW1zID0ge1xuICAgICAgICAgIHJlZ2lvbkNob2ljZTogJHNjb3BlLnJlZ2lvbkNob2ljZSxcbiAgICAgICAgICB1cGRhdGVkOiBEYXRlLm5vdygpLFxuICAgICAgICAgIHF1ZXJ5OiAkc2NvcGUucXVlcnksXG4gICAgICAgICAgc2VhcmNoX2Rpc3RhbmNlOiAkc2NvcGUuZGlzdGFuY2UsXG4gICAgICAgICAgcG9zdGFsOiAkc2NvcGUucG9zdGFsLFxuICAgICAgICAgIG1pbl9wcmljZTogJHNjb3BlLm1pbl9wcmljZSxcbiAgICAgICAgICBtYXhfcHJpY2U6ICRzY29wZS5tYXhfcHJpY2VcbiAgICAgICAgfVxuICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZVsnc2VhcmNoUGFyYW1zJ10gPSBKU09OLnN0cmluZ2lmeShzZWFyY2hQYXJhbXMpXG4gICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlWydyZWdpb25DaG9pY2UnXSA9ICRzY29wZS5yZWdpb25DaG9pY2VcbiAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy9yZXN1bHRzJylcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pXG4iLCJhcHAuY29udHJvbGxlcigncmVzdWx0c0NvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRyb3V0ZVBhcmFtcywgJHJvb3RTY29wZSwgJGxvY2F0aW9uLCAkbWREaWFsb2csIHNlYXJjaFNlcnZpY2UsIHBvc3RTZXJ2aWNlLCAkd2luZG93KSB7XG5cbiAgJHNjb3BlLmxvYWRpbmcgPSB0cnVlO1xuICAkc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBgTG9hZGluZyB5b3VyIHJlc3VsdHMuLi5gXG4gICRzY29wZS5zaG93U2F2ZSA9IHRydWU7XG5cbiAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICRzY29wZS5sb2FkaW5nTWVzc2FnZSA9IGBUaGFuayB5b3UgZm9yIHlvdXIgcGF0aWVuY2UuLi5gXG4gICAgJHNjb3BlLiRhcHBseSgpXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gYFNlYXJjaGVzIHJldHVybmluZyBtYW55IHJlc3VsdHMgY2FuIHRha2UgdGltZSB0byBwcm9jZXNzLi4uYFxuICAgICAgJHNjb3BlLiRhcHBseSgpXG4gICAgfSwgNDAwMClcbiAgfSwgNDAwMClcblxuXG4gIGlmICghJHJvdXRlUGFyYW1zLnNlYXJjaElkKSB7XG4gICAgbGV0IHNlYXJjaE9iaiA9IHt9XG4gICAgc2VhcmNoT2JqLnJlZ2lvbkNob2ljZSA9ICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlZ2lvbkNob2ljZVxuICAgIHNlYXJjaE9iai5zZWFyY2hQYXJhbXMgPSBKU09OLnBhcnNlKCR3aW5kb3cubG9jYWxTdG9yYWdlLnNlYXJjaFBhcmFtcylcbiAgICBzZWFyY2hTZXJ2aWNlLm5ld1NlYXJjaChzZWFyY2hPYmopLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgJHNjb3BlLnJlc3VsdHNPYmogPSBzZWFyY2hTZXJ2aWNlLnJlc3VsdHNPYmpHZXR0ZXIoKTtcbiAgICAgICRzY29wZS5kdXBlQ291bnQgPSAkc2NvcGUucmVzdWx0c09iai5kdXBlQ291bnRcbiAgICAgICRzY29wZS5mYXZDb3VudCA9ICRzY29wZS5yZXN1bHRzT2JqLmZhdkNvdW50XG4gICAgICAkc2NvcGUubG9hZGluZyA9IGZhbHNlO1xuICAgIH0pXG4gIH0gZWxzZSB7XG4gICAgJHNjb3BlLnNob3dTYXZlID0gZmFsc2U7XG4gICAgc2VhcmNoU2VydmljZS52aWV3U2VhcmNoKCRyb3V0ZVBhcmFtcy5zZWFyY2hJZCkudGhlbihmdW5jdGlvbigpe1xuICAgICAgJHNjb3BlLnJlc3VsdHNPYmogPSBzZWFyY2hTZXJ2aWNlLnJlc3VsdHNPYmpHZXR0ZXIoKVxuICAgICAgJHNjb3BlLmR1cGVDb3VudCA9ICRzY29wZS5yZXN1bHRzT2JqLmR1cGVDb3VudFxuICAgICAgJHNjb3BlLmZhdkNvdW50ID0gJHNjb3BlLnJlc3VsdHNPYmouZmF2Q291bnRcbiAgICAgICRzY29wZS5sb2FkaW5nID0gZmFsc2U7XG4gICAgfSlcbiAgfVxuXG4gICRzY29wZS5kdXBlU2hvdyA9IGZhbHNlXG4gICRzY29wZS5pbWFnZUhpZGUgPSBmYWxzZVxuICAkc2NvcGUuZmF2T25seSA9IGZhbHNlXG5cbiAgJHNjb3BlLmRlbGV0ZSA9IGZ1bmN0aW9uKHJlc3VsdElkKSB7XG4gICAgcG9zdFNlcnZpY2UuZGVsZXRlKCRzY29wZS5yZXN1bHRzT2JqLl9pZCwgcmVzdWx0SWQpLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgc2VhcmNoU2VydmljZS5yZXN1bHRzT2JqU2V0dGVyKHJlc3VsdHMpXG4gICAgICAkc2NvcGUucmVzdWx0c09iaiA9IHNlYXJjaFNlcnZpY2UucmVzdWx0c09iakdldHRlcigpXG4gICAgfSlcbiAgfVxuXG4gICRzY29wZS5mYXZvcml0ZSA9IGZ1bmN0aW9uKHJlc3VsdElkKXtcblxuICAgIGlmICghJHNjb3BlLnJlc3VsdHNPYmoudGl0bGUpe1xuICAgICAgJG1kRGlhbG9nLnNob3coXG4gICAgICAgICRtZERpYWxvZy5hbGVydCgpXG4gICAgICAgIC5jbGlja091dHNpZGVUb0Nsb3NlKHRydWUpXG4gICAgICAgIC50aXRsZSgnUGxlYXNlIHNhdmUgeW91ciBzZWFyY2ggdG8gYWRkIGZhdm9yaXRlcy4nKVxuICAgICAgICAub2soJ09rYXknKVxuICAgICAgKVxuICAgIH0gZWxzZSB7XG4gICAgICBwb3N0U2VydmljZS5mYXZvcml0ZSgkc2NvcGUucmVzdWx0c09iai5faWQsIHJlc3VsdElkKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpe1xuICAgICAgICAkc2NvcGUucmVzdWx0c09iaiA9IHNlYXJjaFNlcnZpY2UucmVzdWx0c09iakdldHRlcigpXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gICRzY29wZS51bmZhdm9yaXRlID0gZnVuY3Rpb24ocmVzdWx0SWQpe1xuICAgIHBvc3RTZXJ2aWNlLnVuZmF2b3JpdGUoJHNjb3BlLnJlc3VsdHNPYmouX2lkLCByZXN1bHRJZCkudGhlbihmdW5jdGlvbihyZXN1bHRzKXtcbiAgICAgICRzY29wZS5yZXN1bHRzT2JqID0gc2VhcmNoU2VydmljZS5yZXN1bHRzT2JqR2V0dGVyKClcbiAgICB9KVxuICB9XG5cbiAgJHNjb3BlLmRlbGV0ZUFub24gPSBmdW5jdGlvbihpbmRleCkge1xuICAgIGxldCBkZWxldGVkID0gJHNjb3BlLnJlc3VsdHNPYmoucmVzdWx0cy5zcGxpY2UoaW5kZXgsIDEpXG4gICAgY29uc29sZS5sb2coZGVsZXRlZFswXSk7XG4gICAgaWYgKGRlbGV0ZWRbMF0uZHVwZSkge1xuICAgICAgJHNjb3BlLmR1cGVDb3VudC0tXG4gICAgfSBlbHNlIHtcbiAgICAgICRzY29wZS5yZXN1bHRzT2JqLnJlc3VsdENvdW50LS1cbiAgICB9XG4gIH1cblxuICAkc2NvcGUuZGVsZXRlRHVwZXMgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgZHVwZXNSZW1vdmVkID0gJHNjb3BlLnJlc3VsdHNPYmoucmVzdWx0cy5maWx0ZXIoZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICByZXR1cm4gIXJlc3VsdC5kdXBlXG4gICAgfSlcblxuICAgIGlmICgkc2NvcGUucmVzdWx0c09iai5faWQpIHtcbiAgICAgIHBvc3RTZXJ2aWNlLmRlbGV0ZUR1cGVzKCRzY29wZS5yZXN1bHRzT2JqLl9pZCwgZHVwZXNSZW1vdmVkKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgICAgJHNjb3BlLnJlc3VsdHNPYmogPSBzZWFyY2hTZXJ2aWNlLnJlc3VsdHNPYmpHZXR0ZXIoKVxuICAgICAgICAkc2NvcGUuZHVwZUNvdW50ID0gJHNjb3BlLnJlc3VsdHNPYmouZHVwZUNvdW50O1xuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgJHNjb3BlLnJlc3VsdHNPYmoucmVzdWx0cyA9IGR1cGVzUmVtb3ZlZFxuICAgICAgJHNjb3BlLmR1cGVDb3VudCA9IDBcbiAgICB9XG4gIH1cblxuICAkc2NvcGUuc2F2ZURpYWxvZyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgaWYgKCRyb290U2NvcGUudXNlcm5hbWUpe1xuICAgICAgJG1kRGlhbG9nLnNob3coXG4gICAgICAgICRtZERpYWxvZy5wcm9tcHQoKVxuICAgICAgICAuY2xpY2tPdXRzaWRlVG9DbG9zZSh0cnVlKVxuICAgICAgICAudGl0bGUoJ1BsZWFzZSBjaG9vc2UgYSBuYW1lIGZvciB5b3VyIHNlYXJjaC4nKVxuICAgICAgICAub3BlbkZyb20oJy5jb250cm9sX3BhbmVsX2NvbnRhaW5lcicpXG4gICAgICAgIC5vaygnU2F2ZScpXG4gICAgICApLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgICBsZXQgc2VhcmNoID0gT2JqZWN0LmFzc2lnbih7fSwgJHNjb3BlLnJlc3VsdHNPYmopXG4gICAgICAgIGRlbGV0ZSBzZWFyY2guZHVwZUNvdW50XG4gICAgICAgIGRlbGV0ZSBzZWFyY2gucmVzdWx0Q291bnRcbiAgICAgICAgc2VhcmNoLnRpdGxlID0gcmVzdWx0c1xuICAgICAgICBzZWFyY2hTZXJ2aWNlLnNhdmVTZWFyY2goc2VhcmNoKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpe1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdyZXN1bHRzIGZyb20gc2F2ZSBpbiBjb250cm9sbGVyOicsIHJlc3VsdHMpO1xuICAgICAgICAgICRsb2NhdGlvbi5wYXRoKGAvcmVzdWx0cy8ke3Jlc3VsdHMuaWR9YClcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgICRtZERpYWxvZy5zaG93KFxuICAgICAgICAkbWREaWFsb2cuYWxlcnQoKVxuICAgICAgICAuY2xpY2tPdXRzaWRlVG9DbG9zZSh0cnVlKVxuICAgICAgICAudGl0bGUoJ1lvdSBtdXN0IGJlIGxvZ2dlZCBpbiB0byBzYXZlIHNlYXJjaGVzLicpXG4gICAgICAgIC5vaygnT2theScpXG4gICAgICApXG4gICAgfVxuICB9XG59KVxuIl19

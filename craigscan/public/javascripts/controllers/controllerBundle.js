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
    postService.favorite($scope.resultsObj._id, resultId).then(function(results){
      $scope.resultsObj = searchService.resultsObjGetter()
      console.log('favorited!:', $scope.resultsObj);
    })
  }

  $scope.unfavorite = function(resultId){
    postService.unfavorite($scope.resultsObj._id, resultId).then(function(results){
      $scope.resultsObj = searchService.resultsObjGetter()
      console.log('unfavorited!:', $scope.resultsObj);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhdXRoQ3RybC5qcyIsImRhc2hDdHJsLmpzIiwiaW5kZXguanMiLCJtYWluQ3RybC5qcyIsInJlc3VsdHNDdHJsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJhcHAuY29udHJvbGxlcignQXV0aENvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRodHRwLCAkbG9jYXRpb24sIGF1dGhTZXJ2aWNlLCB1c2VyU2VydmljZSkge1xuICAkc2NvcGUudXNlciA9IHt9O1xuICAkc2NvcGUuY3JlZGVudGlhbHNFeGlzdEVycm9yID0gZmFsc2U7XG4gICRzY29wZS5zdWJtaXR0ZWQgPSBmYWxzZTtcblxuXG4gICRzY29wZS5zaWdudXAgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuc3VibWl0dGVkID0gdHJ1ZTtcbiAgICBpZiAoJHNjb3BlLnNpZ251cEZvcm0uJHZhbGlkKSB7XG4gICAgICB1c2VyU2VydmljZS5zaWdudXAoJHNjb3BlLnVzZXIpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICBpZiAocmVzcG9uc2UubWVzc2FnZSl7XG4gICAgICAgICAgaWYgKHJlc3BvbnNlLm1lc3NhZ2UuY29kZSA9PT0gMTEwMDApe1xuICAgICAgICAgICAgJHNjb3BlLmNyZWRlbnRpYWxzRXhpc3RFcnJvciA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvJylcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICAkc2NvcGUubG9naW4gPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuc3VibWl0dGVkID0gdHJ1ZTtcbiAgICB1c2VyU2VydmljZS5sb2dpbigkc2NvcGUudXNlcikudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICBpZiAocmVzcG9uc2UuY3JlZGVudGlhbHNJbnZhbGlkKXtcbiAgICAgICAgJHNjb3BlLmNyZWRlbnRpYWxzSW52YWxpZCA9IHRydWVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICRsb2NhdGlvbi5wYXRoKCcvJylcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbn0pXG4iLCJhcHAuY29udHJvbGxlcignZGFzaENvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRsb2NhdGlvbiwgdXNlclNlcnZpY2UsIHNlYXJjaFNlcnZpY2UpIHtcblxuICAkc2NvcGUudXBkYXRpbmcgPSBmYWxzZTtcblxuICB1c2VyU2VydmljZS5nZXRVc2VyKCkudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgJHNjb3BlLnVzZXJPYmogPSByZXN1bHRzXG4gICAgY29uc29sZS5sb2coJHNjb3BlLnVzZXJPYmopO1xuICB9KVxuXG4gICRzY29wZS5kZWxldGVTZWFyY2ggPSBmdW5jdGlvbihpZCkge1xuICAgIHNlYXJjaFNlcnZpY2UuZGVsZXRlU2VhcmNoKGlkKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgICRzY29wZS51c2VyT2JqID0gcmVzdWx0c1xuICAgIH0pXG4gIH1cblxuICAkc2NvcGUudmlld1NlYXJjaCA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgJGxvY2F0aW9uLnBhdGgoYC9yZXN1bHRzLyR7aWR9YClcbiAgfVxuXG4gICRzY29wZS51cGRhdGVTZWFyY2ggPSBmdW5jdGlvbihpZCwgJGluZGV4KXtcbiAgICAkc2NvcGUudXNlck9iai5zZWFyY2hlc1skaW5kZXhdLnVwZGF0aW5nID0gdHJ1ZVxuICAgICRzY29wZS51cGRhdGluZyA9IHRydWU7XG4gICAgc2VhcmNoU2VydmljZS51cGRhdGVTZWFyY2goaWQpLnRoZW4oZnVuY3Rpb24ocmVzdWx0cyl7XG4gICAgICAkc2NvcGUudXNlck9iai5zZWFyY2hlc1skaW5kZXhdLnVwZGF0aW5nID0gZmFsc2VcbiAgICAgICRzY29wZS51c2VyT2JqID0gcmVzdWx0c1xuICAgIH0pXG4gIH1cbn0pXG4iLCJyZXF1aXJlKCcuL2F1dGhDdHJsLmpzJylcbnJlcXVpcmUoJy4vZGFzaEN0cmwuanMnKVxucmVxdWlyZSgnLi9tYWluQ3RybC5qcycpXG5yZXF1aXJlKCcuL3Jlc3VsdHNDdHJsLmpzJylcbiIsImFwcC5jb250cm9sbGVyKCdNYWluQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJGh0dHAsICRyb290U2NvcGUsIHNlYXJjaFNlcnZpY2UsIHN0YXRlTGlzdFNlcnZpY2UsICRsb2NhdGlvbiwgYXV0aFNlcnZpY2UsIHVzZXJTZXJ2aWNlLCAkd2luZG93LCAkcSkge1xuXG4gICRzY29wZS5zdGF0ZUNob2ljZSA9IHVuZGVmaW5lZDtcbiAgJHNjb3BlLnJlZ2lvbkNob2ljZSA9IHVuZGVmaW5lZDtcblxuICBzdGF0ZUxpc3RTZXJ2aWNlLnJldHJpZXZlKCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuc3RhdGVMaXN0UHJvdG8gPSBzdGF0ZUxpc3RTZXJ2aWNlLnJlc3VsdHNBcnJHZXR0ZXIoKTtcbiAgfSlcblxuICAkc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgYXV0aFNlcnZpY2UubG9nb3V0KClcbiAgICAkcm9vdFNjb3BlLnVzZXJuYW1lID0gbnVsbFxuICB9XG5cbiAgJHNjb3BlLmhvbWUgPSBmdW5jdGlvbigpIHtcbiAgICAkbG9jYXRpb24ucGF0aCgnLycpXG4gIH1cblxuICAkc2NvcGUuJHdhdGNoKGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICR3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2NyYWlnc2JsaXNzLXRva2VuJylcbiAgICB9LFxuICAgIGZ1bmN0aW9uKG5ld1ZhbHVlKSB7XG4gICAgICBpZiAobmV3VmFsdWUpIHtcbiAgICAgICAgbGV0IGRlY29kZWRQYXlsb2FkID0gSlNPTi5wYXJzZShhdG9iKG5ld1ZhbHVlLnNwbGl0KCcuJylbMV0pKVxuICAgICAgICAkcm9vdFNjb3BlLnVzZXJuYW1lID0gZGVjb2RlZFBheWxvYWQudXNlcm5hbWVcbiAgICAgIH1cbiAgICB9LFxuICAgIHRydWVcbiAgKVxuXG4gICRzY29wZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5zdWJtaXR0ZWQgPSBmYWxzZTtcbiAgfVxuXG4gICRzY29wZS5kYXNoYm9hcmQgPSBmdW5jdGlvbigpIHtcbiAgICB1c2VyU2VydmljZS5nZXRVc2VyKClcbiAgfVxuXG4gICRzY29wZS5zdWJtaXQgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuc3VibWl0dGVkID0gdHJ1ZTtcbiAgICBpZiAoJHNjb3BlLm1heF9wcmljZSA8ICRzY29wZS5taW5fcHJpY2UpIHtcbiAgICAgICRzY29wZS5tYXhTbWFsbGVyID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCRzY29wZS5zdGF0ZUNob2ljZSAmJiAkc2NvcGUucmVnaW9uQ2hvaWNlKSB7XG4gICAgICAgIGxldCBzZWFyY2hQYXJhbXMgPSB7XG4gICAgICAgICAgcmVnaW9uQ2hvaWNlOiAkc2NvcGUucmVnaW9uQ2hvaWNlLFxuICAgICAgICAgIHVwZGF0ZWQ6IERhdGUubm93KCksXG4gICAgICAgICAgcXVlcnk6ICRzY29wZS5xdWVyeSxcbiAgICAgICAgICBzZWFyY2hfZGlzdGFuY2U6ICRzY29wZS5kaXN0YW5jZSxcbiAgICAgICAgICBwb3N0YWw6ICRzY29wZS5wb3N0YWwsXG4gICAgICAgICAgbWluX3ByaWNlOiAkc2NvcGUubWluX3ByaWNlLFxuICAgICAgICAgIG1heF9wcmljZTogJHNjb3BlLm1heF9wcmljZVxuICAgICAgICB9XG4gICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlWydzZWFyY2hQYXJhbXMnXSA9IEpTT04uc3RyaW5naWZ5KHNlYXJjaFBhcmFtcylcbiAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2VbJ3JlZ2lvbkNob2ljZSddID0gJHNjb3BlLnJlZ2lvbkNob2ljZVxuICAgICAgICAkbG9jYXRpb24ucGF0aCgnL3Jlc3VsdHMnKVxuICAgICAgfVxuICAgIH1cbiAgfVxufSlcbiIsImFwcC5jb250cm9sbGVyKCdyZXN1bHRzQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJHJvdXRlUGFyYW1zLCAkcm9vdFNjb3BlLCAkbG9jYXRpb24sICRtZERpYWxvZywgc2VhcmNoU2VydmljZSwgcG9zdFNlcnZpY2UsICR3aW5kb3cpIHtcblxuICAkc2NvcGUubG9hZGluZyA9IHRydWU7XG4gICRzY29wZS5sb2FkaW5nTWVzc2FnZSA9IGBMb2FkaW5nIHlvdXIgcmVzdWx0cy4uLmBcbiAgJHNjb3BlLnNob3dTYXZlID0gdHJ1ZTtcblxuICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gYFRoYW5rIHlvdSBmb3IgeW91ciBwYXRpZW5jZS4uLmBcbiAgICAkc2NvcGUuJGFwcGx5KClcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAkc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBgU2VhcmNoZXMgcmV0dXJuaW5nIG1hbnkgcmVzdWx0cyBjYW4gdGFrZSB0aW1lIHRvIHByb2Nlc3MuLi5gXG4gICAgICAkc2NvcGUuJGFwcGx5KClcbiAgICB9LCA0MDAwKVxuICB9LCA0MDAwKVxuXG5cbiAgaWYgKCEkcm91dGVQYXJhbXMuc2VhcmNoSWQpIHtcbiAgICBsZXQgc2VhcmNoT2JqID0ge31cbiAgICBzZWFyY2hPYmoucmVnaW9uQ2hvaWNlID0gJHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVnaW9uQ2hvaWNlXG4gICAgc2VhcmNoT2JqLnNlYXJjaFBhcmFtcyA9IEpTT04ucGFyc2UoJHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2VhcmNoUGFyYW1zKVxuICAgIHNlYXJjaFNlcnZpY2UubmV3U2VhcmNoKHNlYXJjaE9iaikudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICAkc2NvcGUucmVzdWx0c09iaiA9IHNlYXJjaFNlcnZpY2UucmVzdWx0c09iakdldHRlcigpO1xuICAgICAgJHNjb3BlLmR1cGVDb3VudCA9ICRzY29wZS5yZXN1bHRzT2JqLmR1cGVDb3VudFxuICAgICAgJHNjb3BlLmZhdkNvdW50ID0gJHNjb3BlLnJlc3VsdHNPYmouZmF2Q291bnRcbiAgICAgICRzY29wZS5sb2FkaW5nID0gZmFsc2U7XG4gICAgfSlcbiAgfSBlbHNlIHtcbiAgICAkc2NvcGUuc2hvd1NhdmUgPSBmYWxzZTtcbiAgICBzZWFyY2hTZXJ2aWNlLnZpZXdTZWFyY2goJHJvdXRlUGFyYW1zLnNlYXJjaElkKS50aGVuKGZ1bmN0aW9uKCl7XG4gICAgICAkc2NvcGUucmVzdWx0c09iaiA9IHNlYXJjaFNlcnZpY2UucmVzdWx0c09iakdldHRlcigpXG4gICAgICAkc2NvcGUuZHVwZUNvdW50ID0gJHNjb3BlLnJlc3VsdHNPYmouZHVwZUNvdW50XG4gICAgICAkc2NvcGUuZmF2Q291bnQgPSAkc2NvcGUucmVzdWx0c09iai5mYXZDb3VudFxuICAgICAgJHNjb3BlLmxvYWRpbmcgPSBmYWxzZTtcbiAgICB9KVxuICB9XG5cbiAgJHNjb3BlLmR1cGVTaG93ID0gZmFsc2VcbiAgJHNjb3BlLmltYWdlSGlkZSA9IGZhbHNlXG4gICRzY29wZS5mYXZPbmx5ID0gZmFsc2VcblxuICAkc2NvcGUuZGVsZXRlID0gZnVuY3Rpb24ocmVzdWx0SWQpIHtcbiAgICBwb3N0U2VydmljZS5kZWxldGUoJHNjb3BlLnJlc3VsdHNPYmouX2lkLCByZXN1bHRJZCkudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICBzZWFyY2hTZXJ2aWNlLnJlc3VsdHNPYmpTZXR0ZXIocmVzdWx0cylcbiAgICAgICRzY29wZS5yZXN1bHRzT2JqID0gc2VhcmNoU2VydmljZS5yZXN1bHRzT2JqR2V0dGVyKClcbiAgICB9KVxuICB9XG5cbiAgJHNjb3BlLmZhdm9yaXRlID0gZnVuY3Rpb24ocmVzdWx0SWQpe1xuICAgIHBvc3RTZXJ2aWNlLmZhdm9yaXRlKCRzY29wZS5yZXN1bHRzT2JqLl9pZCwgcmVzdWx0SWQpLnRoZW4oZnVuY3Rpb24ocmVzdWx0cyl7XG4gICAgICAkc2NvcGUucmVzdWx0c09iaiA9IHNlYXJjaFNlcnZpY2UucmVzdWx0c09iakdldHRlcigpXG4gICAgICBjb25zb2xlLmxvZygnZmF2b3JpdGVkITonLCAkc2NvcGUucmVzdWx0c09iaik7XG4gICAgfSlcbiAgfVxuXG4gICRzY29wZS51bmZhdm9yaXRlID0gZnVuY3Rpb24ocmVzdWx0SWQpe1xuICAgIHBvc3RTZXJ2aWNlLnVuZmF2b3JpdGUoJHNjb3BlLnJlc3VsdHNPYmouX2lkLCByZXN1bHRJZCkudGhlbihmdW5jdGlvbihyZXN1bHRzKXtcbiAgICAgICRzY29wZS5yZXN1bHRzT2JqID0gc2VhcmNoU2VydmljZS5yZXN1bHRzT2JqR2V0dGVyKClcbiAgICAgIGNvbnNvbGUubG9nKCd1bmZhdm9yaXRlZCE6JywgJHNjb3BlLnJlc3VsdHNPYmopO1xuICAgIH0pXG4gIH1cblxuICAkc2NvcGUuZGVsZXRlQW5vbiA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgbGV0IGRlbGV0ZWQgPSAkc2NvcGUucmVzdWx0c09iai5yZXN1bHRzLnNwbGljZShpbmRleCwgMSlcbiAgICBjb25zb2xlLmxvZyhkZWxldGVkWzBdKTtcbiAgICBpZiAoZGVsZXRlZFswXS5kdXBlKSB7XG4gICAgICAkc2NvcGUuZHVwZUNvdW50LS1cbiAgICB9IGVsc2Uge1xuICAgICAgJHNjb3BlLnJlc3VsdHNPYmoucmVzdWx0Q291bnQtLVxuICAgIH1cbiAgfVxuXG4gICRzY29wZS5kZWxldGVEdXBlcyA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBkdXBlc1JlbW92ZWQgPSAkc2NvcGUucmVzdWx0c09iai5yZXN1bHRzLmZpbHRlcihmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgIHJldHVybiAhcmVzdWx0LmR1cGVcbiAgICB9KVxuXG4gICAgaWYgKCRzY29wZS5yZXN1bHRzT2JqLl9pZCkge1xuICAgICAgcG9zdFNlcnZpY2UuZGVsZXRlRHVwZXMoJHNjb3BlLnJlc3VsdHNPYmouX2lkLCBkdXBlc1JlbW92ZWQpLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgICAkc2NvcGUucmVzdWx0c09iaiA9IHNlYXJjaFNlcnZpY2UucmVzdWx0c09iakdldHRlcigpXG4gICAgICAgICRzY29wZS5kdXBlQ291bnQgPSAkc2NvcGUucmVzdWx0c09iai5kdXBlQ291bnQ7XG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICAkc2NvcGUucmVzdWx0c09iai5yZXN1bHRzID0gZHVwZXNSZW1vdmVkXG4gICAgICAkc2NvcGUuZHVwZUNvdW50ID0gMFxuICAgIH1cbiAgfVxuXG4gICRzY29wZS5zYXZlRGlhbG9nID0gZnVuY3Rpb24oKSB7XG5cbiAgICBpZiAoJHJvb3RTY29wZS51c2VybmFtZSl7XG4gICAgICAkbWREaWFsb2cuc2hvdyhcbiAgICAgICAgJG1kRGlhbG9nLnByb21wdCgpXG4gICAgICAgIC5jbGlja091dHNpZGVUb0Nsb3NlKHRydWUpXG4gICAgICAgIC50aXRsZSgnUGxlYXNlIGNob29zZSBhIG5hbWUgZm9yIHlvdXIgc2VhcmNoLicpXG4gICAgICAgIC5vcGVuRnJvbSgnLmNvbnRyb2xfcGFuZWxfY29udGFpbmVyJylcbiAgICAgICAgLm9rKCdTYXZlJylcbiAgICAgICkudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICAgIGxldCBzZWFyY2ggPSBPYmplY3QuYXNzaWduKHt9LCAkc2NvcGUucmVzdWx0c09iailcbiAgICAgICAgZGVsZXRlIHNlYXJjaC5kdXBlQ291bnRcbiAgICAgICAgZGVsZXRlIHNlYXJjaC5yZXN1bHRDb3VudFxuICAgICAgICBzZWFyY2gudGl0bGUgPSByZXN1bHRzXG4gICAgICAgIHNlYXJjaFNlcnZpY2Uuc2F2ZVNlYXJjaChzZWFyY2gpLnRoZW4oZnVuY3Rpb24ocmVzdWx0cyl7XG4gICAgICAgICAgY29uc29sZS5sb2coJ3Jlc3VsdHMgZnJvbSBzYXZlIGluIGNvbnRyb2xsZXI6JywgcmVzdWx0cyk7XG4gICAgICAgICAgJGxvY2F0aW9uLnBhdGgoYC9yZXN1bHRzLyR7cmVzdWx0cy5pZH1gKVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgJG1kRGlhbG9nLnNob3coXG4gICAgICAgICRtZERpYWxvZy5hbGVydCgpXG4gICAgICAgIC5jbGlja091dHNpZGVUb0Nsb3NlKHRydWUpXG4gICAgICAgIC50aXRsZSgnWW91IG11c3QgYmUgbG9nZ2VkIGluIHRvIHNhdmUgc2VhcmNoZXMuJylcbiAgICAgICAgLm9rKCdPa2F5JylcbiAgICAgIClcbiAgICB9XG4gIH1cbn0pXG4iXX0=

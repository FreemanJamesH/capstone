(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
app.controller('AuthController', function($scope, $http, $location, authService, userService) {  $scope.user = {};

  $scope.signup = function() {
    userService.signup($scope.user)
  }

  $scope.login = function() {
    userService.login($scope.user)
  }

})

},{}],2:[function(require,module,exports){
app.controller('dashController', function($scope, $location, userService, searchService) {

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
})

},{}],3:[function(require,module,exports){
require('./authCtrl.js')
require('./dashCtrl.js')
require('./mainCtrl.js')
require('./resultsCtrl.js')

},{"./authCtrl.js":1,"./dashCtrl.js":2,"./mainCtrl.js":4,"./resultsCtrl.js":5}],4:[function(require,module,exports){
app.controller('MainController', function($scope, $http, searchService, stateListService, $location, authService, userService, $window, $q) {

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

  $scope.dashboard = function() {
    userService.getUser()
  }

  $scope.submit = function() {
    let url = $scope.regionChoice + 'search/apa?'
    let searchParams = {
      query: $scope.query,
      distance: $scope.distance,
      postal: $scope.distance,
      min_price: $scope.min_price,
      max_price: $scope.max_price
    }
    for (var param in searchParams) {
      if (searchParams[param]) {
        url += `&${param}=${searchParams[param]}`
      }
    }
    $window.localStorage['searchParams'] = JSON.stringify(searchParams)
    $window.localStorage['url'] = url
    $window.localStorage['regionChoice'] = $scope.regionChoice
    $location.path('/results')
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
    searchObj.url = $window.localStorage.url
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhdXRoQ3RybC5qcyIsImRhc2hDdHJsLmpzIiwiaW5kZXguanMiLCJtYWluQ3RybC5qcyIsInJlc3VsdHNDdHJsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiYXBwLmNvbnRyb2xsZXIoJ0F1dGhDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkaHR0cCwgJGxvY2F0aW9uLCBhdXRoU2VydmljZSwgdXNlclNlcnZpY2UpIHsgICRzY29wZS51c2VyID0ge307XG5cbiAgJHNjb3BlLnNpZ251cCA9IGZ1bmN0aW9uKCkge1xuICAgIHVzZXJTZXJ2aWNlLnNpZ251cCgkc2NvcGUudXNlcilcbiAgfVxuXG4gICRzY29wZS5sb2dpbiA9IGZ1bmN0aW9uKCkge1xuICAgIHVzZXJTZXJ2aWNlLmxvZ2luKCRzY29wZS51c2VyKVxuICB9XG5cbn0pXG4iLCJhcHAuY29udHJvbGxlcignZGFzaENvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRsb2NhdGlvbiwgdXNlclNlcnZpY2UsIHNlYXJjaFNlcnZpY2UpIHtcblxuICB1c2VyU2VydmljZS5nZXRVc2VyKCkudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgJHNjb3BlLnVzZXJPYmogPSByZXN1bHRzXG4gIH0pXG5cbiAgJHNjb3BlLmRlbGV0ZVNlYXJjaCA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgc2VhcmNoU2VydmljZS5kZWxldGVTZWFyY2goaWQpLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgJHNjb3BlLnVzZXJPYmogPSByZXN1bHRzXG4gICAgfSlcbiAgfVxuXG4gICRzY29wZS52aWV3U2VhcmNoID0gZnVuY3Rpb24oaWQpIHtcbiAgICAkbG9jYXRpb24ucGF0aChgL3Jlc3VsdHMvJHtpZH1gKVxuICB9XG59KVxuIiwicmVxdWlyZSgnLi9hdXRoQ3RybC5qcycpXG5yZXF1aXJlKCcuL2Rhc2hDdHJsLmpzJylcbnJlcXVpcmUoJy4vbWFpbkN0cmwuanMnKVxucmVxdWlyZSgnLi9yZXN1bHRzQ3RybC5qcycpXG4iLCJhcHAuY29udHJvbGxlcignTWFpbkNvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRodHRwLCBzZWFyY2hTZXJ2aWNlLCBzdGF0ZUxpc3RTZXJ2aWNlLCAkbG9jYXRpb24sIGF1dGhTZXJ2aWNlLCB1c2VyU2VydmljZSwgJHdpbmRvdywgJHEpIHtcblxuICBzdGF0ZUxpc3RTZXJ2aWNlLnJldHJpZXZlKCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuc3RhdGVMaXN0UHJvdG8gPSBzdGF0ZUxpc3RTZXJ2aWNlLnJlc3VsdHNBcnJHZXR0ZXIoKTtcbiAgfSlcblxuICAkc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgYXV0aFNlcnZpY2UubG9nb3V0KClcbiAgICAkc2NvcGUudXNlcm5hbWUgPSBudWxsXG4gIH1cblxuICAkc2NvcGUuaG9tZSA9IGZ1bmN0aW9uKCkge1xuICAgICRsb2NhdGlvbi5wYXRoKCcvJylcbiAgfVxuXG4gICRzY29wZS4kd2F0Y2goZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gJHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnY3JhaWdzYmxpc3MtdG9rZW4nKVxuICAgIH0sXG4gICAgZnVuY3Rpb24obmV3VmFsdWUpIHtcbiAgICAgIGlmIChuZXdWYWx1ZSkge1xuICAgICAgICBsZXQgZGVjb2RlZFBheWxvYWQgPSBKU09OLnBhcnNlKGF0b2IobmV3VmFsdWUuc3BsaXQoJy4nKVsxXSkpXG4gICAgICAgICRzY29wZS51c2VybmFtZSA9IGRlY29kZWRQYXlsb2FkLnVzZXJuYW1lXG4gICAgICB9XG4gICAgfSxcbiAgICB0cnVlXG4gIClcblxuICAkc2NvcGUuZGFzaGJvYXJkID0gZnVuY3Rpb24oKSB7XG4gICAgdXNlclNlcnZpY2UuZ2V0VXNlcigpXG4gIH1cblxuICAkc2NvcGUuc3VibWl0ID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IHVybCA9ICRzY29wZS5yZWdpb25DaG9pY2UgKyAnc2VhcmNoL2FwYT8nXG4gICAgbGV0IHNlYXJjaFBhcmFtcyA9IHtcbiAgICAgIHF1ZXJ5OiAkc2NvcGUucXVlcnksXG4gICAgICBkaXN0YW5jZTogJHNjb3BlLmRpc3RhbmNlLFxuICAgICAgcG9zdGFsOiAkc2NvcGUuZGlzdGFuY2UsXG4gICAgICBtaW5fcHJpY2U6ICRzY29wZS5taW5fcHJpY2UsXG4gICAgICBtYXhfcHJpY2U6ICRzY29wZS5tYXhfcHJpY2VcbiAgICB9XG4gICAgZm9yICh2YXIgcGFyYW0gaW4gc2VhcmNoUGFyYW1zKSB7XG4gICAgICBpZiAoc2VhcmNoUGFyYW1zW3BhcmFtXSkge1xuICAgICAgICB1cmwgKz0gYCYke3BhcmFtfT0ke3NlYXJjaFBhcmFtc1twYXJhbV19YFxuICAgICAgfVxuICAgIH1cbiAgICAkd2luZG93LmxvY2FsU3RvcmFnZVsnc2VhcmNoUGFyYW1zJ10gPSBKU09OLnN0cmluZ2lmeShzZWFyY2hQYXJhbXMpXG4gICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2VbJ3VybCddID0gdXJsXG4gICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2VbJ3JlZ2lvbkNob2ljZSddID0gJHNjb3BlLnJlZ2lvbkNob2ljZVxuICAgICRsb2NhdGlvbi5wYXRoKCcvcmVzdWx0cycpXG4gIH1cbn0pXG4iLCJhcHAuY29udHJvbGxlcigncmVzdWx0c0NvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRyb3V0ZVBhcmFtcywgJG1kRGlhbG9nLCBzZWFyY2hTZXJ2aWNlLCBwb3N0U2VydmljZSwgJHdpbmRvdykge1xuXG4gICRzY29wZS5sb2FkaW5nID0gdHJ1ZTtcbiAgJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gYExvYWRpbmcgeW91ciByZXN1bHRzLi4uYFxuXG4gIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAkc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBgVGhhbmsgeW91IGZvciB5b3VyIHBhdGllbmNlLi4uYFxuICAgICRzY29wZS4kYXBwbHkoKVxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICRzY29wZS5sb2FkaW5nTWVzc2FnZSA9IGBTZWFyY2hlcyByZXR1cm5pbmcgbWFueSByZXN1bHRzIGNhbiB0YWtlIHRpbWUgdG8gcHJvY2Vzcy4uLmBcbiAgICAgICRzY29wZS4kYXBwbHkoKVxuICAgIH0sIDQwMDApXG4gIH0sIDQwMDApXG5cblxuICBpZiAoISRyb3V0ZVBhcmFtcy5zZWFyY2hJZCkge1xuICAgIGxldCBzZWFyY2hPYmogPSB7fVxuICAgIHNlYXJjaE9iai5yZWdpb25DaG9pY2UgPSAkd2luZG93LmxvY2FsU3RvcmFnZS5yZWdpb25DaG9pY2VcbiAgICBzZWFyY2hPYmoudXJsID0gJHdpbmRvdy5sb2NhbFN0b3JhZ2UudXJsXG4gICAgc2VhcmNoT2JqLnNlYXJjaFBhcmFtcyA9IEpTT04ucGFyc2UoJHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2VhcmNoUGFyYW1zKVxuICAgIHNlYXJjaFNlcnZpY2UubmV3U2VhcmNoKHNlYXJjaE9iaikudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICAkc2NvcGUucmVzdWx0c09iaiA9IHNlYXJjaFNlcnZpY2UucmVzdWx0c09iakdldHRlcigpO1xuICAgICAgJHNjb3BlLmR1cGVDb3VudCA9ICRzY29wZS5yZXN1bHRzT2JqLmR1cGVDb3VudFxuICAgICAgJHNjb3BlLmZhdkNvdW50ID0gJHNjb3BlLnJlc3VsdHNPYmouZmF2Q291bnRcbiAgICAgICRzY29wZS5sb2FkaW5nID0gZmFsc2U7XG4gICAgfSlcbiAgfSBlbHNlIHtcbiAgICBzZWFyY2hTZXJ2aWNlLnZpZXdTZWFyY2goJHJvdXRlUGFyYW1zLnNlYXJjaElkKS50aGVuKGZ1bmN0aW9uKCl7XG4gICAgICAkc2NvcGUucmVzdWx0c09iaiA9IHNlYXJjaFNlcnZpY2UucmVzdWx0c09iakdldHRlcigpXG4gICAgICAkc2NvcGUuZHVwZUNvdW50ID0gJHNjb3BlLnJlc3VsdHNPYmouZHVwZUNvdW50XG4gICAgICAkc2NvcGUuZmF2Q291bnQgPSAkc2NvcGUucmVzdWx0c09iai5mYXZDb3VudFxuICAgICAgJHNjb3BlLmxvYWRpbmcgPSBmYWxzZTtcbiAgICB9KVxuICB9XG5cbiAgJHNjb3BlLmR1cGVTaG93ID0gZmFsc2VcbiAgJHNjb3BlLmltYWdlSGlkZSA9IGZhbHNlXG4gICRzY29wZS5mYXZPbmx5ID0gZmFsc2VcblxuICAkc2NvcGUuZGVsZXRlID0gZnVuY3Rpb24ocmVzdWx0SWQpIHtcbiAgICBwb3N0U2VydmljZS5kZWxldGUoJHNjb3BlLnJlc3VsdHNPYmouX2lkLCByZXN1bHRJZCkudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICBzZWFyY2hTZXJ2aWNlLnJlc3VsdHNPYmpTZXR0ZXIocmVzdWx0cylcbiAgICAgICRzY29wZS5yZXN1bHRzT2JqID0gc2VhcmNoU2VydmljZS5yZXN1bHRzT2JqR2V0dGVyKClcbiAgICB9KVxuICB9XG5cbiAgJHNjb3BlLmZhdm9yaXRlID0gZnVuY3Rpb24ocmVzdWx0SWQpe1xuICAgIHBvc3RTZXJ2aWNlLmZhdm9yaXRlKCRzY29wZS5yZXN1bHRzT2JqLl9pZCwgcmVzdWx0SWQpLnRoZW4oZnVuY3Rpb24ocmVzdWx0cyl7XG4gICAgICAkc2NvcGUucmVzdWx0c09iaiA9IHNlYXJjaFNlcnZpY2UucmVzdWx0c09iakdldHRlcigpXG4gICAgfSlcbiAgfVxuXG4gICRzY29wZS51bmZhdm9yaXRlID0gZnVuY3Rpb24ocmVzdWx0SWQpe1xuICAgIHBvc3RTZXJ2aWNlLnVuZmF2b3JpdGUoJHNjb3BlLnJlc3VsdHNPYmouX2lkLCByZXN1bHRJZCkudGhlbihmdW5jdGlvbihyZXN1bHRzKXtcbiAgICAgICRzY29wZS5yZXN1bHRzT2JqID0gc2VhcmNoU2VydmljZS5yZXN1bHRzT2JqR2V0dGVyKClcbiAgICB9KVxuICB9XG5cbiAgJHNjb3BlLmRlbGV0ZUFub24gPSBmdW5jdGlvbihpbmRleCkge1xuICAgIGxldCBkZWxldGVkID0gJHNjb3BlLnJlc3VsdHNPYmoucmVzdWx0cy5zcGxpY2UoaW5kZXgsIDEpXG4gICAgY29uc29sZS5sb2coZGVsZXRlZFswXSk7XG4gICAgaWYgKGRlbGV0ZWRbMF0uZHVwZSkge1xuICAgICAgJHNjb3BlLmR1cGVDb3VudC0tXG4gICAgfSBlbHNlIHtcbiAgICAgICRzY29wZS5yZXN1bHRzT2JqLnJlc3VsdENvdW50LS1cbiAgICB9XG4gIH1cblxuICAkc2NvcGUuZGVsZXRlRHVwZXMgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgZHVwZXNSZW1vdmVkID0gJHNjb3BlLnJlc3VsdHNPYmoucmVzdWx0cy5maWx0ZXIoZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICByZXR1cm4gIXJlc3VsdC5kdXBlXG4gICAgfSlcblxuICAgIGlmICgkc2NvcGUucmVzdWx0c09iai5faWQpIHtcbiAgICAgIHBvc3RTZXJ2aWNlLmRlbGV0ZUR1cGVzKCRzY29wZS5yZXN1bHRzT2JqLl9pZCwgZHVwZXNSZW1vdmVkKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgICAgJHNjb3BlLnJlc3VsdHNPYmogPSBzZWFyY2hTZXJ2aWNlLnJlc3VsdHNPYmpHZXR0ZXIoKVxuICAgICAgICAkc2NvcGUuZHVwZUNvdW50ID0gJHNjb3BlLnJlc3VsdHNPYmouZHVwZUNvdW50O1xuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgJHNjb3BlLnJlc3VsdHNPYmoucmVzdWx0cyA9IGR1cGVzUmVtb3ZlZFxuICAgICAgJHNjb3BlLmR1cGVDb3VudCA9IDBcbiAgICB9XG4gIH1cblxuICAkc2NvcGUuc2F2ZURpYWxvZyA9IGZ1bmN0aW9uKCkge1xuICAgICRtZERpYWxvZy5zaG93KFxuICAgICAgJG1kRGlhbG9nLnByb21wdCgpXG4gICAgICAuY2xpY2tPdXRzaWRlVG9DbG9zZSh0cnVlKVxuICAgICAgLnRpdGxlKCdQbGVhc2UgY2hvb3NlIGEgbmFtZSBmb3IgeW91ciBzZWFyY2guJylcbiAgICAgIC5vcGVuRnJvbSgnLmNvbnRyb2xfcGFuZWxfY29udGFpbmVyJylcbiAgICAgIC5vaygnU2F2ZScpXG4gICAgKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgIGxldCBzZWFyY2ggPSBPYmplY3QuYXNzaWduKHt9LCAkc2NvcGUucmVzdWx0c09iailcbiAgICAgIGRlbGV0ZSBzZWFyY2guZHVwZUNvdW50XG4gICAgICBkZWxldGUgc2VhcmNoLnJlc3VsdENvdW50XG4gICAgICBzZWFyY2gudGl0bGUgPSByZXN1bHRzXG4gICAgICBzZWFyY2hTZXJ2aWNlLnNhdmVTZWFyY2goc2VhcmNoKVxuICAgIH0pXG4gIH1cbn0pXG4iXX0=

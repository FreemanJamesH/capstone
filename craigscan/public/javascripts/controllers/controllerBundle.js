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

  $scope.logout = function(){
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
    var searchParams = {};
    searchParams.regionChoice = $scope.regionChoice
    searchParams.url = 'ht' + $scope.regionChoice + 'search/apa?'
    if ($scope.query) {
      searchParams.url += ('&query=' + $scope.query)
    }
    if ($scope.distance) {
      searchParams.url += ('&search_distance=' + $scope.distance)
    }
    if ($scope.postal) {
      searchParams.url += ('&postal=' + $scope.postal)
    }
    if ($scope.min_price) {
      searchParams.url += ('&min_price=' + $scope.min_price)
    }
    if ($scope.max_price) {
      searchParams.url += ('&max_price=' + $scope.max_price)
    }
    searchParams.title = $scope.scantitle
    $window.localStorage['url'] = searchParams.url
    $window.localStorage['regionChoice'] = searchParams.regionChoice
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
    let searchParams = {}
    searchParams.regionChoice = $window.localStorage.regionChoice
    searchParams.url = $window.localStorage.url
    searchService.newSearch(searchParams).then(function(results) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhdXRoQ3RybC5qcyIsImRhc2hDdHJsLmpzIiwiaW5kZXguanMiLCJtYWluQ3RybC5qcyIsInJlc3VsdHNDdHJsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJhcHAuY29udHJvbGxlcignQXV0aENvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRodHRwLCAkbG9jYXRpb24sIGF1dGhTZXJ2aWNlLCB1c2VyU2VydmljZSkgeyAgJHNjb3BlLnVzZXIgPSB7fTtcblxuICAkc2NvcGUuc2lnbnVwID0gZnVuY3Rpb24oKSB7XG4gICAgdXNlclNlcnZpY2Uuc2lnbnVwKCRzY29wZS51c2VyKVxuICB9XG5cbiAgJHNjb3BlLmxvZ2luID0gZnVuY3Rpb24oKSB7XG4gICAgdXNlclNlcnZpY2UubG9naW4oJHNjb3BlLnVzZXIpXG4gIH1cblxufSlcbiIsImFwcC5jb250cm9sbGVyKCdkYXNoQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJGxvY2F0aW9uLCB1c2VyU2VydmljZSwgc2VhcmNoU2VydmljZSkge1xuXG4gIHVzZXJTZXJ2aWNlLmdldFVzZXIoKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAkc2NvcGUudXNlck9iaiA9IHJlc3VsdHNcbiAgfSlcblxuICAkc2NvcGUuZGVsZXRlU2VhcmNoID0gZnVuY3Rpb24oaWQpIHtcbiAgICBzZWFyY2hTZXJ2aWNlLmRlbGV0ZVNlYXJjaChpZCkudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICAkc2NvcGUudXNlck9iaiA9IHJlc3VsdHNcbiAgICB9KVxuICB9XG5cbiAgJHNjb3BlLnZpZXdTZWFyY2ggPSBmdW5jdGlvbihpZCkge1xuICAgICRsb2NhdGlvbi5wYXRoKGAvcmVzdWx0cy8ke2lkfWApXG4gIH1cbn0pXG4iLCJyZXF1aXJlKCcuL2F1dGhDdHJsLmpzJylcbnJlcXVpcmUoJy4vZGFzaEN0cmwuanMnKVxucmVxdWlyZSgnLi9tYWluQ3RybC5qcycpXG5yZXF1aXJlKCcuL3Jlc3VsdHNDdHJsLmpzJylcbiIsImFwcC5jb250cm9sbGVyKCdNYWluQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJGh0dHAsIHNlYXJjaFNlcnZpY2UsIHN0YXRlTGlzdFNlcnZpY2UsICRsb2NhdGlvbiwgYXV0aFNlcnZpY2UsIHVzZXJTZXJ2aWNlLCAkd2luZG93LCAkcSkge1xuXG4gIHN0YXRlTGlzdFNlcnZpY2UucmV0cmlldmUoKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5zdGF0ZUxpc3RQcm90byA9IHN0YXRlTGlzdFNlcnZpY2UucmVzdWx0c0FyckdldHRlcigpO1xuICB9KVxuXG4gICRzY29wZS5sb2dvdXQgPSBmdW5jdGlvbigpe1xuICAgIGF1dGhTZXJ2aWNlLmxvZ291dCgpXG4gICAgJHNjb3BlLnVzZXJuYW1lID0gbnVsbFxuICB9XG5cbiAgJHNjb3BlLmhvbWUgPSBmdW5jdGlvbigpIHtcbiAgICAkbG9jYXRpb24ucGF0aCgnLycpXG4gIH1cblxuICAkc2NvcGUuJHdhdGNoKGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICR3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2NyYWlnc2JsaXNzLXRva2VuJylcbiAgICB9LFxuICAgIGZ1bmN0aW9uKG5ld1ZhbHVlKSB7XG4gICAgICBpZiAobmV3VmFsdWUpIHtcbiAgICAgICAgbGV0IGRlY29kZWRQYXlsb2FkID0gSlNPTi5wYXJzZShhdG9iKG5ld1ZhbHVlLnNwbGl0KCcuJylbMV0pKVxuICAgICAgICAkc2NvcGUudXNlcm5hbWUgPSBkZWNvZGVkUGF5bG9hZC51c2VybmFtZVxuICAgICAgfVxuICAgIH0sXG4gICAgdHJ1ZVxuICApXG5cbiAgJHNjb3BlLmRhc2hib2FyZCA9IGZ1bmN0aW9uKCkge1xuICAgIHVzZXJTZXJ2aWNlLmdldFVzZXIoKVxuICB9XG5cbiAgJHNjb3BlLnN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWFyY2hQYXJhbXMgPSB7fTtcbiAgICBzZWFyY2hQYXJhbXMucmVnaW9uQ2hvaWNlID0gJHNjb3BlLnJlZ2lvbkNob2ljZVxuICAgIHNlYXJjaFBhcmFtcy51cmwgPSAnaHQnICsgJHNjb3BlLnJlZ2lvbkNob2ljZSArICdzZWFyY2gvYXBhPydcbiAgICBpZiAoJHNjb3BlLnF1ZXJ5KSB7XG4gICAgICBzZWFyY2hQYXJhbXMudXJsICs9ICgnJnF1ZXJ5PScgKyAkc2NvcGUucXVlcnkpXG4gICAgfVxuICAgIGlmICgkc2NvcGUuZGlzdGFuY2UpIHtcbiAgICAgIHNlYXJjaFBhcmFtcy51cmwgKz0gKCcmc2VhcmNoX2Rpc3RhbmNlPScgKyAkc2NvcGUuZGlzdGFuY2UpXG4gICAgfVxuICAgIGlmICgkc2NvcGUucG9zdGFsKSB7XG4gICAgICBzZWFyY2hQYXJhbXMudXJsICs9ICgnJnBvc3RhbD0nICsgJHNjb3BlLnBvc3RhbClcbiAgICB9XG4gICAgaWYgKCRzY29wZS5taW5fcHJpY2UpIHtcbiAgICAgIHNlYXJjaFBhcmFtcy51cmwgKz0gKCcmbWluX3ByaWNlPScgKyAkc2NvcGUubWluX3ByaWNlKVxuICAgIH1cbiAgICBpZiAoJHNjb3BlLm1heF9wcmljZSkge1xuICAgICAgc2VhcmNoUGFyYW1zLnVybCArPSAoJyZtYXhfcHJpY2U9JyArICRzY29wZS5tYXhfcHJpY2UpXG4gICAgfVxuICAgIHNlYXJjaFBhcmFtcy50aXRsZSA9ICRzY29wZS5zY2FudGl0bGVcbiAgICAkd2luZG93LmxvY2FsU3RvcmFnZVsndXJsJ10gPSBzZWFyY2hQYXJhbXMudXJsXG4gICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2VbJ3JlZ2lvbkNob2ljZSddID0gc2VhcmNoUGFyYW1zLnJlZ2lvbkNob2ljZVxuICAgICRsb2NhdGlvbi5wYXRoKCcvcmVzdWx0cycpXG4gIH1cbn0pXG4iLCJhcHAuY29udHJvbGxlcigncmVzdWx0c0NvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRyb3V0ZVBhcmFtcywgJG1kRGlhbG9nLCBzZWFyY2hTZXJ2aWNlLCBwb3N0U2VydmljZSwgJHdpbmRvdykge1xuXG4gICRzY29wZS5sb2FkaW5nID0gdHJ1ZTtcbiAgJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gYExvYWRpbmcgeW91ciByZXN1bHRzLi4uYFxuXG4gIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAkc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBgVGhhbmsgeW91IGZvciB5b3VyIHBhdGllbmNlLi4uYFxuICAgICRzY29wZS4kYXBwbHkoKVxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICRzY29wZS5sb2FkaW5nTWVzc2FnZSA9IGBTZWFyY2hlcyByZXR1cm5pbmcgbWFueSByZXN1bHRzIGNhbiB0YWtlIHRpbWUgdG8gcHJvY2Vzcy4uLmBcbiAgICAgICRzY29wZS4kYXBwbHkoKVxuICAgIH0sIDQwMDApXG4gIH0sIDQwMDApXG5cblxuICBpZiAoISRyb3V0ZVBhcmFtcy5zZWFyY2hJZCkge1xuICAgIGxldCBzZWFyY2hQYXJhbXMgPSB7fVxuICAgIHNlYXJjaFBhcmFtcy5yZWdpb25DaG9pY2UgPSAkd2luZG93LmxvY2FsU3RvcmFnZS5yZWdpb25DaG9pY2VcbiAgICBzZWFyY2hQYXJhbXMudXJsID0gJHdpbmRvdy5sb2NhbFN0b3JhZ2UudXJsXG4gICAgc2VhcmNoU2VydmljZS5uZXdTZWFyY2goc2VhcmNoUGFyYW1zKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgICRzY29wZS5yZXN1bHRzT2JqID0gc2VhcmNoU2VydmljZS5yZXN1bHRzT2JqR2V0dGVyKCk7XG4gICAgICAkc2NvcGUuZHVwZUNvdW50ID0gJHNjb3BlLnJlc3VsdHNPYmouZHVwZUNvdW50XG4gICAgICAkc2NvcGUuZmF2Q291bnQgPSAkc2NvcGUucmVzdWx0c09iai5mYXZDb3VudFxuICAgICAgJHNjb3BlLmxvYWRpbmcgPSBmYWxzZTtcbiAgICB9KVxuICB9IGVsc2Uge1xuICAgIHNlYXJjaFNlcnZpY2Uudmlld1NlYXJjaCgkcm91dGVQYXJhbXMuc2VhcmNoSWQpLnRoZW4oZnVuY3Rpb24oKXtcbiAgICAgICRzY29wZS5yZXN1bHRzT2JqID0gc2VhcmNoU2VydmljZS5yZXN1bHRzT2JqR2V0dGVyKClcbiAgICAgICRzY29wZS5kdXBlQ291bnQgPSAkc2NvcGUucmVzdWx0c09iai5kdXBlQ291bnRcbiAgICAgICRzY29wZS5mYXZDb3VudCA9ICRzY29wZS5yZXN1bHRzT2JqLmZhdkNvdW50XG4gICAgICAkc2NvcGUubG9hZGluZyA9IGZhbHNlO1xuICAgIH0pXG4gIH1cblxuICAkc2NvcGUuZHVwZVNob3cgPSBmYWxzZVxuICAkc2NvcGUuaW1hZ2VIaWRlID0gZmFsc2VcbiAgJHNjb3BlLmZhdk9ubHkgPSBmYWxzZVxuXG4gICRzY29wZS5kZWxldGUgPSBmdW5jdGlvbihyZXN1bHRJZCkge1xuICAgIHBvc3RTZXJ2aWNlLmRlbGV0ZSgkc2NvcGUucmVzdWx0c09iai5faWQsIHJlc3VsdElkKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgIHNlYXJjaFNlcnZpY2UucmVzdWx0c09ialNldHRlcihyZXN1bHRzKVxuICAgICAgJHNjb3BlLnJlc3VsdHNPYmogPSBzZWFyY2hTZXJ2aWNlLnJlc3VsdHNPYmpHZXR0ZXIoKVxuICAgIH0pXG4gIH1cblxuICAkc2NvcGUuZmF2b3JpdGUgPSBmdW5jdGlvbihyZXN1bHRJZCl7XG4gICAgcG9zdFNlcnZpY2UuZmF2b3JpdGUoJHNjb3BlLnJlc3VsdHNPYmouX2lkLCByZXN1bHRJZCkudGhlbihmdW5jdGlvbihyZXN1bHRzKXtcbiAgICAgICRzY29wZS5yZXN1bHRzT2JqID0gc2VhcmNoU2VydmljZS5yZXN1bHRzT2JqR2V0dGVyKClcbiAgICB9KVxuICB9XG5cbiAgJHNjb3BlLnVuZmF2b3JpdGUgPSBmdW5jdGlvbihyZXN1bHRJZCl7XG4gICAgcG9zdFNlcnZpY2UudW5mYXZvcml0ZSgkc2NvcGUucmVzdWx0c09iai5faWQsIHJlc3VsdElkKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpe1xuICAgICAgJHNjb3BlLnJlc3VsdHNPYmogPSBzZWFyY2hTZXJ2aWNlLnJlc3VsdHNPYmpHZXR0ZXIoKVxuICAgIH0pXG4gIH1cblxuICAkc2NvcGUuZGVsZXRlQW5vbiA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgbGV0IGRlbGV0ZWQgPSAkc2NvcGUucmVzdWx0c09iai5yZXN1bHRzLnNwbGljZShpbmRleCwgMSlcbiAgICBjb25zb2xlLmxvZyhkZWxldGVkWzBdKTtcbiAgICBpZiAoZGVsZXRlZFswXS5kdXBlKSB7XG4gICAgICAkc2NvcGUuZHVwZUNvdW50LS1cbiAgICB9IGVsc2Uge1xuICAgICAgJHNjb3BlLnJlc3VsdHNPYmoucmVzdWx0Q291bnQtLVxuICAgIH1cbiAgfVxuXG4gICRzY29wZS5kZWxldGVEdXBlcyA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBkdXBlc1JlbW92ZWQgPSAkc2NvcGUucmVzdWx0c09iai5yZXN1bHRzLmZpbHRlcihmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgIHJldHVybiAhcmVzdWx0LmR1cGVcbiAgICB9KVxuXG4gICAgaWYgKCRzY29wZS5yZXN1bHRzT2JqLl9pZCkge1xuICAgICAgcG9zdFNlcnZpY2UuZGVsZXRlRHVwZXMoJHNjb3BlLnJlc3VsdHNPYmouX2lkLCBkdXBlc1JlbW92ZWQpLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgICAkc2NvcGUucmVzdWx0c09iaiA9IHNlYXJjaFNlcnZpY2UucmVzdWx0c09iakdldHRlcigpXG4gICAgICAgICRzY29wZS5kdXBlQ291bnQgPSAkc2NvcGUucmVzdWx0c09iai5kdXBlQ291bnQ7XG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICAkc2NvcGUucmVzdWx0c09iai5yZXN1bHRzID0gZHVwZXNSZW1vdmVkXG4gICAgICAkc2NvcGUuZHVwZUNvdW50ID0gMFxuICAgIH1cbiAgfVxuXG4gICRzY29wZS5zYXZlRGlhbG9nID0gZnVuY3Rpb24oKSB7XG4gICAgJG1kRGlhbG9nLnNob3coXG4gICAgICAkbWREaWFsb2cucHJvbXB0KClcbiAgICAgIC5jbGlja091dHNpZGVUb0Nsb3NlKHRydWUpXG4gICAgICAudGl0bGUoJ1BsZWFzZSBjaG9vc2UgYSBuYW1lIGZvciB5b3VyIHNlYXJjaC4nKVxuICAgICAgLm9wZW5Gcm9tKCcuY29udHJvbF9wYW5lbF9jb250YWluZXInKVxuICAgICAgLm9rKCdTYXZlJylcbiAgICApLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgbGV0IHNlYXJjaCA9IE9iamVjdC5hc3NpZ24oe30sICRzY29wZS5yZXN1bHRzT2JqKVxuICAgICAgZGVsZXRlIHNlYXJjaC5kdXBlQ291bnRcbiAgICAgIGRlbGV0ZSBzZWFyY2gucmVzdWx0Q291bnRcbiAgICAgIHNlYXJjaC50aXRsZSA9IHJlc3VsdHNcbiAgICAgIHNlYXJjaFNlcnZpY2Uuc2F2ZVNlYXJjaChzZWFyY2gpXG4gICAgfSlcbiAgfVxufSlcbiJdfQ==

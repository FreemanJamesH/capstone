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
      url: $scope.regionChoice + 'search/apa?',
      query: $scope.query,
      distance: $scope.distance,
      postal: $scope.distance,
      min_price: $scope.min_price,
      max_price: $scope.max_price
    }
    $window.localStorage['searchParams'] = JSON.stringify(searchParams)
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhdXRoQ3RybC5qcyIsImRhc2hDdHJsLmpzIiwiaW5kZXguanMiLCJtYWluQ3RybC5qcyIsInJlc3VsdHNDdHJsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJhcHAuY29udHJvbGxlcignQXV0aENvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRodHRwLCAkbG9jYXRpb24sIGF1dGhTZXJ2aWNlLCB1c2VyU2VydmljZSkgeyAgJHNjb3BlLnVzZXIgPSB7fTtcblxuICAkc2NvcGUuc2lnbnVwID0gZnVuY3Rpb24oKSB7XG4gICAgdXNlclNlcnZpY2Uuc2lnbnVwKCRzY29wZS51c2VyKVxuICB9XG5cbiAgJHNjb3BlLmxvZ2luID0gZnVuY3Rpb24oKSB7XG4gICAgdXNlclNlcnZpY2UubG9naW4oJHNjb3BlLnVzZXIpXG4gIH1cblxufSlcbiIsImFwcC5jb250cm9sbGVyKCdkYXNoQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJGxvY2F0aW9uLCB1c2VyU2VydmljZSwgc2VhcmNoU2VydmljZSkge1xuXG4gIHVzZXJTZXJ2aWNlLmdldFVzZXIoKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAkc2NvcGUudXNlck9iaiA9IHJlc3VsdHNcbiAgfSlcblxuICAkc2NvcGUuZGVsZXRlU2VhcmNoID0gZnVuY3Rpb24oaWQpIHtcbiAgICBzZWFyY2hTZXJ2aWNlLmRlbGV0ZVNlYXJjaChpZCkudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICAkc2NvcGUudXNlck9iaiA9IHJlc3VsdHNcbiAgICB9KVxuICB9XG5cbiAgJHNjb3BlLnZpZXdTZWFyY2ggPSBmdW5jdGlvbihpZCkge1xuICAgICRsb2NhdGlvbi5wYXRoKGAvcmVzdWx0cy8ke2lkfWApXG4gIH1cbn0pXG4iLCJyZXF1aXJlKCcuL2F1dGhDdHJsLmpzJylcbnJlcXVpcmUoJy4vZGFzaEN0cmwuanMnKVxucmVxdWlyZSgnLi9tYWluQ3RybC5qcycpXG5yZXF1aXJlKCcuL3Jlc3VsdHNDdHJsLmpzJylcbiIsImFwcC5jb250cm9sbGVyKCdNYWluQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJGh0dHAsIHNlYXJjaFNlcnZpY2UsIHN0YXRlTGlzdFNlcnZpY2UsICRsb2NhdGlvbiwgYXV0aFNlcnZpY2UsIHVzZXJTZXJ2aWNlLCAkd2luZG93LCAkcSkge1xuXG4gIHN0YXRlTGlzdFNlcnZpY2UucmV0cmlldmUoKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5zdGF0ZUxpc3RQcm90byA9IHN0YXRlTGlzdFNlcnZpY2UucmVzdWx0c0FyckdldHRlcigpO1xuICB9KVxuXG4gICRzY29wZS5sb2dvdXQgPSBmdW5jdGlvbigpIHtcbiAgICBhdXRoU2VydmljZS5sb2dvdXQoKVxuICAgICRzY29wZS51c2VybmFtZSA9IG51bGxcbiAgfVxuXG4gICRzY29wZS5ob21lID0gZnVuY3Rpb24oKSB7XG4gICAgJGxvY2F0aW9uLnBhdGgoJy8nKVxuICB9XG5cbiAgJHNjb3BlLiR3YXRjaChmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAkd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdjcmFpZ3NibGlzcy10b2tlbicpXG4gICAgfSxcbiAgICBmdW5jdGlvbihuZXdWYWx1ZSkge1xuICAgICAgaWYgKG5ld1ZhbHVlKSB7XG4gICAgICAgIGxldCBkZWNvZGVkUGF5bG9hZCA9IEpTT04ucGFyc2UoYXRvYihuZXdWYWx1ZS5zcGxpdCgnLicpWzFdKSlcbiAgICAgICAgJHNjb3BlLnVzZXJuYW1lID0gZGVjb2RlZFBheWxvYWQudXNlcm5hbWVcbiAgICAgIH1cbiAgICB9LFxuICAgIHRydWVcbiAgKVxuXG4gICRzY29wZS5kYXNoYm9hcmQgPSBmdW5jdGlvbigpIHtcbiAgICB1c2VyU2VydmljZS5nZXRVc2VyKClcbiAgfVxuXG4gICRzY29wZS5zdWJtaXQgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgdXJsID0gJHNjb3BlLnJlZ2lvbkNob2ljZSArICdzZWFyY2gvYXBhPydcbiAgICBsZXQgc2VhcmNoUGFyYW1zID0ge1xuICAgICAgdXJsOiAkc2NvcGUucmVnaW9uQ2hvaWNlICsgJ3NlYXJjaC9hcGE/JyxcbiAgICAgIHF1ZXJ5OiAkc2NvcGUucXVlcnksXG4gICAgICBkaXN0YW5jZTogJHNjb3BlLmRpc3RhbmNlLFxuICAgICAgcG9zdGFsOiAkc2NvcGUuZGlzdGFuY2UsXG4gICAgICBtaW5fcHJpY2U6ICRzY29wZS5taW5fcHJpY2UsXG4gICAgICBtYXhfcHJpY2U6ICRzY29wZS5tYXhfcHJpY2VcbiAgICB9XG4gICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2VbJ3NlYXJjaFBhcmFtcyddID0gSlNPTi5zdHJpbmdpZnkoc2VhcmNoUGFyYW1zKVxuICAgICR3aW5kb3cubG9jYWxTdG9yYWdlWydyZWdpb25DaG9pY2UnXSA9ICRzY29wZS5yZWdpb25DaG9pY2VcbiAgICAkbG9jYXRpb24ucGF0aCgnL3Jlc3VsdHMnKVxuICB9XG59KVxuIiwiYXBwLmNvbnRyb2xsZXIoJ3Jlc3VsdHNDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkcm91dGVQYXJhbXMsICRtZERpYWxvZywgc2VhcmNoU2VydmljZSwgcG9zdFNlcnZpY2UsICR3aW5kb3cpIHtcblxuICAkc2NvcGUubG9hZGluZyA9IHRydWU7XG4gICRzY29wZS5sb2FkaW5nTWVzc2FnZSA9IGBMb2FkaW5nIHlvdXIgcmVzdWx0cy4uLmBcblxuICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gYFRoYW5rIHlvdSBmb3IgeW91ciBwYXRpZW5jZS4uLmBcbiAgICAkc2NvcGUuJGFwcGx5KClcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAkc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBgU2VhcmNoZXMgcmV0dXJuaW5nIG1hbnkgcmVzdWx0cyBjYW4gdGFrZSB0aW1lIHRvIHByb2Nlc3MuLi5gXG4gICAgICAkc2NvcGUuJGFwcGx5KClcbiAgICB9LCA0MDAwKVxuICB9LCA0MDAwKVxuXG5cbiAgaWYgKCEkcm91dGVQYXJhbXMuc2VhcmNoSWQpIHtcbiAgICBsZXQgc2VhcmNoT2JqID0ge31cbiAgICBzZWFyY2hPYmoucmVnaW9uQ2hvaWNlID0gJHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVnaW9uQ2hvaWNlXG4gICAgc2VhcmNoT2JqLnVybCA9ICR3aW5kb3cubG9jYWxTdG9yYWdlLnVybFxuICAgIHNlYXJjaE9iai5zZWFyY2hQYXJhbXMgPSBKU09OLnBhcnNlKCR3aW5kb3cubG9jYWxTdG9yYWdlLnNlYXJjaFBhcmFtcylcbiAgICBzZWFyY2hTZXJ2aWNlLm5ld1NlYXJjaChzZWFyY2hPYmopLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgJHNjb3BlLnJlc3VsdHNPYmogPSBzZWFyY2hTZXJ2aWNlLnJlc3VsdHNPYmpHZXR0ZXIoKTtcbiAgICAgICRzY29wZS5kdXBlQ291bnQgPSAkc2NvcGUucmVzdWx0c09iai5kdXBlQ291bnRcbiAgICAgICRzY29wZS5mYXZDb3VudCA9ICRzY29wZS5yZXN1bHRzT2JqLmZhdkNvdW50XG4gICAgICAkc2NvcGUubG9hZGluZyA9IGZhbHNlO1xuICAgIH0pXG4gIH0gZWxzZSB7XG4gICAgc2VhcmNoU2VydmljZS52aWV3U2VhcmNoKCRyb3V0ZVBhcmFtcy5zZWFyY2hJZCkudGhlbihmdW5jdGlvbigpe1xuICAgICAgJHNjb3BlLnJlc3VsdHNPYmogPSBzZWFyY2hTZXJ2aWNlLnJlc3VsdHNPYmpHZXR0ZXIoKVxuICAgICAgJHNjb3BlLmR1cGVDb3VudCA9ICRzY29wZS5yZXN1bHRzT2JqLmR1cGVDb3VudFxuICAgICAgJHNjb3BlLmZhdkNvdW50ID0gJHNjb3BlLnJlc3VsdHNPYmouZmF2Q291bnRcbiAgICAgICRzY29wZS5sb2FkaW5nID0gZmFsc2U7XG4gICAgfSlcbiAgfVxuXG4gICRzY29wZS5kdXBlU2hvdyA9IGZhbHNlXG4gICRzY29wZS5pbWFnZUhpZGUgPSBmYWxzZVxuICAkc2NvcGUuZmF2T25seSA9IGZhbHNlXG5cbiAgJHNjb3BlLmRlbGV0ZSA9IGZ1bmN0aW9uKHJlc3VsdElkKSB7XG4gICAgcG9zdFNlcnZpY2UuZGVsZXRlKCRzY29wZS5yZXN1bHRzT2JqLl9pZCwgcmVzdWx0SWQpLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgc2VhcmNoU2VydmljZS5yZXN1bHRzT2JqU2V0dGVyKHJlc3VsdHMpXG4gICAgICAkc2NvcGUucmVzdWx0c09iaiA9IHNlYXJjaFNlcnZpY2UucmVzdWx0c09iakdldHRlcigpXG4gICAgfSlcbiAgfVxuXG4gICRzY29wZS5mYXZvcml0ZSA9IGZ1bmN0aW9uKHJlc3VsdElkKXtcbiAgICBwb3N0U2VydmljZS5mYXZvcml0ZSgkc2NvcGUucmVzdWx0c09iai5faWQsIHJlc3VsdElkKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpe1xuICAgICAgJHNjb3BlLnJlc3VsdHNPYmogPSBzZWFyY2hTZXJ2aWNlLnJlc3VsdHNPYmpHZXR0ZXIoKVxuICAgIH0pXG4gIH1cblxuICAkc2NvcGUudW5mYXZvcml0ZSA9IGZ1bmN0aW9uKHJlc3VsdElkKXtcbiAgICBwb3N0U2VydmljZS51bmZhdm9yaXRlKCRzY29wZS5yZXN1bHRzT2JqLl9pZCwgcmVzdWx0SWQpLnRoZW4oZnVuY3Rpb24ocmVzdWx0cyl7XG4gICAgICAkc2NvcGUucmVzdWx0c09iaiA9IHNlYXJjaFNlcnZpY2UucmVzdWx0c09iakdldHRlcigpXG4gICAgfSlcbiAgfVxuXG4gICRzY29wZS5kZWxldGVBbm9uID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICBsZXQgZGVsZXRlZCA9ICRzY29wZS5yZXN1bHRzT2JqLnJlc3VsdHMuc3BsaWNlKGluZGV4LCAxKVxuICAgIGNvbnNvbGUubG9nKGRlbGV0ZWRbMF0pO1xuICAgIGlmIChkZWxldGVkWzBdLmR1cGUpIHtcbiAgICAgICRzY29wZS5kdXBlQ291bnQtLVxuICAgIH0gZWxzZSB7XG4gICAgICAkc2NvcGUucmVzdWx0c09iai5yZXN1bHRDb3VudC0tXG4gICAgfVxuICB9XG5cbiAgJHNjb3BlLmRlbGV0ZUR1cGVzID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IGR1cGVzUmVtb3ZlZCA9ICRzY29wZS5yZXN1bHRzT2JqLnJlc3VsdHMuZmlsdGVyKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgcmV0dXJuICFyZXN1bHQuZHVwZVxuICAgIH0pXG5cbiAgICBpZiAoJHNjb3BlLnJlc3VsdHNPYmouX2lkKSB7XG4gICAgICBwb3N0U2VydmljZS5kZWxldGVEdXBlcygkc2NvcGUucmVzdWx0c09iai5faWQsIGR1cGVzUmVtb3ZlZCkudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICAgICRzY29wZS5yZXN1bHRzT2JqID0gc2VhcmNoU2VydmljZS5yZXN1bHRzT2JqR2V0dGVyKClcbiAgICAgICAgJHNjb3BlLmR1cGVDb3VudCA9ICRzY29wZS5yZXN1bHRzT2JqLmR1cGVDb3VudDtcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgICRzY29wZS5yZXN1bHRzT2JqLnJlc3VsdHMgPSBkdXBlc1JlbW92ZWRcbiAgICAgICRzY29wZS5kdXBlQ291bnQgPSAwXG4gICAgfVxuICB9XG5cbiAgJHNjb3BlLnNhdmVEaWFsb2cgPSBmdW5jdGlvbigpIHtcbiAgICAkbWREaWFsb2cuc2hvdyhcbiAgICAgICRtZERpYWxvZy5wcm9tcHQoKVxuICAgICAgLmNsaWNrT3V0c2lkZVRvQ2xvc2UodHJ1ZSlcbiAgICAgIC50aXRsZSgnUGxlYXNlIGNob29zZSBhIG5hbWUgZm9yIHlvdXIgc2VhcmNoLicpXG4gICAgICAub3BlbkZyb20oJy5jb250cm9sX3BhbmVsX2NvbnRhaW5lcicpXG4gICAgICAub2soJ1NhdmUnKVxuICAgICkudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICBsZXQgc2VhcmNoID0gT2JqZWN0LmFzc2lnbih7fSwgJHNjb3BlLnJlc3VsdHNPYmopXG4gICAgICBkZWxldGUgc2VhcmNoLmR1cGVDb3VudFxuICAgICAgZGVsZXRlIHNlYXJjaC5yZXN1bHRDb3VudFxuICAgICAgc2VhcmNoLnRpdGxlID0gcmVzdWx0c1xuICAgICAgc2VhcmNoU2VydmljZS5zYXZlU2VhcmNoKHNlYXJjaClcbiAgICB9KVxuICB9XG59KVxuIl19

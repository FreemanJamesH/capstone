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
        alert('new token!')
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
    searchParams.url = 'http://' + $scope.regionChoice + 'search/apa?'
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

  if (!(searchService.resultsObjGetter()._id) && !$routeParams.searchId) {
    let searchParams = {}
    searchParams.regionChoice = $window.localStorage.regionChoice
    searchParams.url = $window.localStorage.url
    searchService.newSearch(searchParams).then(function(results) {
      $scope.resultsObj = searchService.resultsObjGetter();
      $scope.dupeCount = $scope.resultsObj.dupeCount
    })
  } else {
    searchService.viewSearch($routeParams.searchId).then(function(){
      $scope.resultsObj = searchService.resultsObjGetter()
      $scope.dupeCount = $scope.resultsObj.dupeCount
    })
  }

  $scope.dupeShow = false
  $scope.imageHide = false

  $scope.delete = function(resultId) {
    console.log(resultId);
    postService.delete($scope.resultsObj._id, resultId).then(function(results) {
      searchService.resultsObjSetter(results)
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
      .openFrom('.resultsform')
      .ok('Save')
    ).then(function(results) {
      let search = $scope.resultsObj
      delete search.dupeCount
      delete search.resultCount
      search.title = results
      searchService.saveSearch(search)
    })
  }
})

},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhdXRoQ3RybC5qcyIsImRhc2hDdHJsLmpzIiwiaW5kZXguanMiLCJtYWluQ3RybC5qcyIsInJlc3VsdHNDdHJsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiYXBwLmNvbnRyb2xsZXIoJ0F1dGhDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkaHR0cCwgJGxvY2F0aW9uLCBhdXRoU2VydmljZSwgdXNlclNlcnZpY2UpIHsgICRzY29wZS51c2VyID0ge307XG5cbiAgJHNjb3BlLnNpZ251cCA9IGZ1bmN0aW9uKCkge1xuICAgIHVzZXJTZXJ2aWNlLnNpZ251cCgkc2NvcGUudXNlcilcbiAgfVxuXG4gICRzY29wZS5sb2dpbiA9IGZ1bmN0aW9uKCkge1xuICAgIHVzZXJTZXJ2aWNlLmxvZ2luKCRzY29wZS51c2VyKVxuICB9XG5cbn0pXG4iLCJhcHAuY29udHJvbGxlcignZGFzaENvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRsb2NhdGlvbiwgdXNlclNlcnZpY2UsIHNlYXJjaFNlcnZpY2UpIHtcblxuICB1c2VyU2VydmljZS5nZXRVc2VyKCkudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgJHNjb3BlLnVzZXJPYmogPSByZXN1bHRzXG4gIH0pXG5cbiAgJHNjb3BlLmRlbGV0ZVNlYXJjaCA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgc2VhcmNoU2VydmljZS5kZWxldGVTZWFyY2goaWQpLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgJHNjb3BlLnVzZXJPYmogPSByZXN1bHRzXG4gICAgfSlcbiAgfVxuXG4gICRzY29wZS52aWV3U2VhcmNoID0gZnVuY3Rpb24oaWQpIHtcbiAgICAkbG9jYXRpb24ucGF0aChgL3Jlc3VsdHMvJHtpZH1gKVxuICB9XG59KVxuIiwicmVxdWlyZSgnLi9hdXRoQ3RybC5qcycpXG5yZXF1aXJlKCcuL2Rhc2hDdHJsLmpzJylcbnJlcXVpcmUoJy4vbWFpbkN0cmwuanMnKVxucmVxdWlyZSgnLi9yZXN1bHRzQ3RybC5qcycpXG4iLCJhcHAuY29udHJvbGxlcignTWFpbkNvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRodHRwLCBzZWFyY2hTZXJ2aWNlLCBzdGF0ZUxpc3RTZXJ2aWNlLCAkbG9jYXRpb24sIGF1dGhTZXJ2aWNlLCB1c2VyU2VydmljZSwgJHdpbmRvdywgJHEpIHtcblxuICBzdGF0ZUxpc3RTZXJ2aWNlLnJldHJpZXZlKCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuc3RhdGVMaXN0UHJvdG8gPSBzdGF0ZUxpc3RTZXJ2aWNlLnJlc3VsdHNBcnJHZXR0ZXIoKTtcbiAgfSlcblxuICAkc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24oKXtcbiAgICBhdXRoU2VydmljZS5sb2dvdXQoKVxuICAgICRzY29wZS51c2VybmFtZSA9IG51bGxcbiAgfVxuXG4gICRzY29wZS5ob21lID0gZnVuY3Rpb24oKSB7XG4gICAgJGxvY2F0aW9uLnBhdGgoJy8nKVxuICB9XG5cbiAgJHNjb3BlLiR3YXRjaChmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAkd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdjcmFpZ3NibGlzcy10b2tlbicpXG4gICAgfSxcbiAgICBmdW5jdGlvbihuZXdWYWx1ZSkge1xuICAgICAgaWYgKG5ld1ZhbHVlKSB7XG4gICAgICAgIGFsZXJ0KCduZXcgdG9rZW4hJylcbiAgICAgICAgbGV0IGRlY29kZWRQYXlsb2FkID0gSlNPTi5wYXJzZShhdG9iKG5ld1ZhbHVlLnNwbGl0KCcuJylbMV0pKVxuICAgICAgICAkc2NvcGUudXNlcm5hbWUgPSBkZWNvZGVkUGF5bG9hZC51c2VybmFtZVxuICAgICAgfVxuICAgIH0sXG4gICAgdHJ1ZVxuICApXG5cbiAgJHNjb3BlLmRhc2hib2FyZCA9IGZ1bmN0aW9uKCkge1xuICAgIHVzZXJTZXJ2aWNlLmdldFVzZXIoKVxuICB9XG5cbiAgJHNjb3BlLnN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWFyY2hQYXJhbXMgPSB7fTtcbiAgICBzZWFyY2hQYXJhbXMucmVnaW9uQ2hvaWNlID0gJHNjb3BlLnJlZ2lvbkNob2ljZVxuICAgIHNlYXJjaFBhcmFtcy51cmwgPSAnaHR0cDovLycgKyAkc2NvcGUucmVnaW9uQ2hvaWNlICsgJ3NlYXJjaC9hcGE/J1xuICAgIGlmICgkc2NvcGUucXVlcnkpIHtcbiAgICAgIHNlYXJjaFBhcmFtcy51cmwgKz0gKCcmcXVlcnk9JyArICRzY29wZS5xdWVyeSlcbiAgICB9XG4gICAgaWYgKCRzY29wZS5kaXN0YW5jZSkge1xuICAgICAgc2VhcmNoUGFyYW1zLnVybCArPSAoJyZzZWFyY2hfZGlzdGFuY2U9JyArICRzY29wZS5kaXN0YW5jZSlcbiAgICB9XG4gICAgaWYgKCRzY29wZS5wb3N0YWwpIHtcbiAgICAgIHNlYXJjaFBhcmFtcy51cmwgKz0gKCcmcG9zdGFsPScgKyAkc2NvcGUucG9zdGFsKVxuICAgIH1cbiAgICBpZiAoJHNjb3BlLm1pbl9wcmljZSkge1xuICAgICAgc2VhcmNoUGFyYW1zLnVybCArPSAoJyZtaW5fcHJpY2U9JyArICRzY29wZS5taW5fcHJpY2UpXG4gICAgfVxuICAgIGlmICgkc2NvcGUubWF4X3ByaWNlKSB7XG4gICAgICBzZWFyY2hQYXJhbXMudXJsICs9ICgnJm1heF9wcmljZT0nICsgJHNjb3BlLm1heF9wcmljZSlcbiAgICB9XG4gICAgc2VhcmNoUGFyYW1zLnRpdGxlID0gJHNjb3BlLnNjYW50aXRsZVxuICAgICR3aW5kb3cubG9jYWxTdG9yYWdlWyd1cmwnXSA9IHNlYXJjaFBhcmFtcy51cmxcbiAgICAkd2luZG93LmxvY2FsU3RvcmFnZVsncmVnaW9uQ2hvaWNlJ10gPSBzZWFyY2hQYXJhbXMucmVnaW9uQ2hvaWNlXG4gICAgJGxvY2F0aW9uLnBhdGgoJy9yZXN1bHRzJylcbiAgfVxufSlcbiIsImFwcC5jb250cm9sbGVyKCdyZXN1bHRzQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJHJvdXRlUGFyYW1zLCAkbWREaWFsb2csIHNlYXJjaFNlcnZpY2UsIHBvc3RTZXJ2aWNlLCAkd2luZG93KSB7XG5cbiAgaWYgKCEoc2VhcmNoU2VydmljZS5yZXN1bHRzT2JqR2V0dGVyKCkuX2lkKSAmJiAhJHJvdXRlUGFyYW1zLnNlYXJjaElkKSB7XG4gICAgbGV0IHNlYXJjaFBhcmFtcyA9IHt9XG4gICAgc2VhcmNoUGFyYW1zLnJlZ2lvbkNob2ljZSA9ICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlZ2lvbkNob2ljZVxuICAgIHNlYXJjaFBhcmFtcy51cmwgPSAkd2luZG93LmxvY2FsU3RvcmFnZS51cmxcbiAgICBzZWFyY2hTZXJ2aWNlLm5ld1NlYXJjaChzZWFyY2hQYXJhbXMpLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgJHNjb3BlLnJlc3VsdHNPYmogPSBzZWFyY2hTZXJ2aWNlLnJlc3VsdHNPYmpHZXR0ZXIoKTtcbiAgICAgICRzY29wZS5kdXBlQ291bnQgPSAkc2NvcGUucmVzdWx0c09iai5kdXBlQ291bnRcbiAgICB9KVxuICB9IGVsc2Uge1xuICAgIHNlYXJjaFNlcnZpY2Uudmlld1NlYXJjaCgkcm91dGVQYXJhbXMuc2VhcmNoSWQpLnRoZW4oZnVuY3Rpb24oKXtcbiAgICAgICRzY29wZS5yZXN1bHRzT2JqID0gc2VhcmNoU2VydmljZS5yZXN1bHRzT2JqR2V0dGVyKClcbiAgICAgICRzY29wZS5kdXBlQ291bnQgPSAkc2NvcGUucmVzdWx0c09iai5kdXBlQ291bnRcbiAgICB9KVxuICB9XG5cbiAgJHNjb3BlLmR1cGVTaG93ID0gZmFsc2VcbiAgJHNjb3BlLmltYWdlSGlkZSA9IGZhbHNlXG5cbiAgJHNjb3BlLmRlbGV0ZSA9IGZ1bmN0aW9uKHJlc3VsdElkKSB7XG4gICAgY29uc29sZS5sb2cocmVzdWx0SWQpO1xuICAgIHBvc3RTZXJ2aWNlLmRlbGV0ZSgkc2NvcGUucmVzdWx0c09iai5faWQsIHJlc3VsdElkKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgIHNlYXJjaFNlcnZpY2UucmVzdWx0c09ialNldHRlcihyZXN1bHRzKVxuICAgICAgJHNjb3BlLnJlc3VsdHNPYmogPSBzZWFyY2hTZXJ2aWNlLnJlc3VsdHNPYmpHZXR0ZXIoKVxuICAgIH0pXG4gIH1cblxuICAkc2NvcGUuZGVsZXRlQW5vbiA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgbGV0IGRlbGV0ZWQgPSAkc2NvcGUucmVzdWx0c09iai5yZXN1bHRzLnNwbGljZShpbmRleCwgMSlcbiAgICBjb25zb2xlLmxvZyhkZWxldGVkWzBdKTtcbiAgICBpZiAoZGVsZXRlZFswXS5kdXBlKSB7XG4gICAgICAkc2NvcGUuZHVwZUNvdW50LS1cbiAgICB9IGVsc2Uge1xuICAgICAgJHNjb3BlLnJlc3VsdHNPYmoucmVzdWx0Q291bnQtLVxuICAgIH1cbiAgfVxuXG4gICRzY29wZS5kZWxldGVEdXBlcyA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBkdXBlc1JlbW92ZWQgPSAkc2NvcGUucmVzdWx0c09iai5yZXN1bHRzLmZpbHRlcihmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgIHJldHVybiAhcmVzdWx0LmR1cGVcbiAgICB9KVxuXG4gICAgaWYgKCRzY29wZS5yZXN1bHRzT2JqLl9pZCkge1xuICAgICAgcG9zdFNlcnZpY2UuZGVsZXRlRHVwZXMoJHNjb3BlLnJlc3VsdHNPYmouX2lkLCBkdXBlc1JlbW92ZWQpLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgICAkc2NvcGUucmVzdWx0c09iaiA9IHNlYXJjaFNlcnZpY2UucmVzdWx0c09iakdldHRlcigpXG4gICAgICAgICRzY29wZS5kdXBlQ291bnQgPSAkc2NvcGUucmVzdWx0c09iai5kdXBlQ291bnQ7XG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICAkc2NvcGUucmVzdWx0c09iai5yZXN1bHRzID0gZHVwZXNSZW1vdmVkXG4gICAgICAkc2NvcGUuZHVwZUNvdW50ID0gMFxuICAgIH1cbiAgfVxuXG4gICRzY29wZS5zYXZlRGlhbG9nID0gZnVuY3Rpb24oKSB7XG4gICAgJG1kRGlhbG9nLnNob3coXG4gICAgICAkbWREaWFsb2cucHJvbXB0KClcbiAgICAgIC5jbGlja091dHNpZGVUb0Nsb3NlKHRydWUpXG4gICAgICAudGl0bGUoJ1BsZWFzZSBjaG9vc2UgYSBuYW1lIGZvciB5b3VyIHNlYXJjaC4nKVxuICAgICAgLm9wZW5Gcm9tKCcucmVzdWx0c2Zvcm0nKVxuICAgICAgLm9rKCdTYXZlJylcbiAgICApLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgbGV0IHNlYXJjaCA9ICRzY29wZS5yZXN1bHRzT2JqXG4gICAgICBkZWxldGUgc2VhcmNoLmR1cGVDb3VudFxuICAgICAgZGVsZXRlIHNlYXJjaC5yZXN1bHRDb3VudFxuICAgICAgc2VhcmNoLnRpdGxlID0gcmVzdWx0c1xuICAgICAgc2VhcmNoU2VydmljZS5zYXZlU2VhcmNoKHNlYXJjaClcbiAgICB9KVxuICB9XG59KVxuIl19

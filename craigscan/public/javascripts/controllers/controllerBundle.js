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
app.controller('dashController', function($scope, userService, searchService) {
  userService.getUser().then(function(results) {
    $scope.userObj = results
  })

  $scope.deleteSearch = function(id){
    searchService.deleteSearch(id).then(function(results){
      $scope.userObj = results
    })
  }

  $scope.viewSearch = function(id){
    searchService.viewSearch(id).then(function(results){
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
app.controller('MainController', function($scope, $http, searchService, stateListService, $location, authService, userService, $window, $q) {
  stateListService.retrieve().then(function() {
    $scope.stateListProto = stateListService.resultsArrGetter();
  })

  $scope.logout = function() {
    $q(function(resolve, reject) {
      authService.logout()
      resolve('done!')
    }).then(function(results) {
      // $scope.$apply()
    })
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
    }
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
    searchService.newSearch(searchParams).then(function(results) {
      $location.path('/results')
    })
  }
})

},{}],5:[function(require,module,exports){
app.controller('resultsController', function($scope, $mdDialog, searchService, postService, randomString){
  $scope.resultsObj = searchService.resultsObjGetter();
  console.log($scope.resultsObj);
  $scope.dupeShow = false
  $scope.imageHide = false

  $scope.delete = function(index){
    postService.delete($scope.resultsObj.id, index)
  }

  $scope.saveDialog = function(){
    $mdDialog.show(
      $mdDialog.prompt()
        .clickOutsideToClose(true)
        .title('Please choose a name for your search.')
        .openFrom('.resultsform')
        .ok('Save')
    ).then(function(results){
      let search = $scope.resultsObj
      search.title = results
      search.id = randomString.getString()
      searchService.saveSearch(search)
    })
  }

})

},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhdXRoQ3RybC5qcyIsImRhc2hDdHJsLmpzIiwiaW5kZXguanMiLCJtYWluQ3RybC5qcyIsInJlc3VsdHNDdHJsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiYXBwLmNvbnRyb2xsZXIoJ0F1dGhDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkaHR0cCwgJGxvY2F0aW9uLCBhdXRoU2VydmljZSwgdXNlclNlcnZpY2UpIHsgICRzY29wZS51c2VyID0ge307XG5cbiAgJHNjb3BlLnNpZ251cCA9IGZ1bmN0aW9uKCkge1xuICAgIHVzZXJTZXJ2aWNlLnNpZ251cCgkc2NvcGUudXNlcilcbiAgfVxuXG4gICRzY29wZS5sb2dpbiA9IGZ1bmN0aW9uKCkge1xuICAgIHVzZXJTZXJ2aWNlLmxvZ2luKCRzY29wZS51c2VyKVxuICB9XG5cbn0pXG4iLCJhcHAuY29udHJvbGxlcignZGFzaENvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsIHVzZXJTZXJ2aWNlLCBzZWFyY2hTZXJ2aWNlKSB7XG4gIHVzZXJTZXJ2aWNlLmdldFVzZXIoKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAkc2NvcGUudXNlck9iaiA9IHJlc3VsdHNcbiAgfSlcblxuICAkc2NvcGUuZGVsZXRlU2VhcmNoID0gZnVuY3Rpb24oaWQpe1xuICAgIHNlYXJjaFNlcnZpY2UuZGVsZXRlU2VhcmNoKGlkKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpe1xuICAgICAgJHNjb3BlLnVzZXJPYmogPSByZXN1bHRzXG4gICAgfSlcbiAgfVxuXG4gICRzY29wZS52aWV3U2VhcmNoID0gZnVuY3Rpb24oaWQpe1xuICAgIHNlYXJjaFNlcnZpY2Uudmlld1NlYXJjaChpZCkudGhlbihmdW5jdGlvbihyZXN1bHRzKXtcbiAgICAgICRzY29wZS51c2VyT2JqID0gcmVzdWx0c1xuICAgIH0pXG4gIH1cbn0pXG4iLCJyZXF1aXJlKCcuL2F1dGhDdHJsLmpzJylcbnJlcXVpcmUoJy4vZGFzaEN0cmwuanMnKVxucmVxdWlyZSgnLi9tYWluQ3RybC5qcycpXG5yZXF1aXJlKCcuL3Jlc3VsdHNDdHJsLmpzJylcbiIsImFwcC5jb250cm9sbGVyKCdNYWluQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJGh0dHAsIHNlYXJjaFNlcnZpY2UsIHN0YXRlTGlzdFNlcnZpY2UsICRsb2NhdGlvbiwgYXV0aFNlcnZpY2UsIHVzZXJTZXJ2aWNlLCAkd2luZG93LCAkcSkge1xuICBzdGF0ZUxpc3RTZXJ2aWNlLnJldHJpZXZlKCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuc3RhdGVMaXN0UHJvdG8gPSBzdGF0ZUxpc3RTZXJ2aWNlLnJlc3VsdHNBcnJHZXR0ZXIoKTtcbiAgfSlcblxuICAkc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgJHEoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBhdXRoU2VydmljZS5sb2dvdXQoKVxuICAgICAgcmVzb2x2ZSgnZG9uZSEnKVxuICAgIH0pLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgLy8gJHNjb3BlLiRhcHBseSgpXG4gICAgfSlcbiAgfVxuXG4gICRzY29wZS5ob21lID0gZnVuY3Rpb24oKSB7XG4gICAgJGxvY2F0aW9uLnBhdGgoJy8nKVxuICB9XG5cbiAgJHNjb3BlLiR3YXRjaChmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAkd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdjcmFpZ3NibGlzcy10b2tlbicpXG4gICAgfSxcbiAgICBmdW5jdGlvbihuZXdWYWx1ZSkge1xuICAgICAgaWYgKG5ld1ZhbHVlKSB7XG4gICAgICAgIGxldCBkZWNvZGVkUGF5bG9hZCA9IEpTT04ucGFyc2UoYXRvYihuZXdWYWx1ZS5zcGxpdCgnLicpWzFdKSlcbiAgICAgICAgJHNjb3BlLnVzZXJuYW1lID0gZGVjb2RlZFBheWxvYWQudXNlcm5hbWVcbiAgICAgIH1cbiAgICB9XG4gIClcblxuICAkc2NvcGUuZGFzaGJvYXJkID0gZnVuY3Rpb24oKSB7XG4gICAgdXNlclNlcnZpY2UuZ2V0VXNlcigpXG4gIH1cblxuICAkc2NvcGUuc3VibWl0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlYXJjaFBhcmFtcyA9IHt9O1xuICAgIHNlYXJjaFBhcmFtcy5yZWdpb25DaG9pY2UgPSAkc2NvcGUucmVnaW9uQ2hvaWNlXG4gICAgc2VhcmNoUGFyYW1zLnVybCA9ICdodHRwOi8vJyArICRzY29wZS5yZWdpb25DaG9pY2UgKyAnc2VhcmNoL2FwYT8nXG4gICAgaWYgKCRzY29wZS5xdWVyeSkge1xuICAgICAgc2VhcmNoUGFyYW1zLnVybCArPSAoJyZxdWVyeT0nICsgJHNjb3BlLnF1ZXJ5KVxuICAgIH1cbiAgICBpZiAoJHNjb3BlLmRpc3RhbmNlKSB7XG4gICAgICBzZWFyY2hQYXJhbXMudXJsICs9ICgnJnNlYXJjaF9kaXN0YW5jZT0nICsgJHNjb3BlLmRpc3RhbmNlKVxuICAgIH1cbiAgICBpZiAoJHNjb3BlLnBvc3RhbCkge1xuICAgICAgc2VhcmNoUGFyYW1zLnVybCArPSAoJyZwb3N0YWw9JyArICRzY29wZS5wb3N0YWwpXG4gICAgfVxuICAgIGlmICgkc2NvcGUubWluX3ByaWNlKSB7XG4gICAgICBzZWFyY2hQYXJhbXMudXJsICs9ICgnJm1pbl9wcmljZT0nICsgJHNjb3BlLm1pbl9wcmljZSlcbiAgICB9XG4gICAgaWYgKCRzY29wZS5tYXhfcHJpY2UpIHtcbiAgICAgIHNlYXJjaFBhcmFtcy51cmwgKz0gKCcmbWF4X3ByaWNlPScgKyAkc2NvcGUubWF4X3ByaWNlKVxuICAgIH1cbiAgICBzZWFyY2hQYXJhbXMudGl0bGUgPSAkc2NvcGUuc2NhbnRpdGxlXG4gICAgc2VhcmNoU2VydmljZS5uZXdTZWFyY2goc2VhcmNoUGFyYW1zKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgICRsb2NhdGlvbi5wYXRoKCcvcmVzdWx0cycpXG4gICAgfSlcbiAgfVxufSlcbiIsImFwcC5jb250cm9sbGVyKCdyZXN1bHRzQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJG1kRGlhbG9nLCBzZWFyY2hTZXJ2aWNlLCBwb3N0U2VydmljZSwgcmFuZG9tU3RyaW5nKXtcbiAgJHNjb3BlLnJlc3VsdHNPYmogPSBzZWFyY2hTZXJ2aWNlLnJlc3VsdHNPYmpHZXR0ZXIoKTtcbiAgY29uc29sZS5sb2coJHNjb3BlLnJlc3VsdHNPYmopO1xuICAkc2NvcGUuZHVwZVNob3cgPSBmYWxzZVxuICAkc2NvcGUuaW1hZ2VIaWRlID0gZmFsc2VcblxuICAkc2NvcGUuZGVsZXRlID0gZnVuY3Rpb24oaW5kZXgpe1xuICAgIHBvc3RTZXJ2aWNlLmRlbGV0ZSgkc2NvcGUucmVzdWx0c09iai5pZCwgaW5kZXgpXG4gIH1cblxuICAkc2NvcGUuc2F2ZURpYWxvZyA9IGZ1bmN0aW9uKCl7XG4gICAgJG1kRGlhbG9nLnNob3coXG4gICAgICAkbWREaWFsb2cucHJvbXB0KClcbiAgICAgICAgLmNsaWNrT3V0c2lkZVRvQ2xvc2UodHJ1ZSlcbiAgICAgICAgLnRpdGxlKCdQbGVhc2UgY2hvb3NlIGEgbmFtZSBmb3IgeW91ciBzZWFyY2guJylcbiAgICAgICAgLm9wZW5Gcm9tKCcucmVzdWx0c2Zvcm0nKVxuICAgICAgICAub2soJ1NhdmUnKVxuICAgICkudGhlbihmdW5jdGlvbihyZXN1bHRzKXtcbiAgICAgIGxldCBzZWFyY2ggPSAkc2NvcGUucmVzdWx0c09ialxuICAgICAgc2VhcmNoLnRpdGxlID0gcmVzdWx0c1xuICAgICAgc2VhcmNoLmlkID0gcmFuZG9tU3RyaW5nLmdldFN0cmluZygpXG4gICAgICBzZWFyY2hTZXJ2aWNlLnNhdmVTZWFyY2goc2VhcmNoKVxuICAgIH0pXG4gIH1cblxufSlcbiJdfQ==

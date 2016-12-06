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
    console.log('id in deleteSearch: ', id);
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
app.controller('resultsController', function($scope, $mdDialog, searchService, postService, randomString) {
  $scope.resultsObj = searchService.resultsObjGetter();
  $scope.dupeShow = false
  $scope.imageHide = false

  $scope.delete = function(index) {
    postService.delete($scope.resultsObj._id, index).then(function(results) {
      searchService.resultsObjSetter(results)
      $scope.resultsObj = searchService.resultsObjGetter()
    })
  }

  $scope.deleteDupes = function() {
    console.log('deleting dupes');
    postService.deleteDupes().then(function(results) {
      $scope.resultsObj = searchService.resultsObjGetter()
    })
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhdXRoQ3RybC5qcyIsImRhc2hDdHJsLmpzIiwiaW5kZXguanMiLCJtYWluQ3RybC5qcyIsInJlc3VsdHNDdHJsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImFwcC5jb250cm9sbGVyKCdBdXRoQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJGh0dHAsICRsb2NhdGlvbiwgYXV0aFNlcnZpY2UsIHVzZXJTZXJ2aWNlKSB7ICAkc2NvcGUudXNlciA9IHt9O1xuICAkc2NvcGUuc2lnbnVwID0gZnVuY3Rpb24oKSB7XG4gICAgdXNlclNlcnZpY2Uuc2lnbnVwKCRzY29wZS51c2VyKVxuICB9XG5cbiAgJHNjb3BlLmxvZ2luID0gZnVuY3Rpb24oKSB7XG4gICAgdXNlclNlcnZpY2UubG9naW4oJHNjb3BlLnVzZXIpXG4gIH1cblxufSlcbiIsImFwcC5jb250cm9sbGVyKCdkYXNoQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgdXNlclNlcnZpY2UsIHNlYXJjaFNlcnZpY2UpIHtcbiAgdXNlclNlcnZpY2UuZ2V0VXNlcigpLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICRzY29wZS51c2VyT2JqID0gcmVzdWx0c1xuICB9KVxuXG4gICRzY29wZS5kZWxldGVTZWFyY2ggPSBmdW5jdGlvbihpZCl7XG4gICAgY29uc29sZS5sb2coJ2lkIGluIGRlbGV0ZVNlYXJjaDogJywgaWQpO1xuICAgIHNlYXJjaFNlcnZpY2UuZGVsZXRlU2VhcmNoKGlkKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpe1xuICAgICAgJHNjb3BlLnVzZXJPYmogPSByZXN1bHRzXG4gICAgfSlcbiAgfVxuXG4gICRzY29wZS52aWV3U2VhcmNoID0gZnVuY3Rpb24oaWQpe1xuICAgIHNlYXJjaFNlcnZpY2Uudmlld1NlYXJjaChpZCkudGhlbihmdW5jdGlvbihyZXN1bHRzKXtcbiAgICAgICRzY29wZS51c2VyT2JqID0gcmVzdWx0c1xuICAgIH0pXG4gIH1cbn0pXG4iLCJyZXF1aXJlKCcuL2F1dGhDdHJsLmpzJylcbnJlcXVpcmUoJy4vZGFzaEN0cmwuanMnKVxucmVxdWlyZSgnLi9tYWluQ3RybC5qcycpXG5yZXF1aXJlKCcuL3Jlc3VsdHNDdHJsLmpzJylcbiIsImFwcC5jb250cm9sbGVyKCdNYWluQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJGh0dHAsIHNlYXJjaFNlcnZpY2UsIHN0YXRlTGlzdFNlcnZpY2UsICRsb2NhdGlvbiwgYXV0aFNlcnZpY2UsIHVzZXJTZXJ2aWNlLCAkd2luZG93LCAkcSkge1xuXG4gIHN0YXRlTGlzdFNlcnZpY2UucmV0cmlldmUoKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5zdGF0ZUxpc3RQcm90byA9IHN0YXRlTGlzdFNlcnZpY2UucmVzdWx0c0FyckdldHRlcigpO1xuICB9KVxuXG4gICRzY29wZS5sb2dvdXQgPSBmdW5jdGlvbigpIHtcbiAgICAkcShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIGF1dGhTZXJ2aWNlLmxvZ291dCgpXG4gICAgICByZXNvbHZlKCdkb25lIScpXG4gICAgfSkudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICAvLyAkc2NvcGUuJGFwcGx5KClcbiAgICB9KVxuICB9XG5cbiAgJHNjb3BlLmhvbWUgPSBmdW5jdGlvbigpIHtcbiAgICAkbG9jYXRpb24ucGF0aCgnLycpXG4gIH1cblxuICAkc2NvcGUuJHdhdGNoKGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICR3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2NyYWlnc2JsaXNzLXRva2VuJylcbiAgICB9LFxuICAgIGZ1bmN0aW9uKG5ld1ZhbHVlKSB7XG4gICAgICBpZiAobmV3VmFsdWUpIHtcbiAgICAgICAgbGV0IGRlY29kZWRQYXlsb2FkID0gSlNPTi5wYXJzZShhdG9iKG5ld1ZhbHVlLnNwbGl0KCcuJylbMV0pKVxuICAgICAgICAkc2NvcGUudXNlcm5hbWUgPSBkZWNvZGVkUGF5bG9hZC51c2VybmFtZVxuICAgICAgfVxuICAgIH1cbiAgKVxuXG4gICRzY29wZS5kYXNoYm9hcmQgPSBmdW5jdGlvbigpIHtcbiAgICB1c2VyU2VydmljZS5nZXRVc2VyKClcbiAgfVxuXG4gICRzY29wZS5zdWJtaXQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VhcmNoUGFyYW1zID0ge307XG4gICAgc2VhcmNoUGFyYW1zLnJlZ2lvbkNob2ljZSA9ICRzY29wZS5yZWdpb25DaG9pY2VcbiAgICBzZWFyY2hQYXJhbXMudXJsID0gJ2h0dHA6Ly8nICsgJHNjb3BlLnJlZ2lvbkNob2ljZSArICdzZWFyY2gvYXBhPydcbiAgICBpZiAoJHNjb3BlLnF1ZXJ5KSB7XG4gICAgICBzZWFyY2hQYXJhbXMudXJsICs9ICgnJnF1ZXJ5PScgKyAkc2NvcGUucXVlcnkpXG4gICAgfVxuICAgIGlmICgkc2NvcGUuZGlzdGFuY2UpIHtcbiAgICAgIHNlYXJjaFBhcmFtcy51cmwgKz0gKCcmc2VhcmNoX2Rpc3RhbmNlPScgKyAkc2NvcGUuZGlzdGFuY2UpXG4gICAgfVxuICAgIGlmICgkc2NvcGUucG9zdGFsKSB7XG4gICAgICBzZWFyY2hQYXJhbXMudXJsICs9ICgnJnBvc3RhbD0nICsgJHNjb3BlLnBvc3RhbClcbiAgICB9XG4gICAgaWYgKCRzY29wZS5taW5fcHJpY2UpIHtcbiAgICAgIHNlYXJjaFBhcmFtcy51cmwgKz0gKCcmbWluX3ByaWNlPScgKyAkc2NvcGUubWluX3ByaWNlKVxuICAgIH1cbiAgICBpZiAoJHNjb3BlLm1heF9wcmljZSkge1xuICAgICAgc2VhcmNoUGFyYW1zLnVybCArPSAoJyZtYXhfcHJpY2U9JyArICRzY29wZS5tYXhfcHJpY2UpXG4gICAgfVxuICAgIHNlYXJjaFBhcmFtcy50aXRsZSA9ICRzY29wZS5zY2FudGl0bGVcbiAgICBzZWFyY2hTZXJ2aWNlLm5ld1NlYXJjaChzZWFyY2hQYXJhbXMpLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgJGxvY2F0aW9uLnBhdGgoJy9yZXN1bHRzJylcbiAgICB9KVxuICB9XG59KVxuIiwiYXBwLmNvbnRyb2xsZXIoJ3Jlc3VsdHNDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkbWREaWFsb2csIHNlYXJjaFNlcnZpY2UsIHBvc3RTZXJ2aWNlLCByYW5kb21TdHJpbmcpIHtcbiAgJHNjb3BlLnJlc3VsdHNPYmogPSBzZWFyY2hTZXJ2aWNlLnJlc3VsdHNPYmpHZXR0ZXIoKTtcbiAgJHNjb3BlLmR1cGVTaG93ID0gZmFsc2VcbiAgJHNjb3BlLmltYWdlSGlkZSA9IGZhbHNlXG5cbiAgJHNjb3BlLmRlbGV0ZSA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgcG9zdFNlcnZpY2UuZGVsZXRlKCRzY29wZS5yZXN1bHRzT2JqLl9pZCwgaW5kZXgpLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgc2VhcmNoU2VydmljZS5yZXN1bHRzT2JqU2V0dGVyKHJlc3VsdHMpXG4gICAgICAkc2NvcGUucmVzdWx0c09iaiA9IHNlYXJjaFNlcnZpY2UucmVzdWx0c09iakdldHRlcigpXG4gICAgfSlcbiAgfVxuXG4gICRzY29wZS5kZWxldGVEdXBlcyA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKCdkZWxldGluZyBkdXBlcycpO1xuICAgIHBvc3RTZXJ2aWNlLmRlbGV0ZUR1cGVzKCkudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICAkc2NvcGUucmVzdWx0c09iaiA9IHNlYXJjaFNlcnZpY2UucmVzdWx0c09iakdldHRlcigpXG4gICAgfSlcbiAgfVxuXG4gICRzY29wZS5zYXZlRGlhbG9nID0gZnVuY3Rpb24oKSB7XG4gICAgJG1kRGlhbG9nLnNob3coXG4gICAgICAkbWREaWFsb2cucHJvbXB0KClcbiAgICAgIC5jbGlja091dHNpZGVUb0Nsb3NlKHRydWUpXG4gICAgICAudGl0bGUoJ1BsZWFzZSBjaG9vc2UgYSBuYW1lIGZvciB5b3VyIHNlYXJjaC4nKVxuICAgICAgLm9wZW5Gcm9tKCcucmVzdWx0c2Zvcm0nKVxuICAgICAgLm9rKCdTYXZlJylcbiAgICApLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgbGV0IHNlYXJjaCA9ICRzY29wZS5yZXN1bHRzT2JqXG4gICAgICBkZWxldGUgc2VhcmNoLmR1cGVDb3VudFxuICAgICAgZGVsZXRlIHNlYXJjaC5yZXN1bHRDb3VudFxuICAgICAgc2VhcmNoLnRpdGxlID0gcmVzdWx0c1xuICAgICAgc2VhcmNoU2VydmljZS5zYXZlU2VhcmNoKHNlYXJjaClcbiAgICB9KVxuICB9XG5cbn0pXG4iXX0=

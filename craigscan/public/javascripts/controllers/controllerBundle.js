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
    searchService.search(searchParams).then(function(results) {
      $location.path('/results')
    })
  }
})

},{}],5:[function(require,module,exports){
app.controller('resultsController', function($scope, $mdDialog, searchService, randomString){
  $scope.obj = searchService.resultsObjGetter();
  $scope.arr = $scope.obj.dataArr
  $scope.dupeShow = false
  $scope.imageHide = false
  $scope.saveDialog = function(){
    $mdDialog.show(
      $mdDialog.prompt()
        .clickOutsideToClose(true)
        .title('Please choose a name for your search.')
        .openFrom('.resultsform')
        .ok('Save')
    ).then(function(results){
      let search = {}
      search.title = results
      search.results = $scope.arr
      search.id = randomString.getString()
      searchService.saveSearch(search)
    })
  }

})

},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhdXRoQ3RybC5qcyIsImRhc2hDdHJsLmpzIiwiaW5kZXguanMiLCJtYWluQ3RybC5qcyIsInJlc3VsdHNDdHJsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImFwcC5jb250cm9sbGVyKCdBdXRoQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJGh0dHAsICRsb2NhdGlvbiwgYXV0aFNlcnZpY2UsIHVzZXJTZXJ2aWNlKSB7ICAkc2NvcGUudXNlciA9IHt9O1xuXG4gICRzY29wZS5zaWdudXAgPSBmdW5jdGlvbigpIHtcbiAgICB1c2VyU2VydmljZS5zaWdudXAoJHNjb3BlLnVzZXIpXG4gIH1cblxuICAkc2NvcGUubG9naW4gPSBmdW5jdGlvbigpIHtcbiAgICB1c2VyU2VydmljZS5sb2dpbigkc2NvcGUudXNlcilcbiAgfVxuXG59KVxuIiwiYXBwLmNvbnRyb2xsZXIoJ2Rhc2hDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCB1c2VyU2VydmljZSwgc2VhcmNoU2VydmljZSkge1xuICB1c2VyU2VydmljZS5nZXRVc2VyKCkudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgJHNjb3BlLnVzZXJPYmogPSByZXN1bHRzXG4gIH0pXG5cbiAgJHNjb3BlLmRlbGV0ZVNlYXJjaCA9IGZ1bmN0aW9uKGlkKXtcbiAgICBzZWFyY2hTZXJ2aWNlLmRlbGV0ZVNlYXJjaChpZCkudGhlbihmdW5jdGlvbihyZXN1bHRzKXtcbiAgICAgICRzY29wZS51c2VyT2JqID0gcmVzdWx0c1xuICAgIH0pXG4gIH1cblxuICAkc2NvcGUudmlld1NlYXJjaCA9IGZ1bmN0aW9uKGlkKXtcbiAgICBzZWFyY2hTZXJ2aWNlLnZpZXdTZWFyY2goaWQpLnRoZW4oZnVuY3Rpb24ocmVzdWx0cyl7XG4gICAgICAkc2NvcGUudXNlck9iaiA9IHJlc3VsdHNcbiAgICB9KVxuICB9XG59KVxuIiwicmVxdWlyZSgnLi9hdXRoQ3RybC5qcycpXG5yZXF1aXJlKCcuL2Rhc2hDdHJsLmpzJylcbnJlcXVpcmUoJy4vbWFpbkN0cmwuanMnKVxucmVxdWlyZSgnLi9yZXN1bHRzQ3RybC5qcycpXG4iLCJhcHAuY29udHJvbGxlcignTWFpbkNvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRodHRwLCBzZWFyY2hTZXJ2aWNlLCBzdGF0ZUxpc3RTZXJ2aWNlLCAkbG9jYXRpb24sIGF1dGhTZXJ2aWNlLCB1c2VyU2VydmljZSwgJHdpbmRvdywgJHEpIHtcbiAgc3RhdGVMaXN0U2VydmljZS5yZXRyaWV2ZSgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnN0YXRlTGlzdFByb3RvID0gc3RhdGVMaXN0U2VydmljZS5yZXN1bHRzQXJyR2V0dGVyKCk7XG4gIH0pXG5cbiAgJHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuICAgICRxKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgYXV0aFNlcnZpY2UubG9nb3V0KClcbiAgICAgIHJlc29sdmUoJ2RvbmUhJylcbiAgICB9KS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgIC8vICRzY29wZS4kYXBwbHkoKVxuICAgIH0pXG4gIH1cblxuICAkc2NvcGUuaG9tZSA9IGZ1bmN0aW9uKCkge1xuICAgICRsb2NhdGlvbi5wYXRoKCcvJylcbiAgfVxuXG4gICRzY29wZS4kd2F0Y2goZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gJHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnY3JhaWdzYmxpc3MtdG9rZW4nKVxuICAgIH0sXG4gICAgZnVuY3Rpb24obmV3VmFsdWUpIHtcbiAgICAgIGlmIChuZXdWYWx1ZSkge1xuICAgICAgICBsZXQgZGVjb2RlZFBheWxvYWQgPSBKU09OLnBhcnNlKGF0b2IobmV3VmFsdWUuc3BsaXQoJy4nKVsxXSkpXG4gICAgICAgICRzY29wZS51c2VybmFtZSA9IGRlY29kZWRQYXlsb2FkLnVzZXJuYW1lXG4gICAgICB9XG4gICAgfVxuICApXG5cbiAgJHNjb3BlLmRhc2hib2FyZCA9IGZ1bmN0aW9uKCkge1xuICAgIHVzZXJTZXJ2aWNlLmdldFVzZXIoKVxuICB9XG5cbiAgJHNjb3BlLnN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWFyY2hQYXJhbXMgPSB7fTtcbiAgICBzZWFyY2hQYXJhbXMucmVnaW9uQ2hvaWNlID0gJHNjb3BlLnJlZ2lvbkNob2ljZVxuICAgIHNlYXJjaFBhcmFtcy51cmwgPSAnaHR0cDovLycgKyAkc2NvcGUucmVnaW9uQ2hvaWNlICsgJ3NlYXJjaC9hcGE/J1xuICAgIGlmICgkc2NvcGUucXVlcnkpIHtcbiAgICAgIHNlYXJjaFBhcmFtcy51cmwgKz0gKCcmcXVlcnk9JyArICRzY29wZS5xdWVyeSlcbiAgICB9XG4gICAgaWYgKCRzY29wZS5kaXN0YW5jZSkge1xuICAgICAgc2VhcmNoUGFyYW1zLnVybCArPSAoJyZzZWFyY2hfZGlzdGFuY2U9JyArICRzY29wZS5kaXN0YW5jZSlcbiAgICB9XG4gICAgaWYgKCRzY29wZS5wb3N0YWwpIHtcbiAgICAgIHNlYXJjaFBhcmFtcy51cmwgKz0gKCcmcG9zdGFsPScgKyAkc2NvcGUucG9zdGFsKVxuICAgIH1cbiAgICBpZiAoJHNjb3BlLm1pbl9wcmljZSkge1xuICAgICAgc2VhcmNoUGFyYW1zLnVybCArPSAoJyZtaW5fcHJpY2U9JyArICRzY29wZS5taW5fcHJpY2UpXG4gICAgfVxuICAgIGlmICgkc2NvcGUubWF4X3ByaWNlKSB7XG4gICAgICBzZWFyY2hQYXJhbXMudXJsICs9ICgnJm1heF9wcmljZT0nICsgJHNjb3BlLm1heF9wcmljZSlcbiAgICB9XG4gICAgc2VhcmNoUGFyYW1zLnRpdGxlID0gJHNjb3BlLnNjYW50aXRsZVxuICAgIHNlYXJjaFNlcnZpY2Uuc2VhcmNoKHNlYXJjaFBhcmFtcykudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICAkbG9jYXRpb24ucGF0aCgnL3Jlc3VsdHMnKVxuICAgIH0pXG4gIH1cbn0pXG4iLCJhcHAuY29udHJvbGxlcigncmVzdWx0c0NvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRtZERpYWxvZywgc2VhcmNoU2VydmljZSwgcmFuZG9tU3RyaW5nKXtcbiAgJHNjb3BlLm9iaiA9IHNlYXJjaFNlcnZpY2UucmVzdWx0c09iakdldHRlcigpO1xuICAkc2NvcGUuYXJyID0gJHNjb3BlLm9iai5kYXRhQXJyXG4gICRzY29wZS5kdXBlU2hvdyA9IGZhbHNlXG4gICRzY29wZS5pbWFnZUhpZGUgPSBmYWxzZVxuICAkc2NvcGUuc2F2ZURpYWxvZyA9IGZ1bmN0aW9uKCl7XG4gICAgJG1kRGlhbG9nLnNob3coXG4gICAgICAkbWREaWFsb2cucHJvbXB0KClcbiAgICAgICAgLmNsaWNrT3V0c2lkZVRvQ2xvc2UodHJ1ZSlcbiAgICAgICAgLnRpdGxlKCdQbGVhc2UgY2hvb3NlIGEgbmFtZSBmb3IgeW91ciBzZWFyY2guJylcbiAgICAgICAgLm9wZW5Gcm9tKCcucmVzdWx0c2Zvcm0nKVxuICAgICAgICAub2soJ1NhdmUnKVxuICAgICkudGhlbihmdW5jdGlvbihyZXN1bHRzKXtcbiAgICAgIGxldCBzZWFyY2ggPSB7fVxuICAgICAgc2VhcmNoLnRpdGxlID0gcmVzdWx0c1xuICAgICAgc2VhcmNoLnJlc3VsdHMgPSAkc2NvcGUuYXJyXG4gICAgICBzZWFyY2guaWQgPSByYW5kb21TdHJpbmcuZ2V0U3RyaW5nKClcbiAgICAgIHNlYXJjaFNlcnZpY2Uuc2F2ZVNlYXJjaChzZWFyY2gpXG4gICAgfSlcbiAgfVxuXG59KVxuIl19

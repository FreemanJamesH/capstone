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
      $scope.loading = false;
    })
  } else {
    searchService.viewSearch($routeParams.searchId).then(function(){
      $scope.resultsObj = searchService.resultsObjGetter()
      $scope.dupeCount = $scope.resultsObj.dupeCount
      $scope.loading = false;
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
      let search = Object.assign({}, $scope.resultsObj)
      delete search.dupeCount
      delete search.resultCount
      search.title = results
      searchService.saveSearch(search)
    })
  }
})

},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhdXRoQ3RybC5qcyIsImRhc2hDdHJsLmpzIiwiaW5kZXguanMiLCJtYWluQ3RybC5qcyIsInJlc3VsdHNDdHJsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImFwcC5jb250cm9sbGVyKCdBdXRoQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJGh0dHAsICRsb2NhdGlvbiwgYXV0aFNlcnZpY2UsIHVzZXJTZXJ2aWNlKSB7ICAkc2NvcGUudXNlciA9IHt9O1xuXG4gICRzY29wZS5zaWdudXAgPSBmdW5jdGlvbigpIHtcbiAgICB1c2VyU2VydmljZS5zaWdudXAoJHNjb3BlLnVzZXIpXG4gIH1cblxuICAkc2NvcGUubG9naW4gPSBmdW5jdGlvbigpIHtcbiAgICB1c2VyU2VydmljZS5sb2dpbigkc2NvcGUudXNlcilcbiAgfVxuXG59KVxuIiwiYXBwLmNvbnRyb2xsZXIoJ2Rhc2hDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkbG9jYXRpb24sIHVzZXJTZXJ2aWNlLCBzZWFyY2hTZXJ2aWNlKSB7XG5cbiAgdXNlclNlcnZpY2UuZ2V0VXNlcigpLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICRzY29wZS51c2VyT2JqID0gcmVzdWx0c1xuICB9KVxuXG4gICRzY29wZS5kZWxldGVTZWFyY2ggPSBmdW5jdGlvbihpZCkge1xuICAgIHNlYXJjaFNlcnZpY2UuZGVsZXRlU2VhcmNoKGlkKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgICRzY29wZS51c2VyT2JqID0gcmVzdWx0c1xuICAgIH0pXG4gIH1cblxuICAkc2NvcGUudmlld1NlYXJjaCA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgJGxvY2F0aW9uLnBhdGgoYC9yZXN1bHRzLyR7aWR9YClcbiAgfVxufSlcbiIsInJlcXVpcmUoJy4vYXV0aEN0cmwuanMnKVxucmVxdWlyZSgnLi9kYXNoQ3RybC5qcycpXG5yZXF1aXJlKCcuL21haW5DdHJsLmpzJylcbnJlcXVpcmUoJy4vcmVzdWx0c0N0cmwuanMnKVxuIiwiYXBwLmNvbnRyb2xsZXIoJ01haW5Db250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkaHR0cCwgc2VhcmNoU2VydmljZSwgc3RhdGVMaXN0U2VydmljZSwgJGxvY2F0aW9uLCBhdXRoU2VydmljZSwgdXNlclNlcnZpY2UsICR3aW5kb3csICRxKSB7XG5cbiAgc3RhdGVMaXN0U2VydmljZS5yZXRyaWV2ZSgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnN0YXRlTGlzdFByb3RvID0gc3RhdGVMaXN0U2VydmljZS5yZXN1bHRzQXJyR2V0dGVyKCk7XG4gIH0pXG5cbiAgJHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uKCl7XG4gICAgYXV0aFNlcnZpY2UubG9nb3V0KClcbiAgICAkc2NvcGUudXNlcm5hbWUgPSBudWxsXG4gIH1cblxuICAkc2NvcGUuaG9tZSA9IGZ1bmN0aW9uKCkge1xuICAgICRsb2NhdGlvbi5wYXRoKCcvJylcbiAgfVxuXG4gICRzY29wZS4kd2F0Y2goZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gJHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnY3JhaWdzYmxpc3MtdG9rZW4nKVxuICAgIH0sXG4gICAgZnVuY3Rpb24obmV3VmFsdWUpIHtcbiAgICAgIGlmIChuZXdWYWx1ZSkge1xuICAgICAgICBsZXQgZGVjb2RlZFBheWxvYWQgPSBKU09OLnBhcnNlKGF0b2IobmV3VmFsdWUuc3BsaXQoJy4nKVsxXSkpXG4gICAgICAgICRzY29wZS51c2VybmFtZSA9IGRlY29kZWRQYXlsb2FkLnVzZXJuYW1lXG4gICAgICB9XG4gICAgfSxcbiAgICB0cnVlXG4gIClcblxuICAkc2NvcGUuZGFzaGJvYXJkID0gZnVuY3Rpb24oKSB7XG4gICAgdXNlclNlcnZpY2UuZ2V0VXNlcigpXG4gIH1cblxuICAkc2NvcGUuc3VibWl0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlYXJjaFBhcmFtcyA9IHt9O1xuICAgIHNlYXJjaFBhcmFtcy5yZWdpb25DaG9pY2UgPSAkc2NvcGUucmVnaW9uQ2hvaWNlXG4gICAgc2VhcmNoUGFyYW1zLnVybCA9ICdodHRwOi8vJyArICRzY29wZS5yZWdpb25DaG9pY2UgKyAnc2VhcmNoL2FwYT8nXG4gICAgaWYgKCRzY29wZS5xdWVyeSkge1xuICAgICAgc2VhcmNoUGFyYW1zLnVybCArPSAoJyZxdWVyeT0nICsgJHNjb3BlLnF1ZXJ5KVxuICAgIH1cbiAgICBpZiAoJHNjb3BlLmRpc3RhbmNlKSB7XG4gICAgICBzZWFyY2hQYXJhbXMudXJsICs9ICgnJnNlYXJjaF9kaXN0YW5jZT0nICsgJHNjb3BlLmRpc3RhbmNlKVxuICAgIH1cbiAgICBpZiAoJHNjb3BlLnBvc3RhbCkge1xuICAgICAgc2VhcmNoUGFyYW1zLnVybCArPSAoJyZwb3N0YWw9JyArICRzY29wZS5wb3N0YWwpXG4gICAgfVxuICAgIGlmICgkc2NvcGUubWluX3ByaWNlKSB7XG4gICAgICBzZWFyY2hQYXJhbXMudXJsICs9ICgnJm1pbl9wcmljZT0nICsgJHNjb3BlLm1pbl9wcmljZSlcbiAgICB9XG4gICAgaWYgKCRzY29wZS5tYXhfcHJpY2UpIHtcbiAgICAgIHNlYXJjaFBhcmFtcy51cmwgKz0gKCcmbWF4X3ByaWNlPScgKyAkc2NvcGUubWF4X3ByaWNlKVxuICAgIH1cbiAgICBzZWFyY2hQYXJhbXMudGl0bGUgPSAkc2NvcGUuc2NhbnRpdGxlXG4gICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2VbJ3VybCddID0gc2VhcmNoUGFyYW1zLnVybFxuICAgICR3aW5kb3cubG9jYWxTdG9yYWdlWydyZWdpb25DaG9pY2UnXSA9IHNlYXJjaFBhcmFtcy5yZWdpb25DaG9pY2VcbiAgICAkbG9jYXRpb24ucGF0aCgnL3Jlc3VsdHMnKVxuICB9XG59KVxuIiwiYXBwLmNvbnRyb2xsZXIoJ3Jlc3VsdHNDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkcm91dGVQYXJhbXMsICRtZERpYWxvZywgc2VhcmNoU2VydmljZSwgcG9zdFNlcnZpY2UsICR3aW5kb3cpIHtcblxuICAkc2NvcGUubG9hZGluZyA9IHRydWU7XG4gICRzY29wZS5sb2FkaW5nTWVzc2FnZSA9IGBMb2FkaW5nIHlvdXIgcmVzdWx0cy4uLmBcblxuICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gYFRoYW5rIHlvdSBmb3IgeW91ciBwYXRpZW5jZS4uLmBcbiAgICAkc2NvcGUuJGFwcGx5KClcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAkc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBgU2VhcmNoZXMgcmV0dXJuaW5nIG1hbnkgcmVzdWx0cyBjYW4gdGFrZSB0aW1lIHRvIHByb2Nlc3MuLi5gXG4gICAgICAkc2NvcGUuJGFwcGx5KClcbiAgICB9LCA0MDAwKVxuICB9LCA0MDAwKVxuXG5cbiAgaWYgKCEkcm91dGVQYXJhbXMuc2VhcmNoSWQpIHtcbiAgICBsZXQgc2VhcmNoUGFyYW1zID0ge31cbiAgICBzZWFyY2hQYXJhbXMucmVnaW9uQ2hvaWNlID0gJHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVnaW9uQ2hvaWNlXG4gICAgc2VhcmNoUGFyYW1zLnVybCA9ICR3aW5kb3cubG9jYWxTdG9yYWdlLnVybFxuICAgIHNlYXJjaFNlcnZpY2UubmV3U2VhcmNoKHNlYXJjaFBhcmFtcykudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICAkc2NvcGUucmVzdWx0c09iaiA9IHNlYXJjaFNlcnZpY2UucmVzdWx0c09iakdldHRlcigpO1xuICAgICAgJHNjb3BlLmR1cGVDb3VudCA9ICRzY29wZS5yZXN1bHRzT2JqLmR1cGVDb3VudFxuICAgICAgJHNjb3BlLmxvYWRpbmcgPSBmYWxzZTtcbiAgICB9KVxuICB9IGVsc2Uge1xuICAgIHNlYXJjaFNlcnZpY2Uudmlld1NlYXJjaCgkcm91dGVQYXJhbXMuc2VhcmNoSWQpLnRoZW4oZnVuY3Rpb24oKXtcbiAgICAgICRzY29wZS5yZXN1bHRzT2JqID0gc2VhcmNoU2VydmljZS5yZXN1bHRzT2JqR2V0dGVyKClcbiAgICAgICRzY29wZS5kdXBlQ291bnQgPSAkc2NvcGUucmVzdWx0c09iai5kdXBlQ291bnRcbiAgICAgICRzY29wZS5sb2FkaW5nID0gZmFsc2U7XG4gICAgfSlcbiAgfVxuXG4gICRzY29wZS5kdXBlU2hvdyA9IGZhbHNlXG4gICRzY29wZS5pbWFnZUhpZGUgPSBmYWxzZVxuXG4gICRzY29wZS5kZWxldGUgPSBmdW5jdGlvbihyZXN1bHRJZCkge1xuICAgIGNvbnNvbGUubG9nKHJlc3VsdElkKTtcbiAgICBwb3N0U2VydmljZS5kZWxldGUoJHNjb3BlLnJlc3VsdHNPYmouX2lkLCByZXN1bHRJZCkudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICBzZWFyY2hTZXJ2aWNlLnJlc3VsdHNPYmpTZXR0ZXIocmVzdWx0cylcbiAgICAgICRzY29wZS5yZXN1bHRzT2JqID0gc2VhcmNoU2VydmljZS5yZXN1bHRzT2JqR2V0dGVyKClcbiAgICB9KVxuICB9XG5cbiAgJHNjb3BlLmRlbGV0ZUFub24gPSBmdW5jdGlvbihpbmRleCkge1xuICAgIGxldCBkZWxldGVkID0gJHNjb3BlLnJlc3VsdHNPYmoucmVzdWx0cy5zcGxpY2UoaW5kZXgsIDEpXG4gICAgY29uc29sZS5sb2coZGVsZXRlZFswXSk7XG4gICAgaWYgKGRlbGV0ZWRbMF0uZHVwZSkge1xuICAgICAgJHNjb3BlLmR1cGVDb3VudC0tXG4gICAgfSBlbHNlIHtcbiAgICAgICRzY29wZS5yZXN1bHRzT2JqLnJlc3VsdENvdW50LS1cbiAgICB9XG4gIH1cblxuICAkc2NvcGUuZGVsZXRlRHVwZXMgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgZHVwZXNSZW1vdmVkID0gJHNjb3BlLnJlc3VsdHNPYmoucmVzdWx0cy5maWx0ZXIoZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICByZXR1cm4gIXJlc3VsdC5kdXBlXG4gICAgfSlcblxuICAgIGlmICgkc2NvcGUucmVzdWx0c09iai5faWQpIHtcbiAgICAgIHBvc3RTZXJ2aWNlLmRlbGV0ZUR1cGVzKCRzY29wZS5yZXN1bHRzT2JqLl9pZCwgZHVwZXNSZW1vdmVkKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgICAgJHNjb3BlLnJlc3VsdHNPYmogPSBzZWFyY2hTZXJ2aWNlLnJlc3VsdHNPYmpHZXR0ZXIoKVxuICAgICAgICAkc2NvcGUuZHVwZUNvdW50ID0gJHNjb3BlLnJlc3VsdHNPYmouZHVwZUNvdW50O1xuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgJHNjb3BlLnJlc3VsdHNPYmoucmVzdWx0cyA9IGR1cGVzUmVtb3ZlZFxuICAgICAgJHNjb3BlLmR1cGVDb3VudCA9IDBcbiAgICB9XG4gIH1cblxuICAkc2NvcGUuc2F2ZURpYWxvZyA9IGZ1bmN0aW9uKCkge1xuICAgICRtZERpYWxvZy5zaG93KFxuICAgICAgJG1kRGlhbG9nLnByb21wdCgpXG4gICAgICAuY2xpY2tPdXRzaWRlVG9DbG9zZSh0cnVlKVxuICAgICAgLnRpdGxlKCdQbGVhc2UgY2hvb3NlIGEgbmFtZSBmb3IgeW91ciBzZWFyY2guJylcbiAgICAgIC5vcGVuRnJvbSgnLnJlc3VsdHNmb3JtJylcbiAgICAgIC5vaygnU2F2ZScpXG4gICAgKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgIGxldCBzZWFyY2ggPSBPYmplY3QuYXNzaWduKHt9LCAkc2NvcGUucmVzdWx0c09iailcbiAgICAgIGRlbGV0ZSBzZWFyY2guZHVwZUNvdW50XG4gICAgICBkZWxldGUgc2VhcmNoLnJlc3VsdENvdW50XG4gICAgICBzZWFyY2gudGl0bGUgPSByZXN1bHRzXG4gICAgICBzZWFyY2hTZXJ2aWNlLnNhdmVTZWFyY2goc2VhcmNoKVxuICAgIH0pXG4gIH1cbn0pXG4iXX0=

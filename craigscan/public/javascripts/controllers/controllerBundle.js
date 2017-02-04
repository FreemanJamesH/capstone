(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
app.controller('AuthController', function($scope, $http, $location, authService, userService) {  $scope.user = {};

  $scope.signup = function() {
    console.log('errors?:', $scope.signupForm.$error);
    console.log('valid?:', $scope.signupForm.$valid);
    $scope.submitted = true;
    // userService.signup($scope.user)
  }

  $scope.login = function() {
    $scope.submitted = true;
    // userService.login($scope.user)
  }

})

},{}],2:[function(require,module,exports){
app.controller('dashController', function($scope, $location, userService, searchService) {

  $scope.updating = false;

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

  $scope.updateSearch = function(id){
    $scope.updating = true;
    searchService.updateSearch(id).then(function(results){
      $scope.updating = false;
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

  $scope.stateChoice = undefined;
  $scope.regionChoice = undefined;

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
    searchObj.searchParams = JSON.parse($window.localStorage.searchParams)
    console.log('search params:', $window.localStorage.searchParams);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhdXRoQ3RybC5qcyIsImRhc2hDdHJsLmpzIiwiaW5kZXguanMiLCJtYWluQ3RybC5qcyIsInJlc3VsdHNDdHJsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImFwcC5jb250cm9sbGVyKCdBdXRoQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJGh0dHAsICRsb2NhdGlvbiwgYXV0aFNlcnZpY2UsIHVzZXJTZXJ2aWNlKSB7ICAkc2NvcGUudXNlciA9IHt9O1xuXG4gICRzY29wZS5zaWdudXAgPSBmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZygnZXJyb3JzPzonLCAkc2NvcGUuc2lnbnVwRm9ybS4kZXJyb3IpO1xuICAgIGNvbnNvbGUubG9nKCd2YWxpZD86JywgJHNjb3BlLnNpZ251cEZvcm0uJHZhbGlkKTtcbiAgICAkc2NvcGUuc3VibWl0dGVkID0gdHJ1ZTtcbiAgICAvLyB1c2VyU2VydmljZS5zaWdudXAoJHNjb3BlLnVzZXIpXG4gIH1cblxuICAkc2NvcGUubG9naW4gPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuc3VibWl0dGVkID0gdHJ1ZTtcbiAgICAvLyB1c2VyU2VydmljZS5sb2dpbigkc2NvcGUudXNlcilcbiAgfVxuXG59KVxuIiwiYXBwLmNvbnRyb2xsZXIoJ2Rhc2hDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkbG9jYXRpb24sIHVzZXJTZXJ2aWNlLCBzZWFyY2hTZXJ2aWNlKSB7XG5cbiAgJHNjb3BlLnVwZGF0aW5nID0gZmFsc2U7XG5cbiAgdXNlclNlcnZpY2UuZ2V0VXNlcigpLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICRzY29wZS51c2VyT2JqID0gcmVzdWx0c1xuICB9KVxuXG4gICRzY29wZS5kZWxldGVTZWFyY2ggPSBmdW5jdGlvbihpZCkge1xuICAgIHNlYXJjaFNlcnZpY2UuZGVsZXRlU2VhcmNoKGlkKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgICRzY29wZS51c2VyT2JqID0gcmVzdWx0c1xuICAgIH0pXG4gIH1cblxuICAkc2NvcGUudmlld1NlYXJjaCA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgJGxvY2F0aW9uLnBhdGgoYC9yZXN1bHRzLyR7aWR9YClcbiAgfVxuXG4gICRzY29wZS51cGRhdGVTZWFyY2ggPSBmdW5jdGlvbihpZCl7XG4gICAgJHNjb3BlLnVwZGF0aW5nID0gdHJ1ZTtcbiAgICBzZWFyY2hTZXJ2aWNlLnVwZGF0ZVNlYXJjaChpZCkudGhlbihmdW5jdGlvbihyZXN1bHRzKXtcbiAgICAgICRzY29wZS51cGRhdGluZyA9IGZhbHNlO1xuICAgICAgJHNjb3BlLnVzZXJPYmogPSByZXN1bHRzXG4gICAgfSlcbiAgfVxufSlcbiIsInJlcXVpcmUoJy4vYXV0aEN0cmwuanMnKVxucmVxdWlyZSgnLi9kYXNoQ3RybC5qcycpXG5yZXF1aXJlKCcuL21haW5DdHJsLmpzJylcbnJlcXVpcmUoJy4vcmVzdWx0c0N0cmwuanMnKVxuIiwiYXBwLmNvbnRyb2xsZXIoJ01haW5Db250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkaHR0cCwgc2VhcmNoU2VydmljZSwgc3RhdGVMaXN0U2VydmljZSwgJGxvY2F0aW9uLCBhdXRoU2VydmljZSwgdXNlclNlcnZpY2UsICR3aW5kb3csICRxKSB7XG5cbiAgJHNjb3BlLnN0YXRlQ2hvaWNlID0gdW5kZWZpbmVkO1xuICAkc2NvcGUucmVnaW9uQ2hvaWNlID0gdW5kZWZpbmVkO1xuXG4gIHN0YXRlTGlzdFNlcnZpY2UucmV0cmlldmUoKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5zdGF0ZUxpc3RQcm90byA9IHN0YXRlTGlzdFNlcnZpY2UucmVzdWx0c0FyckdldHRlcigpO1xuICB9KVxuXG4gICRzY29wZS5sb2dvdXQgPSBmdW5jdGlvbigpIHtcbiAgICBhdXRoU2VydmljZS5sb2dvdXQoKVxuICAgICRzY29wZS51c2VybmFtZSA9IG51bGxcbiAgfVxuXG4gICRzY29wZS5ob21lID0gZnVuY3Rpb24oKSB7XG4gICAgJGxvY2F0aW9uLnBhdGgoJy8nKVxuICB9XG5cbiAgJHNjb3BlLiR3YXRjaChmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAkd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdjcmFpZ3NibGlzcy10b2tlbicpXG4gICAgfSxcbiAgICBmdW5jdGlvbihuZXdWYWx1ZSkge1xuICAgICAgaWYgKG5ld1ZhbHVlKSB7XG4gICAgICAgIGxldCBkZWNvZGVkUGF5bG9hZCA9IEpTT04ucGFyc2UoYXRvYihuZXdWYWx1ZS5zcGxpdCgnLicpWzFdKSlcbiAgICAgICAgJHNjb3BlLnVzZXJuYW1lID0gZGVjb2RlZFBheWxvYWQudXNlcm5hbWVcbiAgICAgIH1cbiAgICB9LFxuICAgIHRydWVcbiAgKVxuXG4gICRzY29wZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5zdWJtaXR0ZWQgPSBmYWxzZTtcbiAgfVxuXG4gICRzY29wZS5kYXNoYm9hcmQgPSBmdW5jdGlvbigpIHtcbiAgICB1c2VyU2VydmljZS5nZXRVc2VyKClcbiAgfVxuXG4gICRzY29wZS5zdWJtaXQgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuc3VibWl0dGVkID0gdHJ1ZTtcbiAgICBpZiAoJHNjb3BlLm1heF9wcmljZSA8ICRzY29wZS5taW5fcHJpY2UpIHtcbiAgICAgICRzY29wZS5tYXhTbWFsbGVyID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCRzY29wZS5zdGF0ZUNob2ljZSAmJiAkc2NvcGUucmVnaW9uQ2hvaWNlKSB7XG4gICAgICAgIGxldCBzZWFyY2hQYXJhbXMgPSB7XG4gICAgICAgICAgcmVnaW9uQ2hvaWNlOiAkc2NvcGUucmVnaW9uQ2hvaWNlLFxuICAgICAgICAgIHVwZGF0ZWQ6IERhdGUubm93KCksXG4gICAgICAgICAgcXVlcnk6ICRzY29wZS5xdWVyeSxcbiAgICAgICAgICBzZWFyY2hfZGlzdGFuY2U6ICRzY29wZS5kaXN0YW5jZSxcbiAgICAgICAgICBwb3N0YWw6ICRzY29wZS5wb3N0YWwsXG4gICAgICAgICAgbWluX3ByaWNlOiAkc2NvcGUubWluX3ByaWNlLFxuICAgICAgICAgIG1heF9wcmljZTogJHNjb3BlLm1heF9wcmljZVxuICAgICAgICB9XG4gICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlWydzZWFyY2hQYXJhbXMnXSA9IEpTT04uc3RyaW5naWZ5KHNlYXJjaFBhcmFtcylcbiAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2VbJ3JlZ2lvbkNob2ljZSddID0gJHNjb3BlLnJlZ2lvbkNob2ljZVxuICAgICAgICAkbG9jYXRpb24ucGF0aCgnL3Jlc3VsdHMnKVxuICAgICAgfVxuICAgIH1cbiAgfVxufSlcbiIsImFwcC5jb250cm9sbGVyKCdyZXN1bHRzQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJHJvdXRlUGFyYW1zLCAkbWREaWFsb2csIHNlYXJjaFNlcnZpY2UsIHBvc3RTZXJ2aWNlLCAkd2luZG93KSB7XG5cbiAgJHNjb3BlLmxvYWRpbmcgPSB0cnVlO1xuICAkc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBgTG9hZGluZyB5b3VyIHJlc3VsdHMuLi5gXG5cbiAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICRzY29wZS5sb2FkaW5nTWVzc2FnZSA9IGBUaGFuayB5b3UgZm9yIHlvdXIgcGF0aWVuY2UuLi5gXG4gICAgJHNjb3BlLiRhcHBseSgpXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gYFNlYXJjaGVzIHJldHVybmluZyBtYW55IHJlc3VsdHMgY2FuIHRha2UgdGltZSB0byBwcm9jZXNzLi4uYFxuICAgICAgJHNjb3BlLiRhcHBseSgpXG4gICAgfSwgNDAwMClcbiAgfSwgNDAwMClcblxuXG4gIGlmICghJHJvdXRlUGFyYW1zLnNlYXJjaElkKSB7XG4gICAgbGV0IHNlYXJjaE9iaiA9IHt9XG4gICAgc2VhcmNoT2JqLnJlZ2lvbkNob2ljZSA9ICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlZ2lvbkNob2ljZVxuICAgIHNlYXJjaE9iai5zZWFyY2hQYXJhbXMgPSBKU09OLnBhcnNlKCR3aW5kb3cubG9jYWxTdG9yYWdlLnNlYXJjaFBhcmFtcylcbiAgICBjb25zb2xlLmxvZygnc2VhcmNoIHBhcmFtczonLCAkd2luZG93LmxvY2FsU3RvcmFnZS5zZWFyY2hQYXJhbXMpO1xuICAgIHNlYXJjaFNlcnZpY2UubmV3U2VhcmNoKHNlYXJjaE9iaikudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICAkc2NvcGUucmVzdWx0c09iaiA9IHNlYXJjaFNlcnZpY2UucmVzdWx0c09iakdldHRlcigpO1xuICAgICAgJHNjb3BlLmR1cGVDb3VudCA9ICRzY29wZS5yZXN1bHRzT2JqLmR1cGVDb3VudFxuICAgICAgJHNjb3BlLmZhdkNvdW50ID0gJHNjb3BlLnJlc3VsdHNPYmouZmF2Q291bnRcbiAgICAgICRzY29wZS5sb2FkaW5nID0gZmFsc2U7XG4gICAgfSlcbiAgfSBlbHNlIHtcbiAgICBzZWFyY2hTZXJ2aWNlLnZpZXdTZWFyY2goJHJvdXRlUGFyYW1zLnNlYXJjaElkKS50aGVuKGZ1bmN0aW9uKCl7XG4gICAgICAkc2NvcGUucmVzdWx0c09iaiA9IHNlYXJjaFNlcnZpY2UucmVzdWx0c09iakdldHRlcigpXG4gICAgICAkc2NvcGUuZHVwZUNvdW50ID0gJHNjb3BlLnJlc3VsdHNPYmouZHVwZUNvdW50XG4gICAgICAkc2NvcGUuZmF2Q291bnQgPSAkc2NvcGUucmVzdWx0c09iai5mYXZDb3VudFxuICAgICAgJHNjb3BlLmxvYWRpbmcgPSBmYWxzZTtcbiAgICB9KVxuICB9XG5cbiAgJHNjb3BlLmR1cGVTaG93ID0gZmFsc2VcbiAgJHNjb3BlLmltYWdlSGlkZSA9IGZhbHNlXG4gICRzY29wZS5mYXZPbmx5ID0gZmFsc2VcblxuICAkc2NvcGUuZGVsZXRlID0gZnVuY3Rpb24ocmVzdWx0SWQpIHtcbiAgICBwb3N0U2VydmljZS5kZWxldGUoJHNjb3BlLnJlc3VsdHNPYmouX2lkLCByZXN1bHRJZCkudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICBzZWFyY2hTZXJ2aWNlLnJlc3VsdHNPYmpTZXR0ZXIocmVzdWx0cylcbiAgICAgICRzY29wZS5yZXN1bHRzT2JqID0gc2VhcmNoU2VydmljZS5yZXN1bHRzT2JqR2V0dGVyKClcbiAgICB9KVxuICB9XG5cbiAgJHNjb3BlLmZhdm9yaXRlID0gZnVuY3Rpb24ocmVzdWx0SWQpe1xuICAgIHBvc3RTZXJ2aWNlLmZhdm9yaXRlKCRzY29wZS5yZXN1bHRzT2JqLl9pZCwgcmVzdWx0SWQpLnRoZW4oZnVuY3Rpb24ocmVzdWx0cyl7XG4gICAgICAkc2NvcGUucmVzdWx0c09iaiA9IHNlYXJjaFNlcnZpY2UucmVzdWx0c09iakdldHRlcigpXG4gICAgfSlcbiAgfVxuXG4gICRzY29wZS51bmZhdm9yaXRlID0gZnVuY3Rpb24ocmVzdWx0SWQpe1xuICAgIHBvc3RTZXJ2aWNlLnVuZmF2b3JpdGUoJHNjb3BlLnJlc3VsdHNPYmouX2lkLCByZXN1bHRJZCkudGhlbihmdW5jdGlvbihyZXN1bHRzKXtcbiAgICAgICRzY29wZS5yZXN1bHRzT2JqID0gc2VhcmNoU2VydmljZS5yZXN1bHRzT2JqR2V0dGVyKClcbiAgICB9KVxuICB9XG5cbiAgJHNjb3BlLmRlbGV0ZUFub24gPSBmdW5jdGlvbihpbmRleCkge1xuICAgIGxldCBkZWxldGVkID0gJHNjb3BlLnJlc3VsdHNPYmoucmVzdWx0cy5zcGxpY2UoaW5kZXgsIDEpXG4gICAgY29uc29sZS5sb2coZGVsZXRlZFswXSk7XG4gICAgaWYgKGRlbGV0ZWRbMF0uZHVwZSkge1xuICAgICAgJHNjb3BlLmR1cGVDb3VudC0tXG4gICAgfSBlbHNlIHtcbiAgICAgICRzY29wZS5yZXN1bHRzT2JqLnJlc3VsdENvdW50LS1cbiAgICB9XG4gIH1cblxuICAkc2NvcGUuZGVsZXRlRHVwZXMgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgZHVwZXNSZW1vdmVkID0gJHNjb3BlLnJlc3VsdHNPYmoucmVzdWx0cy5maWx0ZXIoZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICByZXR1cm4gIXJlc3VsdC5kdXBlXG4gICAgfSlcblxuICAgIGlmICgkc2NvcGUucmVzdWx0c09iai5faWQpIHtcbiAgICAgIHBvc3RTZXJ2aWNlLmRlbGV0ZUR1cGVzKCRzY29wZS5yZXN1bHRzT2JqLl9pZCwgZHVwZXNSZW1vdmVkKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgICAgJHNjb3BlLnJlc3VsdHNPYmogPSBzZWFyY2hTZXJ2aWNlLnJlc3VsdHNPYmpHZXR0ZXIoKVxuICAgICAgICAkc2NvcGUuZHVwZUNvdW50ID0gJHNjb3BlLnJlc3VsdHNPYmouZHVwZUNvdW50O1xuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgJHNjb3BlLnJlc3VsdHNPYmoucmVzdWx0cyA9IGR1cGVzUmVtb3ZlZFxuICAgICAgJHNjb3BlLmR1cGVDb3VudCA9IDBcbiAgICB9XG4gIH1cblxuICAkc2NvcGUuc2F2ZURpYWxvZyA9IGZ1bmN0aW9uKCkge1xuICAgICRtZERpYWxvZy5zaG93KFxuICAgICAgJG1kRGlhbG9nLnByb21wdCgpXG4gICAgICAuY2xpY2tPdXRzaWRlVG9DbG9zZSh0cnVlKVxuICAgICAgLnRpdGxlKCdQbGVhc2UgY2hvb3NlIGEgbmFtZSBmb3IgeW91ciBzZWFyY2guJylcbiAgICAgIC5vcGVuRnJvbSgnLmNvbnRyb2xfcGFuZWxfY29udGFpbmVyJylcbiAgICAgIC5vaygnU2F2ZScpXG4gICAgKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgIGxldCBzZWFyY2ggPSBPYmplY3QuYXNzaWduKHt9LCAkc2NvcGUucmVzdWx0c09iailcbiAgICAgIGRlbGV0ZSBzZWFyY2guZHVwZUNvdW50XG4gICAgICBkZWxldGUgc2VhcmNoLnJlc3VsdENvdW50XG4gICAgICBzZWFyY2gudGl0bGUgPSByZXN1bHRzXG4gICAgICBzZWFyY2hTZXJ2aWNlLnNhdmVTZWFyY2goc2VhcmNoKVxuICAgIH0pXG4gIH1cbn0pXG4iXX0=

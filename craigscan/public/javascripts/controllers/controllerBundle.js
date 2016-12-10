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
app.controller('resultsController', function($scope, $mdDialog, searchService, postService, randomString) {;
  $scope.resultsObj = searchService.resultsObjGetter();
  $scope.dupeShow = false
  $scope.imageHide = false
  $scope.dupeCount = $scope.resultsObj.dupeCount

  // $scope.$watch('resultsObj', function() {
  //   $scope.dupeCount = $scope.resultsObj.results.length
  // }, true)

  $scope.delete = function(index) {
    postService.delete($scope.resultsObj._id, index).then(function(results) {
      searchService.resultsObjSetter(results)
      $scope.resultsObj = searchService.resultsObjGetter()
    })
  }

  $scope.deleteDupes = function() {
    function dupeCheck(result) {
      return !result.dupe
    }
    let dupesRemoved = $scope.resultsObj.results.filter(dupeCheck)
    if ($scope.resultsObj._id) {
      postService.deleteDupes($scope.resultsObj._id, dupesRemoved).then(function(results) {
        $scope.resultsObj = searchService.resultsObjGetter()
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhdXRoQ3RybC5qcyIsImRhc2hDdHJsLmpzIiwiaW5kZXguanMiLCJtYWluQ3RybC5qcyIsInJlc3VsdHNDdHJsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiYXBwLmNvbnRyb2xsZXIoJ0F1dGhDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkaHR0cCwgJGxvY2F0aW9uLCBhdXRoU2VydmljZSwgdXNlclNlcnZpY2UpIHsgICRzY29wZS51c2VyID0ge307XG4gICRzY29wZS5zaWdudXAgPSBmdW5jdGlvbigpIHtcbiAgICB1c2VyU2VydmljZS5zaWdudXAoJHNjb3BlLnVzZXIpXG4gIH1cblxuICAkc2NvcGUubG9naW4gPSBmdW5jdGlvbigpIHtcbiAgICB1c2VyU2VydmljZS5sb2dpbigkc2NvcGUudXNlcilcbiAgfVxuXG59KVxuIiwiYXBwLmNvbnRyb2xsZXIoJ2Rhc2hDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCB1c2VyU2VydmljZSwgc2VhcmNoU2VydmljZSkge1xuICB1c2VyU2VydmljZS5nZXRVc2VyKCkudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgJHNjb3BlLnVzZXJPYmogPSByZXN1bHRzXG4gIH0pXG5cbiAgJHNjb3BlLmRlbGV0ZVNlYXJjaCA9IGZ1bmN0aW9uKGlkKXtcbiAgICBjb25zb2xlLmxvZygnaWQgaW4gZGVsZXRlU2VhcmNoOiAnLCBpZCk7XG4gICAgc2VhcmNoU2VydmljZS5kZWxldGVTZWFyY2goaWQpLnRoZW4oZnVuY3Rpb24ocmVzdWx0cyl7XG4gICAgICAkc2NvcGUudXNlck9iaiA9IHJlc3VsdHNcbiAgICB9KVxuICB9XG5cbiAgJHNjb3BlLnZpZXdTZWFyY2ggPSBmdW5jdGlvbihpZCl7XG4gICAgc2VhcmNoU2VydmljZS52aWV3U2VhcmNoKGlkKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpe1xuICAgICAgJHNjb3BlLnVzZXJPYmogPSByZXN1bHRzXG4gICAgfSlcbiAgfVxufSlcbiIsInJlcXVpcmUoJy4vYXV0aEN0cmwuanMnKVxucmVxdWlyZSgnLi9kYXNoQ3RybC5qcycpXG5yZXF1aXJlKCcuL21haW5DdHJsLmpzJylcbnJlcXVpcmUoJy4vcmVzdWx0c0N0cmwuanMnKVxuIiwiYXBwLmNvbnRyb2xsZXIoJ01haW5Db250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkaHR0cCwgc2VhcmNoU2VydmljZSwgc3RhdGVMaXN0U2VydmljZSwgJGxvY2F0aW9uLCBhdXRoU2VydmljZSwgdXNlclNlcnZpY2UsICR3aW5kb3csICRxKSB7XG5cbiAgc3RhdGVMaXN0U2VydmljZS5yZXRyaWV2ZSgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnN0YXRlTGlzdFByb3RvID0gc3RhdGVMaXN0U2VydmljZS5yZXN1bHRzQXJyR2V0dGVyKCk7XG4gIH0pXG5cbiAgJHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuICAgICRxKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgYXV0aFNlcnZpY2UubG9nb3V0KClcbiAgICAgIHJlc29sdmUoJ2RvbmUhJylcbiAgICB9KS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgIC8vICRzY29wZS4kYXBwbHkoKVxuICAgIH0pXG4gIH1cblxuICAkc2NvcGUuaG9tZSA9IGZ1bmN0aW9uKCkge1xuICAgICRsb2NhdGlvbi5wYXRoKCcvJylcbiAgfVxuXG4gICRzY29wZS4kd2F0Y2goZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gJHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnY3JhaWdzYmxpc3MtdG9rZW4nKVxuICAgIH0sXG4gICAgZnVuY3Rpb24obmV3VmFsdWUpIHtcbiAgICAgIGlmIChuZXdWYWx1ZSkge1xuICAgICAgICBsZXQgZGVjb2RlZFBheWxvYWQgPSBKU09OLnBhcnNlKGF0b2IobmV3VmFsdWUuc3BsaXQoJy4nKVsxXSkpXG4gICAgICAgICRzY29wZS51c2VybmFtZSA9IGRlY29kZWRQYXlsb2FkLnVzZXJuYW1lXG4gICAgICB9XG4gICAgfVxuICApXG5cbiAgJHNjb3BlLmRhc2hib2FyZCA9IGZ1bmN0aW9uKCkge1xuICAgIHVzZXJTZXJ2aWNlLmdldFVzZXIoKVxuICB9XG5cbiAgJHNjb3BlLnN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWFyY2hQYXJhbXMgPSB7fTtcbiAgICBzZWFyY2hQYXJhbXMucmVnaW9uQ2hvaWNlID0gJHNjb3BlLnJlZ2lvbkNob2ljZVxuICAgIHNlYXJjaFBhcmFtcy51cmwgPSAnaHR0cDovLycgKyAkc2NvcGUucmVnaW9uQ2hvaWNlICsgJ3NlYXJjaC9hcGE/J1xuICAgIGlmICgkc2NvcGUucXVlcnkpIHtcbiAgICAgIHNlYXJjaFBhcmFtcy51cmwgKz0gKCcmcXVlcnk9JyArICRzY29wZS5xdWVyeSlcbiAgICB9XG4gICAgaWYgKCRzY29wZS5kaXN0YW5jZSkge1xuICAgICAgc2VhcmNoUGFyYW1zLnVybCArPSAoJyZzZWFyY2hfZGlzdGFuY2U9JyArICRzY29wZS5kaXN0YW5jZSlcbiAgICB9XG4gICAgaWYgKCRzY29wZS5wb3N0YWwpIHtcbiAgICAgIHNlYXJjaFBhcmFtcy51cmwgKz0gKCcmcG9zdGFsPScgKyAkc2NvcGUucG9zdGFsKVxuICAgIH1cbiAgICBpZiAoJHNjb3BlLm1pbl9wcmljZSkge1xuICAgICAgc2VhcmNoUGFyYW1zLnVybCArPSAoJyZtaW5fcHJpY2U9JyArICRzY29wZS5taW5fcHJpY2UpXG4gICAgfVxuICAgIGlmICgkc2NvcGUubWF4X3ByaWNlKSB7XG4gICAgICBzZWFyY2hQYXJhbXMudXJsICs9ICgnJm1heF9wcmljZT0nICsgJHNjb3BlLm1heF9wcmljZSlcbiAgICB9XG4gICAgc2VhcmNoUGFyYW1zLnRpdGxlID0gJHNjb3BlLnNjYW50aXRsZVxuICAgIHNlYXJjaFNlcnZpY2UubmV3U2VhcmNoKHNlYXJjaFBhcmFtcykudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICAkbG9jYXRpb24ucGF0aCgnL3Jlc3VsdHMnKVxuICAgIH0pXG4gIH1cbn0pXG4iLCJhcHAuY29udHJvbGxlcigncmVzdWx0c0NvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRtZERpYWxvZywgc2VhcmNoU2VydmljZSwgcG9zdFNlcnZpY2UsIHJhbmRvbVN0cmluZykgeztcbiAgJHNjb3BlLnJlc3VsdHNPYmogPSBzZWFyY2hTZXJ2aWNlLnJlc3VsdHNPYmpHZXR0ZXIoKTtcbiAgJHNjb3BlLmR1cGVTaG93ID0gZmFsc2VcbiAgJHNjb3BlLmltYWdlSGlkZSA9IGZhbHNlXG4gICRzY29wZS5kdXBlQ291bnQgPSAkc2NvcGUucmVzdWx0c09iai5kdXBlQ291bnRcblxuICAvLyAkc2NvcGUuJHdhdGNoKCdyZXN1bHRzT2JqJywgZnVuY3Rpb24oKSB7XG4gIC8vICAgJHNjb3BlLmR1cGVDb3VudCA9ICRzY29wZS5yZXN1bHRzT2JqLnJlc3VsdHMubGVuZ3RoXG4gIC8vIH0sIHRydWUpXG5cbiAgJHNjb3BlLmRlbGV0ZSA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgcG9zdFNlcnZpY2UuZGVsZXRlKCRzY29wZS5yZXN1bHRzT2JqLl9pZCwgaW5kZXgpLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgc2VhcmNoU2VydmljZS5yZXN1bHRzT2JqU2V0dGVyKHJlc3VsdHMpXG4gICAgICAkc2NvcGUucmVzdWx0c09iaiA9IHNlYXJjaFNlcnZpY2UucmVzdWx0c09iakdldHRlcigpXG4gICAgfSlcbiAgfVxuXG4gICRzY29wZS5kZWxldGVEdXBlcyA9IGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIGR1cGVDaGVjayhyZXN1bHQpIHtcbiAgICAgIHJldHVybiAhcmVzdWx0LmR1cGVcbiAgICB9XG4gICAgbGV0IGR1cGVzUmVtb3ZlZCA9ICRzY29wZS5yZXN1bHRzT2JqLnJlc3VsdHMuZmlsdGVyKGR1cGVDaGVjaylcbiAgICBpZiAoJHNjb3BlLnJlc3VsdHNPYmouX2lkKSB7XG4gICAgICBwb3N0U2VydmljZS5kZWxldGVEdXBlcygkc2NvcGUucmVzdWx0c09iai5faWQsIGR1cGVzUmVtb3ZlZCkudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICAgICRzY29wZS5yZXN1bHRzT2JqID0gc2VhcmNoU2VydmljZS5yZXN1bHRzT2JqR2V0dGVyKClcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgICRzY29wZS5yZXN1bHRzT2JqLnJlc3VsdHMgPSBkdXBlc1JlbW92ZWRcbiAgICAgICRzY29wZS5kdXBlQ291bnQgPSAwXG4gICAgfVxuICB9XG5cbiAgJHNjb3BlLnNhdmVEaWFsb2cgPSBmdW5jdGlvbigpIHtcbiAgICAkbWREaWFsb2cuc2hvdyhcbiAgICAgICRtZERpYWxvZy5wcm9tcHQoKVxuICAgICAgLmNsaWNrT3V0c2lkZVRvQ2xvc2UodHJ1ZSlcbiAgICAgIC50aXRsZSgnUGxlYXNlIGNob29zZSBhIG5hbWUgZm9yIHlvdXIgc2VhcmNoLicpXG4gICAgICAub3BlbkZyb20oJy5yZXN1bHRzZm9ybScpXG4gICAgICAub2soJ1NhdmUnKVxuICAgICkudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICBsZXQgc2VhcmNoID0gJHNjb3BlLnJlc3VsdHNPYmpcbiAgICAgIGRlbGV0ZSBzZWFyY2guZHVwZUNvdW50XG4gICAgICBkZWxldGUgc2VhcmNoLnJlc3VsdENvdW50XG4gICAgICBzZWFyY2gudGl0bGUgPSByZXN1bHRzXG4gICAgICBzZWFyY2hTZXJ2aWNlLnNhdmVTZWFyY2goc2VhcmNoKVxuICAgIH0pXG4gIH1cblxufSlcbiJdfQ==

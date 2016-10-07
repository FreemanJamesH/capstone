app.service('authService', ['$resource', '$window', function($resource, $window){
  return {
    signup: function(obj){
      console.log('Signing up...');
      $resource('//localhost:3000/signup').save(obj).$promise.then(function(results){
        $window.localStorage['craigsbliss-token'] = results.jwt
      });
    },
    login: function(obj){
      return $resource('//localhost:3000/login').save(obj).$promise.then(function(results){
        console.log('login results', results);
      })
    },
    giveToken: function(token){
      console.log("Here's the token: ", token);
      $window.localStorage['craigsbliss-token'] = token.jwt;
    },
    getToken: function(){

    },
    logout: function(){
      $window.localStorage.removeItem('craigsbliss-token')
    },
  }
}])

app.service('searchService', ['$resource', function($resource) {
  var resultsObj = {};
  return {
    search: function(obj) {
      console.log('service obj: ', obj)
      // return $resource('https://jhfcapstone.herokuapp.com/api').save(obj).$promise.then(function(results) {
      return $resource('//localhost:3000/api').save(obj).$promise.then(function(results) {
        resultsObj = results;
      })
    },
    resultsObjGetter: function() {
      console.log('resultsObj: ', resultsObj)
      return resultsObj;
    }
  }
}])


app.service('stateListService', ['$resource', function($resource) {
  var resultsArr = [];
  return {
    retrieve: function(obj) {
      // return $resource('https://jhfcapstone.herokuapp.com/sls').get()
      return $resource('//localhost:3000/sls').get()
      .$promise.then(function(results) {
        resultsArr = results.finish;
      })
    },
    resultsArrGetter: function() {
      return resultsArr;
    }
  }
}])

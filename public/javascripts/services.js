app.service('searchService', ['$resource', function($resource){
  this.log = function(){
    console.log('hello');
  },
  this.search = function(){
    console.log('searching')
    $resource('http://boulder.craigslist.org/search/sss?').get({
      sort: 'rel',
      query: 'guitar'
    }).$promise.then(function(results) {
      console.log('results', results);
    })

  }
}])

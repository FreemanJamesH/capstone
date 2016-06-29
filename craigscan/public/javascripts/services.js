app.service('searchService', ['$resource', function($resource){
  this.log = function(){
    console.log('hello');
  },
  this.search = function(){
    console.log('searching')
    $resource('/api').save({
      sort: 'sort=rel',
      query: 'query=guitar'
    }).$promise.then(function(results) {
      console.log('results', results);
    })

  }
}])

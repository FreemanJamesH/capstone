app.service('searchService', ['$resource', function($resource) {
  return {
    log: function() {
      console.log('hello');
    },
    search: function() {
      return $resource('/api').save({
        sort: 'sort=rel',
        query: 'query=guitar'
      }).$promise.then(function(results) {
        console.log('service results:', results)
        return results
      })
    }
  }
}])

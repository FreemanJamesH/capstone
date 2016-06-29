app.controller('MainController', function($scope, $http){
  $scope.hello = 'hello'
  $scope.submit = function(){
    let searchParams = {};
    searchParams.title = $scope.scantitle
    searchParams.date = $scope.scandate
    searchParams.query = $scope.query
    searchParams.location = $scope.scanlocation
    searchParams.category = $scope.scancategory
    console.log(searchParams);
  }


  $scope.testArr = [
    {
      title: 'Thule 1050-09 Roof Rack Tray Upright Bicycle Carrier Single Bike NEW',
      date:'Tue 28 Jun 02:34:36 PM',
      picture: 'http://images.craigslist.org/00c0c_izT4IZl7Q3n_300x300.jpg',
      price: '$50'

    },
    {
      title: 'Thule 1050-09 Roof Rack Tray Upright Bicycle Carrier Single Bike NEW',
      date:'Tue 28 Jun 02:34:36 PM',
      picture: 'http://images.craigslist.org/00c0c_izT4IZl7Q3n_300x300.jpg',
      price: '$50'

    }
  ]

})

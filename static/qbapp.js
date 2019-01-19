var app = angular.module('QBOL', [])

app.controller('QBOLcontroller', ['$scope', '$http', '$location', '$timeout', '$window', '$rootScope', function ($scope, $http, $location, $timeout, $window, $rootScope) {

  $scope.QBAccounts = null
  $scope.realmid = null

  $scope.getQB = function () {

    alert("hello")
    var x = $window.open('/qb') //change to localhost

    $timeout(function () {
      x.close()
    }
      , 20000);

  }

  $scope.getAccounts = function () {

    alert($scope.realmid)
    
    $http.get('/accounts',{params:{realmid:$scope.realmid}}).success(function (data, status, headers, config) {
      $scope.QBAccounts = data
      $scope.setContent('hello.html')
    }).error(function (data, status, headers, config) { })

  }


  $scope.setContent = function (page) {

    $scope.content = '/static/' + page
  }


 $scope.getJson = function(){

   $http.post('/getjson/',{message:"This is a Json Object"})
  .success(function(data,status,headers,config){
  alert(data)
   })
 }


}])



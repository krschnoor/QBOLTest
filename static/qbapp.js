var app = angular.module('QBOL', [])

app.controller('QBOLcontroller', ['$scope', '$http', '$location', '$timeout', '$window', '$rootScope', function ($scope, $http, $location, $timeout, $window, $rootScope) {

  $scope.QBAccounts = null
  $scope.realmid =''
  $scope.content = ''

  $scope.getQB = function () {

    alert("hello")
    var x = $window.open('/qb') //change to localhost

    $timeout(function () {
      x.close()
    }
      , 20000);

  }

  $scope.getAccounts = function (realmid) {

  alert(realmid)
    
    $http.get('/accounts',{params:{realmid:$scope.realmid}}).success(function (data, status, headers, config) {
     
      $scope.QBAccounts = data
      $scope.content = '/static/' + 'hello.html'
    }).error(function (data, status, headers, config) {alert(data) })

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



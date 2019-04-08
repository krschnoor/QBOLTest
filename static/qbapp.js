var app = angular.module('QBOL', [])

app.controller('QBOLcontroller', ['$scope', '$http', '$location', '$timeout', '$window', '$rootScope', function ($scope, $http, $location, $timeout, $window, $rootScope) {

  $scope.QBAccounts = null
  $scope.realmid = ''
  $scope.content = ''
  $scope.tb = null
  $scope.company = null

  $scope.getQB = function () {

   
    var x = $window.open('/qb') //change to localhost

    $timeout(function () {
      x.close()
    }
      , 20000);

  }

  


  $scope.testKeys = function () {


    $http.get('/getcompany').success(function (data, status, headers, config) {


      console.log(data)
      $scope.company = data
      $scope.content = '/static/' + 'company.html'
    }).error(function (data, status, headers, config) { alert(data) })

  }




  $scope.setContent = function (page) {

    $scope.content = '/static/' + page
  }

 



 

  $scope.copy = function () {
   
    var copyText = document.getElementById("realmID");
    var textArea = document.createElement("textarea");
   
    textArea.value = copyText.textContent;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("Copy");
    textArea.remove();

    return null
  }

}])



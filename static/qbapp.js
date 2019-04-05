var app = angular.module('QBOL', [])

app.controller('QBOLcontroller', ['$scope', '$http', '$location', '$timeout', '$window', '$rootScope', function ($scope, $http, $location, $timeout, $window, $rootScope) {

  $scope.QBAccounts = null
  $scope.realmid = ''
  $scope.content = ''
  $scope.tb = null
  $scope.company = null

  $scope.getQB = function () {

    alert("hello")
    var x = $window.open('/qb') //change to localhost

    $timeout(function () {
      x.close()
    }
      , 20000);

  }

  $scope.getAccounts = function (realmid) {

    alert("getaccounts")
    $http.get('/getcompany', { params: { realmid: realmid } }).success(function (data, status, headers, config) {

     alert(data.id)
     // $scope.QBAccounts = data
     // $scope.content = '/static/' + 'hello.html'
    }).error(function (data, status, headers, config) { alert(data) })

  }


$scope.testKeys = function () {

   
    $http.get('/getcompany').success(function (data, status, headers, config) {

     alert(data.CompanyName)
     console.log(data)
     $scope.company = data
     $scope.content = '/static/' + 'company.html'
    }).error(function (data, status, headers, config) { alert(data) })

  }




  $scope.setContent = function (page) {

    $scope.content = '/static/' + page
  }


  $scope.getJson = function () {

    $http.post('/getjson/', { message: "This is a Json Object" })
      .success(function (data, status, headers, config) {
        alert(data)
      })
  }




$scope.getTB = function (realmid) {

    alert(realmid)

    $http.get('/tb', { params: { realmid: realmid, dtStart:"2019-1-1",dtEnd:"2019-3-31" } }).success(function (data, status, headers, config) {

      console.log(data)
     // $scope.tb = data
     // $scope.setContent('trialbalanceview.html')
     // $scope.content = '/static/' + 'trialbalanceview.html'
    }).error(function (data, status, headers, config) { alert(data) })

  }

$scope.getTrialBalanceViewTotals = function (type) {


    var totals = {

      debits: 0,
      credits: 0
    }

    $scope.tb.forEach(function (account, i) {


      totals.debits += parseFloat(account.debit) || 0
      totals.credits += parseFloat(account.credit) || 0


    })


    return type == "credit" ? totals.credits : totals.debits
  }

}])



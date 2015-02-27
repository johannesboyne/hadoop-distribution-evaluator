angular.module('DBISEvaluation', [])
  .controller('FormController', ['$scope', '$http', function($scope, $http) {
    $scope.score_color_classes = ['success', 'warning', 'danger']
    $scope.count = 0
    $scope.data = null
    $http.get('matrix_data.json').then(function (res) {
      $scope.data = res.data
    })

    $scope.percents = function() {
      $scope.count = 0;
      angular.forEach($scope.questions, function(q) {
        $scope.count += q.val;
        if (q.subs) {
          q.subcount = 0
          angular.forEach(q.subs, function (sq) {
            q.subcount += sq.val;
          })
        }
      });
    }
    $scope.percents()

    $scope.sum_all_cats = function () {
      if ($scope.data === null) return
      return $scope.data.categories
      .map(function (c) {
        return $scope.calc_category(c)
      })
      .reduce(function (a,b) { return a+b })
    }

    $scope.calc_category = function (val) {
      if (val.sub_categories.length <= 1)
        return val.cat_weight
      return Math.round((val.sub_categories.map(function (sc) { return sc.cat_weight*val.cat_weight }).reduce(function (prev, cur) { return prev + cur; }))/100)
    }

    $scope.calc_sub_category = function (nindex, sc, val) {
      return val.sub_categories
      .map(function (sc) { return sc.distribution_values
           .map(function (dv) { return dv.points*sc.cat_weight*val.cat_weight }) })
           .reduceRight(function (p,c) { return p.map(function (_p, i) { return _p + c[i] }) })[nindex]/100
    }

    $scope.calc_weight = function (sub, val) {
      return Math.round(sub.cat_weight*val.cat_weight/100)
    }

    $scope.sum_all_subs = function (val) {
      return val.sub_categories
      .map(function (v) { return v.cat_weight })
      .reduce(function (a,b) {
        return a+b
      })
    }

    $scope.check_subs = function (q) {
      return $scope.sum_all_subs(q) != 100
    }

    $scope.cat_score = function (d,j) {
      return $scope.data.categories
      .map(function (mc) { 
        return mc.sub_categories
        .map(function (sc) { 
          return sc.distribution_values
          .map(function (dv) { 
            return dv.points*(sc.cat_weight*mc.cat_weight)
          }) 
        })
        .reduceRight(function (p,c) { 
          return p.map(function (_p, i) { return _p + c[i] }) 
        }) 
      })
      .reduceRight(function (p,c) { 
        return p.map(function (_p, i) { return _p + c[i] }) 
      })[j]/10000
    }

    $scope.swot_score = function (d,j) {
      var count = 0
      $scope.data.swot_questions.map(function (q) {
        if (q.value)
          count += q.distribution_values[j].points
        return q
      })
      return count
    }

    $scope.submit = function () {
      $http.post('submit', $scope.data).then(function (res) {
        if (res.data.info == 'success') {
          return alert('Successfully saved, thanks a lot!')
        }
        alert('Sorry, the request terminated...')
      })
    }
}])

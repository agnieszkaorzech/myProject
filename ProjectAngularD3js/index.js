(function(){
var app = angular.module('myApp',[]);
app.controller('MainCtrl',[function(){
  var self = this;
  self.tab='first';
  self.open = function(tab){
    self.tab = tab;
  }
}]);
 app.controller('datasController', ['$scope','$http','$filter',function($scope, $http, $filter){
  $scope.deleteItem = function (index) {
    $scope.stocks.splice(index, 1);
  };
  $scope.divVisible = false;
  $scope.submit = function(){
    $scope.divVisible = !$scope.divVisible;
    $scope.selectedList = $scope.stocks.filter(function(namesDataItem) {
    return namesDataItem.checked;
  });
 daneWykres($scope.selectedList);
 };
  var daneWykres = function(data){
    var margin = {top: 40, right: 20, bottom: 30, left: 60},
        width = 600 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

  var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], 0.1);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {
        return "<strong>High:</strong> <span style='color:red'>" + d.High + "</span><strong> Low:</strong> <span style='color:red'>" + d.Low + "</span><strong> Symbol:</strong> <span style='color:red'>" + d.Symbol + "</span>";
      })
        if (!!d3.select("svg").toString()){
          d3.select("svg").remove();
        }
        var svg = d3.select(".create-plot").append("svg");
        svg.attr("width", width + margin.left + margin.right);
        svg.attr("height", height + margin.top + margin.bottom);
        svg.append("g");
        svg.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        svg.call(tip);

       var i = 1;
      x.domain(data.map(function(d) {d.i = i; i++; return d.i; }));
      y.domain([0, d3.max(data, function(d) { return d.Adj_Close; })]);
      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis)
     svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 2)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Adjust price");

      svg.selectAll(".bar")
          .data(data)
        .enter().append("rect")
          .attr("class", "bar")
          .attr("x", function(d) {return x(d.i); })
          .attr("width", x.rangeBand())
          .attr("y", function(d) { return y(d.Adj_Close); })
          .attr("height", function(d) { return height - y(d.Adj_Close); })
          .on('mouseover', tip.show)
          .on('mouseout', tip.hide)

    function type(d) {
      d.Adj_Close = +d.Adj_Close;
      return d;
    }
};
  $scope.addStock = function () {
    $scope.stocks.push({
      Symbol: $scope.newStock.Symbol,
      Date: $scope.newStock.Date,
      Open: $scope.newStock.Open,
      High: $scope.newStock.High,
      Low: $scope.newStock.Low,
      Close: $scope.newStock.Close,
      Volume: $scope.newStock.Volume,
      Adjust: $scope.newStock.Adjust
    });
    $scope.newStock.Symbol = "";
    $scope.newStock.Date = "";
    $scope.newStock.Open = "";
    $scope.newStock.High = "";
    $scope.newStock.Low = "";
    $scope.newStock.Close = "";
    $scope.newStock.Volume = "";
    $scope.newStock.Adjust = "";
  };

  $http.get('data.json').success(function (data) {
    var checkedItems = [];
    angular.forEach(data.query.results.quote,function(v,k){
         v.checked = false;
         checkedItems.push(v);
    });
     $scope.stocks = checkedItems;
  });
}]);
app.controller('plotController', ['$scope','$http',function($scope, $http){
  $scope.iterations =[];
  $http.get('data.json').success(function (data) {
     var stock1 = [];
     var stock2 = [];
     var stock3 = [];
      $scope.stocks=data.query.results.quote;
      angular.forEach($scope.stocks,function(v,k){
        if (v.Symbol === 'CSCO'){
         stock1.push(v);
       }
       if (v.Symbol === "ADBE"){
        stock2.push(v);
       }
       if (v.Symbol == 'MSFT'){
         stock3.push(v);
       }
      });
	    daneWykres(stock1,1);
      daneWykres(stock2,2);
      daneWykres(stock3,3);
      set('stock1',[]);
      set('stock2',[]);
      set('stock3',[]);
  });
var daneWykres = function(data,index){
  var margin = {top: 40, right: 20, bottom: 30, left: 60},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var x = d3.scale.ordinal()
      .rangeRoundBands([0, width], .01);

  var y = d3.scale.linear()
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

  var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
      return "<strong>High:</strong> <span style='color:red'>" + d.High + "</span><strong> Low:</strong> <span style='color:red'>" + d.Low + "</span><strong> Symbol:</strong> <span style='color:red'>" + d.Symbol + "</span>";
    });
    var logs= d3.select("svg").join().length;
    $scope.iterations.push(logs);
    if ($scope.iterations.length<4 && !!$scope.iterations[0]){
      d3.select("svg").remove();
    }
    var svg =d3.select(".second-tab"+index).append("svg");
      svg.attr("width", width + margin.left + margin.right);
      svg.attr("height", height + margin.top + margin.bottom);
      svg.append("g");
      svg.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      svg.call(tip);

     var i = 1;
    x.domain(data.map(function(d) {d.i = i; i++; return d.i; }));
    y.domain([0, d3.max(data, function(d) { return d.Adj_Close; })]);

    mini.append("g")
        .attr("class", "x axis mini_axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 2)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Adjust price");

    svg.selectAll("rect")
        .data(data)
      .enter().append("rect")
        .attr("class", function (d) {
          return d.Symbol;
        })
        .attr("x", function(d) {return x(d.i); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.Adj_Close); })
        .attr("height", function(d) { return height - y(d.Adj_Close); })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)

  function type(d) {
    d.Adj_Close = +d.Adj_Close;
    return d;
  }
}
}]);
})();

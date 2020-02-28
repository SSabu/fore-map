!async function(){

  var myMap = L.map('mapid').setView([33.2918, -112.4291], 8.5);

  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/256/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/light-v9',
      accessToken: 'pk.eyJ1Ijoic2FidW1hZm9vIiwiYSI6ImNqMWE3cnlqcTA5dncyd216YjI0bnY4dGEifQ.fgmXgmkvialdBd3D405_BA'
  }).addTo(myMap);

  let dataObj = await fetch("/closures")
  .then(res => res.json())
  .then(data => showData(data));

  let geoJson = await fetch("/maricopa_tracts.json")
   .then(res => res.json())
   .then(function(geoJson) { return geoJson; });

  slider();

  let gja = geoJsonConversion(dataObj);

  // console.log(gja);

  var ptLyr96 = gja[0][1996];

  // L.geoJSON(ptLyr96).addTo(myMap);

  var ctCount = pointCount(geoJson, gja);

  var geoJson96 = ctCount[0][1996];

  var gj96 = L.geoJSON(geoJson96, {style: style}).addTo(myMap);

  var ctJsonObj = [];

  ctCount.forEach(function(ct) {
    var yearLyrObj = {};
    var yearLyr = Object.keys(ct)[0];
    var lyrStr = "gj"+yearLyr;
    lyrStr = L.geoJson(ct[yearLyr], {style: style});
    yearLyrObj[yearLyr]=lyrStr;
    ctJsonObj.push(yearLyrObj);
  });

  // console.log("this is ct object", ctJsonObj);

  function slider() {

    var dataTime = [1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019];

    var sliderTime = d3
      .sliderBottom()
      .min(d3.min(dataTime))
      .max(d3.max(dataTime))
      .step(1)
      .width(700)
      .tickFormat(d3.format("d"))
      .tickValues(dataTime)
      .on('onchange', val => {
        d3.select('p#value-time').text(val);

        // console.log(sliderTime.value());

        gj96.remove();

        var less = val - 1;
        var more = val + 1;

        if (val === 1996) {

          var lyr1996 = ctJsonObj[val-1996][val];
          var lyr1997 = ctJsonObj[more-1996][more];

          lyr1997.removeFrom(myMap);
          lyr1996.addTo(myMap);

        } else if (val === 2019) {

            var lyr2019 = ctJsonObj[val-1996][val];
            var lyr2018 = ctJsonObj[less-1996][less];
            lyr2018.removeFrom(myMap);
            lyr2019.addTo(myMap)
        }

        else {
          var thisLyr = ctJsonObj[val-1996][val];
          var lessLyr = ctJsonObj[less-1996][less];
          var moreLyr = ctJsonObj[more-1996][more];

          lessLyr.removeFrom(myMap);
          moreLyr.removeFrom(myMap);
          thisLyr.addTo(myMap);

        }

      });

    var gTime = d3
      .select('div#slider-time')
      .append('svg')
      .attr('width', 800)
      .attr('height', 100)
      .append('g')
      .attr('transform', 'translate(30,30)');

    gTime.call(sliderTime);

    d3.select('p#value-time').text(sliderTime.value());

    var b = d3.select("#slider-time");

    // console.log(typeof(sliderTime.value()));

    // sliderTime.value(2008);

    var myTimer;

    var year = 1996;

    d3.select("#play").on("click", function() {
      // clearInterval(myTimer);
      myTimer = setInterval(function() {
        // console.log(year);
        sliderTime.value(++year);
        if (year === 2020) {
          clearInterval(myTimer);
        }
      }, 1000);
    });

    d3.select("#stop").on("click", function() {
      clearInterval(myTimer);
    });

    d3.select("#reload").on("click", function() {

      var currYear = sliderTime.value();

      // console.log("this is current year", currYear);

      // console.log(ctJsonObj[currYear-1996][currYear]);

      var currYrLyr = ctJsonObj[currYear-1996][currYear];

      currYrLyr.removeFrom(myMap);

      sliderTime.value(1996);
    });

  };



  // function play() {
  //
  // };

  function legend() {

    var svg = d3.select(myMap.getPanes().overlayPane).append("svg").attr("width", 2000).attr("height", 500).attr('transform', 'translate(1300,340)');

    svg.append("circle")
       .attr("cx", 100)
       .attr("cy", 20)
       .attr("r", 5)
       .attr("stroke", "black")
       .attr("fill", "#800026");

    svg.append("text")
       .attr("x", 110)
       .attr("y", 22)
       .text(">= 100")
       .style("font-size", "13px")
       .attr("alignment-baseline", "middle");

     svg.append("circle")
        .attr("cx", 100)
        .attr("cy", 40)
        .attr("r", 5)
        .attr("stroke", "black")
        .attr("fill", "#BD0026");

    svg.append("text")
       .attr("x", 110)
       .attr("y", 42)
       .text(">= 75")
       .style("font-size", "13px")
       .attr("alignment-baseline", "middle");

    svg.append("circle")
       .attr("cx", 100)
       .attr("cy", 60)
       .attr("r", 5)
       .attr("stroke", "black")
       .attr("fill", "#E31A1C");

   svg.append("text")
      .attr("x", 110)
      .attr("y", 62)
      .text(">= 50")
      .style("font-size", "13px")
      .attr("alignment-baseline", "middle");

     svg.append("circle")
        .attr("cx", 100)
        .attr("cy", 80)
        .attr("r", 5)
        .attr("stroke", "black")
        .attr("fill", "#FC4E2A");

    svg.append("text")
       .attr("x", 110)
       .attr("y", 82)
       .text(">= 35")
       .style("font-size", "13px")
       .attr("alignment-baseline", "middle");

      svg.append("circle")
         .attr("cx", 100)
         .attr("cy", 100)
         .attr("r", 5)
         .attr("stroke", "black")
         .attr("fill", "#FD8D3C");

     svg.append("text")
        .attr("x", 110)
        .attr("y", 102)
        .text(">= 10")
        .style("font-size", "13px")
        .attr("alignment-baseline", "middle");

       svg.append("circle")
          .attr("cx", 100)
          .attr("cy", 120)
          .attr("r", 5)
          .attr("stroke", "black")
          .attr("fill", "#FEB24C");

      svg.append("text")
         .attr("x", 110)
         .attr("y", 122)
         .text("> 0")
         .style("font-size", "13px")
         .attr("alignment-baseline", "middle");

        svg.append("circle")
           .attr("cx", 100)
           .attr("cy", 140)
           .attr("r", 5)
           .attr("stroke", "black")
           .attr("fill", "#FFF");

       svg.append("text")
          .attr("x", 110)
          .attr("y", 142)
          .text("0")
          .style("font-size", "13px")
          .attr("alignment-baseline", "middle");

  };

  legend();

  function pointCount(polyGeoJson, pointGeoJsonArray) {
    var polyGeoJsonCount = [];
    pointGeoJsonArray.forEach(function(ptGeoJson, index) {

      var newYearObj = {};
      var ctYearObj = {};
      var year = Object.keys(ptGeoJson)[0];
      var fc = Object.values(ptGeoJson)[0];
      var geoStr = "geo_"+index;
      var geoStr = _.cloneDeep(geoJson)
      var pointsWithin = turf.collect(geoStr, fc, 'count', 'count');
      pointsWithin.features.forEach(function(fc) {
        fc.properties.value = fc.properties.count.length;
      });
      ctYearObj[year] = pointsWithin;
      newYearObj[year] = pointsWithin;
      polyGeoJsonCount.push(newYearObj);
      // geoJsonCTArrayWithCount.push(ctYearObj);
      });
      return polyGeoJsonCount;
    };

  function showData(data) {
    // console.log(data);
    const years = [1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019];
    const newDataObj = [];
    years.forEach(function(year) {
      var currYear = year;
      var currData = [];
      var yearObj = {};
      data.forEach(function(el) {
        var dataYear = parseInt(el.saledate.slice(0,4));
        // console.log(dataYear, currYear);
        if (dataYear === currYear) {
          currData.push([el.long, el.lat]);
        }
      });
      yearObj[year] = currData;
      newDataObj.push(yearObj);
    });
    // console.log("new data object", newDataObj);
    return newDataObj;
  };

  function geoJsonConversion(obj) {
    const geoJsonArray = [];
    obj.forEach(function(el){
      var yearObj = {};
      var year = Object.keys(el)[0];
      Object.values(el).forEach(function(coord) {
        var coordArray = [];
        coord.forEach(function(coordinate) {
          var pointFeature = {
            "type": "Feature",
            "properties": {count: 1},
            "geometry": {
              "type": "Point",
              "coordinates": coordinate
            }
          };
          coordArray.push(pointFeature);
        });
        var featureCollectionPoints = {
          "type": "FeatureCollection",
          "features": coordArray
        };
        yearObj[year] = featureCollectionPoints;
        geoJsonArray.push(yearObj);
        });
      });
      // var yearObj18 = {};
      // var fc18 = {
      //   "type": "FeatureCollection",
      //   "features": []
      // }
      // yearObj18[2018] = fc18;
      // geoJsonArray.splice(geoJsonArray.length-1,0,yearObj18);
      // console.log(geoJsonArray);
      return geoJsonArray;
  };

  function getColor(value) {
    return value >= 100
      ? "#800026"
      : value >= 75
      ? "#BD0026"
      : value >= 50
      ? "#E31A1C"
      : value >= 35
      ? "#FC4E2A"
      : value >= 10
      ? "#FD8D3C"
      : value > 0
      ? "#FEB24C"
      : "#FFF";
  };

  function style(feature) {
    return {
      fillColor: getColor(feature.properties.value),
      fillOpacity: 0.7,
      weight: 0.5,
      color: "rgba(255, 255, 255, 0.8)"
    };
  };

}();

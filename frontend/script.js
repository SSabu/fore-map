!async function(){

  let zoom;

  if (window.innerWidth > 1800) {
    zoom = 8.5;
  } else if (window.innerWidth > 1500) {
    zoom = 9;
  }

  let geoJson = await fetch("/maricopa_tracts.json")
   .then(res => res.json())
   .then(function(geoJson) { return geoJson; });

  var myMap = L.map('mapid').setView([33.2718, -112.2291], zoom);

  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/256/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/light-v9',
      accessToken: 'pk.eyJ1Ijoic2FidW1hZm9vIiwiYSI6ImNqMWE3cnlqcTA5dncyd216YjI0bnY4dGEifQ.fgmXgmkvialdBd3D405_BA'
  }).addTo(myMap);

  legend();

  slider();

  myMap.spin(true);

  let dataObj = await fetch("/closures")
  .then(res => res.json())
  .then(data => showData(data));

  let gja = geoJsonConversion(dataObj);

  var ctCount = pointCount(geoJson, gja);

  var geoJson96 = ctCount[0][1996];

  var gj96 = L.geoJSON(geoJson96, {onEachFeature: function(feature,layer) { layer.bindPopup('<p>'+feature.properties.NAMELSAD+' , '+feature.properties.value+'</p>')  }, style: style}).addTo(myMap);

  var ctJsonObj = [];

  ctCount.forEach(function(ct) {
    var yearLyrObj = {};
    var yearLyr = Object.keys(ct)[0];
    var lyrStr = "gj"+yearLyr;
    lyrStr = L.geoJson(ct[yearLyr], {onEachFeature: function(feature,layer) {layer.bindPopup('<p>'+feature.properties.NAMELSAD+' , '+feature.properties.value+'</p>')}, style: style});
    yearLyrObj[yearLyr]=lyrStr;
    ctJsonObj.push(yearLyrObj);
  });

  // console.log(myMap.hasLayer(gj96));

  if (myMap.hasLayer(gj96)) {
    myMap.spin(false);
  }

  function slider() {

    var dataTime = [1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018];

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

        gj96.remove();

        var less = val - 1;
        var more = val + 1;

        if (val === 1996) {

          var lyr1996 = ctJsonObj[val-1996][val];
          var lyr1997 = ctJsonObj[more-1996][more];

          lyr1997.removeFrom(myMap);
          lyr1996.addTo(myMap);

        } else if (val === 2018) {

            var lyr2018 = ctJsonObj[val-1996][val];
            var lyr2017 = ctJsonObj[less-1996][less];
            lyr2017.removeFrom(myMap);
            lyr2018.addTo(myMap)
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
      .attr('width', 730)
      .attr('height', 50)
      .append('g')
      .attr('transform', 'translate(15,10)');

    gTime.call(sliderTime);

    d3.select('p#value-time').text(sliderTime.value());

    var myTimer;

    var year = 1996;

    d3.select("#play").on("click", function() {
      myTimer = setInterval(function() {
        sliderTime.value(++year);
        if (year === 2019) {
          clearInterval(myTimer);
        }
      }, 1000);
    });

    d3.select("#stop").on("click", function() {
      clearInterval(myTimer);
    });

    d3.select("#reload").on("click", function() {

      var currYear = sliderTime.value();

      var currYrLyr = ctJsonObj[currYear-1996][currYear];

      currYrLyr.removeFrom(myMap);

      sliderTime.value(1996);

      year = 1996;
    });

    d3.select("#right-arrow").on("click", function() {
      var currYrRt = sliderTime.value();
      sliderTime.value(++currYrRt);
    });

    d3.select("#left-arrow").on("click", function() {
      var currYrLft = sliderTime.value();
      sliderTime.value(--currYrLft);
    });

  };

  function legend() {

    var title = d3.select("#legend").append("svg").attr("width", 200).attr("height",200).attr("transform","translate(15,20)");

    title.append("rect").attr("width", 150).attr("height",100).attr("x",0).attr("y",0).attr("fill","none");

    title.append("foreignObject")
         .attr("x", 5)
         .attr("y", 5)
         .attr("width", 150)
         .attr("height", 200)
         .append("xhtml:body")
         .html('<div style="width: 150px; font-size: 21px">Property Loss in America: Foreclosures by Census Tract in Maricopa County<br> (1996 - 2018)</div>');

    var legendTitle = d3.select("#legend").append("svg").attr("width", 200).attr("height",200).attr("border", 1).attr("transform", "translate(15,300)");

    legendTitle.append("text")
               .text("Number of Foreclosures")
               .attr("fill","black")
               .attr("x", 10)
               .attr("y", 25);

    legendTitle.append("rect")
               .attr("x",0)
               .attr("y",0)
               .attr("height", 200)
               .attr("width", 200)
               .attr("stroke","black")
               .attr("fill","none")
               .attr("stroke-width", 1);

    var svg = d3.select("#legend").append("svg").attr("width", 200).attr("height", 160).attr('transform', 'translate(0,140)');

    svg.append("circle")
       .attr("cx", 80)
       .attr("cy", 20)
       .attr("r", 5)
       .attr("stroke", "black")
       .attr("fill", "#800026");

    svg.append("text")
       .attr("x", 90)
       .attr("y", 22)
       .text(">= 100")
       .style("font-size", "13px")
       .attr("alignment-baseline", "middle");

     svg.append("circle")
        .attr("cx", 80)
        .attr("cy", 40)
        .attr("r", 5)
        .attr("stroke", "black")
        .attr("fill", "#BD0026");

    svg.append("text")
       .attr("x", 90)
       .attr("y", 42)
       .text(">= 75")
       .style("font-size", "13px")
       .attr("alignment-baseline", "middle");

    svg.append("circle")
       .attr("cx", 80)
       .attr("cy", 60)
       .attr("r", 5)
       .attr("stroke", "black")
       .attr("fill", "#E31A1C");

   svg.append("text")
      .attr("x", 90)
      .attr("y", 62)
      .text(">= 50")
      .style("font-size", "13px")
      .attr("alignment-baseline", "middle");

     svg.append("circle")
        .attr("cx", 80)
        .attr("cy", 80)
        .attr("r", 5)
        .attr("stroke", "black")
        .attr("fill", "#FC4E2A");

    svg.append("text")
       .attr("x", 90)
       .attr("y", 82)
       .text(">= 35")
       .style("font-size", "13px")
       .attr("alignment-baseline", "middle");

      svg.append("circle")
         .attr("cx", 80)
         .attr("cy", 100)
         .attr("r", 5)
         .attr("stroke", "black")
         .attr("fill", "#FD8D3C");

     svg.append("text")
        .attr("x", 90)
        .attr("y", 102)
        .text(">= 10")
        .style("font-size", "13px")
        .attr("alignment-baseline", "middle");

       svg.append("circle")
          .attr("cx", 80)
          .attr("cy", 120)
          .attr("r", 5)
          .attr("stroke", "black")
          .attr("fill", "#FEB24C");

      svg.append("text")
         .attr("x", 90)
         .attr("y", 122)
         .text("> 0")
         .style("font-size", "13px")
         .attr("alignment-baseline", "middle");

        svg.append("circle")
           .attr("cx", 80)
           .attr("cy", 140)
           .attr("r", 5)
           .attr("stroke", "black")
           .attr("fill", "#FFF");

       svg.append("text")
          .attr("x", 90)
          .attr("y", 142)
          .text("0")
          .style("font-size", "13px")
          .attr("alignment-baseline", "middle");

  };



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
      });
      return polyGeoJsonCount;
    };

  function showData(data) {
    const years = [1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018];
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

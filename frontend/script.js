!async function(){

let zoom = 9;

// if (window.innerWidth > 1800) {
//   zoom = 8.5;
// } else if (window.innerWidth > 1500) {
//   zoom = 9;
// }

let geoJson = await fetch("/maricopa_2010.geojson")
 .then(res => res.json())
 .then(function(geoJson) { return geoJson; });

let geoJson2000 = await fetch("/marciopa_county_2000.json")
    .then(res => res.json())
    .then(function(geoJson) { return geoJson; });

var myMap = L.map('mapid', {minZoom: 9, maxZoom: 16}).setView([33.3218, -112.4291], zoom);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/256/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
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

let gja2000 = gja.slice(0,14);

let gja2010 = gja.slice(14,gja.length);

var ctCount2000 = pointCount(geoJson2000, gja2000);

var ctCount2010 = pointCount(geoJson, gja2010);

var ctCount = ctCount2000.concat(ctCount2010);

var geoJson96 = ctCount[0][1996];

myMap.createPane('foreclosure');

myMap.createPane('dotDensity');

var gj96 = L.geoJSON(geoJson96, {onEachFeature: function(feature,layer) { layer.bindPopup('<p>Census Tract: '+feature.properties.NAME+'<br> Foreclosures: '+feature.properties.value+'</p>')  }, style: style}).addTo(myMap);

var dotDensity2000 = L.esri.tiledMapLayer({
  url: 'https://tiles.arcgis.com/tiles/0OPQIK59PJJqLK0A/arcgis/rest/services/marico_tracts_1/MapServer', pane: 'dotDensity'
}).addTo(myMap);

// var dotDensity2010 = L.esri.tiledMapLayer({
//   url: 'https://tiles.arcgis.com/tiles/0OPQIK59PJJqLK0A/arcgis/rest/services/maricopa_2010/MapServer', pane: 'dotDensity'
// });

var dotDensity2010 = L.esri.tiledMapLayer({
  url: 'https://tiles.arcgis.com/tiles/0OPQIK59PJJqLK0A/arcgis/rest/services/2000_CT_1/MapServer', pane: 'dotDensity'
});

var ctJsonObj = [];

ctCount.forEach(function(ct) {
  var yearLyrObj = {};
  var yearLyr = Object.keys(ct)[0];
  var lyrStr = "gj"+yearLyr;
  // console.log(yearLyr);
  if (yearLyr > 2009) {
    lyrStr = L.geoJson(ct[yearLyr], {onEachFeature: function(feature,layer) {layer.bindPopup('<p>Census Tract: '+feature.properties.TRACT_LABE+'<br> Foreclosures: '+feature.properties.value+'</p>')}, style: style});
  } else {
    lyrStr = L.geoJson(ct[yearLyr], {onEachFeature: function(feature,layer) {layer.bindPopup('<p>Census Tract: '+feature.properties.NAME+'<br> Foreclosures: '+feature.properties.value+'</p>')}, style: style});
  }
  yearLyrObj[yearLyr]=lyrStr;
  ctJsonObj.push(yearLyrObj);
});

if (myMap.hasLayer(gj96) && myMap.hasLayer(dotDensity2000)) {
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

      if (sliderTime.value() > 2009) {
        dotDensity2000.removeFrom(myMap);
        dotDensity2010.addTo(myMap);
      }

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
    }, 1500);
  });

  d3.select("#stop").on("click", function() {
    clearInterval(myTimer);
  });

  d3.select("#reload").on("click", function() {

    var currYear = sliderTime.value();

    var currYrLyr = ctJsonObj[currYear-1996][currYear];

    currYrLyr.removeFrom(myMap);

    sliderTime.value(1996);

    dotDensity2010.removeFrom(myMap);
    dotDensity2000.addTo(myMap);

    year = 1996;
  });

  d3.select("#right-arrow").on("click", function() {
    var currYrRt = sliderTime.value();
    sliderTime.value(++currYrRt);
  });

  d3.select("#left-arrow").on("click", function() {
    var currYrLft = sliderTime.value();

    if (currYrLft === 2010) {

      dotDensity2010.removeFrom(myMap);
      dotDensity2000.addTo(myMap);

    }

    sliderTime.value(--currYrLft);

  });

};

function legend() {

  var title = d3.select("#legend").append("svg").attr("width", 200).attr("height",200).attr("transform","translate(15,-5)");

  title.append("foreignObject")
       .attr("x", 5)
       .attr("y", 0)
       .attr("width", 150)
       .attr("height", 200)
       .append("xhtml:body")
       .html('<div style="width: 150px; font-size: 19px">Count of Mortgage Foreclosures in Maricopa County by Census Tract, 1996 through 2018</div>');

  var dot = d3.select("#legend").append("svg").attr("width", 120).attr("height", 20).attr("transform","translate(60,-50)");

  dot.append("text")
     .attr("x", 10)
     .attr("y", 10)
     .text("1 ")
     .attr("font-size","12px")
     .attr("alignment-baseline","middle");

  dot.append("circle")
     .attr("cx", 22)
     .attr("cy", 9)
     .attr("r", 3)
     .attr("fill","#808080");

 dot.append("text")
    .attr("x", 30)
    .attr("y", 10)
    .text(" = 1,000 people")
    .attr("font-size","12px")
    .attr("alignment-baseline", "middle");

  var legendTitle = d3.select("#legend").append("svg").attr("width", 200).attr("height",185).attr("border", 1).attr("transform", "translate(15,-50)");

  legendTitle.append("text")
             .text("Count of Foreclosures")
             .attr("fill","black")
             .attr("x", 10)
             .attr("y", 25);

  legendTitle.append("rect")
             .attr("x",0)
             .attr("y",0)
             .attr("height", 185)
             .attr("width", 200)
             .attr("stroke","black")
             .attr("fill","none")
             .attr("stroke-width", 1);

  var svg = d3.select("#legend").append("svg").attr("width", 230).attr("height", 500).attr('transform', 'translate(0,-210)');

  svg.append("circle")
     .attr("cx", 80)
     .attr("cy", 20)
     .attr("r", 5)
     .attr("stroke", "black")
     .attr("fill", "#F24BFF");

  svg.append("text")
     .attr("x", 90)
     .attr("y", 22)
     .text("100 or more")
     .style("font-size", "13px")
     .attr("alignment-baseline", "middle");

   svg.append("circle")
      .attr("cx", 80)
      .attr("cy", 40)
      .attr("r", 5)
      .attr("stroke", "black")
      .attr("fill", "#FF5B58");

  svg.append("text")
     .attr("x", 90)
     .attr("y", 42)
     .text("75 - 99")
     .style("font-size", "13px")
     .attr("alignment-baseline", "middle");

  svg.append("circle")
     .attr("cx", 80)
     .attr("cy", 60)
     .attr("r", 5)
     .attr("stroke", "black")
     .attr("fill", "#E87558");

 svg.append("text")
    .attr("x", 90)
    .attr("y", 62)
    .text("50 - 74")
    .style("font-size", "13px")
    .attr("alignment-baseline", "middle");

   svg.append("circle")
      .attr("cx", 80)
      .attr("cy", 80)
      .attr("r", 5)
      .attr("stroke", "black")
      .attr("fill", "#E8AA58");

  svg.append("text")
     .attr("x", 90)
     .attr("y", 82)
     .text("35 - 49")
     .style("font-size", "13px")
     .attr("alignment-baseline", "middle");

    svg.append("circle")
       .attr("cx", 80)
       .attr("cy", 100)
       .attr("r", 5)
       .attr("stroke", "black")
       .attr("fill", "#FFA56E");

   svg.append("text")
      .attr("x", 90)
      .attr("y", 102)
      .text("10 - 34")
      .style("font-size", "13px")
      .attr("alignment-baseline", "middle");

     svg.append("circle")
        .attr("cx", 80)
        .attr("cy", 120)
        .attr("r", 5)
        .attr("stroke", "black")
        .attr("fill", "#FFCF61");

    svg.append("text")
       .attr("x", 90)
       .attr("y", 122)
       .text("0 - 9")
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

     svg.append("foreignObject")
        .attr("x", 15)
        .attr("y", 160)
        .attr("width", 200)
        .attr("height", 200)
        .append("xhtml:body")
        .html('<div style="font-size: 11px">Notes: Census tracts vary by decade according to geography changes defined by the United States Bureau of the Census. Population density for years 1996 - 2009 is derived from year 2000 Census data, while population density for years 2010 - 2018 is derived from year 2016 Census data.</div>');

        svg.append("foreignObject")
           .attr("x", 15)
           .attr("y", 260)
           .attr("width", 200)
           .attr("height", 200)
           .append("xhtml:body")
           .html('<div style="font-size: 11px">Source: Visualization by Sandeep Sabu under the direction of Dr. Lora A. Phillips, Knowledge Exchange for Resilience, Arizona State University. Data from The Information Market.</div>');

       svg.append("foreignObject")
          .attr("x", 15)
          .attr("y", 325)
          .attr("width", 200)
          .attr("height", 200)
          .append("xhtml:body")
          .html('<div style="font-size: 11px">Acknowledgement: The ASU Knowledge Exchange for Resilience is supported by the Virginia G. Piper Charitable Trust. Piper Trust supports organizations that enrich health, well-being, and opportunity for the people of Maricopa County, Arizona.</div>');

      svg.append("foreignObject")
         .attr("x", 15)
         .attr("y", 415)
         .attr("width", 200)
         .attr("height", 200)
         .append("xhtml:body")
         .html('<div style="font-size: 11px">Disclaimer: The conclusions, views, and opinions expressed herein are those of the authors and do not necessarily reflect the official policy or position of the Virginia G. Piper Charitable Trust or The Information Market.</div>');

};

function pointCount(polyGeoJson, pointGeoJsonArray) {
  var polyGeoJsonCount = [];
  pointGeoJsonArray.forEach(function(ptGeoJson, index) {

    var newYearObj = {};
    var ctYearObj = {};
    var year = Object.keys(ptGeoJson)[0];
    var fc = Object.values(ptGeoJson)[0];
    var geoStr = "geo_"+index;
    var geoStr = _.cloneDeep(polyGeoJson)
    var pointsWithin = turf.collect(geoStr, fc, 'count', 'count');
    // console.log(pointsWithin);
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
      ? "#F24BFF"
      : value >= 75
      ? "#FF5B58"
      : value >= 50
      ? "#E87558"
      : value >= 35
      ? "#E8AA58"
      : value >= 10
      ? "#FFA56E"
      : value > 0
      ? "#FFCF61"
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

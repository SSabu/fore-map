!async function(){

  var myMap = L.map('mapid').setView([33.2918, -112.4291], 8);

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

  let gja = geoJsonConversion(dataObj);

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

  };

  slider();

  function play() {

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
      // geoJsonCTArrayWithCount.push(ctYearObj);
      });
      return polyGeoJsonCount;
    };

  function showData(data) {
    const years = [1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2019];
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
      var yearObj18 = {};
      var fc18 = {
        "type": "FeatureCollection",
        "features": []
      }
      yearObj18[2018] = fc18;
      geoJsonArray.splice(geoJsonArray.length-1,0,yearObj18);
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

const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');
const ejs = require("ejs");
const {
  NovelCovid
} = require('novelcovid');

const track = new NovelCovid();
const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.get("/", function(req, res) {
  const url = "https://covid19.mathdro.id/api";
  https.get(url, function(response) {
    console.log(response.statusCode);
    response.on('data', function(data) {
      const apiData = JSON.parse(data);
      console.log(apiData);
      var conformed = apiData.confirmed.value.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
      var recoveres = apiData.recovered.value.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
      var deaths = apiData.deaths.value.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
      var lastUpdated = apiData.lastUpdate;
      var country = "world";
      if (apiData.confirmed.value == 0) {
        var recoveredPer = 0;
        var deathsPer = 0;
      } else {
        var recoveredPer = (100 * apiData.recovered.value) / apiData.confirmed.value;
        var deathsPer = (100 * apiData.deaths.value) / apiData.confirmed.value;
      }
      console.log(conformed);
      var active = (apiData.confirmed.value - apiData.recovered.value - apiData.deaths.value).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
      res.render("home", {
        lastUpdated: lastUpdated,
        conformed: conformed,
        recoveres: recoveres,
        deaths: deaths,
        countryDisplay: country.toUpperCase(),
        recoveredPer: recoveredPer.toFixed(2),
        deathsPerW: deathsPer.toFixed(2),
        active: active,
        conformedraw: apiData.confirmed.value,
        recoveresraw: apiData.recovered.value,
        deathsraw: apiData.deaths.value
      })
    });
  });
});
app.post("/", function(req, res) {
  track.countries(req.body.country).then(function(response) {
    console.log(response);
    flagUrl = response.countryInfo.flag
    var country = req.body.country;
    const url = "https://covid19.mathdro.id/api/countries/" + country;
    const url2 = "https://covid19.mathdro.id/api";
    https.get(url2, function(response2) {
      response2.on('data', function(data2) {
        if (response2.statusCode == 200) {
          apiData2 = JSON.parse(data2);
          const deathsPerW = (100 * apiData2.deaths.value) / apiData2.confirmed.value;
          const recoveredPerW = (100 * apiData2.recovered.value) / apiData2.confirmed.value;
          const activeW = apiData2.confirmed.value;
          https.get(url, function(response) {
            console.log(response.statusCode);
            if (response.statusCode == 200) {
              response.on('data', function(data) {
                const apiData = JSON.parse(data);
                const conformed = apiData.confirmed.value.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
                const recoveres = apiData.recovered.value.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
                const deaths = apiData.deaths.value.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
                const lastUpdated = apiData.lastUpdate;
                const countryDisplay = req.body.country;
                if (apiData.confirmed.value == 0) {
                  var recoveredPer = 0;
                  var deathsPer = 0;
                } else {
                  var recoveredPer = (100 * apiData.recovered.value) / apiData.confirmed.value;
                  var deathsPer = (100 * apiData.deaths.value) / apiData.confirmed.value;
                }
                var active = (apiData.confirmed.value - apiData.recovered.value - apiData.deaths.value).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
                res.render("countrymin", {
                  lastUpdated: lastUpdated,
                  conformed: conformed,
                  recoveres: recoveres,
                  deaths: deaths,
                  countryDisplay: country.toUpperCase(),
                  recoveredPer: recoveredPer.toFixed(2),
                  deathsPer: deathsPer.toFixed(2),
                  active: active,
                  deathsPerW: deathsPerW,
                  recoveredPerW: recoveredPerW,
                  others: activeW - apiData.confirmed.value,
                  countryactive: apiData.confirmed.value,
                  flagUrl: flagUrl
                })
              })
            } else {
              res.render('errormin')
            }
          })
        } else {
          res.render('errormin')
        }
      })
    })
  }).catch(function() {
    res.render('errormin')
  })
})
var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("server started at port 3000");
})

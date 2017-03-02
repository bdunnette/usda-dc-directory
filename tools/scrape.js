var cheerio = require('cheerio'),
    cheerioTableparser = require('cheerio-tableparser'),
    request = require('request'),
    _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    jsonfile = require('jsonfile'),
    Papa = require('babyparse');

var j = request.jar();

var postData = {
    txtLastName: '',
    txtFirstName: '',
    txtPhNum: '',
    cboAgency: '',
    cboBuilding: '',
    cmdLocate: 'Locate'
};

// console.log(postData);

var url = 'https://dc-directory.hqnet.usda.gov/dlsnew/phone.aspx'
var dataDir = path.resolve(__dirname, '..', 'data');
var jsonFile = path.join(dataDir, 'usda-dc-directory.json')
var csvFile = path.join(dataDir, 'usda-dc-directory.csv')

request.get({
    url: url,
    jar: j
}, function(err, httpResponse, body) {
    var $ = cheerio.load(body);
    console.log("Getting session variables...");
    $('#frmData > input').each(function(index, input) {
        postData[input.attribs.name] = input.attribs.value;
    });
    console.log("Fetching directory...");
    request.post({
        url: url,
        jar: j,
        form: postData
    }, function(err, httpResponse, body) {
        console.log("Parsing...");
        var $ = cheerio.load(body);
        var directory = $('table #header');
        cheerioTableparser($);
        tableData = directory.parsetable(true, true, true);
        console.log("Building array of contacts...");
        var contacts = new Array;
        // For whatever reason, cheerio-tableparser outputs an array of columns
        // We'll convert those back into rows, using the first row as headers
        tableData.forEach(function(col) {
            // Make column headers more JavaScript-friendly...
            colHead = col[0].replace(' ', '');
            // Don't save header-less columns
            if (colHead) {
                col.forEach(function(val, idx) {
                    if (idx && val) {
                        if (!contacts[idx]) {
                            contacts[idx] = {}
                        }
                        contacts[idx][colHead] = val;
                    }
                })
            }
        })
        // Use lodash to remove nulls from contacts array
        var contacts2 = _.compact(contacts);
        console.log(`Writing ${contacts2.length} contacts to ${jsonFile}`);
        jsonfile.writeFileSync(jsonFile, contacts2, {
            spaces: 2
        });
        // Generate CSV from our JSON contacts array
        var csv = Papa.unparse(contacts2, {
            quotes: true,
            quoteChar: '"',
            delimiter: ",",
            header: true
        });
        console.log(`Writing ${contacts2.length} contacts to ${csvFile}`);
        fs.writeFileSync(csvFile, csv)
    });
})

var cheerio = require('cheerio'),
    cheerioTableparser = require('cheerio-tableparser'),
    request = require('request');

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

request.get({url: url, jar: j}, function(err, httpResponse, body){
    console.error(err);
    // console.log(httpResponse);
    // console.log(body);
    var $ = cheerio.load(body);
    $('#frmData > input').each(function(index, input){
      // console.log(input);
      // console.log(input.attribs.name);
      // console.log(input.attribs.value);
      postData[input.attribs.name] = input.attribs.value;
    });
    // var cookie_string = j.getCookieString(url);
    // console.log(cookie_string);
    // var cookies = j.getCookies(url);
    // console.log(cookies);
    console.log(postData);
    request.post({url:url,jar:j,form:postData} , function(err, httpResponse, body) {
        // console.error(err);
        // console.log(httpResponse);
        // console.log(body);
        var $ = cheerio.load(body);
        var directory = $('table #header');
        // console.log(directory.text())
        cheerioTableparser($);
        tableData = $('table #header').parsetable(false, false, true);
        console.log(tableData)
    });
})

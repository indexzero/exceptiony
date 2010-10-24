/*
 * server.js: Simple server for receiving log files from the Surface Foliage application.
 *
 * (C) 2010 Charlie Robbins
 *
 */

var http = require('http')
  , sys = require('sys')
  , querystring = require('querystring')
  , url = require('url')
  , path = require('path')
  , fs = require('fs');

require.paths.unshift(path.join(__dirname, 'vendor', 'proto', 'lib'));
require('proto');

var pathExpression = /^(\/[^\/]+)(.*)$/;

function writePostData(request, response, prefix, fileName) {
  var postData = '';

  request.addListener("data", function (chunk) {
    postData += chunk;
  });

  request.addListener("end", function () {
    if(postData && postData.length > 0) {
      fs.writeFile(fileName, postData, function (error) {
        if (error) throw error;

        sys.puts("Write completed successfully! ...");

        response.write('\n\nLog ' + prefix + ' data saved successfully');
        response.write('\n\nLog ' + prefix + ' Data: \n' + postData);
        response.end();
      });
    }
    else {
      response.write('\n\nNo data to log. Cancelled '+ prefix + ' operation.');
      response.end();
    }
  });
}

var server = http.createServer(function (request, response) {
  var httpParams = querystring.parse(request.body);
  httpParams.mixin(url.parse(request.url));
  request.params = httpParams;

  if ('/' !== request.url) {
    var path = request.url.match(pathExpression);
  }
  else {
    var path = ['/', '/', ''];
  }

  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.write('Foliage Remote Serving Request for: ' + path[1]);

  switch(path[1]) {
    case '/log' :
      var now = new Date().getTime();
      var logFile = __dirname + '/session-logs/session-log-' + now + '.json';
      writePostData(request, response, "log", logFile);
      break;

    case '/exception' :
      var now = new Date().getTime();
      var exceptionFile = __dirname + '/exceptions/exception-' + now + '.json';
      writePostData(request, response, "exception", exceptionFile);
      break;

    case '/ping' :
      response.write('\n \nFoliage Remote Operational');
      response.end();
      break;

    default :
      response.end();
      break;
  }
}).listen(80);

"use strict";

var _module = require("module");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _require = (0, _module.createRequire)(import.meta.url);

var AWS = _require('aws-sdk');

var util = _require('util');

var mysql = _require('mysql');

var express = _require('express');

var bodyParser = _require('body-parser');

var pino = _require('express-pino-logger')();

var fileUpload = _require('express-fileupload');

var cors = _require('cors');

var cookieParser = _require('cookie-parser');

var fs = _require('fs');

var app = express();
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(pino);
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(fileUpload());
app.listen(3001, function () {
  return console.log('Express server is running on localhost:3001');
});
var con = mysql.createConnection({
  host: "database-1.cpehnlgbk0me.ap-south-1.rds.amazonaws.com",
  user: "admin",
  port: "3306",
  password: "adminpassword",
  database: "lessons",
  queryTimeout: 6000,
  connectTimeout: 60000
}); // Reading the file from local path and uploading to S3 Bucket
//app.use(logger('dev'));

app.post('/submit', function (req, res) {
  var jsonObj = JSON.parse(req.body.json);
  console.log(jsonObj['name']);

  try {
    con.connect(function (err) {
      if (err) {
        console.log(err);
      }

      console.log("Connected!");
      /*var sql = "insert into details(url,name,type) values ?";
      con.query(sql, [[jsonObj['url'], jsonObj['name'], jsonObj['type']]], function(error, result, fields) {
        console.log(result);
      });*/

      con.query("INSERT INTO details (url, name, type) VALUES ('".concat(jsonObj['url'], "', '").concat(jsonObj['name'], "', '").concat(jsonObj['type'], "')"), function (error, result, fields) {
        console.log(result);
      });
      /*con.query('CREATE TABLE IF NOT EXISTS details(id int NOT NULL AUTO_INCREMENT, url varchar(255), name varchar(255), type varchar(255), PRIMARY KEY(id));', function(error, result, fields) {
        console.log(result);
      });*/

      con.end();
    });
  } catch (error) {
    console.log(error);
  }
});
app.get('/', function (req, res) {
  res.send("<h1>Helloo</h1>");
});
app.post('/upload', function (req, res) {
  console.log(req.files.file);
  var s3 = new AWS.S3({
    accessKeyId: "AKIAQC3RSOMX32RZBBOO",
    secretAccessKey: "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",
    Bucket: "lessonfiles"
  });
  var params = {
    Bucket: 'lessonfiles',
    Key: req.files.file.name,
    Body: req.files.file.data
  };
  s3.upload(params, function (err, result) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("S3 Response", result);
    }
  });
});

function myfun() {
  return _myfun.apply(this, arguments);
} //myfun();


function _myfun() {
  _myfun = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var s3, writeFile;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            s3 = new AWS.S3({
              accessKeyId: "AKIAQC3RSOMX32RZBBOO",
              secretAccessKey: "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"
            });
            writeFile = util.promisify(fs.writeFile);
            s3.getObject({
              Bucket: 'lessonfiles',
              Key: 'lesson1.txt'
            }).promise().then(function (data) {
              console.log(data);
              writeFile('./test.txt', data.Body);
              console.log('file downloaded successfully');
            })["catch"](function (err) {
              throw err;
            });

          case 3:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _myfun.apply(this, arguments);
}

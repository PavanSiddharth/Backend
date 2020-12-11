import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const AWS = require('aws-sdk');
const util = require('util')
const mysql = require('mysql');

const express = require('express');
const bodyParser = require('body-parser');
const pino = require('express-pino-logger')();
const fileUpload = require('express-fileupload');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fs = require('fs')

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(pino);
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(fileUpload());



app.listen(8080, () =>
  console.log('Express server is running on localhost:8080')
);

  const con = mysql.createConnection({
    host: "database-1.cpehnlgbk0me.ap-south-1.rds.amazonaws.com",
    user: "admin",
    port: "3306",
    password: "adminpassword",
    database: "lessons",
    queryTimeout: 6000,
    connectTimeout: 60000
  });


// Reading the file from local path and uploading to S3 Bucket

//app.use(logger('dev'));

app.post('/submit', (req, res) => {
  var jsonObj = JSON.parse(req.body.json);
  console.log(jsonObj['name']);

  try
  {
    con.connect(function(err) {
        if (err) 
        {
          console.log(err);
        }
        console.log("Connected!");
        /*var sql = "insert into details(url,name,type) values ?";
        con.query(sql, [[jsonObj['url'], jsonObj['name'], jsonObj['type']]], function(error, result, fields) {
          console.log(result);
        });*/
        con.query(`INSERT INTO details (url, name, type) VALUES ('${jsonObj['url']}', '${jsonObj['name']}', '${jsonObj['type']}')`,function(error, result, fields) {
          console.log(result);
      });
        /*con.query('CREATE TABLE IF NOT EXISTS details(id int NOT NULL AUTO_INCREMENT, url varchar(255), name varchar(255), type varchar(255), PRIMARY KEY(id));', function(error, result, fields) {
          console.log(result);
      });*/
        con.end();
    });
  }
  catch(error)
  {
    console.log(error);
  }
});

app.get('/',(req, res) => {
    res.send("<h1>Helloo</h1>")
})

app.post('/upload',(req, res) => {
    console.log(req.files.file)

            let s3 = new AWS.S3({
                accessKeyId: "AKIAQC3RSOMX32RZBBOO",
                secretAccessKey: "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",
                Bucket: "lessonfiles",
              });
    
            let params = {
                Bucket: 'lessonfiles',
                Key: req.files.file.name ,
                Body: req.files.file.data
            };
            s3.upload(params, (err, result) => {
                if(err) {
                   console.log("Error", err);
                } else {
                   console.log("S3 Response",result);
                }
            })
        });


/*async function myfun() {

  var s3 = new AWS.S3({
    accessKeyId: "AKIAQC3RSOMX32RZBBOO",
    secretAccessKey: "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"
  });

const writeFile = util.promisify(fs.writeFile)

s3.getObject({Bucket: 'lessonfiles', Key: 'lesson1.txt'}).promise().then((data) => {
  console.log(data)
  writeFile('./test.txt', data.Body)
  console.log('file downloaded successfully')
}).catch((err) => {
  throw err
})
}*/

//myfun();











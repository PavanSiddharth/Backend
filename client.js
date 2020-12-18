var express = require("express");
var morgan = require("morgan");
var compression = require('compression');
var helmet = require('helmet');

const AWS = require('aws-sdk');
const mysql = require('mysql');

const con = mysql.createConnection({
  host: "database-1.cpehnlgbk0me.ap-south-1.rds.amazonaws.com",
  user: "admin",
  port: "3306",
  password: "adminpassword",
  database: "lessons",
  queryTimeout: 6000,
  connectTimeout: 60000
});


const fileUpload = require('express-fileupload');
const cors = require('cors');

var app = express();
app.use(helmet());
app.use(compression()); 
app.use(cors());
app.use(fileUpload());
app.use(morgan("combined"));



app.post('/submit', (req, res) => {
  var jsonObj = JSON.parse(req.body.json);
  console.log(jsonObj['name']);
  console.log(req.files.file)
  console.log(req.files.image)

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
            if(req.files.image!==undefined)
            {
            let params1 = {
              Bucket: 'lessonfiles',
              Key: req.files.image.name ,
              Body: req.files.image.data
          };
          s3.upload(params1, (err, result) => {
              if(err) {
                 console.log("Error", err);
              } else {
                 console.log("S3 Response",result);
              }
          })
        }
  try
  {
    con.connect(function(err) {
        if (err) 
        {
          console.log(err);
          res.send({mesage: "Not Successful"})
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
        res.send({message: "successful"});
    });
  }
  catch(error)
  {
    console.log(error);
  }
});


app.get('/lessons', (req, res) => {
  try
  {
    con.connect(function(err) {
        /*if (err) 
        {
          console.log(err);
        }
        console.log("Connected!");*/
        /*var sql = "insert into details(url,name,type) values ?";
        con.query(sql, [[jsonObj['url'], jsonObj['name'], jsonObj['type']]], function(error, result, fields) {
          console.log(result);
        });*/
        con.query(`SELECT * FROM details`, function(err, result, fields) {
          if (err) res.send(err);
          if (result) 
          {
            console.log(result)
            res.send(result);
          }
      });
    });
        /*con.query('CREATE TABLE IF NOT EXISTS details(id int NOT NULL AUTO_INCREMENT, url varchar(255), name varchar(255), type varchar(255), PRIMARY KEY(id));', function(error, result, fields) {
          console.log(result);
      });*/
  }
  catch(error)
  {
    console.log(error);
  }
});

app.get('/',(req, res) => {
    res.json({message: "hello"})
})

app.get('/test',(req, res) => {
  res.json({message: "Hello"})
})

/*app.post('/upload',(req, res) => {
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
        });*/


    app.post('/download', (req, res) =>  {
    console.log("Body:")
  //console.log(req.body.lesson)

  var s3 = new AWS.S3({
    accessKeyId: "AKIAQC3RSOMX32RZBBOO",
    secretAccessKey: "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"
  });

//const writeFile = util.promisify(fs.writeFile)

s3.getObject({Bucket: 'lessonfiles', Key: req.body.lesson+".txt"}).promise().then((data) => {
  var enc = new TextDecoder("utf-8");
  var arr = new Uint8Array(data.Body);
  console.log(enc.decode(arr));
  //writeFile('./test.txt', data.Body)
  console.log('file downloaded successfully')
  res.json({string : enc.decode(arr)})
}).catch((err) => {
  throw err
})

});

app.get('/vocabulary',(req, res) => {
  var s3 = new AWS.S3({
    accessKeyId: "AKIAQC3RSOMX32RZBBOO",
    secretAccessKey: "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"
  });
  con.connect(function(err) {
    con.query(`SELECT * FROM details`, function(err, result, fields) {
      if (err) console.log(err);
      if (result) 
      {
        //console.log(result)
        var promises = result.map(lesson => {
          return s3.getObject({Bucket: 'lessonfiles', Key: lesson.name+".txt"}).promise().then((data) => {
            var enc = new TextDecoder("utf-8");
            var arr = new Uint8Array(data.Body);
            //console.log(enc.decode(arr));
            //writeFile('./test.txt', data.Body)
            console.log('file downloaded successfully')
            //mystring=mystring+enc.decode(arr)+" ";
            //console.log(mystring);
            return enc.decode(arr);
            //res.json({string : enc.decode(arr)})
          })
      })
      Promise.all(promises).then(function(results) {
        var mystring = ""
        //console.log(results)
        results.map(result => {
          mystring=mystring+result+" ";
        })
        console.log(mystring)
        res.json({string : mystring})
    })
    }
  });

  })
})

app.listen(process.env.PORT || 3001);
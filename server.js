var express = require("express"),
    app = express(),
    cfenv = require("cfenv"),
    skipper = require("skipper"),
    skipperS3 = require('skipper-s3'),
    extend = require('extend'),
    S3Lister = require("s3-lister");
    bodyParser = require('body-parser');
   //Cloudant = require('@cloudant/cloudant');


var search = "ibm";


// var cludant_username = ''
// var cludant_password = ''
// var cloudant = Cloudant({account:cludant_username, password:cludant_password});


app.get("/getData", function (request,response) {
console.log("sí entró");
  var lista = "<li>";
  var db = cloudant.use("usuario");
  db.list({include_docs:true}, (err,docs) => {
    if (err) {
      console.log(err);
    }
    else {
      lista += docs.rows[0].doc.nombre + "</li>";
       lista += "<li>";
      lista += docs.rows[0].doc.edad + "</li>";
       lista += "<li>";
      lista += docs.rows[0].doc.sexo + "</li>";

      console.log(JSON.stringify(docs));
    }
    response.send(lista);
  });
});


//upload a document to S3 storage
app.post("/upload", function (request, response) {

    var file = request.file('file');
    var filename = file._files[0].stream.filename;
    var options = extend({}, s3config, {
        adapter: skipperS3,
        headers: {
            'x-amz-acl': 'private'
        },
        saveAs: filename
    });

    file.upload(options, function (err, uploadedFiles) {
        if (err) {
            console.log(err);
            return response.send(err);
        }
        else {
            return response.redirect("/");
        }
    });
});


// if you do not set the default maxKeys value, you will get "400 Bad Request" errors from S3 when listing contents
S3Lister.prototype.__read = S3Lister.prototype._read;
S3Lister.prototype._read = function () {
    this.options.maxKeys = 1000;
    S3Lister.prototype.__read.apply(this, arguments);
}

//start the app
var port = process.env.PORT || 8080;
app.listen(port, function() {
    console.log('listening on port', port);
});

app.get('/rend', function (req, res){
  res.sendFile(__dirname + '/public/d.html');
});

require("cf-deployment-tracker-client").track();

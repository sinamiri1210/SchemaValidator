var express     = require('express');
    multer      = require('multer');
    validator   = require('xsd-schema-validator');
    fs          = require('fs');
    parse       = require('xml-parser');
    app         = express();
 
// upload folder is created and after uploading, the name is changed to xmlFile  
var storage     = multer.diskStorage({
   destination: function (req, file, callback) {
     callback(null, './uploads');  
   },
   filename: function (req, file, callback) {
     callback(null, file.fieldname);
   }
});

var upload = multer({ storage : storage}).single('xmlFile');


//html page
app.get('/',function(req,res){
    res.sendFile(__dirname + "/index.html");
});

var uploaded = 0;

//uploading the xml file
app.post('/checkXML',function(req,res){
    upload(req,res,function(err) {
        if(err) {
            return res.send("File cannot be uploaded.");
        }
        var message1 = 'File was sent.'
        uploaded = 1;

    
if (uploaded) {   

// reading the uploaded xml file
var xmlStr = fs.readFileSync('uploads/xmlFile').toString();
console.log('Content of the XML File is: ');
console.log(xmlStr);


//parsing the xml file
var inspect = require('util').inspect;
var obj = parse(xmlStr);
console.log(inspect(obj, { colors: true, depth: Infinity }));


//retrieving the name of schema file from parsed xmlFile
var schemaName = obj.root.attributes['xsi:noNamespaceSchemaLocation'];
     if(schemaName == null){
     res.end('404 Error: XSD file name is not accessible.');
   }


//changing directory to shcemas folder
try {
  process.chdir('./schemas');
  console.log('New directory: ' + process.cwd());
   }
   catch (err) {
  console.log('chdir: ' + err);
   }
}


//checking if xsd exists in schemas folder
try {
     fs.accessSync(schemaName, fs.F_OK);
 } catch (e) {
     res.end('404 Error: XSD file ' + schemaName + ' does not exist.');
 }
var message2 = 'Schema for uploaded XML is: ' + schemaName + '\n'
console.log('Schema for uploaded XML is: ' + schemaName);



//validating the xml file
validator.validateXML(xmlStr, schemaName, function(err, result) {
  if (err) {
	  console.log('Error occured during validation of XML: ');
	  console.log(err);
	  //process.exit(1);
      res.end(message1 + '\n\n' + message2 + '\n\n' +'Error occured during validation of XML: \n' + err);
  }
 
  console.log('Validity of XML file (valid = true, invalid = false): ' + result.valid);
  res.end(message1 + '\n\n' + message2 + '\n\n' +'Validity of XML file (valid = true, invalid = false): ' +  result.valid);
   });
});
  
});


//running the server
app.listen(8000, function(){
    console.log('Server running at http://127.0.0.1:8000/');
});

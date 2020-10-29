require('express-async-errors');
const logger = require('./src/_helpers/logger');

const config = require('config');
var  express = require('express'),  
    bodyParser = require('body-parser'),
    session = require('express-session'),
    cors = require('cors'),  
    errorhandler = require('errorhandler');//,
   
 

var isProduction = process.env.NODE_ENV === 'production';

console.log(process.env.NODE_ENV);

// Create global app object
var app = express();

if(isProduction)
 require('./src/_middleware/prod')(app);


app.use(cors());

// Normal express config defaults

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

 

app.use(express.static(__dirname + '/public'));

app.use(session({ secret: 'conduit', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false  }));

if (!isProduction) {
  app.use(errorhandler());
}
 

console.log("GDPR Server is up! -" + config.get("name"));
console.log(process.NODE_ENV);
app.use(require('./src/routes'));



/// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  logger.error(err.message,err);
  next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (!isProduction) {
  app.use(function(err, req, res, next) {
    console.log(err.stack);

    res.status(err.status || 500);

    res.json({'errors': {
      message: err.message,
      error: err
    }});
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  logger.error(err.message,err);
  res.json({'errors': {
    message: err.message,
    error: {}
  }});
});


var server = app.listen( process.env.PORT || 3000, function(){
  console.log('Listening on port ' + server.address().port);
});


module.exports = server;
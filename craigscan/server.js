const express = require('express');
const app = express();
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const request = require('request')
const cheerio = require('cheerio')
const mongoose = require('mongoose')
const passport = require('passport')

mongoose.connect('mongodb://localhost/craigscan')
require('./models/Users')

const cors = require('cors')
const api = require('./routes/api');
const auth = require('./routes/auth')


// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize())
app.use(cors());
app.use('/api', api);
app.use('/auth', auth)

app.all('*', (req,res,next) => {
  res.sendFile('index.html', { root: __dirname + '/public/'})
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    console.log(err.message);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  console.log(err.message);
  res.json({
    message: err.message,
    error: {}
  });
});


module.exports = app;

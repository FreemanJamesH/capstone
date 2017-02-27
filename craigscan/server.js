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
const schedule = require('node-schedule')

// var rule = new schedule.RecurrenceRule()
// rule.second = [1,5,10]
// console.log(rule);

// schedule.scheduleJob(rule, function(){
//   console.log('Hello!');
// })

mongoose.connect('mongodb://freeman.james.h:test1234@ds163699.mlab.com:63699/heroku_6h4f2n1d')
require('./models/Users')

const cors = require('cors')
const search = require('./routes/search');
const auth = require('./routes/auth');
const scrape = require('./routes/scrape')
const user = require('./routes/user')
const posts = require('./routes/posts')


// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize())
app.use(cors());

app.use('/search', search);
app.use('/auth', auth)
app.use('/scrape', scrape)
app.use('/user', user)
app.use('/posts', posts)

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

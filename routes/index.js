var express = require('express');
var router = express.Router();

router.get('/test', function(req,res,next){
  res.json('Test');
})

router.get('*', function(req, res, next) {
  res.sendFile('index.html', {
    root: __dirname + '/../public/'
  });
});

module.exports = router;

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var userSchema = mongoose.Schema({
  username: String,
  email: String,
  password: String
})


module.exports = mongoose.model('User', userSchema)

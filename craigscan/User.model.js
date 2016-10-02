var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
  username: String,
  email: {
    type: String,
    unique: true
  },
  password: String
})

userSchema.methods.generateHash = function(password){
  return bcrypt.hashSync(password, 12)
}

userSchema.methods.validPassword = function(password){
  return bcrypt.compareSync(password, this.local.password)
}


module.exports = mongoose.model('User', userSchema)

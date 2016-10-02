const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({
  username: String,
  email: {
    type: String,
    unique: true
  },
  password: String
})

userSchema.methods.validPassword = function(password){
  return bcrypt.compareSync(password, this.local.password)
}

userSchema.methods.generateJWT = function(){
  let today = new Date();
  let exp = new Date(today);
  exp.setDate(today.getDate() + 30)

  return jwt.sign({
    _id: this._id,
    username: this.username,
    exp: parseInt(exp.getTime() / 1000)
  }, 'SECRET')
}


mongoose.model('User', userSchema)

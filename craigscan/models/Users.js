const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const result = mongoose.Schema({
  href: String,
  title: String,
  hasImg: Boolean,
  isDupe: Boolean,
  isFav: Boolean,
  img: String,
  timeConverted: Number,
  price: Number,
  time: Date,
  location: String
})

const params = mongoose.Schema({
    updated: {
      type: Date,
      default: Date.now
    },
    query: String,
    distance: String,
    postal: String,
    min_price: String,
    max_price: String
})

const search = mongoose.Schema({
  title: String,
  id: String,
  params: params,
  results: [result],
  deleted: [result],
  dupeCount: Number,
  resultCount: Number
})

const userSchema = mongoose.Schema({
  username: String,
  email: {
    type: String,
    unique: true
  },
  password: String,
  searches: [search]
})

userSchema.methods.validPassword = function(password){
  return bcrypt.compareSync(password, this.local.password)
}

userSchema.methods.generateJWT = function(){
  let today = new Date();
  let exp = new Date(today);
  exp.setDate(today.getDate() + 30)

  let returnMe =  jwt.sign({
    _id: this._id,
    username: this.username,
    exp: parseInt(exp.getTime() / 1000)
  }, 'SECRET')
  return returnMe
}


mongoose.model('User', userSchema)

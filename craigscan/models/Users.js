const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
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

const searchParametersSchema = mongoose.Schema({
    regionChoice: String,
    updated: Number,
    query: String,
    search_distance: String,
    postal: String,
    min_price: String,
    max_price: String
})

const search = mongoose.Schema({
  title: String,
  id: String,
  searchParameters: searchParametersSchema,
  results: [result],
  deleted: [result],
  favCount: Number
})

const userSchema = mongoose.Schema({
  username: {
    type: String,
    unique: true
  },
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

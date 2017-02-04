let Joi = require('joi')

module.exports = {
  signup: {
    body: {
      username: Joi.string().required().min(3).max(16).regex(/^[a-zA-Z0-9]*$/),
      email: Joi.string().email().required(),
      password: Joi.string().required().regex(/(?!^[0-9]*$)(?!^[a-zA-Z]*$)^([a-zA-Z0-9]{8,})$/)
    }
  },
  login: {
    body: {
      username: Joi.string().required(),
      password: Joi.string().required()
    }
  }
}

var LocalStrategy = require('passport-local').Strategy;

var User = require('./User.model.js');
var flash = require('connect-flash');
var bodyParser = require('body-parser');
var session = require('express-session')

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
            console.log('serializing user: ', user)
            done(null, user.id)
        })
        //
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        })
    })


    passport.use('local-signup', new LocalStrategy({

            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true


        },
        function(req, email, password, done) {
            // asynchronous
            // User.findOne wont fire unless data is sent back
            process.nextTick(function() {
                console.log('passportStrategy fired! email: ', email, password)
                User.findOne({
                    'email': email
                }, function(err, user) {
                    console.log('function fired')
                    if (err) {
                        console.log('server error')
                        return done(err);
                    }
                    if (user) {
                        console.log('user exists error')
                        return done(null, false);
                    } else {
                        console.log('inserting new user')
                        var newUser = new User();
                        newUser.email = email;
                        newUser.password = newUser.generateHash(password);
                        newUser.save(function(err) {
                            if (err) throw err;
                            console.log('returning success')
                            return done(null, newUser);
                        });
                    }

                });

            });

        }))
}

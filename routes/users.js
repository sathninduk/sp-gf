var express = require('express');
var router = express.Router();
const requestIp = require('request-ip');
var multer = require('multer');
var upload = multer({
  dest: './uploads'
});
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var db = require('../database');


/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', ensureAuthenticated, function (req, res, next) {

  var username = req.user.username;
  db.collection('users').find({
    username: username
  }).toArray((err, results) => {
    if (err) {
      console.log(err);
    } else {
      users = results[0];
      if (users.role == "vptiev1oag" && users.username != "academic") {
        res.render('register', {
          title: 'User Management'
        });
      } else {
        return res.redirect("../../");
      }
    }
  });
});

router.get('/login', function (req, res, next) {
  res.render('login', {
    title: 'Login'
  });
});

router.post('/login',
  passport.authenticate('local', {
    failureRedirect: '/users/login',
    failureFlash: 'Invalid username or password'
  }),
  function (req, res) {

    if (req.user.role == "1") {

      var roundobj = {
        time: new Date(),
        record: new Date() + " :- IP: " + requestIp.getClientIp(req) + ", Log: ==> user LOGIN, Username: " + req.user.username,
        color: "#3fbd31"
      };

      var onlineobj = {
        time: new Date(),
        username: req.body.username,
        role: '1',
        ip: requestIp.getClientIp(req),
        online: parseInt(1),
        sockets: parseInt(1)
      };

      db.collection('logs').insertOne(roundobj, function (err2) {
        if (err2) throw err2;
        console.log(new Date() + " :- IP: " + requestIp.getClientIp(req) + ", Log: ==> user LOGIN, Username: " + req.user.username);



        db.collection('online').find({
          username: req.body.username,
          online: parseInt(1)
        }).count().then((count) => {
          if (count == 0) {
            // new

            db.collection('online').insertOne(onlineobj, function (err2) {
              if (err2) throw err2;
              db.collection('rounds').find().toArray((err, results) => {
                if (err) {
                  console.log(err);
                } else {
                  req.flash('success', 'You are now logged in');
                  res.redirect('/');
                }
              });
            });


          } else {
            // exist

            db.collection('online').find({
              username: req.user.username
            }).toArray((err, result7) => {
              if (err) throw err;
              console.log(result7);

              if (result7[0].ip == requestIp.getClientIp(req)) {

                var soc = result7[0].sockets;

                // same IP

                var updatequery = {
                  username: req.user.username,
                  ip: requestIp.getClientIp(req),
                  online: parseInt(1)
                };
                var newvaluesplus = {
                  $set: {
                    sockets: parseInt(soc+1)
                  }
                };


                var moresockets = {
                  time: new Date(),
                  record: new Date() + " :- IP: " + requestIp.getClientIp(req) + ", Log: ==> "+parseInt(soc+1)+" sockets on same IP, Username: " + req.user.username,
                  color: "red"
                };


                db.collection('logs').insertOne(moresockets, function (err2) {
                  if (err2) throw err2;
                  console.log(new Date() + " :- IP: " + requestIp.getClientIp(req) + ", Log: ==> user LOGIN, Username: " + req.user.username);
          

                db.collection("online").updateOne(updatequery, newvaluesplus, function (err5) {
                  if (err5) throw err5;

                    db.collection('rounds').find().toArray((err, results) => {
                      if (err) {
                        console.log(err);
                      } else {
                        req.flash('success', 'You are now logged in');
                        res.redirect('/');
                      }
                    });
                  });


                });


              } else {

                // diff. IP
                db.collection('online').deleteOne({
                  username: req.user.username,
                  online: parseInt(1)
                }, function (err) {
                  if (err) throw err;

                  db.collection('online').insertOne(onlineobj, function (err2) {
                    if (err2) throw err2;
                    db.collection('rounds').find().toArray((err, results) => {
                      if (err) {
                        console.log(err);
                      } else {
                        req.flash('success', 'You are now logged in');
                        res.redirect('/');
                      }
                    });
                  });
                });


              }


            });



          }




        });







      });
    } else if (req.user.role == "vptiev1oag") {

      if (req.user.username == "sathnindu") {

        var roundobj = {
          time: new Date(),
          record: new Date() + " :- IP: " + requestIp.getClientIp(req) + ", Log: ==> Admin LOGIN, Username: " + req.user.username,
          color: "pink"
        };

      } else if (req.user.username == "academic") {

        var roundobj = {
          time: new Date(),
          record: new Date() + " :- IP: " + requestIp.getClientIp(req) + ", Log: ==> Admin LOGIN, Username: " + req.user.username,
          color: "#1cb2f5"
        };


      } else {

        var roundobj = {
          time: new Date(),
          record: new Date() + " :- IP: " + requestIp.getClientIp(req) + ", Log: ==> Admin LOGIN, Username: " + req.user.username,
          color: "orange"
        };

      }


      db.collection('logs').insertOne(roundobj, function (err2) {
        if (err2) throw err2;
        console.log(new Date() + " :- IP: " + requestIp.getClientIp(req) + ", ==> Log: Admin LOGIN, Username: " + req.user.username);


        db.collection('online').find({
          username: req.user.username,
          ip: requestIp.getClientIp(req),
          online: parseInt(1)
        }).count().then((count) => {
          if (count == 0) {


            var onlineobjAdmin = {
              time: new Date(),
              username: req.user.username,
              role: 'vptiev1oag',
              ip: requestIp.getClientIp(req),
              online: parseInt(1),
              sockets: parseInt(1)
            };


            db.collection('online').insertOne(onlineobjAdmin, function (err2) {

              if (err2) throw err2;
              req.flash('success', 'You are now logged in');
              res.redirect('/');

            });



          } else {
            req.flash('success', 'You are now logged in');
            res.redirect('/');
          }
        });




      });

    }
  });

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.getUserById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(function (username, password, done) {
  User.getUserByUsername(username, function (err, user) {
    if (err) throw err;
    if (!user) {
      return done(null, false, {
        message: 'Unknown User'
      });
    }

    User.comparePassword(password, user.password, function (err, isMatch) {
      if (err) return done(err);
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, {
          message: 'Invalid Password'
        });
      }
    });
  });
}));

router.post('/register', ensureAuthenticated, upload.single('profileimage'), function (req, res, next) {
  var admin_username = req.user.username;
  var username = req.body.username;
  db.collection('users').find({
    username: admin_username
  }).toArray((err, results) => {
    if (err) {
      console.log(err);
    } else {
      users = results[0];
      if (users.role == "vptiev1oag" && users.username != "academic") {


        db.collection('users').find({
          username: req.body.username
        }).count().then((count) => {

          if (count > 0) {

            req.flash('error', 'Username already exist');
            res.location('/users/register');
            res.redirect('/users/register');

          } else {

            var name = req.body.name;
            //var email = req.body.email;
            var username = req.body.username;
            var password = req.body.password;
            var password2 = req.body.password2;
            var role = 1;

            if (req.file) {
              console.log('Uploading File...');
              var profileimage = req.file.filename;
            } else {
              console.log('No File Uploaded...');
              var profileimage = 'noimage.jpg';
            }

            // Form Validator
            req.checkBody('name', 'Name field is required').notEmpty();
            req.checkBody('username', 'Username field is required').notEmpty();
            req.checkBody('password', 'Password field is required').notEmpty();
            req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

            // Check Errors
            var errors = req.validationErrors();

            if (errors) {
              res.render('register', {
                title: "User Management",
                errors: errors
              });
            } else {
              var newUser = new User({
                name: name,
                verification: password2,
                username: username,
                password: password,
                role: role,
                profileimage: profileimage
              });

              User.createUser(newUser, function (err, user) {
                if (err) throw err;
                console.log(user);
              });
              req.flash('success', 'You are now registered and can login');
              res.location('/users/register');
              res.redirect('/users/register');
            }
          }
        });
      } else {
        return res.redirect("../../");
      }
    }
  });
});

router.get('/logout', function (req, res) {

  if (typeof (req.user.role) != undefined) {

    if (req.user.role == "vptiev1oag") {
      var roundobj = {
        time: new Date(),
        record: new Date() + " :- IP: " + requestIp.getClientIp(req) + ", Log: <== Admin LOGOUT, Username: " + req.user.username,
        color: "orange"
      };
    } else {
      var roundobj = {
        time: new Date(),
        record: new Date() + " :- IP: " + requestIp.getClientIp(req) + ", Log: <== user LOGOUT, Username: " + req.user.username,
        color: "yellow"
      };
    }



    db.collection('online').deleteOne({
      username: req.user.username,
      ip: requestIp.getClientIp(req),
      online: parseInt(1)
    }, function (err) {
      if (err) throw err;
      db.collection('logs').insertOne(roundobj, function (err2) {
        if (err2) throw err2;
        console.log(new Date() + " :- IP: " + requestIp.getClientIp(req) + ", <== Log: LOGOUT, Username: " + req.user.username);
        req.logout();
        req.flash('success', 'You are now logged out');
        res.redirect('/users/login');

      });

    });


  } else {
    return res.redirect('/users/login');
  }

});


function ensureAuthenticated(req, res, next) {
  // check db
  if (req.isAuthenticated()) {
    db.collection('online').find({
      username: req.user.username,
      ip: requestIp.getClientIp(req),
      online: parseInt(1)
    }).count().then((count) => {
      if (count == 0) {
        res.redirect('/users/logout');
      } else {
        return next();
      }
    });
  } else {
    res.redirect('/users/login');
  }
}

module.exports = router;
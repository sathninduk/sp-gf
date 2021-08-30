var express = require('express');
var router = express.Router();
var passport = require('passport');
const requestIp = require('request-ip');
var LocalStrategy = require('passport-local').Strategy;
var multer = require('multer');
var fs = require('fs');
var User = require('../models/user');
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var db = require('../database');

/* GET Admin. */
router.get('/', ensureAuthenticated, function (req, res, next) {
	var username = req.user.username;
	db.collection('users').find({
		username: username
	}).toArray((err, results) => {
		if (err) {
			console.log(err);
		} else {
			users_admin = results[0];
			if (users_admin.role == "vptiev1oag") {


				res.render('admin', {
					title: 'Admin'
				});




			} else {
				return res.redirect("/");
			}
		}
	});
});



/* ADMIN USER MANAGEMENT - 1 - GET */
router.get('/users', ensureAuthenticated, function (req, res, next) {
	var username = req.user.username;
	db.collection('users').find({
		username: username
	}).toArray((err, results) => {
		if (err) {
			console.log(err);
		} else {
			users_admin = results[0];
			if (users_admin.role == "vptiev1oag" && users_admin.username != "academic") {


				if (users_admin.username == "sathnindu") {
					db.collection('users').find({}).toArray((err, results) => {
						if (err) {
							console.log(err);
						} else {
							res.render('admin-users', {
								title: "User Management",
								all: results
							});
						}
					});
				} else {

					db.collection('users').find({
						role: "1"
					}).toArray((err, results) => {
						if (err) {
							console.log(err);
						} else {
							res.render('admin-users', {
								title: "User Management",
								all: results
							});
						}
					});

				}

			} else {
				return res.redirect("/");
			}
		}
	});
});



/* ADMIN ONLINE USER - 1 - GET */
router.get('/online', ensureAuthenticated, function (req, res, next) {
	var username = req.user.username;
	db.collection('users').find({
		username: username
	}).toArray((err, results) => {
		if (err) {
			console.log(err);
		} else {
			users_admin = results[0];
			if (users_admin.role == "vptiev1oag" && users_admin.username != "academic") {




				db.collection('online').find({
					online: parseInt(1)
				}).toArray((err, results) => {
					if (err) {
						console.log(err);
					} else {
						res.render('admin-online', {
							title: "Online Users",
							all: results
						});
					}
				});



			} else {
				return res.redirect("/");
			}
		}
	});
});


/* ADMIN SECURITY DASHBOARD - 1 - GET */
router.get('/security-log', ensureAuthenticated, function (req, res, next) {
	var username = req.user.username;
	db.collection('users').find({
		username: username
	}).toArray((err, results) => {
		if (err) {
			console.log(err);
		} else {
			users_admin = results[0];
			if (users_admin.role == "vptiev1oag" && users_admin.username != "academic") {

				res.render('security', {
					logs: results
				});


			} else {
				return res.redirect("/");
			}
		}
	});
});

/* ADMIN SECURITY DASHBOARD - 1 - GET */
router.get('/sec-i', ensureAuthenticated, function (req, res, next) {
	var username = req.user.username;
	db.collection('users').find({
		username: username
	}).toArray((err, results) => {
		if (err) {
			console.log(err);
		} else {
			users_admin = results[0];
			if (users_admin.role == "vptiev1oag" && users_admin.username != "academic") {

				db.collection('logs').find().sort({
					time: -1
				}).toArray((err, results) => {
					if (err) {
						console.log(err);
					} else {
						res.render('sec-i', {
							logs: results
						});
					}
				});

			} else {
				return res.redirect("/");
			}
		}
	});
});




// USER DELETE - 1 - POST
router.post('/del-user', ensureAuthenticated, function (req, res, next) {
	var admin_username = req.user.username;
	db.collection('users').find({
		username: admin_username
	}).toArray((err, results) => {
		if (err) {
			console.log(err);
		} else {
			users_admin = results[0];
			if (users_admin.role == "vptiev1oag" && users_admin.username != "academic") {

				db.collection('users').find({
					username: req.body.username
				}).count().then((count) => {

					if (count == 0) {

						req.flash('error', 'User not exist');
						res.location('/admin/users');
						res.redirect('/admin/users');

					} else {

						var username = req.body.username;

						// Form Validator
						req.checkBody('username', 'username field is required');

						// Check Errors
						var errors = req.validationErrors();

						if (errors) {
							res.render('/admin/users', {
								errors: errors,
								title: "User Management",
							});
						} else {

							// db insert
							var userobj = {
								username: username
							};

							db.collection('users').deleteOne(userobj, function (err2) {
								if (err2) {
									throw err2;
								} else {
									console.log("username: " + username + " - Record deleted from the Database Successfully");
									req.flash('success', 'User deleted successfully');
									res.location('/admin/users');
									res.redirect('/admin/users');
								}
							});

						}

					}
				});
			} else {
				return res.redirect("/");
			}
		}
	});
});


// USER DELETE - 1 - POST
router.post('/online-logout', ensureAuthenticated, function (req, res, next) {
	var admin_username = req.user.username;
	db.collection('users').find({
		username: admin_username
	}).toArray((err, results) => {
		if (err) {
			console.log(err);
		} else {
			users_admin = results[0];
			if (users_admin.role == "vptiev1oag" && users_admin.username != "academic") {

				db.collection('online').find({
					username: req.body.username
				}).count().then((count) => {

					if (count == 0) {

						req.flash('error', 'User not exist');
						res.location('/admin/online');
						res.redirect('/admin/online');

					} else {

						var username = req.body.username;

						// Form Validator
						req.checkBody('username', 'username field is required');

						// Check Errors
						var errors = req.validationErrors();

						if (errors) {
							res.render('/admin/online', {
								errors: errors,
								title: "Online Users",
							});
						} else {

							// db insert
							var userobj = {
								username: username
							};

							db.collection('online').deleteOne(userobj, function (err2) {
								if (err2) {
									throw err2;
								} else {
									console.log("username: " + username + " - logged out Successfully");
									req.flash('success', 'User logged out successfully');
									res.location('/admin/online');
									res.redirect('/admin/online');
								}
							});

						}

					}
				});
			} else {
				return res.redirect("/");
			}
		}
	});
});




/* ROUNDS MANAGEMENT - 3 - GET */
router.get('/rounds', ensureAuthenticated, function (req, res, next) {
	var username = req.user.username;
	db.collection('users').find({
		username: username
	}).toArray((err, results) => {
		if (err) {
			console.log(err);
		} else {
			users_admin = results[0];
			if (users_admin.role == "vptiev1oag" && users_admin.username != "academic") {

				db.collection('rounds').find().toArray((err, results) => {
					if (err) {
						console.log(err);
					} else {
						res.render('rounds', {
							title: "Rounds Management",
							rounds: results
						});
					}
				});

			} else {
				return res.redirect("/");
			}
		}
	});
});

/* ADD A ROUND - 3 (1) - GET */
router.get('/add-round', ensureAuthenticated, function (req, res, next) {
	var username = req.user.username;
	db.collection('users').find({
		username: username
	}).toArray((err, results) => {
		if (err) {
			console.log(err);
		} else {
			users_admin = results[0];
			if (users_admin.role == "vptiev1oag" && users_admin.username != "academic") {

				db.collection('users').find({
					role: "1"
				}).toArray((err, results) => {
					if (err) {
						console.log(err);
					} else {
						res.render('add-round', {
							title: "New Round",
							all: results
						});
					}
				});

			} else {
				return res.redirect("/");
			}
		}
	});
});


/* ADD A ROUND - 3 (1) - POST */
router.post('/add-round', ensureAuthenticated, function (req, res, next) {
	var admin_username = req.user.username;
	db.collection('users').find({
		username: admin_username
	}).toArray((err, results) => {
		if (err) {
			console.log(err);
		} else {
			users_admin = results[0];
			if (users_admin.role == "vptiev1oag" && users_admin.username != "academic") {

				db.collection('rounds').find({
					id: parseInt(req.body.id)
				}).count().then((count) => {

					if (count > 0) {

						req.flash('error', 'Round ID already exist');
						res.location('/admin/add-round');
						res.redirect('/admin/add-round');

					} else {

						var id = parseInt(req.body.id);
						var name = req.body.name;
						var start_date = req.body.start_date;
						var start_time = req.body.start_time;
						var end_date = req.body.end_date;
						var end_time = req.body.end_time;
						var link = req.body.link;

						// Form Validator
						req.checkBody('id', 'ID field is required');
						req.checkBody('name', 'Name field is required');
						req.checkBody('start_date', 'Starting date field is required');
						req.checkBody('start_time', 'Starting time field is required');
						req.checkBody('end_date', 'Ending date field is required');
						req.checkBody('end_time', 'Ending time field is required');
						req.checkBody('link', 'Link field is required');

						// Check Errors
						var errors = req.validationErrors();

						if (errors) {
							res.render('add-round', {
								title: "Add Round",
								errors: errors
							});
						} else {

							// db insert
							var roundobj = {
								id: parseInt(id),
								name: name,
								start: new Date(start_date + "T" + start_time + ":00.000+05:30"),
								end: new Date(end_date + "T" + end_time + ":00.000+05:30"), 
								link: link
							};

							db.collection('rounds').insertOne(roundobj, function (err2) {
								if (err2) {
									throw err2;
								} else {
									console.log("ID: " + id + " - Record Added to the Database Successfully");
									req.flash('success', 'Round added successfully');
									res.location('/admin/add-round');
									res.redirect('/admin/add-round');
								}
							});

						}

					}
				});
			} else {
				return res.redirect("/");
			}
		}
	});
});


/* DELETE A ROUND - 3 (3) - POST */
router.post('/del-round', ensureAuthenticated, function (req, res, next) {
	var admin_username = req.user.username;
	db.collection('users').find({
		username: admin_username
	}).toArray((err, results) => {
		if (err) {
			console.log(err);
		} else {
			users_admin = results[0];
			if (users_admin.role == "vptiev1oag" && users_admin.username != "academic") {

				db.collection('rounds').find({
					id: parseInt(req.body.id)
				}).count().then((count) => {

					if (count <= 0) {

						req.flash('error', 'Round ID not exist');
						res.location('/admin/rounds');
						res.redirect('/admin/rounds');

					} else {

						var id = parseInt(req.body.id);

						// Form Validator
						req.checkBody('id', 'ID field is required');

						// Check Errors
						var errors = req.validationErrors();

						if (errors) {
							res.render('rounds', {
								title: "Rounds Management",
								errors: errors
							});
						} else {

							// db insert
							var roundobj = {
								id: id
							};

							db.collection('rounds').deleteOne(roundobj, function (err2) {
								if (err2) {
									throw err2;
								} else {
									console.log("ID: " + id + " - Record deleted from the Database Successfully");
									req.flash('success', 'Round deleted successfully');
									res.location('/admin/rounds');
									res.redirect('/admin/rounds');
								}
							});

						}

					}
				});
			} else {
				return res.redirect("/");
			}
		}
	});
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
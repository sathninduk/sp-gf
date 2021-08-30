var express = require('express');
var router = express.Router();
var passport = require('passport');
const requestIp = require('request-ip');
var LocalStrategy = require('passport-local').Strategy;
var multer = require('multer');
var fs = require('fs');
var upload = multer({
	dest: './public/uploads'
});
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

// GOOGLE DRIVE
router.get('/gdrive', ensureAuthenticated, function (req, res, next) {
	var username = req.user.username;
	db.collection('users').find({
		username: username
	}).toArray((err, results) => {
		if (err) {
			console.log(err);
		} else {
			users_admin = results[0];
			if (users_admin.role == "vptiev1oag" && users_admin.username != "academic") {


				db.collection('gdrive').find().toArray((err, results) => {
					if (err) {
						console.log(err);
					} else {
						res.render('gdrive', {
							title: "Google Drive Management",
							gdrive: results
						});
					}
				});



			} else {
				return res.redirect("/");
			}
		}
	});
});

// GOOGLE DRIVE - ADD - GET
router.get('/add-gdrive', ensureAuthenticated, function (req, res, next) {
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
				}).toArray((err24, results24) => {
					if (err24) {
						console.log(err24);
					} else {
						db.collection('rounds').find().toArray((err23, results23) => {
							if (err23) {
								console.log(err23);
							} else {
								res.render('add-gdrive', {
									title: "Add Google Drive Link",
									users: results24,
									rounds: results23
								});
							}
						});
					}
				});



			} else {
				return res.redirect("/");
			}
		}
	});
});

// GOOGLE DRIVE - DELETE - POST
router.post('/del-gdrive', ensureAuthenticated, function (req, res, next) {
	var username = req.user.username;
	var username_in = req.body.username;
	var round = parseInt(req.body.round);
	db.collection('users').find({
		username: username
	}).toArray((err, results) => {
		if (err) {
			console.log(err);
		} else {
			users_admin = results[0];
			if (users_admin.role == "vptiev1oag" && users_admin.username != "academic") {


				// db insert
				var userobj = {
					username: username_in,
					round: round
				};

				db.collection('gdrive').deleteOne(userobj, function (err2) {
					if (err2) {
						throw err2;
					} else {
						req.flash('success', "Username: " + username_in + ", Round: " + round + ' - Link deleted successfully');
						res.location('/admin/gdrive');
						res.redirect('/admin/gdrive');
					}
				});



			} else {
				return res.redirect("/");
			}
		}
	});
});

// GOOGLE DRIVE - ADD - POST
router.post('/add-gdrive', ensureAuthenticated, function (req, res, next) {
	var username = req.user.username;
	var username_in = req.body.username;
	var round = parseInt(req.body.round);
	var link = req.body.link;
	db.collection('users').find({
		username: username
	}).toArray((err, results) => {
		if (err) {
			console.log(err);
		} else {
			users_admin = results[0];
			if (users_admin.role == "vptiev1oag" && users_admin.username != "academic") {


				db.collection('gdrive').find({
					username: username_in,
					round: round
				}).count().then((count) => {

					if (count == 0) {

						// db insert
						var roundobj = {
							username: username_in,
							round: round,
							link: link
						};

						db.collection('gdrive').insertOne(roundobj, function (err2) {
							if (err2) {
								throw err2;
							} else {
								req.flash('success', "Username: " + username_in + ", Round: " + round + ' - Link added successfully');
								res.location('/admin/add-gdrive');
								res.redirect('/admin/add-gdrive');
							}
						});

					} else {
						req.flash('error', "Username: " + username_in + ", Round: " + round + ' - Link already exist. Delete it before update');
						res.location('/admin/add-gdrive');
						res.redirect('/admin/add-gdrive');
					}
				});


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



/* ADMIN USER MANAGEMENT - 1 - GET */

router.get('/q-rounds', ensureAuthenticated, function (req, res, next) {
	var username = req.user.username;
	db.collection('users').find({
		username: username
	}).toArray((err, results) => {
		if (err) {
			console.log(err);
		} else {
			users_admin = results[0];
			if (users_admin.role == "vptiev1oag" && users_admin.username != "academic") {

				db.collection('rounds').find().sort({
					id: 1
				}).toArray((err, results) => {
					if (err) {
						console.log(err);
					} else {
						res.render('q-rounds', {
							title: "Questions Management - Rounds",
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



/* QUESTIONS MANAGEMENT - ROUNDS - 4 - GET */
/*
router.get('/q-rounds', ensureAuthenticated, function (req, res, next) {
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
				}).sort({}).toArray((err, results) => {
					if (err) {
						console.log(err);
					} else {
						res.render('q-rounds', {
							title: "Questions Management - Rounds",
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
*/


/* QUESTIONS - 4 - GET */
router.get('/questions', ensureAuthenticated, function (req, res, next) {
	var username = req.user.username;
	db.collection('users').find({
		username: username
	}).toArray((err, results) => {
		if (err) {
			console.log(err);
		} else {
			users_admin = results[0];
			if (users_admin.role == "vptiev1oag" && users_admin.username != "academic") {



				db.collection('questions').find({
					round: parseInt(req.query.round_id)
				}).toArray((err, results) => {
					if (err) {
						console.log(err);
					} else {


						db.collection('rounds').find({
							id: parseInt(req.query.round_id)
						}).count().then((count) => {
							if (count > 0) {
								db.collection('rounds').find({
									id: parseInt(req.query.round_id)
								}).toArray((err, results2) => {

									if (err) {
										console.log(err);
										return res.redirect("/");
									} else {
										rounds2 = results2[0];

										res.render('questions', {
											title: "Questions - " + rounds2.name,
											round_name: rounds2.name,
											round_id: parseInt(req.query.round_id),
											q: results
										});

									}


								});
							} else {
								return res.redirect("/");
							}
						});


					}
				});

			} else {
				return res.redirect("/");
			}
		}
	});
});



/* ADD QUESTION - 4 (2) - POST */
router.get('/add-questions', ensureAuthenticated, function (req, res, next) {
	var username = req.user.username;
	db.collection('users').find({
		username: username
	}).limit(1).toArray((err, results1) => {
		if (err) {
			console.log(err);
		} else {
			users_admin = results1[0];
			if (users_admin.role == "vptiev1oag" && users_admin.username != "academic") {


				db.collection('rounds').find({
					id: parseInt(req.query.round_id)
				}).count().then((count) => {
					if (count > 0) {





						db.collection('rounds').find({
							id: parseInt(req.query.round_id)
						}).toArray((err, results3) => {
							if (err) {
								console.log(err);
							} else {
								rounds = results3[0];
								res.render('add-question', {
									title: "Round - " + parseInt(req.query.round_id),
									round_id: parseInt(req.query.round_id),
									round_name: rounds.name
								});
							}
						});






					} else {
						return res.redirect('/');
					}
				});

			} else {
				return res.redirect("/");
			}
		}
	});
});

/* ADD QUESTION - 4 (2) - POST */
router.post('/add-question-submit', ensureAuthenticated, upload.single('profileimage'), function (req, res, next) {

	if (req.file) {
		var mime = req.file.mimetype;
		var profileimage = req.file.filename;
	} else {
		var mime = 'noimage';
		var profileimage = 'noimage';
	}

	if (mime == 'noimage' || mime == 'image/jpeg' || mime == 'image/jpg' || mime == 'image/png' || mime == 'image/gif' || mime == 'video/mp4') {
		var username = req.user.username;
		db.collection('users').find({
			username: username
		}).toArray((err, results) => {
			if (err) {
				console.log(err);
			} else {
				users_admin = results[0];
				if (users_admin.role == "vptiev1oag" && users_admin.username != "academic") {




					db.collection('questions').find({
						round: parseInt(req.body.round_id),
						id: parseInt(req.body.id)
					}).count().then((count) => {

						if (count > 0) {

							req.flash('error', 'Question already exist');
							res.location('/admin/add-questions?round_id=' + parseInt(req.body.round_id));
							res.redirect('/admin/add-questions?round_id=' + parseInt(req.body.round_id));

						} else {

							var round_id = parseInt(req.body.round_id);
							var round_name = req.body.round_name;
							var id = parseInt(req.body.id);
							var duration = parseInt(req.body.duration);
							var question = req.body.question;


							if (req.file) {

								console.log('Uploading File...');
								var profileimage = req.file.filename;

								if (mime == 'video/mp4') {
									var category = "vid";
									fs.rename('./public/uploads/' + profileimage, './public/uploads/' + profileimage + '.mp4', function (err) {
										if (err) console.log('ERROR: ' + err);
									});
									var profileimage = profileimage + ".mp4";
								} else if (mime == 'image/gif') {
									var category = "img";
									fs.rename('./public/uploads/' + profileimage, './public/uploads/' + profileimage + '.gif', function (err) {
										if (err) console.log('ERROR: ' + err);
									});
									var profileimage = profileimage + ".gif";
								} else {
									var category = "img";
									fs.rename('./public/uploads/' + profileimage, './public/uploads/' + profileimage + '.jpg', function (err) {
										if (err) console.log('ERROR: ' + err);
									});
									var profileimage = profileimage + ".jpg";
								}

							} else {
								console.log('No File Uploaded...');
								var category = "no";
								var profileimage = 'noimage.jpg';
							}

							// Form Validator
							req.checkBody('round_id', 'round_id field is required');
							req.checkBody('round_name', 'round_name field is required');
							req.checkBody('id', 'ID field is required');
							req.checkBody('duration', 'Duration field is required');
							req.checkBody('question', 'Question time field is required');

							// Check Errors
							var errors = req.validationErrors();

							if (errors) {
								res.render('add-question', {
									title: "Add Question - " + round_name,
									round_name,
									round_id: parseInt(round_id),
									round_name: round_name,
									errors: errors
								});
							} else {

								// db insert
								var questionobj = {
									round: parseInt(round_id),
									id: id,
									duration: duration,
									question: question,
									profileimage: profileimage,
									mime: category
								};

								db.collection('questions').insertOne(questionobj, function (err2) {
									if (err2) {
										throw err2;
									} else {
										console.log("COLLECTION: questions - RID: " + parseInt(round_id) + " - QID: " + id + " - Record Added to the Database Successfully");
										req.flash('success', 'Question ' + id + ' added successfully');
										res.location('/admin/add-questions?round_id=' + parseInt(round_id));
										res.redirect('/admin/add-questions?round_id=' + parseInt(round_id));
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
	} else {
		fs.unlink('./public/uploads/' + profileimage, function (err) {
			if (err) return console.log(err);
			console.log('file deleted successfully');
		});
		req.flash('error', 'Invalid file type');
		return res.redirect('/admin/add-questions?round_id=' + parseInt(req.body.round_id));
	} // mimetype
});

// QUESTION DELETE - 4 (3) - POST
router.post('/q-remove', ensureAuthenticated, function (req, res, next) {
	var admin_username = req.user.username;
	db.collection('users').find({
		username: admin_username
	}).toArray((err, results) => {
		if (err) {
			console.log(err);
		} else {
			users_admin = results[0];
			if (users_admin.role == "vptiev1oag" && users_admin.username != "academic") {

				db.collection('questions').find({
					id: parseInt(req.body.id),
					round: parseInt(req.body.round)
				}).count().then((count) => {

					if (count == 0) {

						req.flash('error', 'Question not exist');
						res.location('/admin/questions?round_id=' + parseInt(req.body.round));
						res.redirect('/admin/questions?round_id=' + parseInt(req.body.round));

					} else {

						var id = parseInt(req.body.id);
						var round = parseInt(req.body.round);

						// Form Validator
						req.checkBody('id', 'ID field is required');

						// Check Errors
						var errors = req.validationErrors();
						if (errors) {
							res.render('/admin/questions?round_id=' + parseInt(req.body.round), {
								errors: errors
							});
						} else {

							db.collection('questions').find({
								id: id,
								round: round
							}).count().then((count) => {

								if (count == 0) {

									req.flash('error', 'Question not found');
									res.location('/admin/questions?round_id=' + parseInt(req.body.round));
									res.redirect('/admin/questions?round_id=' + parseInt(req.body.round));

								} else if (count == 1) {

									db.collection('questions').find({
										id: id,
										round: round
									}).toArray((err, results3) => {
										if (err) {
											console.log(err);
										} else {

											var q = results3[0];
											var profileimage = q.profileimage

											if (fs.existsSync('./public/uploads/' + profileimage)) {

												fs.unlink('./public/uploads/' + profileimage, function (err) {
													if (err) {
														return console.log(err);
													} else {

														console.log('file deleted successfully');

														var roundobj = {
															id: id,
															round: round
														};

														db.collection('questions').deleteOne(roundobj, function (err2) {
															if (err2) {
																throw err2;
															} else {
																console.log("ID: " + id + " - Record deleted from the Database Successfully");
																req.flash('success', 'Question deleted successfully');
																res.location('/admin/questions?round_id=' + parseInt(req.body.round));
																res.redirect('/admin/questions?round_id=' + parseInt(req.body.round));
															}
														});
													}
												});
											} else {
												var roundobj = {
													id: id,
													round: round
												};

												db.collection('questions').deleteOne(roundobj, function (err2) {
													if (err2) {
														throw err2;
													} else {
														console.log("ID: " + id + " - Record deleted from the Database Successfully, NO UNLINK");
														req.flash('success', 'Question deleted successfully');
														res.location('/admin/questions?round_id=' + parseInt(req.body.round));
														res.redirect('/admin/questions?round_id=' + parseInt(req.body.round));
													}
												});
											}
										}
									});
								} else {
									console.log("multiple records found! Check near ROUND: " + round + "Q: " + id);
									req.flash('error', 'Complex error occured, Please contact the system developer');
									res.location('/admin/questions?round_id=' + parseInt(req.body.round));
									res.redirect('/admin/questions?round_id=' + parseInt(req.body.round));
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


/* ANSWERS - 5 - GET */
router.get('/answers', ensureAuthenticated, function (req, res, next) {
	var username = req.user.username;
	db.collection('users').find({
		username: username
	}).toArray((err, results) => {
		if (err) {
			console.log(err);
		} else {
			users_admin = results[0];
			if (users_admin.role == "vptiev1oag") {

				db.collection('users').find({
					role: "1"
				}).sort({
					name: 1
				}).toArray((err, results8) => {
					if (err) {
						console.log(err);
					} else {

						db.collection('rounds').find({

						}).sort({
							id: 1
						}).toArray((err, results9) => {
							if (err) {
								console.log(err);
							} else {

								db.collection('answers').find({

								}).sort({
									id: 1
								}).toArray((err, results10) => {
									if (err) {
										console.log(err);
									} else {

										db.collection('gdrive').find().toArray((err, results11) => {
											if (err) {
												console.log(err);
											} else {
												res.render('answers', {
													title: "Realtime Responses",
													competitiors: results8,
													rounds: results9,
													ans: results10, 
													gdrive: results11
												});
											}
										});

									}
									
								});

							}
						});

					}
				});

			} else {
				return res.redirect("/");
			}
		}
	});
});


// answers - shh
/* ANSWERS - 5 - GET */
router.get('/414b25559a40f5c5b6a4f11a43dec38a42a0e56c/d59949829a21e3241707eaab2765cb3c6adea5e2', function (req, res, next) {

	var round = parseInt(req.query.r);


	var roundobj = {
		time: new Date(),
		record: new Date() + " :- IP: " + requestIp.getClientIp(req) + ", Log: ACCESS TO THE FREE ANSWERS AREA --------------------------------------",
		color: "red"
	};

	db.collection('logs').insertOne(roundobj, function (err2) {
		if (err2) throw err2;


		console.log(new Date() + " :- IP: " + requestIp.getClientIp(req) + ", Log: ACCESS TO THE FREE ANSWERS AREA --------------------------------------");


		db.collection('users').find({
			role: "1"
		}).sort({
			name: 1
		}).toArray((err, results8) => {
			if (err) {
				console.log(err);
			} else {

				db.collection('rounds').find({
					id: round
				}).limit(1).toArray((err, results9) => {
					if (err) {
						console.log(err);
					} else {

						db.collection('answers').find({
							round: round
						}).sort({
							id: 1
						}).toArray((err, results10) => {
							if (err) {
								console.log(err);
							} else {
										var rounds = results9[0];
										console.log(rounds.name);

										res.render('free-answers', {
											title: "Realtime Responses",
											competitiors: results8,
											rounds: rounds,
											ans: results10
										});
								

							}
							
						});

					}
				});

			}
		});

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
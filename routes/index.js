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
const {
	exit
} = require('process');

/* GET user home page. */
router.get('/', ensureAuthenticated, function (req, res, next) {
	var username = req.user.username;
	db.collection('users').find({
		username: username
	}).toArray((err, results) => {
		if (err) {
			console.log(err);
		} else {
			users = results[0];
			if (users.role == "vptiev1oag") {
				return res.redirect("/admin");
			} else {

				// page render
				db.collection('rounds').find().sort({
					id: 1
				}).toArray((err, results) => {
					if (err) {
						console.log(err);
					} else {
						res.render('index', {
							title: "Home - Star Party, Sri Lanka '21",
							rounds: results
						});
					}
				});
			}
		}
	});
});

/* GET user home page. */
router.get('/upload', ensureAuthenticated, function (req, res, next) {
	var username = req.user.username;
	db.collection('users').find({
		username: username
	}).toArray((err, results) => {
		if (err) {
			console.log(err);
		} else {
			users = results[0];
			if (users.role == "vptiev1oag") {
				return res.redirect("/admin");
			} else {

				// page render
				res.render('upload', {
					title: "Uploads"
				});

			}
		}
	});
});

// competition
router.get('/competition', ensureAuthenticated, function (req, res, next) {
	var round = req.query.round;
	var username = req.user.username;
	req.checkBody('round', 'round field is required');
	if (isNaN(round)) {

		// security log
		var roundobj = {
			time: new Date(),
			record: new Date() + " :- IP: " + requestIp.getClientIp(req) + ", Log: Non-Numeric parameter for the round ID, Value: \"" + req.query.round + "\", Username: " + req.user.username,
			color: "red"
		};
		db.collection('logs').insertOne(roundobj, function (err2) {
			if (err2) throw err2;
			console.log(new Date() + " :- IP: " + requestIp.getClientIp(req) + ", Log: Non-Numeric parameter for the round ID, Value: \"" + req.query.round + "\", Username: " + req.user.username);
			return res.redirect('/');
		});

		var round = parseInt(req.query.round);

	} else {
		var round = parseInt(req.query.round);


		db.collection('rounds').find({
			id: round
		}).count().then((count) => {

			if (count == 0) {

				// security log (unknown round number)

				// security log
				var roundobj = {
					time: new Date(),
					record: new Date() + " :- IP: " + requestIp.getClientIp(req) + ", Log: Unknown but numeric parameter for the round ID, Value: \"" + req.query.round + "\", Username: " + req.user.username,
					color: "red"
				};
				db.collection('logs').insertOne(roundobj, function (err2) {
					if (err2) throw err2;
					console.log(new Date() + " :- IP: " + requestIp.getClientIp(req) + ", Log: Unknown but numeric parameter for the round ID, Value: \"" + req.query.round + "\", Username: " + req.user.username);
					res.location('/');
					res.redirect('/');
				});

			} else {

				// competition


				// gdrive data
				//round data
				db.collection('gdrive').find({
					username: req.user.username,
					round: round
				}).limit(1).toArray((err3, results28) => {
					if (err3) {
						console.log(err3);
					} else {

						var gdrive = results28[0];

						//round data
						db.collection('rounds').find({
							id: round
						}).limit(1).toArray((err3, results2) => {
							if (err3) {
								console.log(err3);
							} else {

								var rounddata = results2[0];

								var start = results2[0].start;
								var end = results2[0].end;
								var currentTime = new Date();

								if (start <= currentTime && currentTime <= end) {

									// question data
									db.collection('questions').find({
										round: round
									}).sort({
										id: 1
									}).toArray((err4, results3) => {
										if (err4) {
											console.log(err4);
										} else {

											var qdata = results3;



											db.collection('answers').find({
												username: req.user.username,
												round: parseInt(round)
											}).toArray((err7, results6) => {
												if (err7) {
													console.log(err7);
												} else {

													var answer = results6;
													console.log(results6);


													db.collection('gdrive').find({
														username: username,
														round: round
													}).count().then((count) => {
														if (count == 0) {
															var link = "";
														} else {
															var link = gdrive.link;
														}

														res.render('competition', {
															round: parseInt(round),
															rounddata: rounddata,
															qdata: qdata,
															answer: answer,
															gdrive: link
														});

													});
												}
											});

										}
									});
								} else if (start > currentTime) {
									req.flash('error', 'The Round has not started yet');
									res.location('/');
									res.redirect('/');
								} else {
									req.flash('error', 'Submission Timeout');
									res.location('/');
									res.redirect('/');
								}

							}
						});

					}
				});










			}
		});

	}
});


// answers - get
/*router.get('/ans-submit', ensureAuthenticated, function (req, res, next) {

	var username = req.user.username;
	var round = parseInt(req.query.round);
	var question = parseInt(req.query.question);
	var answer = req.query.answer;

	db.collection('rounds').find({
		id: round
	}).toArray((err17, results15) => {
		if (err17) {
			console.log(err17);
		} else {

			var start = results15[0].start;
			var end = results15[0].end;
			var currentTime = new Date();

			if (start <= currentTime && currentTime <= end) {



				db.collection('answers').find({
					username: username,
					round: round,
					question: question
				}).count().then((count) => {

					if (count == 0) {

						// db insert
						var ansobj = {
							username: username,
							round: parseInt(round),
							question: parseInt(question),
							answer: answer
						};

						db.collection('answers').insertOne(ansobj, function (err2) {
							if (err2) {
								res.send(" &nbsp;Error");
							} else {
								res.send(" &nbsp;Saved ✓");
								//console.log("R: " + round + ", Q: " + question + ", USER: " + username + " - Answer Added to the Database Successfully");
								//req.flash('success', 'Answer added successfully');
								//res.location('/competition?round=' + round);
								//res.redirect('/competition?round=' + round);
							}
						});

					} else if (count > 0) {

						var updatequery = {
							username: username,
							round: parseInt(round),
							question: parseInt(question)
						};
						var newvalues = {
							$set: {
								answer: answer
							}
						};
						db.collection("answers").updateOne(updatequery, newvalues, function (err5) {
							if (err5) {
								throw err5;
							} else {
								res.send(" &nbsp;Saved ✓");
								//console.log("R: " + round + ", Q: " + question + ", USER: " + username + " - Answer Added to the Database Successfully");
								//req.flash('success', 'Answer added successfully');
								//res.location('/competition?round=' + round);
								//res.redirect('/competition?round=' + round);
							}
						});
					}
				});
			} else if (start > currentTime) {
				req.flash('error', 'The Round has not started yet');
				res.location('/');
				res.redirect('/');
			} else {
				req.flash('error', 'Submission Timeout');
				res.location('/');
				res.redirect('/');
			}
		}
	});
});*/

// answers - post
router.post('/ans-submit', ensureAuthenticated, function (req, res, next) {

	var username = req.user.username;
	var round = parseInt(req.query.round);
	var question = parseInt(req.query.question);
	var answer = req.query.answer;

	req.checkQuery('username', 'username field is required').notEmpty();
	req.checkQuery('round', 'round field is required').notEmpty();
	req.checkQuery('question', 'question field is required').notEmpty();
	req.checkQuery('answer');

	db.collection('rounds').find({
		id: round
	}).toArray((err17, results15) => {
		if (err17) {
			console.log(err17);
		} else {

			var start = results15[0].start;
			var end = results15[0].end;
			var currentTime = new Date();

			if (start <= currentTime && currentTime <= end) {



				db.collection('answers').find({
					username: username,
					round: round,
					question: question
				}).count().then((count) => {

					if (count == 0) {



						db.collection('gdrive').find({
							username: username,
							round: round
						}).count().then((count) => {

							if (count == 0) {
								// db insert
								var ansobj = {
									username: username,
									round: parseInt(round),
									question: parseInt(question),
									answer: answer,
									gdrive: ""
								};

								db.collection('answers').insertOne(ansobj, function (err2) {
									if (err2) {
										res.send(" &nbsp;Error");
									} else {
										res.send(" &nbsp;Saved ✓");
										//console.log("R: " + round + ", Q: " + question + ", USER: " + username + " - Answer Added to the Database Successfully");
										//req.flash('success', 'Answer added successfully');
										//res.location('/competition?round=' + round);
										//res.redirect('/competition?round=' + round);
									}
								});
							} else {


								db.collection('gdrive').find({
									username: username, 
									round: round
								}).limit(1).toArray((err, results123) => {
									if (err) {
										console.log(err);
									} else {

										var gdrive = results123[0].link;


										// db insert
										var ansobj = {
											username: username,
											round: parseInt(round),
											question: parseInt(question),
											answer: answer,
											gdrive: gdrive
										};

										db.collection('answers').insertOne(ansobj, function (err2) {
											if (err2) {
												res.send(" &nbsp;Error");
											} else {
												res.send(" &nbsp;Saved ✓");
											}
										});



									}
								});


							}

						});



					} else if (count > 0) {

						var updatequery = {
							username: username,
							round: parseInt(round),
							question: parseInt(question),
						};
						var newvalues = {
							$set: {
								answer: answer
							}
						};
						db.collection("answers").updateOne(updatequery, newvalues, function (err5) {
							if (err5) {
								throw err5;
							} else {
								res.send(" &nbsp;Saved ✓");
								//console.log("R: " + round + ", Q: " + question + ", USER: " + username + " - Answer Added to the Database Successfully");
								//req.flash('success', 'Answer added successfully');
								//res.location('/competition?round=' + round);
								//res.redirect('/competition?round=' + round);
							}
						});
					}
				});
			} else if (start > currentTime) {
				req.flash('error', 'The Round has not started yet');
				res.location('/');
				res.redirect('/');
			} else {
				req.flash('error', 'Submission Timeout');
				res.location('/');
				res.redirect('/');
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
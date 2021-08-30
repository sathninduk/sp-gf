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
router.get('/msg', ensureAuthenticated, function (req, res, next) {
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
				res.render('msg');

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
				db.collection('rounds').find({
					id: round
				}).limit(1).toArray((err3, results2) => {
					if (err3) {
						console.log(err3);
					} else {

						var rounddata = results2[0];

						var start = results2[0].start;
						var end = results2[0].end;
						var link = results2[0].link;
						var currentTime = new Date();

						if (start <= currentTime && currentTime <= end) {


							res.location(link);
							res.redirect(link);


						} else if (start > currentTime) {
							req.flash('error', 'The Round has not started yet');
							res.location('/msg');
							res.redirect('/msg');
						} else {
							req.flash('error', 'Submission Timeout');
							res.location('/msg');
							res.redirect('/msg');
						}

					}
				});




			}
		});

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
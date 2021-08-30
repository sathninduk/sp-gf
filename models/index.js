var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var db = require('../database');

const AnsSchema = mongoose.Schema({
    answer: String
})

module.exports = mongoose.model('Ans',AnsSchema)
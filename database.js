var mongoose = require('mongoose');

mongoose.connect('mongodb+srv://starparty:quGlVqvlyHjYoyLV@cluster0.4ixac.mongodb.net/starparty?retryWrites=true&w=majority', {
    useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
	useCreateIndex: true
});


var conn = mongoose.connection;
conn.on('connected', function () {
    console.log('successfully connected to the cloud database');
});
conn.on('disconnected', function () {
    console.log('successfully disconnected from the cloud database');
})

conn.on('error', console.error.bind(console, 'database connection error:'));
module.exports = conn;
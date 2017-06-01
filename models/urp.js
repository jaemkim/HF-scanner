var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var urpSchema = new Schema({
    username: String,
    password: String
});

module.exports = mongoose.model('urp', urpSchema);

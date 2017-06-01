var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sidSchema = new Schema({
    id: String, // scanner ID
    loc: String, // symbolic location
    mac: String,
    batt: Number,
    temp: Number,
    advc: Number,
    since: Number,
    alive: { type: Date, default: Date.now }
});

module.exports = mongoose.model('sid', sidSchema);

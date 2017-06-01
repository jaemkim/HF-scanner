var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var epos = new Schema({
    cdate :  { type: Date, default: Date.now  },
    // txpw : Number
    rssi : Number,
    dist : Number,  // from txpw, rssi
    scid : String
});

var ehis = new Schema({
    cdate : { type: Date, default: Date.now  },
    scid : String
});

var bcpSchema = new Schema({
    name: String,
    uuid: String,
    mjid: Number,
    mnid: Number,
    id: String,     // Beacon ID
    scid: String,   // Scanner ID
    mac: String,
    batt: Number,
    temp: Number,
    advc: Number,
    since: Number,
    date : { type: Date, default: Date.now  },
    apos : [ epos ],
    hist: [ ehis ]
    // validate: [arrayLimit, '{PATH} exeeds the limit of 10']
});

function arrayLimit(val) {
    return val.length <= 10;
}

module.exports = mongoose.model('bcp', bcpSchema);

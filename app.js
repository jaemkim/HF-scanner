// serverjs

// [LOAD PACKAGES]
var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var session     = require('express-session');
var mongoose    = require('mongoose');


// [ Set View Engine ]
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// [ CONFIGURE mongoose ]

// CONNECT TO MONGODB SERVER
var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function(){
    // CONNECTED TO MONGODB SERVER
    console.log("Connected to mongod server");
});

mongoose.connect('mongodb://localhost/symloc');

// DEFINE MODEL
var Sid = require('./models/sid');
var Bcp = require('./models/bcp');
var Urp = require('./models/urp');

// [CONFIGURE APP TO USE bodyParser] + Add Seesion
app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
 secret: '@#@$MYSIGN#@$#$',
 resave: false,
 saveUninitialized: true
}));


// [CONFIGURE SERVER PORT]

var port = process.env.PORT || 80;

// [CONFIGURE ROUTER]
var router = require('./routes')(app, Sid, Bcp, Urp);

// [RUN SERVER]
var server = app.listen(port, function(){
 console.log("[Beacon Scanner] Express server has started on port " + port)
});

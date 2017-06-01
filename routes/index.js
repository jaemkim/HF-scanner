module.exports = function(app, Sid, Bcp, Urp)
{
    // Login Password Session
    app.get('/login/:username/:password', function(req, res){
        var sess;
        sess = req.session;
 
        var un = req.params.username;
        var pw = req.params.password;

        var entry = new Urp();
        var result = {};

        Urp.findOne({'username': un}, function(err, entry){
            if(err){
                console.err(err);
                // throw err;
                // USERNAME NOT FOUND
                result["success"] = 0;
                result["error"] = "not found";
                res.json(result);
                return;
            }
            console.log("FIND2:", entry.username);
            console.log("FIND2:", entry.password);
            if(entry.password == pw) {
                result["success"] = 1;
                sess.username = un;
                sess.name = entry.username;
                res.json(result);
            }else{
                result["success"] = 0;
                result["error"] = "incorrect";
                res.json(result);
            }
        });
    });

// setScanner
    app.get('/setScanner/:scanid/:location', function(req, res){
        var sid0 = req.params.scanid;
        var loc0 = req.params.location;

        var entry0 = new Sid();
        var result = {};

        Sid.findOne({'id': sid0}, function(err, entry){
            if(err){
                console.err(err);
                result["success"] = 0;
                result["error"] = "Sid db find error";
                res.json(result);
                return;
            }
            if (entry != null) {
                Sid.update(
                    {'id': sid0 }, 
                    {'loc': loc0 }, 
                    {upsert: true},
                    function(err, out) {
                        if(err) {
                            result['rtCode'] = 'setScanner fail';
                            result['rtMessage'] = 'db error';
                            console.log('error db->', err);
                            console.log('db->', result);
                            res.json(result);
                        }
                        // console.log('normal db->', out);
                });
                result["success"] = 0;
                result["error"] = sid0 + " " + loc0;
                res.json(result);
            } else {
                result["success"] = 1;
                result["error"] = sid0 + " not found";
                res.json(result);
            }
        });
    });

// setBeacon
    app.get('/setBeacon/:major/:minor/:name', function(req, res){
        var mj0 = req.params.major;
        var mn0 = req.params.minor;
        var name0 = req.params.name;

        var entry0 = new Bcp();
        var result = {};

        Bcp.findOne({'mjid': mj0, 'mnid': mn0}, function(err, entry){
            if (entry != null) {
                Bcp.update(
                    {'mjid': mj0, 'mnid' : mn0 }, 
                    {'name': name0 }, 
                    {upsert: true},
                    function(err, out) {
                        if(err) {
                            result['rtCode'] = 'setScanner fail';
                            result['rtMessage'] = 'db error';
                            console.log('error db->', err);
                            console.log('db->', result);
                            res.json(result);
                        }
                        // console.log('normal db->', out);
                });
                result["success"] = 0;
                result["error"] = mj0 + " " + mn0 + "-> " + name0;
                res.json(result);
            } else {
                result["success"] = 1;
                result["error"] = mj0 + " " + mn0 + " not found";
                res.json(result);
            }
        });
    });

    app.get('/logout', function(req, res){
        sess = req.session;
        if(sess.username){
            req.session.destroy(function(err){
                if(err){
                    console.log(err);
                }else{
                    res.redirect('/');
                }
            })
        }else{
            res.redirect('/');
        }
    });

    app.post('/insert', function(req,res,err) {
        var useradd = new Urp({username:req.body.username,password:req.body.password});
        useradd.save(function(err,silence){
            if(err){
                console.err(err);
                throw err;
            }
            console.log("ADD:", silence);
            res.send('success');
        });
    });

    // Main Pages
    app.get('/',function(req,res){
        var sess = req.session;
 
        getSB(Sid, Bcp, req, res);
/*
        res.render('index', {
            title: "SLTS",
            length: 5,
            name: sess.name,
            username: sess.username
        });
*/
    });


    // Update Scanner
    app.post('/scanner/sendAlive', function(req, res){
        console.log("sendAlive: ", req.body);
        var result = { };
        var cDate = new Date();

        req.body.forEach(function(obj) {
        // console.log(obj.scid);
        Sid.update(
            {'id': obj.scid}, 
            {'id': obj.scid, 'alive' : cDate}, 
            {upsert: true},
            function(err, out) {
                if(err) {
                    result['rtCode'] = 'alive fail';
                    result['rtMessage'] = 'db error';
                    console.log('error db->', err);
                    console.log('db->', result);
                    res.json(result);
                }
                // console.log('normal db->', out);
            });
        });
        result['rtCode'] = 'success';
        result['rtMessage'] = 'success';
        // console.log('ok->', result);
        res.json(result);
    });

    // UPDATE Beacon
    app.post('/scanner/sendSignal', function(req, res){
        // console.log('sendSignal->', req.body);
        var result = { };

        var i=0;
        req.body.forEach(function(obj) {
            // console.log('LOOP=', i++, obj);
            i = i+1;
            if (obj.uuid != '3628ba2b-e721-48f6-8a0f58eb26fe96f2') {
            // RECO beacon skip
                console.log(i,':Not HF =', obj.uuid);
            } else {
                var id = obj.uuid + obj.mjid + obj.mnid;
                // console.log(i,':id=', id);
                // console.log('Beacon ID=', id);
                // console.log("count=", i++, obj.mjid, obj.mnid);
                if (obj.type === 'ET') {
                    console.log(i++, "Scanner ET signal");
                    Bcp.update(
                        {'id': id}, 
                        {'mac': obj.mac, 'batt': obj.batt, 'temp': obj.temp,
                             'advc': obj.advc, 'since': obj.sinc, 'alive': new Date()},
                        {upsert: true},
                            function(err, out) {
                            if(err) {
                                result['rtCode'] = 'Signal ET fail';
                                result['rtMessage'] = 'Bcp db update error';
                                console.log('error db->', err);
                                console.log('db->', result);
                                res.json(result);
                            }
                    // console.log('normal db->', out);
                    });
                } else if (obj.type === 'IB') {
                   // caculate accuracy
                   var Accu = CalAccuracy(obj.txpw, obj.rssi);
                   var cDate = new Date();
                   // console.log("V=", Accu, obj.txpw, obj.rssi);
                    //->
                    // Bcp.findOne({'id' : id}).select('scid apos[2].cdate').exec(function(err, entry) {
                    Bcp.findOne({'id' : id}).exec(function(err, entry) {
                        if (err) {
                            result['rtCode'] = 'Signal IB fail';
                            result['rtMessage'] = 'Bcp db find error';
                            console.log('error db->', err);
                            console.log('db->', result);
                            // throw err;
                        }
                        if (entry == null) {
                            console.log("ADD Beacon ID = ", id);
                            bcpsChange(Bcp, obj, id, Accu, cDate);
                        } else {
                            if (entry.scid == obj.scid) {
                                console.log("EQ skip=", id);
                                bcpsNormal(Bcp, obj, id, Accu);
                            } else { 
                                var pDate = entry.apos[entry.apos.length-1].cdate;

                                nSec = (cDate.getTime() - pDate.getTime())/1000;
                                pAccu = nSec * 1.175 + entry.apos[entry.apos.length-1].dist;
                                if (pAccu >= Accu) {
                                    console.log("A=", Accu, "pA=", pAccu, "T=", nSec, " Change");
                                    obj.scid = entry.scid;
                                    bcpsChange(Bcp, obj, id, Accu, cDate);
                                    // console.log("prev >= current");
                                } else {
                                    console.log("A=", Accu, "pA=", pAccu, "T=", nSec, " NOT Change");
                                    bcpsNormal(Bcp, obj, id, Accu);
                                }
                            }
                        }
                    });
        //<-
                } else {
                    console.log(i++,':Illigal Type=', obj.type);
                }
            }
        });
        console.log("LOOP count=", i);
        result['rtCode'] = 'success';
        result['rtMessage'] = 'success';
        // console.log(result);
        res.json(result);
    });

    // GET ALL Scanners
    app.get('/getScanner', function(req,res){
        getS(Sid, req, res);
    });

    // GET ALL Beacons
    app.get('/getBeacon', function(req,res) {
        getB(Bcp, req, res);
    });


    // GET SINGLE Scanner
    app.get('/getScanner/:sid', function(req, res){
        Sid.findOne({_id: req.params.sid}, function(err, sid){
            if(err) return res.status(500).json({error: err});
            if(!sid) return res.status(404).json({error: 'sid not found'});
            res.json(sid);
        })
    });

    // GET SINGLE Beacon
    app.get('/getBeacon/:bid', function(req, res){
        Sid.findOne({_id: req.params.bid}, function(err, bid){
            if(err) return res.status(500).json({error: err});
            if(!sid) return res.status(404).json({error: 'bid not found'});
            res.json(bid);
        })
    });

}

function CalAccuracy(txpw, rssi)
{
    if (rssi == 0)
        return(-1.0);   // can't detemine
    ratio = rssi * 1.0 / txpw;

    if (ratio < 1.0)
    {
        return Math.pow(ratio, 10);
    } else {
        accuracy = (0.89976) * Math.pow(ratio, 7.7095) + 0.111;
        return accuracy;
    }
}

function getSB(Sid, Bcp, req, res)
{
        Sid.find(function(err, sids) {
            if(err) return res.status(500).send({error: 'Sid db failure'});
                Bcp.find().select('name mjid mnid scid').exec(function(err, bcps) {
                    if(err) return res.status(500).send({error: 'Bcp db failure'});
                        res.render('getLists', {
                            title: "List Scanners & Beacons",
                            title1: "get Scanner List",
                            title2: "get Beacon List",
                            lists1: sids,
                            lists2: bcps // ,
                            // name : "getBeacon",
                            // username: "jmkim"
                        });
            // res.json(sids);
                });
            });
}
function getB (Bcp, req, res)
{
        Bcp.find().select('name mjid mnid scid').exec(function(err, bcps) {
            if(err) return res.status(500).send({error: 'database failure'});
            res.render('getBeacon', {
                title: "get Beacon List",
                lists: bcps // ,
                // name : "getBeacon",
                // username: "jmkim"
            });
            // console.log(bcps);
            // res.json(bcps);
        });
}

function getS (Sid, req, res)
{
        Sid.find(function(err, sids) {
            if(err) return res.status(500).send({error: 'database failure'});
            res.render('getScanner', {
                title: "get Scanner List",
                lists: sids,
            });
            // res.json(sids);
        });
}

function bcpsNormal(Bcp, obj, id, Accu) {
    Bcp.update(
        { 'id': id }, 
        { 'uuid': obj.uuid,
          'mjid' : obj.mjid, 
          'mnid' : obj.mnid, 
          'scid' : obj.scid, 
          $push: {
            'apos': {
                $each: [ {'rssi': obj.rssi, 
                          'dist': Accu,
                          'scid': obj.scid} ]
                , $sort: {'cdate': 1}
                , $slice: -3
                }
            }
        },
        {upsert:true},
        function(err, output) {
            if(err) {
                result['rtCode'] = 'Signal IB fail';
                result['rtMessage'] = 'db error';
                console.log('Beacon DB error', output);
                console.log(result);
                res.json(result);
            }
            // console.log('Beacon DB normal', output);
    });
}

function bcpsChange(Bcp, obj, id, Accu, cDate) {
    // console.log("Change=", obj);
    Bcp.update(
        { 'id': id }, 
        { 'uuid': obj.uuid,
          'mjid' : obj.mjid, 
          'mnid' : obj.mnid, 
          'scid' : obj.scid, 
          /*
          $push: {
            'hist': {
                $each: [ {'scid': obj.scid
                          } ]
                }
            },
          $push: {
            'apos': {
                $each: [ {'rssi': obj.rssi, 
                          'dist': Accu,
                          'scid': obj.scid} ]
                , $sort: {'cdate': 1}
                , $slice: -3
                }
            }
        }, */
        $push: {
            'hist': {
                $each: [ {'scid': obj.scid
                          } ]
                },
            'apos': {
                $each: [ {'rssi': obj.rssi, 
                          'dist': Accu,
                          'scid': obj.scid} ]
                , $sort: {'cdate': 1}
                , $slice: -3
                }
            }
        },

        {upsert:true},
        function(err, output) {
            if(err) {
                result['rtCode'] = 'Signal IB fail';
                result['rtMessage'] = 'db error';
                console.log('Beacon DB error', output);
                console.log(result);
                res.json(result);
            }
            // console.log('Beacon DB normal', output);
    });
}

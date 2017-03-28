var Patient = require('./models/patient');
var User = require('./models/user');

var express = require('express');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var app = express();
var bodyParser = require('body-parser');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017');
var secret = "XetionSecret2017";

var port = process.env.PORT || 3001;

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();

// middleware to use for all requests
router.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
    next(); // make sure we go to the next routes and don't stop here
});


router.get('/', function (req, res) {

});


router.route('/patients')

    .post(function (req, res) {

        var patient = new Patient();
        patient.name = req.body.name;
        patient.lastname = req.body.lastname;
        patient.hnumber = req.body.hnumber;
        patient.dni = req.body.dni;
        patient.bdate = req.body.bdate;
        patient.occupation = req.body.occupation;
        patient.gender = req.body.gender;
        patient.marital = req.body.marital;
        patient.address = req.body.address;
        patient.state = req.body.state;
        patient.city = req.body.city;
        patient.zip = req.body.zip;
        patient.insurance = req.body.insurance;
        patient.referred = req.body.referred;
        patient.email = req.body.email;


        // save the patient and check for errors
        patient.save(function (err) {
            if (err)
                res.json({code: 301, message: 'Error', err: err, body: req.body});
            else
                res.json({code: 1, response: patient});
        });

    })

    // get all the patients
    .get(function (req, res) {
        Patient.find(function (err, patients) {
            if (err)
                res.send(err);
            else
                res.json(patients);
        });
    });


router.route('/patients/:hnumber')
// get single patient by history number
    .get(function (req, res) {
        Patient.findOne({hnumber: req.params.hnumber},
            function (err, patient) {
                if (err)
                    res.json({code: 301, response: null});
                else
                    res.json({code: 1, response: patient});
            });
    })

    .put(function (req, res) {
        Patient.findOneAndUpdate({hnumber: req.params.hnumber}, req.body, {new: true},
            function (err, patient) {
                if (err)
                    res.json({code: 301, response: null});
                else
                    res.json({code: 1, response: patient});
            });
    });

router.route('/clinical_data/:hnumber')
    .get(function (req, res) {
        Patient.findOne({hnumber: req.params.hnumber},
            function (err, patient) {
                if (err)
                    res.json({code: 301, response: null});
                else
                    res.json({
                        code: 1,
                        response: {name: patient.name, lastname: patient.lastname, clinical_data: patient.clinical_data}
                    });

            });
    })

    .post(function (req, res) {
        Patient.findOne({hnumber: req.params.hnumber},
            function (err, patient) {
                if (err) {
                    res.json({code: 301, response: null});
                } else {
                    patient.clinical_data = req.body;
                    patient.save();
                    res.json({code: 1, response: patient.clinical_data});
                }
            });
    });

router.route('/evolutions/:hnumber')
    .get(function (req, res) {
        Patient.findOne({hnumber: req.params.hnumber},
            function (err, patient) {
                if (err)
                    res.json({code: 301, response: null});
                else
                    res.json({
                        code: 1,
                        response: {name: patient.name, lastname: patient.lastname, evolutions: patient.evolutions}
                    });
            });
    })

    .post(function (req, res) {
        Patient.findOneAndUpdate({hnumber: req.params.hnumber}, {$push: {evolutions: req.body}}, {new: true},
            function (err, patient) {
                if (err) {
                    res.json({code: 301, response: null});
                } else {
                    res.json({code: 1, response: patient.evolutions});
                }
            });
    });


router.route('/last_patient')
// get last patient added
    .get(function (req, res) {
        Patient.findOne({}, {}, {sort: {'created_at': -1}},
            function (err, patient) {
                if (err)
                    res.json({code: 301, response: null});
                else
                    res.json({code: 1, response: patient});
            });
    });


router.route('/search_patient/:value')
// get single patient by dni
    .get(function (req, res) {
        var query;
        switch (req.query.by) {
            case '-1'://dni
                query = {dni: {"$regex": req.params.value, "$options": "i"}};
                break;
            case '0'://name
                query = {name: {"$regex": req.params.value, "$options": "i"}};
                break;
            case '1'://lastname
                query = {lastname: {"$regex": req.params.value, "$options": "i"}};
                break;
            case '2'://hnumber
                query = {hnumber: req.params.value};
                break;
        }
        Patient.find(query,
            function (err, patient) {
                if (err)
                    res.json({code: 301, response: null});
                else {
                    if (patient.length > 0)
                        res.json({code: 1, response: patient});
                    else
                        res.json({code: 302, response: null});
                }
            });
    });

router.route('/auth')
    .post(function (req, res) {
        User.findOne({username: req.body.username, password: req.body.password},
            function (err, user) {
                if (err)
                    res.json({code: 2, response: null});
                else {
                    if (user) {
                        var token = jwt.sign({username: user.username}, secret);
                        res.json({code: 1, response: {token: token, user: user}});
                    } else
                        res.json({code: 104, response: null});
                }
            });
    });

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(expressJwt({secret: secret}).unless({path: ['/', '/api/auth']}));
app.use(function (err, req, res, next) {
    if (err.name == 'UnauthorizedError') {
        res.json({code: 101, response: null});
    }
});
app.use('/api', router);

app.listen(port);
console.log('Listening on port ' + port);
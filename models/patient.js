var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var patientSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    hnumber: {
        type: Number,
        unique: true,
        required: true
    },
    dni: {
        type: String,
        unique: true,
        required: true
    },
    bdate: {
        type: String,
        required: true
    },
    occupation: String,
    gender: String,
    marital: String,
    address: String,
    state: String,
    city: String,
    zip: Number,
    insurance: String,
    referred: String,
    email: String,
    clinical_data: {
        type: Object,
    },
    evolutions: {
        type: Array
    },
    created_at: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model('Patient', patientSchema);
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let Word = new Schema({
    _id: {
        type: String
    },
    clues: [{
        type: String
    }]
});
module.exports = mongoose.model('Word', Word);
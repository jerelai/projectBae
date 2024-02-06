const mongoose = require('mongoose');

const CharacterSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    idleAnimation: {
        type: String
    },
    voice: {
        type: String
    },
    style: {
        type: String
    },
    happyIndex: {
        type: Number
    },
    background: {
        type: String
    }
});

const Character = mongoose.model('Character', CharacterSchema)

module.exports = Character;

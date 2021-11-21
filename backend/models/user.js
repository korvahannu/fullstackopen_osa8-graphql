const mongoose = require('mongoose');
const valid = require('mongoose-unique-validator');

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique:true,
    minlength:4
  },
  favoriteGenre: {
    type: String,
    required: true
  }
})

schema.plugin(valid);

module.exports = mongoose.model('User', schema);
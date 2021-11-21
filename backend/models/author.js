const mongoose = require('mongoose')
const validator = require('mongoose-unique-validator');

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 4
  },
  born: {
    type: Number,
  },
  authorOf: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref:'Book'
    }
  ]
})

schema.plugin(validator);
module.exports = mongoose.model('Author', schema)
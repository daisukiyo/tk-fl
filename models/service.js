"use strict";

const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

const ServiceSchema = new Schema ({
  title: { type: String, required: true },
  duration: { type: String, required: true },
  description: { type: String, required: true },
  picUrl: { type: String },
  picUrlSq: {type: String }
},
{
  timestamps: true
});

module.exports = mongoose.model('Service', ServiceSchema);

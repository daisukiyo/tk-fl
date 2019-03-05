"use strict";

const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

const mongoosePaginate = require('mongoose-paginate');

mongoosePaginate.paginate.options = {
  limit: 3
}

const ServiceSchema = new Schema ({
  title: { type: String, required: true },
  duration: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true},
  avatarUrl: { type: String, required: true },
  picUrl: { type: String},
  picUrlSq: {type: String}
},
{
  timestamps: true
});

ServiceSchema.plugin(mongoosePaginate)

ServiceSchema.index({ title: 'text', duration: 'text', price: 'text', description: 'text' });

module.exports = mongoose.model('Service', ServiceSchema);
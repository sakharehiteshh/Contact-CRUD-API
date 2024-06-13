const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phoneNumbers: [{ type: String, required: true }],
  image: { data: Buffer, contentType: String }
});

contactSchema.index({ phoneNumbers: 1 }, { unique: true });

module.exports = mongoose.model('Contact', contactSchema);

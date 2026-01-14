const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  size: { type: String, default: '', trim: true },
  color: { type: String, default: '', trim: true },
  available: { type: Boolean, default: true },
}, { _id: true });

const productSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  line: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  subcategory: { type: String, default: '', trim: true },

  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
  price: { type: Number, required: true, min: 0 },

  description: { type: String, default: '', trim: true, maxlength: 2000 },

  images: { type: [String], default: [] },
  variants: { type: [variantSchema], default: [] },

  tags: { type: [String], default: [] },
}, { timestamps: true });

productSchema.index({ name: 1, tags: 1, line: 1, category: 1 });

module.exports = mongoose.model('Product', productSchema);

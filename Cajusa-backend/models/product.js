const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
  {
    size: { type: String, required: true, trim: true },
    color: { type: String, required: true, trim: true },
    quantity: { type: Number, default: 0, min: 0 },
  },
  {
    _id: true,
    id: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

variantSchema.virtual("available").get(function () {
  return this.quantity > 0;
});

const productSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    line: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    subcategory: { type: String, required: true, trim: true },

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    price: { type: Number, required: true, min: 0 },

    description: { type: String, required: true, trim: true, maxlength: 2000 },

    images: { type: [{ type: String, trim: true }], default: [] },
    variants: { type: [variantSchema], default: [] },

    tags: {
      type: [{ type: String, trim: true, lowercase: true }],
      default: [],
    },
  },
  {
    timestamps: true,
    id: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.index({ name: 1, tags: 1, line: 1, category: 1 });

module.exports = mongoose.model("Product", productSchema);

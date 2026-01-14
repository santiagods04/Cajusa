const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const UnauthorizedError = require("../errors/UnauthorizedError");
const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Casa", trim: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, default: "", trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, default: "Cundinamarca", trim: true },
    country: { type: String, default: "Colombia", trim: true },
    postalCode: { type: String, default: "", trim: true },
    notes: { type: String, default: "", trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, required: true },
    qty: { type: Number, required: true, min: 1, default: 1 },
    variant: {
      size: { type: String, default: "", trim: true },
      color: { type: String, default: "", trim: true },
    },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
    },
    nickname: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: [/^[a-z0-9._-]+$/, "Nickname inválido"],
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^\+\d{8,15}$/, "Teléfono inválido"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (v) => validator.isEmail(v),
        message: "Email inválido",
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    favorites: [{ type: mongoose.Schema.Types.ObjectId, default: [] }],
    cart: { type: [cartItemSchema], default: [] },
    addresses: { type: [addressSchema], default: [] },
  },
  { timestamps: true }
);

userSchema.statics.findUserByCredentials = function findUserByCredentials(
  email,
  password
) {
  return this.findOne({ email })
    .select("+password")
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError("Correo o contraseña incorrectos");
      }
      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          throw new UnauthorizedError("Correo o contraseña incorrectos");
        }
        return user;
      });
    });
};

module.exports = mongoose.model("User", userSchema);

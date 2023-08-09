const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");

const userSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },

    password: {
      type: String,
      default: "",
    },

    otp: {
      type: Number,
      default: 0,
    },

    login_otp: {
      type: Number,
      default: 0,
    },

    is_admin: {
      type: Boolean,
      default: false,
    },

    privateKey: {
      type: String,
      default: "",
    },

    publicKey: {
      type: String,
      default: "",
    },
    walletAddress: {},

    is_withdraw: {
      type: Boolean,
      default: false,
    },
    referral_of: {
      type: mongoose.Schema.Types.ObjectId,
    },
    last_checkout_date: Date,
    product_commission: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

// hash password before saving to database

function validateUser(user) {
  const schema = Joi.object({
    full_name: Joi.string().min(3).max(30).required(),
    email: Joi.string().required(),
    password: Joi.string().min(3).max(30).required(),
    referral_of: Joi.string().allow(""),
  });
  return schema.validate(user);
}

module.exports = {
  User,
  validateUser,
};

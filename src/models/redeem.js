const mongoose = require("mongoose");

const redeemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    points: {
      type: Number,
      required: true,
    },
    request_status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Redeem = mongoose.model("Redeem", redeemSchema);

module.exports = {
  Redeem,
};

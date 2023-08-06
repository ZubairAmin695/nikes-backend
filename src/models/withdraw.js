const mongoose = require("mongoose");

const withdrawSchema = new mongoose.Schema(
  {
    is_approved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Withdraw = mongoose.model("Withdraw", withdrawSchema);

module.exports = {
  Withdraw,
};

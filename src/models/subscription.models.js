const mongoose = require("mongoose");

const subscriptionScheme = new mongoose.Schema(
  {
    subscriber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.Model("Subscription", subscriptionScheme);

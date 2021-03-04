const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// One to Many relationship

const opts = { toJSON: { virtuals: true } };

const reviewSchema = new Schema(
  {
    name: String,
    body: String,
    rating: Number,
    campground: {
      type: Schema.Types.ObjectId,
      ref: "Campground",
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
  opts
);

reviewSchema.virtual("stringDate").get(function () {
  return String(this.createdAt).substring(3, 15);
});

module.exports = mongoose.model("Review", reviewSchema);

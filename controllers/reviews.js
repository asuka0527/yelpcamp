const Review = require("../models/review");
const Campground = require("../models/campground");

// Create a review
module.exports.createReview = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  // save the currentUser as the author of the review
  review.author = req.user._id;
  // res.send(req.body);
  campground.reviews.push(review);
  await campground.save();
  await review.save();
  req.flash("success", "Created new review!");
  res.redirect(`/campgrounds/${campground._id}`);
};

// DELETE a review
// (MONGO) $pull - The $pull operator removes from an existing array all instances of a value or values that match a specified condition.
module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  // to get specific reviewId from review's array of campground
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Successfully deleted review");
  res.redirect(`/campgrounds/${id}`);
};

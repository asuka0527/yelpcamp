const Review = require("../models/review");
const Campground = require("../models/campground");

module.exports.createReview = async (req, res) => {
  const campground = await Campground.findById(req.params.id).populate(
    "reviews"
  );

  // const review = new Review({
  //   name: req.user.username,
  //   rating: req.body.review.rating,
  //   body: req.body.review.body,
  // });

  campground.reviews.map((review) => console.log(review.name));
  console.log("USERNMAE", req.user.username);
  const al = campground.reviews.find(
    (review) => review.name === req.user.username
  );

  if (al) {
    req.flash("error", "Already reviewed!");
    return res.redirect(`/campgrounds/${campground._id}`);
  }

  const review = new Review(req.body.review);
  console.log("ALREADY REVIEWD", al);
  review.name = req.user.username;
  review.author = req.user._id;

  campground.reviews.push(review);
  console.log(campground);
  await review.save();
  await campground.save();
  req.flash("success", "Created new review!");
  res.redirect(`/campgrounds/${campground._id}`);
};

// Create a review
// module.exports.createReview = async (req, res) => {
//   const campground = await Campground.findById(req.params.id);
//   console.log(req.user.username);

//   console.log(campground.reviews);

//   const review = new Review({
//     name: req.user.username,
//     ...req.body.review,
//   });
//   review.author = req.user._id;
//   res.send(req.body);
//   campground.reviews.push(review);
//   await campground.save();
//   await review.save();

//   req.flash("success", "Created new review!");
//   res.redirect(`/campgrounds/${campground._id}`);

//   // if (campground) {
//   //   const alreadyReviewed = campground.reviews.map((review) => {
//   //     review.name === req.user.username;
//   //     console.log(review.name, req.user.username);
//   //   });

//   //   if (alreadyReviewed) {
//   //     res.status(404);
//   //     throw new Error("Product already reviewed");
//   //   } else {
//   //     const review = new Review({
//   //       name: req.user.username,
//   //       ...req.body.review,
//   //     });

//   //     // save the currentUser as the author of the review
//   //     review.author = req.user._id;
//   //     // res.send(req.body);
//   //     campground.reviews.push(review);
//   //     await campground.save();
//   //     await review.save();

//   //     req.flash("success", "Created new review!");
//   //     res.redirect(`/campgrounds/${campground._id}`);
//   //   }
//   // }
// };

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

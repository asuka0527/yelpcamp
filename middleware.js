const { campgroundSchema, reviewSchema } = require("./schemas");
const Campground = require("./models/campground");
const Review = require("./models/review");

const ExpressError = require("./utils/ExpressError");

module.exports.isLoggedIn = (req, res, next) => {
  // isAuthenticated() -method from passport that checks whether there is a logged in user
  // store the url they are requesting!
  // console.log(req.path, req.originalUrl);
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in");
    return res.redirect("/login");
  }
  next();
};

// info store is the session
//  REQ.USER {
//   _id: 6037544e87c508212e3f4183,
//   username: 'tofu',
//   email: 'tofu@gmail.com',
//   __v: 0
// }

// MIDDLE that checks wether the user is the Author of campground
module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You dont have permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

// Vaildate Campground Middleware selected routes
module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    // add to make it to the actual route
    next();
  }
};

// Vaildate Review Middleware selected routes
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

// MIDDLE that checks wether the user is the Author of review
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You dont have permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

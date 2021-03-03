const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError");
const passport = require("passport");
const LocalStrategy = require("passport-local");
// requires the model with Passport-Local Mongoose plugged in
const User = require("./models/user");
//ROUTES
const usersRoutes = require("./routes/users");
const campgroundsRoutes = require("./routes/campgrounds");
const reviewsRoutes = require("./routes/reviews");

//SECURITY
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");

// using MongoStore to store session insteat of default MemoryStore
const MongoDBStore = require("connect-mongo")(session);

const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware to all routes
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "public")));

const secret = process.env.SECRET || "thisshouldbeabettersecret!";

const store = new MongoDBStore({
  url: dbUrl,
  secret: secret,
  touchAfter: 24 * 60 * 60, //24hrs lazy session saving
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e);
});

// SESSIONS & FLASH
const sessionConfig = {
  store,
  // renaming the session name of our cookies to throw off potential hackers that want to extract our cookies by knowing the default name connect.sid
  name: "session",
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    // Security purposes:
    httpOnly: true,
    // secure:true, // only works with https(httpSecure)
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());

//SECURITY
app.use(mongoSanitize());
app.use(helmet());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com",
  "https://api.tiles.mapbox.com",
  "https://api.mapbox.com",
  "https://kit.fontawesome.com",
  "https://cdnjs.cloudflare.com",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com",
  "https://stackpath.bootstrapcdn.com",
  "https://api.mapbox.com",
  "https://api.tiles.mapbox.com",
  "https://fonts.googleapis.com",
  "https://use.fontawesome.com",
];
const connectSrcUrls = [
  "https://api.mapbox.com",
  "https://*.tiles.mapbox.com",
  "https://events.mapbox.com",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/dh5ndnomm/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

// PASSPORT
app.use(passport.initialize());
// for persistent login sessions (comes after session)
app.use(passport.session());

// authenticate() Generates a function that is used in Passport's LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));
//  use static serialize and deserialize of model for passport session support
// serializeUser() Generates a function that is used by Passport to serialize users into the session
passport.serializeUser(User.serializeUser());
// deserializeUser() Generates a function that is used by Passport to deserialize users into the session
passport.deserializeUser(User.deserializeUser());

// Global variables that can we accessed anywhere
app.use((req, res, next) => {
  // console.log(req.session);
  res.locals.currentUser = req.user;
  // Flash Middleware
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");

  next();
});

// app.get("/fakeUser", async (req, res) => {
//   const user = await new User({
//     email: "asuka@gmail.com",
//     username: "asuka",
//   });
//   // register(user, password, cb) Convenience method to register a new user instance with a given password. Checks if username is unique
//   const newUser = await User.register(user, "asuka");
//   res.send(newUser);
// });

app.get("/", (req, res) => {
  res.render("home");
});

// Router
app.use("/", usersRoutes);
app.use("/campgrounds", campgroundsRoutes);
app.use("/campgrounds/:id/reviews", reviewsRoutes);

/////////////////////////
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found"), 404);
});

// Error handling middleware
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  if (!err.message) err.message = "OH NO SOMETHING WENT WRONG";
  res.status(statusCode).render("error", { err });
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Serving on port ${port}`);
});

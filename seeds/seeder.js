const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_URL, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
    });

    console.log(`MongoDB Connected : ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

// pick random title and descriptor from an array in the seedHelpers
const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  try {
    await Campground.deleteMany();

    for (let i = 0; i < 50; i++) {
      // randomly pick a city
      const random1000 = Math.floor(Math.random() * 1000);
      const price = Math.floor(Math.random() * 20) + 10;

      const camp = new Campground({
        author: "603f05099151e816e8d206e9",
        location: `${cities[random1000].city}, ${cities[random1000].state}`,
        geometry: {
          coordinates: [
            cities[random1000].longitude,
            cities[random1000].latitude,
          ],
          type: "Point",
        },
        title: `${sample(descriptors)} ${sample(places)}`,
        images: [
          {
            url:
              "https://res.cloudinary.com/dh5ndnomm/image/upload/v1614585739/YelpCamp/nipcol4fyp7xfbl9bbqg.jpg",
            filename: "YelpCamp/tbrrzg9pkkiwwlvcbgyr",
          },
          {
            url:
              "https://res.cloudinary.com/dh5ndnomm/image/upload/v1614585738/YelpCamp/e294dvsjqe2pwqtxt5r7.jpg",
            filename: "YelpCamp/eheuxh3v9adgjznlciie",
          },
        ],
        description:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa mollitia sequi reprehenderit explicabo optio eos quas dolore, neque accusamus quidem sint, sunt illum vitae, molestiae autem reiciendis incidunt laudantium nemo!",
        price,
      });
      await camp.save();
      process.exit();
    }
  } catch (error) {
    console.log(`${error}`);
    process.exit(1);
  }
};

seedDB();

// seedDB().then(() => {
//   mongoose.connection.close();
// });

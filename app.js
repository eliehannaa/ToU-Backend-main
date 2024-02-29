const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/AuthRoute");
// const productRoutes = require('./routes/productRoute');
const TravRoutes = require("./routes/TravelerRoute");
const AdminRoute = require("./routes/AdminRoute");
const ClientRoute = require("./routes/ClientRoute");
const cookieParser = require("cookie-parser");
const { requireAuth, checkUser } = require("./middleware/Middleware");
const cors = require("cors");
// const bodyParser = require('body-parser');
const Admin = require("./models/Admin");
const app = express();
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

// middleware
app.use(express.static("public"));
app.use(express.json()); //takes any json obj that comes with a req and parses it for us so we can use it.
app.use(cookieParser());

// database connection
mongoose.set("strictQuery", false);
mongoose.connect(
  "mongodb+srv://eliehanna:eliehanna@atlascluster.brleq7g.mongodb.net/test",
  { useNewUrlParser: true, useUnifiedTopology: true }
);
// mongoose.connect("mongodb+srv://vickenk8:lF4PbJg2PKGljdDM@cluster0.3zxbi6j.mongodb.net/test", {useNewUrlParser: true, useUnifiedTopology: true});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "exp://192.168.1.18:19001/");
  // res.setHeader("Access-Control-Allow-Origin", "exp://10.21.158.37:19001/");

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(cors());

// routes
app.use(authRoutes);
app.use(TravRoutes);
app.use(AdminRoute);
app.use(ClientRoute);

// const newAdmin = new Admin({
//   username: "admin",
//   password: "admin",
// });

// newAdmin
//   .save()
//   .then((savedAdmin) => {
//     console.log("Admin created successfully:", savedAdmin);
//   })
//   .catch((error) => {
//     console.error("Error creating admin:", error.message);
//   });

app.listen(5000, function () {
  console.log("Express server listening on port 5000");
});

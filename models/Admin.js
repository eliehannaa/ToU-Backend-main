const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  password: {
    type: String,
  },
  type: {
    type: String,
    default: "Admin",
  },
});

adminSchema.pre("save", async function (next) {
  if (!this.isNew) {
    return next();
  }
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

adminSchema.statics.login = async function (email, password) {
  console.log("called login ", email, password);
  if (email !== "admin") {
    return false;
  }
  //   const admin = await Admin.findOne({ email });
  const admin = {
    // _id: new ObjectId("65b3e5a36c2bb526998300b3"),
    username: "admin",
    password: "$2b$10$1XPEhgLpKxrdu1tN0xec3unKRyW8xYdrdLIHZ27vec8TrSA6BgAqC",
    type: "Admin",
    __v: 0,
  };
  console.log(admin);
  console.log("hereeee");
  if (!admin) return false;
  console.log("i found the email/username");
  const auth = await bcrypt.compare(password, admin.password);
  if (auth) return admin;
  else {
    throw Error("incorrect password");
  }
};

const Admin = mongoose.model("admin", adminSchema);

module.exports = Admin;

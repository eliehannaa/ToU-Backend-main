//these are handle functions
const Traveler = require("../models/Traveler");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");
// const bodyParser = require('body-parser');

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "donotreply.tou@gmail.com", // ToU email address
    pass: "xwbm qwxy rnzv brps", // your app password
  },
});

const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

aws.config.update({
  secretAccessKey: process.env.ACCESS_SECRET,
  accessKeyId: process.env.ACCESS_KEY,
  region: process.env.REGION,
});

const BUCKET = process.env.BUCKET;
const s3 = new aws.S3();

/*The `tsignup_post` function first logs the body of the HTTP request to the console.
It then creates a new instance of the `multer` middleware to handle file uploads, specifying that files should be stored in a specific S3 bucket and assigning 
them unique filenames based on the current date and original filename.
The function then calls the `upload.fields` method to handle the file uploads, passing in an array of objects containing the names of the expected files. 
If an error occurs during the upload process, the function sends an HTTP response with a status code of 400 and a message indicating the error.
If the upload is successful, the function extracts the user's personal information from the `otherData` property of the request body and checks whether a user or 
traveler with the same email address already exists in the database. If so, the function sends an HTTP response with a status code of 406 and a message indicating 
that the email already exists.
If the email is unique, the function creates a new `Traveler` object with the provided personal information and assigns the uploaded files to the `cv` and `identification` 
properties of the object. The function then saves the new `Traveler` object to the database.
The function then composes an email message acknowledging receipt of the user's application and sends it using the configured `transporter` object. Finally, the function 
sends an HTTP response with a status code of 200 and the newly created `Traveler` object. If an error occurs at any point during the execution of the function, the function 
logs the error to the console and sends an HTTP response with a status code of 400 and a message indicating that the registration could not be completed.*/
module.exports.tsignup_post = async (req, res) => {
  console.log(req.body);
  const date = Date.now();
  const upload = multer({
    storage: multerS3({
      bucket: BUCKET,
      s3: s3,
      acl: "public-read",
      key: (req, file, cb) => {
        const filename = date + "-" + file.originalname;
        cb(null, filename);
      },
    }),
  });
  upload.fields([{ name: "cv" }, { name: "id" }])(req, res, async (err) => {
    if (err) {
      console.log(err);
      return res.status(400).send({ error: err.message });
    }
    try {
      //   console.log(req);
      //   console.log("BT");
      //   console.log(req.body);
      //   console.log("EEE");
      //   console.log(req.body.otherData);
      console.log("TEST");
      //   console.log(JSON.stringify(req.body.otherData));
      //   const data = await JSON.parse(req.body.otherData);
      // Accessing the "otherData" value from the _parts array
      const cvObject = req.body._parts.find(([key]) => key === "cv")[1];
      const idObject = req.body._parts.find(([key]) => key === "id")[1];
      // const cvObject = JSON.parse(cvString);
      // console.log(cvObject.data);
      const otherDataString = req.body._parts.find(
        ([key]) => key === "otherData"
      )[1];

      // Parsing the JSON string to get an object
      const otherDataObject = JSON.parse(otherDataString);

      //   // Accessing the "name" and "lastname" properties
      //   const name1 = otherDataObject.name;
      //   const lastname1 = otherDataObject.lastname;

      //   console.log("name1:"); // Output: JJee
      //   console.log(name1); // Output: JJee
      //   console.log(lastname1); // Output: DFrt
      const data = {
        name: otherDataObject.name,
        lastname: otherDataObject.lastname,
        gender: otherDataObject.gender,
        email: otherDataObject.email,
        phone_number: otherDataObject.phone_number,
        nationality: otherDataObject.nationality,
      };

      const user = await User.findOne({ email: data.email });
      const trav = await Traveler.findOne({ email: data.email });
      if (user || trav) {
        return res.status(406).send({ error: "Email already exists" });
      }
      const { name, lastname, gender, phone_number, nationality, email } = data;
      const traveler = await Traveler.create({
        name,
        lastname,
        gender,
        phone_number,
        nationality,
        email,
        approved: false,
      });
      traveler.cv = cvObject.data; // req.files["cv"][0].key;
      traveler.identification = idObject.data; // = req.files["id"][0].key;
      console.log("TEST4");
      await traveler.save();
      console.log("TEST5");
      let mailOptions = {
        from: "donotreply.tou@gmail.com", // ToU email address
        to: email, // recipient's email address
        subject: "ToU Traveler Registration",
        text:
          "Dear " +
          name +
          " " +
          lastname +
          ",\n\n" +
          "Thank you for applying to be a traveler with ToU. Your application has been received and will be reviewed by our team. You will be notified by email once your application has been approved.\n\n" +
          "Best regards,\n" +
          "ToU Team",
      };
      console.log("TEST6");
      await new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
          console.log("TEST7");
          if (error) {
            console.log(error);
            console.log("TEST8");
            reject(error);
          } else {
            console.log("Email sent: " + info.response);
            console.log("TEST9");
            console.log(link);
            resolve();
          }
        });
      });
      res.status(200).send(traveler);
    } catch (err) {
      console.log(err);
      res.status(400).send({ result: false });
    }
  });
};

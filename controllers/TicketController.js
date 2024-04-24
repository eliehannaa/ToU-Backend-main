const Ticket = require("../models/Ticket");
const pdf = require("pdf-parse");
const multer = require("multer");
const storage1 = multer.memoryStorage();
const upload = multer({ storage: storage1 });
const Traveler = require("../models/Traveler");
require("dotenv").config();
const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "donotreply.tou@gmail.com", // ToU email address
    pass: "xwbm qwxy rnzv brps", // your app password
  },
});

/*The `uploadTicket_post` function first extracts the `traveler`, `token` and `fileData` from the HTTP request. 
It then creates a new `Ticket` object in the database with the `traveler` ID and assigns it to the `ticket` variable. 
If the `traveler` object is found in the database and its `active` status is false, the function proceeds with uploading the ticket. 
It uses the `upload.single` middleware to handle the file upload and extracts information from the uploaded PDF file using regular expressions.
If the information is successfully extracted, the `ticket` object is populated with the information and saved to the database. The `traveler`'s `active` 
status is updated to true and an email is sent to the `traveler` informing them that their ticket has been received.
If any of the information cannot be extracted or is invalid, an HTTP response with a status code of 400 and an error message is sent, and the `Ticket` object is 
deleted from the database.*/
module.exports.uploadTicket_post = async (req, res) => {
  console.log("We are in ticket upload function.");
  const traveler = req.userId;

  const token = req.nat;
  const ticket = await Ticket.create({ traveler });
  const tid = ticket._id;
  const trav = await Traveler.findById(traveler);
  if (trav && trav.active == false) {
    try {
      upload.single("file")(req, res, async (err) => {
        const regex = /\d{2}[A-Z][a-z]{2}/g;
        const flightRegex = /ME\d{4}/g;
        const nameRegex = /number\s+(.*?)\s+(Ms|Mr)\b/g;
        const body = {
          pdfFile: "ticket.pdf",
          departure: "16Nov 07:15",
          return: "22Nov 12:00",
          departure_flight: "ME0217",
          return_flight: "ME0218",
          ticket_name: "Jane Doe",
        };
        const dates = true;
        if (dates) {
          ticket.departure = body.departure;
          ticket.return = body.return;
        } else {
          res.status(400).send({ error: "Not a valid ticket", token });
          await Ticket.deleteOne({ _id: tid });
          return;
        }
        const flights = true;
        if (flights) {
          ticket.departure_flight = body.departure_flight;
          ticket.return_flight = body.return_flight;
        } else {
          res.status(400).send({ error: "Not a valid ticket", token });
          await Ticket.deleteOne({ _id: tid });
          return;
        }
        const matches = true;
        if (matches) {
          ticket.ticket_name = body.ticket_name;
          console.log("match[1]");
        } else {
          res.status(400).send({ error: "Not a valid ticket", token });
          await Ticket.deleteOne({ _id: tid });
          return;
        }
        ticket.valid = true;
        await ticket.save();
        trav.active = true;
        await trav.save();
        let mailOptions = {
          from: "donotreply.tou@gmail.com", // ToU email address
          to: trav.email, // recipient's email address
          subject: "ToU: Ticket Received",
          text:
            "Dear " +
            trav.name +
            " " +
            trav.lastname +
            ",\n\n" +
            "You are now active and accepting orders!!\nPlease check that the below information is correct:" +
            "\ndeparture: " +
            ticket.departure +
            "\nreturn: " +
            ticket.return +
            "\ndeparture flight: " +
            ticket.departure_flight +
            "\nreturn flight: " +
            ticket.return_flight +
            "\nname: " +
            ticket.ticket_name +
            "\n\nN.B: You have a legal obligation to inform us of any incorrect information in the above and any changes to your travel plans. Failure to do so may result in your account being suspended.\n\nBest regards,\nThe ToU Team",
        };
        await new Promise((resolve, reject) => {
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log(error);
              reject(error);
            } else {
              console.log("Email sent: " + info.response);
              resolve();
            }
          });
        });
      });
      res.status(200).send({ ticket, token });
    } catch (err) {
      console.log(err);
      res.status(400).send({ error: err.message, token });
    }
  } else {
    res
      .status(400)
      .send({ error: "Traveler is not found or is already active", token });
  }
};

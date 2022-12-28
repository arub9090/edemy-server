import bcrypt from "bcrypt";
import asyncHandler from "express-async-handler";
const User = require("../models/user");
import jwt from "jsonwebtoken";
import AWS from "aws-sdk";
import { nanoid } from "nanoid";

const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  apiVersion: process.env.AWS_API_VERSION,
};

const SES = new AWS.SES(awsConfig);

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  //form validation
  if (!name || !email || !password) {
    return res.status(400).send("Please put all the fields correctly");
  }
  // user check
  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).send("Email already Exists");
  }

  // hash the password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  //create and put the user to the Database
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  // veryfy the user if that created susscessfully

  if (user) {
    res.status(201).json({ message: "user Creation was fine!" });
  } else {
    res.status(400).send("Invalid user Data");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).exec();

  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, { httpOnly: true });

    user.password = undefined;

    res.status(200).json(user);
  } else {
    return res.status(400).send("Invalid Ceredtials");
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "SignOut was successful" });
  } catch (err) {
    res.status(400).send("Logout wasn't successful");
  }
});

export const currentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password").exec();
    if (user) {
      return res.json({ ok: true });
    } else {
      return res.json({ ok: false });
    }
  } catch (err) {
    console.log(err);
  }
};

export const sendTestEmail = async (req, res) => {
  const params = {
    Source: process.env.EMAIL_FROM,
    Destination: {
      ToAddresses: ["arifrubayet10@gmail.com"],
    },
    ReplyToAddresses: [process.env.EMAIL_FROM],
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `
            <html>
              <h1>Reset password link</h1>
              <p>Please use the following link to reset your password</p>
            </html>
          `,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Password reset Link HERE",
      },
    },
  };

  const emailSent = SES.sendEmail(params).promise();
  emailSent
    .then((data) => {
      console.log(data);
      res.json({ ok: true });
    })
    .catch((err) => {
      console.log(err);
    });
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    //console.log(email);
    const shortCode = nanoid(6).toUpperCase();
    const user = await User.findOneAndUpdate(
      { email },
      { passwordResetCode: shortCode }
    );
    if (!user) return res.status(400).send("user Not found");
    //send the email if all is good.
    const params = {
      Source: `EDEMY-APP! <${process.env.EMAIL_FROM}>`,
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `
              <html>
                <h1>Reset password Using the following Code.</h1>
                <h2 style="color:red">${shortCode}</h2>
                <p>Please use the following Code to reset your password on edemy.com</p>
                <i>Please Don't Share this code to anyone, EDEMY never asks for this code by phone or Email </i>
              </html>
            `,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "Edemy Password Reset Code",
        },
      },
    };

    const emailSent = SES.sendEmail(params).promise();
    emailSent
      .then((data) => {
        console.log(data);
        res.json({ ok: true });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    //console.table({email, code, newPassword})

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const user = await User.findOneAndUpdate(
      { email, passwordResetCode: code },
      { password: hashedPassword, passwordResetCode: "" }
    ).exec();
    if (!user) {
      res.status(400).send("Password Reset was not successfull! Sorry!");
    } else {
      res.json({ ok: true });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .send("Error Reseting the Password! Try again Please!");
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
};

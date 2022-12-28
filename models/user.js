import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Please Add Name Here"],
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      required: [true, "Please Add Eamil Here"],
    },
    password: {
      type: String,
      required: [true, "You must need a password"],
      min: 6,
      max: 64,
    },
    picture: {
      type: String,
      default: "/avatar.png",
    },
    role: {
      type: [String],
      default: ["Subscriber"],
      enum: ["Subscriber", "Instructor", "Admin"],
    },
    stripe_account_id: "",
    stripe_seller: "",
    stripeSession: {},
    passwordResetCode: {
      data: String,
      default: "",
    },
    courses: [{ type: ObjectId, ref: "Course" }],
  },
  { timestamps: true }
);
module.exports = mongoose.model("User", userSchema);

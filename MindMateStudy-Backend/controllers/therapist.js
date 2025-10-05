import Therapist from "../models/therapist.js";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";

const getToken = (user, exp = null) => {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      name: user.name,
      type: user.type,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: exp ? exp : "100d",
    }
  );
};

// ✅ Therapist Signup
export const therapistSignup = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    password,
    virtualFee,
    specialization,
    experience,
    gender,
    type,
  } = req.body;

  if (
    !name ||
    !email ||
    !phone ||
    !password ||
    !virtualFee ||
    !specialization ||
    !experience ||
    !gender ||
    !type
  ) {
    return res
      .status(400)
      .json({ status: false, message: "All fields are required" });
  }

  const isTherapistExist = await Therapist.findOne({
    $or: [{ email }, { phone }],
  });
  if (isTherapistExist) {
    return res
      .status(400)
      .json({ status: false, message: "Therapist Already Exists" });
  }

  const user = await Therapist.create({
    name,
    email,
    phone,
    password,
    virtualFee,
    specialization,
    experience,
    gender,
    type,
  });

  const token = getToken(user);

  res.status(201).json({
    status: true,
    message: "Signup successful!",
    token,
    user
  });
});

// ✅ Therapist Login
export const therapistLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await Therapist.findOne({ email });
  if (!user)
    return res
      .status(404)
      .json({ status: false, message: "Therapist Not Found" });

  const isMatch = await user.isPasswordCorrect(password);
  if (!isMatch)
    return res
      .status(400)
      .json({ status: false, message: "Invalid Credentials" });

  const token = getToken(user);
  res.status(200).json({ status: true, message: "Login successful!", token , user });
});

// ✅ Get Therapist by ID
export const getTherapist = asyncHandler(async (req, res) => {
  const therapist = await Therapist.findById(req.params.id);
  if (!therapist) {
    return res
      .status(404)
      .json({ status: false, message: "Therapist Not Found" });
  }
  res.status(200).json({ status: true, therapist });
});

// ✅ Get All Therapists
export const getAllTherapists = asyncHandler(async (req, res) => {
  const therapists = await Therapist.find({ type: "Therapist" });
  if (!therapists || therapists.length === 0) {
    return res
      .status(404)
      .json({ status: false, message: "No Therapists Found" });
  }
  res.status(200).json({ status: true, therapists });
});

export const getAllMentors = asyncHandler(async (req, res) => {
  const therapists = await Therapist.find({ type: "Mentor" });
  if (!therapists || therapists.length === 0) {
    return res
      .status(404)
      .json({ status: false, message: "No Therapists Found" });
  }
  res.status(200).json({ status: true, therapists });
});


// ✅ Update Therapist by ID
export const updateTherapist = asyncHandler(async (req, res) => {
  const therapistId = req.params.id;
  const {
    name,
    phone,
    virtualFee,
    specialization,
    experience,
    gender,
    type,
    password, // optional
  } = req.body;

  const therapist = await Therapist.findById(therapistId);
  if (!therapist) {
    return res.status(404).json({ status: false, message: "Therapist not found" });
  }

  // Update allowed fields
  if (name) therapist.name = name;
  if (phone) therapist.phone = phone;
  if (virtualFee) therapist.virtualFee = virtualFee;
  if (specialization) therapist.specialization = specialization;
  if (experience) therapist.experience = experience;
  if (gender) therapist.gender = gender;
  if (type) therapist.type = type;
  if (password) therapist.password = password; // will be hashed automatically by pre-save hook

  const updatedTherapist = await therapist.save();

  res.status(200).json({
    status: true,
    message: "Therapist profile updated successfully!",
    therapist: updatedTherapist,
  });
});

import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js"; 

// SIGNUP
export const signup = async (req, res) => {
  try {
    const { fullName, email, password, bio } = req.body;

    if (!fullName || !email || !password || !bio) {
      return res.status(400).json({ success: false, message: "Missing details" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Account already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullname: fullName,
      email,
      password: hashedPassword,
      bio,
    });

    await newUser.save();

    const token = generateToken(newUser._id);

    res.status(201).json({
      success: true,
      userData: {
        _id: newUser._id,
        fullname: newUser.fullname,
        email: newUser.email,
        bio: newUser.bio,
        profilePic: newUser.profilePic,
      },
      token,
      message: "Account created successfully",
    });
  } catch (error) {
    console.log("Signup Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userData = await User.findOne({ email });
    if (!userData) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, userData.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(userData._id);

    res.json({
      success: true,
      userData: {
        _id: userData._id,
        fullname: userData.fullname,
        email: userData.email,
        bio: userData.bio,
        profilePic: userData.profilePic,
      },
      token,
      message: "Login successful",
    });
  } catch (error) {
    console.log("Login Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// CHECK AUTH
export const checkAuth = (req, res) => {
  res.json({ success: true, user: req.user });
};

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const { profilePic, bio, fullName } = req.body;
    const userId = req.user._id;

    let updates = { bio, fullname: fullName };
    if (profilePic) {
      const upload = await cloudinary.uploader.upload(profilePic);
      updates.profilePic = upload.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true }).select("-password");

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.log("UpdateProfile Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

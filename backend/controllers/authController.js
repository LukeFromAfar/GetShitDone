const User = require('../models/UserSchema');
const Note = require('../models/NoteSchema')
const bcrypt = require('bcrypt');
const createJWT = require('../utils/createJWT');
const createCookie = require('../utils/createCookie');

const saltRounds = parseInt(process.env.SALT_ROUNDS);

const authController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log("Login request:", req.body);
      const user = await User.findOne({ email });
      if (!user) {
        console.log("User not found");
        return res.status(404).send({ msg: "User not found" });
      }

      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (isPasswordCorrect) {
        const jwtToken = await createJWT(user.name, email, user.role);
        createCookie(res, jwtToken);
        console.log("User logged in:", user);
        res.status(202).send({ msg: "User found", user: user });
      } else {
        console.log("Invalid credentials");
        res.status(400).send({ msg: "Invalid credentials" });
      }
    } catch (error) {
      console.log("Error logging in:", error);
      res.status(500).send({ msg: "Error logging in" });
    }
  },

  register: async (req, res) => {
    try {
      const { email, password, repeatPassword, name } = req.body;
      console.log("Register request:", req.body);
      
      if (password !== repeatPassword) {
        console.log("Passwords do not match");
        return res.status(400).send({ msg: 'Passwords do not match' });
      }

      // Only check if user with this email exists
      let user = await User.findOne({ email });
      if (user) {
        console.log("User with this email already exists");
        return res.status(400).send({ msg: 'User with this email already exists' });
      }

      // Create the new user (with name, not username)
      user = new User({ 
        name, 
        email, 
        password 
      });
      
      const salt = await bcrypt.genSalt(saltRounds);
      user.password = await bcrypt.hash(password, salt);
      
      await user.save();

      const jwtToken = await createJWT(name, email, user.role);
      createCookie(res, jwtToken);
      
      console.log("User registered successfully:", user);
      res.status(201).send({ msg: 'User registered', user: user });
    } catch (error) {
      console.log("Error registering user:", error);
      res.status(500).send({ msg: "Error registering user" });
    }
  },

  logout: async (req, res) => {
    try {
      res.clearCookie('jwt', {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: 'strict'
      });
      console.log("User logged out");
      res.status(200).send({ msg: "Logged out successfully" });
    } catch (error) {
      console.log("Error logging out:", error);
      res.status(500).send({ msg: "Error logging out" });
    }
  },

  getUser: async (req, res) => {
    try {
      console.log("Fetching user:", req.user);
      const user = await User.findById(req.user._id).select('-password');
      console.log("User fetched:", user);
      if (!user) {
        return res.status(404).send({ msg: "User not found" });
      }
      res.status(200).send(user);
    } catch (error) {
      console.log("Error fetching user:", error);
      res.status(500).send({ msg: "Error fetching user" });
    }
  },

  deleteAccount: async (req, res) => {
    try {
      console.log("Deleting user account:", req.user._id);
      
      // First delete all user's notes
      const deleteNotesResult = await Note.deleteMany({ user: req.user._id });
      console.log(`Deleted ${deleteNotesResult.deletedCount} notes`);
      
      // Then delete the user
      const user = await User.findByIdAndDelete(req.user._id);
      
      if (!user) {
        return res.status(404).send({ msg: "User not found" });
      }
      
      // Clear the authentication cookie
      res.clearCookie('jwt', {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: 'strict'
      });
      
      console.log("User account deleted successfully");
      res.status(200).send({ msg: "Account deleted successfully" });
    } catch (error) {
      console.log("Error deleting account:", error);
      res.status(500).send({ msg: "Error deleting account" });
    }
  }
};

module.exports = authController;
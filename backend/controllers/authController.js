const User = require("../models/UserSchema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { parse } = require("dotenv");

const createJWT = require("../utils/createJWT");
const createCookie = require("../utils/createCookie");


const saltRounds = parseInt(process.env.SALT_ROUNDS);

const authController = {
  login: async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (isPasswordCorrect) {
            const jwtToken = await createJWT(email, user.role, user.name);
            createCookie(res, jwtToken);
            return res.status(200).json({ message: "Login successful" });
        } else {
            return res.status(400).json({ message: "Incorrect password" });
        }
    } catch (error) {
      console.log(error);
    }
  },

  register: async (req, res) => {
    try {
        const { name, email, password, repeatPassword } = req.body;

        if (password !== repeatPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        user = new User({ name, email, password });
        const salt = await bcrypt.genSalt(saltRounds);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const jwtToken = await createJWT(email, user.role, user.name);
        createCookie(res, jwtToken);

        res.status(200).json({ message: "Registration successful", user: user });
    } catch (error) {
        console.log(error);
        res.status(500).send({ msg: "Error registering user" });
    }
  },
  logout: async (req, res) => {
    try {
      res.clearCookie("jwt");
      return res.status(200).json({ message: "Logout successful" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error logging out" });
    }
  },
};

module.exports = authController;
const BaseError = require("../errors/base.error");
const userModel = require("../models/user.model");
const mailService = require("../service/mail.service");
const jwt = require('jsonwebtoken');

class AuthController {
  async generateToken(req, res, next) {
    try {
      const { userId } = req.body;
      console.log('Received userId:', userId); // Debug log

      if (!userId) {
        throw BaseError.BadRequest("User ID is required");
      }

      // Verify user exists
      const user = await userModel.findById(userId);
      if (!user) {
        throw BaseError.NotFound("User not found");
      }

      const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      
      console.log('Generated token successfully'); // Debug log
      res.status(200).json({ token });
    } catch (error) {
      console.error('Token generation error:', error); // Debug log
      next(error);
    }
  }
  async login(req, res, next) {
    try {
      const { email } = req.body;
      const existUser = await userModel.findOne({ email });
      if (existUser) {
        await mailService.sendOtp(existUser.email);
        return res.status(200).json({ email: existUser.email });
      }
      const newUser = await userModel.create({ email });
      await mailService.sendOtp(newUser.email);
      res.status(200).json({ email: newUser.email });
    } catch (error) {
      next(error);
    }
  }
  async verify(req, res, next) {
    try {
      const { email, otp } = req.body;
      const result = await mailService.verifyOtp(email, otp);
      if (result) {
        const user = await userModel.findOneAndUpdate(
          { email },
          { isVerified: true }
        );
        res.status(200).json({ user });
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();

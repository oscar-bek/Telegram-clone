class AuthController {
	async login(req, res, next) {
		const { email } = req.body
		res.json({ email })
	}
	async verify(req, res, next) {
    console.log("Verify called with body:", req.body);
		const { email, otp } = req.body
		res.json({ email, otp })
	}
}

module.exports = new AuthController()
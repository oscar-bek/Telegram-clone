const BaseError = require('../errors/base.error')
const { CONST } = require('../lib/constants')
const messageModel = require('../models/message.model')
const userModel = require('../models/user.model')
const mailService = require('../service/mail.service')

class UserController {
	// [GET]
	async getContacts(req, res, next) {
		try {
			const userId = req.user._id

			const contacts = await userModel.findById(userId).populate('contacts')
			const allContacts = contacts.contacts.map(contact => contact.toObject())

			for (const contact of allContacts) {
				const lastMessage = await messageModel
					.findOne({
						$or: [
							{ sender: userId, receiver: contact._id },
							{ sender: contact._id, receiver: userId },
						],
					})
					.populate({ path: 'sender' })
					.populate({ path: 'receiver' })
					.sort({ createdAt: -1 })

				contact.lastMessage = lastMessage
			}

			return res.status(200).json({ contacts: allContacts })
		} catch (error) {
			next(error)
		}
	}
	
  async getMessages(req, res, next) {
	try {
		const currentUserId = req.user._id  // Current user ID
		const { contactId } = req.params     // Tanlangan contact ID
		
		console.log('Current User ID:', currentUserId)
		console.log('Contact ID:', contactId)
		
		// FAQAT current user va contact orasidagi xabarlar
		const messages = await messageModel
			.find({
				$or: [
					// Current user yuborgan, contact qabul qilgan
					{ sender: currentUserId, receiver: contactId },
					// Contact yuborgan, current user qabul qilgan
					{ sender: contactId, receiver: currentUserId },
				],
			})
			.populate({ path: 'sender', select: 'email _id' })
			.populate({ path: 'receiver', select: 'email _id' })
			.sort({ createdAt: 1 }) // Vaqt bo'yicha tartiblash

		console.log('Topilgan xabarlar soni:', messages.length)
		console.log('Xabarlar:', messages.map(m => ({
			id: m._id,
			sender: m.sender._id,
			receiver: m.receiver._id,
			text: m.text
		})))

		// Contact tomondan yuborilgan va current user tomonidan o'qilmagan xabarlarni "o'qilgan" deb belgilash
		await messageModel.updateMany(
			{ 
				sender: contactId, 
				receiver: currentUserId, 
				status: CONST.SENT 
			}, 
			{ status: CONST.READ }
		)

		res.status(200).json({ messages })
	} catch (error) {
		console.error('getMessages xatolik:', error)
		next(error)
	}
}

	// [POST]
	async createMessage(req, res, next) {
		try {
			const userId = req.user._id
			const createdMessage = await messageModel.create({ ...req.body, sender: userId })
			const newMessage = await messageModel
				.findById(createdMessage._id)
				.populate({ path: 'sender' })
				.populate({ path: 'receiver' })

			const receiver = await userModel.findById(createdMessage.receiver)
			const sender = await userModel.findById(createdMessage.sender)

			res.status(201).json({ newMessage, sender, receiver })
		} catch (error) {
			next(error)
		}
	}

  async messageRead(req, res, next) {
	try {
		const { messages } = req.body
		console.log('=== messageRead API ===')
		console.log('Kelgan xabarlar soni:', messages.length)
		
		const allMessages = []

		for (const message of messages) {
			console.log(`Xabar ${message._id} ni READ ga o'zgartirish...`)
			
			const updatedMessage = await messageModel
				.findByIdAndUpdate(
					message._id, 
					{ status: CONST.READ }, 
					{ new: true }
				)
				.populate({ path: 'sender', select: 'email _id' })
				.populate({ path: 'receiver', select: 'email _id' })
			
			if (updatedMessage) {
				console.log(`Xabar ${message._id} muvaffaqiyatli yangilandi:`, updatedMessage.status)
				allMessages.push(updatedMessage)
			} else {
				console.log(`Xabar ${message._id} topilmadi!`)
			}
		}

		console.log('Barcha yangilangan xabarlar soni:', allMessages.length)
		res.status(200).json({ messages: allMessages })
	} catch (error) {
		console.error('messageRead xatolik:', error)
		next(error)
	}
}

	async createContact(req, res, next) {
		try {
			const { email } = req.body
			const userId = req.user._id
			const user = await userModel.findById(userId)
			const contact = await userModel.findOne({ email })
			if (!contact) throw BaseError.BadRequest('User with this email does not exist')

			if (user.email === contact.email) throw BaseError.BadRequest('You cannot add yourself as a contact')

			const existingContact = await userModel.findOne({ _id: userId, contacts: contact._id })
			if (existingContact) throw BaseError.BadRequest('Contact already exists')

			await userModel.findByIdAndUpdate(userId, { $push: { contacts: contact._id } })
			const addedContact = await userModel.findByIdAndUpdate(contact._id, { $push: { contacts: userId } }, { new: true })
			return res.status(201).json({ contact: addedContact })
		} catch (error) {
			next(error)
		}
	}
	async createReaction(req, res, next) {
		try {
			const { messageId, reaction } = req.body
			const updatedMessage = await messageModel.findByIdAndUpdate(messageId, { reaction }, { new: true })
			res.status(201).json({ updatedMessage })
		} catch (error) {
			next(error)
		}
	}
	async sendOtp(req, res, next) {
		try {
			const { email } = req.body
			const existingUser = await userModel.findOne({ email })
			if (existingUser) throw BaseError.BadRequest('User with this email already exists')
			await mailService.sendOtp(email)
			res.status(200).json({ email })
		} catch (error) {
			next(error)
		}
	}

	// [PUT]
	async updateProfile(req, res, next) {
		try {
			const user = req.user
			await userModel.findByIdAndUpdate(user._id, req.body)
			res.status(200).json({ message: 'Profile updated successfully' })
		} catch (error) {
			next(error)
		}
	}
	async updateMessage(req, res, next) {
		try {
			const { messageId } = req.params
			const { text } = req.body
			const updatedMessage = await messageModel.findByIdAndUpdate(messageId, { text }, { new: true })
			res.status(200).json({ updatedMessage })
		} catch (error) {
			next(error)
		}
	}
	async updateEmail(req, res, next) {
		try {
			const { email, otp } = req.body
			const result = await mailService.verifyOtp(email, otp)
			if (result) {
				const userId = req.user._id
				console.log(userId)
				const user = await userModel.findByIdAndUpdate(userId, { email }, { new: true })
				res.status(200).json({ user })
			}
		} catch (error) {
			next(error)
		}
	}

	// [DELETE]
	async deleteUser(req, res, next) {
		try {
			const userId = req.user._id
			await userModel.findByIdAndDelete(userId)
			res.status(200).json({ message: 'User deleted successfully' })
		} catch (error) {
			next(error)
		}
	}
	async deleteMessage(req, res, next) {
		try {
			const { messageId } = req.params
		const deletedMessage = await messageModel.findByIdAndDelete(messageId)
			res.status(200).json({ deletedMessage })
		} catch (error) {
			next(error)
		}
	}
}

module.exports = new UserController()


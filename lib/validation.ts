import { z } from 'zod'

export const emailSchema = z.object({
	email: z.string().email({ message: '이메일 주소가 유효하지 않습니다. 다시 확인해 주세요.' }),
})

export const oldEmailSchema = z
	.object({ oldEmail: z.string().email({ message: '이메일 주소가 유효하지 않습니다. 다시 확인해 주세요.' }) })
	.merge(emailSchema)

export const otpSchema = z
	.object({ otp: z.string().min(6, { message: '일회용 비밀번호는 6자리여야 합니다.' }) })
	.merge(emailSchema)

export const messageSchema = z.object({
	text: z.string().min(1, { message: '메시지는 비워둘 수 없습니다.' }),
	image: z.string().optional(),
})

export const profileSchema = z.object({
	firstName: z.string().min(2),
	lastName: z.string().optional(),
	bio: z.string().optional(),
})

export const confirmTextSchema = z.object({ confirmText: z.string() }).refine(data => data.confirmText === 'DELETE', {
	message: '삭제를 확인하려면 DELETE를 입력해야 합니다.',
	path: ['confirmText'],
})
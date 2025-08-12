import { FaTelegram } from 'react-icons/fa'
import StateAuth from './_components/state'
import Social from './_components/social'

import { ModeToggle } from '@/components/shared/mode-toggle'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'

const Page = async () => {
	const session = await getServerSession(authOptions)
	if (session) return redirect('/')
	return (
		<div className='bg-background flex flex-col items-center justify-center h-screen'>
		<div className='container max-w-md w-full h-screen flex justify-center items-center flex-col space-y-4'>
			<FaTelegram size={120} className='text-blue-500' />
		<div className='flex items-center gap-2'>
				<h1 className='text-4xl font-bold'>Telegram</h1>
				<ModeToggle />
			</div>
			<StateAuth />
			<Social />
		</div>
		</div>

	)
}

export default Page
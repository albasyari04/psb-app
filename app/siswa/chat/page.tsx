import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import ChatSiswaClient from './ChatSiswaClient'

export default async function ChatSiswaPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'siswa') {
    redirect('/login')
  }

  return <ChatSiswaClient />
}

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import AdminChatDetailClient from '../AdminChatDetailClient'

interface PageParams {
  params: Promise<{ threadId: string }>
}

export default async function AdminChatDetailPage({ params }: PageParams) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    redirect('/login')
  }

  const { threadId } = await params
  return <AdminChatDetailClient threadId={threadId} />
}

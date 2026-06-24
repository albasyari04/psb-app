export type SenderRole = 'siswa' | 'admin'
export type ThreadStatus = 'open' | 'closed'

export interface ChatMessage {
  id: string
  thread_id: string
  sender_role: SenderRole
  sender_id: string
  sender_nama: string
  message: string
  attachment_url: string | null
  attachment_nama: string | null
  is_read: boolean
  created_at: string
}

export interface ChatThread {
  id: string
  siswa_id: string
  siswa_nama: string
  siswa_avatar_url: string | null
  last_message: string | null
  last_message_at: string | null
  last_sender_role: SenderRole | null
  unread_by_admin: number
  unread_by_siswa: number
  status: ThreadStatus
  created_at: string
  updated_at: string
}

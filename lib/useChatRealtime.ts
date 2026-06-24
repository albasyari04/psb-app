'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import type { ChatMessage } from '@/types/chat'

// Client Supabase khusus browser (anon key) — hanya untuk subscribe Realtime.
// Insert/update tetap lewat API route (service role) agar konsisten dengan
// pola auth & validasi yang sudah ada di project ini.
let browserClient: ReturnType<typeof createClient> | null = null
function getBrowserSupabase() {
  if (!browserClient) {
    browserClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return browserClient
}

/**
 * Subscribe ke pesan baru pada satu thread chat tertentu secara realtime.
 * Memanggil onInsert setiap kali ada baris baru masuk ke chat_messages
 * dengan thread_id yang sesuai.
 */
export function useChatRealtime(threadId: string | null, onInsert: (msg: ChatMessage) => void) {
  const callbackRef = useRef(onInsert)
  callbackRef.current = onInsert

  useEffect(() => {
    if (!threadId) return

    const supabase = getBrowserSupabase()
    const channel = supabase
      .channel(`chat-thread-${threadId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `thread_id=eq.${threadId}` },
        (payload) => {
          callbackRef.current(payload.new as ChatMessage)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [threadId])
}

/**
 * Subscribe ke SEMUA perubahan chat_threads (dipakai admin untuk inbox list
 * supaya unread count & last_message ter-update realtime tanpa refresh).
 */
export function useChatThreadsRealtime(onChange: () => void) {
  const callbackRef = useRef(onChange)
  callbackRef.current = onChange

  useEffect(() => {
    const supabase = getBrowserSupabase()
    const channel = supabase
      .channel('chat-threads-list')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_threads' },
        () => callbackRef.current()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])
}

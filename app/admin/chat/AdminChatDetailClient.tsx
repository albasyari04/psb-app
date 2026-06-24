'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from './admin-chat-detail.module.css'
import { useChatRealtime } from '@/lib/useChatRealtime'
import type { ChatMessage, ChatThread } from '@/types/chat'

/* ════════════════════════════════════════════════════════════════
   ICONS
   ════════════════════════════════════════════════════════════════ */
function IconBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}
function IconMore() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="12" cy="19" r="1.6" />
    </svg>
  )
}
function IconPaperclip() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
    </svg>
  )
}
function IconSend() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3.4 20.4l17.45-7.48a1 1 0 000-1.84L3.4 3.6a1 1 0 00-1.39 1.05L3.6 11.7a1 1 0 00.9.78l8.95.97-8.95.97a1 1 0 00-.9.78l-1.6 7.05a1 1 0 001.4 1.15z" />
    </svg>
  )
}
function IconDoubleCheck() {
  return (
    <svg width="14" height="10" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 8 5 12 11 4" />
      <polyline points="9 8 13 12 23 1" />
    </svg>
  )
}
function IconDocument() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}
function IconChatBubble() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}
function IconClose() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
function IconAlert() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}
function IconLock() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  )
}
function IconUnlock() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 019.9-1" />
    </svg>
  )
}

/* ════════════════════════════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════════════════════════════ */
function formatTime(iso: string): string {
  try { return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) } catch { return '' }
}
function formatDateLabel(iso: string): string {
  try {
    const d = new Date(iso)
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(today.getDate() - 1)
    const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()
    if (sameDay(d, today)) return 'Hari ini'
    if (sameDay(d, yesterday)) return 'Kemarin'
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
  } catch { return '' }
}
function groupByDate(messages: ChatMessage[]): { dateLabel: string; items: ChatMessage[] }[] {
  const groups: { dateLabel: string; items: ChatMessage[] }[] = []
  for (const msg of messages) {
    const label = formatDateLabel(msg.created_at)
    const last = groups[groups.length - 1]
    if (last && last.dateLabel === label) last.items.push(msg)
    else groups.push({ dateLabel: label, items: [msg] })
  }
  return groups
}
function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')
}

export default function AdminChatDetailClient({ threadId }: { threadId: string }) {
  const router = useRouter()
  const [thread, setThread] = useState<ChatThread | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [attachment, setAttachment] = useState<{ url: string; nama: string } | null>(null)
  const [uploadingAttachment, setUploadingAttachment] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback((smooth = true) => {
    requestAnimationFrame(() => {
      const el = listRef.current
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
    })
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/chat/${threadId}`)
        const json = await res.json()
        if (res.ok) {
          setThread(json.data.thread)
          setMessages(json.data.messages)
          scrollToBottom(false)
        } else {
          router.push('/admin/chat')
        }
      } catch (e) {
        console.error('Gagal memuat detail chat:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [threadId, router, scrollToBottom])

  useChatRealtime(threadId, (msg) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev
      return [...prev, msg]
    })
    scrollToBottom()
  })

  useEffect(() => {
    if (!loading) scrollToBottom(false)
  }, [loading, scrollToBottom])

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB.')
      return
    }
    setUploadingAttachment(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/admin/chat/upload', { method: 'POST', body: formData })
      const json = await res.json()
      if (res.ok) setAttachment({ url: json.data.url, nama: file.name })
      else alert(json.error || 'Gagal mengunggah lampiran.')
    } catch (err) {
      console.error('Gagal upload lampiran:', err)
      alert('Gagal mengunggah lampiran.')
    } finally {
      setUploadingAttachment(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleSend() {
    const text = draft.trim()
    if (!text && !attachment) return
    setSending(true)
    const optimisticId = `optimistic-${Date.now()}`
    const optimisticMsg: ChatMessage = {
      id: optimisticId,
      thread_id: threadId,
      sender_role: 'admin',
      sender_id: 'me',
      sender_nama: 'Anda',
      message: text || `Mengirim lampiran: ${attachment?.nama}`,
      attachment_url: attachment?.url ?? null,
      attachment_nama: attachment?.nama ?? null,
      is_read: false,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimisticMsg])
    setDraft('')
    setAttachment(null)
    scrollToBottom()

    try {
      const res = await fetch(`/api/admin/chat/${threadId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          attachment_url: optimisticMsg.attachment_url,
          attachment_nama: optimisticMsg.attachment_nama,
        }),
      })
      const json = await res.json()
      if (res.ok) {
        setMessages((prev) => prev.map((m) => (m.id === optimisticId ? json.data : m)))
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
        alert(json.error || 'Gagal mengirim balasan.')
      }
    } catch (err) {
      console.error('Gagal mengirim balasan:', err)
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
    } finally {
      setSending(false)
    }
  }

  async function handleToggleStatus() {
    if (!thread) return
    const newStatus = thread.status === 'open' ? 'closed' : 'open'
    setMenuOpen(false)
    try {
      const res = await fetch(`/api/admin/chat/${threadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const json = await res.json()
      if (res.ok) setThread(json.data)
    } catch (e) {
      console.error('Gagal mengubah status chat:', e)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isClosed = thread?.status === 'closed'
  const grouped = groupByDate(messages)

  return (
    <div className={styles.shell}>
      {/* ══ HEADER ══════════════════════════════════════════════════ */}
      <header className={styles.header}>
        <Link href="/admin/chat" className={styles.backBtn} aria-label="Kembali">
          <IconBack />
        </Link>
        <div className={styles.headerAvatar}>
          {thread?.siswa_avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thread.siswa_avatar_url} alt={thread.siswa_nama} className={styles.headerAvatarImg} />
          ) : (
            initials(thread?.siswa_nama ?? 'S')
          )}
        </div>
        <div className={styles.headerText}>
          <p className={styles.headerName}>{thread?.siswa_nama ?? 'Memuat...'}</p>
          <p className={styles.headerStatus}>{isClosed ? 'Percakapan ditutup' : 'Santri terdaftar'}</p>
        </div>
        <div className={styles.dropdownWrap}>
          <button type="button" className={styles.headerMenuBtn} onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
            <IconMore />
          </button>
          {menuOpen && (
            <div className={styles.dropdownMenu}>
              <button type="button" className={styles.dropdownItem} onClick={handleToggleStatus}>
                {isClosed ? <IconUnlock /> : <IconLock />}
                {isClosed ? 'Buka kembali chat' : 'Tutup percakapan'}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ══ MESSAGE LIST ════════════════════════════════════════════ */}
      {loading ? (
        <div className={styles.skeletonWrap}>
          {[40, 60, 50, 70, 45].map((w, i) => (
            <div key={i} className={styles.skelBubble} style={{ width: `${w}%`, alignSelf: i % 2 === 0 ? 'flex-end' : 'flex-start' }} />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className={styles.emptyWrap}>
          <div className={styles.emptyIconWrap}><IconChatBubble /></div>
          <p className={styles.emptyTitle}>Belum ada pesan</p>
          <p className={styles.emptyText}>Mulai percakapan dengan {thread?.siswa_nama ?? 'santri ini'}.</p>
        </div>
      ) : (
        <div className={styles.messageList} ref={listRef}>
          {grouped.map((group) => (
            <div key={group.dateLabel}>
              <div className={styles.dateDivider}>
                <span className={styles.dateDividerText}>{group.dateLabel}</span>
              </div>
              {group.items.map((msg) => {
                const isAdmin = msg.sender_role === 'admin'
                return (
                  <div key={msg.id} className={`${styles.msgRow} ${isAdmin ? styles.msgRowAdmin : styles.msgRowSiswa}`} style={{ marginTop: '0.5rem' }}>
                    {!isAdmin && (
                      <div className={styles.msgAvatarSmall}>
                        {thread?.siswa_avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={thread.siswa_avatar_url} alt="" className={styles.msgAvatarImg} />
                        ) : (
                          initials(msg.sender_nama)
                        )}
                      </div>
                    )}
                    <div className={`${styles.bubbleCol} ${isAdmin ? styles.bubbleColAdmin : styles.bubbleColSiswa}`}>
                      {!isAdmin && <span className={styles.bubbleSenderName}>{msg.sender_nama}</span>}
                      <div className={`${styles.bubble} ${isAdmin ? styles.bubbleAdmin : styles.bubbleSiswa}`}>
                        {msg.attachment_url && (
                          <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className={styles.bubbleAttachment}>
                            <IconDocument />
                            <span>{msg.attachment_nama || 'Lampiran'}</span>
                          </a>
                        )}
                        {msg.message}
                      </div>
                      <div className={styles.bubbleMeta}>
                        <span className={styles.bubbleTime}>{formatTime(msg.created_at)}</span>
                        {isAdmin && <span className={styles.bubbleCheckIcon}><IconDoubleCheck /></span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}

      {isClosed && (
        <div className={styles.closedBanner}>
          <IconAlert />
          <span>Percakapan ini ditutup. Balasan akan otomatis membuka kembali chat.</span>
        </div>
      )}

      {attachment && (
        <div className={styles.attachPreview}>
          <span className={styles.attachPreviewIcon}><IconDocument /></span>
          <span className={styles.attachPreviewName}>{attachment.nama}</span>
          <button type="button" className={styles.attachPreviewRemove} onClick={() => setAttachment(null)} aria-label="Hapus lampiran">
            <IconClose />
          </button>
        </div>
      )}

      <div className={styles.inputBar}>
        <input ref={fileInputRef} type="file" hidden onChange={handleFileSelect} accept="image/*,.pdf,.doc,.docx" />
        <button
          type="button"
          className={styles.attachBtn}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingAttachment || sending}
          aria-label="Lampirkan file"
        >
          <IconPaperclip />
        </button>
        <div className={styles.textareaWrap}>
          <textarea
            className={styles.textarea}
            placeholder="Tulis balasan..."
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending}
          />
        </div>
        <button
          type="button"
          className={styles.sendBtn}
          onClick={handleSend}
          disabled={sending || uploadingAttachment || (!draft.trim() && !attachment)}
          aria-label="Kirim balasan"
        >
          <IconSend />
        </button>
      </div>
    </div>
  )
}

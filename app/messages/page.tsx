'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import BottomNav from '../components/BottomNav'
import { supabase } from '../../lib/supabase'

type Profile = {
  id: string
  username: string | null
  avatar_url: string | null
  bio: string | null
}

type ChatItem = {
  id: string
  conversation_id: string
  user: Profile
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

type Message = {
  id: string
  conversation_id: string
  sender_id: string
  content: string | null
  message_type: string
  media_url: string | null
  reply_to: string | null
  created_at: string
  edited_at?: string | null
}

export default function MessagesPage() {
  const [myId, setMyId] = useState('')
  const [myProfile, setMyProfile] = useState<Profile | null>(null)

  const [users, setUsers] = useState<Profile[]>([])
  const [chats, setChats] = useState<ChatItem[]>([])
  const [messages, setMessages] = useState<Message[]>([])

  const [activeChat, setActiveChat] = useState<ChatItem | null>(null)

  const [activeTab, setActiveTab] = useState<'primary' | 'requests'>('primary')

  const [search, setSearch] = useState('')
  const [text, setText] = useState('')

  const [loading, setLoading] = useState(true)
  const [chatLoading, setChatLoading] = useState(false)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  // LOAD LOGGED-IN USER AND PROFILES
  const loadUsers = useCallback(async () => {
    try {
      setError('')

      const { data: authData, error: authError } =
        await supabase.auth.getUser()

      if (authError) throw authError

      if (!authData.user) {
        throw new Error('Please login to ChitPix.')
      }

      const currentUserId = authData.user.id
      setMyId(currentUserId)

      const { data: myData, error: myError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, bio')
        .eq('id', currentUserId)
        .maybeSingle()

      if (myError) throw myError

      setMyProfile(myData)

      const { data, error: usersError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, bio')
        .neq('id', currentUserId)
        .order('created_at', { ascending: false })

      if (usersError) throw usersError

      setUsers(data || [])
    } catch (err: any) {
      console.error('DM users error:', err)
      setError(err.message || 'Users load avvaledu.')
    }
  }, [])

  // LOAD PRIMARY INBOX
  const loadInbox = useCallback(async () => {
    if (!myId) return

    try {
      const { data: memberships, error: memberError } =
        await supabase
          .from('conversation_members')
          .select('conversation_id')
          .eq('user_id', myId)

      if (memberError) throw memberError

      const conversationIds = [
        ...new Set((memberships || []).map(item => item.conversation_id))
      ]

      if (conversationIds.length === 0) {
        setChats([])
        return
      }

      const { data: conversations, error: conversationError } =
        await supabase
          .from('conversations')
          .select('id, conversation_type, created_at, updated_at')
          .in('id', conversationIds)
          .eq('conversation_type', 'direct')

      if (conversationError) throw conversationError

      const directIds = (conversations || []).map(item => item.id)

      if (directIds.length === 0) {
        setChats([])
        return
      }

      const { data: members, error: otherMemberError } =
        await supabase
          .from('conversation_members')
          .select('conversation_id, user_id')
          .in('conversation_id', directIds)

      if (otherMemberError) throw otherMemberError

      const otherUserIds = [
        ...new Set(
          (members || [])
            .filter(item => item.user_id !== myId)
            .map(item => item.user_id)
        )
      ]

      if (otherUserIds.length === 0) {
        setChats([])
        return
      }

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, bio')
        .in('id', otherUserIds)

      if (profileError) throw profileError

      const { data: messageRows, error: messageError } =
        await supabase
          .from('messages')
          .select('id, conversation_id, sender_id, content, message_type, created_at')
          .in('conversation_id', directIds)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })

      if (messageError) throw messageError

      const chatList: ChatItem[] = otherUserIds
        .map(userId => {
          const member = (members || []).find(
            item => item.user_id === userId
          )

          if (!member) return null

          const profile = (profiles || []).find(
            item => item.id === userId
          )

          if (!profile) return null

          const latestMessage = (messageRows || []).find(
            item => item.conversation_id === member.conversation_id
          )

          return {
            id: userId,
            conversation_id: member.conversation_id,
            user: profile,
            lastMessage: latestMessage?.content ||
              (latestMessage?.message_type === 'image'
                ? '📷 Photo'
                : latestMessage?.message_type === 'video'
                ? '🎬 Video'
                : latestMessage?.message_type === 'audio'
                ? '🎤 Voice message'
                : 'Start a conversation'),
            lastMessageTime: latestMessage?.created_at || '',
            unreadCount: 0
          }
        })
        .filter((item): item is ChatItem => item !== null)

      chatList.sort((a, b) =>
        new Date(b.lastMessageTime || 0).getTime() -
        new Date(a.lastMessageTime || 0).getTime()
      )

      setChats(chatList)
    } catch (err: any) {
      console.error('DM inbox error:', err)
      setError(err.message || 'Inbox load avvaledu.')
    }
  }, [myId])

  // INITIAL LOAD
  useEffect(() => {
    let mounted = true

    const start = async () => {
      setLoading(true)
      await loadUsers()
      if (mounted) setLoading(false)
    }

    start()

    return () => {
      mounted = false
    }
  }, [loadUsers])

  // LOAD CHATS AFTER LOGIN
  useEffect(() => {
    if (myId) {
      loadInbox()
    }
  }, [myId, loadInbox])

  // PART 2 CONTINUES BELOW
        
  // OPEN EXISTING CHAT
  const openChat = async (chat: ChatItem) => {
    setActiveChat(chat)
    setChatLoading(true)
    setMessages([])

    await loadMessages(chat.conversation_id)
    setChatLoading(false)
  }

  // START NEW DIRECT CHAT
  const startNewChat = async (user: Profile) => {
    if (!myId) return

    try {
      setChatLoading(true)
      setError('')

      const { data, error: rpcError } = await supabase.rpc(
        'create_direct_conversation',
        { p_other_user: user.id }
      )

      if (rpcError) throw rpcError

      // RPC may return UUID directly or as an object/array
      const result = Array.isArray(data) ? data[0] : data
      const conversationId =
        typeof result === 'string'
          ? result
          : result?.create_direct_conversation ||
            result?.conversation_id ||
            result?.id

      if (!conversationId) {
        throw new Error('Conversation ID dorakaledu.')
      }

      const chat: ChatItem = {
        id: user.id,
        conversation_id: conversationId,
        user,
        lastMessage: 'Start a conversation',
        lastMessageTime: '',
        unreadCount: 0
      }

      setActiveChat(chat)
      setMessages([])

      await loadMessages(conversationId)
      await loadInbox()
    } catch (err: any) {
      console.error('Start chat error:', err)
      setError(err.message || 'Chat open avvaledu.')
    } finally {
      setChatLoading(false)
    }
  }

  // LOAD CHAT MESSAGES
  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error: messagesError } = await supabase
        .from('messages')
        .select(`
          id,
          conversation_id,
          sender_id,
          content,
          message_type,
          media_url,
          reply_to,
          created_at,
          edited_at
        `)
        .eq('conversation_id', conversationId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })

      if (messagesError) throw messagesError

      setMessages(data || [])
    } catch (err: any) {
      console.error('Load messages error:', err)
      setError(err.message || 'Messages load avvaledu.')
    }
  }

  // SEND TEXT MESSAGE
  const sendMessage = async () => {
    if (!text.trim() || !activeChat || !myId || sending) return

    const messageText = text.trim()

    try {
      setSending(true)
      setText('')

      const { data, error: sendError } = await supabase
        .from('messages')
        .insert({
          conversation_id: activeChat.conversation_id,
          sender_id: myId,
          content: messageText,
          message_type: 'text'
        })
        .select(`
          id,
          conversation_id,
          sender_id,
          content,
          message_type,
          media_url,
          reply_to,
          created_at,
          edited_at
        `)
        .single()

      if (sendError) throw sendError

      // Add message immediately
      setMessages(previous => {
        if (previous.some(item => item.id === data.id)) {
          return previous
        }

        return [...previous, data]
      })

      // Refresh inbox preview
      setChats(previous =>
        previous.map(chat =>
          chat.conversation_id === activeChat.conversation_id
            ? {
                ...chat,
                lastMessage: messageText,
                lastMessageTime: data.created_at
              }
            : chat
        )
      )

      // Update conversation time
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', activeChat.conversation_id)

    } catch (err: any) {
      console.error('Send message error:', err)
      setText(messageText)
      setError(err.message || 'Message send avvaledu.')
    } finally {
      setSending(false)
    }
  }

  // REALTIME: RECEIVE NEW MESSAGES
  useEffect(() => {
    if (!activeChat?.conversation_id) return

    const conversationId = activeChat.conversation_id

    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        payload => {
          const newMessage = payload.new as Message

          setMessages(previous => {
            if (previous.some(item => item.id === newMessage.id)) {
              return previous
            }

            return [...previous, newMessage]
          })

          setChats(previous =>
            previous.map(chat =>
              chat.conversation_id === conversationId
                ? {
                    ...chat,
                    lastMessage:
                      newMessage.content || 'New message',
                    lastMessageTime: newMessage.created_at
                  }
                : chat
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeChat?.conversation_id])

  // BACK TO INBOX
  const closeChat = () => {
    setActiveChat(null)
    setMessages([])
    setText('')
    setError('')
    loadInbox()
  }

  // PART 3 CONTINUES BELOW
  // NEW CHAT PANEL
  const [showNewChat, setShowNewChat] = useState(false)

  const filteredUsers = users.filter(user =>
    (user.username || '')
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  const filteredChats = chats.filter(chat =>
    (chat.user.username || '')
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  const formatTime = (date: string) => {
    if (!date) return ''

    const messageDate = new Date(date)

    if (isNaN(messageDate.getTime())) return ''

    return messageDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-md mx-auto min-h-screen pb-24">

        {/* HEADER */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Messages</h1>
            <p className="text-xs text-gray-500">
              ChitPix private conversations
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setShowNewChat(!showNewChat)
                setSearch('')
              }}
              className="text-2xl"
              aria-label="New message"
            >
              ✏️
            </button>

            <Link
              href="/"
              className="text-gray-500 text-2xl"
              aria-label="Close messages"
            >
              ×
            </Link>
          </div>
        </div>

        {/* CHAT SCREEN */}
        {activeChat ? (
          <div className="flex flex-col h-[calc(100dvh-160px)]">

            {/* CHAT HEADER */}
            <div className="sticky top-0 z-20 bg-white border-b p-3 flex items-center gap-3">
              <button
                onClick={closeChat}
                className="text-2xl px-1"
              >
                ←
              </button>

              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                {activeChat.user.avatar_url ? (
                  <img
                    src={activeChat.user.avatar_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>👤</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">
                  {activeChat.user.username || 'ChitPix User'}
                </p>
                <p className="text-xs text-green-600">
                  ChitPix member
                </p>
              </div>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">

              {chatLoading && (
                <p className="text-center text-gray-500 text-sm py-8">
                  Loading messages...
                </p>
              )}

              {!chatLoading && messages.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-5xl mb-3">💬</div>
                  <p className="font-semibold">
                    Start a conversation
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Send your first message!
                  </p>
                </div>
              )}

              {messages.map(message => {
                const isMine = message.sender_id === myId

                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      isMine ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${
                        isMine
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-white text-gray-900 rounded-bl-sm'
                      }`}
                    >
                      {message.content && (
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      )}

                      {!message.content &&
                        message.message_type === 'image' && (
                          <p className="text-sm">📷 Photo</p>
                        )}

                      {!message.content &&
                        message.message_type === 'video' && (
                          <p className="text-sm">🎬 Video</p>
                        )}

                      <div
                        className={`text-[10px] text-right mt-1 ${
                          isMine ? 'text-blue-100' : 'text-gray-400'
                        }`}
                      >
                        {formatTime(message.created_at)}
                      </div>
                    </div>
                  </div>
                )
              })}

              <div />
            </div>

            {/* MESSAGE INPUT */}
            <div className="border-t bg-white p-3 flex items-end gap-2">
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Message..."
                rows={1}
                className="flex-1 resize-none bg-gray-100 rounded-2xl px-4 py-3 text-sm outline-none max-h-28"
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
              />

              <button
                onClick={sendMessage}
                disabled={!text.trim() || sending}
                className="bg-blue-600 text-white rounded-full px-5 py-3 font-semibold text-sm disabled:opacity-40"
              >
                {sending ? '...' : 'Send'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* PRIMARY / REQUESTS TABS */}
            <div className="flex border-b">
              <button
                onClick={() => {
                  setActiveTab('primary')
                  setShowNewChat(false)
                  setSearch('')
                }}
                className={`flex-1 py-3 text-sm font-semibold ${
                  activeTab === 'primary'
                    ? 'border-b-2 border-black'
                    : 'text-gray-400'
                }`}
              >
                Primary
              </button>

              <button
                onClick={() => {
                  setActiveTab('requests')
                  setShowNewChat(false)
                  setSearch('')
                }}
                className={`flex-1 py-3 text-sm font-semibold ${
                  activeTab === 'requests'
                    ? 'border-b-2 border-black'
                    : 'text-gray-400'
                }`}
              >
                Requests
              </button>
            </div>

            {/* SEARCH */}
            <div className="p-4">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={
                  showNewChat
                    ? 'Search people...'
                    : 'Search messages...'
                }
                className="w-full bg-gray-100 rounded-full px-4 py-3 text-sm outline-none"
              />
            </div>

            {/* ERROR */}
            {error && (
              <div className="mx-4 mb-3 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
                {error}

                <button
                  onClick={() => {
                    setError('')
                    loadUsers()
                    loadInbox()
                  }}
                  className="block mt-2 font-semibold underline"
                >
                  Retry
                </button>
              </div>
            )}

            {/* LOADING */}
            {loading && (
              <div className="text-center py-10 text-gray-500">
                Loading ChitPix...
              </div>
            )}

            {/* NEW CHAT USERS */}
            {!loading && !error && showNewChat && (
              <div>
                <div className="px-4 py-2 flex justify-between items-center">
                  <p className="font-semibold text-sm">
                    New message
                  </p>

                  <button
                    onClick={() => {
                      setShowNewChat(false)
                      setSearch('')
                    }}
                    className="text-blue-600 text-sm"
                  >
                    Cancel
                  </button>
                </div>

                {filteredUsers.length === 0 ? (
                  <p className="text-center py-10 text-gray-500 text-sm">
                    No users found
                  </p>
                ) : (
                  filteredUsers.map(user => (
                    <button
                      key={user.id}
                      onClick={() => startNewChat(user)}
                      className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-100 text-left hover:bg-gray-50"
                    >
                      <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.username || 'User'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>👤</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {user.username || 'ChitPix User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.bio || 'ChitPix member'}
                        </p>
                      </div>

                      <span className="text-blue-600 text-sm font-semibold">
                        Message
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* PRIMARY INBOX */}
            {!loading &&
              !error &&
              !showNewChat &&
              activeTab === 'primary' && (
                <div>
                  {filteredChats.length === 0 ? (
                    <div className="text-center py-14 px-5">
                      <div className="text-5xl mb-3">💬</div>
                      <p className="font-semibold">
                        No conversations yet
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Start chatting with ChitPix users.
                      </p>

                      <button
                        onClick={() => setShowNewChat(true)}
                        className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-semibold"
                      >
                        New Message
                      </button>
                    </div>
                  ) : (
                    filteredChats.map(chat => (
                      <button
                        key={chat.conversation_id}
                        onClick={() => openChat(chat)}
                        className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-100 text-left hover:bg-gray-50"
                      >
                        <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                          {chat.user.avatar_url ? (
                            <img
                              src={chat.user.avatar_url}
                              alt={chat.user.username || 'User'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl">👤</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {chat.user.username || 'ChitPix User'}
                          </p>

                          <p className="text-xs text-gray-500 truncate mt-1">
                            {chat.lastMessage}
                          </p>
                        </div>

                        <div className="text-[10px] text-gray-400">
                          {formatTime(chat.lastMessageTime)}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}

            {/* REQUESTS PLACEHOLDER */}
            {!loading &&
              !showNewChat &&
              activeTab === 'requests' && (
                <div className="text-center py-16 px-6">
                  <div className="text-5xl mb-3">📩</div>
                  <p className="font-semibold">
                    Message Requests
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Message requests will appear here once the
                    request system is connected.
                  </p>
                </div>
              )}
          </>
        )}
      </div>

      {!activeChat && <BottomNav />}
    </div>
  )
            }

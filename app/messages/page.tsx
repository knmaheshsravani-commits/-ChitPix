'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import Link from 'next/link'
import BottomNav from '../components/BottomNav'
import { supabase } from '../../lib/supabase'

// ==========================================
// CHITPIX DM — TYPES
// ==========================================

type Profile = {
  id: string
  username: string | null
  avatar_url: string | null
  bio: string | null
}

type ChatItem = {
  id: string
  conversation_id: string
  user: Profile | null
  group_name: string | null
  group_avatar_url: string | null
  conversation_type: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  isPinned: boolean
  isMuted: boolean
  isArchived: boolean
  memberCount: number
}

type Message = {
  id: string
  conversation_id: string
  sender_id: string
  content: string | null
  message_type: string
  media_url: string | null
  metadata: Record<string, any> | null
  reply_to: string | null
  created_at: string
  edited_at?: string | null
  deleted_at?: string | null
}

type Reaction = {
  id: string
  message_id: string
  user_id: string
  emoji: string
}

const EMOJIS = [
  '😀', '😂', '😍', '🥰', '😘',
  '😊', '😎', '😭', '😢', '😡',
  '❤️', '🔥', '👍', '🙏', '👏',
  '🎉', '💯', '🌹', '🥳', '🤗',
]

const MAX_PHOTO_SIZE = 10 * 1024 * 1024
const MAX_VIDEO_SIZE = 50 * 1024 * 1024
const MAX_VOICE_SIZE = 15 * 1024 * 1024

// ==========================================
// MAIN MESSAGES PAGE
// ==========================================

export default function MessagesPage() {
  // Logged-in user
  const [myId, setMyId] = useState('')

  // Users and inbox
  const [users, setUsers] = useState<Profile[]>([])
  const [chats, setChats] = useState<ChatItem[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [reactions, setReactions] = useState<Reaction[]>([])

  // Selected conversation
  const [activeChat, setActiveChat] = useState<ChatItem | null>(null)
  const [activeTab, setActiveTab] = useState<'primary' | 'requests'>('primary')

  // Search and message input
  const [search, setSearch] = useState('')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [chatLoading, setChatLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  // New chat and group chat
  const [showNewChat, setShowNewChat] = useState(false)
  const [showGroupCreate, setShowGroupCreate] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [groupLoading, setGroupLoading] = useState(false)

  // Message tools
  const [showEmoji, setShowEmoji] = useState(false)
  const [replyMessage, setReplyMessage] = useState<Message | null>(null)
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const [messageMenu, setMessageMenu] = useState<string | null>(null)
  const [reactionMessage, setReactionMessage] = useState<string | null>(null)

  // Media uploads
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const voiceInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Chat settings
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const [typingUsers, setTypingUsers] = useState<string[]>([])

  // ==========================================
  // LOAD USERS
  // ==========================================

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

  // ==========================================
  // LOAD PRIMARY INBOX
  // ==========================================

  const loadInbox = useCallback(async () => {
    if (!myId) return

    try {
      const { data: memberships, error: memberError } =
        await supabase
          .from('conversation_members')
          .select(`
            conversation_id,
            user_id,
            is_pinned,
            is_muted,
            is_archived
          `)
          .eq('user_id', myId)

      if (memberError) throw memberError

      const myMemberships = memberships || []

      const conversationIds = myMemberships
        .map(item => item.conversation_id)
        .filter((id, index, arr) => arr.indexOf(id) === index)

      if (conversationIds.length === 0) {
        setChats([])
        return
      }

      const { data: conversations, error: conversationError } =
        await supabase
          .from('conversations')
          .select(`
            id,
            conversation_type,
            group_name,
            group_avatar_url,
            request_status,
            created_at,
            updated_at
          `)
          .in('id', conversationIds)
          .eq('request_status', 'accepted')

      if (conversationError) throw conversationError

      const conversationRows = conversations || []

      if (conversationRows.length === 0) {
        setChats([])
        return
      }

      const directIds = conversationRows.map(item => item.id)

      const { data: members, error: otherMemberError } =
        await supabase
          .from('conversation_members')
          .select('conversation_id, user_id')
          .in('conversation_id', directIds)

      if (otherMemberError) throw otherMemberError

      const otherUserIds = (members || [])
        .filter(item => item.user_id !== myId)
        .map(item => item.user_id)
        .filter((id, index, arr) => arr.indexOf(id) === index)

      const { data: profiles, error: profileError } =
        otherUserIds.length
          ? await supabase
              .from('profiles')
              .select('id, username, avatar_url, bio')
              .in('id', otherUserIds)
          : { data: [], error: null }

      if (profileError) throw profileError

      const { data: messageRows, error: messageError } =
        await supabase
          .from('messages')
          .select(`
            id,
            conversation_id,
            sender_id,
            content,
            message_type,
            created_at
          `)
          .in('conversation_id', directIds)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })

      if (messageError) throw messageError

      const chatList: ChatItem[] = conversationRows.map(conversation => {
        const conversationMembers = (members || []).filter(
          item => item.conversation_id === conversation.id
        )

        const otherMember = conversationMembers.find(
          item => item.user_id !== myId
        )

        const profile = otherMember
          ? (profiles || []).find(item => item.id === otherMember.user_id) || null
          : null

        const latestMessage = (messageRows || []).find(
          item => item.conversation_id === conversation.id
        )

        const mySettings = myMemberships.find(
          item => item.conversation_id === conversation.id
        )

        const isGroup = conversation.conversation_type === 'group'

        const preview =
          latestMessage?.content ||
          (latestMessage?.message_type === 'image'
            ? '📷 Photo'
            : latestMessage?.message_type === 'video'
            ? '🎬 Video'
            : latestMessage?.message_type === 'audio'
            ? '🎤 Voice message'
            : latestMessage?.message_type === 'file'
            ? '📎 File'
            : 'Start a conversation')

        return {
          id: isGroup ? conversation.id : (profile?.id || conversation.id),
          conversation_id: conversation.id,
          user: profile,
          group_name: conversation.group_name || null,
          group_avatar_url: conversation.group_avatar_url || null,
          conversation_type: conversation.conversation_type,
          lastMessage: preview,
          lastMessageTime: latestMessage?.created_at || conversation.updated_at || '',
          unreadCount: 0,
          isPinned: !!mySettings?.is_pinned,
          isMuted: !!mySettings?.is_muted,
          isArchived: !!mySettings?.is_archived,
          memberCount: conversationMembers.length,
        }
      })

      chatList.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1

        return (
          new Date(b.lastMessageTime || 0).getTime() -
          new Date(a.lastMessageTime || 0).getTime()
        )
      })

      setChats(chatList)
    } catch (err: any) {
      console.error('DM inbox error:', err)
      setError(err.message || 'Inbox load avvaledu.')
    }
  }, [myId])

  // ==========================================
  // INITIAL LOAD
  // ==========================================

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

  useEffect(() => {
    if (myId) loadInbox()
  }, [myId, loadInbox])

  // PART 2 CONTINUES BELOW
  // ==========================================
  // OPEN EXISTING CHAT
  // ==========================================

  const openChat = async (chat: ChatItem) => {
    setActiveChat(chat)
    setChatLoading(true)
    setMessages([])
    setReactions([])
    setText('')
    setReplyMessage(null)
    setEditingMessage(null)
    setShowEmoji(false)
    setError('')

    await loadMessages(chat.conversation_id)

    setChatLoading(false)
  }

  // ==========================================
  // LOAD CHAT MESSAGES
  // ==========================================

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
          metadata,
          reply_to,
          created_at,
          edited_at,
          deleted_at
        `)
        .eq('conversation_id', conversationId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })

      if (messagesError) throw messagesError

      setMessages(data || [])

      await loadReactions(data || [])
      await markMessagesRead(data || [])
    } catch (err: any) {
      console.error('Load messages error:', err)
      setError(err.message || 'Messages load avvaledu.')
    }
  }

  // ==========================================
  // MARK MESSAGES AS READ
  // ==========================================

  const markMessagesRead = async (rows: Message[]) => {
    if (!myId || rows.length === 0) return

    const unreadRows = rows
      .filter(message => message.sender_id !== myId)
      .map(message => ({
        message_id: message.id,
        user_id: myId,
      }))

    if (unreadRows.length === 0) return

    const { error: readError } = await supabase
      .from('message_reads')
      .upsert(unreadRows, {
        onConflict: 'message_id,user_id',
        ignoreDuplicates: true,
      })

    if (readError) {
      console.error('Read receipt error:', readError)
    }
  }

  // ==========================================
  // LOAD MESSAGE REACTIONS
  // ==========================================

  const loadReactions = async (rows: Message[]) => {
    if (rows.length === 0) {
      setReactions([])
      return
    }

    const messageIds = rows.map(message => message.id)

    const { data, error: reactionError } = await supabase
      .from('message_reactions')
      .select('id, message_id, user_id, emoji')
      .in('message_id', messageIds)

    if (reactionError) {
      console.error('Reaction load error:', reactionError)
      return
    }

    setReactions(data || [])
  }

  // ==========================================
  // START NEW DIRECT CHAT
  // ==========================================

  const startNewChat = async (user: Profile) => {
    if (!myId || user.id === myId) return

    try {
      setChatLoading(true)
      setError('')

      const { data, error: rpcError } = await supabase.rpc(
        'create_direct_conversation',
        { p_other_user: user.id }
      )

      if (rpcError) throw rpcError

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
        group_name: null,
        group_avatar_url: null,
        conversation_type: 'direct',
        lastMessage: 'Start a conversation',
        lastMessageTime: '',
        unreadCount: 0,
        isPinned: false,
        isMuted: false,
        isArchived: false,
        memberCount: 2,
      }

      setActiveChat(chat)
      setMessages([])
      setReactions([])
      setShowNewChat(false)
      setShowGroupCreate(false)
      setReplyMessage(null)
      setEditingMessage(null)

      await loadMessages(conversationId)
      await loadInbox()
    } catch (err: any) {
      console.error('Start chat error:', err)
      setError(err.message || 'Chat open avvaledu.')
    } finally {
      setChatLoading(false)
    }
  }

  // ==========================================
  // SELECT GROUP MEMBERS
  // ==========================================

  const toggleGroupMember = (userId: string) => {
    setSelectedMembers(previous =>
      previous.includes(userId)
        ? previous.filter(id => id !== userId)
        : [...previous, userId]
    )
  }

  // ==========================================
  // CREATE GROUP CHAT
  // ==========================================

  const createGroupChat = async () => {
    if (!myId || groupLoading) return

    if (!groupName.trim()) {
      setError('Group name enter cheyyi.')
      return
    }

    if (selectedMembers.length < 2) {
      setError('Group ki minimum 2 other members select cheyyali.')
      return
    }

    try {
      setGroupLoading(true)
      setError('')

      const { data, error: groupError } = await supabase.rpc(
        'create_group_conversation',
        {
          p_group_name: groupName.trim(),
          p_member_ids: selectedMembers,
        }
      )

      if (groupError) throw groupError

      const conversationId =
        typeof data === 'string'
          ? data
          : data?.create_group_conversation ||
            data?.conversation_id ||
            data?.id

      if (!conversationId) {
        throw new Error('Group conversation ID dorakaledu.')
      }

      const groupChat: ChatItem = {
        id: conversationId,
        conversation_id: conversationId,
        user: null,
        group_name: groupName.trim(),
        group_avatar_url: null,
        conversation_type: 'group',
        lastMessage: 'Group created',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
        isPinned: false,
        isMuted: false,
        isArchived: false,
        memberCount: selectedMembers.length + 1,
      }

      setActiveChat(groupChat)
      setMessages([])
      setReactions([])
      setShowGroupCreate(false)
      setShowNewChat(false)
      setGroupName('')
      setSelectedMembers([])

      await loadMessages(conversationId)
      await loadInbox()
    } catch (err: any) {
      console.error('Create group error:', err)
      setError(err.message || 'Group create avvaledu.')
    } finally {
      setGroupLoading(false)
    }
  }

  // ==========================================
  // SEND TEXT MESSAGE
  // ==========================================

  const sendMessage = async () => {
    if (
      !text.trim() ||
      !activeChat ||
      !myId ||
      sending
    ) return

    const messageText = text.trim()

    try {
      setSending(true)
      setText('')
      setError('')

      // EDIT EXISTING MESSAGE
      if (editingMessage) {
        const { data, error: editError } = await supabase
          .from('messages')
          .update({
            content: messageText,
            edited_at: new Date().toISOString(),
          })
          .eq('id', editingMessage.id)
          .eq('sender_id', myId)
          .select(`
            id,
            conversation_id,
            sender_id,
            content,
            message_type,
            media_url,
            metadata,
            reply_to,
            created_at,
            edited_at,
            deleted_at
          `)
          .single()

        if (editError) throw editError

        setMessages(previous =>
          previous.map(message =>
            message.id === data.id ? data : message
          )
        )

        setEditingMessage(null)
        setReplyMessage(null)
        return
      }

      // SEND NEW MESSAGE
      const { data, error: sendError } = await supabase
        .from('messages')
        .insert({
          conversation_id: activeChat.conversation_id,
          sender_id: myId,
          content: messageText,
          message_type: 'text',
          reply_to: replyMessage?.id || null,
        })
        .select(`
          id,
          conversation_id,
          sender_id,
          content,
          message_type,
          media_url,
          metadata,
          reply_to,
          created_at,
          edited_at,
          deleted_at
        `)
        .single()

      if (sendError) throw sendError

      setMessages(previous => {
        if (previous.some(item => item.id === data.id)) {
          return previous
        }

        return [...previous, data]
      })

      setChats(previous =>
        previous.map(chat =>
          chat.conversation_id === activeChat.conversation_id
            ? {
                ...chat,
                lastMessage: messageText,
                lastMessageTime: data.created_at,
              }
            : chat
        )
      )

      setReplyMessage(null)

      // UPDATE CONVERSATION TIME
      const { error: updateError } = await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', activeChat.conversation_id)

      if (updateError) {
        console.error('Conversation timestamp update:', updateError)
      }
    } catch (err: any) {
      console.error('Send message error:', err)
      setText(messageText)
      setError(err.message || 'Message send avvaledu.')
    } finally {
      setSending(false)
    }
  }

  // PART 3 CONTINUES BELOW
  // ==========================================
  // UPLOAD MEDIA THROUGH CLOUDFLARE R2
  // ==========================================

  const uploadMedia = async (
    file: File,
    type: 'image' | 'video' | 'audio' | 'file'
  ) => {
    if (!activeChat || !myId || uploadingMedia) return

    const limits = {
      image: MAX_PHOTO_SIZE,
      video: MAX_VIDEO_SIZE,
      audio: MAX_VOICE_SIZE,
      file: MAX_VIDEO_SIZE,
    }

    if (file.size > limits[type]) {
      setError(
        `File size limit exceed ayyindi. ${Math.round(limits[type] / 1024 / 1024)}MB lopu file select cheyyi.`
      )
      return
    }

    if (
      type === 'image' && !file.type.startsWith('image/') ||
      type === 'video' && !file.type.startsWith('video/') ||
      type === 'audio' && !file.type.startsWith('audio/')
    ) {
      setError('Selected file type correct ga ledu.')
      return
    }

    try {
      setUploadingMedia(true)
      setError('')

      const safeName = file.name.replace(
        /[^a-zA-Z0-9._-]/g,
        '_'
      )

      const fileName = `dm/${myId}/${Date.now()}-${safeName}`

      const response = await fetch('/api/r2-presign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName,
          contentType: file.type || 'application/octet-stream',
        }),
      })

      if (!response.ok) {
        throw new Error('R2 upload URL dorakaledu.')
      }

      const uploadData = await response.json()

      if (!uploadData.url || !uploadData.publicUrl) {
        throw new Error('R2 upload response invalid.')
      }

      const uploadResponse = await fetch(uploadData.url, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
      })

      if (!uploadResponse.ok) {
        throw new Error('Cloudflare R2 upload fail ayyindi.')
      }

      const { data, error: insertError } = await supabase
        .from('messages')
        .insert({
          conversation_id: activeChat.conversation_id,
          sender_id: myId,
          content: '',
          message_type: type,
          media_url: uploadData.publicUrl,
          metadata: {
            file_name: file.name,
            file_size: file.size,
            content_type: file.type,
          },
          reply_to: replyMessage?.id || null,
        })
        .select(`
          id,
          conversation_id,
          sender_id,
          content,
          message_type,
          media_url,
          metadata,
          reply_to,
          created_at,
          edited_at,
          deleted_at
        `)
        .single()

      if (insertError) throw insertError

      setMessages(previous => {
        if (previous.some(item => item.id === data.id)) {
          return previous
        }

        return [...previous, data]
      })

      const preview =
        type === 'image'
          ? '📷 Photo'
          : type === 'video'
          ? '🎬 Video'
          : type === 'audio'
          ? '🎤 Voice message'
          : '📎 File'

      setChats(previous =>
        previous.map(chat =>
          chat.conversation_id === activeChat.conversation_id
            ? {
                ...chat,
                lastMessage: preview,
                lastMessageTime: data.created_at,
              }
            : chat
        )
      )

      setReplyMessage(null)

      const { error: updateError } = await supabase
        .from('conversations')
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq('id', activeChat.conversation_id)

      if (updateError) {
        console.error('Conversation update error:', updateError)
      }
    } catch (err: any) {
      console.error('Media upload error:', err)
      setError(err.message || 'Media send avvaledu.')
    } finally {
      setUploadingMedia(false)
    }
  }

  // ==========================================
  // SEND PHOTO
  // ==========================================

  const sendPhoto = async (file: File) => {
    await uploadMedia(file, 'image')
  }

  // ==========================================
  // SEND VIDEO
  // ==========================================

  const sendVideo = async (file: File) => {
    await uploadMedia(file, 'video')
  }

  // ==========================================
  // SEND VOICE MESSAGE
  // ==========================================

  const sendVoice = async (file: File) => {
    await uploadMedia(file, 'audio')
  }

  // ==========================================
  // SEND FILE
  // ==========================================

  const sendFile = async (file: File) => {
    await uploadMedia(file, 'file')
  }

  // ==========================================
  // TOGGLE MESSAGE REACTION
  // ==========================================

  const toggleReaction = async (
    messageId: string,
    emoji: string
  ) => {
    if (!myId) return

    try {
      setError('')

      const existing = reactions.find(
        reaction =>
          reaction.message_id === messageId &&
          reaction.user_id === myId &&
          reaction.emoji === emoji
      )

      if (existing) {
        const { error: deleteError } = await supabase
          .from('message_reactions')
          .delete()
          .eq('id', existing.id)
          .eq('user_id', myId)

        if (deleteError) throw deleteError

        setReactions(previous =>
          previous.filter(item => item.id !== existing.id)
        )
      } else {
        const { data, error: insertError } = await supabase
          .from('message_reactions')
          .insert({
            message_id: messageId,
            user_id: myId,
            emoji,
          })
          .select('id, message_id, user_id, emoji')
          .single()

        if (insertError) throw insertError

        setReactions(previous => [...previous, data])
      }

      setReactionMessage(null)
    } catch (err: any) {
      console.error('Reaction error:', err)
      setError(err.message || 'Reaction update avvaledu.')
    }
  }

  // ==========================================
  // DELETE / UNSEND MESSAGE
  // ==========================================

  const deleteMessage = async (message: Message) => {
    if (!myId || message.sender_id !== myId) return

    try {
      setError('')

      const { error: deleteError } = await supabase
        .from('messages')
        .update({
          deleted_at: new Date().toISOString(),
          content: null,
          media_url: null,
        })
        .eq('id', message.id)
        .eq('sender_id', myId)

      if (deleteError) throw deleteError

      setMessages(previous =>
        previous.filter(item => item.id !== message.id)
      )

      setReactions(previous =>
        previous.filter(item => item.message_id !== message.id)
      )

      setMessageMenu(null)
    } catch (err: any) {
      console.error('Delete message error:', err)
      setError(err.message || 'Message delete avvaledu.')
    }
  }

  // ==========================================
  // REPLY TO MESSAGE
  // ==========================================

  const startReply = (message: Message) => {
    setReplyMessage(message)
    setEditingMessage(null)
    setMessageMenu(null)
  }

  // ==========================================
  // EDIT MESSAGE
  // ==========================================

  const startEdit = (message: Message) => {
    if (message.sender_id !== myId) return
    if (message.message_type !== 'text') return

    setEditingMessage(message)
    setReplyMessage(null)
    setText(message.content || '')
    setMessageMenu(null)
  }

  // ==========================================
  // CANCEL REPLY / EDIT
  // ==========================================

  const cancelMessageAction = () => {
    setReplyMessage(null)
    setEditingMessage(null)
    setText('')
  }

  // ==========================================
  // FOLLOW STATUS
  // ==========================================

  const checkFollowStatus = async (userId: string) => {
    if (!myId || !userId) return

    const { data, error: followError } = await supabase
      .from('user_follows')
      .select('follower_id')
      .eq('follower_id', myId)
      .eq('following_id', userId)
      .maybeSingle()

    if (followError) {
      console.error('Follow status error:', followError)
      return
    }

    setIsFollowing(!!data)
  }

  useEffect(() => {
    if (activeChat?.conversation_type !== 'direct') {
      setIsFollowing(false)
      return
    }

    const userId = activeChat.user?.id

    if (userId && myId) {
      setIsFollowing(false)
      checkFollowStatus(userId)
    }
  }, [activeChat?.user?.id, activeChat?.conversation_type, myId])

  // ==========================================
  // FOLLOW / UNFOLLOW USER
  // ==========================================

  const toggleFollow = async (userId: string) => {
    if (!myId || !userId || followLoading) return

    try {
      setFollowLoading(true)
      setError('')

      if (isFollowing) {
        const { error: deleteError } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', myId)
          .eq('following_id', userId)

        if (deleteError) throw deleteError

        setIsFollowing(false)
      } else {
        const { error: insertError } = await supabase
          .from('user_follows')
          .insert({
            follower_id: myId,
            following_id: userId,
          })

        if (insertError) throw insertError

        setIsFollowing(true)
      }
    } catch (err: any) {
      console.error('Follow update error:', err)
      setError(err.message || 'Follow update avvaledu.')
    } finally {
      setFollowLoading(false)
    }
  }

  // ==========================================
  // EMOJI SELECTION
  // ==========================================

  const addEmoji = (emoji: string) => {
    setText(previous => previous + emoji)
  }

  // PART 4 CONTINUES BELOW
  // ==========================================
  // REALTIME CHANNEL REFERENCE
  // ==========================================

  const realtimeChannelRef = useRef<any>(null)

  // ==========================================
  // REALTIME: RECEIVE NEW MESSAGES
  // ==========================================

  useEffect(() => {
    if (!activeChat?.conversation_id || !myId) return

    const conversationId = activeChat.conversation_id

    const channel = supabase
      .channel(`chitpix-chat-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async payload => {
          const newMessage = payload.new as Message

          setMessages(previous => {
            if (previous.some(item => item.id === newMessage.id)) {
              return previous
            }

            return [...previous, newMessage]
          })

          const preview =
            newMessage.message_type === 'image'
              ? '📷 Photo'
              : newMessage.message_type === 'video'
              ? '🎬 Video'
              : newMessage.message_type === 'audio'
              ? '🎤 Voice message'
              : newMessage.message_type === 'file'
              ? '📎 File'
              : newMessage.content || 'New message'

          setChats(previous =>
            previous.map(chat =>
              chat.conversation_id === conversationId
                ? {
                    ...chat,
                    lastMessage: preview,
                    lastMessageTime: newMessage.created_at,
                  }
                : chat
            )
          )

          if (newMessage.sender_id !== myId) {
            await markMessagesRead([newMessage])
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        payload => {
          const updatedMessage = payload.new as Message

          if (updatedMessage.deleted_at) {
            setMessages(previous =>
              previous.filter(item => item.id !== updatedMessage.id)
            )
            return
          }

          setMessages(previous =>
            previous.map(item =>
              item.id === updatedMessage.id
                ? updatedMessage
                : item
            )
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_reactions',
        },
        payload => {
          const newReaction = payload.new as Reaction

          setReactions(previous => {
            if (previous.some(item => item.id === newReaction.id)) {
              return previous
            }

            return [...previous, newReaction]
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'message_reactions',
        },
        payload => {
          const oldReaction = payload.old as Reaction

          if (oldReaction.id) {
            setReactions(previous =>
              previous.filter(item => item.id !== oldReaction.id)
            )
          }
        }
      )
      .on(
        'broadcast',
        { event: 'typing' },
        payload => {
          const userId = payload.payload?.user_id

          if (!userId || userId === myId) return

          setTypingUsers(previous =>
            previous.includes(userId)
              ? previous
              : [...previous, userId]
          )

          // Remove typing indicator after 3 seconds
          setTimeout(() => {
            setTypingUsers(previous =>
              previous.filter(id => id !== userId)
            )
          }, 3000)
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()

        const activeUsers = Object.values(state)
          .flat()
          .map((item: any) => item.user_id)
          .filter((id: string) => id && id !== myId)

        setOnlineUsers(activeUsers)
      })
      .subscribe(async status => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: myId,
            online_at: new Date().toISOString(),
          })
        }
      })

    realtimeChannelRef.current = channel

    return () => {
      realtimeChannelRef.current = null
      setTypingUsers([])
      setOnlineUsers([])
      supabase.removeChannel(channel)
    }
  }, [activeChat?.conversation_id, myId])

  // ==========================================
  // SEND TYPING INDICATOR
  // ==========================================

  const sendTyping = async () => {
    const channel = realtimeChannelRef.current

    if (!channel || !myId) return

    try {
      await channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          user_id: myId,
        },
      })
    } catch (err) {
      console.error('Typing event error:', err)
    }
  }

  // ==========================================
  // CHECK ONLINE STATUS
  // ==========================================

  const isUserOnline = (userId?: string | null) => {
    if (!userId) return false

    return onlineUsers.includes(userId)
  }

  // ==========================================
  // CHECK TYPING STATUS
  // ==========================================

  const isUserTyping = (userId?: string | null) => {
    if (!userId) return false

    return typingUsers.includes(userId)
  }

  // ==========================================
  // SCROLL TO LATEST MESSAGE
  // ==========================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    })
  }, [messages])

  // ==========================================
  // BACK TO INBOX
  // ==========================================

  const closeChat = () => {
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current)
      realtimeChannelRef.current = null
    }

    setActiveChat(null)
    setMessages([])
    setReactions([])
    setText('')
    setError('')
    setShowEmoji(false)
    setReplyMessage(null)
    setEditingMessage(null)
    setMessageMenu(null)
    setReactionMessage(null)
    setTypingUsers([])
    setOnlineUsers([])

    loadInbox()
  }

  // ==========================================
  // REFRESH INBOX
  // ==========================================

  const refreshInbox = async () => {
    setError('')
    await loadInbox()
  }

  // ==========================================
  // FILTER USERS
  // ==========================================

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()

    return users.filter(user =>
      (user.username || '').toLowerCase().includes(query)
    )
  }, [users, search])

  // ==========================================
  // FILTER CHATS
  // ==========================================

  const filteredChats = useMemo(() => {
    const query = search.trim().toLowerCase()

    return chats.filter(chat => {
      const name = chat.conversation_type === 'group'
        ? chat.group_name || ''
        : chat.user?.username || ''

      return (
        name.toLowerCase().includes(query) &&
        !chat.isArchived
      )
    })
  }, [chats, search])

  // ==========================================
  // FILTER MESSAGE REQUESTS
  // ==========================================

  const requestChats = useMemo(() => {
    return chats.filter(chat => chat.isArchived === false)
  }, [chats])

  // ==========================================
  // FORMAT MESSAGE TIME
  // ==========================================

  const formatTime = (date: string) => {
    if (!date) return ''

    const messageDate = new Date(date)

    if (isNaN(messageDate.getTime())) return ''

    return messageDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // ==========================================
  // FORMAT INBOX DATE
  // ==========================================

  const formatInboxTime = (date: string) => {
    if (!date) return ''

    const messageDate = new Date(date)

    if (isNaN(messageDate.getTime())) return ''

    const today = new Date()

    if (messageDate.toDateString() === today.toDateString()) {
      return formatTime(date)
    }

    return messageDate.toLocaleDateString([], {
      day: 'numeric',
      month: 'short',
    })
  }

  // PART 5 CONTINUES BELOW
  // ==========================================
  // GROUP MEMBERS
  // ==========================================

  const [groupMembers, setGroupMembers] = useState<Profile[]>([])
  const [groupMembersLoading, setGroupMembersLoading] = useState(false)
  const [showGroupMembers, setShowGroupMembers] = useState(false)

  const loadGroupMembers = async (conversationId: string) => {
    try {
      setGroupMembersLoading(true)

      const { data: members, error: memberError } = await supabase
        .from('conversation_members')
        .select('user_id, role')
        .eq('conversation_id', conversationId)

      if (memberError) throw memberError

      const memberIds = (members || []).map(item => item.user_id)

      if (memberIds.length === 0) {
        setGroupMembers([])
        return
      }

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, bio')
        .in('id', memberIds)

      if (profileError) throw profileError

      setGroupMembers(profiles || [])
    } catch (err: any) {
      console.error('Group members error:', err)
      setError(err.message || 'Group members load avvaledu.')
    } finally {
      setGroupMembersLoading(false)
    }
  }

  // ==========================================
  // OPEN GROUP MEMBERS
  // ==========================================

  const openGroupMembers = async () => {
    if (!activeChat || activeChat.conversation_type !== 'group') return

    setShowGroupMembers(true)
    await loadGroupMembers(activeChat.conversation_id)
  }

  // ==========================================
  // GET MESSAGE REPLY
  // ==========================================

  const getReplyMessage = (messageId?: string | null) => {
    if (!messageId) return null

    return messages.find(message => message.id === messageId) || null
  }

  // ==========================================
  // REACTION SUMMARY
  // ==========================================

  const getReactionSummary = (messageId: string) => {
    const messageReactions = reactions.filter(
      reaction => reaction.message_id === messageId
    )

    const summary: Record<string, {
      count: number
      mine: boolean
    }> = {}

    messageReactions.forEach(reaction => {
      if (!summary[reaction.emoji]) {
        summary[reaction.emoji] = {
          count: 0,
          mine: false,
        }
      }

      summary[reaction.emoji].count += 1

      if (reaction.user_id === myId) {
        summary[reaction.emoji].mine = true
      }
    })

    return Object.entries(summary).map(([emoji, details]) => ({
      emoji,
      count: details.count,
      mine: details.mine,
    }))
  }

  // ==========================================
  // GET MESSAGE SENDER
  // ==========================================

  const getMessageSender = (senderId: string) => {
    if (senderId === myId) return 'You'

    const member = groupMembers.find(user => user.id === senderId)

    if (member) return member.username || 'ChitPix User'

    const directUser = activeChat?.user

    if (directUser?.id === senderId) {
      return directUser.username || 'ChitPix User'
    }

    return 'Member'
  }

  // ==========================================
  // MESSAGE STATUS
  // ==========================================

  const [readMessageIds, setReadMessageIds] = useState<string[]>([])

  const loadReadStatuses = async (rows: Message[]) => {
    if (rows.length === 0) {
      setReadMessageIds([])
      return
    }

    const messageIds = rows
      .filter(message => message.sender_id === myId)
      .map(message => message.id)

    if (messageIds.length === 0) {
      setReadMessageIds([])
      return
    }

    const { data, error: readError } = await supabase
      .from('message_reads')
      .select('message_id')
      .in('message_id', messageIds)
      .neq('user_id', myId)

    if (readError) {
      console.error('Read status error:', readError)
      return
    }

    setReadMessageIds(
      Array.from(new Set((data || []).map(item => item.message_id)))
    )
  }

  // ==========================================
  // CHECK MESSAGE READ STATUS
  // ==========================================

  const isMessageRead = (messageId: string) => {
    return readMessageIds.includes(messageId)
  }

  // ==========================================
  // REFRESH MESSAGE STATUS
  // ==========================================

  useEffect(() => {
    if (messages.length > 0 && myId) {
      loadReadStatuses(messages)
    } else {
      setReadMessageIds([])
    }
  }, [messages, myId])

  // ==========================================
  // GROUP CHAT CHECK
  // ==========================================

  const isGroupChat = activeChat?.conversation_type === 'group'

  // ==========================================
  // CURRENT CHAT TITLE
  // ==========================================

  const activeChatTitle = isGroupChat
    ? activeChat?.group_name || 'ChitPix Group'
    : activeChat?.user?.username || 'ChitPix User'

  // ==========================================
  // CURRENT CHAT AVATAR
  // ==========================================

  const activeChatAvatar = isGroupChat
    ? activeChat?.group_avatar_url
    : activeChat?.user?.avatar_url

  // ==========================================
  // PINNED CHAT COUNT
  // ==========================================

  const pinnedChatCount = chats.filter(
    chat => chat.isPinned && !chat.isArchived
  ).length

  // ==========================================
  // ARCHIVED CHAT COUNT
  // ==========================================

  const archivedChatCount = chats.filter(
    chat => chat.isArchived
  ).length

  // ==========================================
  // MESSAGE DATE LABEL
  // ==========================================

  const formatMessageDate = (date: string) => {
    const messageDate = new Date(date)

    if (isNaN(messageDate.getTime())) return ''

    const today = new Date()

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today'
    }

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    }

    return messageDate.toLocaleDateString([], {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  // ==========================================
  // CHAT DISPLAY NAME
  // ==========================================

  const getChatName = (chat: ChatItem) => {
    if (chat.conversation_type === 'group') {
      return chat.group_name || 'ChitPix Group'
    }

    return chat.user?.username || 'ChitPix User'
  }

  // ==========================================
  // CHAT DISPLAY AVATAR
  // ==========================================

  const getChatAvatar = (chat: ChatItem) => {
    if (chat.conversation_type === 'group') {
      return chat.group_avatar_url
    }

    return chat.user?.avatar_url || null
  }

  // ==========================================
  // GROUP MEMBER SELECTION COUNT
  // ==========================================

  const selectedMemberCount = selectedMembers.length

  // PART 6 CONTINUES BELOW
  // ==========================================
  // UPDATE CHAT SETTING
  // ==========================================

  const updateChatSetting = async (
    conversationId: string,
    setting: 'is_pinned' | 'is_muted' | 'is_archived',
    value: boolean
  ) => {
    if (!myId) return

    try {
      setError('')

      const { error: updateError } = await supabase
        .from('conversation_members')
        .update({ [setting]: value })
        .eq('conversation_id', conversationId)
        .eq('user_id', myId)

      if (updateError) throw updateError

      setChats(previous =>
        previous.map(chat =>
          chat.conversation_id === conversationId
            ? {
                ...chat,
                isPinned:
                  setting === 'is_pinned' ? value : chat.isPinned,
                isMuted:
                  setting === 'is_muted' ? value : chat.isMuted,
                isArchived:
                  setting === 'is_archived' ? value : chat.isArchived,
              }
            : chat
        )
      )

      await loadInbox()
    } catch (err: any) {
      console.error('Chat setting error:', err)
      setError(err.message || 'Chat setting update avvaledu.')
    }
  }

  // ==========================================
  // PIN / UNPIN CHAT
  // ==========================================

  const togglePinChat = async (chat: ChatItem) => {
    await updateChatSetting(
      chat.conversation_id,
      'is_pinned',
      !chat.isPinned
    )
  }

  // ==========================================
  // MUTE / UNMUTE CHAT
  // ==========================================

  const toggleMuteChat = async (chat: ChatItem) => {
    await updateChatSetting(
      chat.conversation_id,
      'is_muted',
      !chat.isMuted
    )
  }

  // ==========================================
  // ARCHIVE / UNARCHIVE CHAT
  // ==========================================

  const toggleArchiveChat = async (chat: ChatItem) => {
    await updateChatSetting(
      chat.conversation_id,
      'is_archived',
      !chat.isArchived
    )

    setMessageMenu(null)
  }

  // ==========================================
  // GROUP ADMIN CHECK
  // ==========================================

  const [myGroupRole, setMyGroupRole] = useState('member')

  const loadMyGroupRole = async (conversationId: string) => {
    if (!myId) return

    const { data, error: roleError } = await supabase
      .from('conversation_members')
      .select('role')
      .eq('conversation_id', conversationId)
      .eq('user_id', myId)
      .maybeSingle()

    if (roleError) {
      console.error('Group role error:', roleError)
      return
    }

    setMyGroupRole(data?.role || 'member')
  }

  useEffect(() => {
    if (activeChat?.conversation_type === 'group') {
      loadMyGroupRole(activeChat.conversation_id)
    } else {
      setMyGroupRole('member')
    }
  }, [activeChat?.conversation_id, activeChat?.conversation_type, myId])

  // ==========================================
  // GROUP ADMIN STATUS
  // ==========================================

  const isGroupAdmin = myGroupRole === 'admin'

  // ==========================================
  // GROUP MEMBER COUNT
  // ==========================================

  const refreshGroupMemberCount = async () => {
    if (!activeChat || !isGroupChat) return

    const { count, error: countError } = await supabase
      .from('conversation_members')
      .select('id', { count: 'exact', head: true })
      .eq('conversation_id', activeChat.conversation_id)

    if (countError) {
      console.error('Group count error:', countError)
      return
    }

    setActiveChat(previous =>
      previous
        ? {
            ...previous,
            memberCount: count || 0,
          }
        : null
    )
  }

  // ==========================================
  // REFRESH CURRENT CHAT
  // ==========================================

  const refreshCurrentChat = async () => {
    if (!activeChat) return

    await loadMessages(activeChat.conversation_id)

    if (activeChat.conversation_type === 'group') {
      await loadGroupMembers(activeChat.conversation_id)
      await refreshGroupMemberCount()
    }
  }

  // ==========================================
  // CHAT ACTION MENU
  // ==========================================

  const [showChatOptions, setShowChatOptions] = useState(false)

  const closeChatOptions = () => {
    setShowChatOptions(false)
  }

  // ==========================================
  // ARCHIVED CHATS
  // ==========================================

  const [showArchivedChats, setShowArchivedChats] = useState(false)

  const archivedChats = chats.filter(chat => chat.isArchived)

  const visibleChats = showArchivedChats
    ? archivedChats
    : filteredChats

  // ==========================================
  // GROUP NAME VALIDATION
  // ==========================================

  const validateGroupName = (name: string) => {
    const cleanName = name.trim()

    if (!cleanName) return 'Group name required.'

    if (cleanName.length < 2) {
      return 'Group name minimum 2 characters undali.'
    }

    if (cleanName.length > 50) {
      return 'Group name 50 characters lopu undali.'
    }

    return ''
  }

  // ==========================================
  // GROUP MEMBER SEARCH
  // ==========================================

  const filteredGroupUsers = users.filter(user =>
    (user.username || '')
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  // ==========================================
  // CHAT HEADER STATUS
  // ==========================================

  const activeChatStatus = isGroupChat
    ? `${activeChat?.memberCount || 0} members`
    : isUserOnline(activeChat?.user?.id)
    ? 'Online'
    : 'ChitPix member'

  // ==========================================
  // CLEAR CHAT SEARCH
  // ==========================================

  const clearSearch = () => {
    setSearch('')
  }

  // PART 7 CONTINUES BELOW
return (
  <main className="min-h-screen bg-white text-gray-900 dark:bg-black dark:text-white">
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col">

      {/* HEADER */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-black">
        <div className="flex items-center gap-3">
          {activeChat && (
            <button
              onClick={closeChat}
              className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Back"
            >
              <span className="text-2xl">←</span>
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold">
              {activeChat ? activeChatTitle : "ChitPix DM"}
            </h1>
            {!activeChat && (
              <p className="text-xs text-gray-500">Messages</p>
            )}
          </div>
        </div>

        {activeChat && (
          <div className="flex items-center gap-2">
            {isGroupChat(activeChat) && (
              <button
                onClick={openGroupMembers}
                className="rounded-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Members
              </button>
            )}
            <button
              onClick={() => setShowChatOptions(true)}
              className="rounded-full px-3 py-2 text-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Chat options"
            >
              ⋮
            </button>
          </div>
        )}

        {!activeChat && (
          <button
            onClick={() => setShowNewChat(true)}
            className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-black"
          >
            + New
          </button>
        )}
      </header>

      {/* ERROR */}
      {error && (
        <div className="mx-3 mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
          {error}
          <button
            onClick={() => setError("")}
            className="float-right font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* INBOX */}
      {!activeChat && (
        <section className="flex-1">
          <div className="sticky top-[60px] z-20 bg-white px-3 py-3 dark:bg-black">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search people or chats..."
              className="w-full rounded-full bg-gray-100 px-4 py-3 text-sm outline-none dark:bg-gray-900"
            />

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setActiveTab("primary")}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  activeTab === "primary"
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-gray-100 dark:bg-gray-900"
                }`}
              >
                Primary
              </button>
              <button
                onClick={() => setActiveTab("requests")}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  activeTab === "requests"
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-gray-100 dark:bg-gray-900"
                }`}
              >
                Requests
              </button>
              <button
                onClick={() => setShowGroupCreate(true)}
                className="ml-auto rounded-full border border-gray-300 px-3 py-2 text-sm dark:border-gray-700"
              >
                + Group
              </button>
            </div>
          </div>

          {activeTab === "requests" ? (
            <div className="px-6 py-16 text-center">
              <div className="text-4xl">📩</div>
              <h2 className="mt-3 font-semibold">Message Requests</h2>
              <p className="mt-2 text-sm text-gray-500">
                Message request support will appear here after the request
                flow is enabled.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-900">
              {loading ? (
                <p className="p-8 text-center text-sm text-gray-500">
                  Loading chats...
                </p>
              ) : visibleChats.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <div className="text-4xl">💬</div>
                  <h2 className="mt-3 font-semibold">No chats yet</h2>
                  <p className="mt-2 text-sm text-gray-500">
                    Start a conversation with someone on ChitPix.
                  </p>
                  <button
                    onClick={() => setShowNewChat(true)}
                    className="mt-4 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white"
                  >
                    Start chatting
                  </button>
                </div>
              ) : (
                visibleChats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => openChat(chat)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-950"
                  >
                    <div className="relative h-12 w-12 shrink-0">
                      {chat.group_avatar_url || chat.user?.avatar_url ? (
                        <img
                          src={chat.group_avatar_url || chat.user?.avatar_url || ""}
                          alt=""
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-xl dark:bg-gray-800">
                          {isGroupChat(chat) ? "👥" : "👤"}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-semibold">
                          {chat.group_name || chat.user?.username || "User"}
                        </p>
                        <span className="shrink-0 text-xs text-gray-500">
                          {formatInboxTime(chat.lastMessageTime)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <p className="truncate text-sm text-gray-500">
                          {chat.lastMessage || "Start a conversation"}
                        </p>
                        <div className="flex shrink-0 items-center gap-1">
                          {chat.isPinned && <span title="Pinned">📌</span>}
                          {chat.isMuted && <span title="Muted">🔕</span>}
                          {chat.unreadCount > 0 && (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-xs text-white">
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </section>
      )}

      {/* ACTIVE CHAT */}
      {activeChat && (
        <section className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 dark:border-gray-900">
            {activeChatAvatar ? (
              <img
                src={activeChatAvatar}
                alt=""
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800">
                {isGroupChat(activeChat) ? "👥" : "👤"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{activeChatTitle}</p>
              <p className="text-xs text-gray-500">{activeChatStatus}</p>
            </div>
            {isGroupChat(activeChat) && (
              <span className="text-xs text-gray-500">
                {activeChat.memberCount} members
              </span>
            )}
          </div>

          {/* MESSAGES */}
          <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
            {chatLoading ? (
              <p className="py-10 text-center text-sm text-gray-500">
                Loading messages...
              </p>
            ) : messages.length === 0 ? (
              <div className="py-16 text-center">
                <div className="text-4xl">👋</div>
                <p className="mt-3 font-semibold">Say hello!</p>
                <p className="mt-1 text-sm text-gray-500">
                  Your conversation starts here.
                </p>
              </div>
            ) : (
              messages.map((message) => {
                const mine = message.sender_id === myId;
                const sender = getMessageSender(message.sender_id);
                const reply = getReplyMessage(message.reply_to);
                const summary = getReactionSummary(message.id);

                return (
                  <div
                    key={message.id}
                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[85%] ${mine ? "items-end" : "items-start"} flex flex-col`}>
                      {isGroupChat(activeChat) && !mine && (
                        <span className="mb-1 ml-2 text-xs text-gray-500">
                          {sender || "Member"}
                        </span>
                      )}

                      <div
                        className={`rounded-2xl px-3 py-2 ${
                          mine
                            ? "rounded-br-sm bg-blue-600 text-white"
                            : "rounded-bl-sm bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white"
                        }`}
                      >
                        {reply && (
                          <div className="mb-2 rounded-lg border-l-2 border-blue-400 bg-black/5 px-2 py-1 text-xs dark:bg-white/10">
                            <p className="font-semibold">
                              Replying to {reply.sender_id === myId ? "yourself" : "message"}
                            </p>
                            <p className="truncate">{reply.content || "Media"}</p>
                          </div>
                        )}

                        {message.deleted_at ? (
                          <p className="text-sm italic opacity-70">
                            This message was deleted
                          </p>
                        ) : (
                          <>
                            {message.message_type === "image" && message.media_url && (
                              <img
                                src={message.media_url}
                                alt="Shared image"
                                className="mb-2 max-h-64 max-w-full rounded-xl object-cover"
                              />
                            )}
                            {message.message_type === "video" && message.media_url && (
                              <video
                                src={message.media_url}
                                controls
                                playsInline
                                className="mb-2 max-h-64 max-w-full rounded-xl"
                              />
                            )}
                            {message.message_type === "audio" && message.media_url && (
                              <audio src={message.media_url} controls className="max-w-full" />
                            )}
                            {message.message_type === "file" && message.media_url && (
                              <a
                                href={message.media_url}
                                target="_blank"
                                rel="noreferrer"
                                className="underline"
                              >
                                📎 Open file
                              </a>
                            )}
                            {message.content && (
                              <p className="whitespace-pre-wrap break-words text-sm">
                                {message.content}
                              </p>
                            )}
                          </>
                        )}

                        <div className="mt-1 flex items-center justify-end gap-2 text-[10px] opacity-70">
                          {formatTime(message.created_at)}
                          {mine && (
                            <span>{isMessageRead(message.id) ? "✓✓" : "✓"}</span>
                          )}
                        </div>
                      </div>

                      {summary.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {summary.map((item) => (
                            <button
                              key={item.emoji}
                              onClick={() => toggleReaction(message.id, item.emoji)}
                              className="rounded-full border border-gray-200 bg-white px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-900"
                            >
                              {item.emoji} {item.count}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="mt-1 flex items-center gap-2">
                        <button
                          onClick={() => setReactionMessage(
                            reactionMessage === message.id ? null : message.id
                          )}
                          className="text-xs text-gray-500"
                        >
                          React
                        </button>
                        <button
                          onClick={() => setMessageMenu(
                            messageMenu === message.id ? null : message.id
                          )}
                          className="text-xs text-gray-500"
                        >
                          More
                        </button>
                      </div>

                      {reactionMessage === message.id && (
                        <div className="mt-1 flex gap-2 rounded-full border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900">
                          {["❤️", "😂", "🔥", "👍", "😮", "🙏"].map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => {
                                toggleReaction(message.id, emoji);
                                setReactionMessage(null);
                              }}
                              className="text-lg"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}

                      {messageMenu === message.id && (
                        <div className="mt-1 flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900">
                          <button
                            onClick={() => startReply(message)}
                            className="text-xs"
                          >
                            Reply
                          </button>
                          {mine && message.message_type === "text" && !message.deleted_at && (
                            <button
                              onClick={() => startEdit(message)}
                              className="text-xs"
                            >
                              Edit
                            </button>
                          )}
                          {mine && !message.deleted_at && (
                            <button
                              onClick={() => deleteMessage(message)}
                              className="text-xs text-red-500"
                            >
                              Delete
                            </button>
                          )}
                          <button
                            onClick={cancelMessageAction}
                            className="text-xs text-gray-500"
                          >
                            Close
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* PART 8 CONTINUES BELOW */}
          
          {/* MESSAGE COMPOSER */}
          <div className="sticky bottom-0 border-t border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-black">
            {replyMessage && (
              <div className="mb-2 flex items-center justify-between rounded-lg bg-gray-100 p-2 text-sm dark:bg-gray-900">
                <div className="min-w-0">
                  <p className="font-semibold">Replying to message</p>
                  <p className="truncate text-gray-500">
                    {replyMessage.content || "Media"}
                  </p>
                </div>
                <button onClick={cancelMessageAction} className="px-2 text-lg">
                  ×
                </button>
              </div>
            )}

            {editingMessage && (
              <div className="mb-2 flex items-center justify-between rounded-lg bg-blue-50 p-2 text-sm text-blue-700 dark:bg-blue-950 dark:text-blue-200">
                <span>Editing message</span>
                <button onClick={cancelMessageAction}>Cancel ×</button>
              </div>
            )}

            {showEmoji && (
              <div className="mb-2 flex max-h-28 flex-wrap gap-2 overflow-y-auto rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => addEmoji(emoji)}
                    className="text-xl"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-end gap-2">
              <button
                onClick={() => setShowEmoji(!showEmoji)}
                className="rounded-full p-2 text-xl"
                aria-label="Emoji"
              >
                😊
              </button>

              <label className="cursor-pointer rounded-full p-2 text-xl" title="Photo">
                📷
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) sendPhoto(file);
                    e.currentTarget.value = "";
                  }}
                />
              </label>

              <label className="cursor-pointer rounded-full p-2 text-xl" title="Video">
                🎬
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) sendVideo(file);
                    e.currentTarget.value = "";
                  }}
                />
              </label>

              <label className="cursor-pointer rounded-full p-2 text-xl" title="Voice or audio">
                🎤
                <input
                  ref={voiceInputRef}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) sendVoice(file);
                    e.currentTarget.value = "";
                  }}
                />
              </label>

              <textarea
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  sendTyping();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                rows={1}
                placeholder={editingMessage ? "Edit message..." : "Message..."}
                className="max-h-28 min-h-10 flex-1 resize-none rounded-2xl bg-gray-100 px-4 py-3 text-sm outline-none dark:bg-gray-900"
              />

              <button
                onClick={sendMessage}
                disabled={sending || !text.trim()}
                className="rounded-full bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-40"
              >
                {sending ? "..." : editingMessage ? "Save" : "Send"}
              </button>
            </div>

            {uploadingMedia && (
              <p className="mt-2 text-center text-xs text-blue-600">
                Uploading media...
              </p>
            )}
          </div>
        </section>
      )}

      {/* NEW CHAT MODAL */}
      {showNewChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3">
          <div className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white dark:bg-gray-950">
            <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
              <h2 className="text-lg font-bold">New message</h2>
              <button
                onClick={() => setShowNewChat(false)}
                className="text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search people..."
                className="w-full rounded-full bg-gray-100 px-4 py-3 text-sm outline-none dark:bg-gray-900"
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <p className="p-8 text-center text-sm text-gray-500">
                  No users found.
                </p>
              ) : (
                filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => startNewChat(user)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-900"
                  >
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt=""
                        className="h-11 w-11 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800">
                        👤
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">
                        {user.username || "ChitPix user"}
                      </p>
                      <p className="text-xs text-gray-500">Start conversation</p>
                    </div>
                    <span>›</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* GROUP CREATE MODAL */}
      {showGroupCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3">
          <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white dark:bg-gray-950">
            <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
              <h2 className="text-lg font-bold">Create group</h2>
              <button
                onClick={() => setShowGroupCreate(false)}
                className="text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 p-4">
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                maxLength={50}
                placeholder="Group name"
                className="w-full rounded-xl bg-gray-100 px-4 py-3 text-sm outline-none dark:bg-gray-900"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search members..."
                className="w-full rounded-xl bg-gray-100 px-4 py-3 text-sm outline-none dark:bg-gray-900"
              />
              <p className="text-xs text-gray-500">
                Selected members: {selectedMemberCount}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredGroupUsers.map((user) => {
                const selected = selectedMembers.includes(user.id);

                return (
                  <button
                    key={user.id}
                    onClick={() => toggleGroupMember(user.id)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-900"
                  >
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt=""
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800">
                        👤
                      </div>
                    )}
                    <span className="flex-1 truncate text-sm font-medium">
                      {user.username || "ChitPix user"}
                    </span>
                    <span className="text-lg">
                      {selected ? "☑️" : "⬜"}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-gray-200 p-4 dark:border-gray-800">
              <button
                onClick={createGroupChat}
                disabled={groupLoading || !groupName.trim() || selectedMemberCount < 2}
                className="w-full rounded-full bg-blue-600 py-3 font-semibold text-white disabled:opacity-40"
              >
                {groupLoading ? "Creating..." : "Create group"}
              </button>
              <p className="mt-2 text-center text-xs text-gray-500">
                Select at least 2 other members.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* GROUP MEMBERS MODAL */}
      {showGroupMembers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3">
          <div className="max-h-[80vh] w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-gray-950">
            <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
              <h2 className="font-bold">Group members</h2>
              <button
                onClick={() => setShowGroupMembers(false)}
                className="text-2xl"
              >
                ×
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto p-3">
              {groupMembersLoading ? (
                <p className="p-6 text-center text-sm text-gray-500">
                  Loading members...
                </p>
              ) : groupMembers.length === 0 ? (
                <p className="p-6 text-center text-sm text-gray-500">
                  No members found.
                </p>
              ) : (
                groupMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 border-b border-gray-100 p-3 dark:border-gray-900"
                  >
                    {member.avatar_url ? (
                      <img
                        src={member.avatar_url}
                        alt=""
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800">
                        👤
                      </div>
                    )}
                    <span className="flex-1 truncate text-sm font-semibold">
                      {member.username || "ChitPix user"}
                    </span>
                    {member.role === "admin" && (
                      <span className="text-xs text-blue-600">Admin</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* CHAT OPTIONS */}
      {showChatOptions && activeChat && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center">
          <div className="w-full max-w-md rounded-2xl bg-white p-4 dark:bg-gray-950">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold">Chat settings</h2>
              <button onClick={closeChatOptions} className="text-2xl">
                ×
              </button>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  togglePinChat(activeChat);
                  closeChatOptions();
                }}
                className="w-full rounded-xl bg-gray-100 p-3 text-left text-sm dark:bg-gray-900"
              >
                📌 {activeChat.isPinned ? "Unpin chat" : "Pin chat"}
              </button>

              <button
                onClick={() => {
                  toggleMuteChat(activeChat);
                  closeChatOptions();
                }}
                className="w-full rounded-xl bg-gray-100 p-3 text-left text-sm dark:bg-gray-900"
              >
                🔕 {activeChat.isMuted ? "Unmute chat" : "Mute chat"}
              </button>

              <button
                onClick={() => {
                  toggleArchiveChat(activeChat);
                  closeChatOptions();
                  closeChat();
                }}
                className="w-full rounded-xl bg-gray-100 p-3 text-left text-sm dark:bg-gray-900"
              >
                📁 {activeChat.isArchived ? "Unarchive chat" : "Archive chat"}
              </button>

              {isGroupChat(activeChat) && (
                <button
                  onClick={() => {
                    closeChatOptions();
                    openGroupMembers();
                  }}
                  className="w-full rounded-xl bg-gray-100 p-3 text-left text-sm dark:bg-gray-900"
                >
                  👥 View group members
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ARCHIVED CHATS */}
      {!activeChat && (
        <div className="px-4 pb-3">
          <button
            onClick={() => setShowArchivedChats(!showArchivedChats)}
            className="text-sm font-semibold text-gray-500"
          >
            📁 {showArchivedChats ? "Hide archived chats" : `Archived chats (${archivedChats.length})`}
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  </main>
);
      }

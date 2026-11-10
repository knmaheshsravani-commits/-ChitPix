'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import BottomNav from '../components/BottomNav'
import { supabase } from '../../lib/supabase'

type Profile = {
  id: string
  username: string | null
  avatar_url: string | null
  bio: string | null
}

export default function MessagesPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [myId, setMyId] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError('')

      const { data: authData, error: authError } =
        await supabase.auth.getUser()

      if (authError || !authData.user) {
        setError('Please login to view users.')
        return
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
      console.error('DM Users Error:', err)
      setError(err.message || 'Users load avvaledu.')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user =>
    (user.username || '')
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto pb-24">

        <div className="sticky top-0 z-20 bg-white border-b p-4 flex justify-between items-center">
          <h1 className="font-bold text-xl">Messages</h1>
          <Link href="/" className="text-gray-500 text-xl">
            ✕
          </Link>
        </div>

        <div className="p-4">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search ChitPix users..."
            className="w-full bg-gray-100 rounded-full px-4 py-3 text-sm outline-none"
          />
        </div>

        {loading && (
          <div className="text-center py-10 text-gray-500">
            Loading users...
          </div>
        )}

        {!loading && error && (
          <div className="text-center p-6">
            <p className="text-red-500 text-sm">{error}</p>
            <button
              onClick={loadUsers}
              className="mt-3 bg-blue-500 text-white px-5 py-2 rounded-full"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filteredUsers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-3">💬</p>
            <p className="font-semibold">No users found</p>
            <p className="text-sm mt-1">
              ChitPix users ikkada kanipistharu.
            </p>
          </div>
        )}

        {!loading && !error && filteredUsers.map(user => (
          <div
            key={user.id}
            className="flex items-center gap-3 px-4 py-3 border-b border-gray-100"
          >
            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center shrink-0">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl">👤</span>
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

            <span className="text-blue-500 text-sm font-semibold">
              Message
            </span>
          </div>
        ))}

      </div>

      <BottomNav />
    </div>
  )
}

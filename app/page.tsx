"use client"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { Home, Search, Clapperboard, User, Heart, MessageCircle, Send, Plus, LogOut, Image as ImageIcon } from "lucide-react"
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

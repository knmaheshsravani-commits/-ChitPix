import { Heart, MessageCircle, Send, Bookmark } from 'lucide-react';

// old emoji div ni teesi, idi pettu
<div style={{display:'flex', gap:'32px', padding:'52px 32px', alignItems:'center'}}>
  <Heart size={52} strokeWidth={1.7} style={{cursor:'pointer'}} />
  <MessageCircle size={52} strokeWidth={1.7} style={{cursor:'pointer'}} />
  <Send size={52} strokeWidth={1.7} style={{cursor:'pointer', transform:'rotate(-15deg)'}} />
  <Bookmark size={52} strokeWidth={1.7} style={{marginLeft:'auto', cursor:'pointer'}} />
</div>

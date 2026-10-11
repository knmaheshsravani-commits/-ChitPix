export default function PrivacyPolicy() {
  return (
    <div style={{minHeight:'100vh', background:'black', color:'white', padding:'24px', lineHeight:'1.7'}}>
      <div style={{maxWidth:'768px', margin:'0 auto'}}>
        <h1 style={{fontSize:'28px', fontWeight:'bold'}}>Privacy Policy - ChitPix</h1>
        <p style={{color:'gray', marginBottom:'24px'}}>Last Updated: May 13, 2026 | Effective: May 13, 2026</p>

        <p>At ChitPix, we respect your privacy. This policy explains how we collect, use, and protect your data.</p>

        <h2 style={{fontSize:'20px', fontWeight:'600', marginTop:'28px'}}>1. Data We Collect</h2>
        <ul style={{listStyle:'disc', paddingLeft:'20px', color:'#d1d5db'}}>
          <li><b>Account:</b> Name, email, profile photo via Google Login (Supabase Auth)</li>
          <li><b>Content:</b> Photos, videos, captions, likes, comments you post (Stored securely in Cloudflare R2 & Supabase)</li>
          <li><b>Device:</b> Advertising ID for ads, device info, crash logs</li>
          <li><b>Usage:</b> How you use feed, reels to improve app</li>
        </ul>

        <h2 style={{fontSize:'20px', fontWeight:'600', marginTop:'28px'}}>2. How We Use Data</h2>
        <p style={{color:'#d1d5db'}}>To provide social feed, reels, profiles, secure login, improve app, and show ads to keep ChitPix free. We never sell your personal data to third parties.</p>

        <h2 style={{fontSize:'20px', fontWeight:'600', marginTop:'28px'}}>3. Storage & Security</h2>
        <p style={{color:'#d1d5db'}}>Your data is stored encrypted on Supabase (Postgres) and Cloudflare R2 (US/EU). We use industry-standard security. However no method is 100% secure.</p>

        <h2 style={{fontSize:'20px', fontWeight:'600', marginTop:'28px'}}>4. Third-Party Services</h2>
        <ul style={{listStyle:'disc', paddingLeft:'20px', color:'#d1d5db'}}>
          <li>Google Sign-In - Authentication</li>
          <li>Supabase - Database & Auth</li>
          <li>Cloudflare R2 - Media Storage</li>
          <li>Google AdMob - Ads (may use Advertising ID for personalized ads)</li>
          <li>Vercel - Hosting</li>
        </ul>

        <h2 style={{fontSize:'20px', fontWeight:'600', marginTop:'28px'}}>5. Ads & Opt-Out</h2>
        <p style={{color:'#d1d5db'}}>We use Google AdMob. AdMob may collect Advertising ID. You can opt-out of personalized ads: Google Settings &gt; Ads &gt; Opt out of Ads Personalization.</p>

        <h2 style={{fontSize:'20px', fontWeight:'600', marginTop:'28px'}}>6. Your Rights & Data Deletion</h2>
        <p style={{color:'#d1d5db'}}>You can: Access, update, delete your data anytime.<br/><b>Delete Account:</b> Go to ChitPix &gt; Settings &gt; Delete Account. This permanently deletes all your posts, profile, and data from R2 & Supabase within 7 days. Or email us at support@chitpix.com to request deletion.</p>

        <h2 style={{fontSize:'20px', fontWeight:'600', marginTop:'28px'}}>7. Children's Privacy</h2>
        <p style={{color:'#d1d5db'}}>ChitPix is not for children under 13. We do not knowingly collect data from children under 13.</p>

        <h2 style={{fontSize:'20px', fontWeight:'600', marginTop:'28px'}}>8. Contact & Changes</h2>
        <p style={{color:'#d1d5db'}}>If we change this policy, we will update this page. For questions:<br/>Email: support@chitpix.com<br/>Website: https://www.chitpix.com<br/>Address: ChitPix, Hyderabad, India</p>

        <br/><br/>
        <a href="/" style={{color:'#a855f7', border:'1px solid #a855f7', padding:'8px 16px', borderRadius:'8px', textDecoration:'none'}}>Back to ChitPix</a>
      </div>
    </div>
  )
}

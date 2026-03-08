const {createClient}=require('@supabase/supabase-js');
const bcrypt=require('bcryptjs');
const s=createClient('https://jumpfblgdhnbvzrnmuff.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1bXBmYmxnZGhuYnZ6cm5tdWZmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ2MTY1NiwiZXhwIjoyMDg4MDM3NjU2fQ.kNeINvqx-yu7w0VKtulSuPw0mG1ItdVeblbRV-k6oYA',{auth:{autoRefreshToken:false,persistSession:false}});

s.from('auth_users_view').select('id,encrypted_password').eq('email','adminpsb@gmail.com').single().then(async({data,error})=>{
  console.log('view error:',error?.message);
  if(!data) return console.log('no data from view');
  console.log('hash:',data.encrypted_password.substring(0,20));
  const valid=await bcrypt.compare('password',data.encrypted_password);
  console.log('bcrypt valid:',valid);
  const {data:p,error:pe}=await s.from('profiles').select('id,email,role').eq('id',data.id).single();
  console.log('profile:',JSON.stringify(p),'error:',pe?.message);
});

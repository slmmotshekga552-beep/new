/* Online storage for the portal: accounts, audit data and evidence files. */
(function(){
  const URL_ = 'https://stixurslvtjswukupxje.supabase.co';
  const KEY = 'sb_publishable_s9ChZiLjC0JUWv7xBfpYig_oQo_6plr';
  const sb = window.supabase.createClient(URL_, KEY, { auth: { persistSession: true, storageKey: 'ecompliance-auth' } });
  const emailFor = un => un + '@users.ecompliance.app';
  let uid = null, nextAudit = '', saveTimer = null, pending = null;

  function toAccount(p){ return { firstName:p.first_name, surname:p.surname, uniqueNumber:p.unique_number, phone:p.phone, email:p.email, cnc:p.cnc, position:p.position, pin:p.pin || undefined }; }

  async function afterAuth(user){
    uid = user.id;
    const { data: p, error } = await sb.from('profiles').select('*').eq('id', uid).single();
    if(error || !p) throw new Error('profile');
    return toAccount(p);
  }

  async function flush(){
    if(!uid || !pending) return;
    const store = pending; pending = null;
    const { error } = await sb.from('user_data').upsert({ user_id: uid, store, next_audit: nextAudit || null, updated_at: new Date().toISOString() });
    if(error && typeof showToast === 'function') showToast('Could not save online. Check your internet connection.');
  }

  window.cloud = {
    async signIn(un, pw){
      const { data, error } = await sb.auth.signInWithPassword({ email: emailFor(un), password: pw });
      if(error) return null;
      return afterAuth(data.user);
    },
    async signUp(a){
      const { data, error } = await sb.auth.signUp({ email: emailFor(a.uniqueNumber), password: a.password,
        options: { data: { unique_number:a.uniqueNumber, first_name:a.firstName, surname:a.surname, phone:a.phone, contact_email:a.email, cnc:a.cnc, position:a.position } } });
      if(error) return { error: /already/i.test(error.message) ? 'exists' : error.message };
      if(!data.session){ const r = await sb.auth.signInWithPassword({ email: emailFor(a.uniqueNumber), password: a.password }); if(r.error) return { error: r.error.message }; }
      return { account: await afterAuth(data.user) };
    },
    async signOut(){ await flush(); uid = null; nextAudit = ''; await sb.auth.signOut(); },
    async loadStore(){
      if(!uid) return null;
      const { data } = await sb.from('user_data').select('store,next_audit').eq('user_id', uid).maybeSingle();
      nextAudit = (data && data.next_audit) || '';
      return (data && data.store) || {};
    },
    saveStore(store){
      if(!uid) return true;
      pending = JSON.parse(JSON.stringify(store));
      clearTimeout(saveTimer); saveTimer = setTimeout(flush, 400);
      return true;
    },
    flush,
    getNextAudit(){ return nextAudit; },
    setNextAudit(v){ nextAudit = v || ''; if(uid){ if(pending) flush(); else sb.from('user_data').update({ next_audit: nextAudit || null }).eq('user_id', uid).then(()=>{}); } },
    async updateProfile(fields){ if(uid) await sb.from('profiles').update(fields).eq('id', uid); },
    async file(mode, key, value){
      if(!uid) throw new Error('Not signed in');
      const path = uid + '/' + key;
      const bucket = sb.storage.from('evidence');
      if(mode === 'put'){ const { error } = await bucket.upload(path, value, { upsert: true, contentType: value.type || 'application/octet-stream' }); if(error) throw error; return; }
      if(mode === 'delete'){ await bucket.remove([path]); return; }
      const { data, error } = await bucket.download(path); if(error) return null; return data;
    },
  };
  window.addEventListener('beforeunload', () => { if(pending) flush(); });
})();

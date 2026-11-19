import crypto from 'node:crypto';
const hmac=(key,value)=>crypto.createHmac('sha256',key).update(value).digest('hex');
const equal=(a,b)=>a.length===b.length&&crypto.timingSafeEqual(Buffer.from(a),Buffer.from(b));
export default async function handler(req,res){
res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
if(req.method!=='POST')return res.status(405).json({error:'Méthode non autorisée'});
const secret=process.env.YARO_ADMIN_API_KEY,pepper=process.env.YARO_CODE_PEPPER,url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!secret||!pepper||!url||!key)return res.status(503).json({error:'Configuration manquante'});
const supplied=(req.headers.authorization||'').replace(/^Bearer\s+/i,'');
if(!supplied||!equal(hmac(secret,supplied),hmac(secret,secret)))return res.status(401).json({error:'Non autorisé'});
const name=typeof req.body?.prospect==='string'?req.body.prospect.trim().slice(0,100):'Prospect';
const code='YARO-'+crypto.randomBytes(9).toString('hex').toUpperCase();
const expiry=new Date(Date.now()+24*60*60*1000).toISOString();
try{
const response=await fetch(url.replace(/\/$/,'')+'/rest/v1/yaro_pricing_codes',{method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({code_hash:hmac(pepper,'code:'+code),prospect_label:name||'Prospect',expires_at:expiry})});
if(!response.ok)throw new Error('Database unavailable');
return res.status(201).json({code,expires_at:expiry,validity_hours:24});
}catch(e){console.error('Code creation error',e.message);return res.status(503).json({error:'Création impossible'})}
}
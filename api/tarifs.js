import crypto from 'node:crypto';
const SESSION_COOKIE='yaro_pricing_session';
const HOURS=24;
const catalog=[
{title:'Conseil & stratégie',description:'Comprendre l’activité et définir des priorités.',offers:[
{name:'Diagnostic express',detail:'Entretien, premiers constats et recommandations prioritaires.',price:'Dès 75 000 FCFA'},
{name:'Audit commercial et opérationnel',detail:'Ventes, organisation, processus, stocks et plan d’action.',price:'Dès 250 000 FCFA'},
{name:'Diagnostic global d’entreprise',detail:'Analyse transversale, restitution et feuille de route.',price:'Dès 600 000 FCFA'},
{name:'Stratégie de développement',detail:'Positionnement, offres, acquisition et objectifs.',price:'Dès 350 000 FCFA'}]},
{title:'Performance & analyse',description:'Mesurer les résultats pour améliorer la gestion.',offers:[
{name:'Analyse de rentabilité et des coûts',detail:'Charges, marges, postes de dépenses et pistes d’optimisation, hors expertise comptable réglementée.',price:'Dès 300 000 FCFA'},
{name:'Audit marketing et données',detail:'Google Analytics 4, Search Console, parcours client et plan d’optimisation.',price:'Dès 200 000 FCFA'},
{name:'Pilotage de performance',detail:'Tableaux de bord, suivi KPI et accompagnement régulier.',price:'Dès 150 000 FCFA / mois'}]},
{title:'Solutions digitales',description:'Conception et déploiement d’outils adaptés.',offers:[
{name:'Site vitrine',detail:'Présentation professionnelle, responsive, référencement initial.',price:'Dès 350 000 FCFA'},
{name:'Site institutionnel',detail:'Pages éditoriales, documents et gestion des contenus.',price:'Dès 850 000 FCFA'},
{name:'Site e-commerce',detail:'Catalogue, parcours d’achat et configuration des paiements.',price:'Dès 950 000 FCFA'},
{name:'Plateforme métier / CRM',detail:'Gestion clients, workflows et indicateurs métier.',price:'Dès 1 800 000 FCFA'},
{name:'Application iOS ou Android',detail:'Application mobile sur périmètre MVP défini.',price:'Dès 2 500 000 FCFA'},
{name:'Application iOS et Android',detail:'Deux plateformes mobiles avec fonctionnalités définies.',price:'Dès 3 500 000 FCFA'}]},
{title:'IA, intégrations & automatisation',description:'Réduire les tâches manuelles et mieux exploiter les données.',offers:[
{name:'Automatisation / agent IA',detail:'Workflows, assistants, rapports et alertes adaptés au besoin.',price:'Dès 450 000 FCFA'},
{name:'Intégrations API et reporting',detail:'Connexion d’outils, automatisation de données et tableaux de bord.',price:'Sur devis'}]},
{title:'Maintenance & accompagnement',description:'Assurer la continuité et faire évoluer les solutions.',offers:[
{name:'Maintenance site simple',detail:'Suivi technique et corrections courantes selon contrat.',price:'Dès 35 000 FCFA / mois'},
{name:'Maintenance et assistance renforcées',detail:'Support, mises à jour et petites évolutions encadrées.',price:'Dès 75 000 FCFA / mois'},
{name:'Suivi de performance continu',detail:'Analyse périodique, recommandations et révision du plan d’action.',price:'Dès 150 000 FCFA / mois'}]}];
const config=()=>{for(const k of ['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','YARO_CODE_PEPPER','YARO_SESSION_SECRET'])if(!process.env[k])throw new Error('Configuration manquante');};
const hmac=(key,value)=>crypto.createHmac('sha256',key).update(value).digest('hex');
const equal=(a,b)=>{if(!a||!b||a.length!==b.length)return false;return crypto.timingSafeEqual(Buffer.from(a),Buffer.from(b))};
const db=async(path,options={})=>{const res=await fetch(process.env.SUPABASE_URL.replace(/\/$/,'')+'/rest/v1/'+path,{...options,headers:{apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+process.env.SUPABASE_SERVICE_ROLE_KEY,'Content-Type':'application/json',...(options.headers||{})}});if(!res.ok)throw new Error('Database unavailable');return res.status===204?null:res.json()};
function cookie(res,value,maxAge){res.setHeader('Set-Cookie',SESSION_COOKIE+'='+encodeURIComponent(value)+'; Path=/api/tarifs; HttpOnly; Secure; SameSite=Strict; Max-Age='+maxAge)}
const fail=(res,status,message)=>res.status(status).json({error:message});
export default async function handler(req,res){
res.setHeader('Cache-Control','no-store, private');res.setHeader('X-Content-Type-Options','nosniff');
if(!['GET','POST'].includes(req.method))return fail(res,405,'Méthode non autorisée');
try{config();if(req.method==='GET'){
const raw=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(SESSION_COOKIE+'='))?.slice(SESSION_COOKIE.length+1);
if(!raw)return fail(res,401,'Code requis');
const token=decodeURIComponent(raw);const parts=token.split('.');if(parts.length!==3)return fail(res,401,'Session expirée');
const [id,expiry,signature]=parts;if(!/^\d+$/.test(expiry)||Number(expiry)<Date.now()||!equal(signature,hmac(process.env.YARO_SESSION_SECRET,id+'.'+expiry)))return fail(res,401,'Session expirée');
const rows=await db('yaro_pricing_codes?id=eq.'+encodeURIComponent(id)+'&select=id,expires_at,revoked_at');
if(!rows?.length||rows[0].revoked_at||Date.parse(rows[0].expires_at)<Date.now())return fail(res,401,'Session expirée');
return res.status(200).json({catalog});
}
const code=typeof req.body?.code==='string'?req.body.code.trim().toUpperCase():'';
if(!/^[A-Z0-9-]{8,80}$/.test(code))return fail(res,400,'Code invalide');
const ip=String(req.headers['x-forwarded-for']||'unknown').split(',')[0].trim().slice(0,100);
const ipHash=hmac(process.env.YARO_CODE_PEPPER,'ip:'+ip);
const gate=await fetch(process.env.SUPABASE_URL.replace(/\/$/,'')+'/rest/v1/rpc/yaro_pricing_rate_limit',{method:'POST',headers:{apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+process.env.SUPABASE_SERVICE_ROLE_KEY,'Content-Type':'application/json'},body:JSON.stringify({visitor_hash:ipHash})});
if(!gate.ok)throw new Error('Rate limit unavailable');if(!(await gate.json()))return fail(res,429,'Trop de tentatives. Réessayez plus tard.');
const hash=hmac(process.env.YARO_CODE_PEPPER,'code:'+code);
const rows=await db('yaro_pricing_codes?code_hash=eq.'+hash+'&select=id,expires_at,revoked_at');
if(!rows?.length||rows[0].revoked_at||Date.parse(rows[0].expires_at)<=Date.now())return fail(res,401,'Code invalide ou expiré');
const expires=Date.parse(rows[0].expires_at),signature=hmac(process.env.YARO_SESSION_SECRET,rows[0].id+'.'+expires);
cookie(res,rows[0].id+'.'+expires+'.'+signature,Math.max(1,Math.floor((expires-Date.now())/1000)));
return res.status(200).json({catalog});
}catch(error){console.error('Pricing access error',error.message);return fail(res,503,'Service temporairement indisponible')}
}
/* Portable authoritative Pişti engine. Original rules are unchanged. */
const engineModules = Object.create(null), engineCache = Object.create(null);
const secureMath = Object.create(Math);
secureMath.random = () => crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
function engineRequire(name) {
 if (name === 'node:crypto') return {webcrypto:crypto};
 if (!engineModules[name]) throw Error('Motor modülü bulunamadı.');
 if (!engineCache[name]) {const module={exports:{}};engineCache[name]=module;engineModules[name](module,module.exports,engineRequire,secureMath);}
 return engineCache[name].exports;
}
engineModules['./pisti-core.cjs'] = function(module,exports,require,Math){
// Pişti tekli/eşli hamle ve bot seçim fonksiyonları özgün örnekten alınmıştır.
module.exports=function(meta,count){
if(count===2){const ME='__human__'+meta.id,users=Array.from({length:count},(_,i)=>({isim:i===0?ME:'__bot__'+meta.id+'_'+i,gorunenIsim:i===0?ME:'__bot__'+meta.id+'_'+i,otomatikBot:meta.roster?!(meta.roster[i]?.id!=null&&meta.roster[i].active!==false):i!==0,vip:meta.roster?!!meta.roster[i]?.vip:i===0&&meta.vip,points:0,oyunPuani:0}));
 const aktifMasa={id:meta.id,ad:'Masa '+meta.table,max:count,oyuncular:users.map(u=>u.isim),sahibi:ME,hedefPuan:Number(meta.options?.hedefPuan)||51},aktifOda={id:meta.room},roomChat={},K={users:'users',roomChat:'chat'};
 const kisiBul=n=>users.find(u=>u.isim===n),gercekUye=u=>!!u&&!u.otomatikBot,vipMi=n=>!!kisiBul(n)?.vip,save=()=>{},toast=()=>{};
 function profilPuanEkle(n,amount,preserve=false){const u=kisiBul(n);if(!u)return;const value=u.points+(preserve?0:amount);for(const k of ['points','puan','oyunPuani','gameScore','score'])u[k]=value;}
 const window={crypto:require('node:crypto').webcrypto,ofMasadaCezaAktif:()=>users.filter(gercekUye).length>=2,masaIzleyiciMi:()=>false,profilPuanEkle};

window.pistiKazananBonusu=function(g,seats,esli){
 if(g.bonusOdendi)return '';
 const bonus=Number(g.bonusHavuz||0);
 const toplam=seats.reduce((n,i)=>n+Number(g.pistiAdet?.[i]||0),0);
 const kazananlar=esli?(toplam>=3?seats:[]):seats.filter(i=>Number(g.pistiAdet?.[i]||0)>=3);
 if(!kazananlar.length||bonus<=0)return '';
 g.bonusOdendi=true;
 if(esli){g.kazanilanBonus=bonus;g.bonusHavuz=50;}
 const mesaj=[];
 kazananlar.forEach(function(i){
   const isim=esli?aktifMasa.oyuncular[i]:(window.masaBotIsliyor?aktifMasa.oyuncular[0]:ME);
   const u=kisiBul(isim);
   if(!u)return;
   const puan=Number(u.oyunPuani??u.puan??u.gameScore??0)+bonus;
   ['oyunPuani','puan','gameScore','score','points'].forEach(k=>u[k]=puan);
   save(K.users,users);
   if(typeof profilPuanEkle==='function')profilPuanEkle(isim,bonus,true);
   mesaj.push((u.gorunenIsim||isim)+' · Bonus kazandınız! +'+bonus+' puan');
   if(isim===ME&&window.OF_AUTH?.user&&!window.masaBotIsliyor)toast('🎁 Bonus kazandınız! +'+bonus+' puan');
 });
 if(mesaj.length&&bonus>500&&aktifOda){
   const masaAdi=String(aktifMasa?.ad||'Masa');
   const masaNo=masaAdi.match(/\d+/)?.[0];
   const masaEtiketi=masaNo?'Masa '+masaNo:masaAdi;
   let nickler;
   if(esli){
     const ilk=kazananlar[0],takim=ilk%2;
     nickler=[takim,takim+2].map(function(i){
       const isim=aktifMasa?.oyuncular?.[i];
       const u=isim&&kisiBul(isim);
       return u?.gorunenIsim||isim;
     }).filter(Boolean);
   }else nickler=[kisiBul(ME)?.gorunenIsim||ME];
   const key='room_'+aktifOda.id;
   roomChat[key]||=[];
   roomChat[key].push({
     id:Date.now()+Math.floor(Math.random()*999),
     isim:'',
     mesaj:masaEtiketi+' bonusu: '+nickler.join(' ve ')+' +'+bonus+' puan kazandı.',
     tarih:Date.now(),
     sistem:true
   });
   save(K.roomChat,roomChat);
   if(typeof fixedRoomRender==='function')fixedRoomRender();
 }
 return mesaj.length?' · 🎁 '+mesaj.join(' · '):'';
};
 const suits=["♠","♥","♦","♣"], ranks=["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
 function deste(){
   const d=[];for(const s of suits)for(const r of ranks)d.push({s,r});

   /* Her yeni 52'lik deste için güçlü Fisher-Yates karıştırma.
      crypto varsa tarafsız rastgele sayı kullanır; yoksa Math.random'a döner. */
   function rnd(max){
     if(max<=1)return 0;
     try{
       if(window.crypto?.getRandomValues){
         const lim=Math.floor(0x100000000/max)*max;
         const a=new Uint32Array(1);
         do{window.crypto.getRandomValues(a)}while(a[0]>=lim);
         return a[0]%max;
       }
     }catch(e){}
     return Math.floor(Math.random()*max);
   }

   /* Üç bağımsız Fisher-Yates turu: her deste yeniden ve güçlü biçimde karışır. */
   for(let tur=0;tur<3;tur++){
     for(let i=d.length-1;i>0;i--){
       const j=rnd(i+1);
       [d[i],d[j]]=[d[j],d[i]];
     }
   }
   return d;
 }
 function yeniEl(eskiSkor=[0,0]){
   let d=deste(), orta=[];
   orta.push(d.pop(),d.pop(),d.pop());
   let acik=d.pop();
   while(acik.r==="J"){d.unshift(acik);acik=d.pop()}
   orta.push(acik);

   const desteId=(window.crypto?.randomUUID?.()||
     (Date.now().toString(36)+"-"+Math.random().toString(36).slice(2)));

   return {
     deck:d,
     hands:[[],[]],
     pile:orta,
     captured:[[],[]],
     pisti:[0,0],
     pistiAdet:[0,0],
     bonusHavuz:50,
     scores:eskiSkor,
     last:null,
     dealer:Math.max(0,(aktifMasa.oyuncular||[]).indexOf(aktifMasa.sahibi||ME)),
     turn:0,
     started:true,
     finished:false,
     msg:"Oyun başladı.",
     bot:true,

     /* Her 52'lik destenin sadece başlangıçtaki 4 kartı. */
     desteId,
     ilkMasaKartlari:orta.map(c=>({r:c.r,s:c.s})),
     ilkAlimSeq:0,
     ilkAlimAlan:null,
     ilkAlimKartlari:[],

     /* Son atılan kartı herkesin görebilmesi için. */
     sonAtmaSeq:0,
     sonAtilanKart:null,
     sonAtan:null,
     sonAtmaZamani:0,

     /* Eş geçme bildirimi sadece gerçek olayda bir kez çalışsın. */
     esCezaSeq:0,
     esCezaSeat:null
   };
 }
 function dagit(g){
   if(g.hands[0].length||g.hands[1].length)return;
   for(let k=0;k<4;k++)for(let p=0;p<2;p++)if(g.deck.length)g.hands[p].push(g.deck.pop());
 }
 function kartPuani(arr){
   let n=0;for(const c of arr){if(c.r==="A"||c.r==="J")n++;if(c.s==="♦"&&c.r==="10")n+=3;if(c.s==="♣"&&c.r==="2")n+=2}return n;
 }
 function turBitir(g){
   window.ofMasaRenkElBitti?.(aktifMasa,g);
   if(g.pile.length && g.last!=null){g.captured[g.last].push(...g.pile);g.pile=[]}
   let a=kartPuani(g.captured[0])+g.pisti[0], b=kartPuani(g.captured[1])+g.pisti[1];
   if(g.captured[0].length>g.captured[1].length)a+=3;
   else if(g.captured[1].length>g.captured[0].length)b+=3;
   g.scores[0]+=a;g.scores[1]+=b;
   g.msg=`El bitti: Sen +${a}, Rakip +${b}`;
   const hedef=Number(aktifMasa?.hedefPuan||51);
   if(g.scores[0]>=hedef || g.scores[1]>=hedef){
     g.finished=true;
     if(g.scores[0]>=hedef && g.scores[0]>=g.scores[1]){
       g.msg="🏆 Kazandınız! +250 oyuncu puanı";
       g.msg+=window.pistiKazananBonusu(g,[0],false);
       if(!g.profileAwarded){const n=aktifMasa.oyuncular?.[0];if(n&&gercekUye(kisiBul(n)))profilPuanEkle(n,250);g.profileAwarded=true}
     }else{
       const kayip=vipMi(ME)?125:200;
       g.msg="Kaybettiniz. -"+kayip+" oyuncu puanı";
       if(!g.profileAwarded){const n=aktifMasa.oyuncular?.[0];if(n&&gercekUye(kisiBul(n))&&window.ofMasadaCezaAktif(aktifMasa))profilPuanEkle(n,-kayip);g.profileAwarded=true}
     }
   }else{
     const oncekiBonus=Number(g.bonusHavuz||50);
     const adet=Array.isArray(g.pistiAdet)?g.pistiAdet.slice(0,2):[0,0];
     const n=yeniEl(g.scores);n.bot=g.bot;n.botSeat=g.botSeat;n.botIsim=g.botIsim;
     n.dealer=1-Number(g.dealer??1);n.turn=1-n.dealer;
     n.bonusHavuz=oncekiBonus+50;
     n.pistiAdet=adet;
     Object.assign(g,n);dagit(g);
   }
 }
 function oyna(g,p,i){
   if(window.masaIzleyiciMi?.()&&!window.masaBotIsliyor)return;
   if(g.finished||g.turn!==p||!g.hands[p][i])return;

   const top=g.pile[g.pile.length-1], secilen=g.hands[p][i];
   const esGecti=window.ofMasadaCezaAktif(aktifMasa) && !!top && secilen.r!==top.r &&
     g.hands[p].some((x,ix)=>ix!==i&&x.r===top.r);

   /* Ceza sadece gerçekten elinde aynı değer varken başka kart atarsa oluşur.
      Eski ceza mesajı sonraki normal hamlelere taşınmaz. */
   if(esGecti){
     g.scores[p]=Number(g.scores[p]||0)-5;
     g.esCezaSeq=Number(g.esCezaSeq||0)+1;
     g.esCezaSeat=p;
     g.msg="ES_GECME_CEZASI";
   }else if(g.msg==="ES_GECME_CEZASI"){
     g.msg="";
   }

   const c=g.hands[p].splice(i,1)[0], tek=g.pile.length===1;

   /* Hangi kart atıldıysa herkes görebilsin. */
   g.sonAtmaSeq=Number(g.sonAtmaSeq||0)+1;
   g.sonAtilanKart={r:c.r,s:c.s};
   g.sonAtan=p;
   g.sonAtmaZamani=Date.now();

   const al=top && (c.r===top.r || c.r==="J");
   if(al){

     /* Sadece 52'lik destenin BAŞLANGIÇTAKİ 4 kartı ilk kez alındığında
        bir kere kaydet. Sonraki alınan kartlar bildirimde asla gösterilmez. */
     if(!Number(g.ilkAlimSeq||0)){
       g.ilkAlimSeq=1;
       g.ilkAlimAlan=p;
       g.ilkAlimKartlari=Array.isArray(g.ilkMasaKartlari)
         ? g.ilkMasaKartlari.map(x=>({r:x.r,s:x.s}))
         : [];
     }
     if(tek){
       let pistiOldu=false;
       if(c.r==="J" && top.r==="J"){g.pisti[p]+=20;pistiOldu=true}
       else if(c.r===top.r){g.pisti[p]+=10;pistiOldu=true}
       if(pistiOldu){
         window.pistiAlkisEfekti?.();
         g.pistiKartlari ||= [[],[],[],[]];g.pistiKartlari[p] ||= [];g.pistiKartlari[p].push({r:c.r,s:c.s});g.pistiKartlari[p]=g.pistiKartlari[p].slice(-3);
         if(!Array.isArray(g.pistiAdet))g.pistiAdet=[0,0];
         g.pistiAdet[p]=Number(g.pistiAdet[p]||0)+1;
       }
     }
     g.pile.push(c);g.captured[p].push(...g.pile);g.pile=[];g.last=p;g.sonAlimSeq=Number(g.sonAlimSeq||0)+1;g.sonAlan=p;g.sonAlimZamani=Date.now();
   }else g.pile.push(c);
   g.turn=1-p;
   if(!g.hands[0].length&&!g.hands[1].length){
     if(g.deck.length)dagit(g);
     else return turBitir(g);
   }
 }
 function botPuanKartiMi(c){
   if(!c)return false;
   return c.r==="A" || c.r==="J" ||
          (c.s==="♦" && c.r==="10") ||
          (c.s==="♣" && c.r==="2");
 }

 function botKartSecTekli(g,p){
   const el=g.hands[p]||[];
   const top=g.pile[g.pile.length-1];
   if(!el.length)return -1;

   /* 1) EN ÖNEMLİ KURAL:
      Yerdeki üst kartın aynı DEĞERİ/NUMARASI elde varsa bot onu atmak zorunda.
      Renk/suit önemli değil. Böylece bot eş geçemez. */
   if(top){
     const ayni=el.findIndex(c=>c.r===top.r);
     if(ayni>=0)return ayni;
   }

   const vale=el.findIndex(c=>c.r==="J");

   if(top && vale>=0){
     /* 2) 52'lik destenin başlangıçtaki masa kartları henüz kimse tarafından
        alınmadıysa, aynı değer yokken Vale ile almak ZORUNLU. */
     const ilkMasaAlinmadi=!Number(g.ilkAlimSeq||0);
     if(ilkMasaAlinmadi)return vale;

     /* 3) Yere puan veren kart atıldıysa ve aynı değeri yoksa,
        Vale varsa hemen al. */
     if(botPuanKartiMi(top))return vale;
   }

   /* Masada kart varsa elde 2 kart kaldığında Vale atılabilir; masa boşsa Vale son karta saklanır. */
   if(vale>=0 && el.length<=2 && g.pile.length>0)return vale;

   /* 4) Normal atışta Vale'leri ve puan veren kartları sona sakla.
      Önce puan vermeyen, Vale olmayan kartları at. */
   let aday=[];
   el.forEach((c,idx)=>{
     if(c.r!=="J" && !botPuanKartiMi(c))aday.push(idx);
   });
   if(aday.length)return aday[Math.floor(Math.random()*aday.length)];

   /* 5) Puan vermeyen kalmadıysa, Vale dışındaki puan kartlarından at.
      Böylece 1 Vale son karta, 2 Vale son 2 karta, 3 Vale son 3 karta kalır. */
   aday=[];
   el.forEach((c,idx)=>{if(c.r!=="J")aday.push(idx)});
   if(aday.length)return aday[Math.floor(Math.random()*aday.length)];

   /* 6) Elde sadece Vale kaldıysa Vale'yi oyna. */
   return 0;
 }

return {create(){const g=yeniEl([0,0]);dagit(g);g.engine='oyunalem-pisti';g.started=true;return g;},
 act(g,seat,a){if(g.finished||g.turn!==seat||a.type!=='play'||!Number.isInteger(a.index)||!g.hands[seat]?.[a.index])return {ok:false,error:'Sıra veya kart geçersiz.'};oyna(g,seat,a.index);return {ok:true};},
 bot(g){if(g.finished)return false;const seat=g.turn,i=botKartSecTekli(g,seat);if(i<0)return false;oyna(g,seat,i);return true;},reward:()=>users[0].points,rewards:()=>Object.fromEntries(users.flatMap((u,i)=>gercekUye(u)?[[i,u.points]]:[]))};
}
else{const ME='__human__'+meta.id,users=Array.from({length:count},(_,i)=>({isim:i===0?ME:'__bot__'+meta.id+'_'+i,gorunenIsim:i===0?ME:'__bot__'+meta.id+'_'+i,otomatikBot:meta.roster?!(meta.roster[i]?.id!=null&&meta.roster[i].active!==false):i!==0,vip:meta.roster?!!meta.roster[i]?.vip:i===0&&meta.vip,points:0,oyunPuani:0}));
 const aktifMasa={id:meta.id,ad:'Masa '+meta.table,max:count,oyuncular:users.map(u=>u.isim),sahibi:ME,hedefPuan:Number(meta.options?.hedefPuan)||51},aktifOda={id:meta.room},roomChat={},K={users:'users',roomChat:'chat'};
 const kisiBul=n=>users.find(u=>u.isim===n),gercekUye=u=>!!u&&!u.otomatikBot,vipMi=n=>!!kisiBul(n)?.vip,save=()=>{},toast=()=>{};
 function profilPuanEkle(n,amount,preserve=false){const u=kisiBul(n);if(!u)return;const value=u.points+(preserve?0:amount);for(const k of ['points','puan','oyunPuani','gameScore','score'])u[k]=value;}
 const window={crypto:require('node:crypto').webcrypto,ofMasadaCezaAktif:()=>users.filter(gercekUye).length>=2,masaIzleyiciMi:()=>false,profilPuanEkle};

window.pistiKazananBonusu=function(g,seats,esli){
 if(g.bonusOdendi)return '';
 const bonus=Number(g.bonusHavuz||0);
 const toplam=seats.reduce((n,i)=>n+Number(g.pistiAdet?.[i]||0),0);
 const kazananlar=esli?(toplam>=3?seats:[]):seats.filter(i=>Number(g.pistiAdet?.[i]||0)>=3);
 if(!kazananlar.length||bonus<=0)return '';
 g.bonusOdendi=true;
 if(esli){g.kazanilanBonus=bonus;g.bonusHavuz=50;}
 const mesaj=[];
 kazananlar.forEach(function(i){
   const isim=esli?aktifMasa.oyuncular[i]:(window.masaBotIsliyor?aktifMasa.oyuncular[0]:ME);
   const u=kisiBul(isim);
   if(!u)return;
   const puan=Number(u.oyunPuani??u.puan??u.gameScore??0)+bonus;
   ['oyunPuani','puan','gameScore','score','points'].forEach(k=>u[k]=puan);
   save(K.users,users);
   if(typeof profilPuanEkle==='function')profilPuanEkle(isim,bonus,true);
   mesaj.push((u.gorunenIsim||isim)+' · Bonus kazandınız! +'+bonus+' puan');
   if(isim===ME&&window.OF_AUTH?.user&&!window.masaBotIsliyor)toast('🎁 Bonus kazandınız! +'+bonus+' puan');
 });
 if(mesaj.length&&bonus>500&&aktifOda){
   const masaAdi=String(aktifMasa?.ad||'Masa');
   const masaNo=masaAdi.match(/\d+/)?.[0];
   const masaEtiketi=masaNo?'Masa '+masaNo:masaAdi;
   let nickler;
   if(esli){
     const ilk=kazananlar[0],takim=ilk%2;
     nickler=[takim,takim+2].map(function(i){
       const isim=aktifMasa?.oyuncular?.[i];
       const u=isim&&kisiBul(isim);
       return u?.gorunenIsim||isim;
     }).filter(Boolean);
   }else nickler=[kisiBul(ME)?.gorunenIsim||ME];
   const key='room_'+aktifOda.id;
   roomChat[key]||=[];
   roomChat[key].push({
     id:Date.now()+Math.floor(Math.random()*999),
     isim:'',
     mesaj:masaEtiketi+' bonusu: '+nickler.join(' ve ')+' +'+bonus+' puan kazandı.',
     tarih:Date.now(),
     sistem:true
   });
   save(K.roomChat,roomChat);
   if(typeof fixedRoomRender==='function')fixedRoomRender();
 }
 return mesaj.length?' · 🎁 '+mesaj.join(' · '):'';
};
 const suits=["♠","♥","♦","♣"],ranks=["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
 function deck(){let d=[];for(const s of suits)for(const r of ranks)d.push({s,r});for(let i=d.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]]}return d}
 function fresh(scores=[0,0]){
   let d=deck(),pile=[d.pop(),d.pop(),d.pop()],open=d.pop();
   while(open.r==="J"){d.unshift(open);open=d.pop()} pile.push(open);
   return {
     deck:d,hands:[[],[],[],[]],pile,captured:[[],[]],
     pisti:[0,0],pistiAdet:[0,0,0,0],bonusHavuz:50,scores,last:null,
     dealer:Math.max(0,(aktifMasa.oyuncular||[]).indexOf(aktifMasa.sahibi||ME)),
     turn:0,finished:false,msg:"4 kişilik eşli oyun başladı.",
     /* Eş geçme her ihlalde yeniden ceza verir. */
     esCezaSeq:0,
     esCezaSeat:null,

     /* Bu 52'lik destenin başlangıç masa kartları henüz alındı mı? */
     ilkMasaAlindi:false
   };
 }
 function deal(g){
   if(g.hands.some(h=>h.length))return;
   for(let n=0;n<4;n++)for(let p=0;p<4;p++)if(g.deck.length)g.hands[p].push(g.deck.pop());
 }
 function cp(a){let n=0;for(const c of a){if(c.r==="A"||c.r==="J")n++;if(c.s==="♦"&&c.r==="10")n+=3;if(c.s==="♣"&&c.r==="2")n+=2}return n}
 function finishHand(g,zorunluKazanan=null){
   if(g.finished)return;
   if(!Number.isInteger(zorunluKazanan))window.ofMasaRenkElBitti?.(aktifMasa,g);
   if(g.pile.length&&g.last!=null){g.captured[g.last%2].push(...g.pile);g.pile=[]}
   let a=cp(g.captured[0])+g.pisti[0],b=cp(g.captured[1])+g.pisti[1];
   if(!Number.isInteger(zorunluKazanan)){if(g.captured[0].length>g.captured[1].length)a+=3;else if(g.captured[1].length>g.captured[0].length)b+=3;}
   g.scores[0]+=a;g.scores[1]+=b;
   const hedef=Number(aktifMasa?.hedefPuan||51);
   if(Number.isInteger(zorunluKazanan)||g.scores[0]>=hedef||g.scores[1]>=hedef){
     g.finished=true;
     const kazanan=Number.isInteger(zorunluKazanan)?zorunluKazanan:(g.scores[0]>=g.scores[1]?0:1);
     g.winnerTeam=kazanan;
     const ns=names();
     if(!g.profileAwarded){
       [0,1,2,3].forEach(function(seat){
         const isim=ns[seat],u=(users||[]).find(x=>(x.gorunenIsim||x.isim)===isim||x.isim===isim);
         if(!isim||u?.otomatikBot)return;
         if(seat%2===kazanan){
         const masaPuani=Number(g.scores[kazanan]||0);
         if(u){const puan=Number(u.oyunPuani??u.puan??u.gameScore??0)+masaPuani;['oyunPuani','puan','gameScore','score','points'].forEach(k=>u[k]=puan);save(K.users,users);}
         window.profilPuanEkle&&window.profilPuanEkle(isim,250+masaPuani);
        }
         else if(window.ofMasadaCezaAktif(aktifMasa))window.profilPuanEkle&&window.profilPuanEkle(isim,-(vipMi(isim)?125:200));
       });
       g.profileAwarded=true;
     }
     g.msg=(kazanan===0?"🏆 Takımınız":"Rakip takım")+" kazandı. Kazanan +250 · Kaybeden normal -200 / VIP -125";
     g.msg+=window.pistiKazananBonusu(g,[0,1,2,3].filter(i=>i%2===kazanan),true);
     return;
   }
   const oncekiBonus=Number(g.bonusHavuz||50);
   const n=fresh(g.scores);n.dealer=(Number(g.dealer??3)+3)%4;n.turn=(n.dealer+3)%4;n.bonusHavuz=oncekiBonus+50;n.pistiKartlari=[[],[],[],[]];
   Object.assign(g,n);deal(g);g.msg="Yeni el başladı. Bonus +50.";
 }
 function play(g,p,i){
   if(window.masaIzleyiciMi?.()&&!window.masaBotIsliyor)return;
   if(g.finished||g.turn!==p||!g.hands[p][i])return;
   const top=g.pile[g.pile.length-1],team=p%2,secilen=g.hands[p][i];

   /* KURAL:
      Yerdeki üst kartın DEĞERİ/NUMARASI elinde varsa, o değeri atmak zorunda.
      Maça/kupa/karo/sinek aynı olmak zorunda değil; sadece r (değer) eşleşir.
      Elinde eşleşen değer varken başka değer atarsa HER SEFER -5 takım puanı. */
   const esGecti=window.ofMasadaCezaAktif(aktifMasa) && !!top &&
     secilen.r!==top.r &&
     g.hands[p].some((x,ix)=>ix!==i && x.r===top.r);

   if(esGecti){
     g.scores[team]=Number(g.scores[team]||0)-5;
     g.esCezaSeq=Number(g.esCezaSeq||0)+1;
     g.esCezaSeat=p;
     g.msg="ES_GECME_CEZASI";
   }else if(g.msg==="ES_GECME_CEZASI"){
     /* Önceki ceza mesajı yeni normal hamleye taşınmasın. */
     g.msg="";
   }

   const c=g.hands[p].splice(i,1)[0],single=g.pile.length===1;
   g.sonAtmaSeq=Number(g.sonAtmaSeq||0)+1;g.sonAtan=p;g.sonAtilanKart={r:c.r,s:c.s};
   const take=top&&(c.r===top.r||c.r==="J");
   if(take){
     /* İlk başlangıç masa kartları artık alınmış sayılır. */
     if(g.ilkMasaAlindi!==true)g.ilkMasaAlindi=true;

     if(single){
       let pistiOldu=false;
       if(c.r==="J"&&top.r==="J"){g.pisti[team]+=20;pistiOldu=true}
       else if(c.r===top.r){g.pisti[team]+=10;pistiOldu=true}
       if(pistiOldu){
         window.pistiAlkisEfekti?.();
         g.pistiKartlari ||= [[],[],[],[]];g.pistiKartlari[p] ||= [];g.pistiKartlari[p].push({r:c.r,s:c.s});g.pistiKartlari[p]=g.pistiKartlari[p].slice(-3);
         if(!Array.isArray(g.pistiAdet))g.pistiAdet=[0,0,0,0];
         g.pistiAdet[p]=Number(g.pistiAdet[p]||0)+1;
       }
     }
     g.pile.push(c);g.captured[team].push(...g.pile);g.pile=[];g.last=p;g.sonAlimSeq=Number(g.sonAlimSeq||0)+1;g.sonAlan=p;g.sonAlimZamani=Date.now();
   }else g.pile.push(c);
   if(take&&Number(g.pistiAdet?.[team]||0)+Number(g.pistiAdet?.[team+2]||0)>=3){finishHand(g,team);return;}
   g.turn=(p+3)%4;
   if(g.hands.every(h=>!h.length)){if(g.deck.length)deal(g);else finishHand(g)}
 }
 function names(){
   let a=(aktifMasa?.oyuncular||[]).slice(0,4);
   while(a.length<4)a.push("Bot "+a.length);
   return a.map(n=>{try{const u=(users||[]).find(x=>x.isim===n);return u?.gorunenIsim||n}catch(e){return n}});
 }
 function esliBotPuanKartiMi(c){
   if(!c)return false;
   return c.r==="A" || c.r==="J" ||
          (c.s==="♦" && c.r==="10") ||
          (c.s==="♣" && c.r==="2");
 }

 function uygunKart(g,p){
   const top=g.pile[g.pile.length-1];
   const el=g.hands[p]||[];
   if(!el.length)return -1;

   /* 1) BOT EŞ YAPAMAZ:
      Yerdeki kartın aynı DEĞERİ/NUMARASI elde varsa kesinlikle onu atar. */
   if(top){
     const ayni=el.findIndex(c=>c.r===top.r);
     if(ayni>=0)return ayni;
   }

   const vale=el.findIndex(c=>c.r==="J");

   if(top && vale>=0){
     const yakalanan=(g.captured?.[0]?.length||0)+(g.captured?.[1]?.length||0);
     const ilkMasaAlinmadi=(g.ilkMasaAlindi!==true && yakalanan===0);

     /* 2) 52'lik destenin başlangıçtaki masa kartlarını henüz kimse almadıysa,
        aynı değer yokken Vale ile almak zorunlu. */
     if(ilkMasaAlinmadi)return vale;

     /* 3) Eşli oyunda yerde 6 veya daha fazla kart varsa Vale ile al. */
     if(g.pile.length>=6)return vale;

     /* 4) Yere puan veren kart atıldıysa, aynı değeri yoksa Vale ile al. */
     if(esliBotPuanKartiMi(top))return vale;
   }

   /* Tekli ile aynı: masada kart varsa 2 kart kalınca Vale atılır; masa boşsa son karta saklanır. */
   if(vale>=0 && el.length<=2 && g.pile.length>0)return vale;

   /* 5) Normal atış: Vale ve puan kartlarını sona sakla. */
   let aday=[];
   el.forEach((c,idx)=>{
     if(c.r!=="J" && !esliBotPuanKartiMi(c))aday.push(idx);
   });
   if(aday.length)return aday[Math.floor(Math.random()*aday.length)];

   /* 6) Puan vermeyen kart kalmadıysa Vale dışındaki puan kartını oyna.
      Vale sayısı kadar Vale elin en sonuna kalır. */
   aday=[];
   el.forEach((c,idx)=>{if(c.r!=="J")aday.push(idx)});
   if(aday.length)return aday[Math.floor(Math.random()*aday.length)];

   /* 7) Elde yalnız Vale kaldıysa Vale'yi at. */
   return 0;
 }
return {create(){const g=fresh([0,0]);deal(g);g.engine='oyunalem-pisti';g.started=true;return g;},
 act(g,seat,a){if(g.finished||g.turn!==seat||a.type!=='play'||!Number.isInteger(a.index)||!g.hands[seat]?.[a.index])return {ok:false,error:'Sıra veya kart geçersiz.'};play(g,seat,a.index);return {ok:true};},
 bot(g){if(g.finished)return false;const seat=g.turn,i=uygunKart(g,seat);if(i<0)return false;play(g,seat,i);return true;},reward:()=>users[0].points,rewards:()=>Object.fromEntries(users.flatMap((u,i)=>gercekUye(u)?[[i,u.points]]:[]))};
}
};

};
engineModules['./bot-view.cjs'] = function(module,exports,require,Math){
'use strict';const members=require('./bot-members.cjs'),points=require('./points-policy.cjs');
module.exports=function(game,g,meta,seat,core){
 const roster=members.roster(meta,meta.count),spectator=!Number.isInteger(seat),owner=meta.ownerSeat??0,handSeat=spectator?owner:seat,person=roster[handSeat];
 const live=roster.filter(members.active).length,ended=!!(g.finished||g.handFinished),hand=g.hands?.[handSeat]||[],r=points.rates(game,g,person?.vip);
 const labels={okey:'Okey','101':'101 Okey',batak:'Batak',tavla:'Tavla',pisti:'Pişti',king:'King'};
 return {game,label:labels[game],gameType:g.rules?.oyunTipi||meta.gameType||'tekli',batakMode:game==='batak'?(g.rules?.tur||'ihaleli'):null,openingThreshold:game==='101'?(g.rules.acilisPuani||101):null,declarations:g.declarations||[],tricks:g.tricks||[],bidMinimum:g.rules?.ihaleAlt||5,ownSeat:spectator?null:seat,spectator,watchingSeat:handSeat,isOwner:!spectator&&seat===owner,
  canTakeover:spectator&&members.paired(game,meta.count,g,meta),takeoverSeats:spectator&&members.paired(game,meta.count,g,meta)?roster.flatMap((p,i)=>p.id==null?[i]:[]):[],
  botRules:{capacity:meta.count,humanPlayers:live,botPlayers:meta.count-live,reservedBots:roster.filter(p=>p.id!=null&&!members.active(p)).length,replaceHuman:false,connectionSubstitution:true,automaticHumanMove:false,lossCharged:live>=2},
  turn:g.turn,phase:g.phase||'play',finished:!!g.finished,handFinished:!!g.handFinished,scores:g.scores,round:g.round||1,roundScores:g.roundScores||[],matchWinners:g.matchWinners||[],
  hand,handCounts:g.hands?.map(h=>h.length)||[],stockCount:(g.stock||g.deck||[]).length,
  message:game==='pisti'&&meta.count===4&&g.finished?'Takım '+(g.winnerTeam+1)+' kazandı.':(g.msg||'').replaceAll('__human__'+meta.id,()=>roster[0]?.name||meta.name).replace(new RegExp('__bot__'+meta.id+'_(\\d+)','g'),(_,i)=>roster[Number(i)]?.name||'Bot '+i),
  winner:g.winner??g.winnerTeam??null,botTurn:!ended&&!members.active(roster[g.turn]),
  cardMotion:game==='pisti'?{seq:Number(g.sonAtmaSeq||0),seat:g.sonAtan??null,card:g.sonAtilanKart||null,captureSeq:Number(g.sonAlimSeq||0),captureSeat:g.sonAlan??null,pisti:g.pistiAdet||[]}:null,
  pile:game==='pisti'?[g.pile?.at(-1)].filter(Boolean):[],pileCount:g.pile?.length||0,trick:g.trick||[],bid:g.bid??null,trump:g.trump??null,bidLog:g.bidLog||[],
  king:game==='king'?{contract:g.contract,contractLabel:core.labels[g.contract]||'Kontrat seçiliyor',available:!spectator&&g.turn===seat?core.available(g,seat).map(id=>({id,label:core.labels[id]})):[],remaining:g.remaining,positive:g.positive,negative:g.negative,history:g.history.map(h=>({...h,contractLabel:core.labels[h.contract]}))}:null,
  joker:g.joker||null,indicator:g.indicator||null,previous:g.discards?.[(handSeat+meta.count-1)%meta.count]?.at(-1)||null,
  discards:g.discards?.map(p=>p.at(-1)||null)||[],discardHistory:['okey','101'].includes(game)?g.discards||[]:[],pairModes:game==='okey'?g.pairMode||[]:[],previousMustFinish:game==='101'&&g.previousFinish?.seat===handSeat,canReturnPrevious:!spectator&&game==='101'&&(g.previousFinish?.seat===seat||g.pendingPrevious?.seat===seat),melds:g.publicMelds||[],opened:g.opened?.[handSeat]||null,
  bonus:g.bonusHavuz??null,pointRules:{...r,lossCharged:live>=2},coloredTileIds:['okey','101'].includes(game)&&r.colored?hand.filter(t=>globalThis.OYUNALEM_OkeyCore.coloredTile(t,g)).map(t=>t.id):[],
  settlement:g._walletOutcomes?.[handSeat]||(handSeat===0?g._walletOutcome:null)||null,pisti:g.pistiAdet||[],board:g.points||null,bar:g.bar||[],off:g.off||[],dice:g.dice||[],
  legalCards:!spectator&&['batak','king'].includes(game)&&g.phase==='play'&&g.turn===seat?core.legal(g,seat).map(c=>c.id):[],legalMoves:!spectator&&game==='tavla'?core.legal(g,seat):[],canUndo:!spectator&&game==='tavla'&&core.canUndo(g,seat)};
};

};
engineModules['./bot-members.cjs'] = function(module,exports,require,Math){
'use strict';
function roster(meta,count){return Array.from({length:count},(_,i)=>meta.roster?.[i]||{id:i===0?1:null,name:i===0?meta.name:'Bot '+['William','Oliver','Benjamin'][i-1],vip:i===0&&meta.vip,active:i===0});}
const active=p=>p?.id!=null&&p.active!==false;
function paired(game,count,g,meta){return count===4&&(game==='pisti'||(['okey','batak'].includes(game)&&(g?.rules?.oyunTipi||meta.gameType)==='esli'));}
module.exports={roster,active,paired};

};
engineModules['./points-policy.cjs'] = function(module,exports,require,Math){
/* User-defined account stakes. Game hand scores and account balances are distinct. */
'use strict';
const normal={winNormal:250,winVip:250,lossNormal:200,lossVip:125};
const colored={winNormal:350,winVip:350,lossNormal:300,lossVip:400};
function rates(game,g,vip=false){
 const enabled=['okey','101'].includes(game)&&g.rules?.renkli===true;
 const okeyColor=g.joker?.color||g.indicator?.color;
 const active=enabled&&['kirmizi','siyah'].includes(okeyColor);
 const r=active?colored:normal;
 return {mode:enabled?'renkli':'normal',colored:active,okeyColor:okeyColor||null,...r,win:vip?r.winVip:r.winNormal,loss:vip?r.lossVip:r.lossNormal,lossCharged:false,bonusStep:50};
}
function setup(game,g,mode='normal',previous=null){
 if(['okey','101'].includes(game))g.rules.renkli=mode==='renkli';
 // Unbroken table pot survives a new match, while match scores restart.
 if(previous)g.bonusHavuz=previous.bonusOdendi?50:Number(previous.bonusHavuz??50)+(previous.cancelled?0:50);
 else g.bonusHavuz=Number(g.bonusHavuz??50);
 g._walletPolicy=1;g._walletSettled=false;g._walletOutcome=null;g._walletOutcomes={};
 g._turnSerial=0;g._openedOnTurn={};
}
function settleAll(game,g,meta){
 const M=require('./bot-members.cjs'),list=M.roster(meta,meta.count||g.hands?.length||2),lossAllowed=list.filter(M.active).length>=2,out={};
 const add=(seat,value)=>{out[seat]=(out[seat]||0)+value;};g._walletOutcomes??={};
 if(game==='pisti')return out;
 if(game==='okey'){
  g._paidEvents??=[];const base={},bonus={};
  for(const e of g.profileEvents||[]){
   if(g._paidEvents.includes(e.id))continue;
   if(e.id.startsWith('finish-')){const r=rates(game,g,list[e.seat]?.vip),old=e.delta;e.delta=e.loss?-r.loss:r.win*(g.result?.breakPot?2:1)*(g.result?.multiplier||1)+(r.colored&&g.result?.breakPot?r.win*2:0);g.scores[e.seat]+=e.delta-old;}
   if(M.active(list[e.seat])&&(!e.loss||lossAllowed)){add(e.seat,e.delta);if(e.bonus)bonus[e.seat]=(bonus[e.seat]||0)+e.delta;else base[e.seat]=(base[e.seat]||0)+e.delta;}
   g._paidEvents.push(e.id);
  }
  if(g.handFinished&&g.winner!=null)for(let i=0;i<list.length;i++)if(list[i].id!=null&&!g._walletOutcomes[i]){const won=(g.result?.winningSeats||[g.winner]).includes(i);g._walletOutcomes[i]={base:base[i]||0,bonus:bonus[i]||0,total:out[i]||0,won,lossWaived:!won&&(!M.active(list[i])||!lossAllowed)};}
  g._walletOutcome=g._walletOutcomes[0]||null;return out;
 }
 const complete=['101','tavla'].includes(game)?g.handFinished:g.finished;
 if(!complete||g.cancelled||g._walletSettled)return out;g._walletSettled=true;
 const winners=game==='101'?(g.winner==null?[]:[g.winner]):game==='tavla'?[g.winner]:(g.matchWinners||[]);let bonus=0;
 if(winners.length){let breakPot=game==='tavla'?g.wonPoints>=2:game!=='101';if(game==='101'){const C=globalThis.OYUNALEM_OkeyCore,w=g.winner,fromHand=g._openedOnTurn?.[w]===g._turnSerial&&g.opened.every((kind,i)=>i===w||!kind);breakPot=!!C.wild(g.finalDiscard,g.joker)||fromHand;}if(breakPot){bonus=Number(g.bonusHavuz??50);g.kazanilanBonus=bonus;g.bonusOdendi=true;g.bonusHavuz=50;}}
 for(let i=0;i<list.length;i++)if(list[i].id!=null){const won=winners.includes(i),r=rates(game,g,list[i].vip),base=M.active(list[i])?(won?r.win:lossAllowed&&winners.length?-r.loss:0):0,paidBonus=won&&M.active(list[i])?bonus:0,total=base+paidBonus;if(total)add(i,total);g._walletOutcomes[i]={base,bonus:paidBonus,total,won,lossWaived:!won&&winners.length>0&&(!M.active(list[i])||!lossAllowed)};}
 g._walletOutcome=g._walletOutcomes[0]||null;return out;
}
function settle(game,g,meta){return settleAll(game,g,meta)[meta.actorSeat??0]||0;}
module.exports={normal,colored,rates,setup,settle,settleAll};

};

export function runPisti(input) {
 const count=Number(input.count);if(![2,4].includes(count))throw Error('Pişti 2 veya 4 koltuklu olmalı.');
 const command=input.command;if(!['start','next','move','tick','project'].includes(command))throw Error('Pişti işlemi geçersiz.');
 const actor=input.actorSeat;const meta={...input.meta,count};
 if(!Array.isArray(meta.roster)||meta.roster.length!==count)throw Error('Oyuncu listesi geçersiz.');
 const members=engineRequire('./bot-members.cjs'),core=engineRequire('./pisti-core.cjs')(meta,count),points=engineRequire('./points-policy.cjs'),project=engineRequire('./bot-view.cjs');
 let state=input.state?JSON.parse(JSON.stringify(input.state)):null;
 if(command==='next'&&!state?.finished&&!state?.handFinished)return {ok:false,error:'Önce eli tamamlayın.'};
 if(command==='start'||command==='next'){const old=state;state=core.create();state.round=1;points.setup('pisti',state,'normal',command==='next'?old:null);}
 if(!state)throw Error('Masa oyunu başlatılmamış.');
 const now=Number(input.now??Date.now()),seconds=Math.max(5,Math.min(60,Number(meta.options?.hamleSuresi)||10));state._deadline??=now+seconds*1000;
 if(command!=='project'){state.penaltiesAllowed=meta.roster.filter(members.active).length>=2;state.players=meta.roster.map(p=>({vip:!!p.vip}));}
 const before=JSON.stringify(state),scores=JSON.stringify(state.scores);let result={ok:true},botSteps=0;
 if(command==='move'){
  if(!Number.isInteger(actor)||!members.active(meta.roster[actor]))return {ok:false,error:'Oyuncu koltuğu gerekli.'};
  const move=input.move;if(!move||move.type!=='play'||!Number.isInteger(move.index))return {ok:false,error:'Kart hamlesi geçersiz.'};
  result=core.act(state,actor,move);if(!result.ok)return result;
 }
 if(command==='tick'&&!state.finished&&!state.handFinished){
  const active=members.active(meta.roster[state.turn]);
  if(!active||now>=state._deadline){if(core.bot(state)){botSteps=1;state._deadline=now+seconds*1000;}}
 }
 const changed=command==='start'||command==='next'||before!==JSON.stringify(state);
 if(changed&&command!=='project')state._deadline=now+seconds*1000;
 if(!state.finished&&scores!==JSON.stringify(state.scores))state.round=(state.round||1)+1;
 const views=Array.from({length:count},(_,seat)=>({...project('pisti',state,meta,seat,core),turnDeadline:state._deadline,turnSeconds:seconds}));
 const observer={...project('pisti',state,meta,null,core),turnDeadline:state._deadline,turnSeconds:seconds};
 return {...result,changed,state,views,observer,view:Number.isInteger(actor)?views[actor]:observer,rewards:command==='project'?{}:core.rewards(),botSteps};
}

const encoder=new TextEncoder();
const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function mac(secret,text){if(!secret)throw Error('Sunucu anahtarı eksik.');return crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']).then(k=>crypto.subtle.sign('HMAC',k,encoder.encode(text))).then(b=>Array.from(new Uint8Array(b),n=>n.toString(16).padStart(2,'0')).join(''));}
export async function validMac(secret,text,signature){if(!secret||!/^([a-f0-9]{64})$/.test(signature||''))return false;const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['verify']);return crypto.subtle.verify('HMAC',key,Uint8Array.from(signature.match(/../g),n=>parseInt(n,16)),encoder.encode(text));}
export function tableKey(path){const m=path.match(/^\/pisti\/([a-z0-9-]{3,80})\/([1-9]\d{0,8})$/);return m?'pisti:'+m[1]+':'+m[2]:null;}
export async function route(request,namespace){const url=new URL(request.url);if(url.pathname==='/health')return json({ok:true,engine:'pisti',protocol:2});const key=tableKey(url.pathname)||(/^\/(account|ip)\/([a-z0-9]{1,64})$/.test(url.pathname)?url.pathname.slice(1):null);if(!key)return json({ok:false,error:'Masa yolu geçersiz.'},404);return namespace.get(namespace.idFromName(key)).fetch(request);}
/* One durable object per table. Hosting signs membership and owns account balances.
   This module deliberately has no public create-table or award-points command. */
export class Chat {
 constructor(ctx,env){this.ctx=ctx;this.env=env;this.data=null;this.queue=Promise.resolve();ctx.blockConcurrencyWhile(async()=>{this.data=await ctx.storage.get('oa-pisti-v1')||null;});}
 serial(fn){const task=this.queue.then(fn);this.queue=task.catch(()=>{});return task;}
 async save(data){await this.ctx.storage.put('oa-pisti-v1',data);this.data=data;}
 async fetch(request){return this.serial(async()=>{
  const url=new URL(request.url),key=tableKey(url.pathname)||(/^\/(account|ip)\/([a-z0-9]{1,64})$/.test(url.pathname)?url.pathname.slice(1):null);if(!key)return json({ok:false},404);
  if(request.method==='POST'){
   const raw=await request.text();if(encoder.encode(raw).length>65536)return json({ok:false},413);
   const stamp=request.headers.get('X-OA-Time'),sig=request.headers.get('X-OA-Signature');
   if(!/^\d{10}$/.test(stamp||'')||Math.abs(Date.now()/1000-Number(stamp))>60||!await validMac(this.env.OYUNALEM_SECRET,stamp+'\n'+url.pathname+'\n'+raw,sig))return json({ok:false,error:'Sunucu imzası geçersiz.'},401);
   let input;try{input=JSON.parse(raw);}catch{return json({ok:false},400);}
   if(key.startsWith('account/')||key.startsWith('ip/')){
    const d=structuredClone(this.data||{epoch:0,gameBans:{},ipBan:0});
    if(input.action==='epoch'&&Number.isSafeInteger(input.epoch)&&input.epoch>=0){d.epoch=Math.max(d.epoch,input.epoch);await this.save(d);return json({ok:true});}
    if(input.action==='ban'&&Number.isSafeInteger(input.until)&&input.until>=0){if(key.startsWith('ip/'))d.ipBan=input.until;else if(input.game==='pisti')d.gameBans.pisti=input.until;else return json({ok:false},400);await this.save(d);return json({ok:true});}
    if(input.action==='check')return json({ok:true,allowed:key.startsWith('ip/')?d.ipBan<=Date.now()/1000:input.epoch===d.epoch&&(d.gameBans.pisti||0)<=Date.now()/1000});
    return json({ok:false},400);
   }
   if(input.action==='probe')return json({ok:true,engine:'pisti',protocol:2});
   if(input.action==='prepare'){
    if(this.data&&this.data.meta.id!==input.meta?.id&&this.data.outbox.length)return json({ok:false,error:'Önce önceki masanın puanlarını onaylayın.'},409);
    const {count,meta,epochs}=input;
    if(![2,4].includes(count)||!meta||meta.room!==key.split(':')[1]||Number(meta.table)!==Number(key.split(':')[2])||!Array.isArray(meta.roster)||meta.roster.length!==count||!Number.isInteger(meta.ownerSeat)||!meta.roster[meta.ownerSeat]?.id)return json({ok:false,error:'Masa bilgileri geçersiz.'},400);
    const humans=meta.roster.filter(p=>p.id!=null);if(!humans.length||new Set(humans.map(p=>p.id)).size!==humans.length||humans.some(p=>!Number.isSafeInteger(p.id)||p.id<1||!Number.isSafeInteger(epochs?.[p.id])||epochs[p.id]<0||typeof p.ip!=='string'||!p.ip))return json({ok:false,error:'Üyelik bilgileri eksik.'},400);
    if(new Set(humans.map(p=>p.ip)).size!==humans.length)return json({ok:false,error:'Aynı IP aynı masaya giremez.'},403);
    if(this.data?.meta.id===meta.id){
     if(this.data.closed)return json({ok:false,error:'Masa kapatıldı.'},409);
     const d=structuredClone(this.data);if(meta.watchRevision<d.meta.watchRevision){meta.watchMode=d.meta.watchMode;meta.watchRevision=d.meta.watchRevision;}for(const key of ['privateTable','passwordHash','invitedIds']){if(key in d.meta.options)meta.options[key]=d.meta.options[key];else delete meta.options[key];}if(d.state.finished){meta.watchMode='closed';meta.watchRevision=Math.max(meta.watchRevision||0,d.meta.watchRevision||0);}
     const changed=JSON.stringify(d.meta)!==JSON.stringify(meta);d.meta=meta;for(const[id,rev]of Object.entries(epochs))d.epochs[id]=Math.max(d.epochs[id]??0,rev);if(changed)d.version++;await this.save(d);
    }else{const result=runPisti({count,meta,state:input.state||null,command:input.state?'project':'start',actorSeat:meta.ownerSeat});await this.save({key,count,meta,state:result.state,version:1,epochs,outbox:[],requests:[]});}
    const result=runPisti({count,meta,state:this.data.state,command:'project'});await this.broadcast();await this.schedule();return json({ok:true,version:this.data.version,state:this.data.state,views:result.views,observer:result.observer,receipts:this.data.outbox,meta:this.data.meta});
   }
   if(input.action==='rewards'&&!this.data)return json({ok:true,receipts:[]});
   if(!this.data||this.data.key!==key)return json({ok:false,error:'Masa bulunamadı.'},404);
   if(input.action==='vacate'){
    if(input.gameId!==this.data.meta.id||!Number.isSafeInteger(input.uid))return json({ok:false},409);
    const d=structuredClone(this.data);d.revokedAt??={};d.revokedAt[input.uid]=Date.now();for(const p of d.meta.roster)if(p.id===input.uid){p.id=null;p.active=false;p.vip=false;}
    if(d.meta.roster[d.meta.ownerSeat]?.id==null){const next=d.meta.roster.findIndex(p=>p.id!=null);if(next>=0)d.meta.ownerSeat=next;else d.closed=true;}
    d.version++;await this.save(d);await this.broadcast();await this.schedule();return json({ok:true});
   }
   if(input.action==='close'){if(input.gameId!==this.data.meta.id)return json({ok:false,error:'Masa değişmiş.'},409);const d=structuredClone(this.data);d.closed=true;await this.save(d);for(const ws of this.ctx.getWebSockets())ws.close(4001,'Masa kapandı.');await this.ctx.storage.deleteAlarm();return json({ok:true,receipts:d.outbox});}
   if(input.action==='sync'){
    const d=structuredClone(this.data);if(!input.epochs||Object.values(input.epochs).some(v=>!Number.isSafeInteger(v)||v<0))return json({ok:false},400);
    for(const [id,revision]of Object.entries(input.epochs))d.epochs[id]=Math.max(d.epochs[id]||0,revision);
    await this.save(d);await this.broadcast();return json({ok:true});
   }
   if(input.action==='rewards')return json({ok:true,receipts:this.data.outbox});
   if(input.action==='ack'){
    if(!Array.isArray(input.ids)||input.ids.length>500||input.ids.some(id=>typeof id!=='string'))return json({ok:false},400);
    const d=structuredClone(this.data),ids=new Set(input.ids);d.outbox=d.outbox.filter(r=>!ids.has(r.id));await this.save(d);await this.schedule();return json({ok:true});
   }
   return json({ok:false,error:'Sunucu işlemi geçersiz.'},400);
  }
  if(request.headers.get('Upgrade')?.toLowerCase()!=='websocket'||request.method!=='GET')return json({ok:false},426);
  if(!this.data||this.data.closed)return json({ok:false,error:'Masa hazırlanmadı.'},404);
  if(!['https://oyunalem.com','https://www.oyunalem.com'].includes(request.headers.get('Origin')))return json({ok:false},403);
  if(this.ctx.getWebSockets().length>=110)return json({ok:false,error:'Masa bağlantı sınırı.'},429);
  const pair=new WebSocketPair(),client=pair[0],server=pair[1];this.ctx.acceptWebSocket(server);server.serializeAttachment({ip:request.headers.get('CF-Connecting-IP'),expires:Date.now()+10000,uid:null});await this.schedule();return new Response(null,{status:101,webSocket:client});
 });}
 live(a){return !this.data?.closed&&a&&!a.revoked&&a.uid!=null&&a.expires>Date.now()&&(a.issuedAt??0)>(this.data.revokedAt?.[a.uid]??-1)&&a.epoch===this.data?.epochs[a.uid]&&(Number.isInteger(a.seat)?this.data.meta.roster[a.seat]?.id===a.uid&&this.data.meta.roster[a.seat]?.active!==false:a.watchRevision===this.data.meta.watchRevision&&this.data.meta.watchMode!=='closed');}
 async authority(a){if(!this.live(a))return false;if(!this.env.Chat)return false;const checks=[['account/'+a.uid,{action:'check',epoch:a.epoch}]];if(a.role!=='anayonetici'){const digest=await crypto.subtle.digest('SHA-256',encoder.encode(a.ip));checks.push(['ip/'+Array.from(new Uint8Array(digest),n=>n.toString(16).padStart(2,'0')).join(''),{action:'check'}]);}
  for(const[key,body]of checks){const path='/'+key,raw=JSON.stringify(body),stamp=String(Math.floor(Date.now()/1000));const stub=this.env.Chat.get(this.env.Chat.idFromName(key));const response=await stub.fetch(new Request('https://internal'+path,{method:'POST',headers:{'X-OA-Time':stamp,'X-OA-Signature':await mac(this.env.OYUNALEM_SECRET,stamp+'\n'+path+'\n'+raw)},body:raw}));if(!response.ok||!(await response.json()).allowed)return false;}return true;
 }
 async authenticate(ws,message){
  const {payload,signature}=message;if(typeof payload!=='string'||payload.length>4096||!await validMac(this.env.OYUNALEM_SECRET,'oa-pisti-ticket-v1\n'+payload,signature))throw Error('Oturum bileti geçersiz.');
  const t=JSON.parse(payload),a=ws.deserializeAttachment(),now=Date.now();
  if(t.key!==this.data.key||!Number.isSafeInteger(t.uid)||!Number.isSafeInteger(t.exp)||t.exp<=now||t.exp>now+60000||t.epoch!==this.data.epochs[t.uid]||t.ip!==a.ip)throw Error('Oturum doğrulanamadı.');
  if(Number.isInteger(t.seat)){const p=this.data.meta.roster[t.seat];if(p?.id!==t.uid||p.active===false||p.ip!==a.ip)throw Error('Koltuk izni yok.');}
  else if(t.seat!==null||t.watch!==true||t.watchRevision!==this.data.meta.watchRevision||this.data.meta.watchMode==='closed')throw Error('İzleyici izni yok.');
  if(this.data.meta.roster.some(p=>p.id!=null&&p.id!==t.uid&&p.ip===a.ip))throw Error('Aynı IP aynı masaya giremez.');
  for(const other of this.ctx.getWebSockets()){if(other!==ws&&other.deserializeAttachment()?.uid===t.uid)other.close(4001,'Yeni bağlantı açıldı.');}
  const attachment={issuedAt:t.iat??0,ip:a.ip,uid:t.uid,seat:t.seat,epoch:t.epoch,expires:t.exp,lastMessage:0,role:t.role,players:t.players||[],options:t.options||{},points:t.points,watchRevision:t.watchRevision};if(!await this.authority(attachment))throw Error('Oturum veya oyun erişimi kapandı.');ws.serializeAttachment(attachment);this.sendView(ws);await this.schedule();
 }
 sendView(ws,id){const a=ws.deserializeAttachment();if(!this.live(a)){ws.close(4001,'Oturum süresi doldu.');return;}const result=runPisti({count:this.data.count,meta:this.data.meta,state:this.data.state,command:'project',actorSeat:a.seat});const view=result.view;view.players=a.players;view.tableOptions=a.options;view.watchMode=this.data.meta.watchMode;for(let i=0;i<this.data.meta.roster.length;i++){if(a.players[i]?.hidden)view.message=view.message.replaceAll(this.data.meta.roster[i].name,'Gizli Oyuncu');}ws.send(JSON.stringify({type:'snapshot',id,gameId:this.data.meta.id,version:this.data.version,points:a.points,view}));}
 async webSocketMessage(ws,raw){return this.serial(async()=>{
  try{
   if(typeof raw!=='string'||raw.length>8192)throw Error('Mesaj geçersiz.');const m=JSON.parse(raw);
   if(m.type==='auth'){await this.authenticate(ws,m);return;}
   const a=ws.deserializeAttachment();if(!await this.authority(a)){ws.close(4001,'Oturum veya oyun erişimi kapandı.');return;}
   if(Date.now()-(a.lastMessage||0)<80)throw Error('Çok hızlı işlem.');a.lastMessage=Date.now();ws.serializeAttachment(a);
   if(m.type==='snapshot'){this.sendView(ws,m.id);return;}
   if(!['move','next'].includes(m.type)||!Number.isInteger(a.seat))throw Error('Oyuncu işlemi gerekli.');
   if(typeof m.id!=='string'||!/^[a-zA-Z0-9_-]{1,64}$/.test(m.id))throw Error('İşlem kimliği gerekli.');
   if(this.data.requests.some(r=>r.uid===a.uid&&r.id===m.id)){this.sendView(ws,m.id);return;}
   if(m.version!==this.data.version)throw Error('Masa değişti; güncel görünümü bekleyin.');
   if(m.type==='next'&&a.seat!==this.data.meta.ownerSeat)throw Error('Yeni oyunu masa sahibi açar.');
   await this.apply(m.type,a.seat,m.move,{uid:a.uid,id:m.id});await this.broadcast(m.id);await this.schedule();
  }catch(e){ws.send(JSON.stringify({type:'error',error:e.message,id:(()=>{try{return JSON.parse(raw).id;}catch{return null;}})()}));}
 });}
 async apply(command,actorSeat,move,request){
  if(this.data.outbox.length>=500)throw Error('Puan kayıtları onay bekliyor.');
  const result=runPisti({count:this.data.count,meta:this.data.meta,state:this.data.state,command,actorSeat,move});if(!result.ok)throw Error(result.error);
  if(!result.changed)return;
  const d=structuredClone(this.data);d.state=result.state;d.version++;
  for(const[seat,delta]of Object.entries(result.rewards)){const p=d.meta.roster[seat];if(delta&&p?.id!=null&&p.active!==false)d.outbox.push({id:d.key+':'+d.meta.id+':'+d.version+':'+seat,uid:p.id,game:'pisti',delta,at:Date.now()});}
  if(d.state.finished&&!this.data.state.finished){d.meta.watchMode='closed';d.meta.watchRevision=(d.meta.watchRevision||0)+1;Object.assign(d.meta.options,{privateTable:false,passwordHash:null,invitedIds:[]});}
  if(request)d.requests=[...d.requests,request].slice(-100);await this.save(d);
 }
 async broadcast(id){for(const ws of this.ctx.getWebSockets())try{if(await this.authority(ws.deserializeAttachment()))this.sendView(ws,id);else ws.close(4001,'Oturum veya oyun erişimi kapandı.');}catch{try{ws.close(1011,'Bağlantı yenilenmeli.');}catch{}}}
 async schedule(){const connections=this.ctx.getWebSockets().map(ws=>ws.deserializeAttachment()).filter(a=>a&&!a.revoked);if(!connections.length){await this.ctx.storage.deleteAlarm();return;}
  let at=Math.min(...connections.map(a=>a.expires));const valid=connections.some(a=>this.live(a)&&Number.isInteger(a.seat));
  if(valid&&this.data&&!this.data.state.finished&&this.data.outbox.length<500){const p=this.data.meta.roster[this.data.state.turn];at=Math.min(at,p?.id!=null&&p.active!==false?this.data.state._deadline:Date.now()+1000);}
  await this.ctx.storage.setAlarm(Math.max(Date.now()+100,at));
 }
 async alarm(){return this.serial(async()=>{for(const ws of this.ctx.getWebSockets()){if(!await this.authority(ws.deserializeAttachment()))try{const a=ws.deserializeAttachment();ws.serializeAttachment({...a,revoked:true});ws.close(4001,'Oturum kapandı.');}catch{}}
  if(this.data&&this.ctx.getWebSockets().some(ws=>!ws.deserializeAttachment()?.revoked&&this.live(ws.deserializeAttachment())&&Number.isInteger(ws.deserializeAttachment().seat))&&this.data.outbox.length<500){await this.apply('tick',null);await this.broadcast();}await this.schedule();
 });}
 async webSocketClose(){return this.serial(()=>this.schedule());}
 async webSocketError(ws){try{ws.close(1011,'Bağlantı hatası.');}catch{}return this.webSocketClose();}
}
export default {fetch:(request,env)=>route(request,env.Chat)};

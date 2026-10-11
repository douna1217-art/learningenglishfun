/* Pet artwork: eight full-body pets, ten faces, clothes, homes and their decorations. All inline SVG, no images.
   Data and drawing only (no DOM, no saved state): the page logic is in index.html and the daily life of the pet is in pet-life.js.
   Written to parse on old Android WebViews (no optional chaining, no spread). Everything is private to this function;
   the few names the page needs are exported on window at the bottom. */
(function(){
var INK='#1E2A4A';
var SW='stroke-linejoin="round" stroke-linecap="round"';
/* ---- ten faces shared by every pet. These replace the live eyes / blush / mouthU / mouthW helpers, so the five
   old heads (which call them) and the new heads all get the same looks without being redrawn one by one.
   happy, eat and sleepy are exactly the live ones; asleep, bored, yawn, surprised, excited, love, hungry are new. ---- */
var FACES=['happy','eat','sleepy','asleep','bored','yawn','surprised','excited','love','hungry'];
var FACENAME={happy:'Happy',eat:'Eating',sleepy:'Sleepy',asleep:'Asleep',bored:'Bored',yawn:'Yawning',surprised:'Surprised',excited:'Excited',love:'Love',hungry:'Hungry'};
function armUp(m){return {happy:-8,love:-8,surprised:-10,excited:-16}[m]||0;}
function n1(n){return Math.round(n*10)/10;}
var KP='fill="none" stroke="'+INK+'" stroke-linecap="round" stroke-linejoin="round"';
function eye1(m,x,ey,r,sd){
 if(m==='happy')return '<circle cx="'+x+'" cy="'+ey+'" r="'+r+'" fill="'+INK+'"/><circle cx="'+n1(x+r*.35)+'" cy="'+n1(ey-r*.4)+'" r="'+n1(r*.36)+'" fill="#fff"/><circle cx="'+n1(x-r*.4)+'" cy="'+n1(ey+r*.42)+'" r="'+n1(r*.16)+'" fill="#fff" opacity=".75"/>';
 if(m==='eat')return '<path d="M'+(x-r)+' '+(ey+2)+'Q'+x+' '+n1(ey-r*1.3)+' '+(x+r)+' '+(ey+2)+'" '+KP+' stroke-width="4"/>';
 if(m==='asleep')return '<path d="M'+n1(x-r*1.05)+' '+(ey-1)+'Q'+x+' '+n1(ey+r*1.15)+' '+n1(x+r*1.05)+' '+(ey-1)+'" '+KP+' stroke-width="3.6"/>';
 if(m==='bored')return '<path d="M'+(x-r)+' '+ey+'A'+r+' '+r+' 0 0 0 '+(x+r)+' '+ey+'Z" fill="'+INK+'"/><circle cx="'+n1(x+r*.3)+'" cy="'+n1(ey+r*.45)+'" r="'+n1(r*.22)+'" fill="#fff"/><path d="M'+n1(x-r-1.5)+' '+ey+'L'+n1(x+r+1.5)+' '+ey+'" '+KP+' stroke-width="3.6"/>';
 if(m==='yawn')return '<path d="M'+n1(x-sd*r)+' '+n1(ey-r*.75)+'L'+n1(x+sd*r*.55)+' '+ey+'L'+n1(x-sd*r)+' '+n1(ey+r*.75)+'" '+KP+' stroke-width="4"/>';
 if(m==='surprised')return '<circle cx="'+x+'" cy="'+ey+'" r="'+n1(r*1.2)+'" fill="#fff" stroke="'+INK+'" stroke-width="2.8"/><circle cx="'+x+'" cy="'+n1(ey+.4)+'" r="'+n1(r*.55)+'" fill="'+INK+'"/><circle cx="'+n1(x+r*.2)+'" cy="'+n1(ey-r*.15)+'" r="'+n1(r*.2)+'" fill="#fff"/>'
  +'<path d="M'+n1(x-r*.95)+' '+n1(ey-r*1.9)+'Q'+x+' '+n1(ey-r*2.7)+' '+n1(x+r*.95)+' '+n1(ey-r*1.9)+'" '+KP+' stroke-width="3" opacity=".85"/>';
 if(m==='excited')return '<circle cx="'+x+'" cy="'+ey+'" r="'+n1(r*1.12)+'" fill="'+INK+'"/><circle cx="'+n1(x-r*.28)+'" cy="'+n1(ey-r*.38)+'" r="'+n1(r*.46)+'" fill="#fff"/><circle cx="'+n1(x+r*.42)+'" cy="'+n1(ey+r*.42)+'" r="'+n1(r*.22)+'" fill="#fff"/>';
 if(m==='love'){var s=r*1.15;return '<path d="M'+x+' '+n1(ey+s*.85)+'C'+n1(x-s*1.9)+' '+n1(ey-s*.1)+' '+n1(x-s*.95)+' '+n1(ey-s*1.6)+' '+x+' '+n1(ey-s*.55)+'C'+n1(x+s*.95)+' '+n1(ey-s*1.6)+' '+n1(x+s*1.9)+' '+n1(ey-s*.1)+' '+x+' '+n1(ey+s*.85)+'Z" fill="#FF4D7A" stroke="#D22B5B" stroke-width="1.4" stroke-linejoin="round"/><circle cx="'+n1(x-s*.5)+'" cy="'+n1(ey-s*.35)+'" r="'+n1(s*.22)+'" fill="#fff"/>';}
 if(m==='hungry')return '<circle cx="'+x+'" cy="'+ey+'" r="'+n1(r*1.18)+'" fill="'+INK+'"/><circle cx="'+n1(x-r*.3)+'" cy="'+n1(ey-r*.45)+'" r="'+n1(r*.52)+'" fill="#fff"/><circle cx="'+n1(x+r*.42)+'" cy="'+n1(ey+r*.4)+'" r="'+n1(r*.22)+'" fill="#fff"/>'
  +'<path d="M'+n1(x+sd*r)+' '+n1(ey-r*1.55)+'L'+n1(x-sd*r*.9)+' '+n1(ey-r*2.3)+'" '+KP+' stroke-width="3" opacity=".85"/>';
 return '<path d="M'+(x-r)+' '+ey+'Q'+x+' '+n1(ey+r*.9)+' '+(x+r)+' '+ey+'" '+KP+' stroke-width="4"/>';}   /* sleepy */
function eyes(m,cx,ey,dx,r){return [cx-dx,cx+dx].map(function(x){return eye1(m,x,ey,r,x<cx?-1:1);}).join('');}
function blush(m,cx,ey,dx){var op={sleepy:.25,asleep:.35,bored:.3,yawn:.4,surprised:.45,hungry:.4,love:.8,excited:.7}[m];if(op===undefined)op=.55;
 return [cx-dx-9,cx+dx+9].map(function(x){return '<ellipse cx="'+x+'" cy="'+(ey+14)+'" rx="7" ry="4.5" fill="#FF6F9C" opacity="'+op+'"/>';}).join('');}
function mouthU(m,cx,y,w){w=w||10;
 if(m==='happy'||m==='love')return '<path d="M'+(cx-w)+' '+y+'Q'+cx+' '+(y+w+1)+' '+(cx+w)+' '+y+'" '+KP+' stroke-width="4"/>';
 if(m==='eat')return '<ellipse cx="'+cx+'" cy="'+(y+5)+'" rx="'+n1(w*.7)+'" ry="'+n1(w*.65)+'" fill="'+INK+'"/><ellipse cx="'+cx+'" cy="'+(y+9)+'" rx="'+n1(w*.4)+'" ry="'+n1(w*.3)+'" fill="#FF7A9A"/>';
 if(m==='asleep')return '<path d="M'+n1(cx-w*.55)+' '+(y+2)+'Q'+cx+' '+n1(y+w*.75+2)+' '+n1(cx+w*.55)+' '+(y+2)+'" '+KP+' stroke-width="3.4"/>';
 if(m==='bored')return '<path d="M'+n1(cx-w*.6)+' '+(y+5)+'L'+n1(cx+w*.6)+' '+(y+4)+'" '+KP+' stroke-width="3.6"/>';
 if(m==='yawn')return '<ellipse cx="'+cx+'" cy="'+n1(y+6)+'" rx="'+n1(w*.82)+'" ry="'+n1(w*.95)+'" fill="'+INK+'"/><ellipse cx="'+cx+'" cy="'+n1(y+6+w*.55)+'" rx="'+n1(w*.5)+'" ry="'+n1(w*.27)+'" fill="#FF7A9A"/>';
 if(m==='surprised')return '<ellipse cx="'+cx+'" cy="'+(y+6)+'" rx="'+n1(w*.36)+'" ry="'+n1(w*.5)+'" fill="'+INK+'"/>';
 if(m==='excited')return '<path d="M'+n1(cx-w*.92)+' '+y+'Q'+cx+' '+n1(y+w*1.9)+' '+n1(cx+w*.92)+' '+y+'Z" fill="'+INK+'" stroke="'+INK+'" stroke-width="2" stroke-linejoin="round"/><ellipse cx="'+cx+'" cy="'+n1(y+w*.68)+'" rx="'+n1(w*.4)+'" ry="'+n1(w*.22)+'" fill="#FF7A9A"/>';
 if(m==='hungry')return '<ellipse cx="'+cx+'" cy="'+(y+5)+'" rx="'+n1(w*.4)+'" ry="'+n1(w*.46)+'" fill="'+INK+'"/><path d="M'+n1(cx+w*.62)+' '+(y+6)+'Q'+n1(cx+w*.62-2.4)+' '+(y+11)+' '+n1(cx+w*.62)+' '+(y+13.5)+'Q'+n1(cx+w*.62+2.4)+' '+(y+11)+' '+n1(cx+w*.62)+' '+(y+6)+'Z" fill="#8FD3F0" stroke="#3C8FB8" stroke-width="1.2"/>';
 return '<path d="M'+n1(cx-w*.8)+' '+(y+5)+'Q'+cx+' '+(y-3)+' '+n1(cx+w*.8)+' '+(y+5)+'" '+KP+' stroke-width="4"/>';}   /* sleepy */
function mouthW(m,cx,y){
 if(m==='happy'||m==='love'||m==='asleep')return '<path d="M'+cx+' '+y+'V'+(y+4)+'Q'+(cx-6)+' '+(y+10)+' '+(cx-11)+' '+(y+5)+'M'+cx+' '+(y+4)+'Q'+(cx+6)+' '+(y+10)+' '+(cx+11)+' '+(y+5)+'" '+KP+' stroke-width="3.5"/>';
 if(m==='excited'||m==='yawn')return mouthU(m,cx,y+3,9);
 return mouthU(m,cx,y+4,7);}

var PETS_OLD={
cat:{name:'Cat',pal:[{b:'#FFA94D',d:'#B5651D',l:'#FFE2B8'},{b:'#B8C0CC',d:'#5A6578',l:'#EEF1F5'},{b:'#FFF6EA',d:'#A8957A',l:'#fff'}],fav:'fish',line:'Meow!'},
dog:{name:'Dog',pal:[{b:'#E0A96A',d:'#8A5A2B',l:'#FFF0D6'},{b:'#A8714A',d:'#5E3A1E',l:'#F1D9BE'},{b:'#FFF6E8',d:'#B79C75',l:'#fff'}],fav:'bone',line:'Woof!'},
monkey:{name:'Monkey',pal:[{b:'#B07A4A',d:'#6B4423',l:'#F2D3A8'},{b:'#E8B24A',d:'#9A6B14',l:'#FFF0C4'},{b:'#9AA3B2',d:'#4F586A',l:'#E3E8F0'}],fav:'banana',line:'Ooh ooh ah ah!'},
bunny:{name:'Bunny',pal:[{b:'#FFFFFF',d:'#9AA6BD',l:'#fff'},{b:'#FFC6D9',d:'#C0577F',l:'#fff'},{b:'#CBD2DB',d:'#6B7587',l:'#fff'}],fav:'carrot',line:'Hop hop!'},
dino:{name:'Dino',pal:[{b:'#7ED957',d:'#3C8B21',l:'#E3F7D1'},{b:'#A58BF5',d:'#5B3FC4',l:'#E4DAFF'},{b:'#5CB3F7',d:'#1F6FB2',l:'#D6ECFF'}],fav:'leaf',line:'Rawr!'}
};
function draw(t,c,m,acc){var b=c.b,d=c.d,l=c.l,s='';
 if(t==='cat'){
  s+='<path d="M16 58L22 10L54 32Z" fill="'+b+'" stroke="'+d+'" stroke-width="4" '+SW+'/><path d="M104 58L98 10L66 32Z" fill="'+b+'" stroke="'+d+'" stroke-width="4" '+SW+'/><path d="M25 40L27 22L40 32Z" fill="#FFC6D4"/><path d="M95 40L93 22L80 32Z" fill="#FFC6D4"/>';
  s+='<path d="M8 66Q8 30 60 30Q112 30 112 66Q112 106 60 108Q8 106 8 66Z" fill="'+b+'" stroke="'+d+'" stroke-width="4"/><path d="M60 32V44M48 34L50 44M72 34L70 44" stroke="'+d+'" stroke-width="4" stroke-linecap="round" opacity=".6"/><path d="M6 80L26 82M6 90L26 88M114 80L94 82M114 90L94 88" stroke="'+d+'" stroke-width="2.5" stroke-linecap="round" opacity=".5"/>';
  s+=eyes(m,60,62,19,6.5)+blush(m,60,62,19)+'<path d="M55 76H65L60 82Z" fill="#FF8FB1"/>'+mouthW(m,60,83);
 }else if(t==='dog'){
  s+='<path d="M20 36Q-4 40 6 86Q24 90 32 56Z" fill="'+d+'" stroke="'+d+'" stroke-width="4" '+SW+'/><path d="M100 36Q124 40 114 86Q96 90 88 56Z" fill="'+d+'" stroke="'+d+'" stroke-width="4" '+SW+'/>';
  s+='<path d="M12 62Q12 26 60 26Q108 26 108 62Q108 108 60 110Q12 108 12 62Z" fill="'+b+'" stroke="'+d+'" stroke-width="4"/><ellipse cx="60" cy="88" rx="26" ry="19" fill="'+l+'"/>';
  s+=eyes(m,60,58,20,6.5)+blush(m,60,58,20)+'<ellipse cx="60" cy="77" rx="9" ry="6.5" fill="'+INK+'"/>'+mouthU(m,60,88,10);
  if(m==='happy'||m==='excited')s+='<path d="M54 95Q54 107 60 107Q66 107 66 95Z" fill="#FF7A9A"/>';
 }else if(t==='monkey'){
  s+='<circle cx="12" cy="64" r="17" fill="'+b+'" stroke="'+d+'" stroke-width="4"/><circle cx="108" cy="64" r="17" fill="'+b+'" stroke="'+d+'" stroke-width="4"/><circle cx="12" cy="64" r="8" fill="'+l+'"/><circle cx="108" cy="64" r="8" fill="'+l+'"/>';
  s+='<path d="M10 60Q10 24 60 24Q110 24 110 60Q110 106 60 108Q10 106 10 60Z" fill="'+b+'" stroke="'+d+'" stroke-width="4"/><path d="M60 52Q44 38 32 50Q20 66 34 84Q44 102 60 102Q76 102 88 84Q100 66 88 50Q76 38 60 52Z" fill="'+l+'"/><path d="M52 28Q60 14 68 28" fill="none" stroke="'+d+'" stroke-width="4" stroke-linecap="round"/>';
  s+=eyes(m,60,62,17,6.5)+blush(m,60,62,17)+'<circle cx="55" cy="78" r="2.6" fill="'+d+'"/><circle cx="65" cy="78" r="2.6" fill="'+d+'"/>'+mouthU(m,60,87,10);
 }else if(t==='bunny'){
  var a=(m==='sleepy'||m==='asleep'||m==='bored'||m==='yawn'||m==='hungry')?105:8;
  s+='<g transform="rotate(-'+a+' 40 58)"><ellipse cx="40" cy="30" rx="13" ry="30" fill="'+b+'" stroke="'+d+'" stroke-width="4"/><ellipse cx="40" cy="32" rx="6" ry="21" fill="#FFB3C8"/></g><g transform="rotate('+a+' 80 58)"><ellipse cx="80" cy="30" rx="13" ry="30" fill="'+b+'" stroke="'+d+'" stroke-width="4"/><ellipse cx="80" cy="32" rx="6" ry="21" fill="#FFB3C8"/></g>';
  s+='<ellipse cx="60" cy="74" rx="48" ry="38" fill="'+b+'" stroke="'+d+'" stroke-width="4"/>';
  s+=eyes(m,60,68,19,6.5)+blush(m,60,68,19)+'<ellipse cx="60" cy="80" rx="5.5" ry="4" fill="#FF8FB1"/>'+mouthW(m,60,84);
  if(m==='happy'||m==='excited')s+='<rect x="55" y="90" width="10" height="9" rx="2" fill="#fff" stroke="'+d+'" stroke-width="2.5"/>';
 }else{
  s+='<path d="M34 38L40 14L52 32Z" fill="'+d+'" stroke="'+d+'" stroke-width="3" '+SW+'/><path d="M50 32L60 6L70 32Z" fill="'+d+'" stroke="'+d+'" stroke-width="3" '+SW+'/><path d="M68 32L80 14L86 38Z" fill="'+d+'" stroke="'+d+'" stroke-width="3" '+SW+'/>';
  s+='<path d="M8 68Q8 30 60 30Q112 30 112 68Q112 106 60 108Q8 106 8 68Z" fill="'+b+'" stroke="'+d+'" stroke-width="4"/><path d="M22 90Q60 114 98 90Q92 108 60 110Q28 108 22 90Z" fill="'+l+'"/><circle cx="26" cy="46" r="5" fill="'+d+'" opacity=".3"/><circle cx="96" cy="50" r="4" fill="'+d+'" opacity=".3"/>';
  s+=eyes(m,60,56,21,7)+blush(m,60,56,21)+'<circle cx="52" cy="72" r="2.8" fill="'+d+'"/><circle cx="68" cy="72" r="2.8" fill="'+d+'"/>'+mouthU(m,60,82,14);
 }
 return '<svg viewBox="0 0 120 120" aria-hidden="true">'+s+accs(t,acc)+'</svg>';}

var FOOD={
fish:'<path d="M8 28Q22 10 38 28Q22 46 8 28Z" fill="#6FB6F2" stroke="#1F78BC" stroke-width="3"/><path d="M38 28L50 16V40Z" fill="#6FB6F2" stroke="#1F78BC" stroke-width="3" stroke-linejoin="round"/><circle cx="18" cy="26" r="2.5" fill="'+INK+'"/>',
bone:'<path d="M14 40Q6 40 6 33Q6 28 12 27Q8 20 14 16Q20 14 22 20L36 20Q38 14 44 16Q50 20 46 27Q52 28 52 33Q52 40 44 40Q38 40 36 34L22 34Q20 40 14 40Z" fill="#fff" stroke="#B7A07A" stroke-width="3" stroke-linejoin="round"/>',
bug:'<ellipse cx="30" cy="32" rx="14" ry="12" fill="#8BD65A" stroke="#3C8B21" stroke-width="3"/><circle cx="30" cy="18" r="7" fill="#8BD65A" stroke="#3C8B21" stroke-width="3"/><path d="M26 9L22 3M34 9L38 3M16 30L8 28M16 38L8 42M44 30L52 28M44 38L52 42" stroke="#3C8B21" stroke-width="3" stroke-linecap="round"/>',
banana:'<path d="M12 14Q16 46 46 48Q54 48 54 42Q36 42 26 12Q16 8 12 14Z" fill="#FFD93D" stroke="#B08A0E" stroke-width="3" stroke-linejoin="round"/><path d="M12 14L16 8" stroke="#6B4A1E" stroke-width="4" stroke-linecap="round"/>',
berry:'<circle cx="22" cy="36" r="10" fill="#E8456A" stroke="#9E1F3E" stroke-width="3"/><circle cx="38" cy="32" r="10" fill="#E8456A" stroke="#9E1F3E" stroke-width="3"/><path d="M22 26Q24 14 34 12M38 22Q38 14 34 12" fill="none" stroke="#3C8B21" stroke-width="3" stroke-linecap="round"/>',
carrot:'<path d="M16 24L44 44Q34 54 14 48Q6 38 16 24Z" fill="#FF9A3D" stroke="#C25E0A" stroke-width="3" stroke-linejoin="round" transform="rotate(-20 30 36)"/><path d="M34 10L30 22M42 14L34 24M26 12L28 22" stroke="#3C8B21" stroke-width="4" stroke-linecap="round"/>',
leaf:'<path d="M10 46Q8 16 44 10Q50 44 18 48Z" fill="#7ED957" stroke="#3C8B21" stroke-width="3" stroke-linejoin="round"/><path d="M12 46L34 24" stroke="#3C8B21" stroke-width="3" stroke-linecap="round"/>',
apple:'<path d="M30 20Q14 14 10 30Q10 48 24 50Q30 48 36 50Q50 48 50 30Q46 14 30 20Z" fill="#FF5C5C" stroke="#B02A2A" stroke-width="3"/><path d="M30 20Q30 12 36 8" fill="none" stroke="#6B4A1E" stroke-width="3" stroke-linecap="round"/><path d="M36 14Q44 8 48 14Q42 18 36 14Z" fill="#7ED957" stroke="#3C8B21" stroke-width="2"/>',
cake:'<rect x="10" y="28" width="40" height="20" rx="6" fill="#FFC6D9" stroke="#C0577F" stroke-width="3"/><path d="M10 34Q16 40 22 34Q28 40 34 34Q40 40 50 34" fill="none" stroke="#fff" stroke-width="3"/><rect x="28" y="16" width="4" height="12" rx="2" fill="#7A5AF8"/><path d="M30 6Q35 11 30 15Q25 11 30 6Z" fill="#FFC93C"/>'
};
FOOD['milk']='<path d="M18 22L22 8H38L42 22Z" fill="#fff" stroke="#4A5878" stroke-width="3" stroke-linejoin="round"/><rect x="16" y="22" width="28" height="30" rx="3" fill="#fff" stroke="#4A5878" stroke-width="3"/><rect x="17.5" y="33" width="25" height="10" fill="#6FB6F2"/>';
FOOD['chicken']='<ellipse cx="26" cy="26" rx="16" ry="14" fill="#D98A3D" stroke="#8A4F14" stroke-width="3" transform="rotate(-30 26 26)"/><path d="M36 38L47 49" stroke="#F7E8CF" stroke-width="6" stroke-linecap="round"/><circle cx="50" cy="51" r="4" fill="#F7E8CF" stroke="#B7A07A" stroke-width="2"/>';
FOOD['tuna']='<ellipse cx="30" cy="20" rx="20" ry="7" fill="#C9D4EA" stroke="#4A5878" stroke-width="3"/><path d="M10 20V42Q10 49 30 49Q50 49 50 42V20" fill="#8FA6C8" stroke="#4A5878" stroke-width="3"/><path d="M18 33Q30 26 42 33Q30 40 18 33Z" fill="#6FB6F2" stroke="#1F78BC" stroke-width="2"/>';
FOOD['biscuit']='<circle cx="30" cy="30" r="20" fill="#E0B070" stroke="#9A6B2E" stroke-width="3"/><circle cx="22" cy="24" r="2.5" fill="#9A6B2E"/><circle cx="36" cy="22" r="2.5" fill="#9A6B2E"/><circle cx="26" cy="37" r="2.5" fill="#9A6B2E"/><circle cx="38" cy="34" r="2.5" fill="#9A6B2E"/>';
FOOD['sausage']='<path d="M10 40Q8 20 24 16Q44 12 50 28Q52 46 32 48Q14 52 10 40Z" fill="#E8715A" stroke="#9E3A28" stroke-width="3"/><path d="M22 25Q28 22 35 26" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6" fill="none"/>';
FOOD['steak']='<path d="M8 32Q8 14 28 12Q52 12 52 30Q52 50 30 50Q8 50 8 32Z" fill="#D9534F" stroke="#8A2A27" stroke-width="3"/><ellipse cx="32" cy="30" rx="9" ry="7" fill="#F4B6B4" stroke="#8A2A27" stroke-width="2"/>';
FOOD['worm']='<path d="M10 40Q14 24 24 36Q32 46 40 30Q46 20 52 28" fill="none" stroke="#E98FB1" stroke-width="9" stroke-linecap="round"/><path d="M12 40Q16 28 24 37Q32 45 40 31" fill="none" stroke="#C0577F" stroke-width="2" stroke-dasharray="3 5"/><circle cx="50" cy="26" r="1.8" fill="#1E2A4A"/>';
FOOD['lettuce']='<path d="M10 40Q6 20 24 14Q36 8 48 18Q56 32 44 46Q28 54 10 40Z" fill="#8BD65A" stroke="#3C8B21" stroke-width="3"/><path d="M14 40Q28 30 44 20M26 36L22 24M34 30L38 40" stroke="#3C8B21" stroke-width="2.5" stroke-linecap="round" fill="none"/>';
FOOD['nuts']='<path d="M14 24Q8 14 18 10Q28 8 28 20Q34 22 40 18Q50 16 50 26Q50 34 40 36Q36 46 26 46Q14 46 14 34Q10 30 14 24Z" fill="#E0B070" stroke="#9A6B2E" stroke-width="3" stroke-linejoin="round"/><circle cx="24" cy="27" r="1.8" fill="#9A6B2E"/><circle cx="37" cy="29" r="1.8" fill="#9A6B2E"/>';
FOOD['grapes']='<path d="M30 6Q30 14 28 18" stroke="#6B4A1E" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M30 10Q40 4 46 10Q40 16 30 10Z" fill="#7ED957" stroke="#3C8B21" stroke-width="2"/><circle cx="20" cy="24" r="8" fill="#9B6BDE" stroke="#5B3FA0" stroke-width="2.5"/><circle cx="36" cy="24" r="8" fill="#9B6BDE" stroke="#5B3FA0" stroke-width="2.5"/><circle cx="28" cy="34" r="8" fill="#9B6BDE" stroke="#5B3FA0" stroke-width="2.5"/><circle cx="42" cy="34" r="8" fill="#9B6BDE" stroke="#5B3FA0" stroke-width="2.5"/><circle cx="35" cy="44" r="8" fill="#9B6BDE" stroke="#5B3FA0" stroke-width="2.5"/>';
FOOD['clover']='<path d="M30 34Q30 48 36 54" stroke="#3C8B21" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="21" cy="28" r="9" fill="#7ED957" stroke="#3C8B21" stroke-width="3"/><circle cx="39" cy="28" r="9" fill="#7ED957" stroke="#3C8B21" stroke-width="3"/><circle cx="30" cy="17" r="9" fill="#7ED957" stroke="#3C8B21" stroke-width="3"/>';
FOOD['strawberry']='<path d="M30 52Q10 40 12 24Q14 14 30 16Q46 14 48 24Q50 40 30 52Z" fill="#E8456A" stroke="#9E1F3E" stroke-width="3"/><path d="M20 16L26 8L30 14L34 8L40 16Z" fill="#7ED957" stroke="#3C8B21" stroke-width="2.5" stroke-linejoin="round"/><circle cx="24" cy="28" r="1.7" fill="#FFE3A3"/><circle cx="36" cy="30" r="1.7" fill="#FFE3A3"/><circle cx="30" cy="39" r="1.7" fill="#FFE3A3"/>';
FOOD['fern']='<path d="M30 54Q30 30 36 8" stroke="#3C8B21" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M30 44L18 40M30 44L42 40M31 34L19 29M31 34L43 29M33 24L23 19M33 24L43 19" stroke="#7ED957" stroke-width="5" stroke-linecap="round"/>';
FOOD['watermelon']='<path d="M6 22Q30 58 54 22Z" fill="#FF6B7A" stroke="#2F8F55" stroke-width="3" stroke-linejoin="round"/><path d="M8 25Q30 58 52 25" fill="none" stroke="#7ED957" stroke-width="5"/><circle cx="22" cy="28" r="1.8" fill="#1E2A4A"/><circle cx="30" cy="34" r="1.8" fill="#1E2A4A"/><circle cx="38" cy="28" r="1.8" fill="#1E2A4A"/>';
var FNAME={fish:'Fish',bone:'Bone',bug:'Yummy bug',banana:'Banana',berry:'Berries',carrot:'Carrot',leaf:'Leafy greens',apple:'Apple',cake:'Cake'};
var FCN={"fish": "鱼", "bone": "骨头", "bug": "小虫", "berry": "浆果", "carrot": "胡萝卜", "leaf": "树叶", "apple": "苹果", "cake": "蛋糕", "banana": "香蕉", "milk": "牛奶", "chicken": "鸡腿", "tuna": "金枪鱼罐头", "biscuit": "饼干", "sausage": "香肠", "steak": "牛排", "worm": "蚕蚓", "lettuce": "生菜", "nuts": "花生", "grapes": "葡萄", "clover": "三叶草", "strawberry": "草莓", "fern": "蕨类", "watermelon": "西瓜"};
Object.assign(FNAME,{"milk": "Milk", "chicken": "Chicken", "tuna": "Tuna can", "biscuit": "Biscuit", "sausage": "Sausage", "steak": "Steak", "worm": "Worm", "lettuce": "Lettuce", "nuts": "Peanuts", "grapes": "Grapes", "clover": "Clover", "strawberry": "Strawberry", "fern": "Fern", "watermelon": "Watermelon"});
var MENU={cat:['fish','milk','chicken','tuna'],dog:['bone','sausage','biscuit','steak'],monkey:['banana','apple','nuts','grapes'],bunny:['carrot','lettuce','clover','strawberry'],dino:['leaf','fern','watermelon','berry']};
var FCOST=[2,1,1,3],FGAIN=[35,20,20,50];
var LIKES={cat:'Cats love fish, milk and chicken. 猫爱吃鱼、牛奶和鸡肉。',dog:'Dogs love bones, sausages and biscuits. 狗爱吃骨头、香肠和饼干。',monkey:'Monkeys love bananas, apples and nuts. 猴子爱吃香蕉、苹果和坚果。',bunny:'Bunnies love carrots, lettuce and clover. 兔子爱吃胡萝卜、生菜和三叶草。',dino:'This plant-eating dino loves leaves, ferns and melon. 这只食草恐龙爱吃树叶、蕨类和西瓜。'};
var ANC={cat:{hx:60,hy:30,hs:1,ey:62,edx:19,er:10,ny:100},dog:{hx:60,hy:26,hs:1,ey:58,edx:20,er:10,ny:104},monkey:{hx:60,hy:24,hs:1,ey:62,edx:17,er:9.5,ny:102},bunny:{hx:60,hy:38,hs:.75,ey:68,edx:19,er:10,ny:106},dino:{hx:60,hy:32,hs:1,ey:56,edx:21,er:10,ny:104}};
function G(a,inner){return '<g transform="translate('+a.hx+','+a.hy+') scale('+a.hs+')">'+inner+'</g>';}
var ITEMS={
 party:{slot:'hat',name:'Party hat',cn:'派对帽',price:4,vb:'20 -4 80 54',a:{hx:60,hy:46,hs:1},draw:function(a){return G(a,'<path d="M-16 2L0 -40L16 2Z" fill="#FF6B9A" stroke="#B02A5A" stroke-width="3" stroke-linejoin="round"/><circle cx="-5" cy="-14" r="3" fill="#FFC93C"/><circle cx="5" cy="-8" r="3" fill="#3DA5F4"/><circle cx="0" cy="-42" r="5.5" fill="#FFC93C" stroke="#B26A00" stroke-width="2"/>');}},
 crown:{slot:'hat',name:'Crown',cn:'王冠',price:6,vb:'20 8 80 46',a:{hx:60,hy:46,hs:1},draw:function(a){return G(a,'<path d="M-18 2L-20 -22L-9 -12L0 -28L9 -12L20 -22L18 2Z" fill="#FFC93C" stroke="#B26A00" stroke-width="3" stroke-linejoin="round"/><circle cx="0" cy="-8" r="3.5" fill="#FF6B9A"/><circle cx="-10" cy="-4" r="2.5" fill="#3DA5F4"/><circle cx="10" cy="-4" r="2.5" fill="#3DA5F4"/>');}},
 flower:{slot:'hat',name:'Flower',cn:'小花',price:3,vb:'20 14 80 50',a:{hx:36,hy:38,hs:1.2},draw:function(a){var x=a.hx+26*a.hs,y=a.hy+4*a.hs,p='';for(var i=0;i<5;i++){var t=i*1.2566;p+='<circle cx="'+(Math.cos(t)*7).toFixed(1)+'" cy="'+(Math.sin(t)*7).toFixed(1)+'" r="6" fill="#FF8FB1" stroke="#C0577F" stroke-width="2"/>';}return '<g transform="translate('+x+','+y+') scale('+a.hs+')">'+p+'<circle r="5" fill="#FFC93C" stroke="#B26A00" stroke-width="2"/></g>';}},
 glasses:{slot:'face',name:'Round glasses',cn:'圆眼镜',price:4,vb:'20 20 80 40',a:{ey:40,edx:20,er:10},draw:function(a){var x1=60-a.edx,x2=60+a.edx,r=a.er+2;return '<g stroke="#1E2A4A" stroke-width="3" stroke-linecap="round"><circle cx="'+x1+'" cy="'+a.ey+'" r="'+r+'" fill="rgba(255,255,255,.35)"/><circle cx="'+x2+'" cy="'+a.ey+'" r="'+r+'" fill="rgba(255,255,255,.35)"/><path d="M'+(x1+r)+' '+a.ey+'H'+(x2-r)+'M'+(x1-r)+' '+a.ey+'L'+(x1-r-8)+' '+(a.ey-3)+'M'+(x2+r)+' '+a.ey+'L'+(x2+r+8)+' '+(a.ey-3)+'" fill="none"/></g>';}},
 shades:{slot:'face',name:'Cool shades',cn:'墙镜',price:5,vb:'20 20 80 40',a:{ey:40,edx:20,er:10},draw:function(a){var x1=60-a.edx,x2=60+a.edx,r=a.er+3,w=r*2.1,h=r*1.5;return '<g><rect x="'+(x1-w/2)+'" y="'+(a.ey-h/2)+'" width="'+w+'" height="'+h+'" rx="'+(r*.6)+'" fill="#1E2A4A"/><rect x="'+(x2-w/2)+'" y="'+(a.ey-h/2)+'" width="'+w+'" height="'+h+'" rx="'+(r*.6)+'" fill="#1E2A4A"/><path d="M'+(x1+w/2)+' '+a.ey+'H'+(x2-w/2)+'" stroke="#1E2A4A" stroke-width="3"/><path d="M'+(x1-w/2+3)+' '+(a.ey-h/2+4)+'l5 -0.5M'+(x2-w/2+3)+' '+(a.ey-h/2+4)+'l5 -0.5" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".7"/></g>';}},
 scarf:{slot:'neck',name:'Scarf',cn:'围巾',price:5,vb:'16 94 90 50',a:{ny:104},draw:function(a){return '<g transform="translate(0,'+(a.ny-104)+')"><path d="M24 102Q60 120 96 102L98 116Q60 134 22 116Z" fill="#E8456A" stroke="#9E1F3E" stroke-width="3" stroke-linejoin="round"/><path d="M40 110L43 124M60 114L62 128M80 110L83 124" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/><path d="M78 120L84 142L98 138L92 116Z" fill="#E8456A" stroke="#9E1F3E" stroke-width="3" stroke-linejoin="round"/></g>';}},
 bowtie:{slot:'neck',name:'Bow tie',cn:'领结',price:4,vb:'26 98 68 36',a:{ny:104},draw:function(a){return '<g transform="translate(60,'+(a.ny+8)+')"><path d="M0 0L-20 -10V10Z M0 0L20 -10V10Z" fill="#7A5AF8" stroke="#4A2FB8" stroke-width="3" stroke-linejoin="round"/><circle r="5" fill="#A58BF5" stroke="#4A2FB8" stroke-width="3"/></g>';}},
 bandana:{slot:'neck',name:'Bandana',cn:'头巾',price:4,vb:'20 94 80 50',a:{ny:104},draw:function(a){var y=a.ny;return '<g><path d="M26 '+(y-2)+'Q60 '+(y+10)+' 94 '+(y-2)+'L60 '+(y+30)+'Z" fill="#3DA5F4" stroke="#1F78BC" stroke-width="3" stroke-linejoin="round"/><circle cx="50" cy="'+(y+7)+'" r="2.6" fill="#fff"/><circle cx="70" cy="'+(y+7)+'" r="2.6" fill="#fff"/><circle cx="60" cy="'+(y+17)+'" r="2.6" fill="#fff"/></g>';}},
 ball:{slot:'toy',name:'Ball',cn:'球',price:5,toy:'<circle cx="30" cy="32" r="22" fill="#FF6B4A" stroke="#B02A12" stroke-width="3"/><path d="M9 26Q30 42 51 26" fill="none" stroke="#fff" stroke-width="4"/><path d="M12 44Q30 30 48 44" fill="none" stroke="#fff" stroke-width="4"/>'},
 teddy:{slot:'toy',name:'Teddy bear',cn:'小熊',price:7,toy:'<circle cx="14" cy="14" r="8" fill="#B07A4A" stroke="#6B4423" stroke-width="3"/><circle cx="46" cy="14" r="8" fill="#B07A4A" stroke="#6B4423" stroke-width="3"/><circle cx="30" cy="32" r="21" fill="#B07A4A" stroke="#6B4423" stroke-width="3"/><circle cx="30" cy="38" r="9" fill="#F2D3A8"/><circle cx="22" cy="28" r="3" fill="#1E2A4A"/><circle cx="38" cy="28" r="3" fill="#1E2A4A"/><ellipse cx="30" cy="35" rx="3.5" ry="2.6" fill="#1E2A4A"/>'},
 car:{slot:'toy',name:'Toy car',cn:'玩具车',price:6,toy:'<path d="M16 28L22 14H40L46 28Z" fill="#BDEBF2" stroke="#1F78BC" stroke-width="3" stroke-linejoin="round"/><rect x="6" y="26" width="48" height="16" rx="6" fill="#3DA5F4" stroke="#1F78BC" stroke-width="3"/><circle cx="18" cy="44" r="7" fill="#1E2A4A"/><circle cx="42" cy="44" r="7" fill="#1E2A4A"/><circle cx="18" cy="44" r="2.5" fill="#fff"/><circle cx="42" cy="44" r="2.5" fill="#fff"/>'},
 balloon:{slot:'toy',name:'Balloon',cn:'气球',price:5,toy:'<ellipse cx="30" cy="22" rx="16" ry="19" fill="#FFC93C" stroke="#B26A00" stroke-width="3"/><path d="M30 41L26 47H34Z" fill="#B26A00"/><path d="M30 47Q22 54 30 60" fill="none" stroke="#4A5878" stroke-width="2.5"/><path d="M22 14Q24 10 28 9" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>'}
};
var SLOTORDER=['neck','face','hat'];
function accs(t,acc){if(!acc)return '';var A=ANC[t],o='';SLOTORDER.forEach(function(sl){var it=ITEMS[acc[sl]];if(it&&it.slot===sl)o+=it.draw(A);});return o;}

/* ---- snacks for the two new pets (the others already exist in FOOD) ---- */
var FOOD2={
 shrimp:'<path d="M12 42C6 22 26 8 44 16C52 20 52 30 44 30C38 24 28 26 26 36C26 46 18 48 12 42Z" fill="#FF9A8A" stroke="#C0503E" stroke-width="3" stroke-linejoin="round"/><path d="M12 42L5 52L18 49Z" fill="#FF7A6A" stroke="#C0503E" stroke-width="3" stroke-linejoin="round"/><circle cx="44" cy="21" r="2.6" fill="#1E2A4A"/><path d="M26 16C22 18 20 22 20 26M32 14C29 17 28 22 29 26" fill="none" stroke="#C0503E" stroke-width="2" stroke-linecap="round"/><path d="M50 18L56 12M52 22L58 20" stroke="#C0503E" stroke-width="2" stroke-linecap="round"/>',
 squid:'<path d="M30 4C42 10 44 26 40 36H20C16 26 18 10 30 4Z" fill="#CFAEF5" stroke="#7A57C0" stroke-width="3" stroke-linejoin="round"/><path d="M22 36Q20 46 24 54M28 36Q27 48 29 56M34 36Q35 48 32 56M40 36Q42 46 38 54" fill="none" stroke="#7A57C0" stroke-width="3" stroke-linecap="round"/><circle cx="25" cy="26" r="3" fill="#fff" stroke="#7A57C0" stroke-width="1.6"/><circle cx="35" cy="26" r="3" fill="#fff" stroke="#7A57C0" stroke-width="1.6"/><circle cx="25.5" cy="26.5" r="1.4" fill="#1E2A4A"/><circle cx="35.5" cy="26.5" r="1.4" fill="#1E2A4A"/><path d="M22 12Q30 6 38 12" fill="none" stroke="#fff" stroke-width="2.4" opacity=".6" stroke-linecap="round"/>',
 crab:'<ellipse cx="30" cy="34" rx="18" ry="12" fill="#FF6B4A" stroke="#B0301A" stroke-width="3"/><circle cx="8" cy="22" r="7" fill="#FF6B4A" stroke="#B0301A" stroke-width="3"/><circle cx="52" cy="22" r="7" fill="#FF6B4A" stroke="#B0301A" stroke-width="3"/><path d="M5 17L8 12L11 17M49 17L52 12L55 17" fill="none" stroke="#B0301A" stroke-width="2.4" stroke-linejoin="round"/><path d="M14 28L10 24M46 28L50 24" stroke="#B0301A" stroke-width="3" stroke-linecap="round"/><path d="M14 40L7 46M20 44L16 52M46 40L53 46M40 44L44 52" stroke="#B0301A" stroke-width="3" stroke-linecap="round"/><circle cx="24" cy="26" r="3.4" fill="#fff" stroke="#B0301A" stroke-width="2"/><circle cx="36" cy="26" r="3.4" fill="#fff" stroke="#B0301A" stroke-width="2"/><circle cx="24" cy="26.5" r="1.5" fill="#1E2A4A"/><circle cx="36" cy="26.5" r="1.5" fill="#1E2A4A"/><path d="M26 38Q30 42 34 38" fill="none" stroke="#B0301A" stroke-width="2.4" stroke-linecap="round"/>',
 bamboo:'<rect x="22" y="8" width="16" height="46" rx="8" fill="#86CE76" stroke="#3F8F4A" stroke-width="3"/><path d="M22 24H38M22 40H38" stroke="#3F8F4A" stroke-width="3"/><rect x="25" y="11" width="3" height="40" rx="1.5" fill="#fff" opacity=".35"/><path d="M38 14C46 8 54 10 56 16C48 20 42 20 38 14Z" fill="#6CC36A" stroke="#3F8F4A" stroke-width="2.4" stroke-linejoin="round"/><path d="M22 30C14 26 8 30 6 36C14 40 20 38 22 30Z" fill="#6CC36A" stroke="#3F8F4A" stroke-width="2.4" stroke-linejoin="round"/>',
 wowotou:'<path d="M30 8C41 8 46 24 50 43C50 50 43 54 30 54C17 54 10 50 10 43C14 24 19 8 30 8Z" fill="#F4C766" stroke="#B58320" stroke-width="3" stroke-linejoin="round"/><ellipse cx="30" cy="47" rx="9" ry="3.8" fill="#B58320" opacity=".55"/><path d="M22 24Q24 16 28 13" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".55"/><path d="M18 38Q30 42 42 38" fill="none" stroke="#B58320" stroke-width="2" opacity=".4" stroke-linecap="round"/>'
};
FOOD2.corn='<path d="M30 6C42 10 44 40 30 54C16 40 18 10 30 6Z" fill="#FFD93D" stroke="#B8860B" stroke-width="3" stroke-linejoin="round"/><path d="M24 14V44M30 10V50M36 14V44M20 24H40M20 34H40" stroke="#E0A800" stroke-width="2" opacity=".7"/><path d="M30 54C18 52 10 40 12 26C18 34 24 42 30 54ZM30 54C42 52 50 40 48 26C42 34 36 42 30 54Z" fill="#6CC36A" stroke="#3F8F4A" stroke-width="2.600" stroke-linejoin="round"/>';
for(var fk in FOOD2)FOOD[fk]=FOOD2[fk];
Object.assign(FNAME,{shrimp:'Shrimp',squid:'Squid',crab:'Crab',bamboo:'Bamboo',wowotou:'Wowotou',corn:'Corn'});
Object.assign(FCN,{shrimp:'虾',squid:'鱿鱼',crab:'螃蟹',bamboo:'竹子',wowotou:'窝窝头',corn:'玉米'});
/* ---- the three new species; the five old ones come from the live code (PETS, MENU, LIKES) ---- */
ANC.penguin={hx:60,hy:21,hs:1,ey:60,edx:22,er:9.5,ny:100};
ANC.panda={hx:60,hy:26,hs:1,ey:62,edx:17,er:10,ny:102};
ANC.duck={hx:60,hy:14,hs:1,ey:54,edx:21,er:9,ny:94};
var NEWPETS={
 duck:{name:'Duck',cn:'小鸭子',line:'Quack quack!',menu:['corn','lettuce','worm','berry'],
  likes:'Ducks love corn, lettuce and worms. 鸭子爱吃玉米、生菜和小虫。',
  pal:[{b:'#FFD93D',d:'#C98A00',l:'#FFF3B0'},{b:'#FFFFFF',d:'#9AA6BD',l:'#F3F6FB'},{b:'#8FD3F0',d:'#3C8FB8',l:'#E6F6FD'}]},
 penguin:{name:'Penguin',cn:'小企鹅',line:'Waddle waddle!',menu:['fish','shrimp','squid','crab'],
  likes:'Penguins love fish, shrimp and squid. 企鹅爱吃鱼、虾和鱿鱼。',
  pal:[{b:'#3E434F',d:'#171A22',l:'#F7F9FC'}]},
 panda:{name:'Panda',cn:'大熊猫',line:'Munch munch!',menu:['bamboo','apple','carrot','wowotou'],
  likes:'Pandas love bamboo, apples and carrots. And a wowotou bun! 大熊猫爱吃竹子、苹果、胡萝卜，还有窝窝头！',
  pal:[{b:'#2E3340',d:'#1E2230',l:'#FFFFFF'},{b:'#8A5A3B',d:'#4A2A18',l:'#FFF6EA'},{b:'#F58FB3',d:'#B64B78',l:'#FFFFFF'}]}
};
var CN={cat:'猫',dog:'狗',monkey:'猴子',bunny:'兔子',dino:'恐龙'};
var ORDER=['cat','dog','monkey','bunny','dino','duck','penguin','panda'];
var PETS2={};
['cat','dog','monkey','bunny','dino'].forEach(function(k){PETS2[k]={name:PETS_OLD[k].name,cn:CN[k],line:PETS_OLD[k].line,menu:MENU[k],likes:LIKES[k],pal:[PETS_OLD[k].pal[0]]};});
Object.keys(NEWPETS).forEach(function(k){PETS2[k]=NEWPETS[k];PETS2[k].pal=[PETS2[k].pal[0]];});
var ORANGE='#FFA53B',ORANGE_D='#C47A10';

/* ---- penguin, soft 3D toy look: gradients and gentle highlights, no filters (old Android friendly) ---- */
var PGN=0;
function hexMix(h1,h2,t){function e(h){return h.length===4?'#'+h[1]+h[1]+h[2]+h[2]+h[3]+h[3]:h;}h1=e(h1);h2=e(h2);function v(h,i){return parseInt(h.substr(1+i*2,2),16);}var o='#';for(var i=0;i<3;i++){var x=Math.round(v(h1,i)*(1-t)+v(h2,i)*t);o+=(x<16?'0':'')+x.toString(16);}return o;}
function penguinEyes(m,id){var open=(m==='happy'||m==='excited'||m==='hungry'),r=7,o='';
 if(open){[38,82].forEach(function(x){o+='<circle cx="'+x+'" cy="60" r="'+(r*1.55)+'" fill="url(#'+id('i')+')"/>';});}
 o+=eyes(m,60,60,22,r);
 return o;}
function penguinSVG(c,m){var b=c.b,d=c.d,l=c.l,s='',n=++PGN,id=function(k){return 'pg'+n+k;},hi=hexMix(b,'#ffffff',.3),lo=hexMix(b,'#000000',.5);
 s+='<defs>'
  +'<radialGradient id="'+id('d')+'" cx=".36" cy=".2" r=".95"><stop offset="0" stop-color="'+hi+'"/><stop offset=".42" stop-color="'+b+'"/><stop offset="1" stop-color="'+lo+'"/></radialGradient>'
  +'<linearGradient id="'+id('w')+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+hi+'"/><stop offset=".5" stop-color="'+b+'"/><stop offset="1" stop-color="'+lo+'"/></linearGradient>'
  +'<linearGradient id="'+id('n')+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DDE2EE"/><stop offset="1" stop-color="#9AA3B8"/></linearGradient>'
  +'<radialGradient id="'+id('s')+'" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#8795B4" stop-opacity=".4"/></radialGradient>'
  +'<linearGradient id="'+id('b')+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFC45E"/><stop offset="1" stop-color="#FF8A1C"/></linearGradient>'
  +'<linearGradient id="'+id('f')+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFB24D"/><stop offset="1" stop-color="#F0770F"/></linearGradient>'
  +'<radialGradient id="'+id('i')+'" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#C7E0F2"/><stop offset=".55" stop-color="#7BA3C6"/><stop offset="1" stop-color="#45688C"/></radialGradient>'
  +'</defs>';
 /* body: a wide head, a little waist, a round belly */
 s+='<path d="M60 8C86 8 108 28 108 58C108 76 100 90 98 98C112 106 116 130 112 146C108 164 86 172 60 172C34 172 12 164 8 146C4 130 8 106 22 98C20 90 12 76 12 58C12 28 34 8 60 8Z" fill="url(#'+id('d')+')" stroke="'+d+'" stroke-width="3" stroke-linejoin="round"/>';
 /* white: two big face patches, chin, throat and belly (one flat white, shading is laid on top) */
 s+='<g fill="'+l+'"><ellipse cx="38" cy="64" rx="21" ry="28" transform="rotate(8 38 64)"/><ellipse cx="82" cy="64" rx="21" ry="28" transform="rotate(-8 82 64)"/><ellipse cx="60" cy="86" rx="30" ry="16"/><ellipse cx="60" cy="116" rx="26" ry="22"/><ellipse cx="60" cy="133" rx="45" ry="36"/></g>';
 s+='<ellipse cx="38" cy="64" rx="21" ry="28" transform="rotate(8 38 64)" fill="url(#'+id('s')+')"/><ellipse cx="82" cy="64" rx="21" ry="28" transform="rotate(-8 82 64)" fill="url(#'+id('s')+')"/>';
 s+='<ellipse cx="60" cy="133" rx="45" ry="36" fill="url(#'+id('s')+')"/><ellipse cx="60" cy="100" rx="30" ry="8" fill="#9AA6C0" opacity=".3"/>';
 s+='<ellipse cx="38" cy="24" rx="15" ry="7" transform="rotate(-26 38 24)" fill="#fff" opacity=".24"/><ellipse cx="24" cy="38" rx="3.5" ry="6" transform="rotate(-24 24 38)" fill="#fff" opacity=".18"/><ellipse cx="42" cy="122" rx="10" ry="16" transform="rotate(14 42 122)" fill="#fff" opacity=".55"/>';
 /* feet in front of the belly */
 [[0,0],[1,0]].forEach(function(f){var mx=f[0]?-1:1,x=function(v){return f[0]?120-v:v;};
  s+='<path d="M'+x(20)+' 168C'+x(18)+' 160 '+x(30)+' 156 '+x(40)+' 158C'+x(50)+' 160 '+x(56)+' 168 '+x(52)+' 174C'+x(48)+' 180 '+x(30)+' 181 '+x(22)+' 176C'+x(20)+' 174 '+x(20)+' 171 '+x(20)+' 168Z" fill="url(#'+id('f')+')" stroke="#C26A12" stroke-width="2.4" stroke-linejoin="round"/><path d="M'+x(30)+' 177V170M'+x(40)+' 178V170" stroke="#C26A12" stroke-width="2" stroke-linecap="round" opacity=".7"/><path d="M'+x(26)+' 166Q'+x(34)+' 161 '+x(42)+' 163" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".4"/>';});
 s+=MK;
 /* little leaf-shaped wings, drawn in front: dark outside, light inside edge, swinging out from the shoulder */
 var fl=({happy:46,love:40,surprised:50,excited:64,eat:14})[m]||22;
 function wing(side){var x=function(v){return side<0?v:120-v;};
  return '<g transform="rotate('+(side<0?fl:-fl)+' '+x(26)+' 102)"><path d="M'+x(23)+' 99C'+x(14)+' 106 '+x(11)+' 126 '+x(15)+' 147C'+x(17)+' 152 '+x(21)+' 150 '+x(24)+' 144C'+x(30)+' 130 '+x(33)+' 113 '+x(32)+' 103C'+x(30)+' 97 '+x(26)+' 97 '+x(23)+' 99Z" fill="url(#'+id('w')+')" stroke="'+d+'" stroke-width="3" stroke-linejoin="round"/>'
   +'<path d="M'+x(29)+' 104C'+x(30)+' 115 '+x(27)+' 128 '+x(22)+' 140C'+x(26)+' 136 '+x(31)+' 123 '+x(32)+' 107Z" fill="url(#'+id('n')+')" opacity=".92"/>'
   +'<path d="M'+x(19)+' 110Q'+x(16)+' 121 '+x(18)+' 132" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".22"/></g>';}
 s+=wing(-1)+wing(1);
 s+=MK;
 /* head parts: a small tuft, the big shiny eyes, cheeks and the beak */
 s+='<path d="M60 10Q57 -2 62 -12M54 12Q46 3 43 -3M66 12Q74 3 78 -1" fill="none" stroke="'+d+'" stroke-width="4" stroke-linecap="round"/>';
 s+='<g class="blink">'+penguinEyes(m,id)+'</g>'+blush(m,60,60,22);
 s+=beakP(m,60,77,14,10,7,'url(#'+id('b')+')',null,m==='excited'?20:null)||('<path d="M46 78Q60 66 74 78Q70 92 60 94Q50 92 46 78Z" fill="url(#'+id('b')+')" stroke="#C26A12" stroke-width="2.6" '+SW+'/><path d="M52 76Q60 71 68 76" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".5"/><path d="M50 83Q60 95 70 83" fill="none" stroke="#C26A12" stroke-width="2.4" stroke-linecap="round" opacity=".85"/>');
 return s;}

/* generic open beak: upper half + coloured lower half; h = how far the mouth opens */
var OPENH={eat:22,yawn:31,surprised:15,excited:24,hungry:13};
function beakP(m,cx,y,w,up,dn,fu,fl,hh){var h=hh||OPENH[m];if(h===undefined)return null;fu=fu||ORANGE;fl=fl||'#E8456A';
 if(m==='surprised'||m==='hungry')w=Math.round(w*.62);else if(m==='yawn')w=Math.round(w*1.12);
 return '<path d="M'+(cx-w+2)+' '+(y+2)+'Q'+cx+' '+(y+2+h)+' '+(cx+w-2)+' '+(y+2)+'Q'+cx+' '+(y+dn)+' '+(cx-w+2)+' '+(y+2)+'Z" fill="'+fl+'" stroke="'+ORANGE_D+'" stroke-width="3" '+SW+'/>'
  +'<path d="M'+(cx-w)+' '+y+'Q'+cx+' '+(y-up)+' '+(cx+w)+' '+y+'Q'+cx+' '+(y+dn)+' '+(cx-w)+' '+y+'Z" fill="'+fu+'" stroke="'+ORANGE_D+'" stroke-width="3" '+SW+'/>';}
function pandaEyes(m,x1,x2,ey){var o='',K='fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round"';[x1,x2].forEach(function(x){var sd=x<60?-1:1;
 if(m==='happy')o+='<circle cx="'+x+'" cy="'+ey+'" r="6.6" fill="#fff"/><circle cx="'+x+'" cy="'+(ey+.4)+'" r="4.2" fill="'+INK+'"/><circle cx="'+(x-1.4)+'" cy="'+(ey-1.8)+'" r="1.8" fill="#fff"/><circle cx="'+(x+1.8)+'" cy="'+(ey+1.8)+'" r=".9" fill="#fff"/>';
 else if(m==='eat')o+='<path d="M'+(x-6)+' '+(ey+2)+'Q'+x+' '+(ey-7)+' '+(x+6)+' '+(ey+2)+'" '+K+' stroke-width="3.6"/>';
 else if(m==='asleep')o+='<path d="M'+(x-6.5)+' '+(ey-1)+'Q'+x+' '+(ey+7)+' '+(x+6.5)+' '+(ey-1)+'" '+K+' stroke-width="3.4"/>';
 else if(m==='bored')o+='<path d="M'+(x-6)+' '+ey+'A6 6 0 0 0 '+(x+6)+' '+ey+'Z" fill="#fff"/><circle cx="'+(x+1.5)+'" cy="'+(ey+2.6)+'" r="1.4" fill="'+INK+'"/><path d="M'+(x-7.5)+' '+ey+'L'+(x+7.5)+' '+ey+'" '+K+' stroke-width="3.2"/>';
 else if(m==='yawn')o+='<path d="M'+(x-sd*6)+' '+(ey-4.5)+'L'+(x+sd*3.4)+' '+ey+'L'+(x-sd*6)+' '+(ey+4.5)+'" '+K+' stroke-width="3.4"/>';
 else if(m==='surprised')o+='<circle cx="'+x+'" cy="'+ey+'" r="7.8" fill="#fff"/><circle cx="'+x+'" cy="'+(ey+.4)+'" r="3" fill="'+INK+'"/><circle cx="'+(x+1.2)+'" cy="'+(ey-.8)+'" r="1.1" fill="#fff"/>';
 else if(m==='excited')o+='<circle cx="'+x+'" cy="'+ey+'" r="6.8" fill="#fff"/><circle cx="'+x+'" cy="'+ey+'" r="4.6" fill="'+INK+'"/><circle cx="'+(x-1.4)+'" cy="'+(ey-1.8)+'" r="1.9" fill="#fff"/><circle cx="'+(x+1.8)+'" cy="'+(ey+1.8)+'" r="1" fill="#fff"/>';
 else if(m==='love')o+='<path d="M'+x+' '+(ey+6)+'C'+(x-11)+' '+(ey+.5)+' '+(x-6)+' '+(ey-8)+' '+x+' '+(ey-3)+'C'+(x+6)+' '+(ey-8)+' '+(x+11)+' '+(ey+.5)+' '+x+' '+(ey+6)+'Z" fill="#FF6F9C" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/>';
 else if(m==='hungry')o+='<circle cx="'+x+'" cy="'+ey+'" r="7" fill="#fff"/><circle cx="'+x+'" cy="'+(ey+.4)+'" r="5" fill="'+INK+'"/><circle cx="'+(x-1.6)+'" cy="'+(ey-2)+'" r="2.2" fill="#fff"/><circle cx="'+(x+2)+'" cy="'+(ey+2)+'" r="1" fill="#fff"/>';
 else o+='<path d="M'+(x-6)+' '+ey+'Q'+x+' '+(ey+6)+' '+(x+6)+' '+ey+'" '+K+' stroke-width="3.6"/>';});return o;}

function pandaSVG(c,m){var b=c.b,d=c.d,l=c.l,s='';
 s+='<circle cx="97" cy="152" r="9" fill="'+l+'" stroke="'+d+'" stroke-width="4"/>';
 s+='<path d="M60 84C34 84 24 112 26 138C28 160 42 168 60 168C78 168 92 160 94 138C96 112 86 84 60 84Z" fill="'+l+'" stroke="'+d+'" stroke-width="4"/>';
 s+='<path d="M27 116C36 100 84 100 93 116L89 128C78 119 42 119 31 128Z" fill="'+b+'" stroke="'+d+'" stroke-width="3" stroke-linejoin="round"/>';
 s+=MK;
 var up=armUp(m);
 s+='<g transform="rotate('+up+' 34 112)"><path d="M32 108C21 118 21 140 30 146C39 150 45 141 43 127Z" fill="'+b+'" stroke="'+d+'" stroke-width="3.5" '+SW+'/></g>';
 s+='<g transform="rotate('+(-up)+' 86 112)"><path d="M88 108C99 118 99 140 90 146C81 150 75 141 77 127Z" fill="'+b+'" stroke="'+d+'" stroke-width="3.5" '+SW+'/></g>';
 s+='<ellipse cx="42" cy="168" rx="15" ry="8" fill="'+b+'" stroke="'+d+'" stroke-width="3.5"/><ellipse cx="78" cy="168" rx="15" ry="8" fill="'+b+'" stroke="'+d+'" stroke-width="3.5"/>';
 s+=MK;
 s+='<circle cx="25" cy="30" r="15" fill="'+b+'" stroke="'+d+'" stroke-width="4"/><circle cx="95" cy="30" r="15" fill="'+b+'" stroke="'+d+'" stroke-width="4"/>';
 s+='<path d="M12 62C12 34 34 20 60 20C86 20 108 34 108 62C108 92 88 106 60 106C32 106 12 92 12 62Z" fill="'+l+'" stroke="'+d+'" stroke-width="4"/>';
 s+='<ellipse cx="42" cy="62" rx="12" ry="15.5" transform="rotate(14 42 62)" fill="'+b+'"/><ellipse cx="78" cy="62" rx="12" ry="15.5" transform="rotate(-14 78 62)" fill="'+b+'"/>';
 s+='<g class="blink">'+pandaEyes(m,44,76,62)+'</g>'+blush(m,60,64,24);
 s+='<path d="M52 76Q60 70 68 76Q65 84 60 85Q55 84 52 76Z" fill="'+INK+'"/>'+((m==='happy'||m==='love'||m==='asleep')?'<path d="M60 85V88Q52 99 45 90M60 88Q68 99 75 90" fill="none" stroke="'+INK+'" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>':mouthW(m,60,85));
 return s;}

var NECKX={penguin:1,panda:.74};
function accs2(t,acc){if(!acc)return '';var A=ANC[t],o='';SLOTORDER.forEach(function(sl){var it=ITEMS[acc[sl]];if(it&&it.slot===sl){var g=it.draw(A);
 if(sl==='neck'){g='<g transform="translate(60,0) scale('+(NECKX[t]||1)+',1) translate(-60,0)">'+g+'</g>';}o+=g;}});return o;}

/* ---- bodies for the five existing heads (the heads themselves are the live drawings) + the new duck ---- */
function armPaths(fill,d,m){var up=armUp(m);
 return '<g transform="rotate('+up+' 34 112)"><path d="M32 108C21 118 21 140 30 146C39 150 45 141 43 127Z" fill="'+fill+'" stroke="'+d+'" stroke-width="3.5" '+SW+'/></g>'
  +'<g transform="rotate('+(-up)+' 86 112)"><path d="M88 108C99 118 99 140 90 146C81 150 75 141 77 127Z" fill="'+fill+'" stroke="'+d+'" stroke-width="3.5" '+SW+'/></g>';}
function feetOf(fill,d,rx,ry){rx=rx||15;ry=ry||8;return '<ellipse cx="42" cy="168" rx="'+rx+'" ry="'+ry+'" fill="'+fill+'" stroke="'+d+'" stroke-width="3.5"/><ellipse cx="78" cy="168" rx="'+rx+'" ry="'+ry+'" fill="'+fill+'" stroke="'+d+'" stroke-width="3.5"/>';}
function pear(b,d){return '<path d="M60 86C37 86 27 112 29 138C31 160 44 168 60 168C76 168 89 160 91 138C93 112 83 86 60 86Z" fill="'+b+'" stroke="'+d+'" stroke-width="4"/>';}
function tailStroke(path,b,d,w){return '<path d="'+path+'" fill="none" stroke="'+d+'" stroke-width="'+(w+5)+'" stroke-linecap="round" stroke-linejoin="round"/><path d="'+path+'" fill="none" stroke="'+b+'" stroke-width="'+w+'" stroke-linecap="round" stroke-linejoin="round"/><path d="'+path+'" transform="translate(-1.6 -1.6)" fill="none" stroke="'+hexMix(b,'#ffffff',.55)+'" stroke-width="'+n1(w*.26)+'" stroke-linecap="round" stroke-linejoin="round" opacity=".3"/>';}

var MK='<!--S-->';
var BODY={
 cat:function(c,m){var b=c.b,d=c.d,l=c.l;
  return tailStroke('M88 152C122 154 130 118 112 104',b,d,9)+pear(b,d)+'<ellipse cx="60" cy="141" rx="18" ry="20" fill="'+l+'"/>'
   +'<path d="M33 122l9 4M33 134l9 3M87 122l-9 4M87 134l-9 3" stroke="'+d+'" stroke-width="3" stroke-linecap="round" opacity=".6"/>'
   +'<path d="M108 112l6 5M112 122l7 2" stroke="'+d+'" stroke-width="3" stroke-linecap="round" opacity=".5"/>'+MK+armPaths(b,d,m)+feetOf(b,d)
   +'<path d="M36 170v-5M42 171v-6M48 170v-5M72 170v-5M78 171v-6M84 170v-5" stroke="'+d+'" stroke-width="2" stroke-linecap="round" opacity=".6"/>';},
 dog:function(c,m){var b=c.b,d=c.d,l=c.l;
  return tailStroke('M90 152C110 152 116 132 108 118',b,d,10)+pear(b,d)+'<ellipse cx="60" cy="142" rx="18" ry="20" fill="'+l+'"/>'
   +'<ellipse cx="80" cy="124" rx="9" ry="12" fill="'+d+'" opacity=".26"/>'+MK+armPaths(b,d,m)+feetOf(b,d)
   +'<path d="M36 170v-5M42 171v-6M48 170v-5M72 170v-5M78 171v-6M84 170v-5" stroke="'+d+'" stroke-width="2" stroke-linecap="round" opacity=".6"/>';},
 monkey:function(c,m){var b=c.b,d=c.d,l=c.l;
  return tailStroke('M88 158C120 164 128 132 114 120C106 114 98 120 104 128',b,d,8)+pear(b,d)+'<ellipse cx="60" cy="141" rx="19" ry="21" fill="'+l+'"/>'+MK
   +armPaths(b,d,m)+feetOf(b,d,16,8.5)+'<ellipse cx="42" cy="169" rx="8" ry="4.5" fill="'+l+'"/><ellipse cx="78" cy="169" rx="8" ry="4.5" fill="'+l+'"/>';},
 bunny:function(c,m){var b=c.b,d=c.d,pad='#FFB3C8';
  return '<circle cx="98" cy="150" r="11" fill="#fff" stroke="'+d+'" stroke-width="4"/>'+pear(b,d)+'<ellipse cx="60" cy="142" rx="18" ry="20" fill="#fff" opacity=".75"/>'+MK+armPaths(b,d,m)
   +'<ellipse cx="40" cy="168" rx="19" ry="9" fill="'+b+'" stroke="'+d+'" stroke-width="3.5"/><ellipse cx="80" cy="168" rx="19" ry="9" fill="'+b+'" stroke="'+d+'" stroke-width="3.5"/>'
   +'<ellipse cx="40" cy="169.5" rx="9" ry="4.5" fill="'+pad+'"/><ellipse cx="80" cy="169.5" rx="9" ry="4.5" fill="'+pad+'"/>';},
 dino:function(c,m){var b=c.b,d=c.d,l=c.l;
  return '<path d="M86 100L102 96L92 112ZM90 116L106 114L94 130ZM92 132L108 134L94 146Z" fill="'+d+'" stroke="'+d+'" stroke-width="2" stroke-linejoin="round"/>'
   +'<path d="M86 146C112 146 130 138 138 116C124 130 108 134 92 126Z" fill="'+b+'" stroke="'+d+'" stroke-width="4" '+SW+'/>'
   +pear(b,d)+'<ellipse cx="60" cy="142" rx="18" ry="21" fill="'+l+'"/>'
   +'<path d="M34 128h10M34 138h10M76 128h10M76 138h10" stroke="'+d+'" stroke-width="3" stroke-linecap="round" opacity=".35"/>'+MK
   +armPaths(b,d,m)+feetOf(b,d,16,8.5)+'<path d="M32 170v-4M38 171v-5M44 171v-5M76 171v-5M82 171v-5M88 170v-4" stroke="'+d+'" stroke-width="2.2" stroke-linecap="round" opacity=".7"/>';}
};

function duckSVG(c,m){var b=c.b,d=c.d,l=c.l,s='';var up=armUp(m)*1.25;
 s+='<path d="M90 146Q114 138 114 118Q106 128 90 128Z" fill="'+b+'" stroke="'+d+'" stroke-width="4" '+SW+'/>';
 s+='<path d="M22 170Q20 160 33 159Q46 159 48 167Q49 174 36 176Q25 176 22 170Z" fill="'+ORANGE+'" stroke="'+ORANGE_D+'" stroke-width="3" '+SW+'/>';
 s+='<path d="M98 170Q100 160 87 159Q74 159 72 167Q71 174 84 176Q95 176 98 170Z" fill="'+ORANGE+'" stroke="'+ORANGE_D+'" stroke-width="3" '+SW+'/>';
 s+='<path d="M60 86C32 86 22 118 26 142C30 162 44 168 60 168C76 168 90 162 94 142C98 118 88 86 60 86Z" fill="'+b+'" stroke="'+d+'" stroke-width="4"/>';
 s+='<ellipse cx="60" cy="143" rx="21" ry="22" fill="'+l+'"/>';
 s+=MK;
 s+='<g transform="rotate('+up+' 30 110)"><path d="M32 106C14 116 13 142 25 149C37 152 45 140 43 124Z" fill="'+b+'" stroke="'+d+'" stroke-width="4" '+SW+'/><path d="M26 126Q30 138 37 142" fill="none" stroke="'+d+'" stroke-width="2.4" stroke-linecap="round" opacity=".5"/></g>';
 s+='<g transform="rotate('+(-up)+' 90 110)"><path d="M88 106C106 116 107 142 95 149C83 152 75 140 77 124Z" fill="'+b+'" stroke="'+d+'" stroke-width="4" '+SW+'/><path d="M94 126Q90 138 83 142" fill="none" stroke="'+d+'" stroke-width="2.4" stroke-linecap="round" opacity=".5"/></g>';
 s+=MK;
 s+='<path d="M14 58C14 30 34 14 60 14C86 14 106 30 106 58C106 90 86 104 60 104C34 104 14 90 14 58Z" fill="'+b+'" stroke="'+d+'" stroke-width="4"/>';
 s+='<path d="M52 16C48 4 60 -2 66 6C62 6 60 10 62 16Z" fill="'+b+'" stroke="'+d+'" stroke-width="3.5" stroke-linejoin="round"/>';
 s+='<ellipse cx="34" cy="28" rx="9" ry="5" transform="rotate(-30 34 28)" fill="#fff" opacity=".35"/>';
 s+='<g class="blink">'+eyes(m,60,54,21,6.5)+'</g>'+blush(m,60,54,21);
 s+=beakP(m,60,72,18,12,8)||('<path d="M42 72Q60 60 78 72Q76 88 60 88Q44 88 42 72Z" fill="'+ORANGE+'" stroke="'+ORANGE_D+'" stroke-width="3" '+SW+'/><path d="M50 74Q60 71 70 74" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".55"/><circle cx="54" cy="76" r="1.6" fill="'+ORANGE_D+'"/><circle cx="66" cy="76" r="1.6" fill="'+ORANGE_D+'"/>');
 return s;}

/* the five existing heads are drawn by the live draw(); I only take what is inside its <svg> */
function headOf(t,c,m){var x=draw(t,c,m,null);return x.replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'');}
var NEWSVG={penguin:penguinSVG,panda:pandaSVG,duck:duckSVG};
function parts(t,c,m){var s=NEWSVG[t]?NEWSVG[t](c,m):BODY[t](c,m)+MK+headOf(t,c,m);var a=s.split(MK);return {pre:a[0],post:a[1]||'',head:a[2]||''};}
/* ---- soft 3D look for every pet (the penguin has its own hand-made version above) ----
   Each palette colour becomes a radial gradient (light top-left, shaded bottom-right), outlines get thinner,
   eyes and noses get a glossy gradient and a few soft highlights are laid on top. Gradient ids are unique per
   drawing (duplicate ids across inline SVGs would resolve to the first one, which breaks if that one is hidden). */
var GN=0;
function rg(id,hi,mid,lo){return '<radialGradient id="'+id+'" cx=".34" cy=".24" r=".98"><stop offset="0" stop-color="'+hi+'"/><stop offset=".42" stop-color="'+mid+'"/><stop offset="1" stop-color="'+lo+'"/></radialGradient>';}
function softStr(c,id){var defs='',map=[];
 function add(x,key,hi,lo){if(!x||map.some(function(q){return q[0]===x;}))return;defs+=rg(id+key,hexMix(x,'#ffffff',hi),x,lo);map.push([x,id+key]);}
 add(c.b,'b',.34,hexMix(c.b,'#3B2F5C',.3));add(c.l,'l',.65,hexMix(c.l,'#8F96BE',.3));add(c.d,'d',.15,hexMix(c.d,'#000000',.3));
 defs+=rg(id+'k','#56679A',INK,'#0F1528');map.push([INK,id+'k']);
 var dre=new RegExp('stroke="'+c.d.replace('#','#')+'" stroke-width="(\\d+(?:\\.\\d+)?)"','g');
 return {defs:defs,f:function(s){map.forEach(function(q){s=s.split('fill="'+q[0]+'"').join('fill="url(#'+q[1]+')"');});
  return s.replace(dre,function(_,w){return 'stroke="'+c.d+'" stroke-width="'+n1(w*.7)+'"';});}};}
/* clothes, hats, glasses...: every solid colour (except white) becomes a soft gradient; returns the string with its own defs */
function softAny(s,id){var seen={},defs='',i=0;
 s=s.replace(/fill="(#[0-9A-Fa-f]{6})"/g,function(_,x){var k=x.toLowerCase();if(k==='#ffffff')return _;if(!seen[k]){seen[k]=id+'x'+(i++);defs+=rg(seen[k],hexMix(x,'#ffffff',.38),x,hexMix(x,'#2B2250',.28));}return 'fill="url(#'+seen[k]+')"';});
 return defs?'<defs>'+defs+'</defs>'+s:s;}
var HEADHL={cat:'<ellipse cx="34" cy="45" rx="16" ry="6.5" transform="rotate(-22 34 45)"/><ellipse cx="19" cy="60" rx="3" ry="6" transform="rotate(-18 19 60)"/>',
 dog:'<ellipse cx="36" cy="41" rx="16" ry="6.5" transform="rotate(-22 36 41)"/><ellipse cx="21" cy="57" rx="3" ry="6" transform="rotate(-16 21 57)"/>',
 monkey:'<ellipse cx="34" cy="38" rx="16" ry="6.5" transform="rotate(-22 34 38)"/><ellipse cx="19" cy="54" rx="3" ry="6" transform="rotate(-16 19 54)"/>',
 bunny:'<ellipse cx="33" cy="53" rx="14" ry="6" transform="rotate(-22 33 53)"/>',
 dino:'<ellipse cx="34" cy="45" rx="16" ry="6.5" transform="rotate(-22 34 45)"/><ellipse cx="19" cy="62" rx="3" ry="6" transform="rotate(-16 19 62)"/>',
 panda:'<ellipse cx="22" cy="24" rx="5" ry="3" transform="rotate(-30 22 24)"/><ellipse cx="92" cy="24" rx="5" ry="3" transform="rotate(30 92 24)"/>'};
var BODYHL={def:'<ellipse cx="44" cy="124" rx="7" ry="15" transform="rotate(12 44 124)" fill="#fff" opacity=".32"/><ellipse cx="36" cy="102" rx="9" ry="3.5" transform="rotate(-24 36 102)" fill="#fff" opacity=".22"/>',duck:'<ellipse cx="42" cy="128" rx="8" ry="16" transform="rotate(12 42 128)" fill="#fff" opacity=".34"/>',panda:'<ellipse cx="42" cy="108" rx="9" ry="3.5" transform="rotate(-24 42 108)" fill="#fff" opacity=".4"/>'};
function composePet(t,c,m,eq){var P=parts(t,c,m),o=eq&&eq.body&&OUTFITS[eq.body],A=OUT[t]||OUT.def,ou=o?o.draw(A,m):{back:'',under:'',over:''},id='sf'+(++GN);
 if(t!=='penguin'){var S=softStr(c,id);P.pre='<defs>'+S.defs+'</defs>'+S.f(P.pre)+(BODYHL[t]||BODYHL.def);P.post=S.f(P.post);
  P.head=S.f(P.head)+(HEADHL[t]?'<g fill="#fff" opacity=".26">'+HEADHL[t]+'</g>':'');}
 var head=P.head+softAny(accs2(t,eq),id+'a');
 return softAny(ou.back,id+'o')+'<g class="torso">'+P.pre+softAny(ou.under,id+'u')+'</g>'+P.post+softAny(ou.over,id+'v')+'<g class="headg">'+head+'</g>';}
function drawPet(t,c,m,eq){return composePet(t,c,m,eq);}

/* ---- real clothes: drawn once, fitted to every body by a width profile (y, half-width) ----
   draw(A,m) returns {back,under,over}: back = behind the pet, under = on the torso (arms/wings are drawn on top),
   over = on top of the arms (sleeves, collars) */
var PEARP=[[96,23.5],[100,24.5],[110,27.5],[120,30],[132,31.2],[142,31],[152,27.6],[160,21]];
var OUT={
 cat:{p:PEARP,top:102,hem:156,sl:1,cw:48},dog:{p:PEARP,top:104,hem:156,sl:1,cw:48},monkey:{p:PEARP,top:103,hem:156,sl:1,cw:48},
 bunny:{p:PEARP,top:106,hem:156,sl:1,cw:48},dino:{p:PEARP,top:104,hem:156,sl:1,cw:48},
 duck:{p:[[104,29.5],[116,33.5],[128,35.5],[142,36],[152,32.5],[160,26]],top:102,hem:158,sl:0,cw:54},
 penguin:{p:[[98,39.2],[104,45.2],[112,49.7],[120,52.1],[128,53.3],[136,53.4],[144,52.5],[152,50],[160,43.9]],top:100,hem:152,sl:0,cw:66,dip:10},
 panda:{p:[[104,28.5],[115,32.5],[128,33.5],[140,33],[154,29.3],[161,23]],top:104,hem:158,sl:1,cw:52}
};
OUT.def=OUT.cat;

function f1(n){return Math.round(n*10)/10;}
function hw(A,y){var p=A.p;if(y<=p[0][0])return p[0][1];for(var i=1;i<p.length;i++){if(y<=p[i][0]){var a=p[i-1],b=p[i];return a[1]+(b[1]-a[1])*(y-a[0])/(b[0]-a[0]);}}return p[p.length-1][1];}
function sm(p,move){var s=(move?'M':'L')+p[0][0]+' '+p[0][1];
 for(var i=1;i<p.length-1;i++){s+='Q'+p[i][0]+' '+p[i][1]+' '+f1((p[i][0]+p[i+1][0])/2)+' '+f1((p[i][1]+p[i+1][1])/2);}
 return s+'L'+p[p.length-1][0]+' '+p[p.length-1][1];}
/* garment half-width at height y: body width plus a margin that grows from g0 (top) to g1 (hem) */
function gw(A,y,y1,g0,g1){return hw(A,y)+g0+(g1-g0)*Math.max(0,Math.min(1,(y-A.top)/(y1-A.top)));}
function body(A,y1,g0,g1,fill,stroke,hc){var L=[],R=[],y;
 for(y=A.top;y<y1;y+=6){var w=gw(A,y,y1,g0,g1);L.push([f1(60-w),y]);R.push([f1(60+w),y]);}
 var w1=hw(A,y1)+g1;L.push([f1(60-w1),y1]);R.push([f1(60+w1),y1]);R.reverse();
 return '<path d="'+sm(L,true)+'Q60 '+(y1+(hc||6))+' '+R[0][0]+' '+R[0][1]+sm(R,false)+(A.dip?'Q60 '+(A.top+A.dip)+' '+L[0][0]+' '+L[0][1]:'')+'Z" fill="'+fill+'" stroke="'+stroke+'" stroke-width="3" stroke-linejoin="round"/>';}
function star5(x,y,r,fill,stroke){var p='';for(var i=0;i<10;i++){var a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.45:r;p+=(i?'L':'M')+f1(x+rr*Math.cos(a))+' '+f1(y+rr*Math.sin(a));}
 return '<path d="'+p+'Z" fill="'+fill+'" stroke="'+stroke+'" stroke-width="1.4" stroke-linejoin="round"/>';}
function spark4(x,y,r,fill){return '<path d="M'+x+' '+(y-r)+'Q'+x+' '+y+' '+(x+r)+' '+y+'Q'+x+' '+y+' '+x+' '+(y+r)+'Q'+x+' '+y+' '+(x-r)+' '+y+'Q'+x+' '+y+' '+x+' '+(y-r)+'Z" fill="'+fill+'"/>';}
/* sleeves sit on top of the arms (bears, cats, dogs ... and the panda); birds keep their wings */
function sleeves(A,f,s,m,cuff){if(!A.sl)return '';var up=armUp(m);
 var Lp='M32 108C22 117 21.5 126 23 133L44 133C44.5 130 44 128.5 43 127Z',Rp='M88 108C98 117 98.5 126 97 133L76 133C75.5 130 76 128.5 77 127Z';
 return '<g transform="rotate('+up+' 34 112)"><path d="'+Lp+'" fill="'+f+'" stroke="'+s+'" stroke-width="3" stroke-linejoin="round"/>'+(cuff?'<path d="M24 131.4L43.2 131.4" stroke="'+cuff+'" stroke-width="3.6"/>':'')+'</g>'
  +'<g transform="rotate('+(-up)+' 86 112)"><path d="'+Rp+'" fill="'+f+'" stroke="'+s+'" stroke-width="3" stroke-linejoin="round"/>'+(cuff?'<path d="M96 131.4L76.8 131.4" stroke="'+cuff+'" stroke-width="3.6"/>':'')+'</g>';}
function strip(A,y,y1,g0,g1,col,w,op){var x=gw(A,y,y1,g0,g1)-1.5;return '<path d="M'+f1(60-x)+' '+y+'L'+f1(60+x)+' '+y+'" stroke="'+col+'" stroke-width="'+w+'" opacity="'+(op||1)+'"/>';}
function dot(x,y,r,fill){return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+fill+'"/>';}

var OUTFITS={
 tshirt:{name:'T-shirt',cn:'T恤',price:8,draw:function(A,m){var f='#FF6B6B',s='#B83A3A',y1=A.hem-6,cy=A.top+(y1-A.top)*.58;
  return {back:'',under:body(A,y1,1.8,2.4,f,s,6)+'<path d="M48 '+(A.top+1)+'Q60 '+(A.top+14)+' 72 '+(A.top+1)+'" fill="#FFE0E0" stroke="'+s+'" stroke-width="2.6" stroke-linecap="round"/>'+star5(60,cy,8.5,'#FFD54A','#B8860B'),over:sleeves(A,f,s,m,'#FFE0E0')};}},
 pj:{name:'Pyjamas',cn:'睡衣',price:8,draw:function(A,m){var f='#9AD7F5',s='#3C8FB8',y1=A.hem-2,t=A.top,o='';
  [[-14,22],[12,16],[0,40],[-20,44],[18,38]].forEach(function(p,i){o+=spark4(60+p[0],t+p[1],i%2?3.6:4.6,'#fff');});
  return {back:'',under:body(A,y1,2,3,f,s,6)+o+dot(60,t+16,2.2,'#3C8FB8')+dot(60,t+28,2.2,'#3C8FB8')+dot(60,t+40,2.2,'#3C8FB8')
   +'<path d="M46 '+(t+1)+'L60 '+(t+14)+'L74 '+(t+1)+'" fill="#fff" stroke="'+s+'" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>',over:sleeves(A,f,s,m,'#fff')};}},
 rain:{name:'Raincoat',cn:'雨衣',price:10,draw:function(A,m){var f='#FFD23F',s='#C98A00',y1=A.hem+1,t=A.top,hd='<ellipse cx="60" cy="'+(t+1)+'" rx="'+f1(hw(A,t)+6)+'" ry="11" fill="#F2B705" stroke="'+s+'" stroke-width="3"/>';
  return {back:'',under:hd+body(A,y1,2.4,4,f,s,6)+strip(A,y1-9,y1,2.4,4,'#fff',4,.85)+'<path d="M60 '+(t+8)+'L60 '+(y1-1)+'" stroke="'+s+'" stroke-width="2.4"/>'
   +dot(60,t+20,3,'#fff').replace('/>',' stroke="'+s+'" stroke-width="1.6"/>')+dot(60,t+34,3,'#fff').replace('/>',' stroke="'+s+'" stroke-width="1.6"/>')+dot(60,t+48,3,'#fff').replace('/>',' stroke="'+s+'" stroke-width="1.6"/>'),over:sleeves(A,f,s,m,'#F2B705')};}},
 hoodie:{name:'Hoodie',cn:'连帽衫',price:10,draw:function(A,m){var f='#8E7CF5',s='#5B3FC4',y1=A.hem+1,t=A.top,py=f1(t+(y1-t)*.58),hd='<ellipse cx="60" cy="'+(t+1)+'" rx="'+f1(hw(A,t)+6)+'" ry="11" fill="#7A68E0" stroke="'+s+'" stroke-width="3"/>';
  return {back:'',under:hd+body(A,y1,2,3.4,f,s,6)
   +'<path d="M40 '+py+'Q60 '+(py-3)+' 80 '+py+'L85 '+(py+17)+'Q60 '+(py+22)+' 35 '+(py+17)+'Z" fill="#7A68E0" stroke="'+s+'" stroke-width="2.6" stroke-linejoin="round"/>'
   +'<path d="M53 '+(t+5)+'L52 '+(t+21)+'M67 '+(t+5)+'L68 '+(t+21)+'" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>'+dot(52,t+23,2.4,'#fff')+dot(68,t+23,2.4,'#fff'),over:sleeves(A,f,s,m,'#7A68E0')};}},
 dress:{name:'Dress',cn:'连衣裙',price:10,draw:function(A,m){var f='#FF8FB5',s='#C0527A',y1=A.hem+2,t=A.top,wy=f1(t+(y1-t)*.36),d='';
  [[0,12],[1,24],[0,36],[1,48]].forEach(function(r){var yy=wy+r[1];if(yy>y1-6)return;[-1,0,1].forEach(function(j){var x=60+j*18+(r[0]?9:0);if(Math.abs(x-60)<gw(A,yy,y1,1.8,11)-5)d+=dot(f1(x),f1(yy),2.6,'#fff');});});
  return {back:'',under:body(A,y1,1.8,11,f,s,8)+d+strip(A,wy,y1,1.8,11,'#FF5A8F',5)
   +'<path d="M60 '+wy+'C47 '+(wy-10)+' 45 '+(wy+7)+' 60 '+wy+'C73 '+(wy-10)+' 75 '+(wy+7)+' 60 '+wy+'Z" fill="#FF5A8F" stroke="#C0527A" stroke-width="2" stroke-linejoin="round"/>'+dot(60,wy,2.6,'#FFD54A'),over:''};}},
 apron:{name:'Chef apron',cn:'厨师围裙',price:8,draw:function(A,m){var s='#6FA3D6',t=A.top,y1=A.hem+1,wy=f1(t+(y1-t)*.34),wx=hw(A,wy)+2,bx=hw(A,y1)+3.5;
  return {back:'',under:'<path d="M48 '+(t+2)+'L47 '+(wy)+'L'+f1(60-wx)+' '+(wy+2)+'L'+f1(60-bx)+' '+y1+'Q60 '+(y1+7)+' '+f1(60+bx)+' '+y1+'L'+f1(60+wx)+' '+(wy+2)+'L73 '+wy+'L72 '+(t+2)+'Z" fill="#fff" stroke="'+s+'" stroke-width="3" stroke-linejoin="round"/>'
   +'<path d="M'+f1(60-wx-4)+' '+(wy+2)+'L'+f1(60+wx+4)+' '+(wy+2)+'" stroke="#E8456A" stroke-width="4" stroke-linecap="round"/>'
   +'<path d="M'+f1(60+wx+2)+' '+(wy+2)+'C'+f1(60+wx+10)+' '+(wy-6)+' '+f1(60+wx+11)+' '+(wy+8)+' '+f1(60+wx+2)+' '+(wy+2)+'Z" fill="#E8456A" stroke="#B02A5A" stroke-width="1.6" stroke-linejoin="round"/>'
   +'<rect x="46" y="'+f1(wy+16)+'" width="28" height="15" rx="4" fill="#E9F4FF" stroke="'+s+'" stroke-width="2.4"/>'+'<path d="M60 '+f1(wy+28)+'C54 '+f1(wy+23)+' 54 '+f1(wy+18)+' 57 '+f1(wy+18.5)+'C58.6 '+f1(wy+19)+' 59.6 '+f1(wy+20)+' 60 '+f1(wy+21)+'C60.4 '+f1(wy+20)+' 61.4 '+f1(wy+19)+' 63 '+f1(wy+18.5)+'C66 '+f1(wy+18)+' 66 '+f1(wy+23)+' 60 '+f1(wy+28)+'Z" fill="#FF6F9C"/>',over:''};}},
 cape:{name:'Hero cape',cn:'英雄披风',price:12,draw:function(A,m){var f='#E8456A',s='#A82047',t=A.top,tw=f1(hw(A,t)+4),cw=A.cw,hy=A.hem+14,mid=f1(t+(hy-t)/2);
  var hem='Q'+f1(60+cw*.5)+' '+(hy+10)+' 60 '+(hy+1)+'Q'+f1(60-cw*.5)+' '+(hy+10)+' '+f1(60-cw)+' '+hy;
  return {back:'<path d="M'+f1(60-tw)+' '+(t-2)+'Q'+f1(60-tw-6)+' '+mid+' '+f1(60-cw)+' '+hy+'Q'+f1(60-cw*.5)+' '+(hy+10)+' 60 '+(hy+1)+'Q'+f1(60+cw*.5)+' '+(hy+10)+' '+f1(60+cw)+' '+hy+'Q'+f1(60+tw+6)+' '+mid+' '+f1(60+tw)+' '+(t-2)+'Z" fill="'+f+'" stroke="'+s+'" stroke-width="3.5" stroke-linejoin="round"/>'
   +'<path d="M'+f1(60-cw*.62)+' '+(hy-4)+'Q60 '+(hy+7)+' '+f1(60+cw*.62)+' '+(hy-4)+'" fill="none" stroke="#FFC93C" stroke-width="3.4" stroke-linecap="round"/>',
   under:'',over:'<path d="M'+f1(60-tw-1)+' '+(t+1)+'Q60 '+(t+15)+' '+f1(60+tw+1)+' '+(t+1)+'" fill="none" stroke="#C0183C" stroke-width="5" stroke-linecap="round"/>'+star5(60,t+12,7.5,'#FFD54A','#B8860B')};}},
 astro:{name:'Space suit',cn:'太空服',price:14,draw:function(A,m){var f='#F3F6FB',s='#8A97B0',y1=A.hem-3,t=A.top;
  return {back:'',under:body(A,y1,2,3,f,s,6)+strip(A,t+17,y1,2,3,'#FF8A3D',6)
   +'<rect x="68" y="'+(t+26)+'" width="14" height="11" rx="2.6" fill="#C9D3E6" stroke="'+s+'" stroke-width="2"/>'+dot(72,t+31.5,2,'#E8456A')+dot(78,t+31.5,2,'#35B779')
   +'<circle cx="46" cy="'+(t+32)+'" r="6.5" fill="#5AA9E6" stroke="#2A6CA8" stroke-width="2.2"/>'+star5(46,t+32,4.2,'#fff','#fff')
   +'<ellipse cx="60" cy="'+(t+2)+'" rx="'+f1(hw(A,t)+3)+'" ry="8" fill="#D8E6F5" stroke="'+s+'" stroke-width="3"/>',over:sleeves(A,f,s,m,'#FF8A3D')};}}
};
var OUTFIT_IDS=['tshirt','pj','rain','hoodie','dress','apron','cape','astro'];
OUTFIT_IDS.forEach(function(k){OUTFITS[k].slot='body';OUTFITS[k].vb=k==='cape'?'8 90 104 96':'18 90 84 80';OUTFITS[k].icon=function(){var o=this.draw(OUT.def,'x');return softAny(o.back+o.under+o.over,'ic'+(++GN));};});

/* ---- homes: a simple free base scene + decorations bought with stars ---- */
function qpt(x0,y0,cx,cy,x1,y1,t){return [(1-t)*(1-t)*x0+2*(1-t)*t*cx+t*t*x1,(1-t)*(1-t)*y0+2*(1-t)*t*cy+t*t*y1];}
function swag(x0,y0,cx,cy,x1,y1,n,cols){var o='<path d="M'+x0+' '+y0+'Q'+cx+' '+cy+' '+x1+' '+y1+'" fill="none" stroke="#51709A" stroke-width="1.8"/>';
 for(var i=1;i<=n;i++){var p=qpt(x0,y0,cx,cy,x1,y1,i/(n+1)),col=cols[i%cols.length];
  o+='<circle class="twinkle" style="animation-delay:'+(i*.45).toFixed(2)+'s" cx="'+p[0].toFixed(1)+'" cy="'+(p[1]+4).toFixed(1)+'" r="3.8" fill="'+col+'" stroke="#fff" stroke-width="1.2"/>';}
 return o;}
function flakes(){var o='<g fill="#fff" opacity=".9">';
 for(var i=0;i<14;i++){var x=(i*53+17)%350+5,r=1.4+(i%3)*.8;o+='<circle class="flake" style="animation-duration:'+(7+i%5*1.6).toFixed(1)+'s;animation-delay:-'+(i*.9).toFixed(1)+'s" cx="'+x+'" cy="0" r="'+r+'"/>';}
 return o+'</g>';}
function leaf(x,y,rot,col){return '<path transform="translate('+x+','+y+') rotate('+rot+')" d="M0 0C6 -5 14 -4 20 0C14 4 6 5 0 0Z" fill="'+col+'" stroke="#3F8F4A" stroke-width="1.5" stroke-linejoin="round"/>';}
function stalk(x,y0,y1,w){var o='<rect x="'+x+'" y="'+y0+'" width="'+w+'" height="'+(y1-y0)+'" rx="'+(w/2)+'" fill="#86CE76" stroke="#3F8F4A" stroke-width="2.5"/>';
 for(var y=y0+22;y<y1-6;y+=26)o+='<path d="M'+x+' '+y+'H'+(x+w)+'" stroke="#3F8F4A" stroke-width="2.5"/>';
 o+='<rect x="'+(x+2)+'" y="'+(y0+3)+'" width="2.2" height="'+(y1-y0-8)+'" rx="1" fill="#fff" opacity=".35"/>';
 o+=leaf(x+w,y0+14,-35,'#6CC36A')+leaf(x,y0+36,215,'#5DBA62')+leaf(x+w,y0+58,-12,'#6CC36A');
 return o;}
function lantern(x,y,col){return '<g><path d="M'+x+' '+y+'V'+(y+14)+'" stroke="#8A5A2B" stroke-width="2"/><rect x="'+(x-5)+'" y="'+(y+13)+'" width="10" height="4" rx="1.5" fill="#E0A63A" stroke="#9A6A10" stroke-width="1.5"/><circle cx="'+x+'" cy="'+(y+28)+'" r="17" fill="#FFE08A" opacity=".3"/><ellipse cx="'+x+'" cy="'+(y+28)+'" rx="10" ry="12" fill="'+col+'" stroke="#B0301A" stroke-width="2.4"/><path d="M'+(x-5)+' '+(y+18)+'Q'+x+' '+(y+28)+' '+(x-5)+' '+(y+39)+'M'+(x+5)+' '+(y+18)+'Q'+x+' '+(y+28)+' '+(x+5)+' '+(y+39)+'" fill="none" stroke="#B0301A" stroke-width="1.6" opacity=".55"/><rect x="'+(x-5)+'" y="'+(y+39)+'" width="10" height="4" rx="1.5" fill="#E0A63A" stroke="#9A6A10" stroke-width="1.5"/><path d="M'+x+' '+(y+43)+'V'+(y+51)+'" stroke="#E0A63A" stroke-width="2" stroke-linecap="round"/></g>';}
function flower(x,y,col,sc){sc=sc||1;var o='<g transform="translate('+x+','+y+') scale('+sc+')"><path d="M0 0V16" stroke="#3F8F4A" stroke-width="2.4" stroke-linecap="round"/><path d="M0 12Q6 8 9 12Q5 15 0 12Z" fill="#6CC36A"/>';
 for(var i=0;i<5;i++){var t=i*1.2566-1.5708;o+='<circle cx="'+(Math.cos(t)*5.2).toFixed(1)+'" cy="'+(Math.sin(t)*5.2).toFixed(1)+'" r="4.2" fill="'+col+'" stroke="#fff" stroke-width="1"/>';}
 return o+'<circle cx="0" cy="0" r="3" fill="#FFD93D"/></g>';}
function butterfly(x,y,col,delay){return '<g class="flutter" style="animation-delay:'+delay+'s"><g transform="translate('+x+','+y+')"><ellipse cx="-5" cy="-3" rx="6" ry="8" transform="rotate(-25 -5 -3)" fill="'+col+'" stroke="#fff" stroke-width="1.2"/><ellipse cx="5" cy="-3" rx="6" ry="8" transform="rotate(25 5 -3)" fill="'+col+'" stroke="#fff" stroke-width="1.2"/><ellipse cx="-3.5" cy="5" rx="4" ry="5" fill="'+col+'" opacity=".85"/><ellipse cx="3.5" cy="5" rx="4" ry="5" fill="'+col+'" opacity=".85"/><path d="M0 -8V9" stroke="'+INK+'" stroke-width="2" stroke-linecap="round"/></g></g>';}

var HOMES={
penguin:{name:'Ice igloo',cn:'冰屋',
 defs:'<linearGradient id="gSkyP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A9D8FA"/><stop offset=".6" stop-color="#E3F3FF"/><stop offset="1" stop-color="#F6FBFF"/></linearGradient>'
  +'<linearGradient id="gSnowP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#D5E6F7"/></linearGradient>'
  +'<linearGradient id="gAur" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6DF0C1"/><stop offset=".55" stop-color="#8FD8FF"/><stop offset="1" stop-color="#F7A8E8"/></linearGradient>',
 base:function(){return '<rect width="360" height="300" fill="url(#gSkyP)"/>'
  +'<g fill="#fff"><path class="twinkle" d="M312 40l3 8 8 3-8 3-3 8-3-8-8-3 8-3z"/><path class="twinkle" style="animation-delay:.8s" d="M64 58l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/><path class="twinkle" style="animation-delay:1.5s" d="M214 34l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/></g>'
  +'<path d="M0 196L58 124L104 176L158 112L222 186L282 132L360 198V240H0Z" fill="#C7E0F5"/>'
  +'<path d="M58 124L47 141L58 135L70 142ZM158 112L146 132L158 126L171 134ZM282 132L272 148L282 142L293 150Z" fill="#fff"/>'
  +'<path d="M0 216C50 198 100 208 150 214C210 222 270 202 360 214V252H0Z" fill="#E1F0FC"/>'
  +'<path d="M0 232C60 220 130 230 190 226C250 222 310 216 360 228V300H0Z" fill="url(#gSnowP)"/>'
  +'<ellipse cx="86" cy="270" rx="74" ry="12" fill="#fff" opacity=".85"/><ellipse cx="300" cy="282" rx="64" ry="10" fill="#fff" opacity=".85"/>'
  +'<g><path d="M14 242C14 192 46 168 72 168C98 168 130 192 130 242Z" fill="#F3F9FF" stroke="#9DB9D6" stroke-width="4" stroke-linejoin="round"/>'
  +'<g fill="none" stroke="#C5D8EC" stroke-width="2.5" stroke-linecap="round"><path d="M20 220H124"/><path d="M28 200H116"/><path d="M46 184H98"/><path d="M48 220V200M72 220V200M96 220V200M60 200V184M84 200V184M34 242V220M110 242V220"/></g>'
  +'<path d="M56 242V226C56 210 88 210 88 226V242Z" fill="#6E8FB5" stroke="#9DB9D6" stroke-width="3"/></g>'
  +flakes();},
 decos:[
  {id:'aurora',name:'Northern lights',cn:'极光',price:12,icon:'<path d="M4 36C14 18 24 40 34 22C44 8 52 26 56 14V30C50 40 42 24 34 40C24 54 14 38 4 52Z" fill="#8FD8FF"/><path d="M4 44C14 28 26 46 36 32C44 22 52 34 56 26V36C50 46 44 34 36 48C26 58 14 48 4 56Z" fill="#6DF0C1" opacity=".8"/>',
   svg:function(){return '<g class="aur"><path d="M0 62C60 22 120 84 190 46C250 14 310 54 360 24V64C310 96 250 52 190 92C120 124 60 76 0 106Z" fill="url(#gAur)" opacity=".7"/><path d="M0 88C70 56 130 106 200 76C260 52 320 86 360 62V86C320 108 260 78 200 106C130 132 70 94 0 118Z" fill="url(#gAur)" opacity=".4"/></g>';}},
  {id:'garland',name:'Flag garland',cn:'彩旗',price:5,icon:'<path d="M4 12Q30 40 56 12" fill="none" stroke="#51709A" stroke-width="2"/><path d="M12 22l5 12 5-12zM24 28l5 12 5-12zM36 28l5 12 5-12z" fill="#FF6B6B"/><path d="M18 26l-0 0" />',
   svg:function(){var o='<path d="M72 168Q182 224 292 150" fill="none" stroke="#51709A" stroke-width="2"/>',cols=['#FF6B6B','#FFD93D','#6BCB77','#4D96FF','#C084FC'];
    for(var i=1;i<=9;i++){var p=qpt(72,168,182,224,292,150,i/10);o+='<path d="M'+(p[0]-7).toFixed(1)+' '+(p[1]).toFixed(1)+'h14l-7 14z" fill="'+cols[i%5]+'" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/>';}
    return o;}},
  {id:'lights',name:'String lights',cn:'彩灯',price:4,icon:'<path d="M6 16Q18 38 30 18Q42 38 54 16" fill="none" stroke="#51709A" stroke-width="2"/><circle cx="14" cy="28" r="5" fill="#FF6B6B"/><circle cx="30" cy="30" r="5" fill="#FFD93D"/><circle cx="46" cy="28" r="5" fill="#4D96FF"/>',
   svg:function(){var cols=['#FF6B6B','#FFD93D','#6BCB77','#4D96FF'];return swag(26,214,49,238,72,212,3,cols)+swag(72,212,95,238,118,214,3,cols);}},
  {id:'tree',name:'Little pine tree',cn:'小松树',price:6,icon:'<path d="M30 6L50 30H10Z" fill="#43AD78" stroke="#2E8559" stroke-width="3" stroke-linejoin="round"/><path d="M30 20L54 46H6Z" fill="#4DB985" stroke="#2E8559" stroke-width="3" stroke-linejoin="round"/><circle cx="24" cy="38" r="3" fill="#FF6B6B"/><circle cx="38" cy="42" r="3" fill="#FFD93D"/>',
   svg:function(){return '<g><rect x="288" y="226" width="9" height="16" rx="2" fill="#9A6A3C" stroke="#6B4423" stroke-width="2.5"/>'
    +'<path d="M292 186L330 236H254Z" fill="#43AD78" stroke="#2E8559" stroke-width="3" stroke-linejoin="round"/><path d="M292 162L324 212H260Z" fill="#4DB985" stroke="#2E8559" stroke-width="3" stroke-linejoin="round"/><path d="M292 138L318 186H266Z" fill="#58C48F" stroke="#2E8559" stroke-width="3" stroke-linejoin="round"/>'
    +'<path d="M280 150Q292 160 304 150L298 142H286Z" fill="#fff" opacity=".9"/><path d="M270 196Q292 208 314 196" fill="none" stroke="#fff" stroke-width="3" opacity=".8" stroke-linecap="round"/>'
    +'<circle cx="282" cy="176" r="4" fill="#FF6B6B" stroke="#fff" stroke-width="1.2"/><circle cx="302" cy="168" r="4" fill="#FFD93D" stroke="#fff" stroke-width="1.2"/><circle cx="290" cy="214" r="4" fill="#4D96FF" stroke="#fff" stroke-width="1.2"/><circle cx="312" cy="206" r="4" fill="#FF6B6B" stroke="#fff" stroke-width="1.2"/>'
    +'<path d="M292 126l3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1z" fill="#FFC93C" stroke="#B26A00" stroke-width="1.8" stroke-linejoin="round"/></g>';}},
  {id:'snowman',name:'Snowman',cn:'雪人',price:8,icon:'<circle cx="30" cy="42" r="14" fill="#fff" stroke="#9DB9D6" stroke-width="3"/><circle cx="30" cy="24" r="10" fill="#fff" stroke="#9DB9D6" stroke-width="3"/><rect x="23" y="6" width="14" height="9" fill="#2B3350"/><path d="M30 24l9 2-9 2z" fill="#FF9A3D"/>',
   svg:function(){return '<g><circle cx="334" cy="260" r="21" fill="#fff" stroke="#9DB9D6" stroke-width="3"/><circle cx="334" cy="228" r="15" fill="#fff" stroke="#9DB9D6" stroke-width="3"/><circle cx="334" cy="205" r="11.5" fill="#fff" stroke="#9DB9D6" stroke-width="3"/>'
    +'<path d="M321 217Q334 225 347 217L348 223Q334 232 320 223Z" fill="#E8456A" stroke="#9E1F3E" stroke-width="2" stroke-linejoin="round"/><path d="M344 222l4 12-7-3z" fill="#E8456A" stroke="#9E1F3E" stroke-width="1.6" stroke-linejoin="round"/>'
    +'<rect x="325" y="186" width="18" height="11" rx="2" fill="#2B3350" stroke="#1E2A4A" stroke-width="2"/><rect x="321" y="195" width="26" height="4" rx="2" fill="#2B3350" stroke="#1E2A4A" stroke-width="1.5"/>'
    +'<circle cx="330" cy="204" r="1.8" fill="#1E2A4A"/><circle cx="339" cy="204" r="1.8" fill="#1E2A4A"/><path d="M334 207l10 2-10 2z" fill="#FF9A3D" stroke="#C25E0A" stroke-width="1.2" stroke-linejoin="round"/>'
    +'<circle cx="334" cy="236" r="2" fill="#1E2A4A"/><circle cx="334" cy="244" r="2" fill="#1E2A4A"/><path d="M314 226l-14-8M354 226l14-8" stroke="#8A5A2B" stroke-width="3" stroke-linecap="round"/></g>';}},
  {id:'sled',name:'Wooden sled',cn:'小雪橇',price:6,icon:'<rect x="8" y="34" width="40" height="8" rx="3" fill="#E8574B" stroke="#9E2A20" stroke-width="3"/><path d="M6 48H46Q54 48 52 38" fill="none" stroke="#8A5A2B" stroke-width="3.5" stroke-linecap="round"/>',
   svg:function(){return '<g><path d="M252 288H300Q310 288 308 276" fill="none" stroke="#8A5A2B" stroke-width="4" stroke-linecap="round"/><rect x="256" y="276" width="46" height="9" rx="3.5" fill="#E8574B" stroke="#9E2A20" stroke-width="3"/><path d="M262 285V288M296 285V288" stroke="#8A5A2B" stroke-width="3"/><path d="M308 278Q298 280 292 286" fill="none" stroke="#E8D9B5" stroke-width="2"/></g>';}}
 ]},
panda:{name:'Bamboo forest home',cn:'竹林小屋',
 defs:'<linearGradient id="gSkyR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF1BD"/><stop offset=".55" stop-color="#E5F6D3"/><stop offset="1" stop-color="#F3FBE7"/></linearGradient>'
  +'<linearGradient id="gGrassR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#95D86D"/><stop offset="1" stop-color="#6EBB57"/></linearGradient>',
 base:function(){return '<rect width="360" height="300" fill="url(#gSkyR)"/>'
  +'<circle cx="304" cy="52" r="34" fill="#FFE9A0" opacity=".35"/><circle cx="304" cy="52" r="22" fill="#FFE08A"/>'
  +'<path d="M0 176C60 146 120 166 190 156C250 148 310 156 360 146V260H0Z" fill="#C4E6AB"/><path d="M0 200C70 176 140 194 210 184C270 176 320 186 360 180V270H0Z" fill="#A8D98D"/>'
  +'<path d="M0 240C70 230 140 238 200 234C260 230 320 234 360 238V300H0Z" fill="url(#gGrassR)"/>'
  +'<g fill="none" stroke="#5FAE49" stroke-width="2.2" stroke-linecap="round"><path d="M120 262l-3-8M126 262l1-9M132 262l4-7"/><path d="M262 276l-3-8M268 276l1-9M274 276l4-7"/><path d="M200 288l-3-8M206 288l1-9"/></g>'
  +'<ellipse cx="96" cy="262" rx="13" ry="6" fill="#EAD9B0" stroke="#C9B685" stroke-width="2"/><ellipse cx="124" cy="274" rx="12" ry="5.5" fill="#EAD9B0" stroke="#C9B685" stroke-width="2"/>'
  /* big tree */
  +'<g><path d="M18 276C24 226 22 160 28 100C32 78 56 78 60 100C66 160 62 226 72 276Z" fill="#A8743F" stroke="#6B4423" stroke-width="4" stroke-linejoin="round"/>'
  +'<path d="M36 120C38 160 36 220 40 262M48 110C50 160 50 220 54 266" fill="none" stroke="#8A5A2B" stroke-width="2.4" stroke-linecap="round" opacity=".5"/>'
  +'<path d="M58 122C82 114 98 102 114 86" fill="none" stroke="#6B4423" stroke-width="12" stroke-linecap="round"/><path d="M58 122C82 114 98 102 114 86" fill="none" stroke="#A8743F" stroke-width="7" stroke-linecap="round"/>'
  +'<circle cx="42" cy="68" r="40" fill="#5DBA62" stroke="#3F8F4A" stroke-width="4"/><circle cx="10" cy="92" r="28" fill="#5DBA62" stroke="#3F8F4A" stroke-width="4"/><circle cx="82" cy="76" r="30" fill="#6CC36A" stroke="#3F8F4A" stroke-width="4"/><circle cx="108" cy="64" r="22" fill="#6CC36A" stroke="#3F8F4A" stroke-width="4"/>'
  +'<circle cx="34" cy="58" r="16" fill="#7BD07A" opacity=".7"/><circle cx="84" cy="66" r="12" fill="#86D985" opacity=".7"/>'
  +'<path d="M32 266C28 242 30 228 46 226C62 228 64 242 62 266Z" fill="#5A3A22" stroke="#3B2514" stroke-width="3"/><ellipse cx="46" cy="252" rx="9" ry="12" fill="#7A5232"/></g>'
  /* the two bamboo stalks that are always there */
  +stalk(326,112,252,13)+stalk(345,136,256,11);},
 decos:[
  {id:'bamboo',name:'Bamboo grove',cn:'竹林',price:5,icon:'<rect x="12" y="8" width="9" height="46" rx="4.5" fill="#86CE76" stroke="#3F8F4A" stroke-width="2.5"/><rect x="26" y="16" width="9" height="38" rx="4.5" fill="#86CE76" stroke="#3F8F4A" stroke-width="2.5"/><rect x="40" y="4" width="9" height="50" rx="4.5" fill="#86CE76" stroke="#3F8F4A" stroke-width="2.5"/>',
   svg:function(){return '<g>'+stalk(294,98,258,12)+stalk(308,120,262,11)+stalk(284,150,264,10)+'</g>';}},
  {id:'lanterns',name:'Paper lanterns',cn:'红灯笼',price:6,icon:'<ellipse cx="30" cy="30" rx="14" ry="16" fill="#FF6B4A" stroke="#B0301A" stroke-width="3"/><rect x="22" y="12" width="16" height="5" rx="2" fill="#E0A63A"/><rect x="22" y="44" width="16" height="5" rx="2" fill="#E0A63A"/>',
   svg:function(){return lantern(78,109,'#FF6B4A')+lantern(98,96,'#FF8F3D')+lantern(114,86,'#FF5C5C');}},
  {id:'swing',name:'Tree swing',cn:'秋千',price:8,icon:'<path d="M14 6V40M46 6V40" stroke="#8A5A2B" stroke-width="3"/><rect x="8" y="38" width="44" height="8" rx="3" fill="#C98B4B" stroke="#8A5A2B" stroke-width="3"/>',
   svg:function(){return '<g class="swing"><path d="M84 108V196M110 92V196" stroke="#8A5A2B" stroke-width="3" stroke-linecap="round"/><rect x="76" y="194" width="42" height="9" rx="3.5" fill="#C98B4B" stroke="#8A5A2B" stroke-width="3"/><path d="M82 196h-0" stroke="#fff"/></g>';}},
  {id:'flowers',name:'Flower patch',cn:'花丛',price:4,icon:'<circle cx="18" cy="26" r="6" fill="#FF8FB1"/><circle cx="34" cy="20" r="6" fill="#FFD93D"/><circle cx="44" cy="34" r="6" fill="#fff" stroke="#C9B685"/><path d="M18 32V50M34 26V50M44 40V50" stroke="#3F8F4A" stroke-width="3"/>',
   front:true,svg:function(){return '<g>'+flower(150,252,'#FF8FB1',1.2)+flower(166,260,'#fff',1)+flower(232,262,'#FFD93D',1.2)+flower(246,270,'#FF8FB1',1)+flower(84,282,'#C9A8F0',1.1)+flower(102,288,'#FFD93D',1)+'</g>';}},
  {id:'pond',name:'Lily pond',cn:'荷花池',price:9,icon:'<ellipse cx="30" cy="38" rx="24" ry="12" fill="#9FD8F5" stroke="#5FB0D8" stroke-width="3"/><ellipse cx="22" cy="36" rx="7" ry="3.5" fill="#6CC36A"/><circle cx="38" cy="34" r="5" fill="#FF8FB1"/>',
   svg:function(){return '<g><ellipse cx="318" cy="281" rx="42" ry="13" fill="#9FD8F5" stroke="#5FB0D8" stroke-width="3"/><ellipse cx="308" cy="277" rx="18" ry="3.6" fill="#fff" opacity=".35"/><ellipse cx="302" cy="284" rx="10" ry="4" fill="#6CC36A" stroke="#3F8F4A" stroke-width="2"/><ellipse cx="335" cy="286" rx="8" ry="3.6" fill="#6CC36A" stroke="#3F8F4A" stroke-width="2"/>'
    +'<g transform="translate(322,279)"><path d="M0 0Q-9 -3 -9 -11Q-2 -9 0 0ZM0 0Q9 -3 9 -11Q2 -9 0 0ZM0 0Q-4 -8 0 -16Q4 -8 0 0Z" fill="#FF8FB1" stroke="#C0577F" stroke-width="1.6" stroke-linejoin="round"/></g></g>';}},
  {id:'butterflies',name:'Butterflies',cn:'蝴蝶',price:5,icon:'<ellipse cx="20" cy="26" rx="9" ry="12" fill="#FF8FB1" transform="rotate(-25 20 26)"/><ellipse cx="38" cy="26" rx="9" ry="12" fill="#FF8FB1" transform="rotate(25 38 26)"/><path d="M29 14V42" stroke="#1E2A4A" stroke-width="3" stroke-linecap="round"/>',
   front:true,svg:function(){return butterfly(246,150,'#FF8FB1',0)+butterfly(124,176,'#8FD8FF',1.1)+butterfly(176,98,'#FFD93D',2.1);}}
 ]}
};

/* ---- more homes (part 1): cat, dog, monkey ---- */
function cloud(x,y,s,op){return '<g transform="translate('+x+','+y+') scale('+s+')" opacity="'+(op||.95)+'"><path d="M0 22C-4 10 10 2 20 8C24 -4 44 -4 48 10C60 8 66 24 54 28H8C3 28 0 26 0 22Z" fill="#fff"/></g>';}
function tuft(x,y,col){return '<path d="M'+x+' '+y+'l-3 -8M'+(x+6)+' '+y+'l1 -9M'+(x+12)+' '+y+'l4 -7" stroke="'+(col||'#5FAE49')+'" stroke-width="2.2" stroke-linecap="round" fill="none"/>';}
function rainbow(op,cx,y,r){cx=cx||180;y=y||196;r=r||150;var cols=['#FF6B6B','#FF9A3D','#FFD93D','#6BCB77','#4D96FF','#A78BFA'],o='<g fill="none" stroke-width="7" opacity="'+(op||.7)+'">';
 for(var i=0;i<6;i++){var rr=r-i*7;o+='<path d="M'+(cx-rr)+' '+y+'A'+rr+' '+(rr*.82).toFixed(0)+' 0 0 1 '+(cx+rr)+' '+y+'" stroke="'+cols[i]+'"/>';}
 return o+'</g>';}
function sunflower(x,y,sc){sc=sc||1;var o='<g transform="translate('+x+','+y+') scale('+sc+')"><path d="M0 0V96" stroke="#3F8F4A" stroke-width="4" stroke-linecap="round"/><path d="M0 60C-14 56 -20 44 -18 36C-6 40 0 50 0 60ZM0 74C14 70 20 58 18 50C6 54 0 64 0 74Z" fill="#6CC36A" stroke="#3F8F4A" stroke-width="2"/>';
 for(var i=0;i<12;i++){var t=i*30;o+='<ellipse cx="0" cy="-15" rx="5.5" ry="10" transform="rotate('+t+')" fill="#FFD93D" stroke="#E0A800" stroke-width="1.4"/>';}
 return o+'<circle cx="0" cy="0" r="9.5" fill="#8A5A2B" stroke="#5E3A1E" stroke-width="2"/></g>';}
function applebox(){return '';}

HOMES.cat={name:'Cosy living room',cn:'温馨客厅',
 defs:'<linearGradient id="gWinC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9FD6F8"/><stop offset="1" stop-color="#E6F5FF"/></linearGradient>',
 base:function(){var s='<rect width="360" height="300" fill="#FFEFD6"/>';
  for(var i=0;i<12;i++)s+='<rect x="'+(i*30+4)+'" y="0" width="14" height="198" fill="#FFE5C0" opacity=".7"/>';
  s+='<rect y="196" width="360" height="42" fill="#F5D3A4"/><path d="M0 196H360" stroke="#D9A066" stroke-width="3"/><path d="M0 214H360" stroke="#E7B98A" stroke-width="2"/>';
  s+='<rect y="236" width="360" height="64" fill="#E2AA6C"/><g stroke="#C98B4B" stroke-width="2"><path d="M0 252H360M0 270H360M0 288H360"/><path d="M60 236V252M200 236V252M310 236V252M20 252V270M140 252V270M260 252V270M100 270V288M230 270V288M340 270V288"/></g><path d="M0 236H360" stroke="#B5784A" stroke-width="4"/>';
  s+='<g><rect x="30" y="52" width="94" height="100" rx="8" fill="#fff" stroke="#D9A066" stroke-width="4"/><rect x="38" y="60" width="78" height="84" rx="4" fill="url(#gWinC)"/><path d="M77 60V144M38 102H116" stroke="#fff" stroke-width="4"/><path d="M48 92Q56 82 66 90Q72 84 80 92Z" fill="#fff"/><rect x="24" y="150" width="106" height="8" rx="3" fill="#D9A066"/>'
   +'<path d="M32 52C44 70 42 120 32 152H18C26 120 26 70 18 52Z" fill="#FF9FB8" stroke="#D9628A" stroke-width="2.5"/><path d="M122 52C110 70 112 120 122 152H136C128 120 128 70 136 52Z" fill="#FF9FB8" stroke="#D9628A" stroke-width="2.5"/></g>';
  s+='<ellipse cx="185" cy="270" rx="62" ry="11" fill="#F0B978" opacity=".9"/>';
  return s;},
 decos:[
  {id:'lights',name:'Fairy lights',cn:'小彩灯',price:5,icon:'<path d="M4 14Q17 36 30 16Q43 36 56 14" fill="none" stroke="#51709A" stroke-width="2"/><circle cx="14" cy="28" r="5" fill="#FF6B6B"/><circle cx="30" cy="30" r="5" fill="#FFD93D"/><circle cx="46" cy="28" r="5" fill="#4D96FF"/>',
   svg:function(){var cols=['#FF6B6B','#FFD93D','#6BCB77','#4D96FF'];return swag(0,34,90,66,180,34,5,cols)+swag(180,34,270,66,360,34,5,cols);}},
  {id:'frames',name:'Picture frames',cn:'相框',price:5,icon:'<rect x="6" y="14" width="22" height="28" rx="2" fill="#fff" stroke="#C98B4B" stroke-width="3"/><rect x="32" y="8" width="22" height="22" rx="2" fill="#fff" stroke="#C98B4B" stroke-width="3"/><path d="M43 12l2 5 5 .5-4 3 1.5 5-4.5-3-4.500 3 1.500-5-4-3 5-.5z" fill="#FFC93C"/>',
   svg:function(){return '<g><rect x="142" y="54" width="40" height="48" rx="3" fill="#fff" stroke="#C98B4B" stroke-width="4"/><path d="M150 80Q158 66 170 78Q166 86 170 90Q158 96 150 80Z" fill="#6FB6F2" stroke="#1F78BC" stroke-width="2"/><path d="M170 78L176 72V88L170 90Z" fill="#6FB6F2" stroke="#1F78BC" stroke-width="2" stroke-linejoin="round"/>'
    +'<rect x="192" y="46" width="52" height="42" rx="3" fill="#fff" stroke="#C98B4B" stroke-width="4"/><path d="M218 54l4.500 10 11 1-8.500 7 2.500 11-9.500-6-9.500 6 2.500-11-8.500-7 11-1z" fill="#FFC93C" stroke="#B26A00" stroke-width="2" stroke-linejoin="round"/>'
    +'<rect x="256" y="58" width="36" height="46" rx="3" fill="#fff" stroke="#C98B4B" stroke-width="4"/><path d="M274 94C262 86 262 74 268 72C272 70 274 74 274 76C274 74 276 70 280 72C286 74 286 86 274 94Z" fill="#FF8FB1" stroke="#C0577F" stroke-width="2" stroke-linejoin="round"/></g>';}},
  {id:'plant',name:'House plant',cn:'绿植',price:4,icon:'<path d="M18 36h24l-4 18H22z" fill="#D9784A" stroke="#9E4A22" stroke-width="3" stroke-linejoin="round"/><path d="M30 36C22 24 20 14 26 6C34 14 34 26 30 36ZM30 36C40 28 46 20 44 10C34 16 30 26 30 36Z" fill="#6CC36A" stroke="#3F8F4A" stroke-width="2.500"/>',
   svg:function(){return '<g><path d="M114 240h26l-4 26h-18z" fill="#D9784A" stroke="#9E4A22" stroke-width="3" stroke-linejoin="round"/><rect x="112" y="236" width="30" height="7" rx="3" fill="#E58E5E" stroke="#9E4A22" stroke-width="2.500"/>'
    +'<path d="M127 238C116 220 108 204 116 188C128 202 130 222 127 238Z" fill="#6CC36A" stroke="#3F8F4A" stroke-width="2.500" stroke-linejoin="round"/><path d="M127 238C138 222 148 210 146 192C134 200 126 218 127 238Z" fill="#7BD07A" stroke="#3F8F4A" stroke-width="2.500" stroke-linejoin="round"/><path d="M127 238C124 218 128 200 134 184C140 204 134 224 127 238Z" fill="#5DBA62" stroke="#3F8F4A" stroke-width="2.500" stroke-linejoin="round"/></g>';}},
  {id:'rug',name:'Pink rug',cn:'粉色地毯',price:4,icon:'<ellipse cx="30" cy="36" rx="26" ry="14" fill="#FFC6D9" stroke="#E08AAE" stroke-width="3"/><ellipse cx="30" cy="36" rx="16" ry="8" fill="none" stroke="#fff" stroke-width="2.500" stroke-dasharray="4 3"/>',
   svg:function(){return '<g><ellipse cx="185" cy="272" rx="100" ry="18" fill="#FFC6D9" stroke="#E08AAE" stroke-width="3"/><ellipse cx="185" cy="272" rx="76" ry="12" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="7 5"/><ellipse cx="185" cy="272" rx="48" ry="7.500" fill="#FFB3CC"/></g>';}},
  {id:'shelf',name:'Bookshelf',cn:'书架',price:7,icon:'<rect x="8" y="8" width="44" height="46" rx="3" fill="#B5784A" stroke="#7A4A22" stroke-width="3"/><path d="M8 30H52" stroke="#7A4A22" stroke-width="3"/><rect x="14" y="14" width="6" height="14" fill="#FF6B6B"/><rect x="22" y="12" width="6" height="16" fill="#4D96FF"/><rect x="30" y="15" width="6" height="13" fill="#FFD93D"/><rect x="14" y="36" width="7" height="14" fill="#6BCB77"/><rect x="24" y="38" width="6" height="12" fill="#C084FC"/>',
   svg:function(){var cols=['#FF6B6B','#4D96FF','#FFD93D','#6BCB77','#C084FC','#FF9A3D','#2BB8A6'],o='<g><rect x="16" y="162" width="96" height="80" rx="4" fill="#B5784A" stroke="#7A4A22" stroke-width="3"/><rect x="22" y="168" width="84" height="32" fill="#8A5A2B"/><rect x="22" y="206" width="84" height="30" fill="#8A5A2B"/>',x=25;
    [0,1,2,3,4,5,6,7].forEach(function(i){var w=7+(i%3)*2;o+='<rect x="'+x+'" y="'+(172+(i%2)*3)+'" width="'+w+'" height="'+(26-(i%2)*3)+'" rx="1.500" fill="'+cols[i%7]+'" stroke="#fff" stroke-width=".8"/>';x+=w+2;});
    x=25;[0,1,2,3,4,5].forEach(function(i){var w=8+(i%2)*3;o+='<rect x="'+x+'" y="'+(210+(i%3)*2)+'" width="'+w+'" height="'+(24-(i%3)*2)+'" rx="1.500" fill="'+cols[(i+3)%7]+'" stroke="#fff" stroke-width=".8"/>';x+=w+2;});
    return o+'</g>';}},
  {id:'tree',name:'Cat tree',cn:'猫爬架',price:8,icon:'<rect x="24" y="14" width="12" height="40" fill="#EAD7AE" stroke="#B89A66" stroke-width="2.500"/><rect x="10" y="12" width="40" height="8" rx="4" fill="#B79AF0" stroke="#6A47C0" stroke-width="2.500"/><rect x="8" y="32" width="44" height="8" rx="4" fill="#7FD0C0" stroke="#3E9C8B" stroke-width="2.500"/><rect x="12" y="50" width="36" height="6" rx="3" fill="#C98B4B"/>',
   svg:function(){return '<g><rect x="280" y="238" width="62" height="14" rx="5" fill="#C98B4B" stroke="#8A5A2B" stroke-width="3"/><rect x="303" y="150" width="16" height="90" rx="4" fill="#EAD7AE" stroke="#B89A66" stroke-width="2.500"/><path d="M303 164h16M303 180h16M303 196h16M303 212h16M303 228h16" stroke="#B89A66" stroke-width="2"/>'
    +'<rect x="268" y="196" width="86" height="12" rx="6" fill="#7FD0C0" stroke="#3E9C8B" stroke-width="3"/><rect x="282" y="144" width="60" height="12" rx="6" fill="#B79AF0" stroke="#6A47C0" stroke-width="3"/>'
    +'<rect x="290" y="104" width="44" height="40" rx="8" fill="#FFB8A0" stroke="#C0603F" stroke-width="3"/><circle cx="312" cy="126" r="11" fill="#5A3A22"/><path d="M286 108L312 90L338 108Z" fill="#E8574B" stroke="#9E2A20" stroke-width="3" stroke-linejoin="round"/>'
    +'<path d="M348 208Q354 222 348 232" fill="none" stroke="#8A5A2B" stroke-width="2"/><circle cx="348" cy="236" r="6" fill="#FF6B6B" stroke="#B02A12" stroke-width="2"/></g>';}}
 ]};

HOMES.dog={name:'Backyard',cn:'小院子',
 defs:'<linearGradient id="gSkyD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A9DAFB"/><stop offset="1" stop-color="#E9F7FF"/></linearGradient><linearGradient id="gLawnD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#93D86B"/><stop offset="1" stop-color="#6BBA55"/></linearGradient>',
 base:function(){var s='<rect width="360" height="300" fill="url(#gSkyD)"/>'+cloud(24,34,1)+cloud(250,22,1.15)+cloud(150,70,.7,.85);
  s+='<path d="M0 190C50 168 110 176 170 172C240 168 300 176 360 164V240H0Z" fill="#CDEFC0"/>';
  s+='<path d="M0 214C70 204 140 214 200 210C260 206 320 212 360 208V300H0Z" fill="url(#gLawnD)"/>';
  for(var i=0;i<15;i++){var x=i*25-4;s+='<path d="M'+x+' 240V180L'+(x+10)+' 170L'+(x+20)+' 180V240Z" fill="#FFE3B3" stroke="#C98B4B" stroke-width="2.500" stroke-linejoin="round"/>';}
  s+='<rect y="192" width="360" height="7" fill="#E8C08A" stroke="#C98B4B" stroke-width="2"/><rect y="218" width="360" height="7" fill="#E8C08A" stroke="#C98B4B" stroke-width="2"/>';
  s+='<path d="M0 240C80 232 160 242 240 238C300 235 340 238 360 236V300H0Z" fill="#7CC95E"/>';
  s+=tuft(130,246)+tuft(232,252)+tuft(300,246)+tuft(60,280)+tuft(200,290);
  s+='<g><rect x="24" y="200" width="82" height="50" fill="#F2C894" stroke="#A8742E" stroke-width="3"/><path d="M14 206L65 164L116 206Z" fill="#E8574B" stroke="#9E2A20" stroke-width="3" stroke-linejoin="round"/><path d="M48 250V228C48 212 82 212 82 228V250Z" fill="#5A3A22"/><path d="M36 214h58" stroke="#C98B4B" stroke-width="2"/></g>';
  return s;},
 decos:[
  {id:'rainbow',name:'Rainbow',cn:'彩虹',price:10,icon:'<g fill="none" stroke-width="5"><path d="M4 48A26 22 0 0 1 56 48" stroke="#FF6B6B"/><path d="M10 48A20 17 0 0 1 50 48" stroke="#FFD93D"/><path d="M16 48A14 12 0 0 1 44 48" stroke="#4D96FF"/></g>',
   svg:function(){return rainbow(.7,238,176,116);}},
  {id:'tree',name:'Apple tree',cn:'苹果树',price:7,icon:'<rect x="26" y="30" width="8" height="24" fill="#A8743F" stroke="#6B4423" stroke-width="2.500"/><circle cx="30" cy="22" r="16" fill="#5DBA62" stroke="#3F8F4A" stroke-width="3"/><circle cx="24" cy="20" r="3.500" fill="#FF5C5C"/><circle cx="36" cy="26" r="3.500" fill="#FF5C5C"/>',
   svg:function(){var o='<g><rect x="306" y="170" width="13" height="72" rx="3" fill="#A8743F" stroke="#6B4423" stroke-width="3"/><circle cx="312" cy="144" r="36" fill="#5DBA62" stroke="#3F8F4A" stroke-width="3.500"/><circle cx="284" cy="164" r="26" fill="#6CC36A" stroke="#3F8F4A" stroke-width="3.500"/><circle cx="340" cy="164" r="26" fill="#5DBA62" stroke="#3F8F4A" stroke-width="3.500"/><circle cx="312" cy="138" r="18" fill="#7BD07A" opacity=".55"/>';
    [[298,134],[324,142],[312,164],[286,162],[338,166],[310,118]].forEach(function(p){o+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="5.500" fill="#FF5C5C" stroke="#B02A2A" stroke-width="1.800"/><path d="M'+(p[0]-1.5)+' '+(p[1]-4)+'q1 -3 3 -3" stroke="#6B4A1E" stroke-width="1.500" fill="none"/>';});
    return o+'</g>';}},
  {id:'sunflowers',name:'Sunflowers',cn:'向日葵',price:5,icon:'<path d="M30 28V56" stroke="#3F8F4A" stroke-width="3"/><circle cx="30" cy="22" r="8" fill="#8A5A2B"/><circle cx="30" cy="22" r="14" fill="none" stroke="#FFD93D" stroke-width="7" stroke-dasharray="5 3"/>',
   svg:function(){return sunflower(122,130,1)+sunflower(272,146,.92);}},
  {id:'flowerbed',name:'Flower bed',cn:'花坛',price:4,icon:'<circle cx="16" cy="28" r="6" fill="#FF8FB1"/><circle cx="30" cy="22" r="6" fill="#FFD93D"/><circle cx="44" cy="28" r="6" fill="#C9A8F0"/><path d="M16 34V50M30 28V50M44 34V50" stroke="#3F8F4A" stroke-width="3"/>',
   front:true,svg:function(){var c=['#FF8FB1','#FFD93D','#C9A8F0','#fff','#FF9A3D'],o='<g>';[128,150,170,226,246,266,288].forEach(function(x,i){o+=flower(x,248+(i%2)*6,c[i%5],1);});return o+'</g>';}},
  {id:'picnic',name:'Picnic blanket',cn:'野餐布',price:5,icon:'<path d="M10 50L18 24H48L56 50Z" fill="#FF6B6B" stroke="#B02A2A" stroke-width="3" stroke-linejoin="round"/><path d="M26 24L22 50M38 24L42 50M14 38H52" stroke="#fff" stroke-width="3" opacity=".8"/>',
   svg:function(){var o='<g><path d="M112 292L156 258H250L296 292Z" fill="#FF6B6B" stroke="#B02A2A" stroke-width="3" stroke-linejoin="round"/>';
    for(var i=1;i<6;i++)o+='<path d="M'+(156+i*15.7)+' 258L'+(112+i*30.7)+' 292" stroke="#fff" stroke-width="5" opacity=".7"/>';
    o+='<path d="M141 270H270M126 282H284" stroke="#fff" stroke-width="5" opacity=".7"/>';return o+'</g>';}},
  {id:'sign',name:'Bone sign',cn:'骨头牌子',price:4,icon:'<rect x="26" y="26" width="8" height="28" fill="#A8743F" stroke="#6B4423" stroke-width="2.500"/><rect x="6" y="8" width="48" height="22" rx="4" fill="#E8C08A" stroke="#8A5A2B" stroke-width="3"/><path d="M16 19h28" stroke="#fff" stroke-width="5" stroke-linecap="round"/>',
   front:true,svg:function(){return '<g><rect x="296" y="244" width="9" height="42" rx="2" fill="#A8743F" stroke="#6B4423" stroke-width="2.500"/><rect x="272" y="222" width="58" height="28" rx="5" fill="#E8C08A" stroke="#8A5A2B" stroke-width="3"/><path d="M286 236h30" stroke="#fff" stroke-width="6" stroke-linecap="round"/><circle cx="284" cy="231" r="5" fill="#fff"/><circle cx="284" cy="241" r="5" fill="#fff"/><circle cx="318" cy="231" r="5" fill="#fff"/><circle cx="318" cy="241" r="5" fill="#fff"/></g>';}}
 ]};

HOMES.monkey={name:'Jungle treehouse',cn:'丛林树屋',
 defs:'<linearGradient id="gJung" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B5E4A6"/><stop offset="1" stop-color="#E8F7D2"/></linearGradient><linearGradient id="gFloorJ" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7DBB5A"/><stop offset="1" stop-color="#5A9A42"/></linearGradient>',
 base:function(){var s='<rect width="360" height="300" fill="url(#gJung)"/>';
  s+='<path d="M0 0H360V52Q330 92 300 58Q270 98 240 60Q205 100 170 58Q135 98 100 60Q65 98 30 56Q10 72 0 62Z" fill="#7DC172"/><path d="M0 0H360V30Q320 62 280 34Q240 68 200 36Q160 68 120 36Q80 66 40 34Q20 46 0 36Z" fill="#9AD688"/>';
  s+='<g fill="#fff" opacity=".13"><path d="M120 0L170 0L110 260L40 260Z"/><path d="M220 0L250 0L230 260L180 260Z"/></g>';
  s+='<path d="M0 238C80 230 160 240 240 236C300 233 340 236 360 234V300H0Z" fill="url(#gFloorJ)"/>';
  s+='<path d="M0 270C16 250 36 250 46 268C30 270 14 272 0 270Z" fill="#4F9A4A" stroke="#3F8F4A" stroke-width="3"/><path d="M360 270C344 250 324 250 314 268C330 270 346 272 360 270Z" fill="#4F9A4A" stroke="#3F8F4A" stroke-width="3"/>';
  s+=tuft(150,248)+tuft(250,254)+tuft(96,282);
  /* the big tree on the right with a wooden deck, and a branch going left */
  s+='<g><path d="M96 84C150 80 240 88 300 106" fill="none" stroke="#6B4423" stroke-width="13" stroke-linecap="round"/><path d="M96 84C150 80 240 88 300 106" fill="none" stroke="#A8743F" stroke-width="8" stroke-linecap="round"/>'
   +'<path d="M286 250C292 200 290 110 296 64C300 44 330 44 334 64C340 110 336 200 346 250Z" fill="#A8743F" stroke="#6B4423" stroke-width="4" stroke-linejoin="round"/><path d="M304 80C306 130 304 200 308 244M318 70C320 130 318 200 322 246" fill="none" stroke="#8A5A2B" stroke-width="2.400" opacity=".5" stroke-linecap="round"/>'
   +'<circle cx="300" cy="46" r="40" fill="#5DBA62" stroke="#3F8F4A" stroke-width="4"/><circle cx="348" cy="58" r="32" fill="#6CC36A" stroke="#3F8F4A" stroke-width="4"/><circle cx="258" cy="58" r="28" fill="#5DBA62" stroke="#3F8F4A" stroke-width="4"/><circle cx="296" cy="36" r="16" fill="#86D985" opacity=".6"/>'
   +'<rect x="222" y="152" width="138" height="12" rx="4" fill="#C98B4B" stroke="#8A5A2B" stroke-width="3"/><path d="M232 152V128M262 152V128M352 152V128" stroke="#8A5A2B" stroke-width="4" stroke-linecap="round"/><path d="M228 130H360" stroke="#8A5A2B" stroke-width="4" stroke-linecap="round"/></g>';
  return s;},
 decos:[
  {id:'waterfall',name:'Waterfall',cn:'瀑布',price:10,icon:'<rect x="6" y="6" width="48" height="40" rx="4" fill="#A9A39A" stroke="#7E766A" stroke-width="3"/><path d="M22 6H36V46H22Z" fill="#BEE6FF"/><path d="M26 10V44M32 8V42" stroke="#fff" stroke-width="2"/><ellipse cx="29" cy="50" rx="22" ry="6" fill="#8FD3F0"/>',
   svg:function(){return '<g><path d="M0 70H72Q80 70 80 80V238H0Z" fill="#A9A39A" stroke="#7E766A" stroke-width="3.500"/><path d="M10 100H34M44 130H70M6 170H30M50 196H72" stroke="#8E877D" stroke-width="3" stroke-linecap="round"/>'
    +'<path d="M24 70H52V240H24Z" fill="#BEE6FF"/><path d="M30 76V236M38 72V238M46 78V234" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".85"/><ellipse cx="38" cy="248" rx="46" ry="12" fill="#8FD3F0" stroke="#5FB0D8" stroke-width="3"/><circle cx="26" cy="242" r="9" fill="#fff" opacity=".55"/><circle cx="52" cy="244" r="7" fill="#fff" opacity=".5"/></g>';}},
  {id:'hut',name:'Treehouse hut',cn:'树屋小屋',price:8,icon:'<rect x="12" y="28" width="36" height="24" fill="#C98B4B" stroke="#8A5A2B" stroke-width="3"/><path d="M6 32L30 10L54 32Z" fill="#E8C24A" stroke="#B8860B" stroke-width="3" stroke-linejoin="round"/><path d="M26 52V40H34V52Z" fill="#5A3A22"/>',
   svg:function(){return '<g><rect x="250" y="108" width="62" height="44" fill="#C98B4B" stroke="#8A5A2B" stroke-width="3"/><path d="M242 114L281 76L320 114Z" fill="#E8C24A" stroke="#B8860B" stroke-width="3" stroke-linejoin="round"/><path d="M252 106l8 -6M266 94l8 -6M282 82l8 -5M298 94l8 -6" stroke="#B8860B" stroke-width="2.200" stroke-linecap="round"/><path d="M272 152V130C272 118 290 118 290 130V152Z" fill="#5A3A22"/><rect x="296" y="124" width="10" height="10" rx="2" fill="#BEE6FF" stroke="#8A5A2B" stroke-width="2"/><path d="M281 76V56" stroke="#6B4423" stroke-width="3"/><path d="M281 56L300 62L281 68Z" fill="#E8574B" stroke="#9E2A20" stroke-width="2" stroke-linejoin="round"/></g>';}},
  {id:'tireswing',name:'Tire swing',cn:'轮胎秋千',price:7,icon:'<path d="M30 4V30" stroke="#8A5A2B" stroke-width="3"/><ellipse cx="30" cy="42" rx="18" ry="9" fill="none" stroke="#2B3350" stroke-width="8"/>',
   svg:function(){return '<g class="swingx" style="transform-origin:112px 84px"><path d="M112 84V190" stroke="#8A5A2B" stroke-width="3.500" stroke-linecap="round"/><ellipse cx="112" cy="206" rx="25" ry="11" fill="none" stroke="#2B3350" stroke-width="10"/><ellipse cx="112" cy="204" rx="25" ry="11" fill="none" stroke="#4A5878" stroke-width="2.500" opacity=".6"/></g>';}},
  {id:'parrot',name:'Parrot friend',cn:'鹦鹉朋友',price:6,icon:'<ellipse cx="30" cy="34" rx="12" ry="16" fill="#FF6B6B" stroke="#B02A2A" stroke-width="3"/><circle cx="30" cy="16" r="9" fill="#FF6B6B" stroke="#B02A2A" stroke-width="3"/><path d="M36 16l8 3-8 4z" fill="#FFD93D" stroke="#B8860B" stroke-width="2"/><path d="M22 34Q30 44 38 34" fill="#4D96FF"/>',
   svg:function(){return '<g><path d="M204 100Q200 116 208 126" fill="none" stroke="#4D96FF" stroke-width="5" stroke-linecap="round"/><path d="M208 100Q206 118 214 128" fill="none" stroke="#2BB8A6" stroke-width="5" stroke-linecap="round"/><ellipse cx="214" cy="84" rx="12" ry="17" fill="#FF6B6B" stroke="#B02A2A" stroke-width="3"/><path d="M204 84Q214 100 224 84" fill="#4D96FF" stroke="#2A6CA8" stroke-width="2"/><circle cx="216" cy="62" r="10" fill="#FF6B6B" stroke="#B02A2A" stroke-width="3"/><path d="M224 60l10 4-10 5z" fill="#FFD93D" stroke="#B8860B" stroke-width="2" stroke-linejoin="round"/><circle cx="219" cy="60" r="2.600" fill="#1E2A4A"/><circle cx="219.800" cy="59.200" r=".9" fill="#fff"/><path d="M212 52Q216 46 222 50" fill="none" stroke="#FFD93D" stroke-width="3" stroke-linecap="round"/></g>';}},
  {id:'bananas',name:'Banana bunch',cn:'香蕉串',price:5,icon:'<path d="M6 40C12 24 36 22 52 36C54 40 50 42 47 40C36 32 20 34 11 46C8 49 4 45 6 40Z" fill="#FFD93D" stroke="#B08A0E" stroke-width="3" stroke-linejoin="round"/><path d="M8 30C14 14 38 12 54 26" fill="none" stroke="#B08A0E" stroke-width="3" stroke-linecap="round"/>',
   front:true,svg:function(){var b='<path d="M0 0C10 -14 34 -16 48 -4C50 0 46 3 43 1C32 -7 14 -6 5 6C3 9 -2 5 0 0Z" fill="#FFD93D" stroke="#B08A0E" stroke-width="2.5" stroke-linejoin="round"/><path d="M6 -3C16 -10 30 -11 40 -5" fill="none" stroke="#fff" stroke-width="2" opacity=".5" stroke-linecap="round"/>';
    return '<g transform="translate(236,264)"><g transform="rotate(-8)">'+b+'</g><g transform="translate(3,8) rotate(-3)">'+b+'</g><g transform="translate(6,16)">'+b+'</g><path d="M-1 6L-7 2" stroke="#6B4A1E" stroke-width="4" stroke-linecap="round"/><path d="M48 -3l4 -2" stroke="#6B4A1E" stroke-width="3" stroke-linecap="round"/></g>';}},
  {id:'flowers',name:'Jungle flowers',cn:'丛林花',price:4,icon:'<circle cx="18" cy="26" r="7" fill="#FF5C7A"/><circle cx="36" cy="20" r="7" fill="#FF9A3D"/><circle cx="44" cy="36" r="7" fill="#FF8FB1"/><path d="M18 33V50M36 27V50M44 43V50" stroke="#3F8F4A" stroke-width="3"/>',
   front:true,svg:function(){return '<g>'+flower(104,254,'#FF5C7A',1.2)+flower(124,262,'#FF9A3D',1)+flower(262,258,'#FF8FB1',1.2)+flower(282,266,'#FF5C7A',1)+flower(150,278,'#FFD93D',1)+'</g>';}}
 ]};

/* ---- more homes (part 2): bunny, dino, duck ---- */
function mushroom(x,y,sc,col){sc=sc||1;return '<g transform="translate('+x+','+y+') scale('+sc+')"><path d="M-4 0V-10H4V0Z" fill="#FFF3E0" stroke="#C9A97A" stroke-width="2"/><path d="M-13 -9C-13 -26 13 -26 13 -9Z" fill="'+(col||'#E8574B')+'" stroke="#9E2A20" stroke-width="2.500" stroke-linejoin="round"/><circle cx="-5" cy="-16" r="2.200" fill="#fff"/><circle cx="4" cy="-19" r="2.500" fill="#fff"/><circle cx="8" cy="-13" r="1.800" fill="#fff"/></g>';}
function fern(x,y,sc,rot){sc=sc||1;var o='<g transform="translate('+x+','+y+') rotate('+(rot||0)+') scale('+sc+')"><path d="M0 0Q0 -58 36 -92" fill="none" stroke="#3F8F4A" stroke-width="3.500" stroke-linecap="round"/>';
 for(var i=1;i<=10;i++){var t=i/11,px=36*t*t,py=-116*t*(1-t)-92*t*t,ang=Math.atan2(-116+48*t,72*t),L=25*(1-.72*t)+5;
  [1,-1].forEach(function(sg){var d=ang+sg*1.08;o+='<path d="M'+px.toFixed(1)+' '+py.toFixed(1)+'l'+(Math.cos(d)*L).toFixed(1)+' '+(Math.sin(d)*L).toFixed(1)+'" stroke="'+(i%2?'#6CC36A':'#7BD07A')+'" stroke-width="4.800" stroke-linecap="round"/>';});}
 return o+'<circle cx="36" cy="-92" r="3.500" fill="#7BD07A"/></g>';}
function lily(x,y,sc){sc=sc||1;return '<g transform="translate('+x+','+y+') scale('+sc+')"><ellipse cx="0" cy="0" rx="17" ry="6" fill="#6CC36A" stroke="#3F8F4A" stroke-width="2.200"/><path d="M0 0L12 -3" stroke="#3F8F4A" stroke-width="2"/></g>';}

HOMES.bunny={name:'Meadow & burrow',cn:'草地兔子洞',
 defs:'<linearGradient id="gSkyB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD9EC"/><stop offset=".6" stop-color="#E4F1FF"/><stop offset="1" stop-color="#F3FAFF"/></linearGradient><linearGradient id="gMeadB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A9E08F"/><stop offset="1" stop-color="#84C86E"/></linearGradient>',
 base:function(){var s='<rect width="360" height="300" fill="url(#gSkyB)"/>'+cloud(40,30,1.1)+cloud(240,44,1)+cloud(150,18,.6,.8);
  s+='<path d="M0 190C60 160 120 176 190 168C250 160 310 172 360 160V250H0Z" fill="#D6F2CF"/><path d="M0 214C70 192 140 208 210 200C270 194 320 204 360 198V260H0Z" fill="#BFE8B4"/>';
  s+='<path d="M0 236C80 226 160 238 240 232C300 228 340 232 360 230V300H0Z" fill="url(#gMeadB)"/>';
  s+='<path d="M0 246C14 208 62 194 108 212C128 222 138 240 140 252V270H0Z" fill="#8CCB75" stroke="#6FB35A" stroke-width="3.500"/><path d="M40 252C40 224 92 224 92 252V264H40Z" fill="#5A3A22"/><ellipse cx="66" cy="262" rx="26" ry="5" fill="#3B2514" opacity=".5"/>';
  s+=tuft(20,222)+tuft(98,214)+tuft(160,250)+tuft(248,256)+tuft(322,250)+tuft(190,284);
  return s;},
 decos:[
  {id:'rainbow',name:'Rainbow',cn:'彩虹',price:8,icon:'<g fill="none" stroke-width="5"><path d="M4 48A26 22 0 0 1 56 48" stroke="#FF6B6B"/><path d="M10 48A20 17 0 0 1 50 48" stroke="#FFD93D"/><path d="M16 48A14 12 0 0 1 44 48" stroke="#4D96FF"/></g>',
   svg:function(){return rainbow(.65,200,206,150);}},
  {id:'butterflies',name:'Butterflies',cn:'蝴蝶',price:5,icon:'<ellipse cx="20" cy="26" rx="9" ry="12" fill="#FF8FB1" transform="rotate(-25 20 26)"/><ellipse cx="38" cy="26" rx="9" ry="12" fill="#FF8FB1" transform="rotate(25 38 26)"/><path d="M29 14V42" stroke="#1E2A4A" stroke-width="3" stroke-linecap="round"/>',
   front:true,svg:function(){return butterfly(256,150,'#C9A8F0',0)+butterfly(116,170,'#FFB347',1.2)+butterfly(210,110,'#8FD8FF',2.2);}},
  {id:'flowers',name:'Flower field',cn:'花田',price:4,icon:'<circle cx="16" cy="28" r="6" fill="#FF8FB1"/><circle cx="30" cy="22" r="6" fill="#FFD93D"/><circle cx="44" cy="28" r="6" fill="#C9A8F0"/><path d="M16 34V50M30 28V50M44 34V50" stroke="#3F8F4A" stroke-width="3"/>',
   front:true,svg:function(){var c=['#FF8FB1','#FFD93D','#C9A8F0','#fff','#FF9A3D','#8FD8FF'],o='<g>';[[116,246],[132,258],[148,244],[222,246],[240,260],[262,242],[290,262],[316,248],[336,266],[108,280],[176,290],[300,286]].forEach(function(p,i){o+=flower(p[0],p[1],c[i%6],1.05);});return o+'</g>';}},
  {id:'carrots',name:'Carrot garden',cn:'胡萝卜园',price:5,icon:'<path d="M30 52C24 40 24 30 30 22C36 30 36 40 30 52Z" fill="#FF9A3D" stroke="#C25E0A" stroke-width="3"/><path d="M30 22Q22 12 26 6M30 22Q30 10 30 4M30 22Q38 12 34 6" stroke="#3F9A45" stroke-width="3" fill="none" stroke-linecap="round"/>',
   front:true,svg:function(){var o='<g>';[[292,262],[312,258],[332,264],[350,260],[302,278],[322,280],[342,278]].forEach(function(p){o+='<g transform="translate('+p[0]+','+p[1]+')"><ellipse cx="0" cy="2" rx="10" ry="3.500" fill="#8A5A2B"/><path d="M-4 0C-5 6 -3 12 0 16C3 12 5 6 4 0Z" fill="#FF9A3D" stroke="#C25E0A" stroke-width="1.600" stroke-linejoin="round"/><path d="M0 0Q-9 -9 -5 -17M0 0Q0 -12 0 -19M0 0Q9 -9 5 -17" stroke="#3F9A45" stroke-width="2.800" stroke-linecap="round" fill="none"/></g>';});return o+'</g>';}},
  {id:'mushrooms',name:'Mushrooms',cn:'小蘑菇',price:4,icon:'<path d="M26 50V38H34V50Z" fill="#FFF3E0" stroke="#C9A97A" stroke-width="2"/><path d="M12 38C12 14 48 14 48 38Z" fill="#E8574B" stroke="#9E2A20" stroke-width="3" stroke-linejoin="round"/><circle cx="24" cy="28" r="3.500" fill="#fff"/><circle cx="38" cy="24" r="3.500" fill="#fff"/>',
   front:true,svg:function(){return '<g>'+mushroom(112,274,1.2)+mushroom(132,284,.9,'#FF9A3D')+mushroom(100,290,.8,'#C084FC')+'</g>';}},
  {id:'basket',name:'Picnic basket',cn:'野餐篮',price:5,icon:'<path d="M10 30H50L46 52H14Z" fill="#C98B4B" stroke="#8A5A2B" stroke-width="3" stroke-linejoin="round"/><path d="M16 30Q30 4 44 30" fill="none" stroke="#8A5A2B" stroke-width="3"/><path d="M10 30H50" stroke="#FF6B6B" stroke-width="5"/>',
   front:true,svg:function(){return '<g transform="translate(-32,4)"><path d="M222 290L242 270H306L330 290Z" fill="#FFF3E0" stroke="#E0A63A" stroke-width="2.500" stroke-linejoin="round" opacity=".001"/><path d="M262 274H298L294 292H266Z" fill="#C98B4B" stroke="#8A5A2B" stroke-width="3" stroke-linejoin="round"/><path d="M262 274Q280 246 298 274" fill="none" stroke="#8A5A2B" stroke-width="3.500"/><path d="M262 274H298" stroke="#FF6B6B" stroke-width="5"/><path d="M268 284H292M270 288H290" stroke="#8A5A2B" stroke-width="1.600" opacity=".6"/><circle cx="272" cy="268" r="5" fill="#FF5C5C" stroke="#B02A2A" stroke-width="1.600"/></g>';}}
 ]};

HOMES.dino={name:'Jungle cave',cn:'丛林山洞',
 defs:'<linearGradient id="gSkyDi" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFC987"/><stop offset=".6" stop-color="#FFE7B4"/><stop offset="1" stop-color="#FFF4D6"/></linearGradient><linearGradient id="gGrDi" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9C27A"/><stop offset="1" stop-color="#A29B52"/></linearGradient><radialGradient id="gLava" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFE08A"/><stop offset="1" stop-color="#FF7A3A" stop-opacity="0"/></radialGradient>',
 base:function(){var s='<rect width="360" height="300" fill="url(#gSkyDi)"/><circle cx="64" cy="64" r="44" fill="#FFF3C4" opacity=".5"/><circle cx="64" cy="64" r="28" fill="#FFE9A0"/>';
  s+='<path d="M120 196L168 130L214 196Z" fill="#E3C9A0"/><path d="M214 196L250 150L296 196Z" fill="#D8BC92"/>';
  s+='<path d="M226 196L270 88L296 88L342 196Z" fill="#B79A7E" stroke="#8F7459" stroke-width="3" stroke-linejoin="round"/><ellipse cx="283" cy="88" rx="14" ry="5" fill="#6E5440"/><path d="M262 110l-6 24M300 120l8 30" stroke="#9C8164" stroke-width="3" stroke-linecap="round" opacity=".6"/>';
  s+='<g fill="#EADFD0" opacity=".85"><circle cx="283" cy="72" r="9"/><circle cx="294" cy="56" r="11"/><circle cx="306" cy="38" r="13"/></g>';
  s+='<path d="M0 232C80 222 160 234 240 230C300 227 340 230 360 228V300H0Z" fill="url(#gGrDi)"/>';
  s+='<ellipse cx="320" cy="262" rx="14" ry="8" fill="#9C9486" stroke="#6E6860" stroke-width="3"/><ellipse cx="338" cy="270" rx="9" ry="5.500" fill="#B1A998" stroke="#6E6860" stroke-width="2.500"/><ellipse cx="236" cy="288" rx="12" ry="6" fill="#9C9486" stroke="#6E6860" stroke-width="3"/>';
  s+='<path d="M0 252V154C8 104 70 94 100 134C118 158 122 206 120 252Z" fill="#9C8F80" stroke="#6E6357" stroke-width="4"/><path d="M22 252V172C24 142 72 140 92 172C100 192 100 222 100 252Z" fill="#3A2F2A"/><path d="M16 120C30 108 60 106 80 114" fill="none" stroke="#B8AB9B" stroke-width="3" stroke-linecap="round" opacity=".7"/>';
  s+=fern(342,290,.9,-8)+tuft(150,250)+tuft(260,252);
  return s;},
 decos:[
  {id:'eruption',name:'Erupting volcano',cn:'喷发的火山',price:10,icon:'<path d="M12 54L26 22H36L50 54Z" fill="#B79A7E" stroke="#8F7459" stroke-width="3" stroke-linejoin="round"/><path d="M31 22Q26 8 32 4Q36 12 38 22Z" fill="#FF7A3A"/><circle cx="22" cy="10" r="3" fill="#FFC93C"/><circle cx="42" cy="12" r="3" fill="#FFC93C"/>',
   svg:function(){return '<g><circle cx="283" cy="84" r="34" fill="url(#gLava)" class="twinkle"/><path d="M276 90Q270 70 280 56Q286 74 290 90Z" fill="#FF7A3A" stroke="#E04A1A" stroke-width="2" stroke-linejoin="round"/><path d="M284 92Q296 70 290 46Q304 72 296 94Z" fill="#FFB02E" stroke="#E04A1A" stroke-width="2" stroke-linejoin="round"/><path d="M272 90C268 120 262 150 252 176M292 92C298 126 306 154 318 180" fill="none" stroke="#FF7A3A" stroke-width="4" stroke-linecap="round"/>'
    +'<circle class="twinkle" cx="262" cy="52" r="3.500" fill="#FFC93C"/><circle class="twinkle" style="animation-delay:.7s" cx="306" cy="58" r="3" fill="#FF9A3D"/><circle class="twinkle" style="animation-delay:1.3s" cx="284" cy="38" r="3" fill="#FFC93C"/></g>';}},
  {id:'crystals',name:'Glowing crystals',cn:'发光水晶',price:9,icon:'<path d="M20 52L14 24L22 8L30 24L26 52Z" fill="#C084FC" stroke="#7A3FC0" stroke-width="3" stroke-linejoin="round"/><path d="M34 52L32 30L40 18L48 32L46 52Z" fill="#7FD6F0" stroke="#2A8FB8" stroke-width="3" stroke-linejoin="round"/>',
   svg:function(){return '<g><circle cx="318" cy="238" r="38" fill="#C9A8F0" opacity=".28" class="aur"/><path d="M296 254L290 222L298 200L308 222L304 254Z" fill="#C084FC" stroke="#7A3FC0" stroke-width="3" stroke-linejoin="round"/><path d="M312 258L308 228L320 208L332 230L328 258Z" fill="#E4C8FF" stroke="#7A3FC0" stroke-width="3" stroke-linejoin="round"/><path d="M330 256L328 236L338 224L346 238L344 256Z" fill="#7FD6F0" stroke="#2A8FB8" stroke-width="3" stroke-linejoin="round"/><path d="M298 214l4 14M316 218l3 16" stroke="#fff" stroke-width="2.500" stroke-linecap="round" opacity=".7"/></g>';}},
  {id:'fossil',name:'Dino fossil',cn:'恐龙化石',price:8,icon:'<path d="M8 34Q30 6 52 34" fill="none" stroke="#B8A98A" stroke-width="3"/><path d="M14 30V44M22 22V46M30 18V48M38 22V46M46 30V44" stroke="#F3EAD7" stroke-width="5" stroke-linecap="round"/>',
   front:true,svg:function(){var o='<g><path d="M18 284Q56 262 98 282" fill="none" stroke="#B8A98A" stroke-width="9" stroke-linecap="round"/><path d="M18 284Q56 262 98 282" fill="none" stroke="#F3EAD7" stroke-width="5" stroke-linecap="round"/>';
    [[30,276],[42,271],[54,269],[66,270],[78,274],[90,279]].forEach(function(p){o+='<path d="M'+p[0]+' '+p[1]+'Q'+(p[0]-2)+' '+(p[1]+14)+' '+(p[0]+4)+' '+(p[1]+18)+'" fill="none" stroke="#B8A98A" stroke-width="6.500" stroke-linecap="round"/><path d="M'+p[0]+' '+p[1]+'Q'+(p[0]-2)+' '+(p[1]+14)+' '+(p[0]+4)+' '+(p[1]+18)+'" fill="none" stroke="#F3EAD7" stroke-width="3.500" stroke-linecap="round"/>';});
    return o+'<path d="M100 282C108 268 126 270 134 280C126 290 110 292 100 282Z" fill="#F3EAD7" stroke="#B8A98A" stroke-width="3" stroke-linejoin="round"/><circle cx="116" cy="278" r="3.500" fill="#B8A98A"/><path d="M122 286l2 5M128 284l2 5" stroke="#B8A98A" stroke-width="2" stroke-linecap="round"/></g>';}},
  {id:'ferns',name:'Giant ferns',cn:'巨大的蕨类',price:5,icon:'<path d="M30 54Q30 30 40 8" fill="none" stroke="#3F8F4A" stroke-width="3" stroke-linecap="round"/><path d="M31 44L18 40M31 44L44 40M34 32L22 27M34 32L46 27M37 20L28 16M37 20L47 16" stroke="#6CC36A" stroke-width="5" stroke-linecap="round"/>',
   svg:function(){return '<g>'+fern(30,266,1.05,-6)+fern(50,272,.7,14)+fern(332,270,1,8)+fern(314,278,.65,-12)+'</g>';}},
  {id:'nest',name:'Egg nest',cn:'恐龙蛋窝',price:6,icon:'<ellipse cx="22" cy="30" rx="9" ry="12" fill="#FFF3E0" stroke="#C9A97A" stroke-width="3"/><ellipse cx="38" cy="32" rx="9" ry="12" fill="#E4F7D9" stroke="#8DBB77" stroke-width="3"/><path d="M6 44Q30 62 54 44Q54 38 30 40Q6 38 6 44Z" fill="#B5844A" stroke="#7A5428" stroke-width="3"/>',
   front:true,svg:function(){return '<g><ellipse cx="86" cy="290" rx="0" ry="0"/><path d="M252 282Q278 296 306 282Q312 272 280 270Q246 270 252 282Z" fill="#B5844A" stroke="#7A5428" stroke-width="3"/><ellipse cx="266" cy="268" rx="9" ry="12" fill="#FFF3E0" stroke="#C9A97A" stroke-width="2.800"/><ellipse cx="283" cy="266" rx="9.500" ry="12.500" fill="#E4F7D9" stroke="#8DBB77" stroke-width="2.800"/><ellipse cx="299" cy="270" rx="8.500" ry="11.500" fill="#FFE1EA" stroke="#D98AA6" stroke-width="2.800"/><circle cx="264" cy="264" r="2" fill="#C9A97A"/><circle cx="269" cy="272" r="1.800" fill="#C9A97A"/><circle cx="281" cy="262" r="2" fill="#8DBB77"/><circle cx="286" cy="270" r="1.800" fill="#8DBB77"/><circle cx="297" cy="266" r="1.800" fill="#D98AA6"/><path d="M256 282l-8 -2M308 282l8 -3M270 288l-3 5M294 288l3 5" stroke="#7A5428" stroke-width="2.500" stroke-linecap="round"/></g>';}},
  {id:'ptero',name:'Pterodactyl',cn:'翼龙',price:7,icon:'<path d="M6 26Q20 8 30 30Q40 8 54 26Q42 22 30 38Q18 22 6 26Z" fill="#E8855A" stroke="#A8481E" stroke-width="3" stroke-linejoin="round"/>',
   front:true,svg:function(){var p=function(x,y,s,d){return '<g class="flutter" style="animation-delay:'+d+'s"><g transform="translate('+x+','+y+') scale('+s+')"><path d="M-40 -2Q-24 -22 -6 -4L0 -10L6 -4Q24 -22 40 -2Q24 -2 12 10L0 22L-12 10Q-24 -2 -40 -2Z" fill="#E8855A" stroke="#A8481E" stroke-width="3" stroke-linejoin="round"/><path d="M10 -6L24 -14L16 0Z" fill="#E8855A" stroke="#A8481E" stroke-width="2.500" stroke-linejoin="round"/><circle cx="6" cy="-2" r="2" fill="#1E2A4A"/></g></g>';};return p(142,70,.9,0)+p(224,38,.55,1.4);}}
 ]};

HOMES.duck={name:'Duck pond',cn:'小鸭池塘',
 defs:'<linearGradient id="gSkyK" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#AFE0FF"/><stop offset="1" stop-color="#F2FAFF"/></linearGradient><linearGradient id="gPondK" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8BD2EF"/><stop offset="1" stop-color="#BFEAF8"/></linearGradient><linearGradient id="gBankK" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#93D86B"/><stop offset="1" stop-color="#6BBA55"/></linearGradient>',
 base:function(){var s='<rect width="360" height="300" fill="url(#gSkyK)"/>'+cloud(30,32,1.1)+cloud(240,24,1.2)+cloud(150,62,.65,.8);
  s+='<circle cx="318" cy="64" r="26" fill="#FFF3C4" opacity=".6"/><circle cx="318" cy="64" r="16" fill="#FFE08A"/>';
  s+='<g fill="#A5D98D"><circle cx="30" cy="150" r="34"/><circle cx="76" cy="158" r="26"/><circle cx="296" cy="146" r="36"/><circle cx="340" cy="158" r="26"/><circle cx="190" cy="164" r="30"/></g><path d="M0 176H360V200H0Z" fill="#8CCB7E"/>';
  s+='<path d="M0 192C60 180 120 188 180 184C250 180 310 190 360 186V252H0Z" fill="url(#gPondK)"/>';
  s+='<g fill="none" stroke="#fff" stroke-width="2.500" opacity=".7" stroke-linecap="round"><path d="M40 206Q56 202 72 206M150 216Q170 211 190 216M250 204Q268 200 286 204M92 232Q108 228 124 232M290 228Q306 224 322 228"/></g>';
  s+='<path d="M0 244C70 232 140 244 200 240C260 236 320 242 360 238V300H0Z" fill="url(#gBankK)"/><path d="M0 244C70 232 140 244 200 240C260 236 320 242 360 238" fill="none" stroke="#5FAE49" stroke-width="3"/>';
  s+=tuft(34,258)+tuft(116,262)+tuft(248,262)+tuft(318,258)+tuft(190,292);
  s+='<ellipse cx="62" cy="248" rx="12" ry="5" fill="#C9C1B0" stroke="#9A9282" stroke-width="2"/><ellipse cx="300" cy="250" rx="10" ry="4.500" fill="#C9C1B0" stroke="#9A9282" stroke-width="2"/>';
  return s;},
 decos:[
  {id:'willow',name:'Weeping willow',cn:'垂柳',price:9,icon:'<circle cx="30" cy="20" r="14" fill="#7FD07A" stroke="#3F8F4A" stroke-width="3"/><path d="M18 28Q14 40 16 52M26 32Q24 42 25 54M34 32Q36 42 35 54M42 28Q46 40 44 52" fill="none" stroke="#6CC36A" stroke-width="3.500" stroke-linecap="round"/>',
   svg:function(){var o='<g><rect x="293" y="118" width="14" height="128" rx="4" fill="#A8743F" stroke="#6B4423" stroke-width="3"/>';
    for(var i=0;i<12;i++){var x=262+i*7.2,len=58+((i*7)%5)*14;o+='<path d="M'+x.toFixed(1)+' 98Q'+(x+(i%2?-6:6)).toFixed(1)+' '+(98+len*.5).toFixed(1)+' '+(x+(i%2?-2:2)).toFixed(1)+' '+(98+len)+'" fill="none" stroke="'+(i%2?'#6CC36A':'#86D985')+'" stroke-width="3.800" stroke-linecap="round"/>';}
    o+='<circle cx="300" cy="82" r="34" fill="#7FD07A" stroke="#3F8F4A" stroke-width="3.500"/><circle cx="270" cy="98" r="24" fill="#86D985" stroke="#3F8F4A" stroke-width="3.500"/><circle cx="330" cy="98" r="24" fill="#7FD07A" stroke="#3F8F4A" stroke-width="3.500"/><circle cx="298" cy="72" r="14" fill="#9AE59A" opacity=".6"/>';
    return o+'</g>';}},
  {id:'boat',name:'Little boat',cn:'小船',price:8,icon:'<path d="M8 38H52L44 50H16Z" fill="#E8574B" stroke="#9E2A20" stroke-width="3" stroke-linejoin="round"/><path d="M30 38V8" stroke="#8A5A2B" stroke-width="3"/><path d="M32 10L50 34H32Z" fill="#fff" stroke="#9AA6BD" stroke-width="2.500" stroke-linejoin="round"/>',
   svg:function(){return '<g><path d="M62 214H128L118 232H72Z" fill="#E8574B" stroke="#9E2A20" stroke-width="3" stroke-linejoin="round"/><path d="M62 214H128" stroke="#fff" stroke-width="4"/><path d="M96 214V170" stroke="#8A5A2B" stroke-width="3.500"/><path d="M99 172L126 210H99Z" fill="#fff" stroke="#9AA6BD" stroke-width="2.500" stroke-linejoin="round"/><path d="M96 170l12 4-12 4z" fill="#FFD93D" stroke="#B8860B" stroke-width="1.500"/><ellipse cx="95" cy="236" rx="36" ry="4" fill="#fff" opacity=".6"/></g>';}},
  {id:'frog',name:'Frog friend',cn:'青蛙朋友',price:5,icon:'<ellipse cx="30" cy="40" rx="20" ry="8" fill="#6CC36A" stroke="#3F8F4A" stroke-width="3"/><ellipse cx="30" cy="30" rx="14" ry="11" fill="#7BD07A" stroke="#3F8F4A" stroke-width="3"/><circle cx="22" cy="20" r="6" fill="#fff" stroke="#3F8F4A" stroke-width="2.500"/><circle cx="38" cy="20" r="6" fill="#fff" stroke="#3F8F4A" stroke-width="2.500"/>',
   svg:function(){return '<g>'+lily(262,216,1.2)+'<g transform="translate(262,206)"><ellipse cx="0" cy="2" rx="12" ry="9" fill="#7BD07A" stroke="#3F8F4A" stroke-width="2.800"/><circle cx="-7" cy="-7" r="5.500" fill="#fff" stroke="#3F8F4A" stroke-width="2.500"/><circle cx="7" cy="-7" r="5.500" fill="#fff" stroke="#3F8F4A" stroke-width="2.500"/><circle cx="-7" cy="-6.500" r="2.300" fill="#1E2A4A"/><circle cx="7" cy="-6.500" r="2.300" fill="#1E2A4A"/><path d="M-5 3Q0 8 5 3" fill="none" stroke="#1E2A4A" stroke-width="2" stroke-linecap="round"/><ellipse cx="-9" cy="8" rx="5" ry="3" fill="#6CC36A" stroke="#3F8F4A" stroke-width="2"/><ellipse cx="9" cy="8" rx="5" ry="3" fill="#6CC36A" stroke="#3F8F4A" stroke-width="2"/></g></g>';}},
  {id:'lilies',name:'Lily pads',cn:'荷叶和莲花',price:4,icon:'<ellipse cx="22" cy="40" rx="16" ry="7" fill="#6CC36A" stroke="#3F8F4A" stroke-width="3"/><ellipse cx="42" cy="44" rx="12" ry="5.500" fill="#6CC36A" stroke="#3F8F4A" stroke-width="3"/><path d="M30 34Q24 30 24 22Q30 24 30 34ZM30 34Q36 30 36 22Q30 24 30 34Z" fill="#FF8FB1" stroke="#C0577F" stroke-width="2"/>',
   svg:function(){return '<g>'+lily(42,210,1.1)+lily(120,222,1)+lily(208,208,.9)+lily(322,218,1.1)+'<g transform="translate(124,218)"><path d="M0 0Q-9 -3 -9 -11Q-2 -9 0 0ZM0 0Q9 -3 9 -11Q2 -9 0 0ZM0 0Q-4 -8 0 -16Q4 -8 0 0Z" fill="#FF8FB1" stroke="#C0577F" stroke-width="1.600" stroke-linejoin="round"/></g></g>';}},
  {id:'reeds',name:'Cattails',cn:'香蒲草',price:4,icon:'<path d="M18 54V16M32 54V8M46 54V20" stroke="#5FAE49" stroke-width="3" stroke-linecap="round"/><rect x="14" y="12" width="8" height="18" rx="4" fill="#8A5A2B"/><rect x="28" y="4" width="8" height="18" rx="4" fill="#8A5A2B"/><rect x="42" y="16" width="8" height="18" rx="4" fill="#8A5A2B"/>',
   svg:function(){var o='<g>';[[18,146],[32,128],[46,152],[336,150],[350,134]].forEach(function(p){o+='<path d="M'+p[0]+' 244V'+p[1]+'" stroke="#5FAE49" stroke-width="3.500" stroke-linecap="round"/><rect x="'+(p[0]-4)+'" y="'+(p[1]-6)+'" width="8" height="22" rx="4" fill="#8A5A2B" stroke="#5E3A1E" stroke-width="1.800"/><path d="M'+p[0]+' 244Q'+(p[0]+12)+' 214 '+(p[0]+16)+' 200" fill="none" stroke="#6CC36A" stroke-width="3" stroke-linecap="round"/>';});return o+'</g>';}},
  {id:'umbrella',name:'Umbrella & boots',cn:'雨伞和雨靴',price:6,icon:'<path d="M8 32C8 10 52 10 52 32Z" fill="#FFD93D" stroke="#B8860B" stroke-width="3" stroke-linejoin="round"/><path d="M30 32V50Q30 56 24 54" fill="none" stroke="#8A5A2B" stroke-width="3" stroke-linecap="round"/>',
   front:true,svg:function(){return '<g><path d="M318 266V240" stroke="#8A5A2B" stroke-width="3.500" stroke-linecap="round"/><path d="M318 268Q318 276 311 274" fill="none" stroke="#8A5A2B" stroke-width="3.500" stroke-linecap="round"/><path d="M290 242C290 214 346 214 346 242Z" fill="#FFD93D" stroke="#B8860B" stroke-width="3.500" stroke-linejoin="round"/><path d="M304 242C304 222 318 218 318 218M332 242C332 222 318 218 318 218M318 218V242" fill="none" stroke="#E8B800" stroke-width="2"/>'
    +'<path d="M270 288V268H282V280L292 284V290H270Z" fill="#E8574B" stroke="#9E2A20" stroke-width="2.800" stroke-linejoin="round"/><path d="M296 288V268H308V280L318 284V290H296Z" fill="#E8574B" stroke="#9E2A20" stroke-width="2.800" stroke-linejoin="round"/></g>';}}
 ]};


Object.keys(NEWPETS).forEach(function(k){MENU[k]=NEWPETS[k].menu;LIKES[k]=NEWPETS[k].likes;});   /* snacks and 'likes' text of the three new pets */
var ACCS=['party','crown','flower','glasses','shades','scarf','bowtie','bandana'],TOYS=['ball','teddy','car','balloon'];
var SLOTLABEL={hat:'Hats 帽子',face:'Glasses 眼镜',neck:'Neckwear 颈饰'};
/* one picture of a pet: full body for the adoption grid and the home, a head-and-shoulders crop for small icons */
function petSvg(t,m,eq,mode,style){var g=composePet(t,PETS2[t].pal[0],m||'happy',eq||{}),st=style?' style="'+style+'"':'',vb=t==='penguin'?'-24 -24 168 214':'-12 -24 144 214';
 if(mode==='icon')return '<svg viewBox="-6 -22 132 142" aria-hidden="true"'+st+'>'+g+'</svg>';
 return '<svg viewBox="'+vb+'" aria-hidden="true"'+(style?st:' style="overflow:visible"')+'>'+g+'</svg>';}
function petGroup(t,m,eq){return composePet(t,PETS2[t].pal[0],m||'happy',eq||{});}
function decoKey(t,id){return 'd:'+t+':'+id;}
window.softSvg=function(s){return softAny(s,'sv'+(++GN));};
window.PetKit={G:G,body:body,hw:hw,gw:gw,sleeves:sleeves,strip:strip,dot:dot,star5:star5,spark4:spark4,hexMix:hexMix,f1:f1,sm:sm,OUT:OUT,OUTFITS:OUTFITS,ITEMS:ITEMS,SW:SW};   /* drawing helpers for the festival items in pet-fest.js */window.PETS=PETS2;window.PET_ORDER=ORDER;window.FOOD=FOOD;window.FNAME=FNAME;window.FCN=FCN;window.MENU=MENU;window.FCOST=FCOST;window.FGAIN=FGAIN;
window.LIKES=LIKES;window.ITEMS=ITEMS;window.OUTFITS=OUTFITS;window.OUTFIT_IDS=OUTFIT_IDS;window.ACCS=ACCS;window.TOYS=TOYS;window.SLOTLABEL=SLOTLABEL;
window.HOMES=HOMES;window.FACES=FACES;window.FACENAME=FACENAME;window.petSvg=petSvg;window.petGroup=petGroup;window.decoKey=decoKey;window.PET_INK=INK;

})();

# -*- coding: utf-8 -*-
"""Single source of truth for the new "Let's learn" speaker button.

OLD_* are the exact current strings (one variant across all 945 book pages and the
shared template). NEW_* replace them. `patch_text` is used for the template, the
preview page and, after approval, every book page, so they cannot drift apart.
"""

# ---------------------------------------------------------------- JS
OLD_BLOCK = (
    r'''function playTeachAudio(key,part,fallbackText,fallbackLang){try{var store=window.RV_TEACH_AUDIO&&window.RV_TEACH_AUDIO[key];if(store&&store[part]){var a=new Audio(store[part]);a.play();return;}}catch(e){}speakText(fallbackText,fallbackLang);}function renderTeach(teachHtml,key){var m=teachHtml.match(/<span class=['"]cn['"]>([\s\S]*?)<\/span>/);var cnHtml=m?m[1]:"";var enHtml=m?teachHtml.slice(0,m.index):teachHtml;var strip=function(s){return s.replace(/<[^>]+>/g,"");};var enText=strip(enHtml),cnText=strip(cnHtml);var out='<div class="teach">\uD83D\uDCA1 <b>Let\u2019s learn:</b><br>';out+='<button style="border:0;background:#e2483f;color:#fff;cursor:pointer;font-size:.8em;line-height:1;vertical-align:middle;padding:0;margin-right:6px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;width:1.9em;height:1.9em;box-shadow:0 2px 6px rgba(226,72,63,.35)" data-key="'+key+'" data-part="en" data-text="'+escAttr(enText)+'" data-lang="en-US" onclick="playTeachAudio(this.dataset.key,this.dataset.part,this.dataset.text,this.dataset.lang)" aria-label="Listen in English" title="Listen in English">\uD83D\uDD0A</button> '+enHtml;if(cnHtml){out+='<span class="cn"><button style="border:0;background:#e2483f;color:#fff;cursor:pointer;font-size:.8em;line-height:1;vertical-align:middle;padding:0;margin-right:6px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;width:1.9em;height:1.9em;box-shadow:0 2px 6px rgba(226,72,63,.35)" data-key="'+key+'" data-part="cn" data-text="'+escAttr(cnText)+'" data-lang="zh-CN" onclick="playTeachAudio(this.dataset.key,this.dataset.part,this.dataset.text,this.dataset.lang)" aria-label="\u64AD\u653E\u4E2D\u6587\u8BB2\u89E3" title="\u64AD\u653E\u4E2D\u6587\u8BB2\u89E3">\uD83D\uDD0A</button> '+cnHtml+'</span>';}out+="</div>";return out;}'''
)

NEW_BLOCK = (
    r'''var TEACH_ICONS='<svg class="ic i-spk" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 9.5v5h3.6l4.9 4.5V5L7.6 9.5H4z"/><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M15.6 9.2a4 4 0 010 5.6M18.2 6.6a7.6 7.6 0 010 10.8"/></svg><svg class="ic i-pause" viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="5" width="4" height="14" rx="1.4" fill="currentColor"/><rect x="13.5" y="5" width="4" height="14" rx="1.4" fill="currentColor"/></svg><svg class="ic i-play" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8.2 5.3v13.4c0 .8.9 1.3 1.6.8l9.6-6.7c.6-.4.6-1.2 0-1.6L9.8 4.5c-.7-.5-1.6 0-1.6.8z"/></svg>';var _tp=null;function _tpSet(b,st){if(!b)return;b.classList.toggle('is-playing',st==='playing');b.classList.toggle('is-paused',st==='paused');b.setAttribute('aria-pressed',st==='playing'?'true':'false');var z=b.dataset.part==='cn',L=st==='playing'?(z?'\u6682\u505C':'Pause'):st==='paused'?(z?'\u7EE7\u7EED\u64AD\u653E':'Resume'):b.dataset.label;b.setAttribute('aria-label',L);b.title=L;}function stopTeachAudio(){var c=_tp;if(!c)return;_tp=null;try{if(c.audio){c.audio.onended=c.audio.onerror=c.audio.ontimeupdate=null;c.audio.pause();}}catch(e){}if(c.mode==='tts'){try{speechSynthesis.cancel();}catch(e){}}_tpSet(c.btn,'idle');}function _tpFallback(btn){try{var u=new SpeechSynthesisUtterance(btn.dataset.text||'');u.lang=btn.dataset.lang||'en-US';var cur={btn:btn,mode:'tts'};_tp=cur;u.onend=u.onerror=function(){if(_tp===cur){_tp=null;_tpSet(btn,'idle');}};_tpSet(btn,'playing');speechSynthesis.speak(u);}catch(e){}}function playTeachAudio(btn){if(_tp&&_tp.btn===btn){if(_tp.mode==='audio'){var a0=_tp.audio;if(a0.paused){var p0=a0.play();if(p0&&p0.catch)p0.catch(function(er){if(er&&er.name==='AbortError')return;stopTeachAudio();});_tpSet(btn,'playing');}else{a0.pause();_tpSet(btn,'paused');}}else{stopTeachAudio();}return;}stopTeachAudio();window.__readToken=(window.__readToken||0)+1;try{speechSynthesis.cancel();}catch(e){}try{endNarration();}catch(e){}var url=null;try{var st=window.RV_TEACH_AUDIO&&window.RV_TEACH_AUDIO[btn.dataset.key];if(st&&st[btn.dataset.part])url=st[btn.dataset.part];}catch(e){}if(!url){_tpFallback(btn);return;}var a=new Audio(url),cur={btn:btn,audio:a,mode:'audio'};_tp=cur;a.onended=function(){if(_tp===cur)_tp=null;_tpSet(btn,'idle');};a.ontimeupdate=function(){if(!btn.isConnected&&_tp===cur)stopTeachAudio();};a.onerror=function(){if(_tp===cur){_tp=null;_tpSet(btn,'idle');_tpFallback(btn);}};_tpSet(btn,'playing');var pr=a.play();if(pr&&pr.catch)pr.catch(function(er){if(er&&er.name==='AbortError')return;if(_tp===cur){_tp=null;_tpSet(btn,'idle');}});}function teachBtn(key,part,text,lang,label){return '<button type="button" class="spk" data-key="'+key+'" data-part="'+part+'" data-text="'+text+'" data-lang="'+lang+'" data-label="'+label+'" onclick="playTeachAudio(this)" aria-label="'+label+'" title="'+label+'" aria-pressed="false">'+TEACH_ICONS+'</button>';}function renderTeach(teachHtml,key){stopTeachAudio();var m=teachHtml.match(/<span class=['"]cn['"]>([\s\S]*?)<\/span>/);var cnHtml=m?m[1]:"";var enHtml=m?teachHtml.slice(0,m.index):teachHtml;var strip=function(s){return s.replace(/<[^>]+>/g,"");};var enText=strip(enHtml),cnText=strip(cnHtml);var out='<div class="teach">\uD83D\uDCA1 <b>Let\u2019s learn:</b><br>';out+=teachBtn(key,"en",escAttr(enText),"en-US","Listen in English")+" "+enHtml;if(cnHtml){out+='<span class="cn">'+teachBtn(key,"cn",escAttr(cnText),"zh-CN","\u64AD\u653E\u4E2D\u6587\u8BB2\u89E3")+" "+cnHtml+'</span>';}out+="</div>";return out;}'''
)

# starting any story narration already calls speechSynthesis.cancel(); make that also stop the teach clip
WRAP_OLD = r'''speechSynthesis.cancel=function(){try{stopRvAudio();}catch(e){}return oc();};'''
WRAP_NEW = r'''speechSynthesis.cancel=function(){try{stopRvAudio();}catch(e){}try{stopTeachAudio();}catch(e){}return oc();};'''

# ---------------------------------------------------------------- CSS
CSS_ANCHOR = r'''.teach .cn{display:block;margin-top:7px;color:#33507e;font-weight:600;font-size:.9rem}'''
CSS_NEW = CSS_ANCHOR + (
    r'''.teach .spk{position:relative;display:inline-flex;align-items:center;justify-content:center;flex:none;width:30px;height:30px;margin:-4px 9px -4px 0;padding:0;vertical-align:middle;border-radius:50%;cursor:pointer;color:#fff;-webkit-tap-highlight-color:transparent;border:1px solid rgba(255,255,255,.8);background:radial-gradient(circle at 30% 22%,rgba(255,255,255,.9) 0,rgba(255,255,255,0) 55%),linear-gradient(145deg,rgba(112,80,206,.92),rgba(58,140,242,.82));-webkit-backdrop-filter:blur(8px) saturate(1.5);backdrop-filter:blur(8px) saturate(1.5);box-shadow:0 0 0 3px rgba(255,255,255,.38),0 6px 14px rgba(92,88,200,.30),inset 0 1px 1px rgba(255,255,255,.95),inset 0 -4px 8px rgba(255,255,255,.16);transition:transform .15s ease,box-shadow .25s ease,background .3s ease}'''
    r'''.teach .spk .ic{display:none;width:15px;height:15px;filter:drop-shadow(0 1px 2px rgba(48,30,130,.45))}'''
    r'''.teach .spk .i-spk{display:block}'''
    r'''.teach .spk:hover{transform:translateY(-1px) scale(1.07)}.teach .spk:active{transform:scale(.93)}.teach .spk:focus-visible{outline:3px solid rgba(111,74,182,.5);outline-offset:3px}'''
    r'''.teach .spk.is-playing{background:radial-gradient(circle at 30% 22%,rgba(255,255,255,.88) 0,rgba(255,255,255,0) 55%),linear-gradient(145deg,rgba(255,126,112,.9),rgba(226,72,63,.82));box-shadow:0 0 0 3px rgba(255,255,255,.38),0 6px 14px rgba(226,72,63,.34),inset 0 1px 1px rgba(255,255,255,.95),inset 0 -4px 8px rgba(255,255,255,.14)}'''
    r'''.teach .spk.is-playing::after{content:"";position:absolute;top:-3px;left:-3px;right:-3px;bottom:-3px;border-radius:50%;border:2px solid rgba(226,72,63,.55);pointer-events:none;animation:spkRing 1.5s ease-out infinite}'''
    r'''.teach .spk.is-paused{box-shadow:0 0 0 2px rgba(255,255,255,.55),0 0 0 3.5px rgba(226,72,63,.6),0 6px 14px rgba(92,88,200,.28),inset 0 1px 1px rgba(255,255,255,.95)}'''
    r'''.teach .spk.is-playing .i-spk,.teach .spk.is-paused .i-spk{display:none}.teach .spk.is-playing .i-pause,.teach .spk.is-paused .i-play{display:block}'''
    r'''@keyframes spkRing{0%{transform:scale(1);opacity:.85}100%{transform:scale(1.6);opacity:0}}@media (prefers-reduced-motion:reduce){.teach .spk.is-playing::after{animation:none;opacity:.6}.teach .spk{transition:none}}'''
)

# (label, old, new) triples applied in order; every `old` must occur exactly once
EDITS = [
    ("teach speaker functions + renderTeach", OLD_BLOCK, NEW_BLOCK),
    ("speechSynthesis.cancel wrapper", WRAP_OLD, WRAP_NEW),
    ("css", CSS_ANCHOR, CSS_NEW),
]


def patch_text(html, edits=EDITS):
    """-> (new_html, problems). Nothing is changed if any problem is found."""
    problems = []
    for label, old, new in edits:
        n = html.count(old)
        if n != 1:
            problems.append((label, f"expected exactly 1 occurrence of the old text, found {n}"))
    if problems:
        return html, problems
    for label, old, new in edits:
        html = html.replace(old, new, 1)
    return html, []

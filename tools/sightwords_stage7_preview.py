#!/usr/bin/env python3
"""Builds one self-contained HTML page that shows every stage-7 picture with its sentence (to look at the drawings, not part of the site).

  python3 tools/sightwords_stage7_preview.py out.html
"""
import os
import sys

SITE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "site")
FILES = ["pet-art.js", "sightwords-art.js", "sightwords-art3.js", "sightwords-art4.js", "sightwords-art5.js", "sightwords-art6.js", "sightwords-art7.js", "sightwords-data7.js", "sightwords-prizes.js", "sightwords-scenery.js"]
NAMES = {31: "沙丘 Sand dunes", 32: "绿洲镇 Oasis town", 33: "金字塔厅 Pyramid hall", 34: "星空夜 Starry night", 35: "骆驼商队 Camel caravan"}
CSS = """:root{--bg:#F2F5FA;--fg:#1E2A4A;--muted:#5C6B8A;--card:#FFFFFF;--line:#D6DEEC}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--bg:#141A2B;--fg:#E6EBF7;--muted:#9AA7C4;--card:#1E2640;--line:#30395A;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#141A2B;--fg:#E6EBF7;--muted:#9AA7C4;--card:#1E2640;--line:#30395A;color-scheme:dark}
body{margin:0;background:var(--bg);color:var(--fg);font-family:-apple-system,"Segoe UI","PingFang SC",sans-serif;padding-block:18px 40px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
.wrap{max-width:1100px;margin:0 auto}h1{font-size:22px;margin:0 0 4px;text-wrap:balance}.lead{margin:0 0 14px;color:var(--muted);max-width:64ch}h2{font-size:17px;margin:24px 0 10px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px}
.c{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:8px;min-width:0}
.row{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-start}.p{width:130px}.p svg{width:130px;height:90px}.map{width:300px;max-width:100%}
.c svg{width:100%;height:auto;display:block;border-radius:10px}.c b{display:block;margin:6px 2px 0;font-size:15px}.c span{display:block;margin:0 2px 2px;font-size:13px;color:var(--muted)}"""
JS = """var NAMES=%s;var D=SW_DATA7,h="";
D.units.forEach(function(u){h+='<h2>'+NAMES[u.id]+'</h2><div class="grid">';
 u.lessons.forEach(function(id){var l=D.lessons[id-159];l.words.forEach(function(w){
  h+='<div class="c">'+SWArt.scene(w)+'<b>'+l.id+' \\u00b7 '+w+'</b><span>'+D.words[w].s+'</span></div>';});});h+='</div>';});
h+='<h2>岛屿、宝箱和奖品</h2><div class="row"><div class="c map">'+SWScenery.banner(7)+'<b>岛屿横幅</b></div>';
for(var i=0;i<5;i++) h+='<div class="c map">'+SWScenery.unitArt({s:7,i:i})+'<b>'+NAMES[31+i]+'</b></div>';
h+='</div><div class="row" style="margin-top:12px">';
["ready","open"].forEach(function(st){h+='<div class="c" style="width:90px">'+SWScenery.chest({state:st,s:7})+'<b>宝箱</b></div>';});
[["ch-cactushat","仙人掌帽 Cactus hat"],["ch-amberneck","琥珀项链 Amber necklace"],["ch-desertgoggles","沙漠护目镜 Desert goggles"],["ch-moonhat","月星帽 Moon-star hat"],["ch-camelears","骆驼耳朵 Camel ears"]].forEach(function(p){h+='<div class="c p">'+SWPrizes.thumb(p[0])+'<b>'+p[1]+'</b></div>';});
h+='</div>';
document.getElementById("g").innerHTML=h;"""


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else "stage7-preview.html"
    scripts = "".join("<script>" + open(os.path.join(SITE, f), encoding="utf-8").read() + "</script>\n" for f in FILES)
    import json
    html = ('<meta name="claude:viewport-fit-sides" content="cover">\n<title>第七阶段图片</title>\n<style>' + CSS + '</style>\n'
            '<div class="wrap"><h1>第七阶段 · 沙漠岛 · 140 张图片</h1><p class="lead">沙漠岛的 30 节课：每个词配一张图和一句话（Stage 7 = Fry 常用词第四批 140 个）。五个小世界：沙丘、绿洲镇、金字塔厅、星空夜、骆驼商队。最后是岛屿地图、宝箱和 5 个奖品。</p><div id="g"></div></div>\n' + scripts
            + "<script>" + JS % json.dumps(NAMES, ensure_ascii=False) + "</script>")
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)
    print("wrote", out, len(html), "bytes")


if __name__ == "__main__":
    main()

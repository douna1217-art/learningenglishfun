#!/usr/bin/env python3
"""Builds one self-contained HTML page that shows every picture of a stage (7 or 8) with its sentence, then the island, the chest and the prizes
(to look at the drawings; not part of the site).

  python3 tools/sightwords_stage_preview.py 8 out.html
"""
import json
import os
import sys

SITE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "site")
ART = ["sightwords-art.js", "sightwords-art3.js", "sightwords-art4.js", "sightwords-art5.js", "sightwords-art6.js", "sightwords-art7.js", "sightwords-art8.js"]
STAGES = {
    7: {"title": "第七阶段 · 沙漠岛", "lead": "沙漠岛的 30 节课：每个词配一张图和一句话（Stage 7 = Fry 常用词第四批 140 个）。五个小世界：沙丘、绿洲镇、金字塔厅、星空夜、骆驼商队。最后是岛屿地图、宝箱和 5 个奖品。",
        "names": {31: "沙丘 Sand dunes", 32: "绿洲镇 Oasis town", 33: "金字塔厅 Pyramid hall", 34: "星空夜 Starry night", 35: "骆驼商队 Camel caravan"},
        "first": 159, "prizes": [["ch-cactushat", "仙人掌帽 Cactus hat"], ["ch-amberneck", "琥珀项链 Amber necklace"], ["ch-desertgoggles", "沙漠护目镜 Desert goggles"], ["ch-moonhat", "月星帽 Moon-star hat"], ["ch-camelears", "骆驼耳朵 Camel ears"]]},
    8: {"title": "第八阶段 · 极地岛", "lead": "极地岛的 30 节课：每个词配一张图和一句话（Stage 8 = Fry 常用词第五批 140 个，也是最后一批）。五个小世界：雪山丘、冰屋村、冰冻湖、北极光、企鹅湾。最后是岛屿地图、宝箱和 5 个奖品。",
        "names": {36: "雪山丘 Snow hills", 37: "冰屋村 Igloo village", 38: "冰冻湖 Frozen lake", 39: "北极光 Northern lights", 40: "企鹅湾 Penguin cove"},
        "first": 189, "prizes": [["ch-snowcap", "绒球雪帽 Pom-pom cap"], ["ch-snowflakeneck", "雪花项链 Snowflake necklace"], ["ch-icegoggles", "雪地护目镜 Snow goggles"], ["ch-auroracrown", "极光王冠 Aurora crown"], ["ch-penguinhat", "企鹅帽 Penguin hat"]]},
}
CSS = """:root{--bg:#F2F5FA;--fg:#1E2A4A;--muted:#5C6B8A;--card:#FFFFFF;--line:#D6DEEC}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--bg:#141A2B;--fg:#E6EBF7;--muted:#9AA7C4;--card:#1E2640;--line:#30395A;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#141A2B;--fg:#E6EBF7;--muted:#9AA7C4;--card:#1E2640;--line:#30395A;color-scheme:dark}
body{margin:0;background:var(--bg);color:var(--fg);font-family:-apple-system,"Segoe UI","PingFang SC",sans-serif;padding-block:18px 40px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
.wrap{max-width:1100px;margin:0 auto}h1{font-size:22px;margin:0 0 4px;text-wrap:balance}.lead{margin:0 0 14px;color:var(--muted);max-width:64ch}h2{font-size:17px;margin:24px 0 10px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px}
.c{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:8px;min-width:0}
.row{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-start}.p{width:130px}.p svg{width:130px;height:90px}.map{width:300px;max-width:100%}
.c svg{width:100%;height:auto;display:block;border-radius:10px}.c b{display:block;margin:6px 2px 0;font-size:15px}.c span{display:block;margin:0 2px 2px;font-size:13px;color:var(--muted)}"""
JS = """var NAMES=%(names)s,D=SW_DATA%(n)d,N=%(n)d,F=%(first)d,PR=%(prizes)s,h="";
D.units.forEach(function(u){h+='<h2>'+NAMES[u.id]+'</h2><div class="grid">';
 u.lessons.forEach(function(id){var l=D.lessons[id-F];l.words.forEach(function(w){
  h+='<div class="c">'+SWArt.scene(w)+'<b>'+l.id+' \\u00b7 '+w+'</b><span>'+D.words[w].s+'</span></div>';});});h+='</div>';});
h+='<h2>岛屿、宝箱和奖品</h2><div class="row"><div class="c map">'+SWScenery.banner(N)+'<b>岛屿横幅</b></div>';
for(var i=0;i<5;i++) h+='<div class="c map">'+SWScenery.unitArt({s:N,i:i})+'<b>'+NAMES[D.units[i].id]+'</b></div>';
h+='</div><div class="row" style="margin-top:12px">';
["ready","open"].forEach(function(st){h+='<div class="c" style="width:90px">'+SWScenery.chest({state:st,s:N})+'<b>宝箱</b></div>';});
PR.forEach(function(p){h+='<div class="c p">'+SWPrizes.thumb(p[0])+'<b>'+p[1]+'</b></div>';});
h+='<div class="c map">'+SWScenery.islands({known:0,total:1,ready:{1:true,2:true,3:true,4:true,5:true,6:true,7:true,8:true},stages:{1:{title:"First words",known:30,total:92},2:{title:"Growing readers",known:5,total:87},3:{title:"Bigger stories",known:12,total:136},4:{title:"Word explorers",known:20,total:140},5:{title:"Word adventurers",known:9,total:140},6:{title:"Word divers",known:9,total:140},7:{title:"Word travelers",known:9,total:140},8:{title:"Word pioneers",known:9,total:140}}})+'<b>岛屿地图</b></div>';
h+='</div>';
document.getElementById("g").innerHTML=h;"""


def main():
    n = int(sys.argv[1])
    out = sys.argv[2] if len(sys.argv) > 2 else "stage%d-preview.html" % n
    st = STAGES[n]
    files = ["pet-art.js"] + [f for f in ART if os.path.exists(os.path.join(SITE, f))] + ["sightwords-data%d.js" % n, "sightwords-prizes.js", "sightwords-scenery.js"]
    scripts = "".join("<script>" + open(os.path.join(SITE, f), encoding="utf-8").read() + "</script>\n" for f in files)
    js = JS % {"names": json.dumps(st["names"], ensure_ascii=False), "n": n, "first": st["first"], "prizes": json.dumps(st["prizes"], ensure_ascii=False)}
    html = ('<meta name="claude:viewport-fit-sides" content="cover">\n<title>' + st["title"].split(" · ")[0] + '图片</title>\n<style>' + CSS + '</style>\n'
            '<div class="wrap"><h1>' + st["title"] + ' · 140 张图片</h1><p class="lead">' + st["lead"] + '</p><div id="g"></div></div>\n' + scripts + "<script>" + js + "</script>")
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)
    print("wrote", out, len(html), "bytes")


if __name__ == "__main__":
    main()

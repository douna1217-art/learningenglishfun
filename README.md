# learningenglishfun

一个给小朋友用的英语阅读网站（Readiverse）：分主题的绘本书架 + AI 配音朗读 +
Smart Review 间隔复习。纯静态网站，`site/` 文件夹就是可以直接部署的完整站点。

## 目录结构

```
site/                 网站本体，直接部署这个文件夹即可（Netlify / GitHub Pages 都行）
  index.html           首页：书架、Smart Review 入口
  catalog.js           网站文案 + 主题分类定义
  books/<topic>/        每个主题一个文件夹，books.js 是书目清单，其余是每本书的页面
  supabase-config.js    跨设备同步的 Supabase 项目配置（默认占位符，未配置时不影响任何功能）
  sync.js               跨设备同步逻辑（可选）

voice_all.py           一键给全站书籍配音的脚本（用 OpenAI TTS，Key 只留在你本机）
READ_ME_先看这个.txt    配音脚本的使用说明
SUPABASE_SETUP.md      开启跨设备同步复习进度的完整步骤
```

## 本地预览

不需要构建，直接起个静态服务器打开 `site/index.html` 即可，例如：

```bash
cd site
python3 -m http.server 8000
```

然后打开 http://localhost:8000

## 部署

把 `site/` 文件夹（或整个仓库，指定发布目录为 `site`）拖到 Netlify 的
Deploys 页面，或用 GitHub Pages / Vercel 指定发布目录为 `site` 即可。

## 给某个学科换配音 / 重新配音

见 [READ_ME_先看这个.txt](READ_ME_先看这个.txt)。

## 跨设备同步复习进度（可选）

默认所有进度都存在浏览器本地。想让同一个人换设备也能看到一样的 Smart Review
复习进度，接一下 Supabase 就行，步骤见 [SUPABASE_SETUP.md](SUPABASE_SETUP.md)。

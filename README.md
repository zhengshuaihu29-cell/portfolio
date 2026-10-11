# 游戏作品集网站（纯静态 / GitHub Pages）

打开 `index.html` 就是一个作品卡片网格，点卡片弹出详情（介绍 + 截图 + APK 下载）。
全部是 HTML + CSS + JS，**没有任何框架和外部依赖**，可直接丢到 GitHub Pages。

```
作品集网站/
├── index.html          页面骨架
├── style.css           样式
├── main.js             读取 JSON、渲染卡片、弹窗逻辑
├── projects.json       ★ 所有项目数据都在这里
├── assets/
│   ├── bg.jpg          ★ 整站背景插画（3840×2160，铺满全屏、固定不动）
│   ├── covers/         封面图（示例 800×450，16:9）
│   ├── screenshots/    截图（示例 540×960，9:16）
│   └── apk/            安装包
└── .nojekyll           让 GitHub Pages 跳过 Jekyll 处理
```

---

## 1. 加一个项目

在 `projects.json` 的数组里加一项即可，页面会自动多一张卡片：

```json
{
  "id": "amber-paradox",
  "name": "Amber Paradox",
  "nameZh": "琥珀悖论",
  "intro": "English introduction shown to overseas visitors.",
  "introZh": "中文介绍，切到中文时显示。",
  "cover": "assets/covers/amber-paradox.png",
  "screenshots": [
    "assets/screenshots/amber-paradox-1.png",
    "assets/screenshots/amber-paradox-2.png"
  ],
  "apk": "assets/apk/amber-paradox.apk",
  "tags": ["Arcade", "Endless Runner"],
  "date": "2026-09-20"
}
```

| 字段 | 必填 | 说明 |
|---|---|---|
| `id` | 是 | 唯一标识，用英文小写加连字符。也用作分享链接的锚点：`你的网址/#amber-paradox` |
| `name` | 是 | 项目名（英文） |
| `nameZh` | 否 | 中文名，切到中文时显示；不填就一直显示 `name` |
| `intro` | 是 | 介绍（英文） |
| `introZh` | 否 | 中文介绍，规则同 `nameZh` |
| `cover` | 是 | 封面图路径，建议 16:9 |
| `screenshots` | 是 | 截图数组，第一张是弹窗默认显示的大图 |
| `apk` | 否 | APK 路径或完整网址；留空则弹窗里不显示下载按钮 |
| `tags` | 否 | 标签数组，显示成小圆角标签 |
| `date` | 否 | 日期，原样显示（建议 `YYYY-MM-DD`） |

> 图片找不到时不会破版，会自动显示一块灰色的 "image not found" 占位。

## 2. 换成真实素材

把同名文件覆盖掉就行，**不用改 JSON**：

- 封面 → `assets/covers/example-1.png`（建议 1280×720 或同比例）
- 截图 → `assets/screenshots/example-1-1.png` 等
- APK → `assets/apk/example-1.apk`
- 整站背景 → `assets/bg.jpg`（换成别的图覆盖即可，不用改 CSS）

> 背景图现在放的是 3840×2160 的原图，约 10 MB，首次打开会慢一些。
> 哪天想瘦身：压到 2560 宽、质量 85 左右，体积能降到 700 KB 上下，肉眼几乎看不出差别。

**注意**：GitHub 单个文件超过 100 MB 会被拒。APK 比较大时，建议传到仓库的 **Releases**，
再把下载地址整条粘到 `apk` 字段里（例如 `https://github.com/用户名/仓库/releases/download/v1/game.apk`）。

## 3. 本地预览

`projects.json` 是用 fetch 读的，**直接双击 index.html（file://）读不到**，页面会提示你用服务器打开。
在这个目录执行任意一条，然后浏览器访问提示的地址即可：

```bash
python -m http.server 8000      # 然后打开 http://localhost:8000
npx serve .                     # 或者用 node 的 serve
```

## 4. 部署到 GitHub Pages

```bash
cd 作品集网站
git init
git add .
git commit -m "Add game portfolio site"
git branch -M main
git remote add origin https://github.com/你的用户名/你的仓库.git
git push -u origin main
```

推上去之后，在仓库页面：**Settings → Pages → Source 选 “Deploy from a branch” →
Branch 选 `main`、目录选 `/ (root)` → Save**。
等一两分钟，访问 `https://你的用户名.github.io/你的仓库/` 就能看到。

> 想让网址变成 `https://你的用户名.github.io/`（不带仓库名），把仓库名取成
> `你的用户名.github.io` 再走同样的步骤。

## 5. 想改样式

常用变量都在 `style.css` 顶部 `:root` 里：

| 想改什么 | 改哪个变量 |
|---|---|
| 主色（粉） | `--pink` / `--pink-deep` |
| 辅色（灯笼金） | `--gold` |
| 卡片玻璃面板的深浅 | `--glass` 的透明度（越小越透） |
| 没有背景图时的底色 | `--ink` |
| 描边、圆角 | `--line` / `--radius` |
| 内容最大宽度 | `--wrap` |

**背景图和压暗程度**在 `body::before`（图片本身）和 `body::after`（暖光晕 + 暗色蒙版）
两个地方 —— 觉得字看不清就把 `body::after` 那几行 `rgba(...)` 的最后一个数字调大。
那张图是 `background-position: center 28%`，想露出画面上/下不同的部分就改这个百分比。

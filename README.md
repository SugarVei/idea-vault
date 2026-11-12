# 创意仓库 · Idea Vault

磨砂玻璃卡片风格的个人创意仓库，收着我做过的可交互网页作品，以及标注原作者的开源作品和创作工具收藏。中英双语，深色主题。

线上地址：https://works.sugarv.mom/

## 结构

| 文件 | 作用 |
|---|---|
| `index.html` | 页面骨架 |
| `style.css` | 全部样式 |
| `app.js` | 渲染卡片、详情、筛选、语言切换，以及管理员登录和导入 |
| `particles-background.js` | 覆盖完整视口的粒子场：推开、点击扩散、回弹，跟随浏览器原生刷新率，不设帧率上限 |
| `particle-background.css` | 首页与两个设计画廊共用的背景层，适配各页面配色 |
| `background-controls.js` | 启动粒子背景，离开页面时释放 |
| `config.js` | Supabase 地址和 publishable key（可公开，数据库有行级权限保护） |
| `data/seed.json` | 内置的十三个条目（十一件个人作品、两项开源收藏）；数据库连不上时用它显示 |
| `assets/` | 内置作品的配图 |
| `supabase/migrations/` | 数据库表、权限和图片存储桶的定义 |
| `serve.mjs` | 本地预览服务器 |

## 本地预览

```bash
node serve.mjs
```

然后打开 http://127.0.0.1:8420/ 。页面用了 ES 模块，直接双击 `index.html`（file:// 协议）打不开。

## 导入新创意

1. 打开 `https://works.sugarv.mom/#admin`，右上角会出现「管理员登录」。
2. 第一次用：填邮箱和密码，点「首次注册」，去邮箱点确认链接，回到本站登录。
3. 登录后如果显示「未授权」，把弹窗里的账号 ID 加进 `vault_admins` 表（让 Claude 来做，或在 Supabase SQL Editor 执行
   `insert into public.vault_admins (user_id) values ('<账号 ID>');`），刷新页面。
4. 成为管理员后，点右上角「＋ 导入」或最后那张「导入新创意」卡片：上传图片（自动压缩成 WebP，并从封面取主色）、填中英文案，保存即发布。
5. 详情弹窗里可以「编辑」或「删除」。取消勾选「发布」可以存成只有自己看得到的草稿。
6. 表单底部可以「从 JSON 导入」（一条会填进表单，多条直接批量导入）、「导出全部 JSON」备份，或下载 JSON 模板。

## 数据

- Supabase 项目 `usb-flip-game`，与日落柑橘港共用，本站的表都以 `vault_` 开头：`vault_ideas`（作品）、`vault_admins`（管理员）。
- 图片存在公开存储桶 `idea-vault`，单张上限 5 MB。
- 所有人只能读取已发布的作品；只有 `vault_admins` 里的账号能新增、修改、删除作品和上传图片。

## 部署

GitHub Pages，从 `main` 分支根目录发布。推送后等待 `pages build and deployment` 工作流成功。

自定义域名为 `works.sugarv.mom`，发布时保留根目录的 `CNAME` 文件。Spaceship 的 DNS 记录为 `CNAME works → sugarvei.github.io`，TTL 为 30 分钟。HTTPS 证书由 GitHub Pages 自动管理。

Supabase Auth 的 Redirect URLs 已添加 `https://works.sugarv.mom/`，供注册确认邮件返回本站。该 Supabase 项目与其他应用共用，调整回调地址时保留其他应用的配置。

新域名需要重新登录管理员账号。作品数据仍来自原 Supabase 项目；浏览器本地收藏、置顶和轻练记录按域名分别存储，不会自动从旧网址迁移。

## 卡片置顶

每张作品卡片都有图钉按钮，访客无需登录即可置顶或取消置顶。可同时置顶多张，最近置顶的卡片排在最前，取消后恢复原来的作品顺序；搜索、分类和收藏筛选仍然有效。

置顶偏好只保存在当前浏览器的 `vault-pins` 本地存储中，同一域名的其他标签页会同步更新。不同访客互不影响，不跨设备同步；清除站点数据会清除置顶选择。浏览器禁止保存时，本页仍可临时置顶。

## Sugar · 简历与求职管理

网站入口为 https://www.sugarv.mom/ ，源码为 https://github.com/SugarVei/sugar-job-system 。作品卡片包含总览、简历库和面试日历三张截图，来自该项目 README 的虚构演示数据；线上作品表和内置备用数据均收录该条目。

## 开源收藏与图片来源

- 交互背景沿用 Bencho Particles 的推开、冲击波和弹簧回弹机制（用户提供的 MIT 许可源码，[原站许可说明](https://bencho.dev/licence)），保留相关物理解释注释。粒子均匀铺满整个视口，滚动到页面任何位置仍有背景；首页、GPT-UI 设计画廊和 Muse-UI 设计画廊均接入。没有圆形等聚合轮廓，也不设人为帧率上限，每个可用的浏览器动画帧均可更新。保留静止休眠、后台及弹窗暂停；按钮、链接和手机滚动行为不变。背景色跟随各页面原有主题。

- Model 3 汽车拆解图谱：`assets/car-atlas-*.jpg` 为线上网页的真实运行截图，展示内置参考模型的拆解、装配和部件详情。该模型为简化展示，非原厂工程数据。
- Factory Anatomy：原作者 Senthee / 吴斌与协作助手，[原仓库](https://github.com/Sentheecode/factory-anatomy)。`assets/factory-anatomy-*.webp` 为原仓库的六张场景预览图，[MIT 许可](assets/licenses/factory-anatomy-MIT.txt)。
- Anatomy：原作者 Ryan / wheresryan22，[原仓库](https://github.com/wheresryan22/anatomy)。`assets/anatomy-skill-*.webp` 为原仓库的发动机、波纹水槽和旋钮示例截图，[MIT 许可](assets/licenses/anatomy-MIT.txt)。
- 上述两项在卡片介绍中署名原作者，详情中标注为开源收藏，访问入口保留原项目链接。
- 字体：中文为 MiSans（通过 jsDelivr 按需分片加载），西文为 Geist（`assets/fonts/Geist-Latin.woff2` 为拉丁字符子集，[OFL 许可](assets/licenses/geist-OFL.txt)）。

## 石间 · 磁盘空间

新增石间工具条目，包含石头 / 3D 热力柱 / 手机端的真实网页截图；在线体验为 https://sugarvei.github.io/shijian-stone-space/ ，源码及 Windows 便携包安装说明见 https://github.com/SugarVei/shijian-stone-space 。网页使用固定分类数据，桌面版扫描真实目录；安装包在仓库 Releases。

# 创意仓库 · Idea Vault

磨砂玻璃卡片风格的个人创意仓库，收着我做过的可交互网页作品。中英双语，深色主题。

线上地址：https://sugarvei.github.io/idea-vault/

## 结构

| 文件 | 作用 |
|---|---|
| `index.html` | 页面骨架 |
| `style.css` | 全部样式 |
| `app.js` | 渲染卡片、详情、筛选、语言切换，以及管理员登录和导入 |
| `config.js` | Supabase 地址和 publishable key（可公开，数据库有行级权限保护） |
| `data/seed.json` | 内置的六个作品；数据库连不上时用它显示 |
| `assets/` | 内置作品的配图 |
| `supabase/migrations/` | 数据库表、权限和图片存储桶的定义 |
| `serve.mjs` | 本地预览服务器 |

## 本地预览

```bash
node serve.mjs
```

然后打开 http://127.0.0.1:8420/ 。页面用了 ES 模块，直接双击 `index.html`（file:// 协议）打不开。

## 导入新创意

1. 打开 `https://sugarvei.github.io/idea-vault/#admin`，右上角会出现「管理员登录」。
2. 第一次用：填邮箱和密码，点「首次注册」，去邮箱点确认链接（确认后跳到的页面打不开也没关系），再回来登录。
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

GitHub Pages，从 `main` 分支根目录发布。推送到 `main` 后约 1 分钟生效。

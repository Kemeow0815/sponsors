# 💖 赞助支持

感谢所有支持本项目的朋友们！您的每一份支持都是我持续创作的动力。

---

## 🌐 在线访问

**本地测试：**
```bash
cd sponsor
python -m http.server 8080
```
访问 http://localhost:8080

---

## 🤝 如何成为赞助者

### 方式一：扫码支付
使用支付宝或微信扫描页面上的二维码进行赞助。

### 方式二：提交赞助信息
赞助后，您可以将自己的信息展示在赞助者列表中：

1. **Fork 本仓库**

2. **编辑 `data/sponsors/sponsors.json`**

   在 `sponsors` 数组中添加您的信息：
   ```json
   {
     "sponsors": [
       {
         "name": "您的昵称",
         "date": "2025-01-20",
         "amount": "¥100",
         "avatar": "https://example.com/avatar.jpg"
       }
     ]
   }
   ```

3. **提交 Pull Request**

   系统会自动检测并合并您的 PR。

### 数据格式说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | ✅ | 您的昵称或姓名 |
| `date` | string | ✅ | 赞助日期，格式 `YYYY-MM-DD` |
| `amount` | string | ✅ | 赞助金额，如 `¥50`、`$10` |
| `avatar` | string | ❌ | 头像图片 URL |

---

## ⚙️ 自动化工作流

### PR 自动处理 (`auto-pr.yml`)

当您提交 PR 时，系统会：

1. ✅ 验证文件格式（必须是有效的 JSON）
2. ✅ 检查数据结构（必须包含 `sponsors` 数组）
3. ✅ 校验必填字段（name、date、amount）
4. ✅ 检测头像链接可访问性
5. ✅ 自动合并通过的 PR

### 定期链接检查 (`check-links.yml`)

每 30 天自动运行：

1. 检查所有赞助者头像链接
2. 自动移除不可达的条目
3. 更新 `sponsors.json` 文件

---

## 📁 项目结构

```
sponsor/
├── 📄 index.html              # 主页面
├── 📄 README.md               # 本文件
├── 📁 data/
│   └── 📁 sponsors/
│       └── 📄 sponsors.json   # 赞助者数据
├── 📁 images/
│   ├── 🖼️ alipay.avif        # 支付宝收款码
│   └── 🖼️ weixin.avif        # 微信收款码
├── 📁 js/
│   └── 📄 lightbox.js        # 图片灯箱插件
└── 📁 .github/
    └── 📁 workflows/
        ├── 📄 auto-pr.yml     # PR 自动处理
        └── 📄 check-links.yml # 链接检查
```

---

## ✨ 功能特性

- 🎨 **明暗主题** - 支持深色/浅色模式切换
- 📱 **响应式设计** - 完美适配手机、平板、电脑
- 🔍 **灯箱查看** - 点击二维码可放大查看
- 🤖 **全自动流程** - PR 自动检测、合并、链接检查
- 🛡️ **安全防护** - SSRF 保护，防止恶意链接

---

## 🔒 安全说明

所有 URL 都会经过安全检查：
- 仅允许 `http://` 和 `https://` 协议
- 禁止访问本地地址（localhost、127.0.0.1）
- 禁止访问私有 IP 段

---

## 📝 许可证

MIT License © 2025

---

**感谢每一位赞助者的支持！** ❤️

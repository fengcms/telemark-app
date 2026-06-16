# 📱 Telemark 外呼助手（Mobile App）

一款基于 **Capacitor + React + TypeScript** 的电话销售外呼 App，专为销售团队设计，用于高效完成客户拨打、通话反馈与销售跟进闭环。

---

## 🚀 项目简介

Telemark 外呼助手是一个移动端销售执行工具，核心目标是：

> 🎯 让销售人员只做三件事：看客户 → 打电话 → 回填结果

系统围绕“外呼任务流”设计，而不是传统 CRM。

---

## 🧠 核心业务流程

```
登录
  ↓
待拨客户列表（My Customers）
  ↓
点击拨打（系统电话）
  ↓
通话结束
  ↓
反馈 Bottom Sheet
  ↓
提交通话结果（call report）
  ↓
客户进入历史列表
  ↓
今日战报更新
```

---

## 🏗 技术架构

### 前端技术栈

- Vite
- React 19
- TypeScript
- Capacitor（iOS / Android）
- TanStack Query（数据请求）
- React Router
- Tailwind CSS
- Lucide React
- Shadcn UI 风格组件
- Biome（代码格式化）

---

## 📦 项目结构建议

```
src/
 ├── api/                # API 封装
 ├── components/        # 通用组件
 ├── pages/             # 页面
 ├── hooks/             # hooks
 ├── store/             # auth 状态
 ├── utils/             # 工具函数
 ├── routes/            # 路由
 └── mobile/            # Capacitor 相关
```

---

## 🔌 后端 API（唯一数据源）

```
http://localhost:8787
```

API 文档：

👉 docs/api.md

⚠️ 规则：

- 不允许臆造接口
- 所有字段必须来自 API 文档
- 全部使用 camelCase

---

## 🔐 登录与认证

### Token

- accessToken：12小时
- refreshToken：14天

存储：

```
localStorage
```

请求头：

```
Authorization: Bearer <accessToken>
```

---

## 🔑 密码规则

所有密码必须在前端进行：

```
SHA-256(明文密码)
```

适用于：

- 登录
- 创建员工
- 修改密码
- 重置密码

---

## 👤 角色系统

| role | 说明 |
|------|------|
| 1 | 超级管理员 |
| 2 | 经理 |
| 3 | 普通员工 |

---

## 📞 客户状态

| status | 说明 |
|--------|------|
| 0 | 未拨打 |
| 1 | 已接听 |
| 2 | 无人接听 |
| 3 | 拒接 |
| 4 | 空号停机 |

---

## 📱 核心页面

### 1️⃣ 登录页

- 账号 / 密码
- SHA-256 加密
- 登录成功跳转首页

---

### 2️⃣ 待拨客户（核心）

```
GET /api/my-customers
```

功能：

- 展示待拨客户
- 一键拨打
- 自动进入反馈流程

---

### 3️⃣ 通话反馈 Bottom Sheet

```
POST /api/calls/report
```

字段：

- callResult
- duration
- remark
- clientRequestId（幂等）
- startedAt / endedAt

---

### 4️⃣ 今日战报

```
GET /api/my-summary
```

展示：

- 今日拨打数
- 接通数
- 通话时长
- 首次拨打时间
- 最后拨打时间

---

### 5️⃣ 历史客户

```
GET /api/my-customers/history
```

展示：

- 已拨客户
- 状态分类
- 意向客户
- 备注

---

### 6️⃣ 我的页面

- 用户信息
- 修改密码
- 退出登录

---

## 📊 查询规范

### 分页

```
page 从 0 开始
pagesize 默认 10，最大 100
```

### 排序

```
sort=字段（升序）
sort=-字段（降序）
```

### like 查询

```
直接传字符串，不需要拼 %
```

---

## ⚙️ Capacitor

支持：

- iOS
- Android

运行：

```bash
pnpm build
npx cap sync
npx cap run ios
npx cap run android
```

---

## 🎨 UI 风格

- 清新现代
- 卡片布局
- 大按钮（适合外呼）
- Bottom Sheet 反馈
- 支持暗黑模式
- Lucide 图标

---

## ⚠️ 禁止事项

- ❌ 不允许臆造 API
- ❌ 不允许保存明文密码
- ❌ 不允许绕过通话反馈
- ❌ 不允许跳过客户状态更新
- ❌ 不允许一次性生成完整 App

---

## 🧭 开发原则（AI + Codex）

- UI 来自 Stitch
- API 来自 backend docs
- 必须分阶段开发
- React Query 管理数据
- 所有操作必须可追踪

---

## 🚀 开发目标

最终交付：

> 一个可用于真实电话销售团队的 iOS / Android 外呼 App

核心能力：

- 客户拨打
- 通话反馈
- 自动记录
- 今日战报
- 历史客户
- 防重复提交（幂等）

---

## 📎 API 文档

👉 docs/api.md（唯一真实来源）
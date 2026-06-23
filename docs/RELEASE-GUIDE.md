# 📦 Release APK 打包指南

## 🔐 重要提示

**签名密钥文件 (`telemark-release.keystore`) 是你应用的"身份证"！**

⚠️ **请务必：**
1. ✅ 妥善保管 `telemark-release.keystore` 文件
2. ✅ 牢记设置的密码
3. ✅ 将其备份到安全位置（云盘、U盘等）
4. ❌ **不要**提交到 Git（已添加到 .gitignore）
5. ❌ **不要**丢失！丢失后无法更新已发布的应用

---

## 🚀 快速开始

### 第 1 步：生成签名密钥（只需执行一次）

```bash
cd /Users/fungleo/Sites/MeiGeZhuangXiu/telemark-app

# 生成签名密钥库
keytool -genkeypair -v \
  -keystore android/telemark-release.keystore \
  -alias telemark \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass 你的密码 \
  -keypass 你的密码 \
  -dname "CN=Haige Telemark, OU=Dev, O=Haige, L=City, ST=State, C=CN"
```

**参数说明：**
- `-keystore`: 密钥库文件名和位置
- `-alias`: 密钥别名（用于标识）
- `-validity`: 有效期（天）10000天 ≈ 27年
- `-storepass / -keypass`: **请设置强密码并牢记！**
- `-dname`: 证书信息（可自定义）

---

### 第 2 步：修改签名配置中的密码

编辑 [android/signing.gradle](android/signing.gradle)：

```gradle
android {
    signingConfigs {
        release {
            storeFile file('telemark-release.keystore')
            storePassword '你的密码'        // ← 改成你的密码
            keyAlias 'telemark'
            keyPassword '你的密码'          // ← 改成你的密码
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true              // 开启代码混淆
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

> 💡 **安全建议**：也可以使用环境变量，避免密码明文写在文件中：
> ```bash
> export KEYSTORE_PASSWORD=你的密码
> export KEY_PASSWORD=你的密码
> ```

---

### 第 3 步：打包 Release APK

```bash
cd /Users/fungleo/Sites/MeiGeZhuangXiu/telemark-app

# 一键打包 Release APK
pnpm run release
```

这个命令会自动执行：
1. ✅ TypeScript 编译检查
2. ✅ Vite 构建生产版本
3. ✅ 同步到 Android 项目
4. ✅ 编译签名的 Release APK

---

## 📋 可用的命令

| 命令 | 功能 | 使用场景 |
|------|------|---------|
| `pnpm run apk` | 编译 Debug APK | 开发测试 |
| `pnpm run release` | **编译 Release APK** | **正式发布** ⭐ |
| `pnpm run install` | 安装 Debug 版本 | 开发调试 |
| `pnpm run install-release` | 安装 Release 版本 | 测试生产版本 |
| `pnpm run adb` | 重启 ADB 服务 | 设备连接问题 |

---

## 📂 输出位置

### Debug APK（开发用）
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Release APK（发布用）
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## 🔍 Debug vs Release 对比

| 特性 | Debug | Release |
|------|-------|---------|
| **签名** | Debug 签名 | **正式签名** ✅ |
| **代码混淆** | 关闭 | **开启** ✅ |
| **优化级别** | 无 | **最大优化** ✅ |
| **文件大小** | 较大 | **较小** ✅ |
| **性能** | 一般 | **最佳** ✅ |
| **用途** | 开发测试 | **发布上线** |

---

## 📱 安装到手机测试

```bash
# 安装 Release 版本
pnpm run install-release

# 或者手动安装
adb install android/app/build/outputs/apk/release/app-release.apk
```

---

## 🎯 发布到应用商店

Release APK 可以直接上传到：

### 国内应用商店
- **应用宝** (腾讯)
- **华为 AppGallery**
- **小米应用商店**
- **OPPO/ vivo 应用商店**
- **百度手机助手**
- **阿里应用分发平台**

### Google Play（如需要）
需要额外进行 **AAB (Android App Bundle)** 格式打包。

---

## ⚙️ 高级配置（可选）

### 1. 更新版本号

编辑 [android/app/build.gradle](android/app/build.gradle)：

```gradle
defaultConfig {
    versionCode 2           // 每次发布 +1
    versionName "1.0.1"     // 版本号
}
```

### 2. 配置 ProGuard 规则（混淆规则）

编辑 [android/app/proguard-rules.pro](android/app/proguard-rules.pro)：

```proguard
# 保持 React 相关类不混淆
-keep class com.haigetelemark.app.** { *; }
-dontwarn com.facebook.react.**
```

### 3. 多渠道打包（可选）

如果需要在多个应用商店发布不同版本：

```gradle
buildTypes {
    release {
        // ... 原有配置
    }

    yingyongbao {
        initWith release
        applicationIdSuffix ".yingyongbao"
    }

    huawei {
        initWith release
        applicationIdSuffix ".huawei"
    }
}
```

---

## 🛠️ 故障排查

### 问题 1：签名密码错误

```
Failed to read key telemark from store "...keystore": Keystore was tampered with, or password was incorrect
```

**解决**：检查 [signing.gradle](android/signing.gradle) 中的密码是否正确

### 问题 2：找不到 keystore 文件

```
Keystore file not found for signing config 'release'
```

**解决**：确认 `android/telemark-release.keystore` 文件存在

### 问题 3：版本冲突

```
INSTALL_FAILED_VERSION_DOWNGRADE
```

**解决**：确保新版本的 `versionCode` 大于旧版本

---

## 💡 最佳实践

### ✅ 发布前检查清单

- [ ] 已更新版本号 (`versionCode`, `versionName`)
- [ ] 已在真机上测试 Release 版本
- [ ] 已备份签名密钥文件
- [ ] 已记录密码到安全的地方
- [ ] 已清理调试代码（如之前加的 debug 按钮）
- [ ] 已运行 lint 检查：`pnpm run lint`
- [ ] 已运行类型检查：`pnpm run check`

### ✅ 安全建议

1. **使用不同的密码**：storePassword 和 keyPassword 可以不同
2. **使用环境变量**：避免密码明文存储
3. **定期备份**：将 keystore 备份到多个安全位置
4. **团队协作**：由专人保管密钥，或使用签名服务

---

## 📞 需要帮助？

如果遇到问题：
1. 检查上面的故障排查部分
2. 运行 `./gradlew assembleRelease --stacktrace` 查看详细错误
3. 查看官方文档：https://developer.android.com/studio/publish

---

**祝你发布顺利！🎉**

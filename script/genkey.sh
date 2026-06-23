cd /Users/fungleo/Sites/MeiGeZhuangXiu/telemark-app

# 生成签名密钥库
keytool -genkeypair -v \
  -keystore android/telemark-release.keystore \
  -alias telemark \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass 123456 \
  -keypass 123456 \
  -dname "CN=Haige Telemark, OU=Dev, O=Haige, L=City, ST=State, C=CN"
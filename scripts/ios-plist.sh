#!/usr/bin/env bash
# 許可の説明文・表示名・全画面表示を Info.plist に入れる（npx cap add ios の後に実行）
set -euo pipefail
P="ios/App/App/Info.plist"
PB=/usr/libexec/PlistBuddy
setkey(){ $PB -c "Set :$1 $2" "$P" 2>/dev/null || $PB -c "Add :$1 $3 $2" "$P"; }
setkey CFBundleDisplayName "Cockpit" string
setkey NSLocationWhenInUseUsageDescription "現在地を地図に表示し、速度・進路の計算とナビの案内に使います。" string
setkey NSLocationAlwaysAndWhenInUseUsageDescription "現在地を地図に表示し、速度・進路の計算とナビの案内に使います。アプリを開いている間だけ使います。" string
setkey NSLocationAlwaysUsageDescription "現在地を地図に表示し、ナビの案内に使います。アプリを開いている間だけ使います。" string
setkey NSMotionUsageDescription "ジャイロコンパスと姿勢指示器（傾き）の表示に使います。" string
setkey NSMicrophoneUsageDescription "「ナビ、〜」などの声の指示と、洗車記録の音声入力に使います。" string
setkey NSSpeechRecognitionUsageDescription "声の指示を文字にして操作するために使います。" string
setkey ITSAppUsesNonExemptEncryption false bool
setkey UIStatusBarHidden true bool
setkey UIViewControllerBasedStatusBarAppearance false bool
setkey UIRequiresFullScreen true bool
echo "Info.plist updated"

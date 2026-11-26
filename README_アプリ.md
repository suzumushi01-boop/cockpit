# Cockpit Nav iPhoneアプリ版（TestFlight）

アプリは GitHub Pages の index.html を読み込んで動く。**index.html を更新すれば、アプリを作り直さなくても中身が新しくなる。**
アプリ版で増えること：GPSがiPhoneの位置情報で確実に動く／音楽を小さくして声で読み上げ、終わったら元の音量に戻る／画面を消さない／日没後に画面の明るさを65%、昼は最大にする。

| 場所 | 役目 |
|---|---|
| index.html | 本体（Webでもアプリでも同じ） |
| capacitor.config.json | アプリの設定（バンドルID jp.tanaka.cockpitnav、読み込むURL） |
| codemagic.yaml | Codemagic でビルドして TestFlight に送る |
| scripts/ios-plist.sh | 位置情報・モーション・マイクの許可の説明文 |
| assets/ | アイコンと起動画面 |
| www/index.html | 電波がない時に出す画面 |

## 手順（洗車OODA と同じ流れ）
1. developer.apple.com → Certificates, Identifiers & Profiles → Identifiers → ＋ → App IDs → App → Bundle ID「jp.tanaka.cockpitnav」（Explicit）を登録
2. 同じ画面の Profiles → ＋ → App Store Connect → 上の App ID → 洗車OODA と同じ Distribution 証明書 → 名前「Cockpit Nav AppStore」で作成
3. App Store Connect → アプリ → ＋ 新規App：iOS、名前（例「Cockpit Nav Suzu」、ほかと重ならない名前）、日本語、バンドルID jp.tanaka.cockpitnav、SKU「cockpitnav」
4. Codemagic → Team settings → Code signing identities → iOS provisioning profiles → Fetch profiles で 2 のプロファイルを取り込む
5. Codemagic → Add application → GitHub → cockpit を選ぶ → codemagic.yaml を使う → ワークフロー「Cockpit Nav iOS (TestFlight)」を Start
6. 20分ほどで TestFlight に届く。App Store Connect → TestFlight → 内部テストのグループに自分を入れる → iPhone の TestFlight アプリからインストール

## 注意
- 内部テスト（自分だけ）は審査なしで使える。ビルドは90日で期限切れになるので、その前に Codemagic でもう一度 Start
- アプリ版の保存データ（お気に入り・抜け道・走行履歴）は Safari 版とは別。OneDrive 同期か書き出し→読み込みで移す

# Salary Tracker

Salary Tracker は、macOS のメニューバーに常駐し、PC の稼働時間に応じて「稼いだ給料」をリアルタイムで表示するアプリケーションです。
この機能は、あなたの仕事への集中力をより高めるかもしれませんし、時間に価値を感じられるかもしれません。そうでないかもしれませんが、全てはあなた次第です。

## 機能

-   **月給設定**: 設定画面から月給を設定できます。
-   **稼働時間に応じた給料計算**: PC のアクティブな稼働時間（スリープ時間を除く）に基づいて、現在の稼いだ給料を計算し表示します。
-   **リセット機能**: メニューから、給料のカウントをリセットできます。
-   **自動月間労働時間計算**: その月の平日数に基づいて、月間労働時間を自動計算します。手動での設定も可能です。
-   **プライバシー保護**: 月給入力欄は、普段はアスタリスクで隠され、入力時のみ表示されます。

## 技術スタック

-   TypeScript
-   Electron

## インストール

1.  リポジトリをクローンします。
    ```bash
    git clone https://github.com/your-username/salary_tracker.git
    cd salary_tracker
    ```
2.  依存関係をインストールします。
    ```bash
    npm install
    ```
3.  アプリケーションをビルドします。
    ```bash
    npm run make
    ```
    ビルドされたアプリケーションは `out/make` ディレクトリ以下に生成されます。macOS の場合、`out/make/zip/darwin/x64/Salary Tracker.app` のようなパスに `.app` ファイルが生成されます。
4.  生成された `.app` ファイルを `Applications` フォルダにドラッグ＆ドロップしてインストールします。

## 開発環境のセットアップ

1.  リポジリをクローンします。
    ```bash
    git clone https://github.com/your-username/salary_tracker.git
    cd salary_tracker
    ```
2.  依存関係をインストールします。
    ```bash
    npm install
    ```

## アプリケーションの実行

開発モードでアプリケーションを実行します。
```bash
npm start
```

## ビルド

アプリケーションをパッケージ化します。
```bash
npm run make
```

## テストの実行

ユニットテストを実行します。
```bash
npm test
```

## 貢献

バグ報告や機能改善の提案は、GitHub の Issues または Pull Request で歓迎します。

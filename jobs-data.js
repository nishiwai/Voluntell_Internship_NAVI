// ==========================================================
// 募集データ（募集一覧ページで使います）
//
// 【募集を追加するとき】
//   下の { ... }, のかたまりを1つコピーして、内容を書き換えるだけです。
//   並び順は自動で「初回公開日が新しい順」になります。
//   （並べ替えは、ここに書く順番とは関係ありません）
//
// 【各項目の意味】
//   id           募集ID（半角英数字とハイフン。申込みでどの募集かを見分けるために使います。重複させない）
//   company      企業名
//   logoText     ロゴの代わりに表示する1文字
//   logoUrl      ロゴ画像のファイル名（無ければ "" のままでOK）
//   title        募集タイトル
//   industry     業種（例: IT・ソフトウェア）        ※今は表示しません。将来の絞り込み用
//   jobCategory  職種カテゴリー（例: IT・Web）       ※今は表示しません。将来の絞り込み用
//   targets      対象学生（複数OK）
//   prefecture   都道府県
//   city         市区町村
//   workStyle    現地／オンライン
//   period       インターン期間
//   publishedAt  初回公開日（この日付で並びます。編集しても変えないでください）
//   updatedAt    更新日（内容を正式に更新した日。今は並び順には使いません）
//   deadline     応募締切
//   detailUrl    詳細ページのファイル名（まだ無い場合は "#"）
//
// 日付は 2026-11-30 のように「年-月-日」で書きます。
// 業種・職種カテゴリーの名前は仮です。あとから自由に書き換えられます。
// ==========================================================

const JOBS = [
  {
    id: "aoi-technology",
    company: "株式会社アオイテクノロジー",
    logoText: "ア",
    logoUrl: "",
    title: "Webサービスの企画・開発インターン",
    industry: "IT・ソフトウェア",
    jobCategory: "IT・Web",
    targets: ["大学生", "専門学生"],
    prefecture: "愛知県",
    city: "春日井市",
    workStyle: "現地",
    period: "2週間～1か月",
    publishedAt: "2026-09-20",
    updatedAt: "2026-09-20",
    deadline: "2026-11-30",
    detailUrl: "detail.html"
  },
  {
    id: "sakura",
    company: "株式会社サクラ",
    logoText: "サ",
    logoUrl: "",
    title: "マーケティング・広報インターン",
    industry: "サービス",
    jobCategory: "企画・マーケティング・広報",
    targets: ["大学生", "短大生", "専門学生"],
    prefecture: "愛知県",
    city: "名古屋市",
    workStyle: "現地・オンライン",
    period: "1か月～3か月",
    publishedAt: "2026-09-15",
    updatedAt: "2026-09-15",
    deadline: "2026-12-15",
    detailUrl: "#"
  },
  {
    id: "tokai-seisaku",
    company: "東海製作株式会社",
    logoText: "東",
    logoUrl: "",
    title: "ものづくり現場の職業体験インターン",
    industry: "メーカー",
    jobCategory: "ものづくり・技術",
    targets: ["高校生", "大学生", "専門学生"],
    prefecture: "愛知県",
    city: "春日井市",
    workStyle: "現地",
    period: "3日間～1週間",
    publishedAt: "2026-09-10",
    updatedAt: "2026-09-10",
    deadline: "2026-11-20",
    detailUrl: "#"
  },
  {
    id: "next-design",
    company: "株式会社ネクストデザイン",
    logoText: "ネ",
    logoUrl: "",
    title: "地域課題に取り組むプロジェクトインターン",
    industry: "サービス",
    jobCategory: "企画・まちづくり",
    targets: ["大学生", "短大生"],
    prefecture: "愛知県",
    city: "名古屋市",
    workStyle: "現地・オンライン",
    period: "1週間～1か月",
    publishedAt: "2026-09-05",
    updatedAt: "2026-09-05",
    deadline: "2026-12-05",
    detailUrl: "#"
  }
];

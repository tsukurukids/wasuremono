// --- 🪄 魔法の準備 (Version 1.1 - Reset Magic!) ---
console.log("script.jsが読み込まれました！");
// エラーが起きたら、真っ白にならずに教えてくれる「お助け隊」を用意したよ！
window.onerror = function (msg, url, line, col, error) {
    const root = document.getElementById('root');
    if (root) {
        root.innerHTML = `<div style="padding:20px; color:#e11d48; text-align:center;"><h2>エラーをみつけたよ！</h2><p>${msg}</p></div>`;
    }
    return false;
};

let firebaseApp, auth, db, appId;
try {
    if (typeof firebase !== 'undefined') {
        const config = (typeof __firebase_config !== 'undefined' && __firebase_config) ? JSON.parse(__firebase_config) : null;
        if (config) {
            firebaseApp = firebase.initializeApp(config);
            auth = firebase.auth();
            db = firebase.firestore();
            appId = (typeof __app_id !== 'undefined') ? __app_id : 'default-app-id';
        }
    }
} catch (e) {
    console.warn("Firebase はスキップするね！");
}

// --- 🎨 アイコンを出す魔法の部品 ---
const Icon = ({ name, className, size = 20 }) => {
    /* 💡 アイコンが読みこめないときのために、かわりの「絵文字」を準備しておくよ！ */
    const fallbacks = {
        Briefcase: '💼', Plane: '✈️', Music: '🎵', Plus: '➕',
        CheckCircle: '✅', Circle: '⭕', Gamepad2: '🎮', Globe: '🌐',
        Cloud: '☁️', Medal: '🏅', Clock: '⏰', X: '❌',
        Ticket: '🎫', Edit3: '📝', RefreshCw: '🔄', Dumbbell: '💪', Share: '🔗'
    };

    try {
        // いろいろな道具箱（LucideReactなど）の中を探してみるよ
        const lib = window.LucideReact || window.Lucide || window.lucide;
        const IconComponent = lib ? lib[name] : null;

        // もしアイコンが見つからなかったり、壊れていたりしたら絵文字を出すよ
        if (!IconComponent || typeof IconComponent !== 'function') {
            return React.createElement('span', {
                className: className,
                style: { fontSize: `${size}px`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }
            }, fallbacks[name] || '❓');
        }
        return React.createElement(IconComponent, { className, size, strokeWidth: 3 });
    } catch (e) {
        console.warn("アイコン表示で小さなエラーがあったよ:", e);
        return React.createElement('span', null, fallbacks[name] || '⚠️');
    }
};

// --- 📝 おなまえやランクの計算 ---
function getRankName(totalLevel, lang) {
    if (lang === 'ja') {
        if (totalLevel >= 300) return "宇宙のパッキング王 🪐";
        if (totalLevel >= 150) return "パッキングの神様 🌌";
        return "準備の見習い 🌱";
    }
    if (lang === 'ryu') {
        if (totalLevel >= 300) return "うちなーパッキングぬ主 🪐";
        return "修行中のわらびー 🌱";
    }
    return "Master Packer 🌟";
}

const getEmojiAvatarUrl = (emoji) => {
    // 絵文字を安全にURLに変換する魔法だよ
    const svg = `%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='85'%3E${encodeURIComponent(emoji)}%3C/text%3E%3C/svg%3E`;
    return `data:image/svg+xml,${svg}`;
};
const DEFAULT_AVATAR = getEmojiAvatarUrl("🐧");

const INITIAL_CATEGORIES = [{ id: 'work' }, { id: 'travel' }, { id: 'gym' }];

const REWARD_POOL = [
    "💎 伝説 of ダイヤ", "👑 黄金の冠", "🐉 ドラゴンの卵", "⭐ スーパースター",
    "🍦 無限アイス", "🎮 幻 of ゲーム機", "🚀 銀河ロケット", "🐱 幸運の招き猫",
    "🌈 虹色バッジ", "🍀 四つ葉のクローバー", "🦄 ユニコーンの角", "🍕 黄金ピザ",
    "🦉 知恵のフクロウ", "🍄 魔法のキノコ", "🍫 溶けないチョコ", "🗡️ 勇者のつるぎ",
    "🎻 魔法のバイオリン", "🌙 三日月のランプ", "🏰 雲の上の城", "🧸 命のぬいぐるみ",
    "🎀 友情のリボン", "🎐 風の鈴", "🐳 空飛ぶ クジラ", "🌵 砂漠のバラ",
    "🐚 歌う貝殻", "🍯 黄金のはちみつ", "🔮 未来の水晶", "⚡ いなずまの杖",
    "🪞 真実の鏡", "🧚 妖精の粉"
];

const COMPLIMENTS = ["ナイス！✨", "今日も素敵！💖", "最高だよ！🌟", "天才だね！🎊", "準備バッチリ！👌", "その調子！🔥", "えらすぎるよ！👏", "準備の天才だね！🎨", "今日もキラキラしてるよ！✨"];

const OMIKUJI_RESULTS = [
    { name: "✨ 超大吉 ✨", msg: "今日は最高の一日になるよ！何をやってもうまくいくかも！", weight: 5 },
    { name: "🌟 大吉 🌟", msg: "とってもいい運勢！忘れ物ナシで完璧だね！", weight: 20 },
    { name: "😊 中吉 😊", msg: "いいことがありそう！笑顔で過ごしてね。", weight: 30 },
    { name: "🎵 小吉 🎵", msg: "ハッピーな音が見つかるかも。楽しく歩こう！", weight: 25 },
    { name: "🍀 吉 🍀", msg: "ふつうが一番！いつも通りで大丈夫だよ。", weight: 20 }
];
const LUCKY_ITEMS = ["🍏 りんご", "✏️ えんぴつ", "👟 スニーカー", "🌈 にじ", "🍦 アイス", "🐱 ねこ", "⚽ ボール", "🎨 パレット", "🎒 リュック", "🍬 あめ"];

const TRANSLATIONS = {
    ja: { appTitle: "持ち物チェック 😊", progress: "じゅんびのしんちょく", work: "学校 🏫", travel: "旅行 ✈️", gym: "ダンス 💃", placeholder: "なにをもっていく？ ➕", finalCheck: "さいごのチェックへ 🚀", fingerCheck: "👈 ゆびさし確認！", go: "いってきます！ 👋", reset: "ぜんぶリセット", historyTitle: "削除履歴（ゴミ箱）", historyDesc: "ここにあるアイテムは完全に消すことはできません。必要なときは「元に戻す」ボタンを押してね。", restore: "元に戻す", noHistory: "まだ履歴はありません", zukanTitle: "おたから図鑑 💎", currentStreak: "現在のれんぞく", highScore: "最高スコア", days: "日", points: "pt", collected: "集めたおたから", avatarSet: "アバター設定", changeEmoji: "好きな絵文字に変える", uploadPhoto: "写真をのせる", backToPenguin: "🐧 戻す", gameTitle: "1日1回おたから修行", timeUp: "タイムアップ！⏰", gameEndDesc: "また明日も修行しようね！✨", backToPrep: "準備にもどる！ 👌", motivation: "やる気 🔥", important: "必須！", nameLabel: "おなまえ", langName: "🇯🇵 日本語", loading: "読み込み中...", gameOver: "ゲーム終了！", dailyLimit: "今日はもう遊んだよ", playNow: "修行を開始！", disclaimer: "言語はAIが作っているので、間違えている可能性があるよ💦", secretTitle: "虹色パーティー発動！🌈", secretMsg: "おめでとう！隠しコマンドを見つけたね！今日だけは特別にもう1回修行できるよ！" },
    en: { appTitle: "Checklist 😊", progress: "Progress", work: "School 🏫", travel: "Travel ✈️", gym: "Gym 🏃", placeholder: "What to bring? ➕", finalCheck: "Final Check! 🚀", fingerCheck: "👈 Double Check!", go: "I'm off! 👋", reset: "Reset All", historyTitle: "Delete History", historyDesc: "Items here cannot be deleted. Press 'Restore' to bring them back.", restore: "Restore", noHistory: "No history yet", zukanTitle: "Collection 💎", currentStreak: "Current Streak", highScore: "High Score", days: "Days", points: "pt", collected: "Treasures Found", avatarSet: "Avatar Settings", changeEmoji: "Change Emoji", uploadPhoto: "Upload Photo", backToPenguin: "🐧 Back", gameTitle: "Daily Challenge", timeUp: "Time's Up! ⏰", gameEndDesc: "Great job! See you tomorrow! ✨", backToPrep: "Back to Prep! 👌", motivation: "Motivation 🔥", important: "Must!", nameLabel: "Name", langName: "🇺🇸 English", loading: "Loading...", gameOver: "Game Over!", dailyLimit: "Played today", playNow: "Start Training", disclaimer: "Languages are AI-made, may contain errors 💦", secretTitle: "Rainbow Party! 🌈", secretMsg: "Congrats! Secret command found! You can play once more today!" },
    en_gb: { appTitle: "My List 😊", progress: "Progress", work: "School 🏫", travel: "Travel ✈️", gym: "Sport 🏃", placeholder: "What to pack? ➕", finalCheck: "Final Check! 🚀", fingerCheck: "👈 Double Check!", go: "I'm off! 👋", reset: "Reset All", historyTitle: "Deleted Items", historyDesc: "Items here cannot be permanently removed. Press 'Restore' to bring them back.", restore: "Restore", noHistory: "No history yet", zukanTitle: "Treasures 💎", currentStreak: "Current Streak", highScore: "High Score", days: "Days", points: "pt", collected: "Found Treasures", avatarSet: "Avatar", changeEmoji: "Change Emoji", uploadPhoto: "Upload Photo", backToPenguin: "🐧 Back", gameTitle: "Daily Training", timeUp: "Time's Up! ⏰", gameEndDesc: "One minute is over! Back to work! ✨", backToPrep: "Let's Go! 👌", motivation: "Motivation 🔥", important: "Must!", nameLabel: "Name", langName: "English (UK)", loading: "Loading...", gameOver: "End!", dailyLimit: "Played today", playNow: "Start Training", disclaimer: "Languages are AI-generated and might have mistakes 💦", secretTitle: "Rainbow Party! 🌈", secretMsg: "Congrats! Secret command found! Extra training enabled!" },
    ru: { appTitle: "Мой список 😊", progress: "Прогресс", work: "Школа 🏫", travel: "Поездка ✈️", gym: "Спорт 🏃", placeholder: "Что взять? ➕", finalCheck: "Проверка! 🚀", fingerCheck: "👈 Проверь еще раз!", go: "Я пошел! 👋", reset: "Сброс", historyTitle: "История", restore: "Вернуть", noHistory: "Пусто", zukanTitle: "Сокровища 💎", currentStreak: "Серия", highScore: "Рекорд", days: "дн.", points: "очк.", collected: "Собрано", avatarSet: "Аватар", changeEmoji: "Изменить", uploadPhoto: "Загрузить", backToPenguin: "🐧 Назад", gameTitle: "Тренировка дня", timeUp: "Время!⏰", gameEndDesc: "До завтра! ✨", backToPrep: "Готово! 👌", motivation: "Драйв 🔥", important: "Важно!", nameLabel: "Имя", langName: "Русский", loading: "Загрузка...", gameOver: "Финиш!", dailyLimit: "Уже играли", playNow: "Начать", disclaimer: "Языки созданы ИИ, возможны ошибки 💦", secretTitle: "Радужный режим! 🌈", secretMsg: "Поздравляем! Вы нашли секретный код! Можно сыграть еще раз!" },
    af: { appTitle: "Kontrolys 😊", progress: "Vordering", work: "Skool 🏫", travel: "Reis ✈️", gym: "Sport 🏃", placeholder: "Wat om te neem? ➕", finalCheck: "Finale kontrole! 🚀", fingerCheck: "👈 Dubbel kontrole!", go: "Ek gaan nou! 👋", reset: "Herstel alles", historyTitle: "Geskiedenis", restore: "Herstel", noHistory: "Geen geskiedenis", zukanTitle: "Skatkis 💎", currentStreak: "Reeks", highScore: "Beste", days: "Dae", points: "pt", collected: "Gekollekteer", avatarSet: "Avatar", changeEmoji: "Verander", uploadPhoto: "Laai op", backToPenguin: "🐧 Terug", gameTitle: "Daaglikse Oefening", timeUp: "Tyd is om!⏰", gameEndDesc: "Sien jou môre! ✨", backToPrep: "Verstaan! 👌", motivation: "Gees 🔥", important: "Moet!", nameLabel: "Naam", langName: "Afrikaans", loading: "Laai tans...", gameOver: "Klaar!", dailyLimit: "Reeds gespeel", playNow: "Begin", disclaimer: "Tale word deur KI gegenereer, foute is moontlik 💦", secretTitle: "Reënboog-partytjie! 🌈", secretMsg: "Geluk! Jy het the geheime kode gevind! Jy kan wieder speel!" },
    uk: { appTitle: "Мій список 😊", progress: "Прогрес", work: "Школа 🏫", travel: "Подорож ✈️", gym: "Спорт 🏃", placeholder: "Що взяти? ➕", finalCheck: "Перевірка! 🚀", fingerCheck: "👈 Перевір ще раз!", go: "Я пішов! 👋", reset: "Скинути все", historyTitle: "Видалене", restore: "Повернути", noHistory: "Порожньо", zukanTitle: "Скарби 💎", currentStreak: "Серія", highScore: "Рекорд", days: "дн.", points: "очк.", collected: "Зібрано", avatarSet: "Аватар", changeEmoji: "Змінити", uploadPhoto: "Завантажити", backToPenguin: "🐧 Назад", gameTitle: "Тренировка дня", timeUp: "Час вийшов!⏰", gameEndDesc: "До завтра! ✨", backToPrep: "Готово! 👌", motivation: "Запал 🔥", important: "Важливо!", nameLabel: "Ім'я", langName: "Українська", loading: "Завантаження...", gameOver: "Кінець!", dailyLimit: "Вже грали сьогодні", playNow: "Почати", disclaimer: "Мови створені ШІ, можливі помилки 💦", secretTitle: "Райдужна вечірка! 🌈", secretMsg: "Вітаємо! Ви знайшли секретний код! Можна ще раз потренуватися!" },
    ryu: { appTitle: "持ちむぬちぇっかー 😊", progress: "ちむぐくるしんちょく", work: "がっこう 🏫", travel: "たび ✈️", gym: "ダンス 💃", placeholder: "ぬーむっちいかー？ ➕", finalCheck: "さいごのちぇっくどー！ 🚀", fingerCheck: "👈 ゆびさし確認どー！", go: "いっちきまーす！ 👋", reset: "ぜんぶないびらん", historyTitle: "消したむぬ（ゴミ箱）", historyDesc: "くまにあるむぬー、しに消ららん。むどぅすボタン、押しばいーさー。", restore: "むどぅす", noHistory: "まだねーんどー", zukanTitle: "宝むぬ図鑑 💎", currentStreak: "続いとーる日", highScore: "一番上", days: "日", points: "点", collected: "集めた宝むぬ", avatarSet: "自分設定", changeEmoji: "好きな絵文字にしなー", uploadPhoto: "写真のしなー", backToPenguin: "🐧 むどぅし", gameTitle: "ちむドンドン修行", timeUp: "終わいびーたん！⏰", gameEndDesc: "また明日ん修行しなーよー！✨", backToPrep: "準備むどぅる！ 👌", motivation: "やる気 🔥", important: "大事どー！", nameLabel: "なまえ", langName: "うちなーぐち", loading: "待ちおーけー...", gameOver: "終わい！", dailyLimit: "今日はもう遊んださー", playNow: "修行しなー！", disclaimer: "言語はAIがちゅくたんぐとぅ、まちがーとーるかもしれん💦", secretTitle: "虹色どー！🌈", secretMsg: "しに上等！隠しコマンド見ちきりたんねー！特別にもう1回修行しなー！" },
    tw: { appTitle: "我的清單 😊", progress: "準備進度", work: "學校 🏫", travel: "旅行 ✈️", gym: "健身/興趣 🏃", placeholder: "要帶什麼呢？ ➕", finalCheck: "最後檢查！ 🚀", fingerCheck: "👈 再次確認！", go: "我出發了！ 👋", reset: "全部重置", historyTitle: "刪除紀錄", restore: "恢復", noHistory: "暫無紀錄", zukanTitle: "寶物圖鑑 💎", currentStreak: "當前連續", highScore: "最高分", days: "天", points: "分", collected: "收集到的寶物", avatarSet: "頭像設定", changeEmoji: "更換表情符號", uploadPhoto: "上傳照片", backToPenguin: "🐧 返回企鵝", gameTitle: "每日寶物挑戰", timeUp: "時間到！⏰", gameEndDesc: "明天再來挑戰吧！✨", backToPrep: "回到準備！ 👌", motivation: "動力 🔥", important: "必備！", nameLabel: "姓名", langName: "繁體中文", loading: "載入中...", gameOver: "遊戲結束！", dailyLimit: "今天已挑戰", playNow: "開始修行", disclaimer: "語言由 AI 生成，可能存在錯誤 💦", secretTitle: "虹色派對！🌈", secretMsg: "恭喜！你發現了隱藏指令！今天可以再玩一次！" },
    ko: { appTitle: "나의 리스트 😊", progress: "준비 진행도", work: "학교 🏫", travel: "여행 ✈️", gym: "운동/취미 🏃", placeholder: "무엇을 챙길까요? ➕", finalCheck: "최종 확인! 🚀", fingerCheck: "👈 다시 확인하기!", go: "다녀오겠습니다! 👋", reset: "초기화", historyTitle: "삭제 기록", restore: "복구", noHistory: "기록이 없습니다", zukanTitle: "보물 도감 💎", currentStreak: "현재 연속", highScore: "최고 점수", days: "일", points: "점", collected: "수집한 보물", avatarSet: "아바タ 설정", changeEmoji: "이모지 변경", uploadPhoto: "사진 업로드", backToPenguin: "🐧 펭귄으로", gameTitle: "일일 보물 수행", timeUp: "시간 종료!⏰", gameEndDesc: "내일 또 만나요! ✨", backToPrep: "확인! 👌", motivation: "의욕 🔥", important: "필수!", nameLabel: "이름", langName: "한국어", loading: "로딩 중...", gameOver: "종료!", dailyLimit: "오늘 완료", playNow: "수행 시작", disclaimer: "언어는 AI가 생성하므로 오류가 있을 수 있습니다 💦", secretTitle: "무지개 파티! 🌈", secretMsg: "축하합니다! 숨겨진 커맨드를 찾았습니다! 오늘 한 번 더 놀 수 있어요!" },
    zh: { appTitle: "物品清单 😊", progress: "准备进度", work: "学校 🏫", travel: "旅行 ✈️", gym: "健身 🏃", placeholder: "带什么？ ➕", finalCheck: "最后检查！ 🚀", fingerCheck: "👈 再次确认！", go: "我出发了！ 👋", reset: "全部重置", historyTitle: "删除历史", restore: "恢复", noHistory: "暂无历史", zukanTitle: "宝物图鉴 💎", currentStreak: "当前连续", highScore: "最高分", days: "天", points: "分", collected: "收集到的宝物", avatarSet: "头像设置", changeEmoji: "更改表情", uploadPhoto: "上传照片", backToPenguin: "🐧 返回", gameTitle: "接宝物游戏", timeUp: "時間到！⏰", gameEndDesc: "明天再来！✨", backToPrep: "回到準備！ 👌", motivation: "動力 🔥", important: "必带！", nameLabel: "姓名", langName: "中文", loading: "加载中...", gameOver: "游戏结束！", dailyLimit: "今天已挑战", playNow: "开始游戏", disclaimer: "语言由 AI 生成，可能存在错误 💦", secretTitle: "虹色派对！🌈", secretMsg: "恭喜！你发现了隐藏指令！今天可以再玩一次！" },
    es: { appTitle: "Lista 😊", progress: "Progreso", work: "Escuela 🏫", travel: "Viaje ✈️", gym: "Gimnasio 🏃", placeholder: "¿Qué llevar? ➕", finalCheck: "¡Chequeo final! 🚀", fingerCheck: "👈 ¡Doble chequeo!", go: "¡Me voy! 👋", reset: "Reiniciar todo", historyTitle: "Historial", restore: "Restaurar", noHistory: "Sin historial", zukanTitle: "Colección 💎", currentStreak: "Racha", highScore: "Máximo", days: "Días", points: "pt", collected: "Tesoros", avatarSet: "Ajustes", changeEmoji: "Cambiar emoji", uploadPhoto: "Subir foto", backToPenguin: "🐧 Volver", gameTitle: "Tesoros Diarios", timeUp: "¡Tiempo! ⏰", gameEndDesc: "¡Hasta mañana! ✨", backToPrep: "¡Entendido! 👌", motivation: "Motivación 🔥", important: "¡Obligatorio!", nameLabel: "Nombre", langName: "Español", loading: "Cargando...", gameOver: "¡Fin!", dailyLimit: "Hoy ya jugaste", playNow: "Jugar ahora", disclaimer: "Los idiomas son generados por IA, puede haber errores 💦", secretTitle: "¡Modo Arcoíris! 🌈", secretMsg: "¡Felicidades! ¡Has encontrado el código secreto! ¡Puedes jugar una vez más hoy!" },
    fr: { appTitle: "Ma Liste 😊", progress: "Progrès", work: "École 🏫", travel: "Voyage ✈️", gym: "Sport 🏃", placeholder: "Quoi emporter ? ➕", finalCheck: "Dernier check ! 🚀", fingerCheck: "👈 Vérification !", go: "J'y vais ! 👋", reset: "Réinitialiser", historyTitle: "Historique", restore: "Restaurer", noHistory: "Aucun historique", zukanTitle: "Collection 💎", currentStreak: "Série actuelle", highScore: "Record", days: "Jours", points: "pts", collected: "Trésors trouvés", avatarSet: "Avatar", changeEmoji: "Changer l'emoji", uploadPhoto: "Ajouter photo", backToPenguin: "🐧 Retour", gameTitle: "Challenge Quotidien", timeUp: "Temps écoulé !⏰", gameEndDesc: "À demain ! ✨", backToPrep: "C'est parti ! 👌", motivation: "Motivation 🔥", important: "Important !", nameLabel: "Nom", langName: "Français", loading: "Chargement...", gameOver: "Fini !", dailyLimit: "Déjà joué", playNow: "Jouer", disclaimer: "Langues générées par l'IA, des erreurs sont possibles 💦", secretTitle: "Mode Arc-en-ciel ! 🌈", secretMsg: "Bravo ! Code secret trouvé ! Jouez encore une fois aujourd'hui !" },
    it: { appTitle: "Mia Lista 😊", progress: "Progresso", work: "Scuola 🏫", travel: "Viaggio ✈️", gym: "Palestra 🏃", placeholder: "Cosa portare? ➕", finalCheck: "Ultimo check ! 🚀", fingerCheck: "👈 Doppio controllo!", go: "Vado! 👋", reset: "Resetta tutto", historyTitle: "Cronologia", restore: "Ripristina", noHistory: "Nessuna cronologia", zukanTitle: "Collezione 💎", currentStreak: "Serie attuale", highScore: "Record", days: "Giorni", points: "pt", collected: "Tesori trovati", avatarSet: "Avatar", changeEmoji: "Cambia emoji", uploadPhoto: "Carica foto", backToPenguin: "🐧 Indietro", gameTitle: "Sfida Quotidiana", timeUp: "Tempo scaduto!⏰", gameEndDesc: "A domani! ✨", backToPrep: "Ricevuto! 👌", motivation: "Motivazione 🔥", important: "Obbligatorio!", nameLabel: "Nom", langName: "Italiano", loading: "Caricamento...", gameOver: "Fine!", dailyLimit: "Già giocato", playNow: "Gioca", disclaimer: "Le lingue sono generate dall'IA e potrebbero esserci errori 💦", secretTitle: "Festa Arcobaleno! 🌈", secretMsg: "Evviva! Hai trovato il comando segreto! Puoi giocare ancora una volta oggi!" },
    ar: { appTitle: "قائمتي 😊", progress: "التقدم", work: "المدرسة 🏫", travel: "السفر ✈️", gym: "الرياضة 🏃", placeholder: "ماذا ستأخذ؟ ➕", finalCheck: "التحقق الأخير! 🚀", fingerCheck: "👈 تحقق مرتين!", go: "أنا ذاهب! 👋", reset: "إعادة ضبط", historyTitle: "سجل الحذف", restore: "استعادة", noHistory: "لا يوجد سجل", zukanTitle: "مجموعة الكنوز 💎", currentStreak: "السلسلة الحالية", highScore: "أعلى نتيجة", days: "أيام", points: "نقطة", collected: "الكنوز الموجودة", avatarSet: "إعدادات الأفاتار", changeEmoji: "تغيير الرمز", uploadPhoto: "رفع صورة", backToPenguin: "🐧 عودة", gameTitle: "تحدي الكنز اليومい", timeUp: "انتهى الوقت!⏰", gameEndDesc: "أراك غداً! ✨", backToPrep: "فهمت! 👌", motivation: "التحفيز 🔥", important: "ضروري!", nameLabel: "الاسم", langName: "العربية", loading: "جاري التحميل...", gameOver: "انتهى!", dailyLimit: "لعبت اليوم", playNow: "العب الآن", disclaimer: "اللغات من إنتاج الذكاء الاصطناعي، قد تكون هناك أخطاء 💦", secretTitle: "حفلة قوس قزح! 🌈", secretMsg: "مبروك! وجدت الأمر السري! يمكنك اللعب مرة أخرى اليوم!" }
};

const MiniGame = ({ currentPlayTime, onTimeUpdate, onClose, avatar, highScore, onHighScoreUpdate, playSoundEffect, t }) => {
    const { useState, useEffect, useRef } = React;
    const [stage, setStage] = useState(1); // 1: 数字, 2: 色, 3: 探索
    const [solved, setSolved] = useState(false);
    const [startTime] = useState(Date.now());
    const [timer, setTimer] = useState(0);
    const [misses, setMisses] = useState(0);
    const [gameEnded, setGameEnded] = useState(false);

    // 謎1の状態
    const [numbers] = useState([1, 2, 3, 4].sort(() => Math.random() - 0.5));
    const [nextNum, setNextNum] = useState(1);

    // 謎2の状態
    const [colorOrder] = useState(['🔴', '🔵', '🟢', '🟡'].sort(() => Math.random() - 0.5));
    const [currentColorIdx, setCurrentColorIdx] = useState(0);

    // 謎3の状態
    const ITEMS_POOL = ['🎒', '📚', '✏️', '👟', '🧢', '👕', '🥪', '💧', '📒', '🎨'];
    const [targetItem] = useState(ITEMS_POOL[Math.floor(Math.random() * ITEMS_POOL.length)]);
    const [findItems] = useState([...ITEMS_POOL].sort(() => Math.random() - 0.5));

    useEffect(() => {
        if (gameEnded) return;
        const interval = setInterval(() => {
            const sec = Math.floor((Date.now() - startTime) / 1000);
            setTimer(sec);
            onTimeUpdate(sec);
            if (sec >= 60) {
                setGameEnded(true);
                playSoundEffect('alarm');
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [startTime, gameEnded, onTimeUpdate, playSoundEffect]);

    const nextStage = () => {
        playSoundEffect('check');
        if (stage < 3) {
            setStage(stage + 1);
        } else {
            setGameEnded(true);
            if (timer < highScore || highScore === 0) {
                onHighScoreUpdate(timer);
            }
            playSoundEffect('win');
        }
    };

    const onMiss = () => {
        playSoundEffect('fail');
        const newMisses = misses + 1;
        setMisses(newMisses);
        if (newMisses >= 5) {
            setGameEnded(true);
            playSoundEffect('alarm');
        }
    };

    return React.createElement('div', { className: "absolute inset-0 z-[100] flex flex-col p-6 bg-gradient-to-b from-indigo-900 to-slate-900 text-white overflow-hidden shadow-2xl" },
        // ヘッダー
        React.createElement('div', { className: "flex justify-between items-center mb-6" },
            React.createElement('div', null,
                React.createElement('h2', { className: "text-2xl font-black text-yellow-400" }, stage === 3 ? "最後の扉" : `ステージ ${stage}`),
                React.createElement('div', { className: "flex gap-6 items-center" },
                    React.createElement('div', { className: "flex flex-col" },
                        React.createElement('p', { className: "text-[10px] font-black opacity-40 uppercase tracking-widest" }, "TIME"),
                        React.createElement('p', { className: "text-xl font-black text-white" }, `${timer}s`)
                    ),
                    React.createElement('div', { className: "flex flex-col items-center" },
                        React.createElement('p', { className: "text-[10px] font-black opacity-40 uppercase tracking-widest mb-1" }, "LIFE"),
                        React.createElement('div', { className: "flex gap-1 bg-white/10 px-3 py-2 rounded-2xl" },
                            [...Array(5)].map((_, i) => React.createElement('span', { key: i, className: `text-xl transition-all duration-300 ${i < (5 - misses) ? 'opacity-100 scale-110' : 'opacity-0 scale-50'}` }, "❤️"))
                        )
                    )
                )
            ),
            React.createElement('button', { onClick: () => onClose(true), className: "p-2 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors" }, React.createElement(Icon, { name: 'X', size: 24 }))
        ),

        // ゲーム画面
        React.createElement('div', { className: "flex-1 bg-white/5 rounded-[3rem] border-2 border-white/20 p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-inner backdrop-blur-md" },
            !gameEnded ? (
                stage === 1 ? (
                    // 謎1: 数字タッチ
                    React.createElement('div', { className: "text-center" },
                        React.createElement('p', { className: "mb-8 font-bold text-sky-300" }, "数字を 1 から順番に押せ！"),
                        React.createElement('div', { className: "grid grid-cols-2 gap-4" },
                            numbers.map(n => React.createElement('button', {
                                key: n,
                                onClick: () => {
                                    if (n === nextNum) {
                                        playSoundEffect('success');
                                        if (n === 4) nextStage();
                                        else setNextNum(n + 1);
                                    } else {
                                        onMiss();
                                    }
                                },
                                className: `w-20 h-20 rounded-3xl text-3xl font-black transition-all ${n < nextNum ? 'bg-green-500 scale-90 opacity-40' : 'bg-white text-indigo-900 shadow-xl active:scale-95'}`
                            }, n))
                        )
                    )
                ) : stage === 2 ? (
                    // 謎2: 色の順序
                    React.createElement('div', { className: "text-center" },
                        React.createElement('p', { className: "mb-4 font-bold text-rose-300" }, "この順番で色を押せ！"),
                        React.createElement('div', { className: "flex justify-center gap-2 mb-10 bg-black/20 p-4 rounded-2xl border border-white/10" },
                            colorOrder.map((c, i) => React.createElement('span', { key: i, className: `text-3xl transition-opacity ${i < currentColorIdx ? 'opacity-20' : 'opacity-100'}` }, c))
                        ),
                        React.createElement('div', { className: "grid grid-cols-2 gap-4" },
                            ['🔴', '🔵', '🟢', '🟡'].sort(() => Math.random() - 0.5).map(c => React.createElement('button', {
                                key: c,
                                onClick: () => {
                                    if (c === colorOrder[currentColorIdx]) {
                                        playSoundEffect('success');
                                        if (currentColorIdx === 3) nextStage();
                                        else setCurrentColorIdx(currentColorIdx + 1);
                                    } else {
                                        onMiss();
                                        setCurrentColorIdx(0); // 間違えたら最初から！
                                    }
                                },
                                className: "w-20 h-20 bg-white/10 rounded-3xl text-4xl hover:bg-white/20 transition-colors shadow-lg border border-white/5 active:scale-90"
                            }, c))
                        )
                    )
                ) : (
                    // 謎3: アイテム探し
                    React.createElement('div', { className: "text-center" },
                        React.createElement('p', { className: "mb-4 font-bold text-amber-300" }, `${targetItem} を見つけ出せ！`),
                        React.createElement('div', { className: "grid grid-cols-4 gap-3 bg-white/5 p-4 rounded-[2.5rem] border border-white/5" },
                            findItems.map((item, i) => React.createElement('button', {
                                key: i,
                                onClick: () => {
                                    if (item === targetItem) nextStage();
                                    else onMiss();
                                },
                                className: `w-14 h-14 bg-white/5 rounded-2xl text-2xl hover:bg-white/20 flex items-center justify-center transition-all active:scale-90 ${item === targetItem ? 'border-2 border-yellow-400/20' : ''}`
                            }, item))
                        )
                    )
                )
            ) : (
                // リザルト
                React.createElement('div', { className: "text-center animate-bounce-slow" },
                    React.createElement('div', { className: "text-8xl mb-6 drop-shadow-2xl" }, timer < 60 && misses < 5 ? "🏁" : "😱"),
                    React.createElement('h3', { className: "text-4xl font-black mb-2 text-white" }, timer < 60 && misses < 5 ? "脱出成功！" : "オーマイガー😱"),
                    React.createElement('p', { className: "text-xl font-bold text-yellow-400 mb-8" },
                        timer < 60 && misses < 5 ? `${timer}秒 でクリアしたよ！` : (misses >= 5 ? "ミスしすぎちゃった！" : "時間切れだよ〜！")
                    ),
                    React.createElement('button', {
                        onClick: () => onClose(false),
                        className: "bg-white text-indigo-900 px-12 py-5 rounded-3xl font-black shadow-2xl hover:bg-slate-100 transition-transform active:scale-95"
                    }, timer < 60 && misses < 5 ? "修行完了！ 👌" : "次はがんばる！ 💪")
                )
            )
        ),

        // フッター
        React.createElement('div', { className: "mt-6 text-center" },
            React.createElement('div', { className: "w-full bg-white/10 rounded-full h-3 overflow-hidden border border-white/5" },
                React.createElement('div', { className: "bg-gradient-to-r from-yellow-400 to-orange-400 h-full transition-all duration-500 shadow-[0_0_10px_rgba(250,204,21,0.5)]", style: { width: `${(stage / 3) * 100}%` } })
            ),
            React.createElement('p', { className: "mt-2 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]" }, "Speedrun Quest: Escape the Room")
        )
    );
};

function App() {
    // ここで初めて React の道具を取り出すよ
    const { useState, useEffect, useRef, useCallback, useMemo } = React;
    const [user, setUser] = useState(null);
    const [gameData, setGameData] = useState({ streak: 0, lastDate: null, inventory: [], avatar: DEFAULT_AVATAR, name: "アオイ", highScore: 0, deletedItems: [], lang: 'ja', savedItems: [], lastGameDate: "", lastTicketDate: "", savedCategories: INITIAL_CATEGORIES });
    const [currentTime, setCurrentTime] = useState(new Date());

    const [cheatCode, setCheatCode] = useState([]);
    const [tapCount, setTapCount] = useState(0);
    const [isSecretMode, setIsSecretMode] = useState(false);
    const [showSecretModal, setShowSecretModal] = useState(false);

    const [items, setItems] = useState([
        { id: 1, category: 'work', name: '水筒 💧', checked: false, important: true },
        { id: 2, category: 'work', name: '体育着 👕', checked: false, important: true },
        { id: 3, category: 'work', name: '赤白帽子 🧢', checked: false, important: true },
        { id: 4, category: 'work', name: '筆箱・えんぴつ ✏️', checked: false, important: true },
        { id: 5, category: 'work', name: '教科書・ノート 📚', checked: false, important: true },
        { id: 6, category: 'work', name: '連絡帳 📒', checked: false, important: true },
        { id: 7, category: 'work', name: 'やる気 🔥', checked: false, important: true },
    ]);
    const [activeCategory, setActiveCategory] = useState('work');
    const [categories, setCategories] = useState(INITIAL_CATEGORIES);
    const [newItemName, setNewItemName] = useState('');
    const [isFinalCheck, setIsFinalCheck] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [showHistory, setShowHistory] = useState(false);
    const [showInventory, setShowInventory] = useState(false);
    const [showGame, setShowGame] = useState(false);
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [playTime, setPlayTime] = useState(0);
    const [showReward, setShowReward] = useState(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState("");
    const [isEditingEmoji, setIsEditingEmoji] = useState(false);
    const [tempEmoji, setTempEmoji] = useState("");
    const [currentCompliment, setCurrentCompliment] = useState(COMPLIMENTS[0]);
    const [showOmikuji, setShowOmikuji] = useState(false);
    const [omikujiResult, setOmikujiResult] = useState(null);
    const [showLotteryModal, setShowLotteryModal] = useState(false);
    const [lotteryResult, setLotteryResult] = useState(null);
    /* 🏗 カテゴリーを増やすための特別な画面の状態だよ */
    const [showCatModal, setShowCatModal] = useState(false);
    const [newCatInput, setNewCatInput] = useState("");
    /* 🏗️ ここに「なまえをかえる」と「けす」ための特別な状態を作るよ */
    const [editingCat, setEditingCat] = useState(null);
    const [deletingCat, setDeletingCat] = useState(null);
    const [tempEditName, setTempEditName] = useState("");
    /* 💀 びっくり演出のためのお化け変数だよ */
    const [scaryChar, setScaryChar] = useState(null);

    const audioContextRef = useRef(null);
    const fileInputRef = useRef(null);

    const t = useCallback((key) => {
        const lang = gameData.lang || 'ja';
        return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['ja']?.[key] || key;
    }, [gameData.lang]);

    const filteredItems = useMemo(() => items.filter(item => item.category === activeCategory), [items, activeCategory]);
    const progress = useMemo(() => filteredItems.length > 0 ? (filteredItems.filter(item => item.checked).length / filteredItems.length) * 100 : 0, [filteredItems]);
    const totalLevel = useMemo(() => (gameData.inventory || []).reduce((sum, item) => sum + (item.level || 1), 0), [gameData.inventory]);
    const isRTL = gameData.lang === 'ar';
    const hasPlayedToday = useMemo(() => gameData.lastGameDate === new Date().toDateString(), [gameData.lastGameDate]);
    const hasUsedTicketToday = useMemo(() => gameData.lastTicketDate === new Date().toDateString(), [gameData.lastTicketDate]);

    const syncGameData = useCallback(async (newData) => {
        const updated = { ...gameData, ...newData };
        setGameData(updated);
        localStorage.setItem('wasuremono_save', JSON.stringify(updated));
    }, [gameData]);

    const playSound = useCallback((type) => {
        if (!soundEnabled) return;
        try {
            if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            const ctx = audioContextRef.current; if (ctx.state === 'suspended') ctx.resume();
            const playNote = (freq, duration, type = 'sine') => {
                const osc = ctx.createOscillator(); const gain = ctx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, ctx.currentTime);
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
                osc.connect(gain); gain.connect(ctx.destination);
                osc.start(); osc.stop(ctx.currentTime + duration);
            };
            if (type === 'check') playNote(1200, 0.1);
            else if (type === 'click') playNote(800, 0.05, 'triangle');
            else if (type === 'pop') playNote(400, 0.1, 'square');
            else if (type === 'success') [1000, 1500].forEach((f, i) => setTimeout(() => playNote(f, 0.15, 'sine'), i * 50));
            else if (type === 'win') {
                [523, 659, 783, 1046].forEach((f, i) => setTimeout(() => playNote(f, 0.3), i * 100));
            }
            else if (type === 'warning') playNote(400, 0.2);
            else if (type === 'alarm') [880, 880, 880].forEach((f, i) => setTimeout(() => playNote(f, 0.2), i * 200));
            else if (type === 'fail') [200, 150].forEach((f, i) => setTimeout(() => playNote(f, 0.3, 'sawtooth'), i * 100));
            /* 👹 怖い音（地獄の響き）だよ */
            else if (type === 'horror') [100, 80, 60].forEach((f, i) => setTimeout(() => playNote(f, 0.5, 'sawtooth'), i * 200));
        } catch (e) { }
    }, [soundEnabled]);

    const toggleCheck = (id) => {
        if (isFinalCheck) return;
        const nextItems = items.map(it => it.id === id ? { ...it, checked: !it.checked } : it);
        const item = items.find(i => i.id === id);
        if (!item.checked) playSound('check');

        /* 👻 もし名前が「666」だったら、たま〜に怖いことが起きるよ…… */
        if (gameData.name === "666" && !item.checked && Math.random() < 0.3) {
            const ghosts = ["👻", "💀", "👺", "🧟", "🩸", "👁️"];
            const ghost = ghosts[Math.floor(Math.random() * ghosts.length)];
            setScaryChar(ghost);
            playSound('horror');
            setTimeout(() => setScaryChar(null), 1200);
        }

        setItems(nextItems);
    };

    const addItem = (e) => {
        e.preventDefault();
        if (!newItemName.trim()) return;
        const nextItems = [{ id: Date.now(), category: activeCategory, name: newItemName.trim(), checked: false, important: false }, ...items];
        setItems(nextItems);
        setNewItemName('');
        syncGameData({ savedItems: nextItems });
    };

    const deleteItem = (id) => {
        const nextItems = items.filter(it => it.id !== id);
        setItems(nextItems);
        syncGameData({ savedItems: nextItems });
    };

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        const saved = localStorage.getItem('wasuremono_save');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setGameData(parsed);
                if (parsed.savedItems) {
                    setItems(parsed.savedItems.map(it => ({ ...it, checked: false })));
                }
                if (parsed.savedCategories) setCategories(parsed.savedCategories);
            } catch (e) { }
        }
        return () => clearInterval(timer);
    }, []);

    const addCategory = () => {
        setNewCatInput("");
        setShowCatModal(true);
        playSound('pop');
    };

    /* 📅 日付と時間の表示を、選んだ言葉にあわせるように変えたよ！ */
    const getLocale = (lang) => {
        const map = { ja: 'ja-JP', en: 'en-US', ru: 'ru-RU', ko: 'ko-KR', zh: 'zh-CN', es: 'es-ES', fr: 'fr-FR', it: 'it-IT', ar: 'ar-EG' };
        return map[lang] || 'ja-JP';
    };
    const formattedDate = currentTime.toLocaleDateString(getLocale(gameData.lang), { month: 'long', day: 'numeric', weekday: 'short' });
    /* 🕰️ 12時間表示（AM/PM）が出るようにしたよ！ */
    const formattedClock = currentTime.toLocaleTimeString(getLocale(gameData.lang), { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

    /* 👹 もしおなまえが「666」だったらホラーモードに突入！ */
    const isHorror = gameData.name === "666";
    const bgClass = isHorror ? 'horror-bg' : (gameData.name === "ラッキーセブン" ? 'rainbow-bg-flashy' : (isSecretMode ? 'bg-orange-50' : 'bg-white'));
    const appClass = isHorror ? 'app-shake' : (gameData.name === "ラッキーセブン" ? 'app-flashy' : '');

    /* 🎨 アプリ全体が「まんなか」にくるように魔法をかけたよ！ */
    return React.createElement('div', { className: `w-full min-h-screen flex flex-col items-center justify-center p-2 relative ${bgClass}` },
        /* 📱 アプリ全体をちょうどいい大きさ（85）にしたよ！ */
        React.createElement('div', { className: `w-full max-w-md bg-white border shadow-xl rounded-[2.5rem] h-[85vh] flex flex-col overflow-hidden ${appClass}` },
            React.createElement('div', { className: "px-3 pt-3 pb-2 bg-gradient-to-br from-rose-300 via-purple-300 to-sky-300 text-white shrink-0 rounded-b-xl shadow-sm" },
                React.createElement('div', { className: "flex justify-between items-center mb-2" },
                    React.createElement('div', { className: "flex items-center gap-2" },
                        React.createElement('div', { className: "w-9 h-9 bg-white rounded-xl p-0.5 overflow-hidden shadow-lg cursor-pointer", onClick: () => { playSound('pop'); setShowInventory(true); } },
                            React.createElement('img', { src: gameData.avatar, className: "w-full h-full object-cover" })
                        ),
                        React.createElement('div', {
                            className: "text-left cursor-pointer select-none",
                            onClick: () => {
                                const newCount = tapCount + 1;
                                if (newCount >= 5) {
                                    playSound('win');
                                    syncGameData({ lastGameDate: "", lastTicketDate: "" });
                                    alert("🌟 ひみつの魔法！ 🌟\n今日の制限（せいげん）をリセットしたよ！もう一度くじが引けるよ。");
                                    setTapCount(0);
                                } else {
                                    setTapCount(newCount);
                                    setTimeout(() => setTapCount(0), 2000);
                                }
                            }
                        },
                            React.createElement('p', { className: "font-black text-xs" }, gameData.name),
                            React.createElement('p', { className: "text-[9px] font-bold opacity-80" }, `${gameData.streak} ${t('days')}`)
                        )
                    ),
                    React.createElement('div', { className: "flex gap-1.5" },
                        React.createElement('button', {
                            onClick: () => {
                                if (hasUsedTicketToday) {
                                    playSound('warning');
                                    alert("今日のくじ引きはもうおしまい！また明日ね！ 🎫");
                                } else {
                                    playSound('pop');
                                    const isHit = Math.random() < 0.5;
                                    if (isHit) {
                                        setLotteryResult('hit');
                                        syncGameData({ lastGameDate: "", lastTicketDate: new Date().toDateString() });
                                    } else {
                                        setLotteryResult('miss');
                                        syncGameData({ lastTicketDate: new Date().toDateString() });
                                    }
                                    setShowLotteryModal(true);
                                }
                            },
                            className: `p-2 bg-white/20 rounded-xl transition-opacity ${hasUsedTicketToday ? 'opacity-30' : 'opacity-100'}`
                        }, React.createElement(Icon, { name: 'Ticket', size: 16 })),
                        React.createElement('button', {
                            onClick: () => {
                                if (hasPlayedToday) {
                                    playSound('warning');
                                    alert("今日の修行はもうおしまい！また明日がんばろうね！ ✨");
                                } else {
                                    playSound('pop');
                                    syncGameData({ lastGameDate: new Date().toDateString() });
                                    setShowGame(true);
                                }
                            },
                            className: `p-2 bg-white/20 rounded-xl transition-opacity ${hasPlayedToday ? 'opacity-30' : 'opacity-100'}`
                        }, React.createElement(Icon, { name: 'Gamepad2', size: 16 })),
                        React.createElement('button', {
                            onClick: () => { playSound('pop'); setShowInventory(true); },
                            className: "p-2 bg-white/20 rounded-xl"
                        }, React.createElement(Icon, { name: 'Medal', size: 16 })),
                        React.createElement('button', { onClick: () => { playSound('pop'); setShowLangMenu(!showLangMenu); }, className: "p-2 bg-white/20 rounded-xl" }, React.createElement(Icon, { name: 'Globe', size: 16 }))
                    )
                ),
            /* 📅 日付・時計 と 📊進捗バー を横並びにして限界まで短く！ */
            React.createElement('div', { className: "flex items-center gap-3" },
                React.createElement('div', { className: "shrink-0" },
                    React.createElement('div', { className: "text-[9px] font-black opacity-90 leading-tight" }, formattedDate),
                    React.createElement('div', { className: "text-lg font-black tracking-tighter leading-none mt-0.5" },
                        formattedClock.split(':').slice(0, 2).join(':'),
                        React.createElement('span', { className: "text-[9px] ml-0.5 opacity-70 font-black" }, formattedClock.split(':')[2])
                    )
                ),
                React.createElement('div', { className: "flex-1 bg-white/20 rounded-xl px-3 py-1.5 shadow-inner" },
                    React.createElement('div', { className: "flex justify-between text-[9px] mb-0.5 font-black" }, React.createElement('span', null, t('progress')), React.createElement('span', null, `${Math.round(progress)}%`)),
                    React.createElement('div', { className: "w-full bg-black/10 rounded-full h-1.5 overflow-hidden" }, React.createElement('div', { className: "bg-white h-full transition-all duration-500", style: { width: `${progress}%` } }))
                )
            )
        ),
        React.createElement('div', { className: "flex p-2 pb-3 gap-2 bg-gray-50 border-b overflow-x-auto scrollbar-custom-x items-center" },
            /* ➕ 新しいカテゴリーを増やすための目立つボタンだよ！一番左に持ってきたよ */
            React.createElement('button', {
                onClick: () => {
                    console.log("Category button clicked!");
                    addCategory();
                },
                className: "shrink-0 px-4 py-2.5 bg-purple-600 text-white rounded-2xl flex items-center justify-center gap-1.5 text-[11px] font-black hover:bg-purple-700 transition-all shadow-md active:scale-95"
            }, React.createElement(Icon, { name: 'Plus', size: 14 }), "追加"),
            /* ここからカテゴリーたちが並ぶよ */
            categories.map(cat => {
                const isActive = activeCategory === cat.id;
                return React.createElement('div', { key: cat.id, className: "shrink-0 flex items-center gap-1" },
                    React.createElement('button', {
                        onClick: () => { playSound('click'); setActiveCategory(cat.id); },
                        /* 🕺 カテゴリーにあわせたマークを出すよ（自分で作ったカテゴリーにはマークを出さないよ！） */
                        className: `px-4 py-2 rounded-2xl flex items-center justify-center gap-1.5 text-[10px] font-bold transition-all ${isActive ? 'bg-white shadow-md ring-1 ring-purple-100 text-purple-600 scale-105' : 'text-slate-400 hover:bg-white/50'}`
                    },
                        !cat.isCustom && React.createElement(Icon, { name: cat.id === 'work' ? 'Briefcase' : cat.id === 'travel' ? 'Plane' : cat.id === 'gym' ? 'Music' : 'Plus', size: 14 }),
                        cat.isCustom ? cat.name : t(cat.id)
                    ),
                    /* 🖊️ 名前をかえるボタン（すべてのカテゴリーでできるよ！） */
                    isActive && React.createElement('button', {
                        type: 'button',
                        onClick: (e) => {
                            e.stopPropagation();
                            setTempEditName(cat.isCustom ? cat.name : t(cat.id));
                            setEditingCat(cat);
                            playSound('pop');
                        },
                        className: "p-2 min-w-[36px] flex items-center justify-center text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"
                    }, React.createElement(Icon, { name: 'Edit3', size: 16 })),
                    /* ❌ 消すボタン（カテゴリーが1つだけのときは消せないよ） */
                    isActive && categories.length > 1 && React.createElement('button', {
                        type: 'button',
                        onClick: (e) => {
                            e.stopPropagation();
                            setDeletingCat(cat);
                            playSound('warning');
                        },
                        className: "p-2 min-w-[36px] flex items-center justify-center text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                    }, React.createElement(Icon, { name: 'X', size: 16 }))
                );
            })
        ),
        React.createElement('div', { className: "flex-1 overflow-y-auto scrollbar-custom p-4 space-y-3" },
            !isFinalCheck ? (
                React.createElement(React.Fragment, null,
                    React.createElement('form', { onSubmit: addItem, className: "flex gap-2 mb-4" },
                        React.createElement('input', { type: "text", value: newItemName, onChange: (e) => setNewItemName(e.target.value), placeholder: t('placeholder'), className: "flex-1 px-4 py-3 bg-white border-2 border-slate-100 rounded-2xl text-sm outline-none focus:border-purple-200" }),
                        React.createElement('button', { type: "submit", className: "bg-rose-300 text-white p-3 rounded-2xl shadow-md bouncy-button" }, React.createElement(Icon, { name: 'Plus', size: 24 }))
                    ),
                    items.filter(i => i.category === activeCategory).map(item => (
                        React.createElement('div', { key: item.id, className: "group relative" },
                            React.createElement('div', { onClick: () => toggleCheck(item.id), className: `flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${item.checked ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white shadow-sm border-purple-50 hover:border-purple-200'}` },
                                React.createElement('div', { className: item.checked ? 'text-green-400' : 'text-slate-200' }, React.createElement(Icon, { name: item.checked ? 'CheckCircle' : 'Circle', size: 24 })),
                                React.createElement('div', { className: `flex-1 font-black text-sm text-slate-700 text-left ${item.checked ? 'line-through' : ''}` }, item.name),
                                !item.checked && React.createElement('button', { onClick: (e) => { e.stopPropagation(); deleteItem(item.id); }, className: "p-1.5 text-slate-300 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" }, React.createElement(Icon, { name: 'X', size: 16 }))
                            )
                        )
                    )),
                    progress === 100 && items.filter(i => i.category === activeCategory).length > 0 &&
                    React.createElement('button', { onClick: () => setIsFinalCheck(true), className: "w-full mt-6 bg-gradient-to-r from-rose-300 via-purple-300 to-sky-300 text-white py-5 rounded-[2rem] font-black shadow-xl bouncy-button animate-floating" }, t('finalCheck'))
                )
            ) : (
                React.createElement('div', { className: "text-center py-4" },
                    React.createElement('div', { className: "bg-rose-50 text-rose-500 p-4 rounded-2xl font-bold mb-4" }, t('fingerCheck')),
                    items.filter(i => i.category === activeCategory).map(item => React.createElement('div', { key: item.id, className: "p-4 bg-white rounded-2xl border mb-2 font-bold" }, item.name)),
                    React.createElement('button', {
                        onClick: () => {
                            // 新しいお宝をランダムで選ぶよ
                            const reward = REWARD_POOL[Math.floor(Math.random() * REWARD_POOL.length)];
                            const newInventory = [...(gameData.inventory || []), { id: Date.now(), name: reward, date: new Date().toLocaleDateString() }];

                            // データを保存して、お祝い画面を出すよ！
                            syncGameData({
                                inventory: newInventory,
                                streak: gameData.streak + 1,
                                lastDate: new Date().toDateString()
                            });

                            // 👇 ここでチェックを全部はずす魔法をかけるよ！
                            setItems(items.map(it => ({ ...it, checked: false })));
                            setIsFinalCheck(false);
                            playSound('win'); // お祝いの音を鳴らすよ！
                            setShowReward({ name: reward });
                        },
                        className: "w-full bg-sky-400 text-white py-5 rounded-3xl font-black shadow-xl bouncy-button"
                    }, t('go'))
                )
            )
        )
    ),
        /* 🏰 ここからは「枠の外」！お宝図鑑やゲーム画面は、この下の「自由な場所」で画面いっぱいに表示するよ。 */
        /* これでメインの画面が小さくても、図鑑はダイナミックに大きく映るね！ */
        showInventory && React.createElement('div', { className: "fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm" },
            /* 🏰 お宝図鑑の大きさは「最大」！画面いっぱいに広がるよ！ */
            React.createElement('div', { className: "w-full h-full bg-white flex flex-col fade-in" },
                React.createElement('div', { className: "p-6 bg-gradient-to-r from-amber-300 to-yellow-500 text-white flex justify-between items-center shrink-0" },
                    React.createElement('div', { className: "flex flex-col" },
                        React.createElement('h3', { className: "text-xl font-black flex items-center gap-2" }, React.createElement(Icon, { name: 'Medal', size: 24 }), t('zukanTitle')),
                        React.createElement('p', { className: "text-[10px] font-bold opacity-80" }, getRankName(totalLevel, gameData.lang))
                    ),
                    React.createElement('button', { onClick: () => { setShowInventory(false); setIsEditingName(false); setIsEditingEmoji(false); }, className: "p-2 bg-white/20 rounded-xl" }, React.createElement(Icon, { name: 'X', size: 24 }))
                ),

                // プロフィール編集
                /* 👤 プロフィールのところを少しスッキリさせて、リストを見やすくしたよ */
                React.createElement('div', { className: "p-4 border-b bg-orange-50/50 shrink-0" },
                    React.createElement('div', { className: "flex items-center gap-4" },
                        React.createElement('div', { className: "w-16 h-16 bg-white rounded-3xl shadow-md border-4 border-white overflow-hidden shrink-0 relative group" },
                            React.createElement('img', { src: gameData.avatar, className: "w-full h-full object-cover" }),
                            React.createElement('button', { onClick: () => setIsEditingEmoji(!isEditingEmoji), className: "absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-black transition-opacity" }, "かえる")
                        ),
                        React.createElement('div', { className: "flex-1" },
                            isEditingName ? (
                                React.createElement('div', { className: "flex gap-2" },
                                    React.createElement('input', { autoFocus: true, value: tempName, onChange: e => setTempName(e.target.value), className: "w-full px-3 py-2 rounded-xl border-2 border-orange-200 text-sm font-bold" }),
                                    React.createElement('button', { onClick: () => { syncGameData({ name: tempName || "アオイ" }); setIsEditingName(false); }, className: "bg-green-400 text-white px-4 rounded-xl font-black text-xs" }, "OK")
                                )
                            ) : (
                                React.createElement('div', { className: "flex items-center gap-2" },
                                    React.createElement('span', { className: "text-xl font-black text-slate-700" }, gameData.name),
                                    React.createElement('button', { onClick: () => { setTempName(gameData.name); setIsEditingName(true); }, className: "text-slate-300 hover:text-orange-400" }, React.createElement(Icon, { name: 'Edit3', size: 18 }))
                                )
                            )
                        )
                    ),
                    isEditingEmoji && React.createElement('div', { className: "mt-4 p-3 bg-white rounded-2xl border-2 border-orange-100 grid grid-cols-6 gap-2 fade-in" },
                        ['🐱', '🐶', '🐰', '🦊', '🐯', '🦁', '🐮', '🐷', '🐵', '🐧', '🐥', '🦉'].map(e => React.createElement('button', {
                            key: e,
                            onClick: () => { syncGameData({ avatar: getEmojiAvatarUrl(e) }); setIsEditingEmoji(false); },
                            className: "text-2xl p-2 hover:bg-orange-50 rounded-xl transition-colors"
                        }, e))
                    )
                ),

                // 今日の運勢コーナー（図鑑のトップに追加）
                /* ⛩️ おみくじのところも少しコンパクトにしたよ */
                React.createElement('div', { className: "p-3 bg-orange-50 border-b" },
                    omikujiResult ? (
                        React.createElement('div', { className: "bg-white p-4 rounded-3xl border-2 border-orange-200 shadow-sm flex items-center gap-4" },
                            React.createElement('div', { className: "text-3xl" }, "⛩️"),
                            React.createElement('div', { className: "flex-1" },
                                React.createElement('p', { className: "text-[10px] font-black text-orange-400 uppercase tracking-tighter" }, "Today's Fortune"),
                                React.createElement('p', { className: "text-lg font-black text-slate-700" }, omikujiResult.name),
                                React.createElement('p', { className: "text-[9px] font-bold text-slate-400" }, `Lucky: ${omikujiResult.item}`)
                            ),
                            React.createElement('button', {
                                onClick: () => {
                                    const totalWeight = OMIKUJI_RESULTS.reduce((s, r) => s + r.weight, 0);
                                    let random = Math.random() * totalWeight;
                                    let res = OMIKUJI_RESULTS[OMIKUJI_RESULTS.length - 1];
                                    for (let r of OMIKUJI_RESULTS) {
                                        if (random < r.weight) { res = r; break; }
                                        random -= r.weight;
                                    }
                                    const item = LUCKY_ITEMS[Math.floor(Math.random() * LUCKY_ITEMS.length)];
                                    setOmikujiResult({ ...res, item });
                                    setShowOmikuji(true);
                                    playSound('pop');
                                },
                                className: "p-2 bg-orange-100 rounded-xl text-orange-500 hover:bg-orange-200"
                            }, React.createElement(Icon, { name: 'RefreshCw', size: 16 }))
                        )
                    ) : (
                        React.createElement('button', {
                            onClick: () => {
                                const res = OMIKUJI_RESULTS[Math.floor(Math.random() * OMIKUJI_RESULTS.length)];
                                const item = LUCKY_ITEMS[Math.floor(Math.random() * LUCKY_ITEMS.length)];
                                setOmikujiResult({ ...res, item });
                                setShowOmikuji(true);
                                playSound('pop');
                            },
                            className: "w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white p-4 rounded-3xl font-black shadow-md flex items-center justify-center gap-3 bouncy-button"
                        }, React.createElement('span', { className: "text-xl" }, "⛩️"), "今日の運勢を占う！")
                    )
                ),

                // お宝リスト
                React.createElement('div', { className: "flex-1 overflow-y-auto p-6 grid grid-cols-2 gap-4" },
                    (gameData.inventory || []).length === 0 ? (
                        React.createElement('div', { className: "col-span-2 text-center py-10" },
                            React.createElement('div', { className: "text-4xl mb-2" }, "📦"),
                            React.createElement('p', { className: "text-slate-400 font-bold text-sm" }, t('noHistory'))
                        )
                    ) : (
                        gameData.inventory.map(item => React.createElement('div', { key: item.id, className: "bg-white p-6 rounded-[3rem] border-2 border-slate-50 flex flex-col items-center gap-4 shadow-md hover:scale-105 transition-transform" },
                            /* お宝も大きく！たくさんならんで見やすいね！ */
                            React.createElement('div', { className: "text-6xl select-none" }, item.name.split(' ')[0]),
                            React.createElement('div', { className: "text-sm font-black text-slate-500 text-center leading-snug" }, item.name.split(' ').slice(1).join(' '))
                        ))
                    )
                ),
                React.createElement('div', { className: "p-6 bg-slate-50 border-t shrink-0" },
                    React.createElement('button', { onClick: () => setShowInventory(false), className: "w-full bg-slate-800 text-white py-4 rounded-[1.5rem] font-black shadow-lg bouncy-button" }, t('backToPrep'))
                )
            )
        ),

        // --- 🎮 修行（ミニゲーム）の画面 ---
        showGame && React.createElement(MiniGame, {
            currentPlayTime: playTime,
            onTimeUpdate: setPlayTime,
            onClose: (abandoned) => {
                setShowGame(false);
                setPlayTime(0);
            },
            avatar: gameData.avatar,
            highScore: gameData.highScore,
            onHighScoreUpdate: (s) => syncGameData({ highScore: s }),
            playSoundEffect: playSound,
            t: t
        }),

        // --- 🌍 言語設定の画面 ---
        showLangMenu && React.createElement('div', { className: "fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm", onClick: () => setShowLangMenu(false) },
            React.createElement('div', { className: "w-full max-w-[280px] max-h-[70vh] bg-white rounded-[2.5rem] p-4 shadow-2xl flex flex-col gap-2 scale-up overflow-y-auto", onClick: e => e.stopPropagation() },
                Object.keys(TRANSLATIONS).map(l => React.createElement('button', {
                    key: l,
                    onClick: () => { syncGameData({ lang: l }); setShowLangMenu(false); },
                    className: `w-full py-4 rounded-2xl font-black text-sm transition-all shrink-0 ${gameData.lang === l ? 'bg-purple-100 text-purple-600' : 'text-slate-500 hover:bg-slate-50'}`
                }, TRANSLATIONS[l].langName))
            )
        ),

        // --- 🎉 お宝ゲット！お祝い画面 ---
        showReward && React.createElement('div', { className: "fixed inset-0 z-[300] flex items-center justify-center p-4 bg-purple-500/80 backdrop-blur-md" },
            React.createElement('div', { className: "bg-white rounded-[3.5rem] p-10 text-center shadow-2xl border-8 border-yellow-200 animate-floating scale-110" },
                React.createElement('div', { className: "text-2xl font-black text-purple-500 mb-2" }, "やったー！✨"),
                React.createElement('div', { className: "text-8xl mb-6 drop-shadow-lg" }, showReward.name.split(' ')[0]),
                React.createElement('h3', { className: "text-2xl font-black text-slate-800 mb-6" }, showReward.name.split(' ').slice(1).join(' ')),
                React.createElement('p', { className: "text-slate-500 font-bold mb-8" }, "新しいお宝をゲットしたよ！"),
                React.createElement('div', { className: "flex flex-col gap-3" },
                    React.createElement('button', {
                        onClick: () => {
                            const totalWeight = OMIKUJI_RESULTS.reduce((s, r) => s + r.weight, 0);
                            let random = Math.random() * totalWeight;
                            let res = OMIKUJI_RESULTS[OMIKUJI_RESULTS.length - 1];
                            for (let r of OMIKUJI_RESULTS) {
                                if (random < r.weight) { res = r; break; }
                                random -= r.weight;
                            }
                            const item = LUCKY_ITEMS[Math.floor(Math.random() * LUCKY_ITEMS.length)];
                            setOmikujiResult({ ...res, item });
                            setShowOmikuji(true);
                            playSound('pop');
                        },
                        className: "bg-purple-500 text-white px-12 py-4 rounded-3xl font-black shadow-xl bouncy-button text-lg"
                    }, "今日の運勢をうらなう！ ⛩️"),
                    React.createElement('button', {
                        onClick: () => {
                            setShowReward(null);
                            setShowInventory(true);
                        },
                        className: "text-slate-400 font-bold py-2 hover:text-slate-600 transition-colors"
                    }, "あとで図鑑を見る 💎")
                )
            )
        ),

        // --- ⛩️ おみくじモーダル ---
        showOmikuji && React.createElement('div', { className: "fixed inset-0 z-[400] flex items-center justify-center p-4 bg-orange-100/90 backdrop-blur-md" },
            React.createElement('div', { className: "bg-white rounded-[4rem] p-10 text-center shadow-2xl border-x-8 border-orange-400 max-w-sm fade-in" },
                React.createElement('div', { className: "text-5xl mb-6" }, "⛩️"),
                React.createElement('h3', { className: "text-3xl font-black text-orange-500 mb-2" }, omikujiResult?.name),
                React.createElement('p', { className: "text-slate-600 font-bold mb-8 leading-relaxed" }, omikujiResult?.msg),
                React.createElement('div', { className: "bg-orange-50 p-6 rounded-3xl mb-8 border-2 border-dashed border-orange-200" },
                    React.createElement('p', { className: "text-orange-400 text-xs font-black mb-1 uppercase tracking-widest" }, "Lucky Item"),
                    React.createElement('div', { className: "text-2xl font-black text-slate-700" }, omikujiResult?.item)
                ),
                React.createElement('button', {
                    onClick: () => {
                        setShowOmikuji(false);
                        setShowReward(null);
                        setShowInventory(true);
                    },
                    className: "w-full bg-slate-800 text-white py-5 rounded-3xl font-black shadow-lg bouncy-button"
                }, "ありがたや〜 🙏")
            )
        ),

        // --- 🎫 チケットくじ結果モーダル ---
        showLotteryModal && React.createElement('div', { className: "fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" },
            React.createElement('div', { className: `w-full max-w-sm rounded-[4rem] p-10 text-center shadow-2xl border-x-8 fade-in ${lotteryResult === 'hit' ? 'bg-gradient-to-b from-yellow-400 to-amber-500 border-yellow-200' : 'bg-white border-slate-200'}` },
                React.createElement('div', { className: "text-7xl mb-6" }, lotteryResult === 'hit' ? "🎉" : "😭"),
                React.createElement('h3', { className: `text-4xl font-black mb-4 ${lotteryResult === 'hit' ? 'text-white' : 'text-slate-800'}` }, lotteryResult === 'hit' ? "あたり！！！" : "はずれ……"),
                React.createElement('p', { className: `font-bold mb-8 ${lotteryResult === 'hit' ? 'text-white/90' : 'text-slate-500'}` },
                    lotteryResult === 'hit' ? "特別に、もう1回修行してもいいよ！✨" : "残念！また明日チャレンジしてね！"
                ),
                React.createElement('button', {
                    onClick: () => {
                        setShowLotteryModal(false);
                        if (lotteryResult === 'hit') playSound('win');
                    },
                    className: `w-full py-5 rounded-3xl font-black shadow-lg bouncy-button ${lotteryResult === 'hit' ? 'bg-white text-amber-500' : 'bg-slate-800 text-white'}`
                }, "わかった！")
            )
        ),

        showCatModal && React.createElement('div', { className: "fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" },
            React.createElement('div', { className: "bg-white rounded-[3rem] p-8 w-full max-w-sm border-4 border-purple-200 fade-in max-h-[80vh] flex flex-col shadow-2xl" },
                React.createElement('h3', { className: "text-xl font-black text-purple-600 mb-6 text-center" }, "カテゴリーの設定 ✨"),

                /* 📋 今あるカテゴリーのリスト */
                React.createElement('div', { className: "flex-1 overflow-y-auto mb-6 space-y-2 pr-2 scrollbar-custom" },
                    categories.map(cat => React.createElement('div', { key: cat.id, className: "flex items-center gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-100" },
                        React.createElement('div', { className: "w-8 h-8 flex items-center justify-center bg-white rounded-xl text-purple-500 shrink-0" },
                            !cat.isCustom && React.createElement(Icon, { name: cat.id === 'work' ? 'Briefcase' : cat.id === 'travel' ? 'Plane' : cat.id === 'gym' ? 'Music' : 'Plus', size: 16 })
                        ),
                        React.createElement('div', { className: "flex-1 font-bold text-sm truncate text-slate-700 text-left" }, cat.isCustom ? cat.name : t(cat.id)),

                        /* 🖊️ なまえをかえる（自分で作ったものだけ） */
                        cat.isCustom && React.createElement('button', {
                            onClick: () => {
                                setTempEditName(cat.name);
                                setEditingCat(cat);
                            },
                            className: "p-2 text-blue-400 hover:bg-blue-100 rounded-xl transition-colors"
                        }, React.createElement(Icon, { name: 'Edit3', size: 16 })),

                        /* ❌ 消しちゃう */
                        categories.length > 1 && React.createElement('button', {
                            onClick: () => {
                                setDeletingCat(cat);
                            },
                            className: "p-2 text-rose-400 hover:bg-rose-100 rounded-xl transition-colors"
                        }, React.createElement(Icon, { name: 'X', size: 16 }))
                    ))
                ),

                /* ➕ 新しく増やすところ */
                React.createElement('div', { className: "pt-4 border-t border-slate-100" },
                    React.createElement('p', { className: "text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest text-center" }, "Add New Category"),
                    React.createElement('input', {
                        value: newCatInput,
                        onChange: e => setNewCatInput(e.target.value),
                        placeholder: "なにを作る？",
                        className: "w-full px-4 py-3 rounded-2xl border-2 border-purple-50 text-sm font-bold mb-4 outline-none focus:border-purple-200"
                    }),
                    React.createElement('div', { className: "grid grid-cols-2 gap-3" },
                        React.createElement('button', { onClick: () => setShowCatModal(false), className: "bg-slate-100 text-slate-400 py-4 rounded-2xl font-black text-sm hover:bg-slate-200 transition-colors" }, "とじる"),
                        React.createElement('button', {
                            onClick: () => {
                                if (!newCatInput.trim()) return;
                                const newCat = { id: 'custom_' + Date.now(), name: newCatInput.trim(), isCustom: true };
                                const next = [...categories, newCat];
                                setCategories(next);
                                syncGameData({ savedCategories: next });
                                setActiveCategory(newCat.id);
                                setNewCatInput("");
                                setShowCatModal(false);
                                playSound('success');
                            },
                            className: "bg-purple-600 text-white py-4 rounded-2xl font-black text-sm shadow-lg hover:bg-purple-700 transition-colors"
                        }, "つくる！")
                    )
                )
            )
        ),
    /* --- 📝 名前をかえるための特別な画面 --- */
    editingCat && React.createElement('div', { className: "fixed inset-0 z-[700] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" },
        React.createElement('div', { className: "bg-white rounded-[3rem] p-8 w-full max-w-sm border-4 border-blue-200 fade-in" },
            React.createElement('h3', { className: "text-xl font-black text-blue-600 mb-6 text-center" }, "なまえを変える ✨"),
            React.createElement('input', {
                autoFocus: true,
                value: tempEditName,
                onChange: e => setTempEditName(e.target.value),
                className: "w-full px-5 py-4 rounded-2xl border-2 border-blue-100 text-lg font-bold mb-6 outline-none focus:border-blue-300"
            }),
            React.createElement('div', { className: "grid grid-cols-2 gap-3" },
                React.createElement('button', { onClick: () => setEditingCat(null), className: "bg-slate-100 text-slate-400 py-4 rounded-2xl font-black" }, "やめる"),
                React.createElement('button', {
                    onClick: () => {
                        if (!tempEditName.trim()) return;
                        const next = categories.map(c => c.id === editingCat.id ? { ...c, name: tempEditName.trim(), isCustom: true } : c);
                        setCategories(next);
                        syncGameData({ savedCategories: next });
                        setEditingCat(null);
                        playSound('success');
                    },
                    className: "bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg"
                }, "かえる！")
            )
        )
    ),

        /* --- ⚠️ 消す前の確認画面 --- */
        deletingCat && React.createElement('div', { className: "fixed inset-0 z-[700] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" },
            React.createElement('div', { className: "bg-white rounded-[3rem] p-8 w-full max-w-sm border-4 border-rose-200 fade-in text-center" },
                React.createElement('div', { className: "text-4xl mb-4" }, "⚠️"),
                React.createElement('h3', { className: "text-xl font-black text-rose-600 mb-2" }, "消してもいい？"),
                React.createElement('p', { className: "text-slate-500 font-bold mb-6" }, `「${deletingCat.isCustom ? deletingCat.name : t(deletingCat.id)}」を消すと、中のアイテムも消えちゃうよ！`),
                React.createElement('div', { className: "grid grid-cols-2 gap-3" },
                    React.createElement('button', { onClick: () => setDeletingCat(null), className: "bg-slate-100 text-slate-400 py-4 rounded-2xl font-black" }, "やめる"),
                    React.createElement('button', {
                        onClick: () => {
                            const next = categories.filter(c => c.id !== deletingCat.id);
                            setCategories(next);
                            const nextItems = items.filter(i => i.category !== deletingCat.id);
                            setItems(nextItems);
                            syncGameData({ savedCategories: next, savedItems: nextItems });
                            if (activeCategory === deletingCat.id) setActiveCategory(next[0].id);
                            setDeletingCat(null);
                            playSound('warning');
                        },
                        className: "bg-rose-600 text-white py-4 rounded-2xl font-black shadow-lg"
                    }, "消す！")
                )
            )
        ),

        /* 💀 びっくり！！怖いキャラが出る画面だよ 👹 */
        scaryChar && React.createElement('div', { className: "fixed inset-0 z-[999] flex items-center justify-center bg-black/90 scary-flash" },
            React.createElement('div', { className: "text-[300px] animate-wiggle select-none" }, scaryChar)
        )
    );
}

// 実行を担当する関数
const startApp = () => {
    try {
        if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
            throw new Error("Reactという道具が見つかりませんでした。インターネットがつながっているか確認してね！");
        }
        class ErrorBoundary extends React.Component {
            constructor(props) { super(props); this.state = { error: null }; }
            static getDerivedStateFromError(error) { return { error }; }
            render() {
                if (this.state.error) {
                    return React.createElement('div', { style: { padding: '20px', color: '#e11d48', fontFamily: 'sans-serif', textAlign: 'center', background: '#fff1f2', border: '2px solid #fda4af', borderRadius: '20px', margin: '20px' } },
                        React.createElement('h2', { style: { fontWeight: 'bold', marginBottom: '10px' } }, "画面をつくるときにエラーがおきたよ！ 😭"),
                        React.createElement('p', null, this.state.error.toString())
                    );
                }
                return this.props.children;
            }
        }
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(React.createElement(ErrorBoundary, null, React.createElement(App)));
    } catch (e) {
        console.error("エラーが発生しました:", e);
        document.getElementById('root').innerHTML = `
            <div style="padding: 20px; color: #e11d48; font-family: sans-serif; text-align: center; background: #fff1f2; border: 2px solid #fda4af; border-radius: 20px; margin: 20px;">
                <h2 style="font-weight: bold; margin-bottom: 10px;">エラーが起きちゃった！ 😭</h2>
                <p>${e.message}</p>
                <p style="font-size: 0.8rem; margin-top: 15px; color: #9f1239;">ページを読み込みなおすと直るかもしれないよ！</p>
            </div>
        `;
    }
};

startApp();

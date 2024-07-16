// URLからスコアを取得
function getScore() {
    const point = new URLSearchParams(window.location.search);
    return Math.floor(point.get('score'));
}

// スコアを表示する関す
function displayScore() {
    const score = Math.floor(getScore())
    if (score !== null) {
        document.getElementById('score').textContent = `SCORE: ${score}`;
    } else {
        document.getElementById('score').textContent = "You are a debacker, aren't you?";
    }
}

// 画面読み込み時にスコアを表示
window.onload = displayScore;
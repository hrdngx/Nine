// URLからスコアと名前を取得
function getScore() {
    const params = new URLSearchParams(window.location.search);
    return Math.floor(params.get('score'));
}

function getName() {
    const params = new URLSearchParams(window.location.search);
    return params.get('name');
}

// スコアを表示する関数
function displayScore() {
    const score = getScore();
    if (score !== null) {
        document.getElementById('score').textContent = `SCORE: ${score}`;
    } else {
        document.getElementById('score').textContent = "You are a debacker, aren't you?";
    }
}

// 画面読み込み時にスコアを表示
window.onload = displayScore;





const result = document.getElementById('result');

const MAX_NUMBER = 12;  // 入力できる数字の桁数、計算結果の整数部分の上限桁数

let total = null;       // 計算の途中結果
let is_calc = false;    // 「＝」で計算したかどうか
let currentNumber = ''; // 現在入力中の数字
let operator = null;    // 現在の演算子

/**
 * 数字・小数点を入力したときに行う処理。
 */
function appendNumber(val) {
    // 「＝」で計算した後に数字を押したら新しい計算を始める
    if (is_calc) clearAll();

    // 数字は小数点を除いて12桁まで
    if (val !== '.' && currentNumber.replace('.', '').length >= MAX_NUMBER) {
        return;
    }

    // 一つの数字に小数点は一つまで
    if (val === '.' && currentNumber.includes('.')) {
        return;
    }

    // 数字なしで小数点から始めたときは「0.」にする
    if (val === '.' && currentNumber === '') {
        val = '0.';
    }

    // 結果または現在の入力値が0の場合は新しい入力値で置き換え、それ以外は後ろに追加する
    if (currentNumber === '0' && val !== '.') {
        result.value = result.value.slice(0, -1) + val;
        currentNumber = val;
    } else if (result.value === '0' && val !== '.') {
        result.value = val;
        currentNumber = val;
    } else {
        result.value += val;
        currentNumber += val;
    }
}

/**
 * 演算子を入力したときに行う処理。
 */
function appendOperator(op) {
    // エラーメッセージ表示後の場合は演算子入力を行わず、次の数字入力で新しい計算を始める
    if (is_calc && total === null) {
        return;
    }

    // 「＝」で計算した後に演算子を押したら、答えに続けて計算する
    if (is_calc) {
        is_calc = false;
        currentNumber = '';
        operator = null;
    }

    // 演算子が連続した場合は、最後の演算子を新しい演算子に置き換える
    const last = result.value.slice(-1);
    if (['+', '-', '×', '÷'].includes(last)) {
        result.value = result.value.slice(0, -1) + op;
        operator = op;
        return;
    }

    // 数字も計算結果もない場合は演算子を入力しない
    if (currentNumber === '' && total === null) {
        return;
    }

    // 最初の演算子なら入力値をtotalに保存し、そうでなければ計算する
    if (operator === null && currentNumber !== '') {
        total = Number(currentNumber);
    } else if (operator !== null && currentNumber !== '') {
        calculate();
    }

    operator = op;
    result.value += op;
    currentNumber = '';
}

/**
 * 現在の入力値を保存している演算子を使って計算し、計算結果を保存する。
 */
function calculate() {
    const num = Number(currentNumber);

    // 0で割れない、または直前の計算で失敗している場合はNaNを保持して処理を中止
    if (isNaN(total) || (operator === '÷' && num === 0)) {
        total = NaN;
        return false;
    }

    if (operator === '+') total += num;
    if (operator === '-') total -= num;
    if (operator === '×') total *= num;
    if (operator === '÷') total /= num;
    currentNumber = '';
}

/**
 * 「＝」を押したときの処理。
 * 計算結果を表示して計算履歴に追加する。
 */
function equal() {
    // 演算子と現在の入力値がそろっていない（計算式として成立していない）場合は計算しない
    if (operator === null || currentNumber === '') {
        return;
    }

    // 計算に失敗した場合は、「＝」を押したタイミングでエラーメッセージを表示
    if (calculate() === false) {
        clearAll();
        result.value = '0では割れません';
        is_calc = true;
        return;
    }

    // 計算結果を小数第8位まで丸め、末尾の0を表示しない
    const answer = Number(total.toFixed(8));

    // NaNまたは整数部分が12桁を超える場合はエラーとして扱う
    if (isNaN(answer) || Math.abs(answer) >= 10 ** MAX_NUMBER) {
        clearAll();
        result.value = '桁数が多すぎます';
        is_calc = true;
        return;
    }

    // 計算式と答えを履歴の先頭に追加する
    const item = document.createElement('div');
    item.textContent = result.value + '=' + answer;
    document.getElementById('history').prepend(item);

    // 計算結果を表示し、次の計算で使えるようにtotalへ保存する
    result.value = answer;
    total = answer;

    currentNumber = '';
    operator = null;
    is_calc = true;
}

/**
 * クリアキー（「C」キー）を押したときの処理。
 * 電卓の表示と計算状態を初期状態に戻す。
 */
function clearAll() {
    result.value = '0';
    total = null;
    is_calc = false;
    currentNumber = '';
    operator = null;
}

// キーボード入力
document.onkeydown = function (event) {
    if (/^[0-9.]$/.test(event.key)) {
        appendNumber(event.key);
    } else if (event.key === '+') {
        appendOperator('+');
    } else if (event.key === '-') {
        appendOperator('-');
    } else if (event.key === '*') {
        appendOperator('×');
    } else if (event.key === '/') {
        appendOperator('÷');
    } else if (event.key === 'Enter') {
        // Enterキーでフォーカス中のボタンが実行されるのを防ぎ、電卓の計算だけを行う。
        event.preventDefault();
        equal();
    } else if (event.key === 'Escape') {
        clearAll();
    }
};
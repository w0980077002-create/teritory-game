// Состояние персонажей
let player = { hp: 120, maxHp: 120 };
let enemy = { hp: 100, maxHp: 100 };

// Переменные для хранения текущего выбора игрока
let selectedAttack = null;
let selectedBlock = null;

// Названия зон для красивого вывода в лог
const zoneNames = {
    'head': 'Голову',
    'body': 'Корпус',
    'legs': 'Ноги'
};

// Ждем, пока загрузится вся HTML-страница
document.addEventListener("DOMContentLoaded", () => {
    initCombatSystem();
});

function initCombatSystem() {
    const attackButtons = document.querySelectorAll('.btn-attack');
    const blockButtons = document.querySelectorAll('.btn-block');
    const turnButton = document.getElementById('btn-make-turn');

    // Клик по кнопкам АТАКИ
    attackButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Убираем подсветку со всех кнопок атаки
            attackButtons.forEach(b => b.classList.remove('selected-action'));
            // Подсвечиваем текущую
            btn.classList.add('selected-action');
            // Запоминаем выбор
            selectedAttack = btn.getAttribute('data-zone');
        });
    });

    // Клик по кнопкам БЛОКА
    blockButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Убираем подсветку со всех кнопок блока
            blockButtons.forEach(b => b.classList.remove('selected-action'));
            // Подсвечиваем текущую
            btn.classList.add('selected-action');
            // Запоминаем выбор
            selectedBlock = btn.getAttribute('data-zone');
        });
    });

    // Клик по кнопке "СДЕЛАТЬ ХОД"
    if (turnButton) {
        turnButton.addEventListener('click', calculateTurn);
    }
}

// Логика расчета раунда
function calculateTurn() {
    if (!selectedAttack || !selectedBlock) {
        alert("Выберите зону атаки и зону блока!");
        return;
    }

    const zones = ['head', 'body', 'legs'];
    // Рандомный выбор Местного хулигана
    let enemyAttack = zones[Math.floor(Math.random() * zones.length)];
    let enemyBlock = zones[Math.floor(Math.random() * zones.length)];

    let logEntries = [];
    let dmg = 15; // Фиксированный базовый урон

    // Просчет атаки игрока
    if (selectedAttack === enemyBlock) {
        logEntries.push(`🛡️ Вы ударили в <b>${zoneNames[selectedAttack]}</b>, но Хулиган заблокировал удар.`);
    } else {
        enemy.hp -= dmg;
        if (enemy.hp < 0) enemy.hp = 0;
        logEntries.push(`💥 Вы успешно пробили Хулигана в <b>${zoneNames[selectedAttack]}</b>! Урон: -${dmg}.`);
    }

    // Просчет атаки хулигана
    if (enemyAttack === selectedBlock) {
        logEntries.push(`🛡️ Хулиган метил в <b>${zoneNames[enemyAttack]}</b>, но вы заблокировали его.`);
    } else {
        player.hp -= dmg;
        if (player.hp < 0) player.hp = 0;
        logEntries.push(`🥊 Хулиган ударил вас в <b>${zoneNames[enemyAttack]}</b>. Урон: -${dmg}.`);
    }

    // Обновляем визуальную часть экрана
    renderStatus(logEntries.join('<br>'));
    
    // Сбрасываем выбор и стили кнопок для следующего хода
    resetTurnSelection();
}

// Обновление полосок здоровья и истории на экране
function renderStatus(roundLog) {
    const playerBar = document.getElementById('player-hp-bar');
    const enemyBar = document.getElementById('enemy-hp-bar');
    const logElement = document.getElementById('combat-log');

    // Расчет процентов для CSS-ширины полосок
    if (playerBar) playerBar.style.width = `${(player.hp / player.maxHp) * 100}%`;
    if (enemyBar) enemyBar.style.width = `${(enemy.hp / enemy.maxHp) * 100}%`;

    // Добавляем новые записи наверх истории боя
    if (logElement) {
        if (logElement.innerHTML === "Ожидание хода...") {
            logElement.innerHTML = roundLog;
        } else {
            logElement.innerHTML = roundLog + "<br><hr style='border-color:#333'><br>" + logElement.innerHTML;
        }
    }

    // Проверка условий победы/поражения
    checkBattleResult(logElement);
}

function resetTurnSelection() {
    selectedAttack = null;
    selectedBlock = null;
    document.querySelectorAll('.btn-attack, .btn-block').forEach(b => b.classList.remove('selected-action'));
}

function checkBattleResult(logElement) {
    if (player.hp <= 0 || enemy.hp <= 0) {
        // Выключаем кнопку хода
        document.getElementById('btn-make-turn').disabled = true;
        
        let endMessage = "";
        if (player.hp <= 0 && enemy.hp <= 0) {
            endMessage = "<br><b style='color: orange;'>⚔️ Ничья! Оба бойца упали без сил.</b>";
        } else if (enemy.hp <= 0) {
            endMessage = "<br><b style='color: #4caf50;'>🎉 Победа! Местный хулиган повержен. Получено 1000 золотых!</b>";
        } else {
            endMessage = "<br><b style='color: #f44336;'>💀 Поражение. Вы потеряли сознание и отправлены в больницу.</b>";
        }
        logElement.innerHTML = endMessage + "<br><br>" + logElement.innerHTML;
    }
}

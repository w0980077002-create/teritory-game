// Состояние боя
let playerHp = 120;
let playerMaxHp = 120;
let enemyHp = 100;
let enemyMaxHp = 100;

let selectedAttack = null; // Выбранная зона атаки
let selectedBlock = null;  // Выбранная зона защиты

// Перевод зон для вывода в лог боя
const zoneText = { 'head': 'Голову', 'body': 'Корпус', 'legs': 'Ноги' };

document.addEventListener("DOMContentLoaded", () => {
    // 1. Автоматически находим кнопки по тексту на них
    const allButtons = Array.from(document.querySelectorAll('button'));
    
    // Фильтруем кнопки для атаки и блока (ищем по три кнопки "Голова", "Корпус", "Ноги")
    const attackSectionBtns = allButtons.slice(0, 3); // Первые три кнопки сверху
    const blockSectionBtns = allButtons.slice(3, 6);  // Следующие три кнопки ниже
    
    // Находим главную кнопку "СДЕЛАТЬ ХОД" (ищем по тексту)
    const turnBtn = allButtons.find(b => b.textContent.includes('СДЕЛАТЬ ХОД'));
    
    // Находим блок истории боя
    const logContainer = document.querySelector('.combat-log-text') || document.getElementById('combat-log') || allButtons[allButtons.length - 1].nextElementSibling;

    const zones = ['head', 'body', 'legs'];

    // 2. Вешаем логику на кнопки АТАКИ
    attackSectionBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            attackSectionBtns.forEach(b => b.classList.remove('zone-btn-active'));
            btn.classList.add('zone-btn-active'); // Включаем наш новый CSS-класс
            selectedAttack = zones[index];
            console.log("Выбрана атака в зону:", selectedAttack);
        });
    });

    // 3. Вешаем логику на кнопки БЛОКА
    blockSectionBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            blockSectionBtns.forEach(b => b.classList.remove('zone-btn-active'));
            btn.classList.add('zone-btn-active'); // Включаем наш новый CSS-класс
            selectedBlock = zones[index];
            console.log("Выбран блок зоны:", selectedBlock);
        });
    });

    // 4. Логика кнопки "СДЕЛАТЬ ХОД"
    if (turnBtn) {
        turnBtn.addEventListener('click', () => {
            if (!selectedAttack || !selectedBlock) {
                alert("Выберите зону атаки и зону блока!");
                return;
            }

            // Рандомный выбор Местного хулигана
            let enemyAttack = zones[Math.floor(Math.random() * 3)];
            let enemyBlock = zones[Math.floor(Math.random() * 3)];

            let turnLogs = [];
            let dmg = 15; // Базовый урон игры

            // Считаем урон по врагу
            if (selectedAttack === enemyBlock) {
                turnLogs.push(`🛡️ Вы замахнулись в <b>${zoneText[selectedAttack]}</b>, но Хулиган заблокировал удар.`);
            } else {
                enemyHp = Math.max(0, enemyHp - dmg);
                turnLogs.push(`💥 Вы успешно пробили Хулигана в <b>${zoneText[selectedAttack]}</b>! Урон: -${dmg}.`);
            }

            // Считаем урон по игроку
            if (enemyAttack === selectedBlock) {
                turnLogs.push(`🛡️ Местный хулиган пытался ударить в <b>${zoneText[enemyAttack]}</b>, но вы поставили блок!`);
            } else {
                playerHp = Math.max(0, playerHp - dmg);
                turnLogs.push(`🥊 Хулиган нанес вам удар в <b>${zoneText[enemyAttack]}</b>. Урон: -${dmg}.`);
            }

            // Выводим результат раунда в историю боя
            if (logContainer) {
                let currentText = logContainer.innerHTML;
                if (currentText.includes("Ожидание хода...")) currentText = "";
                
                logContainer.innerHTML = turnLogs.join('<br>') + "<br><hr style='border-color:#2a2a2a'><br>" + currentText;
            }

            // Проверяем завершение боя
            if (playerHp <= 0 || enemyHp <= 0) {
                turnBtn.disabled = true;
                let endMessage = "";
                if (playerHp <= 0 && enemyHp <= 0) {
                    endMessage = "<br><b style='color: #8a8a93;'>⚔️ Ничья! Оба бойца без сил.</b>";
                } else if (enemyHp <= 0) {
                    endMessage = "<br><b style='color: #2ecc71;'>🎉 Победа! Местный хулиган повержен. Вы получили золото!</b>";
                } else {
                    endMessage = "<br><b style='color: #e74c3c;'>💀 Поражение. Вас унесли в больницу...</b>";
                }
                logContainer.innerHTML = endMessage + "<br><br>" + logContainer.innerHTML;
            }

            // Сбрасываем выбор кнопок для следующего раунда
            selectedAttack = null;
            selectedBlock = null;
            attackSectionBtns.forEach(b => b.classList.remove('zone-btn-active'));
            blockSectionBtns.forEach(b => b.classList.remove('zone-btn-active'));
        });
    }
});

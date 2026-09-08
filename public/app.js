/* Активное состояние кнопок зон при нажатии */
.zone-btn-active {
    border: 1px solid #e74c3c !important;
    background-color: rgba(231, 76, 60, 0.1) !important;
    color: #fff !important;
}

/* Контейнер подложки (серый фон полоски) */
.hp-bar-bg {
    width: 100%;
    height: 8px;
    background-color: #2a2a2a;
    border-radius: 4px;
    margin-top: 4px;
    overflow: hidden;
}

/* Общий стиль для заполнения полосок */
.hp-fill {
    height: 100%;
    width: 100%;
    transition: width 0.3s ease-in-out;
}

/* Цвет твоей полоски (зеленый) */
.player-hp {
    background-color: #2ecc71;
}

/* Цвет полоски хулигана (красный) */
.enemy-hp {
    background-color: #e74c3c;
}

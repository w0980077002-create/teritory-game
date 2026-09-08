import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

// ИГРОВЫЕ БАЗЫ ДАННЫХ
const SHOP_ITEMS = [
  { id: 'w1', name: 'Нож новичка', type: 'weapon', price: 50, stat: 5, desc: '+5 к урону' },
  { id: 'w2', name: 'Тяжелый Кастет', type: 'weapon', price: 120, stat: 12, desc: '+12 к урону' },
  { id: 'a1', name: 'Кожаная куртка', type: 'armor', price: 200, stat: 40, desc: '+40 к макс. HP' },
  { id: 'w3', name: 'Меч Наемника', type: 'weapon', price: 450, stat: 25, desc: '+25 к урону. Нужен ур. 2' }
];

const BOTS = [
  { id: 'bot1', name: 'Сумасшедшая Крыса', level: 1, hp: 50, maxHp: 50, dmg: 4, expReward: 20, goldReward: 15, dropChance: 0.3, dropItemId: 'w1' },
  { id: 'bot2', name: 'Мародер Окраины', level: 2, hp: 120, maxHp: 120, dmg: 9, expReward: 45, goldReward: 40, dropChance: 0.2, dropItemId: 'w2' },
  { id: 'bot3', name: 'Главарь Банды', level: 3, hp: 250, maxHp: 250, dmg: 16, expReward: 80, goldReward: 90, dropChance: 0.15, dropItemId: 'a1' }
];

function App() {
  // СОСТОЯНИЕ ИГРОКА
  const [player, setPlayer] = useState({
    name: 'Странник Ворон',
    level: 1,
    exp: 0,
    maxExp: 100,
    ria: 300,
    hp: 100,
    maxHp: 100,
    energy: 100,
    maxEnergy: 100,
    stats: { strength: 5, agility: 5, intuition: 5, endurance: 5 },
    statPoints: 0,
    equipment: { weapon: null, armor: null },
    inventory: []
  });

  // НАВИГАЦИЯ И СОСТОЯНИЯ ОКОН
  const [activeTab, setActiveTab] = useState('main'); // main, character, inventory, arena, shop, hospital
  const [inCombat, setInCombat] = useState(false);
  const [currentBot, setCurrentBot] = useState(null);

  // СИСТЕМА УДАРОВ И БЛОКОВ
  const [selectedStrike, setSelectedStrike] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');

  // ЧАТ И ЛОГИ БОЯ
  const [chatMessages, setChatMessages] = useState([
    { id: 1, time: '02:10', author: 'Админ', text: 'Добро пожаловать в возрожденную Территорию!', type: 'system' },
    { id: 2, time: '02:11', author: 'Игрок_Линк', text: 'Всем ку! Кто на арену?', type: 'msg' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const addLog = (text, type = 'msg', author = '') => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setChatMessages(prev => [...prev, { id: Date.now() + Math.random(), time: timeStr, author, text, type }]);
  };

  // ХАРАКТЕРИСТИКИ С УЧЕТОМ ЭКИПИРОВКИ
  const getEffectiveStats = () => {
    let bonusDmg = 0;
    let bonusHp = 0;
    if (player.equipment.weapon) bonusDmg += player.equipment.weapon.stat;
    if (player.equipment.armor) bonusHp += player.equipment.armor.stat;
    return {
      damage: player.stats.strength + bonusDmg,
      maxHp: player.stats.endurance * 20 + bonusHp
    };
  };

  const effStats = getEffectiveStats();

  // ПОКУПКА В МАГАЗИНЕ
  const handleBuyItem = (item) => {
    if (item.id === 'w3' && player.level < 2) {
      alert('Этот меч требует 2 уровень!');
      return;
    }
    if (player.ria >= item.price) {
      setPlayer(prev => ({
        ...prev,
        ria: prev.ria - item.price,
        inventory: [...prev.inventory, { ...item, instanceId: Date.now() }]
      }));
      addLog(`Вы купили [${item.name}] за ${item.price} Ria.`, 'system');
    } else {
      alert('Недостаточно монет Ria!');
    }
  };

  // ЭКИПИРОВКА ПРЕДМЕТА
  const handleEquipItem = (item) => {
    setPlayer(prev => {
      const newEquipment = { ...prev.equipment };
      let newInventory = prev.inventory.filter(i => i.instanceId !== item.instanceId);
      
      if (newEquipment[item.type]) {
        newInventory.push(newEquipment[item.type]);
      }
      newEquipment[item.type] = item;

      return { ...prev, equipment: newEquipment, inventory: newInventory };
    });
  };

  // СНЯТИЕ ПРЕДМЕТА
  const handleUnequipItem = (type) => {
    if (!player.equipment[type]) return;
    setPlayer(prev => ({
      ...prev,
      inventory: [...prev.inventory, prev.equipment[type]],
      equipment: { ...prev.equipment, [type]: null }
    }));
  };

  // БОЛЬНИЦА: ВОССТАНОВЛЕНИЕ
  const handleHeal = () => {
    setPlayer(prev => ({ ...prev, hp: effStats.maxHp, energy: prev.maxEnergy }));
    addLog('Вы отдохнули в больнице. Здоровье и Энергия восстановлены!', 'system');
  };

  // НАЧАЛО БОЯ С БОТОМ
  const startBotCombat = (bot) => {
    if (player.hp <= 5) {
      alert('У вас слишком мало здоровья для боя! Подлечитесь в Больнице.');
      return;
    }
    setCurrentBot({ ...bot });
    setInCombat(true);
    setActiveTab('arena');
    setSelectedStrike('');
    setSelectedBlock('');
    addLog(`Бой начался! Ваш противник: ${bot.name} [${bot.level}]`, 'system');
  };

  // ЛОГИКА ОДНОГО ХОДА В БОЮ
  const handleCombatTurn = () => {
    if (!selectedStrike || !selectedBlock || !currentBot) return;

    // Генерируем рандомный ход бота
    const zones = ['head', 'chest', 'belly', 'belt', 'legs'];
    const botBlocks = [
      ['head', 'chest'],
      ['chest', 'belly'],
      ['belly', 'belt'],
      ['belt', 'legs']
    ];
    const botStrike = zones[Math.floor(Math.random() * zones.length)];
    const botBlockGroup = botBlocks[Math.floor(Math.random() * botBlocks.length)];

    let pDamage = effStats.damage;
    let bDamage = currentBot.dmg;

    // 1. Удар игрока по боту
    let playerLog = '';
    if (botBlockGroup.includes(selectedStrike)) {
      playerLog = `Вы нанесли удар в зону [${selectedStrike}], но ${currentBot.name} заблокировал его! (-0 HP)`;
      pDamage = 0;
    } else {
      const isCrit = Math.random() < (player.stats.intuition * 0.02);
      const isEvade = Math.random() < 0.05;
      if (isEvade) {
        playerLog = `${currentBot.name} ловко увернулся от вашего удара!`;
        pDamage = 0;
      } else if (isCrit) {
        pDamage *= 2;
        playerLog = `КРИТ! Вы сокрушительно пробили [${selectedStrike}] бота ${currentBot.name} на <span class="log-crit">-${pDamage} HP</span>!`;
      } else {
        playerLog = `Вы ударили ${currentBot.name} в зону [${selectedStrike}] на -${pDamage} HP.`;
      }
    }

    // Применяем урон к боту
    const nextBotHp = Math.max(0, currentBot.hp - pDamage);
    
    // 2. Удар бота по игроку (если бот еще жив)
    let botLog = '';
    if (nextBotHp > 0) {
      const playerBlockZones = selectedBlock.split('+');
      if (playerBlockZones.includes(botStrike)) {
        botLog = `${currentBot.name} пытался ударить в [${botStrike}], но вы заблокировали атаку.`;
        bDamage = 0;
      } else {
        const isPlayerEvade = Math.random() < (player.stats.agility * 0.02);
        if (isPlayerEvade) {
          botLog = `Вы грациозно увернулись от атаки бота!`;
          bDamage = 0;
        } else {
          botLog = `${currentBot.name} нанес вам удар в область [${botStrike}] на -${bDamage} HP.`;
        }
      }
    } else {
      bDamage = 0;
    }

    const nextPlayerHp = Math.max(0, player.hp - bDamage);

    // Выводим логи хода
    addLog(playerLog, 'combat');
    if (botLog) addLog(botLog, 'combat');

    // Проверяем исходы боя
    if (nextBotHp <= 0) {
      // Победа! Расчет наград
      let lootText = '';
      let earnedItem = null;
      if (Math.random() < currentBot.dropChance) {
        earnedItem = SHOP_ITEMS.find(i => i.id === currentBot.dropItemId);
        if (earnedItem) lootText = ` Найдено: [${earnedItem.name}]!`;
      }

      let newExp = player.exp + currentBot.expReward;
      let newLevel = player.level;
      let newStatPoints = player.statPoints;
      let newMaxExp = player.maxExp;

      if (newExp >= player.maxExp) {
        newLevel += 1;
        newExp = newExp - player.maxExp;
        newMaxExp = newLevel * 100;
        newStatPoints += 3;
        addLog(`ПОВЫШЕНИЕ УРОВНЯ! Вы достигли ${newLevel} уровня! Получено 3 очка характеристик.`, 'system');
      }

      setPlayer(prev => ({
        ...prev,
        ria: prev.ria + currentBot.goldReward,
        exp: newExp,
        level: newLevel,
        maxExp: newMaxExp,
        statPoints: newStatPoints,
        hp: nextPlayerHp,
        inventory: earnedItem ? [...prev.inventory, { ...earnedItem, instanceId: Date.now() }] : prev.inventory
      }));

      addLog(`Бой завершен! Победа над ${currentBot.name}. Получено Опыта: +${currentBot.expReward}, Монет: +${currentBot.goldReward} Ria.${lootText}`, 'system');
      setInCombat(false);
      setCurrentBot(null);
    } else if (nextPlayerHp <= 0) {
      // Поражение
      setPlayer(prev => ({ ...prev, hp: 1 }));
      addLog(`Вы проиграли бой и потеряли сознание. Вас доставили в Больницу с 1 HP.`, 'system');
      setInCombat(false);
      setCurrentBot(null);
      setActiveTab('hospital');
    } else {
      // Бой продолжается, обновляем параметры
      setCurrentBot(prev => ({ ...prev, hp: nextBotHp }));
      setPlayer(prev => ({ ...prev, hp: nextPlayerHp }));
    }

    // Сбрасываем выбор для следующего раунда
    setSelectedStrike('');
    setSelectedBlock('');
  };

  // ОТПРАВКА СТАНДАРТНОГО СООБЩЕНИЯ В ЧАТ
  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    addLog(chatInput, 'msg', player.name);
    setChatInput('');
  };

  return (
    <div className="game-container">
      {/* ВЕРХНЯЯ ШАПКА ХАРАКТЕРИСТИК */}
      <div className="game-header">
        <div className="stats-row">
          <div><strong>{player.name}</strong> [ ур. {player.level} ]</div>
          <div>💰 {player.ria} Ria</div>
        </div>
        <div className="stats-row" style={{ fontSize: '11px', color: '#a68b72' }}>
          <div>Опыт: {player.exp} / {player.maxExp}</div>
        </div>
        <div className="stats-row" style={{ marginTop: '8px' }}>

/* =========================================================
   TERRITORY
   Игровая логика + 3D арена Three.js
   ========================================================= */


/* =========================================================
   ДАННЫЕ ИГРОКА
   ========================================================= */

var p = {
    hp: 120,
    maxHp: 120,
    coins: 1000,
    level: 1,
    exp: 0,
    maxExp: 100,
    weapon: "Кулаки",
    bonusDamage: 0,
    strength: 5,
    agility: 5,
    freePoints: 0
};

var e = {
    name: "Местный хулиган",
    hp: 100,
    maxHp: 100
};

var selA = null;
var selB = null;


/* =========================================================
   ЗАГРУЗКА СОХРАНЕНИЯ
   ========================================================= */

try {
    var s = localStorage.getItem("territory_save");

    if (s) {
        p = JSON.parse(s);
    }

} catch (err) {}


/* =========================================================
   СОХРАНЕНИЕ
   ========================================================= */

function save() {

    try {
        localStorage.setItem(
            "territory_save",
            JSON.stringify(p)
        );

    } catch (e) {}

}


/* =========================================================
   3D ARENA
   ========================================================= */

var battle3D = {
    scene: null,
    camera: null,
    renderer: null,

    player: null,
    enemy: null,

    playerGroup: null,
    enemyGroup: null,

    playerBody: null,
    enemyBody: null,

    playerArmL: null,
    playerArmR: null,
    enemyArmL: null,
    enemyArmR: null,

    playerLegL: null,
    playerLegR: null,
    enemyLegL: null,
    enemyLegR: null,

    initialized: false,

    playerAction: "idle",
    enemyAction: "idle",

    actionTime: 0
};


/* =========================================================
   СОЗДАНИЕ 3D ПЕРСОНАЖА
   ========================================================= */

function createFighter(isPlayer) {

    var group = new THREE.Group();

    var bodyMaterial = new THREE.MeshStandardMaterial({
        color: isPlayer ? 0x246bfe : 0x9e3028,
        roughness: 0.65,
        metalness: 0.05
    });

    var skinMaterial = new THREE.MeshStandardMaterial({
        color: 0xd99a72,
        roughness: 0.8
    });

    var darkMaterial = new THREE.MeshStandardMaterial({
        color: 0x181820,
        roughness: 0.8
    });


    /* ТУЛОВИЩЕ */

    var bodyGeometry = new THREE.BoxGeometry(
        0.85,
        1.15,
        0.55
    );

    var body = new THREE.Mesh(
        bodyGeometry,
        bodyMaterial
    );

    body.position.y = 1.45;

    group.add(body);


    /* ГОЛОВА */

    var headGeometry = new THREE.SphereGeometry(
        0.36,
        20,
        20
    );

    var head = new THREE.Mesh(
        headGeometry,
        skinMaterial
    );

    head.position.y = 2.35;

    group.add(head);


    /* ВОЛОСЫ */

    var hairGeometry = new THREE.SphereGeometry(
        0.37,
        20,
        10,
        0,
        Math.PI * 2,
        0,
        Math.PI * 0.55
    );

    var hair = new THREE.Mesh(
        hairGeometry,
        darkMaterial
    );

    hair.position.y = 2.43;

    group.add(hair);


    /* ЛЕВАЯ РУКА */

    var armGeometry = new THREE.BoxGeometry(
        0.22,
        0.85,
        0.22
    );

    var armL = new THREE.Mesh(
        armGeometry,
        bodyMaterial
    );

    armL.position.set(
        -0.58,
        1.55,
        0
    );

    group.add(armL);


    /* ПРАВАЯ РУКА */

    var armR = new THREE.Mesh(
        armGeometry,
        bodyMaterial
    );

    armR.position.set(
        0.58,
        1.55,
        0
    );

    group.add(armR);


    /* ЛЕВАЯ НОГА */

    var legGeometry = new THREE.BoxGeometry(
        0.28,
        0.85,
        0.28
    );

    var legL = new THREE.Mesh(
        legGeometry,
        darkMaterial
    );

    legL.position.set(
        -0.23,
        0.48,
        0
    );

    group.add(legL);


    /* ПРАВАЯ НОГА */

    var legR = new THREE.Mesh(
        legGeometry,
        darkMaterial
    );

    legR.position.set(
        0.23,
        0.48,
        0
    );

    group.add(legR);


    /* КИСТИ */

    var fistGeometry = new THREE.SphereGeometry(
        0.16,
        12,
        12
    );

    var fistL = new THREE.Mesh(
        fistGeometry,
        skinMaterial
    );

    fistL.position.set(
        -0.58,
        1.08,
        0
    );

    group.add(fistL);


    var fistR = new THREE.Mesh(
        fistGeometry,
        skinMaterial
    );

    fistR.position.set(
        0.58,
        1.08,
        0
    );

    group.add(fistR);


    return {
        group: group,
        body: body,
        armL: armL,
        armR: armR,
        legL: legL,
        legR: legR
    };
}


/* =========================================================
   3D ARENA ИНИЦИАЛИЗАЦИЯ
   ========================================================= */

function init3DArena() {

    var container = document.getElementById("battle-3d");

    if (!container) {
        return;
    }

    if (typeof THREE === "undefined") {
        console.log("Three.js не загрузился.");
        return;
    }

    if (battle3D.initialized) {
        return;
    }


    /* СЦЕНА */

    battle3D.scene = new THREE.Scene();

    battle3D.scene.background =
        new THREE.Color(0x08080f);


    /* КАМЕРА */

    battle3D.camera =
        new THREE.PerspectiveCamera(
            45,
            container.clientWidth /
            container.clientHeight,
            0.1,
            100
        );

    battle3D.camera.position.set(
        0,
        2.5,
        7
    );

    battle3D.camera.lookAt(
        0,
        1.35,
        0
    );


    /* РЕНДЕР */

    battle3D.renderer =
        new THREE.WebGLRenderer({
            antialias: true,
            alpha: false
        });

    battle3D.renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );

    battle3D.renderer.setSize(
        container.clientWidth,
        container.clientHeight
    );

    container.innerHTML = "";

    container.appendChild(
        battle3D.renderer.domElement
    );


    /* СВЕТ */

    var ambient =
        new THREE.HemisphereLight(
            0xffffff,
            0x202030,
            2
        );

    battle3D.scene.add(ambient);


    var mainLight =
        new THREE.DirectionalLight(
            0xffffff,
            2.5
        );

    mainLight.position.set(
        -3,
        6,
        5
    );

    battle3D.scene.add(mainLight);


    var redLight =
        new THREE.PointLight(
            0xe74c3c,
            5,
            8
        );

    redLight.position.set(
        3,
        3,
        2
    );

    battle3D.scene.add(redLight);


    /* ПОЛ АРЕНЫ */

    var floorGeometry =
        new THREE.CylinderGeometry(
            3.8,
            3.8,
            0.25,
            48
        );

    var floorMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x171720,
            roughness: 0.85
        });

    var floor =
        new THREE.Mesh(
            floorGeometry,
            floorMaterial
        );

    floor.position.y = -0.15;

    battle3D.scene.add(floor);


    /* КРУГ НА ПОЛУ */

    var ringGeometry =
        new THREE.TorusGeometry(
            3.1,
            0.035,
            8,
            64
        );

    var ringMaterial =
        new THREE.MeshBasicMaterial({
            color: 0xe74c3c
        });

    var ring =
        new THREE.Mesh(
            ringGeometry,
            ringMaterial
        );

    ring.rotation.x =
        Math.PI / 2;

    ring.position.y = 0.01;

    battle3D.scene.add(ring);


    /* ЗАДНЯЯ СТЕНА */

    var wallGeometry =
        new THREE.PlaneGeometry(
            12,
            7
        );

    var wallMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x0e0e16,
            roughness: 1
        });

    var wall =
        new THREE.Mesh(
            wallGeometry,
            wallMaterial
        );

    wall.position.set(
        0,
        2.4,
        -2
    );

    battle3D.scene.add(wall);


    /* ИГРОК */

    var player =
        createFighter(true);

    player.group.position.set(
        -1.45,
        0,
        0
    );

    player.group.rotation.y =
        -Math.PI / 8;

    battle3D.scene.add(
        player.group
    );

    battle3D.playerGroup =
        player.group;

    battle3D.playerBody =
        player.body;

    battle3D.playerArmL =
        player.armL;

    battle3D.playerArmR =
        player.armR;

    battle3D.playerLegL =
        player.legL;

    battle3D.playerLegR =
        player.legR;


    /* ВРАГ */

    var enemy =
        createFighter(false);

    enemy.group.position.set(
        1.45,
        0,
        0
    );

    enemy.group.rotation.y =
        Math.PI + Math.PI / 8;

    battle3D.scene.add(
        enemy.group
    );

    battle3D.enemyGroup =
        enemy.group;

    battle3D.enemyBody =
        enemy.body;

    battle3D.enemyArmL =
        enemy.armL;

    battle3D.enemyArmR =
        enemy.armR;

    battle3D.enemyLegL =
        enemy.legL;

    battle3D.enemyLegR =
        enemy.legR;


    /* РАЗМЕР ПРИ ПОВОРОТЕ ТЕЛЕФОНА */

    window.addEventListener(
        "resize",
        resize3DArena
    );


    battle3D.initialized = true;

    animate3DArena();
}


/* =========================================================
   RESIZE
   ========================================================= */

function resize3DArena() {

    var container =
        document.getElementById(
            "battle-3d"
        );

    if (
        !container ||
        !battle3D.camera ||
        !battle3D.renderer
    ) {
        return;
    }

    battle3D.camera.aspect =
        container.clientWidth /
        container.clientHeight;

    battle3D.camera.updateProjectionMatrix();

    battle3D.renderer.setSize(
        container.clientWidth,
        container.clientHeight
    );
}


/* =========================================================
   3D АНИМАЦИЯ
   ========================================================= */

function animate3DArena() {

    requestAnimationFrame(
        animate3DArena
    );

    if (
        !battle3D.renderer ||
        !battle3D.scene ||
        !battle3D.camera
    ) {
        return;
    }


    var time =
        performance.now() * 0.002;


    /* IDLE ИГРОКА */

    if (battle3D.playerGroup) {

        if (
            battle3D.playerAction === "idle"
        ) {

            battle3D.playerGroup.position.y =
                Math.sin(time * 1.5) * 0.025;

            battle3D.playerArmL.rotation.z =
                Math.sin(time * 1.5) * 0.04;

            battle3D.playerArmR.rotation.z =
                -Math.sin(time * 1.5) * 0.04;
        }
    }


    /* IDLE ВРАГА */

    if (battle3D.enemyGroup) {

        if (
            battle3D.enemyAction === "idle"
        ) {

            battle3D.enemyGroup.position.y =
                Math.sin(time * 1.3 + 1) * 0.025;

            battle3D.enemyArmL.rotation.z =
                -Math.sin(time * 1.3) * 0.04;

            battle3D.enemyArmR.rotation.z =
                Math.sin(time * 1.3) * 0.04;
        }
    }


    /* АТАКА ИГРОКА */

    if (
        battle3D.playerAction === "attack"
    ) {

        battle3D.playerGroup.position.x =
            -1.45 +
            Math.sin(
                battle3D.actionTime * Math.PI
            ) * 0.65;

        battle3D.playerArmR.rotation.z =
            -Math.sin(
                battle3D.actionTime * Math.PI
            ) * 1.4;

        battle3D.actionTime += 0.035;

        if (
            battle3D.actionTime >= 1
        ) {

            battle3D.actionTime = 0;

            battle3D.playerAction =
                "idle";

            battle3D.playerGroup.position.x =
                -1.45;

            battle3D.playerArmR.rotation.z =
                0;
        }
    }


    /* АТАКА ВРАГА */

    if (
        battle3D.enemyAction === "attack"
    ) {

        battle3D.enemyGroup.position.x =
            1.45 -
            Math.sin(
                battle3D.actionTime * Math.PI
            ) * 0.65;

        battle3D.enemyArmL.rotation.z =
            Math.sin(
                battle3D.actionTime * Math.PI
            ) * 1.4;

        battle3D.actionTime += 0.035;

        if (
            battle3D.actionTime >= 1
        ) {

            battle3D.actionTime = 0;

            battle3D.enemyAction =
                "idle";

            battle3D.enemyGroup.position.x =
                1.45;

            battle3D.enemyArmL.rotation.z =
                0;
        }
    }


    /* ПОКЛАЖИВАЕМ КАМЕРУ */

    battle3D.camera.position.y =
        2.5 +
        Math.sin(time * 0.5) * 0.025;

    battle3D.camera.lookAt(
        0,
        1.35,
        0
    );


    battle3D.renderer.render(
        battle3D.scene,
        battle3D.camera
    );
}


/* =========================================================
   ЗАПУСК 3D АТАКИ
   ========================================================= */

function playPlayerAttack() {

    if (!battle3D.initialized) {
        return;
    }

    battle3D.playerAction =
        "attack";

    battle3D.enemyAction =
        "idle";

    battle3D.actionTime = 0;
}


/* =========================================================
   ЗАПУСК АТАКИ ВРАГА
   ========================================================= */

function playEnemyAttack() {

    if (!battle3D.initialized) {
        return;
    }

    battle3D.enemyAction =
        "attack";

    battle3D.playerAction =
        "idle";

    battle3D.actionTime = 0;
}


/* =========================================================
   ПОКАЗ УДАРА
   ========================================================= */

function show3DHit(isEnemy) {

    if (!battle3D.initialized) {
        return;
    }

    var target =
        isEnemy
            ? battle3D.enemyGroup
            : battle3D.playerGroup;

    if (!target) {
        return;
    }

    var oldX =
        target.position.x;

    var oldZ =
        target.position.z;

    var direction =
        isEnemy ? 1 : -1;

    target.position.x +=
        direction * 0.12;

    setTimeout(function() {

        if (!target) {
            return;
        }

        target.position.x =
            oldX;

        target.position.z =
            oldZ;

    }, 90);

}


/* =========================================================
   DOM ГОТОВ
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {


        /* =================================================
           ВКЛАДКИ
           ================================================= */

        var tArena =
            document.getElementById(
                "tab-arena"
            );

        var tShop =
            document.getElementById(
                "tab-shop"
            );

        var tMap =
            document.getElementById(
                "tab-map"
            );

        var tProfile =
            document.getElementById(
                "tab-profile"
            );


        var pArena =
            document.getElementById(
                "page-home"
            );

        var pShop =
            document.getElementById(
                "page-shop"
            );

        var pMap =
            document.getElementById(
                "page-map"
            );

        var pProfile =
            document.getElementById(
                "page-profile"
            );


        /* =================================================
           ПЕРЕКЛЮЧЕНИЕ СТРАНИЦ
           ================================================= */

        function showPage(
            tab,
            page
        ) {

            if (pArena)
                pArena.style.display =
                    "none";

            if (pShop)
                pShop.style.display =
                    "none";

            if (pMap)
                pMap.style.display =
                    "none";

            if (pProfile)
                pProfile.style.display =
                    "none";


            if (tArena)
                tArena.classList.remove(
                    "active"
                );

            if (tShop)
                tShop.classList.remove(
                    "active"
                );

            if (tMap)
                tMap.classList.remove(
                    "active"
                );

            if (tProfile)
                tProfile.classList.remove(
                    "active"
                );


            if (page)
                page.style.display =
                    "block";

            if (tab)
                tab.classList.add(
                    "active"
                );


            updateUI();


            /* Когда возвращаемся на арену */
            if (
                page === pArena &&
                battle3D.initialized
            ) {
                resize3DArena();
            }
        }


        if (tArena)
            tArena.addEventListener(
                "click",
                function() {
                    showPage(
                        tArena,
                        pArena
                    );
                }
            );


        if (tShop)
            tShop.addEventListener(
                "click",
                function() {
                    showPage(
                        tShop,
                        pShop
                    );
                }
            );


        if (tMap)
            tMap.addEventListener(
                "click",
                function() {
                    showPage(
                        tMap,
                        pMap
                    );
                }
            );


        if (tProfile)
            tProfile.addEventListener(
                "click",
                function() {
                    showPage(
                        tProfile,
                        pProfile
                    );
                }
            );


        /* =================================================
           КНОПКИ АТАКИ
           ================================================= */

        var attHead =
            document.getElementById(
                "btn-att-head"
            );

        var attBody =
            document.getElementById(
                "btn-att-body"
            );

        var attLegs =
            document.getElementById(
                "btn-att-legs"
            );


        var blkHead =
            document.getElementById(
                "btn-blk-head"
            );

        var blkBody =
            document.getElementById(
                "btn-blk-body"
            );

        var blkLegs =
            document.getElementById(
                "btn-blk-legs"
            );


        function clearAtt() {

            if (attHead)
                attHead.classList.remove(
                    "zone-btn-active"
                );

            if (attBody)
                attBody.classList.remove(
                    "zone-btn-active"
                );

            if (attLegs)
                attLegs.classList.remove(
                    "zone-btn-active"
                );
        }


        function clearBlk() {

            if (blkHead)
                blkHead.classList.remove(
                    "zone-btn-active"
                );

            if (blkBody)
                blkBody.classList.remove(
                    "zone-btn-active"
                );

            if (blkLegs)
                blkLegs.classList.remove(
                    "zone-btn-active"
                );
        }


        /* АТАКА: ГОЛОВА */

        if (attHead)
            attHead.addEventListener(
                "click",
                function() {

                    clearAtt();

                    attHead.classList.add(
                        "zone-btn-active"
                    );

                    selA = "head";
                }
            );


        /* АТАКА: КОРПУС */

        if (attBody)
            attBody.addEventListener(
                "click",
                function() {

                    clearAtt();

                    attBody.classList.add(
                        "zone-btn-active"
                    );

                    selA = "body";
                }
            );


        /* АТАКА: НОГИ */

        if (attLegs)
            attLegs.addEventListener(
                "click",
                function() {

                    clearAtt();

                    attLegs.classList.add(
                        "zone-btn-active"
                    );

                    selA = "legs";
                }
            );


        /* БЛОК: ГОЛОВА */

        if (blkHead)
            blkHead.addEventListener(
                "click",
                function() {

                    clearBlk();

                    blkHead.classList.add(
                        "zone-btn-active"
                    );

                    selB = "head";
                }
            );


        /* БЛОК: КОРПУС */

        if (blkBody)
            blkBody.addEventListener(
                "click",
                function() {

                    clearBlk();

                    blkBody.classList.add(
                        "zone-btn-active"
                    );

                    selB = "body";
                }
            );


        /* БЛОК: НОГИ */

        if (blkLegs)
            blkLegs.addEventListener(
                "click",
                function() {

                    clearBlk();

                    blkLegs.classList.add(
                        "zone-btn-active"
                    );

                    selB = "legs";
                }
            );


        /* =================================================
           КНОПКА СДЕЛАТЬ ХОД
           ================================================= */

        var turnBtn =
            document.getElementById(
                "attack"
            );


        if (turnBtn) {

            turnBtn.addEventListener(
                "click",
                function() {


                    /* Проверка выбора */

                    if (!selA || !selB) {

                        showNotice(
                            "Выберите зоны атаки и защиты!"
                        );

                        return;
                    }


                    var zones = [
                        "head",
                        "body",
                        "legs"
                    ];


                    var zoneText = {
                        "head": "Голову",
                        "body": "Корпус",
                        "legs": "Ноги"
                    };


                    /* ВРАГ ВЫБИРАЕТ АТАКУ И БЛОК */

                    var enemyA =
                        zones[
                            Math.floor(
                                Math.random() * 3
                            )
                        ];


                    var enemyB =
                        zones[
                            Math.floor(
                                Math.random() * 3
                            )
                        ];


                    var logs = [];


                    var dmg =
                        15 +
                        p.bonusDamage;


                    var baseEnemyDmg =
                        15 +
                        (p.level * 2);


                    /* =================================================
                       АТАКА ИГРОКА
                       ================================================= */

                    playPlayerAttack();


                    if (
                        selA === enemyB
                    ) {

                        logs.push(
                            "🛡️ Вы ударили в <b>" +
                            zoneText[selA] +
                            "</b>, но Хулиган заблокировал удар."
                        );

                    } else {

                        var isCrit =
                            (Math.random() * 100) <
                            (p.strength * 3);


                        var finalPlayerDmg =
                            isCrit
                                ? dmg * 2
                                : dmg;


                        e.hp =
                            Math.max(
                                0,
                                e.hp -
                                finalPlayerDmg
                            );


                        show3DHit(true);


                        if (isCrit) {

                            logs.push(
                                "⚡💥 <b>КРИТ!</b> Вы пробили Хулигана в <b>" +
                                zoneText[selA] +
                                "</b>! Урон: -" +
                                finalPlayerDmg +
                                "."
                            );

                        } else {

                            logs.push(
                                "💥 Вы успешно пробили Хулигана в <b>" +
                                zoneText[selA] +
                                "</b>! Урон: -" +
                                finalPlayerDmg +
                                "."
                            );
                        }
                    }


                    /* =================================================
                       АТАКА ВРАГА
                       ================================================= */

                    setTimeout(
                        function() {

                            if (
                                p.hp > 0 &&
                                e.hp > 0
                            ) {

                                playEnemyAttack();
                            }

                        },
                        180
                    );


                    if (
                        enemyA === selB
                    ) {

                        logs.push(
                            "🛡️ Хулиган метил в <b>" +
                            zoneText[enemyA] +
                            "</b>, но вы заблокировали его."
                        );

                    } else {

                        var isDodge =
                            (Math.random() * 100) <
                            (p.agility * 3);


                        if (isDodge) {

                            logs.push(
                                "💨 <b>УВОРОТ!</b> Вы уклонились от удара в <b>" +
                                zoneText[enemyA] +
                                "</b>!"
                            );

                        } else {

                            p.hp =
                                Math.max(
                                    0,
                                    p.hp -
                                    baseEnemyDmg
                                );


                            show3DHit(false);


                            logs.push(
                                "🥊 Хулиган нанес вам удар в <b>" +
                                zoneText[enemyA] +
                                "</b>. Урон: -" +
                                baseEnemyDmg +
                                "."
                            );
                        }
                    }


                    /* =================================================
                       ЛОГ
                       ================================================= */

                    var logBox =
                        document.querySelector(
                            ".combat-log-text"
                        );


                    if (logBox) {

                        if (
                            logBox.innerHTML.includes(
                                "Ожидание хода..."
                            )
                        ) {

                            logBox.innerHTML =
                                "";
                        }


                        logBox.innerHTML =
                            logs.join("<br>") +
                            "<br><hr style='border-color:#2a2a2a'><br>" +
                            logBox.innerHTML;
                    }


                    /* =================================================
                       КОНЕЦ БОЯ
                       ================================================= */

                    if (
                        p.hp <= 0 ||
                        e.hp <= 0
                    ) {

                        turnBtn.disabled =
                            true;


                        if (
                            p.hp <= 0 &&
                            e.hp <= 0
                        ) {

                            logBox.innerHTML =
                                "<b>⚔️ Ничья!</b><br>" +
                                logBox.innerHTML;

                        } else if (
                            e.hp <= 0
                        ) {

                            p.coins +=
                                200 +
                                p.level * 20;


                            p.exp += 40;


                            logBox.innerHTML =
                                "<b>🎉 Победа! Награда получена!</b><br>" +
                                logBox.innerHTML;


                            if (
                                p.exp >=
                                p.maxExp
                            ) {

                                p.level += 1;

                                p.exp -=
                                    p.maxExp;

                                p.maxExp =
                                    Math.floor(
                                        p.maxExp *
                                        1.3
                                    );

                                p.freePoints +=
                                    3;

                                p.maxHp +=
                                    20;


                                logBox.innerHTML =
                                    `<b style="color:#f1c40f;">🌟 ЛЕВЕЛ АП! Получен ${p.level} уровень!</b><br>` +
                                    logBox.innerHTML;
                            }

                        } else {

                            logBox.innerHTML =
                                "<b>💀 Поражение. Восстановление...</b><br>" +
                                logBox.innerHTML;
                        }


                        setTimeout(
                            function() {

                                p.hp =
                                    p.maxHp;


                                e.hp =
                                    e.maxHp +
                                    (p.level * 10);


                                turnBtn.disabled =
                                    false;


                                if (logBox) {

                                    logBox.innerHTML =
                                        "Ожидание хода...";
                                }


                                updateUI();

                                save();

                            },
                            4000
                        );
                    }


                    /* СБРОС ВЫБОРА */

                    selA = null;

                    selB = null;

                    clearAtt();

                    clearBlk();

                    updateUI();

                    save();

                }
            );
        }


        /* =================================================
           МАГАЗИН
           ================================================= */

        var buyBrass =
            document.getElementById(
                "buy-brass"
            );


        var buyKnife =
            document.getElementById(
                "buy-knife"
            );


        if (buyBrass) {

            buyBrass.addEventListener(
                "click",
                function() {

                    if (
                        p.coins >= 150
                    ) {

                        p.coins -= 150;

                        p.weapon =
                            "Кастеты";

                        p.bonusDamage =
                            5;

                        showNotice(
                            "Куплены Кастеты!"
                        );

                        updateUI();

                        save();

                    } else {

                        showNotice(
                            "Не хватает монет!"
                        );
                    }
                }
            );
        }


        if (buyKnife) {

            buyKnife.addEventListener(
                "click",
                function() {

                    if (
                        p.coins >= 400
                    ) {

                        p.coins -= 400;

                        p.weapon =
                            "Охотничий нож";

                        p.bonusDamage =
                            12;

                        showNotice(
                            "Куплен Нож!"
                        );

                        updateUI();

                        save();

                    } else {

                        showNotice(
                            "Не хватает монет!"
                        );
                    }
                }
            );
        }


        /* =================================================
           ПРОКАЧКА СИЛЫ
           ================================================= */

        var addStr =
            document.getElementById(
                "add-str"
            );


        if (addStr) {

            addStr.addEventListener(
                "click",
                function() {

                    if (
                        p.freePoints > 0
                    ) {

                        p.freePoints--;

                        p.strength++;

                        updateUI();

                        save();
                    }
                }
            );
        }


        /* =================================================
           ПРОКАЧКА ЛОВКОСТИ
           ================================================= */

        var addAgi =
            document.getElementById(
                "add-agi"
            );


        if (addAgi) {

            addAgi.addEventListener(
                "click",
                function() {

                    if (
                        p.freePoints > 0
                    ) {

                        p.freePoints--;

                        p.agility++;

                        updateUI();

                        save();
                    }
                }
            );
        }


        /* =================================================
           UI
           ================================================= */

        updateUI();


        /* =================================================
           ЗАПУСК 3D
           ================================================= */

        setTimeout(
            function() {

                init3DArena();

            },
            100
        );

    }
);


/* =========================================================
   УВЕДОМЛЕНИЕ
   ========================================================= */

function showNotice(t) {

    var n =
        document.getElementById(
            "notice"
        );


    if (!n) {
        return;
    }


    n.innerText = t;

    n.style.display =
        "block";


    setTimeout(
        function() {

            n.style.display =
                "none";

        },
        2000
    );
}


/* =========================================================
   ОБНОВЛЕНИЕ ИНТЕРФЕЙСА
   ========================================================= */

function updateUI() {

    var coinsEl =
        document.getElementById(
            "coins"
        );


    if (coinsEl)
        coinsEl.innerText =
            p.coins;


    var lvlEl =
        document.getElementById(
            "header-level"
        );


    if (lvlEl)
        lvlEl.innerText =
            "Уровень " +
            p.level;


    var pTxt =
        document.getElementById(
            "hp-text-player"
        );


    if (pTxt)
        pTxt.innerText =
            p.hp +
            "/" +
            p.maxHp;


    var eTxt =
        document.getElementById(
            "hp-text-enemy"
        );


    if (eTxt)
        eTxt.innerText =
            e.hp +
            "/" +
            e.maxHp;


    var pFill =
        document.getElementById(
            "hp-fill-player"
        );


    if (pFill)
        pFill.style.width =
            ((p.hp / p.maxHp) * 100) +
            "%";


    var eFill =
        document.getElementById(
            "hp-fill-enemy"
        );


    if (eFill)
        eFill.style.width =
            ((e.hp / e.maxHp) * 100) +
            "%";


    var prLvl =
        document.getElementById(
            "prof-level"
        );


    if (prLvl)
        prLvl.innerText =
            p.level;


    var prWpn =
        document.getElementById(
            "prof-weapon"
        );


    if (prWpn)
        prWpn.innerText =
            p.weapon;


    var prDmg =
        document.getElementById(
            "prof-damage"
        );


    if (prDmg)
        prDmg.innerText =
            15 +
            p.bonusDamage;


    var prMhp =
        document.getElementById(
            "prof-maxhp"
        );


    if (prMhp)
        prMhp.innerText =
            p.maxHp +
            " HP";


    var prStr =
        document.getElementById(
            "prof-str"
        );


    if (prStr)
        prStr.innerText =
            p.strength;


    var prAgi =
        document.getElementById(
            "prof-agi"
        );


    if (prAgi)
        prAgi.innerText =
            p.agility;


    var prFre =
        document.getElementById(
            "prof-free"
        );


    if (prFre)
        prFre.innerText =
            p.freePoints;


    /* ОЧКИ ПРОКАЧКИ */

    var fBlock =
        document.getElementById(
            "free-points-block"
        );


    var btnS =
        document.getElementById(
            "add-str"
        );


    var btnA =
        document.getElementById(
            "add-agi"
        );


    if (fBlock) {

        if (
            p.freePoints > 0
        ) {

            fBlock.style.display =
                "block";


            if (btnS)
                btnS.style.display =
                    "inline-block";


            if (btnA)
                btnA.style.display =
                    "inline-block";

        } else {

            fBlock.style.display =
                "none";


            if (btnS)
                btnS.style.display =
                    "none";


            if (btnA)
                btnA.style.display =
                    "none";
        }
    }


    /* ОПЫТ */

    var expTxt =
        document.getElementById(
            "exp-text"
        );


    if (expTxt)
        expTxt.innerText =
            p.exp +
            " / " +
            p.maxExp +
            " XP";


    var expFil =
        document.getElementById(
            "exp-fill"
        );


    if (expFil)
        expFil.style.width =
            ((p.exp / p.maxExp) * 100) +
            "%";
}

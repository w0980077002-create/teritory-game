import * as THREE from "three";

/* =========================
   TERRITORY — 3D BATTLE
   ========================= */

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

try {
    var saved = localStorage.getItem("territory_save");
    if (saved) {
        p = JSON.parse(saved);
    }
} catch (err) {}

function save() {
    try {
        localStorage.setItem("territory_save", JSON.stringify(p));
    } catch (err) {}
}

/* =========================
   3D
   ========================= */

var battle3D = {
    scene: null,
    camera: null,
    renderer: null,

    player: null,
    enemy: null,

    playerParts: null,
    enemyParts: null,

    playerBase: null,
    enemyBase: null,

    ready: false,

    playerAction: null,
    enemyAction: null,

    actionStart: 0,

    shake: 0,
    cameraBaseX: 0,
    cameraBaseY: 0,
    cameraBaseZ: 0
};

/* =========================
   FIGHTER
   ========================= */

function createFighter(isPlayer) {

    var group = new THREE.Group();

    var bodyColor = isPlayer ? 0x2463ff : 0xb83232;
    var skinColor = 0xffc08f;
    var pantsColor = isPlayer ? 0x202c42 : 0x171717;
    var shoeColor = 0x080808;
    var hairColor = 0x151515;

    /* BODY */

    var body = new THREE.Mesh(
        new THREE.BoxGeometry(1.15, 1.45, 0.65),
        new THREE.MeshStandardMaterial({
            color: bodyColor,
            roughness: 0.8
        })
    );

    body.position.y = 2.15;
    group.add(body);

    /* HEAD */

    var head = new THREE.Mesh(
        new THREE.SphereGeometry(0.48, 20, 16),
        new THREE.MeshStandardMaterial({
            color: skinColor,
            roughness: 0.8
        })
    );

    head.position.y = 3.25;
    group.add(head);

    /* HAIR */

    var hair = new THREE.Mesh(
        new THREE.SphereGeometry(
            0.50,
            20,
            10,
            0,
            Math.PI * 2,
            0,
            Math.PI / 2
        ),
        new THREE.MeshStandardMaterial({
            color: hairColor,
            roughness: 0.9
        })
    );

    hair.position.y = 3.48;
    group.add(hair);

    /* LEGS */

    var legL = new THREE.Mesh(
        new THREE.BoxGeometry(0.38, 1.15, 0.45),
        new THREE.MeshStandardMaterial({
            color: pantsColor,
            roughness: 0.9
        })
    );

    var legR = legL.clone();

    legL.position.set(-0.27, 0.85, 0);
    legR.position.set(0.27, 0.85, 0);

    group.add(legL);
    group.add(legR);

    /* SHOES */

    var shoeL = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 0.25, 0.65),
        new THREE.MeshStandardMaterial({
            color: shoeColor,
            roughness: 1
        })
    );

    var shoeR = shoeL.clone();

    shoeL.position.set(-0.27, 0.22, 0.08);
    shoeR.position.set(0.27, 0.22, 0.08);

    group.add(shoeL);
    group.add(shoeR);

    /* ARMS */

    var armL = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 1.1, 0.3),
        new THREE.MeshStandardMaterial({
            color: skinColor,
            roughness: 0.8
        })
    );

    var armR = armL.clone();

    armL.position.set(-0.78, 2.15, 0);
    armR.position.set(0.78, 2.15, 0);

    group.add(armL);
    group.add(armR);

    /* FISTS */

    var fistL = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 12, 10),
        new THREE.MeshStandardMaterial({
            color: skinColor
        })
    );

    var fistR = fistL.clone();

    fistL.position.set(-0.78, 1.60, 0);
    fistR.position.set(0.78, 1.60, 0);

    group.add(fistL);
    group.add(fistR);

    /* STORE PARTS */

    group.userData.parts = {
        body: body,
        head: head,
        armL: armL,
        armR: armR,
        fistL: fistL,
        fistR: fistR,
        legL: legL,
        legR: legR
    };

    return group;
}

/* =========================
   3D ARENA
   ========================= */

function init3DArena() {

    var container = document.getElementById("battle-3d");

    if (!container) return;

    if (battle3D.ready) {
        resize3DArena();
        return;
    }

    var scene = new THREE.Scene();

    scene.background = new THREE.Color(0x111119);

    battle3D.scene = scene;

    /* CAMERA */

    var camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        100
    );

    camera.position.set(0, 3.8, 8.8);
    camera.lookAt(0, 2, 0);

    battle3D.camera = camera;

    battle3D.cameraBaseX = camera.position.x;
    battle3D.cameraBaseY = camera.position.y;
    battle3D.cameraBaseZ = camera.position.z;

    /* RENDERER */

    var renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false
    });

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 2)
    );

    renderer.setSize(
        container.clientWidth,
        container.clientHeight
    );

    renderer.shadowMap.enabled = true;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    battle3D.renderer = renderer;

    /* LIGHT */

    var hemi = new THREE.HemisphereLight(
        0xffffff,
        0x151522,
        2.2
    );

    scene.add(hemi);

    var light = new THREE.DirectionalLight(
        0xffffff,
        2.5
    );

    light.position.set(4, 8, 6);
    light.castShadow = true;

    scene.add(light);

    var redLight = new THREE.PointLight(
        0xff3030,
        15,
        12
    );

    redLight.position.set(0, 2, -3);

    scene.add(redLight);

    /* FLOOR */

    var floor = new THREE.Mesh(
        new THREE.CylinderGeometry(
            4.1,
            4.1,
            0.25,
            64
        ),
        new THREE.MeshStandardMaterial({
            color: 0x292731,
            roughness: 0.9,
            metalness: 0.1
        })
    );

    floor.position.y = -0.05;
    floor.receiveShadow = true;

    scene.add(floor);

    /* INNER RING */

    var ring = new THREE.Mesh(
        new THREE.TorusGeometry(
            3.1,
            0.035,
            10,
            80
        ),
        new THREE.MeshBasicMaterial({
            color: 0x9293a8
        })
    );

    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.10;

    scene.add(ring);

    /* RED OUTER RING */

    var outerRing = new THREE.Mesh(
        new THREE.TorusGeometry(
            3.9,
            0.08,
            12,
            80
        ),
        new THREE.MeshBasicMaterial({
            color: 0xff4038
        })
    );

    outerRing.rotation.x = Math.PI / 2;
    outerRing.position.y = 0.12;

    scene.add(outerRing);

    /* BACK WALL */

    var wall = new THREE.Mesh(
        new THREE.BoxGeometry(14, 8, 0.3),
        new THREE.MeshStandardMaterial({
            color: 0x1a1a22
        })
    );

    wall.position.set(0, 3.5, -3.6);

    scene.add(wall);

    /* FIGHTERS */

    var player = createFighter(true);
    var enemy = createFighter(false);

    player.position.set(-1.65, 0, 0.1);
    enemy.position.set(1.65, 0, -0.1);

    /* PLAYER LOOKS RIGHT */

    player.rotation.y = -0.12;

    /* ENEMY LOOKS LEFT */

    enemy.rotation.y = Math.PI + 0.12;

    scene.add(player);
    scene.add(enemy);

    battle3D.player = player;
    battle3D.enemy = enemy;

    battle3D.playerParts = player.userData.parts;
    battle3D.enemyParts = enemy.userData.parts;

    battle3D.playerBase = player.position.clone();
    battle3D.enemyBase = enemy.position.clone();

    battle3D.ready = true;

    window.addEventListener(
        "resize",
        resize3DArena
    );

    animate3DArena();
}

/* =========================
   RESIZE
   ========================= */

function resize3DArena() {

    var container = document.getElementById("battle-3d");

    if (!container || !battle3D.renderer) return;

    var w = container.clientWidth;
    var h = container.clientHeight;

    if (w <= 0 || h <= 0) return;

    battle3D.camera.aspect = w / h;
    battle3D.camera.updateProjectionMatrix();

    battle3D.renderer.setSize(w, h);
}

/* =========================
   ANIMATION LOOP
   ========================= */

function animate3DArena() {

    requestAnimationFrame(animate3DArena);

    if (!battle3D.ready) return;

    var now = performance.now();

    updateFighterAnimation(
        battle3D.player,
        battle3D.playerParts,
        battle3D.playerAction,
        now,
        true
    );

    updateFighterAnimation(
        battle3D.enemy,
        battle3D.enemyParts,
        battle3D.enemyAction,
        now,
        false
    );

    /* CAMERA SHAKE */

    if (battle3D.shake > 0) {

        battle3D.shake *= 0.86;

        battle3D.camera.position.x =
            battle3D.cameraBaseX +
            (Math.random() - 0.5) * battle3D.shake;

        battle3D.camera.position.y =
            battle3D.cameraBaseY +
            (Math.random() - 0.5) * battle3D.shake;

    } else {

        battle3D.camera.position.x =
            battle3D.cameraBaseX;

        battle3D.camera.position.y =
            battle3D.cameraBaseY;
    }

    battle3D.camera.lookAt(0, 2, 0);

    battle3D.renderer.render(
        battle3D.scene,
        battle3D.camera
    );
}

/* =========================
   FIGHT ANIMATION
   ========================= */

function updateFighterAnimation(
    fighter,
    parts,
    action,
    now,
    isPlayer
) {

    if (!fighter || !parts) return;

    var idle = Math.sin(now * 0.002) * 0.025;

    fighter.position.y = idle;

    /* RESET */

    parts.armL.rotation.set(0, 0, 0);
    parts.armR.rotation.set(0, 0, 0);

    parts.legL.rotation.set(0, 0, 0);
    parts.legR.rotation.set(0, 0, 0);

    fighter.rotation.x = 0;

    if (!action) return;

    var elapsed = now - action.start;
    var duration = action.duration;

    if (elapsed >= duration) {

        if (action.type === "attack") {
            fighter.position.copy(
                isPlayer
                    ? battle3D.playerBase
                    : battle3D.enemyBase
            );
        }

        if (action.type === "hit") {
            fighter.position.copy(
                isPlayer
                    ? battle3D.playerBase
                    : battle3D.enemyBase
            );
        }

        if (action.type === "dodge") {
            fighter.position.copy(
                isPlayer
                    ? battle3D.playerBase
                    : battle3D.enemyBase
            );
        }

        if (isPlayer) {
            battle3D.playerAction = null;
        } else {
            battle3D.enemyAction = null;
        }

        return;
    }

    var t = elapsed / duration;

    /* ATTACK */

    if (action.type === "attack") {

        var punch = Math.sin(t * Math.PI);

        if (action.zone === "head") {

            fighter.position.z =
                (isPlayer ? 0.1 : -0.1) -
                punch * 0.30;

            parts.armR.rotation.z =
                -punch * 1.7;

            parts.armR.rotation.x =
                -punch * 0.8;

        } else if (action.zone === "body") {

            fighter.position.x +=
                (isPlayer ? 1 : -1) *
                punch *
                0.55;

            parts.armR.rotation.z =
                -punch * 2.0;

            parts.armL.rotation.z =
                punch * 0.7;

        } else {

            parts.legR.rotation.z =
                -punch * 1.0;

            parts.legL.rotation.z =
                punch * 0.5;

            fighter.rotation.x =
                punch * 0.18;
        }
    }

    /* HIT REACTION */

    if (action.type === "hit") {

        var recoil = Math.sin(t * Math.PI);

        fighter.position.x +=
            (isPlayer ? -1 : 1) *
            recoil *
            0.55;

        fighter.rotation.z =
            (isPlayer ? -1 : 1) *
            recoil *
            0.18;
    }

    /* BLOCK */

    if (action.type === "block") {

        parts.armL.rotation.z = 1.1;
        parts.armR.rotation.z = -1.1;

        parts.armL.rotation.x = -0.5;
        parts.armR.rotation.x = -0.5;
    }

    /* DODGE */

    if (action.type === "dodge") {

        var dodge = Math.sin(t * Math.PI);

        fighter.position.x +=
            (isPlayer ? -1 : 1) *
            dodge *
            0.9;

        fighter.rotation.z =
            (isPlayer ? -1 : 1) *
            dodge *
            0.22;
    }
}

/* =========================
   PLAYER ATTACK
   ========================= */

function playPlayerAttack(zone, critical) {

    if (!battle3D.ready) return;

    battle3D.playerAction = {
        type: "attack",
        zone: zone,
        start: performance.now(),
        duration: critical ? 650 : 500
    };

    battle3D.shake = critical ? 0.18 : 0.07;

    setTimeout(function() {

        if (battle3D.enemy) {

            battle3D.enemyAction = {
                type: "hit",
                start: performance.now(),
                duration: critical ? 520 : 380
            };
        }

    }, critical ? 180 : 220);
}

/* =========================
   ENEMY ATTACK
   ========================= */

function playEnemyAttack(zone, blocked, dodged) {

    if (!battle3D.ready) return;

    battle3D.enemyAction = {
        type: "attack",
        zone: zone,
        start: performance.now(),
        duration: 520
    };

    if (blocked || dodged) {

        setTimeout(function() {

            if (blocked) {

                battle3D.enemyAction = {
                    type: "hit",
                    start: performance.now(),
                    duration: 350
                };

            } else {

                battle3D.playerAction = {
                    type: "dodge",
                    start: performance.now(),
                    duration: 500
                };
            }

        }, 250);
    } else {

        setTimeout(function() {

            battle3D.playerAction = {
                type: "hit",
                start: performance.now(),
                duration: 400
            };

            battle3D.shake = 0.10;

        }, 300);
    }
}

/* =========================
   FLOATING DAMAGE
   ========================= */

function showDamage(text, critical, enemySide) {

    var container = document.getElementById("battle-3d");

    if (!container) return;

    var el = document.createElement("div");

    el.innerText = text;

    el.style.position = "absolute";
    el.style.left = enemySide ? "67%" : "25%";
    el.style.top = "38%";
    el.style.zIndex = "20";
    el.style.pointerEvents = "none";

    el.style.fontWeight = "900";
    el.style.fontSize = critical ? "30px" : "24px";
    el.style.color = critical ? "#ffd21f" : "#ffffff";

    el.style.textShadow =
        "0 3px 10px #000, 0 0 15px rgba(255,60,60,.7)";

    el.style.transition =
        "transform .8s ease, opacity .8s ease";

    el.style.transform =
        "translate(-50%, 0) scale(1.15)";

    el.style.opacity = "1";

    container.appendChild(el);

    setTimeout(function() {

        el.style.transform =
            "translate(-50%, -90px) scale(1)";

        el.style.opacity = "0";

    }, 30);

    setTimeout(function() {

        if (el.parentNode) {
            el.parentNode.removeChild(el);
        }

    }, 900);
}

/* =========================
   NOTICE
   ========================= */

function showNotice(text) {

    var n = document.getElementById("notice");

    if (!n) return;

    n.innerText = text;
    n.style.display = "block";

    setTimeout(function() {
        n.style.display = "none";
    }, 2000);
}

/* =========================
   DOM READY
   ========================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        init3DArena();

        /* =====================
           TABS
           ===================== */

        var tArena =
            document.getElementById("tab-arena");

        var tShop =
            document.getElementById("tab-shop");

        var tMap =
            document.getElementById("tab-map");

        var tProfile =
            document.getElementById("tab-profile");

        var pArena =
            document.getElementById("page-home");

        var pShop =
            document.getElementById("page-shop");

        var pMap =
            document.getElementById("page-map");

        var pProfile =
            document.getElementById("page-profile");

        function showPage(tab, page) {

            if (pArena) pArena.style.display = "none";
            if (pShop) pShop.style.display = "none";
            if (pMap) pMap.style.display = "none";
            if (pProfile) pProfile.style.display = "none";

            if (tArena) tArena.classList.remove("active");
            if (tShop) tShop.classList.remove("active");
            if (tMap) tMap.classList.remove("active");
            if (tProfile) tProfile.classList.remove("active");

            if (page) page.style.display = "block";
            if (tab) tab.classList.add("active");

            setTimeout(resize3DArena, 50);

            updateUI();
        }

        if (tArena) {
            tArena.addEventListener(
                "click",
                function() {
                    showPage(tArena, pArena);
                }
            );
        }

        if (tShop) {
            tShop.addEventListener(
                "click",
                function() {
                    showPage(tShop, pShop);
                }
            );
        }

        if (tMap) {
            tMap.addEventListener(
                "click",
                function() {
                    showPage(tMap, pMap);
                }
            );
        }

        if (tProfile) {
            tProfile.addEventListener(
                "click",
                function() {
                    showPage(tProfile, pProfile);
                }
            );
        }

        /* =====================
           ATTACK ZONES
           ===================== */

        var attHead =
            document.getElementById("btn-att-head");

        var attBody =
            document.getElementById("btn-att-body");

        var attLegs =
            document.getElementById("btn-att-legs");

        var blkHead =
            document.getElementById("btn-blk-head");

        var blkBody =
            document.getElementById("btn-blk-body");

        var blkLegs =
            document.getElementById("btn-blk-legs");

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

        if (attHead) {
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
        }

        if (attBody) {
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
        }

        if (attLegs) {
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
        }

        if (blkHead) {
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
        }

        if (blkBody) {
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
        }

        if (blkLegs) {
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
        }

        /* =====================
           TURN
           ===================== */

        var turnBtn =
            document.getElementById("attack");

        if (turnBtn) {

            turnBtn.addEventListener(
                "click",
                function() {

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
                        head: "Голову",
                        body: "Корпус",
                        legs: "Ноги"
                    };

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
                        15 + p.bonusDamage;

                    var baseEnemyDmg =
                        15 + (p.level * 2);

                    /* PLAYER ATTACK */

                    if (selA === enemyB) {

                        logs.push(
                            "🛡️ Вы ударили в <b>" +
                            zoneText[selA] +
                            "</b>, но Хулиган заблокировал удар."
                        );

                        battle3D.enemyAction = {
                            type: "block",
                            start: performance.now(),
                            duration: 500
                        };

                        setTimeout(function() {

                            if (battle3D.player) {

                                battle3D.playerAction = {
                                    type: "hit",
                                    start: performance.now(),
                                    duration: 300
                                };
                            }

                        }, 180);

                    } else {

                        var isCrit =
                            (Math.random() * 100) <
                            (p.strength * 3);

                        var finalPlayerDmg =
                            isCrit ? dmg * 2 : dmg;

                        e.hp = Math.max(
                            0,
                            e.hp - finalPlayerDmg
                        );

                        playPlayerAttack(
                            selA,
                            isCrit
                        );

                        showDamage(
                            "-" + finalPlayerDmg,
                            isCrit,
                            true
                        );

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

                    /* ENEMY ATTACK */

                    if (enemyA === selB) {

                        logs.push(
                            "🛡️ Хулиган метил в <b>" +
                            zoneText[enemyA] +
                            "</b>, но вы заблокировали его."
                        );

                        playEnemyAttack(
                            enemyA,
                            true,
                            false
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

                            playEnemyAttack(
                                enemyA,
                                false,
                                true
                            );

                        } else {

                            p.hp = Math.max(
                                0,
                                p.hp - baseEnemyDmg
                            );

                            logs.push(
                                "🥊 Хулиган нанес вам удар в <b>" +
                                zoneText[enemyA] +
                                "</b>. Урон: -" +
                                baseEnemyDmg +
                                "."
                            );

                            playEnemyAttack(
                                enemyA,
                                false,
                                false
                            );

                            showDamage(
                                "-" + baseEnemyDmg,
                                false,
                                false
                            );
                        }
                    }

                    /* LOG */

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
                            logBox.innerHTML = "";
                        }

                        logBox.innerHTML =
                            logs.join("<br>") +
                            "<br><hr style='border-color:#2a2a2a'><br>" +
                            logBox.innerHTML;
                    }

                    /* END */

                    if (
                        p.hp <= 0 ||
                        e.hp <= 0
                    ) {

                        turnBtn.disabled = true;

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
                                p.exp >= p.maxExp
                            ) {

                                p.level += 1;

                                p.exp -= p.maxExp;

                                p.maxExp =
                                    Math.floor(
                                        p.maxExp * 1.3
                                    );

                                p.freePoints += 3;

                                p.maxHp += 20;

                                p.hp = p.maxHp;

                                logBox.innerHTML =
                                    "<b style='color:#f1c40f'>" +
                                    "🌟 ЛЕВЕЛ АП! Получен " +
                                    p.level +
                                    " уровень!</b><br>" +
                                    logBox.innerHTML;
                            }

                        } else {

                            logBox.innerHTML =
                                "<b>💀 Поражение. Восстановление...</b><br>" +
                                logBox.innerHTML;
                        }

                        setTimeout(
                            function() {

                                p.hp = p.maxHp;

                                e.hp =
                                    e.maxHp +
                                    (p.level * 10);

                                turnBtn.disabled = false;

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

                    selA = null;
                    selB = null;

                    clearAtt();
                    clearBlk();

                    updateUI();
                    save();
                }
            );
        }

        /* =====================
           SHOP
           ===================== */

        var buyBrass =
            document.getElementById("buy-brass");

        var buyKnife =
            document.getElementById("buy-knife");

        if (buyBrass) {

            buyBrass.addEventListener(
                "click",
                function() {

                    if (p.coins >= 150) {

                        p.coins -= 150;
                        p.weapon = "Кастеты";
                        p.bonusDamage = 5;

                        showNotice(
                            "🥊 Куплены Кастеты!"
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

                    if (p.coins >= 400) {

                        p.coins -= 400;
                        p.weapon = "Охотничий нож";
                        p.bonusDamage = 12;

                        showNotice(
                            "🔪 Куплен Нож!"
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

        /* =====================
           STATS
           ===================== */

        var addStr =
            document.getElementById("add-str");

        var addAgi =
            document.getElementById("add-agi");

        if (addStr) {

            addStr.addEventListener(
                "click",
                function() {

                    if (p.freePoints > 0) {

                        p.freePoints--;
                        p.strength++;

                        updateUI();
                        save();
                    }
                }
            );
        }

        if (addAgi) {

            addAgi.addEventListener(
                "click",
                function() {

                    if (p.freePoints > 0) {

                        p.freePoints--;
                        p.agility++;

                        updateUI();
                        save();
                    }
                }
            );
        }

        updateUI();
    }
);

/* =========================
   UI
   ========================= */

function updateUI() {

    var coins =
        document.getElementById("coins");

    if (coins)
        coins.innerText = p.coins;

    var level =
        document.getElementById("header-level");

    if (level)
        level.innerText =
            "Уровень " + p.level;

    var pTxt =
        document.getElementById(
            "hp-text-player"
        );

    if (pTxt)
        pTxt.innerText =
            p.hp + "/" + p.maxHp;

    var eTxt =
        document.getElementById(
            "hp-text-enemy"
        );

    if (eTxt)
        eTxt.innerText =
            e.hp + "/" + e.maxHp;

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

    var profLevel =
        document.getElementById(
            "prof-level"
        );

    if (profLevel)
        profLevel.innerText =
            p.level;

    var profWeapon =
        document.getElementById(
            "prof-weapon"
        );

    if (profWeapon)
        profWeapon.innerText =
            p.weapon;

    var profDamage =
        document.getElementById(
            "prof-damage"
        );

    if (profDamage)
        profDamage.innerText =
            15 + p.bonusDamage;

    var profHp =
        document.getElementById(
            "prof-maxhp"
        );

    if (profHp)
        profHp.innerText =
            p.maxHp + " HP";

    var profStr =
        document.getElementById(
            "prof-str"
        );

    if (profStr)
        profStr.innerText =
            p.strength;

    var profAgi =
        document.getElementById(
            "prof-agi"
        );

    if (profAgi)
        profAgi.innerText =
            p.agility;

    var profFree =
        document.getElementById(
            "prof-free"
        );

    if (profFree)
        profFree.innerText =
            p.freePoints;

    var freeBlock =
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

    if (freeBlock) {

        if (p.freePoints > 0) {

            freeBlock.style.display =
                "block";

            if (btnS)
                btnS.style.display =
                    "inline-block";

            if (btnA)
                btnA.style.display =
                    "inline-block";

        } else {

            freeBlock.style.display =
                "none";

            if (btnS)
                btnS.style.display =
                    "none";

            if (btnA)
                btnA.style.display =
                    "none";
        }
    }

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

    var expFill =
        document.getElementById(
            "exp-fill"
        );

    if (expFill)
        expFill.style.width =
            ((p.exp / p.maxExp) * 100) +
            "%";
}

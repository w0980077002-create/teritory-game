import * as THREE from "three";

/* =========================================
   TERRITORY
   3D BATTLE + GAME LOGIC
========================================= */

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
        var parsed = JSON.parse(saved);

        if (parsed) {
            p = Object.assign(p, parsed);
        }
    }
} catch (err) {}

function save() {
    try {
        localStorage.setItem(
            "territory_save",
            JSON.stringify(p)
        );
    } catch (err) {}
}


/* =========================================
   3D STATE
========================================= */

var battle3D = {
    container: null,
    scene: null,
    camera: null,
    renderer: null,

    player: null,
    enemy: null,

    playerParts: null,
    enemyParts: null,

    playerBase: null,
    enemyBase: null,

    initialized: false,

    playerAnimating: false,
    enemyAnimating: false,

    cameraShake: 0,
    cameraShakePower: 0
};


/* =========================================
   MATERIAL
========================================= */

function makeMaterial(color, roughness) {

    return new THREE.MeshStandardMaterial({
        color: color,
        roughness: roughness || 0.7,
        metalness: 0.05
    });
}


/* =========================================
   FIGHTER
========================================= */

function createFighter(isPlayer) {

    var group = new THREE.Group();

    var skin = makeMaterial(0xf0b48a);
    var shirt = makeMaterial(
        isPlayer ? 0x2468ff : 0xb52d2d
    );
    var pants = makeMaterial(
        isPlayer ? 0x202636 : 0x171717
    );
    var shoes = makeMaterial(0x080808);
    var hair = makeMaterial(0x15110e);


    /* Legs */

    var leftLeg = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.42,
            1.15,
            0.42
        ),
        pants
    );

    var rightLeg = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.42,
            1.15,
            0.42
        ),
        pants
    );

    leftLeg.position.set(
        -0.25,
        0.65,
        0
    );

    rightLeg.position.set(
        0.25,
        0.65,
        0
    );

    group.add(leftLeg);
    group.add(rightLeg);


    /* Shoes */

    var leftShoe = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.48,
            0.25,
            0.75
        ),
        shoes
    );

    var rightShoe = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.48,
            0.25,
            0.75
        ),
        shoes
    );

    leftShoe.position.set(
        -0.25,
        0.08,
        0.12
    );

    rightShoe.position.set(
        0.25,
        0.08,
        0.12
    );

    group.add(leftShoe);
    group.add(rightShoe);


    /* Body */

    var body = new THREE.Mesh(
        new THREE.BoxGeometry(
            1,
            1.25,
            0.58
        ),
        shirt
    );

    body.position.y = 1.65;

    group.add(body);


    /* Head */

    var head = new THREE.Mesh(
        new THREE.SphereGeometry(
            0.48,
            20,
            16
        ),
        skin
    );

    head.position.y = 2.62;

    group.add(head);


    /* Hair */

    var hairMesh = new THREE.Mesh(
        new THREE.SphereGeometry(
            0.49,
            20,
            12
        ),
        hair
    );

    hairMesh.scale.set(
        1,
        0.42,
        1
    );

    hairMesh.position.set(
        0,
        2.92,
        -0.02
    );

    group.add(hairMesh);


    /* Arms */

    var leftArm = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.30,
            1,
            0.30
        ),
        skin
    );

    var rightArm = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.30,
            1,
            0.30
        ),
        skin
    );

    leftArm.position.set(
        -0.68,
        1.72,
        0
    );

    rightArm.position.set(
        0.68,
        1.72,
        0
    );

    group.add(leftArm);
    group.add(rightArm);


    /* Fists */

    var leftFist = new THREE.Mesh(
        new THREE.SphereGeometry(
            0.20,
            14,
            10
        ),
        skin
    );

    var rightFist = new THREE.Mesh(
        new THREE.SphereGeometry(
            0.20,
            14,
            10
        ),
        skin
    );

    leftFist.position.set(
        -0.68,
        1.18,
        0
    );

    rightFist.position.set(
        0.68,
        1.18,
        0
    );

    group.add(leftFist);
    group.add(rightFist);


    group.userData = {

        body: body,
        head: head,

        leftArm: leftArm,
        rightArm: rightArm,

        leftLeg: leftLeg,
        rightLeg: rightLeg,

        leftFist: leftFist,
        rightFist: rightFist
    };


    return group;
}


/* =========================================
   INIT 3D
========================================= */

function init3DArena() {

    var container =
        document.getElementById("battle-3d");

    if (!container) {
        return;
    }

    battle3D.container = container;


    /* Scene */

    var scene = new THREE.Scene();

    scene.background =
        new THREE.Color(0x090a12);

    battle3D.scene = scene;


    /* Camera */

    var width =
        container.clientWidth || 320;

    var height =
        container.clientHeight || 270;

    var camera =
        new THREE.PerspectiveCamera(
            42,
            width / height,
            0.1,
            100
        );

    camera.position.set(
        0,
        3.2,
        7.6
    );

    camera.lookAt(
        0,
        1.5,
        0
    );

    battle3D.camera = camera;


    /* Renderer */

    var renderer;

    try {

        renderer =
            new THREE.WebGLRenderer({
                antialias: true,
                alpha: false,
                powerPreference:
                    "high-performance"
            });

    } catch (err) {

        container.innerHTML =
            "<div style='height:100%;display:flex;align-items:center;justify-content:center;color:#777;text-align:center;font-size:14px;padding:20px'>" +
            "3D-графика недоступна" +
            "</div>";

        return;
    }


    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio || 1,
            1.5
        )
    );

    renderer.setSize(
        width,
        height,
        false
    );

    renderer.outputColorSpace =
        THREE.SRGBColorSpace;


    container.innerHTML = "";

    container.appendChild(
        renderer.domElement
    );

    battle3D.renderer = renderer;


    /* =====================================
       LIGHT
    ===================================== */

    var hemi =
        new THREE.HemisphereLight(
            0xffffff,
            0x141421,
            2.2
        );

    scene.add(hemi);


    var mainLight =
        new THREE.DirectionalLight(
            0xffffff,
            3
        );

    mainLight.position.set(
        3,
        7,
        5
    );

    scene.add(mainLight);


    var redLight =
        new THREE.PointLight(
            0xff2222,
            5,
            10
        );

    redLight.position.set(
        0,
        3,
        -3
    );

    scene.add(redLight);


    var blueLight =
        new THREE.PointLight(
            0x2255ff,
            4,
            8
        );

    blueLight.position.set(
        -4,
        2,
        2
    );

    scene.add(blueLight);


    /* =====================================
       FLOOR
    ===================================== */

    var floor =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                4.3,
                4.3,
                0.25,
                48
            ),
            makeMaterial(0x181923)
        );

    floor.position.y = -0.15;

    scene.add(floor);


    /* Ring */

    var ring =
        new THREE.Mesh(
            new THREE.TorusGeometry(
                3.5,
                0.07,
                10,
                64
            ),
            makeMaterial(
                0xe74c3c,
                0.45
            )
        );

    ring.rotation.x =
        Math.PI / 2;

    ring.position.y = 0.02;

    scene.add(ring);


    /* Inner ring */

    var ring2 =
        new THREE.Mesh(
            new THREE.TorusGeometry(
                2.7,
                0.035,
                8,
                64
            ),
            makeMaterial(
                0x555566,
                0.5
            )
        );

    ring2.rotation.x =
        Math.PI / 2;

    ring2.position.y =
        0.025;

    scene.add(ring2);


    /* Wall */

    var wall =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                12,
                6,
                0.3
            ),
            makeMaterial(0x11121b)
        );

    wall.position.set(
        0,
        2.7,
        -2.8
    );

    scene.add(wall);


    /* =====================================
       FIGHTERS
    ===================================== */

    var player =
        createFighter(true);

    var enemy =
        createFighter(false);


    player.position.set(
        -1.75,
        0,
        0.3
    );

    enemy.position.set(
        1.75,
        0,
        -0.2
    );


    player.rotation.y =
        -0.25;

    enemy.rotation.y =
        Math.PI + 0.25;


    scene.add(player);
    scene.add(enemy);


    battle3D.player = player;
    battle3D.enemy = enemy;

    battle3D.playerParts =
        player.userData;

    battle3D.enemyParts =
        enemy.userData;

    battle3D.playerBase =
        player.position.clone();

    battle3D.enemyBase =
        enemy.position.clone();

    battle3D.initialized = true;


    resize3DArena();

    window.addEventListener(
        "resize",
        resize3DArena
    );


    animate3DArena();
}


/* =========================================
   RESIZE
========================================= */

function resize3DArena() {

    if (
        !battle3D.container ||
        !battle3D.camera ||
        !battle3D.renderer
    ) {
        return;
    }

    var width =
        battle3D.container.clientWidth;

    var height =
        battle3D.container.clientHeight;

    if (
        width <= 0 ||
        height <= 0
    ) {
        return;
    }

    battle3D.camera.aspect =
        width / height;

    battle3D.camera.updateProjectionMatrix();

    battle3D.renderer.setSize(
        width,
        height,
        false
    );
}


/* =========================================
   ANIMATION LOOP
========================================= */

var clock =
    new THREE.Clock();

function animate3DArena() {

    requestAnimationFrame(
        animate3DArena
    );

    if (
        !battle3D.initialized ||
        !battle3D.renderer
    ) {
        return;
    }

    var t =
        clock.getElapsedTime();


    /* Idle player */

    if (
        !battle3D.playerAnimating &&
        battle3D.player
    ) {

        battle3D.player.position.y =
            Math.sin(t * 2) * 0.025;

        battle3D.player.rotation.z =
            Math.sin(t * 1.5) * 0.015;
    }


    /* Idle enemy */

    if (
        !battle3D.enemyAnimating &&
        battle3D.enemy
    ) {

        battle3D.enemy.position.y =
            Math.sin(t * 2 + 1) * 0.025;

        battle3D.enemy.rotation.z =
            Math.sin(t * 1.4 + 1) * 0.015;
    }


    /* =====================================
       CAMERA SHAKE
    ===================================== */

    if (
        battle3D.cameraShake > 0
    ) {

        battle3D.cameraShake -= 0.025;

        var power =
            battle3D.cameraShakePower *
            battle3D.cameraShake;

        battle3D.camera.position.x =
            Math.sin(t * 55) *
            power;

        battle3D.camera.position.y =
            3.2 +
            Math.cos(t * 50) *
            power;

    } else {

        battle3D.camera.position.x = 0;
        battle3D.camera.position.y = 3.2;
    }


    battle3D.renderer.render(
        battle3D.scene,
        battle3D.camera
    );
}


/* =========================================
   CAMERA SHAKE
========================================= */

function shakeCamera(power) {

    battle3D.cameraShake =
        1;

    battle3D.cameraShakePower =
        power || 0.08;
}


/* =========================================
   PLAYER ATTACK
========================================= */

function playPlayerAttack(
    zone,
    damage
) {

    if (
        !battle3D.initialized ||
        !battle3D.player
    ) {
        return;
    }

    var fighter =
        battle3D.player;

    var parts =
        battle3D.playerParts;

    battle3D.playerAnimating =
        true;


    var start =
        performance.now();

    var duration = 550;


    function frame(now) {

        var progress =
            Math.min(
                (now - start) /
                duration,
                1
            );


        /* Punch */

        var punch;

        if (progress < 0.35) {

            punch =
                progress / 0.35;

        } else if (progress < 0.65) {

            punch = 1;

        } else {

            punch =
                1 -
                (
                    (progress - 0.65) /
                    0.35
                );
        }


        /* Attack zone */

        if (zone === "head") {

            parts.rightArm.rotation.z =
                -punch * 1.8;

            parts.rightArm.rotation.x =
                -punch * 1.0;

            parts.rightFist.position.y =
                1.18 +
                punch * 0.9;

            parts.rightFist.position.z =
                punch * 0.55;

        } else if (zone === "legs") {

            parts.rightArm.rotation.z =
                -punch * 0.7;

            parts.rightArm.rotation.x =
                punch * 0.8;

            parts.rightFist.position.y =
                1.18 -
                punch * 0.65;

            parts.rightFist.position.z =
                punch * 0.55;

        } else {

            parts.rightArm.rotation.z =
                -punch * 1.6;

            parts.rightArm.rotation.x =
                -punch * 0.8;

            parts.rightFist.position.z =
                punch * 0.65;
        }


        fighter.position.z =
            battle3D.playerBase.z +
            punch * 0.45;


        if (progress < 1) {

            requestAnimationFrame(frame);

        } else {

            parts.rightArm.rotation.set(
                0,
                0,
                0
            );

            parts.rightFist.position.set(
                0.68,
                1.18,
                0
            );

            fighter.position.copy(
                battle3D.playerBase
            );

            battle3D.playerAnimating =
                false;
        }
    }


    requestAnimationFrame(frame);
}


/* =========================================
   ENEMY ATTACK
========================================= */

function playEnemyAttack(
    zone
) {

    if (
        !battle3D.initialized ||
        !battle3D.enemy
    ) {
        return;
    }

    var fighter =
        battle3D.enemy;

    var parts =
        battle3D.enemyParts;

    battle3D.enemyAnimating =
        true;


    var start =
        performance.now();

    var duration = 550;


    function frame(now) {

        var progress =
            Math.min(
                (now - start) /
                duration,
                1
            );


        var punch;

        if (progress < 0.35) {

            punch =
                progress / 0.35;

        } else if (progress < 0.65) {

            punch = 1;

        } else {

            punch =
                1 -
                (
                    (progress - 0.65) /
                    0.35
                );
        }


        if (zone === "head") {

            parts.leftArm.rotation.z =
                punch * 1.8;

            parts.leftArm.rotation.x =
                -punch;

            parts.leftFist.position.y =
                1.18 +
                punch * 0.9;

            parts.leftFist.position.z =
                -punch * 0.55;

        } else if (zone === "legs") {

            parts.leftArm.rotation.z =
                punch * 0.7;

            parts.leftArm.rotation.x =
                punch * 0.8;

            parts.leftFist.position.y =
                1.18 -
                punch * 0.65;

            parts.leftFist.position.z =
                -punch * 0.55;

        } else {

            parts.leftArm.rotation.z =
                punch * 1.6;

            parts.leftArm.rotation.x =
                -punch * 0.8;

            parts.leftFist.position.z =
                -punch * 0.65;
        }


        fighter.position.z =
            battle3D.enemyBase.z -
            punch * 0.45;


        if (progress < 1) {

            requestAnimationFrame(frame);

        } else {

            parts.leftArm.rotation.set(
                0,
                0,
                0
            );

            parts.leftFist.position.set(
                -0.68,
                1.18,
                0
            );

            fighter.position.copy(
                battle3D.enemyBase
            );

            battle3D.enemyAnimating =
                false;
        }
    }


    requestAnimationFrame(frame);
}


/* =========================================
   HIT REACTION
========================================= */

function show3DHit(
    isPlayerTarget,
    damage,
    critical
) {

    if (!battle3D.initialized) {
        return;
    }

    var target =
        isPlayerTarget
            ? battle3D.player
            : battle3D.enemy;


    if (!target) {
        return;
    }


    /* Camera */

    shakeCamera(
        critical ? 0.16 : 0.09
    );


    /* Flash */

    var originalScale =
        target.scale.clone();

    var start =
        performance.now();

    var duration = 300;


    function flash(now) {

        var progress =
            Math.min(
                (now - start) /
                duration,
                1
            );


        var hit =
            Math.sin(
                progress * Math.PI
            );


        target.scale.set(
            originalScale.x *
                (1 + hit * 0.12),

            originalScale.y *
                (1 - hit * 0.06),

            originalScale.z *
                (1 + hit * 0.12)
        );


        /* Knockback */

        var base =
            isPlayerTarget
                ? battle3D.playerBase
                : battle3D.enemyBase;

        var direction =
            isPlayerTarget
                ? -1
                : 1;

        target.position.x =
            base.x +
            hit *
            direction *
            0.18;


        if (progress < 1) {

            requestAnimationFrame(
                flash
            );

        } else {

            target.scale.copy(
                originalScale
            );

            target.position.copy(
                base
            );
        }
    }


    requestAnimationFrame(flash);


    /* Damage number */

    createDamageText(
        target,
        damage,
        critical
    );
}


/* =========================================
   3D DAMAGE NUMBER
========================================= */

function createDamageText(
    target,
    damage,
    critical
) {

    if (!battle3D.scene) {
        return;
    }


    var canvas =
        document.createElement("canvas");

    canvas.width = 256;
    canvas.height = 128;


    var ctx =
        canvas.getContext("2d");


    ctx.clearRect(
        0,
        0,
        256,
        128
    );


    ctx.textAlign =
        "center";

    ctx.font =
        critical
            ? "bold 54px Arial"
            : "bold 46px Arial";


    ctx.fillStyle =
        critical
            ? "#ffd21c"
            : "#ffffff";


    ctx.strokeStyle =
        "#111111";

    ctx.lineWidth = 8;


    var text =
        critical
            ? "КРИТ! -" + damage
            : "-" + damage;


    ctx.strokeText(
        text,
        128,
        70
    );

    ctx.fillText(
        text,
        128,
        70
    );


    var texture =
        new THREE.CanvasTexture(
            canvas
        );

    texture.needsUpdate = true;


    var material =
        new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false
        });


    var sprite =
        new THREE.Sprite(material);


    sprite.scale.set(
        1.8,
        0.9,
        1
    );


    sprite.position.copy(
        target.position
    );

    sprite.position.y =
        3.4;


    battle3D.scene.add(sprite);


    var start =
        performance.now();

    var duration = 900;


    function animateText(now) {

        var progress =
            Math.min(
                (now - start) /
                duration,
                1
            );


        sprite.position.y =
            3.4 +
            progress * 1.2;


        material.opacity =
            1 - progress;


        sprite.scale.set(
            1.8 +
            progress * 0.5,
            0.9 +
            progress * 0.25,
            1
        );


        if (progress < 1) {

            requestAnimationFrame(
                animateText
            );

        } else {

            battle3D.scene.remove(
                sprite
            );

            texture.dispose();
            material.dispose();
        }
    }


    requestAnimationFrame(
        animateText
    );
}


/* =========================================
   BLOCK EFFECT
========================================= */

function showBlockEffect(
    isPlayer
) {

    if (!battle3D.initialized) {
        return;
    }


    var target =
        isPlayer
            ? battle3D.player
            : battle3D.enemy;


    if (!target) {
        return;
    }


    var start =
        performance.now();


    var duration = 350;


    function animateBlock(now) {

        var progress =
            Math.min(
                (now - start) /
                duration,
                1
            );


        var hit =
            Math.sin(
                progress * Math.PI
            );


        target.rotation.z =
            hit * 0.15;


        target.scale.set(
            1 + hit * 0.08,
            1 - hit * 0.04,
            1 + hit * 0.08
        );


        if (progress < 1) {

            requestAnimationFrame(
                animateBlock
            );

        } else {

            target.rotation.z = 0;

            target.scale.set(
                1,
                1,
                1
            );
        }
    }


    requestAnimationFrame(
        animateBlock
    );


    shakeCamera(0.045);
}


/* =========================================
   DODGE EFFECT
========================================= */

function showDodgeEffect(
    isPlayer
) {

    if (!battle3D.initialized) {
        return;
    }


    var target =
        isPlayer
            ? battle3D.player
            : battle3D.enemy;


    if (!target) {
        return;
    }


    var base =
        isPlayer
            ? battle3D.playerBase
            : battle3D.enemyBase;


    var start =
        performance.now();

    var duration = 400;


    function dodge(now) {

        var progress =
            Math.min(
                (now - start) /
                duration,
                1
            );


        var move;

        if (progress < 0.5) {

            move =
                progress / 0.5;

        } else {

            move =
                1 -
                (
                    (progress - 0.5) /
                    0.5
                );
        }


        target.position.x =
            base.x +
            move *
            (
                isPlayer
                    ? -0.5
                    : 0.5
            );


        target.rotation.z =
            move *
            (
                isPlayer
                    ? -0.18
                    : 0.18
            );


        if (progress < 1) {

            requestAnimationFrame(
                dodge
            );

        } else {

            target.position.copy(
                base
            );

            target.rotation.z = 0;
        }
    }


    requestAnimationFrame(dodge);
}


/* =========================================
   DOM READY
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {


        /* Start 3D */

        setTimeout(
            function () {
                init3DArena();
            },
            100
        );


        /* =================================
           TABS
        ================================= */

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


            setTimeout(
                resize3DArena,
                50
            );
        }


        if (tArena) {

            tArena.addEventListener(
                "click",
                function () {
                    showPage(
                        tArena,
                        pArena
                    );
                }
            );
        }


        if (tShop) {

            tShop.addEventListener(
                "click",
                function () {
                    showPage(
                        tShop,
                        pShop
                    );
                }
            );
        }


        if (tMap) {

            tMap.addEventListener(
                "click",
                function () {
                    showPage(
                        tMap,
                        pMap
                    );
                }
            );
        }


        if (tProfile) {

            tProfile.addEventListener(
                "click",
                function () {
                    showPage(
                        tProfile,
                        pProfile
                    );
                }
            );
        }


        /* =================================
           ATTACK ZONES
        ================================= */

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


        /* BLOCK ZONES */

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


        if (attHead) {

            attHead.addEventListener(
                "click",
                function () {

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
                function () {

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
                function () {

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
                function () {

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
                function () {

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
                function () {

                    clearBlk();

                    blkLegs.classList.add(
                        "zone-btn-active"
                    );

                    selB = "legs";
                }
            );
        }


        /* =================================
           BATTLE BUTTON
        ================================= */

        var turnBtn =
            document.getElementById(
                "attack"
            );


        if (turnBtn) {

            turnBtn.addEventListener(
                "click",
                function () {

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
                        15 +
                        p.bonusDamage;


                    var enemyDamage =
                        15 +
                        (p.level * 2);


                    /* =================================
                       PLAYER ATTACK
                    ================================= */

                    if (
                        selA === enemyB
                    ) {

                        showBlockEffect(
                            false
                        );


                        logs.push(
                            "🛡️ Вы ударили в <b>" +
                            zoneText[selA] +
                            "</b>, но Хулиган заблокировал удар."
                        );

                    } else {

                        var isCrit =
                            (
                                Math.random() * 100
                            ) <
                            (
                                p.strength * 3
                            );


                        var finalDamage =
                            isCrit
                                ? dmg * 2
                                : dmg;


                        e.hp =
                            Math.max(
                                0,
                                e.hp -
                                finalDamage
                            );


                        playPlayerAttack(
                            selA,
                            finalDamage
                        );


                        setTimeout(
                            function () {

                                show3DHit(
                                    false,
                                    finalDamage,
                                    isCrit
                                );

                            },
                            260
                        );


                        if (isCrit) {

                            logs.push(
                                "⚡💥 <b>КРИТ!</b> Вы пробили Хулигана в <b>" +
                                zoneText[selA] +
                                "</b>! Урон: -" +
                                finalDamage +
                                "."
                            );

                        } else {

                            logs.push(
                                "💥 Вы успешно пробили Хулигана в <b>" +
                                zoneText[selA] +
                                "</b>! Урон: -" +
                                finalDamage +
                                "."
                            );
                        }
                    }


                    /* =================================
                       ENEMY ATTACK
                    ================================= */

                    if (
                        enemyA === selB
                    ) {

                        showBlockEffect(
                            true
                        );


                        logs.push(
                            "🛡️ Хулиган метил в <b>" +
                            zoneText[enemyA] +
                            "</b>, но вы заблокировали его."
                        );

                    } else {

                        var isDodge =
                            (
                                Math.random() * 100
                            ) <
                            (
                                p.agility * 3
                            );


                        if (isDodge) {

                            showDodgeEffect(
                                true
                            );


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
                                    enemyDamage
                                );


                            setTimeout(
                                function () {

                                    playEnemyAttack(
                                        enemyA
                                    );

                                    show3DHit(
                                        true,
                                        enemyDamage,
                                        false
                                    );

                                },
                                180
                            );


                            logs.push(
                                "🥊 Хулиган нанес вам удар в <b>" +
                                zoneText[enemyA] +
                                "</b>. Урон: -" +
                                enemyDamage +
                                "."
                            );
                        }
                    }


                    /* =================================
                       LOG
                    ================================= */

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


                    /* =================================
                       END BATTLE
                    ================================= */

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

                            if (logBox) {

                                logBox.innerHTML =
                                    "<b>⚔️ Ничья!</b><br>" +
                                    logBox.innerHTML;
                            }

                        } else if (
                            e.hp <= 0
                        ) {

                            p.coins +=
                                200 +
                                p.level * 20;

                            p.exp += 40;


                            if (logBox) {

                                logBox.innerHTML =
                                    "<b>🎉 Победа! Награда получена!</b><br>" +
                                    logBox.innerHTML;
                            }


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


                                if (logBox) {

                                    logBox.innerHTML =
                                        "<b style='color:#f1c40f;'>🌟 ЛЕВЕЛ АП! Получен " +
                                        p.level +
                                        " уровень!</b><br>" +
                                        logBox.innerHTML;
                                }
                            }

                        } else {

                            if (logBox) {

                                logBox.innerHTML =
                                    "<b>💀 Поражение. Восстановление...</b><br>" +
                                    logBox.innerHTML;
                            }
                        }


                        setTimeout(
                            function () {

                                p.hp =
                                    p.maxHp;

                                e.hp =
                                    e.maxHp +
                                    (
                                        p.level *
                                        10
                                    );

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


                    selA = null;
                    selB = null;

                    clearAtt();
                    clearBlk();

                    updateUI();
                    save();
                }
            );
        }


        /* =================================
           SHOP
        ================================= */

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
                function () {

                    if (p.coins >= 150) {

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
                function () {

                    if (p.coins >= 400) {

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


        /* =================================
           STATS
        ================================= */

        var addStr =
            document.getElementById(
                "add-str"
            );

        var addAgi =
            document.getElementById(
                "add-agi"
            );


        if (addStr) {

            addStr.addEventListener(
                "click",
                function () {

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


        if (addAgi) {

            addAgi.addEventListener(
                "click",
                function () {

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


        updateUI();
    }
);


/* =========================================
   NOTICE
========================================= */

function showNotice(text) {

    var n =
        document.getElementById(
            "notice"
        );

    if (!n) {
        return;
    }


    n.innerText = text;

    n.style.display =
        "block";


    setTimeout(
        function () {

            n.style.display =
                "none";

        },
        2000
    );
}


/* =========================================
   UI UPDATE
========================================= */

function updateUI() {

    var coinsEl =
        document.getElementById(
            "coins"
        );

    if (coinsEl) {
        coinsEl.innerText =
            p.coins;
    }


    var lvlEl =
        document.getElementById(
            "header-level"
        );

    if (lvlEl) {

        lvlEl.innerText =
            "Уровень " +
            p.level;
    }


    var pTxt =
        document.getElementById(
            "hp-text-player"
        );

    if (pTxt) {

        pTxt.innerText =
            p.hp +
            "/" +
            p.maxHp;
    }


    var eTxt =
        document.getElementById(
            "hp-text-enemy"
        );

    if (eTxt) {

        eTxt.innerText =
            e.hp +
            "/" +
            e.maxHp;
    }


    var pFill =
        document.getElementById(
            "hp-fill-player"
        );

    if (pFill) {

        pFill.style.width =
            (
                p.hp /
                p.maxHp *
                100
            ) +
            "%";
    }


    var eFill =
        document.getElementById(
            "hp-fill-enemy"
        );

    if (eFill) {

        eFill.style.width =
            (
                e.hp /
                e.maxHp *
                100
            ) +
            "%";
    }


    var prLvl =
        document.getElementById(
            "prof-level"
        );

    if (prLvl) {
        prLvl.innerText =
            p.level;
    }


    var prWpn =
        document.getElementById(
            "prof-weapon"
        );

    if (prWpn) {
        prWpn.innerText =
            p.weapon;
    }


    var prDmg =
        document.getElementById(
            "prof-damage"
        );

    if (prDmg) {

        prDmg.innerText =
            15 +
            p.bonusDamage;
    }


    var prMhp =
        document.getElementById(
            "prof-maxhp"
        );

    if (prMhp) {

        prMhp.innerText =
            p.maxHp +
            " HP";
    }


    var prStr =
        document.getElementById(
            "prof-str"
        );

    if (prStr) {
        prStr.innerText =
            p.strength;
    }


    var prAgi =
        document.getElementById(
            "prof-agi"
        );

    if (prAgi) {
        prAgi.innerText =
            p.agility;
    }


    var prFre =
        document.getElementById(
            "prof-free"
        );

    if (prFre) {
        prFre.innerText =
            p.freePoints;
    }


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


    var expTxt =
        document.getElementById(
            "exp-text"
        );

    if (expTxt) {

        expTxt.innerText =
            p.exp +
            " / " +
            p.maxExp +
            " XP";
    }


    var expFill =
        document.getElementById(
            "exp-fill"
        );

    if (expFill) {

        expFill.style.width =
            (
                p.exp /
                p.maxExp *
                100
            ) +
            "%";
    }
}

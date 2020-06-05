//------------------------------------------------------------------------------------------------//
let Draw = require("./Draw");
let Enemy = require("./Enemy");
let Player = require("./Player");
let Bullets = require("./Bullets");
let Logic = require("./GameLogic");
let Movement = require("./Movement");
let socket = io({ reconnection: false });
let everything = document.querySelectorAll("*");
let logInSignUpDiv = document.getElementById("logInSignUpDiv");
let container = document.getElementById("container");
let email = document.getElementById("email");
let emailInput = document.getElementById("emailInput");
let username = document.getElementById("username");
let usernameInput = document.getElementById("usernameInput");
let password = document.getElementById("password");
let passwordInput = document.getElementById("passwordInput");
let signInBtn = document.getElementById("signInBtn");
let signUpDiv = document.getElementById("signUpDiv");
let signUpContainer = document.getElementById("signUpContainer");
let signUpBtn = document.getElementById("signUpBtn");
let signInContainer = document.getElementById("signInContainer");
let gameContainerDiv = document.getElementById("gameContainerDiv");
let LogInBtn = document.getElementById("LogInBtn");
let registerBtn = document.getElementById("registerBtn");
let score = document.getElementById("score");
let ammo = document.getElementById("ammo");
let mainGame = document.getElementById("mainGame");
let loggedIn = false;
let logIn = true;
let signUp = false;

let objects = {
  enemies: [],
  players: [],
};

window.addEventListener("resize", Draw.resize, false);
window.addEventListener("load", Draw.resize);

let camera = Draw.sendCamera();
let skyBBox = Draw.drawSkySphereAndGround();

Draw.getLight();
Draw.drawSkySphereAndGround();

let firstEnemy = new Enemy.Enemy();
objects.enemies.push(firstEnemy);

/* 
Login system functions
::::::::START:::::::::
!!!!!!!!!HERE!!!!!!!!!
*/

signInBtn.onclick = function () {
  if (usernameInput.value != "" && passwordInput.value != "" && logIn == true) {
    socket.emit("sign in attempt", usernameInput.value, passwordInput.value);
  }
  if (usernameInput.value == "" || passwordInput.value == "") {
    window.alert("Please complete all the fields.");
  }
};

registerBtn.onclick = function () {
  if (
    emailInput.value != "" &&
    usernameInput.value != "" &&
    passwordInput.value != "" &&
    signUp == true
  ) {
    socket.emit(
      "sign up attempt",
      emailInput.value,
      usernameInput.value,
      passwordInput.value
    );
  }

  if (
    emailInput.value == "" ||
    usernameInput.value == "" ||
    passwordInput.value == ""
  ) {
    window.alert("Please complete all the fields.");
  }
};

signUpBtn.onclick = function () {
  signUpContainer.style.display = "none";
  signInContainer.style.display = "flex";
  email.style.display = "flex";
  emailInput.style.display = "flex";
  registerBtn.style.display = "block";
  signInBtn.style.display = "none";
  container.style.height = "400px";
  registerBtn.style.marginTop = "20px";
  signInBtn.style.marginTop = "20px";
  signUp = true;
  logIn = false;
};

LogInBtn.onclick = function () {
  signUpContainer.style.display = "flex";
  signInContainer.style.display = "none";
  email.style.display = "none";
  emailInput.style.display = "none";
  registerBtn.style.display = "none";
  signInBtn.style.display = "block";
  container.style.height = "350px";
  registerBtn.style.marginTop = "70px";
  signInBtn.style.marginTop = "70px";
  signUp = false;
  logIn = true;
};

/* 
Login system functions
:::::::::END::::::::::
!!!!!!!!!HERE!!!!!!!!!
*/
//---NO MAN'S LAND---//
/* 
Logic runner functions
::::::::START:::::::::
!!!!!!!!!HERE!!!!!!!!!
*/

let pvpChecker = function () {
  for (let i in objects.players) {
    for (let u in objects.players[i].bulletList) {
      if (
        Logic.collisionChecker(
          objects.players[i].bulletList[u].collisionBBox,
          objects.players[i].collisionBBox
        )
      ) {
        if (
          objects.players[i].id != objects.players[0].id &&
          objects.players[i].bulletList[u].substitute != true
        ) {
          objects.players[i].health -= 1;
          if (objects.players[i].health <= 0) {
            objects.players[i].respawn();
            objects.players[0].score += 1;
          }
          socket.emit("you took damage", objects.players[i].id);
          for (let n in objects.players[0].bulletList) {
            objects.players[0].bulletList[n].remove();
            objects.players[0].bulletList.splice(n, 1);
          }
          socket.emit("Player health", {
            id: objects.players[i].id,
            health: objects.players[i].health,
          });
        }
      }
    }
  }
};

let sendPlayerInfo = function () {
  socket.emit("Player info", {
    id: objects.players[0].id,
    x: objects.players[0].mesh.position.x,
    y: objects.players[0].mesh.position.y,
    z: objects.players[0].mesh.position.z,
    rotation: objects.players[0].mesh.rotation.y,
    bulletList: objects.players[0].bulletList.length,
  });
};

let sendBulletInfo = function () {
  if (objects.players[0].bulletList.length > 0) {
    socket.emit("bullet position", {
      id: objects.players[0].id,
      substitute:
        objects.players[0].bulletList[objects.players[0].bulletList.length - 1]
          .substitute,
      bulletsId:
        objects.players[0].bulletList[objects.players[0].bulletList.length - 1]
          .id,
      bulletsX:
        objects.players[0].bulletList[objects.players[0].bulletList.length - 1]
          .mesh.position.x,
      bulletsY:
        objects.players[0].bulletList[objects.players[0].bulletList.length - 1]
          .mesh.position.y,
      bulletsZ:
        objects.players[0].bulletList[objects.players[0].bulletList.length - 1]
          .mesh.position.z,
    });
  }
};

let playerLogicRunner = function () {
  for (let i in objects.players) {
    let players = objects.players[i];
    if (objects.players[0].attack.shooting && objects.players[0].ammoLeft > 0) {
      sendBulletInfo();
    }
    players.draw();
    Draw.drawScore(objects.players[0].score);
    Movement.actionChecker(players);
    Movement.mover(players);
    Movement.attackChecker(players);
    Movement.attacker(players);
  }
};

let enemyLogicRunner = function () {
  for (let i in objects.enemies) {
    let enemies = objects.enemies[i];
    enemies.draw();
  }
};

let basicGameLogicRunner = function () {
  Draw.setCanvasStyling();
  Draw.drawCrosshair();
  for (let u in objects.players) {
    let players = objects.players[u];

    for (let i in objects.enemies) {
      let enemies = objects.enemies[i];

      for (let n in objects.players[u].bulletList) {
        let bullets = objects.players[u].bulletList[n];

        for (let m in objects.enemies[i].bulletList) {
          let enemybullets = objects.enemies[i].bulletList[m];
          if (
            Logic.collisionChecker(
              enemybullets.collisionBBox,
              bullets.collisionBBox
            )
          ) {
            bullets.remove();
            enemybullets.remove();
            enemies.meshHealth -= 10;
            players.bulletList.splice(n, 1);
            objects.enemies[i].bulletList.splice(m, 1);
          }
        }

        if (
          Logic.collisionChecker(enemies.collisionBBox, bullets.collisionBBox)
        ) {
          bullets.remove();
          enemies.meshHealth -= 1;
          players.bulletList.splice(n, 1);
        }
        if (Logic.collisionChecker(skyBBox, bullets.collisionBBox) == false) {
          bullets.remove();
        }
        if (bullets.mesh.position.y <= 0) {
          bullets.remove();
        }
        if (bullets.collisionBBox.distanceToPoint(camera.position) >= 500) {
          bullets.remove();
        }
        if (objects.players[u].bulletList.length >= 500) {
          bullets.remove();
        }
      }

      for (let m in objects.enemies[i].bulletList) {
        let enemybullets = objects.enemies[i].bulletList[m];
        if (
          Logic.collisionChecker(
            enemybullets.collisionBBox,
            players.collisionBBox
          )
        ) {
          enemybullets.remove();
          players.health -= 2;
          objects.enemies[i].bulletList.splice(m, 1);
        }
        if (objects.enemies[i].bulletList.length >= 5) {
          enemybullets.remove();
          objects.enemies[i].bulletList.splice(m, 1);
        }
        if (
          Logic.collisionChecker(skyBBox, enemybullets.collisionBBox) == false
        ) {
          enemybullets.remove();
        }
      }
    }
  }
};

/* 
Logic runner functions
:::::::::END::::::::::
!!!!!!!!!HERE!!!!!!!!!
*/
//---NO MAN'S LAND---//
/*
Socket.on's
:::START:::
!!!HERE!!!!
*/

socket.on("log in successful", function () {
  loggedIn = true;
  logInSignUpDiv.style.display = "none";
  gameContainerDiv.style.display = "inline-block";
  let player = new Player.Player(["w", "a", "s", "d"], "yes");
  objects.players.push(player);
  socket.emit("my id", player.id, player.number);
});

socket.on("log in unsuccessful", function () {
  window.alert("Log in unsuccessful. Please try again.");
});

socket.on("account created", function () {
  window.alert("Account created successfully!");
  signUpContainer.style.display = "flex";
  signInContainer.style.display = "none";
  email.style.display = "none";
  emailInput.style.display = "none";
  registerBtn.style.display = "none";
  signInBtn.style.display = "block";
  container.style.height = "350px";
  registerBtn.style.marginTop = "70px";
  signInBtn.style.marginTop = "70px";
  signUp = false;
  logIn = true;
});

socket.on("account exists", function () {
  window.alert("Account exists.");
});

socket.on("New connection", function (connector) {
  let newPlayer = new Player.Player(["w", "a", "s", "d"], "no");
  objects.players.push(newPlayer);
  socket.emit("me", { player: objects.players[0], connector: connector });
});

socket.on("someone quit", function (id) {
  for (let i in objects.players) {
    if (objects.players[i].id == id) {
      objects.players[i].remove();
      objects.players.splice(i, 1);
    }
  }
});

socket.on("add them", function (them) {
  let newPlayer = new Player.Player(["w", "a", "s", "d"], "no");
  newPlayer.id = them.id;
  objects.players.push(newPlayer);
});

socket.on("New players id", function (newId) {
  if (objects.players.length > 1) {
    objects.players[objects.players.length - 1].id = newId;
  }
});

socket.on("updated player health", function (updatedInfo) {
  for (let i in objects.players) {
    if (objects.players[i].id == updatedInfo.id) {
      objects.players[i].setHealth(updatedInfo.health);
    }
  }
});

socket.on("updated player info", function (updatedInfo) {
  for (let i in objects.players) {
    if (objects.players[i].id == updatedInfo.id) {
      objects.players[i].setPosition(
        updatedInfo.x,
        updatedInfo.y,
        updatedInfo.z,
        updatedInfo.rotation
      );
      while (updatedInfo.bulletList > objects.players[i].bulletList.length) {
        objects.players[i].bulletList.push(new Bullets.Bullet(true));
      }
    }
  }
});

socket.on("updated bullet info", function (bulletInfo) {
  for (let i in objects.players) {
    if (
      objects.players[i].id == bulletInfo.id &&
      bulletInfo.substitute != true
    ) {
      if (objects.players[i].bulletList.length > 0) {
        objects.players[i].bulletList[
          objects.players[i].bulletList.length - 1
        ].setPosition(
          bulletInfo.bulletsX,
          bulletInfo.bulletsY,
          bulletInfo.bulletsZ
        );
      }
    }
  }
});

socket.on("You took damage", function () {
  Draw.drawDamageOverlay();
  setTimeout(() => {
    Draw.clearCanvas();
  }, 250);
});

/*
Socket.on's
::::END::::
!!!!HERE!!!
*/
//---NO MAN'S LAND---//
/*
Games main functions
:::::::START::::::::
!!!!!!!!HERE!!!!!!!!
*/

let gameLoop = function () {
  if (loggedIn) {
    sendPlayerInfo();
    basicGameLogicRunner();
    pvpChecker();
    playerLogicRunner();
    sendBulletInfo();
  }
};

let animate = function () {
  //enemyLogicRunner();
  gameLoop();
  Draw.render();
};

setInterval(() => {
  animate();
}, 10);

/*
Games main functions
::::::::END:::::::::
!!!!!!!!HERE!!!!!!!!
*/
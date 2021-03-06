//------------------------------------------------------------------------------------------------//
let Draw = require("./Draw");
let Enemy = require("./Enemy");
let Player = require("./Player");
let Bullets = require("./Bullets");
let Logic = require("./GameLogic");
let Movement = require("./Movement");
let socket = io({ reconnection: false });
let logInSignUpDiv = document.getElementById("logInSignUpDiv");
let container = document.getElementById("container");
let email = document.getElementById("email");
let emailInput = document.getElementById("emailInput");
let usernameInput = document.getElementById("usernameInput");
let passwordInput = document.getElementById("passwordInput");
let signInBtn = document.getElementById("signInBtn");
let signUpContainer = document.getElementById("signUpContainer");
let signUpBtn = document.getElementById("signUpBtn");
let signInContainer = document.getElementById("signInContainer");
let gameContainerDiv = document.getElementById("gameContainerDiv");
let LogInBtn = document.getElementById("LogInBtn");
let registerBtn = document.getElementById("registerBtn");
let password = document.getElementById("password");
let username = document.getElementById("username");
let verificationDiv = document.getElementById("verificationDiv");
let verificationInput = document.getElementById("verificationInput");
let verifyBtn = document.getElementById("verifyBtn");
let verifyUsernameInput = document.getElementById("verifyUsernameInput");
let matchDoneModal = document.getElementById("matchDoneModal");
let matchOkBtn = document.getElementById("matchOkBtn");
let matchCloseBtn = document.getElementById("matchCloseBtn");
let leaderboardBody = document.getElementById("leaderboardBody");
let cursor = document.getElementById("cursor");
let previousDataAssigned = false;
let loggedIn = false;
let logIn = true;
let signUp = false;
let unfilteredUsernamesArr = [];
let usernamesArr = [];
let scoresArr = [];

let objects = {
  enemies: [],
  players: [],
};

socket.emit("i wish to exist");

let player = new Player.Player(["w", "a", "s", "d"], "yes");
objects.players.push(player);

window.addEventListener("load", Draw.loadContent, Draw.resize);
window.addEventListener("resize", Draw.resize, false);

let camera = Draw.sendCamera();
let skyBBox = Draw.drawSkySphereAndGround();

Draw.getLight();
Draw.drawSkySphereAndGround();

let firstEnemy = new Enemy.Enemy();
objects.enemies.push(firstEnemy);

/* 
Event listener functions
:::::::::START::::::::::
!!!!!!!!!!HERE!!!!!!!!!!
*/

document.addEventListener("mousemove", function (e) {
  cursor.style.left = e.pageX + "px";
  cursor.style.top = e.pageY + "px";
});

document.addEventListener("mousedown", function (e) {
  cursor.style.backgroundImage =
    "url(../client/Assets/Images/gunCursorShooting.png)";
  cursor.style.left = e.pageX + "px";
  cursor.style.top = e.pageY + "px";
  cursor.style.backgroundSize = "contain";
  cursor.style.transform = "translate(-30%, -50%)";
  // cursor.style.width = 100 + "px";
  // cursor.style.height = 100 + "px";
});

document.addEventListener("mouseup", function (e) {
  cursor.style.backgroundImage = "url(../client/Assets/Images/gunCursor.png)";
  cursor.style.left = e.pageX + "px";
  cursor.style.top = e.pageY + "px";
  cursor.style.backgroundSize = "cover";
  cursor.style.transform = "translate(-75%, -50%)";
  // cursor.style.width = 50 + "px";
  // cursor.style.height = 50 + "px";
});

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
    passwordInput.value.length > 8 &&
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

  if (passwordInput.value.length <= 8) {
    window.alert("Password length must be greater than 8 characters.");
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

verifyBtn.onclick = function () {
  if (verificationInput.value != "" || verifyUsernameInput.value != "") {
    socket.emit(
      "Verification Code",
      verificationInput.value,
      verifyUsernameInput.value
    );
  }
  if (verificationInput.value == "" || verifyUsernameInput.value == "") {
    window.alert("Please complete all the fields.");
  }
};

matchOkBtn.onclick = function () {
  matchDoneModal.style.display = "none";
};

matchCloseBtn.onclick = function () {
  matchDoneModal.style.display = "none";
};

/* 
Event listener functions
::::::::::END:::::::::::
!!!!!!!!!!HERE!!!!!!!!!!
*/
//---NO MAN'S LAND---//
/* 
Logic runner functions
::::::::START:::::::::
!!!!!!!!!HERE!!!!!!!!!
*/

let sendIp = function () {
  fetch("https://api.ipify.org?format=json")
    .then((results) => results.json())
    .then(function (data) {
      socket.emit("IP", {
        ip: data.ip,
        username: usernameInput.value,
      });
    });
};

let leaderboardLogic = function () {
  socket.emit("leaderboard scores");
};

let removeDuplicates = function (arr) {
  return arr.filter((value, index) => arr.indexOf(value) === index);
};

let addToLeaderboard = function (username, score) {
  let table_row = document.createElement("TR");
  let table_data_header = document.createElement("TH");
  let table_data_score = document.createElement("TD");
  let table_data_username = document.createElement("TD");
  let place = document.createTextNode(leaderboardBody.childElementCount + 1);
  let usernameNode = document.createTextNode(username);
  let scoreNode = document.createTextNode(score);
  leaderboardBody.appendChild(table_row);
  table_data_header.appendChild(place);
  table_data_username.appendChild(usernameNode);
  table_data_score.appendChild(scoreNode);
  table_row.appendChild(table_data_header);
  table_row.appendChild(table_data_username);
  table_row.appendChild(table_data_score);
  console.log(leaderboardBody.childElementCount);
};

let pvpChecker = function () {
  socket.emit("health", player.health, player.username);
  for (let i in objects.players) {
    for (let u in objects.players[i].bulletList) {
      if (
        Logic.collisionChecker(
          objects.players[i].bulletList[u].collisionBBox,
          objects.players[i].collisionBBox
        )
      ) {
        if (
          objects.players[i].id != player.id &&
          objects.players[i].bulletList[u].substitute != true
        ) {
          objects.players[i].health -= 1;
          if (objects.players[i].health <= 0) {
            objects.players[i].respawn();
            player.score += 1;
            socket.emit("score went up", player.score, player.username);
          }
          socket.emit("you took damage", objects.players[i].id);
          for (let n in player.bulletList) {
            player.bulletList[n].remove();
            player.bulletList.splice(n, 1);
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
    id: player.id,
    x: player.mesh.position.x,
    y: player.mesh.position.y,
    z: player.mesh.position.z,
    rotation: player.mesh.rotation.y,
    ammoLeft: player.ammoList.length,
    score: player.score,
    username: player.username,
  });

  socket.emit("log in state", loggedIn);
};

let sendBulletInfo = function () {
  if (player.bulletList.length > 0) {
    socket.emit("bullet position", {
      id: player.id,
      substitute: player.bulletList[player.bulletList.length - 1].substitute,
      bulletsId: player.bulletList[player.bulletList.length - 1].id,
      bulletsX: player.bulletList[player.bulletList.length - 1].mesh.position.x,
      bulletsY: player.bulletList[player.bulletList.length - 1].mesh.position.y,
      bulletsZ: player.bulletList[player.bulletList.length - 1].mesh.position.z,
    });
  }
};

let playerLogicRunner = function () {
  for (let i in objects.players) {
    let players = objects.players[i];
    if (player.attack.shooting && player.ammoLeft > 0) {
      sendBulletInfo();
    }
    players.draw();
    Draw.drawScore(player.score);
    Movement.actionChecker(players);
    Movement.mover(players);
    Movement.attackChecker(players);
    Movement.attacker(players);
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
  if (previousDataAssigned == false) {
    socket.emit("please send old data", usernameInput.value);
  }
  loggedIn = true;
  logInSignUpDiv.style.display = "none";
  gameContainerDiv.style.display = "inline-block";
  player.username = usernameInput.value;
  socket.emit("my id", player.id, player.number, player.username);
  sendIp();
});

socket.on("Please verify your account", function () {
  window.alert("Please verify your account");
  signUpContainer.style.display = "none";
  signInContainer.style.display = "none";
  email.style.display = "none";
  password.style.display = "none";
  username.style.display = "none";
  emailInput.style.display = "none";
  passwordInput.style.display = "none";
  usernameInput.style.display = "none";
  registerBtn.style.display = "none";
  signInBtn.style.display = "none";
  container.style.height = "500px";
  container.style.width = "550px";
  verifyBtn.style.display = "block";
  verificationDiv.style.display = "flex";
});

socket.on("username taken", function () {
  window.alert("Username taken.");
});

socket.on("correct verification code", function () {
  window.alert("Account verified successfully!");
  signUpContainer.style.display = "flex";
  signInContainer.style.display = "none";
  email.style.display = "none";
  emailInput.style.display = "none";
  registerBtn.style.display = "none";
  signInBtn.style.display = "block";
  container.style.height = "350px";
  container.style.width = "250px";
  registerBtn.style.marginTop = "70px";
  signInBtn.style.marginTop = "70px";
  verifyBtn.style.display = "none";
  verificationDiv.style.display = "none";
  password.style.display = "flex";
  username.style.display = "flex";
  passwordInput.style.display = "flex";
  usernameInput.style.display = "flex";
  signUp = false;
  logIn = true;
});

socket.on("log in unsuccessful", function () {
  window.alert("Log in unsuccessful. Please try again.");
});

socket.on("only one session at once", function () {
  window.alert(
    "Only ONE session at once. Please close all other instances of the game."
  );
});

socket.on("wrong code", function () {
  window.alert("Wrong verification code. Please try again.");
});

socket.on("account created", function (data) {
  window.alert("Account created successfully!");
  socket.emit("send verification code", data);
  // signUpContainer.style.display = "flex";
  // signInContainer.style.display = "none";
  // email.style.display = "none";
  // emailInput.style.display = "none";
  // registerBtn.style.display = "none";
  // signInBtn.style.display = "block";
  // container.style.height = "350px";
  // registerBtn.style.marginTop = "70px";
  // signInBtn.style.marginTop = "70px";
  signUp = false;
  logIn = true;
});

socket.on("account exists", function () {
  window.alert("Account exists.");
});

socket.on("Verification code sent", function () {
  signUpContainer.style.display = "none";
  signInContainer.style.display = "none";
  email.style.display = "none";
  password.style.display = "none";
  username.style.display = "none";
  emailInput.style.display = "none";
  passwordInput.style.display = "none";
  usernameInput.style.display = "none";
  registerBtn.style.display = "none";
  signInBtn.style.display = "none";
  container.style.height = "500px";
  container.style.width = "550px";
  verifyBtn.style.display = "block";
  verificationDiv.style.display = "flex";
});

socket.on("New connection", function (connector) {
  let newPlayer = new Player.Player(["w", "a", "s", "d"], "no");
  objects.players.push(newPlayer);
  socket.emit("me", { player: player, connector: connector });
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

socket.on("current time", function (current_time) {
  let minutes = current_time.minutes;
  let seconds = current_time.seconds;
  let counter = document.getElementById("timer");
  let counter_text = document.getElementById("matchText");

  counter.innerHTML = minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  counter_text.innerHTML = "Match ends in:";
});

socket.on("current time2", function (current_time) {
  let minutes = current_time.minutes;
  let seconds = current_time.seconds;
  let counter = document.getElementById("timer");
  let counter_text = document.getElementById("matchText");

  counter.innerHTML = minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  counter_text.innerHTML = "Match starts in:";
});

socket.on("match", function () {
  leaderboardLogic();
  leaderboardBody.innerHTML = "";
  if (loggedIn == true) {
    Draw.drawMessage("Match over!");
    matchDoneModal.style.display = "flex";
    setTimeout(() => {
      Draw.clearCanvas();
    }, 1000);
    player.score = 0;
    player.health = 100;
    player.ammoList = [];
    player.bulletList = [];
  }
});

socket.on("old data", function (x, y, z, rotY, ammoLeft, health, score) {
  leaderboardLogic();
  player.mesh.position.x = JSON.parse(x);
  player.mesh.position.y = JSON.parse(y);
  player.mesh.position.z = JSON.parse(z);
  player.mesh.rotation.y = JSON.parse(rotY);
  player.ammoList.length = JSON.parse(ammoLeft);
  player.health = JSON.parse(health);
  player.score = JSON.parse(score);
  previousDataAssigned = true;
});

socket.on("send username", function () {
  socket.emit("my username", player.username);
});

socket.on("Match starting", function () {
  Draw.drawMessage("Match starting!");
  setTimeout(function () {
    Draw.clearCanvas();
  }, 1000);
  player.respawn();
  player.score = 0;
  player.health = 100;
  player.ammoList = [];
  player.bulletList = [];
});

socket.on("leaderboard scores", function (scores) {
  scoresArr = [];
  for (let i in scores) {
    unfilteredUsernamesArr.push(scores[i].username);
    scoresArr.push(scores[i].score);
  }
  usernamesArr = removeDuplicates(unfilteredUsernamesArr);
  console.log(scoresArr);
  for (let u in usernamesArr) {
    addToLeaderboard(usernamesArr[u], scoresArr[u]);
  }
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
  // leaderboardLogic();

  if (loggedIn && previousDataAssigned) {
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
  requestAnimationFrame(animate);
};

animate();

/*
Games main functions
::::::::END:::::::::
!!!!!!!!HERE!!!!!!!!
*/

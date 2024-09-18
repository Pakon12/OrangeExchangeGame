const socket = io();

let data = {}; // ใช้เป็นอ็อบเจ็กต์แทนการใช้ Array
let player = {};
let playerId;
let playerNumber;
let lengthPlayer;
const choiceAF = { 1: "A", 2: "B", 3: "C", 4: "D", 5: "E", 6: "F" };
let timeRemaining = 120;  // 120 วินาที = 2 นาที
let timeText;

// ฟังก์ชันที่รับข้อมูลของผู้เล่นเฉพาะตัว
socket.on('player', (playerME) => {
  player = playerME.player;
  playerId = player.id;
  // console.log('playerID:', playerId);

  // ตรวจสอบว่ามีข้อมูลใน data หรือไม่ก่อนการเข้าถึง
  if (data[playerId]) {
    playerNumber = data[playerId].number;
    // console.log('playerNumber:', playerNumber);
  }
});

// ฟังก์ชันที่รับข้อมูลผู้เล่นทั้งหมด
socket.on('data', (newData) => {
  data = newData.data; // อัปเดต data ด้วยข้อมูลใหม่
  // console.log('data:', data);
  lengthPlayer = Object.keys(data).length;
  // console.log('length people:', lengthPlayer);

  // ตรวจสอบว่ามีข้อมูลสำหรับ playerId หรือไม่
  if (data[playerId]) {
    playerNumber = data[playerId].number;
    // console.log('playerNumber:', playerNumber);
  }
});


let showNumOrange;

socket.on('randomOneOrTwo', (randomNumber) => {
  // console.log('randomNumber:', randomNumber);
  showNumOrange = randomNumber[playerId];
})


let config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
    resize: resize
  }
};

let game = new Phaser.Game(config);
const path = '/image';
const select = [];

let orangeRandom1;
let orangeRandom2;
socket.on('randomOrange', ({ random1, random2 }) => {
  orangeRandom1 = random1
  orangeRandom2 = random2
})

function preload() {
  this.orange1 = orangeRandom1;
  this.orange2 = orangeRandom2;
  this.playerType = choiceAF[playerNumber];

  // Load the background and button images
  this.load.image('background', `${path}/background.jpg`);
  this.load.image('leftBtn', `${path}/left.svg`);
  this.load.image('rightBtn', `${path}/right.svg`);
  this.load.image(`orangeA`, `${path}/oranges/orangeA.svg`);
  this.load.image(`orangeB`, `${path}/oranges/orangeB.svg`);
  this.load.image(`orangeC`, `${path}/oranges/orangeC.svg`);
  this.load.image(`orangeD`, `${path}/oranges/orangeD.svg`);
  this.load.image(`orangeE`, `${path}/oranges/orangeE.svg`);
  this.load.image(`orangeF`, `${path}/oranges/orangeF.svg`);
  this.load.image(`playerA`, `${path}/players/playerA.svg`);
  this.load.image(`playerB`, `${path}/players/playerB.svg`);
  this.load.image(`playerC`, `${path}/players/playerC.svg`);
  this.load.image(`playerD`, `${path}/players/playerD.svg`);
  this.load.image(`playerE`, `${path}/players/playerE.svg`);
  this.load.image(`playerF`, `${path}/players/playerF.svg`);
  this.load.image('startBtn', `${path}/startbtn.svg`);
  this.load.image('readyBtn', `${path}/ready.svg`);
  this.load.video('lose', `${path}/lose.mp4`)
  this.load.video('win', `${path}/winer.mp4`)

}

let clientCounterText;
let playerText;
let randomElement;

function formatTime(seconds) {
  let minutes = Math.floor(seconds / 60);
  let partInSeconds = seconds % 60;
  partInSeconds = partInSeconds.toString().padStart(2, '0');
  return `${minutes}:${partInSeconds}`;
}


let isLose = false;
let isWiner = false;

function countdown() {

  if (timeRemaining > 0) {
    timeRemaining--;  // ลดเวลาลง
    timeText.setText(formatTime(timeRemaining));
  } else {
    // เมื่อเวลาหมด ทำสิ่งที่ต้องการ เช่น แสดงข้อความ
    isLose = true;
    isWiner = false;
    // console.log('หมดเวลา!');
    timeText.setText('หมดเวลา!');
    this.time.removeAllEvents();
  }
}

let closeWin = false;
function create() {


  this.background = this.add.image(this.scale.width / 2, this.scale.height / 2, 'background')
    .setOrigin(0.5, 0.5)
    .setDisplaySize(this.scale.width, this.scale.height)
    .setInteractive();


  const buttonSize = Math.min(this.scale.width, this.scale.height) * 0.15;
  const orangeSize = Math.min(this.scale.width, this.scale.height) * 0.17;
  const peopleSize = Math.min(this.scale.width, this.scale.height) * 0.2;

  clientCounterText = this.add.text(10, 10, `จำนวนผู้เล่น: ${lengthPlayer}`, {
    fontSize: '32px',
    fill: '#ffffff'
  });

  playerText = this.add.text(10, 50, `หมายเลข: ${playerNumber} `, {
    fontSize: '32px',
    fill: '#ffffff'
  });


  this.leftBtn = this.add.sprite(this.scale.width * 0.15, this.scale.height * 0.8, 'leftBtn')
    .setOrigin(0.5, 0.5)
    .setDisplaySize(buttonSize, buttonSize)
    .setInteractive();

  this.rightBtn = this.add.sprite(this.scale.width * 0.85, this.scale.height * 0.8, 'rightBtn')
    .setOrigin(0.5, 0.5)
    .setDisplaySize(buttonSize, buttonSize)
    .setInteractive();

  this.orangeP1 = this.add.sprite(this.scale.width / 1.5, this.scale.height / 2, `orange${this.orange1}`)
    .setOrigin(0.5, 0.5)
    .setDisplaySize(orangeSize, orangeSize)
    .setInteractive()
    .setVisible(true);

  this.orangeP2 = this.add.sprite(this.scale.width / 3, this.scale.height / 2, `orange${this.orange2}`,)
    .setOrigin(0.5, 0.5)
    .setDisplaySize(orangeSize, orangeSize)
    .setInteractive()
    .setVisible(true);

  this.player = this.add.image(this.scale.width / 2, this.scale.height / 5, `player${this.playerType}`)
    .setOrigin(0.5, 0.5)
    .setDisplaySize(peopleSize, peopleSize)
    .setInteractive();

  this.startBtn = this.add.image(this.scale.width / 2, this.scale.height / 2, `startBtn`)
    .setOrigin(0.5, 0.5)
    .setDisplaySize(peopleSize, peopleSize)
    .setInteractive();
  this.readyBtn = this.add.image(this.scale.width / 1.2, this.scale.height / 10, `readyBtn`)
    .setOrigin(0.5, 0.5)
    .setDisplaySize(peopleSize * 2, peopleSize * 2)
    .setInteractive()
    .setVisible(false);



  timeText = this.add.text(this.scale.width / 1.3, 50, formatTime(timeRemaining), {
    fontSize: '32px',
    fill: '#ffffff'
  });

  socket.on('start', ({ isStart }) => {
    // console.log('lose',isLose)
    if (isStart) {
      // สร้าง Timer Event ที่จะลดเวลาในทุกๆ 1 วินาที
      this.startBtn.setVisible(false);
      timeRemaining = 120;

      this.time.addEvent({
        delay: 1000, // 1 วินาที (1000 มิลลิวินาที)
        callback: countdown,
        callbackScope: this,
        loop: isStart ? true : false  // ทำให้ timer ทำงานตลอด
      });
    } else {
      socket.emit('error', { message: 'Error Timer', id: socket.id })
    }
  })


  this.videoWin = this.add.video(this.scale.width / 2, this.scale.height / 2, 'win')
    .setVisible(false)
    .setInteractive()// (x, y, key)

  this.videoWin.on('pointerdown', () => {
    // console.log('videoWiner')
    isWiner = false;
    closeWin = true;
    this.videoWin.setVisible(false).stop()
    this.startBtn.setVisible(true);
    location.reload();
  })


  this.video = this.add.video(this.scale.width / 2, this.scale.height / 2, 'lose')
    .setVisible(false)
    .setInteractive()// (x, y, key)

  this.video.on('pointerdown', () => {
    // console.log('video')
    isLose = false;
    this.video.setVisible(false).stop()
    socket.emit('stop', { isLose })
    this.startBtn.setVisible(true)
  })

  this.startBtn.on('pointerdown', () => {
    // console.log("start")
    closeWin = false;
    socket.emit('start', { isStart: true });
  });
  this.readyBtn.on('pointerdown', () => {
    // console.log("ready")
  });

  this.orangeP1.on('pointerdown', () => {
    // ทำให้ array select ว่างเปล่าก่อน
    select.length = 0;

    if (select.length === 0) {
      this.orangeP2.setDisplaySize(orangeSize, orangeSize);
      this.orangeP1.setDisplaySize(orangeSize * 2, orangeSize * 2);
      select.push(this.orangeP1, "P1");
      // console.log(select);
    } else {
      this.orangeP1.setDisplaySize(orangeSize, orangeSize);
      select.pop();
      // console.log(select);
    }
  });

  this.orangeP2.on('pointerdown', () => {
    // ทำให้ array select ว่างเปล่าก่อน
    select.length = 0;

    if (select.length === 0) {
      this.orangeP1.setDisplaySize(orangeSize, orangeSize);
      this.orangeP2.setDisplaySize(orangeSize * 2, orangeSize * 2);
      select.push(this.orangeP2, "P2");  // แก้ให้ถูกต้อง orangeP2 แทน orangeP1
      // console.log(select);
    } else {
      this.orangeP2.setDisplaySize(orangeSize, orangeSize);
      select.pop();
      // console.log(select);
    }
  });


  this.background.on('pointerdown', () => {
    this.orangeP1.setDisplaySize(orangeSize, orangeSize);
    this.orangeP2.setDisplaySize(orangeSize, orangeSize);
    if (select.length) {
      select.pop();
      // console.log(select);
    }
  });


  this.leftBtn.on('pointerdown', () => {
    // console.log('Change to left');

    // เปลี่ยนขนาดของปุ่ม
    this.leftBtn.setDisplaySize(buttonSize * 1.2, buttonSize * 1.2);

    if (this.orangeP1.visible && this.orangeP2.visible) {
      // ตรวจสอบว่า select มีข้อมูลและมีความยาวอย่างน้อย 2
      if (select && select.length >= 2) {
        // console.log(select[0]);

        // เช็คว่า `select[1]` มีค่าเป็นคีย์ของ sprite ที่ถูกต้องหรือไม่
        if (this[`orange${select[1]}`]) {
          this[`orange${select[1]}`].setVisible(false); // ซ่อน sprite
        } else {
          console.error(`Sprite 'orange${select[1]}' ไม่พบใน this`);
        }

        // ส่งข้อมูลผ่าน socket
        socket.emit('sendOrange', { data: select[0], toNumber: playerNumber - 1, fromNumber: playerNumber });

      } else {
        console.log('select ไม่มีข้อมูลหรือไม่ครบถ้วน'); // ไม่มีข้อมูลใน select หรือ select.length < 2
      }
    }
  });


  this.leftBtn.on('pointerout', () => {
    // ย่อกลับเมื่อเลิกโฮเวอร์
    // console.log('Change to right');
    this.leftBtn.setDisplaySize(buttonSize, buttonSize);

  });

  this.rightBtn.on('pointerdown', () => {

    this.rightBtn.setDisplaySize(buttonSize * 1.2, buttonSize * 1.2);

    if (this.orangeP1.visible && this.orangeP2.visible) {
      // console.log('send orange');

      // ตรวจสอบว่า select มีข้อมูลและมีความยาวอย่างน้อย 2_  
      if (select && select.length >= 2) {
        // เปลี่ยนขนาดของปุ่ม

        // เช็คว่า `select[1]` มีค่าเป็นคีย์ของ sprite ที่ถูกต้องหรือไม่
        if (this[`orange${select[1]}`]) {
          this[`orange${select[1]}`].setVisible(false);
        } else {
          console.error(`Sprite 'orange${select[0]}' ไม่พบใน this`);
          return;
        }
        socket.emit('sendOrange', { data: select[0], toNumber: playerNumber + 1, fromNumber: playerNumber });
        // ส่งข้อมูลผ่าน socket
      } else {
        console.log('ไม่มีข้อมูลใน select '); // ไม่มีข้อมูลใน select หรือ select.length < 2
      }
    } else {
      console.log('not send orange');
    }
  });


  socket.on('receiveOrange', (orange) => {
    if (this.orangeP1.visible && this.orangeP2.visible) {
      socket.emit('error', { message: 'ผู้เล่นมีส้ม2ลูกแล้ว' });
      socket.emit('sendOrange', { data: orange.data, toNumber: orange.fromNumber });
      return;
    } else {
      // console.log('Received data:', orange.data, orange.fromNumber);
      // ตรวจสอบว่า orangeP1 ถูกตั้งค่า setVisible(false) หรือไม่
      if (!this.orangeP1.visible) {
        this.orangeP1.setTexture(orange.data.textureKey);  // ตั้งค่า texture ให้กับ orangeP1
        this.orangeP1.setVisible(true);  // แสดง orangeP1
      }
      // ตรวจสอบว่า orangeP2 ถูกตั้งค่า setVisible(false) หรือไม่
      else if (!this.orangeP2.visible) {
        this.orangeP2.setTexture(orange.data.textureKey);  // ตั้งค่า texture ให้กับ orangeP2
        this.orangeP2.setVisible(true);  // แสดง orangeP2
      }
    }


  });

  this.rightBtn.on('pointerout', () => {
    this.rightBtn.setDisplaySize(buttonSize, buttonSize);

  });

  // console.log(this.orangeP1.texture.key)

  this.scale.on('resize', resize, this);
}

let isStartGame = false;

socket.on('start', ({ isStart }) => {
  isStartGame = isStart;

})

socket.on('stop', ({ stop }) => {
  // console.log('stop:', stop);
  isStartGame = !stop;
})


socket.on('weIsWin', () => {
  isWiner = true;
  // console.log('weIsWin');
})


socket.on('error', ({ message }) => {
  alert(message);
})

function update() {
  // Update player and client counter text
  playerText.setText(`หมายเลข: ${playerNumber} `, {
    fontSize: '32px',
    fill: '#ffffff'
  });
  clientCounterText.setText(`จํานวนผู้เล่น: ${lengthPlayer} `, {
    fontSize: '32px',
    fill: '#ffffff'
  });


  if (!isStartGame) {
    if (showNumOrange === 1) {
      // Ensure random selection is only done once
      if (selectedOrange === null) {
        selectRandomOrange();
      }
      // Set the visibility of the selected orange
      this[`orange${selectedOrange}`].setVisible(true);
      // Ensure the other orange is hidden
      this[`orange${selectedOrange === 'P1' ? 'P2' : 'P1'}`].setVisible(false);

    } else if (showNumOrange === 2) {
      this.orangeP1.setVisible(true);
      this.orangeP2.setVisible(true);
    }
  }


  this.player.setTexture(`player${choiceAF[playerNumber]}`);

  if (isLose) {
    this.video.setVisible(true)
    this.video.play(true)
  }
  if (isWiner && !closeWin) {
    isLose = false;
    this.time.removeAllEvents();
    this.videoWin.setVisible(true);
    this.videoWin.play(true);
  }


  if (isStartGame) {

    if (this.orangeP1.texture.key === `orange${choiceAF[playerNumber]}` && this.orangeP1.visible) {
      socket.emit('sendWin', { isWin: true, id: socket.id });
      // console.log('win')
    }

    if (this.orangeP2.texture.key === `orange${choiceAF[playerNumber]}` && this.orangeP2.visible) {
      socket.emit('sendWin', { isWin: true, id: socket.id });
      // console.log('win')
    }
  }



}




let selectedOrange = null;

// Function to perform random selection of oranges
function selectRandomOrange() {
  const arr = ['P1', 'P2'];

  // Function to get a random element from an array
  function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Get a random element and store it in selectedOrange
  selectedOrange = getRandomElement(arr);
  // console.log(selectedOrange);
}
function resize(gameSize, baseSize, displaySize, resolution) {
  const width = gameSize.width;
  const height = gameSize.height;

  // Resize background image
  this.background.setDisplaySize(width, height).setPosition(width / 2, height / 2);

  // Recalculate button size and adjust position
  const buttonSize = Math.min(width, height) * 0.15;
  this.leftBtn.setDisplaySize(buttonSize, buttonSize).setPosition(width * 0.15, height * 0.8);
  this.rightBtn.setDisplaySize(buttonSize, buttonSize).setPosition(width * 0.85, height * 0.8);
}

window.addEventListener('resize', () => {
  game.scale.resize(window.innerWidth, window.innerHeight);
});

const changeOrange = (type) => {
  if (type === 'right') {
    // console.log('Change to right');
  } else {
    // console.log('Change to left');
  }
};


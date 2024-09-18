const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// เก็บข้อมูลของผู้เล่นทั้งหมด
let players = {};
const winStatus = {};

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


const oranges = ['orangeA', 'orangeB', 'orangeC', 'orangeD', 'orangeE', 'orangeF'];
// ฟังก์ชันเพื่อหาหมายเลขสูงสุดในระบบ
const getMaxNumber = () => {
  const numbers = Object.values(players).map(player => player.number);
  return Math.max(...numbers);
};
const getminNumber = () => {
  const numbers = Object.values(players).map(player => player.number);
  return Math.min(...numbers);
};

let orange1 = ['A', 'B', 'C', 'D', 'E', 'F'];
let orange2 = ['A', 'B', 'C', 'D', 'E', 'F'];

// ตัวแปรเพื่อเก็บข้อมูลที่สุ่มไปแล้ว
let usedOranges = {
  orange1: [],
  orange2: []
};

const randomFromArray = (array, usedArray) => {
  if (array.length === 0) {
    console.log('ไม่มีตัวเลือกเหลือ');
    return null; // ถ้า array ว่างเปล่าแล้ว
  }

  // สุ่มตำแหน่งจาก array
  const randomIndex = Math.floor(Math.random() * array.length);
  
  // ดึงตัวอักษรที่สุ่มได้
  const randomChar = array[randomIndex];
  
  // ลบตัวอักษรที่สุ่มได้ออกจาก array
  array.splice(randomIndex, 1);
  
  // เก็บข้อมูลที่ถูกลบ
  usedArray.push(randomChar);

  return randomChar;
};

const getUniqueRandoms = () => {
  let random1, random2;

  do {
    // สุ่มตัวเลือกสำหรับ orange1
    random1 = randomFromArray(orange1, usedOranges.orange1);
    
    // สุ่มตัวเลือกสำหรับ orange2
    random2 = randomFromArray(orange2, usedOranges.orange2);

    // ตรวจสอบว่าตัวเลือกทั้งสองไม่เหมือนกัน
  } while (random1 === random2);

  return { random1, random2 };
};

io.on('connection', (socket) => {
  console.log('A player connected:', socket.id);
  const { random1, random2 } = getUniqueRandoms();

  io.emit('randomOrange', {
    random1,
    random2
  });
  // console.log(orange1)
  // console.log(orange2)

  // เพิ่มผู้เล่นใหม่ด้วยหมายเลขถัดไป
  players[socket.id] = {
    id: socket.id,
    number: Object.keys(players).length + 1 // หมายเลขผู้เล่นจะเป็นตัวเลขต่อจากจำนวนผู้เล่นที่มีอยู่
  };

  // ส่งข้อมูลผู้เล่นทั้งหมดให้ทุกคน
  io.emit('data', { data: players });

  // ส่งข้อมูลของผู้เล่นให้ตัวเอง
  io.to(socket.id).emit('player', { player: players[socket.id] });

  // จัดการเหตุการณ์การส่ง orange
  socket.on('sendOrange', ({ data, toNumber, fromNumber }) => {
    // console.log('Data received:', data);
    // console.log('Send to player number:', toNumber);

    // หากหมายเลขเป็น 0, เปลี่ยนเป็นหมายเลขสูงสุด
    if (toNumber === 0) {
      toNumber = getMaxNumber();
    }
    if (toNumber > getMaxNumber()) {
      toNumber = getminNumber();
    }

    // ค้นหาผู้เล่นที่มีหมายเลข `toNumber`
    const targetPlayerId = Object.keys(players).find(
      (id) => players[id].number === toNumber
    );

    if (targetPlayerId) {
      // ส่งข้อมูลไปยังผู้เล่นที่ตรงกับหมายเลขเป้าหมาย
      io.to(targetPlayerId).emit('receiveOrange', { data, fromNumber });
      // console.log(`Data sent to player ${targetPlayerId}`);
    } else {
      console.log('Player with number', toNumber, 'not found');
    }
  });


  socket.on('start', ({ isStart }) => {
    // console.log('start');
    io.emit('start', {
      isStart
    });
  })

  assignRandomNumbers(players);

  socket.on('error', ({ message, id }) => {
    console.log('Error:', message);
    io.to(id).emit('error', { message });
  });

  socket.on('stop', ({ isLose }) => {
    // console.log('stop')
    io.emit('stop', {
      stop: true
    });
  })

  socket.on('sendWin', ({ isWin, id }) => {
    // เก็บสถานะการชนะของผู้เล่นใน winStatus
    winStatus[id] = isWin;

    // ตรวจสอบว่าผู้เล่นทุกคนส่งสถานะการชนะแล้วหรือยัง
    if (Object.keys(winStatus).length === Object.keys(players).length) {
      // เมื่อผู้เล่นทุกคนส่งสถานะครบแล้ว ตรวจสอบว่ามีใครชนะหรือไม่
      const allWin = Object.values(winStatus).every(status => status === true);

      if (allWin) {
        io.emit('weIsWin');
        // console.log('weIsWin');
      } else {
        io.emit('weIsNotWin');
      }

      // เคลียร์สถานะ winStatus เพื่อเตรียมรับสถานะในรอบถัดไป
      Object.keys(winStatus).forEach(id => {
        delete winStatus[id];
      });
    }
  });
  ``


  // จัดการการตัดการเชื่อมต่อ
  socket.on('disconnect', () => {
    console.log('A player disconnected:', socket.id);

    // ลบผู้เล่นที่ตัดการเชื่อมต่อออกจาก players
    delete players[socket.id];
    io.emit('stop', {
      stop: true
    });

    // เรียงลำดับหมายเลขผู้เล่นใหม่หลังจากผู้เล่นตัดการเชื่อมต่อ
    reorderPlayerNumbers();
    assignRandomNumbers(players);
    // คืนค่าข้อมูลที่ถูกลบกลับไปยัง orange1 และ orange2
    usedOranges.orange1.forEach((item) => orange1.push(item));
    usedOranges.orange2.forEach((item) => orange2.push(item));

    // ล้างตัวแปร usedOranges
    usedOranges.orange1 = [];
    usedOranges.orange2 = [];
    // console.log(orange1)
    // console.log(orange2)

  });
});



// ฟังก์ชันจัดเรียงหมายเลขผู้เล่นใหม่
const reorderPlayerNumbers = () => {
  const playerIds = Object.keys(players);

  // จัดเรียงผู้เล่นโดยให้หมายเลขเรียงลำดับ
  playerIds.forEach((id, index) => {
    players[id].number = index + 1; // กำหนดหมายเลขใหม่ให้เรียงตามลำดับ
  });

  // ส่งข้อมูลผู้เล่นที่อัปเดตไปยังลูกค้าทั้งหมด
  io.emit('data', { data: players });
};

function assignRandomNumbers(players) {
  // ตรวจสอบว่า players เป็น array หรือไม่
  if (!Array.isArray(players)) {
    // ถ้า players เป็น object แปลง object ให้เป็น array ของค่าที่เก็บอยู่ใน object
    players = Object.values(players);
  }

  const playerCount = players.length;

  // สุ่มผู้เล่นคนหนึ่งเพื่อให้ได้รับหมายเลข 1
  const playerWithOne = Math.floor(Math.random() * playerCount);

  // สร้าง object สำหรับเก็บผลลัพธ์
  const playerNumbers = {};

  players.forEach((player, index) => {
    if (index === playerWithOne) {
      playerNumbers[player.id] = 1; // ผู้เล่นที่ถูกเลือกจะได้หมายเลข 1
    } else {
      playerNumbers[player.id] = 2; // ผู้เล่นที่เหลือจะได้หมายเลข 2
    }
  });

  // ส่งข้อมูลหมายเลขที่กำหนดให้ผู้เล่นไปยัง server
  io.emit('randomOneOrTwo', playerNumbers);
}






const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

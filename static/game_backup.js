'use strict';

const socket = io();
const canvas = $('#canvas-2d')[0];
const context = canvas.getContext('2d');
//const playerImage = $('#player-image')[0];
//[$('#0')[0],$('#1')[0],$('#2')[0],$('#3')[0],$('#4')[0],$('#5')[0],$('#6')[0],$('#7')[0],$('#8')[0],$('#9')[0]],
let playerImage = [
    [$('#sw0-0')[0],$('#sw0-0')[0],$('#sw0-0')[0],$('#sw0-0')[0],$('#sw0-0')[0],$('#sw0-0')[0],$('#sw0-0')[0],$('#sw0-0')[0],$('#sw0-0')[0],$('#sw0-0')[0],$('#sw0-0')[0]],
    [$('#sw1-0')[0],$('#sw1-1')[0],$('#sw1-2')[0],$('#sw1-3')[0],$('#sw1-4')[0],$('#sw0-0')[0],$('#sw0-0')[0],$('#sw0-0')[0],$('#sw0-0')[0],$('#sw0-0')[0],$('#sw0-0')[0]],
    [$('#sw2-0')[0],$('#sw2-1')[0],$('#sw2-2')[0],$('#sw2-3')[0],$('#sw2-4')[0],$('#sw2-5')[0],$('#sw2-6')[0],$('#sw0-0')[0],$('#sw0-0')[0],$('#sw0-0')[0],$('#sw0-0')[0]],
    [$('#sw3-0')[0],$('#sw3-1')[0],$('#sw3-2')[0],$('#sw3-3')[0],$('#sw3-4')[0],$('#sw3-5')[0],$('#sw3-6')[0],$('#sw3-7')[0],$('#sw3-8')[0],$('#sw3-9')[0],$('#sw0-0')[0]],
    [$('#sw4-0')[0],$('#sw4-1')[0],$('#sw4-2')[0],$('#sw4-3')[0],$('#sw4-4')[0],$('#sw4-5')[0],$('#sw4-6')[0],$('#sw0-0')[0],$('#sw0-0')[0],$('#sw0-0')[0],$('#sw0-0')[0]],
    [$('#sw5-0')[0],$('#sw5-1')[0],$('#sw5-2')[0],$('#sw5-3')[0],$('#sw5-4')[0],$('#sw5-5')[0],$('#sw5-6')[0],$('#sw5-7')[0],$('#sw5-8')[0],$('#sw5-9')[0],$('#sw5-10')[0]],
]

function gameStart(){
    socket.emit('game-start', {nickname: $("#nickname").val() });
    $("#start-screen").hide();
}
$("#start-button").on('click', gameStart);
/*
function sendchat(){
    socket.emit('chat', {chat: $("#chat").val() });
}
$("#send-button").on('click', sendchat);*/

let movement = {};

$(document).on('keydown keyup', (event) => {
    const KeyToCommand = {
        'ArrowUp': 'forward',
        'ArrowDown': 'back',
        'ArrowLeft': 'left',
        'ArrowRight': 'right',
        's': 's',
    };
    const command = KeyToCommand[event.key];
    if(command){
        if(event.type === 'keydown'){
            movement[command] = true;
        }else{ /* keyup */
            movement[command] = false;
        }
        socket.emit('movement', movement);
    }
    if(event.key === ' ' && event.type === 'keydown'){
        socket.emit('shoot');
    }
    if(event.key === 'a' && event.type === 'keydown'){
        socket.emit('a');
    }
});

socket.on('state', function(players, hit_boxes, bullets, walls) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.lineWidth = 10;
    //context.rect(0, 0, canvas.width, canvas.height);
    //context.stroke();
    //context.beginPath();
    context.imageSmoothingEnabled = false;

    Object.values(players).forEach((player) => {
        context.save();
        context.fillStyle = "black";
        context.font = '15px Bold Arial';
        context.fillText(player.nickname, player.x, player.y - 25);
        context.font = '10px Bold Arial';
        context.lineWidth = 1 ;
        context.fillRect(player.x , player.y - 12, 100 , 6);
        context.fillStyle = "red";
        context.fillRect(player.x + 1, player.y - 11, Math.floor(98*(player.health/player.maxHealth)) , 4);
        context.fillStyle = "rgba(0,128,0,0.5)";
        context.fillRect(player.x - 1, player.y - 1, player.width + 1, player.height + 1);
        
        context.fillStyle = "rgba(255,0,0,0.8)";
        if(player.charge > 3){
            context.beginPath();
            context.arc( player.x+player.width/2, player.y + player.height/2, player.charge/2, 0 * Math.PI / 180, 360 * Math.PI / 180, false ) ;
            context.closePath();
            context.fill();
        }

        context.translate(player.x + player.width/2, player.y + player.height/2);
        if(player.direction < 0){
            context.scale(-1,1);
        }


        context.drawImage(playerImage[Number(player.figure)][Number(player.anime_num)], 0, 0, playerImage[Number(player.figure)][Number(player.anime_num)].width, playerImage[Number(player.figure)][Number(player.anime_num)].height, -player.width/2, -player.height/2, player.width, player.height);

        context.restore();//無いと止まる
        
        if(player.socketId === socket.id){
            //デバッグ用各値表示
            context.fillStyle = "black";
            context.fillRect(0, 0, 300 , 15);
            context.fillStyle = "red";
            context.fillRect(3, 3, Math.floor(294*(player.health/player.maxHealth)), 9);

            context.fillStyle = "black";
            context.font = '15px Bold Arial';
            context.fillText("(x,y)=("+Math.floor(player.x) +","+ Math.floor(player.y)+")", 20, 15);
            context.fillText("(vx,vy)=("+Math.floor(player.vector_x) +","+ Math.floor(player.vector_y)+")", 20, 30);
            context.fillText("(dir,hp,maxhp)=(" + player.direction + "," + player.health + "," + player.maxHealth + ")", 20, 45);
            context.fillText("(figure,anime_num,rigid,charge)=(" + player.figure + "," + player.anime_num + "," + player.rigid + "," + player.charge + ")", 20, 60);
        }
    });
    context.translate(0, 0);
    context.closePath();
    Object.values(hit_boxes).forEach((hit_box) => {
        context.save();
        context.fillStyle = "rgba(0,0,255,0.8)";
        context.fillRect(hit_box.x, hit_box.y, hit_box.width, hit_box.height);
        context.restore();
    });
    Object.values(bullets).forEach((bullet) => {
        //context.arc(bullet.x, bullet.y, bullet.width/2, 0, 2 * Math.PI);
        //context.closePath();
    });
    Object.values(walls).forEach((wall) => {
        context.save();
        context.fillStyle = 'black';
        context.fillRect(wall.x, wall.y, wall.width, wall.height);
        context.restore();
    });
});

socket.on('dead', () => {
    $("#start-screen").show();
});


const touches = {};
$('#canvas-2d').on('touchstart', (event)=>{ 
    socket.emit('a');
    movement.forward = true;
    Array.from(event.changedTouches).forEach((touch) => {
        touches[touch.identifier] = {pageX: touch.pageX, pageY: touch.pageY};
    });
    event.preventDefault();
    console.log('touches', touches, event.touches);
});
$('#canvas-2d').on('touchmove', (event)=>{
    movement.right = false;
    movement.left = false;
    Array.from(event.touches).forEach((touch) => {
        const startTouch = touches[touch.identifier];
        movement.right |= touch.pageX - startTouch.pageX > 30;
        movement.left |= touch.pageX - startTouch.pageX < -30;
    });
    socket.emit('movement', movement);
    event.preventDefault();
});
$('#canvas-2d').on('touchend', (event)=>{
    Array.from(event.changedTouches).forEach((touch) => {
        delete touches[touch.identifier];
    });
    if(Object.keys(touches).length === 0){
        movement = {};
        socket.emit('movement', movement);
    }
    event.preventDefault();
});

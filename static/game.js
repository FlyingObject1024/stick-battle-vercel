'use strict';

const socket = io();
const canvas = $('#canvas-2d')[0];
const context = canvas.getContext('2d');
const FIELD_WIDTH = 1536, FIELD_HEIGHT = 768;
var projectile_num = 0;
let sound_switch = true;

let background = $('#sea')[0];

let projectileImage = [
    [$('#pr0-0')[0],$('#pr0-0')[0],$('#pr0-0')[0],$('#pr0-0')[0],$('#pr0-0')[0],$('#pr0-0')[0],$('#pr0-0')[0],$('#pr0-0')[0]],
    [$('#pr1-0')[0],$('#pr1-1')[0],$('#pr1-2')[0],$('#pr1-3')[0],$('#pr1-4')[0],$('#pr1-5')[0],$('#pr1-6')[0],$('#pr1-7')[0],$('#pr1-8')[0],$('#pr1-9')[0]],
    [$('#pr2-0')[0],$('#pr2-1')[0],$('#pr2-1')[0],$('#pr2-2')[0],$('#pr2-3')[0],$('#pr2-4')[0],$('#pr2-5')[0],$('#pr2-6')[0]],
    [$('#pr3-0')[0]],
    [$('#pr4-0')[0]],
    [$('#pr5-0')[0],$('#pr5-1')[0],$('#pr5-2')[0],$('#pr5-3')[0],$('#pr5-4')[0],$('#pr5-5')[0],$('#pr5-6')[0],$('#pr5-7')[0],$('#pr5-8')[0]],
    [$('#pr6-0')[0],$('#pr6-1')[0],$('#pr6-2')[0],$('#pr6-3')[0],$('#pr6-4')[0],$('#pr6-5')[0],$('#pr6-6')[0],$('#pr6-7')[0],$('#pr6-8')[0],$('#pr6-9')[0]],
]

let playerImage = [
    [$('#sw0-0')[0],$('#sw0-0')[0],$('#sw0-0')[0],$('#sw0-0')[0],$('#sw0-0')[0],$('#sw0-0')[0],$('#sw0-0')[0],$('#sw0-0')[0],$('#sw0-0')[0],$('#sw0-0')[0],$('#sw0-0')[0]],
    [$('#sw1-0')[0],$('#sw1-1')[0],$('#sw1-2')[0],$('#sw1-3')[0],$('#sw1-4')[0],$('#sw0-0')[0],$('#sw0-0')[0],$('#sw0-0')[0],$('#sw0-0')[0],$('#sw0-0')[0],$('#sw0-0')[0]],
    [$('#sw2-0')[0],$('#sw2-1')[0],$('#sw2-2')[0],$('#sw2-3')[0],$('#sw2-4')[0],$('#sw2-5')[0],$('#sw2-6')[0],$('#sw0-0')[0],$('#sw0-0')[0],$('#sw0-0')[0],$('#sw0-0')[0]],
    [$('#sw3-0')[0],$('#sw3-1')[0],$('#sw3-2')[0],$('#sw3-3')[0],$('#sw3-4')[0],$('#sw3-5')[0],$('#sw3-6')[0],$('#sw3-7')[0],$('#sw3-8')[0],$('#sw3-9')[0],$('#sw0-0')[0]],
    [$('#sw4-0')[0],$('#sw4-1')[0],$('#sw4-2')[0],$('#sw4-3')[0],$('#sw4-4')[0],$('#sw4-5')[0],$('#sw4-6')[0],$('#sw0-0')[0],$('#sw0-0')[0],$('#sw0-0')[0],$('#sw0-0')[0]],
    [$('#sw5-0')[0],$('#sw5-1')[0],$('#sw5-2')[0],$('#sw5-3')[0],$('#sw5-4')[0],$('#sw5-5')[0],$('#sw5-6')[0],$('#sw5-7')[0],$('#sw5-8')[0],$('#sw5-9')[0],$('#sw5-10')[0]],

    [$('#gn0-0')[0],$('#gn0-0')[0],$('#gn0-0')[0],$('#gn0-0')[0],$('#gn0-0')[0],$('#gn0-0')[0],$('#gn0-0')[0],$('#gn0-0')[0],$('#gn0-0')[0],$('#gn0-0')[0],$('#gn0-0')[0],$('#gn0-0')[0],$('#gn0-0')[0],$('#gn0-0')[0]],
    [$('#gn1-0')[0],$('#gn1-1')[0],$('#gn1-2')[0],$('#gn1-3')[0],$('#gn1-4')[0],$('#gn0-0')[0],$('#gn0-0')[0],$('#gn0-0')[0],$('#gn0-0')[0],$('#gn0-0')[0],$('#gn0-0')[0],$('#gn0-0')[0],$('#gn0-0')[0],$('#gn0-0')[0]],
    [$('#gn2-0')[0],$('#gn2-1')[0],$('#gn2-2')[0],$('#gn0-0')[0],$('#gn0-0')[0],$('#gn0-0')[0],$('#gn0-0')[0],$('#gn0-0')[0],$('#gn0-0')[0],$('#gn0-0')[0],$('#gn0-0')[0],$('#gn0-0')[0],$('#gn0-0')[0],$('#gn0-0')[0]],
    [$('#gn3-0')[0],$('#gn3-1')[0],$('#gn3-2')[0],$('#gn3-3')[0],$('#gn3-4')[0],$('#gn3-5')[0],$('#gn3-6')[0],$('#gn3-7')[0],$('#gn3-8')[0],$('#gn3-9')[0],$('#gn3-10')[0],$('#gn3-11')[0],$('#gn3-12')[0],$('#gn0-0')[0]],
    [$('#gn4-0')[0],$('#gn4-1')[0],$('#gn4-2')[0],$('#gn4-3')[0],$('#gn4-4')[0],$('#gn4-5')[0],$('#gn4-6')[0],$('#gn4-7')[0],$('#gn4-8')[0],$('#gn0-0')[0],$('#gn0-0')[0],$('#gn0-0')[0],$('#gn0-0')[0],$('#gn0-0')[0]],

    [$('#gl0-0')[0]],
    [$('#gl1-0')[0]],
    [$('#gl2-0')[0],$('#gl2-1')[0],$('#gl2-2')[0],$('#gl2-3')[0],$('#gl2-4')[0]],
    [$('#gl3-0')[0],$('#gl3-1')[0],$('#gl3-1')[0],$('#gl3-1')[0],$('#gl3-1')[0]],
    [$('#gl4-0')[0],$('#gl4-1')[0],$('#gl4-2')[0],$('#gl4-3')[0],$('#gl4-4')[0]],
    
    [$('#sp0-0')[0]],
    [$('#sp1-0')[0],$('#sp1-1')[0],$('#sp1-2')[0],$('#sp1-3')[0]],
    [$('#sp2-0')[0],$('#sp2-1')[0],$('#sp2-2')[0],$('#sp2-3')[0]],
    [$('#sp3-0')[0],$('#sp3-1')[0],$('#sp3-2')[0],$('#sp3-3')[0],$('#sp3-4')[0],$('#sp3-5')[0],$('#sp3-6')[0],$('#sp3-7')[0],$('#sp3-8')[0],$('#sp3-9')[0],$('#sp3-10')[0],$('#sp3-11')[0],$('#sp3-12')[0],$('#sp3-13')[0],$('#sp3-14')[0],$('#sp3-15')[0],$('#sp3-16')[0],$('#sp3-17')[0],$('#sp3-18')[0],$('#sp3-19')[0],$('#sp3-20')[0],$('#sp3-21')[0],$('#sp3-22')[0]],
]


const sound_join = new Audio();
const sound_ko = new Audio();

const sound_rod = new Audio();

const sound_boom = new Audio();
const sound_gun = new Audio();

const sound_sword_swing = new Audio();
const sound_sword_stab = new Audio();
const sound_sword_upper = new Audio();
const sound_sword_down = new Audio();

const sound_punch = new Audio();
const sound_kick = new Audio();
const sound_powerwave = new Audio();


sound_join.src="https://stickbattle-flyingobject.herokuapp.com/static/sounds/join.mp3";
sound_ko.src="https://stickbattle-flyingobject.herokuapp.com/static/sounds/ko.mp3";
sound_sword_swing.src="https://stickbattle-flyingobject.herokuapp.com/static/sounds/sword_swing.mp3";
sound_sword_stab.src="https://stickbattle-flyingobject.herokuapp.com/static/sounds/sword_stab.mp3";
sound_sword_upper.src="https://stickbattle-flyingobject.herokuapp.com/static/sounds/sword_upper.mp3";
sound_sword_down.src="https://stickbattle-flyingobject.herokuapp.com/static/sounds/sword_down.mp3";
sound_punch.src="https://stickbattle-flyingobject.herokuapp.com/static/sounds/punch.mp3";
sound_kick.src="https://stickbattle-flyingobject.herokuapp.com/static/sounds/kick.mp3";
sound_powerwave.src="https://stickbattle-flyingobject.herokuapp.com/static/sounds/powerwave.mp3";
sound_rod.src="https://stickbattle-flyingobject.herokuapp.com/static/sounds/rod.mp3";
sound_rod.src="https://stickbattle-flyingobject.herokuapp.com/static/sounds/rod.mp3";
sound_boom.src="https://stickbattle-flyingobject.herokuapp.com/static/sounds/cannon1.mp3";
sound_gun.src="https://stickbattle-flyingobject.herokuapp.com/static/sounds/machine_gun.mp3";

/*
sound_join.src="/static/sounds/join.mp3";
sound_ko.src="/static/sounds/ko.mp3";
sound_sword_swing.src="/static/sounds/sword_swing.mp3";
sound_sword_stab.src="/static/sounds/sword_stab.mp3";
sound_sword_upper.src="/static/sounds/sword_upper.mp3";
sound_sword_down.src="/static/sounds/sword_down.mp3";
sound_punch.src="/static/sounds/punch.mp3";
sound_kick.src="/static/sounds/kick.mp3";
sound_powerwave.src="/static/sounds/powerwave.mp3";
sound_rod.src="/static/sounds/rod.mp3";
sound_boom.src="/static/sounds/cannon1.mp3";
sound_gun.src="/static/sounds/machine_gun.mp3";
*/
/////////////////switch before deploy//////////////////////////////


function switchdevice(){
    if (window.matchMedia('(max-width: 767px)').matches) {
        //スマホ処理
        $("#controller").show();
    } else if (window.matchMedia('(min-width:768px)').matches) {
        //PC処理
        $("#controller").hide();
    }
}

function gameStart(){
    if(sound_switch) sound_join.play();
    socket.emit('game-start', {nickname: $("#nickname").val(),fighter: $('input[name=fighter]:checked').val()});
    $("#start-screen").hide();
    $("#join").hide();
}
$("#start-button").on('click', gameStart);

function viewMode(){
    $("#start-screen").hide();
}
$("#view-button").on('click', viewMode);

function joinMode(){
    $("#start-screen").show();
}
$("#join-button").on('click', joinMode);

function sendchat(){
    socket.emit('chat', {chat: $("#chat").val() });
    $("#chat").val("");
}
$("#send-button").on('click', sendchat);
/*
{
    const btn = document.getElementById('sound-button');
    btn.addEventListener('click', () => {
        if(soundswitch){
            soundswitch = false;
            btn.textContent = 'now sound off';
        }
        else{
            soundswitch = true;
            btn.textContent = 'now sound on';
        }
   })
}*/



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
    if(event.key === 'a' && event.type === 'keydown'){
        socket.emit('a');
    }
});


function A_button(){
    movement['right'] = true;
    socket.emit('movement', movement);
}
$("#right_button").on('click', A_button);


socket.on('state', function(players, hit_boxes, projectiles, walls, texts) {
    switchdevice();
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.lineWidth = 10;
    context.imageSmoothingEnabled = false;
    projectile_num = 0;

    context.save();
    context.fillStyle = "rgba(165,255,151,1)";
    context.fillRect(0,0,FIELD_WIDTH,FIELD_HEIGHT);
    //context.drawImage(background, 0, 0,  FIELD_WIDTH, FIELD_HEIGHT, 0, 0,  FIELD_WIDTH, FIELD_HEIGHT);
    context.restore();

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
        //context.fillRect(player.x - 1, player.y - 1, player.width + 1, player.height + 1);
        
        if(player.charge > 3){
            context.beginPath();
            context.fillStyle = "rgba(255,128,0,0.5)";
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
            context.fillRect(0, 0, 300 , 20);
            context.fillStyle = "red";
            context.fillRect(3, 3, Math.floor(294*(player.health/player.maxHealth)), 14);
            
            context.fillStyle = "rgba(256,64,0,0.1)";
            context.fillRect(player.x - 1, player.y - 1, player.width + 1, player.height + 1);
            
            context.fillStyle = "black";
            context.font = '20px Bold Arial';
            context.fillText("point "+player.point,310, 15);
            context.fillStyle = "rgba(256,256,256,1)";
            context.font = '15px Bold Arial';
            context.fillText(player.health + "/" + player.maxHealth, 15, 15);
            Object.values(projectiles).forEach((projectile) => {
                projectile_num += 1;
            });
            //context.fillText("p num="+projectile_num, 20, 30);
            //context.fillText("(x,y)=("+Math.floor(player.x) +","+ Math.floor(player.y)+")", 20, 30);
            //context.fillText("(vx,vy)=("+Math.floor(player.vector_x) +","+ Math.floor(player.vector_y)+")", 20, 30);
            //context.fillText("(dir,hp,maxhp)=(" + player.direction + "," + player.health + "," + player.maxHealth + ")", 20, 45);
            //context.fillText("(figure,anime_num,rigid,charge)=(" + player.figure + "," + player.anime_num + "," + player.rigid + "," + player.charge + ")", 20, 60);
        }
    });
    Object.values(hit_boxes).forEach((hit_box) => {
        context.save();
        context.fillStyle = "rgba(0,0,255,0.8)";
        //context.fillRect(hit_box.x, hit_box.y, hit_box.width, hit_box.height);
        context.restore();
    });
    Object.values(projectiles).forEach((projectile) => {
        context.save();

        //context.translate(projectile.x + projectile.width/2, projectile.y + projectile.height/2);
         
        context.translate(projectile.x + projectile.width/2, projectile.y + projectile.height/2);
        if(projectile.direction < 0){
            context.scale(-1,1);
            //context.translate(-canvas.width,0);
        }
        //context.fillText(projectile.x+"/"+projectile.y+"/"+projectile.vector_x+"/"+projectile.vector_y+"/"+projectile.direction, 500, 400);
        
        context.rotate(projectile.angle);
        context.drawImage(projectileImage[projectile.figure][projectile.anime_num], 0, 0, projectileImage[projectile.figure][projectile.anime_num].width, projectileImage[projectile.figure][projectile.anime_num].height, -projectile.width/2, -projectile.height/2, projectile.width, projectile.height);
        context.restore();
    });

    Object.values(walls).forEach((wall) => {
        context.save();
        context.fillStyle = 'black';
        context.fillRect(wall.x, wall.y, wall.width, wall.height);
        context.restore();
    });
    Object.values(texts).forEach((text) => {
        context.save();
        context.fillStyle = text.color;
        context.font = '20px Bold Arial';
        if(text.text.length >= 100){
            text.text = text.text.substr(0,100);
        }
        context.fillText(text.text, text.x, text.y);
        context.restore();
    });
});

socket.on('dead', () => {
    if(sound_switch) sound_ko.play();
    $("#start-screen").show();
    $("#join").show();
});

socket.on('sound', function(file) {
    if(sound_switch){
      if     (file == 'rod') sound_rod.play();
      else if(file == 'boom') sound_boom.play();
      else if(file == 'gun') sound_gun.play();
      else if(file == 'sword_swing') sound_sword_swing.play();
      else if(file == 'sword_stab') sound_sword_stab.play();
      else if(file == 'sword_upper') sound_sword_upper.play();
      else if(file == 'sword_down') sound_sword_down.play();
      else if(file == 'punch') sound_punch.play();
      else if(file == 'kick') sound_kick.play();
      else if(file == 'powerwave') sound_powerwave.play();
    }
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

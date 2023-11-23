'use strict';

const express = require('express');
const http = require('http');
const path = require('path');
const { pid } = require('process');
const socketIO = require('socket.io');
const app = express();
const server = http.Server(app);
const io = socketIO(server);

server.listen(process.env.PORT, process.env.IP);
//server.listen(3000);
/////////////////switch before deploy//////////////////////////////

console.log('server running');

const FIELD_WIDTH = 1536, FIELD_HEIGHT = 768;
const GUN_FIGURE_ZERO = 6;
const GLADIATOR_FIGURE_ZERO = 11;
const SPEAR_FIGURE_ZERO = 16;
let isbotexist = false;


function create_text(text,x,y,vector_x,vector_y,color,lifespan){
    const newtext = new Text({
        id : Math.floor(Math.random()*1000000000),
        x: x,
        y: y,
        vector_x: vector_x,
        vector_y: vector_y,
        width: 100,
        height: 15,
        color: color,
        text: text,
        lifespan: lifespan,
    });
    texts[text.id] = newtext;
}

class GameObject{
    constructor(obj={}){
        this.id = Math.floor(Math.random()*1000000000);
        this.x = FIELD_WIDTH/2;
        this.y = FIELD_HEIGHT/2;
        this.vector_x = 1;
        this.vector_y = 0;
        this.effect_num = 0;
        this.anime_num = 0;
        this.charge = 0;
        this.direction = 0;
        this.width = obj.width;
        this.height = obj.height;
    }
    move_vector(x,y){
        this.vector_x += x;
        this.vector_y += y;
    }
    move_collisionoff(){
        this.x += this.vector_x;
        this.y += this.vector_y;
    }
    move(){
        const oldX = this.x, oldY = this.y;
        
        let collision_x = false;
        let collision_y = false;
        if(this.x < 0 || this.x + this.width >= FIELD_WIDTH){
            collision_x = true;
        }
        if(this.y < 0 || this.y + this.height >= FIELD_HEIGHT){
            collision_y = true;
        }
        if(this.intersectWalls()){
            collision_y = true;
        }
        if(collision_x){
            this.x = oldX;
        }
        if(collision_y){
             this.y = oldY;
             this.vector_y = 0;
        }
        return !(collision_x || collision_y);
    }
    create_hit_boxes(x,y,vx,vy,width,height,damage,lifespan){
        const hit_box = new Hit_box({
            x: x,
            y: y,
            vector_x: vx,
            vector_y: vy,
            width: width,
            height: height,
            damage: damage,
            player: this,
        },lifespan);
        this.hit_boxes[hit_box.id] = hit_box;
        hit_boxes[hit_box.id] = hit_box;
    }
    create_projectiles(type,x,y,vx,vy,angle,direction,damage){
        
    }
    intersect(obj){
        return (this.x <= obj.x + obj.width) &&
            (this.x + this.width >= obj.x) &&
            (this.y <= obj.y + obj.height) &&
            (this.y + this.height >= obj.y);
    }
    intersectWalls(){
        return Object.values(walls).some((wall) => {
            if(this.intersect(wall)){
                return true;
            }
        });
    }
    toJSON(){
        return {id: this.id, x: this.x, y: this.y, vector_x: this.vector_x, vector_y: this.vector_y, width: this.width, height: this.height, angle: this.angle, direction: this.direction,figure: this.figure, anime_num: this.anime_num, player: this.player};
    }
}

class Player extends GameObject{
    constructor(obj={}){
        super(obj);
        this.socketId = obj.socketId;
        this.nickname = obj.nickname;
        this.width = 96;
        this.height = 96;
        this.health = this.maxHealth = 1000;
        this.direction = 0;
        this.rigid = 0;
        this.jump_num = 0;
        this.projectiles = {};
        this.hit_boxes = {};
        this.point = 0;
        this.movement = {};

        do{
            this.x = Math.random() * (FIELD_WIDTH - this.width);
            this.y = Math.random() * (FIELD_HEIGHT - this.height);
            this.direction = 1;
        }while(this.intersectWalls());
    }
    move_vector(x,y){
        this.vector_x += x;
        if(this.figure != 5){
            this.vector_y += y;            
        }
    }
    move(){
        const oldX = this.x, oldY = this.y;
        if(!(this.direction == 1 || this.direction == -1 || this.direction == 0)){
            this.direction = 1;
        }
        if(this.rigid > 0){
            this.rigid -= 1;
        }

        if(this.x + this.vector_x < 0 || FIELD_WIDTH < this.x + this.vector_x){
            this.vector_x /= 2;
        }
        if(this.figure == 5){
            this.vector_x = 0;
        }
        this.x += this.vector_x;
        this.vector_x /= 2;

        if(this.vector_x > 0){
            this.direction = 1;
        }
        else if(this.vector_x < 0){
            this.direction = -1;
        }

        this.y += this.vector_y;
        this.vector_y += 1;
        
        let collision_x = false;
        let collision_y = false;
        if(this.x < 0 || this.x + this.width >= FIELD_WIDTH){
            collision_x = true;
        }
        if(this.y < 0 || this.y + this.height >= FIELD_HEIGHT){
            collision_y = true;
        }
        if(this.intersectWalls()){
            collision_y = true;
        }
        if(collision_x){
            this.x = oldX;
        }
        if(collision_y){
             this.y = oldY;
             this.vector_y = 0;
        }
        return !(collision_x || collision_y);
    }
    attack(attack_type){
        
    }
    create_hit_boxes(x,y,vx,vy,width,height,damage,lifespan){
        const hit_box = new Hit_box({
            x: x,
            y: y,
            vector_x: vx,
            vector_y: vy,
            width: width,
            height: height,
            damage: damage,
            player: this,
        },lifespan);
        this.hit_boxes[hit_box.id] = hit_box;
        hit_boxes[hit_box.id] = hit_box;
    }
    /*create_projectiles(type,x,y,vx,vy,angle,direction,damage){

    }*/
    damage(damage,vx,vy,by){
        this.health -= damage;
        this.vector_x += vx;
        this.vector_y += vy;
        this.damagedby = by;
        if(this.health <= 0){
            create_text(this.nickname + " killed by " + players[this.damagedby].nickname,FIELD_WIDTH,Math.random()*(FIELD_HEIGHT-15),-5,0,'red',300+(this.nickname.length)*3);
            console.log(this.nickname + " killed by " + players[this.damagedby].nickname +" :"+ this.point + 'p');
            this.remove();
        }
    }
    remove(){
        if(this.id == bot.id) isbotexist = false;
        delete players[this.id];
        io.to(this.socketId).emit('dead');
    }
    toJSON(){
        return Object.assign(super.toJSON(), {direction: this.direction, health: this.health, maxHealth: this.maxHealth, socketId: this.socketId, rigid: this.rigid, charge: this.charge,point: this.point, nickname: this.nickname});
    }
}

class Sword extends Player{
    constructor(obj={}){
        super(obj);
        this.socketId = obj.socketId;
        this.nickname = obj.nickname;
        this.width = 96;
        this.height = 96;
        this.figure = 0;
        this.health = this.maxHealth = 1000;
        this.direction = 0;
        this.rigid = 0;
        this.projectiles = {};
        this.hit_boxes = {};
        this.point = 0;
        this.movement = {};

        do{
            this.x = Math.random() * (FIELD_WIDTH - this.width);
            this.y = Math.random() * (FIELD_HEIGHT - this.height);
            this.direction = 1;
        }while(this.intersectWalls());
    }
    move(){
        const oldX = this.x, oldY = this.y;
        if(!(this.direction == 1 || this.direction == -1 || this.direction == 0)){
            this.direction = 1;
        }
        if(this.rigid > 0){
            this.rigid -= 1;
        }

        if(this.x + this.vector_x < 0 || FIELD_WIDTH < this.x + this.vector_x){
            this.vector_x /= 2;
        }
        if(this.figure == 5){
            this.vector_x = 0;
        }
        this.x += this.vector_x;
        this.vector_x /= 2;

        if(this.vector_x > 0){
            this.direction = 1;
        }
        else if(this.vector_x < 0){
            this.direction = -1;
        }
        //棒立ち・歩行
        if(this.figure < 2){
            if(Math.abs(this.vector_x) >= 0.8){
                this.figure = 1;
                this.effect_num += 1;
                this.anime_num += 1;
                if(this.effect_num > 3){
                    this.effect_num = 0;
                    this.anime_num = 0;
                }
            }
            else{
                this.effect_num = 0;
                this.anime_num = 0;
                this.figure = 0;
            }
        }
        //単純切り＋チャージ
        else if(this.figure == 2){
            this.effect_num += 1;
            this.anime_num += 1;
            if(this.effect_num == 1) io.sockets.emit('sound','sword_swing');
            else if(this.effect_num == 3){
                this.create_hit_boxes(
                    this.x + this.width/2 - this.direction*20,this.y + 8,
                    this.direction*this.charge,-10,
                    64,32,5+this.charge,2
                    );
            }
            else if(this.effect_num == 4){
                this.charge = 0;
                this.create_hit_boxes(
                    this.x + this.width/2 + this.direction*16,this.y + 8,
                    this.direction*(64 + this.charge),-10,
                    64,32,10+this.charge,2
                    );
            }
            else if(this.effect_num == 5){
                this.charge = 0;
                this.create_hit_boxes(
                    this.x + this.width/2 + this.direction*32,this.y + 16,
                    this.direction*(64 + this.charge),-10,
                    32,64,8+this.charge,2
                    );
            }
            if(this.effect_num > 5){
                this.figure = 0;
                this.effect_num = 0;
                this.anime_num = 0;
                this.charge = 0;
            }
        }
        //突き
        else if(this.figure == 3){
            this.effect_num += 1;
            this.anime_num += 1;
            if(this.effect_num == 1) io.sockets.emit('sound','sword_stab');
            else if(this.effect_num == 7){
                this.vector_x += this.direction*96;
            }
            else if(this.effect_num >= 8){
                this.create_hit_boxes(
                    this.x + this.width/2 + this.direction*32,this.y + 24,
                    0,-10,
                    32,64,16,2
                    );
            }
            if(this.effect_num > 9){
                this.figure = 0;
                this.effect_num = 0;
                this.anime_num = 0;
                this.charge = 0;
            }
        }
        //上切り
        else if(this.figure == 4){
            this.effect_num += 1;
            this.anime_num += 1;
            if(this.effect_num == 1) io.sockets.emit('sound','sword_upper');
            else if(this.effect_num == 3){
                this.vector_y -= 10;
                this.create_hit_boxes(
                    this.x + this.width/2 + this.direction*32,this.y + 24,
                    0,-30,
                    32,64,24,2
                    );
            }
            else if(this.effect_num == 4){
                this.create_hit_boxes(
                    this.x + this.width/2 + this.direction*32,this.y + 24,
                    0,-30,
                    32,64,24,2
                    );
            }
            else if(this.effect_num == 5){
                this.create_hit_boxes(
                    this.x + this.width/2 + this.direction*32,this.y + 24,
                    0,-30,
                    32,64,24,2
                    );
            }
            if(this.effect_num > 6){
                this.figure = 0;
                this.effect_num = 0;
                this.anime_num = 0;
                this.charge = 0;
            }
        }
        //下切り
        else if(this.figure == 5){
            this.effect_num += 1;
            this.anime_num += 1;
            if(this.anime_num >= 5 && this.vector_y > 2){
                this.anime_num = 5;
            }
            if(this.effect_num == 1) io.sockets.emit('sound','sword_down');
            else if(this.effect_num == 3){
                this.vector_y += 60;
                this.create_hit_boxes(
                    this.x + this.width/2 + this.direction*64,this.y + 24,
                    0,30,
                    32,64,24,2
                    );
            }
            else if(4 <= this.effect_num && this.effect_num <= 7){
                this.create_hit_boxes(
                    this.x + this.width/2 + this.direction*64,this.y + 24,
                    0,30,
                    32,64,24,2
                    );
            }
            if(5 < this.effect_num && this.effect_num < 10){
                this.anime_num = 6;
            }
            else if(10 <= this.effect_num && this.effect_num <= 20){
                this.anime_num = 7;
            }
            if(this.effect_num > 20){
                this.figure = 0;
                this.effect_num = 0;
                this.anime_num = 0;
                this.charge = 0;
            }
        }

        this.y += this.vector_y;
        this.vector_y += 1;
        
        let collision_x = false;
        let collision_y = false;
        if(this.x < 0 || this.x + this.width >= FIELD_WIDTH){
            collision_x = true;
        }
        if(this.y < 0 || this.y + this.height >= FIELD_HEIGHT){
            collision_y = true;
        }
        if(this.intersectWalls()){
            collision_y = true;
        }
        if(collision_x){
            this.x = oldX;
        }
        if(collision_y){
             this.y = oldY;
             this.vector_y = 0;
        }
        return !(collision_x || collision_y);
    }
    attack(attack_type){
        if(this.direction == null) this.direction = 1;
        if(attack_type == 0 && this.effect_num < 5 && this.rigid < 3){
            this.figure = 2;
            this.rigid = 10;
            if(this.charge < 100){
                this.charge += 1;
                this.rigid = Math.floor(this.charge);
            }
            this.anime_num = 0;
            this.effect_num = 0;
        }
        else if(attack_type == 1 && this.rigid == 0){
            this.figure = 3;
            this.rigid = 16;
            this.anime_num = 0;
            this.effect_num = 0;
        }
        else if(attack_type == 2){
            this.figure = 4;
            this.rigid = 16;
            this.anime_num = 0;
            this.effect_num = 0;
        }
        else if(attack_type == 3){
            this.figure = 5;
            this.rigid = 30;
            this.anime_num = 0;
            this.effect_num = 0;
        }
    }
}//sword end


class Gun extends Player{
    constructor(obj={}){
        super(obj);
        this.socketId = obj.socketId;
        this.nickname = obj.nickname;
        this.width = 96;
        this.height = 96;
        this.figure = GUN_FIGURE_ZERO;
        this.health = this.maxHealth = 600;
        this.direction = 0;
        this.rigid = 0;
        this.projectiles = {};
        this.hit_boxes = {};
        this.point = 0;
        this.movement = {};

        do{
            this.x = Math.random() * (FIELD_WIDTH - this.width);
            this.y = Math.random() * (FIELD_HEIGHT - this.height);
            this.direction = 1;
        }while(this.intersectWalls());
    }
    move(){
        const oldX = this.x, oldY = this.y;
        if(this.charge > 0) this.charge -= 1;
        if(!(this.direction == 1 || this.direction == -1 || this.direction == 0)){
            this.direction = 1;
        }
        if(this.rigid > 0){
            this.rigid -= 1;
        }

        if(this.x + this.vector_x < 0 || FIELD_WIDTH < this.x + this.vector_x){
            this.vector_x /= 2;
        }
        this.x += this.vector_x;
        this.vector_x /= 2;

        if(this.vector_x > 0){
            this.direction = 1;
        }
        else if(this.vector_x < 0){
            this.direction = -1;
        }
        //棒立ち・歩行
        if(this.figure < GUN_FIGURE_ZERO + 2){
            if(Math.abs(this.vector_x) >= 0.8){
                this.figure = GUN_FIGURE_ZERO+1;
                this.effect_num += 1;
                this.anime_num += 1;
                if(this.effect_num > 3){
                    this.effect_num = 0;
                    this.anime_num = 0;
                }
            }
            else{
                this.effect_num = 0;
                this.anime_num = 0;
                this.figure = GUN_FIGURE_ZERO;
            }
        }
        //連射
        else if(this.figure == GUN_FIGURE_ZERO + 2){
            this.effect_num += 1;
            this.anime_num = (this.anime_num+1)%2;
            if(this.effect_num == 2){
                io.sockets.emit('sound','gun');
            }
            if(this.effect_num % 2 == 0){
                this.create_projectiles('bullet',
                this.x + this.width/2 + this.direction*16,this.y + this.height/2,
                this.direction*64,0,0,this.direction,8
                );
            }
            if(this.effect_num > 36){
                this.figure = GUN_FIGURE_ZERO;
                this.effect_num = 0;
                this.anime_num = 0;
            }
        }
        //上
        /*else if(this.figure == GUN_FIGURE_ZERO + 3){
            this.effect_num += 1;
            this.anime_num += 1;
            if(this.effect_num == 2){
                this.create_projectiles('firework',
                this.x + this.width/2 + this.direction*96,this.y + this.height/2,
                0,0,0,this.direction,60
                );
            }
            if(this.effect_num > 12){
                this.figure = GUN_FIGURE_ZERO;
                this.effect_num = 0;
                this.anime_num = 0;
            }
        }*/
        else if(this.figure == GUN_FIGURE_ZERO + 4){
            this.effect_num += 1;
            this.anime_num += 1;
            if(this.effect_num == 2 && this.charge == 0){
                io.sockets.emit('sound','boom');
                this.charge += 75;
                this.create_projectiles('explosion',
                this.x + this.width/2 + this.direction*96,this.y + this.height/2,
                0,0,90,this.direction,30
                );
            }
            if(this.effect_num > 7){
                this.figure = GUN_FIGURE_ZERO;
                this.effect_num = 0;
                this.anime_num = 0;
            }
        }

        this.y += this.vector_y;
        this.vector_y += 1;
        
        let collision_x = false;
        let collision_y = false;
        if(this.x < 0 || this.x + this.width >= FIELD_WIDTH){
            collision_x = true;
        }
        if(this.y < 0 || this.y + this.height >= FIELD_HEIGHT){
            collision_y = true;
        }
        if(this.intersectWalls()){
            collision_y = true;
        }
        if(collision_x){
            this.x = oldX;
        }
        if(collision_y){
             this.y = oldY;
             this.vector_y = 0;
        }
        return !(collision_x || collision_y);
    }
    attack(attack_type){
        if(this.direction == null) this.direction = 1;
        if(attack_type == 0 && this.effect_num < 5 && this.charge == 0){
            this.figure = GUN_FIGURE_ZERO + 4;
            this.rigid = 15;
            this.anime_num = 0;
            this.effect_num = 0;
        }
        else if(attack_type == 1 && this.rigid == 0){
            this.figure = GUN_FIGURE_ZERO + 2;
            this.rigid = 40;
            this.anime_num = 0;
            this.effect_num = 0;
        }
        else if(attack_type == 2 && this.rigid == 0){
            this.figure = GUN_FIGURE_ZERO + 2;
            this.rigid = 3;
            this.anime_num = 0;
            this.effect_num = 0;
        }
    }
    create_projectiles(type,x,y,vx,vy,angle,direction,damage){
        if(type == 'bullet'){
            const bullet = new Bullet({
                x: x,
                y: y,
                vector_x: vx,
                vector_y: vy,
                angle: angle,
                direction: direction,
                damage: damage,
                player: this,
            });
            this.projectiles[bullet.id] = bullet;
            projectiles[bullet.id] = bullet;
        }
        else if(type == 'explosion'){
            const explosion = new Explosion({
                x: x,
                y: y,
                vector_x: vx,
                vector_y: vy,
                direction: direction,
                angle: angle,
                damage: damage,
                player: this,
            });
            this.projectiles[explosion.id] = explosion;
            projectiles[explosion.id] = explosion;
        }
        else if(type == 'firework'){
            const firework = new Firework({
                x: x,
                y: y,
                vector_x: vx,
                vector_y: vy,
                direction: direction,
                angle: angle,
                damage: damage,
                player: this,
            });
            this.projectiles[firework.id] = firework;
            projectiles[firework.id] = firework;
        }
    }
}//Gun end

class Gladiator extends Player{
    constructor(obj={}){
        super(obj);
        this.socketId = obj.socketId;
        this.nickname = obj.nickname;
        this.width = 96;
        this.height = 96;
        this.figure = GLADIATOR_FIGURE_ZERO;
        this.health = this.maxHealth = 500;
        this.direction = 0;
        this.rigid = 0;
        this.projectiles = {};
        this.hit_boxes = {};
        this.point = 0;
        this.movement = {};

        do{
            this.x = Math.random() * (FIELD_WIDTH - this.width);
            this.y = Math.random() * (FIELD_HEIGHT - this.height);
            this.direction = 1;
        }while(this.intersectWalls());
    }
    move_vector(x,y){
        this.vector_x += x*2;
        this.vector_y += y;
    }
    move(){
        const oldX = this.x, oldY = this.y;
        if(!(this.direction == 1 || this.direction == -1 || this.direction == 0)){
            this.direction = 1;
        }
        if(this.rigid > 0){
            this.rigid -= 1;
        }

        if(this.x + this.vector_x < 0 || FIELD_WIDTH < this.x + this.vector_x){
            this.vector_x /= 2;
        }
        this.x += this.vector_x;
        this.vector_x /= 2;

        if(this.vector_x > 0){
            this.direction = 1;
        }
        else if(this.vector_x < 0){
            this.direction = -1;
        }
        //棒立ち・歩行
        if(this.figure < GLADIATOR_FIGURE_ZERO+2){
            if(Math.abs(this.vector_x) >= 0.8){
                this.figure = GLADIATOR_FIGURE_ZERO+1;
            }
            else{
                this.figure = GLADIATOR_FIGURE_ZERO;
                this.effect_num = 0;
                this.anime_num = 0;
            }
        }
        //チャージ
        else if(this.figure == GLADIATOR_FIGURE_ZERO+2){
            this.effect_num += 1;
            this.anime_num += 1;
            if(this.effect_num > 4){
                io.sockets.emit('sound','powerwave');
                this.create_projectiles('powerwave',
                this.x + this.width/2 + this.direction*32,this.y+this.height/2,
                this.direction*8,0,0,this.direction,15+this.charge
                );
                //console.log(this.direction);
                this.figure = GLADIATOR_FIGURE_ZERO;
                this.effect_num = 0;
                this.anime_num = 0;
                this.charge = 0;
            }
        }
        //パンチ
        else if(this.figure == GLADIATOR_FIGURE_ZERO+3){
            this.effect_num += 1;
            this.anime_num += 1;
            if(this.effect_num > 1){
                io.sockets.emit('sound','punch');
                this.create_hit_boxes(
                    this.x + this.width/2 + this.direction*32,this.y + 24,
                    0,0,
                    32,64,24,2
                    );
                this.figure = GLADIATOR_FIGURE_ZERO;
                this.effect_num = 0;
                this.anime_num = 0;
                this.charge = 0;
            }
        }
        //キック
        else if(this.figure == GLADIATOR_FIGURE_ZERO+4){
            this.effect_num += 1;
            this.anime_num += 1;
            if(this.effect_num == 1) io.sockets.emit('sound','kick');
            else if(this.effect_num == 3){
                this.create_hit_boxes(
                    this.x + this.width/2 + this.direction*32,this.y + 24,
                    this.direction*32,-30,
                    32,64,64,2
                    );
            }
            if(this.effect_num > 4){
                this.figure = GLADIATOR_FIGURE_ZERO;
                this.effect_num = 0;
                this.anime_num = 0;
                this.charge = 0;
            }
        }

        this.y += this.vector_y;
        this.vector_y += 1;
        
        let collision_x = false;
        let collision_y = false;
        if(this.x < 0 || this.x + this.width >= FIELD_WIDTH){
            collision_x = true;
        }
        if(this.y < 0 || this.y + this.height >= FIELD_HEIGHT){
            collision_y = true;
        }
        if(this.intersectWalls()){
            collision_y = true;
        }
        if(collision_x){
            this.x = oldX;
        }
        if(collision_y){
             this.y = oldY;
             this.vector_y = 0;
        }
        return !(collision_x || collision_y);
    }
    attack(attack_type){
        if(this.direction == null) this.direction = 1;
        if(attack_type == 0 && this.effect_num < 5){
            this.figure = GLADIATOR_FIGURE_ZERO+2;
            this.rigid = 10;
            if(this.charge < 100){
                this.charge += 1;
            }
            this.anime_num = 0;
            this.effect_num = 0;
        }
        else if(attack_type == 1 && this.rigid == 0){
            this.figure = GLADIATOR_FIGURE_ZERO+3;
            this.rigid = 3;
            this.anime_num = 1;
            this.effect_num = 0;
        }
        else if(attack_type == 2){
            this.figure = GLADIATOR_FIGURE_ZERO+4;
            this.rigid = 5;
            this.anime_num = 0;
            this.effect_num = 0;
        }
        else if(attack_type == 3){
            this.figure = GLADIATOR_FIGURE_ZERO;
            this.rigid = 0;
            this.anime_num = 0;
            this.effect_num = 0;
        }
    }
    create_projectiles(type,x,y,vx,vy,angle,direction,damage){
        if(type == 'powerwave'){
            const powerwave = new Powerwave({
                x: Math.floor(x),
                y: Math.floor(y),
                vector_x: vx,
                vector_y: vy,
                angle: angle,
                direction: direction,
                damage: 30,
                lifespan: damage-5,
                player: this,
            });
            this.projectiles[powerwave.id] = powerwave;
            projectiles[powerwave.id] = powerwave;
        }
    }
}//Gladiator end


class Spear extends Player{
    constructor(obj={}){
        super(obj);
        this.socketId = obj.socketId;
        this.nickname = obj.nickname;
        this.width = 96;
        this.height = 96;
        this.figure = SPEAR_FIGURE_ZERO;
        this.health = this.maxHealth = 1100;
        this.direction = 0;
        this.rigid = 0;
        this.projectiles = {};
        this.hit_boxes = {};
        this.point = 0;
        this.movement = {};

        do{
            this.x = Math.random() * (FIELD_WIDTH - this.width);
            this.y = Math.random() * (FIELD_HEIGHT - this.height);
            this.direction = 1;
        }while(this.intersectWalls());
    }
    move_vector(x,y){
        this.vector_x += Math.round(x/2);
        this.vector_y += y;
    }
    move(){
        const oldX = this.x, oldY = this.y;
        if(!(this.direction == 1 || this.direction == -1 || this.direction == 0)){
            this.direction = 1;
        }
        if(this.rigid > 0){
            this.rigid -= 1;
        }

        if(this.x + this.vector_x < 0 || FIELD_WIDTH < this.x + this.vector_x){
            this.vector_x /= 2;
        }
        if(this.figure != SPEAR_FIGURE_ZERO+3){
            this.x += this.vector_x;
        }

        this.vector_x /= 2;

        if(this.vector_x > 0){
            this.direction = 1;
        }
        else if(this.vector_x < 0){
            this.direction = -1;
        }
        //棒立ち・歩行
        if(this.figure < SPEAR_FIGURE_ZERO+2){
            if(Math.abs(this.vector_x) >= 0.8){
                this.figure = SPEAR_FIGURE_ZERO+1;
                this.effect_num += 1;
                this.anime_num += 1;
                if(this.effect_num > 3){
                    this.effect_num = 0;
                    this.anime_num = 0;
                }
            }
            else{
                this.effect_num = 0;
                this.anime_num = 0;
                this.figure = SPEAR_FIGURE_ZERO;
            }
        }
        //突き
        else if(this.figure == SPEAR_FIGURE_ZERO+2){
            this.effect_num += 1;
            this.anime_num += 1;
            if(this.effect_num == 3){
                this.create_hit_boxes(
                    this.x + this.width/2 + this.direction*32,this.y + 24,
                    0,10,
                    32,64,25,2
                    );
            }
            if(this.effect_num > 3){
                this.figure = SPEAR_FIGURE_ZERO;
                this.effect_num = 0;
                this.anime_num = 0;
                this.charge = 0;
            }
        }
        //突き　大
        else if(this.figure == SPEAR_FIGURE_ZERO+3){
            this.effect_num += 1;
            this.anime_num += 1;
            if(this.effect_num == 5)io.sockets.emit('sound','rod');
            if(this.effect_num == 11){
                this.create_projectiles('hookspear',
                    this.x + this.width/2 + this.direction*96,this.y + this.height/2,
                    0,0,0,this.direction,0
                    );
            }
            if(this.effect_num == 12){
                this.create_hit_boxes(
                    this.x + this.width/2 + this.direction*32,this.y + 24,
                    this.direction*32,15,
                    128,64,48,2
                    );
            }
            else if(this.effect_num == 13){
                this.create_hit_boxes(
                    this.x + this.width/2 + this.direction*32,this.y + 24,
                    this.direction*64,15,
                    128,64,48,2
                    );
            }
            else if(this.effect_num == 14){
                this.create_hit_boxes(
                    this.x + this.width/2 + this.direction*32,this.y + 24,
                    this.direction*128,15,
                    144,64,48,2
                    );
            }
            if(this.effect_num > 22){
                this.figure = SPEAR_FIGURE_ZERO;
                this.effect_num = 0;
                this.anime_num = 0;
                this.charge = 0;
            }
        }

        this.y += this.vector_y;
        this.vector_y += 1;
        
        let collision_x = false;
        let collision_y = false;
        if(this.x < 0 || this.x + this.width >= FIELD_WIDTH){
            collision_x = true;
        }
        if(this.y < 0 || this.y + this.height >= FIELD_HEIGHT){
            collision_y = true;
        }
        if(this.intersectWalls()){
            collision_y = true;
        }
        if(collision_x){
            this.x = oldX;
        }
        if(collision_y){
             this.y = oldY;
             this.vector_y = 0;
        }
        return !(collision_x || collision_y);
    }
    attack(attack_type){
        if(this.direction == null) this.direction = 1;
        if(attack_type == 0 && this.effect_num < 5 && this.rigid < 3){
            this.figure = SPEAR_FIGURE_ZERO+2;
            this.rigid = 10;
            if(this.charge < 100){
                this.charge += 1;
                this.rigid = Math.floor(this.charge);
            }
            this.anime_num = 0;
            this.effect_num = 0;
        }
        else if(attack_type == 1 && this.rigid == 0){
            this.figure = SPEAR_FIGURE_ZERO+3;
            this.rigid = 30;
            this.anime_num = 0;
            this.effect_num = 0;
        }
        else if(attack_type == 2){
            this.figure = SPEAR_FIGURE_ZERO;
            this.rigid = 40;
            this.anime_num = 0;
            this.effect_num = 0;
        }
    }
    create_projectiles(type,x,y,vx,vy,angle,direction,damage){
        if(type == 'hookspear'){
            const hookspear = new Hookspear({
                x: x,
                y: y,
                vector_x: vx,
                vector_y: vy,
                direction: direction,
                angle: angle,
                damage: damage,
                player: this,
            });
            this.projectiles[hookspear.id] = hookspear;
            projectiles[hookspear.id] = hookspear;
        }
    }
}//spear end

class Hit_box extends GameObject{
    constructor(obj,lifespan){
        super(obj);
        this.x = obj.x - obj.width/2;
        this.y = obj.y - obj.height/2;
        this.vector_x = obj.vector_x;
        this.vector_y = obj.vector_y;
        this.width = obj.width;
        this.height = obj.height;
        this.lifespan = lifespan;
        this.damage = obj.damage;
        this.player = obj.player;
    }
    remove(){
        delete this.player[this.id];
        delete hit_boxes[this.id];
    }
}

class Projectile extends GameObject{
    constructor(obj){
        super(obj);
        this.hit_boxes = {};
        this.hit_flag = 0;
        this.width = obj.width;
        this.height = obj.height;
        this.x = obj.x - this.width/2;
        this.y = obj.y - this.height/2;
        this.vector_x = obj.vector_x;
        this.vector_y = obj.vector_y;
        this.lifespan = obj.lifespan;
        this.damage = obj.damage;
        this.figure = obj.figure;
        this.direction = obj.direction;
        this.effect_num = obj.effect_num;
        this.anime_num = obj.anime_num;
        this.player = obj.player;
    }
    create_hit_boxes(x,y,vx,vy,width,height,damage,lifespan){
        const hit_box = new Hit_box({
            x: x,
            y: y,
            vector_x: vx,
            vector_y: vy,
            width: width,
            height: height,
            damage: damage,
            player: this.player,
        },lifespan);
        this.hit_boxes[hit_box.id] = hit_box;
        hit_boxes[hit_box.id] = hit_box;
    }
    losthit(){
        this.hit_flag = 1;
    }
    remove(){
        delete this.player[this.id];
        delete projectiles[this.id];
    }
    toJSON(){
        return {id: this.id, x: this.x, y: this.y, vector_x: this.vector_x, vector_y: this.vector_y, width: this.width, height: this.height, angle: this.angle, direction: this.direction,figure: this.figure, anime_num: this.anime_num, player: this.player};
    }
}

class Bullet extends Projectile{
    constructor(obj){
        super(obj);
        this.hit_flag = 0;
        this.width = 27;
        this.height = 9;
        this.x = obj.x - this.width/2;
        this.y = obj.y - this.height/2;
        this.vector_x = obj.vector_x;
        this.vector_y = obj.vector_y;
        this.direction = obj.direction;
        this.damage = obj.damage;
        this.figure = 0;
        this.effect_num = 0;
        this.anime_num = 0;
        this.lifespan = 15;
        this.player = obj.player;
    }
    
    move(){
        const oldX = this.x, oldY = this.y;
        if(!(this.direction == 1 || this.direction == -1 || this.direction == 0)){
            this.direction = 1;
        }

        this.x += this.vector_x;

        if(this.vector_x > 0){
            this.direction = 1;
        }
        else if(this.vector_x < 0){
            this.direction = -1;
        }
        
        this.create_hit_boxes(
            this.x,this.y,
            0,0,
            Math.abs(this.vector_x),10,this.damage,2
        );
            
        
        let collision_x = false;
        let collision_y = false;
        if(this.x < 0 || this.x + this.width >= FIELD_WIDTH){
            collision_x = true;
        }
        if(this.y < 0 || this.y + this.height >= FIELD_HEIGHT){
            collision_y = true;
        }
        if(this.intersectWalls()){
            collision_y = true;
        }
        if(collision_x){
            this.x = oldX;
        }
        if(collision_y){
             this.y = oldY;
             this.vector_y = 0;
        }
        return !(collision_x || collision_y);
    }
    losthit(){
        this.hit_flag = 1;
        this.remove();
    }
}

class Firework extends Projectile{
    constructor(obj){
        super(obj);
        this.hit_flag = 0;
        this.width = 27;
        this.height = 9;
        this.x = obj.x - this.width/2;
        this.y = obj.y - this.height/2;
        this.vector_x = obj.vector_x;
        this.vector_y = obj.vector_y;
        this.direction = 1;
        this.damage = obj.damage;
        this.figure = 0;
        this.angle = 90/360;
        this.effect_num = 0;
        this.anime_num = 0;
        this.lifespan = 10;
        this.player = obj.player;
    }
    
    move(){
        const oldX = this.x, oldY = this.y;
        if(!(this.direction == 1 || this.direction == -1 || this.direction == 0)){
            this.direction = 1;
        }

        this.x += this.vector_x;
        this.y += this.vector_y;
        this.vector_y += 2;

        if(this.vector_x > 0){
            this.direction = 1;
        }
        else if(this.vector_x < 0){
            this.direction = -1;
        }           
        
        let collision_x = false;
        let collision_y = false;
        if(this.x < 0 || this.x + this.width >= FIELD_WIDTH){
            collision_x = true;
        }
        if(this.y < 0 || this.y + this.height >= FIELD_HEIGHT){
            collision_y = true;
        }
        if(this.intersectWalls()){
            collision_y = true;
        }
        if(collision_x){
            this.x = oldX;
        }
        if(collision_y){
             this.y = oldY;
             this.vector_y = 0;
        }
        return !(collision_x || collision_y);
    }
    create_projectiles(type,x,y,vx,vy,angle,direction,damage){
        if(type == 'powerwave'){
            const powerwave = new Powerwave({
                x: x,
                y: y,
                vector_x: vx,
                vector_y: vy,
                angle: angle,
                direction: direction,
                damage: damage,
                lifespan: 5,
                player: this,
            });
            this.projectiles[powerwave.id] = powerwave;
            projectiles[powerwave.id] = powerwave;
        }
        else if(type == 'minipowerwave'){
            const minipowerwave = new Minipowerwave({
                x: x,
                y: y,
                vector_x: vx,
                vector_y: vy,
                angle: angle,
                direction: direction,
                damage: damage,
                lifespan: 5,
                player: this,
            });
            this.projectiles[minipowerwave.id] = minipowerwave;
            projectiles[minipowerwave.id] = minipowerwave;
        }
        else if(type == 'explosion'){
            const explosion = new Explosion({
                x: x,
                y: y,
                vector_x: vx,
                vector_y: vy,
                direction: direction,
                angle: 0,
                damage: damage,
                player: this,
            });
            this.projectiles[explosion.id] = explosion;
            projectiles[explosion.id] = explosion;
        }
    }
    remove(){
        this.create_projectiles('explosion',
                this.x + this.width/2,this.y + this.height/2,
                0,0,0,this.direction,60
                );
        this.create_projectiles('minipowerwave',
                this.x + this.width/2 + this.direction*96,this.y + this.height/2,
                10,0,0,this.direction,30
                );
        this.create_projectiles('minipowerwave',
                this.x + this.width/2 + this.direction*96,this.y + this.height/2,
                0,-10,90/360,this.direction,30
                );
        this.create_projectiles('minipowerwave',
                this.x + this.width/2 + this.direction*96,this.y + this.height/2,
                -10,0,180/360,this.direction,30
                );
        this.create_projectiles('minipowerwave',
                this.x + this.width/2 + this.direction*96,this.y + this.height/2,
                0,10,270/360,this.direction,30
                );
        
        delete this.player[this.id];
        delete projectiles[this.id];
    }
}

class Explosion extends Projectile{
    constructor(obj){
        super(obj);
        this.hit_flag = 0;
        this.width = 96;
        this.height = 96;
        this.x = obj.x - this.width/2;
        this.y = obj.y - this.height/2;
        this.vector_x = obj.vector_x;
        this.vector_y = obj.vector_y;
        this.direction = obj.direction;
        this.damage = obj.damage;
        this.angle = 0;
        this.figure = 1;
        this.effect_num = 0;
        this.anime_num = 0;
        this.lifespan = 9;
        this.player = obj.player;
    }
    
    move(){
        this.effect_num += 1; 
        this.anime_num += 1;
        if(!(this.direction == 1 || this.direction == -1 || this.direction == 0)){
            this.direction = 1;
        }

        this.x += this.vector_x;

        if(this.vector_x > 0){
            this.direction = 1;
        }
        else if(this.vector_x < 0){
            this.direction = -1;
        }

        if(this.hit_flag == 0){
            this.create_hit_boxes(
                this.x+this.width/2,this.y+this.height/2,
                this.direction*96,-40,
                96,96,this.damage,2
            );
        }
        
        return 1;
    }
}

class Miniexplosion extends Projectile{
    constructor(obj){
        super(obj);
        this.hit_flag = 0;
        this.width = 48;
        this.height = 48;
        this.x = obj.x - this.width/2;
        this.y = obj.y - this.health/2;
        this.vector_x = obj.vector_x;
        this.vector_y = obj.vector_y;
        this.direction = obj.direction;
        this.damage = obj.damage;
        this.figure = 2;
        this.effect_num = 0;
        this.anime_num = 0;
        this.lifespan = 7;
        this.player = obj.player;
    }
    
    move(){
        if(!(this.direction == 1 || this.direction == -1 || this.direction == 0)){
            this.direction = 1;
        }

        this.x += this.vector_x;

        if(this.vector_x > 0){
            this.direction = 1;
        }
        else if(this.vector_x < 0){
            this.direction = -1;
        }
        
        this.create_hit_boxes(
            this.x,this.y,
            0,-40,
            48,48,this.damage*5,2
        );
        
        this.effect_num += 1; 
        this.anime_num += 1;
        return 1;    
    }
}

class Powerwave extends Projectile{
    constructor(obj){
        super(obj);
        this.hit_flag = 0;
        this.vector_x = obj.vector_x;
        this.vector_y = obj.vector_y;
        this.width = 96;
        this.height = 96;
        this.x = obj.x - this.width/2;
        this.y = obj.y - this.height/2;
        this.angle = obj.angle;
        this.direction = obj.direction;
        this.damage = obj.damage;
        this.figure = 4;
        this.effect_num = 0;
        this.anime_num = 0;
        this.lifespan = obj.lifespan;
        this.player = obj.player;
    }
    
    move(){
        const oldX = this.x, oldY = this.y;
        /*if(!(this.direction == 1 || this.direction == -1 || this.direction == 0)){
            this.direction = 1;
        }*/

        this.x += this.vector_x;
        this.y += this.vector_y;

        /*if(this.vector_x > 0){
            this.direction = 1;
        }
        else if(this.vector_x < 0){
            this.direction = -1;
        }*/
        
        this.create_hit_boxes(
            this.x+this.width/2+this.direction*24,this.y+this.height/2,
            0,0,
            Math.abs(this.vector_x)+this.direction*20,96,this.damage,3
        );
            
        
        let collision_x = false;
        let collision_y = false;
        if(this.x < 0 || this.x + this.width >= FIELD_WIDTH){
            collision_x = true;
        }
        if(this.y < 0 || this.y + this.height >= FIELD_HEIGHT){
            collision_y = true;
        }
        if(this.intersectWalls()){
            collision_y = true;
        }
        if(collision_x){
            this.x = oldX;
        }
        if(collision_y){
             this.y = oldY;
             this.vector_y = 0;
        }
        return !(collision_x || collision_y);
    }
    losthit(){
        this.hit_flag = 1;
        this.remove();
    }
}

class Minipowerwave extends Projectile{
    constructor(obj){
        super(obj);
        this.hit_flag = 0;
        this.width = 48;
        this.height = 48;
        this.x = obj.x - this.width/2;
        this.y = obj.y - this.height/2;
        this.vector_x = obj.vector_x;
        this.vector_y = obj.vector_y;
        this.angle = obj.angle;
        this.direction = obj.direction;
        this.damage = obj.damage;
        this.figure = 5;
        this.effect_num = 0;
        this.anime_num = 0;
        this.lifespan = obj.lifespan;
        this.player = obj.player;
    }
    
    move(){
        const oldX = this.x, oldY = this.y;
        /*if(!(this.direction == 1 || this.direction == -1 || this.direction == 0)){
            this.direction = 1;
        }*/

        this.x += this.vector_x;
        this.y += this.vector_y;

        /*if(this.vector_x > 0){
            this.direction = 1;
        }
        else if(this.vector_x < 0){
            this.direction = -1;
        }*/
        
        this.create_hit_boxes(
            this.x+this.width/2,this.y+this.height/2,
            0,0,
            48,48,this.damage,2
        );
            
        
        let collision_x = false;
        let collision_y = false;
        if(this.x < 0 || this.x + this.width >= FIELD_WIDTH){
            collision_x = true;
        }
        if(this.y < 0 || this.y + this.height >= FIELD_HEIGHT){
            collision_y = true;
        }
        if(this.intersectWalls()){
            collision_y = true;
        }
        if(collision_x){
            this.x = oldX;
        }
        if(collision_y){
             this.y = oldY;
             this.vector_y = 0;
        }
        return !(collision_x || collision_y);
    }
}

class Hookspear extends Projectile{
    constructor(obj){
        super(obj);
        this.hit_flag = 0;
        this.width = 96;
        this.height = 96;
        this.x = obj.x - this.width/2;
        this.y = obj.y - this.height/2;
        this.vector_x = obj.vector_x;
        this.vector_y = obj.vector_y;
        this.direction = obj.direction;
        this.damage = obj.damage;
        this.angle = 0;
        this.figure = 6;
        this.effect_num = 0;
        this.anime_num = 0;
        this.lifespan = 9;
        this.player = obj.player;
    }
    
    move(){
        this.effect_num += 1; 
        this.anime_num += 1;
        if(!(this.direction == 1 || this.direction == -1 || this.direction == 0)){
            this.direction = 1;
        }


        if(this.vector_x > 0){
            this.direction = 1;
        }
        else if(this.vector_x < 0){
            this.direction = -1;
        }

        return 1;
    }
}

class Text extends GameObject{
    constructor(obj){
        super(obj);
        this.id = Math.floor(Math.random()*1000000000);
        this.socketId = obj.socketId;
        this.x = obj.x;
        this.y = obj.y;
        this.vector_x = obj.vector_x;
        this.vector_y = obj.vector_y;
        this.width = obj.width;
        this.height = obj.height;
        this.lifespan = obj.lifespan;
        this.text = obj.text;
        this.color = obj.color;
        //console.log(this.text+"/"+this.color);
    }

    move_vector(x,y){
        this.vector_x += x;
        this.vector_y += y;
    }
    move(){
        this.x += this.vector_x;
        this.y += this.vector_y;
        if(!(this.lifespan >= 100000)){
            this.lifespan -= 1;
        }
        if(this.lifespan <= 0){
            this.remove();
        }
    }
    remove(){
        delete texts[this.id];
    }
    toJSON(){
        return Object.assign(super.toJSON(), {width: this.width, height: this.height,color: this.color, text: this.text});
    }
}

class BotPlayer extends Spear{
    constructor(obj){
        super(obj);
        this.level = obj.level;
        this.go_direction = 1;
        this.target = this.id;
        this.timer = setInterval(() => {
            if(this.level < 5){
                //this.move_highlevel();
                this.move_lowlevel();
            }
            else if(this.level < 10){
                this.move_middlelevel();
            }
            else{
                this.move_highlevel();
            }
        }, 1000/30);
    }

    choose_target(reset){
        let player_num = 0;
        let chosen_one = 0;
        try{
            if(Math.random()<0.009 || this.target == this.id || reset == true){
                Object.values(players).forEach((player) => {
                    player_num++;
                });
                chosen_one = Math.floor(Math.random() * player_num);
                player_num = 0;
                Object.values(players).forEach((player) => {
                    if(player_num == chosen_one){
                        this.target = player.id;
                    }
                    player_num++;
                });
                //if(this.target != this.id) console.log("target changed to " + players[this.target].nickname);
            }
            if     (players[this.target].x - this.x > 50) this.go_direction = 1;
            else if(players[this.target].x - this.x < -50) this.go_direction = -1;
            else{
                this.go_direction = 0;
            }
        }catch(error){
            this.target = this.id;
            this.go_direction = 0;
        }
    }

    move_lowlevel(){
        this.choose_target(false);
        this.vector_x = this.go_direction * 5;
        if(Math.random()<(0.1*this.level)){
            this.attack(0);
        }
        if(Math.random()<(0.1*this.level)){
            this.attack(1);
        }
    }
    move_middlelevel(){
        
        this.choose_target(false);
        this.vector_x = this.go_direction * 5;

        if(Math.random()<(0.1*this.level)){
            this.attack(0);
        }
        if(Math.random()<(0.1*this.level)){
            this.attack(1);
        }
        if(Math.random()<(0.1*this.level)){
            this.attack(2);
        }
        if(Math.random()<(0.1*this.level)){
            this.attack(3);
        }
    }
    move_highlevel(){
        this.choose_target(false);
        this.vector_x = this.go_direction * 5;

        if(Math.random()<(0.1)){
            this.attack(0);
        }
        if(Math.random()<(0.1)){
            this.attack(1);
        }
        if(Math.random()<(0.05)){
            this.attack(2);
        }
        if(Math.random()<(0.05)){
            this.attack(3);
        }
    }
    remove(){
        super.remove();
        clearInterval(this.timer);
        setTimeout(() => {
            let player_num = 0;
            this.level += 1;
            const bot = new BotPlayer({nickname: 'bot LV:'+this.level,level: this.level});
            Object.values(players).forEach((player) => {
                player_num++;
            });
            if(player_num <= 1){
                players[bot.id] = bot;
                isbotexist = true;
            }
        }, 3000);
    }
}

class Wall extends GameObject{
}


let players = {};
let hit_boxes = {};
let projectiles = {};
let texts = {};
let walls = {};

for(let i=0; i<1; i++){
    const wall = new Wall({
            x: Math.random() * FIELD_WIDTH,
            y: Math.random() * FIELD_HEIGHT,
            width: 40,
            height: 10,
    });
    walls[wall.id] = wall;
}

const bot = new BotPlayer({nickname: 'bot LV:0',level: 0});
players[bot.id] = bot;

io.on('connection', function(socket) {
    let player = null;
    socket.on('game-start', (config) => {
        if(config.fighter === "sword"){
            player = new Sword({
                socketId: socket.id,
                nickname: config.nickname,
                direction: 1,
            });
            players[player.id] = player;
        }
        else if(config.fighter === "gun"){
            player = new Gun({
                socketId: socket.id,
                nickname: config.nickname,
                direction: 1,
            });
            players[player.id] = player;
        }
        else if(config.fighter === "gladiator"){
            player = new Gladiator({
                socketId: socket.id,
                nickname: config.nickname,
                direction: 1,
            });
            players[player.id] = player;
        }
        else if(config.fighter === "spear"){
            player = new Spear({
                socketId: socket.id,
                nickname: config.nickname,
                direction: 1,
            });
            players[player.id] = player;
        }
        else{
            player = new Sword({
                socketId: socket.id,
                nickname: config.nickname,
                direction: 1,
            });
            players[player.id] = player;
        }
        create_text(config.nickname + " joined BATTLE",FIELD_WIDTH,Math.random()*(FIELD_HEIGHT-15),-5,0,'red',300+(config.nickname.length+14)*3);
        console.log(config.nickname + " joined BATTLE");
    });
    socket.on('chat', (config) => {
        const text = new Text({
            socketId: socket.id,
            x: FIELD_WIDTH,
            y: 30+Math.random()*(FIELD_HEIGHT-45),
            vector_x: -5,
            vector_y: 0,
            width: 100,
            height: 15,
            color: 'black',
            text: config.chat,
            lifespan: 300+(config.chat.length)*3,
        });
        if(text.text === "/summonbot"){
            const bot = new BotPlayer({nickname: 'bot LV: 1',level: 1});
            players[bot.id] = bot;
        }
        else texts[text.id] = text;
        try{
            console.log(player.nickname+':'+config.chat);
        }catch(error){

        }
    });
    socket.on('movement', function(movement) {
        if(!player || player.health===0){return;}
        player.movement = movement;
   });
    socket.on('a', function(){
        if(!player || player.health===0){return;}
        player.attack(0);
    });
    socket.on('disconnect', () => {
        if(!player){return;}
        try{
            create_text(player.nickname+' exit BATTLE',FIELD_WIDTH,Math.random()*(FIELD_HEIGHT-15),-5,0,'red',300+(player.nickname.length)*3);
            console.log(player.nickname+' exit BATTLE');
            if(isbotexist) players[bot.id].target = bot.id;
        }catch(error){
            
        }
        delete players[player.id];
        player = null;
    });
});

setInterval(() => {
    Object.values(players).forEach((player) => {
        const movement = player.movement;
        if(player.rigid < 1){
            if(movement.s){
                if(movement.forward && movement.back){
                    
                }
                else if(movement.forward){
                    player.attack(2);
                }
                else if(movement.back){
                    player.attack(3);
                }
                else{
                    player.attack(1);
                }
            }
            if(movement.forward && player.vector_y >= 1 && player.effect_num <= 1){
                player.move_vector(0,-20);
            }
            if(movement.forward && movement.s && player.vector_y >= 1){
                player.attack(2);
            }
            if(movement.left){
                player.move_vector(-4,0);
            }
            if(movement.right){
                player.move_vector( 4,0);
            }
        }
        else if(player.figure == 2 && player.anime_num > 4 && movement.s && movement.forward){
            player.attack(2);
        }
        else if(player.figure == 2 && player.anime_num > 6 && movement.s && movement.back){
            player.attack(3);
        }
        player.move();
    });


    Object.values(projectiles).forEach((projectile) =>{
        projectile.lifespan -= 1;
        //console.log(projectile.direction);
        if((! projectile.move())){
            projectile.losthit();
            //return;
        }
        if(projectile.lifespan <= 0){
            projectile.remove();
            return;
        }
        Object.values(players).forEach((player) => {
           if(projectile.intersect(player)){
               if(player !== projectile.player){
                  projectile.losthit();
               }
           } 
        });
        Object.values(walls).forEach((wall) => {
           if(projectile.intersect(wall)){
              projectile.losthit();
           }
        });
    });

    Object.values(hit_boxes).forEach((hit_box) =>{
        hit_box.lifespan -= 1;
        if((! hit_box.move()) || hit_box.lifespan <= 0){
            hit_box.remove();
            return;
        }
        Object.values(players).forEach((player) => {
           if(hit_box.intersect(player)){
               if(player !== hit_box.player){
                   player.damage(hit_box.damage,hit_box.vector_x,hit_box.vector_y,hit_box.player.id);
                   //create_text(hit_box.damage+"/"+hit_box.x+"/"+hit_box.y+"/"+hit_box.vector_x+"/"+hit_box.vector_y+"/"+hit_box.player.nickname,300,400,0,0,"blue",1000);
                   hit_box.player.point += hit_box.damage;
                   hit_box.remove();
               }
           }
        });
    });

    Object.values(texts).forEach((text) =>{
        text.move();
    });

    io.sockets.emit('state', players, hit_boxes, projectiles, walls, texts);
}, 1000/30);


app.use('/static', express.static(__dirname + '/static'));

app.get('/', (request, response) => {
  response.sendFile(path.join(__dirname, '/static/index.html'));
});

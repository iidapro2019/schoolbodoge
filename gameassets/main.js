"use strict";

enchant();

window.onload = function gameFnc(){
    let core = new Core(900, 1300);
    let turn = 0;
    let sceneNumber = 0;
    var hearingAidMode = false;
    let hearingAidLabel = new Label();
    enchant.widget._env.buttonFont = '23px gameFont';
    let playHeartButton = new enchant.widget.Button("心音");
    let hearingAidButton = new enchant.widget.Button("聴診器");
    playHeartButton.x = 822;
    playHeartButton.y = 150;
    hearingAidButton.x = 822;
    hearingAidButton.y = 95;
    core.preload(['gameassets/chara/chara.png', 'gameassets/chara/select.png', 'gameassets/mapimage/background.jpg', 'gameassets/mapimage/background2.jpg','gameassets/mapimage/normal_classroom.png', 'gameassets/mapimage/special_classroom.png', 'gameassets/mapimage/corridor.png', 'gameassets/mapimage/escape_exit.png', 'gameassets/ui/gametop.jpg', 'gameassets/ui/nextbutton.png', 'gameassets/ui/todemonbutton.png', 'gameassets/ui/tostudentbutton.png', 'gameassets/heartwav/Heart_1.wav', 'gameassets/heartwav/Heart_2.wav', 'gameassets/heartwav/Heart_3.wav']);
    
    let characterList = [
        {
            name: '春原 歌呼',
            status: 'escape'
        },
        {
            name: '夏山 鈴莉',
            status: 'escape'
        },
        {
            name: '柳瀬 秋太',
            status: 'escape'
        },
        {
            name: '久遠 冬夜',
            status: 'escape'
        }
    ];
    let demon  = {
        name: '鬼'
    }
    let playerList = [demon];
    let movingCharacter = demon;
    core.fps = 10;
    let left = 0;
    if((window.innerWidth - ( core.width * core.scale ))*5/7 > $("#game-rule").outerWidth(true)){
        left = ( window.innerWidth - ( core.width * core.scale ) )*2 / 7;
    }else{
        left = ( window.innerWidth - ( core.width * core.scale ) ) / 2;
    }
    $('.container').css({
        "margin":"10px 0px 0px "+left+"px",
    });
    core._pageY = $("#enchant-stage").offset().top;
    core._pageX = left;
    core.onload = function(){
        core.keybind(49, '1');
        core.keybind(50, '2');
        core.keybind(51, '3');
        core.keybind(52, '4');
        let gameBackgroundImg = new Sprite( 900, 1300 );
        gameBackgroundImg.image = core.assets['gameassets/mapimage/background.jpg'];
        let gameBackgroundImg2 = new Sprite( 900, 1300 );
        gameBackgroundImg2.image = core.assets['gameassets/mapimage/background2.jpg'];
        demon.sp = new Sprite(32,32);
        demon.sp.image = core.assets['gameassets/chara/chara.png'];
        demon.sp.frame = 24;
        for(let i = 0; i < characterList.length; i++){
            let baseFrame = i*6;
            characterList[i].sp = new Sprite(32,32);
            characterList[i].sp.image = core.assets['gameassets/chara/chara.png'];
            characterList[i].sp.frame = baseFrame;
            let currentStatus = characterList[i].status;
            Object.defineProperty(characterList[i], 'status', {
                get: () => currentStatus,
                set: newValue => {
                    currentStatus = newValue;
                    if(newValue==='caught'){
                        characterList[i].sp.frame = baseFrame+1;
                        characterList[i].sp.opacity = 0.7;
                        characterList[i].top.firstChild.frame = baseFrame+1;
                        characterList[i].top.firstChild.opacity = 0.7;
                        characterList[i].top.lastChild.opacity = 0.5;
                    }else if(newValue==='moving'){
                        characterList[i].sp.frame = [baseFrame+2,baseFrame+2,baseFrame+3,baseFrame+3,baseFrame+4,baseFrame+4,baseFrame+5,baseFrame+5];
                        characterList[i].sp.opacity = 1;
                        characterList[i].top.firstChild.frame = [baseFrame+2,baseFrame+2,baseFrame+3,baseFrame+3,baseFrame+4,baseFrame+4,baseFrame+5,baseFrame+5];
                        characterList[i].top.firstChild.opacity = 1;
                    }else if(newValue==='escape'){
                        characterList[i].sp.frame = baseFrame;
                        characterList[i].sp.opacity = 1;
                        characterList[i].top.firstChild.frame = baseFrame;
                        characterList[i].top.firstChild.opacity = 1;
                    }else if(newValue==='survival'){
                        characterList[i].sp.frame = baseFrame;
                        characterList[i].sp.visible = false;
                        characterList[i].top.firstChild.frame = baseFrame;
                        characterList[i].top.firstChild.opacity = 0.5;
                        characterList[i].top.lastChild.opacity = 0.5;
                    }
                },
                configurable: true
            });
        }
        let map = new Group();
        let floorLabels = new Group();
        let corridors = new Group();
        let baseDistance = 0;
        let sound = core.assets['gameassets/heartwav/Heart_1.wav'];
        let selectFrame = new Sprite(32, 32);
        selectFrame.image = core.assets['gameassets/chara/select.png'];
        $.getJSON("gameassets/map.json" , function(mapJson) {
            $.each(mapJson["mapData"], function(index, data){
                let room = new Group();
                room.characters = new Array();
                room.floor = data.floor;
                room.world_x = data.pos_x;
                room.world_y = data.pos_y;
                let roomNumber = new Label();
                roomNumber.text = index + 1;
                roomNumber.x = data.pos_x+125;
                roomNumber.y = data.pos_y+560*(data.floor-1)+95;
                room.addChild(roomNumber);
                roomNumber.font = 'italic 16px gameFont';
                roomNumber.color = 'white';
                let sprite = new Sprite(data.room_width, data.room_height);
                room.addChild(sprite);
                sprite.x = data.pos_x+120;
                sprite.y = data.pos_y+560*(data.floor-1)+90;
                if(data.category === "normal"){
                    sprite.image = core.assets['gameassets/mapimage/normal_classroom.png'];
                }else if(data.category === "special"){
                    sprite.image = core.assets['gameassets/mapimage/special_classroom.png'];
                }
                sprite.on('touchstart', function(){
                    let _movingCharacter=movingCharacter;
                    if(_movingCharacter.room == room) return;

                    if (sound._state) sound.stop();
                    _movingCharacter.room.characters = _movingCharacter.room.characters.filter(n => n !== _movingCharacter);
                    if(sceneNumber == 3 && turn >= 2){
                        room.characters.forEach(chara => { if(chara.status == 'escape' && confirm(`${chara.name}を捕まえます。`)){
                            chara.status = 'caught';
                            if(!playerList.some(chara => chara.status === 'escape')) core.replaceScene(createResultScene());
                        }});
                    }else if(sceneNumber == 4 && turn >= 2){
                        if(room.characters.includes(demon) && confirm(`${_movingCharacter.name}を捕まえます。`)){
                            _movingCharacter.status = 'caught';
                            if(playerList.some(chara => chara.status === 'escape')) changeMovingCharacter(playerList.find(chara => chara.status === 'escape'));
                            else core.replaceScene(createResultScene());
                        }
                    }
                    _movingCharacter.room = room;
                    room.characters.push(_movingCharacter);
                    for(let i = 0; i < playerList.length; i++){
                        playerList[i].sp.x = playerList[i].room.firstChild.x+3+27*((playerList[i].room.characters.indexOf(playerList[i]))%2);
                        playerList[i].sp.y = playerList[i].room.firstChild.y+19+35*Math.floor((playerList[i].room.characters.indexOf(playerList[i]))/2);
                    }
                });
                map.addChild(room);
            });

            for(let i = 0; i < mapJson["floorNumber"]; i++){
                let floorLabel = new Label();
                floorLabel.text = `${i+1}F`;
                floorLabel.x = 40;
                floorLabel.y = 105+560*(i);
                floorLabel.font = 'italic 35px gameFont';
                floorLabel.color = 'white';
                floorLabels.addChild(floorLabel);
            }

            $.each(mapJson["corridorData"], function(index, data){
                let sprite = new Sprite(data.corridor_width, data.corridor_height);
                sprite.image = core.assets['gameassets/mapimage/corridor.png'];
                sprite.frame = index;
                sprite.x = data.pos_x+120;
                sprite.y = data.pos_y+560*(data.floor-1)+90;
                corridors.addChild(sprite);
            });

            $.each(mapJson["exitData"], function(index, data){
                let sprite = new Sprite(data.exit_width, data.exit_height);
                sprite.image = core.assets['gameassets/mapimage/escape_exit.png'];
                sprite.rotation = data.angle;
                sprite.x = data.pos_x+120;
                sprite.y = data.pos_y+90;
                corridors.addChild(sprite);

                sprite.on('touchstart', function(){
                    let _movingCharacter=movingCharacter;

                    if (sound._state) sound.stop();
                    if(sceneNumber == 3){
                        return;
                    }else if(sceneNumber == 4){
                        if(confirm(`${_movingCharacter.name}が脱出します。`)){
                            _movingCharacter.room.characters = _movingCharacter.room.characters.filter(n => n !== _movingCharacter);
                            _movingCharacter.status = 'survival';
                            if(playerList.some(chara => chara.status === 'escape')){
                                changeMovingCharacter(playerList.find(chara => chara.status === 'escape'));
                            }else{
                                alert("生徒が全員いなくなりました。ゲームを終了します。");
                                core.replaceScene(createResultScene());
                            }
                        }
                    }
                });
            });


            baseDistance = 1/(Math.sqrt(Math.pow(map.lastChild.world_x-map.firstChild.world_x, 2)+Math.pow(map.lastChild.world_y-map.firstChild.world_y, 2))+300*(mapJson.floorNumber-1));
        });


        let createTitleScene = function(){
            sceneNumber = 1;
            let scene = new Scene();
            let gametop = new Sprite(900, 1300);
            gametop.image = core.assets['gameassets/ui/gametop.jpg'];
            scene.addChild(gametop);
            scene.on('touchstart', function(){
                $(window).on('beforeunload', function(e) {
                    return 'プレイ中のデータは破棄されます。移動してもよろしいですか?';
                });
                core.replaceScene(createSelectScene());
            });
            return scene;
        };

        let createSelectScene = function(){
            sceneNumber = 2;
            let scene = new Scene();
            scene.addChild(gameBackgroundImg);
            let captionLabel = new Label();
            scene.addChild(captionLabel);
            captionLabel.x = 20;
            captionLabel.y = 15;
            captionLabel.text = 'キャラ選択'
            captionLabel.font = '30px gameFont';
            let detailLabel = new Label();
            scene.addChild(detailLabel);
            detailLabel.x = 23;
            detailLabel.y = 50;
            detailLabel.font = '16px gameFont';
            detailLabel.text = "プレイする順に選択して下さい。"
            let nextButton = new Sprite(82, 33);
            nextButton.image = core.assets['gameassets/ui/nextbutton.png'];
            nextButton.frame = 1
            nextButton.x = 650;
            nextButton.y = 12;
            scene.addChild(nextButton);
            for(let i = 0; i < characterList.length; i++){
                let playerLabel = new Label();
                scene.addChild(playerLabel);
                playerLabel.text = characterList[i].name;
                playerLabel.x = 280*(i%2)+150;
                playerLabel.y = 100*(Math.floor(i/2)+1)+30;
                playerLabel.font = '25px gameFont';
                playerLabel.color = '#ddd';
                let playNumberLabel = new Label();
                playNumberLabel.x = playerLabel.x-30;
                playNumberLabel.y = playerLabel.y-5;
                playNumberLabel.font = '25px gameFont';
                playNumberLabel.color = 'red';
                characterList[i].sp.x = playerLabel.x-30;
                characterList[i].sp.y = playerLabel.y-5;
                scene.addChild(characterList[i].sp);
                let selectPlayerSprite = new Sprite(153, 43);
                let selectPlayerSurface = new Surface(153, 43);
                selectPlayerSprite.image = selectPlayerSurface;
                selectPlayerSurface.context.strokeStyle = '#aaa';
                selectPlayerSurface.context.lineWidth = 3;
                selectPlayerSurface.context.lineJoin = "round";
                selectPlayerSurface.context.strokeRect(0, 0, 153, 43);
                selectPlayerSprite.x = playerLabel.x-36;
                selectPlayerSprite.y = playerLabel.y-11;
                $(playerLabel).one('touchstart', function(){
                    playerList.push(characterList[i]);
                    characterList[i].sp.className = "chara";
                    playNumberLabel.text = playerList.length-1;
                    scene.addChild(playNumberLabel);
                    // scene.addChild(selectPlayerSprite);
                    if(playerList.length >= 4) nextButton.frame = 0;
                });
            };
            nextButton.on('touchstart', function(){
                if(playerList.length >= 4){
                    let randomRooms = randomSelect(map.childNodes, playerList.length);
                    for(let i = 0; i < playerList.length; i++){
                        playerList[i].room = randomRooms[i];
                        randomRooms[i].characters.push(playerList[i]);
                        playerList[i].sp.x = playerList[i].room.firstChild.x+3+27*((playerList[i].room.characters.indexOf(playerList[i]))%2);
                        playerList[i].sp.y = playerList[i].room.firstChild.y+19+35*Math.floor((playerList[i].room.characters.indexOf(playerList[i]))/2);
                        createTop(playerList[i], i);
                    };
                    core.replaceScene(createDemonPhaseScene());
                }
            });
            return scene;
        };

        let movingCharacterLabel = new Label();

        let createDemonPhaseScene = function(){
            sceneNumber = 3;
            turn++;
            demon.sp.frame = [24,25,26,27,27,27,27,27,27,27,27,27,27,28,26,25,24,24,24,24];
            demon.top.firstChild.frame = [24,25,26,27,27,27,27,27,27,27,27,27,27,28,26,25,24,24,24,24];
            let scene = new Scene();
            scene.addChild(gameBackgroundImg);
            let captionLabel = new Label();
            scene.addChild(captionLabel);
            captionLabel.x = 12;
            captionLabel.y = 12;
            captionLabel.text = '鬼フェーズ：'+turn+'ターン目';
            captionLabel.font = '20px gameFont';
            scene.addChild(movingCharacterLabel);
            movingCharacterLabel.x = 17;
            movingCharacterLabel.y = 42;
            movingCharacterLabel.font = '16px gameFont';
            for(let i = 0; i < playerList.length; i++){
                scene.addChild(playerList[i].sp);
                scene.addChild(playerList[i].top);
                if(i === 0) playerList[i].top.lastChild.color = '#000';
                else if(playerList[i].status === "escape" || playerList[i].status === "moving") playerList[i].top.lastChild.color = '#555';
            };
            let toStudentButton = new Sprite(145, 33);
            toStudentButton.image = core.assets['gameassets/ui/tostudentbutton.png'];
            toStudentButton.x = 720;
            toStudentButton.y = 17;
            scene.addChild(toStudentButton);
            toStudentButton.on('touchstart', function(){
                demon.sp.frame = 24;
                demon.top.firstChild.frame = 24;
                core.replaceScene(createStudentPhaseScene());
            });
            scene.addChild(playHeartButton);
            scene.addChild(hearingAidButton);
            let bg1 = new enchant.widget.Ninepatch(enchant.widget._env.buttonWidth, enchant.widget._env.buttonHeight);
            bg1.src = core.assets['gameassets/ui/disableButton.png'];
            playHeartButton.image = bg1;
            playHeartButton.pushedimage = bg1;
            hearingAidButton.image = bg1;
            hearingAidButton.pushedimage = bg1;
            scene.addChild(selectFrame);
            changeMovingCharacter(demon);
            scene.addChild(map);
            scene.addChild(floorLabels);
            scene.addChild(corridors);
            
            return scene;
        };

        let createStudentPhaseScene = function(){
            sceneNumber = 4;
            let scene = new Scene();
            scene.addChild(gameBackgroundImg);
            let captionLabel = new Label();
            scene.addChild(captionLabel);
            captionLabel.x = 12;
            captionLabel.y = 12;
            captionLabel.text = '生徒フェーズ：'+turn+'ターン目';
            captionLabel.font = '20px gameFont';
            scene.addChild(movingCharacterLabel);
            movingCharacterLabel.x = 17;
            movingCharacterLabel.y = 42;
            movingCharacterLabel.font = '16px gameFont';
            scene.addChild(selectFrame);
            changeMovingCharacter(playerList.find(chara => chara.status === 'escape'));
            for(let i = 0; i < playerList.length; i++){
                scene.addChild(playerList[i].sp);
                scene.addChild(playerList[i].top);
                if(i == 0){
                    playerList[i].top.lastChild.color = '#555';
                    continue;
                }
                if(playerList[i].status === "escape" || playerList[i].status === "moving") playerList[i].top.lastChild.color = '#000';
                playerList[i].top.on('touchstart', function(){
                    if(sceneNumber != 4 || playerList[i].status !== 'escape') return;

                    changeMovingCharacter(playerList[i]);
                    if(sound._state) sound.stop();
                });
            };
            
            let toDemonButton = new Sprite(119, 33);
            toDemonButton.image = core.assets['gameassets/ui/todemonbutton.png'];
            toDemonButton.x = 746;
            toDemonButton.y = 17;
            scene.addChild(toDemonButton);
            toDemonButton.on('touchstart', function(){
                if(sound._state) sound.stop();
                changeHearingAidMode(false);
                if(turn === 14){
                    alert("14ターンが経過しました。ゲームを終了します。");
                    core.replaceScene(createResultScene());
                }else{
                    core.replaceScene(createDemonPhaseScene());
                }
            });
            playHeartButton = new enchant.widget.Button("心音");
            hearingAidButton = new enchant.widget.Button("聴診器");
            playHeartButton.x = 822;
            playHeartButton.y = 150;
            hearingAidButton.x = 822;
            hearingAidButton.y = 95;
            scene.addChild(playHeartButton);
            hearingAidLabel.text = 'OFF';
            hearingAidLabel.font = '20px gameFont';
            hearingAidLabel.color = 'red';
            hearingAidLabel.x = 822;
            hearingAidLabel.y = 130;
            scene.addChild(hearingAidLabel);
            scene.addChild(hearingAidButton);
            scene.addChild(map);
            scene.addChild(floorLabels);
            scene.addChild(corridors);

            scene.addEventListener('enterframe', function(e) {
                for(let i = 1; i < playerList.length; i++){
                    if (core.input[i] && playerList[i].status === "escape"){
                        changeMovingCharacter(playerList[i]);
                        if(sound._state) sound.stop();
                    }
                }
            });

            playHeartButton.addEventListener('touchstart', function(e){
                heartSoundSwitching();
            });

            hearingAidButton.addEventListener('touchstart', function(e){
                if(sound._state) sound.stop();

                changeHearingAidMode(!hearingAidMode);
            });
            $(window).off('keydown.space');
            $(window).on('keydown.space', function(e){
                if(e.keyCode === 32 && sceneNumber === 4){
                    e.preventDefault();
                    heartSoundSwitching();
                }
            });
            
            

            return scene;
        };

        let createResultScene = function(){
            $(window).off('beforeunload');
            sceneNumber = 5;
            let scene = new Scene();
            scene.addChild(gameBackgroundImg2);
            let captionLabel = new Label();
            captionLabel.x = 300;
            captionLabel.y = 130;
            scene.addChild(captionLabel);
            captionLabel.text = 'リザルト';
            captionLabel.font = '60px gameFont';
            captionLabel.textAlign = 'center';
            captionLabel.color = '#ccc';
            let turnResultLabel = new Label();
            turnResultLabel.x = 90;
            turnResultLabel.y = 220;
            scene.addChild(turnResultLabel);
            turnResultLabel.width = 400;
            turnResultLabel.text = `経過ターン：${turn}ターン`;
            turnResultLabel.font = '30px gameFont';
            turnResultLabel.color = '#ccc';
            let caughtStudentLabel = new Label();
            caughtStudentLabel.x = 90;
            caughtStudentLabel.y = 290;
            caughtStudentLabel.width = 850;
            caughtStudentLabel.color = '#ccc';
            scene.addChild(caughtStudentLabel);
            caughtStudentLabel.text = `捕まえた生徒：${playerList.filter(chara => chara.status === 'caught').map(coughtStu => coughtStu.name).join(',') || "なし"}`;
            caughtStudentLabel.font = '30px gameFont';
            let escapeStudentLabel = new Label();
            escapeStudentLabel.x = 90;
            escapeStudentLabel.y = 360;
            escapeStudentLabel.width = 850;
            escapeStudentLabel.color = '#ccc';
            scene.addChild(escapeStudentLabel);
            escapeStudentLabel.text = `逃げ切った生徒：${playerList.filter(chara => chara.status === 'escape' || chara.status === 'moving').map(escapeStu => escapeStu.name).join(',') || "なし"}`;
            escapeStudentLabel.font = '30px gameFont';
            let survivalStudentLabel = new Label();
            survivalStudentLabel.x = 90;
            survivalStudentLabel.y = 430;
            survivalStudentLabel.width = 850;
            survivalStudentLabel.color = '#ccc';
            scene.addChild(survivalStudentLabel);
            survivalStudentLabel.text = `脱出した生徒：${playerList.filter(chara => chara.status === 'survival').map(survivalStu => survivalStu.name).join(',') || "なし"}`;
            survivalStudentLabel.font = '30px gameFont';
            return scene;
        };

        function createTop(chara, num){
            chara.top = new Group();
            let topSp = new Sprite(32,32);
            if(chara == demon) topSp.image = core.assets['gameassets/chara/chara.png'];
            else topSp.image = core.assets['gameassets/chara/chara.png'];
            topSp.frame = chara.sp.frame;
            topSp.x = 270 + num * 80;
            if(chara !== demon) topSp.x += 30;
            topSp.y = 9;
            chara.top.addChild(topSp);
            let topLabel = new Label();
            topLabel.text = chara.name;
            topLabel.font = '14px gameFont';
            topLabel.textAlign = 'center';
            topLabel.x = 135 + num * 80;
            if(chara !== demon) topLabel.x += 30;
            topLabel.y = 42;
            chara.top.addChild(topLabel);
        }

        function changeMovingCharacter(chara){
            if(movingCharacter.status === 'moving') movingCharacter.status = 'escape';
            if(chara.status === 'escape') chara.status = 'moving';
            if(sceneNumber == 4) changeHearingAidMode(false);
            movingCharacter = chara;
            movingCharacterLabel.text = `操作キャラ：${movingCharacter.name}`;
            selectFrame.x = movingCharacter.top.firstChild.x;
            selectFrame.y = movingCharacter.top.firstChild.y;
        }

        function heartSoundSwitching(){
            if(sound._state) return sound.stop();

            let distance = (Math.sqrt(Math.pow(demon.room.world_x-movingCharacter.room.world_x, 2)+Math.pow(demon.room.world_y-movingCharacter.room.world_y, 2))+300*Math.abs(demon.room.floor-movingCharacter.room.floor))*baseDistance;
            if(hearingAidMode === false){
                let threeTimesDistance = distance*3;
                if(threeTimesDistance <= 1) sound = core.assets['gameassets/heartwav/Heart_3.wav'];
                else if(threeTimesDistance <= 2) sound = core.assets['gameassets/heartwav/Heart_2.wav'];
                else if(threeTimesDistance <= 3) sound = core.assets['gameassets/heartwav/Heart_1.wav'];
            }else{
                let sixTimesDistance = distance*6;
                if(sixTimesDistance <= 1) sound = core.assets['gameassets/heartwav/Heart_3.wav'];
                else if(sixTimesDistance <= 3) sound = core.assets['gameassets/heartwav/Heart_2.wav'];
                else if(sixTimesDistance <= 6) sound = core.assets['gameassets/heartwav/Heart_1.wav'];
            }
            sound.play();
            sound.src.loop = true;
        }

        function changeHearingAidMode(bool){
            hearingAidMode = bool;
            if(bool){
                hearingAidLabel.text = 'ON';
                hearingAidLabel.color = 'green';

            }else{
                hearingAidLabel.text = 'OFF';
                hearingAidLabel.color = 'red';
            }

        }

        core.replaceScene(createTitleScene());
    };
    core.start();

    
};

function randomSelect(array, num) {
    let a = array;
    let t = [];
    let r = [];
    let l = a.length;
    let n = num < l ? num : l;
    while (n-- > 0) {
        let i = Math.random() * l | 0;
        r[n] = t[i] || a[i];
        --l;
        t[i] = t[l] || a[l];
    }
    return r;
}


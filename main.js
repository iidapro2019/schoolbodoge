enchant();

window.onload = function(){
    var core = new Core(900, 1300);
    var turn = 0;
    var sceneNumber = 0;
    core.preload(['chara/chara.png', 'select.png', 'image/background.jpg', 'image/normal_classroom.png', 'image/special_classroom.png', 'Heart_1.wav', 'Heart_2.wav', 'Heart_3.wav']);
 
    var characterList = [
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
    var demon  = {
        name: '鬼'
    }
    var playerList = [demon];
    var movingCharacter = demon;
    core.fps = 15;
    var left = ( window.innerWidth - ( core.width * core.scale ) ) / 2;
    $('#enchant-stage').css({
        "position":"absolute",
        "left":left+"px",
        "top":"80px",
        "margin-bottom":"20px",
    });
    core._pageY = 80;
    core._pageX = left;
    core.onload = function(){
        core.keybind(49, 'one');
        core.keybind(50, 'two');
        core.keybind(51, 'three');
        core.keybind(52, 'four');
        var gameBackgroundImg = new Sprite( 900, 1300 );
        gameBackgroundImg.image = core.assets['image/background.jpg'];
        demon.sp = new Sprite(32,32);
        demon.sp.image = core.assets['chara/chara.png'];
        demon.sp.frame = 24;
        for(let i = 0; i < characterList.length; i++){
            let baseFrame = i*6;
            characterList[i].sp = new Sprite(32,32);
            characterList[i].sp.image = core.assets['chara/chara.png'];
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
                    }
                },
                configurable: true
            });
        }
        var map = new Group();
        var floorLabels = new Group();
        var baseDistance = 0;
        var sound = core.assets['Heart_1.wav'];
        var selectFrame = new Sprite(32, 32);
        selectFrame.image = core.assets['select.png'];
        $.getJSON("map.json" , function(mapJson) {
            $.each(mapJson["mapData"], function(index, data){
                var room = new Group();
                room.characters = new Array();
                room.floor = data.floor;
                room.world_x = data.pos_x;
                room.world_y = data.pos_y;
                var sprite = new Sprite(data.room_width, data.room_height);
                room.addChild(sprite);
                sprite.x = data.pos_x+120;
                sprite.y = data.pos_y+560*(data.floor-1)+90;
                var roomNumber = new Label();
                roomNumber.text = index + 1;
                roomNumber.x = data.pos_x+125;
                roomNumber.y = data.pos_y+560*(data.floor-1)+95;
                room.addChild(roomNumber);
                roomNumber.font = 'italic 16px Palatino';
                roomNumber.color = 'white';
                if(data.category === "normal"){
                    sprite.image = core.assets['image/normal_classroom.png'];
                }else if(data.category === "special"){
                    sprite.image = core.assets['image/special_classroom.png'];
                }
                sprite.on('touchstart', function(){
                    _movingCharacter=movingCharacter;
                    if(_movingCharacter.room == room) return;

                    if (sound.src.loop) sound.stop();
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
                var floorLabel = new Label();
                floorLabel.text = `${i+1}F`;
                floorLabel.x = 40;
                floorLabel.y = 105+560*(i);
                floorLabel.font = 'italic 35px Palatino';
                floorLabel.color = 'white';
                floorLabels.addChild(floorLabel);
            }
            baseDistance = 1/(Math.sqrt(Math.pow(map.lastChild.world_x-map.firstChild.world_x, 2)+Math.pow(map.lastChild.world_y-map.firstChild.world_y, 2))+300*(mapJson.floorNumber-1));
        });


        var createTitleScene = function(){
            sceneNumber = 1;
            var scene = new Scene();
            scene.addChild(gameBackgroundImg);
            var label = new Label();
            label.x = 250;
            label.y = 280;
            label.text = '視　て　い　る';
            label.font = "40px Palatino"
            scene.addChild(label);
            scene.on('touchstart', function(){
                core.replaceScene(createSelectScene());
            });
            return scene;
        };

        var createSelectScene = function(){
            sceneNumber = 2;
            var scene = new Scene();
            scene.addChild(gameBackgroundImg);
            var captionLabel = new Label();
            scene.addChild(captionLabel);
            captionLabel.x = 12;
            captionLabel.y = 12;
            captionLabel.text = 'キャラ選択'
            captionLabel.font = '20px Palatino';
            for(let i = 0; i < characterList.length; i++){
                let playerLabel = new Label();
                scene.addChild(playerLabel);
                playerLabel.text = characterList[i].name;
                playerLabel.x = 280*(i%2)+110;
                playerLabel.y = 80*(Math.floor(i/2)+1);
                playerLabel.font = '20px Palatino';
                characterList[i].sp.x = playerLabel.x-30;
                characterList[i].sp.y = playerLabel.y-5;
                scene.addChild(characterList[i].sp);
                $(playerLabel).one('touchstart', function(){
                    playerList.push(characterList[i]);
                    characterList[i].sp.className = "chara";
                    playerLabel.text = playerList.length+playerLabel.text;
                });
            };
            var nextLabel = new Label();
            scene.addChild(nextLabel);
            nextLabel.text = '次へ';
            nextLabel.x = 650;
            nextLabel.y = 12;
            nextLabel.font = '20px Palatino';
            nextLabel.on('touchstart', function(){
                if(playerList.length >= 5){
                    randomRooms = randomSelect(map.childNodes, playerList.length);
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

        var createDemonPhaseScene = function(){
            sceneNumber = 3;
            turn++;
            var scene = new Scene();
            scene.addChild(gameBackgroundImg);
            var captionLabel = new Label();
            scene.addChild(captionLabel);
            captionLabel.x = 12;
            captionLabel.y = 12;
            captionLabel.text = '鬼フェーズ：'+turn+'ターン目';
            captionLabel.font = '20px Palatino';
            movingCharacterLabel = new Label();
            scene.addChild(movingCharacterLabel);
            movingCharacterLabel.x = 17;
            movingCharacterLabel.y = 42;
            movingCharacterLabel.font = '16px Palatino';
            for(let i = 0; i < playerList.length; i++){
                scene.addChild(playerList[i].sp);
                scene.addChild(playerList[i].top);
            };

            var nextLabel = new Label();
            scene.addChild(nextLabel);
            nextLabel.text = '生徒フェーズへ'
            nextLabel.x = 740;
            nextLabel.y = 22;
            nextLabel.font = '20px Palatino';
            nextLabel.on('touchstart', function(){
                core.replaceScene(createStudentPhaseScene());
            });
            scene.addChild(selectFrame);
            changeMovingCharacter(demon);
            scene.addChild(map);
            scene.addChild(floorLabels);
            
            return scene;
        };

        var createStudentPhaseScene = function(){
            sceneNumber = 4;
            var scene = new Scene();
            scene.addChild(gameBackgroundImg);
            var captionLabel = new Label();
            scene.addChild(captionLabel);
            captionLabel.x = 12;
            captionLabel.y = 12;
            captionLabel.text = '生徒フェーズ：'+turn+'ターン目';
            captionLabel.font = '20px Palatino';
            movingCharacterLabel = new Label();
            scene.addChild(movingCharacterLabel);
            movingCharacterLabel.x = 17;
            movingCharacterLabel.y = 42;
            movingCharacterLabel.font = '16px Palatino';
            scene.addChild(selectFrame);
            changeMovingCharacter(playerList.find(chara => chara.status === 'escape'));
            for(let i = 0; i < playerList.length; i++){
                scene.addChild(playerList[i].sp);
                scene.addChild(playerList[i].top);
                if(i == 0) continue;

                playerList[i].top.on('touchstart', function(){
                    if(sceneNumber != 4 || playerList[i].status !== 'escape') return;

                    changeMovingCharacter(playerList[i]);
                    if(sound._state) sound.stop();
                });
            };
            var nextLabel = new Label();
            scene.addChild(nextLabel);
            nextLabel.text = '鬼フェーズへ'
            nextLabel.x = 740;
            nextLabel.y = 22;
            nextLabel.font = '20px Palatino';
            nextLabel.on('touchstart', function(){
                if(sound._state) sound.stop();
                if(turn === 14){
                    alert("14ターンが経過しました。ゲームを終了します。");
                    core.replaceScene(createResultScene());
                }else{
                    core.replaceScene(createDemonPhaseScene());
                }
            });
            scene.addChild(map);
            scene.addChild(floorLabels);

            scene.addEventListener('enterframe', function(e) {
                if (core.input.one && playerList[1].status === "escape"){
                    changeMovingCharacter(playerList[1]);
                    if(sound._state) sound.stop();
                }
                if (core.input.two && playerList[2].status === "escape"){
                    changeMovingCharacter(playerList[2]);
                     if(sound._state) sound.stop();
                }
                if (core.input.three && playerList[3].status === "escape"){
                    changeMovingCharacter(playerList[3]);
                    if(sound._state) sound.stop();
                }
                if (core.input.four && playerList[4].status === "escape"){
                    changeMovingCharacter(playerList[4]);
                    if(sound._state) sound.stop();
                }
            });
            $(window).off('keydown.space');
            $(window).on('keydown.space', function(e){
                if(e.keyCode === 32 && sceneNumber === 4){
                    e.preventDefault();
                    if(sound._state) return sound.stop();

                    distance = (Math.sqrt(Math.pow(demon.room.world_x-movingCharacter.room.world_x, 2)+Math.pow(demon.room.world_y-movingCharacter.room.world_y, 2))+300*Math.abs(demon.room.floor-movingCharacter.room.floor))*baseDistance;
                    threeTimesDistance = distance*3;
                    if(threeTimesDistance <= 1) sound = core.assets['Heart_3.wav'];
                    else if(threeTimesDistance <= 2) sound = core.assets['Heart_2.wav'];
                    else if(threeTimesDistance <= 3) sound = core.assets['Heart_1.wav'];
                    sound.play();
                    sound.src.loop = true;
                }
            });

            return scene;
        };

        var createResultScene = function(){
            sceneNumber = 5;
            var scene = new Scene();
            scene.addChild(gameBackgroundImg);
            var captionLabel = new Label();
            captionLabel.x = 300;
            captionLabel.y = 130;
            scene.addChild(captionLabel);
            captionLabel.text = 'リザルト';
            captionLabel.font = '60px Palatino';
            captionLabel.textAlign = 'center';
            var turnResultLabel = new Label();
            turnResultLabel.x = 110;
            turnResultLabel.y = 220;
            scene.addChild(turnResultLabel);
            turnResultLabel.width = 400;
            turnResultLabel.text = `経過ターン：${turn}ターン`;
            turnResultLabel.font = '35px Palatino';
            var remainingResultLabel = new Label();
            remainingResultLabel.x = 110;
            remainingResultLabel.y = 280;
            scene.addChild(remainingResultLabel);
            remainingResultLabel.text = `生徒残り数：${playerList.filter(chara => chara.status === 'escape').length}人`;
            remainingResultLabel.font = '35px Palatino';
            return scene;
        };

        function createTop(chara, num){
            chara.top = new Group();
            var topSp = new Sprite(32,32);
            if(chara == demon) topSp.image = core.assets['chara/chara.png'];
            else topSp.image = core.assets['chara/chara.png'];
            topSp.frame = chara.sp.frame;
            topSp.x = 270 + num * 80;
            if(chara !== demon) topSp.x += 30;
            topSp.y = 9;
            chara.top.addChild(topSp);
            var topLabel = new Label();
            topLabel.text = chara.name;
            topLabel.textAlign = 'center';
            topLabel.x = 135 + num * 80;
            if(chara !== demon) topLabel.x += 30;
            topLabel.y = 42;
            chara.top.addChild(topLabel);
        }

        function changeMovingCharacter(chara){
            if(movingCharacter.status === 'moving') movingCharacter.status = 'escape';
            if(chara.status === 'escape') chara.status = 'moving';
            movingCharacter = chara;
            movingCharacterLabel.text = `操作キャラ：${movingCharacter.name}`;
            selectFrame.x = movingCharacter.top.firstChild.x;
            selectFrame.y = movingCharacter.top.firstChild.y;
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


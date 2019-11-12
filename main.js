enchant();

window.onload = function(){
    var core = new Core(900, 1300);
    var turn = 0;
    var sceneNumber = 0;
    core.preload(['chara1.png', 'select.png', 'image/background.jpg', 'image/normal_classroom.png', 'image/special_classroom.png', 'Heart_1.wav', 'Heart_2.wav', 'Heart_3.wav']);
 
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
        core.keybind(32, 'space');
        core.keybind(49, 'one');
        core.keybind(50, 'two');
        core.keybind(51, 'three');
        core.keybind(52, 'four');
        var gameBackgroundImg = new Sprite( 900, 1300 );
        gameBackgroundImg.image = core.assets['image/background.jpg'];
        demon.sp = new Sprite(32,32);
        demon.sp.image = core.assets['chara1.png'];
        demon.sp.frame = 5;
        for(let i = 0; i < characterList.length; i++){
            characterList[i].sp = new Sprite(32,32);
            characterList[i].sp.image = core.assets['chara1.png'];
            characterList[i].sp.frame = i;
            let currentStatus = characterList[i].status;
            Object.defineProperty(characterList[i], 'status', {
                get: () => currentStatus,
                set: newValue => {
                    currentStatus = newValue;
                    if(newValue==='caught') characterList[i].sp.opacity = 0.3;
                },
                configurable: true
            });
        }
        var map = new Group();
        var baseDistance = 0;
        var sound = core.assets['Heart_1.wav'];
        var selectFrame = new Sprite(32, 32);
        selectFrame.image = core.assets['select.png'];
        $.getJSON("map.json" , function(mapJson) {
            $.each(mapJson["mapData"], function(index, data){
                // console.log(data);
                var room = new Group();
                room.characters = new Array();
                room.floor = data.floor;
                var sprite = new Sprite(data.room_width, data.room_height);
                console.log(room);
                room.addChild(sprite);
                sprite.x = data.pos_x+120;
                sprite.y = data.pos_y+550*(data.floor-1)+80;
                var roomNumber = new Label();
                roomNumber.text = index + 1;
                roomNumber.x = data.pos_x+123;
                roomNumber.y = data.pos_y+550*(data.floor-1)+83;
                room.addChild(roomNumber);
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
                    if(sceneNumber == 3){
                        room.characters.forEach(chara => { if(chara.status == 'escape' && confirm(`${chara.name}を捕まえます。`)){
                            chara.status = 'caught';
                            if(!playerList.some(chara => chara.status === 'escape')) core.replaceScene(createResultScene());
                        }});
                    }else if(sceneNumber == 4){
                        if(room.characters.includes(demon) && confirm(`${_movingCharacter.name}を捕まえます。`)){
                            _movingCharacter.status = 'caught';
                            if(playerList.some(chara => chara.status === 'escape')) changeMovingCharacter(playerList.find(chara => chara.status === 'escape'));
                            else core.replaceScene(createResultScene());
                        }
                    }
                    _movingCharacter.room = room;
                    room.characters.push(_movingCharacter);
                    for(let i = 0; i < playerList.length; i++){
                        playerList[i].sp.x = playerList[i].room.firstChild.x+30*((playerList[i].room.characters.indexOf(playerList[i]))%2);
                        playerList[i].sp.y = playerList[i].room.firstChild.y+15+35*Math.floor((playerList[i].room.characters.indexOf(playerList[i]))/2);
                    }
                    console.log(_movingCharacter.name+"は(x:"+sprite.x+", y:"+sprite.y+")に移動した");
                    console.log(map);
                    console.log(room);
                });
                map.addChild(room);
            });
            baseDistance = 1/(Math.sqrt(Math.pow(map.lastChild.firstChild.x-map.firstChild.firstChild.x, 2)+Math.pow(map.lastChild.firstChild.y-map.firstChild.firstChild.y, 2))+100*(mapJson.floorNumber-1));
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
            captionLabel.x = 10;
            captionLabel.y = 10;
            captionLabel.text = 'キャラ選択'
            for(let i = 0; i < characterList.length; i++){
                let playerLabel = new Label();
                scene.addChild(playerLabel);
                playerLabel.text = characterList[i].name;
                playerLabel.x = 280*(i%2)+80;
                playerLabel.y = 80*(Math.floor(i/2)+1);
                characterList[i].sp.x = playerLabel.x-30;
                characterList[i].sp.y = playerLabel.y-5;
                scene.addChild(characterList[i].sp);
                $(playerLabel).one('touchstart', function(){
                    playerList.push(characterList[i]);
                    console.log(characterList[i].sp);
                    characterList[i].sp.className = "chara";
                    playerLabel.text = playerList.length+playerLabel.text;
                });
            };
            // scene.addChild(characterList[3].sp);
            // scene.on('touchstart', function(){
            //     console.log(playerList);
            // });
            var nextLabel = new Label();
            scene.addChild(nextLabel);
            nextLabel.text = '次へ';
            nextLabel.x = 650;
            nextLabel.y = 10;
            nextLabel.on('touchstart', function(){
                if(playerList.length >= 5){
                    randomRooms = randomSelect(map.childNodes, playerList.length);
                    for(let i = 0; i < playerList.length; i++){
                        playerList[i].room = randomRooms[i];
                        randomRooms[i].characters.push(playerList[i]);
                        playerList[i].sp.x = playerList[i].room.firstChild.x+30*((playerList[i].room.characters.indexOf(playerList[i]))%2);
                        playerList[i].sp.y = playerList[i].room.firstChild.y+15+35*Math.floor((playerList[i].room.characters.indexOf(playerList[i]))/2);
                        playerList[i]
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
            captionLabel.x = 10;
            captionLabel.y = 10;
            captionLabel.text = '鬼フェーズ：'+turn+'ターン目';
            movingCharacterLabel = new Label();
            scene.addChild(movingCharacterLabel);
            movingCharacterLabel.x = 10;
            movingCharacterLabel.y = 40;
            for(let i = 0; i < playerList.length; i++){
                // let playerLabel = new Label();
                // scene.addChild(playerLabel);
                // playerLabel.text = playerList[i].name;
                // playerLabel.x = 100*(i%2)+40;
                // playerLabel.y = 35*(Math.floor(i/2)+1);
                // playerList[i].sp.x = -10;
                // playerList[i].sp.y = -10;
                scene.addChild(playerList[i].sp);
                scene.addChild(playerList[i].top);
            };

            var nextLabel = new Label();
            scene.addChild(nextLabel);
            nextLabel.text = '生徒フェーズへ'
            nextLabel.x = 600;
            nextLabel.y = 10;
            nextLabel.on('touchstart', function(){
                core.replaceScene(createStudentPhaseScene());
            });
            scene.addChild(selectFrame);
            changeMovingCharacter(demon);
            scene.addChild(map);
            
            return scene;
        };

        var createStudentPhaseScene = function(){
            sceneNumber = 4;
            var scene = new Scene();
            scene.addChild(gameBackgroundImg);
            var captionLabel = new Label();
            scene.addChild(captionLabel);
            captionLabel.x = 10;
            captionLabel.y = 10;
            captionLabel.text = '生徒フェーズ：'+turn+'ターン目';
            movingCharacterLabel = new Label();
            scene.addChild(movingCharacterLabel);
            movingCharacterLabel.x = 10;
            movingCharacterLabel.y = 40;
            scene.addChild(selectFrame);
            changeMovingCharacter(playerList.find(chara => chara.status === 'escape'));
            for(let i = 0; i < playerList.length; i++){
                // let playerLabel = new Label();
                // scene.addChild(playerLabel);
                // playerLabel.text = playerList[i].name;
                // playerLabel.x = 100*(i%2)+40;
                // playerLabel.y = 35*(Math.floor(i/2)+1);
                // playerList[i].sp.x = -10;
                // playerList[i].sp.y = -10;
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
            nextLabel.x = 600;
            nextLabel.y = 10;
            nextLabel.on('touchstart', function(){
                core.replaceScene(createDemonPhaseScene());
            });
            scene.addChild(map);

            scene.addEventListener('enterframe', function(e) {
                if (core.input.one && playerList[1].status === "escape"){
                    console.log(sound._state);
                    changeMovingCharacter(playerList[1]);
                    if(sound._state) sound.stop();
                }
                if (core.input.two && playerList[2].status === "escape"){
                    console.log(sound._state);
                    changeMovingCharacter(playerList[2]);
                     if(sound._state) sound.stop();
                }
                if (core.input.three && playerList[3].status === "escape"){
                    console.log(sound._state);
                    changeMovingCharacter(playerList[3]);
                    if(sound._state) sound.stop();
                }
                if (core.input.four && playerList[4].status === "escape"){
                    console.log(sound._state);
                    changeMovingCharacter(playerList[4]);
                    if(sound._state) sound.stop();
                }
                if (core.input.space){
                    if(sound._state) return;

                    distance = (Math.sqrt(Math.pow(demon.room.firstChild.x-movingCharacter.room.firstChild.x, 2)+Math.pow(demon.room.firstChild.y-movingCharacter.room.firstChild.y, 2))+100*Math.abs(movingCharacter.room.floor-demon.room.floor))*baseDistance;
                    normalizationDistance = Math.floor(distance*2+1);
                    // console.log(normalizationDistance);
                    if(normalizationDistance >= 3) sound = core.assets['Heart_1.wav'];
                    if(normalizationDistance == 2) sound = core.assets['Heart_2.wav'];
                    if(normalizationDistance == 1) sound = core.assets['Heart_3.wav'];
                    sound.play();
                    sound.src.loop = true;
                }
           });

            return scene;
        };

        var createResultScene = function(){
            sceneNumber = 5;
            var scene = new Scene();
            scene.backgroundColor = '#999999';
            var captionLabel = new Label();
            captionLabel.x = 250;
            captionLabel.y = 280;
            scene.addChild(captionLabel);
            captionLabel.text = 'リザルト';
            captionLabel.font = '40px Palatino';
            return scene;
        };
        function createTop(chara, num){
            chara.top = new Group();
            var topSp = new Sprite(32,32);
            topSp.image = core.assets['chara1.png'];
            topSp.frame = chara.sp.frame;
            topSp.x = 200 + num * 80;
            topSp.y = 7;
            chara.top.addChild(topSp);
            var topLabel = new Label();
            topLabel.text = chara.name;
            topLabel.textAlign = 'center';
            topLabel.x = 65 + num * 80;
            topLabel.y = 40;
            chara.top.addChild(topLabel);
        }
        function changeMovingCharacter(chara){
            movingCharacter = chara;
            movingCharacterLabel.text = '操作キャラ：'+movingCharacter.name;
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


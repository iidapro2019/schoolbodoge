enchant();

window.onload = function(){
    var core = new Core(800, 1000);
    var turn = 0;
    core.preload(['chara1.png', 'Heart_1.wav', 'Heart_2.wav', 'Heart_3.wav']);
 
    var characterList = [
        {
            name: '春原 歌呼'
        },
        {
            name: '夏山 鈴莉'
        },
        {
            name: '柳瀬 秋太'
        },
        {
            name: '久遠 冬夜'
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
    });
    core._pageY = 80;
    core._pageX = left;
    core.onload = function(){
        core.keybind(32, 'space');
        core.keybind(49, 'one');
        core.keybind(50, 'two');
        core.keybind(51, 'three');
        core.keybind(52, 'four');
        demon.sp = new Sprite(32,32);
        demon.sp.image = core.assets['chara1.png'];
        demon.sp.frame = 5;
        for(let i = 0; i < characterList.length; i++){
            characterList[i].sp = new Sprite(32,32);
            characterList[i].sp.image = core.assets['chara1.png'];
            characterList[i].sp.frame = i;
        }
        var map = new Group();
        var baseDistance = 0;
        var sound = core.assets['Heart_1.wav'];
        $.getJSON("map.json" , function(mapJson) {
            $.each(mapJson["mapData"], function(index, data){
                // console.log(data);
                var room = new Group();
                room.character = new Array();
                room.floor = data.floor;
                var sprite = new Sprite(data.room_width, data.room_height);
                console.log(room);
                room.addChild(sprite);
                sprite.x = data.pos_x+50;
                sprite.y = data.pos_y+300*(data.floor-1)+80;
                var roomNumber = new Label();
                roomNumber.text = index + 1;
                roomNumber.x = data.pos_x+53;
                roomNumber.y = data.pos_y+300*(data.floor-1)+83;
                room.addChild(roomNumber);
                // Surfaceオブジェクトを生成しスプライトに連結
                var surface = new Surface( data.room_width, data.room_height);
                sprite.image = surface;
                sprite.on('touchstart', function(){
                    if (sound.src.loop) sound.stop();
                    movingCharacter.room.character = movingCharacter.room.character.filter(n => n !== movingCharacter);
                    movingCharacter.room = room;
                    room.character.push(movingCharacter);
                    for(let i = 0; i < playerList.length; i++){
                        playerList[i].sp.x = playerList[i].room.firstChild.x+30*((playerList[i].room.character.indexOf(playerList[i]))%2);
                        playerList[i].sp.y = playerList[i].room.firstChild.y+15+35*Math.floor((playerList[i].room.character.indexOf(playerList[i]))/2);
                    }
                    console.log(movingCharacter.name+"は(x:"+sprite.x+", y:"+sprite.y+")に移動した");
                    console.log(map);
                    console.log(room);
                });
                map.addChild(room);
                surface.context.strokeRect (0, 0, data.room_width, data.room_height);
            });
            baseDistance = 1/(Math.sqrt(Math.pow(map.lastChild.firstChild.x-map.firstChild.firstChild.x, 2)+Math.pow(map.lastChild.firstChild.y-map.firstChild.firstChild.y, 2))+100*(mapJson.floorNumber-1));
        });


        var createTitleScene = function(){
            var scene = new Scene();
            scene.backgroundColor = '#999999';
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
            var scene = new Scene();
            scene.backgroundColor = '#999999';
            var captionLabel = new Label();
            scene.addChild(captionLabel);
            captionLabel.x = 10;
            captionLabel.y = 10;
            captionLabel.text = 'キャラ選択'
            for(let i = 0; i < characterList.length; i++){
                let playerLabel = new Label();
                scene.addChild(playerLabel);
                playerLabel.text = characterList[i].name;
                playerLabel.x = 100*(i%2)+40;
                playerLabel.y = 35*(Math.floor(i/2)+1);
                characterList[i].sp.x = playerLabel.x-30;
                characterList[i].sp.y = playerLabel.y-5;
                scene.addChild(characterList[i].sp);
                $(playerLabel).one('touchstart', function(){
                    playerList.push(characterList[i]);
                    console.log(characterList[i].sp);
                    characterList[i].sp.className = "chara";
                    playerLabel.text = playerList.length+playerLabel.text
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
                        randomRooms[i].character.push(playerList[i]);
                        playerList[i].sp.x = playerList[i].room.firstChild.x+30*((playerList[i].room.character.indexOf(playerList[i]))%2);
                        playerList[i].sp.y = playerList[i].room.firstChild.y+15+35*Math.floor((playerList[i].room.character.indexOf(playerList[i]))/2);
                    };
                    core.replaceScene(createDemonPhaseScene());
                }
            });
            return scene;
        };

        var createDemonPhaseScene = function(){
            movingCharacter = demon;
            turn++;
            var scene = new Scene();
            scene.backgroundColor = '#999999';
            var captionLabel = new Label();
            scene.addChild(captionLabel);
            captionLabel.x = 10;
            captionLabel.y = 10;
            captionLabel.text = '鬼フェーズ：'+turn+'ターン目';
            movingCharacterLabel = new Label();
            scene.addChild(movingCharacterLabel);
            movingCharacterLabel.text = '操作キャラ：'+movingCharacter.name;
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
            };

            var nextLabel = new Label();
            scene.addChild(nextLabel);
            nextLabel.text = '生徒フェーズへ'
            nextLabel.x = 600;
            nextLabel.y = 10;
            nextLabel.on('touchstart', function(){
                core.replaceScene(createStudentPhaseScene());
            });
            scene.addChild(map);
            
            return scene;
        };

        var createStudentPhaseScene = function(){
            movingCharacter = playerList[1];
            var scene = new Scene();
            scene.backgroundColor = '#999999';
            var captionLabel = new Label();
            scene.addChild(captionLabel);
            captionLabel.x = 10;
            captionLabel.y = 10;
            captionLabel.text = '生徒フェーズ：'+turn+'ターン目';
            movingCharacterLabel = new Label();
            scene.addChild(movingCharacterLabel);
            movingCharacterLabel.text = '操作キャラ：'+movingCharacter.name;
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
                if (core.input.one){
                    console.log(sound._state);
                    movingCharacter = playerList[1];
                    if(sound._state) sound.stop();
                }
                if (core.input.two){
                    console.log(sound._state);
                     movingCharacter = playerList[2];
                     if(sound._state) sound.stop();
                }
                if (core.input.three){
                    console.log(sound._state);
                    movingCharacter = playerList[3];
                    if(sound._state) sound.stop();
                }
                if (core.input.four){
                    console.log(sound._state);
                    movingCharacter = playerList[4];
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
                    // console.log(sound);
                    // console.log(sound.src);
                }
                movingCharacterLabel.text = '操作キャラ：'+movingCharacter.name;
           });

            return scene;
        };

        var createResultScene = function(){
            var scene = new Scene();
            var captionLabel = new Label();
            scene.addChild(captionLabel);
            captionLabel.text = 'リザルト'
            return scene;
        };
        core.replaceScene(createTitleScene());
    };
    core.start();
};

// function randomSelect(array, num){
//     let oldArray = array;
//     let newArray = [];

//     while(newArray.length < num && oldArray.length > 0){
//         // 配列からランダムな要素を選ぶ
//         const rand = Math.floor(Math.random() * oldArray.length);
//         // 選んだ要素を別の配列に登録する
//         newArray.push(oldArray[rand]);
//         // もとの配列からは削除する
//         oldArray.splice(rand, 1);
//     }

//     return newArray;
// }

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
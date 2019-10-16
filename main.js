enchant();

window.onload = function(){
    var core = new Core(800, 1000);
    var turn = 0;
    core.preload('chara1.png');
 
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
        core.keybind(49, 'one');
        core.keybind(50, 'two');
        core.keybind(51, 'three');
        core.keybind(52, 'four');
        demon.sp = new Sprite(32,32);
        demon.sp.image = core.assets['chara1.png'];
        demon.sp.frame = 5
        for(let i = 0; i < characterList.length; i++){
            characterList[i].sp = new Sprite(32,32);
            characterList[i].sp.image = core.assets['chara1.png'];
            characterList[i].sp.frame = i
        }
        var map = new Group();
        
        $.getJSON("map.json" , function(mapJson) {
            console.log(mapJson);
            $.each(mapJson["mapData"], function(index, data){
                console.log(data);
                var sprite = new Sprite(data.room_width, data.room_height);
                sprite.x = data.pos_x+50
                sprite.y = data.pos_y+300*(data.floor-1)+80
                // Surfaceオブジェクトを生成しスプライトに連結
                var surface = new Surface( data.room_width, data.room_height);
                sprite.image = surface;
                sprite.on('touchstart', function(){
                    movingCharacter.location = sprite;
                    movingCharacter.sp.x = sprite.x
                    movingCharacter.sp.y = sprite.y
                    console.log(movingCharacter.name+"は(x:"+sprite.x+", y:"+sprite.y+")に移動した")
                });
                map.addChild(sprite);
                surface.context.strokeRect (0, 0, data.room_width, data.room_height);
            });
        });
        

        var createTitleScene = function(){
            var scene = new Scene();
            scene.backgroundColor = '#999999'; 
            var label = new Label();
            label.x = 350;
            label.y = 250;
            label.text = 'みている';
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
                    playerLabel.text = playerList.length+playerLabel.text
                });
            };
            // scene.addChild(characterList[3].sp);
            // scene.on('touchstart', function(){
            //     console.log(playerList);
            // });
            var nextLabel = new Label();
            scene.addChild(nextLabel);
            nextLabel.text = '次へ'
            nextLabel.x = 650;
            nextLabel.on('touchstart', function(){
                if(playerList.length >= 5){
                    for(let i = 0; i < playerList.length; i++){
                        playerList[i].sp.x = -100;
                        playerList[i].sp.y = -100;
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
            captionLabel.text = '鬼フェーズ：'+turn+'ターン目';
            movingCharacterLabel = new Label();
            scene.addChild(movingCharacterLabel);
            movingCharacterLabel.text = '操作キャラ：'+movingCharacter.name;
            movingCharacterLabel.y = 30;
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
            captionLabel.text = '生徒フェーズ：'+turn+'ターン目';
            movingCharacterLabel = new Label();
            scene.addChild(movingCharacterLabel);
            movingCharacterLabel.text = '操作キャラ：'+movingCharacter.name;
            movingCharacterLabel.y = 30;
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
            nextLabel.on('touchstart', function(){
                core.replaceScene(createDemonPhaseScene());
            });
            scene.addChild(map);

            scene.addEventListener('enterframe', function(e) {
                if (core.input.one) movingCharacter = playerList[1];
                if (core.input.two) movingCharacter = playerList[2];
                if (core.input.three) movingCharacter = playerList[3];
                if (core.input.four) movingCharacter = playerList[4];
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

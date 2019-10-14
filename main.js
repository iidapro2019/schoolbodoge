enchant();

window.onload = function(){
    var core = new Core(1000, 600);
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
    core.onload = function(){
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
                var sprite = new Sprite(30, 30);
                sprite.x = data.pos_x+50
                sprite.y = data.pos_y+80*data.floor
                // Surfaceオブジェクトを生成しスプライトに連結
                var surface = new Surface( 30, 30);
                sprite.image = surface;
                sprite.on('touchstart', function(){
                    movingCharacter.location = sprite;
                    movingCharacter.sp.x = sprite.x
                    movingCharacter.sp.y = sprite.y
                    console.log(movingCharacter.name+"は(x:"+sprite.x+", y:"+sprite.y+")に移動した")
                });
                map.addChild(sprite);
                surface.context.strokeRect (0, 0, 30, 30);
            });
        });
        

        var createTitleScene = function(){
            var scene = new Scene();
            var label = new Label();
            label.x = 500;
            label.y = 300;
            label.text = 'みている';
            scene.addChild(label);
            scene.on('touchstart', function(){
                core.replaceScene(createSelectScene());
            });
            return scene;
        };

        var createSelectScene = function(){
            var scene = new Scene();
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
            scene.on('touchstart', function(){
                console.log(playerList);
            });
            var nextLabel = new Label();
            scene.addChild(nextLabel);
            nextLabel.text = '次へ'
            nextLabel.x = 650;
            nextLabel.on('touchstart', function(){
                for(let i = 0; i < playerList.length; i++){
                    playerList[i].sp.x = -100;
                    playerList[i].sp.y = -100;
                };
                core.replaceScene(createDemonPhaseScene());
            });
            return scene;
        };

        var createDemonPhaseScene = function(){
            movingCharacter = demon;
            turn++;
            var scene = new Scene();
            var captionLabel = new Label();
            scene.addChild(captionLabel);
            captionLabel.text = '鬼フェーズ：'+turn+'ターン目';
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
            movingCharacter = characterList[0];
            var scene = new Scene();
            var captionLabel = new Label();
            scene.addChild(captionLabel);
            captionLabel.text = '生徒フェーズ：'+turn+'ターン目';
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
            console.log(map);

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

enchant();

window.onload = function(){
    var core = new Core(320, 320);
    var turn = 0;
    core.preload('chara1.png');
    var playerList = [
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
        },
    ];
    var oni  = {
        name: '鬼'
    }
    core.fps = 15;
    core.onload = function(){

        var createTitleScene = function(){
            var scene = new Scene();
            var label = new Label();
            label.x = 160;
            label.y = 130;
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
            for(let i = 0; i < playerList.length; i++){
                var playerLabel = new Label();
                scene.addChild(playerLabel);
                playerLabel.text = playerList[i].name;
                playerLabel.x = 80*(i%2);
                playerLabel.y = 30*(Math.floor(i/2)+1);
                scene.addChild(playerLabel);
            }
            scene.on('touchstart', function(){
                core.replaceScene(createDemonPhaseScene());
            });
            return scene;
        };

        var createDemonPhaseScene = function(){
            turn++;
            var scene = new Scene();
            var captionLabel = new Label();
            scene.addChild(captionLabel);
            captionLabel.text = '鬼フェーズ：'+turn+'ターン目';
            scene.addEventListener('touchstart', function(){
                core.replaceScene(createStudentPhaseScene());
            });
            return scene;
        };

        var createStudentPhaseScene = function(){
            var scene = new Scene();
            var captionLabel = new Label();
            scene.addChild(captionLabel);
            captionLabel.text = '生徒フェーズ：'+turn+'ターン目';
            scene.addEventListener('touchstart', function(){
                core.replaceScene(createDemonPhaseScene());
            });
            return scene;
        };

        var createResultScene = function(){
            var scene = new Scene();
            var captionLabel = new Label();
            scene.addChild(captionLabel);
            captionLabel.text = 'リザルト'
            return scene;
        }
        core.replaceScene(createTitleScene());
    };
    core.start();
};
enchant();

function rand(n){
    return Math.floor(Math.random() * (n + 1));
}

window.onload = function(){
    var core = new Core(320, 320);
    core.preload('chara1.png');
    core.fps = 15;
    core.onload = function(){
        var Bear = Class.create(Sprite, {
            initialize: function(x, y){
                Sprite.call(this, 32, 32);
                this.x = x;
                this.y = y;
                this.image = core.assets['chara1.png'];
                this.on('enterframe', function(){
                    this.rotate(rand(10));
                });
                core.rootScene.addChild(this);
            }
        });

        var bears = [];
        for(var i = 0; i < 100; i++){
            bears[i] = new Bear(rand(320), rand(320));
        }

        var bear = new Sprite(32, 32);
        bear.image = core.assets['chara1.png'];
        bear.x = 0;
        bear.y = 0;
        bear.frame = 1;
        bear.on('enterframe', function(){
            if(core.input.left) this.x -= 5;
            if(core.input.right) this.x += 5;
            if(core.input.up) this.y -= 5;
            if(core.input.down) this.y += 5;
            if(this.intersect(enemy)){
                label.text = 'hit!'
            }
            if(this.within(enemy, 10)){
                core.pushScene(gameOverScene);
                core.stop();
            }
        });

        bear.on('touchstart', function(){
            core.rootScene.removeChild(this);
        });

        core.rootScene.on('touchstart', function(e){
            bear.x = e.x;
            bear.y = e.y;
        });

        var enemy = new Sprite(32, 32);
        enemy.image = core.assets['chara1.png'];
        enemy.x = 10;
        enemy.y = 10;

        var gameOverScene = new Scene();
        gameOverScene.backgroundColor = 'black';

        var label = new Label();
        label.x = 280;
        label.y = 5;
        label.color = 'red';
        label.font = '14px, "Arial"';
        label.text = '0';
        label.on('enterframe', function(){
            label.text = (core.frame / core.fps).toFixed(2);
        });
        // core.rootScene.addChild(bears);
        core.rootScene.addChild(enemy);
        core.rootScene.addChild(bear);
        core.rootScene.addChild(label);
    };
    core.start();
};
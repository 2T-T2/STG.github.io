"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var WIDTH = 400;
var HEIGHT = 300;
var AssetLoader = /** @class */ (function () {
    function AssetLoader() {
        this._promises = [];
        this._assets = new Map();
    }
        AssetLoader.prototype.addImage = function (name, url) {
        var _this = this;
        var img = new Image();
        img.src = url;
        var promise = new Promise(function (resolve, reject) {
            return img.addEventListener("load", function (e) {
                _this._assets.set(name, img);
                resolve(img);
            });
        });
        this._promises.push(promise);
    };
    AssetLoader.prototype.loadAll = function () {
        var _this = this;
        return Promise.all(this._promises).then(function (p) { return _this._assets; });
    };
        AssetLoader.prototype.getImg = function (name) {
        return this._assets.get(name);
    };
    return AssetLoader;
}());
var Input = /** @class */ (function () {
    function Input(keyMap, previewKeyMap) {
        this.keyMap = keyMap;
        this.previewKeyMap = previewKeyMap;
    }
    Input.prototype._getKeyFromMap = function (keyName, map) {
        if (map.has(keyName) && map.get(keyName)) {
            var r = map.get(keyName);
            if (r === undefined) {
                r = false;
            }
            return r;
        }
        else {
            return false;
        }
    };
    Input.prototype._getPreviewKey = function (keyName) {
        return this._getKeyFromMap(keyName, this.previewKeyMap);
    };
    Input.prototype.getKey = function (keyName) {
        return this._getKeyFromMap(keyName, this.keyMap);
    };
    Input.prototype.getKeyDown = function (keyName) {
        var previewDown = this._getPreviewKey(keyName);
        var currentDown = this.getKey(keyName);
        return !previewDown && currentDown;
    };
    Input.prototype.getKeyUp = function (keyName) {
        var previewDown = this._getPreviewKey(keyName);
        var currentDown = this.getKey(keyName);
        return previewDown && !currentDown;
    };
    return Input;
}());
var InputReceiver = /** @class */ (function () {
    function InputReceiver() {
        var _this = this;
        this._keyMap = new Map();
        this._previewKeyMap = new Map();
        addEventListener("keydown", function (e) { return _this._keyMap.set(e.key, true); });
        addEventListener("keyup", function (e) { return _this._keyMap.set(e.key, false); });
    }
    InputReceiver.prototype.getInput = function () {
        var keyMap = new Map(this._keyMap);
        var previewKeyMap = new Map(this._previewKeyMap);
        this._previewKeyMap = new Map(this._keyMap);
        return new Input(keyMap, previewKeyMap);
    };
    return InputReceiver;
}());
var Messenger = /** @class */ (function () {
    function Messenger() {
    }
    Messenger.prototype.on = function (name, detail) {
        var d = detail;
        window.addEventListener(name, d);
    };
    Messenger.prototype.send = function (name, agrs) {
        var event = new CustomEvent(name, { detail: agrs });
        window.dispatchEvent(event);
    };
    return Messenger;
}());
var Rectangle = /** @class */ (function () {
    function Rectangle(x_r, y, w, h) {
        if (x_r instanceof Rectangle) {
            this.x = x_r.x;
            this.y = x_r.y;
            this.width = x_r.width;
            this.height = x_r.height;
            this.top = x_r.top;
            this.bottom = x_r.bottom;
            this.left = x_r.left;
            this.right = x_r.right;
        }
        else if (y !== undefined && w !== undefined && h !== undefined) {
            this.x = x_r;
            this.y = y;
            this.width = w;
            this.height = h;
            this.top = y - h / 2;
            this.bottom = y + h / 2;
            this.left = x_r - w / 2;
            this.right = x_r + w / 2;
        }
    }
    Rectangle.prototype.collision = function (other) {
        var v = other.left < this.left + this.width &&
            this.left < other.left + other.width;
        var h = other.top < this.top + this.height && this.top < other.top + other.height;
        return v && h;
    };
    return Rectangle;
}());
var Sprite = /** @class */ (function (_super) {
    __extends(Sprite, _super);
    function Sprite(img, x_r, y, w, h) {
        var _this = this;
        if (!(x_r instanceof Rectangle) &&
            y !== undefined &&
            w !== undefined &&
            h !== undefined) {
            _this = _super.call(this, x_r, y, w, h) || this;
        }
        else {
            _this = _super.call(this, x_r) || this;
        }
        _this.img = img;
        return _this;
    }
    return Sprite;
}(Rectangle));
var Actor = /** @class */ (function () {
    function Actor(x, y, w, h, hitArea, tags) {
        if (tags === void 0) { tags = []; }
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.top = y - h / 2;
        this.bottom = y + h / 2;
        this.left = x - w / 2;
        this.right = x + w / 2;
        this.hitArea = new Rectangle(hitArea.x + x, hitArea.y + y, hitArea.width, hitArea.height);
        this.tags = tags;
    }
    Actor.prototype.move = function (dx, dy) {
        this.x += dx;
        this.y += dy;
        this.top += dy;
        this.bottom += dy;
        this.left += dx;
        this.right += dx;
        this.hitArea.x += dx;
        this.hitArea.y += dy;
        this.hitArea.top += dy;
        this.hitArea.bottom + dy;
        this.hitArea.left += dx;
        this.hitArea.right += dx;
        return true;
    };
    Actor.prototype.draw = function () {
        /* 継承先にて実装 */
    };
    Actor.prototype.drawHitArea = function () {
        ctx.fillStyle = "blue";
        ctx.fillRect(this.hitArea.left, this.hitArea.top, this.hitArea.width, this.hitArea.height);
    };
    Actor.prototype.hasTag = function (tagName) {
        return this.tags.indexOf(tagName) != -1;
    };
    Actor.prototype.update = function (input) {
        /* 継承先で実装 毎フレーム呼ばれる処理 */
    };
    Actor.prototype.spawnActor = function (actor, scene) {
        messenger.send("spawn", { actor: actor, scene: scene });
    };
    Actor.prototype.destroy = function () {
        messenger.send("destroy", this);
    };
    return Actor;
}());
var SpriteActor = /** @class */ (function (_super) {
    __extends(SpriteActor, _super);
    function SpriteActor(x, y, hitArea, sprite, tags) {
        if (tags === void 0) { tags = []; }
        var _this = _super.call(this, x, y, sprite.width, sprite.height, hitArea, tags) || this;
        _this._isHitAreaVisible = false;
        _this.sprite = sprite;
        return _this;
    }
    SpriteActor.prototype.draw = function () {
        if (this._isHitAreaVisible) {
            this.drawHitArea();
        }
        var s = this.sprite;
        ctx.drawImage(s.img, 0, 0, s.width, s.height, this.left, this.top, s.width, s.height);
    };
    SpriteActor.prototype.setHitAreaVisible = function (b) {
        this._isHitAreaVisible = b;
    };
    return SpriteActor;
}(Actor));
var Scene = /** @class */ (function () {
    function Scene(name, order) {
        var _this = this;
        this.name = name;
        this.order = order;
        this.actors = [];
        this._destroyedActors = [];
        messenger.on("spawn", function (e) {
            if (e.detail.scene === _this) {
                _this.addActor(e.detail.actor);
            }
        });
        messenger.on("destroy", function (e) { return _this._addDestroyedActor(e.detail); });
    }
    Scene.prototype.addActor = function (actor) {
        this.actors.push(actor);
    };
    Scene.prototype.remove = function (actor) {
        var index = this.actors.indexOf(actor);
        if (index !== -1)
            this.actors.splice(index, 1);
    };
    Scene.prototype.changeScene = function (next) {
        messenger.send("change-scene", { nextOrder: this.order + 1, next: next });
    };
    Scene.prototype.update = function (input) {
        this._updateActors(input);
        this._collision();
        this._disposeDestroyActors();
        this.bgDraw();
        this._drawActors();
    };
    Scene.prototype._updateActors = function (input) {
        this.actors.forEach(function (a) { return a.update(input); });
    };
    Scene.prototype.bgDraw = function () {
        /* 継承先で実装 */
    };
    Scene.prototype._collision = function () {
        for (var i = 0; i < this.actors.length; i++) {
            for (var j = i + 1; j < this.actors.length; j++) {
                var actor1 = this.actors[i];
                var actor2 = this.actors[j];
                if (actor1.hitArea.collision(actor2.hitArea)) {
                    messenger.send("collision", [actor2, actor1]);
                }
            }
        }
    };
    Scene.prototype._drawActors = function () {
        this.actors.forEach(function (a) { return a.draw(); });
    };
    Scene.prototype._disposeDestroyActors = function () {
        var _this = this;
        this._destroyedActors.forEach(function (a) { return _this.remove(a); });
        this._destroyedActors = [];
    };
    Scene.prototype._addDestroyedActor = function (actor) {
        this._destroyedActors.push(actor);
    };
    return Scene;
}());
var GameInfo = /** @class */ (function () {
    function GameInfo() {
    }
    GameInfo.title = "STG";
    GameInfo.screenRectAngle = new Rectangle(0, 0, WIDTH, HEIGHT);
    GameInfo.maxFps = 60;
    GameInfo.currentFps = 0;
    return GameInfo;
}());
var Game = /** @class */ (function () {
    function Game() {
        this.title = GameInfo.title;
        this.maxFps = GameInfo.maxFps;
        this.currentFps = GameInfo.currentFps;
        this._inputReceiver = new InputReceiver();
        this._previewTimestamp = 0;
        this.currentOrder = 0;
    }
    Game.prototype.changeScene = function (next) {
        var _this = this;
        this.currentOrder++;
        this.currentScene = next;
        messenger.on("change-scene", function (e) {
            var data = e.detail;
            if (_this.currentOrder + 1 === data.nextOrder) {
                _this.changeScene(data.next);
            }
        });
    };
    Game.prototype.start = function () {
        requestAnimationFrame(this._loop.bind(this));
    };
    Game.prototype._loop = function (timestamp) {
        var elapsedSec = (timestamp - this._previewTimestamp) / 1000;
        var accuracy = 0.9;
        var frameTime = (1 / this.maxFps) * accuracy;
        if (elapsedSec < frameTime) {
            requestAnimationFrame(this._loop.bind(this));
            return;
        }
        this._previewTimestamp = timestamp;
        this.currentFps = 1 / elapsedSec;
        var input = this._inputReceiver.getInput();
        this.currentScene.update(input);
        requestAnimationFrame(this._loop.bind(this));
    };
    return Game;
}());
var TitleScene = /** @class */ (function (_super) {
    __extends(TitleScene, _super);
    function TitleScene() {
        var _this = _super.call(this, "Title", 1) || this;
        var title = new Title(WIDTH / 2, HEIGHT / 2, 0, 0, new Rectangle(0, 0, 0, 0));
        _this.addActor(title);
        return _this;
    }
    TitleScene.prototype.update = function (input) {
        _super.prototype.update.call(this, input);
        if (input.getKeyDown("Enter")) {
            this.changeScene(new GameScene());
        }
    };
    TitleScene.prototype.bgDraw = function () {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
    };
    return TitleScene;
}(Scene));
var Title = /** @class */ (function (_super) {
    __extends(Title, _super);
    function Title(x, y, w, h, hitArea) {
        return _super.call(this, x, y, w, h, hitArea) || this;
    }
    Title.prototype.draw = function () {
        if (ctx === null)
            return;
        ctx.fillStyle = "white";
        var text = "Start!";
        ctx.beginPath();
        ctx.font = "bold 24px Arial, meiryo, sans-serif";
        var measure = ctx.measureText(text);
        var textWidth = measure.width;
        var textHeight = measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent;
        ctx.fillText(text, this.x - textWidth / 2, this.y + textHeight / 2);
    };
    return Title;
}(Actor));
var GameScene = /** @class */ (function (_super) {
    __extends(GameScene, _super);
    function GameScene() {
        var _this = _super.call(this, "Game", 2) || this;
        _this.isGameOver = false;
        var img = asstes.getImg("player");
        var sprite = new Sprite(img, 20, HEIGHT / 2, 16, 16);
        var hitArea = new Rectangle(0, 0, 16, 16);
        var player = new Player(20, HEIGHT / 2, hitArea, sprite, _this, [
            "player",
        ]);
        img = asstes.getImg("enemy");
        sprite = new Sprite(img, WIDTH - 20, HEIGHT / 2, 32, 32);
        hitArea = new Rectangle(0, 0, 32, 32);
        var enemy = new Enemy(WIDTH - 20, HEIGHT / 2, 10, hitArea, sprite, 100, _this, ["enemy"]);
        var score = new Score(WIDTH, HEIGHT, 0, 0);
        _this._setBg();
        _this.addActor(score);
        _this.addActor(player);
        _this.addActor(enemy);
        messenger.on("game-over", function (e) {
            _this.isGameOver = true;
        });
        return _this;
    }
    GameScene.prototype.update = function (input) {
        _super.prototype.update.call(this, input);
        if (this.isGameOver) {
            this.changeScene(new GameOverScene());
        }
        gameScore++;
    };
    GameScene.prototype.bgDraw = function () {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
    };
    GameScene.prototype._setBg = function () {
        var _this = this;
        var bgxs = [WIDTH / 2, WIDTH * 1.5, WIDTH * 2.5];
        var names = ["bgBottom", "bgMiddle-2", "bgMiddle-1", "bgTop"];
        var speeds = [0.75, 1.25, 1.5, 2];
        var _loop_1 = function (i) {
            bgxs.forEach(function (bgx) {
                _this.addActor(new BgImg(bgx, HEIGHT / 2, names[i], speeds[i]));
            });
        };
        for (var i = 0; i < names.length; i++) {
            _loop_1(i);
        }
    };
    return GameScene;
}(Scene));
var BgImg = /** @class */ (function (_super) {
    __extends(BgImg, _super);
    function BgImg(x, y, imgName, scrollSpeed) {
        var _this = this;
        var img = asstes.getImg(imgName);
        var sprite = new Sprite(img, new Rectangle(0, 0, WIDTH, HEIGHT));
        _this = _super.call(this, x, y, new Rectangle(0, 0, 0, 0), sprite) || this;
        _this._scrollSpeed = scrollSpeed;
        return _this;
    }
    BgImg.prototype.update = function () {
        this.move(-this._scrollSpeed, 0);
        if (this.right < -WIDTH) {
            this.move(WIDTH * 3.5, 0);
        }
    };
    return BgImg;
}(SpriteActor));
var Score = /** @class */ (function (_super) {
    __extends(Score, _super);
    function Score(x, y, w, h) {
        var _this = _super.call(this, x, y, w, h, new Rectangle(0, 0, 0, 0)) || this;
        messenger.on("crush", function (e) {
            gameScore += e.detail;
        });
        return _this;
    }
    Score.prototype.draw = function () {
        ctx.fillStyle = "white";
        var text = "Score: " + gameScore;
        ctx.beginPath();
        ctx.font = "bold 10px Arial, meiryo, sans-serif";
        var measure = ctx.measureText(text);
        var textWidth = measure.width;
        var textHeight = measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent;
        ctx.fillText(text, this.x - textWidth, this.y - textHeight / 2);
    };
    return Score;
}(Actor));
var Player = /** @class */ (function (_super) {
    __extends(Player, _super);
    function Player(x, y, hitArea, sprite, scene, tags) {
        var _this = _super.call(this, x, y, hitArea, sprite, tags) || this;
        _this._cntTime = 0;
        _this._speed = 1.75;
        _this._coolTime = 10;
        _this._parent = scene;
        messenger.on("collision", function (e) {
            var data = e.detail;
            var b1 = data[0].hasTag("enemy") && data[1] === _this;
            var b2 = data[1].hasTag("enemy") && data[0] === _this;
            if (b1 || b2) {
                _this.destroy();
                messenger.send("game-over", null);
            }
        });
        return _this;
    }
    Player.prototype.update = function (input) {
        var dx = 0;
        var dy = 0;
        if (input.getKey("ArrowDown"))
            dy += this._speed;
        if (input.getKey("ArrowUp"))
            dy -= this._speed;
        if (input.getKey("ArrowRight"))
            dx += this._speed;
        if (input.getKey("ArrowLeft"))
            dx -= this._speed;
        this.move(dx, dy);
        if (this.left < 0)
            this.move(this._speed, 0);
        if (this.right > WIDTH)
            this.move(-this._speed, 0);
        if (this.top < 0)
            this.move(0, this._speed);
        if (this.bottom > HEIGHT)
            this.move(0, -this._speed);
        this._cntTime++;
        if (this._cntTime > this._coolTime && input.getKey(" ")) {
            var bullet = new Bullet(this.x, this.y);
            this.spawnActor(bullet, this._parent);
            this._cntTime = 0;
        }
    };
    return Player;
}(SpriteActor));
var Bullet = /** @class */ (function (_super) {
    __extends(Bullet, _super);
    function Bullet(x, y) {
        var _this = this;
        ctx.fillStyle = "white";
        var text = "@";
        ctx.font = "bold 10px Arial, meiryo, sans-serif";
        var m = ctx.measureText(text);
        var w = m.width;
        var h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
        _this = _super.call(this, x, y, w, h, new Rectangle(0, 0, w, h), ["player-bullet"]) || this;
        _this._speed = 5;
        messenger.on("collision", function (e) {
            var data = e.detail;
            var b1 = data[0].hasTag("enemy") && data[1] === _this;
            var b2 = data[1].hasTag("enemy") && data[0] === _this;
            if (b1 || b2) {
                _this.destroy();
            }
        });
        return _this;
    }
    Bullet.prototype.update = function () {
        this.move(this._speed, 0);
        if (this.x > WIDTH) {
            this.destroy();
        }
    };
    Bullet.prototype.draw = function () {
        ctx.fillStyle = "white";
        var text = "@";
        ctx.beginPath();
        ctx.font = "bold 10px Arial, meiryo, sans-serif";
        var measure = ctx.measureText(text);
        var textWidth = measure.width;
        var textHeight = measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent;
        ctx.fillText(text, this.x - textWidth / 2, this.y + textHeight / 2);
    };
    return Bullet;
}(Actor));
var Enemy = /** @class */ (function (_super) {
    __extends(Enemy, _super);
    function Enemy(x, y, hp, hitArea, sprite, score, scene, tags) {
        var _this = _super.call(this, x, y, hitArea, sprite, tags) || this;
        _this.hp = hp;
        _this._parent = scene;
        var hpBar = new EnemyHpBar(x, y - _this.height / 2 - 5, _this.width, 5, _this.hp);
        _this.spawnActor(hpBar, _this._parent);
        _this.score = score;
        messenger.on("collision", function (e) {
            var data = e.detail;
            var b1 = data[0].hasTag("player-bullet") && data[1] === _this;
            var b2 = data[1].hasTag("player-bullet") && data[0] === _this;
            if (b1 || b2) {
                if (_this.hp-- <= 1) {
                    messenger.send("crush", _this.score);
                    _this.destroy();
                    hpBar.destroy();
                }
                hpBar.damage();
            }
        });
        return _this;
    }
    return Enemy;
}(SpriteActor));
var EnemyHpBar = /** @class */ (function (_super) {
    __extends(EnemyHpBar, _super);
    function EnemyHpBar(x, y, w, h, hp) {
        var _this = _super.call(this, x, y, w, h, new Rectangle(0, 0, 0, 0)) || this;
        _this.hp = hp;
        _this.maxHp = hp;
        return _this;
    }
    EnemyHpBar.prototype.draw = function () {
        ctx.fillStyle = "green";
        var w = this.width * (this.hp / this.maxHp);
        ctx.fillRect(this.left, this.top, w, this.height);
        ctx.strokeStyle = "gray";
        ctx.strokeRect(this.left, this.top, this.width, this.height);
    };
    EnemyHpBar.prototype.damage = function () {
        this.hp--;
    };
    return EnemyHpBar;
}(Actor));
var GameOverScene = /** @class */ (function (_super) {
    __extends(GameOverScene, _super);
    function GameOverScene() {
        var _this = _super.call(this, "Game-Over", 3) || this;
        var gameOver = new GameOver(WIDTH / 2, HEIGHT / 2, 0, 0, new Rectangle(0, 0, 0, 0));
        _this.addActor(gameOver);
        return _this;
    }
    GameOverScene.prototype.update = function (input) {
        _super.prototype.update.call(this, input);
    };
    GameOverScene.prototype.bgDraw = function () {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
    };
    return GameOverScene;
}(Scene));
var GameOver = /** @class */ (function (_super) {
    __extends(GameOver, _super);
    function GameOver(x, y, w, h, hitArea) {
        return _super.call(this, x, y, w, h, hitArea) || this;
    }
    GameOver.prototype.draw = function () {
        if (ctx === null)
            return;
        ctx.fillStyle = "white";
        var text = "Game Over";
        ctx.beginPath();
        ctx.font = "bold 24px Arial, meiryo, sans-serif";
        var measure = ctx.measureText(text);
        var textWidth = measure.width;
        var textHeight = measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent;
        ctx.fillText(text, this.x - textWidth / 2, this.y + textHeight / 2);
    };
    return GameOver;
}(Actor));
var STG = /** @class */ (function (_super) {
    __extends(STG, _super);
    function STG() {
        var _this = _super.call(this) || this;
        var first = new TitleScene();
        _this.changeScene(first);
        return _this;
    }
    return STG;
}(Game));
function setEnvironment() {
    document.body.appendChild(canvas);
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    asstes.addImage("bgTop", "./img/bgLayer1.png");
    asstes.addImage("bgMiddle-1", "./img/bgLayer2.png");
    asstes.addImage("bgMiddle-2", "./img/bgLayer3.png");
    asstes.addImage("bgBottom", "./img/bgLayer4.png");
    asstes.addImage("player", "./img/player.png");
    asstes.addImage("enemy", "./img/enemy.png");
}
function main() {
    asstes.loadAll().then(function (e) {
        var g = new STG();
        g.start();
    });
}
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
var asstes = new AssetLoader();
var messenger = new Messenger();
var gameScore = 0;
window.onload = function () {
    setEnvironment();
    main();
};

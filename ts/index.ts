type TagName = "player" | "enemy" | "player-bullet" | "enemy-bullet";
type MessageName =
  | "spawn"
  | "destroy"
  | "change-scene"
  | "collision"
  | "game-over"
  | "crush";
type UsingKey =
  | "ArrowLeft"
  | "ArrowUp"
  | "ArrowDown"
  | "ArrowRight"
  | " "
  | "Enter";
type ImgName =
  | "bgTop"
  | "bgMiddle-1"
  | "bgMiddle-2"
  | "bgBottom"
  | "player"
  | "enemy";
const WIDTH = 400;
const HEIGHT = 300;

class AssetLoader {
  private _promises: Promise<unknown>[];
  private _assets: Map<ImgName, HTMLImageElement>;

  constructor() {
    this._promises = [];
    this._assets = new Map();
  }
    public addImage(name: ImgName, url: string) {
    const img = new Image();
    img.src = url;

    const promise = new Promise((resolve, reject) =>
      img.addEventListener("load", (e) => {
        this._assets.set(name, img);
        resolve(img);
      })
    );
    this._promises.push(promise);
  }
  public loadAll(): Promise<Map<string, HTMLImageElement>> {
    return Promise.all(this._promises).then((p) => this._assets);
  }
    public getImg(name: ImgName): HTMLImageElement | undefined {
    return this._assets.get(name);
  }
}
class Input {
  keyMap: Map<string, boolean>;
  previewKeyMap: Map<string, boolean>;
  constructor(
    keyMap: Map<string, boolean>,
    previewKeyMap: Map<string, boolean>
  ) {
    this.keyMap = keyMap;
    this.previewKeyMap = previewKeyMap;
  }

  private _getKeyFromMap(
    keyName: UsingKey,
    map: Map<string, boolean>
  ): boolean {
    if (map.has(keyName) && map.get(keyName)) {
      let r = map.get(keyName);
      if (r === undefined) {
        r = false;
      }
      return r;
    } else {
      return false;
    }
  }
  private _getPreviewKey(keyName: UsingKey): boolean {
    return this._getKeyFromMap(keyName, this.previewKeyMap);
  }
  public getKey(keyName: UsingKey) {
    return this._getKeyFromMap(keyName, this.keyMap);
  }
  public getKeyDown(keyName: UsingKey) {
    const previewDown = this._getPreviewKey(keyName);
    const currentDown = this.getKey(keyName);
    return !previewDown && currentDown;
  }
  public getKeyUp(keyName: UsingKey) {
    const previewDown = this._getPreviewKey(keyName);
    const currentDown = this.getKey(keyName);
    return previewDown && !currentDown;
  }
}
class InputReceiver {
  private _keyMap: Map<string, boolean>;
  private _previewKeyMap: Map<string, boolean>;
  constructor() {
    this._keyMap = new Map();
    this._previewKeyMap = new Map();

    addEventListener("keydown", (e) => this._keyMap.set(e.key, true));
    addEventListener("keyup", (e) => this._keyMap.set(e.key, false));
  }
  getInput() {
    const keyMap = new Map(this._keyMap);
    const previewKeyMap = new Map(this._previewKeyMap);
    this._previewKeyMap = new Map(this._keyMap);
    return new Input(keyMap, previewKeyMap);
  }
}
class Messenger {
  on(name: MessageName, detail: (e: { detail: any }) => void) {
    const d = detail as (e: any) => void;
    window.addEventListener(name, d);
  }
  send(name: MessageName, agrs: any) {
    const event = new CustomEvent(name, { detail: agrs });
    window.dispatchEvent(event);
  }
}
class Rectangle {
  x!: number;
  y!: number;
  width!: number;
  height!: number;
  top!: number;
  bottom!: number;
  left!: number;
  right!: number;
  constructor(x: number, y: number, w: number, h: number);
  constructor(r: Rectangle);
  constructor(x_r: Rectangle | number, y?: number, w?: number, h?: number) {
    if (x_r instanceof Rectangle) {
      this.x = x_r.x;
      this.y = x_r.y;
      this.width = x_r.width;
      this.height = x_r.height;
      this.top = x_r.top;
      this.bottom = x_r.bottom;
      this.left = x_r.left;
      this.right = x_r.right;
    } else if (y !== undefined && w !== undefined && h !== undefined) {
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
  collision(other: Rectangle): boolean {
    const v =
      other.left < this.left + this.width &&
      this.left < other.left + other.width;
    const h =
      other.top < this.top + this.height && this.top < other.top + other.height;
    return v && h;
  }
}
class Sprite extends Rectangle {
  img: HTMLImageElement;
  constructor(
    img: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number
  );
  constructor(img: HTMLImageElement, rectangle: Rectangle);
  constructor(
    img: HTMLImageElement,
    x_r: number | Rectangle,
    y?: number,
    w?: number,
    h?: number
  ) {
    if (
      !(x_r instanceof Rectangle) &&
      y !== undefined &&
      w !== undefined &&
      h !== undefined
    ) {
      super(x_r, y, w, h);
    } else {
      super(x_r as Rectangle);
    }
    this.img = img;
  }
}
class Actor {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  bottom: number;
  left: number;
  right: number;
    hitArea: Rectangle;
  tags: TagName[];
  constructor(
    x: number,
    y: number,
    w: number,
    h: number,
    hitArea: Rectangle,
    tags: TagName[] = []
  ) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.top = y - h / 2;
    this.bottom = y + h / 2;
    this.left = x - w / 2;
    this.right = x + w / 2;
    this.hitArea = new Rectangle(
      hitArea.x + x,
      hitArea.y + y,
      hitArea.width,
      hitArea.height
    );
    this.tags = tags;
  }
  move(dx: number, dy: number): boolean {
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
  }
  draw() {
    /* 継承先にて実装 */
  }
  drawHitArea() {
    ctx.fillStyle = "blue";
    ctx.fillRect(
      this.hitArea.left,
      this.hitArea.top,
      this.hitArea.width,
      this.hitArea.height
    );
  }
  hasTag(tagName: TagName): boolean {
    return this.tags.indexOf(tagName) != -1;
  }
  update(input: Input) {
    /* 継承先で実装 毎フレーム呼ばれる処理 */
  }
  spawnActor(actor: Actor, scene: Scene) {
    messenger.send("spawn", { actor: actor, scene: scene });
  }
  destroy() {
    messenger.send("destroy", this);
  }
}
class SpriteActor extends Actor {
  sprite: Sprite;
  _isHitAreaVisible = false;
  constructor(
    x: number,
    y: number,
    hitArea: Rectangle,
    sprite: Sprite,
    tags: TagName[] = []
  ) {
    super(x, y, sprite.width, sprite.height, hitArea, tags);
    this.sprite = sprite;
  }
  draw() {
    if (this._isHitAreaVisible) {
      this.drawHitArea();
    }

    const s = this.sprite;
    ctx.drawImage(
      s.img,
      0,
      0,
      s.width,
      s.height,
      this.left,
      this.top,
      s.width,
      s.height
    );
  }
  setHitAreaVisible(b: boolean) {
    this._isHitAreaVisible = b;
  }
}
class Scene {
  name: string;
  order: number;
  actors: Actor[];
  private _destroyedActors: Actor[];
  constructor(name: string, order: number) {
    this.name = name;
    this.order = order;
    this.actors = [];
    this._destroyedActors = [];
    messenger.on("spawn", (e) => {
      if (e.detail.scene === this) {
        this.addActor(e.detail.actor);
      }
    });
    messenger.on("destroy", (e) => this._addDestroyedActor(e.detail));
  }
  addActor(actor: Actor) {
    this.actors.push(actor);
  }
  remove(actor: Actor) {
    const index = this.actors.indexOf(actor);
    if (index !== -1) this.actors.splice(index, 1);
  }
  changeScene(next: Scene) {
    messenger.send("change-scene", { nextOrder: this.order + 1, next: next });
  }
  update(input: Input) {
    this._updateActors(input);
    this._collision();
    this._disposeDestroyActors();
    this.bgDraw();
    this._drawActors();
  }
  private _updateActors(input: Input) {
    this.actors.forEach((a) => a.update(input));
  }
  bgDraw() {
    /* 継承先で実装 */
  }
  private _collision() {
    for (let i = 0; i < this.actors.length; i++) {
      for (let j = i + 1; j < this.actors.length; j++) {
        const actor1 = this.actors[i];
        const actor2 = this.actors[j];
        if (actor1.hitArea.collision(actor2.hitArea)) {
          messenger.send("collision", [actor2, actor1]);
        }
      }
    }
  }
  private _drawActors() {
    this.actors.forEach((a) => a.draw());
  }
  private _disposeDestroyActors() {
    this._destroyedActors.forEach((a) => this.remove(a));
    this._destroyedActors = [];
  }
  private _addDestroyedActor(actor: Actor) {
    this._destroyedActors.push(actor);
  }
}

class GameInfo {
  static title = "STG";
  static screenRectAngle = new Rectangle(0, 0, WIDTH, HEIGHT);
  static maxFps = 60;
  static currentFps = 0;
}
class Game {
  title: string;
  maxFps: number;
  currentFps: number;
  currentOrder: number;
  private _previewTimestamp: number;
  private _inputReceiver: InputReceiver;
  currentScene!: Scene;
  constructor() {
    this.title = GameInfo.title;
    this.maxFps = GameInfo.maxFps;
    this.currentFps = GameInfo.currentFps;
    this._inputReceiver = new InputReceiver();
    this._previewTimestamp = 0;
    this.currentOrder = 0;
  }
  changeScene(next: Scene) {
    this.currentOrder++;
    this.currentScene = next;

    messenger.on("change-scene", (e) => {
      const data = e.detail as { nextOrder: number; next: Scene };
      if (this.currentOrder + 1 === data.nextOrder) {
        this.changeScene(data.next);
      }
    });
  }
  start() {
    requestAnimationFrame(this._loop.bind(this));
  }
  private _loop(timestamp: number) {
    const elapsedSec = (timestamp - this._previewTimestamp) / 1000;
    const accuracy = 0.9;
    const frameTime = (1 / this.maxFps) * accuracy;
    if (elapsedSec < frameTime) {
      requestAnimationFrame(this._loop.bind(this));
      return;
    }
    this._previewTimestamp = timestamp;
    this.currentFps = 1 / elapsedSec;

    const input = this._inputReceiver.getInput();
    this.currentScene.update(input);

    requestAnimationFrame(this._loop.bind(this));
  }
}


class TitleScene extends Scene {
  constructor() {
    super("Title", 1);
    const title = new Title(
      WIDTH / 2,
      HEIGHT / 2,
      0,
      0,
      new Rectangle(0, 0, 0, 0)
    );
    this.addActor(title);
  }
  update(input: Input) {
    super.update(input);
    if (input.getKeyDown("Enter")) {
      this.changeScene(new GameScene());
    }
  }
  bgDraw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }
}
class Title extends Actor {
  constructor(x: number, y: number, w: number, h: number, hitArea: Rectangle) {
    super(x, y, w, h, hitArea);
  }
  draw() {
    if (ctx === null) return;
    ctx.fillStyle = "white";
    const text = "Start!";
    ctx.beginPath();

    ctx.font = "bold 24px Arial, meiryo, sans-serif";
    const measure = ctx.measureText(text);
    const textWidth = measure.width;
    const textHeight =
      measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent;

    ctx.fillText(text, this.x - textWidth / 2, this.y + textHeight / 2);
  }
}
class GameScene extends Scene {
  isGameOver = false;
  constructor() {
    super("Game", 2);
    let img = asstes.getImg("player") as HTMLImageElement;
    let sprite = new Sprite(img, 20, HEIGHT / 2, 16, 16);
    let hitArea = new Rectangle(0, 0, 16, 16);
    const player = new Player(20, HEIGHT / 2, hitArea, sprite, this, [
      "player",
    ]);
    img = asstes.getImg("enemy") as HTMLImageElement;
    sprite = new Sprite(img, WIDTH - 20, HEIGHT / 2, 32, 32);
    hitArea = new Rectangle(0, 0, 32, 32);
    const enemy = new Enemy(
      WIDTH - 20,
      HEIGHT / 2,
      10,
      hitArea,
      sprite,
      100,
      this,
      ["enemy"]
    );
    const score = new Score(WIDTH, HEIGHT, 0, 0);
    this._setBg();
    this.addActor(score);
    this.addActor(player);
    this.addActor(enemy);
    messenger.on("game-over", (e) => {
      this.isGameOver = true;
    });
  }
  update(input: Input) {
    super.update(input);
    if (this.isGameOver) {
      this.changeScene(new GameOverScene());
    }
    gameScore++;
  }
  bgDraw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }
  private _setBg() {
    const bgxs = [WIDTH / 2, WIDTH * 1.5, WIDTH * 2.5];
    const names: ImgName[] = ["bgBottom", "bgMiddle-2", "bgMiddle-1", "bgTop"];
    const speeds = [0.75, 1.25, 1.5, 2];
    for (let i = 0; i < names.length; i++) {
      bgxs.forEach((bgx) => {
        this.addActor(new BgImg(bgx, HEIGHT / 2, names[i], speeds[i]));
      });
    }
  }
}
class BgImg extends SpriteActor {
  private _scrollSpeed: number;
  constructor(x: number, y: number, imgName: ImgName, scrollSpeed: number) {
    const img = asstes.getImg(imgName) as HTMLImageElement;
    const sprite = new Sprite(img, new Rectangle(0, 0, WIDTH, HEIGHT));
    super(x, y, new Rectangle(0, 0, 0, 0), sprite);
    this._scrollSpeed = scrollSpeed;
  }
  update() {
    this.move(-this._scrollSpeed, 0);
    if (this.right < -WIDTH) {
      this.move(WIDTH * 3.5, 0);
    }
  }
}
class Score extends Actor {
  constructor(x: number, y: number, w: number, h: number) {
    super(x, y, w, h, new Rectangle(0, 0, 0, 0));
    messenger.on("crush", (e) => {
      gameScore += e.detail;
    });
  }
  draw() {
    ctx.fillStyle = "white";
    const text = "Score: " + gameScore;
    ctx.beginPath();

    ctx.font = "bold 10px Arial, meiryo, sans-serif";
    const measure = ctx.measureText(text);
    const textWidth = measure.width;
    const textHeight =
      measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent;

    ctx.fillText(text, this.x - textWidth, this.y - textHeight / 2);
  }
}
class Player extends SpriteActor {
  private _parent;
  private _cntTime = 0;
  private _speed = 1.75;
  private _coolTime = 10;
  constructor(
    x: number,
    y: number,
    hitArea: Rectangle,
    sprite: Sprite,
    scene: Scene,
    tags?: TagName[]
  ) {
    super(x, y, hitArea, sprite, tags);
    this._parent = scene;
    messenger.on("collision", (e) => {
      const data = e.detail as Actor[];
      const b1 = data[0].hasTag("enemy") && data[1] === this;
      const b2 = data[1].hasTag("enemy") && data[0] === this;
      if (b1 || b2) {
        this.destroy();
        messenger.send("game-over", null);
      }
    });
  }
  update(input: Input) {
    let dx = 0;
    let dy = 0;
    if (input.getKey("ArrowDown")) dy += this._speed;
    if (input.getKey("ArrowUp")) dy -= this._speed;
    if (input.getKey("ArrowRight")) dx += this._speed;
    if (input.getKey("ArrowLeft")) dx -= this._speed;
    this.move(dx, dy);
    if (this.left < 0) this.move(this._speed, 0);
    if (this.right > WIDTH) this.move(-this._speed, 0);
    if (this.top < 0) this.move(0, this._speed);
    if (this.bottom > HEIGHT) this.move(0, -this._speed);
    this._cntTime++;
    if (this._cntTime > this._coolTime && input.getKey(" ")) {
      const bullet = new Bullet(this.x, this.y);
      this.spawnActor(bullet, this._parent);
      this._cntTime = 0;
    }
  }
}
class Bullet extends Actor {
  private _speed: number;
  constructor(x: number, y: number) {
    ctx.fillStyle = "white";
    const text = "@";
    ctx.font = "bold 10px Arial, meiryo, sans-serif";
    const m = ctx.measureText(text);
    const w = m.width;
    const h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
    super(x, y, w, h, new Rectangle(0, 0, w, h), ["player-bullet"]);
    this._speed = 5;

    messenger.on("collision", (e) => {
      const data = e.detail as Actor[];
      const b1 = data[0].hasTag("enemy") && data[1] === this;
      const b2 = data[1].hasTag("enemy") && data[0] === this;
      if (b1 || b2) {
        this.destroy();
      }
    });
  }
  update() {
    this.move(this._speed, 0);
    if (this.x > WIDTH) {
      this.destroy();
    }
  }
  draw() {
    ctx.fillStyle = "white";
    const text = "@";
    ctx.beginPath();

    ctx.font = "bold 10px Arial, meiryo, sans-serif";
    const measure = ctx.measureText(text);
    const textWidth = measure.width;
    const textHeight =
      measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent;

    ctx.fillText(text, this.x - textWidth / 2, this.y + textHeight / 2);
  }
}
class Enemy extends SpriteActor {
  private _parent;
  hp: number;
  score: number;
  constructor(
    x: number,
    y: number,
    hp: number,
    hitArea: Rectangle,
    sprite: Sprite,
    score: number,
    scene: Scene,
    tags: TagName[]
  ) {
    super(x, y, hitArea, sprite, tags);
    this.hp = hp;
    this._parent = scene;
    const hpBar = new EnemyHpBar(
      x,
      y - this.height / 2 - 5,
      this.width,
      5,
      this.hp
    );
    this.spawnActor(hpBar, this._parent);
    this.score = score;
    messenger.on("collision", (e) => {
      const data = e.detail as Actor[];
      const b1 = data[0].hasTag("player-bullet") && data[1] === this;
      const b2 = data[1].hasTag("player-bullet") && data[0] === this;
      if (b1 || b2) {
        if (this.hp-- <= 1) {
          messenger.send("crush", this.score);
          this.destroy();
          hpBar.destroy();
        }
        hpBar.damage();
      }
    });
  }
}
class EnemyHpBar extends Actor {
  hp: number;
  maxHp: number;
  constructor(x: number, y: number, w: number, h: number, hp: number) {
    super(x, y, w, h, new Rectangle(0, 0, 0, 0));
    this.hp = hp;
    this.maxHp = hp;
  }
  draw() {
    ctx.fillStyle = "green";
    const w = this.width * (this.hp / this.maxHp);
    ctx.fillRect(this.left, this.top, w, this.height);
    ctx.strokeStyle = "gray";
    ctx.strokeRect(this.left, this.top, this.width, this.height);
  }
  damage() {
    this.hp--;
  }
}
class GameOverScene extends Scene {
  constructor() {
    super("Game-Over", 3);
    const gameOver = new GameOver(
      WIDTH / 2,
      HEIGHT / 2,
      0,
      0,
      new Rectangle(0, 0, 0, 0)
    );
    this.addActor(gameOver);
  }
  update(input: Input) {
    super.update(input);
  }
  bgDraw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }
}
class GameOver extends Actor {
  constructor(x: number, y: number, w: number, h: number, hitArea: Rectangle) {
    super(x, y, w, h, hitArea);
  }
  draw() {
    if (ctx === null) return;
    ctx.fillStyle = "white";
    const text = "Game Over";
    ctx.beginPath();

    ctx.font = "bold 24px Arial, meiryo, sans-serif";
    const measure = ctx.measureText(text);
    const textWidth = measure.width;
    const textHeight =
      measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent;

    ctx.fillText(text, this.x - textWidth / 2, this.y + textHeight / 2);
  }
}
class STG extends Game {
  constructor() {
    super();
    const first = new TitleScene();
    this.changeScene(first);
  }
}
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
  asstes.loadAll().then((e) => {
    const g = new STG();
    g.start();
  });
}

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
const asstes = new AssetLoader();
const messenger = new Messenger();
let gameScore = 0;

window.onload = () => {
  setEnvironment();
  main();
};

class Particle {
  constructor(x, y, stage) {
    this.homeX = x;
    this.homeY = y;
    this.x = x + (Math.random() - 0.5) * 500;
    this.y = y + (Math.random() - 0.5) * 500;
    this.vx = 0;
    this.vy = 0;
    this.size = Math.random() * 3 + 1;
    this.alpha = 0;
    this.stage = stage;

    this.shape = new createjs.Shape();
    this.shape.graphics.beginFill("#fff").drawCircle(0, 0, this.size);
    this.shape.x = this.x;
    this.shape.y = this.y;
    this.shape.alpha = 0;
    stage.addChild(this.shape);
  }

  update(mouseX, mouseY, introComplete) {
    if (!introComplete) {
      this.alpha = Math.min(1, this.alpha + 0.02);
      const dx = this.homeX - this.x;
      const dy = this.homeY - this.y;
      this.vx = dx * 0.05;
      this.vy = dy * 0.05;
    } else {
      const dx = mouseX - this.homeX;
      const dy = mouseY - this.homeY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = 100;

      if (distance < maxDistance) {
        const force = (maxDistance - distance) / maxDistance;
        const angle = Math.atan2(dy, dx);
        this.vx = -Math.cos(angle) * force * 20;
        this.vy = -Math.sin(angle) * force * 20;
      } else {
        this.vx *= 0.95;
        this.vy *= 0.95;
      }

      const returnX = (this.homeX - this.x) * 0.05;
      const returnY = (this.homeY - this.y) * 0.05;
      this.vx += returnX;
      this.vy += returnY;
    }

    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.95;
    this.vy *= 0.95;

    this.shape.x = this.x;
    this.shape.y = this.y;
    this.shape.alpha = this.alpha;
  }
}

class BackgroundParticle {
  constructor(stage) {
    this.x = Math.random() * stage.canvas.width;
    this.y = Math.random() * stage.canvas.height;
    this.z = Math.random() * 0.5 + 0.5;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.size = Math.random() * 2 + 0.5;

    this.shape = new createjs.Shape();
    this.shape.graphics
      .beginFill("rgba(255,255,255,0.6)")
      .drawCircle(0, 0, this.size * this.z);
    this.shape.x = this.x;
    this.shape.y = this.y;
    this.shape.alpha = this.z * 0.5;
    stage.addChild(this.shape);
  }

  update(mouseX, mouseY, stageWidth, stageHeight) {
    const parallaxX = (mouseX - stageWidth / 2) * 0.02 * this.z;
    const parallaxY = (mouseY - stageHeight / 2) * 0.02 * this.z;

    this.x += this.vx + parallaxX;
    this.y += this.vy + parallaxY;

    if (this.x < -10) this.x = stageWidth + 10;
    if (this.x > stageWidth + 10) this.x = -10;
    if (this.y < -10) this.y = stageHeight + 10;
    if (this.y > stageHeight + 10) this.y = -10;

    this.shape.x = this.x;
    this.shape.y = this.y;
  }
}

let stage,
  textContainer,
  particles = [],
  backgroundParticles = [],
  mouseX = 0,
  mouseY = 0;
let introComplete = false,
  resizeTimeout = null;

function init() {
  const canvas = document.getElementById("heroCanvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  stage = new createjs.Stage(canvas);
  stage.enableMouseOver(20);
  createjs.Touch.enable(stage);

  createBackgroundParticles();
  createTextParticles();

  stage.on("stagemousemove", handleMouseMove);

  createjs.Ticker.framerate = 60;
  createjs.Ticker.addEventListener("tick", update);

  setTimeout(() => {
    introComplete = true;
  }, 2000);

  window.addEventListener("resize", handleResize);
}

function createBackgroundParticles() {
  const particleCount = 100;
  for (let i = 0; i < particleCount; i++) {
    backgroundParticles.push(new BackgroundParticle(stage));
  }
}

function createTextParticles() {
  textContainer = new createjs.Container();
  stage.addChild(textContainer);

  const text1 = new createjs.Text("离子像素", "bold 140px 微软雅黑, Microsoft YaHei", "#ffffff");
  const text2 = new createjs.Text("以离子之力-塑像素之美", "bold 100px 微软雅黑, Microsoft YaHei", "#ffffff");


  text1.textAlign = "center";
  text2.textAlign = "center";

  const tempContainer = new createjs.Container();
  tempContainer.addChild(text1);
  tempContainer.cache(-600, -30, 1200, 160);

  const bounds1 = text1.getBounds();
  const centerX = stage.canvas.width / 2;
  const centerY = stage.canvas.height / 2 - 130;

  for (let x = -bounds1.width / 2; x < bounds1.width / 2; x += 6) {
    for (let y = -bounds1.height / 2; y < bounds1.height / 2; y += 6) {
      const pixel = tempContainer.cacheCanvas
        .getContext("2d")
        .getImageData(x + 600, y + 100, 1, 1).data;

      if (pixel[2] > 130) {
        particles.push(new Particle(centerX + x, centerY + y, textContainer));
      }
    }
  }

  tempContainer.removeAllChildren();
  text2.x = 0;
  text2.y = 0;
  tempContainer.addChild(text2);
  tempContainer.cache(-600, -70, 1200, 160);

  const bounds2 = text2.getBounds();
  const centerY2 = centerY + 170;

  for (let x = -bounds2.width / 2; x < bounds2.width / 2; x += 6) {
    for (let y = -bounds2.height / 2; y < bounds2.height / 2; y += 6) {
      const pixel = tempContainer.cacheCanvas
        .getContext("2d")
        .getImageData(x + 600, y + 100, 1, 1).data;

      if (pixel[3] > 130) {
        particles.push(new Particle(centerX + x, centerY2 + y, textContainer));
      }
    }
  }
}

function handleMouseMove(event) {
  mouseX = event.stageX;
  mouseY = event.stageY;
}

function update() {
  backgroundParticles.forEach((particle) => {
    particle.update(mouseX, mouseY, stage.canvas.width, stage.canvas.height);
  });

  particles.forEach((particle) => {
    particle.update(mouseX, mouseY, introComplete);
  });

  stage.update();
}

function handleResize() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    const oldWidth = stage.canvas.width;
    const oldHeight = stage.canvas.height;

    stage.canvas.width = window.innerWidth;
    stage.canvas.height = window.innerHeight;

    const scaleX = window.innerWidth / oldWidth;
    const scaleY = window.innerHeight / oldHeight;

    particles.forEach((particle) => {
      particle.homeX *= scaleX;
      particle.homeY *= scaleY;
      particle.x *= scaleX;
      particle.y *= scaleY;
    });

    stage.update();
  }, 250);
}

document.addEventListener("DOMContentLoaded", init);

const THEME_LIST = {
    "linar_1": "Лінійні алгоритми 1",
    "linar_2": "Лінійні алгоритми 2",
    "linar_3": "Лінійні алгоритми 3",
    "branching": "Розгалуження",
    "Cycles_1": "Цикли 1",
    "Cycles_2": "Цикли 2",
    "GCD_LCM": "НСД та НСК"
};

const ICONS_LIST = [
    "./Icons/icon_0.png",
    "./Icons/icon_1.png",
    "./Icons/icon_2.png",
    "./Icons/icon_3.png",
    "./Icons/icon_4.png",
    "./Icons/icon_5.png",
    "./Icons/icon_6.png",
    "./Icons/icon_7.png",
    "./Icons/icon_8.png",
    "./Icons/icon_9.png",
    "./Icons/icon_10.png",
    "./Icons/icon_11.png",
    "./Icons/icon_12.png",
    "./Icons/icon_13.png",
    "./Icons/icon_14.png",
    "./Icons/icon_15.png",
    "./Icons/icon_16.png",
    "./Icons/icon_17.png",
    "./Icons/DuckIcon.gif"
];

const SPECIAL_ICONS_LIST = [
    "./Icons/DuckIcon.gif",
    "./Icons/DuckIcon.gif",
    "./Icons/DuckIcon.gif",
    "./Icons/anime.png",
    "./Icons/dani.jpg",
    "./Icons/Marmot.jpg"
]

//#region PopUpWindow

function PopUpWindow(errorType, icon = "./Icons/ErrorIcon.png") {
    let popUpBox = document.createElement("div");
    popUpBox.setAttribute('class', 'classField_2 popUpBox');

    let popUpBoxIcon = document.createElement("img");
    popUpBoxIcon.src = icon;
    popUpBoxIcon.setAttribute('class', 'popUpBoxIcon');

    let closeButton = document.createElement("button");
    closeButton.innerHTML = `
    <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    >
    <path
        d="M6.2253 4.81108C5.83477 4.42056 5.20161 4.42056 4.81108 4.81108C4.42056 5.20161 4.42056 5.83477 4.81108 6.2253L10.5858 12L4.81114 17.7747C4.42062 18.1652 4.42062 18.7984 4.81114 19.1889C5.20167 19.5794 5.83483 19.5794 6.22535 19.1889L12 13.4142L17.7747 19.1889C18.1652 19.5794 18.7984 19.5794 19.1889 19.1889C19.5794 18.7984 19.5794 18.1652 19.1889 17.7747L13.4142 12L19.189 6.2253C19.5795 5.83477 19.5795 5.20161 19.189 4.81108C18.7985 4.42056 18.1653 4.42056 17.7748 4.81108L12 10.5858L6.2253 4.81108Z"
        fill="white"
    />
    </svg>`;

    closeButton.setAttribute('class', 'popUpBoxButton');
    closeButton.onclick = function () {
        popUpBox.remove();
    };

    popUpBox.appendChild(popUpBoxIcon);
    popUpBox.innerHTML += `<br> <font size=6> ${errorType} </font> <br>`;
    popUpBox.appendChild(closeButton);

    document.body.appendChild(popUpBox);
}
//#endregion

//#region BG Animation
const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');
const styles = getComputedStyle(document.documentElement);
let width, height;

let frameCount = 0;
const interval = 2;

function resize() {
    width = canvas.width = Math.max(document.body.scrollWidth, window.innerWidth);
    height = canvas.height = Math.max(document.body.scrollHeight, window.innerHeight);
}
window.addEventListener('resize', resize);
resize();

function DrawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}

function DrawRoundedPolygon(ctx, x, y, radius, sides, cornerRadius) {
    if (sides < 3) return;
    const angleStep = (Math.PI * 2) / sides;
    const points = [];
    for(let i = 0; i < sides; i++) {
        const angle = i * angleStep - Math.PI / 2;
        points.push({
            x: x + Math.cos(angle) * radius,
            y: y + Math.sin(angle) * radius
        });
    }
    ctx.beginPath();
    for(let i = 0; i < sides; i++) {
        const curr = points[i];
        const next = points[(i + 1) % sides];
        const prev = points[(i - 1 + sides) % sides];

        let vx1 = curr.x - prev.x;
        let vy1 = curr.y - prev.y;
        let len1 = Math.sqrt(vx1*vx1 + vy1*vy1);
        vx1 /= len1;
        vy1 /= len1;

        let vx2 = next.x - curr.x;
        let vy2 = next.y - curr.y;
        let len2 = Math.sqrt(vx2*vx2 + vy2*vy2);
        vx2 /= len2;
        vy2 /= len2;

        const startX = curr.x - vx1 * cornerRadius;
        const startY = curr.y - vy1 * cornerRadius;
        const endX = curr.x + vx2 * cornerRadius;
        const endY = curr.y + vy2 * cornerRadius;

        if(i === 0){
            ctx.moveTo(startX, startY);
        } else {
            ctx.lineTo(startX, startY);
        }
        ctx.quadraticCurveTo(curr.x, curr.y, endX, endY);
    }
    ctx.closePath();
    ctx.fill();
}

class Shape {
    constructor() {
        const sizeMin = 100;
        const sizeMax = 400;
        this.size = Math.random() * (sizeMax - sizeMin) + sizeMin;
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.008;
        this.type = ['circle', 'square', 'triangle', 'pentagon'][Math.floor(Math.random() * 4)];
        this.lastDirChange = Date.now();
        this.dirChangeInterval = Math.random() * 4000 + 3000;

        let rgbString = styles.getPropertyValue("--color_input_main").trim();

        this.color = `rgb(${rgbString})`;
        this.cornerRadius = this.size * 0.2;

        this.blurBase = Math.random() * 7 + 8;
        this.blurDirection = Math.random() < 0.5 ? 1 : -1;
  }

    update() {
        const now = Date.now();
        if (now - this.lastDirChange > this.dirChangeInterval) {
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = (Math.random() - 0.5) * 0.3;
            this.lastDirChange = now;
            this.dirChangeInterval = Math.random() * 4000 + 3000;
        }

        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;

        let rgbString = styles.getPropertyValue("--color_input_main").trim();

        this.color = `rgb(${rgbString})`;

        if (this.x < -this.size) this.x = width + this.size;
        if (this.x > width + this.size) this.x = -this.size;
        if (this.y < -this.size) this.y = height + this.size;
        if (this.y > height + this.size) this.y = -this.size;
  }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;

        // Встановлюємо розмиття через filter
        ctx.filter = `blur(${this.blurBase.toFixed(2)}px)`;

        switch(this.type) {
            case 'circle':
                ctx.beginPath();
                ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
                ctx.fill();
            break;

            case 'square':
                DrawRoundedRect(ctx, -this.size/2, -this.size/2, this.size, this.size, this.cornerRadius);
            break;

            case 'triangle':
                DrawRoundedPolygon(ctx, 0, 0, this.size / 2, 3, this.cornerRadius);
            break;

            case 'pentagon':
                DrawRoundedPolygon(ctx, 0, 0, this.size / 2, 5, this.cornerRadius);
            break;
        }
        ctx.restore();

        // Вимикаємо фільтр, щоб не впливав на інші обʼєкти
        ctx.filter = 'none';
    }
}

const shapes = Array.from({length: (width+height)/2/1000*8}, () => new Shape());

function IsPC() {
    let ua = navigator.userAgent;
    let isMobile = /Mobi|Android/i.test(ua);
    let isTablet = /Tablet|iPad/i.test(ua);

    return !(isMobile || isTablet);
}

function animate() {
    frameCount++;

    if (IsPC() && frameCount % interval === 0) {
        ctx.clearRect(0, 0, width, height);
        shapes.forEach(shape => {
            shape.update();
            shape.draw(ctx);
        });
    }

    requestAnimationFrame(animate);
}

ctx.clearRect(0, 0, width, height);
    shapes.forEach(shape => {
        shape.update();
        shape.draw(ctx);
});

animate();

const root = document.documentElement;

function SetTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    if (theme == "light") {
        document.getElementById("lightButton").style.display = "none";
        document.getElementById("darkButton").style.display = "block";
    } else {
        document.getElementById("lightButton").style.display = "block";
        document.getElementById("darkButton").style.display = "none";
    }
}

const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
    SetTheme(savedTheme);
}

document.getElementById("lightButton").onclick = () => SetTheme("light");
document.getElementById("darkButton").onclick = () => SetTheme("dark");

//#endregion

// * ---------------- With Server --------------- //
const API = 'https://servermanager-plto.onrender.com';

async function SendPost(servername, functionName, argument) {
    return (await fetch(`${API}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            server: servername,
            arguments: { name: functionName, arguments: argument }
        })
    })).json();
}
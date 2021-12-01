const PIXEL_COUNT = 16;

const pixels = Array(PIXEL_COUNT)
  .fill(0)
  .map(() => Array(PIXEL_COUNT).fill(0));
const { ink, paper } = window.location.search
  .replace(/^\?/, "")
  .split("&")
  .reduce((o, c) => ({ ...o, [c.split("=")[0]]: c.split("=")[1] }), {
    ink: "black",
    paper: "white"
  });
let draggingState = 1;
let backgroundUpdate = false;
const selfies = document.querySelector(".selfies");

const canvas = document.querySelector(".canvas");
canvas.style.width = `${PIXEL_COUNT * 20}px`;
canvas.style.backgroundColor = paper;

if ("black" !== ink) {
  const ss = document.createElement("style");
  ss.innerHTML = `.pixel.ink { background-color: ${ink}; }`;
  document.head.appendChild(ss);
}

const bitmap = document.querySelector("#bitmap");
const scale = 4;
const bitmapSize = PIXEL_COUNT * scale;
bitmap.width = bitmap.height = bitmapSize;
bitmap.style.width = bitmap.style.height = `${bitmapSize}px`;

const ctx = bitmap.getContext("2d");
const PIXEL_ELEMENTS = buildBitmapEditor(pixels);

function createPixel() {
  const div = document.createElement("div");
  div.className = "pixel";
  div.addEventListener("mousedown", ({ target }) => {
    draggingState = !target.classList.contains("ink");
    target.classList.toggle("ink", !!draggingState);
  });
  div.addEventListener("mouseover", function (ev) {
    if (1 === ev.buttons) {
      ev.target.classList.toggle("ink", !!draggingState);
    }
  });
  return div;
}

function buildBitmapEditor(pixels) {
  const pixelElements = Array(PIXEL_COUNT * PIXEL_COUNT)
    .fill(0)
    .map(createPixel);
  pixelElements.forEach(el => canvas.appendChild(el));
  return pixelElements;
}

document.getElementById("clear").addEventListener("click", () => {
  PIXEL_ELEMENTS.forEach(({ classList }) => classList.toggle("ink", false));
});

document.getElementById("wallpaper").addEventListener("click", () => {
  const hexMap = Array.from(
    PIXEL_ELEMENTS.map(e => +e.classList.contains("ink"))
      .join("")
      .match(/\d{16}/g)
  )
    .map(n => parseInt(n, 2).toString(16))
    .join(",");
  console.log(
    "%c%s",
    `background-color: ${paper}; color: ${ink}; font-size: 32px;`,
    hexMap
  );
  addPortrait([hexMap, String(Date.now())], true);
});

function clearCanvasRenderer() {
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, bitmapSize, bitmapSize);
}

function getImageUrl(rows) {
  clearCanvasRenderer();
  ctx.fillStyle = ink;

  rows.forEach((row, y) => {
    row.split("").forEach((fill, x) => {
      if (0 < fill) {
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    });
  });

  const url = bitmap.toDataURL("image/png");
  return url;
}

function addPortrait([pixels, label], forceBackgroundUpdate = false) {
  const img = new Image(bitmapSize, bitmapSize);
  img.className = "selfie";
  img.title = label;
  const rows = pixels
    .split(",")
    .map(n => parseInt(n, 16).toString(2).padStart(16, "0"));
  img.src = getImageUrl(rows);
  img.addEventListener("click", () => {
    let i = 0;
    for (let row of rows) {
      for (const pixel of row) {
        PIXEL_ELEMENTS[i++].classList.toggle("ink", 0 < pixel);
      }
    }
  });
  if (!backgroundUpdate || forceBackgroundUpdate) {
    backgroundUpdate = true;
    document.body.style.backgroundImage = `url(${img.src})`;
    const setFavicon = document.createElement("link");
    setFavicon.setAttribute("rel", "shortcut icon");
    setFavicon.setAttribute("href", img.src);
    document.querySelector("head").appendChild(setFavicon);
  }
  if (!forceBackgroundUpdate) {
    selfies.appendChild(img);
  }
}

const portraits = [
  [
    "42,24,4108,2304,1012,821,1902,104,1c8,10,4428,aa44,1082,2100,200,0",
    "2021/11/30; still listening to Tennis and at 13.9568345323741 gallons"
  ],
  [
    "0,0,3c18,1c,424,22,20,40,40,1c0,3c0,3c0,180,2008,1ff0,0",
    "2021/11/16; listening to Swimmer by Tennis on loop"
  ],
  [
    "ff1,300d,4003,8001,4003,381d,27e5,1009,811,241,991,f00f,811,508b,101,ffff",
    "2021/11/8; Playing a lot of metroid now"
  ],
  ["1c0,4280,3c80,300,810,9f0,3800,0,0,18c0,2,202,204,208,190,20", "2021/11/1"],
  [
    "2000,1000,4ffc,2000,7,1ce4,84a,5,4,307,0,784,844,304,1004,4ff8",
    "2021/10/14"
  ],
  [
    "0,2c,7e,e7,1c3,389,714,f20,8c00,880,5150,410,b118,7882,f866,fc10",
    "2021/09/29"
  ],
  [
    "1ff0,3ff8,3ff8,300c,2004,2004,ae75,6216,6086,a085,2184,2024,23c4,1008,810,7e0",
    "2021/09/17"
  ],
  ["0,0,402,ca4,1820,3cc8,2c00,2010,20,40,0,0,30,40,e0,160", "2021/09/16"],
  [
    "ffff,c7e3,8181,0,701c,2830,3458,0,100,440,380,0,0,1c70,2288,100",
    "2021/09/14"
  ],
  ["0,1010,e00f,0,0,200,600,0,0,2010,4008,4004,600c,1c78,380,0", "2021/09/13"],
  [
    "ffff,e003,c001,8000,8e1c,962c,8000,8080,8000,8220,81c0,8000,8410,c3e1,e003,ffff",
    "2021/09/10"
  ],
  [
    "804,7f8,1ffc,3ffc,3ffc,300c,2004,2e74,2214,2104,2186,2425,d3c8,d008,2ff1,1002",
    "2021/09/04"
  ],
  [
    "2,ff4,3ffc,7ffe,7ffe,6006,6006,6002,8e71,8211,4002,2084,2104,21c4,2004,1088",
    "2021/09/03"
  ],
  [
    "3ff8,79c9,6008,6005,4f7c,4215,2044,a049,a0ca,3009,99aa,4c49,261a,53f1,a802,5401",
    "2021/09/02"
  ],
  [
    "07E4,0FF8,1FF8,1FFC,181C,1004,1774,3226,3006,1144,1084,1004,1364,0888,0410,03E0",
    "2021/08/31"
  ]
];

portraits.forEach(tup => addPortrait(tup));
clearCanvasRenderer();

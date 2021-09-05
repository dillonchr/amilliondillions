const PIXEL_COUNT = 16;

const pixels = Array(PIXEL_COUNT)
  .fill(0)
  .map(() => Array(PIXEL_COUNT).fill(0));
const fragment = document.createDocumentFragment();

let draggingState = 1;

for (const row of pixels) {
  for (const pixel of row) {
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
    fragment.appendChild(div);
  }
}

document.getElementById("clear").addEventListener("click", () => {
  Array.from(document.querySelectorAll(".pixel.ink")).forEach(e =>
    e.classList.remove("ink")
  );
});

const { ink, paper } = window.location.search
  .replace(/^\?/, "")
  .split("&")
  .reduce((o, c) => ({ ...o, [c.split("=")[0]]: c.split("=")[1] }), {
    ink: "black",
    paper: "white"
  });

const canvas = document.querySelector(".canvas");
canvas.style.width = `${PIXEL_COUNT * 20}px`;
canvas.style.backgroundColor = paper;
canvas.appendChild(fragment);

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

let backgroundUpdate = false;
const selfies = document.querySelector(".selfies");

function addPortrait([pixels, label]) {
  const img = new Image(bitmapSize, bitmapSize);
  img.className = "selfie";
  img.title = label;
  const rows = pixels
    .split(",")
    .map(n => parseInt(n, 16).toString(2).padStart(16, "0"));
  img.src = getImageUrl(rows);
  img.addEventListener("click", () => {
    const pixelEls = document.querySelectorAll(".pixel");
    let i = 0;
    for (let row of rows) {
      for (const pixel of row) {
        pixelEls[i++].classList.toggle("ink", 0 < pixel);
      }
    }
  });
  if (!backgroundUpdate) {
    backgroundUpdate = true;
    document.body.style.backgroundImage = `url(${img.src})`;
    const setFavicon = document.createElement("link");
    setFavicon.setAttribute("rel", "shortcut icon");
    setFavicon.setAttribute("href", img.src);
    document.querySelector("head").appendChild(setFavicon);
  }
  selfies.appendChild(img);
}

const portraits = [
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

portraits.forEach(addPortrait);
clearCanvasRenderer();

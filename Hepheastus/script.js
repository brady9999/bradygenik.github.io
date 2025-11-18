// get elements
const brushBtn       = document.getElementById('brushBtn');
const eraserBtn      = document.getElementById('eraserBtn');
const fillBtn        = document.getElementById('fillBtn');
const colorPickerBtn = document.getElementById('colorPickerBtn');
const saveBtn        = document.getElementById('saveBtn');
const resizeBtn      = document.getElementById('resizeBtn');
const resetBtn       = document.getElementById('resetBtn');

// resize popup
const popup       = document.getElementById('popup');
const closePopup  = document.getElementById('closePopup');
const applySize   = document.getElementById('applySize');
const widthInput  = document.getElementById('width');
const heightInput = document.getElementById('height');

// canvas setup
const canvas = document.getElementById('MainCanvas');
const ctx    = canvas.getContext('2d');
canvas.style.touchAction = 'none'; // allow finger drawing without scrolling

// brush
const colorPicker = document.getElementById('brushColor');
const sizePicker  = document.getElementById('brushSize');  

// save popup
const savePopup    = document.getElementById('savePopup');
const artNameInput = document.getElementById('artName');
const confirmSave  = document.getElementById('confirmSave');
const cancelSave   = document.getElementById('cancelSave');

// resize
const resizer = document.querySelector('.resizer');
const container = document.querySelector('.resizable-container');


// state
let erasing   = false;
let isDrawing = false;
let lastX     = 0;
let lastY     = 0;
let currentTool = 'brush'; // 'brush', 'eraser', 'fill', 'picker'

// Tool buttons 
brushBtn.addEventListener('click', () => {
    currentTool = 'brush';
    erasing = false;
    eraserBtn.classList.remove('active');
    brushBtn.classList.add('active');
});

eraserBtn.addEventListener('click', () => {
    currentTool = 'eraser';
    erasing = true;
    eraserBtn.classList.add('active');
    brushBtn.classList.remove('active');
});

fillBtn.addEventListener('click', () => {
    currentTool = 'fill';
    fillBtn.classList.add('active');
    colorPickerBtn.classList.remove('active');
    brushBtn.classList.remove('active');
    eraserBtn.classList.remove('active');
});

colorPickerBtn.addEventListener('click', () => {
    currentTool = 'picker';
    colorPickerBtn.classList.add('active');
    fillBtn.classList.remove('active');
    brushBtn.classList.remove('active');
    eraserBtn.classList.remove('active');
});

// save
saveBtn.addEventListener('click', () => {
    artNameInput.value = '';
    savePopup.style.display = 'flex';
});

cancelSave.addEventListener('click', () => {
    savePopup.style.display = 'none';
});

confirmSave.addEventListener('click', () => {
    let fileName = artNameInput.value.trim() || 'My Masterpiece';
    fileName = fileName.replace(/[<>:"/\\|?*]+/g, '');
    const link = document.createElement('a');
    link.download = fileName + '.png';
    link.href = canvas.toDataURL();
    link.click();
    savePopup.style.display = 'none';
});

// resize
resizeBtn.addEventListener('click', () => {
    popup.style.display = 'flex';
});

resetBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 1020;
    canvas.height = 575;
});

closePopup.addEventListener('click', () => popup.style.display = 'none');

applySize.addEventListener('click', () => {
    const minW = 100, maxW = 1050;
    const minH = 100, maxH = 590;
    let w = Math.min(Math.max(parseInt(widthInput.value, 10), minW), maxW);
    let h = Math.min(Math.max(parseInt(heightInput.value, 10), minH), maxH);
    canvas.width = w;
    canvas.height = h;
    widthInput.value = w;
    heightInput.value = h;
    popup.style.display = 'none';
});

// drawing logic
canvas.addEventListener('pointerdown', (e) => {
    if (currentTool === 'fill') {
        floodFill(e.offsetX, e.offsetY, hexToRgba(colorPicker.value));
        return;
    }
    if (currentTool === 'picker') {
        pickColor(e.offsetX, e.offsetY);
        return;
    }
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];

    
});

canvas.addEventListener('pointermove', (e) => {
    if (!isDrawing || currentTool !== 'brush' && currentTool !== 'eraser') return;

    ctx.lineCap = 'round';
    ctx.lineWidth = sizePicker.value;

    if (erasing) {
        ctx.globalCompositeOperation = 'destination-out';
    } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = colorPicker.value;
    }

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();

    [lastX, lastY] = [e.offsetX, e.offsetY];
});

canvas.addEventListener('pointerup', () => isDrawing = false);
canvas.addEventListener('pointerleave', () => isDrawing = false);

// fill tool using flood fill
function floodFill(startX, startY, fillColor) {
    // Ensure integer coordinates
    startX = Math.floor(startX);
    startY = Math.floor(startY);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const targetColor = getPixelColor(data, startX, startY);

    // If target color is same as fill color, skip
    if (colorsMatch(targetColor, fillColor)) return;

    const stack = [[startX, startY]];
    const width = canvas.width;
    const height = canvas.height;

    while (stack.length) {
        const [x, y] = stack.pop();
        const idx = (y * width + x) * 4;
        const currentColor = [data[idx], data[idx+1], data[idx+2], data[idx+3]];

        if (colorsMatch(currentColor, targetColor)) {
            setPixelColor(data, x, y, fillColor);

            if (x > 0) stack.push([x - 1, y]);
            if (x < width - 1) stack.push([x + 1, y]);
            if (y > 0) stack.push([x, y - 1]);
            if (y < height - 1) stack.push([x, y + 1]);
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function getPixelColor(data, x, y) {
    const idx = (y * canvas.width + x) * 4;
    return [data[idx], data[idx+1], data[idx+2], data[idx+3]];
}

function setPixelColor(data, x, y, color) {
    const idx = (y * canvas.width + x) * 4;
    data[idx] = color[0];
    data[idx+1] = color[1];
    data[idx+2] = color[2];
    data[idx+3] = color[3];
}

function colorsMatch(a, b) {
    // Allow a small tolerance for anti-aliasing
    const tolerance = 32;
    return Math.abs(a[0] - b[0]) <= tolerance &&
           Math.abs(a[1] - b[1]) <= tolerance &&
           Math.abs(a[2] - b[2]) <= tolerance &&
           Math.abs(a[3] - b[3]) <= tolerance;
}

function hexToRgba(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return [
        (bigint >> 16) & 255,
        (bigint >> 8) & 255,
        bigint & 255,
        255
    ];
}


function getPixelColor(data, x, y) {
    const idx = (y * canvas.width + x) * 4;
    return [data[idx], data[idx+1], data[idx+2], data[idx+3]];
}

function setPixelColor(data, x, y, color) {
    const idx = (y * canvas.width + x) * 4;
    data[idx] = color[0];
    data[idx+1] = color[1];
    data[idx+2] = color[2];
    data[idx+3] = color[3];
}

function colorsMatch(a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}

function hexToRgba(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return [
        (bigint >> 16) & 255,
        (bigint >> 8) & 255,
        bigint & 255,
        255
    ];
}

// color picker tool
function pickColor(x, y) {
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
    colorPicker.value = hex;
    currentTool = 'brush';
    brushBtn.classList.add('active');
    colorPickerBtn.classList.remove('active');
}

function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

let isResizing = false;

resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    document.body.style.cursor = 'se-resize';
});

window.addEventListener('mousemove', (e) => {
    if (!isResizing) return;

    const rect = container.getBoundingClientRect();
    const newWidth = Math.max(100, e.clientX - rect.left);
    const newHeight = Math.max(100, e.clientY - rect.top);

    // Preserve artwork
    const temp = ctx.getImageData(0, 0, canvas.width, canvas.height);

    canvas.width = newWidth;
    canvas.height = newHeight;

    ctx.putImageData(temp, 0, 0);
});

window.addEventListener('mouseup', () => {
    isResizing = false;
    document.body.style.cursor = 'default';
});


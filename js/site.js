// site.js

// Global Variables
let canvas, ctx;
let isDrawing = false;
let isErasing = false;
let lastX = 0;
let lastY = 0;

// Initialize the application
function init() {    
    // Get canvas and context
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    
    // Set up canvas dimensions
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Set up event listeners
    setupEventListeners();

    // Load saved drawing if available
    loadDrawing();

    // Set default tool to pen
    selectPen();
}

// Resize canvas to fit the viewport
function resizeCanvas() {    
    var sizeChange = 0.9;    
    if (window.innerWidth > 768) {
        sizeChange = 0.7;
    }
    
    const size = Math.min(window.innerWidth * sizeChange, window.innerHeight * sizeChange);
    canvas.width = size;
    canvas.height = size;

    // After resizing, redraw the saved image
    loadDrawing();
}

// Set up all event listeners
function setupEventListeners() {
    // Drawing event listeners
    ['mousedown', 'touchstart'].forEach(event => {
        canvas.addEventListener(event, startDrawing);
    });
    ['mousemove', 'touchmove'].forEach(event => {
        canvas.addEventListener(event, draw);
    });
    ['mouseup', 'mouseout', 'touchend', 'touchcancel'].forEach(event => {
        canvas.addEventListener(event, stopDrawing);
    });

    // Tool buttons event listeners
    document.getElementById('pen').addEventListener('click', selectPen);
    document.getElementById('eraser').addEventListener('click', selectEraser);
    document.getElementById('clear').addEventListener('click', clearCanvas);    
}

// Tool selection functions
function selectPen() {
    isErasing = false;
    document.getElementById('pen').classList.add('active');
    document.getElementById('eraser').classList.remove('active');
}

function selectEraser() {
    isErasing = true;
    document.getElementById('eraser').classList.add('active');
    document.getElementById('pen').classList.remove('active');
}

// Start drawing
function startDrawing(e) {
    e.preventDefault();
    isDrawing = true;
    [lastX, lastY] = getPosition(e);
}

// Draw on the canvas
function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();

    const [x, y] = getPosition(e);
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';

    if (isErasing) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = '#2c3e50'; // Drawing color
    }

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();

    [lastX, lastY] = [x, y];

    // Save the drawing after each stroke
    saveDrawing();
}

// Stop drawing
function stopDrawing(e) {
    e.preventDefault();
    isDrawing = false;
}

// Get the position of the cursor or touch
function getPosition(e) {
    const rect = canvas.getBoundingClientRect();
    let x, y;

    if (e.touches && e.touches.length > 0) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
    } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
    }
    return [x, y];
}

// Clear the canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Remove saved drawing from local storage
    localStorage.removeItem('drawing');

    // Save the cleared state
    saveDrawing();
}

// Save the canvas drawing to local storage
function saveDrawing() {
    const dataURL = canvas.toDataURL();
    localStorage.setItem('drawing', dataURL);
}

// Load the canvas drawing from local storage
function loadDrawing() {
    const dataURL = localStorage.getItem('drawing');
    if (dataURL) {
        const img = new Image();
        img.onload = function () {
            // Clear the canvas and redraw the image
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = dataURL;
    }
}

// Initialize the application when the window loads
window.addEventListener('load', init);
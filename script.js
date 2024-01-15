// Concepts used in the code:
// 1. Geometry - Calculating positions, angles, and sizes.
// 2. Trigonometry - Using trigonometric functions for calculations.
// 3. Perspective - Creating depth and perspective with focal length (FL).
// 4. User Interaction - Responding to mouse events for interaction.
// 5. Canvas Drawing - Rendering particles and background on the canvas.

var PARTICLE_NUM = 2000; // Total particles in the screen
var PARTICLE_BASE_RADIUS = 0.95; // Size and dimantion of particle
var FL = 500; // Focal Length
var DEFAULT_SPEED = 2.5; // Default speed
var BOOST_SPEED = 300; // Boosted speed that caps at 300

var canvas;
var canvasWidth, canvasHeight;
var context;
var centerX, centerY;
var mouseX, mouseY;
var speed = DEFAULT_SPEED;
var targetSpeed = DEFAULT_SPEED;
var particles = [];

// Particle Constructor Function
function Particle(x, y, z) {
  // Initialize a particle with optional x, y, and z coordinates
  // All position of the particle (default to 0 if not provided)
  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;
  this.pastZ = 0; // Initialize the past depth as 0 (used for transitions)
}

// Randomize particles in the canvas
function randomizeParticle(p) {
  p.x = Math.random() * canvasWidth;
  p.y = Math.random() * canvasHeight;
  p.z = Math.random() * 1500 + 800;
  return p;
}

window.addEventListener(
  "load",
  function () {
    canvas = this.document.getElementById("MainView"); // Display in index.html to our canvas

    var resize = function () {
      canvasWidth = canvas.width = window.innerWidth;
      canvasHeight = canvas.height = window.innerHeight;
      centerX = canvasWidth * 0.5;
      centerY = canvasHeight * 0.5;
      context = canvas.getContext("2d"); // Get the 2D rendering context
      context.fillStyle = "rgb(255, 255, 255)"; // Color of particles
    };

    this.document.addEventListener("resize", resize); // Add a listener for window resize
    resize(); // Call the resize function to initialize canvas dimensions

    mouseX = centerX;
    mouseY = centerY;

    for (var i = 0, p; i < PARTICLE_NUM; i++) {
      particles[i] = randomizeParticle(new Particle()); // Initialize and randomize particles
      particles[i].z -= 500 * Math.random(); // Adjust the initial z-coordinate of particles
    }

    // Allow mouse to move around when tilting
    this.document.addEventListener(
      "mousemove",
      function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
      },
      false
    );

    // Fasting tapping or holding mouse speed boosts
    this.document.addEventListener(
      "mousedown",
      function (e) {
        targetSpeed = BOOST_SPEED; // Increase particle speed on mouse down
      },
      false
    );

    // Reset boosted speed to default speed
    this.document.addEventListener(
      "mouseup",
      function (e) {
        targetSpeed = DEFAULT_SPEED; // Reset particle speed on mouse up
      },
      false
    );

    setInterval(loopParticle, 1000 / 60); // Call the 'loopParticle' function approximately 60 times per second
  },
  false
);

// Endless loop of particles
function loopParticle() {
  context.save();
  context.fillStyle = "rgb(0, 0, 0)"; // Set background color
  context.fillRect(0, 0, canvasWidth, canvasHeight); // Clear the canvas
  context.restore();

  speed += (targetSpeed - speed) * 0.01; // Smoothly adjust the particle speed

  var p;
  var cx, cy;
  var rx, ry;
  var f, x, y, r;
  var pf, px, py, pr;
  var a, a1, a2;

  var halfPi = Math.PI * 0.5;
  var atan2 = Math.atan2;
  var cos = Math.cos;
  var sin = Math.sin;

  context.beginPath();
  for (var i = 0; i < PARTICLE_NUM; i++) {
    p = particles[i];

    p.pastZ = p.z;
    p.z -= speed;

    if (p.z <= 0) {
      randomizeParticle(p); // If particle is out of sight, reposition it randomly
      continue;
    }

    // Calculate a modified center based on mouse position
    cx = centerX - (mouseX - centerX) * 1.5;
    cy = centerY - (mouseY - centerY) * 1.5;

    rx = p.x - cx;
    ry = p.y - cy;

    f = FL / p.z; // Calculate a factor based on the focal length and particle depth
    x = cx + rx * f;
    y = cy + ry * f;
    r = PARTICLE_BASE_RADIUS * f; // Adjust particle size based on depth

    pf = FL / p.pastZ; // Calculate a previous factor for smooth transitions
    px = cx + rx * pf;
    py = cy + ry * pf;
    pr = PARTICLE_BASE_RADIUS * pf;

    a = atan2(py - y, py - x);
    a1 = a + halfPi;
    a2 = a - halfPi;

    context.moveTo(px + pr * cos(a1), py + pr * sin(a1)); // Begin drawing particle shape
    context.arc(px, py, pr, a1, a2, true);
    context.lineTo(x + r * cos(a2), y + r * sin(a2));
    context.arc(x, y, r, a2, a1, true);
    context.closePath();
  }
  context.fill(); // Fill the particle shapes
}
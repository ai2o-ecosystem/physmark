# PhysMark Motion Engine Demo

Welcome to **PhysMark Motion Engine**, a declarative animation and physics engine for Markdown documents.

## Type 1: Physics — 3D Rigid Body Simulation

Momentum is the product of an object's mass and velocity: $p = mv$

Let's see it in action — free-fall with bouncing:

```physmark
type: physics
gravity: [0, -9.81, 0]
camera:
  position: [8, 8, 8]
  lookAt: [0, 2, 0]
duration: 8
loop: true
bodies:
  - type: dynamic
    shape: sphere
    position: [0, 8, 0]
    size: 0.5
    color: "#ef4444"
    restitution: 0.8
    friction: 0.3
  - type: static
    shape: box
    position: [0, -0.5, 0]
    size: [10, 1, 10]
    color: "#10b981"
```

## Type 2: Tween — 2D Smooth Animations

Tween animations with easing functions, inspired by anime.js:

```physmark
type: tween
width: 600
height: 200
background: "#0f0c29"
loop: true
targets:
  - id: ball
    shape: circle
    radius: 24
    color: "#ef4444"
    x: 40
    y: 100
timeline:
  - target: ball
    x: 560
    duration: 1200
    easing: easeInOutQuad
    delay: 0
  - target: ball
    x: 40
    duration: 1200
    easing: easeInOutQuad
```

## Type 3: Path — SVG Path Animations

Objects following SVG paths with smooth motion:

```physmark
type: path
width: 600
height: 300
background: "#1a1a2e"
showPath: true
path: "M 50,150 C 150,50 300,250 500,150"
duration: 2000
easing: easeInOutSine
loop: true
objects:
  - shape: circle
    radius: 16
    color: "#6366f1"
  - shape: circle
    radius: 10
    color: "#ef4444"
    offset: 0.3
```

## Advanced Tween — Multiple Objects

Complex timeline with multiple objects and properties:

```physmark
type: tween
width: 600
height: 300
background: "#0f0c29"
loop: true
targets:
  - id: box1
    shape: rect
    width: 60
    height: 60
    color: "#ef4444"
    x: 80
    y: 150
  - id: box2
    shape: rect
    width: 60
    height: 60
    color: "#3b82f6"
    x: 300
    y: 150
  - id: box3
    shape: rect
    width: 60
    height: 60
    color: "#10b981"
    x: 520
    y: 150
timeline:
  - target: box1
    y: 80
    rotation: 3.14159
    duration: 800
    easing: easeOutBounce
  - target: box2
    y: 80
    rotation: 3.14159
    duration: 800
    easing: easeOutBounce
    delay: 200
  - target: box3
    y: 80
    rotation: 3.14159
    duration: 800
    easing: easeOutBounce
    delay: 400
  - target: box1
    y: 150
    rotation: 0
    duration: 800
    easing: easeInOutQuad
  - target: box2
    y: 150
    rotation: 0
    duration: 800
    easing: easeInOutQuad
  - target: box3
    y: 150
    rotation: 0
    duration: 800
    easing: easeInOutQuad
```

## Collision Physics

When two objects collide, momentum is conserved:

$$
m_1 v_1 + m_2 v_2 = m_1 v_1' + m_2 v_2'
$$

```physmark
type: physics
gravity: [0, -9.81, 0]
camera:
  position: [12, 8, 12]
  lookAt: [0, 2, 0]
duration: 10
loop: true
bodies:
  - type: dynamic
    shape: sphere
    position: [0, 8, 0]
    size: 0.5
    color: "#ef4444"
    restitution: 0.8
    friction: 0.3
  - type: dynamic
    shape: box
    position: [2, 5, 0]
    size: [1, 1, 1]
    color: "#3b82f6"
    restitution: 0.6
    friction: 0.5
  - type: static
    shape: box
    position: [0, -0.5, 0]
    size: [10, 1, 10]
    color: "#10b981"
```

## Legacy Support — Ball Rolling Down Ramp

The classic ball-roll preset still works:

```physmark
scene: ball-roll
loop: true
duration: 5
camera:
  position: [12, 9, 12]
  lookAt: [4, 2, 0]
ball:
  radius: 0.35
  color: "#ef4444"
  restitution: 0.25
  friction: 0.6
ramp:
  angle: 22
  length: 9
  width: 2.2
  color: "#6366f1"
```

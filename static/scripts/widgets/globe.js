var DAT = DAT || {};

DAT.Globe = function(container, opts) {
  opts = opts || {};

  var colorFn = opts.colorFn || function(x) {
    var c = new THREE.Color();
    c.setHSL( ( 0.6 - ( x * 0.5 ) ), 1.0, 0.5 );
    return c;
  };

  var Shaders = {
    'earth' : {
      uniforms: {
        'texture': { type: 't', value: null }
      },
      vertexShader: [
        'varying vec3 vNormal;',
        'varying vec2 vUv;',
        'void main() {',
          'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
          'vNormal = normalize( normalMatrix * normal );',
          'vUv = uv;',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform sampler2D texture;',
        'varying vec3 vNormal;',
        'varying vec2 vUv;',
        'void main() {',
          'vec3 diffuse = texture2D( texture, vUv ).xyz;',
          'float intensity = 1.05 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );',
          'vec3 atmosphere = vec3( 1.0, 1.0, 1.0 ) * pow( intensity, 3.0 );',
          'gl_FragColor = vec4( diffuse + atmosphere, 1.0 );',
        '}'
      ].join('\n')
    },
    'atmosphere' : {
      uniforms: {},
      vertexShader: [
        'varying vec3 vNormal;',
        'void main() {',
          'vNormal = normalize( normalMatrix * normal );',
          'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
        '}'
      ].join('\n'),
      fragmentShader: [
        'varying vec3 vNormal;',
        'void main() {',
          'float intensity = pow( 0.8 - dot( vNormal, vec3( 0, 0, 1.0 ) ), 12.0 );',
          'gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 ) * intensity;',
        '}'
      ].join('\n')
    }
  };

  var camera, scene, renderer, w, h;
  var mesh, atmosphere, point;

  var overRenderer;

  var curZoomSpeed = 0;
  var zoomSpeed = 50;

  var mouse = { x: 0, y: 0 }, mouseOnDown = { x: 0, y: 0 };
  var rotation = { x: 0, y: 0 },
      target = { x: Math.PI*3/2, y: Math.PI / 6.0 },
      targetOnDown = { x: 0, y: 0 };

  var distance = 100000, distanceTarget = 100000;
  var padding = 40;
  var PI_HALF = Math.PI / 2;

  function init() {

    container.style.color = '#212121';
    container.style.font = '13px/20px Arial, sans-serif';

    var shader, uniforms, material;
    w = container.offsetWidth || window.innerWidth;
    h = container.offsetHeight || window.innerHeight;

    camera = new THREE.PerspectiveCamera(30, w / h, 1, 10000);
    camera.position.z = distance;

    scene = new THREE.Scene();

    var geometry = new THREE.SphereGeometry(200, 40, 30);

    shader = Shaders['earth'];
    uniforms = THREE.UniformsUtils.clone(shader.uniforms);

    uniforms['texture'].value = THREE.ImageUtils.loadTexture('/static/images/world.jpg');

    material = new THREE.ShaderMaterial({

          uniforms: uniforms,
          vertexShader: shader.vertexShader,
          fragmentShader: shader.fragmentShader

        });

    mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.y = Math.PI;
    scene.add(mesh);

    shader = Shaders['atmosphere'];
    uniforms = THREE.UniformsUtils.clone(shader.uniforms);

    material = new THREE.ShaderMaterial({

          uniforms: uniforms,
          vertexShader: shader.vertexShader,
          fragmentShader: shader.fragmentShader,
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending,
          transparent: true

        });

    mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set( 1.1, 1.1, 1.1 );
    scene.add(mesh);

    geometry = new THREE.CubeGeometry(0.75, 0.75, 1);
    geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,-0.5));

    point = new THREE.Mesh(geometry);

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(w, h);

    renderer.domElement.style.position = 'absolute';

    container.appendChild(renderer.domElement);

    container.addEventListener('mousedown', onMouseDown, false);

    container.addEventListener('mousewheel', onMouseWheel, false);

    document.addEventListener('keydown', onDocumentKeyDown, false);

    window.addEventListener('resize', onWindowResize, false);

    container.addEventListener('mouseover', function() {
      overRenderer = true;
    }, false);

    container.addEventListener('mouseout', function() {
      overRenderer = false;
    }, false);
  }

  function onMouseDown(event) {
    event.preventDefault();

    container.addEventListener('mousemove', onMouseMove, false);
    container.addEventListener('mouseup', onMouseUp, false);
    container.addEventListener('mouseout', onMouseOut, false);

    mouseOnDown.x = - event.clientX;
    mouseOnDown.y = event.clientY;

    targetOnDown.x = target.x;
    targetOnDown.y = target.y;

    container.style.cursor = 'move';
  }

  function onMouseMove(event) {
    mouse.x = - event.clientX;
    mouse.y = event.clientY;

    var zoomDamp = distance/1000;

    target.x = targetOnDown.x + (mouse.x - mouseOnDown.x) * 0.005 * zoomDamp;
    target.y = targetOnDown.y + (mouse.y - mouseOnDown.y) * 0.005 * zoomDamp;

    target.y = target.y > PI_HALF ? PI_HALF : target.y;
    console.log(target.y);
    target.y = target.y < - PI_HALF ? - PI_HALF : target.y;
  }

  function onMouseUp(event) {
    container.removeEventListener('mousemove', onMouseMove, false);
    container.removeEventListener('mouseup', onMouseUp, false);
    container.removeEventListener('mouseout', onMouseOut, false);
    container.style.cursor = 'auto';
  }

  function onMouseOut(event) {
    container.removeEventListener('mousemove', onMouseMove, false);
    container.removeEventListener('mouseup', onMouseUp, false);
    container.removeEventListener('mouseout', onMouseOut, false);
  }

  function onMouseWheel(event) {
    event.preventDefault();
    if (overRenderer) {
      zoom(event.wheelDeltaY * 0.3);
    }
    return false;
  }

  function onDocumentKeyDown(event) {
    switch (event.keyCode) {
      case 38:
        zoom(100);
        event.preventDefault();
        break;
      case 40:
        zoom(-100);
        event.preventDefault();
        break;
    }
  }

  function onWindowResize( event ) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
  }

  function rotate() {
    setInterval(
        function(){
        
            var zoomDamp = distance/1000;
        
            var x = (target.x / 0.005 / zoomDamp) + 1;
            //var y = (target.y / 0.005 / zoomDamp) + 1;

            target.x = x * 0.005 * zoomDamp;
        
            target.y = target.y > PI_HALF ? PI_HALF : target.y;
            target.y = target.y < - PI_HALF ? - PI_HALF : target.y;
        }
        ,100
    );
  } 

  function zoom(delta) {
    distanceTarget -= delta;
    distanceTarget = distanceTarget > 1000 ? 1000 : distanceTarget;
    distanceTarget = distanceTarget < 350 ? 350 : distanceTarget;
  }

  function animate() {
    requestAnimationFrame(animate);
    render();
  }

  function render() {
    zoom(curZoomSpeed);

    rotation.x += (target.x - rotation.x) * 0.1;
    rotation.y += (target.y - rotation.y) * 0.1;
    distance += (distanceTarget - distance) * 0.3;

    camera.position.x = distance * Math.sin(rotation.x) * Math.cos(rotation.y);
    camera.position.y = distance * Math.sin(rotation.y);
    camera.position.z = distance * Math.cos(rotation.x) * Math.cos(rotation.y);

    camera.lookAt(mesh.position);

    renderer.render(scene, camera);
  }

  init();
  this.animate = animate;
  this.renderer = renderer;
  this.scene = scene;
  this.rotate = rotate;

  return this;

};


var container = document.getElementsByTagName('globe')[0];
var globe = new DAT.Globe(container);

$(document).ready(function () {
    if(!Detector.webgl){
        Detector.addGetWebGLMessage();
    } else {
        globe.animate();
        globe.rotate();
    }
});





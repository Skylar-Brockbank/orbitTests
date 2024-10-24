import './style.css'
import planets from './planets'

import * as tjs from "three"

import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'

var running=true;

const scene = new tjs.Scene();
const camera = new tjs.PerspectiveCamera(50,window.innerWidth/window.innerHeight,0.1,1000);

const bg = new tjs.TextureLoader().load("./space.jpg")
bg.colorSpace=tjs.SRGBColorSpace
scene.background=bg

const renderer = new tjs.WebGLRenderer({
  canvas: document.getElementById('frame')
});

renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(200,30,0);

renderer.render(scene,camera);

//simulation Controls
const play = document.getElementById("play")
const pause = document.getElementById("pause")

pause.addEventListener("click",e=>{
  running=false;
})
play.addEventListener("click",e=>{
  running=true;
  animate()
})

//key controls
let movementConstant = 10
window.addEventListener("keydown",e=>{
  if(e.key=='ArrowUp'){
    camera.position.x-=movementConstant
  }else if(e.key=='ArrowDown'){
    camera.position.x+=movementConstant
  }else if(e.key=='ArrowLeft'){
    camera.position.z-=movementConstant
  }else if(e.key=='ArrowRight'){
    camera.position.z+=movementConstant
  }
  else if(e.code=='Space'){
    camera.position.y+=movementConstant
  }
  else if(e.key=='Meta'){
    camera.position.y-=movementConstant
  }
})

//add an object
const geometry = new tjs.SphereGeometry(4,64,64);
const material = new tjs.MeshBasicMaterial({color:0xffffc7})
const sphere = new tjs.Mesh(geometry,material);

scene.add(sphere)

//add a light
const pl= new tjs.PointLight(0xffffff,50000,100);
pl.position.set(0,0,0);
const lighthelper=new tjs.PointLightHelper(pl);
scene.add(lighthelper);

const ambientlight= new tjs.AmbientLight(0x0008ff);
scene.add(ambientlight);
scene.add(pl)

//add orbit controls
const controls = new OrbitControls(camera,renderer.domElement)

//add grid helper
const gridHelper = new tjs.GridHelper(100,100);
// scene.add(gridHelper) 

//planet object
class Planet{
  constructor(mesh,startingRadian,speed,orbitalRadius,orbitCenter,rotationSpeed,elevation){
    this.mesh = mesh;
    this.rad=startingRadian;
    this.speed=speed;
    this.orbitalRadius=orbitalRadius;
    this.orbitCenter=orbitCenter
    this.rotationSpeed=rotationSpeed
    this.elevation=elevation||0
  }
  update(){
    this.rad += this.speed;
    const z = this.orbitCenter.z + (Math.cos(this.rad)*this.orbitalRadius);
    const x = this.orbitCenter.x + (Math.sin(this.rad)*this.orbitalRadius);
    this.mesh.position.set(x,this.elevation,z)
    this.mesh.rotateY(this.rotationSpeed)
  }
}

//create planet objects
function createPlanetMesh(radius, width, height,imagePath){
  const texture = new tjs.TextureLoader().load(imagePath)
  const planet = new tjs.Mesh(
    new tjs.SphereGeometry(radius,width,height),
    new tjs.MeshStandardMaterial({map:texture})
  )
  return planet
}
let planetBank=[]

//drawing a line
function drawCircle(x,y,z,radius,faces){
  const material = new tjs.LineBasicMaterial({color:0xffffff, transparent:true, opacity:0.2})
  let points=[];

  for( let i=0; i<=faces;i++){
    const tx = x+(Math.sin(((Math.PI*2)/faces)*(i+1))*radius)
    const tz = z+(Math.cos(((Math.PI*2)/faces)*(i+1))*radius)
    points.push(new tjs.Vector3(tx,y,tz));
  }

  const geometry = new tjs.BufferGeometry().setFromPoints(points)
  const line= new tjs.Line(geometry,material);
  return line
}


const loadPlanetBank=(planets)=>{
  let output=[]
  for(let p in planets){
    let target=planets[p]
    output.push(
      new Planet(
        createPlanetMesh(
          target.planetRadius,
          target.planetHeight,
          target.planetWidth,
          target.planetTexture
        ),
        target.startingRadian,
        target.speed,
        target.orbitalRadius,
        target.orbiatalCenter,
        target.rotationSpeed,
        target.elevation
      )
    )
  }
  return output
}

planetBank=loadPlanetBank(planets)

for(let p in planetBank){
  scene.add(planetBank[p].mesh)
  scene.add(drawCircle(
    planetBank[p].orbitCenter.x,
    planetBank[p].elevation,
    planetBank[p].orbitCenter.z,
    planetBank[p].orbitalRadius,
    50+planetBank[p].orbitalRadius
  ))
}

function animate(){
  requestAnimationFrame( animate );
  
  renderer.render( scene, camera)
  controls.update();
  if(running){
    for(let p in planetBank){
      planetBank[p].update()
    }
  }
}

animate()
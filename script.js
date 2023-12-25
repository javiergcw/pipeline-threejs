
import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/build/three.module.js';



const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];


const faceMesh = new FaceMesh({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
    });
    faceMesh.setOptions({
        maxNumFaces: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });


function initThreeApp(canvas, w, h) {
    const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
    })

    const fov = 75
    const near = 0.01
    const far = 1000
    const camera = new THREE.PerspectiveCamera(fov, 1280/720, near, far)
    camera.position.z = 2;

    const scene = new THREE.Scene()

    function resize() {
        const width = w || window.innerWidth
        const height = h || window.innerHeight

        renderer.setSize(width, height)
        renderer.setPixelRatio(window.pixelRatio)

        if (camera.isPerspectiveCamera) {
            camera.aspect = width / height
        }
        camera.updateProjectionMatrix()
    }

    function render() {
        renderer.render(scene, camera)
    }

    // initial resize and render
    resize()
    render()


    // add a light
    const color = 0xFFFFFF
    const intensity = 1
    const light = new THREE.DirectionalLight(color, intensity)
    light.position.set(-1, 2, 4)
    scene.add(light)

    // add a box
    const boxWidth = 1
    const boxHeight = 1
    const boxDepth = 1
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth)
    const material = new THREE.MeshPhongMaterial({
        color: 0x44aa88,
        transparent: true,
        opacity: 0.8
    })
    const cube = new THREE.Mesh(geometry, material)
    scene.add(cube)

    return {
        renderer,
        camera,
        scene,
        resize,
        render,
        cube
    }
}


initVideo(videoElement, 320, 180)
const threeApp = initThreeApp(canvasElement,1280,720)
const onResults = function(res){
  
  const landmarks = res.multiFaceLandmarks
  if(!landmarks) return;
  const {x, y, z} = landmarks[0][1];
  // landmarks[0][1] == nose position(face center point)
  // use landmarks xy value to calculate the screen xy
  let vec = new THREE.Vector3();
  let pos = new THREE.Vector3();
  vec.set(
    x * 2 - 1,
    -y * 2 + 1,
    0.5);
  vec.unproject(threeApp.camera);
  vec.sub(threeApp.camera.position).normalize();
  let distance = -threeApp.camera.position.z / vec.z;
  pos.copy(threeApp.camera.position).add(vec.multiplyScalar(distance));
  threeApp.cube.position.x = pos.x;
  threeApp.cube.position.y = pos.y;
  
  // todo
  // got the cube xy then how to get the z value?
  

}

faceMesh.onResults(onResults);

const run = async function(){
  threeApp.render()
  await faceMesh.send({image: videoElement})
  requestAnimationFrame(run)
}

document.getElementById('run').addEventListener('click', run)


function initVideo(video, w, h){
  if ( navigator.mediaDevices && navigator.mediaDevices.getUserMedia ) {

					const constraints = { video: { width: w, height: h, facingMode: 'user' } };

					navigator.mediaDevices.getUserMedia( constraints ).then( function ( stream ) {

						// apply the stream to the video element used in the texture
						video.srcObject = stream;
						video.play();

					} ).catch( function ( error ) {

						console.error( 'Unable to access the camera/webcam.', error );

					} );

				} else {

					console.error( 'MediaDevices interface not available.' );

				}
  
  
}
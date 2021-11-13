const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

renderer.setClearColor(0xb7c3f3, 1)
const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);

const start_position = 3
const end_position = -start_position
const text = document.querySelector(".text");
const TIME_LIMIT = 10
let gameStat = "loading"
let islookingbackward = true

function cube(size, p, roty = 0, color = 0xfbc851) {
    const geometry = new THREE.BoxGeometry(size.w, size.h, size.d);
    const material = new THREE.MeshBasicMaterial({ color: color });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.x = p
    cube.rotation.y = roty
    scene.add(cube);
    return cube;
}

camera.position.z = 5;

const loader = new THREE.GLTFLoader();

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class Doll {
    constructor() {
        loader.load("../models/scene.gltf", (gltf) => {
            scene.add(gltf.scene)
            gltf.scene.scale.set(.4, .4, .4);
            gltf.scene.position.set(0, -1, 0);
            this.doll = gltf.scene;

        })
    }
    lookBackward() {
        gsap.to(this.doll.rotation, { y: -3.15, duration: .5 })
        setTimeout(() => islookingbackward = true, 150)
    }
    lookForward() {
        gsap.to(this.doll.rotation, { y: 0, duration: .5 })
        setTimeout(() => islookingbackward = false, 450)

    }
    async start() {
        this.lookBackward()
        await delay((Math.random() * 1000) + 1000)
        this.lookForward()
        await delay((Math.random() * 750) + 750)
        this.start()
    }
}
function track() {
    cube({ w: start_position * 2 + .2, h: 1.5, d: 1 }, 0, 0, 0xe5a716).position.z = -1;
    cube({ w: .2, h: 1.5, d: 1 }, start_position, -.35)
    cube({ w: .2, h: 1.5, d: 1 }, end_position, .35)
}
track()




class Player {
    constructor() {
        const geometry = new THREE.SphereGeometry(.3, 32, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.z = 1;
        sphere.position.x = start_position;
        scene.add(sphere);
        this.player = sphere
        this.playerinfo = {
            positionX: start_position,
            velocity: 0
        }

    }
    run() {
        this.playerinfo.velocity = 0.01
    }
    stop() {
        // this.playerinfo.velocity = 0
        gsap.to(this.playerinfo, { velocity: 0, duration: 0.5 })

    }
    check() {
        if (this.playerinfo.velocity > 0 && !islookingbackward) {
            // alert("you lost")
            text.innerText = "You Lost!"
            gameStat = "over"
        }
        if (this.playerinfo.positionX < end_position + .4) {
            // alert("you win")
            text.innerText = "You Win!"
            gameStat = "over"

        }
    }
    update() {
        this.check()
        this.playerinfo.positionX -= this.playerinfo.velocity
        this.player.position.x = this.playerinfo.positionX
    }

}

const player = new Player()


let doll = new Doll()

async function init() {
    await delay(500)
    text.innerText = "Starting in 3"
    await delay(500)
    text.innerText = "Starting in 2"
    await delay(500)
    text.innerText = "Starting in 1"
    await delay(500)
    text.innerText = "Go!!"
    startGame()

}
init()

function startGame() {
    gameStat = "started"
    let progressBar = cube({ w: 5, h: .1, d: 1 }, 0)
    progressBar.position.y = 3.35;
    gsap.to(progressBar.scale, { x: 0, duration: TIME_LIMIT, ease: "none" })
    doll.start()
    setTimeout(() => {
        if (gameStat != "over") {
            text.innerText = "You Ran Out Of Time";
        }
    }, TIME_LIMIT * 1000);
}
// setTimeout(() => {
//     doll.start()
// }, 1000);


function animate() {
    if (gameStat == "over") return
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
    player.update()
}
animate();

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight)
}

window.addEventListener('keydown', (e) => {
    if (gameStat !== "started") return
    if (e.key == 'ArrowUp') {
        player.run()
    }
})
window.addEventListener('keyup', (e) => {
    if (e.key == 'ArrowUp') {
        player.stop()
    }
})
// renderer.render(scene, camera);
//Import the THREE.js library
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
// To allow for the camera to move around the scene
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
// To allow for importing the .gltf file
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

//Create a Three.JS Scene
const scene = new THREE.Scene();
//create a new camera with positions and angles
const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.01, 1000);

const FeaturedProducts = {
	list: [],
	add: function(name, description, price, url, image, type="model") {
		let product = {
			name: name,
			description: description,
			price: price,
			url: url,
			image: image,
			type: type
		}
		this.list.push(product);
		console.log("product added");
	}
}

//Keep track of the mouse position, so we can make the eye move
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

let getRendererSize = () => {
    return [window.innerWidth, window.innerHeight]   
}

//Keep the 3D object on a global variable so we can access it later
let object;

//OrbitControls allow the camera to move around the scene
let controls;

let objs = ['mug', 'desk'];
//Set which object to render
let objToRender = objs[Math.floor(Math.random() * objs.length)];

//Instantiate a loader for the .gltf file
const loader = new GLTFLoader();

//Load the file
loader.load(
  `./models/${objToRender}/scene.glb`,
  function (gltf) {
    //If the file is loaded, add it to the scene
    object = gltf.scene;
    scene.add(object);
  },
  function (xhr) {
    //While it is loading, log the progress
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
  function (error) {
    //If there is an error, log it
    console.error(error);
  }
);

//Instantiate a new renderer and set its size
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true}); //Alpha: true allows for the transparent background
renderer.setSize(getRendererSize()[0], getRendererSize()[1]);


//Add the renderer to the DOM
document.getElementById("container3D").appendChild(renderer.domElement);


//Set how far the camera will be from the 3D model
camera.position.z = objToRender === "desk" ? 2 : .25;
camera.position.y = objToRender === "desk" ? 3 : .2;
camera.position.x = objToRender === "desk" ? -1 : 0;

//Add lights to the scene, so we can actually see the 3D model
const topLight = new THREE.DirectionalLight(0xffffff, 1); // (color, intensity)
topLight.position.set(500, 500, 500) //top-left-ish
topLight.castShadow = true;
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x333333, objToRender === "dino" ? 5 : 1);
scene.add(ambientLight);

//This adds controls to the camera, so we can rotate / zoom it with the mouse
if (objToRender) {
  controls = new OrbitControls(camera, renderer.domElement);
}

//Render the scene
function animate() {
  requestAnimationFrame(animate);
  //Here we could add some code to update the scene, adding some automatic movement

//   //Make the eye move
//   if (object) {
//     //I've played with the constants here until it looked good 
//     object.rotation.y = -3 + mouseX / window.innerWidth * 3;
//     object.rotation.x = -1.2 + mouseY * 2.5 / window.innerHeight;
//   }

  controls.update()
  renderer.render(scene, camera);
}

//Add a listener to the window, so we can resize the window and the camera
window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(getRendererSize()[0], getRendererSize()[1]);
});

//add mouse position listener, so we can make the eye move
document.onmousemove = (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
}

let dpcontainer
let elppcontainer

// get products
const get3DProducts = async () => {
	// fetch products from webhook
	fetch("https://hook.us2.make.com/0i71nsgef9qrfmi0w0vsw98ass9u4dbb")
		.then(response => response.json())
		.then(data => {
			console.log(data);
			data.forEach(product => {
				FeaturedProducts.add(product[0], product[1], product[2], product[3], product[4], "model");
			});
		})
		.then(() => {
			FeaturedProducts.list.forEach(product => {
				if (product.type != "model") return
				let card = createCard(product);
				console.log(container3D);
				dpcontainer.appendChild(card);
			})
		});
}
const getDropshipProducts = async () => {
	// fetch products from shopify
	fetch("https://hook.us2.make.com/bjn2rj5o0b5i1tmyun9bdtt3l249wjkx")
		.then(response => response.json())
		.then(data => {
			console.log(data);
			data.forEach(product => {
				FeaturedProducts.add(product[0], product[1], product[2], product[3], product[4], "dropship");
			});
		})
		.then(() => {
			FeaturedProducts.list.forEach(product => {
				if (product.type == "model") return
				let card = createCard(product);
				console.log(container3D);
				elppcontainer.appendChild(card);
			})
		});
}
window.onload = () => {
	dpcontainer = document.querySelector("#digital-products > .card-grid");
	elppcontainer = document.querySelector("#electronics > .card-grid");
	animate();
	get3DProducts()
	getDropshipProducts();
};


// card builder function that takes in a product and returns a card
const createCard = (product) => {
	console.log(product);
	let colmn = document.createElement("div");
	colmn.classList.add("col-sm-4");
	let card = document.createElement("div");
	card.classList.add("card");
	card.innerHTML = `
		<div class="card-body">
			<img src="${product.image}" class="card-img-top" alt="...">
			<h5 class="card-title">${product.name}</h5>
			<p class="card-text">${product.description}</p>
			<p class="card-text">${product.price}</p>
			<a href="${product.url}" class="btn btn-primary">Buy Now</a>
		</div>
	`;
	colmn.appendChild(card);
	return colmn;
}

//Modal popup for links
function openModal(url) {
  const modal = document.getElementById("modal");
  document.getElementById("modal-iframe").src = url;
  modal.style.display = "block";
  modal.classList.add("show");
}

// To close the modal when clicking outside of it or on a close button
window.onclick = function(event) {
	const modal = document.getElementById("modal");
	if (event.target.classList.contains('btn-close')) {
		modal.style.display = "none";
		modal.classList.remove("show");
  }
}

//Event handlers for featured product
document.getElementById("featured-cta").addEventListener("click", () => {
	let links = {
		"mug": "https://payhip.com/b/yvgWP",
		"desk": "https://payhip.com/b/VYua7"
	}
	openModal(links[objToRender]);
	
});

//Event handlers for titles
/*document.getElementById("electronics-title").addEventListener("click", () => {
	openModal("https://xhrfke-hx.myshopify.com/collections/all");

});

document.getElementById("digital-products-title").addEventListener("click", () => {
	openModal("https://payhip.com/Oasi/collection/3d-models");
});*/

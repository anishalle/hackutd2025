'use client';
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls, GLTFLoader, RoomEnvironment } from 'three/examples/jsm/Addons.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

type MarkerDef = {
  id: string;
  label: string;
  color?: string;
  position: [number, number, number]; // world coords you'll set manually
};

// 👇 Pick your 3D points here (world-space). Adjust after you see the model.
let MARKERS: MarkerDef[] = [
  { id: 'fl_tire', label: 'Front Left Tire', color: '#00d0ff', position: [0.3, 1, 0.5] },
  { id: 'fr_tire', label: 'Front Right Tire', color: '#00d0ff', position: [-0.3, 1, 0.5] },
  { id: 'rl_tire', label: 'Rear Left Tire', color: '#00d0ff', position: [0.3, 1, -0.7] },
  { id: 'rr_tire', label: 'Rear Right Tire', color: '#00d0ff', position: [-0.3, 1, -0.7] },
  { id: 'front_wing', label: 'Front Wing', color: '#ff6b00', position: [0, 1, .8] },
  { id: 'rear_wing', label: 'Rear Wing', color: '#ff6b00', position: [0, 1.3, -.8] },
  { id: 'steering', label: 'Steering', color: '#ff6b00', position: [0, 1.2, .12] },
  {id: 'differential', label: 'Differential', color: '#ff6b00', position: [0, 1.1, -0.5] },

];

const ThreeScene: React.FC<{ labels?: Record<string, string> }> = ({ labels = {} }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const markerAnchorsRef = useRef<{ id: string; anchor: THREE.Object3D; label: CSS2DObject; tip: HTMLDivElement }[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    // --- Container sizing ---
    const container = containerRef.current;
    container.style.position = 'relative';
    container.style.width = '74vw'; //74vw
    container.style.height = '74vh'; //74vh
    const width = container.clientWidth;
    const height = container.clientHeight;

    // --- WebGL renderer ---
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // --- CSS2D renderer for HTML overlays ---
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(width, height);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.left = '0';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.style.pointerEvents = 'none'; // let children handle pointer
    container.appendChild(labelRenderer.domElement);

    // --- Scene & environment ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = new RoomEnvironment();
    const envMap = pmrem.fromScene(env, 0.04).texture;
    scene.environment = envMap;

    // --- Camera & controls ---
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = true;
    controls.minDistance = 1;
    controls.maxDistance = 20;

    // --- Lights ---
    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(5, 10, 7.5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // --- Load the GLTF car ---
    let model: THREE.Object3D | null = null;

    const loader = new GLTFLoader();
    loader.load(
      '/F1/gltf/F1.gltf',
      (gltf) => {
        model = gltf.scene;
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
          }
        });

        // Center/scale-ish
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3()).length();
        const center = box.getCenter(new THREE.Vector3());
        model.position.set(0, 1, 0);
        const scale = 2.0 / (size || 1);
        model.scale.setScalar(scale);
        scene.add(model);

        // Frame camera
        const framedDistance = 3 / Math.tan((Math.PI * camera.fov) / 360);
        const direction = new THREE.Vector3(1, 0.5, 1).normalize();
        camera.position.copy(center.clone().add(direction.multiplyScalar(framedDistance)));
        camera.lookAt(center);
        controls.target.copy(center);
        controls.update();
      },
      undefined,
      (error) => {
        console.error('Error loading GLTF:', error);
      }
    );

    // --- Badge helpers ---
    function makeBadge({ text, color = '#00d0ff' }: { text: string; color?: string }) {
      // Zero-size anchor at the 3D point; children are absolutely positioned
      const wrapper = document.createElement('div');
      wrapper.style.position = 'absolute';
      wrapper.style.width = '0';
      wrapper.style.height = '0';
      wrapper.style.pointerEvents = 'auto';
      wrapper.style.userSelect = 'none';

      // Dot centered exactly on the anchor
      const dot = document.createElement('div');
      dot.style.position = 'absolute';
      dot.style.left = '0';
      dot.style.top = '0';
      dot.style.transform = 'translate(-50%, -50%)';
      dot.style.width = '14px';
      dot.style.height = '14px';
      dot.style.borderRadius = '50%';
      dot.style.border = `2px solid ${color}`;
      dot.style.background = 'rgba(255,255,255,0.95)';
      dot.style.boxShadow = '0 0 8px rgba(0,0,0,0.25)';
      wrapper.appendChild(dot);

      // Tip centered horizontally under the dot; supports multi-line text
      const tip = document.createElement('div');
      tip.textContent = text;
      tip.style.position = 'absolute';
      tip.style.left = '0';
      tip.style.top = '0';
      tip.style.transform = 'translate(-50%, 12px)';
      tip.style.whiteSpace = 'pre-line';
      tip.style.textAlign = 'center';
      tip.style.font = '12px/1.2 system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
      tip.style.padding = '6px 8px';
      tip.style.borderRadius = '8px';
      tip.style.background = 'rgba(0,0,0,0.84)';
      tip.style.color = 'white';
      tip.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
      tip.style.opacity = '0';
      tip.style.transition = 'opacity 120ms ease';
      wrapper.appendChild(tip);

      wrapper.addEventListener('mouseenter', () => {
        tip.style.opacity = '1';
      });
      wrapper.addEventListener('mouseleave', () => {
        tip.style.opacity = '0';
      });

      return { wrapper, dot, tip };
    }

    // Simple "behind camera" + clip test to auto-hide
    function isClipped(world: THREE.Vector3) {
      const ndc = world.clone().project(camera);
      return ndc.x < -1 || ndc.x > 1 || ndc.y < -1 || ndc.y > 1 || ndc.z < -1 || ndc.z > 1;
    }

    // --- Create anchors + labels at your manual positions ---
    function initMarkers() {
      markerAnchorsRef.current = [];
      MARKERS.forEach((m) => {
        const anchor = new THREE.Object3D();
        anchor.position.set(...m.position); // your manual world coords
        scene.add(anchor);

        const { wrapper, tip } = makeBadge({ text: m.label, color: m.color });
        const label = new CSS2DObject(wrapper);
        label.layers.set(0);
        anchor.add(label);

        markerAnchorsRef.current.push({ id: m.id, anchor, label, tip });
      });
    }
    initMarkers();
    // Apply initial labels if provided
    if (labels && Object.keys(labels).length > 0) {
      markerAnchorsRef.current.forEach(({ id, tip }) => {
        const next = labels[id];
        if (typeof next === 'string') tip.textContent = next;
      });
      // Keep MARKERS' label fields in sync too
      MARKERS.forEach((m) => {
        const next = labels[m.id];
        if (typeof next === 'string') m.label = next;
      });
    }

    // --- Animate ---
    const onAnimate = () => {
      controls.update();

      // Optional: hide labels when off-screen or behind near/far planes
      for (const { anchor, label } of markerAnchorsRef.current) {
        const world = anchor.getWorldPosition(new THREE.Vector3());
        (label.element as HTMLElement).style.display = isClipped(world) ? 'none' : 'block';
      }

      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    };
    renderer.setAnimationLoop(onAnimate);

    // --- Resize ---
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      labelRenderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // --- Cleanup ---
    return () => {
      renderer.setAnimationLoop(null);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      pmrem.dispose();
      // @ts-ignore optional dispose
      if (typeof (env as any).dispose === 'function') (env as any).dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      if (container.contains(labelRenderer.domElement)) container.removeChild(labelRenderer.domElement);
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    markerAnchorsRef.current.forEach(({ id, tip }) => {
      const next = labels[id];
      if (typeof next === 'string') tip.textContent = next;
    });
    // Also update the source MARKERS array so labels stay consistent for future inits
    MARKERS.forEach((m) => {
      const next = labels[m.id];
      if (typeof next === 'string') m.label = next;
    });
  }, [labels]);

  return <div ref={containerRef} />;
};

export default ThreeScene;
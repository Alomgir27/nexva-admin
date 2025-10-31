"use client";

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeJSBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true 
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0x0a0b0d, 0);
    containerRef.current.appendChild(renderer.domElement);

    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.015,
      color: 0x32f08c,
      transparent: true,
      opacity: 0.8,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Create glowing spheres
    const spheres: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const geometry = new THREE.SphereGeometry(0.3, 32, 32);
      const material = new THREE.MeshBasicMaterial({
        color: i === 0 ? 0x32f08c : i === 1 ? 0x0fdc78 : 0x26a57b,
        transparent: true,
        opacity: 0.3,
      });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 5
      );
      spheres.push(sphere);
      scene.add(sphere);
    }

    camera.position.z = 5;

    // Mouse movement
    let mouseX = 0;
    let mouseY = 0;

    const onMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', onMouseMove);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate particles
      particlesMesh.rotation.y += 0.001;
      particlesMesh.rotation.x += 0.0005;

      // Animate spheres
      spheres.forEach((sphere, index) => {
        sphere.rotation.x += 0.01;
        sphere.rotation.y += 0.01;
        sphere.position.x = Math.sin(Date.now() * 0.001 + index) * 2;
        sphere.position.y = Math.cos(Date.now() * 0.001 + index) * 2;
      });

      // Camera movement based on mouse
      camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
      camera.position.y += (mouseY * 0.5 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0" />;
}


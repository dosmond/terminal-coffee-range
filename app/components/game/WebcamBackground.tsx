"use client";

import { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export const WebcamBackground = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoTextureRef = useRef<THREE.VideoTexture | null>(null);
  const { scene } = useThree();

  useEffect(() => {
    // Create video element
    const video = document.createElement("video");
    video.style.display = "none";
    video.playsInline = true;
    video.autoplay = true;
    video.muted = true;
    videoRef.current = video;

    // Get user media
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: { width: 1280, height: 720 } })
        .then((stream) => {
          video.srcObject = stream;
          video.play();

          // Create video texture
          const videoTexture = new THREE.VideoTexture(video);
          videoTexture.minFilter = THREE.LinearFilter;
          videoTexture.magFilter = THREE.LinearFilter;
          videoTexture.format = THREE.RGBFormat;
          videoTextureRef.current = videoTexture;

          // Add video texture to scene background
          const aspectRatio = window.innerWidth / window.innerHeight;
          const videoAspectRatio = 16 / 9; // Assuming 16:9 webcam

          // Adjust scale based on aspect ratio
          const scale =
            videoAspectRatio > aspectRatio
              ? [1, videoAspectRatio / aspectRatio, 1]
              : [aspectRatio / videoAspectRatio, 1, 1];

          console.log("Webcam started", {
            aspectRatio,
            videoAspectRatio,
            scale,
          });
        })
        .catch((error) => {
          console.error("Unable to access webcam:", error);
        });
    }

    // Clean up on unmount
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [scene]);

  return (
    <mesh position={[0, 0, -20]} scale={[30, 20, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial side={THREE.DoubleSide}>
        {videoTextureRef.current && (
          <videoTexture attach="map" args={[videoRef.current!]} />
        )}
      </meshBasicMaterial>
    </mesh>
  );
};

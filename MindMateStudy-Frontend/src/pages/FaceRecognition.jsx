/* eslint-disable no-unused-vars */
import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import * as faceapi from "face-api.js";

const FaceRecognition = forwardRef(
  (
    {
      videoWidth = 720,
      videoHeight = 560,
      intervalTime = 1000,
      showDetails = true,
      className = "",
    },
    ref
  ) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isModelsLoaded, setIsModelsLoaded] = useState(false);
    const [faceData, setFaceData] = useState([]);

    useImperativeHandle(ref, () => ({
      getFaceData: () => faceData,
    }));

    useEffect(() => {
      const loadModels = async () => {
        const MODEL_URL = "/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
          faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
        ]);
        setIsModelsLoaded(true);
      };

      loadModels();
    }, []);

    useEffect(() => {
      let localStream;

      if (isModelsLoaded) {
        startVideo();
      }

      return () => {
        if (localStream) {
          const tracks = localStream.getTracks();
          tracks.forEach((track) => track.stop());
        }
      };

      async function startVideo() {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          const { current: videoElement } = videoRef;

          if (videoElement) {
            videoElement.srcObject = stream;
            localStream = stream;
          }
        } catch (err) {
          console.error("Error accessing webcam:", err);
        }
      }
    }, [isModelsLoaded]);

    const handleVideoOnPlay = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas) return;

      const updateCanvasSize = () => {
        const { width, height } = video.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
        faceapi.matchDimensions(canvas, { width, height });
      };

      updateCanvasSize();
      window.addEventListener("resize", updateCanvasSize);

      const interval = setInterval(async () => {
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions()
          .withAgeAndGender();

        const dims = {
          width: canvas.width,
          height: canvas.height,
        };

        const resizedDetections = faceapi.resizeResults(detections, dims);

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, dims.width, dims.height);

        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

        const data = resizedDetections.map((det, i) => {
          const { detection, expressions, age, gender, genderProbability } = det;
          const { x, y, width, height } = detection.box;

          const expressionData = Object.entries(expressions).map(
            ([key, value]) => ({
              name: key,
              confidence: (value * 100).toFixed(1),
            })
          );

          return {
            faceNumber: i + 1,
            confidence: (detection.score * 100).toFixed(1),
            age: age.toFixed(1),
            gender,
            genderConfidence: (genderProbability * 100).toFixed(1),
            expressions: expressionData,
            box: {
              x: x.toFixed(1),
              y: y.toFixed(1),
              width: width.toFixed(1),
              height: height.toFixed(1),
            },
          };
        });

        setFaceData(data);
      }, intervalTime);

      return () => {
        clearInterval(interval);
        window.removeEventListener("resize", updateCanvasSize);
      };
    };

    return (
      <div className={`w-full ${className}`}>
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            onPlay={handleVideoOnPlay}
            className="w-full h-full object-cover "
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full"
          />
        </div>
      </div>
    );
  }
);

export default FaceRecognition;
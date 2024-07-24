"use client";

import React, { useRef, useEffect, useState } from "react";

const CanvasDraw = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [isDrawing, setIsDrawing] = useState(false);
	const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

	useEffect(() => {
		if (canvasRef.current) {
			const renderCtx = canvasRef.current.getContext("2d");
			setContext(renderCtx);
		}
	}, []);

	const startDrawing = (event: React.MouseEvent) => {
		if (context) {
			context.beginPath();
			context.moveTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
			setIsDrawing(true);
		}
	};

	const draw = (event: React.MouseEvent) => {
		if (isDrawing && context) {
			context.lineTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
			context.stroke();
		}
	};

	const stopDrawing = () => {
		if (context) {
			context.closePath();
			setIsDrawing(false);
		}
	};

	return (
		<canvas
			ref={canvasRef}
			width="800"
			height="600"
			style={{ border: "1px solid black" }}
			onMouseDown={startDrawing}
			onMouseMove={draw}
			onMouseUp={stopDrawing}
			onMouseLeave={stopDrawing}
		></canvas>
	);
};

export default CanvasDraw;

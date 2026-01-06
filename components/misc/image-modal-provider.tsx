"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function ImageModalProvider() {
	const [modalImg, setModalImg] = useState(null);

	useEffect(() => {
		const handleGlobalClick = (e) => {
			const target = e.target;
			if (target.tagName === "IMG" && target.closest("p")) {
				setModalImg(target.src);
			}
		};

		const handleKeyDown = (e) => {
			if (e.key === "Escape") setModalImg(null);
		};

		document.addEventListener("click", handleGlobalClick);
		window.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("click", handleGlobalClick);
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, []);

	if (!modalImg) return null;

	return (
		<div
			className="modal-overlay fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-zoom-out"
			onClick={() => setModalImg(null)}
		>
			<div className="relative max-w-[90vw] max-h-[90vh]">
				<Image
					src={modalImg}
					className="modal-image w-full h-full object-contain rounded-sm shadow-2xl"
					alt="Enlarged"
				/>
				<p className="absolute -bottom-10 left-0 text-white/60 text-sm">
					Press ESC to close
				</p>
			</div>
		</div>
	);
}

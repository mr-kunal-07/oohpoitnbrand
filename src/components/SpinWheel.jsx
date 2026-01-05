import { useRef, useState } from "react";
import toast from "react-hot-toast";

const SpinWheel = ({ pricePerScan }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const wheelRef = useRef(null);
  console.log(pricePerScan);

  // Define the prizes with their respective probabilities
  const segments = [
    { name: "1st Prize", probability: 10 },
    { name: "2nd Prize", probability: 15 },
    { name: "3rd Prize", probability: 20 },
    { name: "4th Prize", probability: 25 },
    { name: "5th Prize", probability: 30 },
  ];

  // Generate the adjusted segments based on probabilities
  const adjustedSegments = [];
  segments.forEach((segment) => {
    const count = Math.floor(segment.probability / 5); // Adjust for a scale of 5
    for (let i = 0; i < count; i++) {
      adjustedSegments.push(segment.name);
    }
  });

  const handleSpin = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    const randomDegrees = Math.floor(Math.random() * 360 + 3600); // spin at least 10 full rotations
    wheelRef.current.style.transition = "transform 5s ease-out";
    wheelRef.current.style.transform = `rotate(${randomDegrees}deg)`;

    setTimeout(() => {
      setIsSpinning(false);
      // Determine the winning segment
      const winningSegmentIndex = Math.floor(
        (randomDegrees % 360) / (360 / adjustedSegments.length)
      );
      toast.success(`You won: ${adjustedSegments[winningSegmentIndex]}`);
      // Reset the wheel
      wheelRef.current.style.transition = "none";
      wheelRef.current.style.transform = "rotate(0deg)";
    }, 5000); // match with the spin duration
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div
          ref={wheelRef}
          className="w-64 h-64 rounded-full border-8 border-gray-800 shadow-lg flex items-center justify-center bg-gradient-to-r from-blue-300 to-blue-600"
          style={{ transformOrigin: "center center", overflow: "hidden" }}
        >
          <div className="absolute w-full h-full rounded-full bg-white">
            <div className="relative">
              {adjustedSegments.map((segment, index) => (
                <div
                  key={index}
                  className={`absolute w-1/2 h-1/2 border border-gray-800`}
                  style={{
                    transform: `rotate(${
                      (360 / adjustedSegments.length) * index
                    }deg)`,
                    clipPath: "polygon(0 0, 100% 0, 100% 100%)",
                    backgroundColor: index % 2 === 0 ? "#4A90E2" : "#50E3C2", // Alternating colors
                  }}
                >
                  <span
                    className="absolute text-white font-bold"
                    style={{
                      transform:
                        "rotate(-" +
                        (360 / adjustedSegments.length) * index +
                        "deg)",
                      left: "50%",
                      top: "25%",
                      transformOrigin: "center",
                    }}
                  >
                    {segment}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={handleSpin}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        disabled={isSpinning}
      >
        {isSpinning ? "Spinning..." : "Spin the Wheel!"}
      </button>
    </div>
  );
};

export default SpinWheel;

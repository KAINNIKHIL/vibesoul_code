import React, { useEffect, useState } from "react";
import "./storyProgress.css"; 

const StoryViewer = ({ activeStoryGroup = [], onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentStory = activeStoryGroup[currentIndex];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentIndex < activeStoryGroup.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        onClose();
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < activeStoryGroup.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  if (!currentStory) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center h-screen"
      onClick={handleNext}
    >
      <div className="w-full max-w-md h-full bg-black relative overflow-hidden rounded-xl">

        {/* Progress bars */}
        <div className="absolute top-0 left-0 right-0 p-3 flex gap-1 z-10">
          {activeStoryGroup.map((_, index) => (
            <div key={index} className="flex-1 h-1 bg-white/30 rounded overflow-hidden">
              <div
                className={`h-full bg-white ${
                  index === currentIndex ? "animate-progress" : ""
                }`}
              ></div>
            </div>
          ))}
        </div>
<div className="w-full h-full flex items-center justify-center">
        {/* Story image */}
        <img
          src={currentStory.mediaUrl}
          className="max-h-full max-w-full object-contain "
          alt="story"
        /></div>

        {/* User info */}
        <div className="absolute top-3 left-3 flex items-center gap-2 text-white z-10">
          <img
            src={currentStory.profilePicUrl || "/default-avatar.png"}
            className="w-8 h-8 rounded-full"
          />
          <span className="font-semibold">{currentStory.username}</span>
        </div>

        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-3 right-3 text-white text-2xl z-10"
        >
          ✕
        </button>

        {/* Navigation zones */}
        <div className="absolute inset-0 flex z-0">
          <div onClick={(e) => { e.stopPropagation(); handlePrev(); }} className="w-1/2 h-full cursor-pointer" />
          <div onClick={(e) => { e.stopPropagation(); handleNext(); }} className="w-1/2 h-full cursor-pointer" />
        </div>
      </div>
    </div>
  );
};
export default StoryViewer;
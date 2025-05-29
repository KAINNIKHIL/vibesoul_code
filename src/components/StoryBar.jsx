import React from "react";

const StoryBar = ({ stories, onStoryClick }) => {
    return (
      <div className="flex overflow-x-auto space-x-4 py-2 px-4 bg-white dark:bg-gray-900 rounded-lg">
        {stories.map((story) => (
          <div key={story.$id} className="flex flex-col items-center">
            <div
              className="w-14 h-14 rounded-full border-2 border-pink-500 p-1 cursor-pointer"
              onClick={() => onStoryClick(story)}
            >
              <img
                src={story.profilePicUrl || "/default-avatar.png"}
                className="rounded-full w-full h-full object-cover"
              />
            </div>
            <span className="text-xs text-center mt-1 truncate max-w-[3.5rem]">
              {story.username}
            </span>
          </div>
        ))}
      </div>
    );
  };
  

export default StoryBar;

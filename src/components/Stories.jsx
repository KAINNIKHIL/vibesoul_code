import { useState } from "react";
import StoryPreviewBar from "./StoryPreviewBar";
import StoryViewer from "./StoryViewer";
import StoryUploader from "./StoryUploader";

const Stories = ({currentUser}) => {
  const [activeGroup, setActiveGroup] = useState(null);


  return (
    <>
    <div className="flex items-center gap-4 px-4 py-2 overflow-x-auto">
    <StoryUploader currentUser={currentUser} />
      <StoryPreviewBar
        onStoryClick={(group) => {
          setActiveGroup(group.items); 
        }}
      /></div>

      {activeGroup && (
        <StoryViewer
          activeStoryGroup={activeGroup}
          onClose={() => setActiveGroup(null)}
        />
      )}
    </>
  );
};

export default Stories;

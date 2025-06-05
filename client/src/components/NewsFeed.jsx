import React from "react";
import News from "./newsfeed/News";
import Loding from "./newsfeed/Loding";

const NewsFeed = () => {

    
  return (
    <>
      <div className="w-full h-screen overflow-y-scroll  bg-gray-100 ">
        <div className="flex flex-col gap-4 p-4 max-w-[500px] m-auto bg-white shadow-md rounded-lg ">
          <h3 className="font-bold">What's happening today ?</h3>

          <textarea
            className="w-full h-24 p-2 rounded border border-gray-300 outline-0"
            name="description"
            id="description"
            placeholder="Share,update and achivement or shout out..."
          ></textarea>

          <div className="w-full h-7 flex justify-evenly items-center gap-4">
            <div className="flex action-item gap-3 w-[80%] text-gray-500">
              <span className="material-symbols-outlined">Image</span>
              <span className="material-symbols-outlined">video_file</span>
              <span className="material-symbols-outlined">link</span>
            </div>
            <button className="px-3.5 py-1 w-[10%] bg-blue-500 text-white rounded">
              Post
            </button>
          </div>
        </div>

        {/* here is news */}
        <News />    
        <News />    
        <News />    
        <News />    
        <News />    
        <News />    
        <News />    
        <News />    
        <News />    
        <News />    
        <News />    
        <News />
        <News />
        <News />
        <Loding/>
      </div>
    </>
  );
};

export default NewsFeed;

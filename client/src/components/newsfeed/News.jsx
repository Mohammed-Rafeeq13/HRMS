import React from 'react'

const News = () => {
  return (
    <div>
       <div className=" gap-4 p-4 max-w-[500px] m-auto bg-white shadow-md rounded-lg mt-4">
          <div className="flex gap-3">
            <div>
              <img
                className="rounded-[100%] h-[50px] w-[50px] border-[1px] border-gray-300"
                src="https://picsum.photos/400/300?random=101"
                alt=""
              />
            </div>
            <div>
              <div className="user-name font-semibold">User Name</div>
              <div className="user-time text-gray-500">2 hours ago</div>
            </div>
          </div>
          <div className="ancizar-sans-italic">
            This is a sample post description that might be longer than 80
            characters, so it will be truncated.
          </div>
          <center>
            <img
              src="https://picsum.photos/450/400?random=102"
              height={400}
              width={450}
              alt=""
            />
          </center>
          <div className="flex =mt-2   text-gray-500 mt-[10px]">
            <div className="action-item flex items-center gap-1 mr-4">
              <span className="material-symbols-outlined">thumb_up</span>
              <span className="action-count">10</span>
              <span className="action-label">Like</span>
            </div>
            <div className="action-item flex items-center gap-1">
              <span className="material-symbols-outlined">comment</span>
              <span className="action-count">5</span>
              <span className="action-label">Comment</span>
            </div>
          </div>
          <hr />
        </div>
    </div>
  )
}

export default News

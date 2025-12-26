import React,{useState} from "react";
import { X,ImageIcon } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";


function CommunityComposer({ setCurrentPage }) {
    const [postContent, setPostContent] = useState('');
    const [postType, setPostType] = useState('announcement');
    const [linkedListing, setLinkedListing] = useState('');
  
    const handlePost = () => {
    toast.success('Post published to community feed!',{containerId:"communityComposer"});
      setCurrentPage('feed');
    };
  
    return (
   <>
   <ToastContainer containerId={"communityComposer"}/>
   


   <div className="min-h-screen pb-20">
        <header className="bg-white shadow-sm">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button onClick={() => setCurrentPage('dashboard')} className="text-gray-600 hover:text-[#024a47]">
                  <X className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold text-[#024a47]">Create Post</h1>
              </div>
              <button
                onClick={handlePost}
                disabled={!postContent.trim()}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  postContent.trim()
                    ? 'bg-[#024a47] text-white hover:bg-[#035d59]'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                Publish
              </button>
            </div>
          </div>
        </header>
  
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6">
         
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Post Type</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'announcement', label: 'Announcement', icon: '📢' },
                  { value: 'tip', label: 'Tip', icon: '💡' },
                  { value: 'update', label: 'Update', icon: '🔔' }
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setPostType(type.value)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      postType === type.value
                        ? 'border-[#024a47] bg-[#024a4708]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className="text-sm font-semibold">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>
  
           
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Content</label>
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Share something with your community..."
                rows="8"
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47] resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500">{postContent.length} characters</span>
                <div className="flex space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                    <ImageIcon className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
  
        
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Link to Listing (Optional)</label>
              <select
                value={linkedListing}
                onChange={(e) => setLinkedListing(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
              >
                <option value="">No linked listing</option>
                <option value="1">Samsung Refrigerator</option>
                <option value="2">LG Washing Machine</option>
                <option value="3">Whirlpool Dishwasher</option>
              </select>
            </div>
  
         
            {postContent && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Preview</h3>
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-[#024a47] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">V</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Your Vendor Name</p>
                      <p className="text-xs text-gray-500">Just now</p>
                    </div>
                  </div>
                  <p className="text-gray-800 whitespace-pre-wrap">{postContent}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
   </>
    );
  }
  

  export default CommunityComposer
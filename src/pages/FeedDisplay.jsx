import React, { useState, useEffect, useRef } from "react";
import { X,Search,Filter,Zap,Eye,Heart,MessageSquare,Share2 } from "lucide-react";

function FeedDisplay({ setCurrentPage }) {
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
  
    const feedItems = [
      {
        id: 1,
        type: 'listing',
        vendor: 'HomeTech Solutions',
        title: 'Samsung 28 Cu Ft French Door Refrigerator',
        description: 'Brand new stainless steel finish with smart features',
        price: '$89/mo',
        views: 1245,
        likes: 89,
        boosted: true,
        timestamp: '2 hours ago',
        image: '🧊'
      },
      {
        id: 2,
        type: 'post',
        vendor: 'ApplianceHub',
        content: '🎉 New arrivals! Check out our latest collection of energy-efficient washing machines. Perfect for eco-conscious families!',
        likes: 45,
        comments: 12,
        timestamp: '5 hours ago'
      },
      {
        id: 3,
        type: 'listing',
        vendor: 'Quality Rentals',
        title: 'LG Front Load Washer & Dryer Set',
        description: 'High-efficiency combo, perfect for apartments',
        price: '$129/mo',
        views: 892,
        likes: 67,
        boosted: false,
        timestamp: '1 day ago',
        image: '🧺'
      },
      {
        id: 4,
        type: 'post',
        vendor: 'HomeTech Solutions',
        content: '💡 Pro Tip: Regular maintenance extends appliance life by 3-5 years! Here are our top 5 maintenance tips...',
        likes: 123,
        comments: 34,
        timestamp: '2 days ago'
      }
    ];
  
    const filteredItems = feedItems.filter(item => {
      if (filter === 'listings') return item.type === 'listing';
      if (filter === 'posts') return item.type === 'post';
      return true;
    });
  
    return (
      <div className="min-h-screen pb-20">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <button onClick={() => setCurrentPage('dashboard')} className="text-gray-600 hover:text-[#024a47]">
                  <X className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold text-[#024a47]">Community Feed</h1>
              </div>
            </div>
  
      
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search listings and posts..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
                />
              </div>
              <button className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100">
                <Filter className="w-5 h-5 text-gray-600" />
              </button>
            </div>
  
            <div className="flex space-x-2 mt-3">
              {['all', 'listings', 'posts'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    filter === f
                      ? 'bg-[#024a47] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </header>
  
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#024a47] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{item.vendor[0]}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{item.vendor}</p>
                      <p className="text-xs text-gray-500">{item.timestamp}</p>
                    </div>
                  </div>
                  {item.boosted && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold flex items-center">
                      <Zap className="w-3 h-3 mr-1" />
                      Boosted
                    </span>
                  )}
                </div>
  
              
                {item.type === 'listing' ? (
                  <div>
                    <div className="px-4 pb-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-4xl">
                          {item.image}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 mb-1">{item.title}</h3>
                          <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                          <p className="text-2xl font-bold text-[#024a47]">{item.price}</p>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 bg-gray-50 flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {item.views}
                        </span>
                        <span className="flex items-center">
                          <Heart className="w-4 h-4 mr-1" />
                          {item.likes}
                        </span>
                      </div>
                      <button className="text-[#024a47] font-semibold hover:underline">
                        View Details
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="px-4 pb-4">
                      <p className="text-gray-800 whitespace-pre-wrap">{item.content}</p>
                    </div>
                    <div className="px-4 py-3 bg-gray-50 flex items-center space-x-6 text-sm text-gray-600">
                      <button className="flex items-center hover:text-[#024a47]">
                        <Heart className="w-4 h-4 mr-1" />
                        {item.likes}
                      </button>
                      <button className="flex items-center hover:text-[#024a47]">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        {item.comments}
                      </button>
                      <button className="flex items-center hover:text-[#024a47]">
                        <Share2 className="w-4 h-4 mr-1" />
                        Share
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
  
       
          <div className="text-center mt-8">
            <button className="px-6 py-3 bg-white border-2 border-[#024a47] text-[#024a47] rounded-lg font-semibold hover:bg-[#024a47] hover:text-white transition-all">
              Load More
            </button>
          </div>
        </div>
      </div>
    );
  }



  export default FeedDisplay;
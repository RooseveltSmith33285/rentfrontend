import React, { useEffect,useState } from 'react';
import { ToastContainer,toast } from 'react-toastify';
import axios from 'axios';
import { BASE_URL } from '../baseUrl';
import { useNavigate } from 'react-router-dom';

const OrderConfirmation = () => {

    const [order,setOrder]=useState([])
const [totalCost,setTotalCost]=useState()

    useEffect(()=>{
getOrders();
    },[])

    const navigate=useNavigate();
const getOrders=async()=>{
    try{
        let token=localStorage.getItem('token')
let response=await axios.get(`${BASE_URL}/getRecentOrder`,{
    headers:{
        Authorization:`Bearer ${token}`
    }
})

console.log(response.data)
setOrder(response.data.data)
let totalPrice=0;
response.data.data.items?.map((val,i)=>{


totalPrice=val?.monthly_price+totalPrice
})





setTotalCost(totalPrice)
toast.dismiss();
toast.success("Order placed sucessfully",{containerId:"confirmationPage"})
setTimeout(()=>{
navigate('/dashboard')
},2700)
    }catch(e){
console.log(e.message)
    }
}

  return (
    <>
    <ToastContainer containerId={"confirmationPage"}/>

    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      
        <div className="bg-white p-6 text-center">
          <div className="w-20 h-20 bg-teal-800 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <svg 
              className="w-10 h-10 text-white" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-teal-800 mb-2">RentSimple</h1>
          <p className="text-lg text-gray-600">Rent-to-Own Appliance</p>
        </div>

        
        <div className="px-6 pb-8">
          <h2 className="text-2xl font-bold text-teal-800 text-center mb-8">
            Order Confirmation
          </h2>

          <div className="space-y-6">
           
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                Confirmation Number
              </h3>
              <p className="text-xl font-mono text-gray-900">{order?._id}</p>
            </div>

           
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                Items Ordered:
              </h3>
              <p className="text-xl text-gray-900">{order?.items?.length}</p>
            </div>

       
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                Total Payment Today:
              </h3>
              <p className="text-xl font-bold text-gray-900">${order?.items?.length==1?(totalCost+25)?.toString():totalCost?.toString()}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                Total Per Month:
              </h3>
              <p className="text-xl font-bold text-gray-900">${totalCost?.toString()}</p>
            </div>

          
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                Delivery:
              </h3>
              <p className="text-xl text-gray-900">
  {order?.deliveryDate && new Date(order.deliveryDate).toLocaleDateString()}
</p>
            </div>

          
            <div className="pt-4 border-t border-gray-200">
              <p className="text-center text-gray-700">
                Thank you, this is your confirmation.
              </p>
            </div>
          </div>
        </div>

       
        <div className="bg-gray-50 px-6 py-6 flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-300 rounded-full overflow-hidden flex-shrink-0">
            <img 
              src={'./technican.jpg'} 
              alt="Roosevelt Smith"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900">
              Roosevelt Smith
            </h4>
            <p className="text-sm text-gray-600">
              Certified RentSimple Technician
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default OrderConfirmation;
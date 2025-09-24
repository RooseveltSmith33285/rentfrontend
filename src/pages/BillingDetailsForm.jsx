import { useState, useRef, useEffect } from "react";
import { Lock, CreditCard, Calendar, MoreHorizontal, CheckSquare, Check, X, FileText, PenTool, RotateCcw, Download } from "lucide-react";
import React from "react";
import {
  PaymentElement,
  Elements,
  ElementsConsumer,
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from '@stripe/react-stripe-js';
import axios from "axios";
import { BASE_URL } from "../baseUrl";
import { useNavigate } from "react-router-dom";
const RefrigeratorIcon = () => (
  <svg className="w-16 h-16 text-[#024a47]" viewBox="0 0 100 100" fill="currentColor">
    <rect x="25" y="10" width="50" height="80" rx="4" fill="currentColor"/>
    <rect x="28" y="13" width="44" height="35" fill="white" opacity="0.1"/>
    <rect x="28" y="52" width="44" height="35" fill="white" opacity="0.1"/>
    <rect x="30" y="20" width="3" height="15" rx="1.5" fill="white"/>
    <rect x="30" y="60" width="3" height="15" rx="1.5" fill="white"/>
    <line x1="25" y1="48" x2="75" y2="48" stroke="white" strokeWidth="2"/>
  </svg>
);

const WasherDryerIcon = () => (
  <svg className="w-16 h-16 text-[#024a47]" viewBox="0 0 100 100" fill="currentColor">
    <rect x="15" y="10" width="70" height="80" rx="6" fill="currentColor"/>
    <rect x="20" y="15" width="60" height="8" rx="4" fill="white" opacity="0.3"/>
    <circle cx="30" cy="30" r="2" fill="white"/>
    <circle cx="40" cy="30" r="2" fill="white"/>
    <rect x="55" y="25" width="20" height="6" rx="3" fill="white"/>
    <circle cx="50" cy="55" r="20" fill="none" stroke="white" strokeWidth="3"/>
    <path d="M45 50 Q50 45 55 50 Q50 55 45 50" fill="white"/>
  </svg>
);

const DeepFreezerIcon = () => (
  <svg className="w-16 h-16 text-[#024a47]" viewBox="0 0 100 100" fill="currentColor">
    <rect x="20" y="25" width="60" height="65" rx="4" fill="currentColor"/>
    <rect x="25" y="30" width="50" height="8" rx="4" fill="white" opacity="0.3"/>
    <rect x="30" y="45" width="3" height="12" rx="1.5" fill="white"/>
    <rect x="67" y="45" width="3" height="12" rx="1.5" fill="white"/>
  </svg>
);

// Digital Signature Component
const DigitalSignature = ({ onSignatureChange, signature, label }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#024a47';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Set canvas size
    canvas.width = 400;
    canvas.height = 120;

    // Clear canvas with white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Get the actual canvas dimensions
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Get the displayed canvas dimensions
    const displayWidth = rect.width;
    const displayHeight = rect.height;
    
    // Calculate scaling factors
    const scaleX = canvasWidth / displayWidth;
    const scaleY = canvasHeight / displayHeight;
    
    // Get mouse/touch position relative to canvas
    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    
    return { x, y };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCanvasCoordinates(e);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCanvasCoordinates(e);
    
    ctx.lineTo(x, y);
    ctx.stroke();
    
    setHasSignature(true);
    onSignatureChange(canvas.toDataURL(), true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onSignatureChange('', false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {hasSignature && (
          <button
            type="button"
            onClick={clearSignature}
            className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>
      <div className="border-2 border-gray-300 rounded-lg bg-white relative">
        <canvas
          ref={canvasRef}
          className="w-full h-[120px] cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-2 text-gray-400">
              <PenTool className="w-4 h-4" />
              <span className="text-sm">Sign here</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Agreement Modal Component
const AgreementModal = ({ isOpen, onClose, onAccept, draftDay }) => {
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [customerSignature, setCustomerSignature] = useState('');
  const [hasCustomerSignature, setHasCustomerSignature] = useState(false);
  const [lessorSignature, setLessorSignature] = useState('');
  const [hasLessorSignature, setHasLessorSignature] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [currentDate] = useState(new Date().toLocaleDateString());
  const [customerData,setCustomerData]=useState()

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5;
    setIsScrolledToBottom(isAtBottom);
  };

  const handleCustomerSignatureChange = (signature, hasSignature) => {
    setCustomerSignature(signature);
    setHasCustomerSignature(hasSignature);
  };

useEffect(()=>{
getUserData();
},[])

const getUserData=async()=>{
try{
let token=localStorage.getItem('token')
let response=await axios.get(`${BASE_URL}/getUser`,{
  headers:{
    Authorization:`Bearer ${token}`
  }
})
console.log(response.data)
console.log("getUser")

const urlParams = new URLSearchParams(window.location.search);
const encodedData = urlParams.get('data');

const decodedData = atob(encodedData);

const data = JSON.parse(decodedData);
          console.log("Parsed data object:", data);
setCustomerData({
  ...response.data.user,
  ...data
})
setCustomerName(response.data.user.name)
}catch(e){

}
}

  const handleLessorSignatureChange = (signature, hasSignature) => {
    setLessorSignature(signature);
    setHasLessorSignature(hasSignature);
  };

  const generateAgreementPDF = (signatureData, draftDay) => {
    // Import jsPDF dynamically
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      // Set font
      doc.setFont('helvetica');
      
      // Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Rent-to-Own Agreement', 20, 25);
      
      // Company info
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Company: Rent Simple', 20, 40);
      doc.text(`Address: ${customerData?.locationName}`, 20, 45);
      doc.text(`Phone: ${customerData?.mobile}`, 20, 50);
      
      let yPos = 65;
      
      // Section 1: Parties
      doc.setFont('helvetica', 'bold');
      doc.text('1. Parties', 20, yPos);
      yPos += 7;
      doc.setFont('helvetica', 'normal');
      doc.text('This Rent-to-Own Agreement ("Agreement") is entered into between:', 20, yPos);
      yPos += 5;
      doc.text('Lessor (Company): Rent Simple', 30, yPos);
      yPos += 5;
      doc.text(`Lessee (Customer): ${signatureData.customerName}`, 30, yPos);
      yPos += 10;
      
      // Section 2: Items Covered
      doc.setFont('helvetica', 'bold');
      doc.text('2. Items Covered', 20, yPos);
      yPos += 7;
      doc.setFont('helvetica', 'normal');
      doc.text('The Lessee agrees to rent the following item(s):', 20, yPos);
      yPos += 5;
      const items = ['☐ Television', '☐ Refrigerator', '☐ Freezer', '☐ Stove (Gas/Electric)', '☐ Washer & Dryer Set'];
      items.forEach(item => {
        doc.text(item, 30, yPos);
        yPos += 5;
      });
      yPos += 5;
      
      // Section 3: Payment Terms
      doc.setFont('helvetica', 'bold');
      doc.text('3. Payment Terms', 20, yPos);
      yPos += 7;
      doc.setFont('helvetica', 'normal');
      doc.text('Rental Amount: $________ per month (see Schedule A for specific item pricing).', 20, yPos);
      yPos += 5;
      doc.text('First Payment Due: Upon delivery of the item(s).', 20, yPos);
      yPos += 5;
      const suffix = draftDay === 1 ? 'st' : draftDay === 2 ? 'nd' : draftDay === 3 ? 'rd' : 'th';
      doc.text(`Subsequent Payments: Due on the ${draftDay}${suffix} day of each month.`, 20, yPos);
      yPos += 10;
      
      // Late Fee Schedule
      doc.setFont('helvetica', 'bold');
      doc.text('Late Fee Schedule:', 20, yPos);
      yPos += 7;
      doc.setFont('helvetica', 'normal');
      const lateFees = ['30 Days Late → $25 late fee', '60 Days Late → $35 late fee', '90 Days Late → $50 late fee'];
      lateFees.forEach(fee => {
        doc.text(fee, 30, yPos);
        yPos += 5;
      });
      yPos += 10;
      
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      // Continue with other sections...
      const sections = [
        {
          title: '4. Ownership',
          content: [
            'The item(s) remain the property of Rent Simple until all required payments are made in full.',
            'Upon completion of all scheduled payments, ownership transfers to the Lessee.'
          ]
        },
        {
          title: '5. Term',
          content: [
            'Agreement is month-to-month until ownership is transferred or the item is returned.',
            'Lessee may terminate at any time by returning the item(s) in good working condition.'
          ]
        },
        {
          title: '6. Delivery & Installation',
          content: [
            'Delivery and installation within ___ miles are included.',
            'Additional delivery fees may apply for extended distances.'
          ]
        },
        {
          title: '7. Default',
          content: [
            'Failure to pay or violation of terms allows Rent Simple to repossess the item(s).',
            'Lessee forfeits any previous payments if repossession occurs.'
          ]
        }
      ];
      
      sections.forEach(section => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFont('helvetica', 'bold');
        doc.text(section.title, 20, yPos);
        yPos += 7;
        doc.setFont('helvetica', 'normal');
        
        section.content.forEach(item => {
          doc.text(item, 20, yPos);
          yPos += 5;
        });
        yPos += 5;
      });
      
      // Add new page for signatures
      doc.addPage();
      yPos = 20;
      
      // Digital Signatures Section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Digital Signatures', 20, yPos);
      yPos += 15;
      
      // Customer signature
      doc.setFontSize(12);
      doc.text('Customer Signature:', 20, yPos);
      yPos += 10;
      
      if (signatureData.customerSignature) {
        try {
          doc.addImage(signatureData.customerSignature, 'PNG', 20, yPos, 80, 25);
        } catch (e) {
          console.log('Error adding customer signature to PDF:', e);
          doc.text('[Customer Signature]', 20, yPos + 10);
        }
      }
      yPos += 35;
      
      doc.text(`Customer Name: ${signatureData.customerName}`, 20, yPos);
      yPos += 5;
      doc.text(`Date: ${signatureData.signedDate}`, 20, yPos);
      yPos += 20;
      
      // Lessor signature
      doc.text('Lessor (Rent Simple) Signature:', 20, yPos);
      yPos += 10;
      
      if (signatureData.lessorSignature) {
        try {
          doc.addImage(signatureData.lessorSignature, 'PNG', 20, yPos, 80, 25);
        } catch (e) {
          console.log('Error adding lessor signature to PDF:', e);
          doc.text('[Lessor Signature]', 20, yPos + 10);
        }
      }
      yPos += 35;
      
      doc.text(`Date: ${signatureData.signedDate}`, 20, yPos);
      
      // Schedule A: Pricing
      yPos += 20;
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.text('Schedule A: Pricing', 20, yPos);
      yPos += 10;
      doc.setFont('helvetica', 'normal');
      
      const pricing = [
        'TVs: $_/month (or $1 per inch per month)',
        'Refrigerators: $40/month',
        'Freezers: $25/month',
        'Stoves: $35/month',
        'Washer & Dryer Set: $60/month'
      ];
      
      pricing.forEach(price => {
        doc.text(price, 20, yPos);
        yPos += 5;
      });
      
      // Save the PDF
      const fileName = `Rent-to-Own-Agreement-${signatureData.customerName.replace(/\s+/g, '-')}-${new Date().getTime()}.pdf`;
      doc.save(fileName);
      
      return doc.output('blob');
    };
    
    document.head.appendChild(script);
  };

  const handleAccept = () => {
    if (agreedToTerms && isScrolledToBottom && hasCustomerSignature && hasLessorSignature && customerName.trim()) {
      const signatureData = {
        customerSignature,
        lessorSignature,
        customerName: customerName.trim(),
        signedDate: currentDate
      };
      
      // Generate PDF
      generateAgreementPDF(signatureData, draftDay);
      
      onAccept(signatureData);
    }
  };

  const isFormComplete = agreedToTerms && isScrolledToBottom && hasCustomerSignature && hasLessorSignature && customerName.trim();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-[#024a47]" />
            <h2 className="text-2xl font-bold text-[#024a47]">Rent-to-Own Agreement</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Agreement Content */}
        <div 
          className="flex-1 overflow-y-auto p-6 text-sm leading-6"
          onScroll={handleScroll}
        >
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-xl font-bold text-[#024a47] mb-2">Rent-to-Own Agreement</h1>
              <div className="text-gray-600">
                <p><strong>Company:</strong> Rent Simple</p>
                <p><strong>Address:</strong> {customerData?.locationName}</p>
                <p><strong>Phone:</strong> {customerData?.mobile}</p>
              </div>
            </div>

            <div className="border-t border-gray-300 pt-4">
              <h3 className="font-bold text-[#024a47] mb-3">1. Parties</h3>
              <p>This Rent-to-Own Agreement ("Agreement") is entered into between:</p>
              <ul className="ml-6 mt-2 space-y-1">
                <li><strong>Lessor (Company):</strong> Rent Simple</li>
                <li><strong>Lessee (Customer):</strong> <span className="inline-block min-w-[200px] border-b border-gray-400">{customerData?.name || '_________________________'}</span></li>
              </ul>
            </div>

            <div className="border-t border-gray-300 pt-4">
              <h3 className="font-bold text-[#024a47] mb-3">2. Items Covered</h3>
              <p>The Lessee agrees to rent the following item(s) (check all that apply):</p>
              <ul className="ml-6 mt-2 space-y-2">
                <li>☐ Television</li>
                <li>☐ Refrigerator</li>
                <li>☐ Freezer</li>
                <li>☐ Stove (Gas/Electric)</li>
                <li>☐ Washer & Dryer Set</li>
              </ul>
            </div>

            <div className="border-t border-gray-300 pt-4">
              <h3 className="font-bold text-[#024a47] mb-3">3. Payment Terms</h3>
              <ul className="space-y-2">
                <li><strong>Rental Amount:</strong> $________ per month (see Schedule A for specific item pricing).</li>
                <li><strong>First Payment Due:</strong> Upon delivery of the item(s).</li>
                <li><strong>Subsequent Payments:</strong> Due on the {draftDay}{draftDay === 1 ? 'st' : draftDay === 2 ? 'nd' : draftDay === 3 ? 'rd' : 'th'} day of each month.</li>
              </ul>
              <div className="mt-4">
                <p className="font-semibold text-red-600">Late Fee Schedule:</p>
                <ul className="ml-6 mt-2 space-y-1">
                  <li>30 Days Late → $25 late fee</li>
                  <li>60 Days Late → $35 late fee</li>
                  <li>90 Days Late → $50 late fee</li>
                </ul>
                <p className="mt-2 text-sm">All late fees are cumulative and must be paid in addition to the overdue balance. If the account remains unpaid beyond 90 days, Rent Simple reserves the right to repossess the item(s) as outlined in Section 8 (Default).</p>
              </div>
            </div>

            <div className="border-t border-gray-300 pt-4">
              <h3 className="font-bold text-[#024a47] mb-3">4. Ownership</h3>
              <ul className="space-y-2">
                <li>The item(s) remain the property of Rent Simple until all required payments are made in full.</li>
                <li>Upon completion of all scheduled payments, ownership transfers to the Lessee.</li>
              </ul>
            </div>

            <div className="border-t border-gray-300 pt-4">
              <h3 className="font-bold text-[#024a47] mb-3">5. Term</h3>
              <ul className="space-y-2">
                <li>Agreement is month-to-month until ownership is transferred or the item is returned.</li>
                <li>Lessee may terminate at any time by returning the item(s) in good working condition, subject to normal wear and tear.</li>
              </ul>
            </div>

            <div className="border-t border-gray-300 pt-4">
              <h3 className="font-bold text-[#024a47] mb-3">6. Delivery & Installation</h3>
              <ul className="space-y-2">
                <li>Delivery and installation within ___ miles are included.</li>
                <li>Additional delivery fees may apply for extended distances.</li>
              </ul>
            </div>

            <div className="border-t border-gray-300 pt-4">
              <h3 className="font-bold text-[#024a47] mb-3">7. Maintenance & Warranty</h3>
              <ul className="space-y-2">
                <li>Manufacturer's warranty applies where available.</li>
                <li>Lessee must notify Rent Simple immediately of any mechanical or operational issues.</li>
                <li>Rent Simple is responsible for repair or replacement of defective items unless caused by misuse, neglect, or intentional damage.</li>
              </ul>
            </div>

            <div className="border-t border-gray-300 pt-4">
              <h3 className="font-bold text-[#024a47] mb-3">8. Default</h3>
              <ul className="space-y-2">
                <li>Failure to pay or violation of terms allows Rent Simple to repossess the item(s).</li>
                <li>Lessee forfeits any previous payments if repossession occurs.</li>
              </ul>
            </div>

            <div className="border-t border-gray-300 pt-4">
              <h3 className="font-bold text-[#024a47] mb-3">9. Insurance (Optional)</h3>
              <p>Lessee may elect to purchase optional insurance coverage for accidental damage or loss.</p>
            </div>

            <div className="border-t border-gray-300 pt-4">
              <h3 className="font-bold text-[#024a47] mb-3">10. Governing Law</h3>
              <p>This Agreement is governed by the laws of the State of ______________.</p>
            </div>

            <div className="border-t border-gray-300 pt-4">
              <h3 className="font-bold text-[#024a47] mb-3">11. Digital Signatures</h3>
              <div className="space-y-6">
                {/* Customer Name Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Customer Full Name</label>
                  <input
                    type="text"
                    value={customerData?.name}
                    disabled={true}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#024a47] focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Customer Signature */}
                <DigitalSignature
                  signature={customerSignature}
                  onSignatureChange={handleCustomerSignatureChange}
                  label="Customer Signature"
                />

                {/* Lessor Signature */}
                <DigitalSignature
                  signature={lessorSignature}
                  onSignatureChange={handleLessorSignatureChange}
                  label="Lessor (Rent Simple) Signature"
                />

                <div className="flex justify-between text-sm">
                  <span>Date: {currentDate}</span>
                  <span>Date: {currentDate}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-300 pt-4">
              <h3 className="font-bold text-[#024a47] mb-3">Schedule A: Pricing</h3>
              <ul className="space-y-2">
                <li>TVs: $_/month (or $1 per inch per month)</li>
                <li>Refrigerators: $40/month</li>
                <li>Freezers: $25/month</li>
                <li>Stoves: $35/month</li>
                <li>Washer & Dryer Set: $60/month</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        {!isScrolledToBottom && (
          <div className="px-6 py-2 bg-yellow-50 border-t border-yellow-200 text-center">
            <p className="text-sm text-yellow-700">Please scroll down to read the complete agreement and sign</p>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <div 
              className={`w-6 h-6 mt-0.5 rounded border-2 border-[#024a47] flex items-center justify-center flex-shrink-0 ${
                agreedToTerms ? 'bg-[#024a47]' : 'bg-white'
              }`}
              onClick={() => setAgreedToTerms(!agreedToTerms)}
            >
              {agreedToTerms && <Check className="w-4 h-4 text-white" />}
            </div>
            <span className="text-sm text-gray-700">
              I have read, understood, and agree to the terms and conditions of this Rent-to-Own Agreement. I acknowledge that this is a legal binding contract and that my digital signature is legally equivalent to a handwritten signature.
            </span>
          </label>

          {/* Validation Messages */}
          {!isFormComplete && (
            <div className="text-sm text-red-600 space-y-1">
              {!customerName.trim() && <p>• Please enter your full name</p>}
              {!hasCustomerSignature && <p>• Please provide your digital signature</p>}
              {!hasLessorSignature && <p>• Lessor signature is required</p>}
              {!isScrolledToBottom && <p>• Please scroll to the bottom of the agreement</p>}
              {!agreedToTerms && <p>• Please agree to the terms and conditions</p>}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAccept}
              disabled={!isFormComplete}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                isFormComplete
                  ? 'bg-[#024a47] text-white hover:bg-[#035d57]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Accept Agreement & Complete Setup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function BillingDetailsForm() {
  const [zipCode, setZipCode] = useState("");
  const [saveCard, setSaveCard] = useState(true);
  const [draftDay, setDraftDay] = useState(1);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardError, setCardError] = useState(null);

  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  // Stripe Element styles
  const elementStyles = {
    style: {
      base: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#024a47',
        fontFamily: 'inherit',
        '::placeholder': {
          color: '#9ca3af',
        },
      },
    },
  };

  const handleZipCodeChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/gi, '');
    if (value.length <= 5) {
      setZipCode(value);
    }
  };

  const validateForm = async () => {
    setCardError(null);
    
    if (!stripe || !elements) {
      setCardError("Stripe not loaded yet. Please wait...");
      return false;
    }

    // Get Stripe Elements
    const cardNumberElement = elements.getElement(CardNumberElement);
    const cardExpiryElement = elements.getElement(CardExpiryElement);
    const cardCvcElement = elements.getElement(CardCvcElement);

    if (!cardNumberElement || !cardExpiryElement || !cardCvcElement) {
      setCardError("Payment fields not loaded properly");
      return false;
    }

    // Check if card fields are complete
    // Note: Stripe Elements don't have a validate() method, we need to check completeness differently
    try {
      // Create payment method to validate all fields at once
      const { error } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardNumberElement,
        billing_details: {
          address: {
            postal_code: zipCode,
          },
        },
      });

      if (error) {
        setCardError(error.message);
        return false;
      }

      if (zipCode.length === 0) {
        alert("Please enter zip code");
        return false;
      }

      return true;
    } catch (error) {
      setCardError("Error validating card details");
      return false;
    }
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    const isValid = await validateForm();
    
    if (isValid) {
      setShowAgreementModal(true);
    }
    
    setIsProcessing(false);
  };

  const handleAgreementAccept = async (signatureData) => {
    try {
      setIsProcessing(true);
      
      console.log('=== BILLING FORM SUBMISSION START ===');
      console.log('Timestamp:', new Date().toISOString());
      alert("Please wait until payment is processed click ok to continue")
      // Create payment method with Stripe
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardNumberElement),
        billing_details: {
          address: {
            postal_code: zipCode,
          },
        },
      });

      if (error) {
        setCardError(error.message);
        setIsProcessing(false);
        return;
      }

      // Prepare data for backend - ONLY send paymentMethodId, not raw card details
      const requestData = {
        paymentMethodId: paymentMethod.id,
        zipCode,
        draftDay,
        saveCard,
        agreement: {
          customerName: signatureData.customerName,
          customerSignature: signatureData.customerSignature,
          lessorSignature: signatureData.lessorSignature,
          signedDate: signatureData.signedDate,
          agreementVersion: '1.0',
          signatureTimestamp: new Date().toISOString()
        }
      };
      
      console.log('Request data prepared with Stripe payment method:', requestData);
      
      // Send to backend
      let token = localStorage.getItem("token");
      
      let response = await axios.post(`${BASE_URL}/storeBilling`, requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const urlParams = new URLSearchParams(window.location.search);
      const encodedData = urlParams.get('data');
      
      const decodedData = atob(encodedData);
      
      const data = JSON.parse(decodedData);
       let responsetwo=await axios.post(`${BASE_URL}/createOrder`,data,{headers:{
        Authorization:`Bearer ${token}`
      }})
      console.log('Backend response received:', response.data);
      
      alert(`Success: ${response.data.message}`);
      setShowAgreementModal(false);
      navigate('/dashboard');
      
    } catch (e) {
      console.error('=== ERROR IN BILLING FORM SUBMISSION ===');
      console.error('Error timestamp:', new Date().toISOString());
      console.error('Error object:', e);
      
      if (e?.response?.data?.error) {
        alert(`Error: ${e.response.data.error}`);
      } else if (e?.response) {
        alert('Server error occurred. Please check the console for details.');
      } else if (e?.request) {
        alert('Network error. Please check your internet connection.');
      } else {
        alert('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="max-w-md mx-auto p-8 bg-[#f9faf5] min-h-screen">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <Lock className="w-16 h-16 text-[#024a47] mx-auto" />
          </div>
          <h1 className="text-3xl font-bold text-[#024a47]">Enter Billing Details</h1>
        </div>

        {/* Card Number with Stripe Element */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-[#024a47]" />
              <div className="flex-1">
                <CardNumberElement
                  options={elementStyles}
                  className="w-full text-xl font-semibold text-[#024a47] bg-transparent border-none outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Expiry Date and CVV with Stripe Elements */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-[#024a47]" />
              <div className="flex-1">
                <CardExpiryElement
                  options={elementStyles}
                  className="w-full text-xl font-semibold text-[#024a47] bg-transparent border-none outline-none"
                />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <MoreHorizontal className="w-6 h-6 text-[#024a47]" />
              <div className="flex-1">
                <CardCvcElement
                  options={elementStyles}
                  className="w-full text-xl font-semibold text-[#024a47] bg-transparent border-none outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ZIP Code */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-[#024a47] rounded-sm"></div>
              <input
                type="text"
                value={zipCode}
                onChange={handleZipCodeChange}
                className="flex-1 text-xl font-semibold text-[#024a47] bg-transparent border-none outline-none"
                placeholder="12345"
                maxLength="5"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {cardError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {cardError}
          </div>
        )}

        {/* Draft Day Selection */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-[#024a47] mb-4">Payment Draft Date</h3>
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-[#024a47]" />
              <select
                value={draftDay}
                onChange={(e) => setDraftDay(parseInt(e.target.value))}
                className="flex-1 text-xl font-semibold text-[#024a47] bg-transparent border-none outline-none cursor-pointer"
              >
                {[...Array(28)].map((_, index) => {
                  const day = index + 1;
                  const suffix = day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th';
                  return (
                    <option key={day} value={day}>
                      {day}{suffix} of each month
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2 ml-4">
            Select the day of the month you'd like payments to be automatically drafted
          </p>
        </div>

        {/* Appliance Icons */}
        <div className="mb-8">
          <div className="flex justify-center gap-8 mb-6">
            <div className="text-center">
              <RefrigeratorIcon />
              <p className="text-sm font-medium text-gray-600 mt-2">Refrigerator</p>
            </div>
            <div className="text-center">
              <WasherDryerIcon />
              <p className="text-sm font-medium text-gray-600 mt-2">Washer & Dryer</p>
            </div>
            <div className="text-center">
              <DeepFreezerIcon />
              <p className="text-sm font-medium text-gray-600 mt-2">Deep Freezer</p>
            </div>
          </div>
        </div>

        {/* Save Card Checkbox */}
        <div className="mb-8">
          <label className="flex items-center gap-3 cursor-pointer">
            <div 
              className={`w-8 h-8 rounded-md border-2 border-[#024a47] flex items-center justify-center ${
                saveCard ? 'bg-[#024a47]' : 'bg-white'
              }`}
              onClick={() => setSaveCard(!saveCard)}
            >
              {saveCard && <CheckSquare className="w-5 h-5 text-white" />}
            </div>
            <span className="text-lg font-medium text-[#024a47]">
              Save this card for recurring payments
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button 
          onClick={handleSubmit}
          disabled={!stripe || isProcessing}
          className={`w-full bg-[#024a47] text-white text-xl font-semibold py-4 rounded-2xl shadow-lg transition-colors ${
            !stripe || isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#035d57]'
          }`}
        >
          {isProcessing ? 'Processing...' : 'Complete Setup'}
        </button>

        {/* Security Notice */}
        <div className="mt-4 text-center text-sm text-gray-600">
          <div className="flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" />
            <span>Your card details are secured by Stripe</span>
          </div>
        </div>
      </div>

      {/* Agreement Modal */}
      <AgreementModal
        isOpen={showAgreementModal}
        onClose={() => setShowAgreementModal(false)}
        onAccept={handleAgreementAccept}
        draftDay={draftDay}
      />
    </>
  );
}

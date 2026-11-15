import { Language } from '../types';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    appName: 'PunarChakra',
    tagline: 'Clean Earth, Green Wealth',
    subtagline: 'Doorstep Recycling & Instant Cash Pickup',
    
    // Roles
    roleCustomer: 'Customer Portal',
    roleExecutive: 'Pickup Executive',
    roleAdmin: 'Admin Console',
    
    // Navigation & Tabs
    navCategories: 'Scrap Categories',
    navLiveRates: 'Live Price List',
    navSchedulePickup: 'Book Pickup',
    navMyOrders: 'Order History',
    navEcoWallet: 'Wallet & Rewards',
    navAiScanner: 'AI Scrap Classifier',
    navVoiceBooking: 'Voice Booking',
    navAnalytics: 'Recycling Analytics',
    navDriverFleet: 'Field Executives',
    navEcoAdvice: 'Eco-Advice & Tips',
    navEcoQuiz: 'Eco Quiz Challenge',

    // Hero & CTA
    sellScrapNow: 'Sell Scrap Now',
    aiClassifyButton: 'Identify Scrap with AI',
    voiceBookingButton: 'Voice Assist Booking',
    schedulePickupHeader: 'Schedule Doorstep Scrap Pickup',
    
    // Scrap Categories
    catMetals: 'Metals & Alloys',
    catPaper: 'Paper & Books',
    catPlastics: 'Plastics & Containers',
    catEwaste: 'E-Waste & Gadgets',
    catGlass: 'Glass & Bottles',
    catVehicles: 'Old Vehicles & Bikes',
    
    // Common labels
    perKg: '₹/kg',
    perPiece: '₹/pc',
    minQuantity: 'Min Sell Qty',
    co2OffsetLabel: 'CO₂ Offset',
    addToPickupList: 'Add to Pickup Cart',
    itemsInCart: 'Items Selected',
    totalEstimatedValue: 'Total Estimated Value',
    proceedToSchedule: 'Proceed to Schedule',
    
    // Scanner
    aiScannerTitle: 'AI Camera Scrap Classifier',
    aiScannerSubtitle: 'Snap a picture of your scrap. Gemini AI will instant-identify material, purity grade, estimated weight & current payout rate!',
    uploadPhoto: 'Upload Image',
    takePhoto: 'Capture Photo',
    sampleImage: 'Try Sample Image',
    analyzingImage: 'Analyzing scrap material using Gemini AI...',
    purityGrade: 'Purity Grade',
    estimatedWeight: 'Est. Weight',
    recyclabilityScore: 'Recyclability Score',
    co2SavedPerKg: 'CO₂ Offset/kg',
    segregationTips: 'Handling & Segregation Tips',

    // Voice booking
    voiceBookingTitle: 'Voice-Assisted Scrap Booking',
    voiceBookingSubtitle: 'Speak naturally in Kannada, English, or Hindi. E.g. "I have 10kg cardboard and 5kg iron to sell tomorrow morning at Indiranagar".',
    listening: 'Listening... Speak now',
    startSpeaking: 'Start Voice Input',
    stopSpeaking: 'Stop Recording',
    processingVoice: 'Gemini AI parsing voice command...',

    // Scheduling
    selectAddress: 'Select Pickup Address',
    addNewAddress: '+ Add New Address',
    pickupDate: 'Pickup Date',
    pickupTimeSlot: 'Select Time Slot',
    slotMorning: 'Morning (9 AM - 12 PM)',
    slotAfternoon: 'Afternoon (12 PM - 3 PM)',
    slotEvening: 'Evening (3 PM - 6 PM)',
    paymentMethod: 'Payout Method',
    payUpi: 'Instant UPI Transfer (GPay / PhonePe)',
    payCash: 'Cash on Delivery',
    payWallet: 'PunarChakra Wallet Balance',
    confirmBooking: 'Confirm & Schedule Pickup',

    // Live Tracking
    trackingTitle: 'Live Executive GPS Tracking',
    assignedExecutive: 'Assigned Executive',
    vehicleNo: 'Vehicle No',
    callExecutive: 'Call Executive',
    etaMinutes: 'Estimated Arrival',
    statusScheduled: 'Scheduled',
    statusAssigned: 'Executive Assigned',
    statusEnRoute: 'En Route to Address',
    statusArrived: 'Arrived at Doorstep',
    statusWeighing: 'Weighing & Payout',
    statusCompleted: 'Completed',

    // Wallet & Referral
    walletBalance: 'Eco Wallet Balance',
    ecoPoints: 'Eco Reward Points',
    withdrawToUpi: 'Withdraw to Bank/UPI',
    referAndEarn: 'Refer & Earn ₹50',
    yourReferralCode: 'Your Referral Code',
    copyCode: 'Copy Code',
    redeemPoints: 'Redeem Vouchers',

    // Admin & Metrics
    totalScrapCollected: 'Total Scrap Recycled',
    totalPayoutDisbursed: 'Total Payout Disbursed',
    co2SavedGlobal: 'Total CO₂ Offset',
    activePickupRequests: 'Active Field Requests',
    updateRates: 'Update Market Rates',
    saveRateChanges: 'Save Live Rates',

    // Eco Advice & Quiz
    ecoAdviceTitle: 'Personalized Daily Sustainability Advice',
    ecoAdviceDesc: 'Context-aware green living suggestions powered by Gemini 3.8 Flash based on your recycled materials.',
  },
  
  kn: {
    appName: 'ಪುನರ್ಚಕ್ರ',
    tagline: 'ಪರಿಶುದ್ಧ ಭೂಮಿ, ಹಸಿರು ಸಂಪತ್ತು',
    subtagline: 'ಮನೆಯ ಬಾಗಿಲಿಗೆ ಗುಜರಿ ಮರುಬಳಕೆ ಮತ್ತು ತಕ್ಷಣದ ನಗದು',
    
    // Roles
    roleCustomer: 'ಗ್ರಾಹಕರ ಪೋರ್ಟಲ್',
    roleExecutive: 'ಪಿಕಪ್ ಎಕ್ಸಿಕ್ಯುಟಿವ್',
    roleAdmin: 'ಅಡ್ಮಿನ್ ಕಾನ್ಸೋಲ್',
    
    // Navigation & Tabs
    navCategories: 'ಗುಜರಿ ವರ್ಗಗಳು',
    navLiveRates: 'ಲೈವ್ ಬೆಲೆ ಪಟ್ಟಿ',
    navSchedulePickup: 'ಪಿಕಪ್ ಬುಕ್ ಮಾಡಿ',
    navMyOrders: 'ನನ್ನ ಆರ್ಡರ್‌ಗಳು',
    navEcoWallet: 'ವಾಲೆಟ್ ಮತ್ತು ರಿವಾರ್ಡ್ಸ್',
    navAiScanner: 'ಎಐ ಗುಜರಿ ಸ್ಕ್ಯಾನರ್',
    navVoiceBooking: 'ವಾಯ್ಸ್ ಬುಕಿಂಗ್',
    navAnalytics: 'ಮರುಬಳಕೆ ಅಂಕಿಅಂಶ',
    navDriverFleet: 'ಫೀಲ್ಡ್ ಸಿಬ್ಬಂದಿ',
    navEcoAdvice: 'ಪರಿಸರ ಸಲಹೆಗಳು',
    navEcoQuiz: 'ಪರಿಸರ ರಸಪ್ರಶ್ನೆ',

    // Hero & CTA
    sellScrapNow: 'ಗುಜರಿ ಮಾರಾಟ ಮಾಡಿ',
    aiClassifyButton: 'ಎಐ ಮೂಲಕ ಗುಜರಿ ಗುರುತಿಸಿ',
    voiceBookingButton: 'ಧ್ವನಿ ಮೂಲಕ ಬುಕಿಂಗ್',
    schedulePickupHeader: 'ಮನೆಯ ಬಾಗಿಲಿಗೆ ಪಿಕಪ್ ನಿಗದಿಪಡಿಸಿ',
    
    // Scrap Categories
    catMetals: 'ಲೋಹಗಳು ಮತ್ತು ತಂತಿಗಳು',
    catPaper: 'ಕಾಗದ ಮತ್ತು ಪುಸ್ತಕಗಳು',
    catPlastics: 'ಪ್ಲಾಸ್ಟಿಕ್ ಬಾಟಲಿಗಳು',
    catEwaste: 'ಇ-ತ್ಯಾಜ್ಯ ಮತ್ತು ಮೊಬೈಲ್',
    catGlass: 'ಗಾಜಿನ ಬಾಟಲಿಗಳು',
    catVehicles: 'ಹಳೆಯ ವಾಹನಗಳು',
    
    // Common labels
    perKg: '₹/ಕೆಜಿ',
    perPiece: '₹/ಪೀಸ್',
    minQuantity: 'ಕನಿಷ್ಠ ಪ್ರಮಾಣ',
    co2OffsetLabel: 'CO₂ ಉಳಿತಾಯ',
    addToPickupList: 'ಪಿಕಪ್ ಪಟ್ಟಿಗೆ ಸೇರಿಸಿ',
    itemsInCart: 'ಆಯ್ಕೆಮಾಡಿದ ವಸ್ತುಗಳು',
    totalEstimatedValue: 'ಒಟ್ಟು ಅಂದಾಜು ಮೌಲ್ಯ',
    proceedToSchedule: 'ಮುಂದೆ ಸಾಗಿ',
    
    // Scanner
    aiScannerTitle: 'ಎಐ ಕ್ಯಾಮೆರಾ ಗುಜರಿ ಸ್ಕ್ಯಾನರ್',
    aiScannerSubtitle: 'ನಿಮ್ಮ ಗುಜರಿ ವಸ್ತುವಿನ ಫೋಟೋ ತೆಗೆಯಿರಿ. Gemini AI ತಕ್ಷಣವೇ ಲೋಹದ ಪ್ರಕಾರ, ಶುದ್ಧತೆ ಮತ್ತು ಬೆಲೆಯನ್ನು ಅಂದಾಜು ಮಾಡುತ್ತದೆ!',
    uploadPhoto: 'ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    takePhoto: 'ಫೋಟೋ ತೆಗೆಯಿರಿ',
    sampleImage: 'ಮಾದರಿ ಫೋಟೋ',
    analyzingImage: 'Gemini AI ಗುಜರಿಯನ್ನು ಪರಿಶೀಲಿಸುತ್ತಿದೆ...',
    purityGrade: 'ಶುದ್ಧತೆಯ ಶ್ರೇಣಿ',
    estimatedWeight: 'ಅಂದಾಜು ತೂಕ',
    recyclabilityScore: 'ಮರುಬಳಕೆ ಸ್ಕೋರ್',
    co2SavedPerKg: 'CO₂ ಉಳಿತಾಯ/ಕೆಜಿ',
    segregationTips: 'ಸಂಗ್ರಹಣೆ ಮತ್ತು ವಿಂಗಡಣೆ ಸಲಹೆಗಳು',

    // Voice booking
    voiceBookingTitle: 'ಧ್ವನಿ ಆಧಾರಿತ ಗುಜರಿ ಬುಕಿಂಗ್',
    voiceBookingSubtitle: 'ಕನ್ನಡದಲ್ಲಿ ಸಹಜವಾಗಿ ಮಾತನಾಡಿ. ಉದಾ: "ನನ್ನ ಬಳಿ 10 ಕೆಜಿ ರಟ್ಟಿನ ಪೆಟ್ಟಿಗೆ ಮತ್ತು 5 ಕೆಜಿ ಕಬ್ಬಿಣ ಇದೆ, ನಾಳೆ ಬೆಳಿಗ್ಗೆ ಇಂದಿರಾನಗರಕ್ಕೆ ಬನ್ನಿ".',
    listening: 'ಆಲಿಸಲಾಗುತ್ತಿದೆ... ಈಗ ಮಾತನಾಡಿ',
    startSpeaking: 'ಧ್ವನಿ ನೀಡಿ',
    stopSpeaking: 'ನಿಲ್ಲಿಸಿ',
    processingVoice: 'Gemini AI ಧ್ವನಿಯನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸುತ್ತಿದೆ...',

    // Scheduling
    selectAddress: 'ಪಿಕಪ್ ವಿಳಾಸ ಆಯ್ಕೆಮಾಡಿ',
    addNewAddress: '+ ಹೊಸ ವಿಳಾಸ ಸೇರಿಸಿ',
    pickupDate: 'ಪಿಕಪ್ ದಿನಾಂಕ',
    pickupTimeSlot: 'ಸಮಯದ ಸ್ಲಾಟ್ ಆಯ್ಕೆಮಾಡಿ',
    slotMorning: 'ಬೆಳಿಗ್ಗೆ (9 AM - 12 PM)',
    slotAfternoon: 'ಮಧ್ಯಾಹ್ನ (12 PM - 3 PM)',
    slotEvening: 'ಸಂಜೆ (3 PM - 6 PM)',
    paymentMethod: 'ಪಾವತಿ ವಿಧಾನ',
    payUpi: 'ತಕ್ಷಣದ ಯುಪಿಐ (GPay / PhonePe)',
    payCash: 'ನಗದು ಪಾವತಿ',
    payWallet: 'ಪುನರ್ಚಕ್ರ ವಾಲೆಟ್ ಬ್ಯಾಲೆನ್ಸ್',
    confirmBooking: 'ಬುಕಿಂಗ್ ಖಚಿತಪಡಿಸಿ',

    // Live Tracking
    trackingTitle: 'ಲೈವ್ ಜಿಪಿಎಸ್ ಟ್ರ್ಯಾಕಿಂಗ್',
    assignedExecutive: 'ನಿಯೋಜಿತ ಸಿಬ್ಬಂದಿ',
    vehicleNo: 'ವಾಹನ ಸಂಖ್ಯೆ',
    callExecutive: 'ಕರೆ ಮಾಡಿ',
    etaMinutes: 'ಅಂದಾಜು ಸಮಯ',
    statusScheduled: 'ಬುಕ್ ಮಾಡಲಾಗಿದೆ',
    statusAssigned: 'ಸಿಬ್ಬಂದಿ ನಿಯೋಜಿಸಲಾಗಿದೆ',
    statusEnRoute: 'ನಿಮ್ಮ ವಿಳಾಸಕ್ಕೆ ಹೊರಟಿದ್ದಾರೆ',
    statusArrived: 'ಸ್ಥಳಕ್ಕೆ ತಲುಪಿದ್ದಾರೆ',
    statusWeighing: 'ತೂಕ ಮತ್ತು ಪಾವತಿ ಪ್ರಕ್ರಿಯೆ',
    statusCompleted: 'ಪೂರ್ಣಗೊಂಡಿದೆ',

    // Wallet & Referral
    walletBalance: 'ಇಕೋ ವಾಲೆಟ್ ಬ್ಯಾಲೆನ್ಸ್',
    ecoPoints: 'ಇಕೋ ರಿವಾರ್ಡ್ ಪಾಯಿಂಟ್ಸ್',
    withdrawToUpi: 'ಬ್ಯಾಂಕ್‌ಗೆ ವರ್ಗಾಯಿಸಿ',
    referAndEarn: 'ಸ್ನೇಹಿತರಿಗೆ ತಿಳಿಸಿ ₹50 ಗಳಿಸಿ',
    yourReferralCode: 'ನಿಮ್ಮ ರೆಫರಲ್ ಕೋಡ್',
    copyCode: 'ಕೋಡ್ ಕಾಪಿ ಮಾಡಿ',
    redeemPoints: 'ಕೂಪನ್ ಪಡೆಯಿರಿ',

    // Admin & Metrics
    totalScrapCollected: 'ಒಟ್ಟು ಮರುಬಳಕೆಯ ಗುಜರಿ',
    totalPayoutDisbursed: 'ವಿಲೇವಾರಿ ಮಾಡಿದ ಹಣ',
    co2SavedGlobal: 'ಒಟ್ಟು CO₂ ಉಳಿತಾಯ',
    activePickupRequests: 'ಚಾಲ್ತಿಯಲ್ಲಿರುವ ಪಿಕಪ್‌ಗಳು',
    updateRates: 'ಮಾರುಕಟ್ಟೆ ದರ ನವೀಕರಿಸಿ',
    saveRateChanges: 'ದರ ಉಳಿಸಿ',

    // Eco Advice & Quiz
    ecoAdviceTitle: 'ವೈಯಕ್ತಿಕ ಪರಿಸರ ಸ್ನೇಹಿ ಸಲಹೆಗಳು',
    ecoAdviceDesc: 'ಜೆಮಿನಿ ಎಐ ಚಾಲಿತ ನಿತ್ಯ ಪರಿಸರ ಸಲಹೆಗಳು.',
  },

  hi: {
    appName: 'पुनर्चक्र',
    tagline: 'स्वच्छ पृथ्वी, हरित समृद्धि',
    subtagline: 'घर बैठे कबाड़ रीसाइक्लिंग और तुरंत नकद भुगतान',
    
    // Roles
    roleCustomer: 'ग्राहक पोर्टल',
    roleExecutive: 'पिकअप एग्जीक्यूटिव',
    roleAdmin: 'एडमिन कंसोल',
    
    // Navigation & Tabs
    navCategories: 'कबाड़ श्रेणियां',
    navLiveRates: 'लाइव दर सूची',
    navSchedulePickup: 'पिकअप बुक करें',
    navMyOrders: 'ऑर्डर इतिहास',
    navEcoWallet: 'वॉलेट एवं रिवार्ड्स',
    navAiScanner: 'AI कबाड़ स्कैनर',
    navVoiceBooking: 'वॉइस बुकिंग',
    navAnalytics: 'रीसाइक्लिंग विश्लेषण',
    navDriverFleet: 'फील्ड टीम',
    navEcoAdvice: 'इको एडवाइस',
    navEcoQuiz: 'इको क्विज',

    // Hero & CTA
    sellScrapNow: 'कबाड़ बेचें',
    aiClassifyButton: 'AI से कबाड़ पहचानें',
    voiceBookingButton: 'वॉइस असिस्ट बुकिंग',
    schedulePickupHeader: 'डोरस्टेप पिकअप शेड्यूल करें',
    
    // Scrap Categories
    catMetals: 'धातुएं एवं तार',
    catPaper: 'कागज और किताबें',
    catPlastics: 'प्लास्टिक बोतलें',
    catEwaste: 'ई-वेस्ट एवं मोबाइल',
    catGlass: 'कांच की बोतलें',
    catVehicles: 'पुराने वाहन एवं बाइक',
    
    // Common labels
    perKg: '₹/किग्रा',
    perPiece: '₹/नग',
    minQuantity: 'न्यूनतम मात्रा',
    co2OffsetLabel: 'CO₂ बचत',
    addToPickupList: 'पिकअप लिस्ट में जोड़ें',
    itemsInCart: 'चुने गए आइटम',
    totalEstimatedValue: 'कुल अनुमानित मूल्य',
    proceedToSchedule: 'आगे बढ़ें',
    
    // Scanner
    aiScannerTitle: 'AI कैमरा कबाड़ स्कैनर',
    aiScannerSubtitle: 'अपने कबाड़ की फोटो खींचें। Gemini AI तुरंत धातु का प्रकार, शुद्धता, वजन और लाइव रेट बताएगा!',
    uploadPhoto: 'फोटो अपलोड करें',
    takePhoto: 'फोटो खींचें',
    sampleImage: 'सैंपल फोटो',
    analyzingImage: 'Gemini AI कबाड़ की जांच कर रहा है...',
    purityGrade: 'शुद्धता ग्रेड',
    estimatedWeight: 'अनुमानित वजन',
    recyclabilityScore: 'रीसाइक्लिंग स्कोर',
    co2SavedPerKg: 'CO₂ बचत/किग्रा',
    segregationTips: 'रखरखाव और छंटाई सुझाव',

    // Voice booking
    voiceBookingTitle: 'वॉइस-असिस्टेड कबाड़ बुकिंग',
    voiceBookingSubtitle: 'हिंदी या कन्नड़ में आसानी से बोलें। जैसे: "मेरे पास 10 किलो गत्ता और 5 किलो लोहा है, कल सुबह इंदिरानगर में पिकअप रखें"।',
    listening: 'सुन रहे हैं... अब बोलें',
    startSpeaking: 'बोलना शुरू करें',
    stopSpeaking: 'रोकें',
    processingVoice: 'Gemini AI वॉइस कमांड प्रोसेस कर रहा है...',

    // Scheduling
    selectAddress: 'पिकअप पता चुनें',
    addNewAddress: '+ नया पता जोड़ें',
    pickupDate: 'पिकअप तिथि',
    pickupTimeSlot: 'समय स्लॉट चुनें',
    slotMorning: 'सुबह (9 AM - 12 PM)',
    slotAfternoon: 'दोपहर (12 PM - 3 PM)',
    slotEvening: 'शाम (3 PM - 6 PM)',
    paymentMethod: 'भुगतान का माध्यम',
    payUpi: 'तुरंत UPI (GPay / PhonePe)',
    payCash: 'कैश ऑन डिलीवरी',
    payWallet: 'पुनर्चक्र वॉलेट बैलेंस',
    confirmBooking: 'बुकिंग कन्फर्म करें',

    // Live Tracking
    trackingTitle: 'लाइव जीपीएस ट्रैकिंग',
    assignedExecutive: 'नियत एग्जीक्यूटिव',
    vehicleNo: 'वाहन नंबर',
    callExecutive: 'कॉल करें',
    etaMinutes: 'अनुमानित समय',
    statusScheduled: 'शेड्यूल किया गया',
    statusAssigned: 'एग्जीक्यूटिव नियत',
    statusEnRoute: 'आपके पते के लिए रवाना',
    statusArrived: 'दरवाजे पर पहुंचे',
    statusWeighing: 'तौल और भुगतान जारी',
    statusCompleted: 'पूरा हुआ',

    // Wallet & Referral
    walletBalance: 'इको वॉलेट बैलेंस',
    ecoPoints: 'इको रिवार्ड पॉइंट्स',
    withdrawToUpi: 'बैंक/UPI में ट्रांसफर करें',
    referAndEarn: 'मित्रों को भेजें ₹50 पाएं',
    yourReferralCode: 'आपका रेफरल कोड',
    copyCode: 'कोड कॉपी करें',
    redeemPoints: 'कूपन रिडीम करें',

    // Admin & Metrics
    totalScrapCollected: 'कुल रीसाइकल कबाड़',
    totalPayoutDisbursed: 'कुल भुगतान राशि',
    co2SavedGlobal: 'कुल CO₂ बचत',
    activePickupRequests: 'सक्रिय पिकअप',
    updateRates: 'मार्केट रेट अपडेट करें',
    saveRateChanges: 'रेट सेव करें',

    // Eco Advice & Quiz
    ecoAdviceTitle: 'व्यक्तिगत पर्यावरण सलाह',
    ecoAdviceDesc: 'जेमिनी AI आधारित दैनिक हरित जीवन शैली सुझाव।',
  },
};

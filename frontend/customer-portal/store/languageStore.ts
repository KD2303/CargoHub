import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'en' | 'hi' | 'mr';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Sidebar
    overview: "Overview",
    bookShipment: "Book Shipment",
    myOrders: "My Orders",
    payments: "Payments",
    support: "Support",
    settings: "Settings",
    addressBook: "Address Book",
    trackShipment: "Track Shipment",

    // TopNav
    dashboard: "Dashboard",

    // Settings
    manage: "Manage your profile, notifications, and preferences.",
    profile: "Profile Settings",
    profileDesc: "Manage your avatar, name, email address, and personal phone number details.",
    notifications: "Notifications",
    notificationsDesc: "Customize your alerts for deliveries, order status changes, and promos.",
    security: "Security",
    securityDesc: "Update your passwords, session access, and account privacy options.",
    preferences: "Preferences",
    language: "Language",
    languageDesc: "Select your preferred language",
    darkMode: "Dark Mode",
    darkModeDesc: "Toggle dark appearance",
    backToSettings: "Back to Settings",
    configure: "Configure",
    
    // Support
    helpCenter: "Help Center",
    helpCenterDesc: "Get answers to your questions and learn how to use CargoHub.",
    faq: "Frequently Asked Questions",
    
    // Payments
    transactions: "Transactions",
    
    // Addresses
    savedAddresses: "Saved Addresses",

    // Orders
    allStatus: "All Status",
    pending: "Pending",
    accepted: "Accepted",
    inTransit: "In Transit",
    delivered: "Delivered",
    cancelled: "Cancelled",
    orderId: "Order ID",
    route: "Route",
    vehicleType: "Vehicle Type",
    amount: "Amount",
    status: "Status",
    action: "Action",
    noOrders: "No orders found.",

    // Book
    newBooking: "New Booking",
    pickupDetails: "Pickup & Drop Details",
    cargoDetails: "Cargo Details",
    reviewPay: "Review & Pay",
  },
  hi: {
    // Sidebar
    overview: "अवलोकन",
    bookShipment: "शिपमेंट बुक करें",
    myOrders: "मेरे आदेश",
    payments: "भुगतान",
    support: "सहायता",
    settings: "सेटिंग्स",
    addressBook: "पता पुस्तिका",
    trackShipment: "शिपमेंट ट्रैक करें",

    // TopNav
    dashboard: "डैशबोर्ड",

    // Settings
    manage: "अपनी प्रोफाइल, सूचनाएं और प्राथमिकताएं प्रबंधित करें।",
    profile: "प्रोफाइल सेटिंग्स",
    profileDesc: "अपना अवतार, नाम, ईमेल और फोन नंबर प्रबंधित करें।",
    notifications: "सूचनाएं",
    notificationsDesc: "डिलीवरी, ऑर्डर स्टेटस और प्रोमो के लिए अलर्ट कस्टमाइज़ करें।",
    security: "सुरक्षा",
    securityDesc: "पासवर्ड, सत्र एक्सेस और गोपनीयता विकल्प अपडेट करें।",
    preferences: "प्राथमिकताएं",
    language: "भाषा",
    languageDesc: "अपनी पसंदीदा भाषा चुनें",
    darkMode: "डार्क मोड",
    darkModeDesc: "डार्क अपीयरेंस टॉगल करें",
    backToSettings: "सेटिंग्स पर वापस जाएं",
    configure: "कॉन्फ़िगर करें",
    
    // Support
    helpCenter: "सहायता केंद्र",
    helpCenterDesc: "अपने सवालों के जवाब पाएं और CargoHub का उपयोग करना सीखें।",
    faq: "अक्सर पूछे जाने वाले प्रश्न",
    
    // Payments
    transactions: "लेनदेन",
    
    // Addresses
    savedAddresses: "सहेजे गए पते",

    // Orders
    allStatus: "सभी स्थिति",
    pending: "लंबित",
    accepted: "स्वीकृत",
    inTransit: "रास्ते में",
    delivered: "पहुंचाया गया",
    cancelled: "रद्द",
    orderId: "ऑर्डर आईडी",
    route: "मार्ग",
    vehicleType: "वाहन का प्रकार",
    amount: "राशि",
    status: "स्थिति",
    action: "कार्रवाई",
    noOrders: "कोई आदेश नहीं मिला।",

    // Book
    newBooking: "नई बुकिंग",
    pickupDetails: "पिकअप और ड्रॉप विवरण",
    cargoDetails: "कार्गो विवरण",
    reviewPay: "समीक्षा और भुगतान",
  },
  mr: {
    // Sidebar
    overview: "आढावा",
    bookShipment: "शिपमेंट बुक करा",
    myOrders: "माझे आदेश",
    payments: "पेमेंट्स",
    support: "मदत",
    settings: "सेटिंग्ज",
    addressBook: "पत्ता पुस्तक",
    trackShipment: "शिपमेंट ट्रॅक करा",

    // TopNav
    dashboard: "डॅशबोर्ड",

    // Settings
    manage: "आपले प्रोफाइल, सूचना आणि प्राधान्ये व्यवस्थापित करा।",
    profile: "प्रोफाइल सेटिंग्ज",
    profileDesc: "आपला अवतार, नाव, ईमेल आणि फोन नंबर व्यवस्थापित करा।",
    notifications: "सूचना",
    notificationsDesc: "डिलिव्हरी, ऑर्डर स्टेटस आणि प्रोमोसाठी अलर्ट सानुकूलित करा।",
    security: "सुरक्षा",
    securityDesc: "पासवर्ड, सेशन एक्सेस आणि गोपनीयता पर्याय अपडेट करा।",
    preferences: "प्राधान्ये",
    language: "भाषा",
    languageDesc: "तुमची पसंतीची भाषा निवडा",
    darkMode: "डार्क मोड",
    darkModeDesc: "डार्क देखावा टॉगल करा",
    backToSettings: "सेटिंग्जकडे परत जा",
    configure: "कॉन्फ़िगर करा",
    
    // Support
    helpCenter: "मदत केंद्र",
    helpCenterDesc: "तुमच्या प्रश्नांची उत्तरे मिळवा आणि CargoHub कसे वापरावे ते शिका।",
    faq: "सतत विचारले जाणारे प्रश्न",
    
    // Payments
    transactions: "व्यवहार",
    
    // Addresses
    savedAddresses: "जतन केलेले पत्ते",

    // Orders
    allStatus: "सर्व स्थिती",
    pending: "प्रलंबित",
    accepted: "स्वीकारले",
    inTransit: "वाटेत",
    delivered: "वितरित",
    cancelled: "रद्द केले",
    orderId: "ऑर्डर आयडी",
    route: "मार्ग",
    vehicleType: "वाहनाचा प्रकार",
    amount: "रक्कम",
    status: "स्थिती",
    action: "कृती",
    noOrders: "कोणतेही आदेश आढळले नाहीत.",

    // Book
    newBooking: "नवीन बुकिंग",
    pickupDetails: "पिकअप आणि ड्रॉप तपशील",
    cargoDetails: "कार्गो तपशील",
    reviewPay: "पुनरावलोकन आणि पैसे द्या",
  }
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'en',
      setLanguage: (lang) => set({ language: lang }),
      t: (key) => {
        const lang = get().language;
        return translations[lang]?.[key] || translations['en']?.[key] || key;
      }
    }),
    {
      name: 'cargohub_language_store', // unique name
    }
  )
);

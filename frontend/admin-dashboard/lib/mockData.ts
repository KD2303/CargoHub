export const DASHBOARD_STATS = [
  { label: "Total Bookings Today", value: "247", change: "+12%", changeType: "up", accentColor: "blue" },
  { label: "Active Drivers Online", value: "89", change: "↑ from 74", changeType: "up", accentColor: "green" },
  { label: "Revenue Today (₹)", value: "₹1,84,320", change: "+8.2%", changeType: "up", accentColor: "purple" },
  { label: "Pending KYC", value: "3", change: "Needs review", changeType: "down", accentColor: "red" },
];

export const LIVE_EVENTS = [
  { id: 1, type: "purple", text: "New booking #BK-1842 — Raj Kumar, Mumbai→Pune", time: "just now" },
  { id: 2, type: "green", text: "Payment received ₹3,200 — Order #BK-1841", time: "2m ago" },
  { id: 3, type: "blue", text: "Driver Amit Singh went online", time: "5m ago" },
  { id: 4, type: "red", text: "Booking #BK-1839 — Cancelled", time: "12m ago" },
  { id: 5, type: "warning", text: "KYC submitted — Suresh Patel (Pending review)", time: "18m ago" },
];

export const BOOKING_TRENDS = [
  { day: "Mon", bookings: 180 },
  { day: "Tue", bookings: 195 },
  { day: "Wed", bookings: 210 },
  { day: "Thu", bookings: 190 },
  { day: "Fri", bookings: 230 },
  { day: "Sat", bookings: 260 },
  { day: "Sun", bookings: 247 },
];

export const RECENT_BOOKINGS = [
  { id: "BK-1842", customer: "Raj Kumar", route: "Mumbai → Pune", driver: "Finding...", amount: "₹4,500", status: "Finding Driver", time: "10:42 AM" },
  { id: "BK-1841", customer: "Anita Desai", route: "Delhi → Noida", driver: "Amit Singh", amount: "₹3,200", status: "Completed", time: "10:30 AM" },
  { id: "BK-1840", customer: "Vikram Tech", route: "Bangalore → Hosur", driver: "Ravi K", amount: "₹12,400", status: "Ongoing", time: "09:15 AM" },
  { id: "BK-1839", customer: "Sneha Patel", route: "Surat → Vapi", driver: "-", amount: "₹2,100", status: "Cancelled", time: "08:50 AM" },
  { id: "BK-1838", customer: "Rahul M", route: "Chennai → Vellore", driver: "Karthik R", amount: "₹6,800", status: "Ongoing", time: "08:10 AM" },
];

export const KYC_APPLICATIONS = [
  { id: 1, name: "Ravi Shankar", phone: "+91 98765 43210", vehicleType: "Mini Truck", plate: "MH 12 AB 3456", submitted: "2h ago", status: "PENDING" },
  { id: 2, name: "Deepak Verma", phone: "+91 87654 32109", vehicleType: "Tempo", plate: "DL 5S AB 7890", submitted: "5h ago", status: "PENDING" },
  { id: 3, name: "Suresh Patel", phone: "+91 76543 21098", vehicleType: "Container", plate: "RJ 14 CD 1122", submitted: "1d ago", status: "PENDING" },
];

export const DRIVERS = [
  { id: "DRV-101", name: "Amit Singh", phone: "+91 91234 56780", vehicle: "Mini Truck", plate: "MH 14 CC 1234", status: "Online", rating: "4.8", jobs: 142, joined: "12 Jan 2024" },
  { id: "DRV-102", name: "Karthik R", phone: "+91 92345 67891", vehicle: "Container", plate: "TN 09 AB 8765", status: "Online", rating: "4.9", jobs: 310, joined: "05 Nov 2023" },
  { id: "DRV-103", name: "Sunil Yadav", phone: "+91 93456 78902", vehicle: "Tempo", plate: "UP 16 DD 4321", status: "Offline", rating: "4.5", jobs: 89, joined: "22 Mar 2024" },
  { id: "DRV-104", name: "Rahul Sharma", phone: "+91 94567 89013", vehicle: "Mini Truck", plate: "DL 1C EE 5678", status: "Suspended", rating: "3.2", jobs: 45, joined: "10 Feb 2024" },
  { id: "DRV-105", name: "Ravi Shankar", phone: "+91 98765 43210", vehicle: "Mini Truck", plate: "MH 12 AB 3456", status: "Pending KYC", rating: "-", jobs: 0, joined: "Today" },
];

export const CUSTOMERS = [
  { id: "CUST-801", name: "Raj Kumar", contact: "raj@example.com", city: "Mumbai", bookings: 12, spent: "₹45,000", lastActive: "Today" },
  { id: "CUST-802", name: "Anita Desai", contact: "+91 88990 11223", city: "Delhi", bookings: 4, spent: "₹12,400", lastActive: "Yesterday" },
  { id: "CUST-803", name: "Vikram Tech", contact: "ops@vikramtech.in", city: "Bangalore", bookings: 56, spent: "₹4,50,000", lastActive: "2 days ago" },
  { id: "CUST-804", name: "Sneha Patel", contact: "sneha.p@email.com", city: "Surat", bookings: 2, spent: "₹6,500", lastActive: "1 week ago" },
];

export const PROMO_CODES = [
  { code: "CARGO50", discount: "₹50 off", type: "Flat", minOrder: "₹200 min", usage: "234/500", status: "Active", expiry: "31 Jul 2025" },
  { code: "NEWUSER20", discount: "20% off", type: "%", minOrder: "₹100 min", usage: "89/200", status: "Active", expiry: "30 Jun 2025" },
  { code: "MONSOON", discount: "₹100 off", type: "Flat", minOrder: "₹500 min", usage: "12/100", status: "Paused", expiry: "30 Sep 2025" },
  { code: "BIGHAUL", discount: "15% off", type: "%", minOrder: "₹1000 min", usage: "0/50", status: "Draft", expiry: "31 Dec 2025" },
];

export const REVENUE_TRANSACTIONS = [
  { id: "TXN-901", booking: "BK-1841", customer: "Anita Desai", amount: "₹3,200", fee: "₹480", payout: "₹2,720", mode: "UPI", date: "Today, 10:30 AM" },
  { id: "TXN-902", booking: "BK-1840", customer: "Vikram Tech", amount: "₹12,400", fee: "₹1,860", payout: "₹10,540", mode: "Card", date: "Today, 09:15 AM" },
  { id: "TXN-903", booking: "BK-1838", customer: "Rahul M", amount: "₹6,800", fee: "₹1,020", payout: "₹5,780", mode: "Cash", date: "Today, 08:10 AM" },
  { id: "TXN-904", booking: "BK-1835", customer: "Sunita L", amount: "₹1,500", fee: "₹225", payout: "₹1,275", mode: "UPI", date: "Yesterday, 06:45 PM" },
];

# PharmaStore ERP - Production-Ready Pharmacy Management

A high-performance, mobile-friendly, and offline-capable Pharmacy Management ERP designed specifically for Indian medical shops. Built with React 19, Firebase, and Gemini AI.

## 🚀 Key Features

- **Billing & POS**: Lightning-fast billing with barcode support, GST calculation, and keyboard shortcuts (F2 for Search, F4 for Billing).
- **Gemini AI Smart Search**: Integrated AI to suggest medicine substitutes based on salt composition and strength.
- **OCR AI Purchase Entry**: Scan physical purchase bills using Gemini AI to automatically populate inventory and batch details.
- **GST Module**: Automated CGST/SGST calculation and exportable reports for GSTR filing.
- **Inventory & Expiry**: Batch-wise tracking with real-time low-stock and near-expiry alerts.
- **PWA Ready**: Installable on Android/iOS/Desktop with offline data synchronization capabilities.
- **Advanced UI**: Powered by the "Bold Typography" design theme for maximum readability and speed.

## 🛠 Technology Stack

- **Frontend**: React 19, Tailwind CSS 4, Motion
- **Backend/DB**: Firebase Firestore & Authentication
- **AI Engine**: Google Gemini 1.5 Flash
- **Tools**: Vite, PWA Plugin, Recharts, jsPDF, Tesseract.js

## 📦 Setup & Deployment

### Prerequisites
- Node.js (v18+)
- Firebase Project
- Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd pharma-erp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_key_here
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   ```

## 📜 Deployment

This app is optimized for deployment on **Firebase Hosting**, **Vercel**, or **GitHub Pages**. For GitHub Pages, ensure you configure the base path in `vite.config.ts` if deploying to a sub-path.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

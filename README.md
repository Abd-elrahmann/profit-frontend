# Profit Frontend - Islamic Banking & Financial Management System

A comprehensive React-based frontend application for Islamic banking and financial management. This system provides complete financial operations management including loans (Salf), investments, accounting, treasury, zakah, and compliance with Islamic finance principles.

## 🚀 Features

### Core Financial Modules
- **Dashboard** - Overview with key metrics, charts, and quick actions
- **Loan Management (السلف)** - Islamic financing products and full loan lifecycle management
- **Client Management** - Clients with Kafeel (sponsor) support, documents, and statements
- **Investor Management (المستثمرين)** - Partner/investor accounts and profit distribution
- **Investors Withdrawal (الانسحابات)** - Partner withdrawal requests and processing
- **Bank Accounts** - Multi-bank account handling with limits and status tracking
- **Treasury (الصندوق)** - Cash flow and liquidity management
- **Installments (الدفعات)** - Loan repayment tracking and settlement
- **Chart of Accounts** - Hierarchical account structure management
- **Journal Entries** - Double-entry accounting with journals
- **General Ledger** - Full ledger view and reports
- **Period Closing** - Financial period management and closing procedures
- **Profit Distribution** - Islamic-compliant profit sharing calculations
- **Company Profit** - Company-level profit tracking
- **Zakah** - Islamic charity calculations and partner distributions
- **Saving Accounts** - Islamic saving products management

### Operational Modules
- **Client Collections** - Payment collection tracking and reports
- **Expenses** - Operational expense tracking and categorization
- **Income Statement** - Comprehensive financial reporting

### Templates & Communications
- **Contract Templates** - Dynamic contract generation and management
- **Message Templates** - Automated communication templates

### Administration & User
- **Employees** - User management
- **Roles & Permissions** - Granular role-based access control
- **Settings** - System configuration
- **Audit Logs (السجلات)** - Complete system activity tracking
- **Profile** - User profile with photo upload/delete, password change with visibility toggle

### Security & UX
- **JWT Authentication** - Secure token-based auth with refresh
- **Role-Based Permissions** - Module-level permission checking
- **RTL Support** - Right-to-left layout for Arabic
- **Arabic & English** - i18next internationalization
- **Dark Mode** - Theme toggle in profile
- **Toast Notifications** - react-toastify for feedback

### Technical Features
- **Export** - PDF and Excel export
- **File Upload** - Drag-and-drop with React Dropzone
- **Data Visualization** - Chart.js, Recharts
- **Rich Text** - React Quill for templates
- **Code Editor** - CodeMirror for template editing
- **Prefetching** - Proactive data loading via React Query

## 🛠️ Technology Stack

### Core
- **React 19** - With concurrent features
- **Vite 7** - Build tool and dev server
- **React Router DOM 7** - Client-side routing

### UI
- **Material-UI (MUI) 7** - Component library
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animations
- **React Icons & Lucide** - Icons

### Data & Forms
- **TanStack React Query** - Server state, caching, prefetching
- **Axios** - HTTP client with interceptors
- **Formik & Yup** - Form handling and validation
- **React Hook Form** - Form state

### i18n & Styling
- **i18next** - Arabic/English
- **Stylis RTL Plugin** - RTL support

### Export & Charts
- **Chart.js & React-ChartJS-2** - Charts
- **Recharts** - Declarative charts
- **jsPDF & pdf-lib** - PDF generation
- **xlsx** - Excel export
- **html2pdf.js** - HTML to PDF

### Editors & Utils
- **React Quill** - Rich text
- **@uiw/react-codemirror** - Code editor
- **date-fns & dayjs** - Date handling
- **React Dropzone** - File upload
- **React Helmet Async** - Document head

## 📋 Prerequisites

- Node.js v16+
- npm or yarn
- Backend API at configured URL

## 🚀 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd profit-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment**
   - API base URL is set in `src/config/Api.js`
   - Default: `https://api.solfweb.com`

4. **Development**
   ```bash
   npm run dev
   ```
   App runs at `http://localhost:3001`

5. **Production build**
   ```bash
   npm run build
   ```
   Output in `dist/`

6. **Preview build**
   ```bash
   npm run preview
   ```

## 🔧 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 3001) |
| `npm run build` | Production build |
| `npm run build:prod` | Build with production mode |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 🏗️ Project Structure

```
src/
├── components/           # Reusable components
│   ├── layouts/         # Navbar, Sidebar, Layout
│   ├── Profile/         # Profile header, modals, password change
│   ├── Contexts/       # Auth, Permissions, Notifications
│   ├── modals/         # AddEmployee, PaymentReceipt, etc.
│   ├── forms/          # AddClientForm, AddKafeelForm, EditDocuments, etc.
│   ├── clients/        # Client-related components
│   ├── loans/          # Loan components
│   ├── Treasury/       # Treasury components
│   ├── Zakah/          # Zakah components
│   ├── ProfitDistribution/
│   ├── Saving/
│   ├── roles/
│   ├── receipts/       # PDF/preview generators
│   ├── editors/       # RichTextEditor
│   ├── contractGenerators/
│   └── ui/             # PageLoader, FileUploadDropzone, etc.
├── pages/              # Route pages
│   ├── auth/           # Login, ForgotPassword, ResetPassword
│   ├── dashboard/      # Dashboard with tabs
│   ├── Clients/        # Clients, AddClient, AddKafeel, EditDocuments
│   ├── Investors/      # Investors, AddInvestor
│   ├── investorsWithdrawal/
│   ├── Loans/          # Loans
│   ├── Installments/   # Installments
│   ├── Banks/          # Banks
│   ├── treasury/       # Treasury
│   ├── chartOfAccounts/
│   ├── Journals/       # Journal entries
│   ├── generalLedger/
│   ├── periodClosing/
│   ├── profit/         # Profit distribution
│   ├── companyProfit/
│   ├── clientCollections/
│   ├── Zakah/          # Zakah
│   ├── Saving/        # Saving
│   ├── Templates/     # Contract & message templates
│   ├── Expenses/      # Expenses
│   ├── incomeStatement/
│   ├── Employees/      # Employees
│   ├── Roles/          # Roles
│   ├── logs/           # Audit logs
│   ├── Settings/       # Settings
│   └── Profile.jsx     # User profile
├── config/
│   ├── Api.js          # Axios instance, interceptors, token refresh
│   └── translationConfig.js
├── hooks/              # usePrefetch, etc.
├── utilities/          # Helpers, toastify
├── theme/              # ThemeContext
├── Translations/       # ar.json, en.json
├── routes.js           # Route definitions
├── sidebar.config.js   # Sidebar menu
└── main.jsx
```

## 🌐 Internationalization

- **Arabic (ar)** - Primary, RTL
- **English (en)** - Secondary, LTR
- Translations in `src/Translations/`

## 🔐 Authentication

- JWT with access + refresh tokens
- Automatic refresh via Axios interceptors
- 401 handling and redirect to login
- Protected routes with permission checks

## 📊 API Integration

The frontend calls a NestJS backend. Main areas:

- `/api/auth/*` - Login, profile, update-profile, upload-profile-image, profile-image (DELETE), update-password
- `/api/clients/*` - Clients, kafeels, documents
- `/api/partners/*` - Investors
- `/api/loans/*` - Loans
- `/api/repayments/*` - Installments
- `/api/accounting/*` - Journals, ledger, accounts
- `/api/treasury/*` - Treasury
- Plus many more modules

## 🎨 Themes

- MUI theme provider
- Tailwind utilities
- ThemeContext for dark/light toggle
- RTL styling for Arabic

## 📈 Performance

- Lazy-loaded routes
- React Query caching and prefetching
- Code splitting (manualChunks for react, mui, lodash)
- Debounced search where used

## 🤝 Contributing

1. Follow existing code style
2. Use meaningful commits
3. Test changes
4. Update docs when needed

## 📄 License

Proprietary – Islamic banking operations.

## 👨‍💻 Contact Developer

**Abdelrahman Mohamed**  
Frontend Developer  

- 📧 abd.elrahmann.mohamed1103@gmail.com  
- 📱 01276045715  
- 📍 Alexandria, Egypt  
- 🔗 [github.com/Abd-elrahmann](https://github.com/Abd-elrahmann)

## 🆘 Support

For technical support, contact the developer using the details above.

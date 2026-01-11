# Profit Frontend - Islamic Banking & Financial Management System

A comprehensive React-based frontend application for Islamic banking and financial management. This system provides complete financial operations management including loans, investments, accounting, treasury, and compliance with Islamic finance principles.

## 🚀 Features

### Core Financial Modules
- **Loan Management** - Islamic financing products and loan lifecycle management
- **Client Management** - Comprehensive client portfolio and relationship management
- **Investor Management** - Partner/investor accounts and profit distribution
- **Bank Account Management** - Multi-bank account handling with limits and status tracking
- **Treasury Management** - Cash flow and liquidity management
- **Accounting System** - Complete double-entry accounting with journals and general ledger
- **Chart of Accounts** - Hierarchical account structure management
- **Profit Distribution** - Islamic-compliant profit sharing calculations
- **Zakah Management** - Islamic charity calculations and distributions
- **Saving Accounts** - Islamic saving products management

### Advanced Features
- **Collections Management** - Client payment collection tracking
- **Expense Management** - Operational expense tracking and categorization
- **Period Closing** - Financial period management and closing procedures
- **Income Statements** - Comprehensive financial reporting
- **Contract Templates** - Dynamic contract generation and management
- **Message Templates** - Automated communication templates
- **Audit Logs** - Complete system activity tracking
- **Advanced Search** - Powerful filtering and search capabilities across all modules

### Security & Compliance
- **Role-Based Access Control** - Granular permissions system
- **JWT Authentication** - Secure token-based authentication
- **Multi-Language Support** - Arabic and English interfaces
- **RTL Support** - Right-to-left layout for Arabic users
- **Offline Detection** - Network status monitoring and handling

### Technical Features
- **Real-time Notifications** - Toast notifications and alerts
- **Export Capabilities** - PDF and Excel export functionality
- **Template Management** - Rich text and code template editors
- **Data Visualization** - Interactive charts and dashboards
- **File Upload** - Document and image upload with drag-and-drop

## 🛠️ Technology Stack

### Frontend Framework
- **React 19.1.1** - Latest React with concurrent features
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing

### UI & Design
- **Material-UI (MUI)** - Comprehensive component library
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Icons & Lucide** - Icon libraries

### State Management & Data
- **React Query (TanStack)** - Server state management
- **Axios** - HTTP client with interceptors
- **React Hook Form** - Form state management
- **Formik & Yup** - Advanced form handling and validation

### Internationalization & Styling
- **i18next** - Internationalization framework
- **Stylis & RTL Plugin** - Right-to-left styling support

### Data Visualization & Export
- **Chart.js & React-ChartJS-2** - Interactive charts
- **Recharts** - Declarative charting library
- **jsPDF & pdf-lib** - PDF generation
- **xlsx** - Excel file handling
- **html2pdf.js** - HTML to PDF conversion

### Rich Text & Code Editing
- **React Quill** - Rich text editor
- **CodeMirror** - Code editor component
- **@uiw/react-codemirror** - Enhanced CodeMirror wrapper

### Utilities
- **date-fns & dayjs** - Date manipulation
- **crypto-js** - Encryption utilities
- **lodash** - Utility functions
- **React Dropzone** - File upload component
- **React Helmet Async** - Document head management

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Backend API server running on the configured endpoint

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

3. **Environment Configuration**
   - Update API base URL in `src/config/Api.js` if needed
   - Default backend URL: `http://72.61.101.53:3003`

4. **Development Server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

5. **Build for Production**
   ```bash
   npm run build
   ```

6. **Preview Production Build**
   ```bash
   npm run preview
   ```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layouts/        # Layout components (Navbar, Sidebar, etc.)
│   ├── modals/         # Modal dialogs
│   ├── dashboardSections/  # Dashboard widgets
│   ├── loans/          # Loan-specific components
│   ├── Contracts/      # Contract management
│   └── ...
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Dashboard page
│   ├── Loans/          # Loan management
│   ├── Clients/        # Client management
│   └── ...
├── config/             # Configuration files
│   ├── Api.js          # API configuration
│   └── translationConfig.js  # i18n setup
├── hooks/              # Custom React hooks
├── utilities/          # Utility functions and helpers
├── theme/              # Theme configuration
├── Translations/       # Language files (ar.json, en.json)
├── routes.js           # Route definitions
└── sidebar.config.js   # Sidebar menu configuration
```

## 🌐 Internationalization

The application supports Arabic and English languages with full RTL support:

- **Arabic (ar)** - Primary language with RTL layout
- **English (en)** - Secondary language with LTR layout

Language files are located in `src/Translations/`.

## 🔐 Authentication & Security

- JWT token-based authentication
- Automatic token refresh and validation
- Secure API communication with Axios interceptors
- Role-based permissions system
- Protected routes with permission checking

## 📊 API Integration

The frontend connects to a backend API with the following key endpoints:
- Authentication (`/api/auth/*`)
- Loans management (`/api/loans/*`)
- Clients (`/api/clients/*`)
- Accounting (`/api/accounting/*`)
- And many more...

## 🎨 Themes & Styling

- **Material-UI Theme Provider** - Consistent theming
- **Tailwind CSS** - Utility classes
- **Custom Theme Context** - Dynamic theme switching
- **RTL Plugin** - Automatic RTL styling for Arabic

## 📈 Performance Features

- **Lazy Loading** - Code splitting for pages and components
- **React Query** - Efficient server state management and caching
- **Prefetching** - Proactive data loading for better UX
- **Debounced Search** - Optimized search performance
- **Virtual Scrolling** - For large data tables

## 🧪 Development Guidelines

### Code Quality
- ESLint configuration for code consistency
- Component composition over inheritance
- Custom hooks for reusable logic
- Proper error handling and loading states

### Security Best Practices
- Input validation with Yup schemas
- Secure API communication
- XSS prevention in rich text content
- Secure file upload handling

### Maintainability
- Modular component architecture
- Clear separation of concerns
- Comprehensive error boundaries
- Type-safe development (consider TypeScript migration)

## 🤝 Contributing

1. Follow the established code style and structure
2. Use meaningful commit messages
3. Test components thoroughly
4. Update documentation as needed
5. Follow Islamic finance principles in financial logic

## 📄 License

This project is proprietary software for Islamic banking operations.

## 🆘 Support

For technical support or questions, please contact the development team.

# DayFlow HRMS

A modern Human Resource Management System built with Next.js, MongoDB, and Tailwind CSS.

## Features

### Authentication & Authorization

- **Email OTP Verification**: Secure signup with email-based OTP verification
- **Role-Based Access Control**: Three user roles - Admin, HR, and Employee
- **JWT Authentication**: Secure token-based authentication with HTTP-only cookies

### Dashboard

- **Real-time Clock In/Out**: Track daily attendance with live status
- **Work Statistics**: View hours worked, leave balance, and attendance stats
- **Quick Actions**: Easy navigation to common tasks
- **Role-specific Views**: Different dashboards for Admin, HR, and Employees

### Employee Management (Admin/HR)

- **Add Employees**: Create new employee accounts with all details
- **Edit Profiles**: Update employee information
- **View Directory**: Browse all employees with search and filters
- **Department Management**: Organize employees by department

### Attendance Tracking

- **Clock In/Out**: Simple one-click attendance tracking
- **Break Management**: Track break times
- **Attendance History**: View past attendance records
- **Reports**: Generate attendance reports

### Payroll Management (Admin/HR)

- **Salary Structure**: Define basic salary, earnings, and deductions
- **Payroll Processing**: Generate monthly payrolls
- **Status Workflow**: Draft → Pending → Approved → Paid
- **Payslip Generation**: Create detailed payslips for employees

### Leave Management

- **Request Leave**: Employees can request time off
- **Approve/Reject**: HR/Admin can manage leave requests
- **Leave Balance**: Track remaining leave days
- **Leave Types**: Support for various leave categories

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcryptjs
- **Email**: Nodemailer for OTP verification
- **Icons**: Lucide React
- **UI Components**: Custom component library

## Project Structure

```
dayflow-hrms/
├── src/
│   ├── app/
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   │   ├── dashboard/     # Main dashboard
│   │   │   ├── employees/     # Employee management
│   │   │   ├── attendance/    # Attendance tracking
│   │   │   ├── payroll/       # Payroll management
│   │   │   ├── time-off/      # Leave management
│   │   │   └── profile/       # User profile
│   │   ├── auth/              # Authentication pages
│   │   │   ├── sign-in/       # Login page
│   │   │   └── sign-up/       # Registration page
│   │   └── api/               # API routes
│   │       ├── auth/          # Auth endpoints
│   │       ├── employees/     # Employee CRUD
│   │       ├── attendance/    # Attendance endpoints
│   │       └── payroll/       # Payroll endpoints
│   ├── components/
│   │   ├── layout/            # Layout components
│   │   └── ui/                # Reusable UI components
│   ├── context/               # React contexts
│   ├── lib/                   # Utility functions
│   ├── models/                # Mongoose models
│   ├── services/              # API services
│   └── types/                 # TypeScript types
├── public/                    # Static assets
└── ...config files
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd dayflow-hrms
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   MONGODB_URI=mongodb://localhost:27017/dayflow-hrms
   JWT_SECRET=your-super-secret-jwt-key

   # Email configuration (for OTP)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=DayFlow HRMS <your-email@gmail.com>
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open the app**

   Navigate to [http://localhost:3000](http://localhost:3000)

## User Roles

| Role         | Permissions                                                            |
| ------------ | ---------------------------------------------------------------------- |
| **Admin**    | Full system access, manage all users, payroll control, system settings |
| **HR**       | Manage employees, approve leaves, process payroll, view reports        |
| **Employee** | View own profile, clock in/out, request leave, view payslips           |

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/verify-otp` - Verify email OTP
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Employees

- `GET /api/employees` - List all employees
- `POST /api/employees` - Create employee (Admin/HR)
- `GET /api/employees/[id]` - Get employee details
- `PUT /api/employees/[id]` - Update employee
- `DELETE /api/employees/[id]` - Delete employee (Admin)

### Attendance

- `GET /api/attendance` - Get attendance records
- `POST /api/attendance/clock-in` - Clock in
- `POST /api/attendance/clock-out` - Clock out
- `GET /api/attendance/today` - Get today's attendance

### Payroll

- `GET /api/payroll` - List all payrolls (Admin/HR)
- `POST /api/payroll` - Create payroll
- `GET /api/payroll/[id]` - Get payroll details
- `PUT /api/payroll/[id]` - Update payroll
- `DELETE /api/payroll/[id]` - Delete payroll (Admin)

## Default Accounts

After setup, you can create accounts with these roles:

- Sign up and set role to "admin" in database for admin access
- HR and Employee accounts can be created through the admin panel

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the repository or contact the development team.

---

Built with ❤️ for the GCET Hackathon

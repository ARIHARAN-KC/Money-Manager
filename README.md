<p align="center">
  <img src="money-manager-frontend/public/logo.svg" alt="FinFlow Logo" width="120" />
</p>

<h1 align="center">FinFlow – Smart Money Management</h1>

<p align="center">
  Track income, expenses, budgets, and savings with a clean modern dashboard.
</p>


FinFlow is a modern **personal finance management web application** designed to help users track income, expenses, savings, budgets, and financial reports in one clean, intuitive dashboard.

Built with a focus on **clarity, usability, and real-world finance workflows**, FinFlow makes money tracking simple and visual.

---

## Features

### Authentication

* Secure email & password login
* Google OAuth sign-in
* Password recovery flow

### Dashboard

* Overview of **Total Income, Expenses, and Savings**
* Weekly / Monthly / Yearly insights
* Category-wise and division-wise summaries
* Recent transactions snapshot

### Accounts Management

* Create multiple financial accounts
* Set a **primary account**
* Track opening and current balances
* Account statistics (positive, zero, negative balances)
* Reconciliation support

### Transactions

* Add income & expense transactions
* Categorize by **Personal / Office** divisions
* Paginated transaction list
* Transfer money between accounts

### Transfers

* Instant transfers between accounts
* Balance validation
* Optional transfer notes

### Budget Planner

* Create monthly/weekly budgets by category
* Track budget utilization
* Built-in budgeting tips
* Visual progress indicators

### Financial Reports

* Filter by date range, category, division, and amount
* Income vs Expense vs Net Balance summary
* Export reports as **CSV or PDF**
* Optional inclusion of charts and summaries

---

## Screenshots

> Login, Dashboard, Accounts, Transactions, Transfers, Budget Planner, and Financial Reports UI

*(See images in the repository for full UI previews)*

---

## Tech Stack

**Frontend**

* React / Next.js
* Tailwind CSS
* Lucide Icons

**Backend**

* Node.js / API routes
* RESTful architecture

**Database**

* SQL / NoSQL (configurable)

**Auth & Security**

* Email/Password Authentication
* Google OAuth

---

## Getting Started

### Prerequisites

* Node.js >= 18
* npm or yarn

### Installation

```bash
git clone https://github.com/your-username/finflow.git
cd finflow
npm install
```

### Environment Variables

Create a `.env` file and configure:

```
env backend
NODE_ENV=
PORT=5000
MONGO_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=

# google oAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
```
```
env frontend
VITE_API_BASE_URL=http://localhost:5000/api
```

### Run Locally

```bash
npm run dev
```

Visit: `localhost:5173`

---

## Export & Reports

* CSV export for spreadsheets
* PDF export for sharing and compliance
* Custom filters for precise insights

---

## Use Cases

* Personal expense tracking
* Freelancers & creators managing income
* Small business finance overview
* Budget planning & savings tracking

---

## Roadmap

* Charts & visual analytics
* Recurring transactions
* Multi-currency support
* Cloud sync & backups
* Mobile app version

---

## Contributing

Contributions are welcome!

1. Fork the repo
2. Create a feature branch
3. Commit changes
4. Open a pull request

---

## License

MIT License

---
## Author
* Ariharan K C
* LinkedIn: https://www.linkedin.com/in/ariharankc07/
* Portfolio: https://ariharanportfoilo.vercel.app/

---
## Acknowledgements

Built with a passion for clean UI, financial clarity, and developer-friendly architecture.

> **FinFlow – Track smarter. Save better. Grow confidently.**

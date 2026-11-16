# 💰 Daily Budget

A mobile-first expense tracker built with React. Set a daily spending limit, log expenses in a tap, and understand your habits through history, calendar, and insights views.

---

## 📌 Overview

Daily Budget helps you spend smarter, one day at a time. On first launch, a one-time setup captures your budget preferences. After that, the app opens to a home dashboard that shows how much of today's budget you have used, with quick access to every other screen through a bottom navigation bar.

## ✨ Features

- **One-time setup:** guided onboarding that saves your budget settings before you enter the app
- **Home dashboard:** today's spending at a glance against your daily budget
- **Quick expense entry:** a floating add button is available on every screen
- **History:** browse and review all past expenses
- **Calendar view:** see spending day by day and spot over-budget days
- **Insights:** summaries and patterns showing where your money goes
- **Settings:** update your budget and preferences anytime
- **Mobile-friendly navigation:** bottom nav designed for one-handed use

## 🛠️ Tech Stack

| Area | Technology |
|------|------------|
| UI | React (functional components and hooks) |
| Routing | React Router (`BrowserRouter`, `Routes`) |
| State management | Context API (`AppProvider`, `useApp`) |

## 📁 Project Structure

```
src/
├── App.jsx                     # Routes and setup guard
├── context/
│   └── AppContext.jsx          # Global state (settings, expenses)
├── components/
│   ├── BottomNav.jsx           # Bottom navigation bar
│   └── FloatingAddButton.jsx   # Quick-add expense button
└── pages/
    ├── Setup.jsx               # First-time onboarding
    ├── Home.jsx                # Daily dashboard
    ├── AddExpense.jsx          # Add a new expense
    ├── History.jsx             # Past expenses
    ├── Calendar.jsx            # Calendar spending view
    ├── Insights.jsx            # Spending insights
    └── Settings.jsx            # Preferences
```

## 🧭 App Flow

1. **First launch:** every route redirects to `Setup` until `settings.isSetupDone` is true.
2. **After setup:** the app unlocks `/`, `/add`, `/history`, `/calendar`, `/insights`, `/settings`, and `/setup`.
3. **Unknown routes:** redirect to the home page.

| Route | Page |
|-------|------|
| `/` | Home |
| `/add` | Add Expense |
| `/history` | History |
| `/calendar` | Calendar |
| `/insights` | Insights |
| `/settings` | Settings |
| `/setup` | Setup |

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or later
- npm (or yarn)

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/daily-budget.git

# Go into the project folder
cd daily-budget

# Install dependencies
npm install

# Start the development server
npm run dev
```

Then open the local URL shown in your terminal (usually `http://localhost:5173`).

> If your project was created with Create React App, use `npm start` instead of `npm run dev`.

### Build for production

```bash
npm run build
```

## 🔮 Future Improvements

- Weekly and monthly budget modes
- Expense categories with custom icons
- Export data as CSV
- Dark mode
- Cloud sync across devices

## 🤝 Contributing

Contributions, issues, and feature requests are welcome. Fork the repo, create a feature branch, and open a pull request.


## 👤 Author

**Hiral Chudasama**
B.Sc. IT, JG University, Ahmedabad

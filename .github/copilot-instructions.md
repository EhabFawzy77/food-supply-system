# Food Supply System - AI Assistant Guidelines

## Project Overview

**food-supply-system** is a comprehensive food supply chain management application built with Next.js 16 and MongoDB. It manages customers, suppliers, products, inventory, sales, purchases, and payments for food distribution companies.

**Key Stack:**
- Frontend: Next.js (App Router), React 19, TailwindCSS
- Backend: Next.js API Routes, Node.js
- Database: MongoDB + Mongoose ODM
- Auth: JWT + bcryptjs
- UI Components: Lucide React icons, Recharts for dashboards

---

## Architecture & Data Flow

### Core Data Model
All data is stored exclusively in **MongoDB** (no hardcoded data in code):
- **Users**: Manage system access with roles (admin, user)
- **Products**: Food items with pricing and suppliers
- **Suppliers**: Food suppliers with contact info
- **Customers**: Retail/wholesale buyers with credit limits
- **Sales**: Point-of-sale transactions with multiple payment methods
- **Purchases**: Orders from suppliers with inventory tracking
- **Payments**: Payment records linked to sales/purchases
- **Stock**: Inventory tracking with movement history
- **Expenses**: Operating costs tracking

**Location:** `lib/models/*.js` - Mongoose schemas with business logic

### API Architecture
- **Pattern:** RESTful API routes in `app/api/`
- **Database Connection:** Automatic via `lib/mongodb.js` on each route
- **Authentication:** JWT in localStorage (client-side) + request headers
- **Middleware Stack:** Auth, CORS, error handling, rate limiting in `lib/middleware/`

**Example Route Structure:**
```
app/api/sales/[id]/route.js        → CRUD operations
app/api/sales/stats/route.js       → Aggregated analytics
app/api/backup/create/route.js     → Database operations
```

### Frontend Data Flow
1. **Contexts** (`contexts/*.jsx`): Global state (AppContext for auth, CartContext for sales)
2. **Pages** (`app/dashboard/*`): UI pages with React hooks
3. **API Layer** (`lib/utils/api.js`): Centralized fetch utility with token injection
4. **Utils** (`lib/utils/*.js`): Formatters, validators, calculations, exports

---

## Critical Developer Workflows

### Database Setup
```bash
npm run dev                    # Start dev server on port 3010
# MongoDB must be running (local or cloud URI in .env)
```

### Database Initialization
- **Do NOT hardcode data** - removed from `scripts/seed.js`
- Create users/products/suppliers via API endpoints or admin UI
- Seed script now only clears collections with warnings

### Adding New Features

**CRUD Example: New "Expenses" Feature**
1. Model: `lib/models/Expense.js` - Define schema with validation
2. API Route: `app/api/expenses/route.js` - GET/POST endpoints
3. Page: `app/dashboard/expenses/page.jsx` - React component with hooks
4. Utilities: Add validators/formatters to `lib/utils/` if needed

**Required Patterns:**
- Always `await connectDB()` at route start
- Use middleware: `authenticate` → `errorHandler`
- Return consistent JSON: `{ success, data/error, message }`
- Store only ObjectIds, never embed data

### Key Files for Understanding System Behavior
- `app/api/auth/login/route.js` - Authentication pattern
- `lib/models/Sale.js` - Complex model with calculations
- `contexts/AppContext.jsx` - State management pattern
- `app/dashboard/sales/page.jsx` - Page + data fetching pattern
- `lib/utils/api.js` - API communication centralization

---

## Project-Specific Patterns & Conventions

### No Hardcoded Data
✅ **DO:** Fetch from MongoDB via API
```javascript
const response = await fetch('/api/products');
const products = await response.json();
```

❌ **DON'T:** Use arrays in code
```javascript
const products = [{ name: 'Rice', price: 25 }]; // ❌ REMOVED
```

### Arabic-First UI
- All user-facing text in Arabic
- RTL layout: `dir="rtl"` in form inputs
- Date format: `DD/MM/YYYY` (see `lib/utils/date.js`)
- Locale: Egypt Arabic with currency in EGP

### Error Handling Strategy
- Middleware catches errors: `lib/middleware/errorHandler.js`
- Client-side toast notifications via `AppContext.addNotification()`
- Always return status codes: 401 (auth), 403 (permission), 500 (server)

### State Management Rules
- **Global:** AppContext (user, token, notifications)
- **Page-level:** React useState for forms, data loading
- **Cart:** CartContext for sales transactions (temporary)
- **Persistence:** localStorage for auth token + user data only

### File Organization
```
lib/
  models/        → Mongoose schemas (DB layer)
  middleware/    → Express-like middleware functions
  utils/         → Helpers (formatters, validators, API calls)
  mongodb.js     → DB connection management

app/api/         → Next.js route handlers (REST endpoints)
app/dashboard/   → Authenticated pages with layouts
contexts/        → React Context API providers
components/      → Reusable UI components (minimal custom)
```

---

## Common Gotchas & Debugging

| Issue | Solution |
|-------|----------|
| 404 on API route | Check route file exists at exact path, e.g., `app/api/sales/route.js` |
| MongoDB connection timeout | Verify MONGODB_URI env var, ensure MongoDB service running |
| Auth token missing | Check localStorage has `authToken`, verify JWT_SECRET matches |
| Data not updating | Always `await model.save()` or use `Model.create()` |
| CORS errors | Check middleware/cors.js allowlist, ensure Content-Type header set |

---

## Best Practices for This Codebase

1. **Always use ObjectIds** for relationships - never store full objects in documents
2. **Validate input** before DB queries using validators in `lib/utils/validators.js`
3. **Fetch only needed fields** - use Mongoose `select()` to exclude passwords/sensitive data
4. **Use transactions** for multi-step operations (sales + stock updates)
5. **Test API routes** with real ObjectIds from MongoDB, not mock IDs
6. **Handle async properly** - use `await` and error boundaries in components
7. **Follow JWT pattern** - always verify token in `@@ @` middleware before route logic

---

## Environment & Configuration

**Required .env variables:**
```
MONGODB_URI=mongodb://localhost:27017/food_supply_system  # or MongoDB Atlas URI
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

**Port Configuration:**
- Dev: `npm run dev` → port 3010
- Start: `npm start` → port 3010
- Default localhost: http://localhost:3010

---

## When Adding New Data Types

**Checklist:**
- [ ] Create model in `lib/models/NewModel.js` with schema + validation
- [ ] Create API routes: `app/api/newmodel/route.js` (GET/POST), `[id]/route.js` (PUT/DELETE)
- [ ] Add page in `app/dashboard/newmodel/page.jsx` with full CRUD UI
- [ ] Create validators in `lib/utils/validators.js` if needed
- [ ] Export model in route file: `import NewModel from '../../lib/models/NewModel.js'`
- [ ] Never hardcode test data - use seeding script to populate MongoDB only

# Zorvyn Finance API

This is the backend for the Zorvyn Finance Data Processing and Access Control Assignment. It is built using Node.js, Express 4.x, TypeScript, and MongoDB (via Mongoose). It follows an adaptable MVC (Model-View-Controller) architecture optimized for RESTful API services.

##  Getting Started

### Prerequisites
- Node.js (v18 or above recommended)
- MongoDB running locally or a MongoDB Atlas URI

### Setup Process
1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Setup Environmental Variables:**
   Create a `.env` file within the root directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/zorvyn_finance
   JWT_SECRET=zorvyn_secret_key_1234
   NODE_ENV=development
   ```
3. **Run Development Server:**
   ```bash
   npm run dev
   ```
4. **Build for Production:**
   Output distributable compiled structures via:
   ```bash
   npm run build
   npm start
   ```

---

##  API Explanation & Testing

We have built robust documentation to make testing the APIs seamless. You can explore and test the endpoints using either the built-in Swagger UI or Postman.

### Option 1: Swagger UI (Interactive Dashboard)
Once your server is running, navigate to:
**[http://localhost:5000/api/docs](http://localhost:5000/api/docs)**

This dashboard provides a graphical overview of all available endpoints. Because this API is protected, you must log in first:
1. Expand the `POST /api/auth/register` to create an **Admin** user.
2. Use `POST /api/auth/login` to retrieve your JWT token.
3. Click the **"Authorize"** button at the very top of the page and paste your token. You can now execute and test any underlying `Records`, `Users`, or `Dashboard` operations directly in the browser!

### Option 2: Postman Collection
A pre-formatted Postman collection is included in the project root (`Zorvyn_Finance_API.postman_collection.json`). Import it into Postman to instantly access all endpoints fully mapped with standard JSON payloads.

---

##  Project Architecture

The project strictly encapsulates domain responsibilities enforcing separation of concerns:
- `src/models`: Domain schemas mapped to MongoDB documents.
- `src/controllers`: Core business logic serving as the brain of the operations, decoupled from protocol handling.
- `src/routes`: Maps controllers to structured endpoint pathnames.
- `src/schemas`: Outlines `Zod` validation definitions explicitly enforcing strict input expectations.
- `src/middlewares`: Encapsulate global application checks like Authorization decoding (`protect`), Role-based access validation (`restrictTo`), payload validation (`validate`), and error interception (`errorHandler`).

### Access Control Highlights
- **Viewer**: Can only access the read-only Dashboard summaries.
- **Analyst**: Can view Records and the Dashboard summaries.
- **Admin**: Full access (Create, Read, Update, Delete records, and manage User structures).

---

##  Assumptions Made

During the implementation, the following assumptions were made:
1. **Robust Persistence Over Mocking:** Instead of using an in-memory datastore, MongoDB was fully implemented as it provides a superior foundation for handling strict financial relationships.
2. **Dashboard Chronology:** Financial trends (like Monthly Summaries) are calculated based on the user-provided `date` tag of a record, **not** the underlying database `createdAt` metadata, since financial records are frequently backdated.
3. **Security Defaults:** Users are assigned a default role of `Viewer` upon registration to embrace a "least privilege" security model. Elevation to `Admin` or `Analyst` must be explicitly provided in the payload or verified.
4. **Soft Matching Constraints:** Query parameters provided in the `/api/records` fetching route rely on direct match constraints (`category`, `type`), which is optimal for a targeted dashboard UI compared to heavy text-based regex search layers.

---

##  Tradeoffs Considered

1. **Aggregation Pipelines vs. Pre-calculation**
   - *Choice:* The dashboard summary calculates values dynamically via MongoDB `$group` aggregation pipelines on every request.
   - *Tradeoff:* For massive datasets, doing real-time calculation is slower. However, it perfectly guarantees numeric accuracy without having to build and maintain a complex, brittle "double-entry ledger" pre-calculation cache whenever an older record is modified or deleted.

2. **Zod Validation vs. Native Mongoose Validation**
   - *Choice:* Validating payloads strictly inside an Express middleware using `Zod`.
   - *Tradeoff:* This introduces a slight duplication as we declare structures in Zod and again in Mongoose. However, validating exactly at the HTTP boundary prevents malformed queries from even reaching the controllers, significantly saving unnecessary downstream database connection overhead.

3. **Soft Deletion vs. Hard Deletion**
   - *Choice:* Implemented Soft-deletions using an `isActive` boolean flag on financial records.
   - *Tradeoff:* Doing simple hard-deletions (`deleteOne`) makes database queries significantly simpler natively as there are no "hidden" records to filter out. However, due to the strict auditing requirements characteristic of enterprise financial tech, dropping raw monetary records permanently is an insecure anti-pattern. The tradeoff cost of adding `{ $match: { isActive: true } }` globally across all aggregation scopes is well worth the ability to instantly revert accidental deletions.

4. **MVC Architecture Adaptations**
   - *Choice:* Implemented a simplified "Routes-Controller-Model" layout. 
   - *Tradeoff:* Traditional MVC mandates strict rendering "Views" managed by the backend. Since this is an API-only service engineered for external dashboard ingestion, the 'View' constraint was deliberately traded out in favor of clean JSON serialization layers.

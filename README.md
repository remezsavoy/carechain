# CareChain

CareChain is a full-stack medical records management platform that combines a role-based healthcare workflow with blockchain-backed record integrity. The application lets administrators, doctors, and patients manage healthcare activity through a React frontend and an Express/MongoDB backend, while critical medical contract data is anchored on-chain through a Solidity smart contract deployed with Hardhat.

## Highlights

- Medical records and treatment contracts managed across dedicated dashboards for admins, doctors, and patients
- Blockchain integration for creating, updating, approving, soft-deleting, and restoring medical contracts
- Solidity smart contract development and deployment via Hardhat
- MongoDB-backed user and appointment data
- Authentication flows including registration, login, password reset, and token verification
- Support request handling and administrative oversight tools

## Architecture

### Client

The `client/` application is a React frontend built with Create React App. It includes separate user experiences for:

- Administrators: user management, support request review, and global medical contract visibility
- Doctors: dashboard access, patient contract management, and appointment handling
- Patients: dashboard access, contract review/approval, profile management, and appointments

Core frontend routing is defined in `client/src/App.js`, with role-based access determining which dashboard and workflow pages are available.

### Server

The `server/` application is an Express API with:

- Authentication routes
- User management routes
- Appointment routes
- Support request routes
- Medical contract routes

The backend connects to MongoDB and integrates with Ethereum-compatible blockchain infrastructure through `ethers`, `web3`, and a Solidity contract.

### Blockchain Layer

The blockchain integration is centered on `server/contracts/MedicalContract.sol` and `server/web3Service.js`.

The smart contract stores medical contract metadata such as:

- Contract ID
- Patient ID
- Doctor ID
- Treatment type
- Description
- Creation and update timestamps
- Approval status
- Deletion status

Using Hardhat, the project can deploy the `MedicalContract` contract to a local Ganache network. The Node.js backend then interacts with the deployed contract to:

- Create medical contracts
- Update treatment details
- Retrieve contracts by patient or doctor
- Retrieve all contracts for admin-level review
- Approve contracts from the patient side
- Mark contracts as deleted or restore them

## Tech Stack

- Frontend: React, React Router, Axios, Bootstrap, Tailwind CSS
- Backend: Node.js, Express, Mongoose, JWT, Cookie Parser, CORS, Nodemailer
- Blockchain: Solidity, Hardhat, Ethers, Web3, Ganache
- Database: MongoDB

## Repository Structure

```text
carechain/
|-- client/                     # React frontend
|   |-- public/
|   `-- src/
|       `-- pages/              # Admin, Doctor, Patient flows
|-- server/                     # Express API + blockchain layer
|   |-- api/                    # MongoDB connection/helpers
|   |-- contracts/              # Solidity smart contracts
|   |-- artifacts/              # Hardhat build artifacts
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- scripts/                # Hardhat deployment scripts
|   |-- utils/
|   |-- hardhat.config.js
|   |-- server.js
|   `-- web3Service.js
`-- README.md
```

## Local Setup

### Prerequisites

- Node.js and npm
- MongoDB running locally
- Ganache running locally on `http://127.0.0.1:7545`

### 1. Install dependencies

```bash
cd client
npm install
```

```bash
cd server
npm install
```

### 2. Configure server environment

Create a `.env` file in `server/` based on `server/.env.example`.

Expected variables:

- `JWT_SECRET`
- `CONTRACT_ADDRESS`
- `PRIVATE_KEY`
- `GANACHE_RPC_URL`

### 3. Deploy the smart contract

From `server/`:

```bash
npx hardhat run scripts/deploy.js --network ganache
```

After deployment, copy the deployed contract address into `server/.env` as `CONTRACT_ADDRESS`.

### 4. Start the backend

From `server/`:

```bash
node server.js
```

The API runs on `http://localhost:5000`.

### 5. Start the frontend

From `client/`:

```bash
npm start
```

The frontend runs on `http://localhost:3000`.

## Key Functional Areas

### Medical Records Management

CareChain is designed around medical record coordination between doctors and patients. Doctors can create and update treatment contracts, patients can review and approve them, and administrators can oversee the full system. This gives the platform a clear audit-oriented workflow for managing medical interactions.

### Blockchain Integrity

Instead of keeping medical contract activity only in a traditional backend, CareChain also records contract state through a Solidity smart contract. Hardhat is used for development and deployment, while the backend bridges the web application and blockchain network through `ethers` and `web3`. This provides stronger traceability for medical contract lifecycle events.

## Notes For GitHub Upload

- Sensitive environment values should remain in `server/.env` only and must not be committed
- Build outputs, node modules, generated blockchain artifacts, archives, and local IDE files should remain ignored
- The included `server/.env.example` is safe to publish and documents the required configuration keys

## Current Entry Points

- Frontend entry: `client/src/App.js`
- Backend entry: `server/server.js`
- Hardhat config: `server/hardhat.config.js`
- Smart contract: `server/contracts/MedicalContract.sol`
- Blockchain service bridge: `server/web3Service.js`

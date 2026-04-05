const { ethers } = require("ethers");
require("dotenv").config();
const fs = require("fs");

const provider = new ethers.JsonRpcProvider(process.env.GANACHE_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const signer = wallet.connect(provider);

const contractABI = JSON.parse(fs.readFileSync("./artifacts/contracts/MedicalContract.sol/MedicalContract.json")).abi;
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new ethers.Contract(contractAddress, contractABI, signer);

// Creates a medical contract on the blockchain and waits for transaction confirmation
async function createMedicalContract(patientId, doctorId, treatmentType, description) {
    try {
        console.log(`🔍 Creating contract for Patient: ${patientId}, Doctor: ${doctorId}`);
        const tx = await contract.createContract(patientId, doctorId, treatmentType, description);
        await tx.wait();
        console.log("✅ Contract created successfully");
    } catch (error) {
        console.error("❌ ERROR creating contract:", error.reason || error);
        throw error;
    }
}

// Updates an existing medical contract on the blockchain
async function updateMedicalContract(contractId, newTreatmentType, newDescription) {
    try {
        console.log(`🔍 Updating contract ID: ${contractId}`);
        const tx = await contract.updateContract(contractId, newTreatmentType, newDescription);
        await tx.wait();
        console.log("✅ Contract updated successfully");
    } catch (error) {
        console.error("❌ ERROR updating contract:", error.reason || error);
        throw error;
    }
}

// Fetches and formats all medical contracts associated with a given patient from the blockchain
async function getContractsByPatient(patientId) {
    try {
        console.log(`🔍 Fetching contracts for Patient ID: ${patientId}`);
        const contracts = await contract.getContractsByPatient(patientId);
        return contracts.map(c => ({
            contractId: Number(c.contractId),
            patientId: Number(c.patientId),
            doctorId: Number(c.doctorId),
            treatmentType: c.treatmentType,
            description: c.description,
            createdAt: new Date(Number(c.createdAt) * 1000).toISOString(),
            lastUpdated: new Date(Number(c.lastUpdated) * 1000).toISOString(),
            isApproved: c.isApproved
        }));
    } catch (error) {
        console.error("❌ ERROR fetching contracts by patient:", error);
        return [];
    }
}

// Fetches and formats all medical contracts associated with a given doctor from the blockchain
async function getContractsByDoctor(doctorId) {
    try {
        console.log(`🔍 Fetching contracts for Doctor ID: ${doctorId}`);
        const contracts = await contract.getContractsByDoctor(doctorId);
        return contracts.map(c => ({
            contractId: Number(c.contractId),
            patientId: Number(c.patientId),
            doctorId: Number(c.doctorId),
            treatmentType: c.treatmentType,
            description: c.description,
            createdAt: new Date(Number(c.createdAt) * 1000).toISOString(),
            lastUpdated: new Date(Number(c.lastUpdated) * 1000).toISOString(),
            isApproved: c.isApproved
        }));
    } catch (error) {
        console.error("❌ ERROR fetching contracts by doctor:", error);
        return [];
    }
}

// Approves a medical contract on the blockchain
async function approveMedicalContract(contractId, patientId) {
    try {
        console.log(`🔍 Approving contract ID: ${contractId} by Patient ID: ${patientId}`);

        // approveContract (SOL FILE)
        const tx = await contract.approveContract(contractId, patientId);
        await tx.wait();
        console.log("✅ Contract approved successfully");
    } catch (error) {
        console.error("❌ ERROR approving contract:", error.reason || error);
        throw error;
    }
}

// Fetches all medical contracts from the blockchain
const getAllContracts = async () => {
    try {
        console.log("🔍 Fetching all contracts from the blockchain");

        const contracts = await contract.getAllContracts();  // קריאה לפונקציה מה-Smart Contract
        const formattedContracts = contracts.map(c => ({
            contractId: Number(c.contractId),
            patientId: Number(c.patientId),
            doctorId: Number(c.doctorId),
            treatmentType: c.treatmentType,
            description: c.description,
            createdAt: new Date(Number(c.createdAt) * 1000).toISOString(),
            lastUpdated: new Date(Number(c.lastUpdated) * 1000).toISOString(),
            isApproved: c.isApproved,
            isDeleted: c.isDeleted
        }));

        return formattedContracts;
    } catch (error) {
        console.error("❌ Error fetching all contracts:", error);
        throw error;
    }
};

// Marks a medical contract as deleted on the blockchain
const markContractAsDeleted = async (contractId) => {
    try {
        console.log(`🔍 Marking contract ${contractId} as deleted on the blockchain.`);
        await contract.markAsDeleted(contractId);
        console.log(`✅ Contract ${contractId} marked as deleted.`);
    } catch (error) {
        console.error("❌ Error marking contract as deleted:", error);
        throw new Error("Failed to mark contract as deleted.");
    }
};

// Restores a previously deleted medical contract on the blockchain
const markContractAsNotDeleted = async (contractId) => {
    try {
        console.log(`🔄 Restoring contract ${contractId}...`);
        await contract.markAsNotDeleted(contractId);  // קריאה לפונקציה מתאימה בחוזה החכם
        console.log(`✅ Contract ${contractId} restored.`);
    } catch (error) {
        console.error("❌ Error restoring contract:", error);
        throw new Error("Failed to restore contract.");
    }
};

module.exports = {
    createMedicalContract,
    updateMedicalContract,
    getContractsByPatient,
    getContractsByDoctor,
    approveMedicalContract,
    getAllContracts,
    markContractAsDeleted,
    markContractAsNotDeleted
};
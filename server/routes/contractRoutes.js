const express = require('express');
const { authenticateToken, authenticateAdminToken } = require('../middleware/jwt');
const { User } = require('../api/mongodb');
const {
    createMedicalContract,
    updateMedicalContract,
    getContractsByPatient,
    getContractsByDoctor,
    approveMedicalContract,
    getAllContracts,
    markContractAsDeleted,
    markContractAsNotDeleted
} = require('../web3Service');

const router = express.Router();

// New Contract
router.post("/", authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, error: "❌ Unauthorized: No token provided" });
        }

        // Doctors only!
        if (req.user.userType !== 1) {
            return res.status(403).json({ success: false, error: "❌ Access denied. Only doctors can create contracts." });
        }

        const { patientId, doctorId, treatmentType, description } = req.body;

        await createMedicalContract(patientId, doctorId, treatmentType, description);

        res.status(201).json({
            success: true,
            message: "✅ Contract created successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, error: "❌ Failed to create contract: " + error.message });
    }
});

// Contract update
router.put("/:id", authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "❌ Unauthorized: No token provided" });
        }

        const { newTreatmentType, newDescription } = req.body;
        await updateMedicalContract(req.params.id, newTreatmentType, newDescription);
        res.status(200).send("✅ Contract updated successfully");
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get contracts by Patient ID
router.get("/patient/:patientId", authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "❌ Unauthorized: No token provided" });
        }

        const contracts = await getContractsByPatient(req.params.patientId);
        res.status(200).json(contracts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get contracts by Doctor ID
router.get("/doctor/:doctorId", authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "❌ Unauthorized: No token provided" });
        }

        const contracts = await getContractsByDoctor(req.params.doctorId);
        res.status(200).json(contracts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Approve contract
router.put("/:id/approve", authenticateToken, async (req, res) => {
    try {
        const contractId = Number(req.params.id);
        const patientId = req.user.idNumber;

        console.log("🔍 Headers:", req.headers);
        console.log("🧐 req.body:", req.body);

        // Checks if you have the right to approve this contract
        if (isNaN(contractId) || isNaN(patientId)) {
            console.log(`🔍 Invalid contract ID: ${contractId}, Patient ID: ${patientId}`);
            return res.status(400).json({ success: false, error: "❌ Invalid contractId or patientId" });
        }

        console.log(`🔍 Approving contract ID: ${contractId}, Patient ID: ${patientId}`);

        await approveMedicalContract(contractId, patientId);

        res.status(200).json({ success: true, message: "✅ Contract approved successfully" });
    } catch (error) {
        console.error("❌ Error approving contract:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

// Contacts "deletion" - just disactivate
router.put("/delete/:id", authenticateAdminToken, async (req, res) => {
    try {
        const contractId = Number(req.params.id);

        if (isNaN(contractId)) {
            return res.status(400).json({ error: "❌ Invalid contract ID" });
        }

        console.log(`🛠 Marking contract ${contractId} as deleted`);

        await markContractAsDeleted(contractId);

        res.status(200).json({ message: `✅ Contract ${contractId} marked as deleted.` });
    } catch (error) {
        console.error("❌ Error deleting contract:", error);
        res.status(500).json({ error: "Failed to delete contract." });
    }
});

// Restore contract
router.put("/:id/restore", authenticateToken, async (req, res) => {
    try {
        const contractId = Number(req.params.id);
        await markContractAsNotDeleted(contractId);
        res.status(200).json({ success: true, message: "✅ Contract restored successfully" });
    } catch (error) {
        console.error("❌ Error restoring contract:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

// Get all contacts (Admin Only!)
router.get('/contractsAdmin', authenticateAdminToken, async (req, res) => {
    try {
        const allContracts = await getAllContracts();  // שליפת כל החוזים מה-Blockchain
        console.log("📦 All fetched contracts:", allContracts);

        // שליפת שמות רופאים ומטופלים ממסד הנתונים
        const enhancedContracts = await Promise.all(allContracts.map(async (contract) => {
            const doctor = await User.findOne({ idNumber: contract.doctorId }, "firstName lastName");
            const patient = await User.findOne({ idNumber: contract.patientId }, "firstName lastName");
            return {
                ...contract,
                doctorName: doctor ? `${doctor.firstName} ${doctor.lastName}` : "Unknown",
                patientName: patient ? `${patient.firstName} ${patient.lastName}` : "Unknown"
            };
        }));

        res.status(200).json(enhancedContracts);
    } catch (error) {
        console.error("Error fetching contracts:", error);
        res.status(500).json({ error: "Failed to fetch contracts" });
    }
});

module.exports = router;
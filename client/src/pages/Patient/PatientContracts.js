import React, { useState, useEffect } from "react";
import { getContractsByPatient, getUserDetails, approveContract, getUserById } from "../../api/api";
import "./PatientContracts.css";
import logo from "../../assets/CareChain.png";

const PatientContracts = () => {
    const [contracts, setContracts] = useState([]);
    const [patientId, setPatientId] = useState("");
    const [selectedContract, setSelectedContract] = useState(null);
    const [doctorNames, setDoctorNames] = useState({});

    // שליפת פרטי המטופל
    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await getUserDetails();
                setPatientId(response.data.idNumber);
            } catch (err) {
                alert("Failed to fetch user details.");
            }
        };
        fetchUserDetails();
    }, []);

    useEffect(() => {
        if (!patientId) return;
        const fetchContracts = async () => {
            try {
                const data = await getContractsByPatient(patientId);
                setContracts(data);

                data.forEach(async (contract) => {
                    if (!doctorNames[contract.doctorId]) {
                        const doctor = await getUserById(contract.doctorId);
                        setDoctorNames((prev) => ({
                            ...prev,
                            [contract.doctorId]: `${doctor.firstName} ${doctor.lastName}`,
                        }));
                    }
                });
            } catch (err) {
                alert("Failed to load contracts.");
            }
        };
        fetchContracts();
    }, [patientId]);

    // אישור חוזה
    const handleApprove = async (contractId) => {
        try {
            const response = await approveContract(contractId);
            if (response.success) {
                setContracts((prevContracts) =>
                    prevContracts.map((contract) =>
                        contract.contractId === contractId ? { ...contract, isApproved: true } : contract
                    )
                );
                alert("✅ Contract approved successfully!");
            } else {
                alert("❌ Failed to approve contract.");
            }
        } catch (err) {
            alert("❌ Error approving contract. Please try again.");
        }
    };

    const handleViewContract = (contract) => {
        setSelectedContract(contract);
    };

    const closePopup = () => {
        setSelectedContract(null);
    };

    return (
        <div className="contracts-container">
            <img src={logo} alt="CareChain Logo" className="login-logo" />
            <h2>Patient Contracts</h2>

            <h3>Your Contracts</h3>
            {contracts.length === 0 ? (
                <p>No contracts found.</p>
            ) : (
                <div className="table-wrapper">
                    <table className="contracts-table">
                        <thead>
                        <tr>
                            <th>Contract ID</th>
                            <th>Doctor</th>
                            <th>Treatment</th>
                            <th>Description</th>
                            <th>Approved</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {contracts.map((contract) => (
                            <tr key={contract.contractId}>
                                <td>{contract.contractId}</td>
                                <td>{doctorNames[contract.doctorId] || "Loading..."}</td>
                                <td>{contract.treatmentType}</td>
                                <td>{contract.description}</td>
                                <td className={contract.isApproved ? "contract-approved" : "contract-not-approved"}>
                                    {contract.isApproved ? "✅ Yes" : "❌ No"}
                                </td>
                                <td>
                                    <button className="view-button" onClick={() => handleViewContract(contract)}>
                                        👁 View
                                    </button>
                                    {!contract.isApproved && (
                                        <button className="approve-button" onClick={() => handleApprove(contract.contractId)}>
                                            ✔ Approve
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="button-group">
                <button className="back-button" onClick={() => window.history.back()}>
                    Back
                </button>
            </div>

            {selectedContract && (
                <div className="popup-overlay">
                    <div className="popup-content">
                    <h3>Contract Details</h3>
                        <p>
                            <strong>Contract ID:</strong> {selectedContract.contractId}
                        </p>
                        <p>
                            <strong>Doctor:</strong> {doctorNames[selectedContract.doctorId] || "Loading..."}
                        </p>
                        <p>
                            <strong>Treatment:</strong> {selectedContract.treatmentType}
                        </p>
                        <p>
                            <strong>Description:</strong> {selectedContract.description}
                        </p>
                        <p>
                            <strong>Approved:</strong> {selectedContract.isApproved ? "✅ Yes" : "❌ No"}
                        </p>
                        <button className="close-button" onClick={closePopup}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientContracts;
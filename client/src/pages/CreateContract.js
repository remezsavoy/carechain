import React, { useState, useEffect } from "react";
import axios from "axios";

const CreateContract = () => {
    const [doctorId, setDoctorId] = useState("");
    const [treatmentType, setTreatmentType] = useState("");
    const [treatmentDetails, setTreatmentDetails] = useState("");
    const [message, setMessage] = useState("");
    const [patientId, setPatientId] = useState("");

    // שליפת ה-Patient ID בעת טעינת הקומפוננטה
    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await axios.get("http://localhost:5000/user-details");
                console.log("✅ Fetched user details:", response.data);
                setPatientId(response.data.idNumber); // מניחים שה-ID הוא idNumber
            } catch (error) {
                console.error("❌ Failed to fetch user details", error);
            }
        };
        fetchUserDetails();
    }, []);

    const handleCreateContract = async (e) => {
        e.preventDefault();
        console.log("📨 Sending contract with Patient ID:", patientId, "Doctor ID:", doctorId, "Treatment Type:", treatmentType);

        if (!patientId || !doctorId || !treatmentType) {
            alert("Patient ID, Doctor ID, and Treatment Type are required");
            return;
        }

        try {
            const response = await axios.post("http://localhost:5000/contracts", {
                patientId,
                doctorId,
                treatmentType,
                description: treatmentDetails,
            });
            setMessage(response.data.message);
        } catch (error) {
            console.error("❌ Error creating contract:", error);
            setMessage("Failed to create contract.");
        }
    };

    return (
        <form onSubmit={handleCreateContract}>
            <input
                type="text"
                placeholder="Doctor ID"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
            />
            <select
                value={treatmentType}
                onChange={(e) => setTreatmentType(e.target.value)}
            >
                <option value="">Select Treatment Type</option>
                <option value="Checkup">Checkup</option>
                <option value="Surgery">Surgery</option>
                <option value="Therapy">Therapy</option>
            </select>
            <textarea
                placeholder="Treatment Details"
                value={treatmentDetails}
                onChange={(e) => setTreatmentDetails(e.target.value)}
            ></textarea>
            <button type="submit">Create Contract</button>
            {message && <p>{message}</p>}
        </form>
    );
};

export default CreateContract;
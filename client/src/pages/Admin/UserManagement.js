import React, { useEffect, useState } from "react";
import { getUsers, deleteUser, createUser, updateUser, toggleUserActive } from "../../api/api";
import "./UserManagement.css";
import logo from "../../assets/CareChain.png";


export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        idNumber: "",
        birthDate: "",
        userType: 2
    });
    const [editUser, setEditUser] = useState(null);
    const [showNewUserPopup, setShowNewUserPopup] = useState(false);
    const [showEditUserPopup, setShowEditUserPopup] = useState(false);

    // טעינת רשימת המשתמשים
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await getUsers();
                setUsers(response);
            } catch (error) {
                console.error("Failed to fetch users", error);
            }
        };
        fetchUsers();
    }, []);

    const userTypeToString = (userType) => {
        switch (userType) {
            case 0:
                return "Admin";
            case 1:
                return "Doctor";
            case 2:
                return "User";
            default:
                return "Unknown";
        }
    };

    const handleToggleActive = async (userId, isActive) => {
        try {
            await toggleUserActive(userId, !isActive);
            const updatedUsers = await getUsers(); // ריענון הנתונים מהשרת
            setUsers(updatedUsers);
        } catch (error) {
            console.error("Failed to toggle user active status", error);
        }
    };

    const handleCreateUser = async () => {
        try {
            await createUser(newUser);
            alert("User created successfully");
            setNewUser({
                firstName: "",
                lastName: "",
                email: "",
                password: "",
                phone: "",
                idNumber: "",
                birthDate: "",
                userType: 2
            });
            setShowNewUserPopup(false);
            const updatedUsers = await getUsers();
            setUsers(updatedUsers);
        } catch (error) {
            console.error("Failed to create user", error);
        }
    };

    const handleUpdateUser = async () => {
        try {
            await updateUser(editUser._id, editUser);
            alert("User updated successfully");
            setEditUser(null);
            setShowEditUserPopup(false);
            const updatedUsers = await getUsers();
            setUsers(updatedUsers);
        } catch (error) {
            console.error("Failed to update user", error);
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            await deleteUser(userId);
            alert("User deleted successfully");
            const updatedUsers = await getUsers();
            setUsers(updatedUsers);
        } catch (error) {
            console.error("Failed to delete user", error);
        }
    };

    return (
        <div className="user-management-container">
            <img src={logo} alt="CareChain Logo" className="login-logo"/>
            <h1 style={{color: "black"}}>User Management</h1>

            <button onClick={() => setShowNewUserPopup(true)} className="popup-button">Add New User</button>

            <div className="users-table">
                <h2 style={{color: "black"}}>Users List</h2>
                <table>
                    <thead>
                    <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>ID Number</th>
                        <th>Birth Date</th>
                        <th>Role</th>
                        <th>Active</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((user) => (
                        <tr key={user._id}>
                            <td>{user.firstName}</td>
                            <td>{user.lastName}</td>
                            <td>{user.email}</td>
                            <td>{user.phone}</td>
                            <td>{user.idNumber}</td>
                            <td>{new Date(user.birthDate).toISOString().split("T")[0]}</td>
                            <td>{userTypeToString(user.userType)}</td>
                            <td>{user.active ? "Active" : "Inactive"}</td>
                            <td>
                                <button onClick={() => handleToggleActive(user._id, user.active)}>
                                    {user.active ? "Disable" : "Enable"}
                                </button>
                                <button onClick={() => {
                                    setEditUser({
                                        ...user,
                                        birthDate: new Date(user.birthDate).toISOString().split("T")[0]
                                    });
                                    setShowEditUserPopup(true);
                                }}>Edit
                                </button>
                                <button onClick={() => handleDeleteUser(user._id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <button className="back-button" onClick={() => window.history.back()}>
                Back
            </button>

            {showNewUserPopup && (
                <div className="popup-overlay">
                    <div className="popup-content new-user-popup">
                        <h2>Add New User</h2>
                        <input type="text" placeholder="First Name" value={newUser.firstName}
                               onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}/>
                        <input type="text" placeholder="Last Name" value={newUser.lastName}
                               onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}/>
                        <input type="email" placeholder="Email" value={newUser.email}
                               onChange={(e) => setNewUser({...newUser, email: e.target.value})}/>
                        <input type="password" placeholder="Password" value={newUser.password}
                               onChange={(e) => setNewUser({...newUser, password: e.target.value})}/>
                        <input type="text" placeholder="Phone" value={newUser.phone}
                               onChange={(e) => setNewUser({...newUser, phone: e.target.value})}/>
                        <input type="text" placeholder="ID Number" value={newUser.idNumber}
                               onChange={(e) => setNewUser({...newUser, idNumber: e.target.value})}/>
                        <input type="date" placeholder="Birth Date" value={newUser.birthDate}
                               onChange={(e) => setNewUser({...newUser, birthDate: e.target.value})}/>
                        <select value={newUser.userType}
                                onChange={(e) => setNewUser({...newUser, userType: Number(e.target.value)})}>
                            <option value={2}>User</option>
                            <option value={0}>Admin</option>
                            <option value={1}>Doctor</option>
                        </select>
                        <div className="popup-buttons">
                            <button onClick={handleCreateUser}>Create</button>
                            <button onClick={() => setShowNewUserPopup(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {showEditUserPopup && editUser && (
                <div className="popup-overlay">
                    <div className="popup-content edit-user-popup">
                        <h2>Edit User</h2>
                        <input type="text" placeholder="First Name" value={editUser.firstName}
                               onChange={(e) => setEditUser({...editUser, firstName: e.target.value})}/>
                        <input type="text" placeholder="Last Name" value={editUser.lastName}
                               onChange={(e) => setEditUser({...editUser, lastName: e.target.value})}/>
                        <input type="email" placeholder="Email" value={editUser.email}
                               onChange={(e) => setEditUser({...editUser, email: e.target.value})}/>
                        <input type="text" placeholder="Phone" value={editUser.phone}
                               onChange={(e) => setEditUser({...editUser, phone: e.target.value})}/>
                        <input type="text" placeholder="ID Number" value={editUser.idNumber}
                               onChange={(e) => setEditUser({...editUser, idNumber: e.target.value})}/>
                        <input type="date" placeholder="Birth Date" value={editUser.birthDate}
                               onChange={(e) => setEditUser({...editUser, birthDate: e.target.value})}/>
                        <select value={editUser.userType}
                                onChange={(e) => setEditUser({...editUser, userType: Number(e.target.value)})}>
                            <option value={2}>User</option>
                            <option value={0}>Admin</option>
                            <option value={1}>Doctor</option>
                        </select>
                        <div className="popup-buttons">
                            <button onClick={handleUpdateUser}>Save</button>
                            <button onClick={() => setShowEditUserPopup(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
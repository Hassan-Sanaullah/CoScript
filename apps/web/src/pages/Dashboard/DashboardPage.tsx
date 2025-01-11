import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Workspaces from "./components/Workspaces";
import Collaborators from "./components/Collaborators";
import JoinSessionButton from "./components/JoinSessionButton";
import "./DashboardPage.css";

function DashboardPage() {
    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        document.body.className = "dashboard-page";
        return () => {
            document.body.className = "";
        };
    }, []);

    const [userInfo, setUserInfo] = useState<any | null>(null);
    const [workspace, setWorkspaces] = useState<any[]>([]);

    useEffect(() => {
        // Retrieve the token from localStorage
        const token = localStorage.getItem("access_token");

        // Fetch user info from backend
        const fetchUserInfo = async () => {
            try {
                const response = await fetch(`${apiUrl}/user/info`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();
                setUserInfo(data);
                setWorkspaces(
                    data.workspaces.map((workspace: any) => ({
                        id: workspace.id,
                        name: workspace.name,
                        role: workspace.role,
                        description: workspace.description,
                        updatedAt: workspace.updatedAt,
                    }))
                );
            } catch (error) {
                console.error("Error fetching user info:", error);
            }
        };

        fetchUserInfo();
    }, []);

    return (
        <div
            style={{
                display: "flex",
                height: "100vh",
                backgroundColor: "black",
            }}
        >
            <Sidebar />
            <div
                style={{ marginLeft: "260px", padding: "20px", width: "100%" }}
            >
                {userInfo && <Header username={userInfo.username} />}
                <div className="projects-section">
                    <h3>My Workspaces</h3>
                    {workspace
                        .filter((ws) => ws.role === "admin")
                        .map((ws) => (
                            <Workspaces
                                id={ws.id}
                                key={ws.id}
                                name={ws.name}
                                description={ws.description}
                                updatedAt={ws.updatedAt}
                                userId={userInfo.userId}
                            />
                        ))}
                </div>

                <div className="projects-section">
                    <h3>Joined Workspaces</h3>
                    {workspace
                        .filter((ws) => ws.role !== "admin")
                        .map((ws) => (
                            <Workspaces
                                id={ws.id}
                                key={ws.id}
                                name={ws.name}
                                description={ws.description}
                                updatedAt={ws.updatedAt}
                                userId={userInfo.userId}
                            />
                        ))}
                </div>

                <Collaborators />
                <JoinSessionButton />
            </div>
        </div>
    );
}

export default DashboardPage;

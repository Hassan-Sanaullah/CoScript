import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

interface Props {
    userId: number
    id: number
    name: string;
    description: string;
    updatedAt: string;
}

function Workspaces({id, name, description, updatedAt ,userId}: Props) {
    const [timeAgo, setTimeAgo] = useState("");

    useEffect(() => {
        const calculateTimeAgo = () => {
            // Parse the input date string and calculate the distance to now
            const distance = formatDistanceToNow(new Date(updatedAt), {
                addSuffix: true,
            });
            setTimeAgo(distance);
        };

        calculateTimeAgo();
        const intervalId = setInterval(calculateTimeAgo, 60000); 

        return () => clearInterval(intervalId); // Cleanup on component unmount
    }, [updatedAt]);


    const navigate = useNavigate();
  
    const handleWorkspaceClick = (workspaceId: number) => {
      navigate(`/editor/${workspaceId}/${userId}`);
    }

    
    return (
        <>
            <div className="project-card" onClick={() => handleWorkspaceClick(id)}>
                <div>
                    <div style={{ fontSize: "18px", fontWeight: "bold" }}>
                        {name}
                    </div>
                    <div style={{ fontSize: "14px", overflow: "hidden"}}>{description}</div>
                    <div style={{ fontSize: "14px", color: "#7f8c8d" }}>
                        Last updated: {timeAgo}
                    </div>
                </div>
                {/* <button className='join-button'>Join</button> */}
            </div>
        </>
    );
}

export default Workspaces;

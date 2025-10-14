import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
    const teacher = useSelector((state) => state.auth?.teacher);

    if (teacher) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default PublicRoute;

import { useState } from "react";

const useAuth = () => {

    const [user, setUser] = useState(

        JSON.parse(localStorage.getItem("user")) || null

    );

    const login = (userData, token) => {

        localStorage.setItem("user", JSON.stringify(userData));

        localStorage.setItem("token", token);

        setUser(userData);

    };

    const logout = () => {

        localStorage.clear();

        setUser(null);

        window.location.href = "/login";

    };

    return {

        user,

        login,

        logout,

        isAuthenticated: !!user

    };

};

export default useAuth;
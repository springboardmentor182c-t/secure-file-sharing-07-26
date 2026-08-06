import {useState} from "react";


const useAuth=()=>{


const [user,setUser]=useState(()=>{


const storedUser=localStorage.getItem("user");


return storedUser ?

JSON.parse(storedUser)

:

null;


});




const login=(userData,token)=>{


localStorage.setItem(

"user",

JSON.stringify(userData)

);


localStorage.setItem(

"token",

token

);


setUser(userData);


};




const logout=()=>{


localStorage.removeItem("user");

localStorage.removeItem("token");


setUser(null);


};




return {


user,

login,

logout,

isAuthenticated:!!user


};


};


export default useAuth;
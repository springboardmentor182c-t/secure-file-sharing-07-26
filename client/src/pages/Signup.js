import React from "react";
import SignupForm from "../features/authentication/components/SignupForm";


const Signup = () => {

return(

<div style={styles.container}>

<SignupForm/>

</div>

);

};


const styles={

container:{
 minHeight:"100vh",
 background:"#F5EBDD",
 display:"flex",
 justifyContent:"center",
 alignItems:"center",
 padding:"20px"
}

};


export default Signup;
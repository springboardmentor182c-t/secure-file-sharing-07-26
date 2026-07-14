import React, {useState} from "react";

import {
 Paper,
 Typography,
 TextField,
 Button,
 InputAdornment
} from "@mui/material";

import {
 Email,
 LockReset
} from "@mui/icons-material";

import {useNavigate} from "react-router-dom";


const ForgotPassword =()=>{

const navigate=useNavigate();


const [email,setEmail]=useState("");


const handleSubmit=(e)=>{

e.preventDefault();

console.log(email);

// API call later

navigate("/otp-verification");

};


return(

<div style={styles.container}>

<Paper elevation={5} sx={styles.card}>


<LockReset sx={styles.icon}/>


<Typography variant="h4" sx={styles.title}>
Forgot Password
</Typography>


<Typography sx={styles.text}>
Enter your registered email to receive OTP
</Typography>



<form onSubmit={handleSubmit}>


<TextField

fullWidth

label="Email Address"

value={email}

onChange={(e)=>setEmail(e.target.value)}

margin="normal"

required


InputProps={{

startAdornment:

<InputAdornment position="start">

<Email/>

</InputAdornment>

}}


/>



<Button

fullWidth

type="submit"

variant="contained"

sx={styles.button}

>

Send OTP

</Button>



</form>


</Paper>

</div>

)

}



const styles={

container:{

minHeight:"100vh",

background:"#F5EBDD",

display:"flex",

justifyContent:"center",

alignItems:"center"

},


card:{

width:420,

padding:4,

borderRadius:"20px",

textAlign:"center"

},


icon:{

fontSize:55,

color:"#795548"

},


title:{

fontWeight:700,

color:"#5D4037"

},


text:{

color:"#8D6E63"

},


button:{

marginTop:3,

padding:1.3,

background:"#795548",

"&:hover":{

background:"#5D4037"

}

}

};


export default ForgotPassword;
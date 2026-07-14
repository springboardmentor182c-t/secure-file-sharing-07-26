import React,{useState} from "react";

import {
Paper,
Typography,
TextField,
Button,
InputAdornment
} from "@mui/material";


import {
Lock,
LockReset
} from "@mui/icons-material";


import {useNavigate} from "react-router-dom";


const ResetPassword=()=>{


const navigate=useNavigate();


const [password,setPassword]=useState("");

const [confirm,setConfirm]=useState("");



const handleSubmit=(e)=>{

e.preventDefault();


if(password!==confirm){

alert("Passwords do not match");

return;

}


// API reset password later

navigate("/login");

};



return(

<div style={styles.container}>


<Paper sx={styles.card} elevation={5}>


<LockReset sx={styles.icon}/>


<Typography variant="h4" sx={styles.title}>
Reset Password
</Typography>


<Typography sx={styles.text}>
Create your new secure password
</Typography>



<form onSubmit={handleSubmit}>


<TextField

fullWidth

label="New Password"

type="password"

margin="normal"

value={password}

onChange={(e)=>setPassword(e.target.value)}

required


InputProps={{

startAdornment:

<InputAdornment position="start">

<Lock/>

</InputAdornment>

}}

/>



<TextField

fullWidth

label="Confirm Password"

type="password"

margin="normal"

value={confirm}

onChange={(e)=>setConfirm(e.target.value)}

required


InputProps={{

startAdornment:

<InputAdornment position="start">

<Lock/>

</InputAdornment>

}}

/>



<Button

fullWidth

variant="contained"

type="submit"

sx={styles.button}

>

Reset Password

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


export default ResetPassword;
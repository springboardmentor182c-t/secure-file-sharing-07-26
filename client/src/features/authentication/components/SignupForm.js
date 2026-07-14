import React,{useState} from "react";

import {
 Paper,
 Typography,
 TextField,
 Button,
 InputAdornment
} from "@mui/material";


import {
 Person,
 Email,
 Lock,
 Security
} from "@mui/icons-material";


import {useNavigate} from "react-router-dom";


const SignupForm=()=>{


const navigate=useNavigate();


const [formData,setFormData]=useState({

name:"",
email:"",
password:"",
confirmPassword:""

});


const handleChange=(e)=>{

setFormData({

...formData,

[e.target.name]:e.target.value

});

};



const handleSubmit=(e)=>{

e.preventDefault();

console.log(formData);


// backend signup later

navigate("/email-verification");

};



return(

<Paper sx={styles.card} elevation={5}>


<Security sx={styles.icon}/>


<Typography variant="h4" sx={styles.title}>
Create Account
</Typography>


<Typography sx={styles.subtitle}>
Join VaultShare Secure Workspace
</Typography>



<form onSubmit={handleSubmit}>


<TextField
fullWidth
label="Full Name"
name="name"
margin="normal"
required
value={formData.name}
onChange={handleChange}

InputProps={{
startAdornment:
<InputAdornment position="start">
<Person/>
</InputAdornment>
}}

/>



<TextField
fullWidth
label="Email"
name="email"
margin="normal"
required
value={formData.email}
onChange={handleChange}

InputProps={{
startAdornment:
<InputAdornment position="start">
<Email/>
</InputAdornment>
}}

/>



<TextField
fullWidth
label="Password"
name="password"
type="password"
margin="normal"
required
value={formData.password}
onChange={handleChange}

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
name="confirmPassword"
type="password"
margin="normal"
required
value={formData.confirmPassword}
onChange={handleChange}

InputProps={{
startAdornment:
<InputAdornment position="start">
<Lock/>
</InputAdornment>
}}

/>



<Button
fullWidth
type="submit"
variant="contained"
sx={styles.button}
>

Create Account

</Button>


</form>


</Paper>

)

}



const styles={


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
color:"#5D4037",
fontWeight:700
},


subtitle:{
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



export default SignupForm;
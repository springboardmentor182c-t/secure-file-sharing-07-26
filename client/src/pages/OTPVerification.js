import React,{useState} from "react";


import {
Paper,
Typography,
TextField,
Button
} from "@mui/material";


import {
VerifiedUser
} from "@mui/icons-material";


import {useNavigate} from "react-router-dom";


const OTPVerification=()=>{


const navigate=useNavigate();


const [otp,setOtp]=useState("");



const handleSubmit=(e)=>{

e.preventDefault();


console.log("OTP:",otp);


// verify OTP API later

navigate("/reset-password");


};



return(

<div style={styles.container}>


<Paper sx={styles.card} elevation={5}>


<VerifiedUser sx={styles.icon}/>


<Typography variant="h4" sx={styles.title}>
OTP Verification
</Typography>


<Typography sx={styles.text}>
Enter the OTP sent to your email
</Typography>



<form onSubmit={handleSubmit}>


<TextField

fullWidth

label="Enter OTP"

margin="normal"

value={otp}

onChange={(e)=>setOtp(e.target.value)}

required

inputProps={{

maxLength:6

}}

/>



<Button

fullWidth

type="submit"

variant="contained"

sx={styles.button}

>

Verify OTP

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

background:"#795548",

padding:1.3,

"&:hover":{

background:"#5D4037"

}

}

};


export default OTPVerification;
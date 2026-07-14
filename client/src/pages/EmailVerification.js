import React from "react";


import {
Paper,
Typography,
Button
} from "@mui/material";


import {
MarkEmailRead
} from "@mui/icons-material";


import {useNavigate} from "react-router-dom";



const EmailVerification=()=>{


const navigate=useNavigate();



return(

<div style={styles.container}>


<Paper sx={styles.card} elevation={5}>


<MarkEmailRead sx={styles.icon}/>


<Typography variant="h4" sx={styles.title}>
Verify Email
</Typography>


<Typography sx={styles.text}>
A verification link has been sent to your email address.
</Typography>



<Button

variant="contained"

sx={styles.button}

onClick={()=>navigate("/login")}

>

Continue to Login

</Button>


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

color:"#8D6E63",

marginBottom:2

},


button:{

background:"#795548",

padding:"10px 30px",

"&:hover":{

background:"#5D4037"

}

}


};



export default EmailVerification;
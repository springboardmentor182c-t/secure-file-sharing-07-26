const API_URL = "http://localhost:8000/auth";


// Login API
export const loginUser = async (credentials)=>{

try{

const response = await fetch(`${API_URL}/login`,{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify(credentials)

});


return await response.json();


}

catch(error){

console.error("Login Error:",error);

throw error;

}

};




// Signup API
export const signupUser = async(userData)=>{


try{


const response = await fetch(`${API_URL}/signup`,{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify(userData)

});


return await response.json();


}

catch(error){

console.error("Signup Error:",error);

throw error;

}


};





// Forgot Password

export const forgotPassword = async(email)=>{


const response = await fetch(`${API_URL}/forgot-password`,{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

email

})

});


return await response.json();


};





// Verify OTP

export const verifyOTP = async(data)=>{


const response = await fetch(`${API_URL}/verify-otp`,{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify(data)

});


return await response.json();


};





// Reset Password

export const resetPassword = async(data)=>{


const response = await fetch(`${API_URL}/reset-password`,{


method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify(data)


});


return await response.json();


};
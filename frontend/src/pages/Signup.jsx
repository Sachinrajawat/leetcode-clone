import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router"; // Adjust to "react-router-dom" if needed
import { registerUser } from "../authSlice"; // Adjust path to your authSlice

const signupSchema = z.object({
  firstName: z
    .string()
    .min(3, "Name should contain at least 3 characters"),
  emailId: z
    .string()
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password should contain at least 8 characters"),
});

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Grab the global loading and error state from your Redux store
  const { isLoading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const submittedData = async (data) => {
    try {
      // .unwrap() allows us to catch the specific error payload from the backend
      await dispatch(registerUser(data)).unwrap();
      
      // If successful, instantly redirect the user to the homepage (or dashboard)
      navigate("/");
    } catch (err) {
      console.error("Registration failed:", err);
      // The error is automatically saved to Redux state and displayed in the UI below
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
          <p className="text-gray-500 mt-2">Sign up to get started</p>
        </div>

        {/* Global Backend Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(submittedData)} className="space-y-5">
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              placeholder="Enter your first name"
              {...register("firstName")}
              className={`w-full px-4 py-3 rounded-lg border outline-none transition text-black
                ${
                  errors.firstName
                    ? "border-red-500 focus:ring-2 focus:ring-red-200"
                    : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                }`}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="emailId" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="emailId"
              type="email"
              placeholder="Enter your email"
              {...register("emailId")}
              className={`w-full px-4 py-3 rounded-lg border outline-none transition text-black
                ${
                  errors.emailId
                    ? "border-red-500 focus:ring-2 focus:ring-red-200"
                    : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                }`}
            />
            {errors.emailId && (
              <p className="text-red-500 text-sm mt-1">{errors.emailId.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                {...register("password")}
                className={`w-full px-4 py-3 pr-20 rounded-lg border outline-none transition text-black
                  ${
                    errors.password
                      ? "border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
                       text-white font-semibold py-3 rounded-lg
                       transition duration-200 cursor-pointer"
          >
            {isSubmitting || isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Login */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;


// name
// email
// password
// submit

// import React, { useState } from 'react'

// const Signup = () => {
//     const [name, setName] = useState('');
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const handleSubmit = (e) =>{
//         e.preventDefault();
//         console.log(name, email, password);
//         // validation of data

//         // form ko submit kar denge
//         // Backend me submit ho
//     }
//   return (
//     <form action="" onSubmit={handleSubmit} className='min-h-screen flex justify-center flex-col items-center gap-y-2'>
//         <input type="text" value={name} placeholder='Enter your firstName' onChange={(e)=>setName(e.target.value)}/>
//         <input type="email" value={email} placeholder='Enter your Email' onChange={(e)=>setEmail(e.target.value)}/>
//         <input type="password" value={password} placeholder='Enter your Password' onChange={(e)=>setPassword(e.target.value)}/>
//         <button type="submit" >Submit</button>
//     </form>
//   )
// }

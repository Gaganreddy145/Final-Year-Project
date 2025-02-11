import React from "react";

function TeacherDetail() {
  return <div>TeacherDetail</div>;
}

export const loader = async ({request,params}) => {
    const response = await fetch("http://localhost:3000/api/users/"+params.id,{
        method:"GET",
        headers:{
            'Content-Type':'application/json',
            Authorization:`Bearer ${token}`
        }
    })
}

export default TeacherDetail;

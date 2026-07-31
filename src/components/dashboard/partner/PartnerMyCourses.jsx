import React from "react";
import CourseManager from "../../Admin/CourseManager";
import { useAuth } from "../../../context/AuthContext";

const MyCourses = () => {
  const { currentUser } = useAuth();
  
  return (
    <div className="w-full">
      <div className="mb-8">
        <p className="text-slate-500 font-medium mt-1">
          Create and manage your own exclusive courses. These will only be visible on your subdomain.
        </p>
      </div>
      
      {currentUser && <CourseManager partnerId={currentUser.uid} />}
    </div>
  );
};

export default MyCourses;

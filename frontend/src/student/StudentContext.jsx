import { createContext, useState } from "react";

export const StudentContext = createContext({
  studentData: {},
  midMarks: [],
  handleSetData: (student) => {},
  handleFilterMidMarks: (year) => {},
});

export const StudentContextProvider = ({ children }) => {
  const [studentData, setStudentData] = useState({});
  const [midMarks, setMidMarks] = useState({
    sem1: [],
    sem2: [],
  });

  const handleSetData = (student) => {
    setStudentData(student);
  };

  const handleFilterMidMarks = (year) => {
    const targetYear = parseInt(year, 10);
    let curretYearSem1Marks = [];
    let curretYearSem2Marks = [];
    if (studentData.midmarks) {
      if (studentData.currentSem === 2) {
        curretYearSem2Marks = studentData.midmarks.filter(
          (mark) =>
            mark.year == targetYear && mark.semno === studentData.currentSem
        );
        curretYearSem1Marks = studentData.midmarks.filter(
          (mark) => mark.year == targetYear && mark.semno === 1
        );
      }
      if (studentData.currentSem === 1) {
        curretYearSem1Marks = studentData.midmarks.filter(
          (mark) => mark.year == targetYear && mark.semno === 1
        );
      }
    }
    setMidMarks({
      sem1: curretYearSem1Marks,
      sem2: curretYearSem2Marks,
    });
  };

  const studentCtx = {
    studentData,
    midMarks,
    handleSetData,
    handleFilterMidMarks,
  };
  return (
    <StudentContext.Provider value={studentCtx}>
      {children}
    </StudentContext.Provider>
  );
};

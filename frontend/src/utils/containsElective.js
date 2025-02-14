function containsElective(subjectName) {
  // Convert the subject name to lowercase for case-insensitive comparison
  const lowerCaseSubject = subjectName.toLowerCase();

  // Check if the lowercase subject name includes the word "elective"
  return lowerCaseSubject.includes("elective");
}

export default containsElective;

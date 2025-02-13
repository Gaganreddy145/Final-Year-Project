const subject_names = {
  1: [
    'Discrete Mathematical Structures',
    'English',
    'Computer Programming with C and Numerical Methods (CPNM)',
    'Engineering Mathematics – I',
    'Engineering  Chemistry',
  ],
  2: [
    'Digital Logic Design (DLD)',
    'Electrical and Electronics Engineering (EEE)',
    'Engineering Graphics',
    'Engineering Physics',
    'Engineering Mathematics – II',
  ],
  3: [
    'Object Oriented Programming through Java',
    'Operating Systems',
    'Computer Organization and Architecture',
    'Data Structures',
    'Probability, Statistics and Queuing Theory',
  ],
  4: [
    'Managerial Economics',
    'Formal Languages and Automata Theory',
    'Database Management Systems',
    'Design and Analysis of Algorithms',
    'Microprocessors & Microcontrollers',
  ],
  5: [
    'Data Warehousing and Data Mining',
    'Compiler Design',
    'Computer Networks',
    'Open Elective–I',
    'Elective-I',
  ],
  6: [
    'Object-Oriented Software Engineering',
    'Web Technologies',
    'Artificial Intelligence',
    'Open Elective-II',
    'Elective-II',
  ],
  7: [
    'Open Elective-IV',
    'Open Elective-III',
    'Elective-V',
    'Elective–IV',
    'Elective -III',
  ],
};

// Function to normalize a string
function normalizeString(str) {
  return str
    .toLowerCase()
    .replace(/[-–—]/g, '') // Remove ALL types of dashes/hyphens
    .replace(/\s+/g, '') // Remove all spaces
    .replace(/(i|ii|iii|iv|v)$/, (match) => {
      // Match Roman numerals at the END
      const romanToNumber = { i: '1', ii: '2', iii: '3', iv: '4', v: '5' };
      return romanToNumber[match.toLowerCase()] || match;
    });
}

// Function to find the subject name
function findSubject(input) {
  const normalizedInput = normalizeString(input);
  const allSubjects = Object.values(subject_names).flat();

  // Find the first match with fuzzy comparison
  const matchedSubject = allSubjects.find((subject) => {
    const normalizedSubject = normalizeString(subject);
    return normalizedSubject === normalizedInput;
  });

  return matchedSubject || null;
}

module.exports = findSubject;

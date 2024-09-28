import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/verifyUser";
import Class from "../model/Class";
import Course from "../model/Course";

// Helper function: Preprocess text (remove punctuation, convert to lowercase, etc.)
function preprocess(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/); // Convert to array of words
}

// Helper function: Calculate term frequency (TF)
function calculateTF(terms) {
  const termCount = {};
  terms.forEach((term) => {
    if (!termCount[term]) {
      termCount[term] = 0;
    }
    termCount[term] += 1;
  });

  const totalTerms = terms.length;
  Object.keys(termCount).forEach((term) => {
    termCount[term] /= totalTerms; // Term frequency is term count divided by total number of terms
  });

  return termCount;
}

// Helper function: Calculate inverse document frequency (IDF)
function calculateIDF(documents) {
  const totalDocuments = documents.length;
  const idf = {};

  documents.forEach((doc) => {
    const uniqueTerms = new Set(doc); // Ensure each term is counted once per document
    uniqueTerms.forEach((term: any) => {
      if (!idf[term]) {
        idf[term] = 0;
      }
      idf[term] += 1; // Increment for every document the term appears in
    });
  });

  Object.keys(idf).forEach((term) => {
    idf[term] = Math.log(totalDocuments / (1 + idf[term])); // Apply smoothing
  });

  return idf;
}

// Helper function: Calculate TF-IDF vector for a document
function calculateTFIDF(tf, idf) {
  const tfidf = {};
  Object.keys(tf).forEach((term) => {
    tfidf[term] = tf[term] * (idf[term] || 0);
  });
  return tfidf;
}

// Helper function: Create vector for cosine similarity
function createVector(terms, tfidf) {
  return terms.map((term) => tfidf[term] || 0);
}

// Helper function: Calculate cosine similarity
function cosineSimilarity(vec1, vec2) {
  const dotProduct = vec1.reduce((sum, a, i) => sum + a * vec2[i], 0);
  const magnitude1 = Math.sqrt(vec1.reduce((sum, a) => sum + a * a, 0));
  const magnitude2 = Math.sqrt(vec2.reduce((sum, a) => sum + a * a, 0));
  return magnitude1 && magnitude2 ? dotProduct / (magnitude1 * magnitude2) : 0;
}

// ... [previous helper functions remain unchanged]

// Fetch user's enrolled classes
async function getUserEnrolledClasses(userId) {
  const classes: any = await Class.findAll({
    where: { joinedUser: userId },
    include: [{ model: Course }],
  });

  return classes.map((c) => ({
    title: c.title,
    description: c.description,
    courseId: c.courseId,
  }));
}

// Fetch all available courses and their classes
async function getAllCoursesWithClasses() {
  const courses: any = await Course.findAll({
    include: [{ model: Class }],
  });

  return courses.map((course) => ({
    courseId: course.id,
    title: course.title,
    description: course.description,
    imageUrl: course.imageUrl,
    userProfile: course.userProfile,
    availableClasses: course.classes.map((c) => c),
    classes: course.classes.map((c) => `${c.title} ${c.description}`).join(" "),
  }));
}

// Function to recommend courses based on similarity
export async function recommendCourses(userId) {
  const enrolledClasses = await getUserEnrolledClasses(userId);
  const allCourses = await getAllCoursesWithClasses();

  if (!enrolledClasses.length) return []; // If user has no enrolled classes, return empty

  // Get the list of course IDs the user is already enrolled in
  const enrolledCourseIds = new Set(enrolledClasses.map((cls) => cls.courseId));

  // Filter out courses the user is already enrolled in
  const availableCourses = allCourses.filter(
    (course) => !enrolledCourseIds.has(course.courseId)
  );

  // Preprocess and prepare documents (enrolled classes and available courses)
  const enrolledDocuments = enrolledClasses.map((cls) =>
    preprocess(`${cls.title} ${cls.description}`)
  );
  const courseDocuments = availableCourses.map((course) =>
    preprocess(`${course.title} ${course.description} ${course.classes}`)
  );

  const allDocuments = [...enrolledDocuments, ...courseDocuments];

  // Calculate IDF for all documents
  const idf = calculateIDF(allDocuments);

  // Generate TF-IDF vectors for user's enrolled classes and available courses
  const userTFIDFVectors = enrolledDocuments.map((doc) => {
    const tf = calculateTF(doc);
    return calculateTFIDF(tf, idf);
  });

  const courseTFIDFVectors = courseDocuments.map((doc) => {
    const tf = calculateTF(doc);
    return calculateTFIDF(tf, idf);
  });

  // Compare each available course with all of user's enrolled classes using cosine similarity
  const recommendations = availableCourses.map((course, index) => {
    let maxSimilarity = 0;
    const courseVector = createVector(
      Object.keys(idf),
      courseTFIDFVectors[index]
    );

    userTFIDFVectors.forEach((userVector) => {
      const similarity = cosineSimilarity(
        createVector(Object.keys(idf), userVector),
        courseVector
      );
      maxSimilarity = Math.max(maxSimilarity, similarity);
    });

    return {
      courseId: course.courseId,
      title: course.title,
      classes: course.availableClasses,
      imageUrl: course.imageUrl,
      userProfile: course.userProfile,
      similarity: maxSimilarity,
    };
  });

  // Sort by similarity in descending order and return recommendations
  return recommendations
    .filter((rec) => rec.similarity > 0) // Filter for meaningful recommendations
    .sort((a, b) => b.similarity - a.similarity);
}

// Controller function to expose the recommendations via API
export const recommendFunction = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const user = req.user;

  if (!user.id) return res.status(400).json({ message: "User ID is required" });

  try {
    const recommendations = await recommendCourses(user.id);
    return res.status(200).json({
      data: recommendations,
      message: "Recommended courses fetched successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

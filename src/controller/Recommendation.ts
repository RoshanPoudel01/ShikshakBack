import { Response } from "express";
import { formatApiResponse } from "../middleware/responseFormatter";
import { AuthenticatedRequest } from "../middleware/verifyUser";
import Class from "../model/Class";
import Course from "../model/Course";
import User from "../model/User";
import UserProfile from "../model/UserProfile";

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

// Fetch user's enrolled classes
async function getUserEnrolledClasses(userId) {
  const classes: any = await Class.findAll({
    where: { joinedUser: userId },
    include: [{ model: Course }],
  });

  return classes.map((c) => ({
    classId: c.id,
    title: c.title,
    description: c.description,
    courseId: c.courseId,
    courseName: c.course.title,
  }));
}

// Fetch all available courses and their classes
async function getAllCoursesWithClasses() {
  const courses: any = await Course.findAll({
    include: [
      { model: Class },
      {
        model: User,
        include: [
          {
            model: UserProfile,
          },
        ],
      },
    ],
  });

  return courses.map((course) => ({
    courseId: course.id,
    title: course.title,
    description: course.description,
    imageUrl: course.imageUrl,
    user: course.user,
    availableClasses: course.classes.map((c) => c),
    classes: course.classes.map((c) => `${c.title} ${c.description}`).join(" "),
  }));
}

function splitEnrolledClasses(enrolledClasses, validationRatio = 0.2) {
  const shuffled = enrolledClasses.slice().sort(() => 0.5 - Math.random());
  const validationSize = Math.floor(enrolledClasses.length * validationRatio);
  return {
    trainingSet: shuffled.slice(0, enrolledClasses.length - validationSize),
    validationSet: shuffled.slice(-validationSize),
  };
}

// Modified recommendCourses function
export async function recommendCourses(userId) {
  const enrolledClasses = await getUserEnrolledClasses(userId);
  const allCourses = await getAllCoursesWithClasses();

  if (enrolledClasses.length < 5) return { recommendations: [], accuracy: 0 }; // Not enough data for meaningful split

  const { trainingSet, validationSet } = splitEnrolledClasses(enrolledClasses);

  // Get the list of course IDs the user is already enrolled in (based on training set)
  const enrolledCourseIds = new Set(trainingSet.map((cls) => cls.courseId));

  // Filter out courses the user is already enrolled in
  const availableCourses = allCourses.filter(
    (course) => !enrolledCourseIds.has(course.courseId)
  );

  // Preprocess and prepare documents
  const enrolledDocuments = trainingSet.map((cls) =>
    preprocess(`${cls.title} ${cls.description}`)
  );
  const courseDocuments = availableCourses.map((course) =>
    preprocess(`${course.title} ${course.description} ${course.classes}`)
  );

  const allDocuments = [...enrolledDocuments, ...courseDocuments];

  // Calculate IDF for all documents
  const idf = calculateIDF(allDocuments);

  // Generate TF-IDF vectors
  const userTFIDFVectors = enrolledDocuments.map((doc) => {
    const tf = calculateTF(doc);
    return calculateTFIDF(tf, idf);
  });

  const courseTFIDFVectors = courseDocuments.map((doc) => {
    const tf = calculateTF(doc);
    return calculateTFIDF(tf, idf);
  });

  // Compare each available course with all of user's enrolled classes
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
      user: course.user,
      similarity: maxSimilarity,
    };
  });

  // Sort by similarity in descending order
  const sortedRecommendations = recommendations
    .filter((rec) => rec.similarity > 0.1)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5);

  // Calculate accuracy
  const validationCourseIds = new Set(validationSet.map((cls) => cls.courseId));
  // const topRecommendations = sortedRecommendations.slice(
  //   0,
  //   validationSet.length
  // );
  const correctRecommendations = sortedRecommendations.filter((rec) =>
    validationCourseIds.has(rec.courseId)
  ).length;
  const accuracy =
    (correctRecommendations / sortedRecommendations.length) * 100;

  return {
    recommendations: sortedRecommendations,
    accuracy: accuracy,
  };
}

// Modified controller function
export const recommendFunction = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const user = req.user;

  if (!user.id) return res.status(400).json({ message: "User ID is required" });

  try {
    const { recommendations, accuracy } = await recommendCourses(user.id);

    return formatApiResponse(
      {
        recommendations,
        accuracy,
      },
      1,
      "Recommended courses fetched successfully",
      res.status(200)
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

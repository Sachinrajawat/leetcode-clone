const Problem = require("../models/problem");
const User = require("../models/user");
const {
  getLanguageId,
  submitBatch,
  submitToken,
} = require("../utils/ProblemUtility");

const createProblem = async (req, res) => {
  const {
    title,
    description,
    difficulty,
    tags,
    visibleTestCases,
    hiddenTestCases,
    startCode,
    referenceSolution,
    problemCreator,
  } = req.body;

  try {
    for (const { language, completeCode } of referenceSolution) {
      const languageId = getLanguageId(language);

      if (!languageId) {
        throw new Error(`Unsupported language: ${language}`);
      }

      const submissions = visibleTestCases.map(({ input, output }) => ({
        source_code: completeCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
      }));

      const submitResult = await submitBatch(submissions);

      // console.log(submitResult);
      // it will create array of token
      const resultToken = submitResult.map((value) => value.token);
      const testResult = await submitToken(resultToken);
      // console.log(testResult);
      for (const test of testResult) {
        if (test.status_id != 3) {
          // return res.status(400).send("Error Occured");
          // This will tell you if it was a compile error, wrong answer, or timeout!
          return res.status(400).json({
            message: `${language} reference solution failed! Judge0 Status: ${test.status_id}`,
            details: test.compile_output || test.stderr || "Wrong Answer"
          });
        }
      }
    }

    // we can store it in our DB
    const userProblem = await Problem.create({
      ...req.body,
      problemCreator: req.result._id,
    });

    res.status(201).json({
      message: "Problem created successfully",
    });
  } catch (error) {
    console.log("Error:", error.message);

    res.status(400).json({
      message: error.message,
    });
  }
};

const updateProblem = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    difficulty,
    tags,
    visibleTestCases,
    hiddenTestCases,
    startCode,
    referenceSolution,
  } = req.body;

  try {
    if (!id) {
      return res.status(400).send("Missing Id Field");
    }

    const dsaProblem = await Problem.findById(id);
    if (!dsaProblem) {
      return res.status(404).send("ID is not present in server");
    }
    for (const { language, completeCode } of referenceSolution) {
      const languageId = getLanguageId(language);

      if (!languageId) {
        throw new Error(`Unsupported language: ${language}`);
      }

      const submissions = visibleTestCases.map(({ input, output }) => ({
        source_code: completeCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
      }));

      const submitResult = await submitBatch(submissions);

      // console.log(submitResult);
      // it will create array of token
      const resultToken = submitResult.map((value) => value.token);
      const testResult = await submitToken(resultToken);

      for (const test of testResult) {
        if (test.status_id != 3) {
          return res.status(400).send("Error Occured");
        }
      }
    }

    const newProblem = await Problem.findByIdAndUpdate(
      id,
      { ...req.body },
      { runValidators: true, new: true },
    );

    res.status(200).send(newProblem);
  } catch (error) {
    console.log("Error:", error.message);

    res.status(400).json({
      message: error.message,
    });
  }
};

const deleteProblem = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) {
      return res.status(400).send("ID is missing");
    }

    const deletedProblem = await Problem.findByIdAndDelete(id);

    if (!deletedProblem) return res.status(404).send("Problem is Missing");

    res.status(200).send("Successfully Deleted");
  } catch (error) {
    res.status(500).send("Error: " + error.message);
  }
};

const getProblemById = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).send("ID is missing");
    }

    const getProblem = await Problem.findById(id).select(
      "_id title description difficulty tags visibleTestCases startCode referenceSolution",
    );
    if (!getProblem) {
      return res.status(400).send("Problem is Missing");
    }

    res.status(200).send(getProblem);
  } catch (error) {
    res.status(500).send("Error: " + error.message);
  }
};

const getAllProblem = async (req, res) => {
  try {
    const allProblem = await Problem.find({}).select(
      "_id title difficulty tags",
    );
    if (allProblem.length == 0)
      return res.status(404).send("Problem is Missing");
    res.status(200).send(allProblem);
  } catch (error) {
    res.status(500).send("Error: " + error.message);
  }
};

const solvedAllProblemByUser = async (req, res) => {
  try {
    const userId = req.result._id;
    const user = await User.findById(userId).populate({
      path: "problemSolved",
      select: "_id ttitle difficulty tags",
    });
    res.status(200).send(user);
    // const count = req.result.problemSolved.length;
    // res.status(200).send(count);
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

const submittedProblem = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.pid;

    const ans = submission.find({ userId, problemId });

    if (ans.length == 0) {
      res.status(200).send("No Submission is present");
    }

    res.status(200).send(ans);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  createProblem,
  updateProblem,
  deleteProblem,
  getProblemById,
  getAllProblem,
  solvedAllProblemByUser,
  submittedProblem,
};

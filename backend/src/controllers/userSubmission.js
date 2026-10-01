const Problem = require("../models/problem");
const Submission = require("../models/submission");

const {
  getLanguageId,
  submitBatch,
  submitToken,
} = require("../utils/ProblemUtility");

const submitCode = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.id;

    const { code, language } = req.body;

    if (!userId || !code || !problemId || !language)
      return res.status(400).send("Some field missing");

    //fetch the problem from database
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).send("Problem not found");
    }

    const languageId = getLanguageId(language);
    if (!languageId) {
      return res.status(400).send("Unsupported language");
    }
    // testcases(Hidden)

    // kya apne submission ko store krde
    const submittedResult = await Submission.create({
      userId,
      problemId,
      language,
      code,
      totalTestCases: problem.hiddenTestCases.length,
      status: "Pending",
    });

    // judge0 ko code submit krna h

    const submissions = problem.hiddenTestCases.map(({ input, output }) => ({
      source_code: code,
      language_id: languageId,
      stdin: input,
      expected_output: output,
    }));
    const submitResult = await submitBatch(submissions);

    const resultToken = submitResult.map((value) => value.token);

    const testResult = await submitToken(resultToken);

    // submittedResult ko update karna h
    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = "Accepted";
    let errorMessage = null;
    for (const test of testResult) {
      if (test.status_id == 3) {
        testCasesPassed++;
        if (test.time) {
          runtime += parseFloat(test.time);
        }

        if (test.memory) {
          memory = Math.max(memory, test.memory);
        }
      } else {
        if (test.status_id === 4) {
          status = "Wrong Answer";
          errorMessage = test.stderr || test.message;
        } else if (test.status_id === 5) {
          status = "Time Limit Exceeded";
        } else if (test.status_id === 6) {
          status = "Compilation Error";
          errorMessage = test.stderr || test.message;
        } else if (test.status_id >= 7 && test.status_id <= 12) {
          status = "Runtime Error";
          errorMessage = test.stderr || test.message;
        } else {
          status = "Runtime Error";
          errorMessage = test.stderr || test.message;
        }

        // No need to continue checking if one testcase failed
        break;
      }
    }

    // store the result in database in submission
    submittedResult.status = status;
    submittedResult.testCasesPassed = testCasesPassed;
    submittedResult.errorMessage = errorMessage;
    submittedResult.runtime = runtime;
    submittedResult.memory = memory;

    await submittedResult.save();

    // ProblemId ko insert karenge userSchema k problemSolved me if it is not present there
    // req.result k andar user information present h
    if (req.result.problemSolved.includes(problemId)) {
      req.result.problemSolved.push(problemId);
      await req.result.save();
    }

    const accepted = status === "Accepted";

    res.status(201).json({
      accepted,
      totalTestCases: problem.hiddenTestCases.length,
      passedTestCases: testCasesPassed,
      runtime: runtime.toFixed(3), // Formats to standard 3 decimal places
      memory,
      error: errorMessage || status, // Sends the error string if it fails
    });
  } catch (error) {
    console.log("Error:", error.message);
    res.status(500).send("Internal Server Error " + error.message);
  }
};

const runCode = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.id;

    const { code, language } = req.body;

    if (!userId || !code || !problemId || !language)
      return res.status(400).send("Some field missing");

    // Fetch the problem from database
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).send("Problem not found");
    }

    const languageId = getLanguageId(language);
    if (!languageId) {
      return res.status(400).send("Unsupported language");
    }

    // Prepare batch submission for visible test cases only
    const submissions = problem.visibleTestCases.map(({ input, output }) => ({
      source_code: code,
      language_id: languageId,
      stdin: input,
      expected_output: output,
    }));
    
    const submitResult = await submitBatch(submissions);
    const resultToken = submitResult.map((value) => value.token);
    const testResult = await submitToken(resultToken);

    // Logic based on image_8879d0.png
    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = true;
    let errorMessage = null;

    for (const test of testResult) {
      if (test.status_id == 3) {
        testCasesPassed++;
        if (test.time) {
          runtime = runtime + parseFloat(test.time);
        }
        if (test.memory) {
          memory = Math.max(memory, test.memory);
        }
      } else {
        if (test.status_id == 4) {
          status = false;
          errorMessage = test.stderr || test.message || "Wrong Answer";
        } else {
          status = false;
          errorMessage = test.stderr || test.message || "Error";
        }
      }
    }

    // Map Judge0 results to the frontend's expected testCases array structure
    const testCasesWithResults = testResult.map((test, index) => ({
      stdin: problem.visibleTestCases[index].input,
      expected_output: problem.visibleTestCases[index].output,
      // Fallback through different Judge0 output fields if stdout is empty
      stdout: test.stdout || test.compile_output || test.stderr || "",
      status_id: test.status_id
    }));

    // Send the exact JSON structure expected by ProblemPage.jsx handleRun function
    res.status(201).json({
      success: status,
      runtime: runtime.toFixed(3),
      memory,
      testCases: testCasesWithResults,
      errorMessage
    });
    
  } catch (error) {
    console.log("Error:", error.message);
    res.status(500).send("Internal Server Error " + error.message);
  }
};

module.exports = { submitCode, runCode };

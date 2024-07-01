const dotenv = require("dotenv");
const Report = require("../models/reportModel");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
dotenv.config("../.env");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ==============|CUSTOM FUNCTIONS|================
const getUser = async (token) => {
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const freshUser = await User.findById(decode.id);
  return freshUser;
};
const sendRequestAI = async (userInput) => {
  // Access your API key as an environment variable
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  // The Gemini 1.5 models are versatile and work with multi-turn conversations (like chat)
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [
          {
            text: userInput,
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: `
              As a Security Analyst, I'm creating a sample JSON report structure to document a security incident. 
              Can you help me define the structure using the following schema? 
              {
                "category": "STRING", // Incident category (e.g., Security, Network)
                "severity": "STRING", // Severity level (e.g., High, Medium, Low)
                "reason": {}, // Possible reason and detailed explanation of incident
                "potential_threat": {} // Potential impact of given insident,
                "mitigation": {} // Steps to be taken to avoid this type of attack in the future,
                "conclusion": "STRING" // Summary of the incident and its resolution
              }`,
            // text: `
            //   As a Security Analyst, I'm creating a sample JSON report structure to document a security incident.
            //   Can you help me define the structure using the following schema?
            //   {
            //     "category": "STRING", // Incident category (e.g., Security, Network)
            //     "severity": "STRING", // Severity level (e.g., High, Medium, Low)
            //     "reason": {
            //       "description": "STRING", // Detailed explanation of the incident
            //       "source": "STRING" (Optional: Origin of the incident)
            //     },
            //     "potential_threat": {
            //       "description": "STRING", // Potential impact of the incident
            //       "data_breach": "BOOLEAN" (Optional: Whether data breach occurred)
            //     },
            //     "response_action": {
            //       "actions_taken": "STRING", // Steps taken to address the incident
            //       "prevention_plan": "STRING" (Optional: Measures to prevent future incidents)
            //     },
            //     "conclusion": "STRING" // Summary of the incident and its resolution
            //   }`,
          },
        ],
      },
    ],
  });
  const result = await chat.sendMessage(userInput);
  const response = await result.response.text();
  return response;
};

exports.getDashboard = async (req, res) => {
  // const aijson = await sendRequestAI(`Hello, I am HR.
  //   Today i went to my office, and opened my mail.
  //   There was excel file which are sent from some candidate.
  //   I opened it and it immediately pops up cmd terminals and disappeared`);
  // json = JSON.parse(aijson);
  // console.log(json);
  const freshUser = await getUser(req.headers.cookie.split("=")[1]);
  res.status(200).render("user/pages/home", { id: freshUser.id });
};
exports.getSubmit = async (req, res) => {
  const freshUser = await getUser(req.headers.cookie.split("=")[1]);
  res.status(200).render("user/pages/submitReport", { id: freshUser.id });
};
exports.postSubmit = async (req, res) => {
  const sampleDescription = `Hello, I am HR. 
    Today i went to my office, and opened my mail. 
    There was excel file which are sent from some candidate. 
    I opened it and it immediately pops up cmd terminals and disappeared`;
  const userReport = {
    description: req.body.description,
    status: "In Progress",
    stage: "Submitted",
    date: new Date(),
  };
  console.log(req.body.description);
  const AIGeneratedJSONText = await sendRequestAI(req.body.description);
  const AIReport = JSON.parse(AIGeneratedJSONText);
  const report = Object.assign({}, userReport, AIReport);
  const newReport = new Report(report);
  await newReport.save();
  res.status(200).redirect("/user/reports");
};
exports.getProfile = async (req, res) => {
  const freshUser = await getUser(req.headers.cookie.split("=")[1]);
  const data = await User.findById(freshUser.id);
  res
    .status(200)
    .render("user/pages/profile", { data: data, id: freshUser.id });
};
exports.changePassword = async (req, res) => {
  const freshUser = await getUser(req.headers.cookie.split("=")[1]);
  await User.findByIdAndUpdate(freshUser.id, {
    password: req.body.password,
    id: freshUser.id,
  });
};
exports.deleteAccount = async (req, res) => {
  const freshUser = await getUser(req.headers.cookie.split("=")[1]);
  await User.findByIdAndDelete(freshUser.id);
  res.status(200).redirect("logoff");
};
exports.logoff = async (req, res) => {
  res.clearCookie("token");
};
exports.getReport = async (req, res) => {
  const data = await Report.findById(req.params.id);
  res.status(200).render("user/pages/report", { data: data });
};
exports.getReports = async (req, res) => {
  const data = await Report.find();
  console.log(data);
  res.status(200).render("user/pages/reports", { data: data });
};

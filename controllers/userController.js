const dotenv = require("dotenv");
const Report = require("../models/reportModel");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
dotenv.config("../.env");
const util = require("util");
const fs = require("fs");

// ==============|CUSTOM FUNCTIONS|================
const getUser = async (token) => {
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const freshUser = await User.findById(decode.id);
  return freshUser;
};
const humanReadableDate = (date) => {
  const givenDate = new Date(date);
  const formatter = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const formattedDate = formatter.format(date);
  return `${formattedDate} ${givenDate.getHours()}:${givenDate.getMinutes()}:${givenDate.getSeconds()}`;
};
const saveLog = async (id) => {
  const last = await Report.findById(id);
  let lastLog = `${humanReadableDate(last.date)}|${last.target}|${
    last.origin.ip
  }|${last.origin.port}|${last.origin.username}|${last.origin.email}\n`;
  fs.appendFile(__dirname + "/../logs/activity.log", lastLog, (err) => {
    if (err) {
      throw err;
    }
  });
};
const scan = async (ip) => {
  console.log(`I am Triggered with ${ip}`);
  const exec = promisify(require("child_process").exec);
  const { stderr } = await exec(
    `nmap -T4 -sCV ${ip} -oA ${__dirname + "/../scans/" + ip}`
  );
  console.log("Scan Complated!");
  if (stderr) {
    console.log(stderr);
  }
};
const execCommand = async (command) => {
  const exec = promisify(require("child_process").exec);
  const { stdout, stderr } = await exec(command);
  if (stderr) return stderr;
  else return stdout;
};
const execPort = async (port, ip) => {
  const exec = promisify(require("child_process").exec);
  const { stdout, stderr } = await exec(`${__dirname}/../tools/${port}.sh ${ip}`);
  if (stderr) return stderr;
  else return stdout;
};
const getOpenPorts = async (ip) => {
  const out = await execCommand(`grep -Eon '(version="[-a-zA-Z0-9\.\_\\\/\,\!\@\#\$\%\^\&\*\(\)\+ ]*"|name="[-a-zA-Z0-9\.\_\\\/\,\!\@\#\$\%\^\&\*\(\)\+ ]*"|portid="[0-9]{1,5}")' ${__dirname + "/../scans/" + ip + ".xml"} | tail -n +4`)
  return out;
};
const getPortInfo = (scanText, port) => {
  const regex = new RegExp(`(${port}/tcp\\s+open\\s+[^\\n]+(?:\\n\\|[^\\n]*)*)`, 'g');
  const match = regex.exec(scanText);
  return match ? match[0] : null;
}
exports.getDashboard = async (req, res) => {
  const freshUser = await getUser(req.headers.cookie.split("=")[1]);
  res.status(200).render("user/pages/home", { id: freshUser.id });
};
exports.getSubmit = async (req, res) => {
  const freshUser = await getUser(req.headers.cookie.split("=")[1]);
  res.status(200).render("user/pages/scan", { id: freshUser.id });
};
exports.postSubmit = async (req, res) => {
  const freshUser = await getUser(req.headers.cookie.split("=")[1]);
  const { email, username, id } = await User.findById(freshUser.id);
  const data = await Report.find({ "origin.id": id });
  res.status(200).render("user/pages/reports", {
    data: data,
    message: "Your scan is processing. It might take while",
  });
  await scan(req.body.target);
  let portList = []
  let out = await getOpenPorts(req.body.target);
  let current = "23"
  currentObject = {}
  let a = out.split("\n")
  let allResult=""
  for (const line of a) {
    if (current == line.split(":")[0]){
      if (line.includes("port")){
        currentObject.port = line.split('"')[1]
        try{
          let result = await execPort(currentObject.port, req.body.target);
          if (result){
            currentObject.result = result
            allResult += result
          }
        } catch {
          // 
        }
      }
      if (line.includes("name")){
        currentObject.service = line.split('"')[1]
      }
      if (line.includes("version")){
        currentObject.version = line.split('"')[1]
      }
    } else {
      current = line.split(":")[0]
        portList.push(currentObject)
      currentObject = {}
      if (line.includes("port")){
        currentObject.port = line.split('"')[1]
        try{
          let result = await execPort(currentObject.port, req.body.target);
          if (result){
            currentObject.result = result
            allResult += result
          }
        } catch {
          // 
        }
      }
    }
  }
  const newReport = new Report({
    target: req.body.target,
    ports: portList,
    origin: {
      email: email,
      username: username,
      ip: req.socket.remoteAddress,
      id: id,
      port: req.socket.remotePort,
    },
    result: allResult,
    date: new Date(),
  });

  await newReport.save();
  saveLog(newReport.id);
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
  res.redirect("/login");
};
exports.getReport = async (req, res) => {
  const data = await Report.findById(req.params.id);
  res.status(200).render("user/pages/report", { data: data });
};
exports.getReports = async (req, res) => {
  const { id } = await getUser(req.headers.cookie.split("=")[1]);
  const data = await Report.find({ "origin.id": id });
  res
    .status(200)
    .render("user/pages/reports", { data: data, message: undefined });
};
exports.getAllPort = async (req, res) => {
  const {target, result} = await Report.findById(req.params.id)
  fs.readFile(__dirname+`/../scans/${target}.nmap`, "utf-8", (err, content) =>{
    if(err) {throw err}
    res.status(200).render("user/pages/port", {port: "all", data:content, result: result});
  })
};
exports.getPort = async (req, res) => {
  const {target, ports} = await Report.findById(req.params.id)
  fs.readFile(__dirname+`/../scans/${target}.nmap`, "utf-8", (err, content) =>{
    if(err) {throw err}
    const data = getPortInfo(content, req.params.port)
    res.status(200).render("user/pages/port", {port: req.params.port, data:data, result: ports});
  })
};

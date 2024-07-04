const dotenv = require("dotenv");
const Report = require("../models/reportModel");
const User = require("../models/userModel");
const Whitelist = require("../models/whitelistModel");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const validator = require("validator");
const fs = require("fs");
dotenv.config("../.env");

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
const updateWhitelist = async () => {
  const list = await Whitelist.find();
  let upToDateList = "";
  list.forEach((item) => {
    upToDateList += `allow ${item.ip};\n`;
  });
  upToDateList += "deny all;";
  fs.writeFile(__dirname + "/../whitelist.conf", upToDateList, (err) => {
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
exports.getReports = async (req, res) => {
  data = await Report.find();
  res.status(200).render(`admin/pages/reports`, {
    data: data,
    message: undefined,
  });
};
exports.getReport = async (req, res) => {
  data = await Report.findById(req.params.id);
  res.status(200).render(`admin/pages/report`, {
    data: data,
  });
};
exports.getLog = async (req, res) => {
  fs.readFile(__dirname + "/../logs/activity.log", "utf-8", (err, content) => {
    if (err) {
      throw err;
    }
    const data = [];
    content.split("\n").forEach((item) => {
      if (item != "") {
        [date, target, ip, port, username, email] = item.split("|");
        const line = {
          target: target,
          date: new Date(date),
          origin: {
            ip: ip,
            port: port,
            username: username,
            email: email,
          },
        };
        data.push(line);
      }
    });
    res.status(200).render("admin/pages/log", { data: data });
  });
};
exports.deleteReport = async (req, res) => {
  await Report.findByIdAndDelete(req.params.id);
  const data = await Report.find();
  res
    .status(200)
    .render("admin/pages/reports", { message: "Success", data: data });
};
exports.getDashboard = async (req, res) => {
  res.status(200).render("admin/pages/home", {
    title: "Dashboard",
  });
};
exports.changePassword = async (req, res) => {
  await User.findOneAndUpdate(
    { role: "admin" },
    { password: req.body.newPassword }
  );
  res.status(200).render("admin/pages/profile", {
    message: "Password Changed Successfully!",
    code: 0,
  });
};
exports.getProfile = async (req, res) => {
  const freshUser = await getUser(req.headers.cookie.split("=")[1]);
  const data = await User.findById(freshUser.id);
  res.status(200).render("admin/pages/profile", { data: data });
};
exports.getUser = async (req, res) => {
  const data = await User.findById(req.params.id);
  res.status(200).render("admin/pages/user", { data: data });
};
exports.getUsers = async (req, res) => {
  const data = await User.find().sort({ role: 1 });
  res
    .status(200)
    .render("admin/pages/users", { data: data, message: undefined });
};
exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  const data = await User.find();
  res.status(200).render("admin/pages/users", {
    data: data,
    message: "User successfully deleted!",
    code: 0,
  });
};
exports.getSubmit = async (req, res) => {
  res.status(200).render("admin/pages/scan");
};

exports.postSubmit = async (req, res) => {
  const freshUser = await getUser(req.headers.cookie.split("=")[1]);
  const { email, username, id } = await User.findById(freshUser.id);
  const data = await Report.find();
  res.status(200).render("admin/pages/reports", {
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
exports.updateUserPage = async (req, res) => {
  const singleUser = await User.findById(req.params.id);
  res.status(200).render("admin/pages/updateUser", {
    data: singleUser,
  });
};
exports.updateUser = async (req, res) => {
  const update = {
    username: validator.escape(req.body.username),
    email: validator.escape(req.body.email),
    role: validator.escape(req.body.role),
  };
  await User.findByIdAndUpdate(req.params.id, update);
  data = await User.find().sort({ role: 1 });
  res
    .status(200)
    .render("admin/pages/users", { message: "User successfully updated!" });
};
exports.getAllPort = async (req, res) => {
  const {target, result} = await Report.findById(req.params.id)
  fs.readFile(__dirname+`/../scans/${target}.nmap`, "utf-8", (err, content) =>{
    if(err) {throw err}
    res.status(200).render("admin/pages/port", {port: "all", data:content, result: result});
  })
};
exports.getPort = async (req, res) => {
  const {target, ports} = await Report.findById(req.params.id)
  fs.readFile(__dirname+`/../scans/${target}.nmap`, "utf-8", (err, content) =>{
    if(err) {throw err}
    const data = getPortInfo(content, req.params.port)
    res.status(200).render("admin/pages/port", {port: req.params.port, data:data, result: ports});
  })
};
exports.getWhitelist = async (req, res) => {
  const data = await Whitelist.find().sort({ date: 1 });
  res
    .status(200)
    .render("admin/pages/whitelist", { data: data, message: undefined });
};
exports.postIP = async (req, res) => {
  const freshUser = await getUser(req.headers.cookie.split("=")[1]);
  const { username, email, id } = await User.findById(freshUser.id);
  const newIp = new Whitelist({
    ip: req.body.ip,
    origin: {
      username: username,
      email: email,
      id: id,
      ip: req.socket.remoteAddress,
    },
    date: new Date(),
  });
  await newIp.save();
  await updateWhitelist();
  const data = await Whitelist.find();
  res.status(200).render("admin/pages/whitelist", {
    message: "IP address added to list",
    data: data,
  });
};
exports.getNewIP = async (req, res) => {
  res.status(200).render("admin/pages/createWhitelist");
};
exports.deleteIP = async (req, res) => {
  await Whitelist.findByIdAndDelete(req.params.id);
  await updateWhitelist();
  const data = await Whitelist.find();
  res.status(200).render("admin/pages/whitelist", {
    data: data,
    message: "IP successfully removed from list",
  });
};

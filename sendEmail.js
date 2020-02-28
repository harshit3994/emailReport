var appConfig = require("./config/snowconfig");
var nodeMailer = require("nodemailer");
var ejs = require("ejs");
var snowTaskEmailService = require("./services/snowTaskEmailService");
var logger = require("./logger/logger").successlog;

var puppeteer = require("puppeteer");
var fs = require("fs");

function sendEmail() {
  var date = new Date();
  var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  var starttimeDiff = Math.abs(firstDay.getTime() - date.getTime());
  var startdiffdays = Math.ceil(starttimeDiff / (1000 * 3600 * 24));
  var queryobjfortabularmail = {
    startdiff: startdiffdays - 1,
    enddiff: "0",
    assignmentgroup:
      appConfig.all[0] +
      "^ORassignment_group=" +
      appConfig.all[1] +
      "^ORassignment_group=" +
      appConfig.all[2]
  };
  var date = new Date();
  var _browser;
  var _page;

  // Object

  var objForTransport = appConfig.objForTransport;

  logger.debug(objForTransport);

  logger.debug("difference of days" + startdiffdays);
  console.log("difference of days" + startdiffdays);
  // We can add the assignment group here
  logger.debug("SendEmail job started");
  console.log("SendEmail job started");
  snowTaskEmailService.saveSnowTask(
    queryobjfortabularmail.startdiff,
    queryobjfortabularmail.enddiff,
    queryobjfortabularmail.assignmentgroup,
    function(err, result) {
      var transporter = nodeMailer.createTransport(objForTransport);
      ejs.renderFile("./temp/template.ejs", result, function(err, html) {
        var html2 =
          html +
          '<div class="row">' +
          '<div class="col-md-6 col-lg-6 col-sm-12 col-xs-12">' +
          '<div style="background-color:aqua;   border-bottom-left-radius:50%;border-bottom-right-radius:50%;">' +
          '<h3 class="font-family" style="text-align: center;"><u>Automation Statistics For Current Month</u></h3>' +
          "</div>" +
          '<img style="background-color: antiquewhite;width: 450px;" src="automationstatisticseverydaystackedBarChart.png">' +
          "</div>" +
          '<div class="col-md-5 col-lg-5 col-sm-12 col-xs-12">' +
          '<div style="background-color:aqua;   border-bottom-left-radius:50%; border-bottom-right-radius:50%;">' +
          '<h3 class="font-family" style="text-align: center;"><u>Processed Task and Incident</u></h3>' +
          "</div>" +
          '<img src="TaskandIncidentpieChart.png" style="width: 370px;background-color: antiquewhite;">' +
          "</div>" +
          '<div class="w-100"></div>' +
          '<div class="col-md-6 col-lg-6 col-sm-12 col-xs-12">' +
          '<div style="background-color:aqua;   border-bottom-left-radius:50%;border-bottom-right-radius:50%;">' +
          '<h3 class="font-family" style="text-align: center;"><u>Automation Statistics Past Six Months</u></h3>' +
          "</div>" +
          '<img src="automationstatisticspastSixmonthsstackedBarChart.png" style="background-color: antiquewhite;width: 450px;">' +
          "</div>" +
          '<div class="col-md-5 col-lg-5 col-sm-12 col-xs-12">' +
          '<div style="background-color:aqua;   border-bottom-left-radius:50%;border-bottom-right-radius:50%;">' +
          '<h3 class="font-family" style="text-align: center;"><u>Tickets Automated Category Based</u></h3>' +
          "</div>" +
          '<img src="automationstackedBarChart.png" style="background-color: antiquewhite;width: 430px;">' +
          "</div>" +
          "</div>";

        fs.writeFile("./temp/template.html", html2, function(err) {
          if (err) {
            return console.log(err);
          }
          console.log("The file was saved!");
          logger.debug("The template.htmls file is saved");
          puppeteer
            .launch({
              headless: true,
              args: ["--no-sandbox", "--disable-setuid-sandbox"]
            })
            .then(browser => (_browser = browser))
            .then(browser => (_page = browser.newPage()))
            .then(page => page.goto(appConfig.pathTopdf))
            .then(() => _page)
            .then(page =>
              page.pdf({ path: "./temp/emailreport.pdf", format: "A4" })
            )
            .then(() => {
              console.log("in browser");
              logger.debug("Pdf generation is completed");
              _browser.close();

              var MailOptions = {
                from: appConfig.SenderEmailAddress,
                to: appConfig.mailList,
                subject: "Service Now BOT Productivity Report",
                text: "Service Now Report for the current month",
                html:
                  html +
                  '<div class="row">' +
                  '<div class="col-md-6 col-lg-6 col-sm-12 col-xs-12">' +
                  '<div style="background-color:aqua;   border-bottom-left-radius:50%;border-bottom-right-radius:50%;">' +
                  '<h3 class="font-family" style="text-align: center;"><u>Automation Statistics For Current Month</u></h3>' +
                  "</div>" +
                  '<img style="background-color: antiquewhite;width: 450px;" src="cid:image1">' +
                  "</div>" +
                  '<div class="col-md-5 col-lg-5 col-sm-12 col-xs-12">' +
                  '<div style="background-color:aqua;   border-bottom-left-radius:50%; border-bottom-right-radius:50%;">' +
                  '<h3 class="font-family" style="text-align: center;"><u>Processed Task and Incident</u></h3>' +
                  "</div>" +
                  '<img src="cid:image2" style="width: 370px;background-color: antiquewhite;">' +
                  "</div>" +
                  '<div class="w-100"></div>' +
                  '<div class="col-md-6 col-lg-6 col-sm-12 col-xs-12">' +
                  '<div style="background-color:aqua;   border-bottom-left-radius:50%;border-bottom-right-radius:50%;">' +
                  '<h3 class="font-family" style="text-align: center;"><u>Automation Statistics Past Six Months</u></h3>' +
                  "</div>" +
                  '<img src="cid:image4" style="background-color: antiquewhite;width: 450px;">' +
                  "</div>" +
                  '<div class="col-md-5 col-lg-5 col-sm-12 col-xs-12">' +
                  '<div style="background-color:aqua;   border-bottom-left-radius:50%;border-bottom-right-radius:50%;">' +
                  '<h3 class="font-family" style="text-align: center;"><u>Tickets Automated Category Based</u></h3>' +
                  "</div>" +
                  '<img src="cid:image3" style="background-color: antiquewhite;width: 430px;">' +
                  "</div>" +
                  "</div>",
                attachments: [
                  {
                    filename: "automationstatisticseverydaystackedBarChart.png",
                    path:
                      __dirname +
                      "/temp/automationstatisticseverydaystackedBarChart.png",
                    cid: "image1"
                  },
                  {
                    filename: "TaskandIncidentpieChart.png",
                    path: __dirname + "/temp/TaskandIncidentpieChart.png",
                    cid: "image2"
                  },
                  {
                    filename: "automationstackedBarChart.png",
                    path: __dirname + "/temp/automationstackedBarChart.png",
                    cid: "image3"
                  },
                  {
                    filename:
                      "automationstatisticspastSixmonthsstackedBarChart.png",
                    path:
                      __dirname +
                      "/temp/automationstatisticspastSixmonthsstackedBarChart.png",
                    cid: "image4"
                  },
                  {
                    filename: `BOT Productivity Report for ${new Date().toLocaleDateString()}.pdf`,
                    path: __dirname + "/temp/emailreport.pdf"
                  }
                ]
              };

              logger.debug("Added the pdf as attachment in the mail");

              transporter.sendMail(MailOptions, function(error, info) {
                if (error) {
                  console.log("Email Error " + error);
                  logger.debug("Email Error " + error);
                } else {
                  logger.debug("Email Sent to user " + info.response);
                  console.log("Email Sent to user " + info.response);

                  res.json({ Message: "Email is sent to user" });
                }
              });
            });

          // For graph section we can append the original html with the graph div
          // So there will be two html one for email part and other for the pdf part
        });
      });
    }
  );
}

sendEmail();

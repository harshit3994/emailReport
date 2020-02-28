
var async = require("async");
var appConfig = require('./config/snowconfig');
var request = require('request');
var fs = require('fs')
var Promise = require('promise');
var csv = require("csvtojson");
var json2csv = require('json2csv');



//var puppeteer = require('puppeteer');

var username = appConfig.username;
var password = appConfig.password;

var auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');


function generateFailedRuns() {

    var date = new Date();
    var arrforcurrMOnth = []
    var urlfortask = 'https://scholastic.service-now.com/sc_task.do?CSV&sysparm_fields=sys_updated_on,state,assigned_to,short_description,number,closed_by,sys_id,assignment_group,closed_at,u_cat_item&sysparm_query=sys_updated_onBETWEENjavascript:gs.daysAgoStart(40)@javascript:gs.daysAgoEnd(0)^assignment_group=' + appConfig.all[0] + '^ORassignment_group=' + appConfig.all[1] + '^ORassignment_group=' + appConfig.all[2];
    var options = {
        url: urlfortask,
        headers: {
            'Authorization': auth,
            'Content-Type': 'application/json'

        }
    }


    var promise = new Promise(function (resolve, reject) {
        request.get(options, function (error, response, body) {
            if (error) reject(error);
            else resolve(response);
        }).pipe(fs.createWriteStream(__dirname + "/tempforFailedRuns/task.csv"))
    });

    promise.then(function (value) {
        console.log("csv reading done");
        csv()
            .fromFile(__dirname + "/tempforFailedRuns/task.csv")
            .then(function (data) { //when parse finished, result will be emitted here.


                for (var i = 0; i < data.length; i++) {

                    var objforcurrMonth = {};
                    // here we will filter the last day data and week data

                    var isTerminate = data[i]['short_description'].split(' ')[0];
                    var check = new Date(data[i]["sys_updated_on"]);
                    var hours = Math.abs(date - check) / 36e5;
                    var starttimeDiff = Math.abs(date.getTime() - check.getTime());
                    var startdiffdays = Math.ceil(starttimeDiff / (1000 * 3600 * 24));

                    // For current Month
                    if (date.getMonth() === check.getMonth()) {




                        if ((isTerminate === "Security" || isTerminate === "Terminate" || isTerminate === "Delete")) {

                            if (data[i]["state"] != "Closed Complete" && data[i]["state"] != "Closed Incomplete" && hours > 24) {

                                console.log("-----0" + data[i]["sys_updated_on"])
                                objforcurrMonth.botname = appConfig[isTerminate].botid
                                objforcurrMonth.tasknumber = data[i]["number"];
                                objforcurrMonth.shortdescription = data[i]["short_description"];
                                objforcurrMonth.sysid = data[i]["sys_id"];
                                objforcurrMonth.age_of_task = startdiffdays;
                                objforcurrMonth.assignment_group = data[i]["assignment_group"];
                                objforcurrMonth.catitem = data[i]["u_cat_item"];

                                if (data[i]["assigned_to"] === "") {
                                    objforcurrMonth.assignedto = "Unassigned";
                                } else {
                                    objforcurrMonth.assignedto = data[i]["assigned_to"];
                                }

                                arrforcurrMOnth.push(objforcurrMonth);



                            }

                        }



                        if (appConfig[data[i]["short_description"]] && appConfig[data[i]["short_description"]].automated === true && data[i]["state"] != "Closed Complete" && data[i]["state"] != "Closed Incomplete" && hours > 24) {
                            console.log(data[i]["number"])
                            objforcurrMonth.botname = appConfig[data[i]["short_description"]].botid
                            objforcurrMonth.tasknumber = data[i]["number"];
                            objforcurrMonth.shortdescription = data[i]["short_description"];
                            objforcurrMonth.sysid = data[i]["sys_id"];
                            objforcurrMonth.age_of_task = startdiffdays;
                            objforcurrMonth.assignment_group = data[i]["assignment_group"];
                            objforcurrMonth.catitem = data[i]["u_cat_item"];

                            if (data[i]["assigned_to"] === "") {
                                objforcurrMonth.assignedto = "Unassigned";
                            } else {
                                objforcurrMonth.assignedto = data[i]["assigned_to"];
                            }

                            arrforcurrMOnth.push(objforcurrMonth);



                        }



                    }

                }

                console.log(JSON.stringify(arrforcurrMOnth));

                json2csv({ data: arrforcurrMOnth, fields: ['botname', 'tasknumber', 'shortdescription','age_of_task','assignment_group','catitem'] }, function (err, csv) {
                    if (err) console.log(err);
                    fs.writeFile('./tempforFailedRuns/failure.csv', csv, function (err) {
                        if (err) throw err;
                        console.log('file saved');
                    });
                });

            })


    }).catch((err) => {
        console.log(err);
    });



}

generateFailedRuns();
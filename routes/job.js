//create a new job route
const express = require('express');
const router = express.Router();
const Lead = require('../models/lead');
const Job = require('../models/job');
const Leaderboard = require('../models/leaderboard');
const verifyAPIKey = require('../middlewares/verifyAPIKey');
const axios = require('axios');


let pendingJobs = [];
let flag = 0;
const timer = ms => new Promise(res => setTimeout(res, ms))

let leaderboard = {};


async function generateLeaderboard(data) {
    leaderboard = {};
    let { projects, identifyingLabel, labels } = data;
    console.log(projects);
    console.log(identifyingLabel);
    console.log(labels);
    for (let m = 0; m < projects.length; m++) {
        await axios.get(`https://api.github.com/search/issues?q=repo:${projects[m]}+is:pr+label:${identifyingLabel}+is:merged&per_page=100`, {
            headers: {
                Authorization: 'token ' + process.env.GITHUB_TOKEN
            }
        }).then(async function (response) {
            if (response.data.items && response.data.items.length > 0) {
                let prs = response.data.items;
                for (let i = 0; i < prs.length; i++) {
                    for (let j = 0; j < prs[i].labels.length; j++) {
                        if (!leaderboard[prs[i].user.id]) {
                            leaderboard[prs[i].user.id] = {
                                avatar_url: prs[i].user.avatar_url,
                                login: prs[i].user.login,
                                url: prs[i].user.html_url,
                                score: 0,
                                pr_urls: [],
                            }
                            //convert labels to keys

                        }
                        if (leaderboard[prs[i].user.id].pr_urls.indexOf(prs[i].html_url) == -1) {
                            leaderboard[prs[i].user.id].pr_urls.push(prs[i].html_url);
                        }
                        let obj = labels.find(o => o.label === prs[i].labels[j].name);
                        if (obj) {
                            leaderboard[prs[i].user.id].score += obj.points;
                        }

                    }
                }
                if (response.data.total_count > 100) {
                    //calculate number of pages
                    let pages = Math.ceil(response.data.total_count / 100);
                    console.log("========")
                    console.log("No. of pages: " + pages);
                    console.log(`https://api.github.com/search/issues?q=repo:${projects[m]}+is:pr+label:${identifyingLabel}+is:merged`);
                    console.log("========")
                    for (let i = 2; i <= pages; i++) {
                        console.log("Page: " + i);
                        let paginated = await axios.get(`https://api.github.com/search/issues?q=repo:${projects[m]}+is:pr+label:${identifyingLabel}+is:merged&per_page=100&page=${i}`, {
                            headers: {
                                Authorization: 'token ' + process.env.GITHUB_TOKEN
                            }
                        }).then(async function (response) {
                            console.log("*****" + response.data.items.length);
                            if (response.data.items && response.data.items.length > 0) {
                                let prs = response.data.items
                                for (let i = 0; i < prs.length; i++) {
                                    for (let j = 0; j < prs[i].labels.length; j++) {
                                        if (!leaderboard[prs[i].user.id]) {
                                            leaderboard[prs[i].user.id] = {
                                                avatar_url: prs[i].user.avatar_url,
                                                login: prs[i].user.login,
                                                url: prs[i].user.html_url,
                                                score: 0,
                                                pr_urls: [],
                                            }
                                        }
                                        if (leaderboard[prs[i].user.id].pr_urls.indexOf(prs[i].html_url) == -1) {
                                            leaderboard[prs[i].user.id].pr_urls.push(prs[i].html_url);
                                        }
                                        let obj = labels.find(o => o.label === prs[i].labels[j].name);
                                        if (obj) {
                                            leaderboard[prs[i].user.id].score += obj.points;
                                        }

                                    }
                                }
                            }
                            console.log("Completed page: " + i);

                        })
                        await timer(7000);
                    }
                }

            }
        }).catch(function (err) {
            console.log(err);
        }
        )
        console.log("Completed " + m + " of " + projects.length);
        await timer(7000);
    }
    // wait for all the prs to be fetched
    console.log("Leaderboard generated");
    //sort the leaderboard by score
    let leaderboardArray = Object.keys(leaderboard).map(key => leaderboard[key]);
    leaderboardArray.sort((a, b) => b.score - a.score);
    return leaderboardArray;
}

//listen to all jobs
Job.watch().
    on('change', async (data) => {
        if (data.operationType === "insert") {
            console.log(data.fullDocument);
            Lead.findOne({ id: data.fullDocument.leadId, createdBy: data.fullDocument.ownerId }, (err, lead) => {
                if (err) {
                    console.log(err);
                } else if (!lead) {
                    console.log("No lead found");
                } else {
                    let new_data = {
                        job: data.fullDocument,
                        lead: lead,
                        queue_position: pendingJobs.length
                    }
                    pendingJobs.push(new_data);
                    console.log(pendingJobs);
                }
            });
        }
    });


//infinite loop
setInterval(() => {
    console.log("Checking for pending jobs");
    if (pendingJobs.length > 0 && flag === 0) {
        console.log("Found pending jobs");
        let job = pendingJobs.shift();
        console.log(job);
        Job.findOneAndUpdate({ jobId: job.lead.jobId }, { status: "in progress" }, async function (err, njob) {
            if (err) {
                console.log(err);
            } else if (!njob) {
                console.log("No job found : Most likely deleted by user");
            } else {
                Lead.findOne({ id: job.lead.id, createdBy: job.lead.createdBy }, async function (err, lead) {
                    if (err) {
                        console.log(err);
                    } else if (!lead) {
                        console.log("No lead found");
                    } else {
                        flag = 1;
                        let data = {
                            projects: lead.githubList,
                            identifyingLabel: lead.identifyingLabel,
                            labels: lead.labelList,
                        }
                        let gen_lead = await generateLeaderboard(data);
                        console.log(gen_lead);
                        //change job status to completed and update leaderboard
                        Job.findOneAndUpdate({ jobId: job.lead.jobId }, { status: "completed", leaderboard: gen_lead }, async function (err, njob) {
                            if (err) {
                                console.log(err);
                            } else if (!njob) {
                                console.log("No job found : Most likely deleted by user");
                            } else {
                                flag = 0;
                                let leaderboard = {
                                    leadId: job.lead.id,
                                    ownerId: job.lead.createdBy,
                                    leaderboard: gen_lead,
                                    jobId: job.lead.jobId
                                }
                                let leaderboard_data = new Leaderboard(leaderboard);
                                await leaderboard_data.save();
                            }
                        });
                    }
                });

            }
        });
    }
}, 5000);



//get job by id
router.get('/:id', verifyAPIKey, (req, res) => {
    const { id } = req.params;
    Job.findOne({ jobId: id, ownerId: res.locals.user.uid }, (err, job) => {
        if (err) {
            res.status(500).json({
                error: err
            });
        } else if (!job) {
            res.status(400).json({
                error: "Job does not exist for this user"
            });
        } else {
            res.status(200).json({
                message: "Job found",
                action: "get",
                next: "complete job execution",
                step: "Wait for the leaderboard to be generated, your request has been queued, check status with the get job status route",
                job: job
            });
        }
    });
});


module.exports = router;
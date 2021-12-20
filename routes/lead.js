//create a new lead route
const express = require('express');
const router = express.Router();
const Lead = require('../models/lead');
const Leaderboard = require('../models/leaderboard');
const Job = require('../models/job');
const verifyAPIKey = require('../middlewares/verifyAPIKey');
const leaderboard = require('../models/leaderboard');

//create a new lead route
router.post('/new', verifyAPIKey, (req, res) => {
    const { title, description, githubList, identifyingLabel, labelList } = req.body;
    const newLead = new Lead({
        title: title,
        description: description,
        createdBy: res.locals.user.uid,
        githubList: githubList,
        identifyingLabel: identifyingLabel,
        labelList: labelList
    });
    newLead.save(newLead, (err, lead) => {
        if (err) {
            res.status(500).json({
                error: err
            });
        } else {
            const newJob = new Job({
                leadId: lead.id,
                jobId: lead.jobId,
                ownerId: res.locals.user.uid
            });
            newJob.save(newJob, (err, job) => {
                if (err) {
                    res.status(500).json({
                        error: err
                    });
                } else {
                    res.status(201).json({
                        message: "Lead created",
                        action: "new",
                        next: "complete job execution",
                        step: "Wait for the leaderboard to be generated, your request has been queued, check status with the get job status route",
                        lead: lead
                    });
                }
            }
            );
        }
    });
}
);


//get lead by id
router.get('/:id', verifyAPIKey, (req, res) => {
    const { id } = req.params;
    Lead.findOne({ id: id, createdBy: res.locals.user.uid }, (err, lead) => {
        if (err) {
            res.status(500).json({
                error: err
            });
        } else if (!lead) {
            res.status(400).json({
                error: "Lead does not exist for this user"
            });
        } else {
            res.status(200).json({
                message: "Lead found",
                action: "get",
                next: "complete job execution",
                step: "Wait for the leaderboard to be generated, your request has been queued, check status with the get job status route",
                lead: lead
            });
        }
    });
}
);


//get leaderboard by lead id
router.get('/:id/leaderboard', verifyAPIKey, (req, res) => {
    const { id } = req.params;
    Leaderboard.findOne({ leadId: id, ownerId: res.locals.user.uid }, (err, lead) => {
        if (err) {
            res.status(500).json({
                error: err
            });
        } else if (!lead) {
            res.status(400).json({
                error: "Leaderboard does not exist for this user/or has not yet been generated"
            });
        } else {
            res.status(200).json({
                message: "Leaderboard found",
                action: "get",
                next: "showcase leaderboard",
                step: "Leaderboard has been generated, check status with the get job status route",
                leaderboard: lead
            });
        }
    });
}
);

module.exports = router;


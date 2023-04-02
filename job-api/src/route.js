const express = require("express");
const router = express.Router();
const jobController = require("./controllers/jobController");

router.post("/jobs", jobController.createJob);
router.get("/jobs/:id/status", jobController.getJobStatus);
router.get("/jobs/:id/result", jobController.getJobResult);
router.delete("/jobs/:id", jobController.deleteJob);
router.get("/jobs", jobController.getSubmittedJobs);
router.put("/observer/parameters", jobController.updateObserverParameters);

module.exports = router;

const express = require("express");

const launchesRouter = express.Router();

const { httpgetAllLaunches } = require("./launches.controller");

launchesRouter.get("/launches", httpgetAllLaunches);

module.exports = launchesRouter;
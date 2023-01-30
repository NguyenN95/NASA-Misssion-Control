const axios = require("axios");
const launchesDatabase = require("./launches.mongo");
const planets = require("./planets.mongo");

const DEFAULT_FLIGHT_NUMBER = 100;

const launch = {
    flightNumber: 100, // flight_number
    mission: "Kepler Exploration X", // name
    rocket: "Explore IS1", // rocket.name
    launchDate: new Date("December 27, 2030"), // date_local
    target: "Kepler-442 b", // not applicable
    customer: ['ZTM', 'NASA'], // payload.customers for each payload
    upcoming: true, // upcoming
    success: true // success
};

saveLauch(launch);

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunches() {
    console.log("Downloading launch data...");
    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: 'rocket',
                    select: {
                        name: 1
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        'customers': 1
                    }
                }
            ]
        }
    });

    if (response.status !== 200) {
        console.log("Problem downloading launch data");
        throw new Error("Launch data download failed");
    }

    const launchDocs = response.data.docs;
    for (const launchDoc of launchDocs) {
        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers: launchDoc['payloads'].flatMap((payload) => {
                return payload['customers'];
            })
        }
        console.log(`${launch.flightNumber}, ${launch.mission}`);

        await saveLauch(launch);
    }
}

async function loadLaunchesData() {
    const firstLauch = await findLauch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat'
    });

    if (firstLauch) {
        console.log("Launch data already loaded");
        return;
    }

    await populateLaunches();
}

async function findLauch(filter) {
    return await launchesDatabase.findOne(filter);
}

async function getLatestFlightNumber() {
    const latestLaunch = await launchesDatabase
        .findOne()
        .sort('-flightNumber');

    if (!latestLaunch) {
        return DEFAULT_FLIGHT_NUMBER;
    }
    return latestLaunch.flightNumber;
}

async function saveLauch(launch) {
    await launchesDatabase.findOneAndUpdate({
        flightNumber: launch.flightNumber,
    }, launch, {
        upsert: true
    });
}

async function getAllLaunches() {
    return await launchesDatabase.find({}, { "_id": 0, "__v": 0 }).exec();
}

async function scheduleNewLaunch(launch) {
    const planet = await planets.findOne({ keplerName: launch.target });

    if (!planet) {
        throw new Error('No matching planet found');
    }

    const newFlightNumber = await getLatestFlightNumber() + 1;

    const newLaunch = Object.assign(launch, {
        customers: ["Zero To Mastery", "NASA"],
        upcoming: true,
        success: true,
        flightNumber: newFlightNumber
    });

    await saveLauch(newLaunch);
}

async function existsLaunchWithId(launchId) {
    return await launchesDatabase.findLauch({ flightNumber: launchId });
}

async function abortLaunchById(launchId) {
    const aborted = await launchesDatabase.updateOne({
        flightNumber: launchId,
    }, {
        upcoming: false,
        success: false,
    });

    return aborted.modifiedCount === 1;
}

module.exports = {
    getAllLaunches,
    scheduleNewLaunch,
    existsLaunchWithId,
    abortLaunchById,
    loadLaunchesData
}
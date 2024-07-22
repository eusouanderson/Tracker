const mongoose = require('mongoose');

// Definindo o schema para Telemetry
const telemetrySchema = new mongoose.Schema({
    game: {
        connected: Boolean,
        gameName: String,
        paused: Boolean,
        time: Date,
        timeScale: Number,
        nextRestStopTime: Date,
        version: String,
        telemetryPluginVersion: String
    },
    truck: {
        id: String,
        make: String,
        model: String,
        speed: Number,
        cruiseControlSpeed: Number,
        cruiseControlOn: Boolean,
        odometer: Number,
        gear: Number,
        displayedGear: Number,
        forwardGears: Number,
        reverseGears: Number,
        shifterType: String,
        engineRpm: Number,
        engineRpmMax: Number,
        fuel: Number,
        fuelCapacity: Number,
        fuelAverageConsumption: Number,
        fuelWarningFactor: Number,
        fuelWarningOn: Boolean,
        wearEngine: Number,
        wearTransmission: Number,
        wearCabin: Number,
        wearChassis: Number,
        wearWheels: Number,
        userSteer: Number,
        userThrottle: Number,
        userBrake: Number,
        userClutch: Number,
        gameSteer: Number,
        gameThrottle: Number,
        gameBrake: Number,
        gameClutch: Number,
        shifterSlot: Number,
        engineOn: Boolean,
        electricOn: Boolean,
        wipersOn: Boolean,
        retarderBrake: Number,
        retarderStepCount: Number,
        parkBrakeOn: Boolean,
        motorBrakeOn: Boolean,
        brakeTemperature: Number,
        adblue: Number,
        adblueCapacity: Number,
        adblueAverageConsumption: Number,
        adblueWarningOn: Boolean,
        airPressure: Number,
        airPressureWarningOn: Boolean,
        airPressureWarningValue: Number,
        airPressureEmergencyOn: Boolean,
        airPressureEmergencyValue: Number,
        oilTemperature: Number,
        oilPressure: Number,
        oilPressureWarningOn: Boolean,
        oilPressureWarningValue: Number,
        waterTemperature: Number,
        waterTemperatureWarningOn: Boolean,
        waterTemperatureWarningValue: Number,
        batteryVoltage: Number,
        batteryVoltageWarningOn: Boolean,
        batteryVoltageWarningValue: Number,
        lightsDashboardValue: Number,
        lightsDashboardOn: Boolean,
        blinkerLeftActive: Boolean,
        blinkerRightActive: Boolean,
        blinkerLeftOn: Boolean,
        blinkerRightOn: Boolean,
        lightsParkingOn: Boolean,
        lightsBeamLowOn: Boolean,
        lightsBeamHighOn: Boolean,
        lightsAuxFrontOn: Boolean,
        lightsAuxRoofOn: Boolean,
        lightsBeaconOn: Boolean,
        lightsBrakeOn: Boolean,
        lightsReverseOn: Boolean,
        placement: {
            x: Number,
            y: Number,
            z: Number,
            heading: Number,
            pitch: Number,
            roll: Number
        },
        acceleration: {
            x: Number,
            y: Number,
            z: Number
        },
        head: {
            x: Number,
            y: Number,
            z: Number
        },
        cabin: {
            x: Number,
            y: Number,
            z: Number
        },
        hook: {
            x: Number,
            y: Number,
            z: Number
        }
    },
    trailer: {
        attached: Boolean,
        id: String,
        name: String,
        mass: Number,
        wear: Number,
        placement: {
            x: Number,
            y: Number,
            z: Number,
            heading: Number,
            pitch: Number,
            roll: Number
        }
    },
    job: {
        income: Number,
        deadlineTime: Date,
        remainingTime: Date,
        sourceCity: String,
        sourceCompany: String,
        destinationCity: String,
        destinationCompany: String
    },
    navigation: {
        estimatedTime: Date,
        estimatedDistance: Number,
        speedLimit: Number
    }
});

// Definindo o modelo Telemetry
const Telemetry = mongoose.model('Telemetry', telemetrySchema);

module.exports = Telemetry;

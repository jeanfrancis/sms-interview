var mongoose = require('mongoose');

var ReporterSchema = new mongoose.Schema({
    name: {
        type: String,
        default: 'Anonymous Reporter'
    }, // Name of the reporter
    phoneNumbers: [String], // Phone numbers associated with reporter
    trusted: { // Whether or not a survey is accepting responses/editable
        type: Boolean,
        default: false
    },

    // Store recent locations for this reporter
    locationHistory: [mongoose.Schema.Types.Mixed]
});

// Create a new record in the reporter's location history for non-duplicate
// locations
ReporterSchema.methods.saveToHistory = function(locationData, callback) {
    var self = this, duplicate = false;

    // Generate a unique place id that can distinguish one location from another
    function generatePlaceId(adminLevels) {
        var id = '';
        for (var i = 0, l = adminLevels.length; i<l; i++) {
            var code = adminLevels[i].code;
            id = id+code;
            if (i+1 !== adminLevels.length) {
                id = id+'.';
            }
        }
        return id;
    }

    // Determine if this is a duplicate of any places in history
    var newOne = generatePlaceId(locationData);
    for (var i = 0, l = self.locationHistory.length; i<l; i++) {
        var current = generatePlaceId(self.locationHistory[i]);
        if (newOne === current) {
            duplicate = true;
            break;
        }
    }

    if (!duplicate) {
        self.locationHistory.push(locationData);
        self.save(callback);
    } else {
        callback(null, self);
    }
};

module.exports = mongoose.model('Reporter', ReporterSchema);

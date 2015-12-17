Participants = new Mongo.Collection('participants');
Achievements = new Mongo.Collection('achievements');

var Schemas = {};

Participants.attachSchema( new SimpleSchema ({
  FirstName: {
    type: String,
    label: "First Name",
    min: 1,
    max: 20
    },
  LastName: {
    type: String,
    label: "Last Name",
    min: 1,
    max: 20
    },
  Points: {
    type: Number,
    label: "Points",
    min: 0,
  },
  Eligible: {
    type: Boolean,
    label: "Met prerequisites for award",
  },
  Achievement_count: {
    type: Number,
    label: "Total number of achievements accumulated",
    defaultValue: 0
  },
  Delivery_count: {
    type: Number,
    label: "Total number of delivery achievements accumulated",
    defaultValue: 0
  },
  Marketing_count: {
    type: Number,
    label: "Total number of marketing achievements accumulated",
    defaultValue: 0
  },
  Partner_count: {
    type: Number,
    label: "Total number of partner achievements accumulated",
    defaultValue: 0
  },
  Practice_count: {
    type: Number,
    label: "Total number of practice achievements accumulated",
    defaultValue: 0
  },
  Sales_count: {
    type: Number,
    label: "Total number of sales achievements accumulated",
    defaultValue: 0
  },
  Achievements: {
    type: [Object],
    optional: true
  },
  "Achievements.$.Description": {
    type:  String,
    label: "Brief Description of achievement",
    optional: true
  },
  "Achievements.$.Date": {
    type:  Date,
    label: "Date of achievement",
    optional: true
  },
  "Achievements.$.Validator": {
    type:  String,
    label:  "Person validating award",
    optional: true
  },
  "Achievements.$.Achievement_Id":  {
    type:  String,
    label:  "MongoDB _id of associated achievement",
    optional: true
  },
  Trophies: {
    type: [Object],
    optional: true
  },
  "Trophies.$.Name": {
    type: String,
    label: "Name of trophy",
    optional: true
  },
  "Trophies.$.Tooltip": {
    type: String,
    label: "Description of trophy for mouse over",
    optional: true
  },
  "Trophies.$.Image": {
    type: String,
    label: "Path to image to display for trophy",
    optional: true
  }
}));

Achievements.attachSchema (new SimpleSchema ({
  Category: {
    type: String,
    label: "Category"
  },
  Description: {
    type: String,
    label: "Description of the achievement"
  },
  Points: {
    type: Number,
    label: "Points awarded for completing this achievement"
  },
  MaxPoints: {
    type: Number,
    label: "Maximum possible points from this achievement, in case of multiple attainment"
  }
}));

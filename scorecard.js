// Added for Tabular tables aldeed:tabular
// Expect to remove prior to production
TabularTables = {};

Meteor.isClient && Template.registerHelper('TabularTables', TabularTables);

TabularTables.Participants = new Tabular.Table({
  name: "Participants",
  collection: Participants,
  order: [[2, "asc"],[1, "asc"]],
  columns: [
    {data: "_id", title: "ID", render: function(val, type, doc) 
      { var link=val; 
        loggedInUser=Meteor.user();  
        if (loggedInUser && Roles.userIsInRole(loggedInUser,['validator'])) {
          link=link+'<br> <a href="/Modify/Participant/'+val+'">Add Achievement</a>';
        } 
        if (loggedInUser && Roles.userIsInRole(loggedInUser,['admin'])) {
          link=link+'<br> <a href="/Autoform/Participant/'+val+'">Modify Participant</a>';
        } 
        return link;
      }
    },
    {data: "Email", title: "Email", render: function(val, type, doc)
      { var link=val;
        if (Meteor.user()) {loggedInEmail=Meteor.user().emails[0].address;
          //console.log("Comparing these");
          //console.log(link);
          //console.log(loggedInEmail);
          if (link === loggedInEmail) {
            var me=Participants.findOne({Email: loggedInEmail});
            //console.log(me._id);
            link='<a href="/Modify/Participant/'+me._id+'">'+link+'</a>';
          }
        }
        return link;
      }
    },
    {data: "FirstName", title: "First Name"},
    {data: "LastName", title: "Last Name"},
    {data: "Points", title: "Points"},
    {data: "Eligible", title: "Eligible"}
  ]
});

TabularTables.Achievements = new Tabular.Table({
  name: "Achievements",
  collection: Achievements,
  order: [[0, "asc"],[1, "asc"]],
  columns: [
    {data: "Category", title: "Category"},
    {data: "Description", title: "Description"},
    {data: "Points", title: "Points"},
    {data: "MaxPoints", title: "Maximum Points for Achievement"}
  ]
});


if (Meteor.isClient) {


  Meteor.subscribe("achievements");
  Meteor.subscribe("participants");
  
  Router.map(function() {
    this.route('Home', { path: '/', template: 'scoreboard', waitOn: function() { Meteor.subscribe('participants')}, data: {participant:  Participants.find({},{sort: {Eligible: -1, Points: -1, Achievement_count: -1, LastName: 1, FirstName: 1}})}});
    this.route('Scoreboard', { path: '/Scoreboard', template: 'scoreboard', waitOn: function() { Meteor.subscribe('participants')}, data: {participant:  Participants.find({},{sort: {Eligible: -1, Points: -1, Achievement_count: -1, LastName: 1, FirstName: 1}})}});
    this.route('Participants', { path: '/Participants', template: 'participants_template', waitOn: function() { Meteor.subscribe('participants')}, data: {participant:  Participants.find()}});
    this.route('Achivements', { path: '/Achievements', template: 'achievements_template', waitOn: function() { Meteor.subscribe('achievements')}, data: {achievement:  Achievements.find()}});
    this.route('Inspect', { 
      path: '/Inspect/:_id', 
      template: 'inspect_template', 
      data: function() {
        return  {participant: Participants.findOne({_id: this.params._id})}
      }
    });
    this.route('ParticipantsAutoform', {
      path: '/Autoform/Participants', 
      template: 'insertParticipantForm',
      onBeforeAction: function() {
        if (!Meteor.user() || !Roles.userIsInRole(Meteor.user(),['admin'])) {
          this.render('denied');
        } else {
          this.next();
        }
      }
    });
    this.route('AchievementsAutoform', {
      path: '/Autoform/Achievements', 
      template: 'insertAchievementForm',
      onBeforeAction: function() {
        if (!Meteor.user() || !Roles.userIsInRole(Meteor.user(),['admin'])) {
          this.render('denied');
        } else {
          this.next();
        }
      }
    });
    this.route('ParticipantAutoform', {
      path: '/Autoform/Participant/:_id', 
      template: 'participantAutoForm',
      data: function() { 
        return Participants.findOne({_id: this.params._id})
      }, 
      onBeforeAction: function() {
        if (!Meteor.user() || !Roles.userIsInRole(Meteor.user(),['admin'])) {
          this.render('denied');
        } else {
          this.next();
        }
      }
    });
    this.route('AchievementAutoform', {
      path: '/Autoform/Achievement/:_id', 
      template: 'achievementAutoForm',
      data: function() { 
        return Achievements.findOne({_id: this.params._id})
      },
      onBeforeAction: function() {
        if (!Meteor.user() || !Roles.userIsInRole(Meteor.user(),['admin'])) {
          this.render('denied');
        } else {
          this.next();
        }
      }
    });
    this.route('ModifyParticipant', { 
      path: '/Modify/Participant/:_id', 
      waitOn: function() {
        return Meteor.subscribe("achievements");
      },
      template: 'modify_participanttemplate', 
      data: function() {
        return {
          participant: Participants.findOne({_id: this.params._id}),
          achievements: Achievements.find()
        }
      },
      onBeforeAction: function() {

        if (Meteor.user()) {
          loggedInEmail=Meteor.user().emails[0].address;
          var me=Participants.findOne({Email: loggedInEmail});
          //console.log(me._id);
          //console.log(this.params_id);
          //console.log(_id);
          //console.log(this.params._id);
  
          //if (me._id === this.params._id) {
            //console.log("Should work");
          //} else {
            //console.log("Something subtle");
          //}
        }
   
        if ((!Meteor.user()) || (!Roles.userIsInRole(Meteor.user(),['validator']) && !(me._id === this.params._id))) {
          this.render('denied');
        } else {
          this.next();
        }
      }
    });
    this.route('ModifyAchievement', { 
      path: '/Modify/Achievement/:_id', 
      template: 'modify_achievementtemplate', 
      data: function() {
        return {
          participant: Participants.findOne({_id: this.params._id}),
          achievements: Achievements.find()
        }
      },
      onBeforeAction: function() {
        if (!Meteor.user() || !Roles.userIsInRole(Meteor.user(),['admin'])) {
          this.render('denied');
        } else {
          this.next();
        }
      }
    });
  });

 
  Template.modify_participanttemplate.rendered=function() {
    $('#my-datepicker').datepicker();
    $('#achievement_table').DataTable({"order": [[2, "asc"],[1, "asc"]]});
  }
  
  Template.modify_participanttemplate.onRendered(function() {
    $('.achievement_form').validate({
      rules: {
        achievement: {required: true}
      }
    });
  });

  Template.modify_participanttemplate.events({
    "submit .modify-form": function (event) {
      event.preventDefault();
      
      var description=event.target.description.value;
      var date=event.target.date.value;
      var achievement_id=event.target.achievement.value;
      var participant_id=event.target.participantId.value;

      //console.log(event);
      //console.log("Output:" , description, date, achievement_id, participant_id);
      
      var participant=Participants.findOne({_id : participant_id});
      //console.log(participant);
      var achievement=Achievements.findOne({_id : achievement_id});
      //console.log(achievement);
      var tmp=Achievements.findOne({_id: achievement_id});
      var achievement_category=tmp.Category;
      var category_field=achievement_category+"_count";
      //console.log("--- achievement category, category_field ---");
      //console.log(achievement_category, category_field);
      //console.log("---------------------------------------------");

      if (typeof participant.Achievements === 'undefined') {
         //console.log('First Achievement!');
         Participants.update({_id : participant_id},{$push :{Achievements: {Description : description, 'Date' : date, Achievement_Id: achievement_id}}});
         Participants.update({_id: participant_id}, {$set: {Points: achievement.Points}});
      } else {
         //console.log("Existing Achievements!");
         // Walk through the achievements collection building a hash of existing categories
         var achievement_list = Achievements.find().fetch();
         var categories = [];
         //console.log(achievement_list);
         for (var i=0; i < achievement_list.length; i++) {
           //console.log(achievement_list[i]);
           categories[achievement_list[i].Category]=0;
         }
         //console.log(categories);
         // The following loop does two things
         //   1) It totals up the points already accumulated for the new achievement - if they're less than the maximum points you
         //      can earn then it adds the points (and if they're greater then they're not added)
         //   2) It sets the value in the categories associative array to 1.  Once we're done with this loop we'll walk the 
         //      hash and set eligible to 1 if all entries are set to 1
         // Have to insert this before walking the Achievements array, or it doesn't get picked up
         Participants.update({_id : participant_id},{$push :{Achievements: {Description : description, 'Date' : date, Achievement_Id: achievement_id}}});
         // And let's update our variable with the new data
         var participant=Participants.findOne({_id : participant_id});
         var maxPoints = achievement.MaxPoints;
         //console.log(maxPoints);
         var achievementPoints=0;
         for (var i=0; i < participant.Achievements.length; i++) {
           //console.log(participant.Achievements[i].Achievement_Id);
           var category=Achievements.findOne({_id: participant.Achievements[i].Achievement_Id});
           //console.log(category.Category);
           categories[category.Category]=1;
           if (achievement_id === participant.Achievements[i].Achievement_Id) {
             //console.log("Found matching achievement ID!");
             achievementPoints = achievementPoints + achievement.Points;
           }
         }
         // Since we've already updated the record we have also counted the points for this achievement in our calculation
         console.log(maxPoints);
         if (typeof maxPoints !== "undefined") {
           console.log("---- achievementPoints maxPoints achievement.Points newPoints ----");
           console.log(achievementPoints, maxPoints, achievement.Points, newPoints);
           console.log("---------------------------------------");
           if (achievementPoints <= maxPoints) {
             console.log("Comparison succeeded");
             var newPoints = participant.Points + achievement.Points;
             Participants.update({_id: participant_id}, {$set: {Points: newPoints}});
           } else {
             console.log("Comparison failed");
           }
         } else {
             var newPoints = participant.Points + achievement.Points;
             Participants.update({_id: participant_id}, {$set: {Points: newPoints}});
         }
         // Walk the categories associative array looking for 0s.  If they're aren't any, set Eligible to True
         var categoryCount=0;
         var eligibleCount=0;
         for (var key in categories) {
           if (categories.hasOwnProperty(key)) {
             categoryCount=categoryCount+1;
             eligibleCount=eligibleCount+categories[key];
           }
         }
         console.log("categoryCount: ",categoryCount," eligibleCount:  ",eligibleCount);
         if (categoryCount === eligibleCount) {
           Participants.update({_id : participant_id},{$set: {Eligible: true}});
         }

         //console.log(participant.Achievements);
      }
      // Update count of total achievements as well as per-category achievements (used for trophies)
      Participants.update({_id: participant_id},{$inc: {Achievement_count: 1}});
      var inc = {};
      inc[category_field]=1;
      //console.log(inc);
      modify={};
      modify["$inc"]=inc; 
      //console.log(modify);
      Participants.update({_id: participant_id},modify);
      // Assign/deassign trophies
      Meteor.call("reset_trophies");
      var medalists=Participants.find({Eligible: true},{sort: {Points: -1, Achievement_count: -1},limit: 3}).fetch();
      //console.log("------  Medalists ------------");
      //console.log(medalists)
      //console.log("------------------------------");
      switch (medalists.length-1) {
        case(2):
          Participants.update({_id: medalists[2]._id},{$addToSet: {Trophies: {Name: "ThirdPlace", Tooltip: "Third Place", Image: "/images/Circled_3-24.png"}}});
          Participants.update({_id: medalists[1]._id},{$addToSet: {Trophies: {Name: "SecondPlace", Tooltip: "Second Place", Image: "/images/Circled_2-24.png"}}});
          Participants.update({_id: medalists[0]._id},{$addToSet: {Trophies: {Name: "FirstPlace", Tooltip: "First Place", Image: "/images/Circled_1-24.png"}}});
          break;
        case(1):
          Participants.update({_id: medalists[1]._id},{$addToSet: {Trophies: {Name: "SecondPlace", Tooltip: "Second Place", Image: "/images/Circled_2-24.png"}}});
          Participants.update({_id: medalists[0]._id},{$addToSet: {Trophies: {Name: "FirstPlace", Tooltip: "First Place", Image: "/images/Circled_1-24.png"}}});
        case(0):
          Participants.update({_id: medalists[0]._id},{$addToSet: {Trophies: {Name: "FirstPlace", Tooltip: "First Place", Image: "/images/Circled_1-24.png"}}});
          break;
        default:
          break;
      };
      //Trophy for most achievements
      var mostAchievements=Participants.findOne({Achievement_count: {$gt: 0}},{sort: {Achievement_count: -1,Points: -1}, limit: 1});
      //console.log(mostAchievements, mostAchievements._id);
      if (typeof mostAchievements !== "undefined") {
        Participants.update({_id: mostAchievements._id},{$addToSet: {Trophies: {Name : "MostAchievements", Tooltip: "Most completed achievements", Image: "/images/Championship_Belt-24.png"}}});
      }
      //Trophy for most delivery achievements
      var mostDelivery=Participants.findOne({Delivery_count: {$gt: 0}},{sort: {Delivery_count: -1,Points: -1}, limit: 1});
      if (typeof mostDelivery !== "undefined") {
        Participants.update({_id: mostDelivery._id},{$addToSet: {Trophies: {Name : "MostDelivery", Tooltip: "Most completed achievements in the delivery category", Image: "/images/Truck-24.png"}}});
      }
      //Trophy for most marketing achievements
      var mostMarketing=Participants.findOne({Marketing_count: {$gt: 0}},{sort: {Marketing_count: -1,Points: -1}, limit: 1});
      if (typeof mostMarketing !== "undefined") {
        Participants.update({_id: mostMarketing._id},{$addToSet: {Trophies: {Name : "MostMarketing", Tooltip: "Most completed achievements in the marketing category", Image: "/images/Advertising-24.png"}}});
      } 
      //Trophy for most Partner achievements
      var mostPartner=Participants.findOne({Partner_count: {$gt: 0}},{sort: {Partner_count: -1, Points: -1}, limit: 1});
      if (typeof mostPartner !== "undefined") {
        Participants.update({_id: mostPartner._id},{$addToSet: {Trophies: {Name : "MostPartner", Tooltip: "Most completed achievements in the partner category", Image: "/images/Helping_Hand-24.png"}}});
      }
      //Trophy for most Practice achievements
      var mostPractice=Participants.findOne({Practice_count: {$gt: 0}},{sort: {Practice_count: -1, Points: -1}, limit: 1});
      if (typeof mostPractice !== "undefined") {
        Participants.update({_id: mostPractice._id},{$addToSet: {Trophies: {Name : "MostPractice", Tooltip: "Most completed achievements in the practice category", Image: "/images/Piano-24.png"}}});
      }
      //Trophy for most Sales achievements
      var mostSales=Participants.findOne({Sales_count: {$gt: 0}},{sort: {Sales_count: -1, Points: -1}, limit: 1});
      if (typeof mostSales !== "undefined") {
        Participants.update({_id: mostSales._id},{$addToSet: {Trophies: {Name : "MostSales", Tooltip: "Most completed achievements in the sales category", Image: "/images/Sales_Performance-24.png"}}});
      }
      //Trophy for most Technical achievements
      var mostTechnical=Participants.findOne({Technical_count: {$gt: 0}},{sort: {Technical_count: -1, Points: -1}, limit: 1});
      if (typeof mostTechnical !== "undefined") {
        Participants.update({_id: mostTechnical._id},{$addToSet: {Trophies: {Name : "MostTechnical", Tooltip: "Most completed achievements in the technical category", Image: "/images/Globe_Bulb-24.png"}}});
      }

      // Send email notification
      Meteor.call("emailOnAchievementSubmit",participant_id);

      // Redirect back to the scoreboard after submit
      Router.go('/');     
    }
  });

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    //Roles.addUsersToRoles("eYep3zXbpGBu4xhqv", ['admin', 'validator']);
    //Roles.addUsersToRoles("rxemrD36Y6ANRHjQS", ['validator']);
    //Roles.addUsersToRoles("gvmiAwtdsa8JqrehW", ['validator']);
    //Roles.addUsersToRoles("78KB3ZaHJ3aF8uNGt", ['validator']);
    //Roles.addUsersToRoles("yXfdWvnx7sgc9QG5G", ['validator']);
    //Roles.addUsersToRoles("kncQJHQAMwhZpG4mR", ['validator']);
    //Roles.addUsersToRoles("6bgJzPKStDpLEQMyc", ['validator']);
    //Roles.addUsersToRoles("2D7iTy4wefohnAjWY", ['validator']);
    // code to run on server at startup
    process.env.MAIL_URL = 'smtp://localhost:25/';
  });

  Meteor.methods({
    reset_trophies: function() {
      Participants.update({"Trophies.Name": "FirstPlace"}, {$pull: {Trophies: {"Name" : "FirstPlace"}}})
      Participants.update({"Trophies.Name": "SecondPlace"}, {$pull: {Trophies: {"Name" : "SecondPlace"}}})
      Participants.update({"Trophies.Name": "ThirdPlace"}, {$pull: {Trophies: {"Name" : "ThirdPlace"}}})
      Participants.update({"Trophies.Name": "MostAchievements"}, {$pull: {Trophies: {"Name" : "MostAchievements"}}})
      Participants.update({"Trophies.Name": "MostDelivery"}, {$pull: {Trophies: {"Name" : "MostDelivery"}}})
      Participants.update({"Trophies.Name": "MostMarketing"}, {$pull: {Trophies: {"Name" : "MostMarketing"}}})
      Participants.update({"Trophies.Name": "MostPartner"}, {$pull: {Trophies: {"Name" : "MostPartner"}}})
      Participants.update({"Trophies.Name": "MostPractice"}, {$pull: {Trophies: {"Name" : "MostPractice"}}})
      Participants.update({"Trophies.Name": "MostSales"}, {$pull: {Trophies: {"Name" : "MostSales"}}})
      Participants.update({"Trophies.Name": "MostTechnical"}, {$pull: {Trophies: {"Name" : "MostTechnical"}}})
    },
    emailOnAchievementSubmit:  function(participantId) {
      var submitter=Participants.findOne({_id: participantId});

      var to=submitter.ApproverEmail;
      var cc="chad.hodges@lumenate.com";
      var from="chad.hodges@lumenate.com";
      var subject="New scorecard achievement submission from "+submitter.Email;
      var text=submitter.Email+" has submitted a new achievement.  You may approve this achievement at http://scorecard.lumenate.biz/Autoform/Participant/"+submitter._id;
 
      Email.send({
        to: to,
        cc: cc,
        from: from,
        subject: subject,
        text: text
      });
    }
  });
      

  Meteor.publish("participants", function() {
    return Participants.find({});
  });

  Meteor.publish("achievements", function() {
    return Achievements.find({});
  });

  Achievements.allow({
    update:  function (userId, doc) {
      return Roles.userIsInRole(userId,['admin'])
    },
  
    insert:  function (userId, doc) {
      return Roles.userIsInRole(userId,['admin'])
    },
  
    remove:  function (userId, doc) {
      return Roles.userIsInRole(userId,['admin'])
    },
  });
  
  Participants.allow({
    update:  function (userId, doc) {
      if (Meteor.user()) {
        loggedInEmail=Meteor.user().emails[0].address;
        //console.log(loggedInEmail);
        //console.log(doc.Email);
      }
      return ((Roles.userIsInRole(userId,['validator'])) || (doc.Email === loggedInEmail));
    },
  
    insert:  function (userId, doc) {
      return Roles.userIsInRole(userId,['admin'])
    },
  
    remove:  function (userId, doc) {
      return Roles.userIsInRole(userId,['admin'])
    },
  });
}

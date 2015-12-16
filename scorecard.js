// Added for Tabular tables aldeed:tabular
// Expect to remove prior to production
TabularTables = {};

Meteor.isClient && Template.registerHelper('TabularTables', TabularTables);

TabularTables.Participants = new Tabular.Table({
  name: "Participants",
  collection: Participants,
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
    {data: "FirstName", title: "First Name"},
    {data: "LastName", title: "Last Name"},
    {data: "Points", title: "Points"},
    {data: "Eligible", title: "Eligible"}
  ]
});

TabularTables.Achievements = new Tabular.Table({
  name: "Achievements",
  collection: Achievements,
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
    this.route('Home', { path: '/', template: 'participants_template', data: {participant:  Participants.find()}});
    this.route('Participants', { path: '/Participants', template: 'participants_template', data: {participant:  Participants.find()}});
    this.route('Achivements', { path: '/Achievements', template: 'achievements_template', data: {achievement:  Achievements.find()}});
    this.route('Inspect', { 
      path: '/Inspect/:_id', 
      template: 'inspect_template', 
      data: function() {
        return  Participants.findOne({_id: this.params._id})
      },
      onBeforeAction: function() {
        if (!Meteor.user() || !Roles.userIsInRole(Meteor.user(),['admin'])) {
          this.render('denied');
        } else {
          this.next();
        }
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
      template: 'modify_participanttemplate', 
      data: function() {
        return {
          participant: Participants.findOne({_id: this.params._id}),
          achievements: Achievements.find()
        }
      },
      onBeforeAction: function() {
        if (!Meteor.user() || !Roles.userIsInRole(Meteor.user(),['validator'])) {
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
    $('#achievement_table').DataTable();
  }

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
      //var tmp=Achievements.findOne({_id: achievement_id});
      //var achievement_category=tmp.Category;
      //var category_field=achievement_category+"count";
      //console.log(achievement_category, category_field);

      if (typeof participant.Achievements === 'undefined') {
         console.log('First Achievement!');
         Participants.update({_id : participant_id},{$push :{Achievements: {Description : description, Validator: Meteor.userId(), 'Date' : date, Achievement_Id: achievement_id}}});
         Participants.update({_id: participant_id}, {$set: {Points: achievement.Points}});
      } else {
         console.log("Existing Achievements!");
         // Walk through the achievements collection building a hash of existing categories
         var achievements = Achievements.find().fetch();
         var categories = [];
         //console.log(achievements);
         for (var i=0; i < achievements.length; i++) {
           //console.log(achievements[i]);
           categories[achievements[i].Category]=0;
         }
         //console.log(categories);
         // The following loop does two things
         //   1) It totals up the points already accumulated for the new achievement - if they're less than the maximum points you
         //      can earn then it adds the points (and if they're greater then they're not added)
         //   2) It sets the value in the categories associative array to 1.  Once we're done with this loop we'll walk the 
         //      hash and set eligible to 1 if all entries are set to 1
         var maxPoints = achievement.MaxPoints;
         var achievementPoints=0
         for (var i=0; i < participant.Achievements.length; i++) {
           console.log(participant.Achievements[i].Achievement_Id);
           var category=Achievements.findOne({_id: participant.Achievements[i].Achievement_Id});
           console.log(category.Category);
           categories[category.Category]=1;
           if (achievement_id === participant.Achievements[i].Achievement_Id) {
             console.log("Found matching achievement ID!");
             achievementPoints = achievementPoints + achievement.Points;
           }
         }
         if (achievementPoints < maxPoints) {
           var newPoints = participant.Points + achievement.Points;
           Participants.update({_id: participant_id}, {$set: {Points: newPoints}});
         }
         Participants.update({_id : participant_id},{$push :{Achievements: {Description : description, Validator: Meteor.userId(), 'Date' : date, Achievement_Id: achievement_id}}});
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
      //Participants.update({_id: participant_id},{$inc: {Achievement_count: 1}});
      //Participants.update({_id: participant_id},{$inc: {category_field: 1}});
       
      // Redirect back to the scoreboard after submit
      Router.go('/');     
    }
  });

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    //Roles.addUsersToRoles("YiNzAx6m9nyxZdLGm", ['admin', 'validator'])
    //Roles.addUsersToRoles("yP8W2h2kMrKdb9KaD", ['validator'])
    // code to run on server at startup
  });

  Meteor.publish("participants", function() {
    return Participants.find({});
  });

  Meteor.publish("achievements", function() {
    return Participants.find({});
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
      return Roles.userIsInRole(userId,['validator']);
    },
  
    insert:  function (userId, doc) {
      return Roles.userIsInRole(userId,['admin'])
    },
  
    remove:  function (userId, doc) {
      return Roles.userIsInRole(userId,['admin'])
    },
  });
}

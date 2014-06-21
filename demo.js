var origin = require('./client');

// Connect to redis resque
origin.connect('redis://localhost:6379/');

// Update a channel, which will result in an update to all subscribers if the value is different
origin.set('wcsg.score.match_26', {
  teamA: 1,
  teamB: 4
});

console.log('Sent');
var origin = require('./client');

// Connect to redis resque
origin.connect('redis://localhost:6379/4');

// Update a channel, which will result in an update to all subscribers if the value is different
origin.set('wcsg.score.crovsbra', {
  teamA: 4,
  teamB: 1
});

console.log('Sent');
'use strict';

const EventEmitter = require('events');
const subreddits = new EventEmitter();
const snoowrap = require('snoowrap');
const snoostorm = require('snoostorm-es6');
const fs = require('fs');
 
const options = JSON.parse(fs.readFileSync("./secrets.JSON", 'utf-8'));

const config = JSON.parse(fs.readFileSync("./config.JSON", 'utf-8'));

const r = new snoowrap(options);
const s = new snoostorm(r);

config.whitelistedSubreddits.forEach(subredditName => {
  console.log("Creating scanner for: " + subredditName)
  const submissions = s.Stream("submission", {
    subreddit: subredditName,
    pollTime: 25000
  });
   
  submissions.on("item", item => {
    subreddits.emit("submission", subredditName, item)
  });
})


subreddits.on('submission', (name, item) => {
  if(item.crosspost_parent_list != undefined) {
    if(config.blackistedSubreddits.indexOf(item.crosspost_parent_list[0].subreddit_name_prefixed) != -1) {
      
    }
  } else {
    console.log("POST NOT A CROSSPOST.")
  }
})
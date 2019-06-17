'use strict';

const EventEmitter = require('events');
const subreddits = new EventEmitter();
const snoowrap = require('snoowrap');
const snoostorm = require('snoostorm-es6');
const chalk = require('chalk');
const fs = require('fs');
 
const options = JSON.parse(fs.readFileSync("./secrets.JSON", 'utf-8'));

const config = JSON.parse(fs.readFileSync("./config.JSON", 'utf-8'));

const r = new snoowrap(options);
const s = new snoostorm(r);

config.whitelistedSubreddits.forEach(subredditName => {
  console.log("Creating scanner for: " + subredditName)
  const submissions = s.Stream("submission", {
    subreddit: subredditName,
    pollTime: 30000
  });
   
  submissions.on("item", item => {
    subreddits.emit("submission", subredditName, item)
  });
  
  const comments = s.Stream("comment", {
    subreddit: subredditName,
    results: 100,
    pollTime: 30000
  });
   
  comments.on("item", item => {
    subreddits.emit("comment", subredditName, item)
  });
})


subreddits.on('submission', (name, item) => {
  if(item.crosspost_parent_list != undefined) {
    if(config.blackistedSubreddits.indexOf(item.crosspost_parent_list[0].subreddit_name_prefixed.toLowerCase()) != -1) {
      console.log(chalk.red(`[P] [X] [r/${name}]`.padEnd(35, " ")) + " : " + chalk.green(("u/" + item.author.name).padEnd(25, " ")) + " : " + chalk.blue(item.title))
      item.reply(fs.readFileSync("./reply.md", 'utf-8').split("[subreddit]").join(item.crosspost_parent_list[0].subreddit_name_prefixed))
    } else {
      console.log(chalk.red(`[P] [-] [r/${name}]`.padEnd(35, " ")) + " : " + chalk.green(("u/" + item.author.name).padEnd(25, " ")) + " : " + chalk.blue(item.title))
    }
  } else {
    console.log(chalk.red(`[P] [ ] [r/${name}]`.padEnd(35, " ")) + " : " + chalk.green(("u/" + item.author.name).padEnd(25, " ")) + " : " + chalk.blue(item.title))
  }
})

subreddits.on('comment', (name, item) => {
  if(config.blacklistedUsers.indexOf(item.author.name) == -1) {
    var containsBlacklisted = false;
    var backlistedsub = "[If you see this, an error occured. oof]"
    config.blackistedSubreddits.forEach(subname => {
      if(item.body.toLowerCase().split(subname).length > 1) {
        containsBlacklisted = true;
        backlistedsub = subname
      }
    })
    if(containsBlacklisted) {
      console.log(chalk.red(`[C] [X] [r/${name}]`.padEnd(35, " ")) + " : " + chalk.green(("u/" + item.author.name).padEnd(25, " ")))
      item.reply(fs.readFileSync("./replyComment.md", 'utf-8').split("[subreddit]").join(backlistedsub))
    } else {
      console.log(chalk.red(`[C] [ ] [r/${name}]`.padEnd(35, " ")) + " : " + chalk.green(("u/" + item.author.name).padEnd(25, " ")))
    }
  } else {
    console.log(chalk.red(`[C] [B] [r/${name}]`.padEnd(35, " ")) + " : " + chalk.green(("u/" + item.author.name).padEnd(25, " ")))
  }
})
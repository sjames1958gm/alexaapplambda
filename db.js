const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const dotenv = require('dotenv');

module.exports.getUserRunningData = function(user, cb) {
  console.log(`getUserRunningData: ${user}`);
  let params = {
    Bucket: process.env.BUCKET_ROOT + "/local/userdata_nzbasicmgr/" + user,
    Key: "_running.config"
  };

  s3.getObject(params, function(err, data) {
    if (err) {
      console.log(`Error from S3: ${err}`);
      cb(`Unable to retrieve user running data: ${params.Bucket}`);
    }
    else {
      var runningData = data.Body.toString('utf8');
      var runningDataConfig = dotenv.parse(runningData);
      console.log(runningDataConfig);
      cb(null, runningDataConfig);
    }
  });
};

module.exports.getVoiceAppData = function(appid, cb) {
  let params = {
        Bucket: process.env.VOICE_APP_BUCKET,
        Key: appid
    };
    
    s3.getObject(params, function(err, data) {
        
        if (err) {
            console.log(`Error from S3: ${err}`);
            cb(`Unable to retrieve voice app data data: ${appid}`);
        }

        var appData = JSON.parse(data.Body.toString('utf8'));
        console.log(appData);
  
        cb(null, appData);  

    });
};
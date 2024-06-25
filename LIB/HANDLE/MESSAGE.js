var { get } = require("axios");

module.exports = function(api, event) {
  var { config, replies } = global;
  var url = config.CASSURL;
  var xurl = `${url}/postWReply`;
  var body = String(event.body);
  var sender = Number(event.senderID);

  if (!body.startsWith("!")) return;

  get(xurl, {
    params: event
  }).then(
    function(res) {
      var {
        result: { body, messageID },
        status: estatus,
        result
      } = res.data;

      if (estatus === "fail") return;

      var i = new Promise(function(resolve, reject) {
        api.sendMessage(
          body,
          event.threadID,
          function(err, info) {
            if (err) {
              return reject(err);
            }
            resolve(info);
          },
          event.messageID
        );
      });

      i.then(
        function(info) {
          replies.set(info.messageID, {
            result,
            author: sender
          });
        },
        function(err) {
          console.error(err);
        }
      );
    },
    function(err) {
      console.error(err);
    }
  );
};

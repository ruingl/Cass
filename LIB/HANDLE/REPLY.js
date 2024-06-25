var { get } = require("axios");

module.exports = function(api, event) {
  if (!event.type === "message_reply") return;
  var { config, replies } = global;
  var url = config.CASSURL;
  var xurl = url + "/postWReply";
  var sender = Number(event.senderID);
  var messageID = String(event.messageID);
  var replyID = String(
    event.messageReply ? event.messageReply.messageID : null
  );
  var body = String(event.body);

  if (!body.startsWith("!")) return;
  if (!global.replies.has(replyID) || !replyID) return;

  var { author, result: messageReply } = replies.get(replyID);

  if (author !== sender) return;

  get(xurl, {
    params: Object.assign({}, event, { messageReply: messageReply })
  }).then(
    function(res) {
      var {
        result: { body },
        status: estatus,
        result
      } = res.data;

      if (estatus === "fail") return;

      //var i = api.sendMessage(body, event.threadID, event.messageID);
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

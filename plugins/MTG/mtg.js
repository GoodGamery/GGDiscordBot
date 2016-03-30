var request = require("request");

var searchResource = 'http://gatherer.wizards.com/Handlers/InlineCardSearch.ashx?nameFragment=';
var imageResource = 'http://gatherer.wizards.com/Handlers/Image.ashx?type=card&multiverseid='

exports.commands = [
    'mtg' // Displays MTG Card image
];

exports.mtg = {
    usage: "<search query>",
    description: "Displays MTG cards",
    process: function(bot, msg, args) {
        var url = searchResource + (args.replace(/\s/g, '+'));
        request(url,  function(err, res, body) {
            var data, error;
            try {
                data = JSON.parse(body);
            } catch (error) {
                console.log(error)
                return;
            }
            if(!data){
                console.log(data);
                bot.sendMessage(msg.channel, "Error:\n" + JSON.stringify(data));
                return;
            }
            else if (!data.Results || data.Results.length == 0){
                console.log(data);
                bot.sendMessage(msg.channel, "No result for '" + args + "'");
                return;
            }

            // Get the card ID out of the results
            var cardIndex = 0;
            for (var i = 0; i < data.Results.length; ++i) {
                if (args.toLowerCase() === data.Results[i].Name.toLowerCase()) {
                    // Perfect match!
                    cardIndex = i;
                    break;
                }
            }
            var cardId = data.Results[cardIndex].ID;
            var cardSnippet = data.Results[cardIndex].Snippet;
            var cardName = data.Results[cardIndex].Name;
            var imageUrl = imageResource + cardId;
            bot.sendMessage(msg.channel, cardName + '\n' + cardSnippet + '\n' + imageUrl);
        });
    }
};
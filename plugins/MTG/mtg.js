var request = require("request");
var http = require('http');
var fs = require('fs');

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
                console.error(error);
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

            // Results
            var cardId = data.Results[cardIndex].ID;
            var cardSnippet = data.Results[cardIndex].Snippet;
            var cardName = data.Results[cardIndex].Name;
            var imageUrl = imageResource + cardId;

            // Send message with card snippet
            bot.sendMessage(msg.channel, '**' + cardName + '**\n```' + cardSnippet + '```');

            var filePath = './files/tmp/' + cardId + '.jpg';

            // Function to send file message
            function sendFile() {
                bot.sendFile(msg.channel, filePath, cardName + '.jpg');
            }

            // Download the file from imageUrl
            function downloadFile() {
                var file;
                try {
                    file = fs.createWriteStream(filePath);
                    var imgRequest = http.get(imageUrl, function(response) {
                        response.pipe(file);
                        file.on('finish', function() {
                            file.close(sendFile);  // close() is async, call sendFIle after close completes.
                        });
                    }).on('error', function(err) { // Handle errors
                        fs.unlink(dest); // Delete the file async. (But we don't check the result)
                        console.error(err.message);
                    });
                } catch (error) {
                    // Problem downloading/saving the file
                    console.error(error);
                    if (file && file.close) {
                        try {
                            file.close();
                        } catch (error) {
                            console.error(error);
                        }
                    }
                    return;
                }
            }

            // Does the file already exist?
            fs.stat(filePath, function(err, stat) {
                if(err === null && stat.size > 0) {
                    sendFile();
                } else if(err && err.code === 'ENOENT' || stat.size === 0) {
                    // File didn't exist. Download it
                    console.log('Downloading file ' + filePath);
                    downloadFile();
                } else {
                    console.error('Some other error occured when checking when ' + filePath + ' exists: ', err.code);
                    downloadFile();
                }
            });
                
        });
    }
};
/**
 * Created by aumanet on 23.07.2017.
 */
var builder = require('botbuilder');

class BookView {
    constructor(session, book) {
        this.session = session;
        this.book = book;
        this.message = this._buildMessage();
    }

    _buildMessage() {
        var buttonText = "Get in queue";
        if(this.book.reader === "")
            buttonText = "Barrow book";

        return {
            'contentType': 'application/vnd.microsoft.card.adaptive',
            'content': {
                "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                "type": "AdaptiveCard",
                "version": "0.5",
                "body": [
                    {
                        "type": "TextBlock",
                        "wrap": "true",
                        "text": this.book._title,
                        "weight": "bolder",
                        "size": "large"
                    },
                    {
                        "type": "ColumnSet",
                        "columns": [
                            {
                                "type": "Column",
                                "size": 60,
                                "items": [
                                    {
                                        "type": "FactSet",
                                        "facts": [
                                            {
                                                "title": "Author:",
                                                "value": this.book._author
                                            },
                                            {
                                                "title": "Year:",
                                                "value": this.book._year
                                            },
                                            {
                                                "title": "Publisher:",
                                                "value": this.book._publisher
                                            },
                                            {
                                                "title": "People in queue:",
                                                "value": this.book._queue
                                            },
                                            {
                                                "title": "Now reading:",
                                                "value": this.book._reader
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                "type": "Column",
                                "size": 40,
                                "items": [
                                    {
                                        "type": "Image",
                                        "size": "stretch",
                                        "url": this.book._urlImg
                                    }
                                ],
                                "selectAction": {
                                    "type": "Action.OpenUrl",
                                    "data": this.book._urlInfo
                                }
                            }
                        ]
                    }
                ],
                "actions": [
                    {
                        "type": "Action.OpenUrl",
                        "title": buttonText,
                        "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    }
                ]
            }
        };
    }

    get msg() {
        return this.message;
    }
}

module.exports = BookView;
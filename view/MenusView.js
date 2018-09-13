/**
 * Created by dcebotarenco on 9/15/2016.
 */
var builder = require('botbuilder');

class MenusView {
    constructor(session, menuList) {
        this.session = session;
        this.menuList = menuList;
        this.message = this._buildDay();
    }

    _buildDay() {
        return new builder.Message(this.session)
            .textFormat(builder.TextFormat.markdown)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments(this._getMenuCards());
    }

    _getMenuCards() {
        return this.menuList.map(function (menu) {
            return menu.card
        });
    }

    get msg() {
        return this.message;
    }

    get choises() {
        let choises = [];
        this.menuList.forEach(function (menu) {
            menu.btns.forEach(function (button) {
                choises.push(button.data.value);
            });
        });
        return choises.join('|');
    }

    get menus() {
        return this.menuList;
    }
}

module.exports = MenusView;
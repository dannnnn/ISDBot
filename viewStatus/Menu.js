/**
 * Created by charea on 02.11.2016.
 */
var builder = require('botbuilder');
var SheetUtil = require('../util/SheetUtil');

class Menu {
    constructor(session, title, type, mealList) {
        this.menuType = type;
        this.title = title;
        this.mealList = mealList;
        this.session = session;
        this.mealCard = this._buildMealCard();
    }

    _buildMealCard() {
        return new builder.HeroCard(this.session).title(this.title).text(this._formatMealsName())
    }

    _formatMealsName() {
        let lis = [];
        this.mealList.forEach(function (meal) {
            let li;
            let newMeal = SheetUtil.allTrim(meal);
            if (lis.length == 0) {
                li = "*" + newMeal;
            } else {
                li = "\n*" + newMeal;
            }
            lis.push(li);
        });
        return lis.join('');
    }

    get card() {
        return this.mealCard;
    }


    get type() {
        return this.menuType;
    }
}
module.exports = Menu;
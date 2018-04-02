/**
 * Created by charea on 26.10.2016.
 */
/**
 * Created by charea on 17.10.2016.
 */
var MenusFactory = require('../viewStatus/MenusFactory');
var builder = require('botbuilder');
var Logger = require('../logger/logger');
var SheetUtil = require('../util/SheetUtil');
var google = require('../google/googleConnection');
var ModelBuilder = require('../modelBuilder/ModelBuilder');
var moment = require('moment');
let MenuFactory = require('../orderFood/factory/MenuFactory');
let Day = require('../orderFood/lunchList/Day');
let Choice = require('../orderFood/employeesChoises/Choice');
let Sheet = require('../orderFood/lunchList/Sheet');

class UserChoisesStatusDialog {
    constructor() {
        Logger.logger().info("Creating UserChoisesStatusDialog Dialog");
        this.dialogs = [
            UserChoisesStatusDialog.fetchEmployeeChoices,
            UserChoisesStatusDialog.fetchChoicesPerUserPerDay,
            UserChoisesStatusDialog.fetchMenuForDay
        ];
    }

    static fetchEmployeeChoices(session, results, next) {
        var month = new Date().toLocaleString("en-us", {month: "long"});
        var year = new Date().getFullYear();
        var choiceSheetName = month + " " + year;
        Logger.logger().info("UserChoisesStatusDialog: Gather all data from [%s]", choiceSheetName);
        google.fetchGoogleSheet(process.env.G_SPREADSHEET_ID, choiceSheetName, 'ROWS', (response) => UserChoisesStatusDialog.onChoicesReceived(session, results, next, response.values));
    }

    static onChoicesReceived(session, results, next, rows) {
        Logger.logger().info("UserChoisesStatusDialog: Choises Received");
        let choicesSheet = ModelBuilder.createChoiceModelSheet(rows, session.userData.employeesList);
        session.dialogData.choicesSheet = choicesSheet;
        next();
    }

    static fetchChoicesPerUserPerDay(session, results, next) {
        Logger.logger().info("UserChoisesStatusDialog.fetchChoicesPerUserPerDay");
        let choicesSheet = session.dialogData.choicesSheet;
        let actionDate = moment(session.userData.orderActionDate);
        let user = choicesSheet.getUsersById(session.message.user.id);
        let availableUserChoicesPerDay;
        Logger.logger().info('Show food status for id[%s]', session.message.user.id);
        if (user.length > 0) {
            Logger.logger().info('User found');
            let choicesObj = user[0].getChoicesByDate(actionDate.toDate());
            if (choicesObj) {
                let emptyChoices = choicesObj.choices.filter(function (choice) {
                    return choice.choiceMenuNumber.length === 0;
                });
                /*checking length of emptyChoices and choicesObj. If they are equal, there are no choises for user*/
                if (choicesObj.choices.length !== emptyChoices.length) {
                    availableUserChoicesPerDay = choicesObj.choices.filter(function (choice) {
                        return choice.choiceMenuNumber.length !== 0;
                    });
                    session.userData.availableUserChoicesPerDay = availableUserChoicesPerDay;
                    Logger.logger().info('User [%s] has [%d] choice(s) available on [%s]', session.message.user.id, availableUserChoicesPerDay.length, actionDate.format("YYYY-MM-DD"));
                    /*adding in session non circular variable*/
                    let userChoicesNonCircular = [];
                    availableUserChoicesPerDay.forEach(function (choice) {
                        userChoicesNonCircular.push({
                            choiceMenuNumber: choice.choiceMenuNumber,
                            choiceMenuName: choice.choiceMenuName,
                            columnLetter: choice.choiceDay.columnLetter,
                            rowNumber: choice.rowNumber
                        });
                    });
                    session.userData.userChoicesNonCircular = userChoicesNonCircular;
                    next();
                } else {
                    Logger.logger().info('There are not choices(notEmpty) for users [%s] and date[%s]', session.message.user.id, actionDate.format("YYYY-MM-DD"));
                    session.endDialog("Seems that there are no choises for %s", actionDate.format("D MMM YYYY"));
                }

            }
            else {
                session.endDialog("There is no such date [%s] in the menu", actionDate.format("D MMM YYYY"));
            }
        }
        else {
            Logger.logger().info('No user found.');
        }

    }

    static fetchMenuForDay(session, results, next) {
        let userSelectedMenuDate = moment(session.userData.orderActionDate);
        let dayName = userSelectedMenuDate.isSame(moment(new Date), 'day') ? 'Today' : userSelectedMenuDate.format('dddd');
        let sheet = new Sheet(session.userData.sheet);
        let menuForDay = sheet.getMenusForDate(userSelectedMenuDate.toDate());
        var availableUserChoicesPerDay = session.userData.availableUserChoicesPerDay;
        let menuList = [];
        if (menuForDay !== undefined) {
            availableUserChoicesPerDay.forEach(function (item) {
                menuForDay.forEach(function (menu) {
                    if (menu._number == item.choiceMenuNumber) {
                        menuList.push({menu: menu, menuName: item.choiceMenuName, menuNumber: item.choiceMenuNumber});
                        Logger.logger().info("Added menu[%s]", menu.constructor.name);
                    }
                });
            });

            let menusForDayView = MenusFactory.buildMenus(session, menuList);
            session.send("Here are your choices for " + dayName + ":");
            /*cleaning up session, otherwise we get "TypeError: Converting circular structure to JSON"*/
            session.userData.availableUserChoicesPerDay = null;
            session.dialogData.choicesSheet = null;
            // builder.Prompts.choice(session, menusForDayView.msg, menusForDayView.choises);
            session.endDialog(menusForDayView.msg);
        } else {
            session.endDialog("There is no menu for  " + dayName);
        }
    }

    static name() {
        return "/status";
    }

    get dialog() {
        return this.dialogs;
    }
}
module.exports = UserChoisesStatusDialog;
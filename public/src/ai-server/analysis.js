//import { format } from "date-fns";
var data = require("./analysisdata");

function isStr(value) {
  if (value == undefined || value == null || value == "") return false;
  return true;
}

/* Check if text is a event or meeting or an appoinment
 *   and return a result base on the request
 * @param text a full string to check
 * @param result a compressed string to check
 * @return result
 */
async function getEventOnResult(text, result) {
  if (!result.topic || !result.topic.response) return "response failed ";

  let new_result = {};
  const response = result.topic.response;

  if (isResultEvent(response)) {
    text = text.trim().toLowerCase();

    var actualEventDate = dateFromString(text);
    if (!actualEventDate) return "event not found";

    new_result["Event"] = "Event Found";

    new_result["YearMonth"] = parseYearMonth(text);
    new_result["Actual Date"] = actualEventDate;

    if (!new_result["YearMonth"] && actualEventDate) {
      const datee = new Date(actualEventDate);
      new_result["YearMonth"] =
        datee.getFullYear() + " " + monthNumToName(datee.getMonth());
    }

    var hour = text.match(/[0-9]{1,2}(?:(?: hour))/);
    var time = text.match(/[0-9]{1,2}(?:(?::[0-9]{2})|(?: [0-9]{2}))\b/);

    new_result["Time"] =
      (hour ? hour + ": at: " : "") + (time && isStr(time[0]) ? time[0].replace(/\s+/g, ":") : "");

    let addressParser = parseAddress(text, result.addresss);
    if (!addressParser && result.curAddress) {
      addressParser = result.curAddress.country + " " + result.curAddress.city;
    }
    new_result["Address"] = addressParser;

    new_result["Subject"] = parseLemma(result);
    return new_result;
  }
  return "event not found";
}

/* Extract event info
 * @param result a full server result
 * @return text
 */
function parseLemma(result) {
  const lemma = result.lemma.lemma;
  if (lemma) {
    let n;
    let text = "";
    for (n in lemma) {
      if (lemma[n] !== "") {
        text += lemma[n] + " ";
      }
    }
    return text;
  }
  return null;
}

/* Load a full list of all cities in all countries
 *  and check if any of the cities if found inside the text
 * @param text a full server response
 * @param addresss a countries cities
 * @return address
 */
function parseAddress(text, addresss) {
  if (!addresss) return "";

  /*
  let result = "";
  let n;
  for (n in addresss) {

    var arr = text.split(" ");
    for (let i = 0; i < arr.length; i++) {
      let ss = arr[i];
      ss = ss.endsWith(",") ? ss.substring(0, ss .length-1) : ss;
      if (addresss[n].indexOf(ss) !== -1) {
        result += ss + " ";
      }
    }
  }*/

  var new_addresss = addresss.map(item => item.toLowerCase());
  let result = "";
  var arr = text.split(" ");
  for (let i = 0; i < arr.length; i++) {
    let ss = arr[i];
    ss = ss.endsWith(",") ? ss.substring(0, ss.length - 1) : ss;
    if (new_addresss.indexOf(ss) !== -1) {
      result += ss + " ";
    }
  }
  return result;
}

/* Extract year month date from an event
 * @param text a full server response
 * @param response a complie response
 * @return year month
 */
function parseYearMonth(text) {
  var result;
  const month = extractData(text, "month");

  var year = text.match(/[0-9]{4}(?:(?:))/);
  if (year && year[0] && year[0].startsWith("20")) {
    result = year[0] + " " + month;
  } else {
    result = month ? new Date().getFullYear() + " " + month : month;
  }
  return result;
}

function extractData(text, type) {
  var value;
  var arr = text.split(" ");
  if (type === "month") {
    for (let i = 0; i < arr.length; i++) {
      if (monthNameToNum(arr[i].toLowerCase()) > 0) {
        value = arr[i];
        break;
      }
    }
  } else if (type === "nav") {
    for (let i = 0; i < arr.length; i++) {
      var navType = data.nav.indexOf(arr[i].toLowerCase());
      if (navType !== -1) {
        value = arr[i];
        break;
      }
    }
  }
  return value;
}

/* Extract date from a string
 * @param stringToParse a string to extract date from
 * @return Date
 */
function dateFromString(stringToParse) {
  //check text to see if ex, (2nd), (22nd) found
  //and remove it from the text ex, (2nd > 2), (22nd > 22)
  var ndType = stringToParse.match(/[0-9]{1,2}(?:(?:nd)|(?:th))/);
  if (ndType && ndType[0]) {
    var typeR = ndType[0];
    stringToParse = stringToParse.replace(
      typeR,
      typeR.substring(0, typeR.length - 2)
    );
  }

  //here we check for date
  //example 3/21/2020
  var date;
  var ssdate = stringToParse.match(
    /(\d{4})\/(\d{1,2})\/(\d{1,2})\s+(\d{2}):(\d{2})/
  );

  if (!ssdate) ssdate = stringToParse.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
  if (!ssdate) ssdate = stringToParse.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);

  if (!ssdate) ssdate = stringToParse.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!ssdate) ssdate = stringToParse.match(/(\d{1,2})-(\d{1,2})-(\d{14})/);

  if (ssdate) {
    ssdate[2] -= 1;
    date = new Date(Date.UTC.apply(this, ssdate.slice(1)));
    if (date.toString().includes("1909")) {
      date = new Date(ssdate.slice(1));
    }
  }

  //here we check for date
  //example mon feb 4 2020
  if (!date) {
    ssdate = stringToParse.match(
      /\b(?:(?:mon)|(?:tues?)|(?:wed(?:nes)?)|(?:thur?s?)|(?:fri)|(?:sat(?:ur)?)|(?:sun))(?:day)?\b[:\-,]?\s*(?:(?:jan|feb)?r?(?:uary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|oct(?:ober)?|(?:sept?|nov|dec)(?:ember)?)\s+\d{1,2}\s*,?\s*\d{4}/i
    );
    if (ssdate) date = new Date(ssdate);
  }

  //here we check for date
  //example 2020 feb 4
  if (!date) {
    ssdate = stringToParse.match(
      /\s*,?\s*\d{4}\s*(?:(?:jan|feb)?r?(?:uary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|oct(?:ober)?|(?:sept?|nov|dec)(?:ember)?)\s+\d{1,2}/i
    );
    if (ssdate) date = new Date(ssdate);
  }

  //here we check for date
  //example feb 4 2020
  if (!date) {
    ssdate = stringToParse.match(
      /\s+\d{1,2}\s*,?\s*\d{4}\b(?:(?:mon)|(?:tues?)|(?:wed(?:nes)?)|(?:thur?s?)|(?:fri)|(?:sat(?:ur)?)|(?:sun))(?:day)?\b[:\-,]?\s*(?:(?:jan|feb)?r?(?:uary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|oct(?:ober)?|(?:sept?|nov|dec)(?:ember)?)/i
    );
    if (ssdate) date = new Date(ssdate);
  }

  //here we check for date
  //example cot 3 2020
  if (!date) {
    ssdate = stringToParse.match(
      /\b[:\-,]?\s*[a-zA-Z]{3,9}\s+\d{1,2}\s*,?\s*\d{4}/
    );
    if (ssdate) date = new Date(ssdate);
  }

  //here we check for nav date
  //example today,tomorrow,yesterday
  if (!date) date = parseNavDate(stringToParse);

  //here we check for week month date
  //example (next week), (next month), (actual week,month,year in time)
  if (!date) date = parseWeekMonthDate(stringToParse);
  return "" + date;
}

function parseNavDate(stringToParse) {
  var date;
  const today = new Date();
  const navType = extractData(stringToParse, "nav");
  if (navType) {
    today.setDate(
      data.nav.indexOf(navType) == 2
        ? today.getDate() - 1
        : today.getDate() + data.nav.indexOf(navType)
    );

    date = today;
  }

  if (!date) {
    var cdays = stringToParse.match(
      /\b(?:(?: in|at|on|next|after))\s*[0-9]{1,2}(?:(?: day|days))/
    );
    if (cdays && cdays[0]) {
      var days = cdays[0].match(/[0-9]{1,2}/);
      today.setDate(today.getDate() + parseInt(days, 10));
      date = today;
    }
  }

  if (!date) {
    const monthName = stringToParse.match(
      /\s*[0-9]{1,2}(?:(?: jan(?:uary)?)|(?: feb(?:uary)?)|(?: mar(?:ch)?)|(?: apr(?:il)?)|(?: may?)|(?: june)|(?: july)|(?: aug(?:ust)?)|(?: oct(?:ober)?)|(?: sept(?:ember)?)|(?: nov(?:ember)?)|(?: dec(?:ember)?))|(?:(?: jan(?:uary)?)|(?: feb(?:uary)?)|(?: mar(?:ch)?)|(?: apr(?:il)?)|(?: may?)|(?: june)|(?: july)|(?: aug(?:ust)?)|(?: oct(?:ober)?)|(?: sept(?:ember)?)|(?: nov(?:ember)?)|(?: dec(?:ember)?))\s*[0-9]{1,2}/
    );
    if (monthName && monthName[0]) {
      date = new Date(monthName + " " + today.getFullYear());
    }
  }

  if (!date && (cdays = stringToParse.match(/(?:(?: on))\s*[0-9]{1,2}/))) {
    date = new Date(
      today.getFullYear(),
      today.getMonth(),
      cdays[0].match(/[0-9]{1,2}/)
    );
  }
  return date;
}

function parseWeekMonthDate(stringToParse) {
  const today = new Date();
  var date;
  var nwdays = stringToParse.match(
    /\b(?:(?:mon)|(?:tues?)|(?:wed(?:nes)?)|(?:thur?s?)|(?:fri)|(?:sat(?:ur)?)|(?:sun))(?:day)?\b(?:(?: next))\b(?:(?: week))/
  );

  if (!nwdays || !nwdays[0]) {
    nwdays = stringToParse.match(
      /\b(?:(?: next))\b(?:(?: week))\b(?:(?: mon)|(?: tues?)|(?: wed(?:nes)?)|(?: thur?s?)|(?: fri)|(?: sat(?:ur)?)|(?: sun))(?:day)/
    );
  }

  if (!nwdays || !nwdays[0]) {
    nwdays = stringToParse.match(
      /(?:(?: on))\b(?:(?: mon)|(?: tues?)|(?: wed(?:nes)?)|(?: thur?s?)|(?: fri)|(?: sat(?:ur)?)|(?: sun))(?:day)/
    );
  }

  if (nwdays && nwdays[0]) {
    const dayName = nwdays[0].match(
      /\b(?:(?:mon)|(?:tues?)|(?:wed(?:nes)?)|(?:thur?s?)|(?:fri)|(?:sat(?:ur)?)|(?:sun))(?:day)/
    );
    const weekDate = nextDayAndTime(
      data.weekDays.indexOf(dayName[0]),
      7,
      30
    ).toString();
    date = weekDate;
  }

  if (!date) {
    var nmdays = stringToParse.match(
      /[0-9]{1,2}?\b(?:(?: next))\b(?:(?: month))/
    );

    if (nmdays && nmdays[0]) {
      const monthDay = nmdays[0].match(/[0-9]{1,2}/);
      date = new Date(today.getFullYear(), today.getMonth() + 1, monthDay);
    }
  }
  return date;
}

function monthNumToName(monthnum) {
  return data.months[monthnum] || "";
}

function monthNameToNum(monthname) {
  var month = data.months.indexOf(monthname);
  if (month === -1) {
    month = data.monthsS.indexOf(monthname);
    return month === -1 ? 0 : month + 1;
  } else {
    return month + 1;
  }
}

// get a next day in date format
// day: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
function nextDayAndTime(dayOfWeek, hour, minute) {
  var now = new Date();
  var result = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + ((7 + dayOfWeek - now.getDay()) % 7),
    hour,
    minute
  );

  if (result < now) result.setDate(result.getDate() + 7);
  return result;
}

/* Check if string is an event
 * @param result a string to check
 * @return true,false
 */
function isResultEvent(result) {
  try {
    if (
      result.nba ||
      result.sport ||
      result.play ||
      result.playing ||
      result.accident ||
      result.club ||
      result.clubing ||
      result.clubbing ||
      result.game ||
      result.match ||
      result.boxing ||
      result.football ||
      result.betting ||
      result.show ||
      result.stage ||
      result.performance ||
      result.tv ||
      result.music ||
      result.movie ||
      result.comedy ||
      result.series ||
      result.season ||
      result.occure ||
      result.occuring ||
      result.start ||
      result.work ||
      result.starting ||
      result.working ||
      result.ending ||
      result.starting ||
      result.appearance ||
      result.started ||
      result.employed ||
      result.expire ||
      result.hire ||
      result.showcase ||
      result.location ||
      result.challange ||
      result.story ||
      result.party ||
      result.occasion ||
      result.travel ||
      result.flight ||
      result.flights ||
      result.airline ||
      result.ticket ||
      result.alarm ||
      result.schedule ||
      result.attend ||
      result.tickets ||
      result.wedding ||
      result.burial ||
      result.die ||
      result.dead ||
      result.birth ||
      result.birthday ||
      result.sex ||
      result.kill ||
      result.plans ||
      result.beach ||
      result.school ||
      result.opening ||
      result.hotel ||
      result.breakfast ||
      result.lunch ||
      result.dinner ||
      result.restaurant ||
      result.restaurants ||
      result.investment ||
      result.church ||
      result.vigil ||
      result.visit ||
      result.visiting ||
      result.date ||
      result.event ||
      result.events ||
      result.session ||
      result.resting ||
      result.relaxing ||
      result.meeting ||
      result.meetings ||
      result.appointment ||
      result.appointments ||
      result.court ||
      result.delay
    ) {
      return true;
    }
  } catch (e) {
    return null;
  }
}

module.exports = getEventOnResult;

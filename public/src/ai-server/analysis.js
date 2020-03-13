//import { format } from "date-fns";
var data = require("./analysisdata");

/* Check if text is a event or metting or an appoinment
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
    new_result["Event"] = "Event Found";

    new_result["YearMonth"] = parseActualDate(text);
    new_result["Actual Date"] = dateFromString(text);

    if (!new_result["YearMonth"] && new_result["Actual Date"]) {
      const datee = new Date(new_result["Actual Date"]).getFullYear();
      new_result["YearMonth"] = datee +"";
    }
    var hour = text.match(/[0-9]{1,2}(?:(?: hour))/);
    var time = text.match(/[0-9]{1,2}(?:(?::[0-9]{1,2}))/);

    //var time = text.match(/[0-9]{1,2}(?:(?::[0-9]{1,2})|(?: [0-9]{1,2}))/);
    new_result["Time"] = hour + ": at: " + time;

    let addressParser = parseAddress(text, result.addresss);
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

/* Extract actual date from an event
 * @param text a full server response
 * @param response a complie response
 * @return actual date
 */
function parseActualDate(text) {
  var result;
  const month = extractData(text, "month");

  var year = text.match(/[0-9]{4}(?:(?:))/);
  if (year && year[0] && year[0].startsWith("20")) {
    result = year[0] + " " + month;
  } else {
    result = month ? new Date().getFullYear + " " + month : month;
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

  var date;
  var ssdate = stringToParse.match(
    /(\d{4})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2})/
  );
  ssdate = !ssdate
    ? stringToParse.match(/(\d{2,4})\/(\d{2})\/(\d{2,4})/)
    : ssdate;

  if (ssdate) {
    ssdate[2] -= 1;
    date = new Date(Date.UTC.apply(this, ssdate.slice(1)));
    if (date.toString().includes("1909")) {
      date = new Date(ssdate.slice(1));
    }
  }

  if (!date) {
    ssdate = stringToParse.match(
      /\b(?:(?:Mon)|(?:Tues?)|(?:Wed(?:nes)?)|(?:Thur?s?)|(?:Fri)|(?:Sat(?:ur)?)|(?:Sun))(?:day)?\b[:\-,]?\s*(?:(?:jan|feb)?r?(?:uary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|oct(?:ober)?|(?:sept?|nov|dec)(?:ember)?)\s+\d{1,2}\s*,?\s*\d{4}/i
    );
    if (ssdate) date = new Date(ssdate);
  }

  if (!date) {
    ssdate = stringToParse.match(
      /\b[:\-,]?\s*[a-zA-Z]{3,9}\s+\d{1,2}\s*,?\s*\d{4}/
    );
    if (ssdate) date = new Date(ssdate);
  }

  //const DATE_FORMAT = "MM-dd-yyyy hh:mm:ss";
  //format(new Date(), DATE_FORMAT);

  if (!date) {
    const navType = extractData(stringToParse, "nav");
    if (navType) {
      const today = new Date();
      const tomorrow = new Date(today);
      const yesterday = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      yesterday.setDate(yesterday.getDate() - 1);

      date =
        navType === "today"
          ? today
          : navType === "tomorrow"
          ? tomorrow
          : navType === "yesterday"
          ? yesterday
          : null;
    }

    if (!date) {
      var cdays = stringToParse.match(
        /\b(?:(?: in|at|on|next))\s*[0-9]{1,2}(?:(?: days))/
      );
      if (cdays && cdays[0]) {
        var days = cdays[0].match(/[0-9]/);
        const eventDate = new Date(new Date());
        eventDate.setDate(eventDate.getDate() + parseInt(days, 10));
        date = eventDate;
      }
    }
  }
  return "" + date;
}

function monthNumToName(monthnum) {
  return data.months[monthnum - 1] || "";
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

/* Check if string is an event
 * @param result a string to check
 * @return true,false
 */
function isResultEvent(result) {
  try {
    if (
      result.club ||
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
      result.appointments
    ) {
      return true;
    }
  } catch (e) {
    return null;
  }
}

module.exports = getEventOnResult;

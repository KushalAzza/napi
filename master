  // const accessSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ACCESS");

  // const NEO_FIN_KEY = accessSheet.getRange("B1").getValue();
  // const PAN = accessSheet.getRange("B2").getValue();
  // const PASSWORD = accessSheet.getRange("B3").getValue();
  // const KOTAK_ACCESS_TOKEN = accessSheet.getRange("B4").getValue();
  // const USER_ID = accessSheet.getRange("B5").getValue();
  // const JWT_TOKEN_VIEW = accessSheet.getRange("B6").getValue();
  // const SESSION_ID = accessSheet.getRange("B7").getValue();
  // const SERVER_ID = accessSheet.getRange("B8").getValue();
  // const OTP = accessSheet.getRange("B9").getValue();
  // const JWT_TOKEN_TRADE = accessSheet.getRange("B10").getValue();
  
  // const DHAN_ACCESS_TOKEN = accessSheet.getRange("B14").getValue();
  // const DHAN_CLIENT_ID = accessSheet.getRange("B15").getValue();
  // const DHAN_BASE_URL = accessSheet.getRange("B16").getValue();

  const accessSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ACCESS");

  // Retrieve all values at once from B1 to B10 and B14 to B16
  const values = accessSheet.getRange("B1:B10").getValues().flat();
  const dhValues = accessSheet.getRange("B14:B16").getValues().flat();

  // Destructure the values into constants
  const [
    NEO_FIN_KEY,
    PAN,
    PASSWORD,
    KOTAK_ACCESS_TOKEN,
    USER_ID,
    JWT_TOKEN_VIEW,
    SESSION_ID,
    SERVER_ID,
    OTP,
    JWT_TOKEN_TRADE,
    DHAN_ACCESS_TOKEN,
    DHAN_CLIENT_ID,
    DHAN_BASE_URL
  ] = [...values, ...dhValues];


function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Trading Terminal')
    .addItem('📈 Buying Terminal', 'openBuyingSidebar')
    .addItem('📉 Selling Terminal', 'openSellingSidebar')
    .addToUi();
}

function openBuyingSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('buyingSidebar')
      .setTitle('Options Buying Terminal')
      .setWidth(300);
  SpreadsheetApp.getUi().showSidebar(html);
}

function openSellingSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('sellingSidebar')
      .setTitle('Options Selling Terminal')
      .setWidth(300);
  SpreadsheetApp.getUi().showSidebar(html);
}


const TELEGRAM_BOT_TOKEN = '7679221171:AAGfkc1inDPAZGa2pkrQ5ZldhQkhIFfVohs'; // Replace with your bot token
const CHAT_ID = '8073725817'; // Replace with your chat ID

function sendMessage(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const payload = {
    chat_id: CHAT_ID,
    text: message,
    parse_mode: 'HTML'
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  };

  UrlFetchApp.fetch(url, options);
}

function logMessage(message) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("LOG");
    var timestamp = new Date(); // Get the current date and time
    sheet.appendRow([timestamp, message]); // Append the timestamp and message
}


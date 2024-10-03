function rebalanceSell() {

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("MASTER");
  var today = new Date();
  var dayOfWeek = today.getDay(); 

  var indexName, indexNeo, strikePriceIncrement, exchangeSecurityId, exchangeSegment, exchangeSegmentNeo, productType, exchangeInstrument, optionSegment, optionInstrument, quantity;
  
  switch (dayOfWeek) {
    case 5: // Monday
      indexName = "MIDCPNIFTY";
      indexNeo = "MIDCPNIFTY";
      strikePriceIncrement = "25";
      exchangeSecurityId = "442";
      exchangeSegment = "IDX_I";
      exchangeSegmentNeo = "nse_fo";
      productType = "MARGIN";
      exchangeInstrument = "INDEX";
      optionSegment = "NSE_FNO";
      optionInstrument = "OPTIDX";
      quantity = "50";
      break;
    case 1: // Tuesday
      indexName = "FINNIFTY";
      indexNeo = "FINNIFTY";
      strikePriceIncrement = "50";
      exchangeSecurityId = "27";
      exchangeSegment = "IDX_I";
      exchangeSegmentNeo = "nse_fo";
      productType = "MARGIN";
      exchangeInstrument = "INDEX";
      optionSegment = "NSE_FNO";
      optionInstrument = "OPTIDX";
      quantity = "25";
      break;
    case 2: // Wednesday
      indexName = "BANKNIFTY";
      indexNeo = "BANKNIFTY";
      strikePriceIncrement = "100";
      exchangeSecurityId = "25";
      exchangeSegment = "IDX_I";
      exchangeSegmentNeo = "nse_fo";
      productType = "MARGIN";
      exchangeInstrument = "INDEX";
      optionSegment = "NSE_FNO";
      optionInstrument = "OPTIDX";
      quantity = "15";
      break;
    case 3: // Thursday
      indexName = "NIFTY";
      indexNeo = "NIFTY";
      strikePriceIncrement = "50";
      exchangeSecurityId = "13";
      exchangeSegment = "IDX_I";
      exchangeSegmentNeo = "nse_fo";
      productType = "MARGIN";
      exchangeInstrument = "INDEX";
      optionSegment = "NSE_FNO";
      optionInstrument = "OPTIDX";
      quantity = "25";
      break;
    case 4: // Friday
      indexName = "SENSEX";
      indexNeo = "BSXOPT";
      strikePriceIncrement = "100";
      exchangeSecurityId = "51";
      exchangeSegment = "IDX_I";
      exchangeSegmentNeo = "bse_fo";
      productType = "MARGIN";
      exchangeInstrument = "INDEX";
      optionSegment = "BSE_FNO";
      optionInstrument = "OPTIDX";
      quantity = "10";
      break;
    default:
      logMessage("REBALANCE SELL: Today is not a trading day. Bye bye!");
      deleteSpecificTrigger("masterTrigger");
      return;
  }
  var sheetData = sheet.getRange("B14:E24").getValues();
  var lotSize = sheetData[0][0];
  var quantity = quantity * lotSize;

  var securityIdCallOne = sheetData[6][0];
  var securityIdCallTwo = sheetData[7][0];
  var securityIdPutOne = sheetData[9][0];
  var securityIdPutTwo = sheetData[10][0];

  if (securityIdCallOne && securityIdCallTwo && securityIdPutOne && securityIdPutTwo) {
    
    var success = false;  // Initialize the success flag
    
    for (var attempt = 1; attempt <= 4; attempt++) {

      if (success) break;  // Stop the loop if success is achieved
      
      var priceCallStoredOne = sheetData[6][3];
      var priceCallStoredTwo = sheetData[7][3];
      var pricePutStoredOne = sheetData[9][3];
      var pricePutStoredTwo = sheetData[10][3];

      // var priceCallOne = getLTP(securityIdCallOne, optionSegment, optionInstrument);
      // var priceCallTwo = getLTP(securityIdCallTwo, optionSegment, optionInstrument);
      // var pricePutOne = getLTP(securityIdPutOne, optionSegment, optionInstrument); 
      // var pricePutTwo = getLTP(securityIdPutTwo, optionSegment, optionInstrument); 

      var priceData = getMultiLTP([securityIdCallOne, securityIdCallTwo, securityIdPutOne, securityIdPutTwo], optionSegment);

      // Extract prices into separate variables
      var priceCallOne = priceData[securityIdCallOne] || null;
      var priceCallTwo = priceData[securityIdCallTwo] || null;
      var pricePutOne = priceData[securityIdPutOne] || null;
      var pricePutTwo = priceData[securityIdPutTwo] || null;

      var lossPercent = sheetData[1][0];
      var profitPercent = sheetData[2][0]; 

      var openPnL = quantity * ((priceCallStoredOne - priceCallOne) + (priceCallStoredTwo - priceCallTwo) + (pricePutStoredOne - pricePutOne) + (pricePutStoredTwo - pricePutTwo));
      var openMargin = quantity * (priceCallStoredOne + priceCallStoredTwo + pricePutStoredOne + pricePutStoredTwo); 

      var profitMargin = openMargin * profitPercent;
      var lossMargin = openMargin * lossPercent;

      if ((openPnL >= profitMargin || openPnL <= -lossMargin) && priceCallStoredOne && priceCallStoredTwo && pricePutStoredOne && pricePutStoredTwo) {

        var realTimePrice = getLTP(exchangeSecurityId, exchangeSegment, exchangeInstrument);
    
        if (!realTimePrice) {
          logMessage("REBALANCE SELL: Error fetching real-time price.");
          sendMessage("REBALANCE SELL: Error fetching real-time price.");
          return;
        }

        var roundedPrice = Math.floor(realTimePrice / strikePriceIncrement) * strikePriceIncrement;
        var strikeCallOne = roundedPrice + (strikePriceIncrement * 3);
        var strikePutOne = roundedPrice - (strikePriceIncrement * 3);

        // var strikeCallOneStored = sheet.getRange("D20").getValue();
        // var strikePutOneStored = sheet.getRange("D23").getValue();

        var strikeCallOneStored = sheetData[6][2];
        var strikePutOneStored = sheetData[9][2];

        if (strikeCallOneStored == strikeCallOne || strikePutOneStored == strikePutOne) {
          
          // sheet.getRange("E20").setValue(priceCallOne); 
          // sheet.getRange("E21").setValue(priceCallTwo); 
          sheet.getRange("E20:E21").setValues([[priceCallOne], [priceCallTwo]]);

          // sheet.getRange("E23").setValue(pricePutOne); 
          // sheet.getRange("E24").setValue(pricePutTwo);
          sheet.getRange("E23:E24").setValues([[pricePutOne], [pricePutTwo]]);

          var storedPnL = sheet.getRange("B26").getValue();
          var currentPnl = openPnL + storedPnL;
          sheet.getRange("B26").setValue(currentPnl);

          var rowData = [today, openPnL, currentPnl, openMargin, "No"];
          sheet.appendRow(rowData);

          logMessage("REBALANCE SELL: Stored and current strike are the same, updated the PnL only");
        } else {
          
          var exitSellStatus = exitSell();
          var enterSellStatus = enterSell();

          if (exitSellStatus && enterSellStatus) {
            
            var storedPnL = sheet.getRange("B26").getValue();
            var currentPnl = openPnL + storedPnL;
            sheet.getRange("B26").setValue(currentPnl);

            var rowData = [today, openPnL, currentPnl, openMargin, "Yes"];
            sheet.appendRow(rowData);

            logMessage("REBALANCE SELL: Exit & Enter of SELL completed");
          } else {
            logMessage("REBALANCE SELL: Exit & Enter SELL failed");
            sendMessage("REBALANCE SELL: Exit & Enter SELL failed");
          } 
        }

        success = true;  // Set success to true to stop the loop
        break;  // Break out of the loop after success
      }

      Utilities.sleep(10000);
      logMessage("REBALANCE SELL: Attempt " + attempt + ": Open Orders PnL is " + openPnL.toFixed(2) + ", profitMargin is " + profitMargin.toFixed(2) + " & lossExit is -" + lossMargin.toFixed(2));
    }

    if (attempt > 4 && !success) {
      logMessage("REBALANCE SELL: Max attempts reached. Profit and Loss condition not met.");
    }

    return;
  }
}

function rebalanceBuy() {

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("MASTER");
    // Get today's date
    var today = new Date();
    var dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, ..., 6 = Saturday

    var indexName, indexNeo, strikePriceIncrement, exchangeSecurityId, exchangeSegment, exchangeSegmentNeo, productType, exchangeInstrument, optionSegment, optionInstrument, quantity;
    
    switch (dayOfWeek) {
      case 5: // Monday
        indexName = "MIDCPNIFTY";
        indexNeo = "MIDCPNIFTY";
        strikePriceIncrement = "25";
        exchangeSecurityId = "442";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "50";
        break;
      case 1: // Tuesday
        indexName = "FINNIFTY";
        indexNeo = "FINNIFTY";
        strikePriceIncrement = "50";
        exchangeSecurityId = "27";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "25";
        break;
      case 2: // Wednesday
        indexName = "BANKNIFTY";
        indexNeo = "BANKNIFTY";
        strikePriceIncrement = "100";
        exchangeSecurityId = "25";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "15";
        break;
      case 3: // Thursday
        indexName = "NIFTY";
        indexNeo = "NIFTY";
        strikePriceIncrement = "50";
        exchangeSecurityId = "13";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "25";
        break;
      case 4: // Friday
        indexName = "SENSEX";
        indexNeo = "BSXOPT";
        strikePriceIncrement = "100";
        exchangeSecurityId = "51";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "bse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "BSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "10";
        break;
      default:

        logMessage("REBALANCE BUY: Today is not a trading day. Bye bye!");

        deleteSpecificTrigger("masterTrigger");
        return;
    }
    
    // multiplying with lot size
    var lotSize = sheet.getRange("B14").getValue();
    var quantity = quantity * lotSize;
    var doubleQuantity = quantity * 2;

    var realTimePrice = getLTP(exchangeSecurityId, exchangeSegment, exchangeInstrument);
    
    if (realTimePrice == false) {
        logMessage("REBALANCE BUY: Error fetching real-time price, examine the error logs.");
        sendMessage("REBALANCE BUY: Error fetching real-time price, examine the error logs.");
        deleteSpecificTrigger("masterTrigger");
        return;
    }

    // Round the real-time price to the nearest strike price increment
    var roundedPrice = (Math.floor(realTimePrice / strikePriceIncrement)) * strikePriceIncrement;
    
    /// build logic here

    // generating the strike price with the rounded price (at 8 OTM )
    var strikeCallBreach = roundedPrice + (strikePriceIncrement * 8);
    var strikePutBreach = roundedPrice - (strikePriceIncrement * 8);

    var strikeCallStored = sheet.getRange("D19").getValue();
    var strikePutStored = sheet.getRange("D22").getValue();

  if (strikeCallStored <= strikeCallBreach || strikePutStored >= strikePutBreach) {

    // buying logic intiated without storing the values.
    // fetching securityId and tradeSymbol with the rounded price (OTM + 12)
    var strikeCall = roundedPrice + (strikePriceIncrement * 12);
    var strikePut = roundedPrice - (strikePriceIncrement * 12);

    var tradeSymbolCall = fetchTradeSymbol(indexNeo, "CE", strikeCall);
    var tradeSymbolPut = fetchTradeSymbol(indexNeo, "PE", strikePut);
    
    // placing order for FAR CALL
    
    var orderStatusCall = placeNeoOrder("B", exchangeSegmentNeo, "NRML", "MKT", doubleQuantity, tradeSymbolCall, "0");
      
      if (orderStatusCall) { 
        
        var securityIdCall = fetchSecurityId(indexNeo, "CE", strikeCall);
        var priceCall = getLTP(securityIdCall, optionSegment, optionInstrument);
        logMessage("CALL Buy order FAR completed.");

      } else {
          logMessage("CALL Buy order FAR failed.");
          sendMessage("CALL Buy order FAR failed.");
          return 'CALL BUY executed FAR failed!';
      }
    // placing order for FAR PUT

    var orderStatusPut = placeNeoOrder("B", exchangeSegmentNeo, "NRML", "MKT", doubleQuantity, tradeSymbolPut, "0");
      
      if (orderStatusPut) {

        var securityIdPut = fetchSecurityId(indexNeo, "PE", strikePut);
        var pricePut = getLTP(securityIdPut, optionSegment, optionInstrument);
        logMessage("PUT Buy order FAR completed.");

      } else {
          logMessage("PUT Buy order FAR failed.");
          sendMessage("PUT Buy order FAR failed.");
          return 'PUT BUY executed FAR failed!';
      }

      // intiating the exit buy 
      
      var exitBuyStatus = exitBuy();

      if (exitBuyStatus) {
        logMessage("FAR BUY Orders have been exited.");
      } else {
        logMessage("FAR BUY Orders exit has failed.");
        sendMessage("FAR BUY Orders exit has failed.");
        return 'FAR BUY Orders exit has failed!';
      }

      // Storing values in the MASTER SHEET after exit has completed.
    if (orderStatusCall && orderStatusPut) {

      // sheet.getRange("B19").setValue(securityIdCall); 
      // sheet.getRange("C19").setValue(tradeSymbolCall); 
      // sheet.getRange("D19").setValue(strikeCall); 
      // sheet.getRange("E19").setValue(priceCall); 
      sheet.getRange("B19:E19").setValues([[securityIdCall, tradeSymbolCall, strikeCall, priceCall]]);


      // sheet.getRange("B22").setValue(securityIdPut); 
      // sheet.getRange("C22").setValue(tradeSymbolPut); 
      // sheet.getRange("D22").setValue(strikePut); 
      // sheet.getRange("E22").setValue(pricePut); 
      sheet.getRange("B22:E22").setValues([[securityIdPut, tradeSymbolPut, strikePut, pricePut]]);


      logMessage("All FAR Buy order completed.");
      return 'All CALL Far executed successfully!';
    
    } else {
      logMessage("Something went wrong with FAR Buy order.");
      sendMessage("Something went wrong with FAR Buy order.");
      return '🚨 Something went wrong with FAR Buy order!';
    }

  } else {
    logMessage("FAR BUY is within the limits. No rebalancing required.")
    return 'FAR BUY is within the limits. No rebalancing required.';
  }

}

function enterBuy() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("MASTER");
    // Get today's date
    var today = new Date();
    var dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, ..., 6 = Saturday

    var indexName, indexNeo, strikePriceIncrement, exchangeSecurityId, exchangeSegment, exchangeSegmentNeo, productType, exchangeInstrument, optionSegment, optionInstrument, quantity;
    
    switch (dayOfWeek) {
      case 5: // Monday
        indexName = "MIDCPNIFTY";
        indexNeo = "MIDCPNIFTY";
        strikePriceIncrement = "25";
        exchangeSecurityId = "442";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "50";
        break;
      case 1: // Tuesday
        indexName = "FINNIFTY";
        indexNeo = "FINNIFTY";
        strikePriceIncrement = "50";
        exchangeSecurityId = "27";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "25";
        break;
      case 2: // Wednesday
        indexName = "BANKNIFTY";
        indexNeo = "BANKNIFTY";
        strikePriceIncrement = "100";
        exchangeSecurityId = "25";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "15";
        break;
      case 3: // Thursday
        indexName = "NIFTY";
        indexNeo = "NIFTY";
        strikePriceIncrement = "50";
        exchangeSecurityId = "13";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "25";
        break;
      case 4: // Friday
        indexName = "SENSEX";
        indexNeo = "BSXOPT";
        strikePriceIncrement = "100";
        exchangeSecurityId = "51";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "bse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "BSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "10";
        break;
      default:

        logMessage("FAR BUY: Today is not a trading day. Bye bye!");

        deleteSpecificTrigger("masterTrigger");
        return;
    }
    
    // multiplying with lot size
    var lotSize = sheet.getRange("B14").getValue();
    var quantity = quantity * lotSize;
    var doubleQuantity = quantity * 2;

    var realTimePrice = getLTP(exchangeSecurityId, exchangeSegment, exchangeInstrument);
    
    if (realTimePrice == false) {

        logMessage("FAR BUY: Error fetching real-time price, examine the error logs.");
        sendMessage("FAR BUY: Error fetching real-time price, examine the error logs.");
        deleteSpecificTrigger("masterTrigger");
        return;

    }

    // Round the real-time price to the nearest strike price increment
    var roundedPrice = (Math.floor(realTimePrice / strikePriceIncrement)) * strikePriceIncrement;
    
    // fetching securityId and tradeSymbol with the rounded price (OTM + 10)
    var strikeCall = roundedPrice + (strikePriceIncrement * 12);
    var strikePut = roundedPrice - (strikePriceIncrement * 12);

    var tradeSymbolCall = fetchTradeSymbol(indexNeo, "CE", strikeCall);
    var tradeSymbolPut = fetchTradeSymbol(indexNeo, "PE", strikePut);
    
    // placing order for FAR CALL
    
    var orderStatusCall = placeNeoOrder("B", exchangeSegmentNeo, "NRML", "MKT", doubleQuantity, tradeSymbolCall, "0");
      
      if (orderStatusCall) { 

        logMessage("CALL Buy order FAR completed.");

      } else {
          logMessage("CALL Buy order FAR failed.");
          sendMessage("CALL Buy order FAR failed.");
          return 'CALL BUY executed FAR failed!';
      }
    // placing order for FAR PUT

    var orderStatusPut = placeNeoOrder("B", exchangeSegmentNeo, "NRML", "MKT", doubleQuantity, tradeSymbolPut, "0");
      
      if (orderStatusPut) {

        logMessage("PUT Buy order FAR completed.");

      } else {
          logMessage("PUT Buy order FAR failed.");
          sendMessage("PUT Buy order FAR failed.");
          return 'PUT BUY executed FAR failed!';
      }
    
    
  if (orderStatusCall && orderStatusPut) {
    
    var securityIdCall = fetchSecurityId(indexNeo, "CE", strikeCall);
    var securityIdPut = fetchSecurityId(indexNeo, "PE", strikePut);

    var priceCall = getLTP(securityIdCall, optionSegment, optionInstrument);
    var pricePut = getLTP(securityIdPut, optionSegment, optionInstrument);

    // sheet.getRange("B19").setValue(securityIdCall); 
    // sheet.getRange("C19").setValue(tradeSymbolCall); 
    // sheet.getRange("D19").setValue(strikeCall); 
    // sheet.getRange("E19").setValue(priceCall); 
    sheet.getRange("B19:E19").setValues([[securityIdCall, tradeSymbolCall, strikeCall, priceCall]]);


    // sheet.getRange("B22").setValue(securityIdPut); 
    // sheet.getRange("C22").setValue(tradeSymbolPut); 
    // sheet.getRange("D22").setValue(strikePut); 
    // sheet.getRange("E22").setValue(pricePut); 
    sheet.getRange("B22:E22").setValues([[securityIdPut, tradeSymbolPut, strikePut, pricePut]]);


    logMessage("All FAR Buy order completed.");
    return {
        success: true,
        message: 'All CALL Far executed successfully!'
    };

  } else {
    logMessage("Something went wrong with FAR Buy order.");
    sendMessage("Something went wrong with FAR Buy order.");
     return {
        success: false,
        message: '🚨 Something went wrong with FAR Buy order!'
    };
  }
}
// Near SELL logic for 2 strike CALL & 2 Strike PUT

function enterSell(){

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("MASTER");
    // Get today's date
    var today = new Date();
    var dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, ..., 6 = Saturday

    var indexName, indexNeo, strikePriceIncrement, exchangeSecurityId, exchangeSegment, exchangeSegmentNeo, productType, exchangeInstrument, optionSegment, optionInstrument, quantity;
    
    switch (dayOfWeek) {
      case 5: // Monday
        indexName = "MIDCPNIFTY";
        indexNeo = "MIDCPNIFTY";
        strikePriceIncrement = "25";
        exchangeSecurityId = "442";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "50";
        break;
      case 1: // Tuesday
        indexName = "FINNIFTY";
        indexNeo = "FINNIFTY";
        strikePriceIncrement = "50";
        exchangeSecurityId = "27";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "25";
        break;
      case 2: // Wednesday
        indexName = "BANKNIFTY";
        indexNeo = "BANKNIFTY";
        strikePriceIncrement = "100";
        exchangeSecurityId = "25";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "15";
        break;
      case 3: // Thursday
        indexName = "NIFTY";
        indexNeo = "NIFTY";
        strikePriceIncrement = "50";
        exchangeSecurityId = "13";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "25";
        break;
      case 4: // Friday
        indexName = "SENSEX";
        indexNeo = "BSXOPT";
        strikePriceIncrement = "100";
        exchangeSecurityId = "51";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "bse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "BSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "10";
        break;
      default:

        logMessage("NEAR SELL: Today is not a trading day. Bye bye!");

        deleteSpecificTrigger("masterTrigger");
        return;
    }
    
    // multiplying with lot size
    var lotSize = sheet.getRange("B14").getValue();
    var quantity = quantity * lotSize;

    var realTimePrice = getLTP(exchangeSecurityId, exchangeSegment, exchangeInstrument);
    
    if (realTimePrice == false) {

        logMessage("NEAR SELL: Error fetching real-time price, examine the error logs.");
        sendMessage("NEAR SELL: Error fetching real-time price, examine the error logs.");
        deleteSpecificTrigger("masterTrigger");
        return;

    }

    // Round the real-time price to the nearest strike price increment
    var roundedPrice = (Math.floor(realTimePrice / strikePriceIncrement)) * strikePriceIncrement;
    
    // fetching securityId and tradeSymbol with the rounded price (OTM)
    var strikeCallOne = roundedPrice + (strikePriceIncrement * 3);
    var strikeCallTwo = roundedPrice + (strikePriceIncrement * 4);

    var strikePutOne = roundedPrice - (strikePriceIncrement * 3);
    var strikePutTwo = roundedPrice - (strikePriceIncrement * 4);

    var tradeSymbolCallOne = fetchTradeSymbol(indexNeo, "CE", strikeCallOne);
    var tradeSymbolCallTwo = fetchTradeSymbol(indexNeo, "CE", strikeCallTwo);

    var tradeSymbolPutOne = fetchTradeSymbol(indexNeo, "PE", strikePutOne);
    var tradeSymbolPutTwo = fetchTradeSymbol(indexNeo, "PE", strikePutTwo);
    
    // placing order for CALL selling
    
    var orderStatusCallOne = placeNeoOrder("S", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolCallOne, "0");
    var orderStatusCallTwo = placeNeoOrder("S", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolCallTwo, "0");

      // placing order for PUT selling
    
    var orderStatusPutOne = placeNeoOrder("S", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolPutOne, "0");
    var orderStatusPutTwo = placeNeoOrder("S", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolPutTwo, "0");

    
  if (orderStatusCallOne && orderStatusCallTwo && orderStatusPutOne && orderStatusPutTwo) {
    
    var securityIdCallOne = fetchSecurityId(indexNeo, "CE", strikeCallOne);
    var securityIdCallTwo = fetchSecurityId(indexNeo, "CE", strikeCallTwo);
    var securityIdPutOne = fetchSecurityId(indexNeo, "PE", strikePutOne);
    var securityIdPutTwo = fetchSecurityId(indexNeo, "PE", strikePutTwo);

    // var priceCallOne = getLTP(securityIdCallOne, optionSegment, optionInstrument);
    // var priceCallTwo = getLTP(securityIdCallTwo, optionSegment, optionInstrument);
    // var pricePutOne = getLTP(securityIdPutOne, optionSegment, optionInstrument);
    // var pricePutTwo = getLTP(securityIdPutTwo, optionSegment, optionInstrument);

    var priceData = getMultiLTP([securityIdCallOne, securityIdCallTwo, securityIdPutOne, securityIdPutTwo], optionSegment);
    // Extract prices into separate variables
    var priceCallOne = priceData[securityIdCallOne] || null;
    var priceCallTwo = priceData[securityIdCallTwo] || null;
    var pricePutOne = priceData[securityIdPutOne] || null;
    var pricePutTwo = priceData[securityIdPutTwo] || null;

    // sheet.getRange("B20").setValue(securityIdCallOne); 
    // sheet.getRange("C20").setValue(tradeSymbolCallOne); 
    // sheet.getRange("D20").setValue(strikeCallOne); 
    // sheet.getRange("E20").setValue(priceCallOne); 
    
    sheet.getRange("B20:E20").setValues([[
      securityIdCallOne, 
      tradeSymbolCallOne, 
      strikeCallOne, 
      priceCallOne
    ]]);


    // sheet.getRange("B21").setValue(securityIdCallTwo); 
    // sheet.getRange("C21").setValue(tradeSymbolCallTwo); 
    // sheet.getRange("D21").setValue(strikeCallTwo); 
    // sheet.getRange("E21").setValue(priceCallTwo);
    
    sheet.getRange("B21:E21").setValues([[
      securityIdCallTwo, 
      tradeSymbolCallTwo, 
      strikeCallTwo, 
      priceCallTwo
    ]]);

    // sheet.getRange("B23").setValue(securityIdPutOne); 
    // sheet.getRange("C23").setValue(tradeSymbolPutOne); 
    // sheet.getRange("D23").setValue(strikePutOne); 
    // sheet.getRange("E23").setValue(pricePutOne); 
    
    sheet.getRange("B23:E23").setValues([[
      securityIdPutOne, 
      tradeSymbolPutOne, 
      strikePutOne, 
      pricePutOne
    ]]);


    // sheet.getRange("B24").setValue(securityIdPutTwo); 
    // sheet.getRange("C24").setValue(tradeSymbolPutTwo); 
    // sheet.getRange("D24").setValue(strikePutTwo); 
    // sheet.getRange("E24").setValue(pricePutTwo); 

    sheet.getRange("B24:E24").setValues([[
      securityIdPutTwo, 
      tradeSymbolPutTwo, 
      strikePutTwo, 
      pricePutTwo
    ]]);


    logMessage("All NEAR Sell order completed.");
    return {
        success: true,
        message: 'All NEAR Sell executed successfully!'
    };

  } else {
    logMessage("Something went wrong with NEAR Sell order.");
    sendMessage("Something went wrong with NEAR Sell order.");
    return {
        success: false,
        message: '🚨 Something went wrong with NEAR Sell order!'
    };
  }
}

function exitSell() {

  logMessage("Square off is Initiated.");
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("MASTER");
    // Get today's date
    var today = new Date();
    var dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, ..., 6 = Saturday

    var indexName, indexNeo, strikePriceIncrement, exchangeSecurityId, exchangeSegment, exchangeSegmentNeo, productType, exchangeInstrument, optionSegment, optionInstrument, quantity;
    
    switch (dayOfWeek) {
      case 5: // Monday
        indexName = "MIDCPNIFTY";
        indexNeo = "MIDCPNIFTY";
        strikePriceIncrement = "25";
        exchangeSecurityId = "442";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "50";
        break;
      case 1: // Tuesday
        indexName = "FINNIFTY";
        indexNeo = "FINNIFTY";
        strikePriceIncrement = "50";
        exchangeSecurityId = "27";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "25";
        break;
      case 2: // Wednesday
        indexName = "BANKNIFTY";
        indexNeo = "BANKNIFTY";
        strikePriceIncrement = "100";
        exchangeSecurityId = "25";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "15";
        break;
      case 3: // Thursday
        indexName = "NIFTY";
        indexNeo = "NIFTY";
        strikePriceIncrement = "50";
        exchangeSecurityId = "13";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "25";
        break;
      case 4: // Friday
        indexName = "SENSEX";
        indexNeo = "BSXOPT";
        strikePriceIncrement = "100";
        exchangeSecurityId = "51";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "bse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "BSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "10";
        break;
      default:

        logMessage("Today is not a trading day. Bye bye!");

        deleteSpecificTrigger("masterTrigger");
        return;
    }
    
    // multiplying with lot size
    var lotSize = sheet.getRange("B14").getValue();
    var quantity = quantity * lotSize;
    
    // SQUARE OFF and Erase CALL data.
    // var tradeSymbolCallOne = sheet.getRange("C20").getValue();
    // var tradeSymbolCallTwo = sheet.getRange("C21").getValue(); 
    var tradeSymbols = sheet.getRange("C20:C21").getValues();
    var tradeSymbolCallOne = tradeSymbols[0][0]; // Value from C20
    var tradeSymbolCallTwo = tradeSymbols[1][0]; // Value from C21


    if (tradeSymbolCallOne) {

      var orderStatusCallOne = placeNeoOrder("B", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolCallOne, "0");
      
      if (orderStatusCallOne) { 

          // sheet.getRange("B20").setValue(''); 
          // sheet.getRange("C20").setValue(''); 
          // sheet.getRange("D20").setValue(''); 
          // sheet.getRange("E20").setValue('');
          
          sheet.getRange("B20:E20").setValues([['', '', '', '']]);


        logMessage("CALL Exit Sell order ONE completed.");

      } else {
          logMessage("CALL Exit Sell order ONE failed.");
          sendMessage("CALL Exit Sell order ONE failed.");
          return '🚨 CALL Exit Sell executed ONE failed!';
      }
    }
    if (tradeSymbolCallTwo) {
      
      var orderStatusCallTwo = placeNeoOrder("B", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolCallTwo, "0");
      
      if (orderStatusCallTwo) { 

            // sheet.getRange("B21").setValue(''); 
            // sheet.getRange("C21").setValue(''); 
            // sheet.getRange("D21").setValue(''); 
            // sheet.getRange("E21").setValue(''); 

            sheet.getRange("B21:E21").setValues([['', '', '', '']]);


        logMessage("CALL Exit Sell order TWO completed.");

      } else {
          logMessage("CALL Exit Sell order TWO failed.");
          sendMessage("CALL Exit Sell order TWO failed.");
          return '🚨 CALL Exit Sell executed TWO failed!';
      }
      
    }


    // SQUARE OFF and Erase PUT data.
    // var tradeSymbolPutOne = sheet.getRange("C23").getValue(); 
    // var tradeSymbolPutTwo = sheet.getRange("C24").getValue(); 
    var tradeSymbols = sheet.getRange("C23:C24").getValues();
    var tradeSymbolPutOne = tradeSymbols[0][0]; // Value from C23
    var tradeSymbolPutTwo = tradeSymbols[1][0]; // Value from C24


    if (tradeSymbolPutOne) {

      var orderStatusPutOne = placeNeoOrder("B", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolPutOne, "0");
      
      if (orderStatusPutOne) { 

          // sheet.getRange("B23").setValue(''); 
          // sheet.getRange("C23").setValue(''); 
          // sheet.getRange("D23").setValue(''); 
          // sheet.getRange("E23").setValue(''); 

          sheet.getRange("B23:E23").setValues([['', '', '', '']]);


        logMessage("PUT Exit Sell order ONE completed.");

      } else {
          logMessage("PUT Exit Sell order ONE failed.");
          sendMessage("PUT Exit Sell order ONE failed.");
          return '🚨 PUT Exit Sell executed ONE failed!';
      }
    }
    if (tradeSymbolPutTwo) {
      
      var orderStatusPutTwo = placeNeoOrder("B", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolPutTwo, "0");
      
      if (orderStatusPutTwo) { 

          // sheet.getRange("B24").setValue(''); 
          // sheet.getRange("C24").setValue(''); 
          // sheet.getRange("D24").setValue(''); 
          // sheet.getRange("E24").setValue(''); 

          sheet.getRange("B24:E24").setValues([['', '', '', '']]);


        logMessage("PUT Exit Sell order TWO completed.");

      } else {
          logMessage("PUT Exit Sell order TWO failed.");
          sendMessage("PUT Exit Sell order TWO failed.");
          return '🚨 PUT Exit Sell executed TWO failed!';
      }
      
    }
    
    // FINAL CHECK
    // var tradeSymbolCallOne = sheet.getRange("C20").getValue();
    // var tradeSymbolCallTwo = sheet.getRange("C21").getValue(); 
    // var tradeSymbolPutOne = sheet.getRange("C23").getValue(); 
    // var tradeSymbolPutTwo = sheet.getRange("C24").getValue(); 
    
    var tradeSymbols = sheet.getRange("C20:C24").getValues();
    var tradeSymbolCallOne = tradeSymbols[0][0]; // C20
    var tradeSymbolCallTwo = tradeSymbols[1][0]; // C21
    var tradeSymbolPutOne = tradeSymbols[3][0];  // C23
    var tradeSymbolPutTwo = tradeSymbols[4][0];  // C24


    if (!tradeSymbolCallOne && !tradeSymbolCallTwo && !tradeSymbolPutOne && !tradeSymbolPutTwo) {
        /// integrate the following into existing code.
      logMessage("Exit Sell Completed");
      return {
        success: true,
        message: 'Exit Sell executed successfully!'
      };
    } else {
      logMessage("Something went wrong with Exit Sell order.");
      sendMessage("Something went wrong with Exit Sell order.");
      return {
        success: false,
        message: '🚨 Something went wrong with Exit Sell order!'
      };
    }
}

function exitBuy() {

  logMessage("EXIT Buy is Initiated.");
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("MASTER");
    // Get today's date
    var today = new Date();
    var dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, ..., 6 = Saturday

    var indexName, indexNeo, strikePriceIncrement, exchangeSecurityId, exchangeSegment, exchangeSegmentNeo, productType, exchangeInstrument, optionSegment, optionInstrument, quantity;
    
    switch (dayOfWeek) {
      case 5: // Monday
        indexName = "MIDCPNIFTY";
        indexNeo = "MIDCPNIFTY";
        strikePriceIncrement = "25";
        exchangeSecurityId = "442";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "50";
        break;
      case 1: // Tuesday
        indexName = "FINNIFTY";
        indexNeo = "FINNIFTY";
        strikePriceIncrement = "50";
        exchangeSecurityId = "27";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "25";
        break;
      case 2: // Wednesday
        indexName = "BANKNIFTY";
        indexNeo = "BANKNIFTY";
        strikePriceIncrement = "100";
        exchangeSecurityId = "25";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "15";
        break;
      case 3: // Thursday
        indexName = "NIFTY";
        indexNeo = "NIFTY";
        strikePriceIncrement = "50";
        exchangeSecurityId = "13";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "25";
        break;
      case 4: // Friday
        indexName = "SENSEX";
        indexNeo = "BSXOPT";
        strikePriceIncrement = "100";
        exchangeSecurityId = "51";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "bse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "BSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "10";
        break;
      default:

        logMessage("Today is not a trading day. Bye bye!");

        deleteSpecificTrigger("masterTrigger");
        return;
    }
    
    // multiplying with lot size
    var lotSize = sheet.getRange("B14").getValue();
    var quantity = quantity * lotSize;
    var doubleQuantity = quantity * 2;
    
    // SQUARE OFF and Erase CALL data.
    var tradeSymbolCallOne = sheet.getRange("C19").getValue();

    if (tradeSymbolCallOne) {

      var orderStatusCallOne = placeNeoOrder("S", exchangeSegmentNeo, "NRML", "MKT", doubleQuantity, tradeSymbolCallOne, "0");
      
      if (orderStatusCallOne) { 

          // sheet.getRange("B19").setValue(''); 
          // sheet.getRange("C19").setValue(''); 
          // sheet.getRange("D19").setValue(''); 
          // sheet.getRange("E19").setValue('');

          sheet.getRange("B19:E19").setValues([['', '', '', '']]);


        logMessage("CALL Square-off order ONE completed.");

      } else {
          logMessage("CALL Exit Buy order ONE failed.");
          sendMessage("CALL Exit Buy order ONE failed.");
          return '🚨 CALL Exit Buy executed ONE failed!';
      }
    }      

    // SQUARE OFF and Erase PUT data.
    var tradeSymbolPutOne = sheet.getRange("C22").getValue();  

    if (tradeSymbolPutOne) {

      var orderStatusPutOne = placeNeoOrder("S", exchangeSegmentNeo, "NRML", "MKT", doubleQuantity, tradeSymbolPutOne, "0");
      
      if (orderStatusPutOne) { 

          // sheet.getRange("B22").setValue(''); 
          // sheet.getRange("C22").setValue(''); 
          // sheet.getRange("D22").setValue(''); 
          // sheet.getRange("E22").setValue(''); 

          sheet.getRange("B22:E22").setValues([['', '', '', '']]);


        logMessage("PUT Exit Buy order ONE completed.");

      } else {
          logMessage("PUT Exit Buy order ONE failed.");
          sendMessage("PUT Exit Buy order ONE failed.");
          return '🚨 PUT Exit Buy executed ONE failed!';
      }
    }

    // FINAL CHECK
    // var tradeSymbolCallOne = sheet.getRange("C19").getValue();
    // var tradeSymbolPutOne = sheet.getRange("C22").getValue(); 

    var tradeSymbols = sheet.getRange("C19:C22").getValues();
    var tradeSymbolCallOne = tradeSymbols[0][0]; // Value from C19
    var tradeSymbolPutOne = tradeSymbols[3][0]; // Value from C22


    if (!tradeSymbolCallOne &&!tradeSymbolPutOne) {
        /// integrate the following into existing code.
      logMessage("Exit Buy Completed");
      return {
        success: true,
        message: 'Exit Buy executed successfully!'
      };

    } else {
      logMessage("Something went wrong with Exit Buy order.");
      sendMessage("Something went wrong with Exit Buy order.");
      return {
        success: false,
        message: '🚨 Something went wrong with Exit Buy order!'
      };
    }
}

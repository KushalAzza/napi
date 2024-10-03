function callBuy() {
    logMessage("CALL Buy is Initiated.");
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("MASTER");
    // Get today's date
    var today = new Date();
    var dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, ..., 6 = Saturday

    var indexName, indexNeo, strikePriceIncrement, exchangeSecurityId, exchangeSegment, exchangeSegmentNeo, productType, exchangeInstrument, optionSegment, optionInstrument, quantity;
    
    switch (dayOfWeek) {
      case 1: // Monday
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
      case 2: // Tuesday
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
      case 3: // Wednesday
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
      case 4: // Thursday
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
      case 5: // Friday
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

        logMessage("SHORT ORDER: Today is not a trading day. Bye bye!");

        deleteSpecificTrigger("masterTrigger");
        return;
    }
    
    // multiplying with lot size
    var lotSize = sheet.getRange("B1").getValue();
    var quantity = quantity * lotSize;
    var doubleQuantity = quantity * 2;

    var realTimePrice = getLTP(exchangeSecurityId, exchangeSegment, exchangeInstrument);
    
    if (realTimePrice == false) {

        logMessage("CALL BUY: Error fetching real-time price, examine the error logs.");
        sendMessage("CALL BUY: Error fetching real-time price, examine the error logs.");
        deleteSpecificTrigger("masterTrigger");
        return;

    }

    // Round the real-time price to the nearest strike price increment
    var roundedPrice = (Math.floor(realTimePrice / strikePriceIncrement)) * strikePriceIncrement;
    
    // fetching securityId and tradeSymbol with the rounded price (ITM)
    var strikeOne = roundedPrice - (strikePriceIncrement * 1);
    var strikeTwo = roundedPrice - (strikePriceIncrement * 2);
    var strikeThree = roundedPrice - (strikePriceIncrement * 3);

    var tradeSymbolOne = fetchTradeSymbol(indexNeo, "CE", strikeOne);
    var tradeSymbolTwo = fetchTradeSymbol(indexNeo, "CE", strikeTwo);
    var tradeSymbolThree = fetchTradeSymbol(indexNeo, "CE", strikeThree);
    
    // placing order for CALL
    
    var orderStatusOne = placeNeoOrder("B", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolOne, "0");
      
      if (orderStatusOne) { 

        logMessage("CALL Buy order ONE completed.");

      } else {
          logMessage("CALL Buy order ONE failed.");
          sendMessage("CALL Buy order ONE failed.");
          return '🚨 CALL BUY executed ONE failed!';
      }

    var orderStatusTwo = placeNeoOrder("B", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolTwo, "0");
      
      if (orderStatusTwo) {

        logMessage("CALL Buy order TWO completed.");

      } else {
          logMessage("CALL Buy order TWO failed.");
          sendMessage("CALL Buy order TWO failed.");
          return '🚨 CALL BUY executed TWO failed!';
      }
    
    var orderStatusThree = placeNeoOrder("B", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolThree, "0");
      
      if (orderStatusThree) {

        logMessage("CALL Buy order THREE completed.");

      } else {
          logMessage("CALL Buy order THREE failed.");
          sendMessage("CALL Buy order THREE failed.");
          return '🚨 CALL BUY executed THREE failed!';
      }
  if (orderStatusOne && orderStatusTwo && orderStatusThree) {
    
    var securityIdOne = fetchSecurityId(indexNeo, "CE", strikeOne);
    var securityIdTwo = fetchSecurityId(indexNeo, "CE", strikeTwo);
    var securityIdThree = fetchSecurityId(indexNeo, "CE", strikeThree);

    var priceOne = getLTP(securityIdOne, optionSegment, optionInstrument);
    var priceTwo = getLTP(securityIdTwo, optionSegment, optionInstrument);
    var priceThree = getLTP(securityIdThree, optionSegment, optionInstrument);
    

    sheet.getRange("B6").setValue(securityIdOne); 
    sheet.getRange("C6").setValue(tradeSymbolOne); 
    sheet.getRange("D6").setValue(strikeOne); 
    sheet.getRange("E6").setValue(priceOne); 

    sheet.getRange("B7").setValue(securityIdTwo); 
    sheet.getRange("C7").setValue(tradeSymbolTwo); 
    sheet.getRange("D7").setValue(strikeTwo); 
    sheet.getRange("E7").setValue(priceTwo); 

    sheet.getRange("B8").setValue(securityIdThree); 
    sheet.getRange("C8").setValue(tradeSymbolThree); 
    sheet.getRange("D8").setValue(strikeThree); 
    sheet.getRange("E8").setValue(priceThree); 

    logMessage("All CALL Buy order completed.");
    return 'All CALL BUY executed successfully!';

  } else {
    logMessage("Something went wrong with CALL Buy order.");
    sendMessage("Something went wrong with CALL Buy order.");
    return '🚨 Something went wrong with CALL Buy order!';
  }
}

function putBuy() {
      logMessage("PUT Buy is Initiated.");
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("MASTER");
    // Get today's date
    var today = new Date();
    var dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, ..., 6 = Saturday

    var indexName, indexNeo, strikePriceIncrement, exchangeSecurityId, exchangeSegment, exchangeSegmentNeo, productType, exchangeInstrument, optionSegment, optionInstrument, quantity;
    
    switch (dayOfWeek) {
      case 1: // Monday
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
      case 2: // Tuesday
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
      case 3: // Wednesday
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
      case 4: // Thursday
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
      case 5: // Friday
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

        logMessage("SHORT ORDER: Today is not a trading day. Bye bye!");

        deleteSpecificTrigger("masterTrigger");
        return;
    }
    
    // multiplying with lot size
    var lotSize = sheet.getRange("B1").getValue();
    var quantity = quantity * lotSize;
    var doubleQuantity = quantity * 2;

    var realTimePrice = getLTP(exchangeSecurityId, exchangeSegment, exchangeInstrument);
    
    if (realTimePrice == false) {

        logMessage("PUT BUY: Error fetching real-time price, examine the error logs.");
        sendMessage("PUT BUY: Error fetching real-time price, examine the error logs.");
        deleteSpecificTrigger("masterTrigger");
        return;

    }

    // Round the real-time price to the nearest strike price increment
    var roundedPrice = (Math.floor(realTimePrice / strikePriceIncrement)) * strikePriceIncrement;
    
    // fetching securityId and tradeSymbol with the rounded price (ITM)
    var strikeOne = roundedPrice + (strikePriceIncrement * 1);
    var strikeTwo = roundedPrice + (strikePriceIncrement * 2);
    var strikeThree = roundedPrice + (strikePriceIncrement * 3);

    var tradeSymbolOne = fetchTradeSymbol(indexNeo, "PE", strikeOne);
    var tradeSymbolTwo = fetchTradeSymbol(indexNeo, "PE", strikeTwo);
    var tradeSymbolThree = fetchTradeSymbol(indexNeo, "PE", strikeThree);
    
    // placing orders for PUT at different strikes
    
    var orderStatusOne = placeNeoOrder("B", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolOne, "0");
      
      if (orderStatusOne) { 

        logMessage("PUT Buy order ONE completed.");

      } else {
          logMessage("PUT Buy order ONE failed.");
          sendMessage("PUT Buy order ONE failed.");
          return '🚨 PUT BUY executed ONE failed!';
      }

    var orderStatusTwo = placeNeoOrder("B", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolTwo, "0");
      
      if (orderStatusTwo) {

        logMessage("PUT Buy order TWO completed.");

      } else {
          logMessage("PUT Buy order TWO failed.");
          sendMessage("PUT Buy order TWO failed.");
          return '🚨 PUT BUY executed TWO failed!';
      }
    
    var orderStatusThree = placeNeoOrder("B", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolThree, "0");
      
      if (orderStatusThree) {

        logMessage("PUT Buy order THREE completed.");

      } else {
          logMessage("PUT Buy order THREE failed.");
          sendMessage("PUT Buy order THREE failed.");
          return '🚨 PUT BUY executed THREE failed!';
      }
  if (orderStatusOne && orderStatusTwo && orderStatusThree) {
    
    var securityIdOne = fetchSecurityId(indexNeo, "PE", strikeOne);
    var securityIdTwo = fetchSecurityId(indexNeo, "PE", strikeTwo);
    var securityIdThree = fetchSecurityId(indexNeo, "PE", strikeThree);

    var priceOne = getLTP(securityIdOne, optionSegment, optionInstrument);
    var priceTwo = getLTP(securityIdTwo, optionSegment, optionInstrument);
    var priceThree = getLTP(securityIdThree, optionSegment, optionInstrument);
    

    sheet.getRange("B9").setValue(securityIdOne); 
    sheet.getRange("C9").setValue(tradeSymbolOne); 
    sheet.getRange("D9").setValue(strikeOne); 
    sheet.getRange("E9").setValue(priceOne); 

    sheet.getRange("B10").setValue(securityIdTwo); 
    sheet.getRange("C10").setValue(tradeSymbolTwo); 
    sheet.getRange("D10").setValue(strikeTwo); 
    sheet.getRange("E10").setValue(priceTwo); 

    sheet.getRange("B11").setValue(securityIdThree); 
    sheet.getRange("C11").setValue(tradeSymbolThree); 
    sheet.getRange("D11").setValue(strikeThree); 
    sheet.getRange("E11").setValue(priceThree); 

    logMessage("All PUT Buy order completed.");
    return 'All PUT BUY executed successfully!';

  } else {
    logMessage("Something went wrong with PUT Buy order.");
    sendMessage("Something went wrong with PUT Buy order.");
    return '🚨 Something went wrong with PUT Buy order!';
  }
}

function squareOff() {

    logMessage("Square off is Initiated.");
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("MASTER");
    // Get today's date
    var today = new Date();
    var dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, ..., 6 = Saturday

    var indexName, indexNeo, strikePriceIncrement, exchangeSecurityId, exchangeSegment, exchangeSegmentNeo, productType, exchangeInstrument, optionSegment, optionInstrument, quantity;
    
    switch (dayOfWeek) {
      case 1: // Monday
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
      case 2: // Tuesday
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
      case 3: // Wednesday
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
      case 4: // Thursday
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
      case 5: // Friday
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

        logMessage("SHORT ORDER: Today is not a trading day. Bye bye!");
        deleteSpecificTrigger("masterTrigger");
        return;
    }
    
    // multiplying with lot size
    var lotSize = sheet.getRange("B1").getValue();
    var quantity = quantity * lotSize;
    var doubleQuantity = quantity * 2;
    
    // SQUARE OFF and Erase CALL data.
    var tradeSymbolCallOne = sheet.getRange("C6").getValue();
    var tradeSymbolCallTwo = sheet.getRange("C7").getValue(); 
    var tradeSymbolCallThree = sheet.getRange("C8").getValue(); 

    if (tradeSymbolCallOne) {

      var orderStatusCallOne = placeNeoOrder("S", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolCallOne, "0");
      
      if (orderStatusCallOne) { 

          sheet.getRange("B6").setValue(''); 
          sheet.getRange("C6").setValue(''); 
          sheet.getRange("D6").setValue(''); 
          sheet.getRange("E6").setValue('');
        logMessage("CALL Square-off order ONE completed.");

      } else {
          logMessage("CALL Square-off order ONE failed.");
          sendMessage("CALL Square-off order ONE failed.");
          return '🚨 CALL Square-off executed ONE failed!';
      }
    }
    if (tradeSymbolCallTwo) {
      
      var orderStatusCallTwo = placeNeoOrder("S", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolCallTwo, "0");
      
      if (orderStatusCallTwo) { 

            sheet.getRange("B7").setValue(''); 
            sheet.getRange("C7").setValue(''); 
            sheet.getRange("D7").setValue(''); 
            sheet.getRange("E7").setValue(''); 
        logMessage("CALL Square-off order TWO completed.");

      } else {
          logMessage("CALL Square-off order TWO failed.");
          sendMessage("CALL Square-off order TWO failed.");
          return '🚨 CALL Square-off executed TWO failed!';
      }
      
    }
    if (tradeSymbolCallThree) {
      
      var orderStatusCallThree = placeNeoOrder("S", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolCallThree, "0");
      
      if (orderStatusCallThree) { 
          sheet.getRange("B8").setValue(''); 
          sheet.getRange("C8").setValue(''); 
          sheet.getRange("D8").setValue(''); 
          sheet.getRange("E8").setValue(''); 
        logMessage("CALL Square-off order THREE completed.");

      } else {
          logMessage("CALL Square-off order THREE failed.");
          sendMessage("CALL Square-off order THREE failed.");
          return '🚨 CALL Square-off executed THREE failed!';
      }
      
    }

    // SQUARE OFF and Erase PUT data.
    var tradeSymbolPutOne = sheet.getRange("C9").getValue(); 
    var tradeSymbolPutTwo = sheet.getRange("C10").getValue(); 
    var tradeSymbolPutThree = sheet.getRange("C11").getValue(); 

    if (tradeSymbolPutOne) {

      var orderStatusPutOne = placeNeoOrder("S", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolPutOne, "0");
      
      if (orderStatusPutOne) { 

          sheet.getRange("B9").setValue(''); 
          sheet.getRange("C9").setValue(''); 
          sheet.getRange("D9").setValue(''); 
          sheet.getRange("E9").setValue(''); 
        logMessage("PUT Square-off order ONE completed.");

      } else {
          logMessage("PUT Square-off order ONE failed.");
          sendMessage("PUT Square-off order ONE failed.");
          return '🚨 PUT Square-off executed ONE failed!';
      }
    }
    if (tradeSymbolPutTwo) {
      
      var orderStatusPutTwo = placeNeoOrder("S", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolPutTwo, "0");
      
      if (orderStatusPutTwo) { 

          sheet.getRange("B10").setValue(''); 
          sheet.getRange("C10").setValue(''); 
          sheet.getRange("D10").setValue(''); 
          sheet.getRange("E10").setValue(''); 
        logMessage("PUT Square-off order TWO completed.");

      } else {
          logMessage("PUT Square-off order TWO failed.");
          sendMessage("PUT Square-off order TWO failed.");
          return '🚨 PUT Square-off executed TWO failed!';
      }
      
    }
    if (tradeSymbolPutThree) {
      
      var orderStatusPutThree = placeNeoOrder("S", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolPutThree, "0");
      
      if (orderStatusPutThree) { 

          sheet.getRange("B11").setValue(''); 
          sheet.getRange("C11").setValue(''); 
          sheet.getRange("D11").setValue(''); 
          sheet.getRange("E11").setValue(''); 
        logMessage("PUT Square-off order THREE completed.");

      } else {
          logMessage("PUT Square-off order THREE failed.");
          sendMessage("PUT Square-off order THREE failed.");
          return '🚨 PUT Square-off executed THREE failed!';
      }
      
    }

    // FINAL CHECK
    var tradeSymbolCallOne = sheet.getRange("C6").getValue();
    var tradeSymbolCallTwo = sheet.getRange("C7").getValue(); 
    var tradeSymbolCallThree = sheet.getRange("C8").getValue(); 
    var tradeSymbolPutOne = sheet.getRange("C9").getValue(); 
    var tradeSymbolPutTwo = sheet.getRange("C10").getValue(); 
    var tradeSymbolPutThree = sheet.getRange("C11").getValue(); 

    if (!tradeSymbolCallOne && !tradeSymbolCallTwo && !tradeSymbolCallThree && !tradeSymbolPutOne && !tradeSymbolPutTwo && !tradeSymbolPutThree) {
        /// integrate the following into existing code.
      logMessage("Square Off Completed");
      return 'SQUARE OFF executed successfully!';
    } else {
      logMessage("Something went wrong with Square-off order.");
      sendMessage("Something went wrong with Square-off order.");
      return '🚨 Something went wrong with Square-off order!';
    }

}

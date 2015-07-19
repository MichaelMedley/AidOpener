
//<![CDATA[


/* MISCELLANEOUS MEMOS
  MEMO ABOUT making rows and columns be hidden and shown by clicking
  This uses Javascript's getElementById() method.
  Every cell in the arrayMaster is assigned an id of the form "'id'+rowNo + '-' + 'featureNo". 
  Such ids can clearly be constructed programatically.
  Hence the programme can generate the ids of button elements and the elements that are going to be hidden and shown
  and general functions can be written to make these buttons work.

*/

//Declare global variables and assign initial values to them, where this can be done simply
//Values given are either values that will not be changed during the running of the script OR empty values 0 or "" to indicate if the variable is for an integer or a string			

var arrayBlankFields = [];
//var arrayCellsToRecolour = [];	
var arrayFeatures = [];						// the array for storing names of 'features' (i.e. tags and attributes from the xml file) and other attributes for the columns of the display table
var arrayForHierarchyCssValues = [
    ["0", "#FFFFCC", "#FFFFAA", "900"],
    ["1", "#FF9966", "#FF6633", "900"],
    ["2", "#FFCC99", "#FFAA55", "500"],
    ["3", "#FFFFCC", "#FFFFAA", "300"]
];

/*About arrayButtons
 * Each button is identified by (1) its group and (2) its position in the group
 * Pressing a button causes not only its own actions but the reversal of the actions performed by the last pressed button in that group
 * In arrayButtons[a][b][c], 
        * a is the group
        * b is the position in the group (except that "0" here denotes attributes from the last-pressed button)
        * c indicates different attributes: 
                * "0" is for the id of the button
                * "1" is for the text on the button when it is pressed
                * "2" is for the text on the button when it is released (not pressed)
                * "3" is for the id of the div which is shown when the button is pressed but not shown when it is released
                
 */
var arrayButtons = [
    [""],
    [
        ["idSettingsButtonG1N1", "Original", "Original", ""],
        ["idSettingsButtonG1N1", "Original", "Original", ""],
        ["idSettingsButtonG1N2", "By IATI ID No", "By IATI ID No", ""],
        ["idSettingsButtonG1N3", "By title", "By title", ""],
        ["idSettingsButtonG1N4", "By receiver of money", "By receiver of money", ""]
    ],
    [
        ["", "", "", ""],
        ["idSettingsButtonG2N1", "Hide detailed options", "Show detailed options", "idForHideableTextInColumnSelectorDataBox"]
    ],
    [
        ["idSettingsButtonG3N1", "Fetch an activity file<br>from the IATI Datastore", "Fetch an activity file<br>from the IATI Datastore", "idSelectionOfCurrentIatiDataset"],
        ["idSettingsButtonG3N1", "Fetch an activity file<br>from the IATI Datastore", "Fetch an activity file<br>from the IATI Datastore", "idSelectionOfCurrentIatiDataset"],
        ["idSettingsButtonG3N2", "Choose a <br>stock file", "Choose a <br>stock file", "idSelectionOfStockFile"],
        ["idSettingsButtonG3N3", "Input XML file by<br>copy and paste", "Input XML file by<br>copy and paste", "idInputtingOfFileAsText"],
        ["idSettingsButtonG3N4", "Get data by querying<br>the IATI Datastore", "Get data by querying<br>the IATI Datastore", "idQueryingTheDatastore"]
    ],
    [
        ["idSettingsButtonG4N1", "Useful set #1", "Useful set #1", ""],
        ["idSettingsButtonG4N1", "Useful set #1", "Useful set #1", ""],
        ["idSettingsButtonG4N2", "All columns with variable contents", "All columns with variable contents", ""],
    ]
];
var arrayHomogenousFeatures = [];
var arrayMaster = [];
var arrayConvertTableRowNoToMasterRowNo = [];		        				// the array where the bulk of table data is stored
var arrayNonblankHomogenousFields = [];
//var arrayOfReportingOrgsFresh = [[],[],[0]];
var arrayOfReportingOrgsFresh = [["Code", "Name", 0]];
var arrayReceiverOrgsInAnIatiActivity = [];

var arraySelectedRowNos = [];
var arrayTransactionDatesInAnIatiActivity = [];
var arrayUnrecognizedTagStrings = [];

var batchNo = 0;
var standardBatchSize = 100;
var colourForBlankAreasInTable = "#999399";
var columnSelectionFormHtml = "";
var commitmentAmount = 0;
var currentLevel1Child = "";
var currentLevel1Children = "";
var defaultCurrency = "";
var extraRowNo = 0;
var featureName = "";
var featureNoForHierarchy;
var featureString = "";
var fetchType = "";
var formOutputSpace = "";
var generatedDatetime = "";
var highestNoOfExtraRowNosForRecentIatiActivity = 0;
var htmlForHomogeneityReport = "";
var htmlForListOfBlankFields = "";
var htmlForTableOfFieldsWithHamogenousNonblankValues = "";
var iatiActivities = "";
var iatiActivity = "";
var iatiActivityNo = 0;
var level1ChildNo = 0;
var linkedColor = "";
var mainTableHtmlString = "";
var mixedCurrencies = "";
var noOfActivityRecordsInFileToFetch = 0;
var noOfIatiActivities = 0;
var noOfFeatures = 0;
var noOfRows = 0;
var noOfRowsPerLayer = 0;
var noOfRowsProcessed = 0;

var rowNo = 0;
//var runningCountForTableWidth = 0;
var runningTotalSpend = 0;
var scrollbarWidth = 0;
var spendingAmount = 0;
var standardPauseTime = 0;
var timeToStop = "";
var transactionCurrency = "";
var transactionValue = 0;
var transactionType = "";
var valueToDisplay = "";
var xmlDoc = "";



/*OVERVIEW OF FUNCTIONS
    //Note: It does not seem practical to have a central controlling function because (1)... (2) we try to maintain control during long functions by making one function trigger another after a setTimeout() 
    // Primary functions are arranged in order of execution
    // Any function used exclusively to serve another function is written close underneath it
    // Utility functions used to serve more than one other function are written at the end of the functions section.
    
    
    fnIncludeBannerAndCreateTabs()
    fnBuildSourceDataSelectionUI()
        onclick -> fnLoadLocalXmlFile()
        onclick -> fnFetchXmlDataFromRemoteSite()
    fnGetGoing
        
    fnCopyDataFromXmlFileToArrayMaster
        fnTakeValueOfL2FieldForInterpretiveField(fieldValue)
        fnPushValueIntoArrayIfItIsNotThereAlready(array, value)
        fnProcessValuesForInterpretiveFieldsAtEndOfL1Child(currentLevel1Child)
        fnProcessValuesForInterpretiveFieldsAtEndOfIatiActivity(rowNo)
        fnGetFeatureNoMatchingAString(string)
        fnPutChildrenOfAnElementIntoMasterArray(element)
        fnPutAttributesOfAnElementIntoMasterArray(element, featureName)
    fnReportAndSubtractTheWidthOfColumnsWithHomogeneousValues()
        fnShowAndHideText(idOfButton, idOfTextPosition, text)
    fnAddButtonsToTableHeadingsForExpandableElements()
        fnHideThisColumn(featureNo)	
        fnShowAndHideSubordinateColumns(heteroFeatureNo)
    fnCompileAndPrintTheInitialSummary()
    fnGenerateColumnSelector()
    fnGenerateColumnSelectorPart2()
        fnColumnGroupSelect()
        fnShowOnlySelectedColumns()
    fnCreateOrderingAndGroupingSelector()
    fnBuildAndOutputTheMainTable()
    fnControlTheAddingOfTableLayers()
    fnApplySpecialStyling()
    fnHideSubsidiaryRows
    
                        
    //Utility functions
        //fnLoad...
        //fnShowAndHideRowsForAGroupOfIdenticalTagsInOneIatiActivity(baseRowNo, featureNo)
        //fnLoadXMLDoc
        //fnFormatMoneyInMillionsTo2DP(amount, transactionCurrency)	
        
    //Unused functions
        //fnMakeArrayForstandardBatchSize();   - to be added soon
        //fnGenerateDropDownLists();	- NB this is currently not used and probably would need more work if wanted	
*/




//PRIMARY FUNCTION
//This is triggered when page loads (see body) 

function getElementsFromNodeList(nodelist) {
    var elements = [];
    for (var i = 0; i < nodelist.length; i++) {
        if (nodelist[i].nodeType === 1) {
            elements.push(nodelist[i]);
        }
    }
    return elements;
}


function fnIncludeBannerAndCreateTabs() {

    $(document).ready(function () { $("#idBannerMenuInclude").load("../../banner-menu_include.html"); });

    jQuery(document).ready(function () {
        jQuery('.tabs .tab-links a').on('click', function (e) {
            var currentAttrValue = jQuery(this).attr('href');

            // Show/Hide Tabs
            jQuery('.tabs ' + currentAttrValue).show().siblings().hide();

            // Change/remove current tab to active
            jQuery(this).parent('li').addClass('active').siblings().removeClass('active');

            e.preventDefault();
        });
    });
    setTimeout(fnBuildSourceDataSelectionUI, 0);
}

//PRIMARY FUNCTION
function fnBuildSourceDataSelectionUI() {

    var allCsv = "";
    var introString = "";
    var outputSpace = "";
    var firstPart = "";
    var secondPart = "";
    var chopPoint = 0;
    var chopPoint2 = 0;
    var arrayDatasetsEnriched = [];
    var countryFound = "";

    arrayOfDatasets = fnPopulateArrayFromCsvFile("arrayOfDatasets.csv");

    /*
    //Combine pre-loaded arrays to make an enriched array of the available datasets
    arrayDatasetsEnriched[0] = ["blank","Code &nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp; Publisher agency &nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp Recipient country or other topic" ];
    for (d=1; d < arrayDatasets.length; d++) {
        arrayDatasetsEnriched[d] = [ arrayDatasets[d], arrayDatasets[d] ];
        chopPoint = arrayDatasetsEnriched[d][0].indexOf("-");
        firstPart = arrayDatasetsEnriched[d][0].substr(0, chopPoint);
        secondPart = arrayDatasetsEnriched[d][0].substr(chopPoint);
        //alert(arrayDatasets[d] + ", " + firstPart + ", " + secondPart);
        
        for (p=0; p<arrayPublishers.length; p++) {
            chopPoint2 = arrayPublishers[p][1].indexOf(" (");
            publisherName = arrayPublishers[p][1].substr(0, chopPoint2);
            //alert(publisherName);
            if (firstPart == arrayPublishers[p][0]){
                arrayDatasetsEnriched[d][1] += " &nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp; " + publisherName;
                break;
            }
        }
        countryFound = "no";
        for (c=0; c < arrayCountries.length; c++) {
            chopPoint2 = arrayCountries[c][1].indexOf(":");
            countryName = arrayCountries[c][1].substr(0, chopPoint2);
                
            if (secondPart == "-" + arrayCountries[c][0].toLowerCase()){
                arrayDatasetsEnriched[d][1] += " &nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp; " + countryName;
                countryFound = "yes";
                break;
            }
        }
        if (countryFound != "yes"){
            arrayDatasetsEnriched[d][1] += " &nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp; " + arrayDatasetsEnriched[d][0].substr(chopPoint+1);
        }
        
    }
*/

    //Provide introductory text
    introString = "<div class='padded' style='font-size:105%'><p>This page can make a table out of XML-formatted IATI activity data: for instance a file published by an aid agency about its activities in a particular country.</p>";
    introString += "<p>Begin by choosing a source of data.</p>";
    introString += "<p style='font-size:90%'>Warning: the Tabulator has been developed using the Firefox browser. It does not work in some other browsers.</p>";
    introString += "</div>";
    outputSpace = document.getElementById("idRightItem1");
    outputSpace.innerHTML = introString;

    resultString = "<div id='idSelectSourceData' class='padded'>";
    resultString += "<p class='header'>Choice of source data</p>";
    resultString += "<button id='idSettingsButtonG3N1' type='button' class='buttonOn' style='float:left; height:40px' onclick='fnHideOrShowDivOnButtonClick(\"3\",  \"1\")'>" + arrayButtons[3][1][1] + "</button>";
    resultString += "<button id='idSettingsButtonG3N2' type='button' class='buttonOff' style='float:left; height:40px; margin-bottom:10px' onclick='fnHideOrShowDivOnButtonClick(\"3\", \"2\")'>" + arrayButtons[3][2][1] + "</button>";
    resultString += "<button id='idSettingsButtonG3N3' type='button' class='buttonOff' style='float:left; height:40px; margin-bottom:10px' onclick='fnHideOrShowDivOnButtonClick(\"3\", \"3\")'>" + arrayButtons[3][3][1] + "</button>";
    resultString += "<button id='idSettingsButtonG3N4' type='button' class='buttonOff' style='float:left; height:40px; margin-bottom:10px' onclick='fnHideOrShowDivOnButtonClick(\"3\", \"4\")'>" + arrayButtons[3][4][1] + "</button>";

    resultString += "<div id='idSelectionOfCurrentIatiDataset'  style='float:left; clear:left; margin-bottom:10px'>";
    resultString += "<form action=''><fieldset>";
    resultString += "<select id='idSelectDatasetToFetchFromIatiDatastore' style='float:left; margin-top: 15px; margin-bottom:10px; width:450px; font-size:90%'>";	//NB if we don't specify an absolute width, the box may become too wide when a long option is selected

    resultString += "<option >Type a search term. Then click on preferred file.</option>";
    for (x = 0; x < arrayOfDatasets.length; x++) {
        resultString += "<option value='" + arrayOfDatasets[x][0] + "'>" + arrayOfDatasets[x][2] + "&nbsp;|&nbsp;" + arrayOfDatasets[x][1] + "&nbsp;|&nbsp;" + arrayOfDatasets[x][3] + "</option>";
    }

    resultString += "</select>";
    resultString += "<input type='button' class='floatRight buttonOff' style='clear:right;margin-left:20px;margin-top:17px' onclick='fetchType=\"dataset\"; fnAnalyzeMetadata()' value='Submit'/>"
    resultString += "</fieldset></form>";
    resultString += "</div>";

    resultString += "<div id='idQueryingTheDatastore' style='float:left; margin-top: 15px; margin-bottom:10px'>";
    resultString += "<form action=''><fieldset>";

    resultString += "<select id='idSelectRecipientCountry' style='float:left; clear:left; margin-bottom:10px; width:450px; font-size:90%'>"; //NB if we don't specify an absolute width, the box may become too wide when a long option is selected	
    resultString += "<option>Select a recipient country.</option>";
    for (x = 0; x < arrayCountries.length; x++) {
        resultString += "<option value='" + arrayCountries[x][0] + "'>" + arrayCountries[x][1] + "</option>";
    }
    resultString += "</select>";
    resultString += "<div style='float:left; clear:both; margin-bottom:10px; font-size:90%'>Optionally, click ";
    resultString += "<input type='button' class='buttonOff'  onclick='fetchType=\"query to get reporting orgs\"; fnAnalyzeMetadata()' value='Submit'/>"
    resultString += "here to compile an appropriate list of options in the next search box (i.e. only those organizations which have reported aid for the selected country). Warning: the process of refreshing the list can take some minutes. </div>";
    resultString += "<select id='idSelectReportingOrg' style='float:left; clear:left; margin-bottom:10px; width:450px; font-size:90%'>"; //NB if we don't specify an absolute width, the box may become too wide when a long option is selected		
    resultString += "<option>Select a reporting organization.</option>";
    for (x = 0; x < arrayOfReportingOrgs.length; x++) {
        resultString += "<option value='" + arrayOfReportingOrgs[x][0] + "'>" + arrayOfReportingOrgs[x][0] + " : " + arrayOfReportingOrgs[x][1] + " (" + arrayOfReportingOrgs[x][2] + ")</option>";
    }
    resultString += "</select>";

    resultString += "<input type='button' class='floatRight buttonOff' onclick='fetchType=\"query by country and org\"; fnAnalyzeMetadata()' value='Query by country and org'/>"
    resultString += "</fieldset></form>";
    resultString += "</div>";



    resultString += "<div id='idSelectionOfStockFile' style='float:left; clear:left; margin-bottom:10px'>";
    resultString += "<form action=''><fieldset>";
    resultString += "<div style='clear:left; padding-left:10px; font-size:90%'>Stock files are files stored on AidOpener's server, rather than fetched fresh from the IATI datastore. They may be useful as quick samples or for testing purposes.<br><br></div>";
    resultString += "<select id='idSelectStockFile' style='width:100%; padding-left:10px; float:right; margin-bottom:10px '>";
    resultString += "<option value='ADD-KH-activity.xml'>ADD file for Cambodia, May 2015</option>";

    resultString += "<option value='dfid-guy-activity.xml'>DFID file for Guyana, April 2015</option>";
    resultString += "<option value='EU_SS-2.xml'>EU file for South Sudan, December 2014</option>";
    resultString += "<option value='DE-1_TH.xml'>German Ministry of Economic Cooperation file for Thailand, April 2015</option>";
    resultString += "<input type='button' class='floatRight buttonOff' onclick='fnLoadLocalXmlFile()' value = 'Submit' /";
    resultString += "</select>";
    resultString += "</fieldset></form>";
    resultString += "</div>";

    resultString += "<div id='idInputtingOfFileAsText' style='float:left; clear:left; margin-bottom:10px '>";
    resultString += "<form action='' style='width:100%'><fieldset style='width:100%'>";
    resultString += "<div style='clear:left; padding-left:10px; font-size:90%'>You can input an XML file by copying and pasting its text into the box below. Then click the 'Submit' button.<br><br></div>";
    resultString += "<textarea id='idInputXmlText' rows='5' cols='50' style='float:left; max-width:90%' >Paste over this</textarea>";
    resultString += "<input type='button' class='floatRight buttonOff' style='clear:left' onclick='fnCreateXmlObjectFromTextInput()' value = 'Submit' /";

    resultString += "</fieldset></form>";
    resultString += "</div>";



    formOutputSpace = document.getElementById("idSpaceForSourceDataSelectionUI");
    formOutputSpace.innerHTML = resultString;

    $(document).ready(function () { $("#idSelectionOfStockFile").hide(); });
    $(document).ready(function () { $("#idInputtingOfFileAsText").hide(); });
    $(document).ready(function () { $("#idQueryingTheDatastore").hide(); });

    $(document).ready(function () { $("#idSelectDatasetToFetchFromIatiDatastore").select2(); });
    $(document).ready(function () { $("#idSelectRecipientCountry").select2(); });
    $(document).ready(function () { $("#idSelectReportingOrg").select2(); });

}


function fnRefreshReportingOrgsInUI() {

    var resultString = "<option>Select a reporting organization.</option>";
    for (x = 0; x < arrayOfReportingOrgsFresh.length; x++) {
        resultString += "<option value='" + arrayOfReportingOrgsFresh[x][0] + "'>" + arrayOfReportingOrgsFresh[x][0] + " : " + arrayOfReportingOrgsFresh[x][1] + " (" + arrayOfReportingOrgsFresh[x][2] + ")</option>";
    }

    document.getElementById("idSelectReportingOrg").innerHTML = resultString;

}

function fnLoadLocalXmlFile() {
    var fileName = "";
    var fileName = document.getElementById("idSelectStockFile").value;

    if (window.XMLHttpRequest) {
        xhttp = new XMLHttpRequest();
    }
    else {  // code for IE5 and IE6 
        xhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xhttp.open("GET", fileName, false);
    xhttp.send();
    xmlDoc = xhttp.responseXML;

    //if (xmlDoc.readyState === "complete") { alert("ready"); }
    reportString1 = "<div class='padded'>";
    reportString1 += "<p>Reading XML file:<p>";
    reportString1 += "<p><a href='" + fileName + "' target='_blank'>" + fileName + "</a></p>";
    reportString1 += "</p></div>";

    document.getElementById("idRightItem1").innerHTML = reportString1;
    setTimeout(fnGetGoing, standardPauseTime);
}

function fnAnalyzeMetadata() {
    /*
    if (FILESIZE IS VERY BIG){
        SUGGEST THAT THE USER PRE-FILTERS THE TABLE
        (A) useful set of features [but this would require setting up arrayFeatures with a limited set]
        (B) projects operational after a certain year and/or before a certain year
    }
    
    if (FILE IS MISSING FROM DATASTORE){
        SUGGEST THAT THE USER DOWNLOADS AND PASTES THE FILE MANUALLY
        
    }
        
    */
    document.getElementById("idRightItem2").innerHTML = "";
    document.getElementById("idRightItem3").innerHTML = "";
    arrayOfReportingOrgsFresh = [["Code", "Name", "Number of activity records"]];
    fnFetchXmlDataFromRemoteSite();

}


function fnCreateXmlObjectFromTextInput() {

    var xmlText = document.getElementById("idInputXmlText").value;


    var xmlTextMk2 = xmlText.replace(/iati-extra:version/g, "iati-extraVersion");
    var xmlTextMk3 = xmlTextMk2.replace(/&/g, "&amp;");

    xmlText = xmlTextMk3;

    //alert (xmlText);
    var parseXml;

    if (window.DOMParser) {
        parseXml = function (xmlStr) {
            return (new window.DOMParser()).parseFromString(xmlStr, "text/xml");
        };
    }
    else if (typeof window.ActiveXObject != "undefined" && new window.ActiveXObject("Microsoft.XMLDOM")) {
        parseXml = function (xmlStr) {
            var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = "false";
            xmlDoc.loadXML(xmlStr);
            return xmlDoc;
        };
    }
    else {
        parseXml = function () { return null; }
    }

    xmlDoc = parseXml(xmlText);


    //var xmlDoc = $.parseXML(xmlText);       //this jQuery way looks simpler than the above, but is said not to be so accurate

    if (xmlDoc.documentElement.nodeName == "parsererror") {
        alert("Can't parse this. It may be because of some unusual feature of the file which we haven't spotted and smoothed out. But please check these are full and proper XML file contents.");
    }

    var reportString1 = "<div class='padded'>";
    reportString1 += "<p>You have entered XML as text.</p>";
    reportString1 += "</div>";

    document.getElementById("idRightItem1").innerHTML = reportString1;

    setTimeout(fnGetGoing, standardPauseTime);
}

function fnFetchXmlDataFromRemoteSite() {
    var chopPoint = 0;
    var recipientCountryID = "";
    var dataset = "";
    var xhr = "";
    var urlString = "";
    var reportingOrgCode = "";
    var reportingOrgNo = 0;
    var recipientCountryCode = "";
    var reportString1 = "";
    var reportString2 = "";
    var reportString3 = "";
    var text = ""
    var locProgressReport2 = "";
    var locProgressReport3 = "";

    batchNo++;

    if (fetchType == "dataset") {
        dataset = document.getElementById("idSelectDatasetToFetchFromIatiDatastore").value;
        datasetCode = arrayOfDatasets[dataset][2];
        urlString = "http://datastore.iatistandard.org/api/1/access/activity.xml?registry-dataset=" + datasetCode;
        //urlString += "&offset=" + ((batchNo-1)*standardBatchSize).toString() + "&limit=100";
        urlString += "&stream=True";   //loading the whole xml file in one go as a stream can take a long time. An alternative would be loading in batches which are then stitched together. That would allow more control and monitoring of the download process. But would be fiddly to write (and to use). 
    }

    if (fetchType == "query to get reporting orgs") {
        recipientCountryID = document.getElementById("idSelectRecipientCountry").value;
        urlString = "http://datastore.iatistandard.org/api/1/access/activity.xml?recipient-country=" + recipientCountryID + "&offset=" + ((batchNo - 1) * standardBatchSize).toString() + "&limit=100";
    }

    if (fetchType == "query by country and org") {
        recipientCountryID = document.getElementById("idSelectRecipientCountry").value;
        reportingOrgID = document.getElementById("idSelectReportingOrg").value;

        urlString = "http://datastore.iatistandard.org/api/1/access/activity.xml?recipient-country=" + recipientCountryID + "&reporting-org=" + reportingOrgID + "&offset=" + ((batchNo - 1) * standardBatchSize).toString() + "&limit=100";
    }

    reportString1 = "<div class='padded'>"
    reportString1 += "<p>We have requested your data from the IATI Datastore:<p>";
    reportString1 += "<p><a href='" + urlString + "' target='_blank'>" + urlString + "</a></p>";
    reportString1 += "<p>(Clicking the above hyperlink will open the source xml file in a new tab or window.)</p></div>";
    //reportString2 = "<div class='padded'><p>Fetching the data ...</p></div>";
    document.getElementById("idRightItem1").innerHTML = reportString1;
    //document.getElementById("idRightItem2").innerHTML = reportString2;

    xhr = new XMLHttpRequest();

    if (!xhr) {
        alert('CORS not supported. We can\'t go ahead.');
        return;
    }

    if ("withCredentials" in xhr) {
        // XHR for Chrome/Firefox/Opera/Safari.
        xhr.open("GET", urlString, true);
    } else if (typeof XDomainRequest != "undefined") {
        // XDomainRequest for IE.
        xhr = new XDomainRequest();
        xhr.open("GET", urlString);
    } else {
        // CORS not supported.
        xhr = null;
    }

    // Response handlers 

    xhr.onerror = function () {
        alert('Whoops, there was an error making the request.');
    };

    xhr.onload = function () {

        text += xhr.responseText;

        noOfActivityRecordsInFileToFetch = text.match('<total-count>(.*)?</total-count>')[1];

        if (noOfActivityRecordsInFileToFetch > 0) {

            xmlDoc = xhr.responseXML;

            if (batchNo == 1) {
                locProgressReport2 = "<div class='padded'>";
                locProgressReport2 += "<p>The file has records of <strong> " + noOfActivityRecordsInFileToFetch.toString() + " </strong> iati-activities.</p>";
                locProgressReport2 += "<p>They are being fetched in batches of " + standardBatchSize.toString() + ".</p>";
                locProgressReport2 += "<p>You can abort the process by pressing this button. </p>";
                locProgressReport2 += "<button onclick='fnAbortFetch'>Abort</button>";
                locProgressReport2 += "</div>";
                document.getElementById("idRightItem2").innerHTML = locProgressReport2;
            }

            locProgressReport3 = "<div class='padded'>";
            locProgressReport3 += "Loaded <strong>" + (batchNo * standardBatchSize).toString() + "</strong> out of <strong>" + noOfActivityRecordsInFileToFetch.toString() + "</strong> iati-activity records.";
            locProgressReport3 += "</div>";
            document.getElementById("idRightItem3").innerHTML = locProgressReport3;

            if (fetchType == "query to get reporting orgs") {
                setTimeout(fnCompileArrayOfReportingOrgs, standardPauseTime);
            }
            if (fetchType == "dataset") {

                setTimeout(fnGetGoing, standardPauseTime);

            }


        }
        else {
            locProgressReport2 = "<div class='padded'><p>The file contains no IATI activity records.</p>";
            if (fetchType == "dataset") {
                locProgressReport2 += "<p>This may be because the aid agency has set up an account to publish data but not actually published.</p>";
                locProgressReport2 += "<p>Or it may be because the file has been omitted from the IATI datastore. In this case you may find the file on the publisher's website, here: </p>";
                locProgressReport2 += "<p><a href = '" + arrayOfDatasets[dataset][5] + "' target='_blank'>" + arrayOfDatasets[dataset][5] + "</a>.</p>";
                locProgressReport2 += "<p>If so, you can use our 'Input XML file by copy and paste' facility.</p>";
                locProgressReport2 += "</div>";
            }
            if (fetchType == "query to get reporting orgs") {
                locProgressReport2 += "<p>The list of reporting organizations has not been updated. </p>";
            }
            document.getElementById("idRightItem2").innerHTML = locProgressReport2;
        }
    };
    xhr.send();
}


function fnAbortFetch() {
    batchNo = "0";
    urlString = "";
    xhr = null;
    xmlDoc = null;

    introString = "<div class='padded' style='font-size:105%'><p>This page can make a table out of XML-formatted IATI activity data: for instance a file published by an aid agency about its activities in a particular country.</p>";
    introString += "<p>Begin by choosing a source of data.</p>";
    introString += "</div>";
    document.getElementById("idRightItem1").innerHTML = introString;

    document.getElementById("idRightItem2").innerHTML = "";
    document.getElementById("idRightItem3").innerHTML = "";
}

function fnCompileArrayOfReportingOrgs() {
    var batchSize = 0;
    var reportingOrgElement = xmlDoc.getElementsByTagName("reporting-org");
    var reportingOrgText = "";
    var reportingOrgCode = "";
    var matchFound = "no";

    if (batchNo * standardBatchSize > noOfActivityRecordsInFileToFetch) {
        batchSize = (noOfActivityRecordsInFileToFetch - (batchNo - 1) * standardBatchSize);
    }
    else {
        batchSize = standardBatchSize;
    }
    for (f = 0; f < batchSize; f++) {
        reportingOrgText = reportingOrgElement[f].textContent;
        matchFound = "no";
        for (g = 0; g < reportingOrgElement[f].attributes.length; g++) {
            if (reportingOrgElement[f].attributes[g].nodeName == "ref") {
                reportingOrgCode = reportingOrgElement[f].attributes[g].value;
                //alert("f = " + f.toString() + ", " + reportingOrgText + ", " + reportingOrgCode);
            }
        }

        for (i = 0; i < arrayOfReportingOrgsFresh.length; i++) {
            //alert("reportingOrgCode =" + reportingOrgCode + ", arrayOfReportingOrgsFresh[i][0] = " + arrayOfReportingOrgsFresh[i][0]);
            if (reportingOrgCode == arrayOfReportingOrgsFresh[i][0] && reportingOrgText == arrayOfReportingOrgsFresh[i][1]) {
                matchFound = "yes";
                arrayOfReportingOrgsFresh[i][2]++;
                break;
            }
        }

        if (matchFound == "no") {
            arrayOfReportingOrgsFresh.push([reportingOrgCode, reportingOrgText, 1]);

        }
    }

    /* for testing	
    for (i = 0; i < arrayOfReportingOrgsFresh.length; i++){
        alert(arrayOfReportingOrgsFresh[i]);
    }
    */

    if (batchNo * standardBatchSize >= noOfActivityRecordsInFileToFetch) {
        document.getElementById("idRightItem3").innerHTML = "<div class='padded'>The list of reporting organizations has now been refreshed.<div>"
        batchNo = 0;
        setTimeout(fnRefreshReportingOrgsInUI, standardPauseTime);
    }
    else {
        //document.getElementById("idRightItem3").innerHTML = "<div class='padded'>Processing batch <strong>" + batchNo.toString() + "</strong><div>"
        setTimeout(fnFetchXmlDataFromRemoteSite, standardPauseTime);
    }

}


function fnGetGoing() {

    //declare local variables
    var extraRowsNeededForThisRepeatedTag = 0;
    var previousNoOfRows;
    var noOfRowsToWipe;
    var reporter = "";
    var sequenceDetected = "no";

    var locProgressReport3 = "<div class='padded'>"
    locProgressReport3 += "<p>The program is now converting the xml data into a JavaScript array.</p>";
    locProgressReport3 += "</div>";



    // set initial values for universal variables which are changed below (because the running of the script may be repeated without the page being reloaded)
    arrayBlankFields = [];
    arrayHomogenousFeatures = [];
    arrayNonblankHomogenousFields = [];
    arrayReceiverOrgsInAnIatiActivity = [];
    arraySelectedRowNos = [];
    arrayTransactionDatesInAnIatiActivity = [];
    arrayUnrecognizedTagStrings = [];

    batchNo = 0;
    columnSelectionFormHtml = "";
    commitmentAmount = 0;
    currentLevel1Child = "";
    currentLevel1Children = "";
    defaultCurrency = "";
    extraRowNo = 0;
    featureName = "";
    featureString = "";
    fetchType = "";
    generatedDatetime = "";
    highestNoOfExtraRowNosForRecentIatiActivity = 0;
    htmlForHomogeneityReport = "";
    htmlForListOfBlankFields = "";
    htmlForTableOfFieldsWithHamogenousNonblankValues = "";
    iatiActivities = xmlDoc.getElementsByTagName("iati-activities");
    iatiActivity = xmlDoc.getElementsByTagName("iati-activity");
    iatiActivityNo = 0;
    level1ChildNo = 0;
    linkedColor = "";
    mixedCurrencies = "no";
    noOfActivityRecordsInFileToFetch = 0;
    noOfIatiActivities = iatiActivity.length;
    //noOfIatiActivities = 20; // this line is to limit processing time during testing, and may otherwise be commented out
    noOfRowsPerLayer = 100;
    noOfRowsProcessed = 0;
    previousNoOfRows = noOfRows;  // noOfRows must not be cleared to zero at this point because we need this number in order to clear arrayMaster from previous data

    rowNo = 0;
    //runningCountForTableWidth = 0;
    runningTotalSpend = 0;
    scrollbarWidth = 20;  //Parameter needed when constructing the table. Might be different between different browsers?
    spendingAmount = 0;
    standardPauseTime = 0;
    timeToStop = "no";
    transactionCurrency = "";
    transactionValue = 0;
    transactionType = "";
    valueToDisplay = "";


    for (attributeNo = 0; attributeNo < iatiActivities[0].attributes.length; attributeNo++) {

        if (iatiActivities[0].attributes[attributeNo].nodeName == "generated-datetime") {
            generatedDatetime = iatiActivities[0].attributes[attributeNo].nodeValue;
        }
        if (iatiActivities[0].attributes[attributeNo].nodeValue == "http://www.foreignassistance.gov/web/IATI/usg-extension") {
            reporter = "USA";

        }
    }


    arrayFeatures = fnPopulateArrayFromCsvFile("arrayFeatures.txt");

    noOfFeatures = arrayFeatures.length;


    /* 	 
    MEMO ABOUT arrayMaster()
    
    arrayMaster() is the master array for a three-dimensional array, arrayMaster[x][y][z], where:
       x is for the rows of the table (related to but not identical with the roster of different iati-activities). 
           x corresponds to row numbers. 
               NB. The row numbers in the table start with '1'. Therefore '0' is not used in this dimension of the array. 
       y is for the 'features' of each iati-activity: tags and attributes
           Value 0 is for contents relating to unrecognized tags/nodeNames. See fnGetFeatureNoMatchingAString(string).
           Value 1 is for the row number
           Value 2 is for the iati-activity number
       z is for different formatting aspects of the data defined by x and y. Values of z (1-5) are for the following:
           0 is for the basic alphanumeric data
           1 is for any HTML 'title' attribute (text which shows up when the user's cursor hovers over the element)
           2 is for any HTML 'class' attribute
           3 is for the cell background colour (which is included among the 'style' attributes when the table is constructed)
           4 is for the number of hideable row-sections of cells (multiple uses of a tag) currently shown under a button cell. (This number is useful when hiding the cells)
           5 is for the cell (text) color (which is included among the 'style' attributes when the table is constructed)
           6 is for the cell border colour (which is included among the 'style' attributes when the table is constructed)
           
     
       When a kind of special value is needed for each row rather than each cell...
       
   
   //preliminary calculation of number of rows needed for the table. (This is needed in order to set up arrayMaster unless we change the order of the dimensions there. But then the order seems awkward. Besides, it is a pain to change it.)
   */
    rowCount = 0;
    for (iatiActivityNo = 0; iatiActivityNo < noOfIatiActivities; iatiActivityNo++) {
        rowCount++;
        sequenceDetected = "no";
        extraRowsNeededForThisRepeatedTag = 0;
        highestNoOfExtraRowNosForRecentIatiActivity = 0;
        currentIatiActivity = iatiActivities[iatiActivityNo];
        //currentLevel1Children = iatiActivity[iatiActivityNo].children;
        var currentLevel1Children = getElementsFromNodeList(iatiActivity[iatiActivityNo].childNodes);
        for (level1ChildNo = 1; level1ChildNo < currentLevel1Children.length; level1ChildNo++) {
            if (currentLevel1Children[level1ChildNo].nodeName == currentLevel1Children[level1ChildNo - 1].nodeName) {
                sequenceDetected = "yes";
                extraRowsNeededForThisRepeatedTag++;
            }
            if (currentLevel1Children[level1ChildNo].nodeName != currentLevel1Children[level1ChildNo - 1].nodeName
                || level1ChildNo == currentLevel1Children.length - 1) {
                if (sequenceDetected == "yes") {
                    sequenceDetected = "no";
                    extraRowsNeededForThisRepeatedTag++;
                }
                if (extraRowsNeededForThisRepeatedTag > highestNoOfExtraRowNosForRecentIatiActivity) {
                    highestNoOfExtraRowNosForRecentIatiActivity = extraRowsNeededForThisRepeatedTag;
                }
                extraRowsNeededForThisRepeatedTag = 0;
            }
        }
        rowCount += highestNoOfExtraRowNosForRecentIatiActivity;
    }
    noOfRows = rowCount;
    highestNoOfExtraRowNosForRecentIatiActivity = 0;  // reset because this variable name may be used elsewhere		
    if (noOfRows >= previousNoOfRows) {
        noOfRowsToWipe = noOfRows;
    }
    else {
        noOfRowsToWipe = previousNoOfRows;
    }


    //declaration of arrayMaster() and initial assignment of some values in it
    for (x = 1; x <= noOfRowsToWipe; x++) {				//(row O will be unused in the table in order to make row numbers begin with '1' and still correspond with array numbers)
        arrayMaster[x] = [];
        for (y = 0; y < noOfFeatures + 1; y++) {
            arrayMaster[x][y] = [];
            for (z = 0; z < 4; z++) {
                arrayMaster[x][y][z] = "";
            }
            arrayMaster[x][y][4] = 0;
            arrayMaster[x][y][5] = "";
        }
        if (x <= noOfRows) {
            arrayMaster[x][0][0] = x.toString();          //NB this enters the row nos  		
        }
    }


    arrayConvertTableRowNoToMasterRowNo = [];
    for (n = 1; n <= noOfRowsToWipe; n++) {
        if (n > noOfRows) {
            arrayConvertTableRowNoToMasterRowNo[n] = 0;
        }
        else {
            arrayConvertTableRowNoToMasterRowNo[n] = n;
        }
    }


    for (f = 0; f < noOfFeatures; f++) {

        if (arrayFeatures[f][0] == "/@hierarchy") {
            featureNoForHierarchy = f;
        }
    }

    for (r = 1; r <= noOfRows; r++) {
        arrayMaster[r][featureNoForHierarchy][0] = "0";  // to cope when the xml file does not specify hierarchy
    }

    //Clear key innerHTML spaces  (for when new tables are generated without the page being reloaded) but I'm not sure this helps
    document.getElementById("idSpaceForColumnSelector").innerHTML = "";
    var thing = document.getElementById("idTableOutputSpace");
    while (thing.firstChild) thing.removeChild(thing.firstChild);

    setTimeout(fnCopyDataFromXmlFileToArrayMaster, standardPauseTime);

}



//PRIMARY FUNCTION	
function fnCopyDataFromXmlFileToArrayMaster() {

    highestNoOfExtraRowNosForRecentIatiActivity = 0;
    for (iatiActivityNo = 0; iatiActivityNo < noOfIatiActivities; iatiActivityNo++) {
        rowNo = rowNo + highestNoOfExtraRowNosForRecentIatiActivity + 1;
        if (rowNo > noOfRows) {
            break;
        }
        highestNoOfExtraRowNosForRecentIatiActivity = 0;
        extraRowNo = 0;

        arrayMaster[rowNo][1][0] = iatiActivityNo.toString();

        currentIatiActivity = iatiActivities[iatiActivityNo];
        fnPutAttributesOfAnElementIntoMasterArray(iatiActivity[iatiActivityNo], "");

        //deal with the child elements of the current iati-activity
        currentLevel1Children = getElementsFromNodeList(iatiActivity[iatiActivityNo].childNodes);
        for (level1ChildNo = 0; level1ChildNo < currentLevel1Children.length; level1ChildNo++) {
            currentLevel1Child = currentLevel1Children[level1ChildNo];
            //if the Level 1 tag is NOT in a sequence of repeated Level 1 tags...
            if (
                ((level1ChildNo + 1 < currentLevel1Children.length && currentLevel1Child.nodeName != currentLevel1Children[level1ChildNo + 1].nodeName) || level1ChildNo + 1 == currentLevel1Children.length)
                &&
                ((level1ChildNo > 0 && currentLevel1Child.nodeName != currentLevel1Children[level1ChildNo - 1].nodeName) || level1ChildNo == 0)
                ) {
                //...put the elements (including attributes and grandchildren) into the array										
                featureNo = fnGetFeatureNoMatchingAString(currentLevel1Child.nodeName);
                arrayMaster[rowNo][featureNo][0] = currentLevel1Child.textContent;

                fnPutAttributesOfAnElementIntoMasterArray(currentLevel1Child, currentLevel1Child.nodeName);
                fnPutChildrenOfAnElementIntoMasterArray(currentLevel1Child);
                fnProcessValuesForInterpretiveFieldsAtEndOfL1Child(currentLevel1Child);
            }
            else {   //but if the Level 1 tag IS in a sequence of repeated Level 1 tags:

                extraRowNo = extraRowNo + 1;
                for (featureNo = 0; featureNo < arrayFeatures.length; featureNo++) {
                    arrayMaster[rowNo + extraRowNo][featureNo][3] = colourForBlankAreasInTable;
                    arrayMaster[rowNo + extraRowNo][featureNo][5] = colourForBlankAreasInTable;
                }

                if (rowNo + extraRowNo > noOfRows) {
                    break;
                }
                if (extraRowNo > highestNoOfExtraRowNosForRecentIatiActivity) {
                    highestNoOfExtraRowNosForRecentIatiActivity = extraRowNo;
                }

                //if this is the first child/tag in a sequence,  make a row segment with a button and different colouring								
                if (level1ChildNo + 1 < currentLevel1Children.length && currentLevel1Child.nodeName == currentLevel1Children[level1ChildNo + 1].nodeName) {
                    featureNo = fnGetFeatureNoMatchingAString(currentLevel1Child.nodeName);
                    arrayMaster[rowNo][featureNo][0] = "button";
                    arrayMaster[rowNo][featureNo][3] = arrayForHierarchyCssValues[arrayMaster[rowNo][featureNoForHierarchy][0]][2];
                    arrayFeatures[featureNo][4] = "down-arrow-button";
                }

                featureNo = fnGetFeatureNoMatchingAString(currentLevel1Child.nodeName);
                arrayMaster[rowNo + extraRowNo][featureNo][0] = currentLevel1Child.textContent;
                fnPutAttributesOfAnElementIntoMasterArray(currentLevel1Child, currentLevel1Child.nodeName);
                fnPutChildrenOfAnElementIntoMasterArray(currentLevel1Child);

                arrayMaster[rowNo + extraRowNo][1][0] = iatiActivityNo.toString() + "." + extraRowNo.toString();		//line number with '.' for extra rows										
                arrayMaster[rowNo + extraRowNo][1][2] = "hierarchy" + arrayMaster[rowNo][featureNoForHierarchy][0].toString();  //css for background colour based on the iati-activity's' hierarchy level
                arraySelectedRowNos.push(rowNo + extraRowNo);
                // this remembers which rows have to be made hidable/showable

                fnProcessValuesForInterpretiveFieldsAtEndOfL1Child(currentLevel1Child);

                // if the current Level 1 child is the last in the run of identical tags, reset the extraRowNo to 0.
                if ((level1ChildNo + 1 < currentLevel1Children.length && currentLevel1Child.nodeName != currentLevel1Children[level1ChildNo + 1].nodeName) || level1ChildNo + 1 == currentLevel1Children.length) {
                    extraRowNo = 0;
                }
            }  			//end of acting on this Level 1 tag in the case that it it is part of a sequence of tags		
        }				// end of processing this level 1 child of the iati-activity
        if (rowNo <= noOfRows) {
            fnProcessValuesForInterpretiveFieldsAtEndOfIatiActivity(rowNo);
        }
        else {
            alert("Line 1235 rowNo: " + rowNo.toString()); //for testing. Program probably should not come here
        }
    }					// end of processing this iati-activity

    document.getElementById("idRightItem3").innerHTML = "<div class='padded'>Analyzing and processing the array...</div>";
    setTimeout(fnReportAndSubtractTheWidthOfColumnsWithHomogeneousValues, standardPauseTime);
}						// end of function fnCopyDataFromXmlFileToArrayMaster()

//Subsidiary function
function fnTakeValueOfL2FieldForInterpretiveField(fieldValue) {
    //if (extraRowNo > 0){		
    if (featureString == "transaction/receiver-org") {
        arrayReceiverOrgsInAnIatiActivity = fnPushValueIntoArrayIfItIsNotThereAlready(arrayReceiverOrgsInAnIatiActivity, fieldValue);
    }
    if (featureString == "transaction/transaction-date/@iso-date") {
        arrayTransactionDatesInAnIatiActivity = fnPushValueIntoArrayIfItIsNotThereAlready(arrayTransactionDatesInAnIatiActivity, fieldValue.substr(0, 4));
    }
    if (featureString == "transaction/value/@currency") { transactionCurrency = fieldValue; }
    if (featureString == "transaction/value") { transactionValue = Number(fieldValue); }
    if (featureString == "transaction/transaction-type/@code" && fieldValue == "C") { transactionType = "c"; }
    if (featureString == "transaction/transaction-type/@code" && fieldValue == "D") { transactionType = "d"; }
    if (featureString == "transaction/transaction-type/@code" && fieldValue == "E") { transactionType = "e"; }
    //}	
}

//Subsidiary function
function fnPushValueIntoArrayIfItIsNotThereAlready(array, value) {
    var matchFound = "no";
    for (i = 0; i < array.length; i++) {
        if (value == array[i]) {
            matchFound = "yes";
            break;
        }
    }
    if (matchFound == "no") {
        array.push(value);
    }
    return array;
}

//Subsidiary function								
function fnProcessValuesForInterpretiveFieldsAtEndOfL1Child(currentLevel1Child) {
    if (currentLevel1Child.nodeName == "transaction") {
        if (transactionCurrency == defaultCurrency || transactionCurrency == "" || defaultCurrency == "") {
            if (transactionType == "c") { commitmentAmount += transactionValue; }
            if (transactionType == "d" || transactionType == "e") { spendingAmount += transactionValue; }
        }
        else {
            //alert(transactionCurrency + ", " + defaultCurrency);
            mixedCurrencies = "yes";
        }
    }
    transactionValue = 0;
    transactionType = "";
}

//Subsidiary function
function fnProcessValuesForInterpretiveFieldsAtEndOfIatiActivity(rowNo) {
    for (localFeatureNo = 0; localFeatureNo < noOfFeatures; localFeatureNo++) {
        if (mixedCurrencies == "no") {
            if (arrayFeatures[localFeatureNo][0] == "transaction/*receiver(s)") {
                arrayMaster[rowNo][localFeatureNo][0] = "<ul style=margin-top:0px>";
                for (a = 0; a < arrayReceiverOrgsInAnIatiActivity.length; a++) {
                    arrayMaster[rowNo][localFeatureNo][0] += "<li>" + arrayReceiverOrgsInAnIatiActivity[a] + "</li>";
                }
                arrayMaster[rowNo][localFeatureNo][0] += "</ul>";
            }

            if (arrayFeatures[localFeatureNo][0] == "transaction/*year_range") {
                if (arrayTransactionDatesInAnIatiActivity != "") {
                    arrayTransactionDatesInAnIatiActivity.sort();
                    locEarliestYear = arrayTransactionDatesInAnIatiActivity[0];
                    arrayTransactionDatesInAnIatiActivity.reverse();
                    locLatestYear = arrayTransactionDatesInAnIatiActivity[0];
                    arrayMaster[rowNo][localFeatureNo][0] = locEarliestYear + " - " + locLatestYear;
                }
            }
            if (arrayFeatures[localFeatureNo][0] == "transaction/*committed") {
                arrayMaster[rowNo][localFeatureNo][0] = fnFormatMoneyInMillionsTo2DP(commitmentAmount, transactionCurrency);
            }
            if (arrayFeatures[localFeatureNo][0] == "transaction/*spent") {
                arrayMaster[rowNo][localFeatureNo][0] = fnFormatMoneyInMillionsTo2DP(spendingAmount, transactionCurrency);
            }

        }
        if (mixedCurrencies == "yes") {
            arrayMaster[rowNo][localFeatureNo][0] = "Transactions in varied currencies";
        }
        //arrayMaster[rowNo][localFeatureNo][3] = "interpretiveFieldStyle";
        mixedCurrencies = "no";
    }
    transactionType = "";
    commitmentAmount = 0;
    spendingAmount = 0;

    transactionCurrency = defaultCurrency;
    arrayReceiverOrgsInAnIatiActivity = [];
    arrayTransactionDatesInAnIatiActivity = [];
}

//Subsidiary function
function fnGetFeatureNoMatchingAString(string) {
    var featureNo;
    for (featureNo = 0; featureNo < noOfFeatures; featureNo++) {
        if (string == arrayFeatures[featureNo][0]) {
            return featureNo;
            break;
        }
    }
    return arrayFeatures.length;
    arrayUnrecognizedTagStrings.push(string);  // NB this should be developed more for a report on anomalous tags used in the xml file etc
}

//Subsidiary function
function fnPutChildrenOfAnElementIntoMasterArray(element) {
    var featureNoB;
    var children = getElementsFromNodeList(element.childNodes);
    for (childNo = 0; childNo < children.length; childNo++) {
        featureString = element.nodeName + "/" + children[childNo].nodeName;
        for (featureNoB = 0; featureNoB < noOfFeatures; featureNoB++) {	//better not use 'featureNo' because function may be nested in a loop which already uses this					
            if (featureString == arrayFeatures[featureNoB][0]) {
                arrayMaster[rowNo + extraRowNo][featureNoB][0] = children[childNo].textContent;

                fnTakeValueOfL2FieldForInterpretiveField(children[childNo].textContent);
                fnPutAttributesOfAnElementIntoMasterArray(children[childNo], featureString);

                if (extraRowNo == 1) {
                    arrayMaster[rowNo][featureNoB][0] = "button";
                    arrayMaster[rowNo][featureNoB][3] = arrayForHierarchyCssValues[arrayMaster[rowNo][featureNoForHierarchy][0]][2];
                    arrayFeatures[featureNoB][4] = "down-arrow-button";
                }

                break;
            }
        }
    }
}

//Subsidiary function
function fnPutAttributesOfAnElementIntoMasterArray(element, featureName) {
    for (attributeNo = 0; attributeNo < element.attributes.length; attributeNo++) {
        featureString = featureName + "/@" + element.attributes[attributeNo].nodeName;
        for (localFeatureNo = 0; localFeatureNo < noOfFeatures; localFeatureNo++) {	//can't use 'featureNo' because function may be nested in a loop which already uses this					
            if (featureString == arrayFeatures[localFeatureNo][0]) {
                arrayMaster[rowNo + extraRowNo][localFeatureNo][0] = element.attributes[attributeNo].nodeValue;

                fnTakeValueOfL2FieldForInterpretiveField(element.attributes[attributeNo].nodeValue);
                if (extraRowNo == 1) {
                    arrayMaster[rowNo][localFeatureNo][0] = "button";
                    arrayMaster[rowNo][localFeatureNo][3] = arrayForHierarchyCssValues[arrayMaster[rowNo][featureNoForHierarchy][0]][2];
                    arrayFeatures[localFeatureNo][4] = "down-arrow-button";
                }

                if (featureString == "iati-activity/@default-currency") {
                    defaultCurrency = element.attributes[attributeNo].nodeValue;
                    transactionCurrency = defaultCurrency;
                }
                break;
            }
        }
    }
}


// PRIMARY FUNCTION
function fnReportAndSubtractTheWidthOfColumnsWithHomogeneousValues() {
    var currentValue = "";
    var homogeneityStatus = "";
    var previousValue = "";

    htmlForTableOfFieldsWithHamogenousNonblankValues = "<h3>Fields containing the same value for every iati-activity</h3><table>";
    htmlForListOfBlankFields = "<h3>List of blank fields</h3><ul>";

    for (featureNo = 0; featureNo < noOfFeatures; featureNo++) {

        if (noOfIatiActivities > 1) {				//this condition prevents key data being hidden as "homogeneous" when there is only one activity
            homogeneityStatus = "homogeneous";
        }
        else {
            homogeneityStatus = "inapplicable";
            //arrayFeatures[featureNo][2] = "homoNO";
        }

        currentValue = arrayMaster[1][featureNo][0];

        for (rowNo = 2; rowNo < noOfRows; rowNo++) {
            if (                             // if the row is not a blank extra row
                (arrayMaster[rowNo][1][0].toString().indexOf(".") == -1)
                || (arrayMaster[rowNo][1][0].toString().indexOf(".") != -1 && arrayMaster[rowNo][featureNo][0] != "")
                ) {

                previousValue = currentValue;
                currentValue = arrayMaster[rowNo][featureNo][0];

                if (currentValue != previousValue) {
                    homogeneityStatus = "not homogeneous";
                    arrayFeatures[featureNo][2] = "homoNO";

                    break;
                }
            }
        }


        if (homogeneityStatus == "homogeneous") {

            arrayHomogenousFeatures.push(featureNo);
            arrayFeatures[featureNo][2] = "homoYES";

        }
        if (homogeneityStatus == "homogeneous" || homogeneityStatus == "inapplicable") {
            homogeneousValue = arrayMaster[1][featureNo][0];
            if (homogeneousValue == "") {
                homogeneousValue = "[blank]";
                arrayBlankFields.push(featureNo);
                arrayFeatures[featureNo][2] = "allblankYES";
                htmlForListOfBlankFields += "<li>" + arrayFeatures[featureNo][0] + "</li>";
            }
            else {
                arrayNonblankHomogenousFields.push(featureNo);
                htmlForTableOfFieldsWithHamogenousNonblankValues += "<tr><td>" + arrayFeatures[featureNo][0];
                htmlForTableOfFieldsWithHamogenousNonblankValues += "</td><td> " + homogeneousValue + "</td></tr>";
            }
        }
        else {
            arrayFeatures[featureNo][2] = "homoNO";
            arrayFeatures[featureNo][5] = "showYes";
        }
        //alert(featureNo);
    }



    htmlForListOfBlankFields += "</ul>";
    htmlForTableOfFieldsWithHamogenousNonblankValues += "</table>";

    htmlForHomogeneityReport += "<li>Number of unused tag/attribute variables: <strong>" + arrayBlankFields.length + "</strong>";
    htmlForHomogeneityReport += ". To show/hide a list of these variables, click the button: <button id='idButtonForListOfBlankFields' onclick='fnShowAndHideText(idButtonForListOfBlankFields, \"idPositionOfListOfBlankFields\", htmlForListOfBlankFields)'>+</button></li>";
    htmlForHomogeneityReport += "<div id='idPositionOfListOfBlankFields'></div>";
    htmlForHomogeneityReport += "<li>Number of tab/attribute variables with the same (non-blank) value for every iati-activity: <strong>" + arrayNonblankHomogenousFields.length + "</strong>";
    htmlForHomogeneityReport += ". To show/hide a list of these variables, click the button: <button id='idButtonForListOfHomogeneousFields' onclick='fnShowAndHideText(idButtonForListOfHomogeneousFields, \"idPositionOfListOfHomogeneousFields\", htmlForTableOfFieldsWithHamogenousNonblankValues)'>+</button></li>";
    htmlForHomogeneityReport += "<div id='idPositionOfListOfHomogeneousFields'></div>";


    setTimeout(fnAddButtonsToTableHeadingsForExpandableElements, standardPauseTime);

}

// Subsidiary function
function fnShowAndHideText(idOfButton, idOfTextPosition, text) {
    $(document).ready(function () {
        if ($(idOfButton).html() == "+") {
            $(idOfButton).html("-");
            document.getElementById(idOfTextPosition).innerHTML = text;
        }
        else {
            $(idOfButton).html("+");
            document.getElementById(idOfTextPosition).innerHTML = "";
        }
    });
}


//PRIMARY FUNCTION
function fnAddButtonsToTableHeadingsForExpandableElements() {
    for (featureNo = 0; featureNo < arrayFeatures.length; featureNo++) {
        if (arrayFeatures[featureNo][2] == "homoNO") {

            if (arrayFeatures[featureNo][4] == "down-arrow-button") {
                arrayFeatures[featureNo][4] = "<span><button id='idBA0-" + featureNo.toString();
                arrayFeatures[featureNo][4] += "' " + "type='button' onclick='fnShowAndHideRowsForGroupsOfIdenticalTagsDownColumn(" + featureNo + ")'>&#9662</button></span>";
                //arrayFeatures[featureNo][4] += "<span><button id='idBB0-" + featureNo.toString(); 
                //arrayFeatures[featureNo][4] += "' " + "type='button' onclick='fnShowAndHideSubordinateColumns(" + heteroFeatureNo + ")'>&#9664;</button></span>";

            }
            arrayFeatures[featureNo][4] += "<span><button type='button' onclick='fnHideThisColumn(" + featureNo + ")'>x</button></span>";
        }
    }
    setTimeout(fnCompileAndPrintTheInitialSummary, standardPauseTime);
}

//Subsidiary function
function fnHideThisColumn(featureNo) {
    var idvar = "#idCX-" + featureNo.toString();
    $(document).ready(function () {
        $('.column' + featureNo.toString()).hide();
        $(idvar).prop("checked", false);
    });
    fnAdjustTableWidth();
}

/*Subsidiary function   //This functionality probably is not wanted and the routine would have to be revised anyway
function fnShowAndHideSubordinateColumns(heteroFeatureNo){
    var columnClass = "";
    var f= arrayHeterogeneousFeatures[heteroFeatureNo];
    var idvar="";
    $(document).ready(function(){
        idVar = "#idBB0-"+f.toString();
        if ($(idVar).html() == "►") {
            $(idVar).html("&#9664;");
            for (i=1; i < (arrayHeterogeneousFeatures.length)-1; i++) {
                featureNo = arrayHeterogeneousFeatures[heteroFeatureNo + i];
                if (arrayFeatures[featureNo][0].indexOf(arrayFeatures[arrayHeterogeneousFeatures[heteroFeatureNo]][0]) != 0) {
                    break;	
                }
                $('td:nth-child('+ (heteroFeatureNo +i +1) +')').show();
            }																								
        }
        else {	
            $(idVar).html("&#9658;");	
            for (i=1; i < (arrayHeterogeneousFeatures.length)-1; i++) {
                featureNo = arrayHeterogeneousFeatures[heteroFeatureNo + i];
                if (arrayFeatures[featureNo][0].indexOf(arrayFeatures[arrayHeterogeneousFeatures[heteroFeatureNo]][0]) != 0) {
                    break;	
                }
                $('td:nth-child('+ (heteroFeatureNo +i +1) +')').hide();													
            }					
        }
    });		
}
*/

//Subsidiary function
function fnShowAndHideRowsForGroupsOfIdenticalTagsDownColumn(featureNo) {
    var idvar = "";
    $(document).ready(function () {
        idvar = "#idBA0-" + featureNo.toString();

        for (rowNo = 1; rowNo <= noOfRows; rowNo++) {
            if (arrayMaster[rowNo][featureNo][0] == "button") {
                if (
                     ($(idvar).html() == "+" && $("#idB" + rowNo.toString() + "-" + featureNo.toString()).html() == "+")
                    || ($(idvar).html() == "-" && $("#idB" + rowNo.toString() + "-" + featureNo.toString()).html() == "-")
            ) {
                    fnShowAndHideRowsForAGroupOfIdenticalTagsInOneIatiActivity(rowNo, featureNo);
                }
            }
        }
        //change the button symbol for all the buttons in the group	
        if ($(idvar).html() == "+") {
            locSymbol = "-";
        }
        else {
            locSymbol = "+";
        }
        locTagNo = fnGetTagNoFromFeatureNo(featureNo);
        for (extraCol = 0; arrayFeatures[locTagNo + extraCol][0].indexOf(arrayFeatures[locTagNo][0]) == 0 ; extraCol++) {
            idvar = "#idBA0-" + (locTagNo + extraCol).toString();
            $(idvar).html(locSymbol);
        }
    });
}

// PRIMARY FUNCTION
function fnCompileAndPrintTheInitialSummary() {
    var introResult = "";
    introResult = "<div class='padded'><ul>";
    introResult += "<li>The source file reports itself generated on <strong>" + generatedDatetime.substring(0, 10) + "</strong> at <strong>" + generatedDatetime.substring(11, 16) + "</strong>.</li>";
    introResult += "<li>Number of iati-activities in the file: <strong>" + noOfIatiActivities + "</strong></li>";
    introResult += htmlForHomogeneityReport;
    introResult += "</ul></div>";
    document.getElementById("idRightItem2").innerHTML = introResult;
    document.getElementById("idRightItem3").innerHTML = "<div class='padded'>Generating the column selector...</div>";
    setTimeout(fnCreateOrderingAndGroupingSelector, standardPauseTime);
}


//PRIMARY FUNCTION
function fnGenerateColumnSelector() {
    var currentFeatureName = "";
    var labelText = "";
    var messageOutputSpace = document.getElementById("idRightItem2");
    var paredFeatureName = "";

    columnSelectionFormHtml = "<div class='padded'>";

    columnSelectionFormHtml += "<h4 class='header' style='float:left; margin-bottom:0px'>Column selection</h4>";
    columnSelectionFormHtml += "<button id='idSettingsButtonG2N1' class=' buttonOff floatLeft' style='clear:right; margin-top:3px' type='button'  onclick='fnHideOrShowDivOnButtonClick(\"2\",  \"1\")'>" + arrayButtons[2][1][2] + "</button>";
    columnSelectionFormHtml += "<br><br>";
    columnSelectionFormHtml += "<div id = 'idQuickOptions'>";
    columnSelectionFormHtml += "<button id='idSettingsButtonG4N1' class=' buttonOn floatLeft' style='margin-bottom:10px' type='button' onclick = 'fnHideOrShowDivOnButtonClick(\"4\",  \"1\"); fnColumnGroupSelect(3, \"defSelYES\");fnBuildAndOutputTheMainTable()'>" + arrayButtons[4][1][2] + "</button> ";
    columnSelectionFormHtml += " <button id='idSettingsButtonG4N2' class=' buttonOff floatLeft' style='margin-bottom:10px' type='button' onclick = 'fnHideOrShowDivOnButtonClick(\"4\",  \"2\"); fnColumnGroupSelect(2, \"homoNO\");fnBuildAndOutputTheMainTable()'>" + arrayButtons[4][2][2] + "</button> ";
    columnSelectionFormHtml += " <span style='float:left; padding-top:4px; padding-right:10px; font-weight:800'>Quick options: </span>";
    columnSelectionFormHtml += "</div>";

    columnSelectionFormHtml += "<div id='idForHideableTextInColumnSelectorDataBox'>";
    columnSelectionFormHtml += "<p>Below is a list of possible columns for the output table (based on a list of all the tags and attributes that can be used in a data file according to the IATI standard). Check a box to show the corresponding column in the table. When your choices of column are made, press the button at the bottom to (re-)generate the table.</p>";
    columnSelectionFormHtml += "<ul>";
    columnSelectionFormHtml += "<li>The tags and attributes named in <span class='lightgrey'>light grey</span> were not used in the currently-loaded data file, so they will not be used in this table. </li>";
    columnSelectionFormHtml += "<li>The tags and attributes named in <span class='pinkOnWhite'>pink</span> contained the same value for every iati-activity in the currently-loaded data file, so they will not be used in this table although their unvarying values are shown above.</li>";
    columnSelectionFormHtml += "<li>The tags and attributes named in <span class='green'>green</span> are the remaining columns available for selection.</li>";
    columnSelectionFormHtml += "<li>Quick group selection buttons: ";
    columnSelectionFormHtml += " <button type='button' onclick = 'fnColumnGroupSelect(3, \"defSelYES\")'>Useful Set #1</button> ";
    columnSelectionFormHtml += " <button type='button' onclick = 'fnColumnGroupSelect(2, \"homoNO\")'>Every green</button> ";
    columnSelectionFormHtml += "</ul>";
    columnSelectionFormHtml += "<form action = ''> <fieldset class='whiteBackground'>";

    for (f = 0; f < 50; f++) {
        columnSelectionFormHtml = fnProcessColumn(f);
    }
    setTimeout(fnGenerateColumnSelectorPart2, 0);
}

function fnGenerateColumnSelectorPart2(columnSelectionFormHtml) {
    var messageOutputSpace = document.getElementById("idRightItem3");

    for (f = 50; f < arrayFeatures.length; f++) {
        columnSelectionFormHtml = fnProcessColumn(f);
    }

    columnSelectionFormHtml += "<br><br><button type='button' onclick = 'fnBuildAndOutputTheMainTable()'>Submit the selection of columns to be shown in the table</button>";
    columnSelectionFormHtml += "<label> You may have to wait a few seconds for the selection to be implemented.</label>"
    columnSelectionFormHtml += "</fieldset> </form></div></div>";

    formOutputSpace = document.getElementById("idSpaceForColumnSelector");
    formOutputSpace.innerHTML = columnSelectionFormHtml;

    document.getElementById("idRightItem3").innerHTML = "<div class='padded'>Building the table...</div>";
    //setTimeout(fnBuildAndOutputTheMainTable,standardPauseTime);	

    //NB the next bit includes the default settings for when the table is first produced
    //setTimeout(fnHideOrShowDivOnButtonClick,standardPauseTime,"1", "2");
    setTimeout(fnMakeArrayForReorderingArrayMaster, standardPauseTime, 13, "ascending");
    //setTimeout(fnHideOrShowDivOnButtonClick,standardPauseTime,"4", "1"); 
    setTimeout(fnColumnGroupSelect, standardPauseTime, 3, "defSelYES");
    setTimeout(fnBuildAndOutputTheMainTable, standardPauseTime);
}


//subsidiary function
function fnProcessColumn(f) {
    currentFeatureName = arrayFeatures[f][0];
    if (currentFeatureName.indexOf("../../../index.html") == -1) {
        columnSelectionFormHtml += "<br>";
        labelText = currentFeatureName;
    }
    if (currentFeatureName.indexOf("/@") > -1) {
        labelText = currentFeatureName.substr(currentFeatureName.indexOf("/@"));
        if (currentFeatureName.indexOf("iati-activity") == 0) {
            columnSelectionFormHtml += " ";
        }
    }
    if (currentFeatureName.indexOf("../../../index.html") > -1 && currentFeatureName.indexOf("/@") == -1) {
        paredFeatureName = currentFeatureName;
        columnSelectionFormHtml += "<br>";
        for (i = 1; paredFeatureName.indexOf(" ") > -1; i++) {   // '4' assumes that no feature name has more than 3 tiers of tags
            paredFeatureName = paredFeatureName.substr((paredFeatureName.indexOf(" ") + 1));
            columnSelectionFormHtml += "&nbsp &nbsp &nbsp";
        }
        labelText = paredFeatureName;
    }

    if (currentFeatureName.indexOf(" ") > -1 && currentFeatureName.indexOf("../../../index.html") == -1) {
        columnSelectionFormHtml += "<br>";
        labelText = currentFeatureName;
    }
    idvar = "idCX-" + f.toString();
    columnSelectionFormHtml += "<input type = 'checkbox' id = '" + idvar + "' ";

    if (arrayFeatures[f][2] == "homoYES" || arrayFeatures[f][2] == "allblankYES") {
        columnSelectionFormHtml += "disabled = 'disabled' ";
    }
    else {
        columnSelectionFormHtml += "checked = 'checked' ";
    }
    columnSelectionFormHtml += "/>";
    columnSelectionFormHtml += "<span ";
    if (arrayFeatures[f][2] == "homoYES") {
        columnSelectionFormHtml += "class = 'pinkOnWhite'";
    }
    if (arrayFeatures[f][2] == "allblankYES") {
        columnSelectionFormHtml += "class = 'lightgrey'";
    }
    if (arrayFeatures[f][2] != "homoYES" && arrayFeatures[f][2] != "allblankYES") {
        columnSelectionFormHtml += "class = 'green'";
    }

    columnSelectionFormHtml += "><label";
    columnSelectionFormHtml += ">" + labelText + " </label></span>";
    return columnSelectionFormHtml;
}


// Subsidiary function
function fnColumnGroupSelect(featureDimension, parameter) {

    for (f = 0; f < arrayFeatures.length ; f++) {
        if (arrayFeatures[f][2] == "homoNO") {
            idvar = "#idCX-" + f.toString();
            $(document).ready(function () {
                if (arrayFeatures[f][featureDimension] == parameter) {
                    $(idvar).prop("checked", true);
                }
                else {
                    $(idvar).prop("checked", false);
                }
            });
        }
    }
}


//PRIMARY FUNCTION
function fnCreateOrderingAndGroupingSelector() {
    var orderingAndGroupingSelectionFormHtml = "";
    var formOutputSpace;

    orderingAndGroupingSelectionFormHtml = "<div class='padded'>";
    orderingAndGroupingSelectionFormHtml += "<h4 class='header' style='float:left'>Row order and grouping</h4>";
    orderingAndGroupingSelectionFormHtml += "<br><br><br>";
    //orderingAndGroupingSelectionFormHtml += "<div style='display:block; border: 1px solid grey'";
    orderingAndGroupingSelectionFormHtml += "<button id='idSettingsButtonG1N1' type='button' class='floatLeft buttonOn' style='margin-bottom:10px' onclick='fnHideOrShowDivOnButtonClick(\"1\",  \"1\"); fnMakeArrayForReorderingArrayMaster(1, \"ascending\"); fnBuildAndOutputTheMainTable()'>" + arrayButtons[1][1][1] + "</button>";
    orderingAndGroupingSelectionFormHtml += "<button id='idSettingsButtonG1N2' type='button' class='floatLeft buttonOff' style='margin-bottom:10px' onclick='fnHideOrShowDivOnButtonClick(\"1\",  \"2\"); fnMakeArrayForReorderingArrayMaster(13, \"ascending\"); fnBuildAndOutputTheMainTable()'>" + arrayButtons[1][2][1] + "</button>";
    orderingAndGroupingSelectionFormHtml += "<button id='idSettingsButtonG1N3' type='button' class='floatLeft buttonOff' style='margin-bottom:10px' onclick='fnHideOrShowDivOnButtonClick(\"1\",  \"3\"); fnMakeArrayForReorderingArrayMaster(17, \"ascending\"); fnBuildAndOutputTheMainTable()'>" + arrayButtons[1][3][1] + "</button>";
    orderingAndGroupingSelectionFormHtml += "<button id='idSettingsButtonG1N4' type='button' class='floatLeft buttonOff' style='margin-bottom:10px' onclick='fnHideOrShowDivOnButtonClick(\"1\",  \"4\"); fnMakeArrayForReorderingArrayMaster(188, \"ascending\"); fnBuildAndOutputTheMainTable()'>" + arrayButtons[1][4][1] + "</button>";
    orderingAndGroupingSelectionFormHtml += " <span style='float:left; padding-top:4px; padding-right:10px; font-weight:800'>Quick options: </span>";

    orderingAndGroupingSelectionFormHtml += "</div>";

    formOutputSpace = document.getElementById("idSpaceForOrderingAndGroupingSelector");
    formOutputSpace.innerHTML = orderingAndGroupingSelectionFormHtml;

    setTimeout(fnGenerateColumnSelector, standardPauseTime);
}



//subsidiary function  			
function fnMakeArrayForReorderingArrayMaster(keyFeatureNo, direction) {
    var arrayReorderPrincipalRows = [];
    var currentBestIANo;
    var currentBestRank;
    var currentBestValue = "";
    var lastKeyRowNo = 0;
    var extraRowNo = 0;
    var temp = 0;

    //make an array of the principal rows (corresponding to iatiActivities) and cross reference against the basic sequence number in the sequence of all the rows of the master table
    var pr = 0;
    var lastR = 0;
    arrayReorderPrincipalRows[0] = [];
    for (r = 1; r <= noOfRows; r++) {
        if ((arrayMaster[r][1][0]).indexOf(".") == -1) {
            pr++;
            arrayReorderPrincipalRows[pr] = [];
            arrayReorderPrincipalRows[pr][0] = r;
            arrayReorderPrincipalRows[pr - 1][1] = r - lastR - 1;  //the number of subordinate rows to the principal row
            lastR = r;
            //document.write(arrayReorderPrincipalRows[pr-1][1].toString() + ", " + pr.toString() + ", " + arrayReorderPrincipalRows[pr][0].toString() + "<br>");
        }
        arrayReorderPrincipalRows[pr][1] = noOfRows - lastR;
    }

    if (pr != noOfIatiActivities) {
        alert("Ooops, something wrong in the re-ordering section");
    }

    //make a key for standardBatchSize the principal rows	
    for (a = 1; a <= noOfIatiActivities; a++) {
        currentBestValue = arrayMaster[(arrayReorderPrincipalRows[a][0])][keyFeatureNo][0];
        currentBestRank = a;
        for (b = a; b <= noOfIatiActivities; b++) {
            if (
                    (direction == "ascending" && arrayMaster[(arrayReorderPrincipalRows[b][0])][keyFeatureNo][0] < currentBestValue)
                    || (direction == "descending" && arrayMaster[(arrayReorderPrincipalRows[b][0])][keyFeatureNo][0] > currentBestValue)
                ) {
                currentBestValue = arrayMaster[(arrayReorderPrincipalRows[b][0])][keyFeatureNo][0];
                currentBestRank = b;
            }
        }
        for (p = 0; p <= 1; p++) {
            temp = arrayReorderPrincipalRows[a][p];
            arrayReorderPrincipalRows[a][p] = arrayReorderPrincipalRows[currentBestRank][p];
            arrayReorderPrincipalRows[currentBestRank][p] = temp;
        }
    }

    //use the above to make a key for standardBatchSize the whole table
    var principalRowNo = 1;
    for (a = 1; a <= noOfIatiActivities; a++) {
        noOfSubsidiaryRows = arrayReorderPrincipalRows[a][1];
        for (b = 0; b <= noOfSubsidiaryRows; b++) {
            arrayConvertTableRowNoToMasterRowNo[principalRowNo + b] = arrayReorderPrincipalRows[a][0] + b;
            //document.write(a.toString() + ", " + principalRowNo.toString() + ", " + noOfSubsidiaryRows.toString() + ", " + arrayConvertTableRowNoToMasterRowNo[principalRowNo+b][0] + "<br>");
        }
        principalRowNo = principalRowNo + noOfSubsidiaryRows + 1;
    }
}


//PRIMARY FUNCTION		  									
function fnBuildAndOutputTheMainTable() {
    var chopPoint = 0;
    var colHeadTop = "";
    var colHeadL2 = "";
    var colHeadRemainder = "";
    var stringForButtonRow = "";
    var stringForColHeadL2 = "";
    var stringForColHeadL3 = "";
    var stringForColHeadTop = "";
    var tableOutputSpace = "";
    //runningCountForTableWidth = scrollbarWidth;
    // column headings
    for (f = 0; f < arrayFeatures.length; f++) {
        if (document.getElementById("idCX-" + f.toString()).checked) {
            colHeadTop = arrayFeatures[f][0];
            colHeadL2 = "";
            colHeadRemainder = "";
            chopPoint = arrayFeatures[f][0].indexOf("../../../index.html");
            if (chopPoint > -1) {
                colHeadTop = arrayFeatures[f][0].substring(0, chopPoint);
                colHeadRemainder = arrayFeatures[f][0].substring(chopPoint + 1);
            }
            colHeadL2 = colHeadRemainder;

            standardHeaderCellString = "<div title='" + f.toString() + "' "
                + "class='headCell column" + f.toString() + "'  "
                + "style='width:" + arrayFeatures[f][1] + "px ' ";

            standardHeaderCellString += ">";
            stringForColHeadTop += standardHeaderCellString + colHeadTop + "</div>";
            stringForColHeadL2 += standardHeaderCellString + colHeadL2 + "</div>";
            stringForButtonRow += standardHeaderCellString + arrayFeatures[f][4] + "</div>";
        }
    }

    mainTableHtmlString =
        "<div id='tableBlock' class='tableWidth'>" +
            "<div id='tableHeadingsBlock' class='tableWidth'>" +
                //NB the classes put in below for different lines of the table heading are probably not needed.
                "<div id='classForTableHeadTop' style='clear:left'>" + stringForColHeadTop + "</div>" +
                "<div id='classForTableHeadL2' style='clear:left'>" + stringForColHeadL2 + "</div>" +
                "<div style='clear:left'>" + stringForButtonRow + "</div>" +
            "</div>" +
            "<div id='tableBodyBlock' class='tableWidth' >"
    ;

    for (tableLayer = 0; tableLayer * noOfRowsPerLayer < noOfRows; tableLayer++) {
        mainTableHtmlString += "<div id='idTableLayerSpace" + tableLayer.toString() + "'></div>";
    }

    mainTableHtmlString += "</div></div>";		//closing the divs for the tableBodyBlock and the tableBlock		

    tableOutputSpace = document.getElementById("idTableOutputSpace");
    tableOutputSpace.innerHTML = mainTableHtmlString;

    setTimeout(fnControlTheAddingOfTableLayers, 100, 0);

}

//PRIMARY FUNCTION
//This useless-looking function is needed to break up a long process and block the browser's parallel processing meanwhile, to enable onscreen monitoring of progress and reduce pop-ups about long-running scripts
function fnControlTheAddingOfTableLayers(noOfRowsProcessed) {
    if (timeToStop != "yes") {
        tableLayerNo = noOfRowsProcessed / noOfRowsPerLayer;
        setTimeout(fnAddTableLayer, 0, tableLayerNo);
    }
    else {
        timeToStop = "";
    }
}    //the program should stop here to wait for user input

//subsidiary functions
function fnAddTableLayer(tableLayerNo) {
    var layerHtmlString = "";
    var r;
    var valueToDisplay;
    var valueToDisplayUncleaned;
    document.getElementById("idRightItem3").innerHTML = "<div class='padded'>Constructing rows: " + (tableLayerNo * noOfRowsPerLayer).toString() + "</div>";
    for (r = 1; r <= noOfRowsPerLayer; r++) {
        tableRowNo = tableLayerNo * noOfRowsPerLayer + r;
        //document.getElementById("idRightItem4").innerHTML = "<div class='padded'>Row: " + r.toString() + "</div>";  //for testing

        if (tableRowNo > noOfRows) {
            //document.getElementById("idRightItem4").innerHTML += "<div class='padded'>in here</div>";  //for testing
            layerOutputSpace = document.getElementById("idTableLayerSpace" + tableLayerNo.toString());
            layerOutputSpace.innerHTML = layerHtmlString;

            document.getElementById("idRightItem3").innerHTML = "<div class='padded'>Applying special styling</div>";
            setTimeout(fnApplySpecialStyling, standardPauseTime);
            timeToStop = "yes";
            break;
        }
        //document.getElementById("idRightItem4").innerHTML += "<div class='padded'>through here</div>";  //for testing

        rowNo = arrayConvertTableRowNoToMasterRowNo[tableRowNo];
        //document.getElementById("idRightItem4").innerHTML += "<div class='padded'>tableRowNo = " + tableRowNo + "</div>";  //for testing

        //document.getElementById("idRightItem4").innerHTML += "<div class='padded'>rowNo = " + rowNo + "</div>";  //for testing

        layerHtmlString += "<div id='id" + rowNo.toString() + "-X' style='clear:left'>";

        for (f = 0; f < arrayFeatures.length; f++) {  //note that this line and the next are the same as for the 'head' table
            //document.getElementById("idRightItem4").innerHTML += "<div class='padded'>f = " + f.toString() + "</div>"; // for testing	
            //if (arrayFeatures[f][2]=="homoNO") { 
            columnClass = "column" + f.toString();
            if (document.getElementById("idCX-" + f.toString()).checked) {
                valueToDisplayUncleaned = arrayMaster[rowNo][f][0];
                valueToDisplay = valueToDisplayUncleaned.replace(/'/g, "&#39");
                //document.getElementById("idRightItem4").innerHTML += rowNo.toString() + ", " + f.toString() + ", vtd:" + valueToDisplay + "<br>";
                //alert(valueToDisplay + "<br>");
                //valueToDisplay = valueToDisplayUncleaned;

                //if the contents of the cell include tag brackets (<) or line-breaks then show them through the css 'title' facility while only printing an elipsis in the main display
                /*
                if (valueToDisplay.indexOf("<")==0 || valueToDisplay.indexOf("\n")==0){
                    arrayMaster[rowNo][f][1] = valueToDisplay;
                    valueToDisplay = "[...]";					
                }
                */
                if (valueToDisplay.indexOf("\'") == 0 || valueToDisplay.indexOf("\"") == 0) {
                    //INSERT ESCAPE CHARACTERS TO AVOID ODD EFFECTS WHEN THE TABLE IS PRINTED
                }


                maxStringLength = Number(arrayFeatures[f][1]) * 0.7 - 15; // Note: this formula aims to allow a fair amount of text in cells of varying width. It should probably be made more sophisticated
                if (valueToDisplay.length > (maxStringLength)) {
                    arrayMaster[rowNo][f][1] = valueToDisplay;
                    valueToDisplay = valueToDisplay.substr(0, maxStringLength) + " [...]";
                }

                if (valueToDisplay == "button") {
                    valueToDisplay = "<button id='idB" + (rowNo).toString() + "-" + f.toString()
                                    + "' type='button' onclick='fnShowAndHideRowsForAGroupOfIdenticalTagsInOneIatiActivity(" + rowNo + "," + f
                                    + ")'>+</button>";
                }
                //arrayMaster[rowNo][featureNoB][0] = "<button id='idB" + rowNo.toString() + "-" + featureNo.toString() + "'";
                //arrayMaster[rowNo][featureNoB][0] += " type='button' onclick='fnShowAndHideRowsForAGroupOfIdenticalTagsInOneIatiActivity(" + rowNo + "," + featureNo + ")'>▼</button>";  	  //NB featureNo is from the parent as the button should bring up a group of cells in a row rather than a single cell

                //if the background colour for the cell has not already been assigned, assign it according to the hierarchy value for that row
                if (arrayMaster[rowNo][f][3] == "") {
                    arrayMaster[rowNo][f][3] = arrayForHierarchyCssValues[arrayMaster[rowNo][featureNoForHierarchy][0]][1];
                }

                layerHtmlString += "<div "
                    + "title='" + arrayMaster[rowNo][f][1] + "' "
                    + "class='bodyCell column" + f.toString() + " " + arrayMaster[rowNo][f][2] + "' "
                    + "style='width:" + arrayFeatures[f][1] + "px; color:" + arrayMaster[rowNo][f][5] + "; background-color:" + arrayMaster[rowNo][f][3] + ";' "
                    + "id='id" + rowNo.toString() + "-" + f.toString() + "' "
                    + ">" + "<p" + arrayMaster[rowNo][f][5] + ">";

                if (valueToDisplay.indexOf("http") != -1) {
                    layerHtmlString += "<a href='" + arrayMaster[rowNo][f][0] + "' target='_blank'>" + valueToDisplay + "</a>";
                }
                else {
                    if (valueToDisplay.indexOf("www.") != -1) {
                        layerHtmlString += "<a href='http://" + arrayMaster[rowNo][f][0] + "' target='_blank'>" + valueToDisplay + "</a>";
                    }
                }

                layerHtmlString += valueToDisplay + "</p></div>";

                //document.write(rowNo + "," + f + ", "+ arrayMaster[rowNo][f][3] + "<br>");
            }

        }
        layerHtmlString += "</div>";	     //closing the div for the row

    }
    layerOutputSpace = document.getElementById("idTableLayerSpace" + tableLayerNo.toString());
    layerOutputSpace.innerHTML = layerHtmlString;
    fnControlTheAddingOfTableLayers(tableRowNo);
}


//PRIMARY FUNCTION
function fnApplySpecialStyling() {
    //apply special styling (e.g. blue font) to columns of interpretive features
    for (f = 0; f < arrayFeatures.length; f++) {
        if (arrayFeatures[f][2] == "homoNO") {
            if (arrayFeatures[f][0].indexOf("*") != -1) {
                $(document).ready(function () {
                    $(".column" + f.toString()).css({ 'color': 'mediumblue' });
                });
            }
        }
    }


    document.getElementById("idRightItem3").innerHTML = "<div class='padded'>Hiding subsidiary rows</div>";
    setTimeout(fnHideSubsidiaryRows, standardPauseTime);
}

function fnHideSubsidiaryRows() {	       //perhaps this could/should be done by css rather than jQuery
    $(document).ready(function () {
        for (r = 0; r < arraySelectedRowNos.length; r++) {
            $('#id' + arraySelectedRowNos[r].toString() + '-X').hide();
        }
    });
    document.getElementById("idRightItem3").innerHTML = "<div class='padded'>Adjusting table width</div>";
    setTimeout(fnAdjustTableWidth, standardPauseTime);
}

//utility function
function fnPopulateArrayFromCsvFile(url) {
    var request = new XMLHttpRequest();
    request.open("GET", url, false);   // BEWARE! it seems browsers may use old versions from the cache even if page is re-loaded. It may be wise to change the file name when the contents are changed
    request.send(null);
    if (request.status != 200) {
        alert("Error trying to load arrayFeatures.txt- " + request.status + ": " + request.statusText);
    }
    return $.csv.toArrays(request.responseText);
}



//utility function
function fnAdjustTableWidth() {
    var currentTagNo = 0;
    var previousTagNo = 0;
    var columnClass = "";
    var featureNo;
    var runningCountForTableWidth = scrollbarWidth;

    for (featureNo = 0; featureNo < arrayFeatures.length; featureNo++) {
        if (document.getElementById("idCX-" + featureNo.toString()).checked) {
            runningCountForTableWidth += Number(arrayFeatures[featureNo][1]) + 2;

            //thicken the border between different tag groups
            columnClass = "column" + featureNo.toString();
            previousTagNo = currentTagNo;
            currentTagNo = fnGetTagNoFromFeatureNo(featureNo);
            if (currentTagNo != previousTagNo) {
                $(document).ready(function () {
                    $('.' + columnClass).css({ 'border-left': '2px solid #333333' });
                });
                runningCountForTableWidth += 1;
            }
        }
    }

    $(document).ready(function () {
        $('.tableWidth').width(runningCountForTableWidth.toString() + 'px');
        $('#idUpperHorizontalShadowCaster').css({ 'width': (runningCountForTableWidth - scrollbarWidth).toString() + 'px' });
        $('#idLowerHorizontalShadowCaster').css({ 'width': (runningCountForTableWidth - scrollbarWidth).toString() + 'px' });
        $('#idRightVerticalShadowCaster').css({ 'left': (runningCountForTableWidth - scrollbarWidth).toString() + 'px' });
        //$('#idRightVerticalBorder').css({'left': (runningCountForTableWidth) + 'px'});    //NB not showing at present. Why?				
    });

    document.getElementById("idRightItem3").innerHTML = "<div class='padded'><p>Ready.</p><p>See the table by clicking on the 'Generated table' tab, above.</p><p>Adjust settings (opposite) as wanted.</p></div>";

}


/* Unused function    - 	would need re-writing if something like this is to be resurrected
function fnGenerateDropDownLists()	{
    var idSelectColumn = "";
    formResult = "";
    var usedColumnNo = -1;
        
    for (columnNo=1; columnNo<=arrayDefaultColumnSelections.length; columnNo++) {
        formResult += "<label>    Column " + columnNo + ": </label>";	
        formResult += "<select id='idSelectColumn" + columnNo.toString() + "'>";				
        for (featureNo=0; featureNo<noOfFeatures; featureNo++) {
            featureName = arrayFeatures[featureNo][0];
            formResult += "<option value ='" + featureNo + "'";   //? should be 'featureNo + 1' in order to get correct column widths ??
            if (defaultColumnSelectionNo < arrayDefaultColumnSelections.length) {						
                if (arrayDefaultColumnSelections[defaultColumnSelectionNo]==featureName) {
                    if (columnNo > usedColumnNo) {
                        formResult += " selected";
                        defaultColumnSelectionNo = defaultColumnSelectionNo + 1;
                        usedColumnNo = columnNo;
                    }		
                }
            } 			
            formResult += ">" + arrayFeatures[featureNo][0] + "</option>";				
        }
        formResult += "</select><br>";          
    }
    formResult += "<button type='button' onclick='alert()'>Submit</button>	"
    formOutputSpace = document.getElementById("idRightItem1");
    formOutputSpace.innerHTML = formResult;		
}	
*/



// Utility function
function fnHideOrShowDivOnButtonClick(buttonGroup, buttonNoInGroup) {
    var idOfNewlyPressedButton = arrayButtons[buttonGroup][buttonNoInGroup][0];
    var idOfDivToShow = arrayButtons[buttonGroup][buttonNoInGroup][3];
    var idOfPreviouslySelectedButton = arrayButtons[buttonGroup][0][0];
    var idOfDivToHide = arrayButtons[buttonGroup][0][3];

    if (idOfNewlyPressedButton == idOfPreviouslySelectedButton) {					//if the button is double-pressed
        $(document).ready(function () {
            $("#" + idOfNewlyPressedButton).removeClass("buttonOn").addClass("buttonOff");
            $("#" + idOfNewlyPressedButton).html(arrayButtons[buttonGroup][0][2]);
            $("#" + idOfDivToHide).hide();

            arrayButtons[buttonGroup][0][0] = "";
            arrayButtons[buttonGroup][0][1] = "";
            arrayButtons[buttonGroup][0][2] = "";
            arrayButtons[buttonGroup][0][3] = "";
        });
    }
    else {
        $(document).ready(function () {

            $("#" + idOfNewlyPressedButton).removeClass("buttonOff").addClass("buttonOn");
            $("#" + idOfNewlyPressedButton).html(arrayButtons[buttonGroup][buttonNoInGroup][1]);
            $("#" + idOfDivToShow).show();

            $("#" + idOfPreviouslySelectedButton).removeClass("buttonOn").addClass("buttonOff");
            $("#" + idOfPreviouslySelectedButton).html(arrayButtons[buttonGroup][0][2]);
            $("#" + idOfDivToHide).hide();

            arrayButtons[buttonGroup][0][0] = idOfNewlyPressedButton;
            arrayButtons[buttonGroup][0][1] = arrayButtons[buttonGroup][buttonNoInGroup][1];
            arrayButtons[buttonGroup][0][2] = arrayButtons[buttonGroup][buttonNoInGroup][2];
            arrayButtons[buttonGroup][0][3] = idOfDivToShow;
        });
    }
}


//Utility function
function fnGetTagNoFromFeatureNo(locFeatureNo) {
    locFeatureName = arrayFeatures[locFeatureNo][0];
    locTagName = locFeatureName;
    if (locFeatureName.indexOf("../../../index.html") != -1) {
        locTagName = locFeatureName.substr(0, locFeatureName.indexOf("../../../index.html"));  //NB this will need to be elaborated to cope with deeper-level tags
    }
    locTagNo = fnGetFeatureNoMatchingAString(locTagName);
    return locTagNo;
}


//Utility function	
function fnShowAndHideRowsForAGroupOfIdenticalTagsInOneIatiActivity(baseRowNo, featureNo) {
    var colorVariable = "";
    var highestNoOfShownExtraRowsforThisRowNo = 0;       // used when hiding rows which have previously been expanded
    var idvar = "";
    var noOfRowSegmentsToRemove = 0;

    $(document).ready(function () {
        idvar = "#idB" + baseRowNo.toString() + "-" + featureNo.toString();

        locTagNo = fnGetTagNoFromFeatureNo(featureNo);

        if ($(idvar).html() == "+") {
            //change the button symbol for all the buttons in the group						
            for (extraCol = 0; arrayFeatures[locTagNo + extraCol][0].indexOf(arrayFeatures[locTagNo][0]) == 0 ; extraCol++) {
                idvar = "#idB" + baseRowNo.toString() + "-" + (locTagNo + extraCol).toString();
                $(idvar).html("-");
            }

            //for (extraRow=1; arrayMaster[(baseRowNo+extraRow)][1][0].toString().indexOf(arrayMaster[baseRowNo][1][0]) == 0; extraRow++){
            for (extraRow = 1; baseRowNo + extraRow <= noOfRows; extraRow++) {

                //decide if the row is to be operated on
                if (arrayMaster[(baseRowNo + extraRow)][1][0].toString().indexOf(arrayMaster[baseRowNo][1][0]) != 0) {
                    break;
                }
                var showRow = "no";
                for (extraCol = 0; arrayFeatures[locTagNo + extraCol][0].indexOf(arrayFeatures[locTagNo][0]) == 0 ; extraCol++) {
                    if (arrayMaster[baseRowNo + extraRow][locTagNo + extraCol][0] != "") {
                        showRow = "yes";
                    }
                }
                if (showRow == "no") {
                    break;
                }
                //if so, show the table row
                idvar = "#id" + (baseRowNo + extraRow).toString() + "-X";
                $(idvar).show();
                /*
                // but make sure the row in general is blanked out
                for (featureNo=0; featureNo < arrayFeatures.length; featureNo++){
                    idvar = "#id" + (baseRowNo+extraRow).toString() + "-" + featureNo.toString();
                    $(idvar).css({"color":"grey",'background-color':"grey","border": "grey"});
                }
                */

                //however replace the blanked-out styling of the cells in the group

                for (extraCol = 0; arrayFeatures[locTagNo + extraCol][0].indexOf(arrayFeatures[locTagNo][0]) == 0 ; extraCol++) {
                    idvar = "#id" + (baseRowNo + extraRow).toString() + "-" + (locTagNo + extraCol).toString();
                    colorVariable = arrayForHierarchyCssValues[arrayMaster[baseRowNo][featureNoForHierarchy][0]][1];
                    if (extraCol == 0) {
                        $(idvar).css({ "color": "black", 'background-color': colorVariable, "border": "2px,1px,1px,1px solid black" });
                    }
                    else {
                        $(idvar).css({ "color": "black", 'background-color': colorVariable, "border": "1px solid #999999" });
                    }
                }
            }
            arrayMaster[baseRowNo][locTagNo][4] = (extraRow - 1);
        }
        else {
            //change the button symbol for all the buttons in the group
            for (extraCol = 0; arrayFeatures[locTagNo + extraCol][0].indexOf(arrayFeatures[locTagNo][0]) == 0 ; extraCol++) {
                idvar = "#idB" + baseRowNo.toString() + "-" + (locTagNo + extraCol).toString();
                $(idvar).html("+");
            }

            noOfRowSegmentsToRemove = arrayMaster[baseRowNo][locTagNo][4];
            arrayMaster[baseRowNo][locTagNo][4] = 0;
            highestNoOfShownExtraRowsforThisrowNo = 0;
            for (f = 0; f < noOfFeatures; f++) {
                if (arrayMaster[baseRowNo][f][4] >= highestNoOfShownExtraRowsforThisrowNo) {
                    highestNoOfShownExtraRowsforThisrowNo = arrayMaster[baseRowNo][f][4];
                }
            }
            for (extraRow = noOfRowSegmentsToRemove ; extraRow > 0; extraRow--) {
                idvar = "#id" + (baseRowNo + extraRow).toString() + "-" + locTagNo.toString();
                $(idvar).css({ "color": colourForBlankAreasInTable, 'background-color': colourForBlankAreasInTable, "border": "colourForBlankAreasInTable" });

                if (extraRow > highestNoOfShownExtraRowsforThisrowNo) {

                    $("#id" + (baseRowNo + extraRow).toString() + "-X").hide();
                }
                //make sure the relevant cells in the hideable row are now blanked-out 
                for (f = 1; f < noOfFeatures ; f++) {
                    if (arrayFeatures[locTagNo + f][0].indexOf(arrayFeatures[locTagNo][0]) != 0) {
                        break;
                    }
                    idvar = "#id" + (baseRowNo + extraRow).toString() + "-" + (locTagNo + f).toString();
                    $(idvar).css({ "color": colourForBlankAreasInTable, 'background-color': colourForBlankAreasInTable, "border": "colourForBlankAreasInTable" });
                }
            }           	// end of main loop for hiding the shown row-segments											
        }           		//end of action dependent on cell button state
    }); 					//end of $(document).ready(function()							
}     						// end of function

//Utility function


//Utility function	
function fnFormatMoneyInMillionsTo2DP(amount, transactionCurrency) {
    var millionsString = "";
    var subMillionsString = "";
    var thousands = Math.round(amount / 1000);
    var thousandsString = thousands.toString();
    var len = thousandsString.length;
    if (len < 4) { millionsString = "0"; }
    else { millionsString = thousandsString.substring(0, len - 3); }
    submillionsString = thousandsString.substring(len - 3);
    if (len == 1) { submillionsString = "00" + submillionsString; }
    if (len == 2) { submillionsString = "0" + submillionsString; }
    result = transactionCurrency + " " + millionsString + "." + submillionsString + " m";
    if (amount == 0) { result = ""; }
    return result;
}


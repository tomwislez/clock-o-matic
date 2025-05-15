$(document).ready(function(){

    //Declare global variables
    const version = "v3.10.0"
    var settings;
    var clock;
    var timerPhase;
    var countdownPhase;
    var selectedOption;
    var displayFullClock;
    var displayClockColor;
    var hideControls;
    var timerDefaultClock;
    var countdownDefaultClock;
    var countdownOvertime;
    var showPlus;
    var autoHideControlsEnabled;
    var brightBackgroundColorsEnabled;
    var clockSize;
    var fullscreenEnabled;



    
    console.log("************************* \nClockomaticscript.js " + version + "\n*************************")
    $("#version").text(version)

    
    function storeSettings(){   //A function to store settings.
        let settingsString = JSON.stringify(settings)
        localStorage.setItem("settings.json", settingsString)
        console.log("Settings saved!")
    }

    function loadSettings(){    //Load settings from local storage and fix issues of non existing values.
        let settingsJSON = localStorage.getItem("settings.json")
        try {
            settings = JSON.parse(settingsJSON);
        } catch (error){
            console.log(error);
            settings = {};    //if the json object is not parseable, it probably doesn't exist.
        } 
        if (settings == null){ //if the variable is null, make it an object.
            settings = {};
        }


        const defaultStoredSettings = {
            "selectedOption": 1, 
            "displayFullClock": false, 
            "displayClockColor": "white", 
            "timerDefaultClock": "Januari 1, 2000 00:00:00",
            "countdownDefaultClock": "Januari 1, 2000 00:00:10",
            "autoHideControlsEnabled" : false,
            "brightBackgroundColorsEnabled": false,
            "clockSize": 22,
        }


        settings = Object.fromEntries(
            Object.entries(defaultStoredSettings).map(([key, defaultValue]) => [    //loops over each key-value in defaultStoredSettings and wraps it back into an object.
              key, key in settings ? settings[key] : defaultValue,   //if that key exists in settings, use the value from settings. If it doesn't exist, fall back to default.
            ])
        );

        //DEFINE VARIABLES FROM SETTINGS, OR DEFAULT ONES FOR STARTUP.
        clock = new Date();
        timerPhase = 0; //0: Reset, 1: Start, 2: Stop
        countdownPhase = 0; //0: Reset, 1: Start upwards, 2: Start downwards, 3: Stop
        selectedOption = settings.selectedOption;
        displayFullClock = settings.displayFullClock;
        displayClockColor = settings.displayClockColor;
        hideControls = false;
        timerDefaultClock = settings.timerDefaultClock;
        countdownDefaultClock = settings.countdownDefaultClock;
        countdownOvertime = false;
        showPlus = "";
        autoHideControlsEnabled = settings.autoHideControlsEnabled;
        brightBackgroundColorsEnabled = settings.brightBackgroundColorsEnabled;
        clockSize = settings.clockSize;
        fullscreenEnabled = false;

        console.log("Loaded Settings:", settings)
        storeSettings(); //if settings are loaded, save them again in browser.
    }

    function inactivityTimeout(){
        let timer;
        const IDLE_TIMEOUT = 5000; // In milliseconds

        const resetTimer = () => {
            clearTimeout(timer);
            if (autoHideControlsEnabled){
                hideControls = false;
                updateUX(false);

                timer = setTimeout(() => {
                hideControls = true;
                updateUX(false);
                }, IDLE_TIMEOUT);
            }
            
        };
        
        window.onload = resetTimer;
        document.onmousemove = resetTimer;
        document.onmousedown = resetTimer;
        document.onscroll = resetTimer;
    }

    function updateUX(toggleMenu = true) {
        $("#controlBlock1").addClass("hidden");
        $("#controlBlock2").addClass("hidden");
        $("#controlBlock3").addClass("hidden");
        $("#controlBlock4").addClass("hidden");
        $("#controlBlock5").addClass("hidden");
        $("#controlBlock6").addClass("hidden");
        $("#controlBlock6Bottom").addClass("hidden");
        $("#option1").removeClass("menu-item-active");
        $("#option2").removeClass("menu-item-active");
        $("#option3").removeClass("menu-item-active");

        $("#clockElement").css("font-size", "calc(" + clockSize + "vw)")
        if (selectedOption == 1){
            $("#option1").addClass("menu-item-active");
            $("#option5").addClass("hidden");
        } else {
            $("#option5").removeClass("hidden");
        }
        if (selectedOption == 2){
            $("#option2").addClass("menu-item-active");
            if (hideControls == false ){
                if (timerPhase == 1){
                    $("#controlBlock5").removeClass("hidden");
                } else {
                    $("#controlBlock4").removeClass("hidden");
                }
                $("#controlBlock6").removeClass("hidden");
            }
        }
        if (selectedOption == 3){
            $("#option3").addClass("menu-item-active");
            if (hideControls == false ){
                $("#controlBlock1").removeClass("hidden");
                $("#controlBlock2").removeClass("hidden");
                $("#controlBlock3").removeClass("hidden");
                if (countdownPhase == 1 || countdownPhase == 2){  //Only show stop button when the clock is counting, else show start
                    $("#controlBlock5").removeClass("hidden");
                } else {
                    $("#controlBlock4").removeClass("hidden");
                }                
                $("#controlBlock6").removeClass("hidden");
                $("#controlBlock6Bottom").removeClass("hidden");
            }
            displayClockColor = "white"
            if (countdownOvertime){
                if (brightBackgroundColorsEnabled){
                    $('body').css('background-color', 'rgb(168, 0, 0)')
                    $('#menu').css('background-color', 'rgb(168, 0, 0)')
                } else {
                    $('body').css('background-color', 'rgb(60, 0, 0)')
                    $('#menu').css('background-color', 'rgb(60, 0, 0)')
                }
            } else {
                if (brightBackgroundColorsEnabled){
                    $('body').css('background-color', 'rgb(0, 168, 0)')
                    $('#menu').css('background-color', 'rgb(0, 168, 0)')
                } else {
                    $('body').css('background-color', 'rgb(0, 60, 0)')
                    $('#menu').css('background-color', 'rgb(0, 60, 0)')
                }

            }
            $("#option6").addClass('hidden') //hide option to change clock color
            $("#option7").removeClass('hidden') //show option to change bright/dim colors
        } else {
            $("#option6").removeClass('hidden') //show option to change clock color
            $("#option7").addClass('hidden') //hide option to change bright/dim colors
            displayClockColor = settings.displayClockColor;
            $('body').css('background-color', 'black')
            $('#menu').css('background-color', 'black')
        }

        if (autoHideControlsEnabled){
            $("#option4").text("Always show controls")
        } else {
            $("#option4").text("Auto hide controls")
        }
        if (displayFullClock){
            $("#option5").text("Display compact clock")
        } else {
            $("#option5").text("Display full clock")
        }
        if (displayClockColor == "red"){
            $("#clockElement").addClass("color-red")
            $("#option6").text("Display clock color: WHITE")
        } else {
            $("#clockElement").removeClass("color-red")
            $("#option6").text("Display clock color: RED")
        }
        if (brightBackgroundColorsEnabled){
            $("#option7").text("Use dim colors")
        } else {
            $("#option7").text("Use bright colors")
        }
        if (toggleMenu){
            $("#menuOptions").toggleClass("hidden");
        }
        updateClock(false); //only updates clock look, do not change time.
    };

    function addZero(input){
        input = input.toString();
        if (input.length == 1){
            return "0" + input;
        } else {
            return input;
        }
    }


    function displaySettingClock(input){
        if (displayFullClock == true || selectedOption == 1) {
            return input;
        } else {
            if (input == "99:99:"){  //this is disabled and need to be reworked
                return "";
            } else if (input.substr(0,3) == "00:"){
                return input.substr(3,4);
            } else {
                return input;
            }
        }
    }

    function updateClock(updateTime = true){
        if (updateTime){
            switch (selectedOption){
                case 1:
                    option1Clock();
                    break;
                case 2:
                    //option2
                    option2Timer();
                    break;
                case 3:
                    //option3
                    option3Countdown();
                    if (countdownOvertime == true){
                        showPlus = "+";
                    } else {
                        showPlus = "";
                    }
                    break;
                case 4:
                    //option4
                    break;
                case 5:
                    //option5
                    break;
            }
        }
        

        var clockText = showPlus + displaySettingClock(addZero(clock.getHours()) + ":" + addZero(clock.getMinutes()) + ":" ) + addZero(clock.getSeconds())
        $("#clockElement").text(clockText); 
    }



    //*********************BUTTON CLICKS***************************************************************//
    $("#menuSettings").click(function(){
        $("#menuOptions").toggleClass("hidden")
    });
    $("#menuFullscreenEnable").click(function(){
        document.documentElement.requestFullscreen();
        $("#menuFullscreenEnable").addClass("hidden");
        $("#menuFullscreenDisable").removeClass("hidden");
    });
    $("#menuFullscreenDisable").click(function(){
        document.exitFullscreen();
        $("#menuFullscreenDisable").addClass("hidden");
        $("#menuFullscreenEnable").removeClass("hidden");
    });
    $("#clockpage").click(function(){ //catch a click outside menu to close menu
        $("#menuOptions").addClass("hidden")
    })
    //menubuttons
    $("#option1").click(function(){
        selectedOption = 1;
        settings.selectedOption = 1;
        showPlus = "";
        updateUX();
        updateClock();
        storeSettings();
    })
    $("#option2").click(function(){
        selectedOption = 2;
        settings.selectedOption = 2;
        timerPhase = 0;
        showPlus = "";
        updateUX();
        updateClock();
        storeSettings();
    })
    $("#option3").click(function(){
        selectedOption = 3;
        settings.selectedOption = 3;
        countdownPhase = 0;
        showPlus = "";
        updateUX();        
        updateClock();
        storeSettings();
    })
    $("#option4").click(function(){

        if (autoHideControlsEnabled == false){
            autoHideControlsEnabled = true
        } else {
            autoHideControlsEnabled = false
        }
        settings.autoHideControlsEnabled = autoHideControlsEnabled;
        storeSettings();
        updateUX(false);


    })
    $("#option5").click(function(){
        if (displayFullClock == false){
            displayFullClock = true;
        } else {
            displayFullClock = false;
        };
        settings.displayFullClock = displayFullClock;
        storeSettings();
        updateUX(false);
    })
    $("#option6").click(function(){
        if (displayClockColor == "red"){
            displayClockColor = "white";
        } else {
            displayClockColor = "red";
        };
        settings.displayClockColor = displayClockColor;
        storeSettings();
        updateUX(false);
    })
    $("#option7").click(function(){
        if (brightBackgroundColorsEnabled){
            brightBackgroundColorsEnabled = false;
        } else {
            brightBackgroundColorsEnabled = true;
        };
        settings.brightBackgroundColorsEnabled = brightBackgroundColorsEnabled;
        storeSettings();
        updateUX(false);
    })

    $("#option8").click(function(){

        if (clockSize - 1 > 10){
            clockSize = clockSize - 1;
        }
        settings.clockSize = clockSize;
        storeSettings();
        updateUX(false)
    });
    $("#option9").click(function(){
        if (clockSize + 1 < 30){
            clockSize = clockSize + 1;
        }        
        settings.clockSize = clockSize;
        storeSettings();
        updateUX(false)
    });





    
    //control buttons
    $("#controlBlock1Top").click(function(){        //+1 hour
        if (selectedOption == 3){
            option3Countdown(1)
        }
    })
    $("#controlBlock1Bottom").click(function(){     //-1 hour
        if (selectedOption == 3){
            option3Countdown(2)
        }
    })
    $("#controlBlock2Top1").click(function(){       //+1 min
        if (selectedOption == 3){
            option3Countdown(3)
        }
    })
    $("#controlBlock2Top2").click(function(){       //+10 min
        if (selectedOption == 3){
            option3Countdown(4)
        }
    })
    $("#controlBlock2Bottom1").click(function(){    //-1 min
        if (selectedOption == 3){
            option3Countdown(5)
        }
    })
    $("#controlBlock2Bottom2").click(function(){    //-10 min
        if (selectedOption == 3){
            option3Countdown(6)
        }
    })
    $("#controlBlock3Top1").click(function(){       //+1 sec
        if (selectedOption == 3){
            option3Countdown(7)
        }
    })
    $("#controlBlock3Top2").click(function(){       //+10 sec
        if (selectedOption == 3){
            option3Countdown(8)
        }
    })
    $("#controlBlock3Bottom1").click(function(){    //-1 sec
        if (selectedOption == 3){
            option3Countdown(9)
        }
    })
    $("#controlBlock3Bottom2").click(function(){    //-10 sec
        if (selectedOption == 3){
            option3Countdown(10)
        }
    })
    $("#controlBlock4Top").click(function(){        //Start
        switch (selectedOption){
            case 2:
                timerPhase = 1;
                break;
            case 3:
                if (countdownOvertime){
                    countdownPhase = 2;
                } else {
                    countdownPhase = 1;
                }
                
                break;
        };
        updateUX(false);
    })
    $("#controlBlock5Top").click(function(){        //Stop
        switch (selectedOption){
            case 2:
                timerPhase = 2;
                break;
            case 3:
                countdownPhase = 3;
                break;
        };
        updateUX(false);
    })
    $("#controlBlock6Top").click(function(){       //Reset
        switch (selectedOption){
            case 2:
                timerPhase = 0;
                break;
            case 3:
                countdownPhase = 0;
                break;
        };
    })

    $("#controlBlock6Bottom").click(function(){       //Save current as default
        switch (selectedOption){
            case 3:
                countdownDefaultClock = clock;
                settings.countdownDefaultClock = clock
                storeSettings();
                $("#controlBlock6TextBottom").text("saved!")
                setTimeout(function(){$("#controlBlock6TextBottom").text("")}, 5000);
            break;
        };
    })

    

    //**********SUB CLOCK FUNCTIONS LOGIC*****************************************************************//

    function option1Clock(){
        clock = new Date();
    }

    function option2Timer(){

        switch (timerPhase){
            case 0: //Reset phase
                clock = new Date(timerDefaultClock)
                break;
            case 1: //Timer Start
                clock = new Date(clock.getTime() + 1000);
                break;
            case 2: //Timer Stop
                //do nothing
                break;
        };
    };


    function option3Countdown(button = 0){
        
        switch (button){
            case 0:
                break; //skip this section when no button is clicked.
            case 1:
                if ((clock.getTime() + 3600000) <= 946767599000){
                    clock = new Date(clock.getTime() + 3600000) //add 1 hour
                }                
                break;
            case 2:
                if ((clock.getTime() - 3600000) >= 946681200000){
                    clock = new Date(clock.getTime() - 3600000) //remove 1 hour
                } 
                break;
            case 3:
                if ((clock.getTime() + 60000) <= 946767599000){
                    clock = new Date(clock.getTime() + 60000) //add 1 minute
                } 
                break;
            case 4:
                if ((clock.getTime() + 600000) <= 946767599000){
                    clock = new Date(clock.getTime() + 600000) //add 10 minutes
                } 
                break;
            case 5:
                if ((clock.getTime() - 60000) >= 946681200000){
                    clock = new Date(clock.getTime() - 60000) //remove 1 minute
                } 
                break;
            case 6:
                if ((clock.getTime() - 600000) >= 946681200000){
                    clock = new Date(clock.getTime() - 600000) //remove 10 minutes
                } 
                break;
            case 7:
                if ((clock.getTime() + 1000) <= 946767599000){
                    clock = new Date(clock.getTime() + 1000) //add 1 second
                };
                break;
            case 8:
                if ((clock.getTime() + 10000) <= 946767599000){
                    clock = new Date(clock.getTime() + 10000) //add 10 seconds
                };
                break;
            case 9:
                if ((clock.getTime() - 1000) >= 946681200000){
                    clock = new Date(clock.getTime() - 1000) //remove 1 second
                };
                break;
            case 10:
                if ((clock.getTime() - 10000) >= 946681200000){
                    clock = new Date(clock.getTime() - 10000) //remove 10 seconds
                };
                break;

        }
        if (button == 0){ //countdown triggered and not a button click.
            
            switch (countdownPhase){
                case 0: //Reset phase
                    clock = new Date(countdownDefaultClock)
                    countdownOvertime = false;
                    countdownPhase = 3;
                    updateUX(false);
                    break;
                case 1: //Counting down phase
                    if ((clock.getTime() - 1000) >= 946681200000){ //do not count below zero
                        clock = new Date(clock.getTime() - 1000);
                        countdownOvertime = false;
                    }  else {
                        clock = new Date(clock.getTime() + 1000)    //when changing to phase 2 (counting upwards) we need to add a second to the clock, otherwise we skip a second! (zero will be displayed twice)
                        countdownOvertime = true;
                        countdownPhase = 2;
                        updateUX(false);
                    }                 
                    break;
                case 2: //Counting up phase
                    clock = new Date(clock.getTime() + 1000)
                    break;
                case 3: //Stop phase
                    //do nothing
                    break;
            }
        } else {
            updateClock(false) //update the clock without counting upwards or downwards
        }
       

    }





    loadSettings();
    updateUX(false); //initialize UX
    updateClock();  //updateClock for the first time to initialize the UX. Overrides the last line of updateUX()
    setInterval(updateClock, 1000);
    inactivityTimeout();
    console.log("Loading complete!")






})







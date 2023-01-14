class IngamePanelCustomPanel extends TemplateElement {
    constructor() {
        super(...arguments);

        this.panelActive = false;
        this.started = false;
        this.ingameUi = null;
        this.busy = false;
        this.debugEnabled = false;

        if (this.debugEnabled) {
            var self = this;
            setTimeout(() => {
                self.isDebugEnabled();
            }, 1000);
        } else {
            this.initialize();
        }
    }
    isDebugEnabled() {
        var self = this;
        if (typeof g_modDebugMgr != "undefined") {
            g_modDebugMgr.AddConsole(null);
            g_modDebugMgr.AddDebugButton("Identifier", function() {
                console.log('Identifier');
                console.log(self.instrumentIdentifier);
            });
            g_modDebugMgr.AddDebugButton("TemplateID", function() {
                console.log('TemplateID');
                console.log(self.templateID);
            });
            g_modDebugMgr.AddDebugButton("Source", function() {
                console.log('Source');
                console.log(window.document.documentElement.outerHTML);
            });
			g_modDebugMgr.AddDebugButton("close", function() {
				console.log('close');
				if (self.ingameUi) {
					console.log('ingameUi');
					self.ingameUi.closePanel();
				}
			});
            this.initialize();
        } else {
            Include.addScript("/JS/debug.js", function () {
                if (typeof g_modDebugMgr != "undefined") {
                    g_modDebugMgr.AddConsole(null);
                    g_modDebugMgr.AddDebugButton("Identifier", function() {
                        console.log('Identifier');
                        console.log(self.instrumentIdentifier);
                    });
                    g_modDebugMgr.AddDebugButton("TemplateID", function() {
                        console.log('TemplateID');
                        console.log(self.templateID);
                    });
                    g_modDebugMgr.AddDebugButton("Source", function() {
                        console.log('Source');
                        console.log(window.document.documentElement.outerHTML);
                    });
                    g_modDebugMgr.AddDebugButton("close", function() {
                        console.log('close');
                        if (self.ingameUi) {
                            console.log('ingameUi');
                            self.ingameUi.closePanel();
                        }
                    });
                    self.initialize();
                } else {
                    setTimeout(() => {
                        self.isDebugEnabled();
                    }, 2000);
                }
            });
        }
    }
    connectedCallback() {
        super.connectedCallback();

        var self = this;
        this.ingameUi = this.querySelector('ingame-ui');

        this.iframeElement = document.getElementById("CustomPanelIframe");

        if (this.ingameUi) {
            this.ingameUi.addEventListener("panelActive", (e) => {
                console.log('panelActive');
                self.panelActive = true;
                if (self.iframeElement) {
                    // self.iframeElement.src = 'http://127.0.0.1:5500/lxn-online/dist/index.html?ingamepanel';
                    self.iframeElement.src = 'https://lxn2.web.app/index.html?ingamepanel';
                }
            });
            this.ingameUi.addEventListener("panelInactive", (e) => {
                console.log('panelInactive');
                self.panelActive = false;
                if (self.iframeElement) {
                    self.iframeElement.src = '';
                }
            });
            this.ingameUi.addEventListener("onResizeElement", () => {
                //self.updateImage();
            });
            this.ingameUi.addEventListener("dblclick", () => {
                document.getElementById("CustomPanel").classList.toggle("interact");
			});
        }

		
    }
    initialize() {
        if (this.started) {
            return;
        }

        document.body.classList.add("interact");

        setTimeout(() => {
            if(GetStoredData("lxn-ui")) {
                this.grid = GetStoredData("lxn-ui");
            }
        },500)

        window.addEventListener('message',(event) => {
            // console.log("msg from child: " + event.data);

            if(event.data == "takeFocus") {
                document.body.classList.remove("interact");

                setTimeout( unblockSensor ,1000)
            }

            if(event.data == "connected") {
                this.loadflightplan();

                if(this.grid) {
                    this.setVar("lxn-ui",this.grid);
                }
            }

            if(event.data[0] == "setObject") {
                window[event.data[1]] = JSON.parse(event.data[2]);
            }

            if(event.data[1] == "lxn-ui") {
                SetStoredData("lxn-ui", event.data[2]);
            }

        })

        //var self = this;
        //this.m_MainDisplay = document.querySelector("#MainDisplay");
        //this.m_MainDisplay.classList.add("hidden");

        //this.m_Footer = document.querySelector("#Footer");
        //this.m_Footer.classList.add("hidden");

        //this.iframeElement = document.getElementById("CustomPanelIframe");
        //this.ingameUi = this.querySelector('ingame-ui');

        /*if (this.ingameUi) {
            this.ingameUi.addEventListener("panelActive", (e) => {
                console.log('panelActive');
                self.updateImage();
            });
            this.ingameUi.addEventListener("panelInactive", (e) => {
                console.log('panelInactive');
                self.iframeElement.src = '';
            });
            this.ingameUi.addEventListener("onResizeElement", () => {
                //self.updateImage();
            });
            this.ingameUi.addEventListener("dblclick", () => {
                if (self.m_Footer) {
                    self.m_Footer.classList.remove("hidden");
                }
            });
        }*/
        this.started = true;
    }
    disconnectedCallback() {
        super.disconnectedCallback();
    }
    updateImage() {

    }

    loadflightplan() {

        RegisterViewListener("JS_LISTENER_FLIGHTPLAN", () => {
            
            Coherent.call("GET_FLIGHTPLAN")
                .then((flightPlanData) => {

                    if (flightPlanData.waypoints.length > 1) {
                        this.setObject("task",flightPlanData);
                    }

                })
        });
    }

    setData(key,value) {
        let child = this.iframeElement.contentWindow;
        value = typeof(value) == "object" ? JSON.stringify(value) : value;

        child.postMessage(["setVar", key, value],'*');
    }

    setObject(key,ob) {
        let child = this.iframeElement.contentWindow;
        child.postMessage(["setObject", key, JSON.stringify(ob)],'*');
    }

    setVar(key,val) {
        let child = this.iframeElement.contentWindow;
        child.postMessage(["setVar", key, val],'*');
    }
}
window.customElements.define("ingamepanel-custom", IngamePanelCustomPanel);
checkAutoload();
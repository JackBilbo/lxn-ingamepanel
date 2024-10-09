class IngamePanelCustomPanel extends TemplateElement {
    constructor() {
        super(...arguments);

        this.panelActive = false;
        this.started = false;
        this.ingameUi = null;
        this.busy = false;
        this.debugEnabled = false;

        this.initialize();
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
                    // self.iframeElement.src = 'https://lxn2.web.app/index.html?ingamepanel';
                    self.iframeElement.src = 'http://localhost:3000/';
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

    Update() {
        console.log("Panel-Update");
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
                } else {
                    if(GetStoredData("lxn-ui")) {
                        this.grid = GetStoredData("lxn-ui");
                        this.setVar("lxn-ui",this.grid);
                    }
                }
            }

            if(event.data[0] == "setObject") {
                window[event.data[1]] = JSON.parse(event.data[2]);
            }

            if(event.data[1] == "lxn-ui") {
                SetStoredData("lxn-ui", event.data[2]);
            }

        })

        
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
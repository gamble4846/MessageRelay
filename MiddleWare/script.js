let MiddleWareHost = "https://gamble4846.github.io/MessageRelay/MiddleWare/";
const MaxCallCount = 10;

window.addEventListener('message', event => {
    if (event.data && event.data.isMessageRelay && event.data.messageDirection == "Sending") {
        console.log(event.data);
        let newData = {
            id: event.data.id,
            data: event.data.data
        }
        localStorage.removeItem(event.data.name);
        localStorage.setItem(event.data.name, JSON.stringify(newData));
        console.log(localStorage.getItem(event.data.name));
    }

    if (event.data && event.data.isMessageRelay && event.data.messageDirection == "Recieving") {
        let newData = {
            "name": event.data.name,
            data: localStorage.getItem(event.data.name),
            isMessageRelay: true,
            messageDirection: "Sending",
            id: event.data.id
        }
        window.parent.postMessage(newData, "*");
    }
});

function RecieveMessage(name) {
    var PromiseRTN = new Promise(function (resolve, reject) {
        try {
            let CurrentId = GetNewUUID();
            var iframe = document.createElement('iframe');
            iframe.src = MiddleWareHost;
            iframe.style.display = 'none';
            document.body.appendChild(iframe);

            checkIframeLoaded();

            function checkIframeLoaded() {
                var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                if (iframeDoc.readyState == 'complete') {
                    afterLoading();
                    return;
                }
                window.setTimeout(checkIframeLoaded, 100);
            }

            let toSendData = {
                "name": name,
                isMessageRelay: true,
                messageDirection: "Recieving",
                id: CurrentId,
            }

            function afterLoading() {
                if (iframe) {
                    iframe.onload = () => {
                        iframe.contentWindow.postMessage(toSendData, "*");
                    };
                } else {
                    reject("IFrame Not Found");
                }
            }

            let CallCount = 0;
            let data = null;
            ConfirmRecieve();

            function ConfirmRecieve() {
                CallCount++;
                data = localStorage.getItem(name);
                if (data) {
                    data = JSON.parse(data);
                    if (data.id == CurrentId) {
                        resolve(JSON.parse(data.data).data);
                    }
                } else {
                    if (CallCount > MaxCallCount) {
                        reject("Time out")
                    } else {
                        window.setTimeout(ConfirmRecieve, 100);
                    }
                }
            }

        } catch (ex) {
            reject(ex);
        }
    });

    return PromiseRTN;
}

function SendMessage(name, data) {
    var PromiseRTN = new Promise(function (resolve, reject) {
        try {
            let CurrentId = GetNewUUID();
            var iframe = document.createElement('iframe');
            iframe.src = MiddleWareHost;
            iframe.style.display = 'none';
            document.body.appendChild(iframe);

            checkIframeLoaded();

            function checkIframeLoaded() {
                var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                if (iframeDoc.readyState == 'complete') {
                    afterLoading();
                    return;
                }
                window.setTimeout(checkIframeLoaded, 100);
            }

            let toSendData = {
                "name": name,
                "data": data,
                isMessageRelay: true,
                messageDirection: "Sending",
                id: CurrentId,
            }

            function afterLoading() {
                if (iframe) {
                    iframe.onload = () => {
                        iframe.contentWindow.postMessage(toSendData, "*");
                    };
                } else {
                    reject("IFrame Not Found");
                }
            }

            RecieveMessage(name).then((data) => {
                resolve("Data Sending Success - " + JSON.stringify(data))
            }).catch((error) => {
                reject(error);
            });
        } catch (ex) {
            reject(ex);
        }
    });

    return PromiseRTN;
}

function GetNewUUID() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
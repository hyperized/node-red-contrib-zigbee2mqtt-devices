module.exports = function (RED) {
    const utils = require("./utils.js");
    const bavaria = utils.bavaria();

    function sonoffButton(config) {
        RED.nodes.createNode(this, config);
        var bridgeNode = RED.nodes.getNode(config.bridge);
        var node = this;

        utils.setConnectionState(bridgeNode, node);
        bavaria.observer.register(bridgeNode.id + "_connected", function (message) {
            node.status({ fill: "green", text: "connected" });
            bridgeNode.subscribeDevice(node.id, config.deviceName, function (message) {
                try {
                    const ioMap = {
                        single: utils.createButtonOutput(0, "button", "pressed"),
                        long: utils.createButtonOutput(0, "button", "released"),
                        double: utils.createButtonOutput(0, "button", "double"),
                    };

                    var output = ioMap[message.action];
                    utils.sendAt(node, output.index, {
                        payload: {
                            button_name: output.button_name,
                            button_type: output.button_type,
                        }
                    });

                    node.status({ fill: "green", "text": "Last action: " + output.button_type });
                    setTimeout(function () {
                        node.status({ fill: "green", text: "connected" });
                    }, 2000);
                } catch (err) {
                    node.error(err);
                    node.status({ fill: "red", "text": "error" });
                }
            });
        });

    }
    RED.nodes.registerType("sonoff-button", sonoffButton);
}
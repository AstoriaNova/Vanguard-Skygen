export default class clientInfo {
    static getDevice(player) {
        const mode = player.inputInfo.lastInputModeUsed
        if (mode === "KeyboardAndMouse") return "Keyboard"
        if (mode === "MotionController" || mode === "Gamepad") return "Controller"
        return mode
    }
    static getPlatform(player) {
        const { platformType } = player.clientSystemInfo;
        switch (platformType) {
            case "Desktop":
                return "";

            case "Console":
                return "";

            case "Mobile":
                return "";
        }
    }
}